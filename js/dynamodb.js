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

    // Get fresh token (with auto-refresh if expired)
    const idToken = await Auth.getIdTokenAsync();
    if (!idToken) {
        throw new Error('No valid authentication token');
    }

    // Use Cognito Identity Pool for credentials
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:7c65518c-36e2-4875-93f8-801596906b5b',
        Logins: {
            ['cognito-idp.us-east-1.amazonaws.com/us-east-1_tZmFVKf4w']: idToken
        }
    });

    await AWS.config.credentials.getPromise();
    return new AWS.DynamoDB.DocumentClient();
}

// Track last credential refresh time
let lastCredentialRefresh = 0;
const CREDENTIAL_REFRESH_INTERVAL = 45 * 60 * 1000; // Refresh every 45 minutes

// Get DynamoDB client (with credential refresh)
let docClient = null;
async function getDocClient() {
    const now = Date.now();

    // Check if we need to refresh credentials
    if (!docClient || (now - lastCredentialRefresh) > CREDENTIAL_REFRESH_INTERVAL || Auth.isTokenExpired()) {
        // Clear old credentials to force refresh
        if (AWS.config.credentials) {
            AWS.config.credentials.clearCachedId();
        }
        docClient = await initAWS();
        lastCredentialRefresh = now;
    }
    return docClient;
}

// Reset client (call this on auth errors)
function resetDocClient() {
    docClient = null;
    lastCredentialRefresh = 0;
    if (AWS.config.credentials) {
        AWS.config.credentials.clearCachedId();
    }
}

/**
 * Helper to execute DynamoDB operation with credential retry
 */
async function executeWithRetry(operation, retryCount = 1) {
    try {
        return await operation();
    } catch (error) {
        // Check if it's a credential/auth error
        if (retryCount > 0 && (
            error.code === 'CredentialsError' ||
            error.code === 'ExpiredTokenException' ||
            error.code === 'NotAuthorizedException' ||
            error.message?.includes('credentials') ||
            error.message?.includes('token')
        )) {
            console.log('Credential error, refreshing and retrying...');
            resetDocClient();
            return executeWithRetry(operation, retryCount - 1);
        }
        throw error;
    }
}

/**
 * Infra Readiness Operations
 */
const InfraDB = {
    // Get all items for a tenant and category
    async getItems(tenantId, category) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.infraReadiness,
                KeyConditionExpression: 'tenantId = :tid AND begins_with(itemId, :cat)',
                ExpressionAttributeValues: {
                    ':tid': tenantId,
                    ':cat': category + '#'
                }
            };

            const result = await client.query(params).promise();
            return result.Items.sort((a, b) => a.itemNumber - b.itemNumber);
        }).catch(error => {
            console.error('Error fetching infra items:', error);
            return [];
        });
    },

    // Update an item
    async updateItem(tenantId, itemId, updates) {
        return executeWithRetry(async () => {
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

            const result = await client.update(params).promise();
            return { success: true, item: result.Attributes };
        }).catch(error => {
            console.error('Error updating item:', error);
            return { success: false, error: error.message };
        });
    },

    // Add new item
    async addItem(tenantId, category, itemData) {
        // Get next item number first
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

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.infraReadiness,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error adding item:', error);
            return { success: false, error: error.message };
        });
    },

    // Delete item
    async deleteItem(tenantId, itemId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.infraReadiness,
                Key: {
                    tenantId: tenantId,
                    itemId: itemId
                }
            };

            await client.delete(params).promise();
            return { success: true };
        }).catch(error => {
            console.error('Error deleting item:', error);
            return { success: false, error: error.message };
        });
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
window.resetDocClient = resetDocClient;
window.DYNAMODB_CONFIG = DYNAMODB_CONFIG;
