import { supabase } from '../js/config.js';

let dashInited = false;
let currentDashUid = null;

// Call init on auth ready
document.addEventListener("alielAuthReady", (e) => {
    initDashboard(e.detail?.user);
});

async function initDashboard(user) {
    if (!user) {
        document.getElementById("dashContent")?.classList.add("hidden");
        document.getElementById("dashAuthRequired")?.classList.remove("hidden");
        return;
    }
    
    if (dashInited && currentDashUid === user.uid) return;
    dashInited = true;
    currentDashUid = user.uid;

    document.getElementById("dashContent")?.classList.remove("hidden");
    document.getElementById("dashAuthRequired")?.classList.add("hidden");

    loadDashboard(user);
}

async function loadDashboard(user) {
    const hr = new Date().getHours();
    const greeting = hr < 12 ? "Sabahınız xeyir" : hr < 17 ? "Günortanız xeyir" : "Axşamınız xeyir";
    
    document.getElementById("dashGreeting").textContent = `${greeting}, ${user.name}! 👋`;
    document.getElementById("dashSubtitle").textContent = `${user.level || "A1"} səviyyəsi | Qeydiyyat: ${new Date().toLocaleDateString('az-AZ')}`;
    document.getElementById("dashAvatar").textContent = (user.name || "U").charAt(0).toUpperCase();
    document.getElementById("dashStreakNum").textContent = user.current_streak || 0;

    if ((user.current_streak || 0) >= 7) {
        document.getElementById("dashStreakCard")?.classList.add("hot-streak");
    }

    animateStat("statWords", user.words_learned || 0);
    animateStat("statTests", user.tests_completed || 0);
    animateStat("statDays", user.active_days || 1);
    animateStat("statFavs", (user.favorites?.words || []).length);
    animateStat("statStreak", user.longest_streak || user.current_streak || 0);
    document.getElementById("statLevel").textContent = user.level || "A1";

    // AI messages remaining
    if (window.AISystem) {
        const usage = await window.AISystem.checkUsage(user.uid);
        const tipIcon = document.getElementById("dashTipIcon");
        const tipTitle = document.getElementById("dashTipTitle");
        const tipText = document.getElementById("dashTipText");
        if (tipIcon && tipTitle && tipText) {
            tipIcon.textContent = "🤖";
            tipTitle.textContent = "AI Müəllim";
            if (usage.isPremium) {
                tipText.textContent = "Sizin limitsiz AI sorğu haqqınız var (Pro).";
            } else {
                tipText.textContent = `Bu gün üçün ${usage.remaining} / ${usage.max} AI sorğunuz qalıb.`;
            }
        }
    }

    loadWeeklyProgress(user);
    loadBadges(user);
    loadTestHistory(user);
    loadAccountInfo(user);
}

function animateStat(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof target === "string" || target === 0) {
        el.textContent = target;
        return;
    }
    let current = 0;
    const step = Math.max(1, target / 30);
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target;
            clearInterval(interval);
        } else {
            el.textContent = Math.floor(current);
        }
    }, 40);
}

function loadWeeklyProgress(user) {
    const container = document.getElementById("weeklyDays");
    if (!container) return;
    container.innerHTML = '';
    
    const days = ["B", "Ç.A", "Ç", "C.A", "C", "Ş", "B."];
    const fullDays = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
    const now = new Date();
    const todayIndex = now.getDay();
    const activity = user.weekly_activity || [false, false, false, false, false, false, false];
    
    let activeCount = 0;
    for (let i = 0; i < 7; i++) {
        const isToday = i === todayIndex;
        const isActive = activity[i];
        if (isActive) activeCount++;
        
        const el = document.createElement("div");
        el.className = `weekly-day ${isToday ? "today" : ""} ${isActive ? "active" : ""}`;
        el.title = fullDays[i];
        el.innerHTML = `
            <div class="day-circle">${isActive ? "✓" : days[i]}</div>
            <div class="day-name">${days[i]}</div>
        `;
        container.appendChild(el);
    }
    
    const goalText = document.getElementById("weeklyGoalText");
    if (goalText) goalText.textContent = `${activeCount}/7 gün`;
}

function loadBadges(user) {
    const container = document.getElementById("badgesGrid");
    if (!container) return;
    container.innerHTML = '';
    
    const userBadges = user.badges || [];
    
    const allBadges = [
        { name: "🌱 Başlanğıc", desc: "Sistemə qoşuldunuz", req: true },
        { name: "🔥 7 Günlük Sıra", desc: "7 gün ardıcıl daxil ol", req: userBadges.includes("🔥 7 Günlük Sıra") || (user.current_streak >= 7) },
        { name: "🏆 30 Günlük Sıra", desc: "30 gün ardıcıl daxil ol", req: userBadges.includes("🏆 30 Günlük Sıra") || (user.current_streak >= 30) },
        { name: "📚 Söz Ustadı", desc: "50 söz öyrən", req: user.words_learned >= 50 },
        { name: "🎯 Test Ustadı", desc: "10 test tamamla", req: user.tests_completed >= 10 }
    ];
    
    allBadges.forEach(b => {
        const el = document.createElement("div");
        el.className = "badge-card " + (b.req ? "unlocked" : "locked");
        const parts = b.name.split(" ");
        el.innerHTML = `
            <div class="badge-emoji">${parts[0]}</div>
            <div class="badge-name">${parts.slice(1).join(" ")}</div>
            <div class="badge-desc">${b.desc}</div>
            ${b.req ? "" : '<div class="badge-lock">🔒</div>'}
        `;
        container.appendChild(el);
    });
}

function loadTestHistory(user) {
    const container = document.getElementById("testHistoryContent");
    if (!container) return;
    
    const history = user.test_history || [];
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state">Hələ heç bir test tamamlanmayıb. <a href="test.html" class="link-primary">Testi başlayın →</a></div>';
        return;
    }
    
    container.innerHTML = '';
    const list = document.createElement("div");
    list.className = "test-history-list";
    
    [...history].reverse().slice(0, 5).forEach(test => {
        const item = document.createElement("div");
        item.className = "test-history-item";
        
        const d = new Date(test.date);
        const dateStr = isNaN(d) ? "" : d.toLocaleDateString("az-AZ");
        
        item.innerHTML = `
            <div class="test-level-badge">${test.level || "?"}</div>
            <div class="test-info">
                <strong>${test.score}/${test.total} düzgün</strong>
                <span>${dateStr}</span>
            </div>
            <div class="test-score-pct" style="color: ${test.percentage >= 70 ? 'var(--success)' : 'var(--warning)'}">${test.percentage}%</div>
        `;
        list.appendChild(item);
    });
    container.appendChild(list);
}

function loadAccountInfo(user) {
    const container = document.getElementById("accountInfoGrid");
    if (!container) return;
    container.innerHTML = '';
    
    const isPro = user.role === 'admin' || user.premium_active;
    
    const info = [
        { label: "👤 Ad", value: user.name || "" },
        { label: "📧 Email", value: user.email || "" },
        { label: "📈 Səviyyə", value: user.level || "A1" },
        { label: "⭐ Status", value: isPro ? "PRO" : "Standart" }
    ];
    
    info.forEach(item => {
        const el = document.createElement("div");
        el.className = "account-info-item";
        el.innerHTML = `<span class="acc-label">${item.label}</span><span class="acc-value">${item.value}</span>`;
        container.appendChild(el);
    });
}