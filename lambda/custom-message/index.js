/**
 * Cognito Custom Message Lambda Trigger
 * Generates invitation emails with tenant-specific URLs
 */

const TENANTS = {
    'jio': { name: 'Jio India', url: 'https://jio.cisco-apj-sp-agentic-ai.com' },
    'jio-dc': { name: 'Jio DC', url: 'https://jio-dc.cisco-apj-sp-agentic-ai.com' },
    'jio-security': { name: 'Jio Security', url: 'https://jio-security.cisco-apj-sp-agentic-ai.com' },
    'airtel': { name: 'Airtel India - IP Transport', url: 'https://airtel.cisco-apj-sp-agentic-ai.com' },
    'airtel-it': { name: 'Airtel IT', url: 'https://airtel-it.cisco-apj-sp-agentic-ai.com' },
    'airtel-mpbn': { name: 'Airtel MPBN', url: 'https://airtel-mpbn.cisco-apj-sp-agentic-ai.com' },
    'ioh': { name: 'IOH Indonesia', url: 'https://ioh.cisco-apj-sp-agentic-ai.com' },
    'optus': { name: 'Optus Australia', url: 'https://optus.cisco-apj-sp-agentic-ai.com' },
    'softbank': { name: 'SoftBank Japan', url: 'https://softbank.cisco-apj-sp-agentic-ai.com' },
    'kddi': { name: 'KDDI Japan', url: 'https://kddi.cisco-apj-sp-agentic-ai.com' },
    'ntt': { name: 'NTT Japan', url: 'https://ntt.cisco-apj-sp-agentic-ai.com' },
    'telstra': { name: 'Telstra Australia', url: 'https://telstra.cisco-apj-sp-agentic-ai.com' },
    'nbn': { name: 'NBN Australia', url: 'https://nbn.cisco-apj-sp-agentic-ai.com' },
    'pldt': { name: 'PLDT Philippines', url: 'https://pldt.cisco-apj-sp-agentic-ai.com' },
    'globe': { name: 'Globe Telecom Philippines', url: 'https://globe.cisco-apj-sp-agentic-ai.com' },
    'xl': { name: 'XL Axiata Indonesia', url: 'https://xl.cisco-apj-sp-agentic-ai.com' },
    'smart': { name: 'Smart Communications Philippines', url: 'https://smart.cisco-apj-sp-agentic-ai.com' }
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Only handle AdminCreateUser invitation messages
    if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
        const username = event.request.usernameParameter;
        const tempPassword = event.request.codeParameter;

        // Get user attributes
        const userAttributes = event.request.userAttributes || {};
        const tenantId = userAttributes['custom:tenantId'] || null;
        const role = userAttributes['custom:role'] || 'VIEWER';
        const displayName = userAttributes['custom:displayName'] || username;

        // Generate login URLs based on tenant and role
        let loginUrlsHtml = '';

        if (!tenantId || tenantId === 'null' || role === 'ADMIN' || role === 'VIEWER') {
            // User has access to all tenants - list all URLs
            loginUrlsHtml = '<p><strong>Your Dashboard URLs:</strong></p><ul style="margin: 10px 0;">';
            for (const [id, tenant] of Object.entries(TENANTS)) {
                loginUrlsHtml += `<li><a href="${tenant.url}/login.html">${tenant.name}</a></li>`;
            }
            loginUrlsHtml += '</ul>';
        } else {
            // User has access to specific tenant only
            const tenant = TENANTS[tenantId];
            if (tenant) {
                loginUrlsHtml = `<p><strong>Your Dashboard URL:</strong><br/><a href="${tenant.url}/login.html">${tenant.name} Dashboard</a></p>`;
            } else {
                loginUrlsHtml = `<p><strong>Login URL:</strong><br/><a href="https://cisco-apj-sp-agentic-ai.com/login.html">AI Use Case Dashboard</a></p>`;
            }
        }

        // Build HTML email
        const emailHtml = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a73e8;">Welcome to AI Use Case Dashboard</h2>

        <p>Hello ${displayName},</p>

        <p>You have been invited to the <strong>AI Use Case Dashboard</strong>.</p>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
            <table style="width: 100%;">
                <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${username}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Temporary Password:</strong></td><td><code style="background: #e8e8e8; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></td></tr>
            </table>
        </div>

        ${loginUrlsHtml}

        <p style="color: #666; font-size: 14px;">You will be asked to change your password on first login.</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #888; font-size: 12px;">
            Best regards,<br/>
            AI Dashboard Team<br/>
            <em>This is an automated message from noreply@cisco-apj-sp-agentic-ai.com</em>
        </p>
    </div>
</body>
</html>`;

        event.response.emailSubject = 'Welcome to AI Use Case Dashboard';
        event.response.emailMessage = emailHtml;
    }

    return event;
};
