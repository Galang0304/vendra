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
        this.loadTransactions();
    }

    setupEventListeners() {
        // Initialize page navigation
        this.initPageNavigation();
        
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
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.showPage(page);
                    this.setActiveNavLink(link);
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

    setupRefreshButton() {
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
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
            const response = await fetch('/api/dashboard/transactions', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.displayTransactions(data.transactions);
                this.updateDashboardStats(data.transactions);
            } else {
                throw new Error(data.message || 'Failed to load transactions');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            // Show sample data if API fails
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const sampleTransactions = [
            {
                id: 1,
                unique_customer_id: 'CUST001',
                customer_name: 'Budi Santoso',
                customer_email: 'budi.santoso@email.com',
                customer_phone: '+62-811-1111-1111',
                product_name: 'Laptop Gaming',
                product_type: 'Electronics',
                quantity: 1,
                total_amount: 8500000,
                transaction_date: '2024-01-15 10:30:00',
                transaction_status: 'completed'
            },
            {
                id: 2,
                unique_customer_id: 'CUST002',
                customer_name: 'Sari Dewi',
                customer_email: 'sari.dewi@email.com',
                customer_phone: '+62-812-2222-2222',
                product_name: 'Jam Tangan',
                product_type: 'Fashion',
                quantity: 1,
                total_amount: 2500000,
                transaction_date: '2024-01-15 14:20:00',
                transaction_status: 'completed'
            },
            {
                id: 3,
                unique_customer_id: 'CUST003',
                customer_name: 'Ahmad Rahman',
                customer_email: 'ahmad.rahman@email.com',
                customer_phone: '+62-813-3333-3333',
                product_name: 'Smartphone',
                product_type: 'Electronics',
                quantity: 1,
                total_amount: 4500000,
                transaction_date: '2024-01-14 09:15:00',
                transaction_status: 'completed'
            },
            {
                id: 4,
                unique_customer_id: 'CUST004',
                customer_name: 'Maya Putri',
                customer_email: 'maya.putri@email.com',
                customer_phone: '+62-814-4444-4444',
                product_name: 'Jaket Premium',
                product_type: 'Fashion',
                quantity: 1,
                total_amount: 850000,
                transaction_date: '2024-01-14 16:45:00',
                transaction_status: 'completed'
            },
            {
                id: 5,
                unique_customer_id: 'CUST005',
                customer_name: 'Rizki Pratama',
                customer_email: 'rizki.pratama@email.com',
                customer_phone: '+62-815-5555-5555',
                product_name: 'Buku Bisnis',
                product_type: 'Books',
                quantity: 2,
                total_amount: 250000,
                transaction_date: '2024-01-13 11:30:00',
                transaction_status: 'completed'
            }
        ];

        this.displayTransactions(sampleTransactions);
        this.updateDashboardStats(sampleTransactions);
    }

    updateDashboardStats(transactions) {
        // Update total customers
        const uniqueCustomers = new Set(transactions.map(t => t.unique_customer_id)).size;
        const totalCustomersEl = document.getElementById('totalCustomers');
        if (totalCustomersEl) {
            totalCustomersEl.textContent = uniqueCustomers;
        }

        // Update total revenue
        const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);
        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) {
            totalRevenueEl.textContent = this.formatCurrency(totalRevenue);
        }

        // Update total transactions
        const totalTransactionsEl = document.getElementById('totalTransactions');
        if (totalTransactionsEl) {
            totalTransactionsEl.textContent = transactions.length;
        }

        // Update average transaction
        const avgTransaction = transactions.length > 0 ? totalRevenue / transactions.length : 0;
        const avgTransactionEl = document.getElementById('avgTransaction');
        if (avgTransactionEl) {
            avgTransactionEl.textContent = this.formatCurrency(avgTransaction);
        }
    }

    displayTransactions(transactions) {
        const tbody = document.getElementById('transactionsTable');
        if (!tbody) return;

        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-inbox fa-2x text-muted mb-2"></i><br>
                        No transactions found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>
                    <span class="fw-semibold">${transaction.unique_customer_id}</span>
                </td>
                <td>
                    <div class="fw-semibold">${transaction.customer_name}</div>
                    <div class="small">
                        <div><i class="fas fa-envelope me-1"></i>${transaction.customer_email || 'N/A'}</div>
                        <div><i class="fas fa-phone me-1"></i>${transaction.customer_phone || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <div class="fw-semibold">${transaction.product_name || transaction.product_type}</div>
                    <div class="small text-muted">${transaction.product_type}</div>
                </td>
                <td>
                    <span class="fw-bold text-success">${this.formatCurrencyCompact(transaction.total_amount)}</span>
                    <div class="small text-muted">Qty: ${transaction.quantity}</div>
                </td>
                <td>
                    <div>${this.formatDate(transaction.transaction_date)}</div>
                    <div class="small text-muted">${this.formatTime(transaction.transaction_date)}</div>
                </td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(transaction.transaction_status)}">
                        ${this.getStatusText(transaction.transaction_status)}
                    </span>
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

    getStatusBadgeClass(status) {
        switch (status) {
            case 'completed': return 'bg-success';
            case 'pending': return 'bg-warning';
            case 'cancelled': return 'bg-danger';
            case 'refunded': return 'bg-info';
            default: return 'bg-secondary';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'completed': return 'Completed';
            case 'pending': return 'Pending';
            case 'cancelled': return 'Cancelled';
            case 'refunded': return 'Refunded';
            default: return 'Unknown';
        }
    }

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
