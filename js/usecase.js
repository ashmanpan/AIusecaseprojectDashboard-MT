// Use Case Detail Page Application

let currentUseCaseId = null;
let currentUseCase = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get use case ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentUseCaseId = urlParams.get('id');

    if (!currentUseCaseId) {
        window.location.href = 'index.html';
        return;
    }

    currentUseCase = getUseCase(currentUseCaseId);
    if (!currentUseCase) {
        window.location.href = 'index.html';
        return;
    }

    initUseCasePage();
});

function initUseCasePage() {
    renderUseCaseDetails();
    renderTestProgress();
    renderTestCases();
    renderDocuments();
    renderApprovalHistory();
    renderVersionHistory();
    updateSubmitButton();
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
    const testCases = getTestCases(currentUseCaseId);
    const unitProgress = currentUseCase.unitTestProgress;

    // Calculate from test cases if available
    let passed = 0, failed = 0, pending = 0, blocked = 0;

    if (testCases.length > 0) {
        testCases.forEach(tc => {
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

    const total = testCases.length || unitProgress.total;

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
    let testCases = getTestCases(currentUseCaseId);

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

    tbody.innerHTML = testCases.map(tc => `
        <tr>
            <td><code>${tc.id}</code></td>
            <td>
                <a href="#" onclick="openTestDetail('${tc.id}'); return false;">
                    ${tc.name}
                </a>
            </td>
            <td><span class="priority-badge ${tc.priority.toLowerCase()}">${tc.priority}</span></td>
            <td><span class="status-badge ${tc.status}">${tc.status}</span></td>
            <td>${tc.lastRun ? formatDate(tc.lastRun) : '<span class="text-muted">Not run</span>'}</td>
            <td>
                <div class="link-icons">
                    ${renderLinkIcon(tc.links.testCaseDoc, 'fa-file-alt', 'Test Case Doc')}
                    ${renderLinkIcon(tc.links.testResult, 'fa-chart-bar', 'Test Results')}
                    ${renderLinkIcon(tc.links.jira, 'fa-bug', 'Jira Ticket')}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="openTestDetail('${tc.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="quickUpdateStatus('${tc.id}', 'PASSED')" title="Mark Passed">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="quickUpdateStatus('${tc.id}', 'FAILED')" title="Mark Failed">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
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
    const documents = getDocuments(currentUseCaseId);
    const grid = document.getElementById('documentsGrid');

    if (documents.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-small">
                <i class="fas fa-folder-open"></i>
                <p>No documents uploaded yet.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = documents.map(doc => `
        <div class="document-card">
            <div class="document-icon">${getDocumentIcon(doc.fileType)}</div>
            <div class="document-info">
                <div class="document-name">${doc.fileName}</div>
                <div class="document-meta">${doc.size} | ${formatDate(doc.uploadedAt)}</div>
            </div>
            <div class="document-actions">
                <a href="${doc.url}" class="btn btn-sm btn-secondary" download title="Download">
                    <i class="fas fa-download"></i>
                </a>
                ${doc.fileType === 'TEST_VIDEO' ?
                    `<button class="btn btn-sm btn-primary" onclick="playVideo('${doc.url}')" title="Play">
                        <i class="fas fa-play"></i>
                    </button>` : ''
                }
            </div>
        </div>
    `).join('');
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
    const approvals = getApprovals(currentUseCaseId);
    const timeline = document.getElementById('approvalTimeline');

    if (approvals.length === 0) {
        timeline.innerHTML = `<p class="text-muted">No approval history yet.</p>`;
        return;
    }

    timeline.innerHTML = approvals.map(approval => `
        <div class="timeline-item ${approval.action.toLowerCase()}">
            <div class="timeline-date">${formatDateTime(approval.createdAt)}</div>
            <div class="timeline-content">${formatApprovalAction(approval)}</div>
            <div class="timeline-user">by ${approval.userName} (${approval.userRole})</div>
            ${approval.comments ? `<div class="timeline-comment">"${approval.comments}"</div>` : ''}
        </div>
    `).join('');
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
function submitForApproval() {
    const newStatus = 'PENDING_LEAD_APPROVAL';

    // Add to approval history
    if (!AppData.approvals[currentUseCaseId]) {
        AppData.approvals[currentUseCaseId] = [];
    }

    AppData.approvals[currentUseCaseId].unshift({
        id: 'APR' + Date.now(),
        action: 'SUBMITTED',
        fromStatus: currentUseCase.status,
        toStatus: newStatus,
        userId: AppData.currentUser.id,
        userName: AppData.currentUser.name,
        userRole: AppData.currentUser.role,
        comments: '',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    // Update status
    currentUseCase.status = newStatus;

    // Refresh page
    initUseCasePage();
    showNotification('Submitted for approval!', 'success');
}

// Approve use case
function approveUseCase() {
    const role = AppData.currentUser.role;
    let newStatus;

    if (currentUseCase.status === 'PENDING_LEAD_APPROVAL') {
        newStatus = 'PENDING_CUSTOMER_APPROVAL';
    } else if (currentUseCase.status === 'PENDING_CUSTOMER_APPROVAL') {
        newStatus = 'APPROVED';
    }

    // Add to approval history
    AppData.approvals[currentUseCaseId].unshift({
        id: 'APR' + Date.now(),
        action: 'APPROVED',
        fromStatus: currentUseCase.status,
        toStatus: newStatus,
        userId: AppData.currentUser.id,
        userName: AppData.currentUser.name,
        userRole: role,
        comments: '',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    currentUseCase.status = newStatus;
    initUseCasePage();
    showNotification('Approved successfully!', 'success');
}

// Request changes
function requestChanges() {
    const comments = prompt('Enter your feedback for changes:');
    if (!comments) return;

    AppData.approvals[currentUseCaseId].unshift({
        id: 'APR' + Date.now(),
        action: 'CHANGES_REQUESTED',
        fromStatus: currentUseCase.status,
        toStatus: 'CHANGES_REQUESTED',
        userId: AppData.currentUser.id,
        userName: AppData.currentUser.name,
        userRole: AppData.currentUser.role,
        comments: comments,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    currentUseCase.status = 'CHANGES_REQUESTED';
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
function addTestCase(event) {
    event.preventDefault();

    const testCase = {
        id: `TC${currentUseCaseId.replace('UC', '')}-${String(getTestCases(currentUseCaseId).length + 1).padStart(3, '0')}`,
        name: document.getElementById('testCaseName').value,
        description: document.getElementById('testDescription').value,
        priority: document.getElementById('testPriority').value,
        status: document.getElementById('testStatus').value,
        lastRun: document.getElementById('testStatus').value !== 'PENDING' ? new Date().toISOString().split('T')[0] : null,
        links: {
            testCaseDoc: document.getElementById('testCaseDocLink').value || null,
            testResult: document.getElementById('testResultLink').value || null,
            jira: document.getElementById('jiraLink').value || null
        }
    };

    if (!AppData.testCases[currentUseCaseId]) {
        AppData.testCases[currentUseCaseId] = [];
    }
    AppData.testCases[currentUseCaseId].push(testCase);

    closeModal('addTestCaseModal');
    document.getElementById('addTestCaseForm').reset();
    renderTestCases();
    renderTestProgress();
    showNotification('Test case added!', 'success');
}

// Quick update test status
function quickUpdateStatus(testCaseId, status) {
    const testCases = AppData.testCases[currentUseCaseId];
    const tc = testCases.find(t => t.id === testCaseId);
    if (tc) {
        tc.status = status;
        tc.lastRun = new Date().toISOString().split('T')[0];
        renderTestCases();
        renderTestProgress();
        showNotification(`Test case marked as ${status}`, status === 'PASSED' ? 'success' : 'danger');
    }
}

// Open test detail modal
function openTestDetail(testCaseId) {
    const testCases = AppData.testCases[currentUseCaseId];
    const tc = testCases.find(t => t.id === testCaseId);
    if (!tc) return;

    document.getElementById('testDetailTitle').textContent = tc.name;
    document.getElementById('testDetailStatus').textContent = tc.status;
    document.getElementById('testDetailStatus').className = `status-badge ${tc.status}`;
    document.getElementById('testDetailPriority').textContent = tc.priority;
    document.getElementById('testDetailLastRun').textContent = tc.lastRun ? formatDate(tc.lastRun) : 'Not run yet';
    document.getElementById('testDetailDescription').textContent = tc.description || 'No description provided.';

    // Render links
    const linksList = document.getElementById('testDetailLinks');
    let linksHtml = '';
    if (tc.links.testCaseDoc) {
        linksHtml += `<li><a href="${tc.links.testCaseDoc}" target="_blank"><i class="fas fa-file-alt"></i> Test Case Document</a></li>`;
    }
    if (tc.links.testResult) {
        linksHtml += `<li><a href="${tc.links.testResult}" target="_blank"><i class="fas fa-chart-bar"></i> Test Results / Evidence</a></li>`;
    }
    if (tc.links.jira) {
        linksHtml += `<li><a href="${tc.links.jira}" target="_blank"><i class="fas fa-bug"></i> Jira Ticket</a></li>`;
    }
    if (!linksHtml) {
        linksHtml = '<li class="text-muted">No links available</li>';
    }
    linksList.innerHTML = linksHtml;

    document.getElementById('testDetailModal').classList.add('active');
}

// Upload document
function uploadDocument(event) {
    event.preventDefault();

    const docType = document.getElementById('docType').value;
    const fileInput = document.getElementById('docFile');
    const externalLink = document.getElementById('docLink').value;

    let doc;
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        doc = {
            id: 'DOC' + Date.now(),
            fileName: file.name,
            fileType: docType,
            size: formatFileSize(file.size),
            uploadedBy: AppData.currentUser.name,
            uploadedAt: new Date().toISOString().split('T')[0],
            url: URL.createObjectURL(file) // In production, this would be S3 URL
        };
    } else if (externalLink) {
        doc = {
            id: 'DOC' + Date.now(),
            fileName: 'External Link',
            fileType: docType,
            size: '-',
            uploadedBy: AppData.currentUser.name,
            uploadedAt: new Date().toISOString().split('T')[0],
            url: externalLink
        };
    } else {
        alert('Please select a file or enter a link');
        return;
    }

    if (!AppData.documents[currentUseCaseId]) {
        AppData.documents[currentUseCaseId] = [];
    }
    AppData.documents[currentUseCaseId].push(doc);

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
function saveUseCaseEdits(event) {
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

    // Update in AppData.useCases array
    const index = AppData.useCases.findIndex(uc => uc.id === currentUseCaseId);
    if (index !== -1) {
        AppData.useCases[index] = currentUseCase;
    }

    // Close modal and refresh display
    closeModal('editUseCaseModal');
    initUseCasePage();
    showNotification('Use case updated successfully!', 'success');
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

function handleTestCasesFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('importBtn').disabled = true;
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first sheet (Test Cases)
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) {
                showNotification('Excel file appears to be empty or only has headers', 'warning');
                return;
            }

            // Get headers (first row)
            const headers = jsonData[0];

            // Find column indices
            const colMap = {
                name: headers.findIndex(h => h && h.toString().toLowerCase().includes('test case name')),
                description: headers.findIndex(h => h && h.toString().toLowerCase().includes('description')),
                priority: headers.findIndex(h => h && h.toString().toLowerCase().includes('priority')),
                status: headers.findIndex(h => h && h.toString().toLowerCase().includes('status')),
                testCaseDoc: headers.findIndex(h => h && h.toString().toLowerCase().includes('test case doc')),
                testResult: headers.findIndex(h => h && h.toString().toLowerCase().includes('test result')),
                jira: headers.findIndex(h => h && h.toString().toLowerCase().includes('jira'))
            };

            // Check mandatory column
            if (colMap.name === -1) {
                showNotification('Missing mandatory column: Test Case Name', 'danger');
                return;
            }

            // Parse data rows (skip header)
            parsedTestCases = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];

                // Skip empty rows
                if (!row || !row[colMap.name]) continue;

                const testCase = {
                    name: row[colMap.name]?.toString().trim() || '',
                    description: colMap.description !== -1 ? (row[colMap.description]?.toString().trim() || '') : '',
                    priority: colMap.priority !== -1 ? normalizeValue(row[colMap.priority], ['HIGH', 'MEDIUM', 'LOW'], 'MEDIUM') : 'MEDIUM',
                    status: colMap.status !== -1 ? normalizeValue(row[colMap.status], ['PENDING', 'PASSED', 'FAILED', 'BLOCKED'], 'PENDING') : 'PENDING',
                    testCaseDoc: colMap.testCaseDoc !== -1 ? (row[colMap.testCaseDoc]?.toString().trim() || '') : '',
                    testResult: colMap.testResult !== -1 ? (row[colMap.testResult]?.toString().trim() || '') : '',
                    jira: colMap.jira !== -1 ? (row[colMap.jira]?.toString().trim() || '') : ''
                };

                if (testCase.name) {
                    parsedTestCases.push(testCase);
                }
            }

            // Show preview
            if (parsedTestCases.length > 0) {
                showPreview(parsedTestCases);
                document.getElementById('importBtn').disabled = false;
            } else {
                showNotification('No valid test cases found in the file', 'warning');
                document.getElementById('uploadPreview').style.display = 'none';
                document.getElementById('importBtn').disabled = true;
            }

        } catch (error) {
            console.error('Error parsing Excel file:', error);
            showNotification('Error parsing Excel file. Please check the format.', 'danger');
        }
    };

    reader.readAsArrayBuffer(file);
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
function uploadTestCases(event) {
    event.preventDefault();

    if (parsedTestCases.length === 0) {
        showNotification('No test cases to import', 'warning');
        return;
    }

    // Initialize test cases array for this use case if needed
    if (!AppData.testCases[currentUseCaseId]) {
        AppData.testCases[currentUseCaseId] = [];
    }

    const existingCount = AppData.testCases[currentUseCaseId].length;

    // Add test cases
    parsedTestCases.forEach((tc, idx) => {
        const testCase = {
            id: `TC${currentUseCaseId.replace('UC', '')}-${String(existingCount + idx + 1).padStart(3, '0')}`,
            name: tc.name,
            description: tc.description,
            priority: tc.priority,
            status: tc.status,
            lastRun: tc.status !== 'PENDING' ? new Date().toISOString().split('T')[0] : null,
            links: {
                testCaseDoc: tc.testCaseDoc || null,
                testResult: tc.testResult || null,
                jira: tc.jira || null
            }
        };

        AppData.testCases[currentUseCaseId].push(testCase);
    });

    const importedCount = parsedTestCases.length;

    // Clear and close modal
    parsedTestCases = [];
    closeModal('uploadTestCasesModal');
    document.getElementById('testCasesFile').value = '';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('importBtn').disabled = true;

    // Refresh views
    renderTestCases();
    renderTestProgress();

    showNotification(`Successfully imported ${importedCount} test case(s)!`, 'success');
}
