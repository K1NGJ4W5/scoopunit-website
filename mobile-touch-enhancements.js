/**
 * Mobile Touch Interface Enhancements for Scoop Unit Website
 * Improves touch interactions, button feedback, and mobile usability
 */

(function() {
    'use strict';
    
    // ==========================================================================
    // TOUCH FEEDBACK ENHANCEMENT
    // ==========================================================================
    
    /**
     * Add touch feedback to all interactive elements
     */
    function addTouchFeedback() {
        const touchElements = document.querySelectorAll(`
            .apple-btn, 
            .mobile-menu-toggle, 
            .apple-nav-link, 
            .mobile-sticky-btn,
            button[type="submit"],
            .apple-card .apple-btn,
            input[type="submit"]
        `);
        
        touchElements.forEach(element => {
            // Add touch start feedback
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            // Remove feedback on touch end
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
            
            // Remove feedback if touch is cancelled
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        });
    }
    
    // ==========================================================================
    // IMPROVED MOBILE MENU FUNCTIONALITY
    // ==========================================================================
    
    /**
     * Enhanced mobile menu with better touch handling
     */
    function initializeMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) {
            console.warn('Mobile menu elements not found');
            return;
        }
        
        // Improve menu toggle with touch handling
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
        
        // Add keyboard support
        navToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileMenu();
                navToggle.focus(); // Return focus to toggle button
            }
        });
        
        // Close menu when clicking on navigation links
        const navLinks = navMenu.querySelectorAll('.apple-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                if (window.innerWidth > 768) {
                    closeMobileMenu();
                }
            }, 100);
        });
        
        function toggleMobileMenu() {
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }
        
        function openMobileMenu() {
            navMenu.classList.add('active');
            navToggle.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
            
            // Focus first menu item for keyboard navigation
            const firstLink = navMenu.querySelector('.apple-nav-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        }
        
        function closeMobileMenu() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }
    
    // ==========================================================================
    // FORM ENHANCEMENT FOR MOBILE
    // ==========================================================================
    
    /**
     * Improve form interactions on mobile
     */
    function enhanceMobileForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add touch-friendly focus handling
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                // Prevent zoom on iOS by ensuring font-size is 16px
                if (window.innerWidth <= 768) {
                    const computedFontSize = parseInt(window.getComputedStyle(input).fontSize);
                    if (computedFontSize < 16) {
                        input.style.fontSize = '16px';
                    }
                }
                
                // Add touch feedback to form elements
                input.addEventListener('focus', function() {
                    this.classList.add('input-focused');
                });
                
                input.addEventListener('blur', function() {
                    this.classList.remove('input-focused');
                });
            });
            
            // Enhanced submit button handling
            const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
            
            submitButtons.forEach(button => {
                button.addEventListener('touchstart', function() {
                    this.classList.add('submitting');
                }, { passive: true });
                
                button.addEventListener('touchend', function() {
                    setTimeout(() => {
                        this.classList.remove('submitting');
                    }, 200);
                }, { passive: true });
            });
        });
    }
    
    // ==========================================================================
    // MOBILE STICKY CTA ENHANCEMENTS
    // ==========================================================================
    
    /**
     * Improve mobile sticky CTA behavior
     */
    function enhanceMobileStickyCTA() {
        const stickyCTA = document.getElementById('mobile-sticky-cta');
        if (!stickyCTA) return;
        
        let lastScrollTop = 0;
        let scrollTimeout;
        
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const heroSection = document.querySelector('.hero-yard');
                const heroHeight = heroSection ? heroSection.offsetHeight : 800;
                
                // Show sticky CTA after scrolling past hero on mobile
                if (window.innerWidth <= 768) {
                    const isScrollingDown = scrollTop > lastScrollTop;
                    const isPastHero = scrollTop > heroHeight;
                    const isNearTop = scrollTop < 100;
                    
                    if (isPastHero && isScrollingDown) {
                        stickyCTA.classList.add('visible');
                    } else if (isNearTop) {
                        stickyCTA.classList.remove('visible');
                    }
                } else {
                    // Hide on desktop
                    stickyCTA.classList.remove('visible');
                }
                
                lastScrollTop = scrollTop;
            }, 10);
        }, { passive: true });
        
        // Add touch feedback to sticky CTA
        const stickyButton = stickyCTA.querySelector('.mobile-sticky-btn');
        if (stickyButton) {
            stickyButton.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            stickyButton.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
        }
    }
    
    // ==========================================================================
    // BUTTON RIPPLE EFFECT FOR BETTER FEEDBACK
    // ==========================================================================
    
    /**
     * Add ripple effect to buttons for better touch feedback
     */
    function addRippleEffect() {
        const buttons = document.querySelectorAll('.apple-btn, .mobile-sticky-btn, button[type="submit"]');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', function(e) {
                // Only add ripple on mobile
                if (window.innerWidth > 768) return;
                
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.touches[0].clientX - rect.left - size / 2;
                const y = e.touches[0].clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    z-index: 1;
                `;
                
                ripple.className = 'ripple-effect';
                
                // Ensure button has relative positioning
                if (getComputedStyle(this).position === 'static') {
                    this.style.position = 'relative';
                }
                
                this.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            }, { passive: true });
        });
    }
    
    // ==========================================================================
    // ACCESSIBILITY ENHANCEMENTS
    // ==========================================================================
    
    /**
     * Add accessibility improvements for mobile
     */
    function enhanceAccessibility() {
        // Add proper ARIA labels to interactive elements
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.setAttribute('aria-label', 'Toggle mobile navigation menu');
            navToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Ensure all buttons have proper roles and labels
        const buttons = document.querySelectorAll('.apple-btn, .mobile-sticky-btn');
        buttons.forEach(button => {
            if (!button.getAttribute('role')) {
                button.setAttribute('role', 'button');
            }
            
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                button.setAttribute('aria-label', 'Action button');
            }
        });
        
        // Add skip link for keyboard navigation
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.className = 'skip-link';
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--apple-red);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 9999;
                transition: top 0.2s ease;
            `;
            
            skipLink.addEventListener('focus', function() {
                this.style.top = '6px';
            });
            
            skipLink.addEventListener('blur', function() {
                this.style.top = '-40px';
            });
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    }
    
    // ==========================================================================
    // CSS ANIMATIONS FOR TOUCH FEEDBACK
    // ==========================================================================
    
    /**
     * Add CSS for touch effects
     */
    function addTouchCSS() {
        if (document.getElementById('mobile-touch-css')) return;
        
        const style = document.createElement('style');
        style.id = 'mobile-touch-css';
        style.textContent = `
            /* Touch feedback animations */
            .touch-active {
                transform: scale(0.95) !important;
                transition: transform 0.1s ease !important;
            }
            
            .input-focused {
                border-color: var(--apple-red) !important;
                box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2) !important;
            }
            
            .submitting {
                opacity: 0.8 !important;
                transform: scale(0.98) !important;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* Skip link styles */
            .skip-link:focus {
                outline: 2px solid white !important;
                outline-offset: 2px !important;
            }
            
            /* Improved focus indicators for mobile */
            @media (max-width: 768px) {
                .apple-btn:focus,
                .mobile-menu-toggle:focus,
                .apple-nav-link:focus {
                    outline: 3px solid var(--apple-red) !important;
                    outline-offset: 2px !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    
    /**
     * Initialize all mobile touch enhancements
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        console.log('🔧 Initializing mobile touch enhancements...');
        
        try {
            addTouchCSS();
            addTouchFeedback();
            initializeMobileMenu();
            enhanceMobileForms();
            enhanceMobileStickyCTA();
            addRippleEffect();
            enhanceAccessibility();
            
            console.log('✅ Mobile touch enhancements initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing mobile touch enhancements:', error);
        }
    }
    
    // Start initialization
    init();
    
    // Re-initialize on viewport resize (orientation change)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-run font size fixes for form inputs
            enhanceMobileForms();
        }, 250);
    });
    
})();