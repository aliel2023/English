/* ══════════════════════════════════════════════
   main.js — Alielenglish Navigation & Utilities
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const initMenu = () => {
    const hamburger = document.querySelector('.mobile-toggle') || document.querySelector('.hamburger') || document.querySelector('.menu-toggle') || document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-links') || document.querySelector('.nav-menu') || document.getElementById('navMenu');
    
    if (!hamburger || !navMenu) {
      console.warn('Menu elements not found, retrying...');
      setTimeout(initMenu, 500); // Retry if dynamically loaded
      return;
    }

    // Remove old listeners by cloning
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);

    newHamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('active');
      navMenu.classList.toggle('active', !isOpen);
      newHamburger.classList.toggle('active', !isOpen);
      newHamburger.setAttribute('aria-expanded', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !newHamburger.contains(e.target)) {
        navMenu.classList.remove('active');
        newHamburger.classList.remove('active');
      }
    });
  };
  initMenu();

  // Language switcher
  const langBtns = document.querySelectorAll('[data-lang]');
  langBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.dataset.lang;
      localStorage.setItem('aliel_lang', lang);
      if (window.i18n) window.i18n.setLang(lang);
      document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

// Navigation auth display
document.addEventListener('alielAuthReady', function(e) {
  const user = e.detail?.user;
  
  const loginBtn = document.getElementById('navLoginBtn') || document.querySelector('.nav-login-btn') || document.querySelector('a[href="login.html"]');
  const logoutBtn = document.getElementById('navLogoutBtn') || document.querySelector('.nav-logout-btn') || document.querySelector('.logout-btn');
  const dashBtn = document.getElementById('navDashBtn') || document.querySelector('.nav-dashboard-btn') || document.querySelector('a[href="dashboard.html"]');
  const navUser = document.getElementById('navUserName') || document.querySelector('.nav-user-name');

  if (!user) {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (dashBtn) dashBtn.style.display = 'none';
    if (navUser) navUser.textContent = '';
    return;
  }
  
  if (navUser) navUser.textContent = user.name || user.user_metadata?.full_name || user.email.split('@')[0];
  
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  if (dashBtn) dashBtn.style.display = 'inline-flex';
});

// Logout handler
window.handleLogout = async function() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb = createClient(document.querySelector('meta[name="supabase-url"]')?.content || 'https://wuzwvqgmrcqsiegbtrzs.supabase.co', '');
  if (window.supabase) await window.supabase.auth.signOut();
  else if (window._supabase) await window._supabase.auth.signOut();
  else await sb.auth.signOut();
  
  localStorage.clear();
  window.location.href = 'index.html';
};

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