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
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.salesStages,
                Key: { tenantId: tenantId }
            };

            const result = await client.get(params).promise();
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

/**
 * Use Case Database Operations
 * Note: DynamoDB table has 'id' as the only key (format: tenantId-UCxxx)
 */
const UseCaseDB = {
    // Get a single use case by ID (id format: tenantId-UCxxx)
    async getUseCase(useCaseId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.useCases,
                Key: { id: useCaseId }
            };

            const result = await client.get(params).promise();
            if (result.Item) {
                // Parse JSON strings back to objects
                const item = result.Item;
                if (typeof item.unitTestProgress === 'string') {
                    item.unitTestProgress = JSON.parse(item.unitTestProgress);
                }
                return item;
            }
            return null;
        }).catch(error => {
            console.error('Error fetching use case:', error);
            return null;
        });
    },

    // Update a use case
    async updateUseCase(useCase) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const now = new Date().toISOString();

            // Ensure unitTestProgress is stored as string for DynamoDB
            const itemToSave = { ...useCase, updatedAt: now };
            if (typeof itemToSave.unitTestProgress === 'object') {
                itemToSave.unitTestProgress = JSON.stringify(itemToSave.unitTestProgress);
            }

            const params = {
                TableName: DYNAMODB_CONFIG.tables.useCases,
                Item: itemToSave
            };

            await client.put(params).promise();
            return { success: true, data: useCase };
        }).catch(error => {
            console.error('Error updating use case:', error);
            return { success: false, error: error.message };
        });
    },

    // Get all use cases for a tenant
    async getUseCasesByTenant(tenantId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.useCases,
                FilterExpression: 'tenantId = :tenantId',
                ExpressionAttributeValues: {
                    ':tenantId': tenantId
                }
            };

            const result = await client.scan(params).promise();
            // Parse JSON strings back to objects
            return (result.Items || []).map(item => {
                if (typeof item.unitTestProgress === 'string') {
                    item.unitTestProgress = JSON.parse(item.unitTestProgress);
                }
                return item;
            });
        }).catch(error => {
            console.error('Error fetching use cases:', error);
            return [];
        });
    },

    // Get all use cases (for admin/multi-tenant views)
    async getAllUseCases() {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.useCases
            };

            const result = await client.scan(params).promise();
            // Parse JSON strings back to objects
            return (result.Items || []).map(item => {
                if (typeof item.unitTestProgress === 'string') {
                    item.unitTestProgress = JSON.parse(item.unitTestProgress);
                }
                return item;
            });
        }).catch(error => {
            console.error('Error fetching all use cases:', error);
            return [];
        });
    }
};

/**
 * Test Case Database Operations
 * Table has single 'id' key - we use format: useCaseId#testCaseId
 */
const TestCaseDB = {
    // Get all test cases for a use case
    async getTestCases(useCaseId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.testCases,
                FilterExpression: 'useCaseId = :ucId',
                ExpressionAttributeValues: {
                    ':ucId': useCaseId
                }
            };

            const result = await client.scan(params).promise();
            return result.Items || [];
        }).catch(error => {
            console.error('Error fetching test cases:', error);
            return [];
        });
    },

    // Add a test case
    async addTestCase(useCaseId, testCase) {
        const existingCases = await this.getTestCases(useCaseId);
        const maxNum = existingCases.reduce((max, tc) => {
            const num = parseInt(tc.testCaseId?.replace('TC', '') || '0');
            return Math.max(max, num);
        }, 0);
        const testCaseId = 'TC' + String(maxNum + 1).padStart(3, '0');

        const now = new Date().toISOString();
        const item = {
            id: `${useCaseId}#${testCaseId}`,
            useCaseId: useCaseId,
            testCaseId: testCaseId,
            name: testCase.name,
            description: testCase.description || '',
            category: testCase.category || 'Unit Test',
            status: testCase.status || 'NOT_STARTED',
            priority: testCase.priority || 'MEDIUM',
            assignee: testCase.assignee || '',
            createdAt: now,
            updatedAt: now
        };

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.testCases,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error adding test case:', error);
            return { success: false, error: error.message };
        });
    },

    // Update a test case
    async updateTestCase(useCaseId, testCaseId, updates) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const now = new Date().toISOString();

            const updateExpressions = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {
                ':updatedAt': now
            };

            Object.keys(updates).forEach(key => {
                if (key !== 'id' && key !== 'useCaseId' && key !== 'testCaseId') {
                    updateExpressions.push(`#${key} = :${key}`);
                    expressionAttributeNames[`#${key}`] = key;
                    expressionAttributeValues[`:${key}`] = updates[key];
                }
            });

            updateExpressions.push('#updatedAt = :updatedAt');
            expressionAttributeNames['#updatedAt'] = 'updatedAt';

            const params = {
                TableName: DYNAMODB_CONFIG.tables.testCases,
                Key: {
                    id: `${useCaseId}#${testCaseId}`
                },
                UpdateExpression: 'SET ' + updateExpressions.join(', '),
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            };

            const result = await client.update(params).promise();
            return { success: true, item: result.Attributes };
        }).catch(error => {
            console.error('Error updating test case:', error);
            return { success: false, error: error.message };
        });
    },

    // Delete a test case
    async deleteTestCase(useCaseId, testCaseId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.testCases,
                Key: {
                    id: `${useCaseId}#${testCaseId}`
                }
            };

            await client.delete(params).promise();
            return { success: true };
        }).catch(error => {
            console.error('Error deleting test case:', error);
            return { success: false, error: error.message };
        });
    },

    // Batch add test cases (for import)
    async batchAddTestCases(useCaseId, testCases) {
        const existingCases = await this.getTestCases(useCaseId);
        let maxNum = existingCases.reduce((max, tc) => {
            const num = parseInt(tc.testCaseId?.replace('TC', '') || '0');
            return Math.max(max, num);
        }, 0);

        const now = new Date().toISOString();
        const results = [];

        for (const tc of testCases) {
            maxNum++;
            const testCaseId = 'TC' + String(maxNum).padStart(3, '0');
            const item = {
                id: `${useCaseId}#${testCaseId}`,
                useCaseId: useCaseId,
                testCaseId: testCaseId,
                name: tc.name,
                description: tc.description || '',
                category: tc.category || 'Unit Test',
                status: tc.status || 'NOT_STARTED',
                priority: tc.priority || 'MEDIUM',
                assignee: tc.assignee || '',
                links: tc.links || {},
                createdAt: now,
                updatedAt: now
            };

            try {
                const client = await getDocClient();
                await client.put({
                    TableName: DYNAMODB_CONFIG.tables.testCases,
                    Item: item
                }).promise();
                results.push({ success: true, item: item });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }

        return results;
    }
};

/**
 * Document Database Operations
 * Table has single 'id' key - we use format: useCaseId#documentId
 */
const DocumentDB = {
    // Get all documents for a use case
    async getDocuments(useCaseId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.documents,
                FilterExpression: 'useCaseId = :ucId',
                ExpressionAttributeValues: {
                    ':ucId': useCaseId
                }
            };

            const result = await client.scan(params).promise();
            return result.Items || [];
        }).catch(error => {
            console.error('Error fetching documents:', error);
            return [];
        });
    },

    // Add a document
    async addDocument(useCaseId, document) {
        const existingDocs = await this.getDocuments(useCaseId);
        const maxNum = existingDocs.reduce((max, doc) => {
            const num = parseInt(doc.documentId?.replace('DOC', '') || '0');
            return Math.max(max, num);
        }, 0);
        const documentId = 'DOC' + String(maxNum + 1).padStart(3, '0');

        const now = new Date().toISOString();
        const item = {
            id: `${useCaseId}#${documentId}`,
            useCaseId: useCaseId,
            documentId: documentId,
            name: document.name,
            type: document.type || 'GENERAL',
            url: document.url || '',
            size: document.size || '',
            description: document.description || '',
            uploadedBy: document.uploadedBy || '',
            createdAt: now,
            updatedAt: now
        };

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.documents,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error adding document:', error);
            return { success: false, error: error.message };
        });
    },

    // Delete a document
    async deleteDocument(useCaseId, documentId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.documents,
                Key: {
                    id: `${useCaseId}#${documentId}`
                }
            };

            await client.delete(params).promise();
            return { success: true };
        }).catch(error => {
            console.error('Error deleting document:', error);
            return { success: false, error: error.message };
        });
    }
};

/**
 * Approval Database Operations
 * Table has single 'id' key - we use format: useCaseId#approvalId
 */
const ApprovalDB = {
    // Get all approvals for a use case
    async getApprovals(useCaseId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.approvals,
                FilterExpression: 'useCaseId = :ucId',
                ExpressionAttributeValues: {
                    ':ucId': useCaseId
                }
            };

            const result = await client.scan(params).promise();
            // Sort by date descending (newest first)
            return (result.Items || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }).catch(error => {
            console.error('Error fetching approvals:', error);
            return [];
        });
    },

    // Add an approval record
    async addApproval(useCaseId, approval) {
        const now = new Date().toISOString();
        const approvalId = 'APR' + Date.now();

        const item = {
            id: `${useCaseId}#${approvalId}`,
            useCaseId: useCaseId,
            approvalId: approvalId,
            type: approval.type, // 'SUBMITTED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'
            status: approval.status,
            comment: approval.comment || '',
            userId: approval.userId,
            userName: approval.userName,
            createdAt: now
        };

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.approvals,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error adding approval:', error);
            return { success: false, error: error.message };
        });
    }
};

/**
 * Activity Database Operations
 * Table has single 'id' key - we use format: tenantId#timestamp
 */
const ActivityDB = {
    // Get recent activity for a tenant
    async getActivity(tenantId, limit = 20) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.activity,
                FilterExpression: 'tenantId = :tid',
                ExpressionAttributeValues: {
                    ':tid': tenantId
                }
            };

            const result = await client.scan(params).promise();
            // Sort by createdAt descending and limit
            return (result.Items || [])
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }).catch(error => {
            console.error('Error fetching activity:', error);
            return [];
        });
    },

    // Add activity record
    async addActivity(tenantId, activity) {
        const now = new Date().toISOString();
        const activityId = 'ACT' + Date.now();

        const item = {
            id: `${tenantId}#${activityId}`,
            tenantId: tenantId,
            activityId: activityId,
            text: activity.text,
            icon: activity.icon || 'fa-circle-info',
            iconClass: activity.iconClass || '',
            useCaseId: activity.useCaseId || '',
            userId: activity.userId || '',
            createdAt: now
        };

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.activity,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error adding activity:', error);
            return { success: false, error: error.message };
        });
    },

    // Get all activity (for admin)
    async getAllActivity(limit = 50) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.activity,
                Limit: limit
            };

            const result = await client.scan(params).promise();
            // Sort by createdAt descending
            return (result.Items || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }).catch(error => {
            console.error('Error fetching all activity:', error);
            return [];
        });
    }
};

// Export
window.InfraDB = InfraDB;
window.SalesDB = SalesDB;
window.UseCaseDB = UseCaseDB;
window.TestCaseDB = TestCaseDB;
window.DocumentDB = DocumentDB;
window.ApprovalDB = ApprovalDB;
window.ActivityDB = ActivityDB;
window.SALES_STAGES = SALES_STAGES;
window.getDocClient = getDocClient;
window.resetDocClient = resetDocClient;
window.DYNAMODB_CONFIG = DYNAMODB_CONFIG;
