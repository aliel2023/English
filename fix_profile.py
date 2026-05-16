import re

with open('profile.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_script = '''    <script type="module">
    import { supabase } from './js/config.js';

    function showMsg(text, type = 'success') {
        const el = document.getElementById('profileMsg');
        el.textContent = text;
        el.className = 'profile-msg show ' + type;
        setTimeout(() => el.classList.remove('show'), 4000);
    }

    let currentUser = null;

    // Load profile data when auth is ready
    document.addEventListener('alielAuthReady', async (e) => {
        const authUser = e.detail?.user;
        if (!authUser) {
            window.location.href = 'login.html?next=profile.html';
            return;
        }
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            currentUser = user;
            
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            
            const name = profile?.full_name || authUser.name || 'User';
            const email = user.email || authUser.email || '';
            const level = profile?.level || authUser.level || 'A1';
            
            const avatarEl = document.getElementById('profileAvatar');
            if (profile?.avatar_url) {
                avatarEl.innerHTML = `<img src="${profile.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else {
                avatarEl.textContent = name.charAt(0).toUpperCase();
            }
            
            document.getElementById('profileEmail').textContent = email;
            document.getElementById('profileName').value = name;
            document.getElementById('profileLevel').value = level;
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    });

    // Avatar upload logic
    window.uploadAvatar = async function(event) {
        const file = event.target.files[0];
        if (!file || !currentUser) return;
        
        const btn = document.getElementById('saveProfileBtn');
        btn.disabled = true; btn.textContent = 'Şəkil yüklənir...';
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}_${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
                
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
                
            await supabase.from('profiles').upsert({ id: currentUser.id, avatar_url: publicUrl });
            
            document.getElementById('profileAvatar').innerHTML = `<img src="${publicUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            showMsg('✅ Şəkil uğurla yeniləndi!');
        } catch (err) {
            showMsg('❌ Xəta: ' + (err.message || 'Yenidən cəhd edin'), 'error');
        } finally {
            btn.disabled = false; btn.textContent = '💾 Yadda Saxla';
        }
    };

    // Save profile
    window.saveProfile = async function() {
        const btn = document.getElementById('saveProfileBtn');
        const name = document.getElementById('profileName').value.trim();
        const level = document.getElementById('profileLevel').value;

        if (name.length < 2) return showMsg('Ad ən azı 2 hərf olmalıdır.', 'error');

        btn.disabled = true; btn.textContent = 'Yüklənir...';
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase.from('profiles').upsert({ 
                id: user.id, 
                full_name: name, 
                level: level 
            }, { onConflict: 'id' });
            if (error) throw error;

            if (!document.getElementById('profileAvatar').querySelector('img')) {
                document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
            }
            showMsg('✅ Profil uğurla yeniləndi!');
        } catch (err) {
            showMsg('❌ Xəta: ' + (err.message || 'Yenidən cəhd edin'), 'error');
        } finally {
            btn.disabled = false; btn.textContent = '💾 Yadda Saxla';
        }
    };

    // Change password
    window.changePassword = async function() {
        const newPw = document.getElementById('newPassword').value;
        const confirmPw = document.getElementById('confirmPassword').value;

        if (newPw.length < 8) return showMsg('Şifrə minimum 8 simvol olmalıdır.', 'error');
        if (newPw !== confirmPw) return showMsg('Şifrələr uyğun gəlmir.', 'error');

        try {
            const { error } = await supabase.auth.updateUser({ password: newPw });
            if (error) throw error;
            showMsg('✅ Şifrə uğurla dəyişdirildi!');
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } catch (err) {
            showMsg('❌ Xəta: ' + (err.message || 'Yenidən cəhd edin'), 'error');
        }
    };

    // Delete account
    window.deleteAccount = async function() {
        const confirmed = confirm('⚠️ DİQQƏT: Hesabınız və bütün məlumatlarınız həmişəlik silinəcək. Davam etmək istəyirsiniz?');
        if (!confirmed) return;

        const secondConfirm = prompt('Hesabı silmək üçün "SİL" yazın:');
        if (secondConfirm !== 'SİL') return showMsg('Hesab silmə ləğv edildi.', 'error');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Delete user data from profiles table (optional if ON DELETE CASCADE is set)
            await supabase.from('profiles').delete().eq('id', user.id);
            await supabase.from('users').delete().eq('uid', user.id);

            // Sign out
            await supabase.auth.signOut();
            showMsg('Hesabınız silindi. Yönləndirilir...');
            setTimeout(() => window.location.href = 'index.html', 2000);
        } catch (err) {
            showMsg('❌ Xəta: ' + (err.message || 'Admin ilə əlaqə saxlayın.'), 'error');
        }
    };
    </script>'''

content = re.sub(r'<script type="module">\s*import \{ supabase \}.*?</script>', new_script, content, flags=re.DOTALL)

# Add avatar upload input
avatar_html = '''<div class="profile-avatar-section">
                    <div class="profile-avatar-lg" id="profileAvatar" onclick="document.getElementById('avatarUpload').click()" style="cursor:pointer;position:relative;overflow:hidden;" title="Şəkli dəyiş">A</div>
                    <input type="file" id="avatarUpload" accept="image/*" style="display:none;" onchange="uploadAvatar(event)">
                    <p style="font-size:0.8rem;color:var(--muted);" id="profileEmail">-</p>
                    <p style="font-size:0.75rem;color:#e63946;cursor:pointer;" onclick="document.getElementById('avatarUpload').click()">Şəkli dəyiş</p>
                </div>'''
content = re.sub(r'<div class="profile-avatar-section">.*?</div>', avatar_html, content, flags=re.DOTALL)

with open('profile.html', 'w', encoding='utf-8') as f:
    f.write(content)
