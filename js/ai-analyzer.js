/**
 * AI-Powered Test Case Analyzer using Bedrock Claude Opus 4.5
 * Analyzes Excel files and maps columns intelligently
 */

const AIAnalyzer = {
    // API endpoint - update after deploying CloudFormation
    apiEndpoint: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev/analyze',

    /**
     * Analyze Excel data using Claude AI
     * @param {Array} headers - Column headers from Excel
     * @param {Array} rows - Data rows from Excel
     * @param {string} sheetName - Name of the sheet
     * @returns {Promise<Object>} Analysis result with mapped data and feedback
     */
    async analyzeTestCases(headers, rows, sheetName) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    headers,
                    rows,
                    sheetName
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('AI Analysis error:', error);
            // Fallback to local analysis if API fails
            return this.localAnalysis(headers, rows);
        }
    },

    /**
     * Local fallback analysis (no AI)
     * Uses pattern matching to map columns
     */
    localAnalysis(headers, rows) {
        const columnMapping = {};
        const feedback = [];
        const warnings = [];

        // Common column name patterns
        const patterns = {
            name: ['test case name', 'title', 'name', 'test name', 'testcase', 'test case'],
            description: ['description', 'desc', 'trigger', 'input', 'expected', 'prompt', 'details'],
            priority: ['priority', 'prio', 'severity'],
            status: ['status', 'result', 'state'],
            testCaseDocUrl: ['test case doc', 'doc url', 'documentation'],
            testResultUrl: ['test result', 'result url', 'evidence'],
            jiraUrl: ['jira', 'issue', 'ticket', 'bug']
        };

        // Check for Pass/Fail columns
        let passColIndex = null;
        let failColIndex = null;

        headers.forEach((header, index) => {
            if (!header) return;
            const headerLower = header.toString().toLowerCase().trim();

            // Check for Pass column
            if (headerLower === 'pass' || headerLower === 'passed') {
                passColIndex = index;
            }
            // Check for Fail column
            if (headerLower === 'fail' || headerLower === 'failed') {
                failColIndex = index;
            }

            // Match against patterns
            for (const [targetCol, keywords] of Object.entries(patterns)) {
                if (columnMapping[index] !== undefined) continue;

                for (const keyword of keywords) {
                    if (headerLower.includes(keyword)) {
                        columnMapping[index] = targetCol;
                        break;
                    }
                }
            }
        });

        // Build status mapping
        const statusMapping = {
            hasPassColumn: passColIndex !== null,
            passColumnIndex: passColIndex,
            hasFailColumn: failColIndex !== null,
            failColumnIndex: failColIndex,
            logic: passColIndex !== null || failColIndex !== null
                ? 'Determine status from Pass/Fail columns'
                : 'Use status column directly'
        };

        // Check if we found a name column
        const hasNameColumn = Object.values(columnMapping).includes('name');
        if (!hasNameColumn) {
            warnings.push('Could not identify a "Test Case Name" column. Please check your column headers.');
        } else {
            feedback.push('Successfully identified test case name column.');
        }

        // Apply mapping
        const mappedData = this.applyLocalMapping(headers, rows, columnMapping, statusMapping);

        feedback.push(`Found ${mappedData.length} valid test cases.`);

        if (passColIndex !== null || failColIndex !== null) {
            feedback.push('Detected Pass/Fail columns - will use them to determine test status.');
        }

        return {
            success: true,
            analysis: {
                columnMapping,
                statusMapping,
                feedback,
                warnings,
                validRowCount: mappedData.length,
                skippedRows: rows.length - mappedData.length,
                confidence: hasNameColumn ? 'MEDIUM' : 'LOW'
            },
            mappedData,
            originalHeaders: headers,
            totalRows: rows.length
        };
    },

    /**
     * Apply column mapping to transform data
     */
    applyLocalMapping(headers, rows, columnMapping, statusMapping) {
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
                        const upper = value.toUpperCase();
                        mappedRow.priority = ['HIGH', 'MEDIUM', 'LOW'].includes(upper) ? upper : 'MEDIUM';
                    } else if (targetColumn === 'status' && !statusMapping?.hasPassColumn) {
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
    },

    /**
     * Format feedback for display
     */
    formatFeedbackHtml(analysis) {
        let html = '<div class="ai-feedback">';

        // Confidence indicator
        const confidenceClass = {
            'HIGH': 'success',
            'MEDIUM': 'warning',
            'LOW': 'danger'
        }[analysis.confidence] || 'info';

        html += `<div class="feedback-confidence ${confidenceClass}">
            <i class="fas fa-robot"></i> AI Confidence: <strong>${analysis.confidence}</strong>
        </div>`;

        // Feedback messages
        if (analysis.feedback && analysis.feedback.length > 0) {
            html += '<div class="feedback-messages">';
            for (const msg of analysis.feedback) {
                html += `<div class="feedback-item success"><i class="fas fa-check-circle"></i> ${msg}</div>`;
            }
            html += '</div>';
        }

        // Warnings
        if (analysis.warnings && analysis.warnings.length > 0) {
            html += '<div class="feedback-warnings">';
            for (const warning of analysis.warnings) {
                html += `<div class="feedback-item warning"><i class="fas fa-exclamation-triangle"></i> ${warning}</div>`;
            }
            html += '</div>';
        }

        // Stats
        html += `<div class="feedback-stats">
            <span><strong>${analysis.validRowCount}</strong> test cases found</span>
            <span><strong>${analysis.skippedRows}</strong> rows skipped</span>
        </div>`;

        html += '</div>';
        return html;
    }
};

// Export for use in other scripts
window.AIAnalyzer = AIAnalyzer;
