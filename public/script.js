/**
 * Expense Tracker - Main JavaScript
 * Handles all frontend functionality
 */

// ==================== API Base URL ====================
const API_BASE = '/api/expenses';

// ==================== Global State ====================
let currentPage = 'dashboard';
let expenseToDelete = null;
let expenseToEdit = null;
let categoryPieChart = null;
let monthlyBarChart = null;
let analyticsPieChart = null;
let analyticsBarChart = null;

// ==================== Category Colors ====================
const categoryColors = {
    Food: '#FF9800',
    Travel: '#2196F3',
    Shopping: '#E91E63',
    Bills: '#9C27B0',
    Entertainment: '#00BCD4',
    Others: '#607D8B'
};

// ==================== DOM Elements ====================
const elements = {
    navLinks: document.querySelectorAll('.nav-link'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    sidebar: document.getElementById('sidebar'),
    dashboardPage: document.getElementById('dashboard-page'),
    addExpensePage: document.getElementById('add-expense-page'),
    expensesPage: document.getElementById('expenses-page'),
    analyticsPage: document.getElementById('analytics-page'),
    totalExpenses: document.getElementById('totalExpenses'),
    todayExpenses: document.getElementById('todayExpenses'),
    monthExpenses: document.getElementById('monthExpenses'),
    totalTransactions: document.getElementById('totalTransactions'),
    categoryPieChart: document.getElementById('categoryPieChart'),
    monthlyBarChart: document.getElementById('monthlyBarChart'),
    analyticsPieChart: document.getElementById('analyticsPieChart'),
    analyticsBarChart: document.getElementById('analyticsBarChart'),
    recentExpensesTable: document.getElementById('recentExpensesTable'),
    expensesList: document.getElementById('expensesList'),
    expenseForm: document.getElementById('expenseForm'),
    editExpenseForm: document.getElementById('editExpenseForm'),
    clearFormBtn: document.getElementById('clearForm'),
    notesInput: document.getElementById('notes'),
    notesCount: document.getElementById('notesCount'),
    editModal: document.getElementById('editModal'),
    editExpenseId: document.getElementById('editExpenseId'),
    editTitle: document.getElementById('editTitle'),
    editAmount: document.getElementById('editAmount'),
    editCategory: document.getElementById('editCategory'),
    editDate: document.getElementById('editDate'),
    editNotes: document.getElementById('editNotes'),
    closeEditModal: document.getElementById('closeEditModal'),
    cancelEdit: document.getElementById('cancelEdit'),
    deleteModal: document.getElementById('deleteModal'),
    deleteExpenseId: document.getElementById('deleteExpenseId'),
    closeDeleteModal: document.getElementById('closeDeleteModal'),
    cancelDelete: document.getElementById('cancelDelete'),
    confirmDelete: document.getElementById('confirmDelete'),
    filterCategory: document.getElementById('filterCategory'),
    filterStartDate: document.getElementById('filterStartDate'),
    filterEndDate: document.getElementById('filterEndDate'),
    filterMinAmount: document.getElementById('filterMinAmount'),
    filterMaxAmount: document.getElementById('filterMaxAmount'),
    applyFiltersBtn: document.getElementById('applyFilters'),
    clearFiltersBtn: document.getElementById('clearFilters'),
    searchExpenses: document.getElementById('searchExpenses'),
    themeToggle: document.getElementById('themeToggle'),
    toastContainer: document.getElementById('toastContainer')
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setDefaultDate();
    initTheme();
    setupNavigation();
    setupMobileMenu();
    setupForms();
    setupFilters();
    setupModals();
    setupTheme();
    setupSearch();
    await loadDashboardData();
}

// ==================== Navigation ====================
function setupNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('expenses');
        });
    });
}

function navigateTo(page) {
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }

    currentPage = page;
    loadPageData(page);
    elements.sidebar.classList.remove('active');
}

function loadPageData(page) {
    switch (page) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'expenses':
            loadExpenses();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ==================== Mobile Menu ====================
function setupMobileMenu() {
    elements.mobileMenuToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!elements.sidebar.contains(e.target) && !elements.mobileMenuToggle.contains(e.target)) {
                elements.sidebar.classList.remove('active');
            }
        }
    });
}

// ==================== Theme ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function setupTheme() {
    elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        if (categoryPieChart) updateChartTheme(categoryPieChart);
        if (monthlyBarChart) updateChartTheme(monthlyBarChart);
        if (analyticsPieChart) updateChartTheme(analyticsPieChart);
        if (analyticsBarChart) updateChartTheme(analyticsBarChart);
    });
}

function updateChartTheme(chart) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FAFAFA' : '#212121';

    if (chart.options.scales.x) {
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.x.grid.color = isDark ? '#424242' : '#E0E0E0';
    }
    if (chart.options.scales.y) {
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.grid.color = isDark ? '#424242' : '#E0E0E0';
    }

    chart.update();
}

// ==================== Forms ====================
function setupForms() {
    elements.expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addExpense();
    });

    elements.clearFormBtn.addEventListener('click', () => {
        elements.expenseForm.reset();
        elements.notesCount.textContent = '0';
        setDefaultDate();
        clearErrors();
    });

    elements.notesInput.addEventListener('input', (e) => {
        elements.notesCount.textContent = e.target.value.length;
    });

    elements.editExpenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateExpense();
    });
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = today;
}

async function addExpense() {
    clearErrors();

    const formData = {
        title: document.getElementById('title').value.trim(),
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        notes: document.getElementById('notes').value.trim()
    };

    if (!validateExpenseForm(formData)) {
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('Expense added successfully!', 'success');
            elements.expenseForm.reset();
            elements.notesCount.textContent = '0';
            setDefaultDate();
            loadDashboardData();
            navigateTo('dashboard');
        } else {
            showToast(result.message || 'Failed to add expense', 'error');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        showToast('An error occurred while adding the expense', 'error');
    }
}

function validateExpenseForm(data) {
    let isValid = true;

    if (!data.title) {
        showFieldError('titleError', 'Please enter an expense title');
        isValid = false;
    }

    if (!data.amount || data.amount <= 0) {
        showFieldError('amountError', 'Please enter a valid amount');
        isValid = false;
    }

    if (!data.category) {
        showFieldError('categoryError', 'Please select a category');
        isValid = false;
    }

    if (!data.date) {
        showFieldError('dateError', 'Please select a date');
        isValid = false;
    }

    return isValid;
}

function showFieldError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// ==================== Dashboard Data ====================
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE}/summary`);
        const result = await response.json();

        if (result.success) {
            const { totalExpenses, todayExpenses, monthExpenses, totalTransactions, expensesByCategory, monthlyTrends } = result.data;

            elements.totalExpenses.textContent = formatCurrency(totalExpenses);
            elements.todayExpenses.textContent = formatCurrency(todayExpenses);
            elements.monthExpenses.textContent = formatCurrency(monthExpenses);
            elements.totalTransactions.textContent = totalTransactions;

            updateCategoryPieChart(expensesByCategory);
            updateMonthlyBarChart(monthlyTrends);
            loadRecentExpenses();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

async function loadRecentExpenses() {
    try {
        const response = await fetch(`${API_BASE}?sortBy=createdAt&sortOrder=desc`);
        const result = await response.json();

        if (result.success) {
            const expenses = result.data.slice(0, 5);
            renderRecentExpenses(expenses);
        }
    } catch (error) {
        console.error('Error loading recent expenses:', error);
    }
}

function renderRecentExpenses(expenses) {
    if (!expenses || expenses.length === 0) {
        elements.recentExpensesTable.innerHTML = `
      <tr>
        <td colspan="5" class="no-data">No expenses yet. Add your first expense!</td>
      </tr>
    `;
        return;
    }

    elements.recentExpensesTable.innerHTML = expenses.map(expense => `
    <tr>
      <td>${escapeHtml(expense.title)}</td>
      <td><span class="category-badge ${expense.category}">${expense.category}</span></td>
      <td>${formatDate(expense.date)}</td>
      <td class="amount-cell">${formatCurrency(expense.amount)}</td>
      <td>
        <div class="actions-cell">
          <button class="action-btn edit" onclick="openEditModal('${expense._id}')" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete" onclick="openDeleteModal('${expense._id}')" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==================== Charts ====================
function updateCategoryPieChart(data) {
    const ctx = elements.categoryPieChart.getContext('2d');

    if (categoryPieChart) categoryPieChart.destroy();

    const labels = data.map(item => item._id);
    const values = data.map(item => item.total);
    const colors = labels.map(label => categoryColors[label] || categoryColors.Others);

    categoryPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } } },
            cutout: '60%'
        }
    });
}

function updateMonthlyBarChart(data) {
    const ctx = elements.monthlyBarChart.getContext('2d');

    if (monthlyBarChart) monthlyBarChart.destroy();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = data.map(item => `${months[item._id.month - 1]} ${item._id.year}`);
    const values = data.map(item => item.total);

    monthlyBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Expenses', data: values, backgroundColor: '#4CAF50', borderRadius: 4, barThickness: 30 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { callback: (value) => '$' + value } } }
        }
    });
}

// ==================== Expenses Page ====================
async function loadExpenses() {
    try {
        const filters = getFilterParams();
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}?${queryString}`);
        const result = await response.json();

        if (result.success) renderExpenses(result.data);
    } catch (error) {
        console.error('Error loading expenses:', error);
        showToast('Failed to load expenses', 'error');
    }
}

function renderExpenses(expenses) {
    if (!expenses || expenses.length === 0) {
        elements.expensesList.innerHTML = `
      <tr>
        <td colspan="6" class="no-data">No expenses found. Add your first expense!</td>
      </tr>
    `;
        return;
    }

    elements.expensesList.innerHTML = expenses.map(expense => `
    <tr>
      <td>${escapeHtml(expense.title)}</td>
      <td><span class="category-badge ${expense.category}">${expense.category}</span></td>
      <td>${formatDate(expense.date)}</td>
      <td class="amount-cell">${formatCurrency(expense.amount)}</td>
      <td>${expense.notes ? escapeHtml(expense.notes.substring(0, 50)) + (expense.notes.length > 50 ? '...' : '') : '-'}</td>
      <td>
        <div class="actions-cell">
          <button class="action-btn edit" onclick="openEditModal('${expense._id}')" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete" onclick="openDeleteModal('${expense._id}')" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==================== Filters ====================
function setupFilters() {
    elements.applyFiltersBtn.addEventListener('click', () => loadExpenses());

    elements.clearFiltersBtn.addEventListener('click', () => {
        elements.filterCategory.value = 'All';
        elements.filterStartDate.value = '';
        elements.filterEndDate.value = '';
        elements.filterMinAmount.value = '';
        elements.filterMaxAmount.value = '';
        loadExpenses();
    });
}

function getFilterParams() {
    const params = {};

    if (elements.filterCategory.value && elements.filterCategory.value !== 'All') params.category = elements.filterCategory.value;
    if (elements.filterStartDate.value) params.startDate = elements.filterStartDate.value;
    if (elements.filterEndDate.value) params.endDate = elements.filterEndDate.value;
    if (elements.filterMinAmount.value) params.minAmount = elements.filterMinAmount.value;
    if (elements.filterMaxAmount.value) params.maxAmount = elements.filterMaxAmount.value;

    return params;
}

// ==================== Search ====================
function setupSearch() {
    let searchTimeout;

    elements.searchExpenses.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const searchTerm = e.target.value.trim();

            try {
                const response = await fetch(`${API_BASE}?search=${encodeURIComponent(searchTerm)}`);
                const result = await response.json();

                if (result.success) renderExpenses(result.data);
            } catch (error) {
                console.error('Error searching expenses:', error);
            }
        }, 300);
    });
}

// ==================== Edit Modal ====================
async function openEditModal(expenseId) {
    try {
        const response = await fetch(`${API_BASE}/${expenseId}`);
        const result = await response.json();

        if (result.success) {
            const expense = result.data;

            elements.editExpenseId.value = expense._id;
            elements.editTitle.value = expense.title;
            elements.editAmount.value = expense.amount;
            elements.editCategory.value = expense.category;
            elements.editDate.value = new Date(expense.date).toISOString().split('T')[0];
            elements.editNotes.value = expense.notes || '';

            elements.editModal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading expense for edit:', error);
        showToast('Failed to load expense data', 'error');
    }
}

function closeEditModal() {
    elements.editModal.classList.remove('active');
}

async function updateExpense() {
    const expenseId = elements.editExpenseId.value;

    const formData = {
        title: elements.editTitle.value.trim(),
        amount: parseFloat(elements.editAmount.value),
        category: elements.editCategory.value,
        date: elements.editDate.value,
        notes: elements.editNotes.value.trim()
    };

    try {
        const response = await fetch(`${API_BASE}/${expenseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('Expense updated successfully!', 'success');
            closeEditModal();
            loadPageData(currentPage);

            if (currentPage === 'dashboard') loadDashboardData();
        } else {
            showToast(result.message || 'Failed to update expense', 'error');
        }
    } catch (error) {
        console.error('Error updating expense:', error);
        showToast('An error occurred while updating the expense', 'error');
    }
}

// ==================== Delete Modal ====================
function openDeleteModal(expenseId) {
    elements.deleteExpenseId.value = expenseId;
    elements.deleteModal.classList.add('active');
}

function closeDeleteModal() {
    elements.deleteModal.classList.remove('active');
    elements.deleteExpenseId.value = '';
}

async function deleteExpense() {
    const expenseId = elements.deleteExpenseId.value;

    try {
        const response = await fetch(`${API_BASE}/${expenseId}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showToast('Expense deleted successfully!', 'success');
            closeDeleteModal();
            loadPageData(currentPage);

            if (currentPage === 'dashboard') loadDashboardData();
        } else {
            showToast(result.message || 'Failed to delete expense', 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('An error occurred while deleting the expense', 'error');
    }
}

// ==================== Modals ====================
function setupModals() {
    elements.closeEditModal.addEventListener('click', closeEditModal);
    elements.cancelEdit.addEventListener('click', closeEditModal);
    elements.editModal.querySelector('.modal-overlay').addEventListener('click', closeEditModal);

    elements.closeDeleteModal.addEventListener('click', closeDeleteModal);
    elements.cancelDelete.addEventListener('click', closeDeleteModal);
    elements.confirmDelete.addEventListener('click', deleteExpense);
    elements.deleteModal.querySelector('.modal-overlay').addEventListener('click', closeDeleteModal);
}

// ==================== Analytics ====================
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/summary`);
        const result = await response.json();

        if (result.success) {
            const { expensesByCategory, monthlyTrends } = result.data;

            updateAnalyticsPieChart(expensesByCategory);
            updateAnalyticsBarChart(monthlyTrends);
            updateTopCategories(expensesByCategory);
            updateAverageStats(expensesByCategory, monthlyTrends);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics data', 'error');
    }
}

function updateAnalyticsPieChart(data) {
    const ctx = elements.analyticsPieChart.getContext('2d');

    if (analyticsPieChart) analyticsPieChart.destroy();

    const labels = data.map(item => item._id);
    const values = data.map(item => item.total);
    const colors = labels.map(label => categoryColors[label] || categoryColors.Others);

    analyticsPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 8 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 15 } } }
        }
    });
}

function updateAnalyticsBarChart(data) {
    const ctx = elements.analyticsBarChart.getContext('2d');

    if (analyticsBarChart) analyticsBarChart.destroy();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = data.map(item => `${months[item._id.month - 1]} ${item._id.year}`);
    const values = data.map(item => item.total);

    analyticsBarChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: values,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { callback: (value) => '$' + value } } }
        }
    });
}

function updateTopCategories(data) {
    const container = document.getElementById('topCategories');
    const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 5);

    container.innerHTML = sorted.map(item => `
    <div class="category-item">
      <div class="category-color" style="background: ${categoryColors[item._id] || categoryColors.Others}"></div>
      <div class="category-info">
        <div class="category-name">${item._id}</div>
        <div class="category-amount">${formatCurrency(item.total)}</div>
      </div>
    </div>
  `).join('');
}

function updateAverageStats(categoryData, monthlyData) {
    const container = document.getElementById('averageStats');

    const totalExpenses = categoryData.reduce((sum, item) => sum + item.total, 0);
    const totalTransactions = categoryData.reduce((sum, item) => sum + item.count, 0);
    const avgPerTransaction = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;
    const avgPerMonth = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;

    container.innerHTML = `
    <div class="stat-item">
      <div class="stat-value">${formatCurrency(avgPerTransaction)}</div>
      <div class="stat-label">Avg per Transaction</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${formatCurrency(avgPerMonth)}</div>
      <div class="stat-label">Avg per Month</div>
    </div>
  `;
}

// ==================== Utility Functions ====================
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== Toast Notifications ====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconPath = type === 'success'
        ? 'M20 6L9 17l-5-5'
        : type === 'error'
            ? 'M18 6L6 18M6 6l12 12'
            : 'M12 9v2m0 4h.01';

    toast.innerHTML = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="${iconPath}"/>
    </svg>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== Make functions globally available ====================
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
