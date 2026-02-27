/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  Premium Order JS — Alielenglish                        ║
 * ║  GitHub Pages (tamamilə statik, server yoxdur)          ║
 * ║                                                          ║
 * ║  Axın:                                                   ║
 * ║  1. URL parametrlərindən planı oxu                       ║
 * ║  2. Form submit → Google Apps Script Web App → GSheets   ║
 * ║  3. Ödəniş üsuluna görə → Stripe Link və ya Telegram    ║
 * ╚══════════════════════════════════════════════════════════╝
 */

'use strict';

// ══════════════════════════════════════════════════════════
//  ⚙️  KONFİQURASİYA — Buraya öz URL/linklərini yapışdır
// ══════════════════════════════════════════════════════════

/**
 * Google Apps Script deploy etdikdən sonra:
 * script.google.com → Layihə → Deploy → New Deployment
 * → Web App → Execute as: Me, Access: Anyone → URL kopyala
 */
const APPS_SCRIPT_URL = '';
// Nümunə: 'https://script.google.com/macros/s/AKfycbxXXXXXXXXX/exec'

/**
 * Stripe Payment Links:
 * stripe.com → Dashboard → Payment Links → + Create
 * Hər paket üçün ayrıca link yarat.
 * Metadata olaraq istifadəçi adını əlavə edə bilərsiniz.
 */
const STRIPE_LINKS = {
    free_monthly: '',  // Pulsuz plan ödəniş tələb etmir
    premium_monthly: '',  // 'https://buy.stripe.com/...'
    premium_yearly: '',  // 'https://buy.stripe.com/...'
    professional_monthly: '',  // 'https://buy.stripe.com/...'
    professional_yearly: '',  // 'https://buy.stripe.com/...'
};

/** Rate limit konfiqurasiyası */
const RL_MAX = 3;      // eyni sessiyada maksimum sifariş
const RL_WINDOW = 60000;  // ms (1 dəqiqə)

// ══════════════════════════════════════════════════════════
//  📦  PLAN VERİLƏRİ
// ══════════════════════════════════════════════════════════
const PLANS = {
    free: {
        icon: '🎁',
        name: 'Pulsuz',
        monthly: { price: '0 AZN', label: 'Həmişəlik pulsuz' },
        yearly: { price: '0 AZN', label: 'Həmişəlik pulsuz' },
        features: ['Günün sözü', '10 pulsuz PDF', 'Səviyyə testi', 'Əsas qrammatika'],
        featured: false,
    },
    premium: {
        icon: '⭐',
        name: 'Premium',
        monthly: { price: '25 AZN', label: 'aylıq' },
        yearly: { price: '240 AZN', label: 'illik (20 AZN/ay)' },
        features: [
            'Bütün pulsuz xüsusiyyətlər',
            '500+ premium PDF',
            '100+ video dərs',
            'Flashcard sistemi',
            'Audio tələffüz',
            'Prioritet dəstək',
        ],
        featured: true,
    },
    professional: {
        icon: '👑',
        name: 'Professional',
        monthly: { price: '168 AZN', label: 'aylıq' },
        yearly: { price: '1140 AZN', label: 'illik (95 AZN/ay)' },
        features: [
            'Bütün Premium xüsusiyyətlər',
            '1000+ premium material',
            'Limitsiz video dərs',
            '1-on-1 mentor dəstəyi',
            'Fərdi öyrənmə yolu',
            'IELTS hazırlıq',
        ],
        featured: false,
    },
};

// ══════════════════════════════════════════════════════════
//  🔒  RATE LIMITER
// ══════════════════════════════════════════════════════════
const _rl = { count: 0, resetAt: 0 };

function checkRL() {
    const now = Date.now();
    if (now > _rl.resetAt) { _rl.count = 0; _rl.resetAt = now + RL_WINDOW; }
    _rl.count++;
    return _rl.count <= RL_MAX;
}

// ══════════════════════════════════════════════════════════
//  🔨  DOM HELPERS
// ══════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

function showErr(elId, msg) {
    const el = $(elId);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
}

function clearErrs() {
    ['fNameErr', 'fPhoneErr', 'fEmailErr', 'globalErr'].forEach(id => showErr(id, ''));
    ['fName', 'fPhone', 'fEmail'].forEach(id => {
        const el = $(id);
        if (el) el.classList.remove('error');
    });
    if ($('globalErr')) $('globalErr').classList.add('hidden');
}

function setLoading(on) {
    const btn = $('submitBtn');
    const txt = $('btnText');
    const spin = $('btnSpinner');
    if (btn) btn.disabled = on;
    if (txt) txt.style.display = on ? 'none' : 'flex';
    if (spin) spin.classList.toggle('hidden', !on);
}

function showGlobalErr(msg) {
    const el = $('globalErr');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    el.style.display = 'flex';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ══════════════════════════════════════════════════════════
//  📋  PLAN SEÇIMI — URL → və ya manual
// ══════════════════════════════════════════════════════════
let _selectedPlanKey = 'premium_monthly';    // default

function getPlanFromURL() {
    const p = new URLSearchParams(location.search);
    return {
        planKey: p.get('plan') || 'premium_monthly',
        billing: p.get('billing') || 'monthly',
    };
}

function parsePlanKey(key) {
    // key format: 'premium_monthly', 'professional_yearly' etc.
    const parts = key.split('_');
    const billing = parts[parts.length - 1]; // monthly | yearly
    const planId = parts.slice(0, parts.length - 1).join('_'); // premium | professional | free
    return { planId, billing };
}

function selectPlan(planKey) {
    _selectedPlanKey = planKey;

    // UI güncelle
    document.querySelectorAll('.po-plan-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.key === planKey);
    });

    // Hidden inputs
    const { planId, billing } = parsePlanKey(planKey);
    const plan = PLANS[planId];
    if (!plan) return;
    const priceData = plan[billing] || plan.monthly;

    $('hPlan').value = plan.name;
    $('hPrice').value = priceData.price;
    $('hPeriod').value = priceData.label;
    $('hPlanKey').value = planKey;

    updateRightSummary(planId, billing, plan, priceData);
}

function updateRightSummary(planId, billing, plan, priceData) {
    if ($('summaryIcon')) $('summaryIcon').textContent = plan.icon;
    if ($('summaryPlanName')) $('summaryPlanName').textContent = plan.name;
    if ($('summaryPeriod')) $('summaryPeriod').textContent =
        billing === 'yearly' ? 'İllik ödəniş' : 'Aylıq ödəniş';
    if ($('summaryPrice')) $('summaryPrice').textContent = priceData.price;
    if ($('summaryTotal')) $('summaryTotal').textContent = priceData.price;

    const feat = $('summaryFeatures');
    if (feat) {
        feat.innerHTML = plan.features.slice(0, 4).map(f =>
            `<div class="po-summary-feature">${f}</div>`
        ).join('');
    }
}

function buildPlanGrid() {
    const grid = $('planGrid');
    if (!grid) return;
    grid.innerHTML = '';

    ['free', 'premium', 'professional'].forEach(planId => {
        const plan = PLANS[planId];
        // Determine billing from current selection
        const { billing } = parsePlanKey(_selectedPlanKey);
        const key = `${planId}_${billing}`;
        const priceData = plan[billing] || plan.monthly;
        const isSelected = key === _selectedPlanKey;

        const el = document.createElement('div');
        el.className = 'po-plan-option' +
            (isSelected ? ' selected' : '') +
            (plan.featured ? ' featured-plan' : '');
        el.dataset.key = key;
        el.setAttribute('role', 'radio');
        el.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        el.setAttribute('tabindex', '0');

        el.innerHTML = `
            <div class="po-plan-check">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="po-plan-option-icon">${plan.icon}</div>
            <div class="po-plan-option-name">${plan.name}</div>
            <div class="po-plan-option-price">${priceData.price}</div>
            <div class="po-plan-option-period">${priceData.label}</div>`;

        el.addEventListener('click', () => {
            selectPlan(key);
            document.querySelectorAll('.po-plan-option').forEach(o =>
                o.setAttribute('aria-checked', o.dataset.key === key ? 'true' : 'false'));
        });

        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
        });

        grid.appendChild(el);
    });
}

// ══════════════════════════════════════════════════════════
//  📤  FORM SUBMIT → Google Sheets
// ══════════════════════════════════════════════════════════
async function sendToGSheets(data) {
    if (!APPS_SCRIPT_URL) return; // Konfiqurasiya edilməyib, keç

    try {
        // no-cors: callback cavab oxunmur amma request çatır
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (_) {
        // Şəbəkə xətası — sifariş yenə göstərilir
        console.warn('[AlielEnglish] GSheets göndərə bilmədim, davam edir...');
    }
}

// ══════════════════════════════════════════════════════════
//  ✅  VALIDATION
// ══════════════════════════════════════════════════════════
function validateForm() {
    clearErrs();
    let valid = true;

    const name = $('fName')?.value.trim() || '';
    const phone = $('fPhone')?.value.trim() || '';
    const email = $('fEmail')?.value.trim() || '';

    if (name.length < 2) {
        showErr('fNameErr', 'Ad ən azı 2 simvol olmalıdır.');
        $('fName')?.classList.add('error');
        valid = false;
    }

    if (phone.length < 9) {
        showErr('fPhoneErr', 'Düzgün telefon nömrəsi daxil edin.');
        $('fPhone')?.classList.add('error');
        valid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showErr('fEmailErr', 'Email formatı yanlışdır.');
        $('fEmail')?.classList.add('error');
        valid = false;
    }

    return valid;
}

// ══════════════════════════════════════════════════════════
//  💳  ÖDƏNIŞ MƏRHƏLƏSİ (Step 2)
// ══════════════════════════════════════════════════════════
function showPaymentStep(orderData) {
    // Steps UI güncəllə
    $('step1Indicator')?.classList.remove('active');
    $('step2Indicator')?.classList.add('active', 'done');
    document.querySelector('.po-step-line')?.classList.add('filled');

    // Cards
    $('stepFormCard')?.classList.add('hidden');
    const payCard = $('stepPayCard');
    if (payCard) payCard.classList.remove('hidden');

    // Stripe linki var mı?
    const stripeLink = STRIPE_LINKS[orderData.planKey];
    const telMsg = encodeURIComponent(
        `Salam! ${orderData.plan} plan (${orderData.price}/${orderData.period}) almaq istəyirəm.\n` +
        `Ad: ${orderData.name}\nEmail: ${orderData.email}\nTelefon: ${orderData.phone}`
    );
    const telLink = `https://t.me/alifarajovvv?text=${telMsg}`;

    const div = $('paymentOptionsDiv');
    if (!div) return;

    if (stripeLink) {
        $('successSub').textContent = 'Aşağıdakı düyməyə basaraq təhlükəsiz ödəniş edin:';
        div.innerHTML = `
            <a href="${stripeLink}?prefilled_email=${encodeURIComponent(orderData.email)}"
               target="_blank" rel="noopener" class="po-pay-stripe" id="stripePayBtn">
                <svg width="20" height="20" viewBox="0 0 60 25" fill="none">
                    <text x="0" y="18" font-family="Arial" font-weight="bold" font-size="17" fill="white">stripe</text>
                </svg>
                Stripe ilə Ödə — ${orderData.price}
            </a>
            <p class="po-stripe-secure-note">
                🔒 Ödəniş Stripe-in şifrəli səhifəsinde işlənir.
                Kart məlumatınız heç vaxt bizim sayta gəlmir.
            </p>`;
    } else if (orderData.paymentMethod === 'Telegram (Manual)') {
        $('successSub').textContent = 'Ödəniş üçün bizimlə Telegram-dan əlaqə saxlayın:';
        div.innerHTML = `
            <a href="${telLink}" target="_blank" rel="noopener" class="po-pay-telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
                </svg>
                Telegram ilə Əlaqə Saxla
            </a>
            <p class="po-pay-info">
                💡 <strong>${orderData.plan} — ${orderData.price}</strong> mesajı artıq hazırdır.
                Telegram açılacaq, göndər düyməsinə bas.<br>
                24 saat ərzində cavab veriləcəkdir.
            </p>`;
    } else {
        // Heç bir konfigurasiya yoxdur — fallback
        $('successSub').textContent = 'Sifarişiniz alındı. Sizinlə əlaqə saxlayacağıq:';
        div.innerHTML = `
            <a href="${telLink}" target="_blank" rel="noopener" class="po-pay-telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
                </svg>
                Telegram ilə Ödə
            </a>`;
    }

    // Qəbz
    const receipt = $('orderReceipt');
    if (receipt) {
        const sanitize = (str) => String(str || '').replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));

        receipt.innerHTML = [
            ['Plan', orderData.plan],
            ['Qiymət', `${orderData.price} / ${orderData.period}`],
            ['Ad Soyad', orderData.name],
            ['Email', orderData.email],
            ['Telefon', orderData.phone],
            ['Başlama', orderData.startDate],
            ['Ödəniş üsulu', orderData.paymentMethod],
        ].map(([k, v]) =>
            `<div class="po-receipt-row">
                <span>${k}</span><span>${sanitize(v) || '—'}</span>
            </div>`
        ).join('');
    }

    // Scroll to top
    payCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ══════════════════════════════════════════════════════════
//  ↩  BACK
// ══════════════════════════════════════════════════════════
function goBackToForm() {
    $('stepFormCard')?.classList.remove('hidden');
    $('stepPayCard')?.classList.add('hidden');
    $('step1Indicator')?.classList.add('active');
    $('step2Indicator')?.classList.remove('active', 'done');
    document.querySelector('.po-step-line')?.classList.remove('filled');
    $('stepFormCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ══════════════════════════════════════════════════════════
//  🚀  MAIN SUBMIT HANDLER
// ══════════════════════════════════════════════════════════
async function handleSubmit(e) {
    e.preventDefault();

    // 🍯 Honeypot check
    if ($('_hp')?.value) return;

    // Rate limit
    if (!checkRL()) {
        showGlobalErr('⏳ Çox tez göndərdiniz. Bir az gözləyin.');
        return;
    }

    // Validation
    if (!validateForm()) {
        const firstErr = document.querySelector('.error');
        firstErr?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }

    // Plan seçilmədisə
    if (!_selectedPlanKey) {
        showGlobalErr('Zəhmət olmasa bir paket seçin.');
        return;
    }

    setLoading(true);

    // Məlumat topla
    const orderData = {
        name: $('fName').value.trim(),
        email: $('fEmail').value.trim(),
        phone: $('fPhone').value.trim(),
        startDate: $('fStart').value,
        paymentMethod: $('fPayment').value,
        plan: $('hPlan').value,
        price: $('hPrice').value,
        period: $('hPeriod').value,
        planKey: $('hPlanKey').value,
        source: window.location.href,
        timestamp: new Date().toLocaleString('az-AZ', { timeZone: 'Asia/Baku' }),
    };

    // Google Sheets-ə göndər (arxa planda)
    await sendToGSheets(orderData);

    setLoading(false);
    showPaymentStep(orderData);
}

// ══════════════════════════════════════════════════════════
//  🏁  İNİT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // URL-dən planı oxu
    const { planKey, billing } = getPlanFromURL();

    // Plan key normalize et
    let initKey = planKey;
    // Əgər 'premium' gəlibsə, billing ilə birləşdir
    if (!planKey.includes('_')) {
        initKey = `${planKey}_${billing}`;
    }
    // Mövcud plan yoxdursa default
    const { planId } = parsePlanKey(initKey);
    if (!PLANS[planId]) initKey = 'premium_monthly';

    _selectedPlanKey = initKey;

    // Plan grid qur
    buildPlanGrid();

    // Hidden inputs ilkin seç
    selectPlan(_selectedPlanKey);

    // Form listener
    $('orderForm')?.addEventListener('submit', handleSubmit);

    // Keyboard dismiss (Escape)
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const payCard = $('stepPayCard');
            if (payCard && !payCard.classList.contains('hidden')) goBackToForm();
        }
    });
});

// Global expose (HTML onclick üçün)
window.goBackToForm = goBackToForm;
