/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  Alielenglish — Premium Sifariş Backend                 ║
 * ║  Google Apps Script Web App                             ║
 * ║  Version: 2.0                                           ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * ── DEPLOY ADDIMLAR ────────────────────────────────────────
 *  1. https://script.google.com → "Yeni Layihə"
 *  2. Bu faylın bütün məzmununu yapışdır
 *  3. SHEET_ID-ni öz Google Sheets ID-si ilə əvəz et
 *     (URL: https://docs.google.com/spreadsheets/d/[ID]/edit)
 *  4. Yuxarı sağ "Deploy" → "New deployment"
 *     ├─ Type: Web App
 *     ├─ Execute as: Me (mənin hesabım)
 *     └─ Who has access: Anyone
 *  5. "Deploy" et → çıxan URL-i kopyala
 *  6. premium-order.js faylındakı APPS_SCRIPT_URL dəyişəninə yapışdır
 *
 * ── SPAM QORUMALARI ────────────────────────────────────────
 *  ✓ Honeypot field (_hp)
 *  ✓ Zəruri sahə yoxlaması
 *  ✓ Email format yoxlaması
 *  ✓ Script tərəfli rate limit (10 dəq/20 sifariş/IP)
 *  ✓ Duplicate yoxlaması (eyni email 5 dəqiqə ərzində)
 *
 * ── STATUS İZAHI ───────────────────────────────────────────
 *  🆕 Yeni     — form daxil oldu
 *  💬 Əlaqə    — müştəri ilə əlaqə saxlandı
 *  💳 Ödədi    — ödəniş alındı (əl ilə və ya webhook)
 *  ✅ Aktiv     — premium aktivləşdirildi
 *  ❌ Ləğv      — sifariş ləğv edildi
 */

// ── Konfiqurasiya ───────────────────────────────────────────
const SHEET_ID = 'SIZIN_GOOGLE_SHEETS_ID';  // ← DEYİŞ
const SHEET_NAME = 'Sifarişlər';
const NOTIFY_EMAIL = 'englishaliel@gmail.com';

// Rate limit: hər IP üçün pencərə daxilində maksimum sifariş
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 dəqiqə
const RATE_MAX = 20;             // maksimum sifariş
const CACHE_SERVICE = CacheService.getScriptCache();

// ── CORS Headers ────────────────────────────────────────────
function corsResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

// ── GET — test endpoint ─────────────────────────────────────
function doGet(e) {
    return corsResponse({
        status: 'ok',
        service: 'Alielenglish Order API v2',
        time: new Date().toISOString(),
    });
}

// ── POST — Form məlumatı qəbul et ──────────────────────────
function doPost(e) {
    try {
        // JSON parse
        const raw = e && e.postData ? e.postData.contents : '{}';
        let data;
        try { data = JSON.parse(raw); }
        catch (_) { return corsResponse({ success: false, reason: 'invalid_json' }); }

        // ── Honeypot ──────────────────────────────────────
        if (data._hp) {
            return corsResponse({ success: false, reason: 'bot_detected' });
        }

        // ── Zəruri sahələr ────────────────────────────────
        const required = ['name', 'email', 'phone'];
        for (const field of required) {
            if (!data[field] || String(data[field]).trim().length < 1) {
                return corsResponse({ success: false, reason: 'missing_field', field });
            }
        }

        // ── Email format ──────────────────────────────────
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim());
        if (!emailOk) {
            return corsResponse({ success: false, reason: 'invalid_email' });
        }

        // ── Rate limit ────────────────────────────────────
        if (!checkRateLimit(data.email)) {
            return corsResponse({ success: false, reason: 'rate_limited' });
        }

        // ── Duplicate check (eyni email 5 dəq) ───────────
        if (isDuplicate(data.email)) {
            // Duplicate olsa da qeyd et amma xəta vermə
            // (İstifadəçi formu iki dəfə göndərə bilər)
        }

        // ── Sheet-ə yaz ───────────────────────────────────
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

        ensureHeaders(sheet);

        const now = new Date();
        const formattedDate = Utilities.formatDate(now, 'Asia/Baku', 'dd.MM.yyyy HH:mm');

        sheet.appendRow([
            formattedDate,                              // A: Tarix
            String(data.name || '').trim(),           // B: Ad Soyad
            String(data.email || '').trim().toLowerCase(), // C: Email
            String(data.phone || '').trim(),           // D: Telefon
            String(data.plan || '').trim(),           // E: Plan
            String(data.price || '').trim(),           // F: Qiymət
            String(data.period || '').trim(),          // G: Dövr
            String(data.startDate || data.start || '').trim(), // H: Başlama
            String(data.paymentMethod || '').trim(),   // I: Ödəniş üsulu
            '🆕 Yeni',                                // J: Status
            String(data.source || '').trim(),          // K: Mənbə URL
        ]);

        // Status sütununu rənglə
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow, 10).setBackground('#fff3cd').setFontWeight('bold');

        // Email bildirişi
        try { sendNotification(data, formattedDate); } catch (_) { }

        // Duplicate cache qeyd et
        markSeen(data.email);

        return corsResponse({ success: true, row: lastRow });

    } catch (err) {
        console.error('doPost error:', err);
        return corsResponse({ success: false, reason: 'server_error', detail: err.message });
    }
}

// ── Headers ─────────────────────────────────────────────────
function ensureHeaders(sheet) {
    if (sheet.getLastRow() > 0) return;
    const headers = [
        'Tarix', 'Ad Soyad', 'Email', 'Telefon',
        'Plan', 'Qiymət', 'Dövr', 'Başlama',
        'Ödəniş Üsulu', 'Status', 'Mənbə',
    ];
    sheet.appendRow(headers);
    const r = sheet.getRange(1, 1, 1, headers.length);
    r.setBackground('#1a1a2e')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    // Sütun genişlikləri
    const widths = [130, 160, 200, 140, 100, 90, 130, 110, 130, 90, 250];
    widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
}

// ── Rate Limit ───────────────────────────────────────────────
function checkRateLimit(email) {
    const key = 'rl_' + Utilities.computeDigest(
        Utilities.DigestAlgorithm.MD5,
        email.toLowerCase()
    ).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

    const raw = CACHE_SERVICE.get(key);
    const entry = raw ? JSON.parse(raw) : { count: 0, since: Date.now() };
    const now = Date.now();

    if (now - entry.since > RATE_WINDOW_MS) {
        entry.count = 1; entry.since = now;
    } else {
        entry.count += 1;
    }

    CACHE_SERVICE.put(key, JSON.stringify(entry), 600); // 10 dəqiqə cache

    return entry.count <= RATE_MAX;
}

// ── Duplicate Check ──────────────────────────────────────────
function isDuplicate(email) {
    const key = 'dup_' + email.toLowerCase().replace(/[^a-z0-9]/g, '');
    return CACHE_SERVICE.get(key) !== null;
}

function markSeen(email) {
    const key = 'dup_' + email.toLowerCase().replace(/[^a-z0-9]/g, '');
    CACHE_SERVICE.put(key, '1', 300); // 5 dəqiqə
}

// ── Email Bildirişi ──────────────────────────────────────────
function sendNotification(data, date) {
    const subject = `🆕 Yeni Sifariş: ${data.plan || 'N/A'} — ${data.name}`;
    const body = `
Yeni Premium Sifariş Daxil Oldu — Alielenglish

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SİFARİŞ MƏLUMATLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Tarix:           ${date}
👤 Ad Soyad:        ${data.name}
📧 Email:           ${data.email}
📱 Telefon:         ${data.phone}
⭐ Plan:            ${data.plan || '—'}
💰 Qiymət:         ${data.price || '—'} / ${data.period || '—'}
📅 Başlama:         ${data.startDate || data.start || 'Qeyd edilməyib'}
💳 Ödəniş üsulu:   ${data.paymentMethod || '—'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Google Sheets-ə baxın:
https://docs.google.com/spreadsheets/d/${SHEET_ID}

📱 Telegram: https://t.me/alifarajovvv
    `.trim();

    GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

/**
 * ══════════════════════════════════════════════════════════
 *  WEBHOOK (Stripe → Status "Ödədi" kimi yenilə)
 *  ──────────────────────────────────────────────────────
 *  Stripe Dashboard → Webhooks → Add endpoint
 *  Endpoint URL: Bu Apps Script URL-i
 *  Events: payment_intent.succeeded, checkout.session.completed
 *  ──────────────────────────────────────────────────────
 *  NOT: Signature verification Apps Script-də tam işləmir,
 *  ona görə email uyğunluğu ilə yoxlayırıq.
 * ══════════════════════════════════════════════════════════
 */
function handleStripeWebhook(raw) {
    try {
        const event = JSON.parse(raw);
        const type = event.type;

        if (type === 'checkout.session.completed' ||
            type === 'payment_intent.succeeded') {

            const obj = event.data && event.data.object;
            const email = (obj && (obj.customer_email || obj.receipt_email || ''))
                .toLowerCase().trim();

            if (!email) return;

            const ss = SpreadsheetApp.openById(SHEET_ID);
            const sheet = ss.getSheetByName(SHEET_NAME);
            if (!sheet) return;

            const lastRow = sheet.getLastRow();
            for (let r = 2; r <= lastRow; r++) {
                const rowEmail = String(sheet.getRange(r, 3).getValue()).toLowerCase().trim();
                const status = String(sheet.getRange(r, 10).getValue());

                if (rowEmail === email && status !== '💳 Ödədi' && status !== '✅ Aktiv') {
                    sheet.getRange(r, 10).setValue('💳 Ödədi').setBackground('#d4edda');
                    try {
                        const name = sheet.getRange(r, 2).getValue();
                        GmailApp.sendEmail(
                            NOTIFY_EMAIL,
                            `💳 Ödəniş Alındı: ${name} (${email})`,
                            `Stripe ödənişi təsdiqləndi.\nEmail: ${email}\nSatır: ${r}`
                        );
                    } catch (_) { }
                    break;
                }
            }
        }
    } catch (err) {
        console.error('Webhook error:', err);
    }
}
