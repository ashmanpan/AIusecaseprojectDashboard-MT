// Main Dashboard Application

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    // Only run functions if elements exist
    if (document.getElementById('totalUseCases')) {
        updateStats();
    }
    if (document.getElementById('useCasesTableBody')) {
        renderUseCasesTable();
    }
    if (document.getElementById('activityList')) {
        renderRecentActivity();
    }
    if (document.getElementById('deploymentChart')) {
        initCharts();
    }
    setupEventListeners();
}

// Update statistics cards
function updateStats() {
    const stats = getStatistics();
    document.getElementById('totalUseCases').textContent = stats.total;
    document.getElementById('approvedCount').textContent = stats.approved;
    document.getElementById('pendingApproval').textContent = stats.pending;
    document.getElementById('inTesting').textContent = stats.total - stats.approved;
    document.getElementById('pendingCount').textContent = stats.pending;
}

// Render use cases table
function renderUseCasesTable(filter = '', statusFilter = '', stageFilter = '') {
    const tbody = document.getElementById('useCasesTableBody');
    if (!tbody) return;

    let useCases = AppData.useCases.filter(uc => uc.tenantId === AppData.currentTenant);

    // Apply search filter
    if (filter) {
        const searchLower = filter.toLowerCase();
        useCases = useCases.filter(uc =>
            uc.name.toLowerCase().includes(searchLower) ||
            uc.description.toLowerCase().includes(searchLower)
        );
    }

    // Apply status filter
    if (statusFilter) {
        useCases = useCases.filter(uc => uc.status === statusFilter);
    }

    // Apply stage filter
    if (stageFilter) {
        useCases = useCases.filter(uc => uc.lifecycleStage.includes(stageFilter));
    }

    tbody.innerHTML = useCases.map((uc, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <a href="usecase.html?id=${uc.id}" class="use-case-link">
                    <strong>${uc.name}</strong>
                </a>
            </td>
            <td>${formatDeployedInLab(uc)}</td>
            <td>${formatYesNo(uc.internalTestsReady)}</td>
            <td>${formatYesNo(uc.jointTestsReady)}</td>
            <td>${formatTestProgress(uc.unitTestProgress)}</td>
            <td><span class="text-muted">${uc.e2eTestingStatus}</span></td>
            <td><span class="text-muted">${uc.jointTestingStart}</span></td>
            <td><span class="status-badge ${uc.status}">${formatStatus(uc.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <a href="usecase.html?id=${uc.id}" class="btn btn-sm btn-secondary" title="View Details">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn btn-sm btn-secondary" onclick="editUseCase('${uc.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Format deployed in lab status
function formatDeployedInLab(uc) {
    if (uc.deployedInLab) {
        return '<span class="yes-badge"><i class="fas fa-check"></i> Yes</span>';
    } else if (uc.deployedInLabDate) {
        return `<span class="date-badge"><i class="fas fa-calendar"></i> ${formatDate(uc.deployedInLabDate)}</span>`;
    }
    return '<span class="no-badge"><i class="fas fa-times"></i> No</span>';
}

// Format Yes/No badges
function formatYesNo(value) {
    if (value) {
        return '<span class="yes-badge"><i class="fas fa-check"></i> Yes</span>';
    }
    return '<span class="no-badge"><i class="fas fa-times"></i> No</span>';
}

// Format test progress
function formatTestProgress(progress) {
    const percentage = progress.total > 0 ? (progress.completed / progress.total * 100).toFixed(0) : 0;
    const colorClass = percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'danger';

    return `
        <div class="progress-cell">
            <span class="progress-text">${progress.completed}/${progress.total}</span>
            <div class="progress-bar-mini">
                <div class="progress-bar-mini-fill ${colorClass}" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// Format status
function formatStatus(status) {
    const statusMap = {
        'DRAFT': 'Draft',
        'PENDING_LEAD_APPROVAL': 'Pending Lead',
        'PENDING_CUSTOMER_APPROVAL': 'Pending Customer',
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

// Render recent activity
function renderRecentActivity() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = AppData.recentActivity.map(activity => `
        <li>
            <div class="activity-text">
                <i class="fas ${activity.icon} activity-icon ${activity.iconClass}"></i>
                <span>${activity.text}</span>
            </div>
            <span class="activity-time">${activity.time}</span>
        </li>
    `).join('');
}

// Initialize charts
function initCharts() {
    // Deployment Location Chart
    const deploymentData = getDeploymentDistribution();
    const deploymentCtx = document.getElementById('deploymentChart').getContext('2d');
    new Chart(deploymentCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(deploymentData),
            datasets: [{
                data: Object.values(deploymentData),
                backgroundColor: [
                    '#667eea',
                    '#11998e',
                    '#f093fb',
                    '#4facfe',
                    '#f5576c',
                    '#38ef7d'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Lifecycle Stage Chart
    const lifecycleData = getLifecycleDistribution();
    const lifecycleCtx = document.getElementById('lifecycleChart').getContext('2d');
    new Chart(lifecycleCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(lifecycleData),
            datasets: [{
                label: 'Use Cases',
                data: Object.values(lifecycleData),
                backgroundColor: '#667eea',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Test Progress Chart
    const testProgress = getOverallTestProgress();
    const testProgressCtx = document.getElementById('testProgressChart').getContext('2d');
    new Chart(testProgressCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [testProgress.completed, testProgress.total - testProgress.completed],
                backgroundColor: ['#22c55e', '#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const statusFilter = document.getElementById('statusFilter')?.value || '';
            const stageFilter = document.getElementById('stageFilter')?.value || '';
            renderUseCasesTable(e.target.value, statusFilter, stageFilter);
        });
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            const searchFilter = document.getElementById('searchInput')?.value || '';
            const stageFilter = document.getElementById('stageFilter')?.value || '';
            renderUseCasesTable(searchFilter, e.target.value, stageFilter);
        });
    }

    // Stage filter
    const stageFilter = document.getElementById('stageFilter');
    if (stageFilter) {
        stageFilter.addEventListener('change', function(e) {
            const searchFilter = document.getElementById('searchInput')?.value || '';
            const statusFilterVal = document.getElementById('statusFilter')?.value || '';
            renderUseCasesTable(searchFilter, statusFilterVal, e.target.value);
        });
    }

    // Tenant selector
    const tenantSelector = document.getElementById('tenantSelector');
    if (tenantSelector) {
        tenantSelector.addEventListener('change', function(e) {
            AppData.currentTenant = e.target.value;
            initDashboard();
        });
    }
}

// Modal functions
function openNewUseCaseModal() {
    document.getElementById('newUseCaseModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Create new use case
function createUseCase(event) {
    event.preventDefault();

    const newUseCase = {
        id: 'UC' + String(AppData.useCases.length + 1).padStart(3, '0'),
        name: document.getElementById('useCaseName').value,
        description: document.getElementById('description').value,
        tenantId: AppData.currentTenant,
        status: 'DRAFT',
        deploymentLocation: document.getElementById('deploymentLocation').value || 'LAB',
        lifecycleStage: document.getElementById('lifecycleStage').value || 'INTERNAL_UNIT_TESTING',
        deployedInLab: false,
        deployedInLabDate: document.getElementById('labDeployDate').value || null,
        internalTestsReady: false,
        jointTestsReady: false,
        unitTestProgress: { completed: 0, total: parseInt(document.getElementById('totalTestCases').value) || 0 },
        e2eTestingStatus: '1 week after Unit Testing completion',
        jointTestingStart: 'After E2E Testing completion',
        currentVersion: '1.0',
        createdBy: AppData.currentUser.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    };

    AppData.useCases.push(newUseCase);
    closeModal('newUseCaseModal');
    document.getElementById('newUseCaseForm').reset();
    initDashboard();

    // Show success message
    showNotification('Use case created successfully!', 'success');
}

// Edit use case
function editUseCase(id) {
    window.location.href = `usecase.html?id=${id}&edit=true`;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

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
