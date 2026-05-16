import re

with open('scripts/auth.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_saveTestResult = '''window.saveTestResult = async function(level, score, total, percentage){
    if(currentUser) {
        try {
            const pct = percentage !== undefined ? Math.round(percentage) : Math.round(score/total*100);
            
            // Insert into progress table
            const { error: progErr } = await supabase.from('progress').insert([{
                user_id: currentUser.id,
                lesson_id: 'test_' + level,
                lesson_type: level,
                score: score
            }]);
            if (progErr) console.error('progress insert error:', progErr);
            
            // Update profiles table (level and xp)
            const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', currentUser.id).single();
            const currentXp = profile ? (profile.total_xp || 0) : 0;
            const newXp = currentXp + (score * 10); // 10 xp per correct answer
            
            await supabase.from('profiles').update({
                level: level,
                total_xp: newXp
            }).eq('id', currentUser.id);
            
            if(currentUserData) {
                currentUserData.level = level;
            }
        } catch(e) {
            console.error("saveTestResult:", e);
        }
    }
};'''

content = re.sub(r'window\.saveTestResult = async function\(level, score, total, percentage\)\{.*?(?=\nwindow\.toggleUserDropdown)', new_saveTestResult, content, flags=re.DOTALL)

with open('scripts/auth.js', 'w', encoding='utf-8') as f:
    f.write(content)
