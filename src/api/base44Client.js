import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "685c39e2ac93e4519b4f9ac6", 
  requiresAuth: true // Ensure authentication is required for all operations
});
