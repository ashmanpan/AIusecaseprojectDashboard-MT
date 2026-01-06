/**
 * DynamoDB Helper Module
 * All data operations go through DynamoDB - NO localStorage
 */

const DYNAMODB_CONFIG = {
    region: 'us-east-1',
    tables: {
        infraReadiness: 'aiusecasedashboard-InfraReadiness-dev',
        useCases: 'aiusecasedashboard-UseCases-dev',
        testCases: 'aiusecasedashboard-TestCases-dev',
        documents: 'aiusecasedashboard-Documents-dev',
        approvals: 'aiusecasedashboard-Approvals-dev',
        activity: 'aiusecasedashboard-Activity-dev'
    }
};

// Initialize AWS SDK with Cognito credentials
async function initAWS() {
    AWS.config.region = DYNAMODB_CONFIG.region;

    // Use Cognito Identity Pool for credentials
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:7c65518c-36e2-4875-93f8-801596906b5b',
        Logins: {
            ['cognito-idp.us-east-1.amazonaws.com/us-east-1_tZmFVKf4w']: Auth.getIdToken()
        }
    });

    await AWS.config.credentials.getPromise();
    return new AWS.DynamoDB.DocumentClient();
}

// Get DynamoDB client
let docClient = null;
async function getDocClient() {
    if (!docClient) {
        docClient = await initAWS();
    }
    return docClient;
}

/**
 * Infra Readiness Operations
 */
const InfraDB = {
    // Get all items for a tenant and category
    async getItems(tenantId, category) {
        const client = await getDocClient();
        const params = {
            TableName: DYNAMODB_CONFIG.tables.infraReadiness,
            KeyConditionExpression: 'tenantId = :tid AND begins_with(itemId, :cat)',
            ExpressionAttributeValues: {
                ':tid': tenantId,
                ':cat': category + '#'
            }
        };

        try {
            const result = await client.query(params).promise();
            return result.Items.sort((a, b) => a.itemNumber - b.itemNumber);
        } catch (error) {
            console.error('Error fetching infra items:', error);
            return [];
        }
    },

    // Update an item
    async updateItem(tenantId, itemId, updates) {
        const client = await getDocClient();

        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {
            ':updatedAt': new Date().toISOString()
        };

        Object.keys(updates).forEach(key => {
            if (key !== 'tenantId' && key !== 'itemId') {
                updateExpressions.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = updates[key];
            }
        });

        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';

        const params = {
            TableName: DYNAMODB_CONFIG.tables.infraReadiness,
            Key: {
                tenantId: tenantId,
                itemId: itemId
            },
            UpdateExpression: 'SET ' + updateExpressions.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await client.update(params).promise();
            return { success: true, item: result.Attributes };
        } catch (error) {
            console.error('Error updating item:', error);
            return { success: false, error: error.message };
        }
    },

    // Add new item
    async addItem(tenantId, category, itemData) {
        const client = await getDocClient();

        // Get next item number
        const existingItems = await this.getItems(tenantId, category);
        const maxNumber = existingItems.reduce((max, item) => Math.max(max, item.itemNumber || 0), 0);
        const newNumber = maxNumber + 1;

        const now = new Date().toISOString();
        const item = {
            tenantId: tenantId,
            itemId: `${category}#${newNumber}`,
            category: category,
            itemNumber: newNumber,
            description: itemData.description,
            owner: itemData.owner || '',
            dueDate: itemData.dueDate || '',
            status: itemData.status || 'NOT_STARTED',
            remarks: itemData.remarks || '',
            createdAt: now,
            updatedAt: now
        };

        const params = {
            TableName: DYNAMODB_CONFIG.tables.infraReadiness,
            Item: item
        };

        try {
            await client.put(params).promise();
            return { success: true, item: item };
        } catch (error) {
            console.error('Error adding item:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete item
    async deleteItem(tenantId, itemId) {
        const client = await getDocClient();
        const params = {
            TableName: DYNAMODB_CONFIG.tables.infraReadiness,
            Key: {
                tenantId: tenantId,
                itemId: itemId
            }
        };

        try {
            await client.delete(params).promise();
            return { success: true };
        } catch (error) {
            console.error('Error deleting item:', error);
            return { success: false, error: error.message };
        }
    },

    // Get summary counts
    async getSummary(tenantId, category) {
        const items = await this.getItems(tenantId, category);
        return {
            total: items.length,
            completed: items.filter(i => i.status === 'COMPLETED').length,
            inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
            blocked: items.filter(i => i.status === 'BLOCKED').length,
            notStarted: items.filter(i => i.status === 'NOT_STARTED').length,
            onHold: items.filter(i => i.status === 'ON_HOLD').length
        };
    }
};

// Export
window.InfraDB = InfraDB;
window.getDocClient = getDocClient;
window.DYNAMODB_CONFIG = DYNAMODB_CONFIG;
