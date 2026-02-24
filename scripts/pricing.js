// ===== Pricing Page Script =====
// Stripe Payment Links — statik sayt üçün ən sadə və təhlükəsiz həll.
// 1. stripe.com → Payment Links → + New → link yarat
// 2. Aşağıdakı PAYMENT_LINKS-ə kopyala
// 3. Hazır! Backend lazım deyil.

const PAYMENT_LINKS = {
    // Stripe Payment Linklərinizi buraya yapışdırın:
    // stripe.com/dashboard → Payment Links → + New
    premium_monthly: '',   // '(stripe.com/pay/...'
    premium_yearly: '',
    professional_monthly: '',
    professional_yearly: '',
};

// ─── Plan seçimi ───────────────────────────────────────────
function selectPlan(planName, price, period) {
    const isYearly = document.getElementById('billingToggle')?.checked;

    // Doğru Stripe linkini tap
    const key = planName.toLowerCase() + '_' + (isYearly ? 'yearly' : 'monthly');
    const stripeLink = PAYMENT_LINKS[key];

    if (stripeLink) {
        // Stripe Payment Link mövcuddur → birbaşa yönləndir
        showPlanModal(planName, price, period, stripeLink);
    } else {
        // Stripe linki əlavə edilməyib → Əlaqə səhifəsinə yönləndir
        showContactModal(planName, price, period);
    }
}

// ─── Plan Təsdiq Modalı (Stripe linki varsa) ────────────────
function showPlanModal(planName, price, period, stripeLink) {
    removeModal();

    const modal = document.createElement('div');
    modal.id = 'planModal';
    modal.className = 'modal active plan-confirm-modal';
    modal.innerHTML = `
        <div class="modal-content plan-confirm-content">
            <button class="modal-close" onclick="removeModal()">×</button>

            <div class="plan-confirm-icon">💳</div>
            <h2 class="plan-confirm-title">${planName} planı seçdiniz</h2>
            <div class="plan-confirm-price">
                <span class="plan-confirm-amount">${price}</span>
                <span class="plan-confirm-period">/ ${period}</span>
            </div>

            <ul class="plan-confirm-features">
                ${planName === 'Premium' ? `
                    <li>✓ 500+ premium PDF</li>
                    <li>✓ 100+ video dərs</li>
                    <li>✓ Flashcard sistemi</li>
                    <li>✓ Audio tələffüz</li>
                    <li>✓ Prioritet dəstək</li>
                ` : `
                    <li>✓ 1000+ premium material</li>
                    <li>✓ Limitsiz video dərs</li>
                    <li>✓ 1-on-1 mentor dəstəyi</li>
                    <li>✓ Rəsmi sertifikat</li>
                    <li>✓ IELTS hazırlıq</li>
                `}
            </ul>

            <div class="plan-confirm-note">
                🔒 Stripe ilə təhlükəsiz ödəniş · Visa, Mastercard, Apple Pay
            </div>

            <div class="plan-confirm-btns">
                <button class="btn btn-secondary" onclick="removeModal()">Ləğv et</button>
                <a href="${stripeLink}" class="btn btn-primary plan-pay-btn" target="_blank" rel="noopener">
                    💳 Ödənişə Keç
                </a>
            </div>
        </div>
    `;

    modal.addEventListener('click', e => { if (e.target === modal) removeModal(); });
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// ─── Əlaqə Modalı (Stripe linki yoxdursa) ──────────────────
function showContactModal(planName, price, period) {
    removeModal();

    const whatsapp = 'https://wa.me/994XXXXXXXXX'; // WhatsApp nömrəni dəyişin
    const telegram = 'https://t.me/alielenglish';
    const email = 'mailto:englishaliel@gmail.com?subject=Plan%20Sifariş%3A%20' + planName +
        '&body=Salam%2C%20' + planName + '%20planını%20(%20' + price + '%20%2F%20' + period + ')%20almaq%20istəyirəm.';

    const modal = document.createElement('div');
    modal.id = 'planModal';
    modal.className = 'modal active plan-confirm-modal';
    modal.innerHTML = `
        <div class="modal-content plan-confirm-content">
            <button class="modal-close" onclick="removeModal()">×</button>

            <div class="plan-confirm-icon">🎉</div>
            <h2 class="plan-confirm-title">${planName} planını seçdiniz!</h2>
            <div class="plan-confirm-price">
                <span class="plan-confirm-amount">${price}</span>
                <span class="plan-confirm-period">/ ${period}</span>
            </div>

            <p class="plan-contact-desc">
                Ödəniş üçün aşağıdakı üsullardan biri ilə bizimlə əlaqə saxlayın.
                Sizə 24 saat ərzində cavab veriləcək. 🚀
            </p>

            <div class="plan-contact-btns">
                <a href="${telegram}" class="contact-opt-btn contact-tg" target="_blank" rel="noopener">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>
                    Telegram ilə yazın
                </a>
                <a href="${email}" class="contact-opt-btn contact-email">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
                    Email göndər
                </a>
            </div>

            <div class="plan-confirm-note">
                📌 Mesajınızda <strong>"${planName} — ${price}"</strong> yazın
            </div>
        </div>
    `;

    modal.addEventListener('click', e => { if (e.target === modal) removeModal(); });
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function removeModal() {
    const m = document.getElementById('planModal');
    if (m) { m.remove(); document.body.style.overflow = ''; }
}

// ─── Toggle Billing Period ────────────────────────────────
function toggleBilling() {
    const isYearly = document.getElementById('billingToggle').checked;

    document.querySelectorAll('.monthly-price').forEach(el => el.classList.toggle('hidden', isYearly));
    document.querySelectorAll('.yearly-price').forEach(el => el.classList.toggle('hidden', !isYearly));
    document.querySelectorAll('.monthly-period').forEach(el => el.classList.toggle('hidden', isYearly));
    document.querySelectorAll('.yearly-period').forEach(el => el.classList.toggle('hidden', !isYearly));

    localStorage.setItem('preferredBilling', isYearly ? 'yearly' : 'monthly');

    if (isYearly) showToastNotif('💰 İllik planla 20% qənaət edirsiniz!', '#27ae60');
}

// ─── Toast notification ───────────────────────────────────
function showToastNotif(msg, color = '#27ae60') {
    const t = document.createElement('div');
    t.style.cssText = `
        position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(80px);
        background:${color};color:white;padding:.85rem 1.75rem;border-radius:50px;
        font-weight:600;font-size:.95rem;z-index:9999;
        box-shadow:0 4px 20px rgba(0,0,0,.35);
        transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .4s;opacity:0;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
        t.style.transform = 'translateX(-50%) translateY(0)';
        t.style.opacity = '1';
    });
    setTimeout(() => {
        t.style.transform = 'translateX(-50%) translateY(80px)';
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 400);
    }, 3500);
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // Billing preference
    if (localStorage.getItem('preferredBilling') === 'yearly') {
        const toggle = document.getElementById('billingToggle');
        if (toggle) { toggle.checked = true; toggleBilling(); }
    }
});

// Modal styles injection
(function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
    .plan-confirm-modal .modal-content { max-width: 420px; text-align: center; padding: 2.5rem 2rem; }
    .plan-confirm-icon { font-size: 3rem; margin-bottom: .75rem; }
    .plan-confirm-title { font-size: 1.4rem; margin-bottom: .75rem; }
    .plan-confirm-price { margin-bottom: 1.25rem; }
    .plan-confirm-amount { font-size: 2.5rem; font-weight: 800; color: var(--primary); }
    .plan-confirm-period { font-size: .95rem; color: var(--text-secondary); }
    .plan-confirm-features { list-style: none; text-align: left; margin: 0 auto 1.25rem; max-width: 260px; }
    .plan-confirm-features li { padding: .3rem 0; color: var(--text-secondary); font-size: .9rem; }
    .plan-confirm-note { font-size: .8rem; color: var(--text-muted); padding: .75rem; background: rgba(255,255,255,.04); border-radius: 8px; margin-bottom: 1.25rem; }
    .plan-confirm-btns { display: flex; gap: .75rem; justify-content: center; }
    .plan-confirm-btns .btn { min-width: 130px; }
    .plan-pay-btn { text-decoration: none; display: inline-flex; align-items: center; gap: .4rem; }
    /* Contact modal */
    .plan-contact-desc { color: var(--text-secondary); font-size: .9rem; line-height: 1.6; margin-bottom: 1.25rem; }
    .plan-contact-btns { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 1rem; }
    .contact-opt-btn {
        display: flex; align-items: center; justify-content: center; gap: .6rem;
        padding: .85rem 1.5rem; border-radius: 12px; font-weight: 600; font-size: .95rem;
        text-decoration: none; transition: transform .2s, box-shadow .2s; cursor: pointer;
    }
    .contact-opt-btn:hover { transform: translateY(-2px); }
    .contact-tg  { background: linear-gradient(135deg, #0088cc, #0099dd); color: white; box-shadow: 0 4px 14px rgba(0,136,204,.35); }
    .contact-email { background: rgba(255,255,255,.06); border: 1.5px solid rgba(255,255,255,.12); color: var(--text-primary); }
    .contact-email:hover { background: rgba(255,255,255,.1); }
    @media(max-width:480px){
        .plan-confirm-modal .modal-content { padding: 2rem 1.25rem; }
        .plan-confirm-btns { flex-direction: column; }
        .plan-confirm-btns .btn { width: 100%; }
    }`;
    document.head.appendChild(s);
})();