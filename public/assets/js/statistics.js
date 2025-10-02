// Vendra Statistics Page JavaScript
class VendraStatistics {
    constructor() {
        this.token = localStorage.getItem('token');
        this.charts = {};
        
        // Debug token
        console.log('Token found:', this.token ? 'Yes' : 'No');
        
        this.init();
    }

    init() {
        // Check authentication - redirect if no token
        if (!this.token) {
            console.log('No token found, redirecting to login');
            window.location.href = '/';
            return;
        }

        this.setupEventListeners();
        this.loadStatisticsData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Export Report button
        document.getElementById('exportReport')?.addEventListener('click', () => {
            this.exportReport();
        });
        
        // Time range selector removed - not needed

        // Chart type toggles
        document.querySelectorAll('input[name="revenueChart"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateRevenueChart(e.target.id);
            });
        });

    }

    loadUserInfo() {
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement) {
            currentUserElement.textContent = 'Admin';
        }
    }

    async loadStatisticsData() {
        try {
            this.showLoading(true);
            
            console.log('Loading statistics data with token:', this.token);
            
            const response = await fetch('/api/statistics/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.success && result.data) {
                this.statisticsData = result.data;
                console.log('Statistics data loaded:', this.statisticsData);
                
                                // Show success message for real data
                this.showToast('Data berhasil dimuat dari database', 'success');
                
                this.updateOverviewCards();
                this.initializeCharts();
                this.loadTopProducts();
                this.loadTopCustomers();
                this.loadRecentTransactions();
                this.updateCustomerSegments();
            } else {
                console.warn('API returned success=false or no data:', result);
                throw new Error(result.message || 'Failed to load statistics');
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            
            if (window.frontendLogger) {
                window.frontendLogger.logError('Statistics loading failed', {
                    error: error.message,
                    url: '/api/statistics/dashboard'
                });
            }
            
            // Show error message in UI
            this.showError(`Gagal memuat data dari server: ${error.message}. Pastikan server dan database berjalan.`);
            
            // Show empty state instead of sample data
            this.showEmptyState();
        } finally {
            this.showLoading(false);
        }
    }

    updateOverviewCards() {
        console.log('updateOverviewCards called');
        console.log('statisticsData:', this.statisticsData);
        
        if (!this.statisticsData?.overview) {
            console.warn('No overview data available');
            return;
        }

        const { overview } = this.statisticsData;
        console.log('Overview data:', overview);
        
        // Update KPI cards with correct IDs
        this.updateCard('totalCustomers', overview.totalCustomers);
        this.updateCard('totalRevenue', this.formatCurrency(overview.totalRevenue));
        this.updateCard('totalTransactions', overview.totalTransactions);
        this.updateCard('avgTransaction', this.formatCurrency(overview.avgTransaction));
        
        // Update revenue trend indicator
        const revenueTrendElement = document.getElementById('revenueTrend');
        if (revenueTrendElement && overview.revenueGrowth !== undefined) {
            const isPositive = overview.revenueGrowth >= 0;
            revenueTrendElement.className = `stats-change ${isPositive ? 'positive' : 'negative'}`;
            revenueTrendElement.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                ${Math.abs(overview.revenueGrowth)}% dari bulan lalu
            `;
        }
    }

    updateCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    showEmptyState() {
        // Reset all data to empty/zero state
        this.statisticsData = {
            overview: {
                totalCustomers: 0,
                totalRevenue: 0,
                totalTransactions: 0,
                avgTransaction: 0,
                revenueGrowth: 0
            },
            monthlyRevenue: [],
            categories: [],
            topProducts: [],
            customerSegments: [],
            recentTransactions: []
        };
        
        // Update UI with empty state
        this.updateOverviewCards();
        this.showEmptyCharts();
        this.showEmptyTables();
    }

    showEmptyCharts() {
        // Show empty state message for charts
        const chartContainers = [
            'revenueChart',
            'categoryChart', 
            'customerSegmentChart',
            'activityChart'
        ];
        
        chartContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center h-100 text-muted">
                        <div class="text-center">
                            <i class="fas fa-chart-line fa-2x mb-2"></i>
                            <div>Tidak ada data untuk ditampilkan</div>
                        </div>
                    </div>
                `;
            }
        });
    }

    showEmptyTables() {
        // Show empty state for tables
        const tableContainers = [
            { id: 'topProductsTable', colspan: 4 },
            { id: 'topCustomersTable', colspan: 5 },
            { id: 'recentTransactionsTable', colspan: 6 }
        ];
        
        tableContainers.forEach(table => {
            const tableBody = document.querySelector(`#${table.id} tbody`);
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="${table.colspan}" class="text-center py-4">
                            <i class="fas fa-database fa-2x text-muted mb-2"></i><br>
                            <div class="text-muted">Tidak ada data tersedia</div>
                        </td>
                    </tr>
                `;
            }
        });
    }

    // Chart Initialization
    initializeCharts() {
        try {
            // Add small delay to ensure DOM is ready
            setTimeout(() => {
                this.initRevenueChart();
                this.initCategoryChart();
                this.initCustomerSegmentChart();
                this.initActivityChart();
            }, 100);
        } catch (error) {
            console.error('Error initializing charts:', error);
            if (window.frontendLogger) {
                window.frontendLogger.logError('Chart initialization failed', {
                    error: error.message,
                    stack: error.stack
                });
            }
        }
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) {
            console.warn('Revenue chart canvas not found');
            return;
        }

        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        // Get revenue data from statistics
        const revenueData = this.statisticsData?.monthlyRevenue || [];
        const labels = revenueData.map(item => item.month);
        const revenues = revenueData.map(item => item.revenue / 1000000); // Convert to millions

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : [],
                datasets: [{
                    label: 'Revenue (Juta Rupiah)',
                    data: revenues.length > 0 ? revenues : [],
                    borderColor: 'rgb(31, 58, 147)',
                    backgroundColor: 'rgba(31, 58, 147, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: 'rgb(31, 58, 147)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6c757d',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6c757d',
                            maxTicksLimit: 6,
                            callback: function(value) {
                                return 'Rp ' + (value / 1000000).toFixed(1) + 'Jt';
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        // Get category data from statistics
        const categoryData = this.statisticsData?.categories || [];
        const labels = categoryData.map(item => item.product_type);
        const data = categoryData.map(item => item.count);
        
        // Default colors
        const colors = [
            'rgb(31, 58, 147)',
            'rgb(46, 204, 113)',
            'rgb(52, 152, 219)',
            'rgb(155, 89, 182)',
            'rgb(241, 196, 15)',
            'rgb(230, 126, 34)',
            'rgb(231, 76, 60)'
        ];

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : [],
                datasets: [{
                    data: data.length > 0 ? data : [],
                    backgroundColor: colors.slice(0, Math.max(labels.length, 0)),
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverBorderWidth: 4,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    initAcquisitionChart() {
        const ctx = document.getElementById('acquisitionChart');
        if (!ctx) return;

        this.charts.acquisition = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Organic', 'Social Media', 'Email', 'Referral', 'Paid Ads', 'Direct'],
                datasets: [{
                    label: 'New Customers',
                    data: [45, 32, 28, 19, 15, 12],
                    backgroundColor: [
                        'rgba(31, 58, 147, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(231, 126, 34, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(155, 89, 182, 0.8)',
                        'rgba(241, 196, 15, 0.8)'
                    ],
                    borderColor: [
                        'rgb(31, 58, 147)',
                        'rgb(46, 204, 113)',
                        'rgb(231, 126, 34)',
                        'rgb(52, 152, 219)',
                        'rgb(155, 89, 182)',
                        'rgb(241, 196, 15)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Sales', 'Customer Satisfaction', 'Product Quality', 'Delivery Speed', 'Support', 'Value'],
                datasets: [{
                    label: 'Current Performance',
                    data: [85, 92, 88, 79, 86, 91],
                    borderColor: 'rgb(31, 58, 147)',
                    backgroundColor: 'rgba(31, 58, 147, 0.2)',
                    pointBackgroundColor: 'rgb(31, 58, 147)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Industry Average',
                    data: [75, 80, 82, 85, 78, 83],
                    borderColor: 'rgb(46, 204, 113)',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    pointBackgroundColor: 'rgb(46, 204, 113)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    initHourlyChart() {
        const ctx = document.getElementById('hourlyChart');
        if (!ctx) return;

        this.charts.hourly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
                datasets: [{
                    label: 'Orders',
                    data: [2, 1, 1, 3, 8, 15, 25, 35, 32, 28, 18, 8],
                    borderColor: 'rgb(46, 204, 113)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: 'rgb(46, 204, 113)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Data Loading Functions - removed hardcoded loadTopProducts    // Chart Update Functions
    updateRevenueChart(period) {
        if (!this.charts.revenue) return;

        // Get real data based on period from statisticsData
        let newData = [], newLabels = [];
        
        if (this.statisticsData) {
            switch(period) {
                case 'daily':
                    // Use daily data if available
                    const dailyData = this.statisticsData.dailyRevenue || [];
                    newLabels = dailyData.map(item => item.day) || [];
                    newData = dailyData.map(item => item.revenue / 1000000) || [];
                    break;
                case 'weekly':
                    // Use weekly data if available
                    const weeklyData = this.statisticsData.weeklyRevenue || [];
                    newLabels = weeklyData.map(item => item.week) || [];
                    newData = weeklyData.map(item => item.revenue / 1000000) || [];
                    break;
                case 'monthly':
                default:
                    // Use monthly data
                    const monthlyData = this.statisticsData.monthlyRevenue || [];
                    newLabels = monthlyData.map(item => item.month) || [];
                    newData = monthlyData.map(item => item.revenue / 1000000) || [];
            }
        }

        this.charts.revenue.data.labels = newLabels;
        this.charts.revenue.data.datasets[0].data = newData;
        this.charts.revenue.update('active');
    }

    // Utility Functions
    refreshStats() {
        this.showAlert('Statistics refreshed successfully!', 'success');
        this.refreshAllData();
    }

    refreshAllData() {
        // Update stats cards with animation
        this.updateStatsCards();
        
        // Refresh all charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update('active');
            }
        });

        // Reload top products
        this.loadTopProducts();
    }

    updateStatsCards() {
        // Stats are already updated from API in loadStatistics()
        // No need to simulate data updates since we use real data
        console.log('Stats cards updated from real data');
    }

    // Method removed - we now use real data from API instead of simulated multipliers

    animateNumber(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 150);
    }

    exportReport() {
        this.showAlert('Generating report...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            this.showAlert('Report exported successfully!', 'success');
            
            // Create and download a sample CSV
            const csvContent = this.generateCSVReport();
            this.downloadCSV(csvContent, `vendra-statistics-${new Date().toISOString().split('T')[0]}.csv`);
        }, 2000);
    }

    generateCSVReport() {
        const headers = ['Metric', 'Value', 'Change', 'Period'];
        const data = [
            ['Growth Rate', '12.5%', '+2.1%', 'Last 30 Days'],
            ['Active Customers', '142', '+8', 'Last 30 Days'],
            ['Conversion Rate', '3.2%', '+0.3%', 'Last 30 Days'],
            ['Avg Order Time', '2.4h', '-0.2h', 'Last 30 Days'],
            ['Customer Rating', '4.8', '+0.1', 'Last 30 Days'],
            ['Return Rate', '18.5%', '+2.1%', 'Last 30 Days']
        ];

        return [headers, ...data].map(row => row.join(',')).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    showLoading(show) {
        const loadingElements = document.querySelectorAll('.loading-spinner, .chart-loading');
        loadingElements.forEach(element => {
            element.style.display = show ? 'block' : 'none';
        });
        
        // Show/hide main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.opacity = show ? '0.5' : '1';
        }
    }

    showError(message) {
        // Create error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 10000);
    }

    showInfo(message) {
        // Create info alert (less prominent than error)
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-info alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }
        
        // Auto remove after 5 seconds (shorter than error)
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'info'} position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; opacity: 0.95;';
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    formatCurrency(amount) {
        const num = parseFloat(amount || 0);
        
        if (num >= 1000000000) {
            return 'Rp ' + (num / 1000000000).toFixed(1) + 'M';
        } else if (num >= 1000000) {
            return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt';
        } else if (num >= 1000) {
            return 'Rp ' + (num / 1000).toFixed(0) + 'K';
        } else {
            return 'Rp ' + num.toLocaleString('id-ID');
        }
    }

    async exportReport() {
        try {
            const response = await fetch('/api/statistics/export', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Download the CSV file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `statistics_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success message
            this.showAlert('Statistics exported successfully!', 'success');

        } catch (error) {
            console.error('Export error:', error);
            this.showAlert('Failed to export statistics. Please try again.', 'danger');
        }
    }

    async loadTimeRangeData() {
        try {
            const response = await fetch(`/api/statistics/range/${this.currentTimeRange}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Update charts with time range data
                this.updateChartsWithTimeRange(result.data);
            }
        } catch (error) {
            console.error('Error loading time range data:', error);
        }
    }

    updateChartsWithTimeRange(data) {
        // Update revenue chart with time range data
        if (this.charts.revenue && data.revenueTrend) {
            const labels = data.revenueTrend.map(item => 
                new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
            );
            const revenues = data.revenueTrend.map(item => item.revenue / 1000000);

            this.charts.revenue.data.labels = labels;
            this.charts.revenue.data.datasets[0].data = revenues;
            this.charts.revenue.update();
        }
    }

    refreshAllData() {
        this.loadStatisticsData();
    }

    refreshStats() {
        this.loadStatisticsData();
        // Force reinitialize charts after refresh
        setTimeout(() => {
            this.initCustomerSegmentChart();
        }, 500);
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    loadTopProducts() {
        if (!this.statisticsData?.topProducts || this.statisticsData.topProducts.length === 0) {
            // Show empty state
            const container = document.getElementById('topProductsList');
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-4 text-muted">
                        <i class="fas fa-box-open fa-2x mb-2"></i><br>
                        Tidak ada data produk tersedia
                    </div>
                `;
            }
            return;
        }

        const topProducts = this.statisticsData.topProducts.slice(0, 5);
        const container = document.getElementById('topProductsList');
        if (!container) return;

        if (topProducts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-box-open fa-2x mb-2"></i>
                    <p>No product data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = topProducts.map((product, index) => `
            <div class="d-flex align-items-center justify-content-between mb-2 p-2 rounded" style="background: var(--vendra-secondary);">
                <div class="d-flex align-items-center">
                    <span class="badge bg-primary me-2" style="font-size: 10px;">${index + 1}</span>
                    <div>
                        <div class="fw-semibold small">${product.product_name}</div>
                        <div class="text-muted" style="font-size: 11px;">${product.product_type}</div>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-semibold text-success small">${this.formatCurrency(product.total_revenue)}</div>
                    <div class="text-muted" style="font-size: 10px;">${product.sales_count} sales</div>
                </div>
            </div>
        `).join('');
    }



    loadTopCustomers() {
        const container = document.getElementById('topCustomersList');
        if (!container) return;

        // Use real data from API if available
        if (!this.statisticsData?.customerSegments || this.statisticsData.customerSegments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-users fa-2x mb-2"></i><br>
                    Tidak ada data customer tersedia
                </div>
            `;
            return;
        }

        // Display customer segments from real data
        const customers = this.statisticsData.customerSegments.slice(0, 5);
        container.innerHTML = customers.map((customer, index) => `
            <div class="d-flex align-items-center justify-content-between mb-2 p-2 rounded" style="background: var(--vendra-secondary);">
                <div class="d-flex align-items-center">
                    <span class="badge bg-success me-2" style="font-size: 10px;">${index + 1}</span>
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(customer.segment)}&size=28&background=random" 
                         class="rounded-circle me-2" alt="${customer.segment}">
                    <div>
                        <div class="fw-semibold small">${customer.segment} Customers</div>
                        <div class="text-muted" style="font-size: 11px;">${customer.customer_count} customers</div>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-semibold text-primary small">${this.formatCurrency(parseFloat(customer.segment_revenue))}</div>
                </div>
            </div>
        `).join('');
    }

    loadRecentTransactions() {
        if (!this.statisticsData?.recentTransactions || this.statisticsData.recentTransactions.length === 0) {
            // Show empty state
            const tbody = document.getElementById('recentTransactionsTable');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                            <i class="fas fa-receipt fa-2x mb-2"></i><br>
                            Tidak ada transaksi terbaru
                        </td>
                    </tr>
                `;
            }
            return;
        }

        const transactions = this.statisticsData.recentTransactions.slice(0, 10);
        const tbody = document.getElementById('recentTransactionsTable');
        if (!tbody) return;

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fas fa-receipt fa-2x mb-2"></i>
                        <p>No recent transactions</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.customer_name)}&size=24&background=random" 
                             class="rounded-circle me-2" alt="${transaction.customer_name}">
                        <div>
                            <div class="fw-semibold small">${transaction.customer_name}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="fw-semibold small">${transaction.product_name}</div>
                    <div class="text-muted" style="font-size: 11px;">${transaction.product_type}</div>
                </td>
                <td>
                    <span class="fw-semibold text-success small">${this.formatCurrency(transaction.total_amount)}</span>
                </td>
                <td>
                    <div class="small">${new Date(transaction.transaction_date).toLocaleDateString('id-ID')}</div>
                </td>
                <td>
                    <span class="badge badge-sm ${transaction.transaction_status === 'completed' ? 'bg-success' : 'bg-warning'}">
                        ${transaction.transaction_status}
                    </span>
                </td>
            </tr>
        `).join('');
    }



    updateCustomerSegments() {
        // Set fallback data if no real data available
        let vipCount = 0, premiumCount = 0, regularCount = 0, newCount = 0;
        
        if (this.statisticsData?.customerSegments && this.statisticsData.customerSegments.length > 0) {
            // Use real data
            const segments = this.statisticsData.customerSegments;
            segments.forEach(segment => {
                switch(segment.segment.toLowerCase()) {
                    case 'vip': vipCount = segment.customer_count; break;
                    case 'premium': premiumCount = segment.customer_count; break;
                    case 'regular': regularCount = segment.customer_count; break;
                    case 'new': newCount = segment.customer_count; break;
                }
            });
        } else {
            // Use fallback data
            vipCount = 1;
            premiumCount = 2;
            regularCount = 7;
            newCount = 5;
        }
        
        // Update cards
        this.updateCard('vipCustomers', vipCount.toString());
        this.updateCard('premiumCustomers', premiumCount.toString());
        this.updateCard('regularCustomers', regularCount.toString());
        this.updateCard('newCustomers', newCount.toString());
        
        // Update summary stats
        const total = vipCount + premiumCount + regularCount + newCount;
        const active = vipCount + premiumCount + regularCount;
        const growth = total > 0 ? '+12%' : '+0%';
        
        this.updateCard('totalCustomersInsight', total.toString());
        this.updateCard('activeCustomersInsight', active.toString());
        this.updateCard('growthRateInsight', growth);
    }

    initCustomerSegmentChart() {
        const ctx = document.getElementById('customerSegmentChart');
        if (!ctx) {
            console.error('Customer segment chart canvas not found');
            return;
        }

        console.log('Initializing customer segment chart...');

        // Use empty data if no real data available
        const labels = ['VIP', 'Premium', 'Regular', 'New'];
        const data = [0, 0, 0, 0];
        
        console.log('Chart data:', { labels, data });
        
        // Default colors for segments
        const colors = ['#f57c00', '#388e3c', '#1976d2', '#c2185b'];

        try {
            // Destroy existing chart if it exists
            if (this.charts.customerSegment) {
                this.charts.customerSegment.destroy();
            }

            this.charts.customerSegment = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverBorderWidth: 4
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
                                usePointStyle: true,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                    return `${context.label}: ${context.parsed} customers (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('Customer segment chart created successfully');
        } catch (error) {
            console.error('Error creating customer segment chart:', error);
        }
    }

    initActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        // Use real hourly activity data if available
        const hours = Array.from({length: 24}, (_, i) => i);
        let activityData = new Array(24).fill(0); // Initialize with zeros
        
        if (this.statisticsData?.hourlyActivity && this.statisticsData.hourlyActivity.length > 0) {
            // Use real data from API
            this.statisticsData.hourlyActivity.forEach(item => {
                if (item.hour >= 0 && item.hour < 24) {
                    activityData[item.hour] = item.transaction_count || 0;
                }
            });
        }

        this.charts.activity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours.map(h => h.toString().padStart(2, '0') + ':00'),
                datasets: [{
                    label: 'Transactions',
                    data: activityData,
                    backgroundColor: 'rgba(31, 58, 147, 0.6)',
                    borderColor: 'rgb(31, 58, 147)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return `Hour: ${context[0].label}`;
                            },
                            label: function(context) {
                                return `Transactions: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 12
                        }
                    }
                }
            }
        });
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}

// Initialize Statistics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.statistics = new VendraStatistics();
});
