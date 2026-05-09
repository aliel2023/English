/**
 * Alielenglish - Premium Motion Design & Interaction
 * Handles cursor particle trails, smooth scroll reveals, and elevation physics.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCursorParticles();
    initScrollReveals();
});

/**
 * 1. Cursor Particle Trail (Dust Effect)
 * A lightweight canvas-based particle system that follows the mouse.
 */
function initCursorParticles() {
    // Only enable on non-touch devices to save performance on mobile
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9998'; // Just below tooltip/toast
    document.body.appendChild(canvas);

    let width, height;
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    let mouse = { x: width / 2, y: height / 2, moved: false };

    const _particleColors = [
        'rgba(230, 57, 70, ',   // Red
        'rgba(180, 60, 140, ',  // Purple
        'rgba(100, 100, 230, ', // Blue
        'rgba(230, 120, 50, ',  // Orange
    ];
    let _colorIdx = 0;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.moved = true;
        
        // Spawn 1 particle on movement (optimized)
        _colorIdx = (_colorIdx + 1) % _particleColors.length;
        particles.push({
            x: mouse.x + (Math.random() - 0.5) * 10,
            y: mouse.y + (Math.random() - 0.5) * 10,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 1.5,
            speedY: (Math.random() - 0.5) * 1.5 - 0.5,
            life: 1,
            decay: Math.random() * 0.02 + 0.015,
            color: _particleColors[_colorIdx]
        });
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                i--;
                continue;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.life + ')';
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }
    animate();
}

/**
 * 2. Intersection Observer for Scroll Reveals
 * Adds dynamic "slide-up" and "fade-in" as elements enter the viewport.
 */
function initScrollReveals() {
    const revealElements = document.querySelectorAll('.feature-card, .qa-card, .stat-item, .section-title');
    
    // Add initial reveal class
    revealElements.forEach(el => {
        el.classList.add('ds-reveal');
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class
                entry.target.classList.add('visible');
                // Unobserve to run animation only once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach((el, index) => {
        // Stagger delay based on index within siblings
        const delay = (index % 4) * 1; 
        if (delay > 0) {
            el.classList.add(`ds-reveal-delay-${delay}`);
        }
        revealObserver.observe(el);
    });
}
