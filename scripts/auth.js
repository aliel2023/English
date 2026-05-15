import { supabase } from '../js/config.js';

!function(){const e=document.createElement("style");e.id="auth-nav-hide",e.textContent="\n        .nav-auth-pending .auth-nav-btn,\n        .nav-auth-pending .user-nav-menu {\n            opacity: 0 !important;\n            pointer-events: none !important;\n            transition: opacity 0.25s ease !important;\n        }\n    ",document.head.appendChild(e),document.addEventListener("DOMContentLoaded",()=>{const e=document.querySelector(".nav-actions");e&&e.classList.add("nav-auth-pending")})}();

function sanitizeHTML(e){if(typeof e!=="string")return String(e||"");if(window.DOMPurify)return window.DOMPurify.sanitize(e);return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")}
window.sanitizeHTML=sanitizeHTML;

const Validator={email:e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()),name:e=>e.trim().length>=2&&e.trim().length<=50&&/^[\p{L}\s\-']+$/u.test(e.trim()),password:e=>e.length>=8,hasUpperCase:e=>/[A-Z]/.test(e),hasNumber:e=>/[0-9]/.test(e),hasSpecial:e=>/[!@#$%^&*(),.?":{}|<>]/.test(e),strength:e=>{let t=0;return e.length>=8&&t++,e.length>=12&&t++,/[A-Z]/.test(e)&&t++,/[0-9]/.test(e)&&t++,/[^A-Za-z0-9]/.test(e)&&t++,t}};
const RateLimit={attempts:0,lockedUntil:0,penalties:[0,0,0,0,0,9e5],check(){const e=Date.now();if(e<this.lockedUntil){const t=Math.ceil((this.lockedUntil-e)/1e3),a=Math.floor(t/60);return{allowed:!1,message:`🔒 ${a>0?a+" dəq ":""}${t%60} san gözləyin.`}}this.attempts++;const t=this.penalties[Math.min(this.attempts,this.penalties.length-1)];return t>0&&(this.lockedUntil=e+t),{allowed:!0}},reset(){this.attempts=0,this.lockedUntil=0}};

function isAdminUser(e){return e&&"admin"===e.role}
let currentUser,currentUserData,authInitialized=!1,_navRendered=!1;

function updateHeroCTA(e){const t=document.getElementById("heroStartBtn"),a=document.getElementById("heroDashBtn");(t||a)&&(t&&t.classList.toggle("hidden",e),a&&a.classList.toggle("hidden",!e))}

async function getUserData(uid){
    try {
        const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single();
        if (error) {
            console.error("getUserData error:", error);
            if(typeof showToast==="function") showToast("Profil məlumatları yüklənmədi. Yenidən cəhd edin.","error");
            return { error: true, code: error.code };
        }
        return data;
    } catch (e) {
        return { error: true, code: e.message };
    }
}

async function registerUser(name, email, password, level="A1"){
    name=name.trim(); email=email.trim().toLowerCase();
    if(!Validator.name(name))return{success:!1,error:"Ad 2-50 hərf arasında, yalnız hərflər."};
    if(!Validator.email(email))return{success:!1,error:"Email formatı yanlışdır."};
    if(!Validator.password(password))return{success:!1,error:"Şifrə minimum 8 simvol olmalıdır."};
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email, password, options: { data: { displayName: name } }
        });
        if (authError) throw authError;

        const uid = authData.user.id;
        const role = email === "englishaliel@gmail.com" ? "admin" : "user";
        
        const userData = {
            uid: uid,
            name: sanitizeHTML(name),
            email: email,
            level: level,
            role: role,
            premium_active: false,
            premium_expires_at: null,
            current_streak: 0,
            longest_streak: 0,
            last_active_date: (new Date).toDateString(),
            active_days: 1,
            words_learned: 0,
            tests_completed: 0,
            badges: ["🌱 Başlanğıc"],
            favorites: {words:[],grammar:[],phrases:[]},
            weekly_activity: [false,false,false,false,false,false,false],
            test_history: [],
            privacy: {showProfile:false,showStreak:true},
            daily_query_count: 0,
            last_reset_date: (new Date).toISOString()
        };

        const { error: dbError } = await supabase.from('users').insert([userData]);
        if (dbError && dbError.code !== '23505') throw dbError; // Ignore if exists due to trigger
        
        return { success: true, user: userData };
    } catch (e) {
        return { success: false, error: getErrorMessage(e.message || e.code) };
    }
}

async function loginUser(email, password){
    const a=RateLimit.check();if(!a.allowed)return{success:!1,error:a.message};
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        RateLimit.reset();
        return { success: true, user: await getUserData(data.user.id) };
    } catch (e) {
        return { success: false, error: getErrorMessage(e.message || e.code) };
    }
}

async function updateUserStreak(uid){
    try{
        const t=await getUserData(uid);
        if(!t || t.error)return;
        const a=(new Date).toDateString();
        if(t.last_active_date===a)return;
        const n=new Date(Date.now()-864e5).toDateString(),
              s=t.last_active_date===n?(t.current_streak||0)+1:1,
              i=Math.max(s,t.longest_streak||0),
              r=(new Date).getDay(),
              o=t.weekly_activity||[false,false,false,false,false,false,false];
        o[r]=true;
        
        let badges = t.badges || [];
        if(s>=7 && !badges.includes("🔥 7 Günlük Sıra")) badges.push("🔥 7 Günlük Sıra");
        if(s>=30 && !badges.includes("🏆 30 Günlük Sıra")) badges.push("🏆 30 Günlük Sıra");

        await supabase.from('users').update({
            current_streak: s,
            longest_streak: i,
            last_active_date: a,
            active_days: (t.active_days||0)+1,
            weekly_activity: o,
            badges: badges
        }).eq('uid', uid);

        if(currentUserData) {
            currentUserData.current_streak=s; 
            currentUserData.longest_streak=i;
            currentUserData.badges = badges;
        }
    }catch(e){console.error("streak:",e); if(typeof showToast==="function") showToast("Streak yenilənmədi.","warning")}
}

function getErrorMessage(e){
    if (e.includes("already registered") || e.includes("User already exists")) return "📧 Bu email artıq qeydiyyatdan keçib.";
    if (e.includes("Password should be at least")) return "🔑 Şifrə çox zəifdir.";
    if (e.includes("Invalid login credentials")) return "❌ Email və ya şifrə yanlışdır.";
    if (e.includes("Email not confirmed")) return "📧 Email təsdiq edilməyib.";
    return "⚠️ Xəta baş verdi. Yenidən cəhd edin. (" + e + ")";
}

function updateNavForUser(e){
    const t=document.querySelector(".nav-actions"),a=document.getElementById("navMenu");
    t&&t.querySelectorAll(".auth-nav-btn, .user-nav-menu, .nav-auth-loading").forEach(e=>e.remove());
    a&&a.querySelectorAll(".auth-nav-mobile").forEach(e=>e.remove());
    const n=encodeURIComponent(window.location.pathname.split("/").pop()||"");
    if(e&&!e.error){
        const name=e.name||"İstifadəçi",
              s=sanitizeHTML(name.charAt(0).toUpperCase()),
              i=sanitizeHTML(name.split(" ")[0]),
              r=sanitizeHTML(name),
              o=sanitizeHTML(e.level||"A1"),
              l=parseInt(e.current_streak)||0,
              d=isAdminUser(e),
              isPremium=window.isUserPremium?window.isUserPremium():false;
        t&&(t.insertAdjacentHTML("afterbegin",`\n                <div class="user-nav-menu" id="userNavMenu">\n                    <button class="user-avatar-btn" onclick="toggleUserDropdown()">\n                        <span class="user-avatar">${s}</span>\n                        <span class="user-name-short">${i}</span>\n                        <span class="streak-badge">🔥${l}</span>\n                    </button>\n                    <div class="user-dropdown" id="userDropdown">\n                        <div class="user-dropdown-header">\n                            <strong>${r}</strong>\n                            <span class="user-level-badge">${o}</span>\n                            ${isPremium?'<span style="font-size: 0.75rem; background: linear-gradient(90deg, #ffd700, #ffaa00); color: #000; padding: 0.1rem 0.3rem; border-radius: 4px; font-weight: bold; margin-left: 0.5rem;" title="Premium Hesab">⭐ PRO</span>':""}\n                        </div>\n                        <a href="favorites.html" class="dropdown-item" data-i18n="nav.favorites">❤️ Sevimlilər</a>\n                        <a href="profile.html" class="dropdown-item">👤 Profil</a>\n                        <a href="dashboard.html" class="dropdown-item" data-i18n="nav.dashboard">📊 Dashboard</a>\n                        ${d?'<a href="admin.html" class="dropdown-item" style="color:#ffd700;font-weight:700;" data-i18n="nav.admin">👑 Admin Panel</a>':""}\n                        <button onclick="logoutUser()" class="dropdown-item logout-btn" data-i18n="nav.logout">🚪 Çıxış</button>\n                    </div>\n                </div>`),
        t._dropdownListenerAdded||(t._dropdownListenerAdded=!0,document.addEventListener("click",e=>{const t=document.getElementById("userNavMenu");if(t&&!t.contains(e.target)){const e=document.getElementById("userDropdown");e&&e.classList.remove("show")}})));
        a&&a.insertAdjacentHTML("beforeend",`\n                <li class="auth-nav-mobile" style="border-top:1px solid rgba(255,255,255,.15);margin-top:.5rem;padding-top:.5rem;">\n                    <a href="dashboard.html"><span data-i18n="nav.dashboard">📊 Dashboard</span> (${i})</a>\n                </li>\n                <li class="auth-nav-mobile">\n                    <a href="favorites.html" data-i18n="nav.favorites">❤️ Sevimlilər</a>\n                </li>\n                ${d?'<li class="auth-nav-mobile"><a href="admin.html" style="color:#ffd700;font-weight:700;" data-i18n="nav.admin">👑 Admin Panel</a></li>':""}\n                <li class="auth-nav-mobile">\n                    <a href="#" onclick="logoutUser();closeMobileMenu();return false;" style="color:#ff6b6b;" data-i18n="nav.logout">🚪 Çıxış</a>\n                </li>`)
    }else{
        t&&t.insertAdjacentHTML("afterbegin",`<a href="login.html${n?"?next="+n:""}" class="btn btn-sm auth-nav-btn" style="padding:0.5rem 1rem;text-decoration:none;" data-i18n="nav.login">Daxil Ol</a>`);
        a&&a.insertAdjacentHTML("beforeend",`\n                <li class="auth-nav-mobile" style="border-top:1px solid rgba(255,255,255,.15);margin-top:.5rem;padding-top:.5rem;">\n                    <a href="login.html${n?"?next="+n:""}"\n                       style="display:block;color:#e63946;font-weight:700;font-size:1rem;padding:0.5rem 0;" data-i18n="nav.login">\n                        Daxil Ol\n                    </a>\n                </li>`);
    }
    "function"==typeof window.translatePage&&window.translatePage();
    // Sidebar-a auth vəziyyətini bildir
    document.dispatchEvent(new CustomEvent('authStateChanged', { detail: e && !e.error ? e : null }));
}

function injectAuthModal(){
    document.body.insertAdjacentHTML("beforeend",'\n    <div id="alielAuthModal" class="modal auth-modal">\n        <div class="modal-content auth-modal-content auth-modal-v2">\n            <button class="modal-close auth-close-btn" onclick="closeAuthModal()">×</button>\n            <div class="auth-modal-header">\n                <div class="auth-logo-icon">A</div>\n                <h2 class="auth-modal-title">Alielenglish</h2>\n                <p class="auth-modal-subtitle">Hesabınıza daxil olun</p>\n            </div>\n            <div class="auth-tabs-v2">\n                <button id="authTab_login" class="auth-tab-v2 active" onclick="switchAuthTab(\'login\')">Daxil Ol</button>\n                <button id="authTab_register" class="auth-tab-v2" onclick="switchAuthTab(\'register\')">Qeydiyyat</button>\n            </div>\n            <div id="authError" class="auth-error-v2 hidden"></div>\n            <div id="authSuccess" class="auth-success-v2 hidden"></div>\n            <form id="authForm_login" class="auth-form-v2" onsubmit="handleLogin(event)">\n                <div class="auth-field">\n                    <label class="auth-label">📧 Email</label>\n                    <input type="email" id="loginEmail" class="auth-input-v2"\n                           placeholder="email@nümunə.com" required autocomplete="email">\n                </div>\n                <div class="auth-field">\n                    <label class="auth-label">🔑 Şifrə</label>\n                    <div class="auth-pw-wrap">\n                        <input type="password" id="loginPassword" class="auth-input-v2"\n                               placeholder="Şifrəniz" required autocomplete="current-password">\n                        <button type="button" class="pw-toggle" onclick="togglePwVisibility(\'loginPassword\',this)">👁</button>\n                    </div>\n                </div>\n                <button type="submit" class="auth-submit-btn" id="loginBtn">\n                    <span>Daxil Ol</span>\n                </button>\n                <div class="auth-divider"><span>yaxud</span></div>\n                <button type="button" class="auth-google-btn" onclick="signInWithGoogle()">\n                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>\n                    Google ilə daxil ol\n                </button>\n            </form>\n            <form id="authForm_register" class="auth-form-v2 hidden" onsubmit="handleRegister(event)">\n                <div class="auth-field-row">\n                    <div class="auth-field">\n                        <label class="auth-label">👤 Ad Soyad</label>\n                        <input type="text" id="regName" class="auth-input-v2"\n                               placeholder="Məsələn: Əli Hüseynov" required minlength="2" maxlength="50">\n                    </div>\n                    <div class="auth-field">\n                        <label class="auth-label">🎓 Səviyyə</label>\n                        <select id="regLevel" class="auth-input-v2 auth-select">\n                            <option value="A1">A1 — Başlanğıc</option>\n                            <option value="A2">A2 — Əsas</option>\n                            <option value="B1" selected>B1 — Orta</option>\n                            <option value="B2">B2 — Yuxarı Orta</option>\n                            <option value="C1">C1 — Təkmil</option>\n                            <option value="C2">C2 — Ustadlıq</option>\n                        </select>\n                    </div>\n                </div>\n                <div class="auth-field">\n                    <label class="auth-label">📧 Email</label>\n                    <input type="email" id="regEmail" class="auth-input-v2"\n                           placeholder="email@nümunə.com" required autocomplete="email">\n                </div>\n                <div class="auth-field">\n                    <label class="auth-label">🔑 Şifrə</label>\n                    <div class="auth-pw-wrap">\n                        <input type="password" id="regPassword" class="auth-input-v2"\n                               placeholder="Min. 8 simvol" required autocomplete="new-password"\n                               oninput="updatePasswordStrength(this.value)">\n                        <button type="button" class="pw-toggle" onclick="togglePwVisibility(\'regPassword\',this)">👁</button>\n                    </div>\n                    <div class="pw-strength-wrap">\n                        <div class="pw-strength-track">\n                            <div id="pwStrengthBar" class="pw-strength-bar"></div>\n                        </div>\n                        <span id="pwStrengthLabel" class="pw-strength-label"></span>\n                    </div>\n                </div>\n                <div class="auth-field">\n                    <label class="auth-label">🔑 Şifrəni Təkrarla</label>\n                    <div class="auth-pw-wrap">\n                        <input type="password" id="regPasswordConfirm" class="auth-input-v2"\n                               placeholder="Şifrəni yenidən daxil edin" required autocomplete="new-password">\n                        <button type="button" class="pw-toggle" onclick="togglePwVisibility(\'regPasswordConfirm\',this)">👁</button>\n                    </div>\n                </div>\n                <label class="auth-terms">\n                    <input type="checkbox" id="regTerms" required>\n                    <span>Gizlilik Siyasətini və İstifadə Şərtlərini qəbul edirəm</span>\n                </label>\n                <button type="submit" class="auth-submit-btn auth-register-btn" id="registerBtn">\n                    <span>Pulsuz Qeydiyyat</span>\n                </button>\n                <div class="auth-divider"><span>yaxud</span></div>\n                <button type="button" class="auth-google-btn" onclick="signInWithGoogle()">\n                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>\n                    Google ilə qeydiyyat\n                </button>\n            </form>\n            <div class="auth-security-badge">🔒 256-bit SSL şifrələmə · Supabase Auth · Məlumatlarınız qorunur</div>\n        </div>\n    </div>');
    document.getElementById("alielAuthModal").addEventListener("click",e=>{"alielAuthModal"===e.target.id&&closeAuthModal()});
}

function showAuthError(e){const t=document.getElementById("authError");t&&(t.textContent=e,t.classList.remove("hidden"))}
function showAuthSuccess(e){const t=document.getElementById("authSuccess");t&&(t.textContent=e,t.classList.remove("hidden"))}
function clearAuthMessages(){document.getElementById("authError")?.classList.add("hidden");document.getElementById("authSuccess")?.classList.add("hidden")}

supabase.auth.onAuthStateChange(async (event, session) => {
    authInitialized = true;
    if (session && session.user) {
        currentUser = session.user;
        let t = await getUserData(session.user.id);
        
        if (t === null || t?.error) {
            // Register flow for OAuth logins that didn't create user record
            const email = session.user.email;
            const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email?.split("@")[0] || "İstifadəçi";
            const role = email === "englishaliel@gmail.com" ? "admin" : "user";
            
            const n={
                uid: session.user.id,
                name: sanitizeHTML(name),
                email: email||"",
                level:"A1",
                role: role,
                premium_active:!1,
                premium_expires_at:null,
                current_streak:0,
                longest_streak:0,
                last_active_date:(new Date).toDateString(),
                active_days:1,
                words_learned:0,
                tests_completed:0,
                badges:["🌱 Başlanğıc"],
                favorites:{words:[],grammar:[],phrases:[]},
                weekly_activity:[!1,!1,!1,!1,!1,!1,!1],
                test_history:[],
                privacy:{showProfile:!1,showStreak:!0},
                daily_query_count:0,
                last_reset_date:(new Date).toISOString()
            };
            await supabase.from('users').upsert([n]);
            t = n;
        } else {
            // Update role if admin
            if (session.user.email === "englishaliel@gmail.com" && t.role !== "admin") {
                await supabase.from('users').update({role:"admin"}).eq('uid', session.user.id);
                t.role = "admin";
            }
        }
        
        currentUserData = t;
        _navRendered = false;
        updateNavForUser(currentUserData);
        document.querySelector(".nav-actions")?.classList.remove("nav-auth-pending");
        updateUserStreak(session.user.id);
        updateHeroCTA(true);
        document.dispatchEvent(new CustomEvent("alielAuthReady", {detail: {user: currentUserData}}));
        
        if (window.location.pathname.includes("admin.html") && currentUserData && currentUserData.role !== "admin") {
            window.location.href = "index.html";
        }
    } else {
        currentUser = null;
        currentUserData = null;
        _navRendered = false;
        updateNavForUser(null);
        document.querySelector(".nav-actions")?.classList.remove("nav-auth-pending");
        updateHeroCTA(false);
        document.dispatchEvent(new CustomEvent("alielAuthReady", {detail: {user: null}}));
        if (window.location.pathname.includes("admin.html")) {
            window.location.href = "index.html";
        }
    }
});

window.getCurrentUser = () => currentUserData;

window.signInWithGoogle = async function() {
    try {
        clearAuthMessages();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname }
        });
        if (error) throw error;
    } catch (e) {
        showAuthError("Google girişi uğursuz oldu: " + e.message);
    }
};

window.logoutUser = async function() {
    try {
        await supabase.auth.signOut();
        window.location.href = "index.html";
    } catch (e) {
        console.error(e);
        if(typeof showToast==="function") showToast("Çıxış zamanı xəta baş verdi.","error");
    }
};

window.addToFavorites = async function(e, t="words"){
    if(!currentUser){
        const next = encodeURIComponent(window.location.pathname.split("/").pop());
        return window.location.href=`login.html?next=${next}`,!1;
    }
    try {
        let favs = currentUserData?.favorites || {words:[], grammar:[], phrases:[]};
        if(!favs[t]) favs[t] = [];
        if(!favs[t].includes(e)) favs[t].push(e);
        
        await supabase.from('users').update({favorites: favs}).eq('uid', currentUser.id);
        if(currentUserData) currentUserData.favorites = favs;
        return true;
    } catch (e) {
        return false;
    }
};

window.removeFromFavorites = async function(e, t="words"){
    if(!currentUser) return false;
    try {
        let favs = currentUserData?.favorites || {words:[], grammar:[], phrases:[]};
        if(favs[t]) favs[t] = favs[t].filter(item => item !== e);
        
        await supabase.from('users').update({favorites: favs}).eq('uid', currentUser.id);
        if(currentUserData) currentUserData.favorites = favs;
        return true;
    } catch (e) {
        return false;
    }
};

window.saveTestResult = async function(level, score, total, percentage){
    if(currentUser) {
        try {
            const result = {
                level: level,
                score: score,
                total: total,
                percentage: percentage !== undefined ? Math.round(percentage) : Math.round(score/total*100),
                date: (new Date).toISOString()
            };
            
            let history = currentUserData?.test_history || [];
            history.push(result);
            const testsCompleted = (currentUserData?.tests_completed || 0) + 1;
            
            await supabase.from('users').update({
                level: level,
                tests_completed: testsCompleted,
                test_history: history
            }).eq('uid', currentUser.id);
            
            if(currentUserData) {
                currentUserData.level = level;
                currentUserData.tests_completed = testsCompleted;
                currentUserData.test_history = history;
            }
        } catch(e) {
            console.error("saveTestResult:", e);
            if(typeof showToast==="function") showToast("Test nəticəsi saxlanılmadı. Yenidən cəhd edin.","error");
        }
    }
};

window.toggleUserDropdown = function(){
    const e = document.getElementById("userDropdown");
    e && e.classList.toggle("show");
};

window.openAuthModal = function(e="login"){
    let t = document.getElementById("alielAuthModal");
    if(!t) {
        injectAuthModal();
        t = document.getElementById("alielAuthModal");
    }
    t.classList.add("active");
    document.body.style.overflow = "hidden";
    switchAuthTab(e);
};

window.closeAuthModal = function(){
    const e = document.getElementById("alielAuthModal");
    e && (e.classList.remove("active"), document.body.style.overflow="");
};

window.switchAuthTab = function(e){
    ["login","register"].forEach(t => {
        document.getElementById(`authTab_${t}`)?.classList.toggle("active", t===e);
        document.getElementById(`authForm_${t}`)?.classList.toggle("hidden", t!==e);
    });
};

window.updatePasswordStrength = function(e){
    const t = document.getElementById("pwStrengthBar"), a = document.getElementById("pwStrengthLabel");
    if(!t||!a) return;
    const n = [
        {w:"0%", c:"#ff4757", t:""},
        {w:"20%", c:"#ff4757", t:"🔴 Çox zəif"},
        {w:"40%", c:"#ffa502", t:"🟠 Zəif"},
        {w:"60%", c:"#eccc68", t:"🟡 Orta"},
        {w:"80%", c:"#2ed573", t:"🟢 Güclü"},
        {w:"100%", c:"#1e90ff", t:"💪 Çox güclü"}
    ];
    const s = n[Validator.strength(e)] || n[0];
    t.style.width = s.w; t.style.background = s.c;
    a.textContent = s.t; a.style.color = s.c;
};

window.togglePwVisibility = function(e, t){
    const a = document.getElementById(e);
    if(a) {
        if(a.type === "password") {
            a.type = "text"; t.textContent = "🙈";
        } else {
            a.type = "password"; t.textContent = "👁";
        }
    }
};

window.handleLogin = async function(e){
    e.preventDefault();
    const t = document.getElementById("loginEmail").value.trim(),
          a = document.getElementById("loginPassword").value,
          n = document.getElementById("loginBtn");
    
    n.disabled = true;
    n.innerHTML = '<span class="auth-spinner"></span> Yüklənir...';
    clearAuthMessages();
    
    const s = await loginUser(t, a);
    if(s.success){
        showAuthSuccess("✅ Uğurla daxil oldunuz! Yönləndirilir...");
        setTimeout(() => window.location.href = "dashboard.html", 1000);
    } else {
        showAuthError(s.error);
        n.disabled = false;
        n.innerHTML = "<span>Daxil Ol</span>";
    }
};

window.handleRegister = async function(e){
    e.preventDefault();
    const t = document.getElementById("regName").value.trim(),
          a = document.getElementById("regEmail").value.trim(),
          n = document.getElementById("regPassword").value,
          s = document.getElementById("regPasswordConfirm").value,
          i = document.getElementById("regLevel").value,
          r = document.getElementById("regTerms").checked,
          o = document.getElementById("registerBtn");
          
    clearAuthMessages();
    if(!r) return showAuthError("Şərtləri qəbul etməlisiniz.");
    if(n!==s) return showAuthError("🔑 Şifrələr uyğun gəlmir.");
    if(Validator.strength(n)<2) return showAuthError("🔑 Daha güclü şifrə seçin (hərflər + rəqəmlər).");
    
    o.disabled = true;
    o.innerHTML = '<span class="auth-spinner"></span> Qeydiyyat...';
    
    const l = await registerUser(t, a, n, i);
    if(l.success){
        showAuthSuccess("🎉 Qeydiyyat uğurlu! Yönləndirilir...");
        setTimeout(() => window.location.href = "dashboard.html", 1000);
    } else {
        showAuthError(l.error);
        o.disabled = false;
        o.innerHTML = "<span>Pulsuz Qeydiyyat</span>";
    }
};

window.isUserPremium = function(){
    if(!currentUserData) return false;
    if("admin" === currentUserData.role) return true;
    if(!currentUserData.premium_active) return false;
    if(currentUserData.premium_expires_at){
        const e = new Date(currentUserData.premium_expires_at).getTime();
        if(e < Date.now()) return false;
    }
    return true;
};

window.checkPremiumExpiration = async function(){
    if(currentUserData && currentUserData.premium_active && currentUserData.premium_expires_at){
        const e = new Date(currentUserData.premium_expires_at).getTime();
        if(e < Date.now()){
            try {
                await supabase.from('users').update({premium_active: false}).eq('uid', currentUser.id);
                currentUserData.premium_active = false;
                console.log("Premium expired");
            } catch(err) {
                console.error("Premium exp err:", err);
                if(typeof showToast==="function") showToast("Premium status yoxlanılmadı.","warning");
            }
        }
    }
};

window.handleAIQueryLimit = async function(uid) {
    // If no user, or user is guest, limit to 3
    if (!uid) {
        let guestCount = parseInt(localStorage.getItem('guest_ai_count') || '0');
        let guestDate = localStorage.getItem('guest_ai_date');
        let today = new Date().toDateString();
        if (guestDate !== today) {
            guestCount = 0;
            localStorage.setItem('guest_ai_date', today);
        }
        if (guestCount >= 3) return { allowed: false, count: guestCount, max: 3, isPro: false, reason: "guest_limit" };
        
        localStorage.setItem('guest_ai_count', guestCount + 1);
        return { allowed: true, count: guestCount + 1, max: 3, isPro: false };
    }

    try {
        // Check local memory first to bypass broken Supabase connection
        const isPro = currentUserData && currentUserData.premium && currentUserData.premium.active;
        if (isPro) {
            return { allowed: true, count: 0, max: Infinity, isPro: true };
        }

        let userCount = parseInt(localStorage.getItem(`user_ai_count_${uid}`) || '0');
        let userDate = localStorage.getItem(`user_ai_date_${uid}`);
        let today = new Date().toDateString();

        if (userDate !== today) {
            userCount = 0;
            localStorage.setItem(`user_ai_date_${uid}`, today);
        }

        if (userCount >= 20) {
            return { allowed: false, count: userCount, max: 20, isPro: false, reason: "standard_limit" };
        }

        localStorage.setItem(`user_ai_count_${uid}`, userCount + 1);
        return { allowed: true, count: userCount + 1, max: 20, isPro: false };

    } catch (e) {
        console.error("AI Limit Check Error:", e);
        return { allowed: true, reason: "error_bypass" }; // Bypass on error so it works
    }
};window.handleGoogleLogin = async function () {
    clearAuthMessages();
    const btn = document.getElementById('googleBtn');
    if(btn) {
        btn.disabled = true;
        btn.style.opacity = '.6';
    }
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname.replace('login.html', 'dashboard.html').replace('register.html', 'dashboard.html') }
        });
        if (error) throw error;
    } catch (err) {
        if(btn) {
            btn.disabled = false;
            btn.style.opacity = '';
        }
        showAuthError(err.message);
    }
};


window.handleForgotPassword = async function () {
    clearAuthMessages();
    const emailInput = document.getElementById('loginEmail');
    if(!emailInput) return;
    const email = emailInput.value.trim();
    if (!email) {
        showAuthError('Email daxil edin.');
        emailInput.focus();
        return;
    }
    const btn = document.getElementById('forgotBtn');
    if(btn) { btn.disabled = true; btn.textContent = 'GÖNDƏRİLİR...'; }
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });
        if (error) throw error;
        showAuthSuccess('Link email ünvanına göndərildi.');
    } catch (err) {
        showAuthError('Xəta baş verdi.');
    } finally {
        if(btn) { btn.disabled = false; btn.textContent = 'ŞİFRƏNİ UNUTDUM?'; }
    }
};

