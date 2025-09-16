/**
 * Mobile Image Performance and Progressive Loading
 * Optimizes image loading and display for mobile devices
 * Version: 1.0
 * Target: Scoop Unit Website Mobile Experience
 */

(function() {
    'use strict';
    
    // ===============================================
    // MOBILE DETECTION AND CAPABILITY TESTING
    // ===============================================
    
    const MobileImageOptimizer = {
        // Device and capability detection
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isSlowConnection: navigator.connection && (
            navigator.connection.effectiveType === 'slow-2g' || 
            navigator.connection.effectiveType === '2g' ||
            navigator.connection.saveData === true
        ),
        supportsWebP: false,
        supportsAvif: false,
        isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        
        // Performance monitoring
        imageLoadTimes: [],
        failedImages: [],
        
        init: function() {
            this.detectImageFormats();
            this.setupIntersectionObserver();
            this.optimizeExistingImages();
            this.setupErrorHandling();
            this.setupPerformanceMonitoring();
            this.setupMobileSpecificOptimizations();
            
            if (this.isMobile) {
                this.enableMobileOptimizations();
            }
            
            console.log('Mobile Image Optimizer initialized', {
                isMobile: this.isMobile,
                isSlowConnection: this.isSlowConnection,
                supportsWebP: this.supportsWebP,
                supportsAvif: this.supportsAvif
            });
        },
        
        // ===============================================
        // FORMAT DETECTION
        // ===============================================
        
        detectImageFormats: function() {
            // Test WebP support
            const webpTest = document.createElement('canvas');
            webpTest.width = 1;
            webpTest.height = 1;
            this.supportsWebP = webpTest.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            
            // Test AVIF support (modern browsers)
            if (window.createImageBitmap) {
                fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=')
                    .then(response => response.arrayBuffer())
                    .then(buffer => createImageBitmap(new Uint8Array(buffer)))
                    .then(() => { this.supportsAvif = true; })
                    .catch(() => { this.supportsAvif = false; });
            }
        },
        
        // ===============================================
        // INTERSECTION OBSERVER FOR LAZY LOADING
        // ===============================================
        
        setupIntersectionObserver: function() {
            if (!('IntersectionObserver' in window)) {
                // Fallback for older browsers
                this.loadAllImages();
                return;
            }
            
            const options = {
                root: null,
                rootMargin: this.isMobile ? '100px' : '50px', // Larger margin on mobile
                threshold: 0.1
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            // Observe all lazy images
            document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(img => {
                this.observer.observe(img);
            });
        },
        
        // ===============================================
        // PROGRESSIVE IMAGE LOADING
        // ===============================================
        
        loadImage: function(img) {
            const startTime = performance.now();
            
            // Determine the best image source for mobile
            const optimizedSrc = this.getOptimizedImageSrc(img);
            
            // Create loading placeholder
            this.showLoadingState(img);
            
            // Preload the image
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                const loadTime = performance.now() - startTime;
                this.imageLoadTimes.push(loadTime);
                
                // Update the actual image
                if (img.src !== optimizedSrc) {
                    img.src = optimizedSrc;
                }
                
                // Add loaded class for CSS transitions
                img.classList.add('loaded');
                this.hideLoadingState(img);
                
                // Performance logging for slow images
                if (loadTime > 2000) {
                    console.warn('Slow image load detected:', img.src, loadTime + 'ms');
                }
            };
            
            imageLoader.onerror = () => {
                this.handleImageError(img);
            };
            
            imageLoader.src = optimizedSrc;
        },
        
        getOptimizedImageSrc: function(img) {
            const originalSrc = img.dataset.src || img.src;
            
            // For mobile devices, try to get smaller versions
            if (this.isMobile && window.innerWidth <= 768) {
                // Check if we have mobile-optimized versions
                const mobileParams = this.isSlowConnection ? 
                    '?width=480&quality=70' : 
                    '?width=768&quality=80';
                
                // Return optimized version if available
                if (originalSrc.includes('.png') || originalSrc.includes('.jpg')) {
                    return originalSrc + mobileParams;
                }
            }
            
            return originalSrc;
        },
        
        // ===============================================
        // LOADING STATES AND ERROR HANDLING
        // ===============================================
        
        showLoadingState: function(img) {
            if (this.isReducedMotion) return;
            
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '0.7';
            
            // Add shimmer effect for mobile
            if (this.isMobile) {
                img.classList.add('mobile-image-loading');
            }
        },
        
        hideLoadingState: function(img) {
            img.style.opacity = '1';
            img.classList.remove('mobile-image-loading');
        },
        
        handleImageError: function(img) {
            this.failedImages.push(img.src);
            console.error('Failed to load image:', img.src);
            
            // Show error state
            img.classList.add('mobile-image-error');
            img.alt = 'Image failed to load';
            
            // Try fallback image if available
            const fallbackSrc = img.dataset.fallback;
            if (fallbackSrc && img.src !== fallbackSrc) {
                setTimeout(() => {
                    img.src = fallbackSrc;
                    img.classList.remove('mobile-image-error');
                }, 1000);
            }
        },
        
        // ===============================================
        // MOBILE-SPECIFIC OPTIMIZATIONS
        // ===============================================
        
        enableMobileOptimizations: function() {
            // Reduce image quality on slow connections
            if (this.isSlowConnection) {
                this.applyDataSavingMode();
            }
            
            // Optimize touch interactions
            this.setupMobileTouchOptimizations();
            
            // Handle orientation changes
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.recalculateImageSizes();
                }, 100);
            });
            
            // Monitor network changes
            if (navigator.connection) {
                navigator.connection.addEventListener('change', () => {
                    this.handleNetworkChange();
                });
            }
        },
        
        applyDataSavingMode: function() {
            document.body.classList.add('data-saving-mode');
            
            // Replace high-quality images with lower quality versions
            document.querySelectorAll('img').forEach(img => {
                if (!img.classList.contains('mobile-critical-image')) {
                    img.style.filter = 'blur(0.5px)';
                    img.style.opacity = '0.9';
                }
            });
        },
        
        setupMobileTouchOptimizations: function() {
            // Improve touch targets for image interactions
            document.querySelectorAll('.gallery-item, img[onclick]').forEach(element => {
                element.style.minHeight = '44px';
                element.style.minWidth = '44px';
                element.style.touchAction = 'manipulation';
                
                // Add visual feedback for touches
                element.addEventListener('touchstart', (e) => {
                    element.style.transform = 'scale(0.98)';
                    element.style.transition = 'transform 0.1s ease';
                });
                
                element.addEventListener('touchend', (e) => {
                    setTimeout(() => {
                        element.style.transform = 'scale(1)';
                    }, 100);
                });
            });
        },
        
        recalculateImageSizes: function() {
            // Recalculate image sizes after orientation change
            document.querySelectorAll('img').forEach(img => {
                if (img.complete) {
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                }
            });
        },
        
        handleNetworkChange: function() {
            const connection = navigator.connection;
            const isNowSlow = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.saveData === true;
            
            if (isNowSlow && !this.isSlowConnection) {
                this.isSlowConnection = true;
                this.applyDataSavingMode();
            } else if (!isNowSlow && this.isSlowConnection) {
                this.isSlowConnection = false;
                document.body.classList.remove('data-saving-mode');
                this.optimizeExistingImages();
            }
        },
        
        // ===============================================
        // EXISTING IMAGE OPTIMIZATION
        // ===============================================
        
        optimizeExistingImages: function() {
            document.querySelectorAll('img').forEach(img => {
                // Apply mobile-specific styling
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.objectFit = 'contain';
                
                // Add mobile optimization classes
                if (this.isMobile) {
                    img.classList.add('mobile-optimized');
                }
                
                // Fix container overflow issues
                const container = img.closest('.apple-guarantee-badges, .apple-service-showcase, .gallery-item');
                if (container) {
                    container.style.overflow = 'hidden';
                    container.style.maxWidth = '100%';
                }
            });
        },
        
        // ===============================================
        // ERROR HANDLING AND MONITORING
        // ===============================================
        
        setupErrorHandling: function() {
            // Global image error handler
            document.addEventListener('error', (e) => {
                if (e.target.tagName === 'IMG') {
                    this.handleImageError(e.target);
                }
            }, true);
        },
        
        setupPerformanceMonitoring: function() {
            // Monitor overall image performance
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.name.includes('image') && entry.duration > 1000) {
                            console.warn('Slow image resource:', entry.name, entry.duration + 'ms');
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['resource'] });
            }
        },
        
        // ===============================================
        // UTILITY METHODS
        // ===============================================
        
        loadAllImages: function() {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(img => {
                this.loadImage(img);
            });
        },
        
        getPerformanceStats: function() {
            const avgLoadTime = this.imageLoadTimes.length > 0 ?
                this.imageLoadTimes.reduce((a, b) => a + b, 0) / this.imageLoadTimes.length : 0;
                
            return {
                averageLoadTime: Math.round(avgLoadTime),
                failedImages: this.failedImages.length,
                totalImagesLoaded: this.imageLoadTimes.length,
                isMobileOptimized: this.isMobile,
                connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
            };
        },
        
        // ===============================================
        // PUBLIC API
        // ===============================================
        
        forceReload: function() {
            // Force reload all images with current optimization settings
            document.querySelectorAll('img').forEach(img => {
                const currentSrc = img.src;
                img.src = '';
                img.src = this.getOptimizedImageSrc(img);
            });
        },
        
        toggleDataSaving: function() {
            // Allow manual toggle of data saving mode
            this.isSlowConnection = !this.isSlowConnection;
            
            if (this.isSlowConnection) {
                this.applyDataSavingMode();
            } else {
                document.body.classList.remove('data-saving-mode');
                this.optimizeExistingImages();
            }
        }
    };
    
    // ===============================================
    // INITIALIZATION
    // ===============================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            MobileImageOptimizer.init();
        });
    } else {
        MobileImageOptimizer.init();
    }
    
    // Expose to global scope for debugging
    window.MobileImageOptimizer = MobileImageOptimizer;
    
    // ===============================================
    // ADDITIONAL MOBILE FIXES
    // ===============================================
    
    // Fix iOS Safari image scaling issues
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.addEventListener('DOMContentLoaded', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover'
                );
            }
        });
    }
    
    // Prevent zoom on double-tap for images
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            if (event.target.tagName === 'IMG') {
                event.preventDefault();
            }
        }
        lastTouchEnd = now;
    }, false);

})();