const SHEET_NAME = 'Orders';

function doPost(e) {
    try {
        // 1. Məlumatları oxumaq
        const data = JSON.parse(e.postData.contents);

        // 2. Honeypot check (Spam qoruması - Botları bloklamaq üçün)
        // Əgər _hp sahəsi doludursa, bu botdur. 
        if (data._hp) {
            return createJsonResponse({ status: 'success', note: 'bot_ignored' });
        }

        // 3. Basic Validation sahələrin yoxlanması
        if (!data.name || !data.email || !data.phone) {
            return createJsonResponse({ status: 'error', message: 'Məlumatlar əskikdir' });
        }

        // 4. Google Sheet-i tapmaq və ya yaratmaq
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

        // İlk dəfədirsə başlıqları yaz
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                'Tarix',
                'Ad Soyad',
                'Email',
                'Telefon',
                'Paket',
                'Məbləğ/Müddət',
                'Ödəniş Üsulu',
                'Başlama Vaxtı',
                'Status',
                'Mənbə (URL)'
            ]);
            // Başlıqların formatlanması (qalın şrift)
            sheet.getRange(1, 1, 1, 10).setFontWeight("bold");
        }

        // 5. Yeni sifarişi əlavə et
        sheet.appendRow([
            data.timestamp || new Date().toLocaleString(),
            data.name,
            data.email,
            data.phone,
            data.plan,
            data.price + " / " + data.period,
            data.paymentMethod,
            data.startDate,
            'Yeni', // Status avtomatik "Yeni" olaraq düşür
            data.source
        ]);

        return createJsonResponse({ status: 'success' });

    } catch (error) {
        return createJsonResponse({ status: 'error', message: error.toString() });
    }
}

// OPTIONS requesti üçün (Əgər CORS tələb edilərsə)
function doOptions(e) {
    return createJsonResponse({ status: 'ok' });
}

// Köməkçi funksiya: JSON formatında cavab qaytarır
function createJsonResponse(responseObject) {
    return ContentService.createTextOutput(JSON.stringify(responseObject))
        .setMimeType(ContentService.MimeType.JSON);
}
