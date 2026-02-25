# 🚀 Premium Satış Sistemi — Tam Deploy Bələdçisi

## Arxitektura Sxemi

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALIELENGLISH — PREMIUM SİSTEM                │
│                    GitHub Pages (Statik Sayt)                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌───────────────────┐      ┌──────────────┐
│ pricing.html │──────▶│premium-order.html │─────▶│Google Apps   │
│              │ ?plan=│                   │ POST │Script Web App│
│ Plan seçimi  │ ...   │ Step 1: Form      │──────▶              │
│              │       │ Step 2: Ödəniş    │      └──────┬───────┘
└──────────────┘       └───────────────────┘             │
                                │                         ▼
                                │               ┌──────────────────┐
                                │               │  Google Sheets   │
                                │               │  (Sifarişlər)    │
                                │               └──────────────────┘
                                │
                                ▼ (Stripe linki varsa)
                       ┌────────────────────┐
                       │ Stripe Payment Link│   ← Kart məlumatı
                       │ (Stripe serveri)   │     BURADAN KEÇIR
                       └────────────┬───────┘     (sayta gəlmir!)
                                    │
                                    ▼ (opsional webhook)
                       ┌────────────────────┐
                       │ Apps Script Webhook│
                       │ Status → "Ödədi"  │
                       └────────────────────┘
```

---

## Addım 1 — Google Sheets Yarat

1. [sheets.google.com](https://sheets.google.com) → "+" düyməsi → yeni sheet
2. Sheet adını **Sifarişlər** kimi qoy (istəsən istənilən ad olar)
3. URL-dən ID kopyala:
   ```
   https://docs.google.com/spreadsheets/d/[BU_ID_SƏNIN_ID]/edit
   ```
4. Bu ID-ni `google-apps-script.js` faylındakı `SHEET_ID` dəyişəninə yapışdır

---

## Addım 2 — Apps Script Deploy Et

1. [script.google.com](https://script.google.com) → **"Yeni Layihə"**

2. `google-apps-script.js` faylının bütün məzmununu kopyala → Apps Script redaktoruna yapışdır

3. `SHEET_ID` dəyişənini öz ID-nə dəyiş:
   ```javascript
   const SHEET_ID = 'sənin_id_buraya';
   ```

4. Yuxarı sağ **"Deploy"** → **"New deployment"**:
   | Sahə | Dəyər |
   |------|-------|
   | Type | **Web App** |
   | Execute as | **Me** (sənin hesabın) |
   | Who has access | **Anyone** |

5. **"Deploy"** et → **icazə istəsə ver** → URL kopyala

6. `scripts/premium-order.js` faylında bu URL-i yapışdır:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/SIZIN_URL/exec';
   ```

7. **Test et**: URL-i brauzerə yaz → `{"status":"ok","service":"Alielenglish Order API v2"}` görməlisən

---

## Addım 3 — Stripe Payment Links Qur

### Stripe hesabı yaratmaq (pulsuz)
1. [stripe.com](https://stripe.com) → **"Start now"** → qeydiyyat
2. Dashboard-a gir

### Payment Link yarat (hər paket üçün ayrıca)
1. Sol menyu → **"Payment Links"** → **"+ New"**
2. **"+ Add a product"** → "Create product":
   | Sahə | Premium Aylıq | Premium İllik | Professional Aylıq | Professional İllik |
   |------|--------------|--------------|-------------------|-------------------|
   | Name | Premium Aylıq | Premium İllik | Professional Aylıq | Professional İllik |
   | Price | 25 AZN | 240 AZN | 45 AZN | 432 AZN |
   | Billing | One time | One time | One time | One time |
3. **"Create link"** → linki kopyala

### Linkləri faylına yapışdır
`scripts/premium-order.js` faylında:
```javascript
const STRIPE_LINKS = {
    premium_monthly:      'https://buy.stripe.com/xxxxx1',
    premium_yearly:       'https://buy.stripe.com/xxxxx2',
    professional_monthly: 'https://buy.stripe.com/xxxxx3',
    professional_yearly:  'https://buy.stripe.com/xxxxx4',
};
```

---

## Addım 4 — GitHub Pages Deploy

```bash
git add .
git commit -m "Premium satış sistemi əlavə edildi"
git push origin main
```

GitHub → Settings → Pages → "Deploy from branch: main" → Save

---

## Addım 5 — Stripe Webhook (Opsional — Avtomatik Status)

Ödəniş tamamlandıqda statusu "Ödədi" kimi avtomatik yeniləmək üçün:

1. Stripe Dashboard → **Developers** → **Webhooks** → **"Add endpoint"**
2. **Endpoint URL**: sənin Apps Script URL-in (eyni URL)
3. **Events to listen**: `checkout.session.completed`, `payment_intent.succeeded`
4. **"Add endpoint"** → test et

---

## Addım 6 — Zapier Alternativ (Stripe webhook olmadıqda)

Pulsuz Zapier planı ilə Stripe → Google Sheets:
1. [zapier.com](https://zapier.com) → **"Create Zap"**
2. Trigger: **Stripe** → "Payment Succeeded"
3. Action: **Google Sheets** → "Update Spreadsheet Row" (email ilə eşlə)
4. Field mapping: Stripe email → Sheets Email sütunu; Status → "💳 Ödədi"

---

## Test Planı

### Lokal Test (deploy etmədən)
```
pricing.html açın → Plan seçin → premium-order.html açılır
premium-order.html?plan=premium_monthly açın
Form doldurun (test məlumatlar):
  Ad: Test İstifadəçi
  Telefon: +994501234567
  Email: test@test.com
```

**Gözlənilən nəticə:**
- `_hp` (honeypot) sahəsi görünməmlidir
- 3 sifarişdən çox göndərməyə çalışsanız rate limit işləyir
- Yanlış email → `fEmailErr` görünür
- Uğurlu submit → Step 2 görünür (Stripe linki göstərilir)

### Apps Script Test
```
GET https://script.google.com/.../exec → {"status":"ok"} ✓
```

### Stripe Test Ödənişi
Stripe Dashboard → Payment Links → linki aç → Kart: `4242 4242 4242 4242`, exp: istənilən, cvv: istənilən

---

## Təhlükəsizlik Xülasəsi

| Risq | Müdafiə |
|------|---------|
| Bot spam | Honeypot field (`_hp`) |
| Tez-tez göndərmə | Client rate limit (3/dəq) + Server rate limit (20/10dəq) |
| Kart oğurluğu | Kart məlumatı saytdan keçmir → Stripe-in öz serveri |
| XSS | textContent (innerHTML yox) istifadə |
| Duplicate sifariş | 5 dəq cache (Apps Script) |
| PCI uyğunluq | Stripe PCI DSS Level 1 |

---

## Faylların Siyahısı

```
alielenglish/
├── premium-order.html          ← Yeni sifariş səhifəsi
├── pricing.html                ← Yeniləndi (goToOrder funksiyası)
├── google-apps-script.js       ← Backend kodu (script.google.com-a yapışdır)
├── styles/
│   └── premium-order.css       ← Yeni CSS
└── scripts/
    ├── premium-order.js        ← Yeni JS (APPS_SCRIPT_URL + STRIPE_LINKS doldur)
    └── pricing.js              ← Yeniləndi (goToOrder əlavə edildi)
```

---

## URL Struktur

```
pricing.html
  → "Seç" düyməsi
  → premium-order.html?plan=premium_monthly&billing=monthly
  → premium-order.html?plan=premium_yearly&billing=yearly
  → premium-order.html?plan=professional_monthly&billing=monthly
  → premium-order.html?plan=professional_yearly&billing=yearly
```
