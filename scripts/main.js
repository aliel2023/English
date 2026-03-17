// ===== MAIN.JS - CORE FUNCTIONS =====

// ===== Mobile Menu Toggle (Sidebar style) =====
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const isOpen = navMenu && navMenu.classList.contains('active');

    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (navMenu) navMenu.classList.add('active');
    if (mobileToggle) mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden'; // lock scroll
}

function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (navMenu) navMenu.classList.remove('active');
    if (mobileToggle) mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
}


// ===== Email Modal → register.html yönləndirmə =====
function openEmailModal() {
    // Köhnə modal yerinə register səhifəsinə yönləndir
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = 'register.html';
}

function closeEmailModal() {
    // Artıq modal yoxdur, amma köhnə çağırışlar üçün saxlanılır
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}


// ===== Email Form Submission =====
function handleEmailFormSubmit(e) {
    e.preventDefault();
    // Email modal artıq register.html-ə yönləndirir
    // Bu handler uygunluq nəmınə saxlanılıb
    window.location.href = 'register.html';
}

// ===== Progress Tracker =====
function getUserProgress() {
    const userData = localStorage.getItem('alielUser');
    if (userData) {
        return JSON.parse(userData).progress;
    }
    return null;
}

function updateProgress(level, lessons, score) {
    const userData = JSON.parse(localStorage.getItem('alielUser') || '{}');
    if (userData.progress) {
        userData.progress.level = level;
        userData.progress.completedLessons = lessons;
        userData.progress.testScore = score;
        localStorage.setItem('alielUser', JSON.stringify(userData));
    }
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Active Navigation Highlight =====
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== Download Statistics =====
function showDownloadStats() {
    const downloads = parseInt(localStorage.getItem('totalDownloads') || '0');
    if (downloads > 0) {
        console.log(`Total downloads: ${downloads}`);
    }
}

// ===== FAQ Toggle =====
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    if (!faqItem) return;

    const isActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// ===== Keyboard Accessibility =====
function initKeyboardAccessibility() {
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Close mobile menu
            closeMobileMenu();
            // Close email modal
            closeEmailModal();
            // Close all other modals
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// ===== Close Mobile Menu on Outside Click + Swipe =====
function initMobileMenuClose() {
    // Backdrop tap to close
    document.addEventListener('click', function (e) {
        const navMenu = document.getElementById('navMenu');
        const toggle = document.querySelector('.mobile-toggle');

        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && toggle && !toggle.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });

    // Close menu links on click (mobile navigation)
    document.addEventListener('click', function (e) {
        const link = e.target.closest('.nav-menu a');
        if (link) {
            const navMenu = document.getElementById('navMenu');
            if (navMenu && navMenu.classList.contains('active')) {
                // Let the link navigate, then close
                setTimeout(closeMobileMenu, 150);
            }
        }
    });

    // Touch swipe-left to close menu
    let touchStartX = 0;
    document.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        const navMenu = document.getElementById('navMenu');
        if (diff > 60 && navMenu && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }, { passive: true });
}


// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function () {
    // Set active navigation
    setActiveNav();

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize keyboard accessibility
    initKeyboardAccessibility();

    // Initialize mobile menu close
    initMobileMenuClose();

    // Show download stats in console
    showDownloadStats();

    // Email modal close on outside click
    const emailModal = document.getElementById('emailModal');
    if (emailModal) {
        emailModal.addEventListener('click', function (e) {
            if (e.target === emailModal) {
                closeEmailModal();
            }
        });
    }

    // Email form submission
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailFormSubmit);
    }

    // Initialize global AI Chat (handled by ai-teacher.js)
    // initAIChat() is now a no-op — AI Teacher widget loads separately
    if (typeof initAIChat === 'function') initAIChat();

    // Initialize Footer Modals (FAQ & Privacy)
    initFooterModals();
});

// ===== Language Dropdown Toggle =====
function toggleLangDropdown() {
    const langMenu = document.getElementById('langMenu');
    if (langMenu) {
        langMenu.classList.toggle('show');
    }
}

// Close Dropdown on outside click
document.addEventListener('click', function (e) {
    const langDropdown = document.querySelector('.lang-dropdown');
    const langMenu = document.getElementById('langMenu');

    if (langDropdown && langMenu) {
        if (!langDropdown.contains(e.target)) {
            langMenu.classList.remove('show');
        }
    }
});

function initFooterModals() {
    const modalsHTML = `
        <div id="faqModal" class="modal">
            <div class="modal-content" style="max-width: 600px; text-align: left;">
                <button class="modal-close" onclick="closeDocModal('faqModal')">&times;</button>
                <h2 style="margin-bottom: 20px;">❓ Tez-tez Verilən Suallar</h2>
                <div class="faq-item" onclick="toggleFAQ(this)">
                    <div class="faq-question">Ödəniş üsulları nələrdir? <span class="faq-icon">+</span></div>
                    <div class="faq-answer"><p>Bank kartı, Apple Pay və Google Pay qəbul olunur.</p></div>
                </div>
                <div class="faq-item" onclick="toggleFAQ(this)">
                    <div class="faq-question">Pulsuz planın müddəti varmı? <span class="faq-icon">+</span></div>
                    <div class="faq-answer"><p>Xeyr, pulsuz plan hər zaman pulsuz olaraq qalır.</p></div>
                </div>
            </div>
        </div>
        <div id="privacyModal" class="modal">
            <div class="modal-content" style="max-width: 600px; text-align: left; max-height: 80vh; overflow-y: auto;">
                <button class="modal-close" onclick="closeDocModal('privacyModal')">&times;</button>
                <h2 style="margin-bottom: 20px;">🔒 Məxfilik Siyasəti</h2>
                <p>Biz istifadəçi məlumatlarının məxfiliyinə hörmətlə yanaşırıq.</p>
                <h3 style="margin-top:20px; font-size: 1.1em;">1. Məlumatların Toplanması</h3>
                <p>Qeydiyyat zamanı yalnız tələb olunan minimum informasiya, adınız və e-mail adresiniz toplanır.</p>
                <h3 style="margin-top:20px; font-size: 1.1em;">2. Məlumatların Paylaşılması</h3>
                <p>Şəxsi məlumatlarınız heç bir halda üçüncü tərəflərə ötürülmür və reklam məqsədilə satılmır.</p>
                <p style="margin-top:20px;">Bu məsələlərlə bağlı əlavə sualınız olarsa, əlaqə hissəsindən bizə yazın.</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    const faqLinks = document.querySelectorAll('a[href="#faq"]');
    faqLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('faqModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const privacyLinks = document.querySelectorAll('a[href="#privacy"]');
    privacyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('privacyModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

function closeDocModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}


// ===== AI CHAT — Legacy stub =====
// The full AI Teacher widget is in scripts/ai-teacher.js
// This stub keeps backward compatibility if any page calls initAIChat()
function initAIChat() {
    // No-op: AI Teacher widget auto-initializes from ai-teacher.js
}