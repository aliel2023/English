/**
 * ================================================
 * Alielenglish — Premium Sifariş
 * Google Apps Script Web App
 * ================================================
 *
 * DEPLOY ADDIMLAR:
 * 1. script.google.com → Yeni Layihə
 * 2. Bu kodu yapışdır
 * 3. SHEET_ID-ni dəyiş (aşağıya bax)
 * 4. Deploy → New Deployment → Web App
 *    Execute as: Me
 *    Who has access: Anyone
 * 5. URL-i kopyala → pricing.js-dəki APPS_SCRIPT_URL-ə yapışdır
 * ================================================
 */

// ─── Konfiqurasiya ───────────────────────────────────────
const SHEET_ID = 'SIZIN_GOOGLE_SHEETS_ID'; // URL-dəki /d/BURASI/edit
const SHEET_NAME = 'Sifarişlər';              // Sheet vərəqinin adı
const NOTIFY_EMAIL = 'englishaliel@gmail.com'; // Bildiriş emaili (siz)

// ─── CORS Headers ────────────────────────────────────────
function setCORSHeaders() {
    return ContentService.createTextOutput()
        .setMimeType(ContentService.MimeType.JSON);
}

// ─── POST Handler (saytdan gələn form məlumatı) ──────────
function doPost(e) {
    try {
        // Məlumatı parse et
        const raw = e.postData ? e.postData.contents : '{}';
        const data = JSON.parse(raw);

        // Honeypot yoxla (bot qoruması)
        if (data._hp) {
            return ContentService
                .createTextOutput(JSON.stringify({ success: false, reason: 'bot' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Validation
        if (!data.name || !data.email || !data.phone) {
            return ContentService
                .createTextOutput(JSON.stringify({ success: false, reason: 'missing_fields' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Sheets-ə yaz
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

        // Başlıq sətri yoxdursa əlavə et
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                'Tarix', 'Ad Soyad', 'Email', 'Telefon',
                'Plan', 'Qiymət', 'Dövr', 'Başlama',
                'Ödəniş Üsulu', 'Status', 'Mənbə'
            ]);
            // Başlıqları formatla
            const headerRange = sheet.getRange(1, 1, 1, 11);
            headerRange.setBackground('#1a1a2e');
            headerRange.setFontColor('#ffffff');
            headerRange.setFontWeight('bold');
        }

        // Məlumatı sətirə yazır
        const now = new Date();
        const formattedDate = Utilities.formatDate(
            now, 'Asia/Baku', 'dd.MM.yyyy HH:mm'
        );

        sheet.appendRow([
            formattedDate,                        // Tarix
            data.name || '',                     // Ad Soyad
            data.email || '',                     // Email
            data.phone || '',                     // Telefon
            data.plan || '',                     // Plan
            data.price || '',                     // Qiymət
            data.period || '',                    // Dövr
            data.start || data.startDate || '',   // Başlama vaxtı
            data.paymentMethod || '',             // Ödəniş üsulu
            '🆕 Yeni',                            // Status (əl ilə yenilənir)
            data.source || ''                     // Mənbə URL
        ]);

        // Yeni sifarişin sətir nömrəsi
        const lastRow = sheet.getLastRow();

        // Status sütununu (10-cu sütun) sarı rənglə işarələ
        sheet.getRange(lastRow, 10).setBackground('#fff3cd');

        // Email bildirişi göndər (opsional)
        try {
            sendNotificationEmail(data, formattedDate);
        } catch (emailErr) {
            // Email uğursuz olsa sifariş yenə qeydə alınır
            console.error('Email error:', emailErr);
        }

        return ContentService
            .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        console.error('Apps Script Error:', err);
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// ─── GET Handler (test üçün) ──────────────────────────────
function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({
            status: 'ok',
            message: 'Alielenglish Order API işləyir',
            time: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
}

// ─── Email Bildirişi ──────────────────────────────────────
function sendNotificationEmail(data, date) {
    const subject = `🆕 Yeni Sifariş: ${data.plan} — ${data.name}`;
    const body = `
Yeni Premium Sifariş Daxil Oldu!

━━━━━━━━━━━━━━━━━━━━━━━━
📋 SİFARİŞ TƏFƏRRÜATI
━━━━━━━━━━━━━━━━━━━━━━━━
📅 Tarix:          ${date}
👤 Ad Soyad:       ${data.name}
📧 Email:          ${data.email}
📱 Telefon:        ${data.phone}
⭐ Plan:           ${data.plan}
💰 Qiymət:        ${data.price} / ${data.period}
📅 Başlama:        ${data.start || 'Qeyd edilməyib'}
💳 Ödəniş üsulu:  ${data.paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━━━

Google Sheets-ə baxın:
https://docs.google.com/spreadsheets/d/${SHEET_ID}

Telegram ilə əlaqə: https://t.me/alifarajovvv
    `;

    GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

/**
 * ================================================
 * DEPLOY ADDIMLAR (ətraflı)
 * ================================================
 *
 * 1. Google Sheets yarat:
 *    - sheets.google.com → Yeni Sheet
 *    - URL-dən ID kopyala: .../spreadsheets/d/[BU_ID]/edit
 *    - Yuxarıdakı SHEET_ID-ə yapışdır
 *
 * 2. Apps Script deploy:
 *    - script.google.com → Yeni Layihə
 *    - Bu kodu yapışdır (SHEET_ID-ni dəyiş)
 *    - Sağ üstdə "Deploy" → "New deployment"
 *    - Type: Web App
 *    - Execute as: Me (mənin hesabım)
 *    - Who has access: Anyone
 *    - "Deploy" düyməsinə bas
 *    - Çıxan URL-i kopyala
 *
 * 3. pricing.js-ə yapışdır:
 *    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/SIZIN_URL/exec';
 *
 * 4. Test:
 *    URL-i brauzerə yazın → {"status":"ok"} görməlisiniz
 *
 * 5. Stripe Payment Links (opsional):
 *    - stripe.com → Payment Links → + New
 *    - Hər plan üçün ayrıca link yarat
 *    - pricing.js-dəki STRIPE_LINKS-ə əlavə edin
 *
 * ================================================
 * STATUS İZAHI (Sheets-də əl ilə dəyişin):
 * 🆕 Yeni      — Sifariş daxil oldu
 * 💬 Əlaqə     — Müştəri ilə əlaqə saxlandı
 * 💳 Ödədi     — Ödəniş alındı
 * ✅ Aktiv      — Premium aktivləşdirildi
 * ❌ Ləğv       — Sifariş ləğv edildi
 * ================================================
 */
