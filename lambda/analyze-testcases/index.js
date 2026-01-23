/**
 * Lambda Function: Analyze Test Cases Excel using Bedrock Claude Opus 4.5
 *
 * This function analyzes uploaded Excel data, maps columns to expected format,
 * and provides feedback without changing any field contents.
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Expected columns for test case import
const EXPECTED_COLUMNS = {
    name: { required: true, description: 'Test Case Name - the title/name of the test case' },
    description: { required: false, description: 'Description - detailed description of what the test does' },
    priority: { required: false, description: 'Priority - HIGH, MEDIUM, or LOW', allowedValues: ['HIGH', 'MEDIUM', 'LOW'] },
    status: { required: false, description: 'Status - PENDING, PASSED, FAILED, or BLOCKED', allowedValues: ['PENDING', 'PASSED', 'FAILED', 'BLOCKED'] },
    testCaseDocUrl: { required: false, description: 'Test Case Doc URL - link to test case documentation' },
    testResultUrl: { required: false, description: 'Test Result URL - link to test results/evidence' },
    jiraUrl: { required: false, description: 'Jira URL - link to Jira/issue tracker' }
};

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));

    try {
        // Parse request body
        let body;
        if (typeof event.body === 'string') {
            body = JSON.parse(event.body);
        } else {
            body = event.body || event;
        }

        const { headers, rows, sheetName } = body;

        if (!headers || !rows) {
            return formatResponse(400, {
                success: false,
                error: 'Missing required fields: headers and rows'
            });
        }

        // Use Claude to analyze and map columns
        const analysisResult = await analyzeWithClaude(headers, rows, sheetName);

        return formatResponse(200, {
            success: true,
            ...analysisResult
        });

    } catch (error) {
        console.error('Error:', error);
        return formatResponse(500, {
            success: false,
            error: error.message
        });
    }
};

async function analyzeWithClaude(headers, rows, sheetName) {
    const prompt = `You are an expert data analyst. Analyze the following Excel data and map the columns to our expected test case format.

## Expected Target Columns:
1. **name** (REQUIRED): The test case name/title
2. **description** (optional): Detailed description of the test
3. **priority** (optional): Must be HIGH, MEDIUM, or LOW
4. **status** (optional): Must be PENDING, PASSED, FAILED, or BLOCKED
5. **testCaseDocUrl** (optional): URL link to documentation
6. **testResultUrl** (optional): URL link to test results
7. **jiraUrl** (optional): URL link to Jira/issue tracker

## Source Data:
Sheet Name: ${sheetName || 'Sheet1'}
Headers: ${JSON.stringify(headers)}
Sample Rows (first 5): ${JSON.stringify(rows.slice(0, 5))}
Total Rows: ${rows.length}

## Your Task:
1. Analyze each source column and determine which target column it maps to
2. For status columns: if source has separate "Pass"/"Failed" columns, combine them intelligently
3. NEVER change the actual content/values - only map columns
4. Identify any issues or missing required fields
5. Provide helpful feedback for the user

## Response Format (JSON only, no markdown):
{
    "columnMapping": {
        "sourceColumnIndex": "targetColumnName",
        ...
    },
    "statusMapping": {
        "hasPassColumn": true/false,
        "passColumnIndex": number or null,
        "hasFailColumn": true/false,
        "failColumnIndex": number or null,
        "logic": "description of how to determine status"
    },
    "feedback": [
        "Feedback message 1",
        "Feedback message 2"
    ],
    "warnings": [
        "Warning if any issues found"
    ],
    "validRowCount": number,
    "skippedRows": number,
    "confidence": "HIGH/MEDIUM/LOW"
}

Respond with ONLY the JSON object, no other text.`;

    const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    };

    const command = new InvokeModelCommand({
        modelId: "anthropic.claude-opus-4-20250514",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log('Claude response:', JSON.stringify(responseBody));

    // Parse Claude's response
    const claudeText = responseBody.content[0].text;
    let analysis;

    try {
        // Try to parse JSON directly
        analysis = JSON.parse(claudeText);
    } catch (e) {
        // Try to extract JSON from response
        const jsonMatch = claudeText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Failed to parse Claude response as JSON');
        }
    }

    // Apply the mapping to transform the data
    const mappedData = applyMapping(headers, rows, analysis);

    return {
        analysis,
        mappedData,
        originalHeaders: headers,
        totalRows: rows.length
    };
}

function applyMapping(headers, rows, analysis) {
    const { columnMapping, statusMapping } = analysis;
    const mappedRows = [];

    for (const row of rows) {
        // Skip empty rows
        if (!row || row.every(cell => cell === null || cell === undefined || cell === '')) {
            continue;
        }

        const mappedRow = {
            name: '',
            description: '',
            priority: 'MEDIUM',
            status: 'PENDING',
            testCaseDocUrl: '',
            testResultUrl: '',
            jiraUrl: ''
        };

        // Apply column mapping
        for (const [sourceIndex, targetColumn] of Object.entries(columnMapping)) {
            const idx = parseInt(sourceIndex);
            if (idx >= 0 && idx < row.length && row[idx] !== null && row[idx] !== undefined) {
                const value = String(row[idx]).trim();

                if (targetColumn === 'priority') {
                    // Normalize priority
                    const upper = value.toUpperCase();
                    mappedRow.priority = ['HIGH', 'MEDIUM', 'LOW'].includes(upper) ? upper : 'MEDIUM';
                } else if (targetColumn === 'status' && !statusMapping?.hasPassColumn) {
                    // Normalize status
                    const upper = value.toUpperCase();
                    mappedRow.status = ['PENDING', 'PASSED', 'FAILED', 'BLOCKED'].includes(upper) ? upper : 'PENDING';
                } else if (targetColumn !== 'status') {
                    mappedRow[targetColumn] = value;
                }
            }
        }

        // Handle Pass/Fail column logic
        if (statusMapping?.hasPassColumn || statusMapping?.hasFailColumn) {
            const passIdx = statusMapping.passColumnIndex;
            const failIdx = statusMapping.failColumnIndex;

            const passValue = passIdx !== null && passIdx < row.length ? row[passIdx] : null;
            const failValue = failIdx !== null && failIdx < row.length ? row[failIdx] : null;

            if (passValue && String(passValue).toLowerCase().includes('pass')) {
                mappedRow.status = 'PASSED';
            } else if (failValue && String(failValue).toLowerCase().includes('fail')) {
                mappedRow.status = 'FAILED';
            } else if (passValue) {
                mappedRow.status = 'PASSED';
            } else if (failValue) {
                mappedRow.status = 'FAILED';
            } else {
                mappedRow.status = 'PENDING';
            }
        }

        // Only add rows with a name
        if (mappedRow.name) {
            mappedRows.push(mappedRow);
        }
    }

    return mappedRows;
}

function formatResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        body: JSON.stringify(body)
    };
}
