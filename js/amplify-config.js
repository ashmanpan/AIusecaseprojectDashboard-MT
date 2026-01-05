/**
 * AWS Amplify Configuration
 *
 * This file handles:
 * - Amplify initialization
 * - Authentication (Cognito)
 * - Data API (AppSync/GraphQL)
 * - Storage (S3)
 *
 * Note: After running `npx ampx sandbox` or deploying,
 * the amplify_outputs.json file will be generated with actual values.
 */

// Import will work after Amplify is configured
// import { Amplify } from 'aws-amplify';
// import outputs from '../amplify_outputs.json';

// Initialize Amplify (uncomment after deployment)
// Amplify.configure(outputs);

/**
 * Authentication Helper Functions
 */
const AmplifyAuth = {
  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      return session.tokens !== undefined;
    } catch {
      return false;
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const { getCurrentUser, fetchUserAttributes } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      return {
        userId: user.userId,
        email: attributes.email,
        name: attributes['custom:displayName'] || attributes.email,
        tenantId: attributes['custom:tenantId'],
        role: attributes['custom:role'] || 'VIEWER'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Sign in
  async signIn(email, password) {
    try {
      const { signIn } = await import('aws-amplify/auth');
      const result = await signIn({ username: email, password });
      return { success: true, result };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  // Sign up new user
  async signUp(email, password, tenantId, role, displayName) {
    try {
      const { signUp } = await import('aws-amplify/auth');
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            'custom:tenantId': tenantId,
            'custom:role': role,
            'custom:displayName': displayName
          }
        }
      });
      return { success: true, result };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Data API Helper Functions (GraphQL)
 */
const AmplifyData = {
  // Get all use cases for tenant
  async getUseCases(tenantId) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.UseCase.list({
        filter: { tenantId: { eq: tenantId } }
      });
      if (errors) throw errors;
      return data;
    } catch (error) {
      console.error('Error fetching use cases:', error);
      return [];
    }
  },

  // Get single use case
  async getUseCase(useCaseId) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.UseCase.get({ useCaseId });
      if (errors) throw errors;
      return data;
    } catch (error) {
      console.error('Error fetching use case:', error);
      return null;
    }
  },

  // Create use case
  async createUseCase(useCaseData) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.UseCase.create(useCaseData);
      if (errors) throw errors;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating use case:', error);
      return { success: false, error: error.message };
    }
  },

  // Update use case
  async updateUseCase(useCaseId, updates) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.UseCase.update({
        useCaseId,
        ...updates
      });
      if (errors) throw errors;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating use case:', error);
      return { success: false, error: error.message };
    }
  },

  // Get test cases for use case
  async getTestCases(useCaseId) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.TestCase.list({
        filter: { useCaseId: { eq: useCaseId } }
      });
      if (errors) throw errors;
      return data;
    } catch (error) {
      console.error('Error fetching test cases:', error);
      return [];
    }
  },

  // Create test case
  async createTestCase(testCaseData) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.TestCase.create(testCaseData);
      if (errors) throw errors;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating test case:', error);
      return { success: false, error: error.message };
    }
  },

  // Update test case status
  async updateTestCase(testCaseId, updates) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.TestCase.update({
        testCaseId,
        ...updates
      });
      if (errors) throw errors;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating test case:', error);
      return { success: false, error: error.message };
    }
  },

  // Get documents for use case
  async getDocuments(useCaseId) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.Document.list({
        filter: { useCaseId: { eq: useCaseId } }
      });
      if (errors) throw errors;
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  // Create document record
  async createDocument(documentData) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.Document.create(documentData);
      if (errors) throw errors;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating document:', error);
      return { success: false, error: error.message };
    }
  },

  // Get approval history
  async getApprovals(useCaseId) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.Approval.list({
        filter: { useCaseId: { eq: useCaseId } }
      });
      if (errors) throw errors;
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching approvals:', error);
      return [];
    }
  },

  // Create approval record
  async createApproval(approvalData) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.Approval.create(approvalData);
      if (errors) throw errors;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating approval:', error);
      return { success: false, error: error.message };
    }
  },

  // Get lifecycle stages for tenant
  async getLifecycleStages(tenantId) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.LifecycleStage.list({
        filter: { tenantId: { eq: tenantId } }
      });
      if (errors) throw errors;
      return data.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error('Error fetching lifecycle stages:', error);
      return [];
    }
  },

  // Get deployment locations for tenant
  async getDeploymentLocations(tenantId) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.DeploymentLocation.list({
        filter: { tenantId: { eq: tenantId } }
      });
      if (errors) throw errors;
      return data.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error('Error fetching deployment locations:', error);
      return [];
    }
  },

  // Get recent activity
  async getRecentActivity(tenantId, limit = 10) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      const { data, errors } = await client.models.Activity.list({
        filter: { tenantId: { eq: tenantId } },
        limit
      });
      if (errors) throw errors;
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  },

  // Log activity
  async logActivity(activityData) {
    try {
      const { generateClient } = await import('aws-amplify/data');
      const client = generateClient();
      await client.models.Activity.create({
        ...activityData,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
};

/**
 * Storage Helper Functions (S3)
 */
const AmplifyStorage = {
  // Upload file
  async uploadFile(file, path, onProgress) {
    try {
      const { uploadData } = await import('aws-amplify/storage');
      const result = await uploadData({
        path: path,
        data: file,
        options: {
          contentType: file.type,
          onProgress: onProgress
        }
      }).result;
      return { success: true, key: result.path };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get download URL
  async getFileUrl(path) {
    try {
      const { getUrl } = await import('aws-amplify/storage');
      const result = await getUrl({ path });
      return result.url.toString();
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  },

  // Delete file
  async deleteFile(path) {
    try {
      const { remove } = await import('aws-amplify/storage');
      await remove({ path });
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  // List files in path
  async listFiles(path) {
    try {
      const { list } = await import('aws-amplify/storage');
      const result = await list({ path });
      return result.items;
    } catch (error) {
      console.error('List error:', error);
      return [];
    }
  }
};

// Export for use in other scripts
window.AmplifyAuth = AmplifyAuth;
window.AmplifyData = AmplifyData;
window.AmplifyStorage = AmplifyStorage;

// Check if running with Amplify backend
window.isAmplifyConfigured = false;

// Try to initialize Amplify if config exists
async function initAmplify() {
  try {
    const response = await fetch('amplify_outputs.json');
    if (response.ok) {
      const outputs = await response.json();
      const { Amplify } = await import('aws-amplify');
      Amplify.configure(outputs);
      window.isAmplifyConfigured = true;
      console.log('Amplify configured successfully');
    }
  } catch (error) {
    console.log('Running in demo mode (no Amplify backend)');
  }
}

// Initialize on load
initAmplify();
