// Bottom Navigation Component
class VendraBottomNav {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    async init() {
        await this.loadBottomNav();
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

    async loadBottomNav() {
        try {
            // Check if bottom nav already exists
            if (document.querySelector('.bottom-nav')) {
                console.log('Bottom nav already exists, skipping load');
                return;
            }

            const response = await fetch('/views/components/bottom-nav.html');
            if (!response.ok) {
                throw new Error(`Failed to load bottom nav: ${response.status}`);
            }
            
            const bottomNavHTML = await response.text();
            
            // Insert bottom nav at end of body
            const bottomNavContainer = document.createElement('div');
            bottomNavContainer.innerHTML = bottomNavHTML;
            
            // Insert all bottom nav elements
            while (bottomNavContainer.firstChild) {
                document.body.appendChild(bottomNavContainer.firstChild);
            }

            console.log('Bottom nav loaded successfully');

        } catch (error) {
            console.error('Error loading bottom nav:', error);
        }
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
            
            // Add touch feedback
            item.addEventListener('touchstart', () => {
                item.style.transform = 'scale(0.95)';
            });
            
            item.addEventListener('touchend', () => {
                setTimeout(() => {
                    item.style.transform = '';
                }, 100);
            });
        });
    }

    handleNavigation(e) {
        const item = e.currentTarget;
        const href = item.getAttribute('href');
        const page = item.getAttribute('data-page');

        console.log('Bottom nav clicked:', { href, page });

        // If it's a real URL, let it navigate normally
        if (href && href !== '#' && href !== '') {
            // Don't prevent default, let browser handle navigation
            return;
        }

        // Handle internal page navigation
        if (page) {
            e.preventDefault();
            this.navigateToPage(page);
        }
    }

    navigateToPage(page) {
        // Handle internal page navigation
        switch (page) {
            case 'dashboard':
                if (window.location.pathname !== '/dashboard') {
                    window.location.assign('/dashboard');
                }
                break;
            case 'statistics':
                if (window.location.pathname !== '/statistics') {
                    window.location.assign('/statistics');
                }
                break;
            case 'ai-analytics':
                if (window.location.pathname !== '/ai-analytics') {
                    window.location.assign('/ai-analytics');
                }
                break;
            case 'import-data':
                if (window.location.pathname !== '/import-data') {
                    window.location.assign('/import-data');
                }
                break;
            case 'data-templates':
                if (window.location.pathname !== '/csv-templates') {
                    window.location.assign('/csv-templates');
                }
                break;
            default:
                console.log('Navigate to:', page);
        }
    }

    setActiveNavigation() {
        // Remove all active states
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Set active state based on current page
        const activeItem = document.querySelector(`.bottom-nav-item[data-page="${this.currentPage}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            console.log('Set active bottom nav item:', this.currentPage);
        }
    }

    updateActiveState(page) {
        this.currentPage = page;
        this.setActiveNavigation();
    }

    // Method to refresh bottom nav state
    refreshBottomNav() {
        this.currentPage = this.getCurrentPage();
        this.setActiveNavigation();
    }

    // Method to show/hide bottom nav
    show() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'block';
        }
    }

    hide() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }
    }

    // Method to add badge to nav item
    addBadge(page, text) {
        const item = document.querySelector(`.bottom-nav-item[data-page="${page}"] .bottom-nav-icon`);
        if (item) {
            let badge = item.querySelector('.bottom-nav-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'bottom-nav-badge';
                item.appendChild(badge);
            }
            badge.textContent = text;
        }
    }

    // Method to remove badge from nav item
    removeBadge(page) {
        const badge = document.querySelector(`.bottom-nav-item[data-page="${page}"] .bottom-nav-badge`);
        if (badge) {
            badge.remove();
        }
    }
}

// Auto-initialize on mobile devices
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768 && !window.vendraBottomNav) {
        console.log('Initializing bottom navigation for mobile');
        window.vendraBottomNav = new VendraBottomNav();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        // Mobile - ensure bottom nav is loaded
        if (!window.vendraBottomNav) {
            window.vendraBottomNav = new VendraBottomNav();
        } else {
            window.vendraBottomNav.show();
        }
    } else {
        // Desktop - hide bottom nav
        if (window.vendraBottomNav) {
            window.vendraBottomNav.hide();
        }
    }
});
