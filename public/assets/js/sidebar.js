// Vendra Sidebar Component
class VendraSidebar {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    async init() {
        await this.loadSidebar();
        this.setupEventListeners();
        this.setActiveNavigation();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('/statistics')) return 'statistics';
        if (path.includes('/ai-analytics')) return 'ai-analytics';
        if (path.includes('/import-data')) return 'import-data';
        if (path.includes('/csv-templates')) return 'data-templates';
        if (path.includes('/dashboard')) return 'dashboard';
        return 'dashboard'; // default
    }

    async loadSidebar() {
        try {
            // Check if sidebar already exists
            if (document.querySelector('.sidebar')) {
                console.log('Sidebar already exists, skipping load');
                return;
            }

            const response = await fetch('/views/components/sidebar.html');
            if (!response.ok) {
                throw new Error(`Failed to load sidebar: ${response.status}`);
            }
            
            const sidebarHTML = await response.text();
            
            // Find insertion point - after navbar or at body start
            let insertionPoint = document.querySelector('#navbar-container');
            if (!insertionPoint) {
                insertionPoint = document.querySelector('.navbar')?.parentNode;
            }
            if (!insertionPoint) {
                insertionPoint = document.body;
            }

            // Create container for sidebar
            const sidebarContainer = document.createElement('div');
            sidebarContainer.innerHTML = sidebarHTML;
            
            // Insert all sidebar elements
            while (sidebarContainer.firstChild) {
                insertionPoint.appendChild(sidebarContainer.firstChild);
            }

            console.log('Sidebar loaded successfully');
            // Don't setup event listeners here to avoid duplicates
            // They will be set up in init() method

        } catch (error) {
            console.error('Error loading sidebar:', error);
            // Retry after 1 second
            setTimeout(() => {
                this.loadSidebar();
            }, 1000);
        }
    }

    // Method to ensure sidebar is always present
    ensureSidebar() {
        if (!document.querySelector('.sidebar')) {
            console.log('Sidebar missing, reloading...');
            this.loadSidebar();
        }
    }

    // Method to refresh sidebar state
    refreshSidebar() {
        this.currentPage = this.getCurrentPage();
        this.setActiveNavigation();
        this.ensureSidebar();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileSidebar = document.getElementById('mobileSidebar');
        const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
        const mobileSidebarClose = document.getElementById('mobileSidebarClose');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.showMobileSidebar());
        }

        if (mobileSidebarClose) {
            mobileSidebarClose.addEventListener('click', () => this.hideMobileSidebar());
        }

        if (mobileSidebarOverlay) {
            mobileSidebarOverlay.addEventListener('click', () => this.hideMobileSidebar());
        }

        // Navigation links
        document.querySelectorAll('.sidebar-nav-link, .mobile-sidebar-nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Logout handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sidebarLogout, #mobileLogout')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    showMobileSidebar() {
        const mobileSidebar = document.getElementById('mobileSidebar');
        const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
        
        if (mobileSidebarOverlay) {
            mobileSidebarOverlay.style.display = 'block';
            setTimeout(() => {
                mobileSidebarOverlay.classList.add('show');
                mobileSidebar?.classList.add('show');
            }, 10);
        }
    }

    hideMobileSidebar() {
        const mobileSidebar = document.getElementById('mobileSidebar');
        const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
        
        if (mobileSidebarOverlay) {
            mobileSidebarOverlay.classList.remove('show');
            mobileSidebar?.classList.remove('show');
            setTimeout(() => {
                mobileSidebarOverlay.style.display = 'none';
            }, 300);
        }
    }

    toggleMobileSidebar() {
        const mobileSidebar = document.getElementById('mobileSidebar');
        const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
        
        if (mobileSidebarOverlay && mobileSidebarOverlay.classList.contains('show')) {
            this.hideMobileSidebar();
        } else {
            this.showMobileSidebar();
        }
    }

    handleNavigation(e) {
        const link = e.target.closest('.sidebar-nav-link, .mobile-sidebar-nav-link');
        const href = link?.getAttribute('href');
        const page = link?.getAttribute('data-page');

        // If it's a real URL, let it navigate normally
        if (href && href !== '#') {
            this.hideMobileSidebar();
            return;
        }

        // Handle internal page navigation
        if (page) {
            e.preventDefault();
            this.navigateToPage(page);
            this.hideMobileSidebar();
        }
    }

    navigateToPage(page) {
        // Handle internal page navigation based on current context
        switch (page) {
            case 'dashboard':
                if (window.location.pathname !== '/dashboard') {
                    window.location.href = '/dashboard';
                }
                break;
            case 'statistics':
                if (window.location.pathname !== '/statistics') {
                    window.location.href = '/statistics';
                }
                break;
            case 'ai-analytics':
                if (window.location.pathname !== '/ai-analytics') {
                    window.location.href = '/ai-analytics';
                }
                break;
            case 'import-data':
                if (window.location.pathname !== '/import-data') {
                    window.location.href = '/import-data';
                }
                break;
            case 'data-templates':
                if (window.location.pathname !== '/csv-templates') {
                    window.location.href = '/csv-templates';
                }
                break;
            default:
                console.log('Navigate to:', page);
        }
    }

    setActiveNavigation() {
        // Remove all active states
        document.querySelectorAll('.sidebar-nav-link, .mobile-sidebar-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Set active state based on current page
        const activeSelectors = [
            `.sidebar-nav-link[data-page="${this.currentPage}"]`,
            `.mobile-sidebar-nav-link[data-page="${this.currentPage}"]`
        ];

        activeSelectors.forEach(selector => {
            const activeLink = document.querySelector(selector);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        });
    }

    showImportDataSection() {
        if (typeof window.showImportDataSection === 'function') {
            window.showImportDataSection();
        } else {
            this.showToast('Import Data', 'Feature available in dashboard! You can upload CSV files here.', 'info');
        }
    }

    showTemplatesSection() {
        if (typeof window.showTemplatesSection === 'function') {
            window.showTemplatesSection();
        } else {
            this.showToast('CSV Templates', 'Feature available in dashboard! Download sample CSV templates here.', 'info');
        }
    }

    showAIAnalyticsSection() {
        if (typeof window.showAIAnalyticsSection === 'function') {
            window.showAIAnalyticsSection();
        } else {
            this.showAIAnalyticsModal();
        }
    }

    showAIAnalyticsModal() {
        // Create AI Analytics modal
        const modalHTML = `
            <div class="modal fade" id="aiAnalyticsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-robot me-2"></i>AI Analytics Dashboard
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <div class="card border-primary">
                                        <div class="card-body text-center">
                                            <i class="fas fa-brain fa-3x text-primary mb-3"></i>
                                            <h6>Smart Insights</h6>
                                            <p class="text-muted small">AI-powered customer behavior analysis and predictions</p>
                                            <button class="btn btn-outline-primary btn-sm" onclick="window.vendraSidebar.showToast('Smart Insights', 'AI analysis coming soon!', 'info')">
                                                Analyze Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border-success">
                                        <div class="card-body text-center">
                                            <i class="fas fa-chart-network fa-3x text-success mb-3"></i>
                                            <h6>Predictive Analytics</h6>
                                            <p class="text-muted small">Forecast sales trends and customer lifetime value</p>
                                            <button class="btn btn-outline-success btn-sm" onclick="window.vendraSidebar.showToast('Predictive Analytics', 'ML models in development!', 'success')">
                                                Generate Forecast
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border-warning">
                                        <div class="card-body text-center">
                                            <i class="fas fa-user-cog fa-3x text-warning mb-3"></i>
                                            <h6>Customer Segmentation</h6>
                                            <p class="text-muted small">Automatic customer grouping based on behavior patterns</p>
                                            <button class="btn btn-outline-warning btn-sm" onclick="window.vendraSidebar.showToast('Customer Segmentation', 'AI segmentation ready soon!', 'warning')">
                                                Segment Customers
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border-info">
                                        <div class="card-body text-center">
                                            <i class="fas fa-lightbulb fa-3x text-info mb-3"></i>
                                            <h6>Recommendations</h6>
                                            <p class="text-muted small">AI-driven product and marketing recommendations</p>
                                            <button class="btn btn-outline-info btn-sm" onclick="window.vendraSidebar.showToast('AI Recommendations', 'Smart recommendations coming!', 'info')">
                                                Get Recommendations
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="alert alert-info mt-4">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Coming Soon!</strong> Advanced AI analytics features are currently in development. 
                                Stay tuned for powerful machine learning insights!
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.vendraSidebar.showToast('AI Analytics', 'Thank you for your interest! We will notify you when AI features are ready.', 'success')">
                                <i class="fas fa-bell me-1"></i>Notify Me
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('aiAnalyticsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('aiAnalyticsModal'));
        modal.show();

        // Remove modal from DOM when hidden
        document.getElementById('aiAnalyticsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    showToast(title, message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 90px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            <strong>${title}</strong><br>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    // Method to update active state from external calls
    updateActiveState(page) {
        this.currentPage = page;
        this.setActiveNavigation();
    }

    // Handle logout functionality
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear user data
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            
            // Show logout message
            this.showToast('Logged out successfully', 'success');
            
            // Redirect to login after short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'info'} position-fixed`;
        toast.style.cssText = 'top: 90px; right: 20px; z-index: 9999; min-width: 300px; opacity: 0.95;';
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
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (!window.vendraSidebar) {
        window.vendraSidebar = new VendraSidebar();
    }
});

// Ensure sidebar persists on page changes
window.addEventListener('load', function() {
    if (window.vendraSidebar) {
        window.vendraSidebar.refreshSidebar();
    }
});

// Check sidebar periodically
setInterval(() => {
    if (window.vendraSidebar) {
        window.vendraSidebar.ensureSidebar();
    }
}, 2000);

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.vendraSidebar) {
        setTimeout(() => {
            window.vendraSidebar.refreshSidebar();
        }, 100);
    }
});

// Export for use in other scripts
window.VendraSidebar = VendraSidebar;
