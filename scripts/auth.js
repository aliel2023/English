// ===== FIREBASE AUTH SYSTEM =====
// Məlumatlar artıq localStorage-də deyil — Google Firebase serverindədir
// Hakerlər F12 ilə heç nə görə bilməz

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
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

// ===== Security: XSS Sanitizer =====
function sanitizeHTML(str) {
    if (typeof str !== 'string') return String(str || '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}
window.sanitizeHTML = sanitizeHTML;

// ===== Security: Client-side Rate Limiter =====
const loginAttempts = { count: 0, lockedUntil: 0 };
function checkRateLimit() {
    const now = Date.now();
    if (now < loginAttempts.lockedUntil) {
        const waitMin = Math.ceil((loginAttempts.lockedUntil - now) / 60000);
        return { allowed: false, message: `Çox cəhd. ${waitMin} dəqiqə gözləyin.` };
    }
    loginAttempts.count++;
    if (loginAttempts.count > 5) {
        loginAttempts.lockedUntil = now + 15 * 60 * 1000; // 15 dəqiqə
        loginAttempts.count = 0;
        return { allowed: false, message: 'Çox cəhd. 15 dəqiqə gözləyin.' };
    }
    return { allowed: true };
}

// ===== Admin check — Firestore role =====
// Admin email client-side-da yoxlanılMIR. Yalnız Firestore 'role' sahəsinə baxılır.
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
    } else {
        currentUser = null;
        currentUserData = null;
        updateNavForUser(null);
        document.dispatchEvent(new CustomEvent('alielAuthReady', { detail: { user: null } }));
    }
});

// ===== Get User Data from Firestore =====
async function getUserData(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { uid, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.error("getUserData error:", e);
        return null;
    }
}

// ===== Get Current User (global helper) =====
window.getCurrentUser = function () {
    return currentUserData;
};

// ===== Register User =====
async function registerUser(name, email, password, level = 'A1') {
    // Input sanitization
    name = sanitizeHTML(name.trim());
    email = email.trim().toLowerCase();

    // Extra validation
    if (name.length < 2 || name.length > 50) {
        return { success: false, error: 'Ad 2-50 hərf arasında olmalıdır.' };
    }
    if (password.length < 8) {
        return { success: false, error: 'Şifrə ən azı 8 simvol olmalıdır.' };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        const userData = {
            name: name,
            email: email,
            level: level,
            role: 'user', // ← Admin HEÇVAXT buradan təyin edilmir. Firebase Console-dan edilir.
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
            createdAt: serverTimestamp()
            // isAdmin sahəsi YOX — role field istifadə edirik
        };

        await setDoc(doc(db, "users", user.uid), userData);

        // Lead tracking — auth tələb edir (rate-limit bot attack-ları azaldır)
        try {
            await addDoc(collection(db, "leads"), {
                name: name,
                email: email,
                level: level,
                source: window.location.pathname,
                createdAt: serverTimestamp()
            });
        } catch (leadErr) {
            console.warn('Lead tracking failed:', leadErr.code);
        }

        return { success: true, user: { uid: user.uid, ...userData } };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// ===== Login User =====
async function loginUser(email, password) {
    // Rate limit check
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
        return { success: false, error: rateCheck.message };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        loginAttempts.count = 0; // Uğurlu giriş — sıfırla
        const userData = await getUserData(userCredential.user.uid);
        return { success: true, user: userData };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// ===== Logout =====
window.logoutUser = async function () {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (e) {
        console.error("Logout error:", e);
    }
};

// ===== Update User Streak =====
async function updateUserStreak(uid) {
    try {
        const userData = await getUserData(uid);
        if (!userData) return;

        const today = new Date().toDateString();
        const lastActive = userData.lastActiveDate;

        if (lastActive === today) return;

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newStreak = lastActive === yesterday ? (userData.currentStreak || 0) + 1 : 1;
        let longestStreak = Math.max(newStreak, userData.longestStreak || 0);

        const dayIndex = new Date().getDay();
        const weeklyActivity = userData.weeklyActivity || [false, false, false, false, false, false, false];
        weeklyActivity[dayIndex] = true;

        await updateDoc(doc(db, "users", uid), {
            currentStreak: newStreak,
            longestStreak: longestStreak,
            lastActiveDate: today,
            activeDays: (userData.activeDays || 0) + 1,
            weeklyActivity: weeklyActivity
        });

        if (currentUserData) {
            currentUserData.currentStreak = newStreak;
            currentUserData.longestStreak = longestStreak;
        }

        const badges = userData.badges || [];
        if (newStreak >= 7 && !badges.includes('🔥 7 Günlük Sıra')) {
            await updateDoc(doc(db, "users", uid), {
                badges: arrayUnion('🔥 7 Günlük Sıra')
            });
        }
        if (newStreak >= 30 && !badges.includes('🏆 30 Günlük Sıra')) {
            await updateDoc(doc(db, "users", uid), {
                badges: arrayUnion('🏆 30 Günlük Sıra')
            });
        }
    } catch (e) {
        console.error("updateUserStreak error:", e);
    }
}

// ===== Add to Favorites =====
window.addToFavorites = async function (item, type = 'words') {
    if (!currentUser) {
        openAuthModal('login');
        return false;
    }
    try {
        await updateDoc(doc(db, "users", currentUser.uid), {
            [`favorites.${type}`]: arrayUnion(item)
        });
        if (currentUserData && currentUserData.favorites) {
            if (!currentUserData.favorites[type]) currentUserData.favorites[type] = [];
            currentUserData.favorites[type].push(item);
        }
        return true;
    } catch (e) {
        console.error("addToFavorites error:", e);
        return false;
    }
};

// ===== Remove from Favorites =====
window.removeFromFavorites = async function (item, type = 'words') {
    if (!currentUser) return false;
    try {
        await updateDoc(doc(db, "users", currentUser.uid), {
            [`favorites.${type}`]: arrayRemove(item)
        });
        if (currentUserData?.favorites?.[type]) {
            currentUserData.favorites[type] = currentUserData.favorites[type].filter(f => f !== item);
        }
        return true;
    } catch (e) {
        console.error("removeFromFavorites error:", e);
        return false;
    }
};

// ===== Save Test Result =====
window.saveTestResult = async function (level, score, total) {
    if (!currentUser) return;
    try {
        const result = { level, score, total, date: new Date().toISOString() };
        await updateDoc(doc(db, "users", currentUser.uid), {
            level: level,
            testsCompleted: (currentUserData?.testsCompleted || 0) + 1,
            testHistory: arrayUnion(result)
        });
        if (currentUserData) {
            currentUserData.level = level;
            currentUserData.testsCompleted = (currentUserData.testsCompleted || 0) + 1;
        }
    } catch (e) {
        console.error("saveTestResult error:", e);
    }
};

// ===== Track newsletter lead =====
window.trackUserForAdmin = async function (name, email) {
    try {
        await addDoc(collection(db, "leads"), {
            name: name,
            email: email,
            source: window.location.pathname,
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.error("trackUserForAdmin error:", e);
    }
};

// ===== Error Messages =====
function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Bu email artıq qeydiyyatdan keçib.',
        'auth/weak-password': 'Şifrə ən azı 6 simvol olmalıdır.',
        'auth/invalid-email': 'Email formatı səhvdir.',
        'auth/user-not-found': 'Bu email ilə hesab tapılmadı.',
        'auth/wrong-password': 'Şifrə yanlışdır.',
        'auth/too-many-requests': 'Çox cəhd. Bir az gözləyin.',
        'auth/invalid-credential': 'Email və ya şifrə yanlışdır.',
        'auth/network-request-failed': 'İnternet bağlantısını yoxlayın.',
    };
    return messages[code] || 'Xəta baş verdi. Yenidən cəhd edin.';
}

// ===== Update Nav for User =====
function updateNavForUser(user) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    navActions.querySelectorAll('.auth-nav-btn, .user-nav-menu').forEach(el => el.remove());

    if (user) {
        // Sanitize all user-controlled strings before inserting into DOM
        const avatarLetter = sanitizeHTML((user.name || 'U').charAt(0).toUpperCase());
        const displayName = sanitizeHTML((user.name || '').split(' ')[0]);
        const fullName = sanitizeHTML(user.name || 'İstifadəçi');
        const userLevel = sanitizeHTML(user.level || 'A1');
        const streakCount = parseInt(user.currentStreak) || 0;
        // Admin check: Firestore role field, not email
        const userIsAdmin = isAdminUser(user);
        const html = `
            <div class="user-nav-menu" id="userNavMenu">
                <button class="user-avatar-btn" onclick="toggleUserDropdown()">
                    <span class="user-avatar">${avatarLetter}</span>
                    <span class="user-name-short">${displayName}</span>
                    <span class="streak-badge" title="${streakCount} günlük sıra">🔥${streakCount}</span>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-dropdown-header">
                        <strong>${fullName}</strong>
                        <span class="user-level-badge">${userLevel}</span>
                    </div>
                    <a href="favorites.html" class="dropdown-item">❤️ Sevimlilər</a>
                    <a href="dashboard.html" class="dropdown-item">📊 Dashboard</a>
                    ${userIsAdmin ? '<a href="admin.html" class="dropdown-item" style="color:#ffd700;">👑 Admin Panel</a>' : ''}
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
        const html = `<button class="btn btn-sm auth-nav-btn" onclick="openAuthModal('login')" style="padding:0.5rem 1rem;">Daxil Ol</button>`;
        navActions.insertAdjacentHTML('afterbegin', html);
    }
}

// ===== Toggle User Dropdown =====
window.toggleUserDropdown = function () {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.toggle('show');
};

// ===== Auth Modal =====
window.openAuthModal = function (mode = 'login') {
    let modal = document.getElementById('alielAuthModal');
    if (!modal) {
        injectAuthModal();
        modal = document.getElementById('alielAuthModal');
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAuthTab(mode);
};

window.closeAuthModal = function () {
    const modal = document.getElementById('alielAuthModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.switchAuthTab = function (mode) {
    document.getElementById('authLoginTab').classList.toggle('active', mode === 'login');
    document.getElementById('authRegisterTab').classList.toggle('active', mode === 'register');
    document.getElementById('authLoginForm').classList.toggle('hidden', mode !== 'login');
    document.getElementById('authRegisterForm').classList.toggle('hidden', mode !== 'register');
};

function injectAuthModal() {
    const modalHTML = `
    <div id="alielAuthModal" class="modal auth-modal">
        <div class="modal-content auth-modal-content">
            <button class="modal-close" onclick="closeAuthModal()">&times;</button>
            <div class="auth-tabs">
                <button id="authLoginTab" class="auth-tab active" onclick="switchAuthTab('login')">Daxil Ol</button>
                <button id="authRegisterTab" class="auth-tab" onclick="switchAuthTab('register')">Qeydiyyat</button>
            </div>
            <div id="authError" class="auth-error hidden"></div>
            <div id="authSuccess" class="auth-success hidden"></div>

            <!-- Login Form -->
            <form id="authLoginForm" class="auth-form" onsubmit="handleLogin(event)">
                <input type="email" id="loginEmail" placeholder="Email" required autocomplete="email">
                <input type="password" id="loginPassword" placeholder="Şifrə" required autocomplete="current-password">
                <button type="submit" class="btn btn-primary" id="loginBtn">Daxil Ol</button>
            </form>

            <!-- Register Form -->
            <form id="authRegisterForm" class="auth-form hidden" onsubmit="handleRegister(event)">
                <input type="text" id="regName" placeholder="Ad Soyad" required>
                <input type="email" id="regEmail" placeholder="Email" required autocomplete="email">
                <input type="password" id="regPassword" placeholder="Şifrə (min. 6 simvol)" required autocomplete="new-password">
                <select id="regLevel">
                    <option value="A1">A1 - Başlanğıc</option>
                    <option value="A2">A2 - Əsas</option>
                    <option value="B1" selected>B1 - Orta</option>
                    <option value="B2">B2 - Yuxarı Orta</option>
                    <option value="C1">C1 - Təkmil</option>
                </select>
                <button type="submit" class="btn btn-primary" id="registerBtn">Qeydiyyatdan Keç</button>
            </form>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

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
    btn.textContent = 'Yüklənir...';
    clearAuthMessages();

    const result = await loginUser(email, password);

    if (result.success) {
        showAuthSuccess('Uğurla daxil oldunuz! ✅');
        setTimeout(() => closeAuthModal(), 1200);
    } else {
        showAuthError(result.error);
        btn.disabled = false;
        btn.textContent = 'Daxil Ol';
    }
};

// ===== Handle Register =====
window.handleRegister = async function (e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const level = document.getElementById('regLevel').value;
    const btn = document.getElementById('registerBtn');

    if (!name || name.length < 2) {
        showAuthError('Ad ən azı 2 hərf olmalıdır.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Qeydiyyat...';
    clearAuthMessages();

    const result = await registerUser(name, email, password, level);

    if (result.success) {
        showAuthSuccess('Qeydiyyat uğurlu! Xoş gəldiniz! 🎉');
        setTimeout(() => closeAuthModal(), 1500);
    } else {
        showAuthError(result.error);
        btn.disabled = false;
        btn.textContent = 'Qeydiyyatdan Keç';
    }
};

function showAuthError(msg) {
    const el = document.getElementById('authError');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

function showAuthSuccess(msg) {
    const el = document.getElementById('authSuccess');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

function clearAuthMessages() {
    const err = document.getElementById('authError');
    const suc = document.getElementById('authSuccess');
    if (err) err.classList.add('hidden');
    if (suc) suc.classList.add('hidden');
}

// ===== Init Auth =====
function initAuth() {
    injectAuthModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
