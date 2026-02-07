// Main JavaScript File for AI Automation Agency Website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initHeroAnimations();
    initServiceCards();
    initBlogCards();
    initContactForm();
    initScrollAnimations();
    initParticleEffects();
    initCounters();
    initMobileMenu();
    initFormValidation();
    initSmoothScroll();
    initLazyLoading();
    initSEOOptimization();
});

// Navigation
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Highlight active navigation link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            // Scroll Down
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            // Scroll Up
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
        
        // Add scrolled class for background change
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    mobileMenuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking links
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Hero Animations
function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroStats = document.querySelector('.hero-stats');
    const heroActions = document.querySelector('.hero-actions');
    
    if (heroTitle) {
        heroTitle.style.animation = 'fadeInUp 1s ease forwards';
    }
    
    if (heroDescription) {
        heroDescription.style.animation = 'fadeInUp 1s ease forwards 0.3s';
        heroDescription.style.opacity = '0';
    }
    
    if (heroStats) {
        heroStats.style.animation = 'fadeInUp 1s ease forwards 0.6s';
        heroStats.style.opacity = '0';
    }
    
    if (heroActions) {
        heroActions.style.animation = 'fadeInUp 1s ease forwards 0.9s';
        heroActions.style.opacity = '0';
    }
    
    // Animate automation flow
    const flowNodes = document.querySelectorAll('.flow-node');
    const flowConnectors = document.querySelectorAll('.flow-connector');
    
    flowNodes.forEach((node, index) => {
        node.style.animation = `bounceIn 0.8s ease forwards ${index * 0.3}s`;
        node.style.opacity = '0';
    });
    
    flowConnectors.forEach((connector, index) => {
        connector.style.animation = `fadeIn 0.8s ease forwards ${index * 0.3 + 0.15}s`;
        connector.style.opacity = '0';
    });
}

// Service Cards Animation
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = `fadeInUp 0.8s ease forwards ${index * 0.1}s`;
                    entry.target.style.opacity = '0';
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    serviceCards.forEach(card => observer.observe(card));
}

// Blog Cards Animation
function initBlogCards() {
    const blogCards = document.querySelectorAll('.blog-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = `fadeInUp 0.8s ease forwards ${index * 0.1}s`;
                    entry.target.style.opacity = '0';
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    blogCards.forEach(card => observer.observe(card));
}

// Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Submit to Formspree
        fetch('https://formspree.io/f/mpqjagyd', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        })
        .then(response => {
            if (response.ok) {
                showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                contactForm.reset();

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_form_submit', {
                        'event_category': 'Contact',
                        'event_label': 'Form Submission'
                    });
                }
            } else {
                showNotification('Something went wrong sending your message. Please try again.', 'error');
            }
        })
        .catch(() => {
            showNotification('Network error while sending your message. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
    
    // Newsletter form — sends to Formspree (configure hamzajadoon71@gmail.com in Formspree)
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[name="email"]');
            const email = emailInput && emailInput.value ? emailInput.value.trim() : '';
            if (!email || !isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
                submitBtn.disabled = true;
            }
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(res => res.json())
            .then(() => {
                showNotification('Thank you for subscribing! You’ll hear from us.', 'success');
                this.reset();
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_subscribe', { event_category: 'Newsletter', event_label: 'Subscription' });
                }
            })
            .catch(() => showNotification('Something went wrong. Please try again.', 'error'))
            .finally(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = originalHtml;
                    submitBtn.disabled = false;
                }
            });
        });
    }
}

// Scroll Animations
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Add specific animation based on data attribute
                const animation = entry.target.dataset.animation || 'fadeInUp';
                entry.target.style.animation = `${animation} 0.8s ease forwards`;
                entry.target.style.opacity = '0';
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animateElements.forEach(el => observer.observe(el));
}

// Particle Effects
function initParticleEffects() {
    const heroParticles = document.getElementById('heroParticles');
    if (!heroParticles) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(heroParticles);
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 2;
        
        // Set styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.background = `rgba(225, 29, 72, ${Math.random() * 0.3 + 0.1})`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
        
        // Remove and recreate particle after animation
        setTimeout(() => {
            particle.remove();
            createParticle(container);
        }, (delay + duration) * 1000);
    }
}

// Counter Animations
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                const duration = 2000; // 2 seconds
                const step = target / (duration / 16); // 60fps
                let current = 0;
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current);
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => observer.observe(counter));
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateInput(input);
            });
            
            input.addEventListener('input', () => {
                clearError(input);
            });
        });
    });
    
    function validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        const isRequired = input.required;
        
        if (isRequired && !value) {
            showInputError(input, 'This field is required');
            return false;
        }
        
        if (type === 'email' && value && !isValidEmail(value)) {
            showInputError(input, 'Please enter a valid email address');
            return false;
        }
        
        if (type === 'tel' && value && !isValidPhone(value)) {
            showInputError(input, 'Please enter a valid phone number');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function showInputError(input, message) {
        clearError(input);
        
        const error = document.createElement('div');
        error.className = 'input-error';
        error.textContent = message;
        error.style.color = 'var(--color-error)';
        error.style.fontSize = '0.8rem';
        error.style.marginTop = '0.25rem';
        
        input.parentNode.appendChild(error);
        input.classList.add('error');
    }
    
    function clearError(input) {
        const error = input.parentNode.querySelector('.input-error');
        if (error) {
            error.remove();
        }
        input.classList.remove('error');
    }
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL hash
            history.pushState(null, null, targetId);
        });
    });
}

// Lazy Loading
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// SEO Optimization
function initSEOOptimization() {
    // Update page title with current section
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const sectionName = entry.target.querySelector('h2, h1')?.textContent || '';
                
                // Update page title for better SEO
                if (sectionName && sectionId !== 'hero') {
                    document.title = `${sectionName} | AI Automation Agency`;
                }
                
                // Update URL for better UX
                history.replaceState(null, null, `#${sectionId}`);
            }
        });
    }, {
        threshold: 0.5
    });
    
    sections.forEach(section => observer.observe(section));
    
    // Structured data for current page
    addStructuredData();
}

// Helper Functions
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 1.5rem';
    notification.style.background = getNotificationColor(type);
    notification.style.color = 'white';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '0.75rem';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = 'var(--shadow-lg)';
    notification.style.animation = 'slideInRight 0.3s ease forwards';
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => notification.remove(), 300);
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'var(--color-success)';
        case 'error': return 'var(--color-error)';
        case 'warning': return 'var(--color-warning)';
        default: return 'var(--color-info)';
    }
}

function addStructuredData() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    const data = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "AI Automation Agency",
        "url": "https://hamzajadoon.cloud",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://hamzajadoon.cloud/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
    
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

// Performance Optimization
window.addEventListener('load', () => {
    // Remove loading class
    document.body.classList.add('loaded');
    
    // Initialize service worker if supported
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
    
    // Send pageview to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error.message,
            fatal: false
        });
    }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        isValidPhone,
        showNotification
    };
}