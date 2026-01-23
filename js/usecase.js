// Use Case Detail Page Application

let currentUseCaseId = null;
let currentUseCase = null;
let currentTestCases = [];
let currentDocuments = [];
let currentApprovals = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Get use case ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentUseCaseId = urlParams.get('id');

    if (!currentUseCaseId) {
        window.location.href = 'index.html';
        return;
    }

    // Load use case from DynamoDB
    currentUseCase = await UseCaseDB.getUseCase(currentUseCaseId);

    // Fallback to static data if not found in DynamoDB
    if (!currentUseCase) {
        currentUseCase = getUseCase(currentUseCaseId);
    }

    if (!currentUseCase) {
        console.error('Use case not found:', currentUseCaseId);
        window.location.href = 'index.html';
        return;
    }

    // Load test cases, documents, and approvals from DynamoDB
    await loadUseCaseData();

    initUseCasePage();
});

// Load test cases, documents, and approvals from DynamoDB
async function loadUseCaseData() {
    try {
        // Load in parallel for better performance
        const [testCases, documents, approvals] = await Promise.all([
            TestCaseDB.getTestCases(currentUseCaseId),
            DocumentDB.getDocuments(currentUseCaseId),
            ApprovalDB.getApprovals(currentUseCaseId)
        ]);

        currentTestCases = testCases || [];
        currentDocuments = documents || [];
        currentApprovals = approvals || [];

        console.log('Loaded from DynamoDB:', {
            testCases: currentTestCases.length,
            documents: currentDocuments.length,
            approvals: currentApprovals.length
        });
    } catch (error) {
        console.error('Error loading use case data from DynamoDB:', error);
        // Fall back to empty arrays
        currentTestCases = [];
        currentDocuments = [];
        currentApprovals = [];
    }
}

function initUseCasePage() {
    // Update user name and role in header from authenticated user
    const userNameEl = document.getElementById('userName');
    if (userNameEl && AppData.currentUser) {
        userNameEl.textContent = AppData.currentUser.name;
    }
    const roleBadgeEl = document.getElementById('userRole');
    if (roleBadgeEl && AppData.currentUser) {
        roleBadgeEl.textContent = formatRole(AppData.currentUser.role);
    }

    renderUseCaseDetails();
    renderTestProgress();
    renderTestCases();
    renderDocuments();
    renderApprovalHistory();
    renderVersionHistory();
    updateSubmitButton();
}

// Format role for display
function formatRole(role) {
    const roleMap = {
        'ADMIN': 'Admin',
        'TEAM_LEAD': 'Team Lead',
        'TEAM_MEMBER': 'Team Member',
        'CUSTOMER_INCHARGE': 'Customer',
        'VIEWER': 'Viewer'
    };
    return roleMap[role] || role;
}

// Format domain icon
function formatDomainIcon(domain) {
    const domainConfig = AppData.domains?.find(d => d.id === domain);
    if (!domainConfig) return '';
    return `<span class="domain-icon" style="color: ${domainConfig.color};" title="${domainConfig.name}"><i class="fas ${domainConfig.icon}"></i></span>`;
}

// Render use case details
function renderUseCaseDetails() {
    document.getElementById('useCaseTitle').innerHTML = formatDomainIcon(currentUseCase.domain) + currentUseCase.name;
    document.getElementById('ucName').innerHTML = formatDomainIcon(currentUseCase.domain) + currentUseCase.name;
    document.getElementById('ucStatus').textContent = formatStatus(currentUseCase.status);
    document.getElementById('ucStatus').className = `status-badge ${currentUseCase.status}`;
    document.getElementById('ucVersion').textContent = `Version ${currentUseCase.currentVersion}`;
    document.getElementById('ucDescription').textContent = currentUseCase.description;

    // Info cards
    document.getElementById('ucDeploymentLocation').textContent = getDeploymentLocationName(currentUseCase.deploymentLocation);
    document.getElementById('ucLifecycleStage').textContent = getLifecycleStageName(currentUseCase.lifecycleStage);
    document.getElementById('ucDeployedInLab').innerHTML = formatDeployedInLab(currentUseCase);
    document.getElementById('ucInternalTestsReady').innerHTML = formatYesNo(currentUseCase.internalTestsReady);
    document.getElementById('ucJointTestsReady').innerHTML = formatYesNo(currentUseCase.jointTestsReady);
}

// Format deployed in lab status
function formatDeployedInLab(uc) {
    if (uc.deployedInLab) {
        return '<span class="yes-badge">Yes</span>';
    } else if (uc.deployedInLabDate) {
        return `<span class="date-badge">${formatDate(uc.deployedInLabDate)}</span>`;
    }
    return '<span class="no-badge">No</span>';
}

// Format Yes/No
function formatYesNo(value) {
    return value ? '<span class="yes-badge">Yes</span>' : '<span class="no-badge">No</span>';
}

// Format status
function formatStatus(status) {
    const statusMap = {
        'DRAFT': 'Draft',
        'PENDING_LEAD_APPROVAL': 'Pending Lead Approval',
        'PENDING_CUSTOMER_APPROVAL': 'Pending Customer Approval',
        'CHANGES_REQUESTED': 'Changes Requested',
        'APPROVED': 'Approved',
        'ARCHIVED': 'Archived'
    };
    return statusMap[status] || status;
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Render test progress
function renderTestProgress() {
    const unitProgress = currentUseCase.unitTestProgress;

    // Calculate from test cases if available
    let passed = 0, failed = 0, pending = 0, blocked = 0;

    if (currentTestCases.length > 0) {
        currentTestCases.forEach(tc => {
            if (tc.status === 'PASSED') passed++;
            else if (tc.status === 'FAILED') failed++;
            else if (tc.status === 'BLOCKED') blocked++;
            else pending++;
        });
    } else {
        // Use unit test progress
        passed = unitProgress.completed;
        pending = unitProgress.total - unitProgress.completed;
    }

    const total = currentTestCases.length || unitProgress.total;

    document.getElementById('totalTests').textContent = total;
    document.getElementById('passedTests').textContent = passed;
    document.getElementById('failedTests').textContent = failed;
    document.getElementById('pendingTests').textContent = pending + blocked;

    // Progress bar
    const passedPct = total > 0 ? (passed / total * 100) : 0;
    const failedPct = total > 0 ? (failed / total * 100) : 0;

    document.getElementById('progressPassed').style.width = passedPct + '%';
    document.getElementById('progressFailed').style.width = failedPct + '%';
    document.getElementById('progressPercentage').textContent = passedPct.toFixed(1) + '% Complete';
}

// Render test cases table
function renderTestCases(statusFilter = '') {
    let testCases = [...currentTestCases];

    if (statusFilter) {
        testCases = testCases.filter(tc => tc.status === statusFilter);
    }

    const tbody = document.getElementById('testCasesTableBody');

    if (testCases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-state-content">
                        <i class="fas fa-clipboard-list"></i>
                        <p>No test cases yet. Click "+ Add Test Case" to create one.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = testCases.map(tc => {
        const tcId = tc.testCaseId || tc.id;
        const links = tc.links || {};
        return `
        <tr>
            <td><code>${tcId}</code></td>
            <td>
                <a href="#" onclick="openTestDetail('${tcId}'); return false;">
                    ${tc.name}
                </a>
            </td>
            <td><span class="priority-badge ${(tc.priority || 'MEDIUM').toLowerCase()}">${tc.priority || 'MEDIUM'}</span></td>
            <td><span class="status-badge ${tc.status}">${tc.status}</span></td>
            <td>${tc.lastRun || tc.updatedAt ? formatDate(tc.lastRun || tc.updatedAt) : '<span class="text-muted">Not run</span>'}</td>
            <td>
                <div class="link-icons">
                    ${renderLinkIcon(links.testCaseDoc, 'fa-file-alt', 'Test Case Doc')}
                    ${renderLinkIcon(links.testResult, 'fa-chart-bar', 'Test Results')}
                    ${renderLinkIcon(links.jira, 'fa-bug', 'Jira Ticket')}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-success" onclick="quickUpdateStatus('${tcId}', 'PASSED')" title="Mark Passed">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="quickUpdateStatus('${tcId}', 'FAILED')" title="Mark Failed">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="openEditTestCaseModal('${tcId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTestCase('${tcId}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// Render link icon
function renderLinkIcon(url, icon, title) {
    if (url) {
        return `<a href="${url}" target="_blank" class="link-icon" title="${title}"><i class="fas ${icon}"></i></a>`;
    }
    return `<span class="link-icon disabled" title="No ${title}"><i class="fas ${icon}"></i></span>`;
}

// Filter test cases
function filterTestCases() {
    const statusFilter = document.getElementById('testStatusFilter').value;
    renderTestCases(statusFilter);
}

// Render documents
function renderDocuments() {
    const grid = document.getElementById('documentsGrid');

    if (currentDocuments.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-small">
                <i class="fas fa-folder-open"></i>
                <p>No documents uploaded yet.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = currentDocuments.map(doc => {
        const fileName = doc.name || doc.fileName || 'Document';
        const fileType = doc.type || doc.fileType || 'OTHER';
        const size = doc.size || '-';
        const uploadedAt = doc.createdAt || doc.uploadedAt;
        return `
        <div class="document-card">
            <div class="document-icon">${getDocumentIcon(fileType)}</div>
            <div class="document-info">
                <div class="document-name">${fileName}</div>
                <div class="document-meta">${size} | ${formatDate(uploadedAt)}</div>
            </div>
            <div class="document-actions">
                <a href="${doc.url}" class="btn btn-sm btn-secondary" download title="Download">
                    <i class="fas fa-download"></i>
                </a>
                ${fileType === 'TEST_VIDEO' ?
                    `<button class="btn btn-sm btn-primary" onclick="playVideo('${doc.url}')" title="Play">
                        <i class="fas fa-play"></i>
                    </button>` : ''
                }
            </div>
        </div>
    `}).join('');
}

// Get document icon
function getDocumentIcon(fileType) {
    const icons = {
        'TEST_CASE_DOC': '<i class="fas fa-file-alt" style="color: #3b82f6;"></i>',
        'DESIGN_DOC': '<i class="fas fa-file-pdf" style="color: #ef4444;"></i>',
        'TEST_VIDEO': '<i class="fas fa-file-video" style="color: #8b5cf6;"></i>',
        'OTHER': '<i class="fas fa-file" style="color: #64748b;"></i>'
    };
    return icons[fileType] || icons['OTHER'];
}

// Render approval history
function renderApprovalHistory() {
    const timeline = document.getElementById('approvalTimeline');

    if (currentApprovals.length === 0) {
        timeline.innerHTML = `<p class="text-muted">No approval history yet.</p>`;
        return;
    }

    timeline.innerHTML = currentApprovals.map(approval => {
        const action = approval.type || approval.action || 'SUBMITTED';
        const comment = approval.comment || approval.comments || '';
        return `
        <div class="timeline-item ${action.toLowerCase()}">
            <div class="timeline-date">${formatDateTime(approval.createdAt)}</div>
            <div class="timeline-content">${formatApprovalAction({...approval, action: action})}</div>
            <div class="timeline-user">by ${approval.userName || 'Unknown'}</div>
            ${comment ? `<div class="timeline-comment">"${comment}"</div>` : ''}
        </div>
    `}).join('');
}

// Format approval action
function formatApprovalAction(approval) {
    const actions = {
        'SUBMITTED': `<i class="fas fa-paper-plane"></i> Submitted for ${approval.toStatus === 'PENDING_LEAD_APPROVAL' ? 'Lead' : 'Customer'} Approval`,
        'APPROVED': `<i class="fas fa-check-circle"></i> Approved`,
        'REJECTED': `<i class="fas fa-times-circle"></i> Rejected`,
        'CHANGES_REQUESTED': `<i class="fas fa-exclamation-circle"></i> Changes Requested`
    };
    return actions[approval.action] || approval.action;
}

// Format datetime
function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr.replace(' ', 'T'));
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Render version history
function renderVersionHistory() {
    const versions = getVersions(currentUseCaseId);
    const tbody = document.getElementById('versionTableBody');

    if (versions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-muted text-center">No version history available.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = versions.map((v, idx) => `
        <tr>
            <td>
                <span class="version-badge">${v.version}</span>
                ${idx === 0 ? '<span class="current-badge">Current</span>' : ''}
            </td>
            <td>${formatDate(v.date)}</td>
            <td>${v.author}</td>
            <td>${v.changes}</td>
        </tr>
    `).join('');
}

// Update submit button based on status and role
function updateSubmitButton() {
    const btn = document.getElementById('submitBtn');
    const status = currentUseCase.status;
    const role = AppData.currentUser.role;

    if (status === 'DRAFT' || status === 'CHANGES_REQUESTED') {
        btn.textContent = 'Submit for Approval';
        btn.onclick = () => submitForApproval();
        btn.style.display = 'inline-flex';
    } else if (status === 'PENDING_LEAD_APPROVAL' && role === 'TEAM_LEAD') {
        btn.innerHTML = '<i class="fas fa-check"></i> Approve';
        btn.onclick = () => approveUseCase();
        btn.style.display = 'inline-flex';
    } else if (status === 'PENDING_CUSTOMER_APPROVAL' && role === 'CUSTOMER_INCHARGE') {
        btn.innerHTML = '<i class="fas fa-check"></i> Approve';
        btn.onclick = () => approveUseCase();
        btn.style.display = 'inline-flex';
    } else if (status === 'APPROVED') {
        btn.style.display = 'none';
    } else {
        btn.textContent = 'Awaiting Review';
        btn.disabled = true;
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-primary');
    }
}

// Submit for approval
async function submitForApproval() {
    const newStatus = 'PENDING_LEAD_APPROVAL';

    // Add to approval history in DynamoDB
    const approvalResult = await ApprovalDB.addApproval(currentUseCaseId, {
        type: 'SUBMITTED',
        status: newStatus,
        comment: '',
        userId: AppData.currentUser.id,
        userName: AppData.currentUser.name
    });

    if (!approvalResult.success) {
        showNotification('Error saving approval: ' + approvalResult.error, 'danger');
        return;
    }

    // Update local cache
    currentApprovals.unshift(approvalResult.item);

    // Update use case status
    currentUseCase.status = newStatus;
    const updateResult = await UseCaseDB.updateUseCase(currentUseCase);

    if (!updateResult.success) {
        showNotification('Error updating status: ' + updateResult.error, 'danger');
        return;
    }

    // Refresh page
    initUseCasePage();
    showNotification('Submitted for approval!', 'success');
}

// Approve use case
async function approveUseCase() {
    let newStatus;

    if (currentUseCase.status === 'PENDING_LEAD_APPROVAL') {
        newStatus = 'PENDING_CUSTOMER_APPROVAL';
    } else if (currentUseCase.status === 'PENDING_CUSTOMER_APPROVAL') {
        newStatus = 'APPROVED';
    }

    // Add to approval history in DynamoDB
    const approvalResult = await ApprovalDB.addApproval(currentUseCaseId, {
        type: 'APPROVED',
        status: newStatus,
        comment: '',
        userId: AppData.currentUser.id,
        userName: AppData.currentUser.name
    });

    if (!approvalResult.success) {
        showNotification('Error saving approval: ' + approvalResult.error, 'danger');
        return;
    }

    // Update local cache
    currentApprovals.unshift(approvalResult.item);

    // Update use case status
    currentUseCase.status = newStatus;
    const updateResult = await UseCaseDB.updateUseCase(currentUseCase);

    if (!updateResult.success) {
        showNotification('Error updating status: ' + updateResult.error, 'danger');
        return;
    }

    initUseCasePage();
    showNotification('Approved successfully!', 'success');
}

// Request changes
async function requestChanges() {
    const comments = prompt('Enter your feedback for changes:');
    if (!comments) return;

    const newStatus = 'CHANGES_REQUESTED';

    // Add to approval history in DynamoDB
    const approvalResult = await ApprovalDB.addApproval(currentUseCaseId, {
        type: 'CHANGES_REQUESTED',
        status: newStatus,
        comment: comments,
        userId: AppData.currentUser.id,
        userName: AppData.currentUser.name
    });

    if (!approvalResult.success) {
        showNotification('Error saving approval: ' + approvalResult.error, 'danger');
        return;
    }

    // Update local cache
    currentApprovals.unshift(approvalResult.item);

    // Update use case status
    currentUseCase.status = newStatus;
    const updateResult = await UseCaseDB.updateUseCase(currentUseCase);

    if (!updateResult.success) {
        showNotification('Error updating status: ' + updateResult.error, 'danger');
        return;
    }

    initUseCasePage();
    showNotification('Changes requested', 'warning');
}

// Modal functions
function openAddTestCaseModal() {
    document.getElementById('addTestCaseModal').classList.add('active');
}

function openUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Add test case
async function addTestCase(event) {
    event.preventDefault();

    const testCase = {
        name: document.getElementById('testCaseName').value,
        description: document.getElementById('testDescription').value,
        priority: document.getElementById('testPriority').value,
        status: document.getElementById('testStatus').value,
        links: {
            testCaseDoc: document.getElementById('testCaseDocLink').value || null,
            testResult: document.getElementById('testResultLink').value || null,
            jira: document.getElementById('jiraLink').value || null
        }
    };

    // Save to DynamoDB
    const result = await TestCaseDB.addTestCase(currentUseCaseId, testCase);

    if (!result.success) {
        showNotification('Error adding test case: ' + result.error, 'danger');
        return;
    }

    // Update local cache
    currentTestCases.push(result.item);

    // Sync test progress to use case
    await updateUseCaseTestProgress();

    closeModal('addTestCaseModal');
    document.getElementById('addTestCaseForm').reset();
    renderTestCases();
    renderTestProgress();
    showNotification('Test case added!', 'success');
}

// Update use case's unitTestProgress based on actual test cases
async function updateUseCaseTestProgress() {
    const total = currentTestCases.length;
    const completed = currentTestCases.filter(tc => tc.status === 'PASSED').length;

    // Update use case object
    currentUseCase.unitTestProgress = { completed, total };

    // Update in DynamoDB
    const result = await UseCaseDB.updateUseCase(currentUseCase);

    if (!result.success) {
        console.error('Failed to update use case test progress:', result.error);
        return;
    }

    // Update local AppData cache
    const index = AppData.useCases.findIndex(uc => uc.id === currentUseCaseId);
    if (index !== -1) {
        AppData.useCases[index].unitTestProgress = { completed, total };
    }

    console.log(`Updated test progress: ${completed}/${total}`);
}

// Quick update test status
async function quickUpdateStatus(testCaseId, status) {
    const tc = currentTestCases.find(t => (t.testCaseId || t.id) === testCaseId);
    if (!tc) return;

    // Update in DynamoDB
    const result = await TestCaseDB.updateTestCase(currentUseCaseId, testCaseId, {
        status: status,
        lastRun: new Date().toISOString().split('T')[0]
    });

    if (!result.success) {
        showNotification('Error updating test case: ' + result.error, 'danger');
        return;
    }

    // Update local cache
    tc.status = status;
    tc.lastRun = new Date().toISOString().split('T')[0];

    // Sync test progress to use case (for dashboard)
    await updateUseCaseTestProgress();

    renderTestCases();
    renderTestProgress();
    showNotification(`Test case marked as ${status}`, status === 'PASSED' ? 'success' : 'danger');
}

// Open test detail modal
function openTestDetail(testCaseId) {
    const tc = currentTestCases.find(t => (t.testCaseId || t.id) === testCaseId);
    if (!tc) return;

    const links = tc.links || {};

    document.getElementById('testDetailTitle').textContent = tc.name;
    document.getElementById('testDetailStatus').textContent = tc.status;
    document.getElementById('testDetailStatus').className = `status-badge ${tc.status}`;
    document.getElementById('testDetailPriority').textContent = tc.priority || 'MEDIUM';
    document.getElementById('testDetailLastRun').textContent = tc.lastRun || tc.updatedAt ? formatDate(tc.lastRun || tc.updatedAt) : 'Not run yet';
    document.getElementById('testDetailDescription').textContent = tc.description || 'No description provided.';

    // Render links
    const linksList = document.getElementById('testDetailLinks');
    let linksHtml = '';
    if (links.testCaseDoc) {
        linksHtml += `<li><a href="${links.testCaseDoc}" target="_blank"><i class="fas fa-file-alt"></i> Test Case Document</a></li>`;
    }
    if (links.testResult) {
        linksHtml += `<li><a href="${links.testResult}" target="_blank"><i class="fas fa-chart-bar"></i> Test Results / Evidence</a></li>`;
    }
    if (links.jira) {
        linksHtml += `<li><a href="${links.jira}" target="_blank"><i class="fas fa-bug"></i> Jira Ticket</a></li>`;
    }
    if (!linksHtml) {
        linksHtml = '<li class="text-muted">No links available</li>';
    }
    linksList.innerHTML = linksHtml;

    document.getElementById('testDetailModal').classList.add('active');
}

// Store current test case being edited
let editingTestCaseId = null;

// Open edit test case modal
function openEditTestCaseModal(testCaseId) {
    const tc = currentTestCases.find(t => (t.testCaseId || t.id) === testCaseId);
    if (!tc) return;

    editingTestCaseId = testCaseId;
    const links = tc.links || {};

    document.getElementById('editTestCaseName').value = tc.name || '';
    document.getElementById('editTestDescription').value = tc.description || '';
    document.getElementById('editTestPriority').value = tc.priority || 'MEDIUM';
    document.getElementById('editTestStatus').value = tc.status || 'PENDING';
    document.getElementById('editTestCaseDocLink').value = links.testCaseDoc || '';
    document.getElementById('editTestResultLink').value = links.testResult || '';
    document.getElementById('editJiraLink').value = links.jira || '';

    document.getElementById('editTestCaseModal').classList.add('active');
}

// Save edited test case
async function saveEditedTestCase(event) {
    event.preventDefault();

    if (!editingTestCaseId) return;

    const updates = {
        name: document.getElementById('editTestCaseName').value,
        description: document.getElementById('editTestDescription').value,
        priority: document.getElementById('editTestPriority').value,
        status: document.getElementById('editTestStatus').value,
        links: {
            testCaseDoc: document.getElementById('editTestCaseDocLink').value || null,
            testResult: document.getElementById('editTestResultLink').value || null,
            jira: document.getElementById('editJiraLink').value || null
        },
        updatedAt: new Date().toISOString()
    };

    // Update in DynamoDB
    const result = await TestCaseDB.updateTestCase(currentUseCaseId, editingTestCaseId, updates);

    if (!result.success) {
        showNotification('Error updating test case: ' + result.error, 'danger');
        return;
    }

    // Update local cache
    const tc = currentTestCases.find(t => (t.testCaseId || t.id) === editingTestCaseId);
    if (tc) {
        Object.assign(tc, updates);
    }

    // Sync test progress
    await updateUseCaseTestProgress();

    closeModal('editTestCaseModal');
    editingTestCaseId = null;
    renderTestCases();
    renderTestProgress();
    showNotification('Test case updated!', 'success');
}

// Delete single test case
async function deleteTestCase(testCaseId) {
    const tc = currentTestCases.find(t => (t.testCaseId || t.id) === testCaseId);
    if (!tc) return;

    if (!confirm(`Delete test case "${tc.name}"?\n\nThis cannot be undone.`)) {
        return;
    }

    const result = await TestCaseDB.deleteTestCase(currentUseCaseId, testCaseId);

    if (!result.success) {
        showNotification('Error deleting test case: ' + result.error, 'danger');
        return;
    }

    // Remove from local cache
    const index = currentTestCases.findIndex(t => (t.testCaseId || t.id) === testCaseId);
    if (index !== -1) {
        currentTestCases.splice(index, 1);
    }

    // Sync test progress
    await updateUseCaseTestProgress();

    renderTestCases();
    renderTestProgress();
    showNotification('Test case deleted!', 'success');
}

// Delete all test cases for current use case
async function deleteAllTestCases() {
    if (currentTestCases.length === 0) {
        showNotification('No test cases to delete', 'warning');
        return;
    }

    if (!confirm(`Delete ALL ${currentTestCases.length} test cases for "${currentUseCase.name}"?\n\nThis cannot be undone.`)) {
        return;
    }

    showNotification('Deleting test cases...', 'info');

    let deleted = 0;
    for (const tc of [...currentTestCases]) {
        const tcId = tc.testCaseId || tc.id;
        const result = await TestCaseDB.deleteTestCase(currentUseCaseId, tcId);
        if (result.success) deleted++;
    }

    // Clear local cache
    currentTestCases = [];

    // Sync test progress
    await updateUseCaseTestProgress();

    renderTestCases();
    renderTestProgress();
    showNotification(`Deleted ${deleted} test case(s)!`, 'success');
}

// Upload document
async function uploadDocument(event) {
    event.preventDefault();

    const docType = document.getElementById('docType').value;
    const fileInput = document.getElementById('docFile');
    const externalLink = document.getElementById('docLink').value;

    let docData;
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        docData = {
            name: file.name,
            type: docType,
            size: formatFileSize(file.size),
            uploadedBy: AppData.currentUser.name,
            url: URL.createObjectURL(file) // In production, this would be S3 URL
        };
    } else if (externalLink) {
        docData = {
            name: 'External Link',
            type: docType,
            size: '-',
            uploadedBy: AppData.currentUser.name,
            url: externalLink
        };
    } else {
        alert('Please select a file or enter a link');
        return;
    }

    // Save to DynamoDB
    const result = await DocumentDB.addDocument(currentUseCaseId, docData);

    if (!result.success) {
        showNotification('Error uploading document: ' + result.error, 'danger');
        return;
    }

    // Update local cache
    currentDocuments.push(result.item);

    closeModal('uploadModal');
    document.getElementById('uploadForm').reset();
    renderDocuments();
    showNotification('Document uploaded!', 'success');
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Edit use case - open modal with current values
function editUseCase() {
    // Populate form with current values
    document.getElementById('editUcName').value = currentUseCase.name || '';
    document.getElementById('editUcDescription').value = currentUseCase.description || '';
    document.getElementById('editDeploymentLocation').value = currentUseCase.deploymentLocation || 'LAB';
    document.getElementById('editLifecycleStage').value = currentUseCase.lifecycleStage || 'INTERNAL_UNIT_TESTING';
    document.getElementById('editStatus').value = currentUseCase.status || 'DRAFT';
    document.getElementById('editLabDeployDate').value = currentUseCase.deployedInLabDate || '';
    document.getElementById('editDeployedInLab').checked = currentUseCase.deployedInLab || false;
    document.getElementById('editInternalTestsReady').checked = currentUseCase.internalTestsReady || false;
    document.getElementById('editJointTestsReady').checked = currentUseCase.jointTestsReady || false;

    // Open modal
    document.getElementById('editUseCaseModal').classList.add('active');
}

// Save use case edits
async function saveUseCaseEdits(event) {
    event.preventDefault();

    // Update use case object
    currentUseCase.name = document.getElementById('editUcName').value;
    currentUseCase.description = document.getElementById('editUcDescription').value;
    currentUseCase.deploymentLocation = document.getElementById('editDeploymentLocation').value;
    currentUseCase.lifecycleStage = document.getElementById('editLifecycleStage').value;
    currentUseCase.status = document.getElementById('editStatus').value;
    currentUseCase.deployedInLabDate = document.getElementById('editLabDeployDate').value || null;
    currentUseCase.deployedInLab = document.getElementById('editDeployedInLab').checked;
    currentUseCase.internalTestsReady = document.getElementById('editInternalTestsReady').checked;
    currentUseCase.jointTestsReady = document.getElementById('editJointTestsReady').checked;
    currentUseCase.updatedAt = new Date().toISOString().split('T')[0];

    // Update in AppData.useCases array (for immediate UI update)
    const index = AppData.useCases.findIndex(uc => uc.id === currentUseCaseId);
    if (index !== -1) {
        AppData.useCases[index] = currentUseCase;
    }

    // Save to DynamoDB
    const result = await UseCaseDB.updateUseCase(currentUseCase);

    if (result.success) {
        closeModal('editUseCaseModal');
        initUseCasePage();
        showNotification('Use case updated successfully!', 'success');
    } else {
        showNotification('Error saving changes: ' + result.error, 'danger');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};

// ============================================
// Excel Test Cases Import/Export Functions
// ============================================

// Download test case template
function downloadTestCaseTemplate() {
    // Define columns
    const headers = [
        'Test Case Name',  // Mandatory
        'Description',     // Optional
        'Priority',        // Optional - HIGH, MEDIUM, LOW
        'Status',          // Optional - PENDING, PASSED, FAILED, BLOCKED
        'Test Case Doc URL', // Optional
        'Test Result URL',   // Optional
        'Jira URL'           // Optional
    ];

    // Sample data rows to help users understand the format
    const sampleData = [
        ['Login Authentication Test', 'Verify user can log in with valid credentials', 'HIGH', 'PENDING', 'https://docs.example.com/tc001', '', ''],
        ['Password Reset Flow', 'Test password reset functionality end to end', 'MEDIUM', 'PENDING', '', '', 'https://jira.example.com/PROJ-123'],
        ['API Rate Limiting', 'Verify API rate limits are enforced correctly', 'LOW', 'PENDING', '', '', '']
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
        { wch: 30 },  // Test Case Name
        { wch: 50 },  // Description
        { wch: 10 },  // Priority
        { wch: 10 },  // Status
        { wch: 35 },  // Test Case Doc URL
        { wch: 35 },  // Test Result URL
        { wch: 35 }   // Jira URL
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

    // Add instructions sheet
    const instructionsData = [
        ['Test Cases Import Template Instructions'],
        [''],
        ['MANDATORY COLUMNS:'],
        ['- Test Case Name: The name of your test case (required)'],
        [''],
        ['OPTIONAL COLUMNS:'],
        ['- Description: Detailed description of the test case'],
        ['- Priority: HIGH, MEDIUM, or LOW (defaults to MEDIUM if empty)'],
        ['- Status: PENDING, PASSED, FAILED, or BLOCKED (defaults to PENDING if empty)'],
        ['- Test Case Doc URL: Link to the test case documentation'],
        ['- Test Result URL: Link to test results or evidence'],
        ['- Jira URL: Link to Jira ticket or issue tracker'],
        [''],
        ['NOTES:'],
        ['- Delete the sample data rows before importing'],
        ['- Do not change the column headers'],
        ['- Empty rows will be skipped'],
        ['- Invalid URLs will be stored but may not work as links']
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Generate filename with use case name
    const fileName = `TestCases_Template_${currentUseCase.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);
    showNotification('Template downloaded!', 'success');
}

// Open upload test cases modal
function openUploadTestCasesModal() {
    document.getElementById('uploadTestCasesModal').classList.add('active');
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('importBtn').disabled = true;
    document.getElementById('testCasesFile').value = '';
}

// Store parsed data for import
let parsedTestCases = [];

// Handle file selection and preview
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('testCasesFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleTestCasesFileSelect);
    }
});

async function handleTestCasesFileSelect(event) {
    const file = event.target.files[0];
    const aiFeedbackDiv = document.getElementById('aiFeedback');
    const previewDiv = document.getElementById('uploadPreview');
    const importBtn = document.getElementById('importBtn');

    if (!file) {
        if (aiFeedbackDiv) aiFeedbackDiv.style.display = 'none';
        previewDiv.style.display = 'none';
        importBtn.disabled = true;
        return;
    }

    // Show loading state
    if (aiFeedbackDiv) {
        aiFeedbackDiv.style.display = 'block';
        aiFeedbackDiv.innerHTML = '<div class="ai-analyzing"><i class="fas fa-robot fa-spin"></i> AI is analyzing your file...</div>';
    }
    importBtn.disabled = true;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON (with headers)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) {
                showNotification('Excel file appears to be empty or only has headers', 'warning');
                if (aiFeedbackDiv) aiFeedbackDiv.style.display = 'none';
                return;
            }

            // Get headers and rows
            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            // Use AI Analyzer to map columns intelligently
            let analysisResult;
            if (window.AIAnalyzer) {
                analysisResult = await AIAnalyzer.analyzeTestCases(headers, rows, sheetName);
            } else {
                // Fallback to local analysis
                analysisResult = localFallbackAnalysis(headers, rows);
            }

            // Show AI feedback
            if (aiFeedbackDiv && analysisResult.analysis) {
                aiFeedbackDiv.innerHTML = AIAnalyzer.formatFeedbackHtml(analysisResult.analysis);
                aiFeedbackDiv.style.display = 'block';
            }

            // Store mapped test cases
            if (analysisResult.mappedData && analysisResult.mappedData.length > 0) {
                parsedTestCases = analysisResult.mappedData.map(tc => ({
                    name: tc.name,
                    description: tc.description || '',
                    priority: tc.priority || 'MEDIUM',
                    status: tc.status || 'PENDING',
                    testCaseDoc: tc.testCaseDocUrl || '',
                    testResult: tc.testResultUrl || '',
                    jira: tc.jiraUrl || ''
                }));

                showPreview(parsedTestCases);
                importBtn.disabled = false;
            } else {
                showNotification('No valid test cases found in the file', 'warning');
                previewDiv.style.display = 'none';
                importBtn.disabled = true;
            }

        } catch (error) {
            console.error('Error parsing Excel file:', error);
            showNotification('Error parsing Excel file. Please check the format.', 'danger');
            if (aiFeedbackDiv) aiFeedbackDiv.style.display = 'none';
        }
    };

    reader.readAsArrayBuffer(file);
}

// Local fallback analysis if AI is not available
function localFallbackAnalysis(headers, rows) {
    if (window.AIAnalyzer) {
        return AIAnalyzer.localAnalysis(headers, rows);
    }

    // Basic fallback
    const mappedData = [];
    const colMap = {
        name: headers.findIndex(h => h && h.toString().toLowerCase().includes('test case name') || h.toString().toLowerCase().includes('title')),
        description: headers.findIndex(h => h && (h.toString().toLowerCase().includes('description') || h.toString().toLowerCase().includes('trigger') || h.toString().toLowerCase().includes('expected'))),
        priority: headers.findIndex(h => h && h.toString().toLowerCase().includes('priority')),
        status: headers.findIndex(h => h && h.toString().toLowerCase().includes('status'))
    };

    // Check for Pass/Fail columns
    const passCol = headers.findIndex(h => h && h.toString().toLowerCase() === 'pass');
    const failCol = headers.findIndex(h => h && h.toString().toLowerCase() === 'fail' || h.toString().toLowerCase() === 'failed');

    for (const row of rows) {
        if (!row || row.every(c => !c)) continue;

        const nameIdx = colMap.name !== -1 ? colMap.name : 2; // Default to column 2 (Title in your format)
        const name = row[nameIdx]?.toString().trim();

        if (!name) continue;

        let status = 'PENDING';
        if (passCol !== -1 && row[passCol]) {
            status = 'PASSED';
        } else if (failCol !== -1 && row[failCol]) {
            status = 'FAILED';
        }

        mappedData.push({
            name: name,
            description: colMap.description !== -1 ? (row[colMap.description]?.toString().trim() || '') : '',
            priority: 'MEDIUM',
            status: status,
            testCaseDocUrl: '',
            testResultUrl: '',
            jiraUrl: ''
        });
    }

    return {
        success: true,
        analysis: {
            columnMapping: colMap,
            feedback: [`Found ${mappedData.length} test cases using local analysis.`],
            warnings: ['AI analysis unavailable - using basic column matching.'],
            validRowCount: mappedData.length,
            skippedRows: rows.length - mappedData.length,
            confidence: 'LOW'
        },
        mappedData
    };
}

// Normalize values to allowed options
function normalizeValue(value, allowedValues, defaultValue) {
    if (!value) return defaultValue;
    const normalized = value.toString().toUpperCase().trim();
    return allowedValues.includes(normalized) ? normalized : defaultValue;
}

// Show preview of parsed data
function showPreview(testCases) {
    const previewDiv = document.getElementById('uploadPreview');
    const previewTable = document.getElementById('previewTable');
    const previewCount = document.getElementById('previewCount');

    // Show first 5 rows
    const previewData = testCases.slice(0, 5);

    let tableHtml = `
        <table class="data-table preview-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Test Case Name</th>
                    <th>Priority</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    previewData.forEach((tc, idx) => {
        tableHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td>${escapeHtml(tc.name.substring(0, 50))}${tc.name.length > 50 ? '...' : ''}</td>
                <td><span class="priority-badge ${tc.priority.toLowerCase()}">${tc.priority}</span></td>
                <td><span class="status-badge ${tc.status}">${tc.status}</span></td>
            </tr>
        `;
    });

    tableHtml += '</tbody></table>';

    previewTable.innerHTML = tableHtml;
    previewCount.innerHTML = `<strong>Total: ${testCases.length} test case(s) found</strong>` +
        (testCases.length > 5 ? ` (showing first 5)` : '');

    previewDiv.style.display = 'block';
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Upload/Import test cases
async function uploadTestCases(event) {
    event.preventDefault();

    if (parsedTestCases.length === 0) {
        showNotification('No test cases to import', 'warning');
        return;
    }

    // Show loading state
    const importBtn = document.getElementById('importBtn');
    importBtn.disabled = true;
    importBtn.textContent = 'Importing...';

    // Prepare test cases for batch add
    const testCasesToAdd = parsedTestCases.map(tc => ({
        name: tc.name,
        description: tc.description,
        priority: tc.priority,
        status: tc.status,
        category: 'Unit Test',
        links: {
            testCaseDoc: tc.testCaseDoc || null,
            testResult: tc.testResult || null,
            jira: tc.jira || null
        }
    }));

    // Add test cases to DynamoDB
    const results = await TestCaseDB.batchAddTestCases(currentUseCaseId, testCasesToAdd);

    // Count successes
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    // Update local cache with successful additions
    results.forEach(r => {
        if (r.success) {
            currentTestCases.push(r.item);
        }
    });

    // Update use case's unitTestProgress in DynamoDB
    await updateUseCaseTestProgress();

    // Clear and close modal
    parsedTestCases = [];
    closeModal('uploadTestCasesModal');
    document.getElementById('testCasesFile').value = '';
    document.getElementById('uploadPreview').style.display = 'none';
    const aiFeedbackDiv = document.getElementById('aiFeedback');
    if (aiFeedbackDiv) aiFeedbackDiv.style.display = 'none';
    importBtn.disabled = true;
    importBtn.textContent = 'Import Test Cases';

    // Refresh views
    renderTestCases();
    renderTestProgress();

    if (failCount > 0) {
        showNotification(`Imported ${successCount} test case(s), ${failCount} failed`, 'warning');
    } else {
        showNotification(`Successfully imported ${successCount} test case(s)!`, 'success');
    }
}
