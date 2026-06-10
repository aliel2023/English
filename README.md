# 🎓 Alielenglish — İngilis Dili Öyrənmə Platforması

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-aliel2023.github.io-blue?style=for-the-badge)](https://aliel2023.github.io/English/)
[![GitHub](https://img.shields.io/badge/GitHub-aliel2023%2FEnglish-181717?style=for-the-badge&logo=github)](https://github.com/aliel2023/English)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/aliel2023/English/actions)

**Azərbaycan dilində İngilis dili öyrənmək üçün tam funksional, AI-dəstəkli platforma.**

[Canlı Demo →](https://aliel2023.github.io/English/) · [Əlaqə →](mailto:englishaliel@gmail.com)

</div>

---

## 📋 İcmal / Overview

Alielenglish — A1-dən C2-yə qədər bütün səviyyələri əhatə edən, süni intellektlə zənginləşdirilmiş İngilis dili öyrənmə platformasıdır. Platforma Azərbaycan dilində interfeyslə təqdim olunur və Supabase backend ilə işləyir.

### ✨ Əsas Xüsusiyyətlər

| Xüsusiyyət | Təsvir |
|---|---|
| 🧠 **AI Müəllim** | Gemini API ilə interaktiv dərs & məşq |
| 📝 **Multi-Level Testlər** | A1-dən C2-yə qədər səviyyə testləri |
| 📆 **Gündəlik Söz** | Hər gün yeni söz öyrən |
| 🎙️ **Speaking Practice** | Danışıq məşqi modulu |
| ⭐ **Favoritlər** | Sözləri, qrammatikanı, ifadələri saxla |
| 🔥 **Streak Tracking** | Ardıcıl gün izləmə sistemi |
| 🏅 **Badges** | Nailiyyət nişanları (🌱 Başlanğıc, ⚡ Streak Master, ...) |
| 👑 **Premium Üzvlük** | Genişləndirilmiş xüsusiyyətlər |
| 📊 **Dashboard** | Şəxsi statistika & tərəqqi |
| 🛡️ **Admin Panel** | İstifadəçi idarəetmə paneli |
| 🌐 **i18n** | Çoxdilli dəstək hazırlığı |
| 📱 **Responsive** | Mobil-uyğun, dark theme dizayn |

---

## 🛠️ Texnoloji Stek / Tech Stack

| Kateqoriya | Texnologiya |
|---|---|
| **Frontend** | Vanilla HTML / CSS / JavaScript |
| **Backend** | [Supabase](https://supabase.com/) (project: `wuzwvqgmrcqsiegbtrzs`) |
| **Auth** | Supabase Auth — Email/Password + Google OAuth |
| **Database** | Supabase PostgreSQL + Row Level Security (RLS) |
| **AI** | Google Gemini API |
| **Hosting** | GitHub Pages |
| **CI/CD** | GitHub Actions (auto-deploy on push to `main`) |
| **PWA** | Service Worker (`sw.js`) |

---

## 📁 Layihə Strukturu / Project Structure

```
alielenglish/
├── index.html                  # Ana səhifə (Landing page)
├── login.html                  # Giriş səhifəsi
├── register.html               # Qeydiyyat səhifəsi
├── dashboard.html              # İstifadəçi paneli
├── profile.html                # Profil səhifəsi
├── test.html                   # Səviyyə testləri
├── daily-word.html             # Gündəlik söz
├── speaking.html               # Danışıq məşqi
├── favorites.html              # Favoritlər
├── learning-path.html          # Öyrənmə yolu
├── admin.html                  # Admin paneli
├── contact.html                # Əlaqə formu
├── pricing.html                # Qiymətlər
├── premium-order.html          # Premium sifariş
├── resources.html              # Resurslar
├── privacy.html                # Gizlilik siyasəti
│
├── js/
│   └── config.js               # Supabase init + Gemini API key
│
├── scripts/
│   ├── auth.js                 # Auth sistemi (login, register, session)
│   ├── main.js                 # Global utilities & navigation
│   ├── motion.js               # 3D tilt & hover animasiyaları
│   ├── ai-teacher.js           # AI müəllim modulu
│   ├── ai-practice.js          # AI məşq modulu
│   ├── ai-system.js            # AI sistem konfiqurasiyası
│   ├── dashboard.js            # Dashboard logikası
│   ├── daily-word.js           # Gündəlik söz logikası
│   ├── speaking.js             # Danışıq məşqi
│   ├── favorites.js            # Favoritlər sistemi
│   ├── learning-path.js        # Öyrənmə yolu logikası
│   ├── test.js                 # Test sistemi
│   ├── contact.js              # Əlaqə formu
│   ├── pricing.js              # Qiymət səhifəsi
│   ├── premium-order.js        # Premium sifariş
│   ├── resources.js            # Resurslar
│   ├── home.js                 # Ana səhifə skriptləri
│   ├── design-system.js        # Dizayn sistemi
│   ├── global-nav.js           # Qlobal naviqasiya
│   ├── scroll-to-top.js        # Scroll-to-top düyməsi
│   ├── testimonials.js         # Rəylər bölməsi
│   ├── i18n.js                 # Beynəlmiləlləşdirmə
│   └── lang.js                 # Dil seçimi
│
├── styles/                     # 22 CSS faylı
│   ├── main.css                # Əsas stillər
│   ├── design-system.css       # Dizayn tokenləri
│   ├── responsive.css          # Responsive breakpoints
│   ├── auth.css                # Auth səhifə stilləri
│   ├── dashboard.css           # Dashboard stilləri
│   ├── dashboard-animations.css
│   ├── page-transitions.css    # Səhifə keçid animasiyaları
│   ├── ui-upgrades.css         # UI yenilikləri
│   └── ...                     # Hər səhifə üçün ayrıca CSS
│
├── supabase/
│   ├── schema.sql              # Database schema (bütün cədvəllər + RLS)
│   └── functions/              # Supabase Edge Functions
│
├── assets/                     # Şəkillər, ikonlar, media
├── i18n/                       # Dil faylları
├── _headers                    # Security headers (CSP, HSTS, ...)
├── sw.js                       # Service Worker (PWA cache)
├── robots.txt                  # Search engine directives
├── sitemap.xml                 # Sayt xəritəsi
│
└── .github/
    └── workflows/
        └── static.yml          # GitHub Pages auto-deploy
```

---

## 🗄️ Database Schema

Supabase PostgreSQL-də 4 əsas cədvəl, hamısı RLS ilə qorunur:

| Cədvəl | Təsvir | RLS |
|---|---|---|
| `users` | İstifadəçi profilləri, streak, badges, favorites, premium status | ✅ |
| `leads` | Email toplama / qeydiyyat izləmə | ✅ |
| `ai_usage` | Gündəlik AI sorğu limiti izləmə | ✅ |
| `reports` | İstifadəçi rəy & şikayətləri | ✅ |

### Users Cədvəli — Əsas Sahələr

```
uid, name, email, level (A1-C2), role (user/admin),
premium_active, premium_expires_at,
current_streak, longest_streak, last_active_date, active_days,
words_learned, tests_completed,
badges (JSONB), favorites (JSONB), weekly_activity (JSONB),
test_history (JSONB), privacy (JSONB),
daily_query_count, last_reset_date,
created_at, updated_at
```

> Tam schema: [`supabase/schema.sql`](supabase/schema.sql)

---

## 🔐 Təhlükəsizlik / Security

| Qat | Tədbirlər |
|---|---|
| **Auth** | Supabase Auth, brute-force qorunma, şifrə güc göstəricisi |
| **Database** | Row Level Security (RLS) — hər cədvəldə aktiv |
| **Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| **Frontend** | Input sanitization, XSS qorunma |
| **API** | Supabase anon key (public), server-side RLS ilə qorunur |
| **Permissions** | Admin/User role ayrılığı, role dəyişmə qorunması |

---

## 🚀 Quraşdırma / Setup

### 1. Reponu klonlayın

```bash
git clone https://github.com/aliel2023/English.git
cd English
```

### 2. Supabase konfiqurasiyası

1. [Supabase](https://supabase.com/) layihəsi yaradın
2. `supabase/schema.sql` faylını SQL Editor-da işlədin
3. `js/config.js` faylında URL və KEY-i yeniləyin:

```javascript
var SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
var SUPABASE_KEY = 'your-anon-key';
```

### 3. Google OAuth (istəyə bağlı)

1. Supabase Dashboard → Authentication → Providers → Google
2. Google Cloud Console-da OAuth credentials yaradın
3. Redirect URL-i əlavə edin

### 4. Gemini API

`js/config.js` faylında Gemini API key-i konfiqurasiya edin:

```javascript
window.GEMINI_API_KEY = 'your-gemini-api-key';
```

### 5. Lokal işə salma

Hər hansı statik server ilə işə salın:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Live Server extension istifadə edin
```

---

## 🌐 Deploy / Yerləşdirmə

Layihə GitHub Pages-ə avtomatik yerləşdirilir:

1. `main` branch-a push edin
2. GitHub Actions (`.github/workflows/static.yml`) avtomatik deploy edir
3. Sayt burada yayımlanır: **https://aliel2023.github.io/English/**

```yaml
# .github/workflows/static.yml
on:
  push:
    branches: ["main"]
```

---

## 📄 Səhifələr / Pages

| Səhifə | Fayl | Təsvir |
|---|---|---|
| 🏠 Ana Səhifə | `index.html` | Landing page, xüsusiyyətlər, qiymətlər |
| 🔑 Giriş | `login.html` | Email/password + Google OAuth login |
| 📝 Qeydiyyat | `register.html` | Yeni hesab yaratma |
| 📊 Dashboard | `dashboard.html` | Şəxsi statistika paneli |
| 👤 Profil | `profile.html` | Profil idarəetmə |
| 📝 Test | `test.html` | A1-C2 səviyyə testləri |
| 📆 Gündəlik Söz | `daily-word.html` | Hər gün yeni söz |
| 🎙️ Danışıq | `speaking.html` | Speaking practice |
| ⭐ Favoritlər | `favorites.html` | Saxlanılmış məzmun |
| 📚 Öyrənmə Yolu | `learning-path.html` | Strukturlaşdırılmış kurs |
| 🛡️ Admin | `admin.html` | Admin idarəetmə paneli |
| 📧 Əlaqə | `contact.html` | Əlaqə formu |
| 💰 Qiymətlər | `pricing.html` | Paket qiymətləri |
| 👑 Premium | `premium-order.html` | Premium sifariş |
| 📖 Resurslar | `resources.html` | Öyrənmə resursları |
| 🔒 Gizlilik | `privacy.html` | Gizlilik siyasəti |

---

## 🎨 Dizayn / Design

- **Tema:** Dark theme, müasir gradient-lər
- **Layout:** Mobile-first, responsive dizayn
- **Animasiyalar:** 3D tilt effekti (`scripts/motion.js`), hover lift effektləri
- **Kartlar:** `.pricing-card`, `.resource-card`, `.level-card`, `.feature-card` — hamısı hover lift ilə
- **Dil:** Azərbaycan dilində interfeys
- **CSS Arxitekturası:** 22 modul CSS faylı (`styles/` qovluğu)

---

## 📧 Əlaqə / Contact

- **Email:** englishaliel@gmail.com
- **Platform:** [https://aliel2023.github.io/English/](https://aliel2023.github.io/English/)
- **GitHub:** [https://github.com/aliel2023/English](https://github.com/aliel2023/English)

---

## 📜 Lisenziya / License

Bu layihə müəllif hüququ ilə qorunur. Bütün hüquqlar qorunur.

© 2024-2025 Alielenglish. All rights reserved.