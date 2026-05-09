// global-nav.js
// Handles the minimalist header and sidebar overlay logic

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.ds-hamburger');
    const sidebar = document.querySelector('.ds-sidebar');
    const overlay = document.querySelector('.ds-sidebar-overlay');
    const closeBtn = document.querySelector('.ds-sidebar-close');

    function openSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    function closeSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    if (hamburger) {
        hamburger.addEventListener('click', openSidebar);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
});
