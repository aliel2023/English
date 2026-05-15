/**
 * ALIELENGLISH — Scroll to Top Button
 * Appears after scrolling 300px, smooth scroll to top
 */
(function() {
    'use strict';

    // Create button element
    const btn = document.createElement('button');
    btn.id = 'scrollToTopBtn';
    btn.setAttribute('aria-label', 'Yuxarı qayıt');
    btn.setAttribute('title', 'Yuxarı qayıt');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btn);

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        #scrollToTopBtn {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 9990;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #e63946 0%, #c1121f 100%);
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(230, 57, 70, 0.4), 0 0 0 0 rgba(230, 57, 70, 0);
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.8);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease, box-shadow 0.2s ease;
        }
        #scrollToTopBtn.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }
        #scrollToTopBtn:hover {
            transform: translateY(-3px) scale(1.08);
            box-shadow: 0 8px 30px rgba(230, 57, 70, 0.55), 0 0 0 4px rgba(230, 57, 70, 0.15);
        }
        #scrollToTopBtn:active {
            transform: translateY(0) scale(0.95);
        }
        @media (max-width: 768px) {
            #scrollToTopBtn {
                bottom: 1.25rem;
                right: 1.25rem;
                width: 44px;
                height: 44px;
            }
        }
    `;
    document.head.appendChild(style);

    // Show/hide on scroll
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                if (window.scrollY > 300) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Scroll to top on click
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
