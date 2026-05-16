import sys
import re

with open('scripts/dashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_load_dashboard = '''async function loadDashboard(user) {
    if(!user) return;
    const uid = user.id || user.uid;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single();
    const { data: progress } = await supabase.from('progress').select('*').eq('user_id', uid);
    const today = new Date().toISOString().split('T')[0];
    const { data: aiUsage } = await supabase.from('ai_usage').select('*').eq('user_id', uid).eq('date', today).single();
    
    const p = profile || user;
    const hr = new Date().getHours();
    const greeting = hr < 12 ? "Sabahınız xeyir" : hr < 17 ? "Günortanız xeyir" : "Axşamınız xeyir";
    
    document.getElementById("dashGreeting").textContent = `${greeting}, ${p.full_name || p.name || 'İstifadəçi'}! 👋`;
    document.getElementById("dashSubtitle").textContent = `${p.level || "A1"} səviyyəsi | Qeydiyyat: ${new Date(p.created_at || Date.now()).toLocaleDateString('az-AZ')}`;
    document.getElementById("dashAvatar").textContent = (p.full_name || p.name || "U").charAt(0).toUpperCase();
    
    // Streak logic
    let currentStreak = p.streak || 0;
    if (progress && progress.length > 0) {
        const sorted = progress.sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at));
        const lastEntry = new Date(sorted[0].completed_at);
        const now = new Date();
        const diffTime = Math.abs(now - lastEntry);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if(diffDays === 0) {
            // Already active today
        } else if(diffDays === 1) {
            // Active yesterday, streak continues
        } else {
            currentStreak = 0; // Streak broken
            await supabase.from('profiles').update({ streak: 0 }).eq('id', uid);
        }
    }
    
    document.getElementById("dashStreakNum").textContent = currentStreak;
    if (currentStreak >= 7) {
        document.getElementById("dashStreakCard")?.classList.add("hot-streak");
    }

    animateStat("statWords", p.total_xp || 0); // Using xp for words
    animateStat("statTests", progress ? progress.length : 0);
    animateStat("statDays", currentStreak || 1);
    animateStat("statFavs", (p.favorites?.words || []).length);
    animateStat("statStreak", currentStreak);
    document.getElementById("statLevel").textContent = p.level || "A1";

    // AI messages remaining
    const usedAI = aiUsage ? (aiUsage.message_count || 0) : 0;
    const maxAI = 30;
    const remainingAI = Math.max(0, maxAI - usedAI);
    const tipIcon = document.getElementById("dashTipIcon");
    const tipTitle = document.getElementById("dashTipTitle");
    const tipText = document.getElementById("dashTipText");
    if (tipIcon && tipTitle && tipText) {
        tipIcon.textContent = "🤖";
        tipTitle.textContent = "AI Müəllim";
        tipText.textContent = `Bu gün üçün ${remainingAI} / ${maxAI} AI sorğunuz qalıb.`;
    }

    loadWeeklyProgress(p);
    loadBadges(p);
    loadTestHistory(progress);
    loadAccountInfo(p);
}
'''

content = re.sub(r'async function loadDashboard\(user\) \{.*?(?=^function animateStat)m', new_load_dashboard, content, flags=re.DOTALL|re.MULTILINE)

new_load_test = '''function loadTestHistory(progress) {
    const container = document.getElementById("testHistoryContent");
    if (!container) return;
    
    const history = progress || [];
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state">Hələ heç bir test tamamlanmayıb. <a href="test.html" class="link-primary">Testi başlayın →</a></div>';
        return;
    }
    
    container.innerHTML = '';
    const list = document.createElement("div");
    list.className = "test-history-list";
    
    [...history].sort((a,b)=>new Date(b.completed_at)-new Date(a.completed_at)).slice(0, 5).forEach(test => {
        const item = document.createElement("div");
        item.className = "test-history-item";
        
        const d = new Date(test.completed_at);
        const dateStr = isNaN(d) ? "" : d.toLocaleDateString("az-AZ");
        
        item.innerHTML = `
            <div class="test-level-badge">${test.lesson_type || "Test"}</div>
            <div class="test-info">
                <strong>${test.score || 0} xal</strong>
                <span>${dateStr}</span>
            </div>
        `;
        list.appendChild(item);
    });
    container.appendChild(list);
}'''
content = re.sub(r'function loadTestHistory\(user\) \{.*?(?=^function loadAccountInfo)m', new_load_test + '\n', content, flags=re.DOTALL|re.MULTILINE)

with open('scripts/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)
