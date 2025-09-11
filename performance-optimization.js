/**
 * Core Web Vitals Optimization for Scoop Unit
 * Improves Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS)
 */

// Image lazy loading with intersection observer
class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                // Load images 50px before they come into view
                rootMargin: '50px 0px'
            });

            this.observeImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }
        
        if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
        }

        img.classList.add('loaded');
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }
}

// WebP image format detection and serving
class WebPImageOptimizer {
    constructor() {
        this.supportsWebP = false;
        this.detectWebPSupport();
    }

    detectWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        try {
            const dataURL = canvas.toDataURL('image/webp');
            this.supportsWebP = dataURL.indexOf('image/webp') === 5;
        } catch (e) {
            this.supportsWebP = false;
        }

        if (this.supportsWebP) {
            document.documentElement.classList.add('webp-support');
        }
    }

    getOptimizedImageSrc(originalSrc) {
        if (this.supportsWebP) {
            return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        return originalSrc;
    }
}

// Critical resource preloading
class ResourcePreloader {
    constructor() {
        this.preloadCriticalResources();
    }

    preloadCriticalResources() {
        // Preload critical CSS
        this.preloadResource('/modern-styles.css', 'style');
        
        // Preload hero image
        this.preloadResource('/images/scoopunitlogo.jpg', 'image');
        
        // Preload critical fonts (when added)
        // this.preloadResource('/fonts/primary-font.woff2', 'font', 'font/woff2');
    }

    preloadResource(href, as, type = null) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (type) {
            link.type = type;
            link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
    }
}

// Layout shift prevention
class LayoutStabilizer {
    constructor() {
        this.stabilizeImages();
        this.stabilizeDynamicContent();
    }

    stabilizeImages() {
        // Add aspect ratio containers for images to prevent layout shifts
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.closest('.aspect-ratio-container')) {
                this.wrapWithAspectRatio(img);
            }
        });
    }

    wrapWithAspectRatio(img) {
        const wrapper = document.createElement('div');
        wrapper.className = 'aspect-ratio-container';
        
        // Calculate aspect ratio from image natural dimensions or data attributes
        const width = img.getAttribute('data-width') || img.naturalWidth || 16;
        const height = img.getAttribute('data-height') || img.naturalHeight || 9;
        const aspectRatio = (height / width) * 100;
        
        wrapper.style.paddingBottom = `${aspectRatio}%`;
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';
        
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
    }

    stabilizeDynamicContent() {
        // Reserve space for dynamic content areas
        const dynamicAreas = document.querySelectorAll('[data-dynamic-content]');
        dynamicAreas.forEach(area => {
            const minHeight = area.getAttribute('data-min-height') || '200px';
            area.style.minHeight = minHeight;
        });
    }
}

// Performance monitoring and reporting
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.observePerformance();
    }

    observePerformance() {
        // Monitor Core Web Vitals
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        
        // Report metrics
        setTimeout(() => this.reportMetrics(), 5000);
    }

    observeLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            
            observer.observe({entryTypes: ['largest-contentful-paint']});
        }
    }

    observeFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.processingStart) {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                    }
                });
            });
            
            observer.observe({entryTypes: ['first-input']});
        }
    }

    observeCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
            });
            
            observer.observe({entryTypes: ['layout-shift']});
        }
    }

    reportMetrics() {
        // Log metrics for debugging
        console.log('Core Web Vitals:', this.metrics);
        
        // Send to analytics (when implemented)
        if (window.gtag) {
            Object.entries(this.metrics).forEach(([metric, value]) => {
                gtag('event', 'web_vitals', {
                    'metric_name': metric.toUpperCase(),
                    'metric_value': Math.round(value),
                    'custom_parameter': 'core_web_vitals'
                });
            });
        }
    }
}

// Service Worker for caching (when needed)
class ServiceWorkerManager {
    constructor() {
        this.registerServiceWorker();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator && 'production' === 'production') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
}

// Initialize all optimization modules
document.addEventListener('DOMContentLoaded', function() {
    // Initialize image optimization
    new LazyImageLoader();
    new WebPImageOptimizer();
    
    // Initialize performance optimizations
    new ResourcePreloader();
    new LayoutStabilizer();
    new PerformanceMonitor();
    
    // Initialize service worker (uncomment when ready for production)
    // new ServiceWorkerManager();
});

// Export for testing and manual usage
window.ScoopUnitPerformance = {
    LazyImageLoader,
    WebPImageOptimizer,
    ResourcePreloader,
    LayoutStabilizer,
    PerformanceMonitor,
    ServiceWorkerManager
};