/**
 * AWS Configuration for AI Use Case Dashboard
 * Generated from CloudFormation stack outputs
 */

const AWS_CONFIG = {
  region: 'us-east-1',

  // Cognito
  cognito: {
    userPoolId: 'us-east-1_tZmFVKf4w',
    userPoolClientId: '4svld375gc16o6hmh76cs8kqim',
    identityPoolId: 'us-east-1:7c65518c-36e2-4875-93f8-801596906b5b'
  },

  // S3 Storage
  storage: {
    bucketName: 'aiusecasedashboard-storage-dev-567097740753'
  },

  // DynamoDB Tables
  dynamodb: {
    tables: {
      tenants: 'aiusecasedashboard-Tenants-dev',
      users: 'aiusecasedashboard-Users-dev',
      useCases: 'aiusecasedashboard-UseCases-dev',
      testCases: 'aiusecasedashboard-TestCases-dev',
      documents: 'aiusecasedashboard-Documents-dev',
      approvals: 'aiusecasedashboard-Approvals-dev',
      versions: 'aiusecasedashboard-Versions-dev',
      lifecycleStages: 'aiusecasedashboard-LifecycleStages-dev',
      deploymentLocations: 'aiusecasedashboard-DeploymentLocations-dev',
      testingTeams: 'aiusecasedashboard-TestingTeams-dev',
      activity: 'aiusecasedashboard-Activity-dev'
    }
  }
};

// Make available globally
window.AWS_CONFIG = AWS_CONFIG;

console.log('AWS Config loaded:', AWS_CONFIG.region);
