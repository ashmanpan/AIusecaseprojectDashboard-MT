import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 Storage Configuration
 *
 * Structure:
 * - {tenantId}/{useCaseId}/documents/ - Test case docs, design docs
 * - {tenantId}/{useCaseId}/videos/ - Test videos
 * - {tenantId}/tenant-assets/ - Logos, branding
 */
export const storage = defineStorage({
  name: 'aiUseCaseDashboardStorage',
  access: (allow) => ({
    // Documents path - authenticated users can upload/download
    'documents/{entity_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    // Videos path - larger files
    'videos/{entity_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    // Tenant assets - admins only for write
    'tenant-assets/{entity_id}/*': [
      allow.authenticated.to(['read']),
      allow.groups(['Admins']).to(['write', 'delete'])
    ],
    // Public assets
    'public/*': [allow.guest.to(['read']), allow.authenticated.to(['read', 'write'])]
  })
});
