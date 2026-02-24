# 🔐 Firebase Qeydiyyat Sistemi — İmplementasiya Planı

## Hazırki Problem
- Məlumatlar `localStorage`-dədir
- HƏR KƏS F12 → Application → Local Storage açıb görə bilər
- Şifrələr plain-text saxlanılır
- Həqiqi admin sistemi yoxdur

## Hedef Arxitektura
```
[İstifadəçi] → Firebase Auth (email + şifrə hash)
                    ↳ Firestore DB (istifadəçi profili)
                    ↳ Admin Panel (yalnız siz)
```

## Firebase-in verdiyi güvənlik
✅ Şifrələr HEÇ VAXT plain-text saxlanmır (bcrypt hash)
✅ Məlumatlar Google-un serverindədir (bizim fayllarımızda yox)
✅ Security Rules ilə yalnız öz məlumatını görmək mümkündür
✅ Admin SDK ilə siz admin panel qura bilərsiniz

---

## Firebase Setup (Manual Addımlar)

### 1. Firebase Layihəsi
1. https://console.firebase.google.com → Google ilə daxil ol
2. "Add project" → "alielenglish" → Continue
3. Google Analytics → disable (lazım deyil) → Create project

### 2. Authentication Aktiv Et
1. Firebase Console → Authentication → Get started
2. Sign-in method → Email/Password → Enable → Save

### 3. Firestore Database
1. Firebase Console → Firestore Database → Create database
2. "Start in production mode" → Next
3. Region: "europe-west" → Enable

### 4. Security Rules (Əvvəlcə bu qaydaları kopyala)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // İstifadəçilər yalnız öz məlumatlarını görə bilər
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Admin yalnız admin@alielenglish.az hesabı ilə
    match /users/{userId} {
      allow read: if request.auth.token.email == "admin@alielenglish.az";
    }
    // Leads (newsletter) - yalnız admin görür
    match /leads/{leadId} {
      allow create: if true; // Hər kəs əlavə edə bilər
      allow read: if request.auth.token.email == "admin@alielenglish.az";
    }
  }
}
```

### 5. Web App Config Al
1. Firebase Console → Project Overview → Web (</>)
2. App nickname: "Alielenglish Web"
3. Register app → CONFIG kopyala

---

## Kod Dəyişiklikləri

### auth.js → Firebase SDK ilə tam yenidən yazılacaq
- `firebase.auth().createUserWithEmailAndPassword()` → Qeydiyyat
- `firebase.auth().signInWithEmailAndPassword()` → Giriş  
- `firebase.firestore().collection('users')` → Profil saxlama
- `firebase.auth().onAuthStateChanged()` → Session izləmə

### Admin Panel
- `/dashboard.html` admin üçün əlavə bölmə
- Bütün istifadəçiləri görə bilərsiniz
- Ayrı admin email: `admin@alielenglish.az`

---

## İstifadəçi Məlumatları Firestore-da Belə Görünəcək

```
users/
  ├── uid_abc123/
  │   ├── name: "Əli Əliyev"
  │   ├── email: "ali@gmail.com"  ← Şifrə GÖRÜNMÜR
  │   ├── level: "B1"
  │   ├── streak: 5
  │   ├── favorites: [...]
  │   └── createdAt: timestamp
  └── uid_xyz456/
      └── ...

leads/
  ├── lead_001/
  │   ├── name: "Nigar"
  │   ├── email: "nigar@gmail.com"
  │   └── date: timestamp
  └── ...
```

---

## Admin Panel-də Nə Görəcəksiniz

Firebase Console → Firestore Database:
- Bütün qeydiyyatlı istifadəçilər
- Hər istifadəçinin level, streak, favorites
- Newsletter abunəçiləri

Firebase Console → Authentication:
- Bütün email/şifrə ilə qeydiyyatlı hesablar
- Son giriş tarixi
- İstifadəçini silmək/bloklamaq

---

## Firebase Config Aldıqdan Sonra

Mənə bu kodu bildirin:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Və mən dərhal auth.js faylını Firebase ilə tam inteqrasiya edəcəyəm!
