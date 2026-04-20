/**
 * Learning Path — Client Logic
 * Manages premium gating and modal interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('alielAuthReady', handleAuthUpdate);

    // Fallback: if auth already loaded before this script runs
    if (typeof window.getCurrentUser === 'function') {
        const user = window.getCurrentUser();
        if (user) {
            handleAuthUpdate({ detail: { user } });
        }
    }
});

/**
 * Handle auth state changes — lock or unlock B1–C2 levels.
 */
function handleAuthUpdate(e) {
    const user = e.detail ? e.detail.user : null;
    const isPremium = typeof window.isUserPremium === 'function' && window.isUserPremium();

    const lockedLevels = document.querySelectorAll('.locked-level');

    lockedLevels.forEach(level => {
        const overlay = level.querySelector('.lock-overlay');
        const badge = level.querySelector('.level-badge');

        if (user && isPremium) {
            // Unlock
            level.classList.remove('locked');
            if (overlay) overlay.style.display = 'none';
            if (badge) {
                badge.style.background = 'var(--primary-color)';
                badge.style.color = '#fff';
            }
        } else {
            // Lock
            level.classList.add('locked');
            if (overlay) overlay.style.display = 'flex';
            if (badge) {
                badge.style.background = 'var(--bg-tertiary)';
                badge.style.color = '#888';
            }
        }
    });

    // Check premium expiration if function exists
    if (typeof window.checkPremiumExpiration === 'function') {
        window.checkPremiumExpiration();
    }
}

/**
 * Open the premium purchase/contact modal.
 * If user is not logged in, prompt login first.
 */
function openPremiumModal() {
    const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;

    if (!user) {
        // Not logged in — show login modal first
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        showToast('🔒 Pro statusu almaq üçün əvvəlcə hesabınıza daxil olun.');
        return;
    }

    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close the premium modal.
 */
function closePremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Show a temporary toast notification.
 */
function showToast(message) {
    // Remove any existing toast
    const existing = document.querySelector('.lp-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'lp-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closePremiumModal();
            }
        });
    }
});
