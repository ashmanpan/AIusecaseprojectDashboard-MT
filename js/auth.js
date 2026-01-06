/**
 * Authentication Module using AWS Cognito
 * Handles login, session management, and page protection
 */

const AUTH_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_tZmFVKf4w',
    clientId: '4svld375gc16o6hmh76cs8kqim'
};

// Session keys
const SESSION_KEYS = {
    idToken: 'auth_idToken',
    accessToken: 'auth_accessToken',
    refreshToken: 'auth_refreshToken',
    user: 'auth_user',
    isLoggedIn: 'auth_isLoggedIn'
};

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEYS.isLoggedIn) === 'true';
}

/**
 * Get current user from session
 */
function getCurrentUser() {
    const userStr = sessionStorage.getItem(SESSION_KEYS.user);
    if (userStr) {
        return JSON.parse(userStr);
    }
    return null;
}

/**
 * Protect page - redirect to login if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Sign in with Cognito
 */
async function signIn(email, password) {
    try {
        // Use AWS SDK for Cognito auth
        AWS.config.region = AUTH_CONFIG.region;

        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: AUTH_CONFIG.clientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        const result = await cognitoIdentityServiceProvider.initiateAuth(params).promise();

        if (result.AuthenticationResult) {
            // Store tokens
            sessionStorage.setItem(SESSION_KEYS.idToken, result.AuthenticationResult.IdToken);
            sessionStorage.setItem(SESSION_KEYS.accessToken, result.AuthenticationResult.AccessToken);
            if (result.AuthenticationResult.RefreshToken) {
                sessionStorage.setItem(SESSION_KEYS.refreshToken, result.AuthenticationResult.RefreshToken);
            }

            // Decode ID token to get user info
            const idToken = result.AuthenticationResult.IdToken;
            const payload = JSON.parse(atob(idToken.split('.')[1]));

            const user = {
                id: payload['cognito:username'] || payload.sub,
                email: payload.email,
                name: payload['custom:displayName'] || payload.name || payload.email.split('@')[0],
                role: payload['custom:role'] || 'TEAM_MEMBER',
                tenantId: payload['custom:tenantId'] || null,
                groups: payload['cognito:groups'] || []
            };

            // Check if user is admin (in Admin group)
            if (user.groups.includes('Admin')) {
                user.role = 'ADMIN';
                user.tenantId = null; // Admin can see all tenants
            }

            sessionStorage.setItem(SESSION_KEYS.user, JSON.stringify(user));
            sessionStorage.setItem(SESSION_KEYS.isLoggedIn, 'true');

            return { success: true, user };
        } else if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
            return {
                success: false,
                challenge: 'NEW_PASSWORD_REQUIRED',
                session: result.Session,
                error: 'You need to set a new password'
            };
        }

        return { success: false, error: 'Authentication failed' };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message || 'Authentication failed' };
    }
}

/**
 * Respond to NEW_PASSWORD_REQUIRED challenge
 */
async function setNewPassword(email, newPassword, session) {
    try {
        AWS.config.region = AUTH_CONFIG.region;
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

        const params = {
            ChallengeName: 'NEW_PASSWORD_REQUIRED',
            ClientId: AUTH_CONFIG.clientId,
            ChallengeResponses: {
                USERNAME: email,
                NEW_PASSWORD: newPassword
            },
            Session: session
        };

        const result = await cognitoIdentityServiceProvider.respondToAuthChallenge(params).promise();

        if (result.AuthenticationResult) {
            sessionStorage.setItem(SESSION_KEYS.idToken, result.AuthenticationResult.IdToken);
            sessionStorage.setItem(SESSION_KEYS.accessToken, result.AuthenticationResult.AccessToken);

            const idToken = result.AuthenticationResult.IdToken;
            const payload = JSON.parse(atob(idToken.split('.')[1]));

            const user = {
                id: payload['cognito:username'] || payload.sub,
                email: payload.email,
                name: payload['custom:displayName'] || payload.name || payload.email.split('@')[0],
                role: payload['custom:role'] || 'TEAM_MEMBER',
                tenantId: payload['custom:tenantId'] || null,
                groups: payload['cognito:groups'] || []
            };

            if (user.groups.includes('Admin')) {
                user.role = 'ADMIN';
                user.tenantId = null;
            }

            sessionStorage.setItem(SESSION_KEYS.user, JSON.stringify(user));
            sessionStorage.setItem(SESSION_KEYS.isLoggedIn, 'true');

            return { success: true, user };
        }

        return { success: false, error: 'Failed to set new password' };
    } catch (error) {
        console.error('Set new password error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign out
 */
function signOut() {
    // Clear session storage
    Object.values(SESSION_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
    });

    // Redirect to login
    window.location.href = 'login.html';
}

/**
 * Get ID token for API calls
 */
function getIdToken() {
    return sessionStorage.getItem(SESSION_KEYS.idToken);
}

/**
 * Get Access token for API calls
 */
function getAccessToken() {
    return sessionStorage.getItem(SESSION_KEYS.accessToken);
}

// Export functions
window.Auth = {
    isLoggedIn,
    getCurrentUser,
    requireAuth,
    signIn,
    signOut,
    setNewPassword,
    getIdToken,
    getAccessToken
};
