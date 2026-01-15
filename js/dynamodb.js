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
        activity: 'aiusecasedashboard-Activity-dev',
        salesStages: 'aiusecasedashboard-SalesStages-dev',
        productionDeployment: 'aiusecasedashboard-ProductionDeployment-dev'
    }
};

// Sales stages definition
const SALES_STAGES = [
    { id: 1, name: 'Initial Presentation', description: 'First presentation to customer', icon: 'fa-presentation-screen' },
    { id: 2, name: 'PoC/PoV Interest Confirmed', description: 'Customer shows interest in Proof of Concept/Value', icon: 'fa-handshake' },
    { id: 3, name: 'PoC/PoV Scope Agreed', description: 'Scope and boundaries defined and agreed', icon: 'fa-file-contract' },
    { id: 4, name: 'Success Criteria Defined', description: 'PoC/PoV success metrics agreed upon', icon: 'fa-bullseye' },
    { id: 5, name: 'PoC Use Cases Deployed', description: 'Use cases deployed in PoC environment', icon: 'fa-rocket' },
    { id: 6, name: 'PoC/PoV Successful', description: 'PoC/PoV completed and validated', icon: 'fa-circle-check' },
    { id: 7, name: 'Commercial Proposal Presented', description: 'Business proposal submitted to customer', icon: 'fa-file-invoice-dollar' },
    { id: 8, name: 'Commercial Proposal Accepted', description: 'Customer agrees to commercial terms', icon: 'fa-thumbs-up' },
    { id: 9, name: 'Production Plan Agreed', description: 'Deployment plan and timeline finalized', icon: 'fa-calendar-check' },
    { id: 10, name: 'Production Deployed', description: 'Solution deployed in production', icon: 'fa-server' },
    { id: 11, name: 'UAT Completed', description: 'User Acceptance Testing completed', icon: 'fa-flag-checkered' }
];

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

/**
 * Sales Stages Operations
 */
const SalesDB = {
    // Get sales stage for a tenant
    async getStage(tenantId) {
        console.log('SalesDB.getStage called for tenant:', tenantId);
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.salesStages,
                Key: { tenantId: tenantId }
            };
            console.log('DynamoDB query params:', JSON.stringify(params));

            const result = await client.get(params).promise();
            console.log('DynamoDB result:', JSON.stringify(result));
            return result.Item || { tenantId, currentStage: 1, stageHistory: [] };
        }).catch(error => {
            console.error('Error fetching sales stage:', error);
            return { tenantId, currentStage: 1, stageHistory: [] };
        });
    },

    // Update current stage for a tenant
    async updateStage(tenantId, newStage, updatedBy) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const now = new Date().toISOString();

            // First get current data to append to history
            const current = await this.getStage(tenantId);
            const history = current.stageHistory || [];
            history.push({
                stage: newStage,
                updatedAt: now,
                updatedBy: updatedBy
            });

            const params = {
                TableName: DYNAMODB_CONFIG.tables.salesStages,
                Key: { tenantId: tenantId },
                UpdateExpression: 'SET currentStage = :stage, stageHistory = :history, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':stage': newStage,
                    ':history': history,
                    ':updatedAt': now
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await client.update(params).promise();
            return { success: true, data: result.Attributes };
        }).catch(error => {
            console.error('Error updating sales stage:', error);
            return { success: false, error: error.message };
        });
    },

    // Get all stages definition
    getStagesDefinition() {
        return SALES_STAGES;
    }
};

// Export
window.InfraDB = InfraDB;
window.SalesDB = SalesDB;
window.SALES_STAGES = SALES_STAGES;
window.getDocClient = getDocClient;
window.resetDocClient = resetDocClient;
window.DYNAMODB_CONFIG = DYNAMODB_CONFIG;
