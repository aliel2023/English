// ===== PREMIUM SALES SYSTEM =====
// Arxitektura:
//   Sayt Form → Google Apps Script Web App → Google Sheets
//   Sayt → Stripe Payment Link → Stripe server (kart məlumatı saytdan keçmir)

// ─── Google Apps Script URL ───────────────────────────────
// Deploy etdikdən sonra buraya yapışdırın:
const APPS_SCRIPT_URL = '';  // 'https://script.google.com/macros/s/SIZIN_URL/exec'

// ─── Stripe Payment Links ─────────────────────────────────
// stripe.com/dashboard → Payment Links → + New
const STRIPE_LINKS = {
    premium_monthly: '',  // 'https://buy.stripe.com/...'
    premium_yearly: '',
    professional_monthly: '',
    professional_yearly: '',
};

// ─── Rate limiter (spam qoruması) ────────────────────────
const orderRL = { count: 0, resetAt: 0, MAX: 3, WINDOW: 60000 };
function checkOrderRL() {
    const now = Date.now();
    if (now > orderRL.resetAt) { orderRL.count = 0; orderRL.resetAt = now + orderRL.WINDOW; }
    orderRL.count++;
    return orderRL.count <= orderRL.MAX;
}

// ─── Toggle Billing Period ────────────────────────────────
function toggleBilling() {
    const isYearly = document.getElementById('billingToggle').checked;
    document.querySelectorAll('.monthly-price').forEach(el => el.classList.toggle('hidden', isYearly));
    document.querySelectorAll('.yearly-price').forEach(el => el.classList.toggle('hidden', !isYearly));
    document.querySelectorAll('.monthly-period').forEach(el => el.classList.toggle('hidden', isYearly));
    document.querySelectorAll('.yearly-period').forEach(el => el.classList.toggle('hidden', !isYearly));
    localStorage.setItem('preferredBilling', isYearly ? 'yearly' : 'monthly');
    if (isYearly) showToast('💰 İllik planla 20% qənaət edirsiniz!', '#27ae60');
}

// ─── Plan seçimi → Modal aç ───────────────────────────────
function selectPlan(planName, price, period) {
    const isYearly = document.getElementById('billingToggle')?.checked;
    const planKey = planName.toLowerCase() + '_' + (isYearly ? 'yearly' : 'monthly');
    openOrderModal(planName, price, isYearly ? 'illik' : 'aylıq', planKey);
}

// ─── Order Modal ──────────────────────────────────────────
function openOrderModal(planName, price, period, planKey) {
    removeModal();
    const modal = document.createElement('div');
    modal.id = 'orderModal';
    modal.className = 'modal active';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', `${planName} plan sifariş`);

    modal.innerHTML = `
    <div class="modal-content order-modal-content" role="document">
        <button class="modal-close" onclick="removeModal()" aria-label="Bağla">×</button>
        <div class="order-modal-header">
            <div class="order-plan-badge">${planName === 'Premium' ? '⭐' : '👑'} ${planName}</div>
            <div class="order-price-display"><span class="order-amount">${price}</span><span class="order-period"> / ${period}</span></div>
        </div>

        <div id="orderStep1">
            <p class="order-step-title">📋 Məlumatlarınızı daxil edin</p>
            <form id="orderForm" onsubmit="handleOrderSubmit(event)" novalidate autocomplete="on">
                <!-- Honeypot (spam botlar doldurur, real istifadəçilər görmür) -->
                <input type="text" name="_hp" id="_hp" style="display:none!important" tabindex="-1" autocomplete="off">
                <input type="hidden" id="orderPlanKey"  value="${planKey}">
                <input type="hidden" id="orderPlanName" value="${planName}">
                <input type="hidden" id="orderPrice"    value="${price}">
                <input type="hidden" id="orderPeriod"   value="${period}">

                <div class="order-form-row">
                    <div class="order-field">
                        <label for="orderName">👤 Ad Soyad *</label>
                        <input type="text" id="orderName" name="name"
                               placeholder="Əli Hüseynov"
                               required minlength="2" maxlength="60"
                               autocomplete="name">
                    </div>
                    <div class="order-field">
                        <label for="orderPhone">📱 Telefon *</label>
                        <input type="tel" id="orderPhone" name="phone"
                               placeholder="+994 50 123 45 67"
                               required autocomplete="tel">
                    </div>
                </div>

                <div class="order-field">
                    <label for="orderEmail">📧 Email *</label>
                    <input type="email" id="orderEmail" name="email"
                           placeholder="email@nümunə.com"
                           required autocomplete="email" inputmode="email">
                </div>

                <div class="order-form-row">
                    <div class="order-field">
                        <label for="orderStart">📅 Başlama Vaxtı</label>
                        <select id="orderStart" name="startDate">
                            <option value="Bu həftə">Bu həftə</option>
                            <option value="Növbəti həftə">Növbəti həftə</option>
                            <option value="Bu ay">Bu ay</option>
                            <option value="Növbəti ay">Növbəti ay</option>
                        </select>
                    </div>
                    <div class="order-field">
                        <label for="orderPayment">💳 Ödəniş Üsulu</label>
                        <select id="orderPayment" name="paymentMethod">
                            <option value="Stripe (Kart)">💳 Stripe (Kart)</option>
                            <option value="Telegram (Manual)">📱 Telegram (Manual)</option>
                        </select>
                    </div>
                </div>

                <div id="orderFormError" class="order-error hidden"></div>

                <button type="submit" class="btn btn-primary order-submit-btn" id="orderSubmitBtn">
                    <span id="orderBtnText">✅ Sifarişi Göndər</span>
                    <span class="btn-spinner hidden" id="orderSpinner"></span>
                </button>
            </form>

            <div class="order-trust-row">
                <span>🔒 SSL Şifrəli</span>
                <span>🛡️ Kart məlumatı saxlanmır</span>
                <span>💯 30 gün zəmanət</span>
            </div>
        </div>

        <!-- Step 2: Ödəniş -->
        <div id="orderStep2" class="hidden">
            <div class="order-success-icon">🎉</div>
            <h3 class="order-success-title">Sifarişiniz qeydə alındı!</h3>
            <p class="order-success-desc" id="orderSuccessDesc">İndi ödəniş edin:</p>
            <div id="orderPaymentOptions"></div>
            <p class="order-contact-note">
                📩 Sifariş təsdiqi emailinizə göndərildi.
                Sualınız varsa: <a href="https://t.me/alifarajovvv" target="_blank" rel="noopener">@alifarajovvv</a>
            </p>
        </div>
    </div>`;

    modal.addEventListener('click', e => { if (e.target === modal) removeModal(); });
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('orderName')?.focus(), 100);
}

// ─── Form Submit ──────────────────────────────────────────
window.handleOrderSubmit = async function (e) {
    e.preventDefault();

    // Honeypot check
    if (document.getElementById('_hp')?.value) return;

    // Rate limit
    if (!checkOrderRL()) {
        showOrderError('Çox tez göndərdiniz. Bir az gözləyin.');
        return;
    }

    const name = document.getElementById('orderName')?.value.trim();
    const email = document.getElementById('orderEmail')?.value.trim();
    const phone = document.getElementById('orderPhone')?.value.trim();
    const start = document.getElementById('orderStart')?.value;
    const payment = document.getElementById('orderPayment')?.value;
    const plan = document.getElementById('orderPlanName')?.value;
    const price = document.getElementById('orderPrice')?.value;
    const period = document.getElementById('orderPeriod')?.value;
    const planKey = document.getElementById('orderPlanKey')?.value;

    // Validation
    if (!name || name.length < 2) { showOrderError('Ad ən azı 2 simvol olmalıdır.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { showOrderError('Email formatı yanlışdır.'); return; }
    if (!phone || phone.length < 9) { showOrderError('Telefon nömrəsini daxil edin.'); return; }

    setOrderLoading(true);

    // Google Sheets-ə göndər
    if (APPS_SCRIPT_URL) {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',  // Apps Script CORS-u qəbul edir
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, email, phone, plan,
                    price, period, start,
                    paymentMethod: payment,
                    status: 'Yeni',
                    date: new Date().toLocaleString('az-AZ', { timeZone: 'Asia/Baku' }),
                    source: window.location.href
                })
            });
        } catch (_) { /* no-cors ilə cavab alınmır, uğursuzluğa baxmırıq */ }
    }

    setOrderLoading(false);
    showPaymentStep(plan, price, period, planKey, payment, name, email);
};

// ─── Step 2: Ödəniş seçimini göstər ─────────────────────
function showPaymentStep(plan, price, period, planKey, paymentMethod, name, email) {
    document.getElementById('orderStep1').classList.add('hidden');
    document.getElementById('orderStep2').classList.remove('hidden');

    const stripeLink = STRIPE_LINKS[planKey];
    const telLink = `https://t.me/alifarajovvv?text=${encodeURIComponent(
        `Salam! ${plan} plan (${price}/${period}) almaq istəyirəm.\nAd: ${name}\nEmail: ${email}`)}`;

    let optionsHTML = '';

    if (stripeLink) {
        // Stripe linki var — birbaşa ödəniş
        document.getElementById('orderSuccessDesc').textContent =
            'Aşağıdakı düyməyə basaraq təhlükəsiz ödəniş edin:';
        optionsHTML = `
            <a href="${stripeLink}" target="_blank" rel="noopener"
               class="order-pay-stripe-btn">
                💳 Stripe ilə Ödə — ${price} / ${period}
            </a>
            <p class="order-stripe-note">🔒 Ödəniş Stripe tərəfindən işlənir. Kart məlumatınız bizə çatmır.</p>`;
    } else {
        // Stripe linki yoxdur — Telegram/manual ödəniş
        document.getElementById('orderSuccessDesc').textContent =
            'Ödəniş üçün bizimlə əlaqə saxlayın:';
        optionsHTML = `
            <a href="${telLink}" target="_blank" rel="noopener" class="order-pay-tg-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>
                Telegram ilə Ödə
            </a>
            <p class="order-payment-info">
                💡 Mesajınıza <strong>${plan} — ${price}</strong> yazın.
                24 saat ərzində cavab veriləcək.
            </p>`;
    }

    document.getElementById('orderPaymentOptions').innerHTML = optionsHTML;
}

// ─── Helpers ─────────────────────────────────────────────
function showOrderError(msg) {
    const el = document.getElementById('orderFormError');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}
function setOrderLoading(on) {
    const btn = document.getElementById('orderSubmitBtn');
    const txt = document.getElementById('orderBtnText');
    const sp = document.getElementById('orderSpinner');
    if (btn) btn.disabled = on;
    if (txt) txt.textContent = on ? 'Göndərilir...' : '✅ Sifarişi Göndər';
    if (sp) sp.classList.toggle('hidden', !on);
}
function showToast(msg, color) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(80px);
        background:${color};color:white;padding:.85rem 1.75rem;border-radius:50px;
        font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.35);
        transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .35s;opacity:0;font-size:.93rem;`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.transform = 'translateX(-50%) translateY(0)'; t.style.opacity = '1'; });
    setTimeout(() => {
        t.style.transform = 'translateX(-50%) translateY(80px)'; t.style.opacity = '0';
        setTimeout(() => t.remove(), 400);
    }, 3500);
}
function removeModal() {
    const m = document.getElementById('orderModal');
    if (m) { m.remove(); document.body.style.overflow = ''; }
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('preferredBilling') === 'yearly') {
        const t = document.getElementById('billingToggle');
        if (t) { t.checked = true; toggleBilling(); }
    }
});

// ─── Styles injection ─────────────────────────────────────
(function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
    .order-modal-content {
        max-width: 520px; padding: 2rem 1.75rem; text-align: left;
        max-height: 90vh; overflow-y: auto;
    }
    .order-modal-header { text-align:center; margin-bottom:1.5rem; }
    .order-plan-badge {
        display:inline-block; background:linear-gradient(135deg,#e63946,#c1121f);
        color:white; padding:.4rem 1rem; border-radius:50px; font-weight:700;
        font-size:.9rem; margin-bottom:.75rem;
    }
    .order-price-display { font-size:1.1rem; color:var(--text-secondary); }
    .order-amount { font-size:2rem; font-weight:800; color:var(--primary); }
    .order-step-title { font-weight:600; margin-bottom:1rem; color:var(--text-primary); }
    .order-form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .order-field { display:flex; flex-direction:column; gap:.4rem; margin-bottom:.85rem; }
    .order-field label { font-size:.82rem; font-weight:600; color:var(--text-secondary); }
    .order-field input, .order-field select {
        padding:.7rem 1rem; border:1.5px solid var(--border);
        border-radius:10px; background:var(--bg-light);
        color:var(--text-primary); font-size:.92rem; transition:border .2s;
    }
    .order-field input:focus, .order-field select:focus {
        outline:none; border-color:var(--primary);
    }
    .order-error {
        background:rgba(255,71,87,.1); border:1px solid rgba(255,71,87,.3);
        color:#ff4757; padding:.6rem 1rem; border-radius:8px; font-size:.85rem; margin-bottom:.75rem;
    }
    .order-submit-btn { width:100%; margin-top:.25rem; padding:.9rem; font-size:1rem; }
    .order-trust-row {
        display:flex; justify-content:center; gap:1.25rem; flex-wrap:wrap;
        margin-top:1rem; font-size:.75rem; color:var(--text-muted);
    }
    /* Step 2 */
    .order-success-icon { font-size:3rem; text-align:center; }
    .order-success-title { text-align:center; font-size:1.3rem; margin:.5rem 0 .5rem; }
    .order-success-desc { text-align:center; color:var(--text-secondary); margin-bottom:1rem; font-size:.9rem; }
    .order-pay-stripe-btn {
        display:flex; align-items:center; justify-content:center; gap:.5rem;
        width:100%; padding:1rem; background:linear-gradient(135deg,#635bff,#7c74ff);
        color:white; border-radius:12px; font-weight:700; text-decoration:none;
        font-size:1rem; margin-bottom:.75rem; transition:transform .2s,box-shadow .2s;
        box-shadow:0 4px 16px rgba(99,91,255,.35);
    }
    .order-pay-stripe-btn:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(99,91,255,.45); }
    .order-stripe-note { font-size:.78rem; color:var(--text-muted); text-align:center; margin-bottom:.75rem; }
    .order-pay-tg-btn {
        display:flex; align-items:center; justify-content:center; gap:.6rem;
        width:100%; padding:1rem; background:linear-gradient(135deg,#0088cc,#0099dd);
        color:white; border-radius:12px; font-weight:700; text-decoration:none;
        font-size:1rem; margin-bottom:.75rem; transition:transform .2s;
    }
    .order-pay-tg-btn:hover { transform:translateY(-2px); }
    .order-payment-info { font-size:.83rem; color:var(--text-secondary); text-align:center; line-height:1.6; }
    .order-contact-note { font-size:.8rem; color:var(--text-muted); text-align:center; margin-top:1rem; }
    .order-contact-note a { color:var(--primary); }
    @media(max-width:520px){
        .order-form-row { grid-template-columns:1fr; }
        .order-trust-row { gap:.75rem; }
    }`;
    document.head.appendChild(s);
})();