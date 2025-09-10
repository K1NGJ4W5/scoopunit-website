// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Estimate Modal Functions
function openEstimateModal() {
    document.getElementById('estimateModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeEstimateModal() {
    document.getElementById('estimateModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('estimateModal');
    if (event.target === modal) {
        closeEstimateModal();
    }
}

// Estimate Calculator
function calculateEstimate() {
    const dogs = document.getElementById('dogs').value;
    const yardsize = document.getElementById('yardsize').value;
    const frequency = document.getElementById('frequency').value;
    const zipcode = document.getElementById('zipcode').value;

    // Validate form
    if (!dogs || !yardsize || !frequency || !zipcode) {
        alert('Please fill in all fields to get your estimate.');
        return;
    }

    // Validate ZIP code (basic Florida panhandle ZIP validation)
    const validZips = ['32536', '32541', '32578', '32579', '32548', '32566', '32567', '32569', '32578'];
    const isValidArea = zipcode.startsWith('325') || zipcode.startsWith('324');
    
    if (!isValidArea) {
        alert('Sorry, we currently only service the Florida Panhandle area. Please contact us for service availability in your area.');
        return;
    }

    // Calculate base price
    let basePrice = 0;
    
    // Yard size multiplier
    const yardPricing = {
        'small': 25,
        'medium': 35,
        'large': 45,
        'xlarge': 60
    };
    
    basePrice = yardPricing[yardsize] || 35;
    
    // Dog count multiplier
    const dogMultiplier = {
        '1': 1.0,
        '2': 1.3,
        '3': 1.5,
        '4+': 1.8
    };
    
    basePrice *= dogMultiplier[dogs] || 1.0;
    
    // Frequency adjustment
    let finalPrice = basePrice;
    let frequencyText = '';
    
    switch(frequency) {
        case 'weekly':
            frequencyText = 'per week';
            break;
        case 'biweekly':
            finalPrice *= 0.8; // 20% discount for bi-weekly
            frequencyText = 'bi-weekly';
            break;
        case 'onetime':
            finalPrice *= 1.5; // One-time premium
            frequencyText = 'one-time service';
            break;
    }
    
    // Round to nearest $5
    finalPrice = Math.round(finalPrice / 5) * 5;
    
    // Display result
    document.getElementById('estimatedPrice').textContent = '$' + finalPrice;
    document.getElementById('frequencyText').textContent = frequencyText;
    document.getElementById('estimateResult').style.display = 'block';
    document.getElementById('signupButton').style.display = 'inline-block';
    
    // Store estimate data for signup
    window.estimateData = {
        price: finalPrice,
        frequency: frequency,
        dogs: dogs,
        yardsize: yardsize,
        zipcode: zipcode
    };
}

function proceedToSignup() {
    // In a real implementation, this would redirect to a signup page or open a signup modal
    // For demo purposes, we'll show an alert
    const data = window.estimateData;
    if (data) {
        alert(`Great! You'll be redirected to complete your signup for ${data.frequency} service at $${data.price}${data.frequency === 'onetime' ? '' : ' ' + (data.frequency === 'weekly' ? 'per week' : 'bi-weekly')}.`);
        
        // In production, redirect to signup page with estimate data
        // window.location.href = `signup.html?price=${data.price}&frequency=${data.frequency}&dogs=${data.dogs}&yard=${data.yardsize}&zip=${data.zipcode}`;
    }
}

// Form Validation Helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Scroll animations (optional enhancement)
function animateOnScroll() {
    const observers = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observers.observe(section);
    });
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure content is loaded
    setTimeout(animateOnScroll, 100);
});

// Contact form submission (for contact page)
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (!validateEmail(data.email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // In production, this would submit to a backend service
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    event.target.reset();
}

// Newsletter signup
function handleNewsletterSignup(email) {
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // In production, this would submit to a backend service
    alert('Thank you for subscribing to our newsletter!');
}

// Service area checker
function checkServiceArea(zipcode) {
    const serviceZips = [
        // Crestview area
        '32536', '32539',
        // Destin area  
        '32541', '32550',
        // Pensacola area
        '32501', '32502', '32503', '32504', '32505', '32506', '32507', '32508', '32509', '32511', '32512', '32513', '32514', '32516', '32526', '32534',
        // Other panhandle areas
        '32548', '32566', '32567', '32569', '32578', '32579', '32583'
    ];
    
    return serviceZips.includes(zipcode) || zipcode.startsWith('325') || zipcode.startsWith('324');
}

// Utility function to format phone numbers
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
}

// Add loading states for better UX
function showLoading(button) {
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    return function hideLoading() {
        button.textContent = originalText;
        button.disabled = false;
    };
}