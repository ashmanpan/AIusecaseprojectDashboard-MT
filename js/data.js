// Sample Data - This will be replaced with DynamoDB data
// Multi-tenant data structure

// Get logged-in user from session
function getLoggedInUser() {
    if (window.Auth && Auth.getCurrentUser) {
        const user = Auth.getCurrentUser();
        if (user) return user;
    }
    // Fallback for demo/development
    return {
        id: 'kpanse',
        name: 'Krishna Panse',
        email: 'kpanse@cisco.com',
        role: 'ADMIN',
        tenantId: null
    };
}

const loggedInUser = getLoggedInUser();

const AppData = {
    // Current tenant - use user's tenant or default to 'jio' for admin
    currentTenant: loggedInUser.tenantId || 'jio',
    currentUser: loggedInUser,

    // Tenants
    tenants: {
        'jio': { id: 'jio', name: 'Jio India' },
        'airtel': { id: 'airtel', name: 'Airtel India - IP Transport' },
        'ioh': { id: 'ioh', name: 'Indosat Ooredoo Hutchison (IOH) Indonesia' },
        'optus': { id: 'optus', name: 'Optus Australia' },
        'softbank': { id: 'softbank', name: 'SoftBank Japan' },
        'kddi': { id: 'kddi', name: 'KDDI Japan' },
        'ntt': { id: 'ntt', name: 'NTT Japan' },
        'telstra': { id: 'telstra', name: 'Telstra Australia' },
        'nbn': { id: 'nbn', name: 'NBN Australia' },
        'pldt': { id: 'pldt', name: 'PLDT Philippines' },
        'globe': { id: 'globe', name: 'Globe Telecom Philippines' },
        'xl': { id: 'xl', name: 'XL Axiata Indonesia' },
        'smart': { id: 'smart', name: 'Smart Communications Philippines' }
    },

    // Users by tenant
    users: [
        {
            id: 'kpanse',
            name: 'Krishna Panse',
            email: 'kpanse@cisco.com',
            role: 'ADMIN',
            tenantId: null  // Admin has access to all tenants
        },
        {
            id: 'vtathe',
            name: 'Vikarna Tathe',
            email: 'vtathe@cisco.com',
            role: 'TEAM_LEAD',
            tenantId: 'jio'
        },
        {
            id: 'rushisha',
            name: 'Rushit Shah',
            email: 'rushisha@cisco.com',
            role: 'TEAM_LEAD',
            tenantId: 'airtel'
        },
        {
            id: 'jaidgupt',
            name: 'Jaideep Gupta',
            email: 'jaidgupt@cisco.com',
            role: 'VIEWER',
            tenantId: null  // Viewer has access to all tenants
        },
        {
            id: 'vikasha3',
            name: 'Vikas Sharma',
            email: 'vikasha3@cisco.com',
            role: 'VIEWER',
            tenantId: 'airtel'
        },
        {
            id: 'abroycho',
            name: 'Abhinav Roychoudhury',
            email: 'abroycho@cisco.com',
            role: 'VIEWER',
            tenantId: null  // Viewer has access to all tenants
        },
        {
            id: 'hemakum4',
            name: 'Hemant Kumar',
            email: 'hemakum4@cisco.com',
            role: 'TEAM_LEAD',
            tenantId: null,  // Can view all tenants
            editableTenants: ['jio', 'airtel']  // Can edit these tenants
        },
        {
            id: 'mdzkhan',
            name: 'Md Zoheb Khan',
            email: 'mdzkhan@cisco.com',
            role: 'TEAM_LEAD',
            tenantId: 'airtel'
        }
    ],

    // Deployment Locations (configurable per tenant)
    deploymentLocations: [
        { id: 'ON_PREM', name: 'On-Premises' },
        { id: 'LAB', name: 'Lab' },
        { id: 'POC_CISCO_LAB', name: 'POC Cisco Lab' },
        { id: 'POC_CLOUD', name: 'POC on Cloud' },
        { id: 'PROD_NON_COMMERCIAL', name: 'Prod (Non-Commercial Traffic)' },
        { id: 'PROD_COMMERCIAL', name: 'Prod (Commercial Traffic)' }
    ],

    // Lifecycle Stages (configurable per tenant)
    lifecycleStages: [
        { id: 'INTERNAL_UNIT_TESTING', name: 'Internal Unit Testing' },
        { id: 'INTERNAL_E2E_TESTING', name: 'Internal E2E Integrated Testing' },
        { id: 'JOINT_TESTING_X', name: 'Joint Testing with Customer Team X' },
        { id: 'JOINT_TESTING_Y', name: 'Joint Testing with Customer Team Y' },
        { id: 'APPROVED_BY_JOINT_TEAM', name: 'Approved by Joint Testing Team' },
        { id: 'DEPLOYED', name: 'Deployed' }
    ],

    // Use Cases - Your actual data
    useCases: [
        {
            id: 'UC001',
            name: 'Incident Management',
            description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.',
            tenantId: 'jio',
            status: 'IN_PROGRESS',
            deploymentLocation: 'LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: true,
            deployedInLabDate: null, // Already deployed (Yes)
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 41, total: 115 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.0',
            createdBy: 'user1',
            createdAt: '2025-12-01',
            updatedAt: '2026-01-03'
        },
        {
            id: 'UC002',
            name: 'RCA (Root Cause Analysis)',
            description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.',
            tenantId: 'jio',
            status: 'DEPLOYMENT_IN_PROGRESS',
            deploymentLocation: 'LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: false,
            deployedInLabDate: '2026-01-15',
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 75 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.0',
            createdBy: 'user2',
            createdAt: '2025-12-10',
            updatedAt: '2026-01-02'
        },
        {
            id: 'UC003',
            name: 'Customer Experience Management',
            description: 'AI analytics for customer experience insights and predictive satisfaction scoring.',
            tenantId: 'jio',
            status: 'DEPLOYMENT_IN_PROGRESS',
            deploymentLocation: 'POC_CLOUD',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: false,
            deployedInLabDate: '2026-01-30',
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 10 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.0',
            createdBy: 'user2',
            createdAt: '2025-12-15',
            updatedAt: '2026-01-01'
        },
        {
            id: 'UC004',
            name: 'Image Upgrade',
            description: 'Automated network device image upgrade with AI-based risk assessment.',
            tenantId: 'jio',
            status: 'IN_PROGRESS',
            deploymentLocation: 'LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: true,
            deployedInLabDate: null,
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 10 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.2',
            createdBy: 'user1',
            createdAt: '2025-11-20',
            updatedAt: '2026-01-04'
        },
        {
            id: 'UC005',
            name: 'Toxic Factor Detection',
            description: 'AI model to detect and analyze toxic network behaviors and anomalies.',
            tenantId: 'jio',
            status: 'DEPLOYMENT_IN_PROGRESS',
            deploymentLocation: 'LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: true,
            deployedInLabDate: null,
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 10 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.0',
            createdBy: 'user2',
            createdAt: '2025-12-05',
            updatedAt: '2026-01-02'
        },
        {
            id: 'UC006',
            name: 'Config Drift Detection',
            description: 'AI-based configuration drift detection and compliance monitoring.',
            tenantId: 'jio',
            status: 'DEPLOYMENT_IN_PROGRESS',
            deploymentLocation: 'LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: true,
            deployedInLabDate: null,
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 10 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.0',
            createdBy: 'user1',
            createdAt: '2025-12-08',
            updatedAt: '2026-01-03'
        },
        {
            id: 'UC007',
            name: 'Audit Agent',
            description: 'AI-powered audit automation for network compliance and security checks.',
            tenantId: 'jio',
            status: 'PENDING_LEAD_APPROVAL',
            deploymentLocation: 'LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: false,
            deployedInLabDate: '2026-01-12',
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 55, total: 65 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '2.1',
            createdBy: 'user2',
            createdAt: '2025-11-15',
            updatedAt: '2026-01-05'
        },
        {
            id: 'UC008',
            name: 'Intent-Driven Configuration Deployment',
            description: 'AI-driven intent-based network configuration automation.',
            tenantId: 'jio',
            status: 'CHANGES_REQUESTED',
            deploymentLocation: 'POC_CISCO_LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: false,
            deployedInLabDate: '2026-01-12',
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 25 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.3',
            createdBy: 'user1',
            createdAt: '2025-11-25',
            updatedAt: '2026-01-04'
        },
        {
            id: 'UC009',
            name: 'PSRIT Security Analysis & Mitigation',
            description: 'AI security vulnerability analysis and automated mitigation recommendations.',
            tenantId: 'jio',
            status: 'DEPLOYMENT_IN_PROGRESS',
            deploymentLocation: 'LAB',
            lifecycleStage: 'INTERNAL_UNIT_TESTING',
            deployedInLab: false,
            deployedInLabDate: '2026-01-12',
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 10 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '1.0',
            createdBy: 'user2',
            createdAt: '2025-12-12',
            updatedAt: '2026-01-03'
        },
        {
            id: 'UC010',
            name: 'Zero Trust Config Guardian',
            description: 'AI-based zero trust configuration validation and enforcement.',
            tenantId: 'jio',
            status: 'APPROVED',
            deploymentLocation: 'PROD_NON_COMMERCIAL',
            lifecycleStage: 'DEPLOYED',
            deployedInLab: false,
            deployedInLabDate: '2026-01-15',
            internalTestsReady: true,
            jointTestsReady: false,
            unitTestProgress: { completed: 0, total: 5 },
            e2eTestingStatus: '1 week after Unit Testing completion',
            jointTestingStart: 'After E2E Testing completion',
            currentVersion: '2.0',
            createdBy: 'user1',
            createdAt: '2025-10-20',
            updatedAt: '2026-01-05'
        },
        // ==================== AIRTEL USE CASES ====================
        { id: 'airtel-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'airtel-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'airtel', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== IOH USE CASES ====================
        { id: 'ioh-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ioh-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'ioh', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== OPTUS USE CASES ====================
        { id: 'optus-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'optus-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'optus', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== SOFTBANK USE CASES ====================
        { id: 'softbank-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'softbank-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'softbank', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== KDDI USE CASES ====================
        { id: 'kddi-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'kddi-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'kddi', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== NTT USE CASES ====================
        { id: 'ntt-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'ntt-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'ntt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== TELSTRA USE CASES ====================
        { id: 'telstra-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'telstra-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'telstra', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== NBN USE CASES ====================
        { id: 'nbn-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'nbn-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'nbn', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== PLDT USE CASES ====================
        { id: 'pldt-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'pldt-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'pldt', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== GLOBE USE CASES ====================
        { id: 'globe-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'globe-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'globe', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== XL USE CASES ====================
        { id: 'xl-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'xl-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'xl', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        // ==================== SMART USE CASES ====================
        { id: 'smart-UC001', name: 'Incident Management', description: 'AI-powered incident management system for automated ticket classification, routing, and resolution suggestions.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 115 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC002', name: 'RCA (Root Cause Analysis)', description: 'AI-driven root cause analysis for network incidents using ML pattern recognition.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 75 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC003', name: 'Customer Experience Management', description: 'AI analytics for customer experience insights and predictive satisfaction scoring.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC004', name: 'Image Upgrade', description: 'Automated network device image upgrade with AI-based risk assessment.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC005', name: 'Toxic Factor Detection', description: 'AI model to detect and analyze toxic network behaviors and anomalies.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC006', name: 'Config Drift Detection', description: 'AI-based configuration drift detection and compliance monitoring.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC007', name: 'Audit Agent', description: 'AI-powered audit automation for network compliance and security checks.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 65 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC008', name: 'Intent-Driven Configuration Deployment', description: 'AI-driven intent-based network configuration automation.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 25 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC009', name: 'PSRIT Security Analysis & Mitigation', description: 'AI security vulnerability analysis and automated mitigation recommendations.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 10 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        { id: 'smart-UC010', name: 'Zero Trust Config Guardian', description: 'AI-based zero trust configuration validation and enforcement.', tenantId: 'smart', status: 'DRAFT', deploymentLocation: 'LAB', lifecycleStage: 'INTERNAL_UNIT_TESTING', deployedInLab: false, deployedInLabDate: null, internalTestsReady: false, jointTestsReady: false, unitTestProgress: { completed: 0, total: 5 }, e2eTestingStatus: '1 week after Unit Testing completion', jointTestingStart: 'After E2E Testing completion', currentVersion: '1.0', createdBy: 'user1', createdAt: '2026-01-01', updatedAt: '2026-01-01' }
    ],

    // Test Cases for each Use Case
    testCases: {
        'UC001': [
            {
                id: 'TC001-001',
                name: 'Ticket Classification Accuracy Test',
                description: 'Verify AI correctly classifies incoming tickets by category',
                priority: 'HIGH',
                status: 'PASSED',
                lastRun: '2026-01-03',
                links: {
                    testCaseDoc: 'https://docs.example.com/tc001-001',
                    testResult: 'https://results.example.com/tc001-001',
                    jira: 'https://jira.example.com/browse/AI-101'
                }
            },
            {
                id: 'TC001-002',
                name: 'Auto-Routing Validation',
                description: 'Validate ticket auto-routing to correct team',
                priority: 'HIGH',
                status: 'PASSED',
                lastRun: '2026-01-03',
                links: {
                    testCaseDoc: 'https://docs.example.com/tc001-002',
                    testResult: 'https://results.example.com/tc001-002',
                    jira: 'https://jira.example.com/browse/AI-102'
                }
            },
            {
                id: 'TC001-003',
                name: 'Resolution Suggestion Quality',
                description: 'Test quality and relevance of AI resolution suggestions',
                priority: 'MEDIUM',
                status: 'FAILED',
                lastRun: '2026-01-02',
                links: {
                    testCaseDoc: 'https://docs.example.com/tc001-003',
                    testResult: 'https://results.example.com/tc001-003',
                    jira: 'https://jira.example.com/browse/AI-103'
                }
            },
            {
                id: 'TC001-004',
                name: 'Performance Under Load',
                description: 'Test system performance with 1000+ concurrent tickets',
                priority: 'HIGH',
                status: 'PENDING',
                lastRun: null,
                links: {
                    testCaseDoc: 'https://docs.example.com/tc001-004',
                    testResult: null,
                    jira: 'https://jira.example.com/browse/AI-104'
                }
            },
            {
                id: 'TC001-005',
                name: 'Edge Case Handling',
                description: 'Verify handling of malformed or incomplete tickets',
                priority: 'MEDIUM',
                status: 'PENDING',
                lastRun: null,
                links: {
                    testCaseDoc: null,
                    testResult: null,
                    jira: null
                }
            }
        ],
        'UC007': [
            {
                id: 'TC007-001',
                name: 'Compliance Check Accuracy',
                description: 'Verify AI accurately identifies compliance violations',
                priority: 'HIGH',
                status: 'PASSED',
                lastRun: '2026-01-04',
                links: {
                    testCaseDoc: 'https://docs.example.com/tc007-001',
                    testResult: 'https://results.example.com/tc007-001',
                    jira: 'https://jira.example.com/browse/AI-201'
                }
            },
            {
                id: 'TC007-002',
                name: 'Audit Report Generation',
                description: 'Test automated audit report generation',
                priority: 'MEDIUM',
                status: 'PASSED',
                lastRun: '2026-01-04',
                links: {
                    testCaseDoc: 'https://docs.example.com/tc007-002',
                    testResult: 'https://results.example.com/tc007-002',
                    jira: null
                }
            }
        ]
    },

    // Documents
    documents: {
        'UC001': [
            {
                id: 'DOC001-001',
                fileName: 'incident-management-design.pdf',
                fileType: 'DESIGN_DOC',
                size: '2.3 MB',
                uploadedBy: 'John Doe',
                uploadedAt: '2025-12-15',
                url: '#'
            },
            {
                id: 'DOC001-002',
                fileName: 'test-plan-v1.docx',
                fileType: 'TEST_CASE_DOC',
                size: '1.1 MB',
                uploadedBy: 'Sarah Chen',
                uploadedAt: '2025-12-20',
                url: '#'
            },
            {
                id: 'DOC001-003',
                fileName: 'demo-video.mp4',
                fileType: 'TEST_VIDEO',
                size: '45 MB',
                uploadedBy: 'John Doe',
                uploadedAt: '2026-01-02',
                url: '#'
            }
        ]
    },

    // Approval History
    approvals: {
        'UC001': [
            {
                id: 'APR001-003',
                action: 'SUBMITTED',
                fromStatus: 'DRAFT',
                toStatus: 'PENDING_LEAD_APPROVAL',
                userId: 'user2',
                userName: 'Sarah Chen',
                userRole: 'TEAM_MEMBER',
                comments: '',
                createdAt: '2026-01-03 10:30'
            },
            {
                id: 'APR001-002',
                action: 'CHANGES_REQUESTED',
                fromStatus: 'PENDING_LEAD_APPROVAL',
                toStatus: 'DRAFT',
                userId: 'user1',
                userName: 'John Doe',
                userRole: 'TEAM_LEAD',
                comments: 'Please add more edge case tests for ticket classification.',
                createdAt: '2026-01-02 14:15'
            },
            {
                id: 'APR001-001',
                action: 'SUBMITTED',
                fromStatus: 'DRAFT',
                toStatus: 'PENDING_LEAD_APPROVAL',
                userId: 'user2',
                userName: 'Sarah Chen',
                userRole: 'TEAM_MEMBER',
                comments: '',
                createdAt: '2026-01-01 09:00'
            }
        ]
    },

    // Version History
    versions: {
        'UC001': [
            { version: '1.0', date: '2026-01-03', author: 'Sarah Chen', changes: 'Added edge case tests' },
            { version: '0.9', date: '2026-01-01', author: 'Sarah Chen', changes: 'Updated ML model parameters' },
            { version: '0.5', date: '2025-12-15', author: 'John Doe', changes: 'Initial version' }
        ]
    },

    // Recent Activity
    recentActivity: [
        { icon: 'fa-check-circle', iconClass: 'success', text: 'UC-010 "Zero Trust Config Guardian" approved', time: '2 hours ago' },
        { icon: 'fa-paper-plane', iconClass: 'info', text: 'UC-001 "Incident Management" submitted for review', time: '5 hours ago' },
        { icon: 'fa-exclamation-circle', iconClass: 'warning', text: 'UC-008 "Intent-Driven Config" changes requested', time: '1 day ago' },
        { icon: 'fa-flask', iconClass: 'info', text: 'UC-007 "Audit Agent" test cases updated (55/65)', time: '1 day ago' },
        { icon: 'fa-plus-circle', iconClass: 'primary', text: 'UC-003 "Customer Experience" created', time: '2 days ago' }
    ]
};

// Helper functions
function getUseCase(id) {
    return AppData.useCases.find(uc => uc.id === id);
}

function getTestCases(useCaseId) {
    return AppData.testCases[useCaseId] || [];
}

function getDocuments(useCaseId) {
    return AppData.documents[useCaseId] || [];
}

function getApprovals(useCaseId) {
    return AppData.approvals[useCaseId] || [];
}

function getVersions(useCaseId) {
    return AppData.versions[useCaseId] || [];
}

function getDeploymentLocationName(id) {
    const loc = AppData.deploymentLocations.find(l => l.id === id);
    return loc ? loc.name : id;
}

function getLifecycleStageName(id) {
    const stage = AppData.lifecycleStages.find(s => s.id === id);
    return stage ? stage.name : id;
}

// Statistics
function getStatistics() {
    const useCases = AppData.useCases.filter(uc => uc.tenantId === AppData.currentTenant);
    return {
        total: useCases.length,
        approved: useCases.filter(uc => uc.status === 'APPROVED').length,
        pending: useCases.filter(uc =>
            uc.status === 'PENDING_LEAD_APPROVAL' ||
            uc.status === 'PENDING_CUSTOMER_APPROVAL'
        ).length,
        inTesting: useCases.filter(uc =>
            uc.lifecycleStage.includes('TESTING') &&
            uc.status !== 'APPROVED'
        ).length,
        draft: useCases.filter(uc => uc.status === 'DRAFT').length,
        changesRequested: useCases.filter(uc => uc.status === 'CHANGES_REQUESTED').length
    };
}

// Deployment location distribution
function getDeploymentDistribution() {
    const useCases = AppData.useCases.filter(uc => uc.tenantId === AppData.currentTenant);
    const distribution = {};
    useCases.forEach(uc => {
        const loc = getDeploymentLocationName(uc.deploymentLocation);
        distribution[loc] = (distribution[loc] || 0) + 1;
    });
    return distribution;
}

// Lifecycle stage distribution
function getLifecycleDistribution() {
    const useCases = AppData.useCases.filter(uc => uc.tenantId === AppData.currentTenant);
    const distribution = {};
    useCases.forEach(uc => {
        const stage = getLifecycleStageName(uc.lifecycleStage);
        distribution[stage] = (distribution[stage] || 0) + 1;
    });
    return distribution;
}

// Test progress across all use cases
function getOverallTestProgress() {
    const useCases = AppData.useCases.filter(uc => uc.tenantId === AppData.currentTenant);
    let totalCompleted = 0;
    let totalTests = 0;
    useCases.forEach(uc => {
        totalCompleted += uc.unitTestProgress.completed;
        totalTests += uc.unitTestProgress.total;
    });
    return { completed: totalCompleted, total: totalTests };
}

// Check if user can edit a specific tenant
function canEditTenant(user, tenantId) {
    if (!user) return false;
    // Admin can edit all tenants
    if (user.role === 'ADMIN') return true;
    // Check editableTenants array for multi-tenant users
    if (user.editableTenants && user.editableTenants.includes(tenantId)) return true;
    // Check single tenant assignment
    if (user.tenantId === tenantId && (user.role === 'TEAM_LEAD' || user.role === 'TEAM_MEMBER')) return true;
    return false;
}

// Check if user can view a specific tenant
function canViewTenant(user, tenantId) {
    if (!user) return false;
    // Admin can view all
    if (user.role === 'ADMIN') return true;
    // Users with tenantId: null can view all
    if (user.tenantId === null) return true;
    // Check editableTenants
    if (user.editableTenants && user.editableTenants.includes(tenantId)) return true;
    // Check single tenant
    if (user.tenantId === tenantId) return true;
    return false;
}
