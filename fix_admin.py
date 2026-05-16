import re

with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

script_start = html.find('<script type="module">')
script_end = html.find('</script>', script_start)

if script_start != -1 and script_end != -1:
    script_content = html[script_start:script_end]
    
    # Remove Firebase imports and config
    script_content = re.sub(r'import\{.*?\}from"https://www\.gstatic\.com/firebasejs/.*?";', '', script_content)
    script_content = re.sub(r'const firebaseConfig=\{.*?\};', '', script_content)
    script_content = re.sub(r'app=initializeApp\(firebaseConfig\),auth=getAuth\(app\),db=getFirestore\(app\);', '', script_content)
    
    # Add Supabase import
    script_content = script_content.replace('<script type="module">', '<script type="module">\nimport { supabase } from "./js/config.js";\n')
    
    # Replace getDocs
    script_content = re.sub(r'const e=await getDocs\(query\(collection\(db,"users"\),orderBy\("createdAt","desc"\)\)\);',
                           'const { data: e, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });', script_content)
    script_content = script_content.replace('return allUsersCache=e.docs.map(e=>({uid:e.id,...e.data()}))', 'return allUsersCache=e.map(e=>({...e, uid: e.id, name: e.full_name, createdAt: e.created_at, currentStreak: e.streak, testHistory: [], favorites: {words: []}}))')
    
    # Leads cache - maybe leads exist, or we can just comment it out
    script_content = re.sub(r'const e=await getDocs\(query\(collection\(db,"leads"\),orderBy\("createdAt","desc"\)\)\);',
                           'const { data: e, error } = await supabase.from("profiles").select("*").limit(0);', script_content)
    script_content = script_content.replace('return allLeadsCache=e.docs.map(e=>({id:e.id,...e.data()}))', 'return allLeadsCache=e||[]')
    
    # onAuthStateChanged
    script_content = re.sub(r'onAuthStateChanged\(auth,async e=>\{', 
                            'supabase.auth.onAuthStateChange(async (event, session) => { const e = session?.user; if(!e) return void showAccessDenied(\'Daxil olmamısınız. <a href="index.html" style="color:#6c63ff">Ana Səhifə</a>\');', script_content)
    
    script_content = re.sub(r'const t=await getDoc\(doc\(db,"users",e\.uid\)\);if\(\!t\.exists\(\)\|\|"admin"!==t\.data\(\)\.role\)',
                            'const { data: t } = await supabase.from("profiles").select("role, full_name").eq("id", e.id).single(); if(!t || "admin" !== t.role)', script_content)
    
    script_content = script_content.replace('const a=t.data();', 'const a = {...t, name: t.full_name};')
    
    # signOut
    script_content = script_content.replace('await signOut(auth);', 'await supabase.auth.signOut();')
    
    # updateDoc
    script_content = re.sub(r'await updateDoc\(doc\(window\._db,"users",e\),\{"premium\.active":!0,"premium\.expiresAt":a\.toISOString\(\)\}\);',
                            'await supabase.from("profiles").update({"premium": { active: true, expiresAt: a.toISOString() }}).eq("id", e);', script_content)
    
    script_content = re.sub(r'await updateDoc\(doc\(window\._db,"users",e\),\{"premium\.active":!1,"premium\.expiresAt":null\}\);',
                            'await supabase.from("profiles").update({"premium": { active: false, expiresAt: null }}).eq("id", e);', script_content)
    
    # fix globals
    script_content = script_content.replace('window._db=db,window._allUsersCache=allUsersCache,window._allLeadsCache=allLeadsCache,window._auth=auth,window._signOut=signOut,window._deleteDoc=deleteDoc,window._doc=doc,window._fmtDate=fmtDate,window._esc=esc', 'window._allUsersCache=allUsersCache,window._allLeadsCache=allLeadsCache,window._fmtDate=fmtDate,window._esc=esc')
    
    html = html[:script_start] + script_content + html[script_end:]
    
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(html)
