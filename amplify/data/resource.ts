import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * GraphQL Schema for AI Use Case Dashboard
 *
 * Tables:
 * - Tenant: Multi-tenant organization data
 * - User: User profiles with roles
 * - UseCase: Main use case tracking
 * - TestCase: Test cases with links
 * - Document: Uploaded files metadata
 * - Approval: Approval history
 * - Version: Version history
 * - LifecycleStage: Configurable stages
 * - DeploymentLocation: Configurable locations
 * - TestingTeam: Configurable teams
 */

const schema = a.schema({
  // Tenant - Organization/Customer
  Tenant: a
    .model({
      tenantId: a.id().required(),
      name: a.string().required(),
      settings: a.json(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .identifier(['tenantId'])
    .authorization((allow) => [
      allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read'])
    ]),

  // User Profile
  User: a
    .model({
      odycId: a.string().required(),
      email: a.email().required(),
      name: a.string().required(),
      role: a.enum(['ADMIN', 'TEAM_LEAD', 'TEAM_MEMBER', 'CUSTOMER_INCHARGE', 'VIEWER']),
      tenantId: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .secondaryIndexes((index) => [index('tenantId')])
    .authorization((allow) => [
      allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
      allow.owner().to(['read', 'update']),
      allow.authenticated().to(['read'])
    ]),

  // Use Case - Main entity
  UseCase: a
    .model({
      useCaseId: a.id().required(),
      tenantId: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      status: a.enum([
        'DRAFT',
        'PENDING_LEAD_APPROVAL',
        'PENDING_CUSTOMER_APPROVAL',
        'CHANGES_REQUESTED',
        'APPROVED',
        'ARCHIVED'
      ]),
      deploymentLocationId: a.string(),
      lifecycleStageId: a.string(),
      deployedInLab: a.boolean().default(false),
      deployedInLabDate: a.date(),
      internalTestsReady: a.boolean().default(false),
      jointTestsReady: a.boolean().default(false),
      unitTestCompleted: a.integer().default(0),
      unitTestTotal: a.integer().default(0),
      e2eTestingStatus: a.string(),
      jointTestingStart: a.string(),
      currentVersion: a.string().default('1.0'),
      createdBy: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      lastApprovedAt: a.datetime(),
      lastApprovedBy: a.string()
    })
    .identifier(['useCaseId'])
    .secondaryIndexes((index) => [
      index('tenantId').sortKeys(['status']),
      index('tenantId').sortKeys(['createdAt']).name('byTenantCreatedAt')
    ])
    .authorization((allow) => [
      allow.groups(['Admins', 'TeamLeads']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['TeamMembers']).to(['create', 'read', 'update']),
      allow.groups(['CustomerIncharge']).to(['read', 'update']),
      allow.groups(['Viewers']).to(['read'])
    ]),

  // Test Case
  TestCase: a
    .model({
      testCaseId: a.id().required(),
      useCaseId: a.string().required(),
      tenantId: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      priority: a.enum(['HIGH', 'MEDIUM', 'LOW']),
      status: a.enum(['PENDING', 'PASSED', 'FAILED', 'BLOCKED']),
      lastRunAt: a.datetime(),
      lastRunResult: a.string(),
      // Links to external resources
      testCaseDocUrl: a.url(),
      testResultUrl: a.url(),
      jiraUrl: a.url(),
      createdBy: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .identifier(['testCaseId'])
    .secondaryIndexes((index) => [
      index('useCaseId').sortKeys(['status']),
      index('tenantId')
    ])
    .authorization((allow) => [
      allow.groups(['Admins', 'TeamLeads', 'TeamMembers']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['CustomerIncharge', 'Viewers']).to(['read'])
    ]),

  // Document metadata (actual files in S3)
  Document: a
    .model({
      documentId: a.id().required(),
      useCaseId: a.string().required(),
      tenantId: a.string().required(),
      fileName: a.string().required(),
      fileType: a.enum(['TEST_CASE_DOC', 'TEST_VIDEO', 'DESIGN_DOC', 'OTHER']),
      s3Key: a.string().required(),
      fileSize: a.integer(),
      mimeType: a.string(),
      uploadedBy: a.string(),
      uploadedAt: a.datetime()
    })
    .identifier(['documentId'])
    .secondaryIndexes((index) => [index('useCaseId')])
    .authorization((allow) => [
      allow.groups(['Admins', 'TeamLeads', 'TeamMembers']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['CustomerIncharge', 'Viewers']).to(['read'])
    ]),

  // Approval History
  Approval: a
    .model({
      approvalId: a.id().required(),
      useCaseId: a.string().required(),
      tenantId: a.string().required(),
      action: a.enum(['SUBMITTED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
      fromStatus: a.string(),
      toStatus: a.string(),
      approverUserId: a.string(),
      approverName: a.string(),
      approverRole: a.string(),
      comments: a.string(),
      createdAt: a.datetime()
    })
    .identifier(['approvalId'])
    .secondaryIndexes((index) => [index('useCaseId').sortKeys(['createdAt'])])
    .authorization((allow) => [
      allow.groups(['Admins', 'TeamLeads', 'CustomerIncharge']).to(['create', 'read']),
      allow.groups(['TeamMembers', 'Viewers']).to(['read'])
    ]),

  // Version History
  Version: a
    .model({
      versionId: a.id().required(),
      useCaseId: a.string().required(),
      tenantId: a.string().required(),
      versionNumber: a.string().required(),
      snapshotData: a.json(),
      changeNotes: a.string(),
      createdBy: a.string(),
      createdAt: a.datetime()
    })
    .identifier(['versionId'])
    .secondaryIndexes((index) => [index('useCaseId').sortKeys(['createdAt'])])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.groups(['Admins', 'TeamLeads', 'TeamMembers']).to(['create'])
    ]),

  // Configurable Lifecycle Stages per Tenant
  LifecycleStage: a
    .model({
      stageId: a.id().required(),
      tenantId: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      displayOrder: a.integer().default(0),
      isDefault: a.boolean().default(false),
      createdAt: a.datetime()
    })
    .identifier(['stageId'])
    .secondaryIndexes((index) => [index('tenantId').sortKeys(['displayOrder'])])
    .authorization((allow) => [
      allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read'])
    ]),

  // Configurable Deployment Locations per Tenant
  DeploymentLocation: a
    .model({
      locationId: a.id().required(),
      tenantId: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      displayOrder: a.integer().default(0),
      isDefault: a.boolean().default(false),
      createdAt: a.datetime()
    })
    .identifier(['locationId'])
    .secondaryIndexes((index) => [index('tenantId').sortKeys(['displayOrder'])])
    .authorization((allow) => [
      allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read'])
    ]),

  // Testing Teams per Tenant
  TestingTeam: a
    .model({
      teamId: a.id().required(),
      tenantId: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      contactEmail: a.email(),
      createdAt: a.datetime()
    })
    .identifier(['teamId'])
    .secondaryIndexes((index) => [index('tenantId')])
    .authorization((allow) => [
      allow.groups(['Admins']).to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read'])
    ]),

  // Activity Log for dashboard
  Activity: a
    .model({
      activityId: a.id().required(),
      tenantId: a.string().required(),
      useCaseId: a.string(),
      useCaseName: a.string(),
      action: a.string().required(),
      description: a.string(),
      userId: a.string(),
      userName: a.string(),
      createdAt: a.datetime()
    })
    .identifier(['activityId'])
    .secondaryIndexes((index) => [index('tenantId').sortKeys(['createdAt'])])
    .authorization((allow) => [allow.authenticated().to(['create', 'read'])])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  }
});
