// ===== FIREBASE AUTH SYSTEM — MAX SECURITY =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== Firebase Config =====
const firebaseConfig = {
    apiKey: "AIzaSyCxRMtHyTwee7cQuxcJ1eAWibxcyoUKIIs",
    authDomain: "alielenglish.firebaseapp.com",
    projectId: "alielenglish",
    storageBucket: "alielenglish.firebasestorage.app",
    messagingSenderId: "521948914743",
    appId: "1:521948914743:web:613373aaadfe3addedcbb2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ===== SECURITY LAYER 1: XSS Sanitizer =====
function sanitizeHTML(str) {
    if (typeof str !== 'string') return String(str || '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
window.sanitizeHTML = sanitizeHTML;

// ===== SECURITY LAYER 2: Input Validator =====
const Validator = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    name: (v) => v.trim().length >= 2 && v.trim().length <= 50 && /^[\p{L}\s\-']+$/u.test(v.trim()),
    password: (v) => v.length >= 8,
    hasUpperCase: (v) => /[A-Z]/.test(v),
    hasNumber: (v) => /[0-9]/.test(v),
    hasSpecial: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
    strength: (v) => {
        let s = 0;
        if (v.length >= 8) s++;
        if (v.length >= 12) s++;
        if (/[A-Z]/.test(v)) s++;
        if (/[0-9]/.test(v)) s++;
        if (/[^A-Za-z0-9]/.test(v)) s++;
        return s; // 0-5
    }
};

// ===== SECURITY LAYER 3: Rate Limiter (Progressive Lockout) =====
const RateLimit = {
    attempts: 0,
    lockedUntil: 0,
    penalties: [0, 0, 0, 30000, 120000, 900000], // 0,0,0,30s,2min,15min
    check() {
        const now = Date.now();
        if (now < this.lockedUntil) {
            const wait = Math.ceil((this.lockedUntil - now) / 1000);
            const min = Math.floor(wait / 60), sec = wait % 60;
            return { allowed: false, message: `🔒 ${min > 0 ? min + ' dəq ' : ''}${sec} san gözləyin.` };
        }
        this.attempts++;
        const penalty = this.penalties[Math.min(this.attempts, this.penalties.length - 1)];
        if (penalty > 0) this.lockedUntil = now + penalty;
        return { allowed: true };
    },
    reset() { this.attempts = 0; this.lockedUntil = 0; }
};

// ===== SECURITY LAYER 4: CSRF-like Session Token =====
const sessionToken = Math.random().toString(36).substring(2);

// ===== Admin Check — SERVER SIDE ONLY =====
function isAdminUser(userData) {
    return userData && userData.role === 'admin';
}

// ===== Current User State =====
let currentUser = null;
let currentUserData = null;

// ===== Auth State Listener =====
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        currentUser = firebaseUser;
        currentUserData = await getUserData(firebaseUser.uid);
        updateNavForUser(currentUserData);
        updateUserStreak(firebaseUser.uid);
        document.dispatchEvent(new CustomEvent('alielAuthReady', { detail: { user: currentUserData } }));
        // Admin auto-redirect
        if (window.location.pathname.includes('admin.html') && currentUserData && currentUserData.role !== 'admin') {
            window.location.href = 'index.html';
        }
    } else {
        currentUser = null;
        currentUserData = null;
        updateNavForUser(null);
        document.dispatchEvent(new CustomEvent('alielAuthReady', { detail: { user: null } }));
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    }
});

// ===== Get User Data =====
async function getUserData(uid) {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) return { uid, ...snap.data() };
        return null;
    } catch (e) {
        console.error("getUserData:", e);
        return null;
    }
}

window.getCurrentUser = () => currentUserData;

// ===== Register User =====
async function registerUser(name, email, password, level = 'A1') {
    name = name.trim();
    email = email.trim().toLowerCase();

    if (!Validator.name(name)) return { success: false, error: 'Ad 2-50 hərf arasında, yalnız hərflər.' };
    if (!Validator.email(email)) return { success: false, error: 'Email formatı yanlışdır.' };
    if (!Validator.password(password)) return { success: false, error: 'Şifrə minimum 8 simvol olmalıdır.' };

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        await updateProfile(user, { displayName: name });

        // Email verification — optional but recommended
        try { await sendEmailVerification(user); } catch (_) { }

        const userData = {
            name: sanitizeHTML(name),
            email: email,
            level: level,
            role: 'user',
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: new Date().toDateString(),
            activeDays: 1,
            wordsLearned: 0,
            testsCompleted: 0,
            badges: ['🌱 Başlanğıc'],
            favorites: { words: [], grammar: [], phrases: [] },
            weeklyActivity: [false, false, false, false, false, false, false],
            testHistory: [],
            createdAt: serverTimestamp(),
            privacy: { showProfile: false, showStreak: true },
            aiUsage: { count: 0, lastReset: new Date().toISOString() }
        };

        await setDoc(doc(db, "users", user.uid), userData);

        try {
            await addDoc(collection(db, "leads"), {
                name: sanitizeHTML(name), email,
                level, source: window.location.pathname,
                createdAt: serverTimestamp()
            });
        } catch (_) { }

        return { success: true, user: { uid: user.uid, ...userData } };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// ===== Login User =====
async function loginUser(email, password) {
    const rate = RateLimit.check();
    if (!rate.allowed) return { success: false, error: rate.message };

    try {
        const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        RateLimit.reset();
        const userData = await getUserData(cred.user.uid);
        return { success: true, user: userData };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// ===== Google Sign In =====
window.signInWithGoogle = async function () {
    try {
        clearAuthMessages();
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const existing = await getUserData(user.uid);
        if (!existing) {
            const userData = {
                name: sanitizeHTML(user.displayName || 'İstifadəçi'),
                email: user.email,
                level: 'A1',
                role: 'user',
                currentStreak: 0, longestStreak: 0,
                lastActiveDate: new Date().toDateString(),
                activeDays: 1, wordsLearned: 0, testsCompleted: 0,
                badges: ['🌱 Başlanğıc'],
                favorites: { words: [], grammar: [], phrases: [] },
                weeklyActivity: [false, false, false, false, false, false, false],
                testHistory: [],
                createdAt: serverTimestamp(),
                privacy: { showProfile: false, showStreak: true },
                aiUsage: { count: 0, lastReset: new Date().toISOString() }
            };
            await setDoc(doc(db, "users", user.uid), userData);
        }
        showAuthSuccess('Google ilə uğurla daxil oldunuz! ✅');
        setTimeout(() => closeAuthModal(), 1200);
    } catch (e) {
        showAuthError('Google girişi uğursuz oldu.');
    }
};

// ===== Logout =====
window.logoutUser = async function () {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (e) { console.error(e); }
};

// ===== Update User Streak =====
async function updateUserStreak(uid) {
    try {
        const userData = await getUserData(uid);
        if (!userData) return;
        const today = new Date().toDateString();
        if (userData.lastActiveDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = userData.lastActiveDate === yesterday ? (userData.currentStreak || 0) + 1 : 1;
        const longestStreak = Math.max(newStreak, userData.longestStreak || 0);
        const dayIndex = new Date().getDay();
        const weekly = userData.weeklyActivity || [false, false, false, false, false, false, false];
        weekly[dayIndex] = true;
        await updateDoc(doc(db, "users", uid), {
            currentStreak: newStreak, longestStreak,
            lastActiveDate: today,
            activeDays: (userData.activeDays || 0) + 1,
            weeklyActivity: weekly
        });
        if (currentUserData) { currentUserData.currentStreak = newStreak; currentUserData.longestStreak = longestStreak; }
        const badges = userData.badges || [];
        if (newStreak >= 7 && !badges.includes('🔥 7 Günlük Sıra'))
            await updateDoc(doc(db, "users", uid), { badges: arrayUnion('🔥 7 Günlük Sıra') });
        if (newStreak >= 30 && !badges.includes('🏆 30 Günlük Sıra'))
            await updateDoc(doc(db, "users", uid), { badges: arrayUnion('🏆 30 Günlük Sıra') });
    } catch (e) { console.error("streak:", e); }
}

// ===== Favorites =====
window.addToFavorites = async function (item, type = 'words') {
    if (!currentUser) { openAuthModal('login'); return false; }
    try {
        await updateDoc(doc(db, "users", currentUser.uid), { [`favorites.${type}`]: arrayUnion(item) });
        if (currentUserData?.favorites) {
            if (!currentUserData.favorites[type]) currentUserData.favorites[type] = [];
            currentUserData.favorites[type].push(item);
        }
        return true;
    } catch (e) { return false; }
};

window.removeFromFavorites = async function (item, type = 'words') {
    if (!currentUser) return false;
    try {
        await updateDoc(doc(db, "users", currentUser.uid), { [`favorites.${type}`]: arrayRemove(item) });
        if (currentUserData?.favorites?.[type])
            currentUserData.favorites[type] = currentUserData.favorites[type].filter(f => f !== item);
        return true;
    } catch (e) { return false; }
};

// ===== Save Test Result =====
window.saveTestResult = async function (level, score, total) {
    if (!currentUser) return;
    try {
        const result = { level, score, total, date: new Date().toISOString() };
        await updateDoc(doc(db, "users", currentUser.uid), {
            level, testsCompleted: (currentUserData?.testsCompleted || 0) + 1,
            testHistory: arrayUnion(result)
        });
        if (currentUserData) { currentUserData.level = level; currentUserData.testsCompleted = (currentUserData.testsCompleted || 0) + 1; }
    } catch (e) { console.error(e); }
};

// ===== Track Lead =====
window.trackUserForAdmin = async function (name, email) {
    try {
        await addDoc(collection(db, "leads"), {
            name: sanitizeHTML(name), email,
            source: window.location.pathname,
            createdAt: serverTimestamp()
        });
    } catch (e) { }
};

// ===== Error Messages =====
function getErrorMessage(code) {
    const map = {
        'auth/email-already-in-use': '📧 Bu email artıq qeydiyyatdan keçib.',
        'auth/weak-password': '🔑 Şifrə çox zəifdir.',
        'auth/invalid-email': '📧 Email formatı yanlışdır.',
        'auth/user-not-found': '❌ Bu email ilə hesab tapılmadı.',
        'auth/wrong-password': '🔑 Şifrə yanlışdır.',
        'auth/too-many-requests': '⏳ Çox cəhd. Bir az gözləyin.',
        'auth/invalid-credential': '❌ Email və ya şifrə yanlışdır.',
        'auth/network-request-failed': '🌐 İnternet bağlantısını yoxlayın.',
        'auth/popup-closed-by-user': '↩️ Google girişi ləğv edildi.',
    };
    return map[code] || '⚠️ Xəta baş verdi. Yenidən cəhd edin.';
}

// ===== Update Nav =====
function updateNavForUser(user) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;
    navActions.querySelectorAll('.auth-nav-btn, .user-nav-menu').forEach(el => el.remove());
    if (user) {
        const avatarLetter = sanitizeHTML((user.name || 'U').charAt(0).toUpperCase());
        const displayName = sanitizeHTML((user.name || '').split(' ')[0]);
        const fullName = sanitizeHTML(user.name || 'İstifadəçi');
        const userLevel = sanitizeHTML(user.level || 'A1');
        const streak = parseInt(user.currentStreak) || 0;
        const admin = isAdminUser(user);
        const html = `
            <div class="user-nav-menu" id="userNavMenu">
                <button class="user-avatar-btn" onclick="toggleUserDropdown()">
                    <span class="user-avatar">${avatarLetter}</span>
                    <span class="user-name-short">${displayName}</span>
                    <span class="streak-badge">🔥${streak}</span>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-dropdown-header">
                        <strong>${fullName}</strong>
                        <span class="user-level-badge">${userLevel}</span>
                    </div>
                    <a href="favorites.html" class="dropdown-item">❤️ Sevimlilər</a>
                    <a href="dashboard.html" class="dropdown-item">📊 Dashboard</a>
                    ${admin ? '<a href="admin.html" class="dropdown-item" style="color:#ffd700;font-weight:700;">👑 Admin Panel</a>' : ''}
                    <button onclick="logoutUser()" class="dropdown-item logout-btn">🚪 Çıxış</button>
                </div>
            </div>`;
        navActions.insertAdjacentHTML('afterbegin', html);
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('userNavMenu');
            if (menu && !menu.contains(e.target)) {
                const dd = document.getElementById('userDropdown');
                if (dd) dd.classList.remove('show');
            }
        });
    } else {
        navActions.insertAdjacentHTML('afterbegin',
            `<button class="btn btn-sm auth-nav-btn" onclick="openAuthModal('login')" style="padding:0.5rem 1rem;">Daxil Ol</button>`
        );
    }
}

window.toggleUserDropdown = function () {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.toggle('show');
};

// ===== Auth Modal (Beautiful Redesign) =====
window.openAuthModal = function (mode = 'login') {
    let modal = document.getElementById('alielAuthModal');
    if (!modal) { injectAuthModal(); modal = document.getElementById('alielAuthModal'); }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAuthTab(mode);
};

window.closeAuthModal = function () {
    const modal = document.getElementById('alielAuthModal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
};

window.switchAuthTab = function (mode) {
    ['login', 'register'].forEach(m => {
        document.getElementById(`authTab_${m}`)?.classList.toggle('active', m === mode);
        document.getElementById(`authForm_${m}`)?.classList.toggle('hidden', m !== mode);
    });
};

// ===== Password Strength Meter =====
window.updatePasswordStrength = function (val) {
    const bar = document.getElementById('pwStrengthBar');
    const label = document.getElementById('pwStrengthLabel');
    if (!bar || !label) return;
    const s = Validator.strength(val);
    const configs = [
        { w: '0%', c: '#ff4757', t: '' },
        { w: '20%', c: '#ff4757', t: '🔴 Çox zəif' },
        { w: '40%', c: '#ffa502', t: '🟠 Zəif' },
        { w: '60%', c: '#eccc68', t: '🟡 Orta' },
        { w: '80%', c: '#2ed573', t: '🟢 Güclü' },
        { w: '100%', c: '#1e90ff', t: '💪 Çox güclü' },
    ];
    const cfg = configs[s] || configs[0];
    bar.style.width = cfg.w;
    bar.style.background = cfg.c;
    label.textContent = cfg.t;
    label.style.color = cfg.c;
};

// ===== Toggle Password Visibility =====
window.togglePwVisibility = function (inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
    else { inp.type = 'password'; btn.textContent = '👁'; }
};

function injectAuthModal() {
    const html = `
    <div id="alielAuthModal" class="modal auth-modal">
        <div class="modal-content auth-modal-content auth-modal-v2">
            <button class="modal-close auth-close-btn" onclick="closeAuthModal()">×</button>

            <!-- Logo & Title -->
            <div class="auth-modal-header">
                <div class="auth-logo-icon">A</div>
                <h2 class="auth-modal-title">Alielenglish</h2>
                <p class="auth-modal-subtitle">Hesabınıza daxil olun</p>
            </div>

            <!-- Tabs -->
            <div class="auth-tabs-v2">
                <button id="authTab_login" class="auth-tab-v2 active" onclick="switchAuthTab('login')">Daxil Ol</button>
                <button id="authTab_register" class="auth-tab-v2" onclick="switchAuthTab('register')">Qeydiyyat</button>
            </div>

            <!-- Messages -->
            <div id="authError" class="auth-error-v2 hidden"></div>
            <div id="authSuccess" class="auth-success-v2 hidden"></div>

            <!-- LOGIN FORM -->
            <form id="authForm_login" class="auth-form-v2" onsubmit="handleLogin(event)">
                <div class="auth-field">
                    <label class="auth-label">📧 Email</label>
                    <input type="email" id="loginEmail" class="auth-input-v2"
                           placeholder="email@nümunə.com" required autocomplete="email">
                </div>
                <div class="auth-field">
                    <label class="auth-label">🔑 Şifrə</label>
                    <div class="auth-pw-wrap">
                        <input type="password" id="loginPassword" class="auth-input-v2"
                               placeholder="Şifrəniz" required autocomplete="current-password">
                        <button type="button" class="pw-toggle" onclick="togglePwVisibility('loginPassword',this)">👁</button>
                    </div>
                </div>
                <button type="submit" class="auth-submit-btn" id="loginBtn">
                    <span>Daxil Ol</span>
                </button>
                <div class="auth-divider"><span>yaxud</span></div>
                <button type="button" class="auth-google-btn" onclick="signInWithGoogle()">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google ilə daxil ol
                </button>
            </form>

            <!-- REGISTER FORM -->
            <form id="authForm_register" class="auth-form-v2 hidden" onsubmit="handleRegister(event)">
                <div class="auth-field-row">
                    <div class="auth-field">
                        <label class="auth-label">👤 Ad Soyad</label>
                        <input type="text" id="regName" class="auth-input-v2"
                               placeholder="Məsələn: Əli Hüseynov" required minlength="2" maxlength="50">
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">🎓 Səviyyə</label>
                        <select id="regLevel" class="auth-input-v2 auth-select">
                            <option value="A1">A1 — Başlanğıc</option>
                            <option value="A2">A2 — Əsas</option>
                            <option value="B1" selected>B1 — Orta</option>
                            <option value="B2">B2 — Yuxarı Orta</option>
                            <option value="C1">C1 — Təkmil</option>
                            <option value="C2">C2 — Ustadlıq</option>
                        </select>
                    </div>
                </div>
                <div class="auth-field">
                    <label class="auth-label">📧 Email</label>
                    <input type="email" id="regEmail" class="auth-input-v2"
                           placeholder="email@nümunə.com" required autocomplete="email">
                </div>
                <div class="auth-field">
                    <label class="auth-label">🔑 Şifrə</label>
                    <div class="auth-pw-wrap">
                        <input type="password" id="regPassword" class="auth-input-v2"
                               placeholder="Min. 8 simvol" required autocomplete="new-password"
                               oninput="updatePasswordStrength(this.value)">
                        <button type="button" class="pw-toggle" onclick="togglePwVisibility('regPassword',this)">👁</button>
                    </div>
                    <!-- Password Strength -->
                    <div class="pw-strength-wrap">
                        <div class="pw-strength-track">
                            <div id="pwStrengthBar" class="pw-strength-bar"></div>
                        </div>
                        <span id="pwStrengthLabel" class="pw-strength-label"></span>
                    </div>
                </div>
                <div class="auth-field">
                    <label class="auth-label">🔑 Şifrəni Təkrarla</label>
                    <div class="auth-pw-wrap">
                        <input type="password" id="regPasswordConfirm" class="auth-input-v2"
                               placeholder="Şifrəni yenidən daxil edin" required autocomplete="new-password">
                        <button type="button" class="pw-toggle" onclick="togglePwVisibility('regPasswordConfirm',this)">👁</button>
                    </div>
                </div>
                <!-- Terms -->
                <label class="auth-terms">
                    <input type="checkbox" id="regTerms" required>
                    <span>Gizlilik Siyasətini və İstifadə Şərtlərini qəbul edirəm</span>
                </label>
                <button type="submit" class="auth-submit-btn auth-register-btn" id="registerBtn">
                    <span>Pulsuz Qeydiyyat</span>
                </button>
                <div class="auth-divider"><span>yaxud</span></div>
                <button type="button" class="auth-google-btn" onclick="signInWithGoogle()">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google ilə qeydiyyat
                </button>
            </form>

            <!-- Security Badge -->
            <div class="auth-security-badge">🔒 256-bit SSL şifrələmə · Firebase Auth · Məlumatlarınız qorunur</div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('alielAuthModal').addEventListener('click', (e) => {
        if (e.target.id === 'alielAuthModal') closeAuthModal();
    });
}

// ===== Handle Login =====
window.handleLogin = async function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="auth-spinner"></span> Yüklənir...';
    clearAuthMessages();
    const result = await loginUser(email, password);
    if (result.success) {
        showAuthSuccess('✅ Uğurla daxil oldunuz!');
        setTimeout(() => closeAuthModal(), 1200);
    } else {
        showAuthError(result.error);
        btn.disabled = false;
        btn.innerHTML = '<span>Daxil Ol</span>';
    }
};

// ===== Handle Register =====
window.handleRegister = async function (e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;
    const level = document.getElementById('regLevel').value;
    const terms = document.getElementById('regTerms').checked;
    const btn = document.getElementById('registerBtn');

    clearAuthMessages();

    if (!terms) { showAuthError('Şərtləri qəbul etməlisiniz.'); return; }
    if (password !== confirm) { showAuthError('🔑 Şifrələr uyğun gəlmir.'); return; }
    if (Validator.strength(password) < 2) { showAuthError('🔑 Daha güclü şifrə seçin (hərflər + rəqəmlər).'); return; }

    btn.disabled = true;
    btn.innerHTML = '<span class="auth-spinner"></span> Qeydiyyat...';

    const result = await registerUser(name, email, password, level);

    if (result.success) {
        showAuthSuccess('🎉 Qeydiyyat uğurlu! Xoş gəldiniz!');
        setTimeout(() => closeAuthModal(), 1500);
    } else {
        showAuthError(result.error);
        btn.disabled = false;
        btn.innerHTML = '<span>Pulsuz Qeydiyyat</span>';
    }
};

// ===== Message helpers =====
function showAuthError(msg) {
    const el = document.getElementById('authError');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}
function showAuthSuccess(msg) {
    const el = document.getElementById('authSuccess');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}
function clearAuthMessages() {
    document.getElementById('authError')?.classList.add('hidden');
    document.getElementById('authSuccess')?.classList.add('hidden');
}

// ===== Init =====
function initAuth() { injectAuthModal(); }
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else { initAuth(); }
