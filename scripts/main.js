/* ══════════════════════════════════════════════
   main.js — Alielenglish Navigation & Utilities
   ══════════════════════════════════════════════ */

/* ── Sidebar / Nav overlay helpers ── */
function _getSidebarOverlay() {
  return document.getElementById('navOverlay');
}

function toggleMobileMenu(e) {
  if (e) e.preventDefault();
  const menu = document.getElementById('navMenu');
  if (!menu) return;
  menu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.mobile-toggle, .ds-hamburger');
    toggles.forEach(t => t.addEventListener('click', toggleMobileMenu));
});

function openMobileMenu() {
  const menu = document.getElementById('navMenu');
  const toggle = document.querySelector('.mobile-toggle');
  const overlay = _getSidebarOverlay();
  if (menu) menu.classList.add('active');
  if (toggle) toggle.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menu = document.getElementById('navMenu');
  const toggle = document.querySelector('.mobile-toggle');
  const overlay = _getSidebarOverlay();
  if (menu) menu.classList.remove('active');
  if (toggle) toggle.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function initSidebarNav() {
  /* 1 — Overlay yarat */
  if (!document.getElementById('navOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'navOverlay';
    overlay.className = 'nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', closeMobileMenu);
    document.body.appendChild(overlay);
  }

  /* 2 — nav-menu daxilinə sidebar header inject et (logo + bağla düyməsi) */
  const menu = document.getElementById('navMenu');
  if (menu && !menu.querySelector('.nav-sidebar-header')) {
    const hdr = document.createElement('div');
    hdr.className = 'nav-sidebar-header';
    hdr.innerHTML = `
      <a href="index.html" class="nav-sidebar-logo" aria-label="Ana Səhifə">
        <div class="sidebar-logo-icon">A</div>
        <span class="sidebar-logo-text">Alielenglish</span>
      </a>
      <button class="nav-sidebar-close" onclick="closeMobileMenu()" aria-label="Menyunu bağla">&#x2715;</button>
    `;
    menu.insertBefore(hdr, menu.firstChild);
  }

  /* 3 — Yuxarıdakı logo-section-u <a href="index.html"> kimi çevir */
  const logoSec = document.querySelector('.logo-section');
  if (logoSec && logoSec.tagName !== 'A') {
    const a = document.createElement('a');
    a.href = 'index.html';
    a.className = 'logo-section';
    a.setAttribute('aria-label', 'Ana Səhifəyə qayıt');
    a.style.textDecoration = 'none';
    while (logoSec.firstChild) a.appendChild(logoSec.firstChild);
    logoSec.replaceWith(a);
  }

  /* 4 — Swipe SAĞ → bağlasın (panel sağdan açılır) */
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX; // sağdan sola swipe = neqativ
    const m = document.getElementById('navMenu');
    // Panel sağdan açılır — sağa swipe (diff > 60) bağlasın
    if (diff > 60 && m && m.classList.contains('active')) closeMobileMenu();
  }, { passive: true });

  /* 5 — Nav link klikləndikdə menyunu bağla */
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-menu a') && !e.target.closest('.nav-sidebar-header') && !e.target.closest('.nav-sidebar-footer')) {
      const m = document.getElementById('navMenu');
      if (m && m.classList.contains('active')) setTimeout(closeMobileMenu, 150);
    }
  });

  /* 6 — Sidebar footer: dil seçimi + auth bölməsi */
  if (menu && !menu.querySelector('.nav-sidebar-footer')) {
    const footer = document.createElement('div');
    footer.className = 'nav-sidebar-footer';
    footer.id = 'navSidebarFooter';
    footer.innerHTML = `
      <div class="nav-sidebar-lang">
        <button class="sidebar-lang-btn" onclick="switchLanguage('az',event)">AZ</button>
        <button class="sidebar-lang-btn" onclick="switchLanguage('en',event)">EN</button>
      </div>
      <div class="nav-sidebar-auth" id="navSidebarAuth">
        <a href="login.html" class="sidebar-auth-btn sidebar-login-btn">🔑 <span data-i18n="nav.login">Daxil Ol</span></a>
        <a href="register.html" class="sidebar-auth-btn sidebar-register-btn">✨ <span>Qeydiyyat</span></a>
      </div>
    `;
    menu.appendChild(footer);
  }

  /* 7 — Auth vəziyyətini yoxla, sidebar-ı yenilə */
  _updateSidebarAuth();
}

/* Auth vəziyyətinə görə sidebar footer-ini yenilə */
function _updateSidebarAuth() {
     else {
    // Inline fallback — localStorage-dan yoxla
    try {
      const stored = localStorage.getItem('alielUser');
      const user = stored ? JSON.parse(stored) : null;
      _renderSidebarAuthUI(user);
    } catch(e) {
      _renderSidebarAuthUI(null);
    }
  }
  // auth.js-dən custom event dinlə
  document.addEventListener('authStateChanged', (e) => {
    _renderSidebarAuthUI(e.detail);
  });
}

function _renderSidebarAuthUI(user) {
  const container = document.getElementById('navSidebarAuth');
  if (!container) return;

  if (user) {
    // İstifadəçi daxil olub
    const name = user.displayName || user.name || user.email || 'İstifadəçi';
    const initial = name.charAt(0).toUpperCase();
    const isPremium = user.isPremium || false;
    container.innerHTML = `
      <div class="sidebar-user-info">
        <div class="sidebar-user-avatar">${initial}</div>
        <div class="sidebar-user-details">
          <span class="sidebar-user-name">${name}</span>
          <span class="sidebar-user-badge">${isPremium ? '👑 Premium' : '🆓 Pulsuz'}</span>
        </div>
      </div>
      <a href="dashboard.html" class="sidebar-auth-btn sidebar-dashboard-btn">📊 Dashboard</a>
      <button onclick="if(typeof logoutUser==='function')logoutUser()" class="sidebar-auth-btn sidebar-logout-btn">🚪 Çıxış</button>
    `;
  } else {
    // Giriş edilməyib
    container.innerHTML = `
      <a href="login.html" class="sidebar-auth-btn sidebar-login-btn">🔑 <span data-i18n="nav.login">Daxil Ol</span></a>
      <a href="register.html" class="sidebar-auth-btn sidebar-register-btn">✨ Qeydiyyat</a>
    `;
  }
}

/* ── E-mail modal ── */
function openEmailModal() { window.location.href = 'register.html'; }
function closeEmailModal() {
  const el = document.getElementById('emailModal');
  if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}
function handleEmailFormSubmit(e) { e.preventDefault(); window.location.href = 'register.html'; }

/* ── Scroll ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Active nav link ── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

/* ── FAQ accordion ── */
function toggleFAQ(el) {
  const item = el.closest('.faq-item');
  if (!item) return;
  const wasActive = item.classList.contains('active');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
  if (!wasActive) item.classList.add('active');
}

/* ── Keyboard accessibility ── */
function initKeyboardAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeEmailModal();
      document.querySelectorAll('.modal.active').forEach(m => {
        m.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });
}

/* ── Dil dropdown ── */
function toggleLangDropdown() {
  const menu = document.getElementById('langMenu');
  if (menu) menu.classList.toggle('show');
}

/* ── Footer modals ── */
function initFooterModals() {
  if (document.getElementById('faqModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="faqModal" class="modal">
      <div class="modal-content" style="max-width:600px;text-align:left;">
        <button class="modal-close" onclick="closeDocModal('faqModal')">&times;</button>
        <h2 style="margin-bottom:20px;">❓ Tez-tez Verilən Suallar</h2>
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
      <div class="modal-content" style="max-width:600px;text-align:left;max-height:80vh;overflow-y:auto;">
        <button class="modal-close" onclick="closeDocModal('privacyModal')">&times;</button>
        <h2 style="margin-bottom:20px;">🔒 Məxfilik Siyasəti</h2>
        <p>Biz istifadəçi məlumatlarının məxfiliyinə hörmətlə yanaşırıq.</p>
        <h3 style="margin-top:20px;font-size:1.1em;">1. Məlumatların Toplanması</h3>
        <p>Qeydiyyat zamanı yalnız tələb olunan minimum informasiya toplanır.</p>
        <h3 style="margin-top:20px;font-size:1.1em;">2. Məlumatların Paylaşılması</h3>
        <p>Şəxsi məlumatlarınız heç bir halda üçüncü tərəflərə ötürülmür.</p>
        <p style="margin-top:20px;">Əlavə sualınız olarsa, əlaqə hissəsindən bizə yazın.</p>
      </div>
    </div>
  `);
  document.querySelectorAll('a[href="#faq"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('faqModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  document.querySelectorAll('a[href="#privacy"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('privacyModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
}

function closeDocModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
  document.body.style.overflow = '';
}

function initAIChat() {}
function getUserProgress() {
  const d = localStorage.getItem('alielUser');
  return d ? JSON.parse(d).progress : null;
}
function showDownloadStats() {}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', function () {
  initSidebarNav();
  setActiveNav();
  initSmoothScroll();
  initKeyboardAccessibility();
  initFooterModals();

  const emailModal = document.getElementById('emailModal');
  if (emailModal) emailModal.addEventListener('click', function(e) {
    if (e.target === emailModal) closeEmailModal();
  });
  const emailForm = document.getElementById('emailForm');
  if (emailForm) emailForm.addEventListener('submit', handleEmailFormSubmit);
  if (typeof initAIChat === 'function') initAIChat();
});

/* Lang dropdown bağlama */
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.lang-dropdown');
  const menu = document.getElementById('langMenu');
  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.classList.remove('show');
  }
});