// Vendra CRM Navbar Component
class VendraNavbar {
    constructor() {
        this.currentUser = localStorage.getItem('currentUser') || 'Admin';
        this.notificationCount = 3;
        this.init();
    }

    async init() {
        await this.loadNavbar();
        this.setupEventListeners();
        this.updateUserInfo();
        this.updateNotificationCount();
        
        // Debug: Check if mobile menu toggle exists
        setTimeout(() => {
            const mobileToggle = document.getElementById('mobileMenuToggle');
            console.log('Mobile menu toggle found:', !!mobileToggle);
            if (mobileToggle) {
                console.log('Mobile toggle element:', mobileToggle);
            }
        }, 1000);
    }

    async loadNavbar() {
        try {
            const response = await fetch('/views/components/navbar.html');
            const navbarHTML = await response.text();
            
            // Find navbar placeholder or create one
            let navbarContainer = document.getElementById('navbar-container');
            if (!navbarContainer) {
                // If no container, insert at the beginning of body
                navbarContainer = document.createElement('div');
                navbarContainer.id = 'navbar-container';
                document.body.insertBefore(navbarContainer, document.body.firstChild);
            }
            
            navbarContainer.innerHTML = navbarHTML;
            
            console.log('Navbar component loaded successfully');
        } catch (error) {
            console.error('Error loading navbar component:', error);
        }
    }

    setupEventListeners() {
        // Mobile menu toggle with multiple event types for better mobile support
        document.addEventListener('click', (e) => {
            if (e.target.closest('#mobileMenuToggle')) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu();
            }
        });
        
        // Additional touch event for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('#mobileMenuToggle')) {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        }, { passive: false });

        // Logout functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // Notification click handler
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-btn')) {
                this.handleNotificationClick();
            }
        });

        // Profile dropdown handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-item')) {
                const item = e.target.closest('.dropdown-item');
                const text = item.textContent.trim();
                
                if (text.includes('My Profile')) {
                    this.showProfile();
                } else if (text.includes('Settings')) {
                    this.showSettings();
                } else if (text.includes('Help & Support')) {
                    this.showHelp();
                }
            }
        });
    }

    toggleMobileMenu() {
        console.log('Mobile menu toggle clicked');
        
        // Trigger mobile menu toggle for sidebar
        if (window.vendraSidebar) {
            console.log('Using vendraSidebar.showMobileSidebar()');
            window.vendraSidebar.showMobileSidebar();
        } else {
            console.log('Using fallback mobile sidebar toggle');
            // Fallback: direct DOM manipulation
            const mobileSidebar = document.getElementById('mobileSidebar');
            const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
            
            if (mobileSidebarOverlay && mobileSidebar) {
                mobileSidebarOverlay.style.display = 'block';
                setTimeout(() => {
                    mobileSidebarOverlay.classList.add('show');
                    mobileSidebar.classList.add('show');
                }, 10);
            } else {
                // Last resort: toggle any sidebar
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('mobile-open');
                }
            }
        }
    }

    updateUserInfo() {
        const userElement = document.getElementById('currentUser');
        if (userElement) {
            userElement.textContent = this.currentUser;
        }

        // Update profile image
        const profileImg = document.querySelector('.user-profile img');
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser)}&size=32&background=2ECC71&color=fff`;
            profileImg.alt = this.currentUser;
        }
    }

    updateNotificationCount() {
        const countElement = document.getElementById('notificationCount');
        if (countElement) {
            countElement.textContent = this.notificationCount;
            
            // Hide badge if no notifications
            if (this.notificationCount === 0) {
                countElement.style.display = 'none';
            } else {
                countElement.style.display = 'inline-block';
            }
        }
    }

    handleNotificationClick() {
        // Mark notifications as read
        this.notificationCount = 0;
        this.updateNotificationCount();
        
        console.log('Notifications clicked - marked as read');
    }

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

    showProfile() {
        this.showToast('Profile', 'Profile page coming soon!', 'info');
    }

    showSettings() {
        this.showToast('Settings', 'Settings page coming soon!', 'info');
    }

    showHelp() {
        this.showToast('Help & Support', 'Help documentation coming soon!', 'info');
    }

    // Public methods for external use
    setUser(username) {
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        this.updateUserInfo();
    }

    addNotification(message, type = 'info') {
        this.notificationCount++;
        this.updateNotificationCount();
        
        // Could add notification to dropdown here
        console.log('New notification:', message, type);
    }

    clearNotifications() {
        this.notificationCount = 0;
        this.updateNotificationCount();
    }

    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 90px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            <strong>${title}</strong><br>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (!window.vendraNavbar) {
        window.vendraNavbar = new VendraNavbar();
    }
});

// Export for use in other scripts
window.VendraNavbar = VendraNavbar;
