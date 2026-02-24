// ===== Toggle Billing Period =====
function toggleBilling() {
    const isYearly = document.getElementById('billingToggle').checked;
    
    // Toggle price displays
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    
    monthlyPrices.forEach(el => {
        el.classList.toggle('hidden', isYearly);
    });
    
    yearlyPrices.forEach(el => {
        el.classList.toggle('hidden', !isYearly);
    });
    
    // Toggle period labels
    const monthlyPeriods = document.querySelectorAll('.monthly-period');
    const yearlyPeriods = document.querySelectorAll('.yearly-period');
    
    monthlyPeriods.forEach(el => {
        el.classList.toggle('hidden', isYearly);
    });
    
    yearlyPeriods.forEach(el => {
        el.classList.toggle('hidden', !isYearly);
    });
    
    // Save preference
    localStorage.setItem('preferredBilling', isYearly ? 'yearly' : 'monthly');
    
    // Show savings notification for yearly
    if (isYearly) {
        showSavingsNotification();
    }
}

// ===== Show Savings Notification =====
function showSavingsNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60, #229954);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(39, 174, 96, 0.4);
        z-index: 1001;
        animation: slideIn 0.5s ease;
        font-weight: 600;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">💰</span>
            <span>20% qənaət! İllik planla daha sərfəli</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ===== Select Plan =====
function selectPlan(planName, price, period) {
    // Save plan selection
    const planData = {
        plan: planName,
        price: price,
        period: period,
        selectedAt: new Date().toISOString()
    };
    
    localStorage.setItem('selectedPlan', JSON.stringify(planData));
    
    // Track conversion
    const conversions = JSON.parse(localStorage.getItem('planSelections') || '[]');
    conversions.push(planData);
    localStorage.setItem('planSelections', JSON.stringify(conversions));
    
    // Show confirmation
    if (confirm(`✅ "${planName}" planını seçdiniz (${price} ${period}).\n\nÖdənişə davam etmək istəyirsiniz?`)) {
        proceedToPayment(planData);
    }
}

// ===== Proceed to Payment =====
function proceedToPayment(planData) {
    // In production, redirect to Stripe Checkout
    alert(`💳 Stripe ödəniş səhifəsinə yönləndirilirsiniz...\n\nPlan: ${planData.plan}\nQiymət: ${planData.price}\n\nReal integration üçün Stripe API key əlavə edin.`);
    
    // Simulate payment redirect
    setTimeout(() => {
        // window.location.href = 'https://checkout.stripe.com/...';
        console.log('Payment redirect:', planData);
    }, 1500);
}

// ===== Show Plan Comparison =====
function showPlanComparison() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            <h2 style="color: var(--primary); margin-bottom: 2rem;">Plan Müqayisəsi</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-light);">
                        <th style="padding: 1rem; text-align: left;">Xüsusiyyət</th>
                        <th style="padding: 1rem; text-align: center;">Başlanğıc</th>
                        <th style="padding: 1rem; text-align: center; color: var(--primary);">Premium</th>
                        <th style="padding: 1rem; text-align: center;">Professional</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem;">Günün sözü</td>
                        <td style="padding: 1rem; text-align: center;">✓</td>
                        <td style="padding: 1rem; text-align: center;">✓</td>
                        <td style="padding: 1rem; text-align: center;">✓</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem;">PDF resurslar</td>
                        <td style="padding: 1rem; text-align: center;">50</td>
                        <td style="padding: 1rem; text-align: center;">500+</td>
                        <td style="padding: 1rem; text-align: center;">1000+</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem;">Video dərslər</td>
                        <td style="padding: 1rem; text-align: center;">✗</td>
                        <td style="padding: 1rem; text-align: center;">100+</td>
                        <td style="padding: 1rem; text-align: center;">Limitsiz</td>
                    </tr>
                </tbody>
            </table>
            <button class="btn btn-primary" style="margin-top: 2rem;" onclick="this.closest('.modal').remove()">Bağla</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ===== Apply Discount Code =====
function applyDiscountCode() {
    const code = prompt('Endirim kodunuzu daxil edin:');
    
    if (!code) return;
    
    const validCodes = {
        'ALIEL50': 50,
        'WELCOME20': 20,
        'STUDENT30': 30,
        'PREMIUM25': 25
    };
    
    const discount = validCodes[code.toUpperCase()];
    
    if (discount) {
        alert(`✅ Endirim kodu qəbul edildi!\n\n${discount}% endirim tətbiq olundu.`);
        
        // Save discount to localStorage
        localStorage.setItem('appliedDiscount', JSON.stringify({
            code: code.toUpperCase(),
            percentage: discount,
            appliedAt: new Date().toISOString()
        }));
        
        // Update UI (in production, recalculate prices)
        showDiscountBanner(discount);
    } else {
        alert('❌ Endirim kodu səhvdir. Yenidən cəhd edin.');
    }
}

// ===== Show Discount Banner =====
function showDiscountBanner(percentage) {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #f39c12, #e67e22);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(243, 156, 18, 0.4);
        z-index: 1001;
        font-weight: 600;
        animation: slideDown 0.5s ease;
    `;
    banner.textContent = `🎉 ${percentage}% endirim tətbiq olundu!`;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        banner.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => banner.remove(), 500);
    }, 4000);
}

// ===== Initialize Pricing Page =====
document.addEventListener('DOMContentLoaded', function() {
    // Restore billing preference
    const savedBilling = localStorage.getItem('preferredBilling');
    if (savedBilling === 'yearly') {
        const toggle = document.getElementById('billingToggle');
        if (toggle) {
            toggle.checked = true;
            toggleBilling();
        }
    }
    
    // Check for active discount
    const appliedDiscount = localStorage.getItem('appliedDiscount');
    if (appliedDiscount) {
        const discount = JSON.parse(appliedDiscount);
        showDiscountBanner(discount.percentage);
    }
    
    // Note: Plan buttons already have inline onclick handlers in HTML
    // No additional click handlers needed here
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100px); opacity: 0; }
    }
`;
document.head.appendChild(style);