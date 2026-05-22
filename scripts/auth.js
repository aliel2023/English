// ================================================================
// Alielenglish — Auth System (Clean Rebuild)
// Supabase Auth + User Profile Management
// ================================================================
import { supabase } from '../js/config.js';

// ── Brute Force Protection ──
const SecurityGuard = {
  maxAttempts: 5,
  lockoutMs: 15 * 60 * 1000,
  isBlocked(action) {
    const until = localStorage.getItem('sg_' + action + '_until');
    if (until && Date.now() < parseInt(until)) {
      const mins = Math.ceil((parseInt(until) - Date.now()) / 60000);
      return 'Hesab müvəqqəti bloklandı. ' + mins + ' dəqiqə gözləyin.';
    }
    return false;
  },
  recordAttempt(action) {
    const key = 'sg_' + action + '_count';
    const count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(count));
    if (count >= this.maxAttempts) {
      localStorage.setItem('sg_' + action + '_until', String(Date.now() + this.lockoutMs));
      localStorage.removeItem(key);
      return '5 uğursuz cəhd. 15 dəqiqə gözləyin.';
    }
    return null;
  },
  clearAttempts(action) {
    localStorage.removeItem('sg_' + action + '_count');
    localStorage.removeItem('sg_' + action + '_until');
  }
};

// ── Input Sanitizer (never sanitize passwords) ──
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`]/g, '').replace(/javascript:/gi, '').trim().slice(0, 500);
}

function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── UI Helpers ──
function showAuthError(msg) {
  clearAuthMessages();
  const el = document.getElementById('authError');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    el.classList.add('show');
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  setLoading('loginBtn', false);
  setLoading('registerBtn', false);
}

function showAuthSuccess(msg) {
  clearAuthMessages();
  const el = document.getElementById('authSuccess');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    el.classList.add('show');
    el.classList.remove('hidden');
  }
  setLoading('loginBtn', false);
  setLoading('registerBtn', false);
}

function clearAuthMessages() {
  ['authError', 'authSuccess'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
      el.classList.remove('show');
      el.classList.add('hidden');
    }
  });
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn._origText = btn.textContent;
    btn.disabled = true;
    const spinner = btn.querySelector('.duo-spinner');
    const textSpan = btn.querySelector('span:not(.duo-spinner)');
    if (textSpan) textSpan.textContent = 'Yüklənir...';
    if (spinner) spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    const spinner = btn.querySelector('.duo-spinner');
    const textSpan = btn.querySelector('span:not(.duo-spinner)');
    if (textSpan && btn._origText) textSpan.textContent = btn._origText;
    if (spinner) spinner.classList.add('hidden');
  }
}

// ── Toggle Password Visibility ──
window.togglePwVisibility = function(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  if (btn) btn.textContent = isPass ? 'GİZLƏT' : 'GÖSTƏR';
};

// ── Password Strength Meter ──
window.updatePasswordStrength = function(val) {
  const wrap = document.getElementById('strengthWrap');
  const bar = document.getElementById('strengthBar');
  const lbl = document.getElementById('strengthLabel');
  if (!wrap || !bar || !lbl) return;
  if (!val) return void wrap.classList.remove('show');
  wrap.classList.add('show');
  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w: '0%', c: '#ff4757', t: '' },
    { w: '20%', c: '#ff4757', t: '🔴 Çox zəif' },
    { w: '40%', c: '#ffa502', t: '🟠 Zəif' },
    { w: '60%', c: '#eccc68', t: '🟡 Orta' },
    { w: '80%', c: '#2ed573', t: '🟢 Güclü' },
    { w: '100%', c: '#1e90ff', t: '💪 Mükəmməl' }
  ];
  const s = levels[score] || levels[0];
  bar.style.width = s.w;
  bar.style.background = s.c;
  lbl.textContent = s.t;
  lbl.style.color = s.c;
};

// ── Create User Profile in Database ──
async function createUserProfile(userId, { name, email, level }) {
  const role = email === 'englishaliel@gmail.com' ? 'admin' : 'user';
  const userData = {
    uid: userId,
    name: sanitizeHTML(name),
    email: email,
    level: level || 'A1',
    role: role,
    premium_active: false,
    premium_expires_at: null,
    current_streak: 0,
    longest_streak: 0,
    last_active_date: new Date().toDateString(),
    active_days: 1,
    words_learned: 0,
    tests_completed: 0,
    badges: ['🌱 Başlanğıc'],
    favorites: { words: [], grammar: [], phrases: [] },
    weekly_activity: [false, false, false, false, false, false, false],
    test_history: [],
    privacy: { showProfile: false, showStreak: true },
    daily_query_count: 0,
    last_reset_date: new Date().toISOString()
  };
  const { error } = await supabase.from('users').upsert([userData]);
  if (error && error.code !== '23505') {
    console.error('Profile creation error:', error);
  }
  return userData;
}

// ══════════════════════════════════════
// LOGIN HANDLER
// ══════════════════════════════════════
window.handleLogin = async function(event) {
  if (event) event.preventDefault();
  clearAuthMessages();

  const blocked = SecurityGuard.isBlocked('login');
  if (blocked) return showAuthError(blocked);

  const emailEl = document.getElementById('loginEmail');
  const passEl = document.getElementById('loginPassword');
  const email = sanitizeInput(emailEl ? emailEl.value : '');
  const password = passEl ? passEl.value : ''; // Never sanitize passwords

  if (!email || !password) return showAuthError('Email və şifrə daxil edin.');

  setLoading('loginBtn', true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });
    if (error) throw error;

    SecurityGuard.clearAttempts('login');
    showAuthSuccess('✅ Uğurla daxil oldunuz! Yönləndirilir...');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  } catch (err) {
    const msg = SecurityGuard.recordAttempt('login');
    showAuthError(msg || '❌ Email və ya şifrə yanlışdır.');
    setLoading('loginBtn', false);
  }
};

// ══════════════════════════════════════
// REGISTER HANDLER
// ══════════════════════════════════════
window.handleRegister = async function(event) {
  if (event) event.preventDefault();
  clearAuthMessages();

  const name = sanitizeInput(document.getElementById('regName')?.value || '');
  const email = sanitizeInput(document.getElementById('regEmail')?.value || '').toLowerCase();
  const password = document.getElementById('regPassword')?.value || '';
  const confirm = document.getElementById('regPasswordConfirm')?.value || '';
  const level = document.getElementById('regLevel')?.value || 'A1';
  const terms = document.getElementById('regTerms')?.checked;

  // Validation
  if (!name || name.length < 2) return showAuthError('Ad ən azı 2 hərf olmalıdır.');
  if (!email || !/\S+@\S+\.\S+/.test(email)) return showAuthError('Email formatı yanlışdır.');
  if (password.length < 8) return showAuthError('Şifrə minimum 8 simvol olmalıdır.');
  if (password !== confirm) return showAuthError('Şifrələr uyğun gəlmir.');
  if (!terms) return showAuthError('Şərtləri qəbul etməlisiniz.');

  setLoading('registerBtn', true);

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: name } }
    });
    if (authError) throw authError;

    // Create user profile in the database
    if (authData.user) {
      await createUserProfile(authData.user.id, { name, email, level });
    }

    showAuthSuccess('🎉 Qeydiyyat uğurlu! Yönləndirilir...');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
  } catch (err) {
    let msg = '⚠️ Qeydiyyat xətası.';
    const errMsg = err.message || String(err);
    if (errMsg.includes('already registered') || errMsg.includes('User already exists')) {
      msg = '📧 Bu email artıq qeydiyyatdan keçib.';
    } else if (errMsg.includes('Password should be at least')) {
      msg = '🔑 Şifrə çox zəifdir (min. 8 simvol).';
    } else if (errMsg.includes('invalid') && errMsg.includes('email')) {
      msg = '📧 Email formatı yanlışdır.';
    }
    showAuthError(msg);
    setLoading('registerBtn', false);
  }
};

// ══════════════════════════════════════
// GOOGLE OAUTH
// ══════════════════════════════════════
window.handleGoogleLogin = async function() {
  clearAuthMessages();
  const btn = document.getElementById('googleBtn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://aliel2023.github.io/English/dashboard.html'
      }
    });
    if (error) throw error;
  } catch (err) {
    showAuthError('Google girişi uğursuz oldu: ' + (err.message || ''));
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
  }
};

// Register page uses handleGoogleReg — same as handleGoogleLogin
window.handleGoogleReg = window.handleGoogleLogin;

// ══════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════
window.handleForgotPassword = async function() {
  clearAuthMessages();
  const emailEl = document.getElementById('loginEmail');
  const email = sanitizeInput(emailEl ? emailEl.value : '');
  if (!email) return showAuthError('Əvvəlcə email daxil edin.');

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://aliel2023.github.io/English/login.html'
    });
    if (error) throw error;
    showAuthSuccess('📧 Şifrə sıfırlama linki emailə göndərildi.');
  } catch (err) {
    showAuthError('Xəta baş verdi: ' + (err.message || ''));
  }
};

// ══════════════════════════════════════
// AUTH STATE LISTENER (runs on every page)
// ══════════════════════════════════════
let currentUser = null;
let currentUserData = null;

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session && session.user) {
    currentUser = session.user;

    // Check if user profile exists
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', session.user.id)
      .single();

    if (!profile || error) {
      // Auto-create profile for OAuth users
      const email = session.user.email || '';
      const name = session.user.user_metadata?.full_name ||
                   session.user.user_metadata?.name ||
                   email.split('@')[0] || 'İstifadəçi';
      currentUserData = await createUserProfile(session.user.id, { name, email, level: 'A1' });
    } else {
      currentUserData = profile;
      // Ensure admin role for admin email
      if (session.user.email === 'englishaliel@gmail.com' && profile.role !== 'admin') {
        await supabase.from('users').update({ role: 'admin' }).eq('uid', session.user.id);
        currentUserData.role = 'admin';
      }
    }

    // Export for other scripts
    window.currentUser = currentUser;
    window.currentUserData = currentUserData;
    document.dispatchEvent(new CustomEvent('alielAuthReady', { detail: { user: currentUserData } }));

    // Redirect away from login/register pages
    const path = window.location.pathname;
    if (path.includes('login') || path.includes('register')) {
      window.location.href = 'dashboard.html';
    }
  } else {
    currentUser = null;
    currentUserData = null;
    window.currentUser = null;
    window.currentUserData = null;
    document.dispatchEvent(new CustomEvent('alielAuthReady', { detail: { user: null } }));

    // Protect dashboard pages (redirect to login if not authenticated)
    const protectedPages = ['dashboard', 'profile', 'favorites', 'admin'];
    const isProtected = protectedPages.some(p => window.location.pathname.includes(p));
    if (isProtected) {
      window.location.href = 'login.html';
    }
  }
});

// ── Public API ──
window.getCurrentUser = () => currentUserData;
window.handleLogout = async function() {
  await supabase.auth.signOut();
  localStorage.removeItem('sb-wuzwvqgmrcqsiegbtrzs-auth-token');
  window.location.href = 'index.html';
};

// ── Privacy/Terms Document Overlays (for register page) ──
const DOCS = {
  privacy: '<h2>🔒 Gizlilik Siyasəti</h2><p>Biz yalnız tələb olunan məlumatları toplayırıq: adınız, email, tədris səviyyəsi.</p><h3 style="margin:1rem 0 .5rem;font-size:1rem;">Saxlanma</h3><p>Bütün məlumatlar Supabase serverlərində şifrəli saxlanılır. Heç vaxt üçüncü tərəflərə satılmır.</p>',
  terms: '<h2>📋 İstifadə Şərtləri</h2><ul style="margin:1rem 0;padding-left:1.2rem;line-height:2;color:#94a3b8"><li>Platformanı yalnız öz məqsədləriniz üçün istifadə edin</li><li>Digər istifadəçilərə zərər verməyin</li><li>Saxta məlumat girməyin</li></ul>'
};
window.showDoc = function(type, e) {
  if (e) e.preventDefault();
  const overlay = document.getElementById('docOverlay');
  const content = document.getElementById('docContent');
  if (overlay && content) {
    content.innerHTML = DOCS[type] || '';
    overlay.classList.add('show');
  }
};
window.closeDoc = function() {
  const overlay = document.getElementById('docOverlay');
  if (overlay) overlay.classList.remove('show');
};

console.log('[Auth] System initialized');
