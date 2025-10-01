// Vendra CRM - Login Manager
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingAuth();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Enter key handling
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleLogin();
                    }
                });
            }
        });
    }

    async handleLogin() {
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;

        // Validation
        if (!username || !password) {
            this.showAlert('Please enter both username and password.', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Log successful login
                if (window.frontendLogger) {
                    window.frontendLogger.logAuth('login', true);
                }
                
                this.showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                // Log failed login
                if (window.frontendLogger) {
                    window.frontendLogger.logAuth('login', false, new Error(data.message));
                }
                
                this.showAlert(data.message || 'Login failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Log error
            if (window.frontendLogger) {
                window.frontendLogger.logError('Login request failed', {
                    error: error.message,
                    url: '/api/auth/login'
                });
            }
            
            this.showAlert('Network error. Please check your connection and try again.', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    checkExistingAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            // If user already has token, redirect to dashboard
            window.location.href = '/dashboard';
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const submitBtn = document.querySelector('.btn-login');
        const btnText = document.querySelector('.btn-text');
        const btnIcon = document.querySelector('.btn-icon');

        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }

        if (submitBtn) {
            submitBtn.disabled = show;
        }

        if (btnText) {
            btnText.textContent = show ? 'Logging in...' : 'Masuk ke Dashboard';
        }

        if (btnIcon) {
            btnIcon.className = show ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right';
        }
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'danger' ? 'exclamation-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        alertDiv.innerHTML = `
            <i class="fas fa-${icon} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert before form
        const form = document.getElementById('loginForm');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(alertDiv, form);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Demo account helper
    fillDemoAccount() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) usernameInput.value = 'admin';
        if (passwordInput) passwordInput.value = 'admin123';
        
        this.showAlert('Demo credentials filled. Click login to continue.', 'info');
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
    
    // Add demo account button functionality if exists
    const demoBtn = document.querySelector('.demo-account');
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.loginManager.fillDemoAccount();
        });
    }
});
