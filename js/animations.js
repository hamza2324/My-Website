// Advanced Animations for AI Automation Agency Website

class AdvancedAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.initParallax();
        this.initScrollReveal();
        this.initHoverEffects();
        this.initPageTransitions();
        this.initInteractiveElements();
        this.initCursorEffects();
        this.initBackgroundEffects();
        this.initTypewriterEffect();
        this.initMorphingShapes();
        this.initGlitchEffects();
    }
    
    // Parallax Effects
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallaxSpeed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    // Scroll Reveal with Advanced Effects
    initScrollReveal() {
        const revealElements = document.querySelectorAll('[data-reveal]');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const revealType = element.dataset.reveal || 'fade-up';
                    const delay = element.dataset.revealDelay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('revealed');
                        
                        // Apply specific animation
                        switch(revealType) {
                            case 'slide-left':
                                element.style.animation = 'slideInLeft 0.8s ease forwards';
                                break;
                            case 'slide-right':
                                element.style.animation = 'slideInRight 0.8s ease forwards';
                                break;
                            case 'zoom-in':
                                element.style.animation = 'zoomIn 0.8s ease forwards';
                                break;
                            case 'flip':
                                element.style.animation = 'flipInX 0.8s ease forwards';
                                break;
                            default:
                                element.style.animation = 'fadeInUp 0.8s ease forwards';
                        }
                        
                        element.style.opacity = '0';
                        
                        // Add particles on reveal
                        if (element.dataset.revealParticles === 'true') {
                            this.createRevealParticles(element);
                        }
                        
                    }, delay);
                    
                    revealObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        revealElements.forEach(el => revealObserver.observe(el));
    }
    
    // Hover Effects
    initHoverEffects() {
        // 3D Hover Cards
        const hoverCards = document.querySelectorAll('.hover-3d');
        
        hoverCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = ((x - centerX) / centerX) * 10;
                const rotateX = ((centerY - y) / centerY) * 10;
                
                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale3d(1.05, 1.05, 1.05)
                `;
                
                // Add shine effect
                const shine = card.querySelector('.card-shine') || this.createShineElement();
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.3), transparent)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
        
        // Gradient Border Hover
        const gradientBorders = document.querySelectorAll('.gradient-border-hover');
        
        gradientBorders.forEach(border => {
            border.addEventListener('mousemove', (e) => {
                const rect = border.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                border.style.setProperty('--mouse-x', `${x}px`);
                border.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }
    
    // Page Transitions
    initPageTransitions() {
        const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.target === '_blank' || link.hasAttribute('download')) return;
                
                const href = link.getAttribute('href');
                if (href && href !== '#' && !href.includes('mailto:') && !href.includes('tel:')) {
                    e.preventDefault();
                    
                    // Create transition overlay
                    const overlay = this.createPageTransition();
                    
                    // Navigate after transition
                    setTimeout(() => {
                        window.location.href = href;
                    }, 800);
                }
            });
        });
    }
    
    // Interactive Elements
    initInteractiveElements() {
        // Interactive Code Blocks
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(block => {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
            copyBtn.title = 'Copy code';
            
            copyBtn.addEventListener('click', () => {
                const text = block.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
            });
            
            block.parentNode.style.position = 'relative';
            block.parentNode.appendChild(copyBtn);
        });
        
        // Interactive Stats
        const interactiveStats = document.querySelectorAll('.interactive-stat');
        
        interactiveStats.forEach(stat => {
            stat.addEventListener('click', () => {
                const currentValue = parseInt(stat.textContent);
                const maxValue = parseInt(stat.dataset.max) || currentValue * 2;
                
                this.animateValue(stat, currentValue, maxValue, 1000);
            });
        });
    }
    
    // Cursor Effects (decorate native cursor, do not hide it)
    initCursorEffects() {
        if (window.matchMedia('(pointer: fine)').matches) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            document.body.appendChild(cursor);
            
            const follower = document.createElement('div');
            follower.className = 'cursor-follower';
            document.body.appendChild(follower);
            
            let mouseX = 0, mouseY = 0;
            let cursorX = 0, cursorY = 0;
            let followerX = 0, followerY = 0;
            
            // Keep native cursor visible for usability
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            
            // Interactive elements
            const interactiveElements = document.querySelectorAll('a, button, .hover-effect');
            
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.classList.add('hover');
                    follower.classList.add('hover');
                });
                
                el.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hover');
                    follower.classList.remove('hover');
                });
            });
            
            // Animation loop
            const animate = () => {
                // Cursor
                cursorX += (mouseX - cursorX) * 0.1;
                cursorY += (mouseY - cursorY) * 0.1;
                cursor.style.left = cursorX + 'px';
                cursor.style.top = cursorY + 'px';
                
                // Follower
                followerX += (mouseX - followerX) * 0.05;
                followerY += (mouseY - followerY) * 0.05;
                follower.style.left = followerX + 'px';
                follower.style.top = followerY + 'px';
                
                requestAnimationFrame(animate);
            };
            
            animate();
        }
    }
    
    // Background Effects
    initBackgroundEffects() {
        // Animated gradient background
        const gradientBg = document.querySelector('.gradient-bg');
        if (gradientBg) {
            let hue = 0;
            
            setInterval(() => {
                hue = (hue + 1) % 360;
                gradientBg.style.background = `
                    linear-gradient(
                        45deg,
                        hsl(${hue}, 100%, 50%),
                        hsl(${(hue + 60) % 360}, 100%, 50%),
                        hsl(${(hue + 120) % 360}, 100%, 50%)
                    )
                `;
            }, 50);
        }
        
        // Floating elements
        const floatElements = document.querySelectorAll('.float-element');
        
        floatElements.forEach((el, index) => {
            const speed = parseFloat(el.dataset.floatSpeed) || 1;
            const amplitude = parseFloat(el.dataset.floatAmplitude) || 20;
            
            let time = index * 0.5;
            
            const float = () => {
                time += 0.01 * speed;
                const y = Math.sin(time) * amplitude;
                const x = Math.cos(time * 0.7) * amplitude * 0.5;
                
                el.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(float);
            };
            
            float();
        });
    }
    
    // Typewriter Effect
    initTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter-effect');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            
            let i = 0;
            const speed = parseInt(element.dataset.typeSpeed) || 50;
            const deleteSpeed = parseInt(element.dataset.deleteSpeed) || 30;
            const pause = parseInt(element.dataset.pause) || 2000;
            
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, speed);
                } else if (element.dataset.loop === 'true') {
                    setTimeout(deleteText, pause);
                }
            };
            
            const deleteText = () => {
                if (i > 0) {
                    element.textContent = text.substring(0, i - 1);
                    i--;
                    setTimeout(deleteText, deleteSpeed);
                } else {
                    setTimeout(typeWriter, 500);
                }
            };
            
            setTimeout(typeWriter, 500);
        });
    }
    
    // Morphing Shapes
    initMorphingShapes() {
        const morphShapes = document.querySelectorAll('.morph-shape');
        
        morphShapes.forEach(shape => {
            const paths = [
                'M50,20 C70,20 80,40 80,60 C80,80 70,90 50,90 C30,90 20,80 20,60 C20,40 30,20 50,20 Z',
                'M50,20 C60,10 80,10 90,30 C100,50 90,70 70,80 C50,90 30,80 20,60 C10,40 20,20 40,10 Z',
                'M50,20 C65,15 85,25 85,45 C85,65 75,85 55,90 C35,95 15,85 10,65 C5,45 15,25 35,15 Z'
            ];
            
            let currentPath = 0;
            
            setInterval(() => {
                const nextPath = (currentPath + 1) % paths.length;
                shape.querySelector('path').setAttribute('d', paths[nextPath]);
                currentPath = nextPath;
            }, 2000);
        });
    }
    
    // Glitch Effects
    initGlitchEffects() {
        const glitchElements = document.querySelectorAll('.glitch-effect');
        
        glitchElements.forEach(element => {
            setInterval(() => {
                element.classList.add('glitching');
                
                setTimeout(() => {
                    element.classList.remove('glitching');
                }, 100);
            }, 3000 + Math.random() * 7000);
        });
    }
    
    // Helper Methods
    createShineElement() {
        const shine = document.createElement('div');
        shine.className = 'card-shine';
        shine.style.position = 'absolute';
        shine.style.top = '0';
        shine.style.left = '0';
        shine.style.width = '100%';
        shine.style.height = '100%';
        shine.style.pointerEvents = 'none';
        shine.style.borderRadius = 'inherit';
        shine.style.zIndex = '1';
        shine.style.opacity = '0';
        shine.style.transition = 'opacity 0.3s ease';
        
        return shine;
    }
    
    createPageTransition() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        
        // Create grid of squares
        const gridSize = 10;
        for (let i = 0; i < gridSize * gridSize; i++) {
            const square = document.createElement('div');
            square.className = 'transition-square';
            square.style.width = `${100 / gridSize}%`;
            square.style.height = `${100 / gridSize}%`;
            square.style.background = 'var(--color-primary)';
            square.style.opacity = '0';
            square.style.transition = `opacity 0.3s ease ${i * 0.01}s`;
            overlay.appendChild(square);
        }
        
        document.body.appendChild(overlay);
        
        // Animate squares
        setTimeout(() => {
            overlay.querySelectorAll('.transition-square').forEach(square => {
                square.style.opacity = '1';
            });
        }, 10);
        
        return overlay;
    }
    
    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(progress * (end - start) + start);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }
    
    createRevealParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'reveal-particle';
            
            // Random properties
            const size = Math.random() * 4 + 2;
            const posX = Math.random() * rect.width;
            const posY = Math.random() * rect.height;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            const duration = Math.random() * 0.5 + 0.5;
            
            // Set styles
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            particle.style.background = 'var(--color-primary)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            element.style.position = 'relative';
            element.appendChild(particle);
            
            // Animate
            const startX = posX;
            const startY = posY;
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            
            particle.animate([
                {
                    transform: `translate(0, 0) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            });
            
            // Remove after animation
            setTimeout(() => particle.remove(), duration * 1000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedAnimations();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAnimations;
}