// Global Sidebar Fix for Vercel Deployment
// This script ensures sidebar persistence across all pages

(function() {
    'use strict';
    
    console.log('Global sidebar fix loaded');
    
    // Function to ensure sidebar exists
    function ensureGlobalSidebar() {
        // Check if we're on a page that should have sidebar
        const needsSidebar = !window.location.pathname.includes('/login');
        
        if (!needsSidebar) {
            return;
        }
        
        // Check if sidebar exists
        const sidebarExists = document.querySelector('.sidebar');
        
        if (!sidebarExists) {
            console.log('Global fix: Sidebar missing, forcing reload...');
            
            // Try to create sidebar if VendraSidebar is available
            if (window.VendraSidebar && !window.vendraSidebar) {
                console.log('Creating new VendraSidebar instance...');
                window.vendraSidebar = new window.VendraSidebar();
            } else if (window.vendraSidebar) {
                console.log('Forcing sidebar reload...');
                window.vendraSidebar.forceReload = true;
                window.vendraSidebar.loadSidebar();
            }
        }
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureGlobalSidebar);
    } else {
        ensureGlobalSidebar();
    }
    
    // Run after window load
    window.addEventListener('load', function() {
        setTimeout(ensureGlobalSidebar, 500);
    });
    
    // Run on window focus (when returning to tab)
    window.addEventListener('focus', function() {
        setTimeout(ensureGlobalSidebar, 200);
    });
    
    // Monitor for navigation changes
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('URL changed, ensuring sidebar...');
            setTimeout(ensureGlobalSidebar, 300);
        }
    }).observe(document, { subtree: true, childList: true });
    
    // Aggressive sidebar monitoring for Vercel
    setInterval(function() {
        const needsSidebar = !window.location.pathname.includes('/login');
        if (needsSidebar && !document.querySelector('.sidebar')) {
            console.log('Aggressive monitoring: Sidebar missing, fixing...');
            ensureGlobalSidebar();
        }
    }, 2000);
    
    // Export function for manual use
    window.ensureGlobalSidebar = ensureGlobalSidebar;
    
})();