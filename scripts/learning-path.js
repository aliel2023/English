/**
 * Learning Path — Client Logic
 * Manages premium gating and modal interactions.
 * Robust handling for auth module timing.
 */

(function () {
    'use strict';

    let _authHandled = false;
    let _pollCount = 0;
    const MAX_POLLS = 40; // 40 * 250ms = 10 seconds max

    // Listen for auth ready event
    document.addEventListener('alielAuthReady', function onAuthReady(e) {
        _authHandled = true;
        handleAuthUpdate(e.detail ? e.detail.user : null);
    });

    // DOMContentLoaded — start polling fallback
    document.addEventListener('DOMContentLoaded', function () {
        // Remove loading class from body
        document.body.classList.remove('loading');

        // If auth already fired before we registered, handle immediately
        if (!_authHandled && typeof window.getCurrentUser === 'function') {
            const user = window.getCurrentUser();
            if (user) {
                _authHandled = true;
                handleAuthUpdate(user);
                return;
            }
        }

        // Polling fallback: wait for auth.js module to load and fire
        if (!_authHandled) {
            startAuthPolling();
        }
    });

    /**
     * Poll for auth readiness — auth.js is an ES module that loads deferred.
     * This ensures we catch the premium state even if the event already fired.
     */
    function startAuthPolling() {
        const poll = setInterval(function () {
            _pollCount++;

            if (_authHandled) {
                clearInterval(poll);
                return;
            }

            // Check if isUserPremium function exists (auth.js loaded)
            if (typeof window.isUserPremium === 'function') {
                const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
                _authHandled = true;
                handleAuthUpdate(user);
                clearInterval(poll);
                return;
            }

            // Timeout after MAX_POLLS
            if (_pollCount >= MAX_POLLS) {
                clearInterval(poll);
                // Auth never loaded—keep locked state (not logged in)
                handleAuthUpdate(null);
            }
        }, 250);
    }

    /**
     * Handle auth state — lock or unlock B1–C2 levels.
     */
    function handleAuthUpdate(user) {
        const isPremium = user && typeof window.isUserPremium === 'function' && window.isUserPremium();

        const lockedLevels = document.querySelectorAll('.locked-level');

        lockedLevels.forEach(function (level) {
            const overlay = level.querySelector('.lock-overlay');
            const badge = level.querySelector('.level-badge');

            if (isPremium) {
                // Unlock
                level.classList.remove('locked');
                if (overlay) overlay.style.display = 'none';
                if (badge) {
                    badge.style.background = 'var(--primary-color, var(--ds-primary, #e63946))';
                    badge.style.color = '#fff';
                }
            } else {
                // Lock
                level.classList.add('locked');
                if (overlay) overlay.style.display = 'flex';
                if (badge) {
                    badge.style.background = 'var(--bg-tertiary, #1a1a24)';
                    badge.style.color = '#888';
                }
            }
        });

        // Check premium expiration
        if (typeof window.checkPremiumExpiration === 'function') {
            window.checkPremiumExpiration();
        }
    }

    /**
     * Open the premium purchase/contact modal.
     * If user is not logged in, prompt login first.
     */
    window.openPremiumModal = function () {
        var user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;

        if (!user) {
            if (typeof window.openAuthModal === 'function') {
                window.openAuthModal('login');
            }
            showToastLP('🔒 Pro statusu almaq üçün əvvəlcə hesabınıza daxil olun.');
            return;
        }

        // If already premium, show info
        if (typeof window.isUserPremium === 'function' && window.isUserPremium()) {
            showToastLP('✅ Siz artıq Pro istifadəçisiniz! Bütün materiallar açıqdır.');
            return;
        }

        var modal = document.getElementById('premiumModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    /**
     * Close the premium modal.
     */
    window.closePremiumModal = function () {
        var modal = document.getElementById('premiumModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    /**
     * Show a temporary toast notification (scoped to avoid conflicts).
     */
    function showToastLP(message) {
        var existing = document.querySelector('.lp-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'lp-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () { toast.remove(); }, 400);
        }, 3500);
    }

    // Close modal on backdrop click
    document.addEventListener('DOMContentLoaded', function () {
        var modal = document.getElementById('premiumModal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === this) {
                    window.closePremiumModal();
                }
            });
        }
    });

    // Re-check when navigating back to the page (e.g., after admin grants premium)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible' && typeof window.isUserPremium === 'function') {
            var user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
            handleAuthUpdate(user);
        }
    });

})();
