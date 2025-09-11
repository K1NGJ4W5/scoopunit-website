/**
 * Apple-Inspired Interactive Animations for Scoop Unit
 * Smooth animations and micro-interactions that enhance user experience
 */

class AppleInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupButtonAnimations();
        this.setupFormEnhancements();
        this.setupNavScrollEffect();
        this.setupParallaxEffects();
    }

    // Smooth scroll animations for cards and sections
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add staggered animation for grid items
                    if (entry.target.closest('.apple-grid')) {
                        const gridItems = entry.target.closest('.apple-grid').querySelectorAll('.apple-animate-in');
                        gridItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('visible');
                            }, index * 100);
                        });
                    }
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.apple-animate-in, .apple-card, .apple-testimonial').forEach(el => {
            observer.observe(el);
        });
    }

    // Enhanced button interactions
    setupButtonAnimations() {
        document.querySelectorAll('.apple-btn').forEach(button => {
            // Add ripple effect on click
            button.addEventListener('click', (e) => {
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('apple-ripple');
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });

            // Enhanced hover states
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Add CSS for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            .apple-btn {
                position: relative;
                overflow: hidden;
            }
            
            .apple-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Enhanced form interactions
    setupFormEnhancements() {
        const form = document.getElementById('estimateForm');
        if (!form) return;

        // Add floating labels effect
        document.querySelectorAll('.apple-form-input, .apple-form-select').forEach(input => {
            const label = input.closest('.apple-form-group').querySelector('.apple-form-label');
            
            // Focus effects
            input.addEventListener('focus', () => {
                input.closest('.apple-form-group').classList.add('focused');
                if (label) {
                    label.style.color = 'var(--apple-blue)';
                    label.style.transform = 'translateY(-2px)';
                }
            });

            input.addEventListener('blur', () => {
                input.closest('.apple-form-group').classList.remove('focused');
                if (label) {
                    label.style.color = '';
                    label.style.transform = '';
                }
            });

            // Real-time validation
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });

        // Enhanced form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Animate button
            submitBtn.textContent = 'Calculating...';
            submitBtn.style.transform = 'scale(0.95)';
            submitBtn.disabled = true;
            
            // Simulate processing
            setTimeout(() => {
                this.showEstimateResults();
                submitBtn.textContent = originalText;
                submitBtn.style.transform = 'scale(1)';
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    validateField(field) {
        const group = field.closest('.apple-form-group');
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            group.classList.add('error');
            field.style.borderColor = '#ff3b30';
        } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            group.classList.add('error');
            field.style.borderColor = '#ff3b30';
        } else {
            group.classList.remove('error');
            field.style.borderColor = 'var(--apple-green)';
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showEstimateResults() {
        // Create modal-style results display
        const modal = document.createElement('div');
        modal.className = 'apple-estimate-modal';
        modal.innerHTML = `
            <div class="apple-estimate-content">
                <h3>Your Instant Estimate</h3>
                <div class="estimate-price">$25-35/week</div>
                <p>Based on your weekly service for 2 dogs</p>
                <div class="estimate-features">
                    <div class="feature">✓ Weekly cleanup service</div>
                    <div class="feature">✓ Automated billing</div>
                    <div class="feature">✓ 100% satisfaction guarantee</div>
                </div>
                <button class="apple-btn apple-btn-primary apple-btn-large" onclick="this.closest('.apple-estimate-modal').remove()">
                    Schedule My Service
                </button>
                <button class="apple-btn apple-btn-secondary" onclick="this.closest('.apple-estimate-modal').remove()">
                    Close
                </button>
            </div>
        `;

        // Add styles for modal
        const modalStyles = `
            .apple-estimate-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .apple-estimate-content {
                background: white;
                border-radius: 16px;
                padding: 48px;
                max-width: 400px;
                text-align: center;
                box-shadow: var(--shadow-heavy);
                animation: slideUp 0.4s ease;
            }
            
            .estimate-price {
                font-size: 48px;
                font-weight: 600;
                color: var(--apple-blue);
                margin: 16px 0;
            }
            
            .estimate-features {
                margin: 24px 0;
                text-align: left;
            }
            
            .feature {
                margin: 8px 0;
                color: var(--apple-green);
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;

        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = modalStyles;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    }

    // Navigation scroll effect
    setupNavScrollEffect() {
        const nav = document.querySelector('.apple-nav');
        if (!nav) return;

        let lastScrollY = 0;
        let ticking = false;

        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                nav.classList.add('scrolled');
                nav.style.background = 'rgba(255, 255, 255, 0.9)';
                nav.style.backdropFilter = 'blur(20px)';
            } else {
                nav.classList.remove('scrolled');
                nav.style.background = 'rgba(255, 255, 255, 0.8)';
            }

            // Hide/show on scroll
            if (scrollY > lastScrollY && scrollY > 200) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }

    // Subtle parallax effects
    setupParallaxEffects() {
        const heroSection = document.querySelector('.apple-hero');
        if (!heroSection) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            if (scrolled < heroSection.offsetHeight) {
                heroSection.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Smooth scroll for anchor links
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    const navHeight = document.querySelector('.apple-nav')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - navHeight - 32;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Card hover effects
    setupCardHovers() {
        document.querySelectorAll('.apple-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = 'var(--shadow-heavy)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'var(--shadow-light)';
            });
        });
    }

    // Initialize all interactions
    initializeAll() {
        this.setupSmoothScroll();
        this.setupCardHovers();
        
        // Add loading animations
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            
            // Animate hero elements
            const heroElements = document.querySelectorAll('.apple-hero .apple-headline, .apple-hero .apple-subheadline, .apple-hero .apple-trust, .apple-hero .apple-hero-cta');
            heroElements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 200);
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const appleInteractions = new AppleInteractions();
    appleInteractions.initializeAll();
});

// Export for external use
window.AppleInteractions = AppleInteractions;