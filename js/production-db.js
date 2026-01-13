/**
 * Production Deployment Database Module
 * Handles all DynamoDB operations for production deployment tracking
 */

// Deployment Components Definition
const DEPLOYMENT_COMPONENTS = [
    { id: 'CNC', name: 'Crosswork Network Controller', icon: 'fa-network-wired' },
    { id: 'PCA', name: 'PCA', icon: 'fa-microchip' },
    { id: 'HCO', name: 'HCO', icon: 'fa-layer-group' },
    { id: 'CDG', name: 'Crosswork Data Gateway', icon: 'fa-database' },
    { id: 'NSO', name: 'Network Services Orchestrator', icon: 'fa-cogs' },
    { id: 'SR_PCE', name: 'SR-PCE', icon: 'fa-project-diagram' }
];

const DEPLOYMENT_STATUS = [
    { id: 'NOT_STARTED', name: 'Not Started', color: '#64748b' },
    { id: 'IN_PROGRESS', name: 'In Progress', color: '#2563eb' },
    { id: 'COMPLETED', name: 'Completed', color: '#22c55e' }
];

const MIGRATION_STATUS = [
    { id: 'NOT_STARTED', name: 'Not Started', color: '#64748b' },
    { id: 'SCHEDULED', name: 'Scheduled', color: '#f59e0b' },
    { id: 'IN_PROGRESS', name: 'In Progress', color: '#2563eb' },
    { id: 'COMPLETED', name: 'Completed', color: '#22c55e' },
    { id: 'FAILED', name: 'Failed', color: '#ef4444' }
];

/**
 * Production Deployment Database Operations
 */
const ProductionDB = {
    // ==================== INFRASTRUCTURE REQUIREMENTS ====================

    /**
     * Get infrastructure requirements for a tenant
     */
    async getInfraRequirements(tenantId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Key: {
                    tenantId: tenantId,
                    recordId: 'INFRA#config'
                }
            };

            const result = await client.get(params).promise();
            return result.Item || {
                tenantId: tenantId,
                recordId: 'INFRA#config',
                recordType: 'INFRA',
                cncInstances: 0,
                vmsPerCnc: 0,
                totalVms: 0,
                pilotSites: 0,
                notes: ''
            };
        }).catch(error => {
            console.error('Error fetching infra requirements:', error);
            return {
                tenantId: tenantId,
                recordId: 'INFRA#config',
                recordType: 'INFRA',
                cncInstances: 0,
                vmsPerCnc: 0,
                totalVms: 0,
                pilotSites: 0,
                notes: ''
            };
        });
    },

    /**
     * Update infrastructure requirements
     */
    async updateInfraRequirements(tenantId, requirements) {
        const now = new Date().toISOString();
        const user = Auth.getCurrentUser();

        // Auto-calculate total VMs
        const totalVms = (requirements.cncInstances || 0) * (requirements.vmsPerCnc || 0);

        const item = {
            tenantId: tenantId,
            recordId: 'INFRA#config',
            recordType: 'INFRA',
            cncInstances: requirements.cncInstances || 0,
            vmsPerCnc: requirements.vmsPerCnc || 0,
            totalVms: totalVms,
            pilotSites: requirements.pilotSites || 0,
            notes: requirements.notes || '',
            updatedAt: now,
            updatedBy: user ? user.email : 'unknown'
        };

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error updating infra requirements:', error);
            return { success: false, error: error.message };
        });
    },

    // ==================== DEPLOYMENT COMPONENTS ====================

    /**
     * Get all deployment components for a tenant
     */
    async getComponents(tenantId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                KeyConditionExpression: 'tenantId = :tid AND begins_with(recordId, :prefix)',
                ExpressionAttributeValues: {
                    ':tid': tenantId,
                    ':prefix': 'COMPONENT#'
                }
            };

            const result = await client.query(params).promise();
            return result.Items.sort((a, b) => {
                // Sort by component type first, then by name
                if (a.componentType !== b.componentType) {
                    return a.componentType.localeCompare(b.componentType);
                }
                return (a.name || '').localeCompare(b.name || '');
            });
        }).catch(error => {
            console.error('Error fetching components:', error);
            return [];
        });
    },

    /**
     * Get components by type
     */
    async getComponentsByType(tenantId, componentType) {
        const allComponents = await this.getComponents(tenantId);
        return allComponents.filter(c => c.componentType === componentType);
    },

    /**
     * Add a new deployment component
     */
    async addComponent(tenantId, componentData) {
        const now = new Date().toISOString();
        const user = Auth.getCurrentUser();
        const componentId = `${componentData.componentType}-${Date.now()}`;

        const item = {
            tenantId: tenantId,
            recordId: `COMPONENT#${componentId}`,
            recordType: 'COMPONENT',
            componentType: componentData.componentType,
            name: componentData.name,
            status: componentData.status || 'NOT_STARTED',
            startDate: componentData.startDate || '',
            endDate: componentData.endDate || '',
            owner: componentData.owner || '',
            progress: componentData.progress || 0,
            dependencies: componentData.dependencies || [],
            notes: componentData.notes || '',
            createdAt: now,
            updatedAt: now,
            createdBy: user ? user.email : 'unknown'
        };

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error adding component:', error);
            return { success: false, error: error.message };
        });
    },

    /**
     * Update a deployment component
     */
    async updateComponent(tenantId, recordId, updates) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const user = Auth.getCurrentUser();

            const updateExpressions = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {
                ':updatedAt': new Date().toISOString(),
                ':updatedBy': user ? user.email : 'unknown'
            };

            Object.keys(updates).forEach(key => {
                if (key !== 'tenantId' && key !== 'recordId') {
                    updateExpressions.push(`#${key} = :${key}`);
                    expressionAttributeNames[`#${key}`] = key;
                    expressionAttributeValues[`:${key}`] = updates[key];
                }
            });

            updateExpressions.push('#updatedAt = :updatedAt');
            expressionAttributeNames['#updatedAt'] = 'updatedAt';
            updateExpressions.push('#updatedBy = :updatedBy');
            expressionAttributeNames['#updatedBy'] = 'updatedBy';

            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Key: {
                    tenantId: tenantId,
                    recordId: recordId
                },
                UpdateExpression: 'SET ' + updateExpressions.join(', '),
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            };

            const result = await client.update(params).promise();
            return { success: true, item: result.Attributes };
        }).catch(error => {
            console.error('Error updating component:', error);
            return { success: false, error: error.message };
        });
    },

    /**
     * Delete a deployment component
     */
    async deleteComponent(tenantId, recordId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Key: {
                    tenantId: tenantId,
                    recordId: recordId
                }
            };

            await client.delete(params).promise();
            return { success: true };
        }).catch(error => {
            console.error('Error deleting component:', error);
            return { success: false, error: error.message };
        });
    },

    // ==================== USE CASE MIGRATIONS ====================

    /**
     * Get all use case migrations for a tenant
     */
    async getMigrations(tenantId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                KeyConditionExpression: 'tenantId = :tid AND begins_with(recordId, :prefix)',
                ExpressionAttributeValues: {
                    ':tid': tenantId,
                    ':prefix': 'MIGRATION#'
                }
            };

            const result = await client.query(params).promise();
            return result.Items.sort((a, b) => {
                // Sort by target date
                return (a.targetDate || '').localeCompare(b.targetDate || '');
            });
        }).catch(error => {
            console.error('Error fetching migrations:', error);
            return [];
        });
    },

    /**
     * Add a use case migration
     */
    async addMigration(tenantId, migrationData) {
        const now = new Date().toISOString();
        const user = Auth.getCurrentUser();
        const migrationId = `${migrationData.useCaseId}-${Date.now()}`;

        const item = {
            tenantId: tenantId,
            recordId: `MIGRATION#${migrationId}`,
            recordType: 'MIGRATION',
            useCaseId: migrationData.useCaseId,
            useCaseName: migrationData.useCaseName,
            migrationStatus: migrationData.migrationStatus || 'NOT_STARTED',
            targetDate: migrationData.targetDate || '',
            actualDate: migrationData.actualDate || '',
            owner: migrationData.owner || '',
            notes: migrationData.notes || '',
            prerequisites: migrationData.prerequisites || [],
            createdAt: now,
            updatedAt: now,
            createdBy: user ? user.email : 'unknown'
        };

        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Item: item
            };

            await client.put(params).promise();
            return { success: true, item: item };
        }).catch(error => {
            console.error('Error adding migration:', error);
            return { success: false, error: error.message };
        });
    },

    /**
     * Update a use case migration
     */
    async updateMigration(tenantId, recordId, updates) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const user = Auth.getCurrentUser();

            const updateExpressions = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {
                ':updatedAt': new Date().toISOString(),
                ':updatedBy': user ? user.email : 'unknown'
            };

            Object.keys(updates).forEach(key => {
                if (key !== 'tenantId' && key !== 'recordId') {
                    updateExpressions.push(`#${key} = :${key}`);
                    expressionAttributeNames[`#${key}`] = key;
                    expressionAttributeValues[`:${key}`] = updates[key];
                }
            });

            updateExpressions.push('#updatedAt = :updatedAt');
            expressionAttributeNames['#updatedAt'] = 'updatedAt';
            updateExpressions.push('#updatedBy = :updatedBy');
            expressionAttributeNames['#updatedBy'] = 'updatedBy';

            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Key: {
                    tenantId: tenantId,
                    recordId: recordId
                },
                UpdateExpression: 'SET ' + updateExpressions.join(', '),
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            };

            const result = await client.update(params).promise();
            return { success: true, item: result.Attributes };
        }).catch(error => {
            console.error('Error updating migration:', error);
            return { success: false, error: error.message };
        });
    },

    /**
     * Delete a use case migration
     */
    async deleteMigration(tenantId, recordId) {
        return executeWithRetry(async () => {
            const client = await getDocClient();
            const params = {
                TableName: DYNAMODB_CONFIG.tables.productionDeployment,
                Key: {
                    tenantId: tenantId,
                    recordId: recordId
                }
            };

            await client.delete(params).promise();
            return { success: true };
        }).catch(error => {
            console.error('Error deleting migration:', error);
            return { success: false, error: error.message };
        });
    }
};

// Export to window
window.ProductionDB = ProductionDB;
window.DEPLOYMENT_COMPONENTS = DEPLOYMENT_COMPONENTS;
window.DEPLOYMENT_STATUS = DEPLOYMENT_STATUS;
window.MIGRATION_STATUS = MIGRATION_STATUS;
