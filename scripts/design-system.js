/**
 * ALIELENGLISH — Design System JavaScript v2.0
 * Handles: page transitions, scroll reveal, toast notifications,
 *          sticky header, and other UI micro-interactions.
 */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────
       1. STICKY HEADER — scroll-aware class
    ────────────────────────────────────────────── */
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    /* ──────────────────────────────────────────────
       2. SCROLL REVEAL ANIMATION
       Adds .visible to any element with class .ds-reveal
       when it enters the viewport.
    ────────────────────────────────────────────── */
    const initScrollReveal = () => {
        const revealEls = document.querySelectorAll('.ds-reveal');
        if (!revealEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -60px 0px'
        });

        revealEls.forEach(el => observer.observe(el));
    };

    /* ──────────────────────────────────────────────
       3. PAGE TRANSITION
       Fades out → navigate → new page fades in.
    ────────────────────────────────────────────── */
    const initPageTransitions = () => {
        // Create overlay element if not present
        let overlay = document.getElementById('ds-page-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'ds-page-overlay';
            overlay.style.cssText = [
                'position:fixed', 'inset:0',
                'background:rgba(0,0,0,0.45)',
                'z-index:9990',
                'opacity:0',
                'pointer-events:none',
                'transition:opacity 350ms cubic-bezier(0.4,0,0.2,1)'
            ].join(';');
            document.body.appendChild(overlay);
        }

        // Fade in on load
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 400ms ease';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.style.opacity = '1';
            });
        });

        // Intercept internal navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            // Only intercept same-origin HTML navigations
            if (!href ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('http') ||
                link.hasAttribute('target') ||
                e.ctrlKey || e.metaKey || e.shiftKey) {
                return;
            }

            e.preventDefault();
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'all';
            document.body.style.opacity = '0';

            setTimeout(() => {
                window.location.href = href;
            }, 380);
        });
    };

    /* ──────────────────────────────────────────────
       4. TOAST NOTIFICATION SYSTEM
       Usage: window.DS.toast({ title, msg, type, duration })
       type: 'success' | 'error' | 'warning' | 'info'
    ────────────────────────────────────────────── */
    const initToastSystem = () => {
        let container = document.getElementById('ds-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ds-toast-container';
            container.className = 'ds-toast-container';
            document.body.appendChild(container);
        }

        const ICONS = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const showToast = ({ title = '', msg = '', type = 'info', duration = 4000 } = {}) => {
            const toast = document.createElement('div');
            toast.className = `ds-toast ds-toast-${type}`;
            toast.innerHTML = `
                <span class="ds-toast-icon">${ICONS[type] || 'ℹ️'}</span>
                <div>
                    ${title ? `<div class="ds-toast-title">${title}</div>` : ''}
                    ${msg ? `<div class="ds-toast-msg">${msg}</div>` : ''}
                </div>
            `;

            container.appendChild(toast);

            const dismiss = () => {
                toast.classList.add('dismissing');
                toast.addEventListener('animationend', () => toast.remove(), { once: true });
                setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
            };

            toast.addEventListener('click', dismiss);
            setTimeout(dismiss, duration);

            return { dismiss };
        };

        return showToast;
    };

    /* ──────────────────────────────────────────────
       5. CARD STAGGER ON SCROLL
       Auto-applies ds-card-animated + delay to grid children
       when they have parent with class .ds-stagger-grid
    ────────────────────────────────────────────── */
    const initCardStagger = () => {
        const grids = document.querySelectorAll('.ds-stagger-grid');
        grids.forEach(grid => {
            const cards = grid.querySelectorAll('.ds-card, .qa-card, .feature-card');
            cards.forEach((card, i) => {
                card.classList.add('ds-reveal');
                card.style.transitionDelay = `${i * 60}ms`;
            });
        });
    };

    /* ──────────────────────────────────────────────
       6. SKELETON SCREEN HELPER
       Usage: DS.skeleton(element, true/false)
    ────────────────────────────────────────────── */
    const skeletonHelper = (el, active) => {
        if (!el) return;
        if (active) {
            el.dataset.dsOrigText = el.textContent;
            el.classList.add('ds-skeleton');
            el.style.color = 'transparent';
        } else {
            el.classList.remove('ds-skeleton');
            el.style.color = '';
            if (el.dataset.dsOrigText) {
                el.textContent = el.dataset.dsOrigText;
            }
        }
    };

    /* ──────────────────────────────────────────────
       7. PROGRESS BAR ANIMATION
       Usage: DS.setProgress(element, percentage)
    ────────────────────────────────────────────── */
    const setProgress = (el, pct) => {
        if (!el) return;
        const fill = el.querySelector('.ds-progress-fill') || el;
        fill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    /* ──────────────────────────────────────────────
       INIT
    ────────────────────────────────────────────── */
    const init = () => {
        initScrollReveal();
        if (!window.DS_SKIP_TRANSITIONS) {
            initPageTransitions();
        }
        initCardStagger();
    };

    // Expose public API
    const toast = initToastSystem();
    window.DS = {
        toast,
        skeleton: skeletonHelper,
        setProgress,
        showToast: toast   // alias
    };

    // Init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
