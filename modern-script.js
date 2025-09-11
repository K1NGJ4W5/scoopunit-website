/**
 * Modern JavaScript for Scoop Unit Website
 * Handles animations, interactions, and enhanced user experience
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeModernFeatures();
});

function initializeModernFeatures() {
    // Mobile navigation
    initMobileNav();
    
    // Smooth scrolling
    initSmoothScrolling();
    
    // Form enhancements
    initFormEnhancements();
    
    // Animation observers
    initAnimationObservers();
    
    // Interactive elements
    initInteractiveElements();
    
    // Analytics tracking
    initAnalyticsTracking();
    
    // Performance optimizations
    initPerformanceOptimizations();
}

// Mobile Navigation
function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking nav links
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Enhancements
function initFormEnhancements() {
    // Estimate form
    const estimateForm = document.getElementById('estimateForm');
    if (estimateForm) {
        estimateForm.addEventListener('submit', handleEstimateSubmission);
        
        // Real-time validation
        estimateForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', clearFieldError);
        });
        
        // Dynamic pricing preview
        const serviceType = estimateForm.querySelector('#service-type');
        const dogs = estimateForm.querySelector('#dogs');
        const yardSize = estimateForm.querySelector('#yard-size');
        
        if (serviceType && dogs) {
            [serviceType, dogs, yardSize].forEach(field => {
                field.addEventListener('change', updatePricingPreview);
            });
        }
    }
    
    // Newsletter forms
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmission);
    });
}

// Estimate Form Submission
function handleEstimateSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    // Get form data for analytics
    const serviceType = formData.get('serviceType');
    const location = formData.get('location');
    const dogs = formData.get('dogs');
    
    // Track conversion
    trackEstimateRequest(serviceType, location, dogs);
    
    // Simulate API call (replace with actual endpoint)
    setTimeout(() => {
        // Show success message
        showSuccessMessage('Thank you! We\'ll contact you within 24 hours with your free estimate.');
        
        // Reset form
        form.reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    }, 1500);
}

// Form Validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing errors
    clearFieldError({ target: field });
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\(\)\-\s\+\d]{10,}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Dynamic Pricing Preview
function updatePricingPreview() {
    const serviceType = document.getElementById('service-type')?.value;
    const dogs = document.getElementById('dogs')?.value;
    const yardSize = document.getElementById('yard-size')?.value;
    
    if (!serviceType || !dogs) return;
    
    // Simple pricing calculation (replace with actual logic)
    const basePrices = {
        'weekly': { min: 15, max: 45 },
        'biweekly': { min: 20, max: 60 },
        'onetime': { min: 30, max: 100 },
        'commercial': { min: 50, max: 200 }
    };
    
    const dogMultiplier = parseInt(dogs) || 1;
    const yardMultiplier = yardSize === 'large' ? 1.5 : yardSize === 'xlarge' ? 2 : 1;
    
    const basePrice = basePrices[serviceType];
    if (basePrice) {
        const minPrice = Math.round(basePrice.min * dogMultiplier * yardMultiplier);
        const maxPrice = Math.round(basePrice.max * dogMultiplier * yardMultiplier);
        
        showPricingPreview(minPrice, maxPrice, serviceType);
    }
}

function showPricingPreview(min, max, serviceType) {
    let previewElement = document.querySelector('.pricing-preview');
    
    if (!previewElement) {
        previewElement = document.createElement('div');
        previewElement.className = 'pricing-preview';
        
        const form = document.getElementById('estimateForm');
        if (form) {
            form.insertBefore(previewElement, form.querySelector('.submit-btn'));
        }
    }
    
    const frequency = serviceType === 'weekly' ? 'per week' : 
                     serviceType === 'biweekly' ? 'per visit' : 
                     serviceType === 'onetime' ? 'one-time' : 'per month';
    
    previewElement.innerHTML = `
        <div class="preview-content">
            <h4>💰 Estimated Price Range</h4>
            <div class="price-range">$${min} - $${max} ${frequency}</div>
            <p class="preview-note">Final pricing may vary based on specific requirements</p>
        </div>
    `;
    
    previewElement.classList.add('show');
}

// Success Messages
function showSuccessMessage(message) {
    // Remove existing messages
    document.querySelectorAll('.success-message').forEach(el => el.remove());
    
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.innerHTML = `
        <div class="message-content">
            <span class="success-icon">✅</span>
            <span class="message-text">${message}</span>
            <button class="close-message" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Animation Observers
function initAnimationObservers() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in animation
    document.querySelectorAll(`
        .service-card, 
        .benefit-card, 
        .neighborhood-card, 
        .testimonial-card, 
        .faq-item,
        .feature-card,
        .step-card,
        .reason-card
    `).forEach(el => {
        fadeInObserver.observe(el);
    });
    
    // Counter animation for stats
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.stat-number').forEach(el => {
        counterObserver.observe(el);
    });
}

// Counter Animation
function animateCounter(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/\D/g, ''));
    
    if (!isNaN(number)) {
        let current = 0;
        const increment = number / 50; // 50 steps
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                element.textContent = text;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + text.replace(/\d+/, '');
            }
        }, 30);
    }
}

// Interactive Elements
function initInteractiveElements() {
    // Hover effects for cards
    document.querySelectorAll('.service-card, .benefit-card, .feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // FAQ accordion behavior
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            
            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });
    
    // Parallax effect for hero sections
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroes = document.querySelectorAll('.hero, .city-hero, .service-hero');
            
            heroes.forEach(hero => {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            });
        });
    }
}

// Analytics Tracking
function initAnalyticsTracking() {
    // Track phone clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            trackPhoneCall();
        });
    });
    
    // Track service page views
    const path = window.location.pathname;
    if (path.includes('weekly')) {
        trackServicePageView('weekly');
    } else if (path.includes('biweekly')) {
        trackServicePageView('biweekly');
    } else if (path.includes('onetime')) {
        trackServicePageView('onetime');
    } else if (path.includes('commercial')) {
        trackServicePageView('commercial');
    }
    
    // Track city page views
    if (path.includes('crestview')) {
        trackCityPageView('crestview');
    } else if (path.includes('destin')) {
        trackCityPageView('destin');
    } else if (path.includes('pensacola')) {
        trackCityPageView('pensacola');
    }
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestone scroll depths
            if ([25, 50, 75, 100].includes(scrollPercent)) {
                trackScrollDepth(scrollPercent);
            }
        }
    });
}

// Analytics Functions (integrate with your tracking)
function trackEstimateRequest(serviceType, location, dogsCount) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'estimate_request', {
            'event_category': 'Lead Generation',
            'event_label': `${serviceType} - ${location}`,
            'custom_parameter_1': serviceType,
            'custom_parameter_2': location,
            'custom_parameter_3': dogsCount,
            'value': 1
        });
    }
    
    console.log('Estimate Request:', { serviceType, location, dogsCount });
}

function trackPhoneCall() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call', {
            'event_category': 'Lead Generation',
            'event_label': 'Phone Number Click',
            'value': 1
        });
    }
    
    console.log('Phone call tracked');
}

function trackServicePageView(serviceType) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'service_interest', {
            'event_category': 'Service Interest',
            'event_label': serviceType,
            'value': 1
        });
    }
    
    console.log('Service page view:', serviceType);
}

function trackCityPageView(cityName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'location_interest', {
            'event_category': 'Location Interest',
            'event_label': cityName,
            'value': 1
        });
    }
    
    console.log('City page view:', cityName);
}

function trackScrollDepth(percent) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'scroll_depth', {
            'event_category': 'Engagement',
            'event_label': `${percent}%`,
            'value': percent
        });
    }
    
    console.log('Scroll depth:', percent + '%');
}

// Performance Optimizations
function initPerformanceOptimizations() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Preload critical resources
    const criticalResources = [
        '/images/scoopunitlogo.jpg',
        '/modern-styles.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.endsWith('.css') ? 'style' : 'image';
        link.href = resource;
        document.head.appendChild(link);
    });
    
    // Service Worker registration (if available)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        });
    }
}

// Newsletter Submission
function handleNewsletterSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (!email) {
        showSuccessMessage('Please enter a valid email address.');
        return;
    }
    
    // Track newsletter signup
    if (typeof gtag !== 'undefined') {
        gtag('event', 'newsletter_signup', {
            'event_category': 'Lead Generation',
            'event_label': 'Newsletter Subscription',
            'value': 1
        });
    }
    
    // Simulate API call
    showSuccessMessage('Thank you for subscribing! You\'ll receive our monthly tips soon.');
    form.reset();
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export for use in other scripts
window.ScoopUnitJS = {
    trackEstimateRequest,
    trackPhoneCall,
    trackServicePageView,
    trackCityPageView,
    showSuccessMessage
};