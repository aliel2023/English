// ===== DASHBOARD PAGE =====
// Firebase alielAuthReady event-ə əsaslanır — localStorage YOX
let dashInited = false;
let currentDashUid = undefined;

function initDashboard(event) {
    const user = event && event.detail ? event.detail.user : (typeof getCurrentUser === 'function' ? getCurrentUser() : undefined);

    if (user === undefined) return; // auth state unknown

    const newUid = user ? user.uid : null;
    if (dashInited && currentDashUid === newUid) return;

    dashInited = true;
    currentDashUid = newUid;

    const content = document.getElementById('dashContent');
    const authReq = document.getElementById('dashAuthRequired');

    if (!user) {
        // İstifadəçi daxil olmayıb
        if (content) content.classList.add('hidden');
        if (authReq) authReq.classList.remove('hidden');
        return;
    }

    // İstifadəçi daxil olub — content göstər
    if (content) content.classList.remove('hidden');
    if (authReq) authReq.classList.add('hidden');

    loadDashboard(user);
}

// Yalnız Firebase auth event-ini dinlə
document.addEventListener('alielAuthReady', initDashboard);

// Race condition fallback: auth.js module əvvəl yüklənibsə event keçmiş ola bilər
let _dashCheckCount = 0;
function _checkAuthForDash() {
    if (dashInited && currentDashUid !== undefined) return;
    _dashCheckCount++;
    if (_dashCheckCount > 20) return;

    if (typeof getCurrentUser === 'function') {
        const user = getCurrentUser();
        if (user !== undefined) {
            initDashboard({ detail: { user: user } });
            return;
        }
    }
    setTimeout(_checkAuthForDash, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(_checkAuthForDash, 300);
});

function loadDashboard(user) {
    // Sanitize helper (auth.js-dən də əlaqili)
    const safe = typeof sanitizeHTML === 'function' ? sanitizeHTML : (s) => String(s || '');

    // Timestamp fix: Firestore Timestamp .toDate() tləb edir
    function parseDate(val) {
        if (!val) return 'Məlumat yoxdur';
        if (val && typeof val.toDate === 'function') return val.toDate().toLocaleDateString('az-AZ');
        const d = new Date(val);
        return isNaN(d) ? 'Məlumat yoxdur' : d.toLocaleDateString('az-AZ');
    }

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Sabahınız xeyir' : hour < 17 ? 'Günortanız xeyir' : 'Axşamınız xeyir';

    const greetEl = document.getElementById('dashGreeting');
    if (greetEl) greetEl.textContent = `${greeting}, ${user.name}! 👋`;

    const subEl = document.getElementById('dashSubtitle');
    if (subEl) subEl.textContent = `${user.level || 'A1'} səviyyəsi | Qeydiyyat: ${parseDate(user.createdAt)}`;

    const avEl = document.getElementById('dashAvatar');
    if (avEl) avEl.textContent = (user.name || 'U').charAt(0).toUpperCase();

    // Streak
    const streakNum = document.getElementById('dashStreakNum');
    if (streakNum) streakNum.textContent = user.currentStreak || 0;
    const streakCard = document.getElementById('dashStreakCard');
    if (streakCard && user.currentStreak >= 7) streakCard.classList.add('hot-streak');

    // Stats
    animateStat('statWords', (user.seenWords || []).length);
    animateStat('statTests', (user.testHistory || []).length);
    animateStat('statDays', user.activeDays || 1);
    animateStat('statFavs', ((user.favorites && user.favorites.words) || []).length);
    animateStat('statStreak', user.longestStreak || user.currentStreak || 0);
    const lvlEl = document.getElementById('statLevel');
    if (lvlEl) lvlEl.textContent = user.level || 'A1';

    // Daily tip
    const tip = getDailyTip(user);
    const tipIcon = document.getElementById('dashTipIcon');
    const tipTitle = document.getElementById('dashTipTitle');
    const tipText = document.getElementById('dashTipText');
    if (tipIcon) tipIcon.textContent = tip.icon;
    if (tipTitle) tipTitle.textContent = tip.title;
    if (tipText) tipText.textContent = tip.content;

    // Weekly progress
    loadWeeklyProgress(user);

    // Badges
    loadBadges(user);

    // Test history — XSS-safe
    loadTestHistory(user);

    // Account info
    loadAccountInfo(user, parseDate);
}

function animateStat(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof target === 'string') { el.textContent = target; return; }
    if (target === 0) { el.textContent = '0'; return; }

    let current = 0;
    const increment = Math.max(1, target / 30);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
        else el.textContent = Math.floor(current);
    }, 40);
}

function loadWeeklyProgress(user) {
    const container = document.getElementById('weeklyDays');
    const dayNames = ['B', 'Ç.A', 'Ç', 'C.A', 'C', 'Ş', 'B.'];
    const fullDayNames = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];

    const today = new Date();
    const todayDay = today.getDay(); // 0=Sunday
    const loginHistory = (user.loginHistory || []).map(d => new Date(d).toDateString());

    let weekProgress = 0;

    for (let i = 0; i < 7; i++) {
        const dayOffset = i - todayDay;
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + dayOffset);

        const isToday = i === todayDay;
        const isPast = dayDate < today || isToday;
        const wasActive = loginHistory.includes(dayDate.toDateString());

        if (wasActive) weekProgress++;

        const dayEl = document.createElement('div');
        dayEl.className = `weekly-day ${isToday ? 'today' : ''} ${wasActive ? 'active' : ''} ${isPast && !wasActive ? 'missed' : ''}`;
        dayEl.title = fullDayNames[i];
        dayEl.innerHTML = `
            <div class="day-circle">${wasActive ? '✓' : dayNames[i]}</div>
            <div class="day-name">${dayNames[i]}</div>
        `;
        container.appendChild(dayEl);
    }

    const goalEl = document.getElementById('weeklyGoalText');
    if (goalEl) goalEl.textContent = `${weekProgress}/${user.weeklyGoal || 7} gün`;
}

function loadBadges(user) {
    const grid = document.getElementById('badgesGrid');
    const badges = user.badges || ['🌟 Yeni Başlayən'];
    // Use correct Firestore paths
    const favWords = (user.favorites && user.favorites.words) || user.favoriteWords || [];

    const allPossibleBadges = [
        { badge: '🌟 Yeni Başlayən', desc: 'Qeydiyyatdan keçdiniz', unlocked: true },
        { badge: '📅 1 Həftə', desc: '7 dəfə giriş', unlocked: (user.loginCount || 0) >= 7 },
        { badge: '🔥 7 Günlük Sıra', desc: '7 gün ardıcıl', unlocked: (user.currentStreak || 0) >= 7 },
        { badge: '📚 10 Söz', desc: '10 söz öyrəndiniz', unlocked: (user.seenWords || []).length >= 10 },
        { badge: '📚 50 Söz', desc: '50 söz öyrəndiniz', unlocked: (user.seenWords || []).length >= 50 },
        { badge: '❤️ Sevimlilər', desc: '5 söz sevimlilərə', unlocked: favWords.length >= 5 },
        { badge: '🧪 Test Ustadı', desc: '3 test tamaməldınız', unlocked: (user.testHistory || []).length >= 3 },
        { badge: '🏅 1 Ay', desc: '30 giriş', unlocked: (user.loginCount || 0) >= 30 },
        { badge: '🔥 30 Günlük Sıra', desc: '30 gün ardıcıl', unlocked: (user.currentStreak || 0) >= 30 },
        { badge: '📈 B1 Səviyyəsi', desc: 'B1 və ya üzrǐ çatın', unlocked: ['B1', 'B2', 'C1', 'C2'].includes(user.level) },
        { badge: '🎓 İleri Səviyyə', desc: 'C1 və ya üzrǐ çatın', unlocked: ['C1', 'C2'].includes(user.level) },
    ];

    allPossibleBadges.forEach(b => {
        const el = document.createElement('div');
        el.className = `badge-card ${b.unlocked ? 'unlocked' : 'locked'}`;
        el.innerHTML = `
            <div class="badge-emoji">${b.badge.split(' ')[0]}</div>
            <div class="badge-name">${b.badge.slice(b.badge.indexOf(' ') + 1)}</div>
            <div class="badge-desc">${b.desc}</div>
            ${!b.unlocked ? '<div class="badge-lock">🔒</div>' : ''}
        `;
        grid.appendChild(el);
    });
}

function loadTestHistory(user) {
    const container = document.getElementById('testHistoryContent');
    if (!container) return;
    const history = user.testHistory || [];

    if (history.length === 0) {
        container.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'empty-state';
        msg.innerHTML = 'Hələ heç bir test tamamlanmayıb. <a href="test.html" class="link-primary">Testi başlayın →</a>';
        container.appendChild(msg);
        return;
    }

    const recent = [...history].reverse().slice(0, 10);
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'test-history-list';

    recent.forEach(t => {
        const item = document.createElement('div');
        item.className = 'test-history-item';

        // XSS-safe: textContent instead of innerHTML for user data
        const levelBadge = document.createElement('div');
        levelBadge.className = 'test-level-badge';
        levelBadge.textContent = t.level || '?';

        const info = document.createElement('div');
        info.className = 'test-info';
        const score = document.createElement('strong');
        score.textContent = `${parseInt(t.score) || 0}/${parseInt(t.total) || 0} düzgün`;
        const dateEl = document.createElement('span');
        const d = new Date(t.date);
        dateEl.textContent = isNaN(d) ? '' : d.toLocaleDateString('az-AZ');
        info.appendChild(score);
        info.appendChild(dateEl);

        const pct = document.createElement('div');
        pct.className = 'test-score-pct';
        const pctVal = Math.round(t.percentage || (t.total ? (t.score / t.total) * 100 : 0));
        pct.textContent = `%${pctVal}`;
        pct.style.color = pctVal >= 70 ? 'var(--success)' : 'var(--warning)';

        item.appendChild(levelBadge);
        item.appendChild(info);
        item.appendChild(pct);
        list.appendChild(item);
    });

    container.appendChild(list);
}

function loadAccountInfo(user, parseDate) {
    const grid = document.getElementById('accountInfoGrid');
    if (!grid) return;

    // XSS-safe: use textContent, not innerHTML for user data
    const items = [
        { label: '👤 Ad', value: user.name || '' },
        { label: '📧 Email', value: user.email || '' },
        { label: '📅 Qeydiyyat', value: parseDate ? parseDate(user.createdAt) : '' },
        { label: '📈 Səviyyə', value: user.level || 'A1' },
        { label: '🔥 Streak', value: `${user.currentStreak || 0} gün` },
    ];

    grid.innerHTML = '';
    items.forEach(({ label, value }) => {
        const div = document.createElement('div');
        div.className = 'account-info-item';
        const lbl = document.createElement('span');
        lbl.className = 'acc-label';
        lbl.textContent = label;
        const val = document.createElement('span');
        val.className = 'acc-value';
        val.textContent = value;
        div.appendChild(lbl);
        div.appendChild(val);
        grid.appendChild(div);
    });
}

// ===== DAILY TIP =====
function getDailyTip(user) {
    const streak = user.currentStreak || 0;
    const level = user.level || 'A1';
    const testCount = (user.testHistory || []).length;
    const favCount = ((user.favorites && user.favorites.words) || []).length;

    if (streak === 0) return { icon: '🌱', title: 'Başlayın!', content: 'Hər gün bir səhifə oxumaq vərdiyinizi formələşdirin. Streak-inizi başlatməq üçün bu gün fəaliyyət göstərin!' };
    if (streak < 7) return { icon: '🔥', title: 'Davam edin!', content: `${streak} günlük siranız var. 7 günü tamamlamaq üçün davam edin!` };
    if (streak >= 7 && testCount < 1) return { icon: '🎯', title: 'Test vaxtı!', content: 'Artıq möhtəşəm bir siranız var. Səviyyə testini keçmǐyi unutmayın!' };
    if (favCount < 5) return { icon: '❤️', title: 'Söz saxlayın!', content: 'Günün Sozü bölməsindən sözləri sevimlilərə əlavə edin. 5+ söz badge qazanadırsınız!' };
    return { icon: '🚀', title: 'Həyəcan verici!', content: `${level} səviyyəsini mənimsiyirsiniz. Növbəti hədəfə doğru irəlǐləmək üçün hər gün davam edin!` };
}
