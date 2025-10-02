// Global Sidebar Fix for Vercel Deployment
// This script ensures sidebar persistence across all pages

(function() {
    'use strict';
    
    console.log('Global sidebar fix loaded');
    
    // Function to ensure sidebar exists (with duplication prevention)
    function ensureGlobalSidebar() {
        // Check if we're on a page that should have sidebar
        const needsSidebar = !window.location.pathname.includes('/login');
        
        if (!needsSidebar) {
            return;
        }
        
        // Check sidebar count
        const sidebars = document.querySelectorAll('.sidebar');
        
        if (sidebars.length === 0) {
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
        } else if (sidebars.length > 1) {
            console.log('Global fix: Multiple sidebars detected (' + sidebars.length + '), removing duplicates...');
            
            // Remove duplicates - keep only the first one
            for (let i = 1; i < sidebars.length; i++) {
                if (sidebars[i] && sidebars[i].parentNode) {
                    sidebars[i].parentNode.removeChild(sidebars[i]);
                    console.log('Global fix: Removed duplicate sidebar #' + (i + 1));
                }
            }
            
            // Also check mobile sidebars
            const mobileSidebars = document.querySelectorAll('#mobileSidebar');
            for (let i = 1; i < mobileSidebars.length; i++) {
                if (mobileSidebars[i] && mobileSidebars[i].parentNode) {
                    mobileSidebars[i].parentNode.removeChild(mobileSidebars[i]);
                }
            }
            
            // And overlays
            const overlays = document.querySelectorAll('#mobileSidebarOverlay');
            for (let i = 1; i < overlays.length; i++) {
                if (overlays[i] && overlays[i].parentNode) {
                    overlays[i].parentNode.removeChild(overlays[i]);
                }
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
    
    // Aggressive sidebar monitoring for Vercel (with duplication check)
    setInterval(function() {
        const needsSidebar = !window.location.pathname.includes('/login');
        if (needsSidebar) {
            const sidebars = document.querySelectorAll('.sidebar');
            if (sidebars.length === 0) {
                console.log('Aggressive monitoring: Sidebar missing, fixing...');
                ensureGlobalSidebar();
            } else if (sidebars.length > 1) {
                console.log('Aggressive monitoring: Multiple sidebars (' + sidebars.length + '), fixing...');
                ensureGlobalSidebar();
            }
        }
    }, 3000); // Increased interval to 3 seconds to reduce aggressiveness
    
    // Export function for manual use
    window.ensureGlobalSidebar = ensureGlobalSidebar;
    
})();