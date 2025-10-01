// Business CRM Suite - Dashboard JavaScript
class Dashboard {
    constructor() {
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        // Check authentication
        if (!this.token) {
            window.location.href = '/';
            return;
        }

        this.setupEventListeners();
        this.loadUserInfo();
        
        // Load real data from API
        this.loadTransactions();
    }

    setupEventListeners() {
        // Initialize page navigation
        this.initPageNavigation();
        
        // Mobile navigation
        this.initMobileNavigation();
        
        // Refresh button
        this.setupRefreshButton();
        
        // File upload functionality
        this.setupFileUpload();
        
        // Download template buttons
        this.setupTemplateDownloads();
    }

    initPageNavigation() {
        // Logout functionality
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Page navigation
        document.querySelectorAll('.sidebar-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.getAttribute('data-page');
                const href = link.getAttribute('href');
                
                console.log('Sidebar link clicked:', { page, href });
                
                // Log user action
                if (window.frontendLogger) {
                    window.frontendLogger.logUserAction('sidebar_navigation', link, {
                        page,
                        href,
                        text: link.textContent.trim()
                    });
                }
                
                // Only prevent default for internal page navigation (data-page)
                if (page) {
                    e.preventDefault();
                    this.showPage(page);
                    this.setActiveNavLink(link);
                } else if (href && href.startsWith('/') && href !== '/dashboard') {
                    // Allow normal navigation for other routes like /statistics, /logs
                    console.log('Allowing normal navigation to:', href);
                    // Don't prevent default, let browser handle navigation
                    return;
                } else if (href === '#') {
                    // Prevent default for placeholder links
                    e.preventDefault();
                    console.log('Prevented default for placeholder link');
                }
            });
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    setActiveNavLink(activeLink) {
        // Remove active class from all links
        document.querySelectorAll('.sidebar-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    initMobileNavigation() {
        // Mobile navigation items
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                const href = item.getAttribute('href');
                
                console.log('Mobile nav clicked:', { page, href });
                
                // Log user action
                if (window.frontendLogger) {
                    window.frontendLogger.logUserAction('mobile_navigation', item, {
                        page,
                        href,
                        text: item.textContent.trim()
                    });
                }
                
                // Handle internal page navigation
                if (page && href === '#') {
                    e.preventDefault();
                    this.showPage(page);
                    this.setActiveMobileNavItem(item);
                } else if (href && href.startsWith('/') && href !== window.location.pathname) {
                    // Allow normal navigation for different routes
                    return;
                } else if (href === '#') {
                    e.preventDefault();
                }
            });
        });

        // Mobile profile button
        document.getElementById('mobileProfileBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showMobileProfileMenu();
        });

        // Update active state based on current page
        this.updateMobileNavActiveState();
    }

    setActiveMobileNavItem(activeItem) {
        // Remove active class from all mobile nav items
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        activeItem.classList.add('active');
    }

    updateMobileNavActiveState() {
        const currentPath = window.location.pathname;
        
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            const href = item.getAttribute('href');
            
            if (href === currentPath || 
                (currentPath === '/dashboard' && href === '/dashboard') ||
                (currentPath === '/statistics' && href === '/statistics')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    showMobileProfileMenu() {
        // Create mobile profile modal or dropdown
        const existingModal = document.getElementById('mobileProfileModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'mobileProfileModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-bottom">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title">Profile Menu</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex align-items-center mb-3">
                            <img src="https://ui-avatars.com/api/?name=Admin&size=48&background=2ECC71&color=fff" 
                                 class="rounded-circle me-3" alt="Profile">
                            <div>
                                <div class="fw-semibold">Admin</div>
                                <div class="text-muted small">Administrator</div>
                            </div>
                        </div>
                        <div class="list-group list-group-flush">
                            <a href="#" class="list-group-item list-group-item-action">
                                <i class="fas fa-user me-2"></i> My Profile
                            </a>
                            <a href="#" class="list-group-item list-group-item-action">
                                <i class="fas fa-cog me-2"></i> Settings
                            </a>
                            <a href="#" class="list-group-item list-group-item-action">
                                <i class="fas fa-question-circle me-2"></i> Help & Support
                            </a>
                            <a href="#" class="list-group-item list-group-item-action text-danger" onclick="window.dashboardInstance.logout()">
                                <i class="fas fa-sign-out-alt me-2"></i> Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Remove modal after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    setupRefreshButton() {
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            // Log user action
            if (window.frontendLogger) {
                window.frontendLogger.logUserAction('refresh_data', 'refresh_button');
            }
            this.loadTransactions();
        });
    }

    setupFileUpload() {
        const csvFile = document.getElementById('csvFile');
        const uploadArea = document.getElementById('uploadArea');
        const browseFile = document.getElementById('browseFile');

        if (browseFile) {
            browseFile.addEventListener('click', (e) => {
                e.preventDefault();
                csvFile?.click();
            });
        }

        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                csvFile?.click();
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
        }

        if (csvFile) {
            csvFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }
    }

    setupTemplateDownloads() {
        document.getElementById('downloadTemplate')?.addEventListener('click', () => {
            this.downloadCustomerTemplate();
        });
    }

    loadUserInfo() {
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement) {
            currentUserElement.textContent = 'Admin';
        }
    }

    async loadTransactions() {
        try {
            const response = await fetch('/api/statistics/dashboard', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Statistics API returns data structure with nested data object
                const transactions = data.data.recentTransactions || [];
                this.displayTransactions(transactions);
                this.updateDashboardStatsFromAPI(data.data.overview);
                
                // Show toast notification for successful data load
                this.showToast('Data berhasil dimuat dari database', 'success');
            } else {
                throw new Error(data.message || 'Failed to load transactions');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            // Show error message instead of sample data
            this.showLoadingError('Gagal memuat data dari server. Pastikan server berjalan dan database terhubung.');
            this.showToast('Gagal memuat data dari backend', 'danger');
        }
    }





    updateDashboardStatsFromAPI(overview) {
        // Update dashboard stats from statistics API response (overview object)
        const totalCustomersEl = document.getElementById('totalCustomers');
        if (totalCustomersEl) {
            totalCustomersEl.textContent = overview.totalCustomers || 0;
        }

        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) {
            totalRevenueEl.textContent = this.formatCurrency(parseFloat(overview.totalRevenue) || 0);
        }

        const totalTransactionsEl = document.getElementById('totalTransactions');
        if (totalTransactionsEl) {
            totalTransactionsEl.textContent = overview.totalTransactions || 0;
        }

        const avgTransactionEl = document.getElementById('avgTransaction');
        if (avgTransactionEl) {
            avgTransactionEl.textContent = this.formatCurrency(parseFloat(overview.avgTransaction) || 0);
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'info'} position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
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

    showLoadingError(message) {
        // Clear dashboard stats with 0 values
        const totalCustomersEl = document.getElementById('totalCustomers');
        if (totalCustomersEl) totalCustomersEl.textContent = '0';
        
        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) totalRevenueEl.textContent = 'Rp 0';
        
        const totalTransactionsEl = document.getElementById('totalTransactions');
        if (totalTransactionsEl) totalTransactionsEl.textContent = '0';
        
        const avgTransactionEl = document.getElementById('avgTransaction');
        if (avgTransactionEl) avgTransactionEl.textContent = 'Rp 0';

        // Show error in transactions table
        const tbody = document.getElementById('transactionsTable');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i><br>
                        <div class="fw-bold text-danger mb-2">Gagal Memuat Data</div>
                        <div class="text-muted">${message}</div>
                        <button class="btn btn-outline-primary btn-sm mt-3" onclick="location.reload()">
                            <i class="fas fa-refresh me-1"></i>Muat Ulang
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    displayTransactions(transactions) {
        const tbody = document.getElementById('transactionsTable');
        if (!tbody) return;

        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <div class="d-flex flex-column align-items-center">
                            <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                            <div class="text-muted fw-semibold">No transactions available</div>
                            <small class="text-muted">Transaction data will appear here when available</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr class="align-middle">
                <td>
                    <div class="d-flex align-items-center">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.customer_name)}&size=40&background=random" 
                             class="rounded-circle me-3" alt="${transaction.customer_name}">
                        <div>
                            <div class="fw-semibold text-dark">${transaction.customer_name}</div>
                            <small class="text-muted">${transaction.customer_email || 'No email'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="fw-semibold text-dark">${transaction.product_name || transaction.product_type}</div>
                    <small class="text-muted">
                        <i class="fas fa-tag me-1"></i>${transaction.product_type}
                        ${transaction.quantity ? ` • Qty: ${transaction.quantity}` : ''}
                    </small>
                </td>
                <td>
                    <div class="fw-bold text-success fs-6">${this.formatCurrencyCompact(transaction.total_amount)}</div>
                </td>
                <td>
                    <div class="fw-semibold text-dark">${this.formatDate(transaction.transaction_date)}</div>
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>${this.formatTime(transaction.transaction_date)}
                    </small>
                </td>
            </tr>
        `).join('');
    }

    async handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            this.showAlert('Please select a CSV file.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('csvFile', file);

        const progressContainer = document.getElementById('uploadProgress');
        const progressBar = progressContainer?.querySelector('.progress-bar');

        if (progressContainer) {
            progressContainer.style.display = 'block';
        }

        try {
            const response = await fetch('/api/import/customer-transactions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            const result = await response.json();

            if (progressContainer) {
                progressContainer.style.display = 'none';
            }

            if (result.success) {
                this.showAlert(`Successfully imported ${result.imported} transactions!`, 'success');
                this.loadTransactions(); // Refresh the data
            } else {
                this.showAlert(result.message || 'Upload failed', 'danger');
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            this.showAlert('Upload failed. Please try again.', 'danger');
        }
    }

    downloadCustomerTemplate() {
        const csvContent = `unique_customer_id,customer_name,customer_email,customer_phone,product_type,product_name,quantity,unit_price,total_amount,transaction_date,payment_method
CUST001,John Doe,john.doe@email.com,+62-811-1234-5678,Electronics,Laptop Gaming,1,8500000,8500000,2024-01-15 10:30:00,credit_card
CUST002,Jane Smith,jane.smith@email.com,+62-812-2345-6789,Fashion,Jam Tangan,1,2500000,2500000,2024-01-15 14:20:00,bank_transfer
CUST003,Bob Wilson,bob.wilson@email.com,+62-813-3456-7890,Home & Living,Smart TV 43 inch,1,3200000,3200000,2024-01-14 09:15:00,credit_card`;
        
        this.downloadCSV(csvContent, 'customer_transactions_template.csv');
    }

    downloadProductTemplate() {
        const csvContent = `product_code,product_name,product_type,description,price,cost,stock_quantity
ELEC001,Laptop Gaming,Electronics,Gaming laptop performance tinggi,8500000,7200000,15
FASH001,Jam Tangan Premium,Fashion,Jam tangan mewah berkualitas,2500000,1800000,25
HOME001,Smart TV 43 inch,Home & Living,Smart TV LED 4K,3200000,2800000,30`;
        
        this.downloadCSV(csvContent, 'products_template.csv');
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

    // Utility functions
    formatCurrency(amount) {
        const num = parseFloat(amount || 0);
        
        // Format untuk angka besar agar tidak overflow
        if (num >= 1000000000) {
            return 'Rp ' + (num / 1000000000).toFixed(1) + 'M'; // Milyar
        } else if (num >= 1000000) {
            return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt'; // Juta
        } else if (num >= 1000) {
            return 'Rp ' + (num / 1000).toFixed(0) + 'K'; // Ribu
        } else {
            return 'Rp ' + num.toLocaleString('id-ID');
        }
    }

    formatCurrencyCompact(amount) {
        const num = parseFloat(amount || 0);
        
        // Format lebih kompak untuk tabel
        if (num >= 1000000) {
            return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt';
        } else if (num >= 1000) {
            return 'Rp ' + (num / 1000).toFixed(0) + 'K';
        } else {
            return 'Rp ' + num.toLocaleString('id-ID');
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID');
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Status functions removed - not needed for database transactions

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer') || this.createAlertContainer();
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    showError(message) {
        const tbody = document.getElementById('transactionsTable');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-danger">
                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>
                        ${message}
                    </td>
                </tr>
            `;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}

// Global functions for template downloads (called from HTML)
function downloadCustomerTemplate() {
    window.dashboardInstance?.downloadCustomerTemplate();
}

function downloadProductTemplate() {
    window.dashboardInstance?.downloadProductTemplate();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardInstance = new Dashboard();
});
