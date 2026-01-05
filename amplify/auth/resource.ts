import { defineAuth } from '@aws-amplify/backend';

/**
 * Cognito Authentication Configuration
 *
 * Multi-tenant support via custom attributes:
 * - custom:tenantId - Organization/customer identifier
 * - custom:role - User role (ADMIN, TEAM_LEAD, TEAM_MEMBER, CUSTOMER_INCHARGE, VIEWER)
 */
export const auth = defineAuth({
  loginWith: {
    email: true
  },
  userAttributes: {
    // Custom attributes for multi-tenancy
    'custom:tenantId': {
      dataType: 'String',
      mutable: true
    },
    'custom:role': {
      dataType: 'String',
      mutable: true
    },
    'custom:displayName': {
      dataType: 'String',
      mutable: true
    }
  },
  // Password policy
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: false
  },
  // Account recovery
  accountRecovery: 'EMAIL_ONLY',

  // Groups for role-based access
  groups: ['Admins', 'TeamLeads', 'TeamMembers', 'CustomerIncharge', 'Viewers']
});
