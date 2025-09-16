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

// Conversational Estimate Modal Functions
let conversationState = {
    step: 0,
    answers: {},
    totalSteps: 4
};

const conversationFlow = [
    {
        question: "Hi there! 👋 First, what's your ZIP code? I need to make sure we service your area.",
        choices: [
            { value: 'input', icon: '📍', text: 'Enter ZIP Code', inputType: 'zipcode' }
        ]
    },
    {
        question: "Great! How many dogs do you have?",
        choices: [
            { value: '1', icon: '🐕', text: '1 Dog', description: 'Single furry friend' },
            { value: '2', icon: '🐕🐕', text: '2 Dogs', description: 'A dynamic duo' },
            { value: '3', icon: '🐕🐕🐕', text: '3 Dogs', description: 'A pack of three' },
            { value: '4+', icon: '🐕🐕🐕🐕', text: '4+ Dogs', description: 'A whole pack!' }
        ]
    },
    {
        question: "Perfect! What's the size of your yard?",
        choices: [
            { value: 'small', icon: '🏡', text: 'Small Yard', description: 'Under 1/4 acre' },
            { value: 'medium', icon: '🏠', text: 'Medium Yard', description: '1/4 - 1/2 acre' },
            { value: 'large', icon: '🏘️', text: 'Large Yard', description: '1/2 - 1 acre' },
            { value: 'xlarge', icon: '🏞️', text: 'Extra Large', description: 'Over 1 acre' }
        ]
    },
    {
        question: "Almost done! How often would you like service?",
        choices: [
            { value: 'weekly', icon: '📅', text: 'Weekly', description: 'Most popular - keeps yard consistently clean' },
            { value: 'biweekly', icon: '💰', text: 'Bi-Weekly', description: 'Cost-effective for smaller yards' },
            { value: 'onetime', icon: '✨', text: 'One-Time', description: 'Perfect for events or deep cleaning' }
        ]
    }
];

function openEstimateModal() {
    document.getElementById('estimateModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    initializeConversation();
}

function closeEstimateModal() {
    document.getElementById('estimateModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetConversation();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('estimateModal');
    if (event.target === modal) {
        closeEstimateModal();
    }
}

function initializeConversation() {
    conversationState = { step: 0, answers: {}, totalSteps: 4 };
    const container = document.getElementById('conversationContainer');
    container.innerHTML = '';
    updateProgress();

    // Start conversation with slight delay
    setTimeout(() => {
        showBotMessage(conversationFlow[0].question);
        setTimeout(() => {
            showChoices(conversationFlow[0].choices);
        }, 800);
    }, 500);
}

function resetConversation() {
    conversationState = { step: 0, answers: {}, totalSteps: 4 };
    document.getElementById('conversationContainer').innerHTML = '';
    document.getElementById('conversationInput').style.display = 'none';
    updateProgress();
}

function showBotMessage(message) {
    const container = document.getElementById('conversationContainer');

    // Show typing indicator first
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;

    // Replace typing with actual message after delay
    setTimeout(() => {
        typingDiv.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${message}</div>
        `;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }, 1200);
}

function showUserMessage(text) {
    const container = document.getElementById('conversationContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">${text}</div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function showChoices(choices) {
    const inputContainer = document.getElementById('conversationInput');
    const choicesContainer = document.getElementById('choicesContainer');

    choicesContainer.innerHTML = '';

    choices.forEach(choice => {
        if (choice.inputType === 'zipcode') {
            // Create input field for ZIP code
            const inputDiv = document.createElement('div');
            inputDiv.innerHTML = `
                <input type="text" id="zipcodeInput" placeholder="Enter your ZIP code (e.g., 32536)"
                       style="width: 100%; padding: 15px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 0.95rem; margin-bottom: 10px;">
                <button onclick="handleZipcodeInput()" class="choice-button" style="width: 100%; justify-content: center;">
                    <span class="choice-icon">${choice.icon}</span>
                    <span class="choice-text">Continue</span>
                </button>
            `;
            choicesContainer.appendChild(inputDiv);

            // Focus the input and handle Enter key
            setTimeout(() => {
                const input = document.getElementById('zipcodeInput');
                input.focus();
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        handleZipcodeInput();
                    }
                });
            }, 100);
        } else {
            // Create choice button
            const choiceDiv = document.createElement('div');
            choiceDiv.className = 'choice-button';
            choiceDiv.onclick = () => handleChoice(choice.value, choice.text);

            choiceDiv.innerHTML = `
                <span class="choice-icon">${choice.icon}</span>
                <div class="choice-text">
                    <div>${choice.text}</div>
                    ${choice.description ? `<div class="choice-description">${choice.description}</div>` : ''}
                </div>
            `;

            choicesContainer.appendChild(choiceDiv);
        }
    });

    inputContainer.style.display = 'block';
}

function handleZipcodeInput() {
    const zipcode = document.getElementById('zipcodeInput').value.trim();

    if (!zipcode) {
        alert('Please enter your ZIP code.');
        return;
    }

    // Validate ZIP code
    const isValidArea = checkServiceArea(zipcode);

    if (!isValidArea) {
        showUserMessage(zipcode);
        setTimeout(() => {
            showBotMessage("Sorry, we currently only service the Florida Panhandle area. Please contact us at (850) 555-POOP to check if we can expand to your area!");
            document.getElementById('conversationInput').style.display = 'none';
        }, 500);
        return;
    }

    conversationState.answers.zipcode = zipcode;
    showUserMessage(zipcode);
    document.getElementById('conversationInput').style.display = 'none';

    proceedToNextStep();
}

function handleChoice(value, text) {
    const currentStep = conversationState.step;
    const fieldMap = ['zipcode', 'dogs', 'yardsize', 'frequency'];

    conversationState.answers[fieldMap[currentStep]] = value;
    showUserMessage(text);
    document.getElementById('conversationInput').style.display = 'none';

    proceedToNextStep();
}

function proceedToNextStep() {
    conversationState.step++;
    updateProgress();

    setTimeout(() => {
        if (conversationState.step < conversationFlow.length) {
            // Show next question
            showBotMessage(conversationFlow[conversationState.step].question);
            setTimeout(() => {
                showChoices(conversationFlow[conversationState.step].choices);
            }, 1200);
        } else {
            // Calculate and show final estimate
            calculateAndShowEstimate();
        }
    }, 800);
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const currentStep = Math.min(conversationState.step + 1, conversationState.totalSteps);
    const percentage = (currentStep / conversationState.totalSteps) * 100;

    progressFill.style.width = percentage + '%';
    progressText.textContent = `Step ${currentStep} of ${conversationState.totalSteps}`;
}

function calculateAndShowEstimate() {
    const answers = conversationState.answers;

    // Calculate price using same logic as before
    const yardPricing = {
        'small': 25,
        'medium': 35,
        'large': 45,
        'xlarge': 60
    };

    let basePrice = yardPricing[answers.yardsize] || 35;

    const dogMultiplier = {
        '1': 1.0,
        '2': 1.3,
        '3': 1.5,
        '4+': 1.8
    };

    basePrice *= dogMultiplier[answers.dogs] || 1.0;

    let finalPrice = basePrice;
    let frequencyText = '';

    switch(answers.frequency) {
        case 'weekly':
            frequencyText = 'per week';
            break;
        case 'biweekly':
            finalPrice *= 0.8;
            frequencyText = 'bi-weekly';
            break;
        case 'onetime':
            finalPrice *= 1.5;
            frequencyText = 'one-time service';
            break;
    }

    finalPrice = Math.round(finalPrice / 5) * 5;

    // Store estimate data
    window.estimateData = {
        price: finalPrice,
        frequency: answers.frequency,
        dogs: answers.dogs,
        yardsize: answers.yardsize,
        zipcode: answers.zipcode
    };

    // Show final estimate message
    showBotMessage("Perfect! I've calculated your estimate based on your answers. Here's what your service would cost:");

    setTimeout(() => {
        showEstimateResult(finalPrice, frequencyText);
    }, 1500);
}

function showEstimateResult(price, frequencyText) {
    const container = document.getElementById('conversationContainer');

    const resultDiv = document.createElement('div');
    resultDiv.className = 'estimate-result-conversation';
    resultDiv.innerHTML = `
        <h3>Your Estimated Cost</h3>
        <div class="price-display-conversation">
            <span class="price-large">$${price}</span>
            <span class="frequency-text-large">${frequencyText}</span>
        </div>
        <div class="final-buttons">
            <button class="btn-primary" onclick="proceedToSignup()">Sign Me Up!</button>
            <button class="btn-secondary" onclick="restartConversation()">Start Over</button>
        </div>
    `;

    container.appendChild(resultDiv);
    container.scrollTop = container.scrollHeight;
    document.getElementById('conversationInput').style.display = 'none';
}

function restartConversation() {
    const container = document.getElementById('conversationContainer');
    container.innerHTML = '';
    initializeConversation();
}

function proceedToSignup() {
    const data = window.estimateData;
    if (data) {
        showBotMessage(`Awesome! I'll redirect you to complete your signup for ${data.frequency} service at $${data.price}${data.frequency === 'onetime' ? '' : ' ' + (data.frequency === 'weekly' ? 'per week' : 'bi-weekly')}. Thanks for choosing Scoop Unit! 🎉`);

        setTimeout(() => {
            // In production, redirect to signup page
            alert(`Redirecting to signup page with your estimate: $${data.price} ${data.frequency === 'weekly' ? 'per week' : data.frequency === 'biweekly' ? 'bi-weekly' : 'one-time service'}`);
        }, 2000);
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