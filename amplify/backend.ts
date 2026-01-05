import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * AI Use Case Dashboard - AWS Amplify Backend
 *
 * This backend provides:
 * - Cognito authentication with multi-tenant support
 * - AppSync GraphQL API with DynamoDB tables
 * - S3 storage for documents and videos
 */
defineBackend({
  auth,
  data,
  storage
});
