// ===== Filter Resources =====
function filterResources(type, e) {
    const cards = document.querySelectorAll('.resource-card');
    const tabs = document.querySelectorAll('.filter-tab');

    // Update active tab
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    if (e && e.target) {
        e.target.classList.add('active');
    }

    // Filter cards with animation
    cards.forEach((card, index) => {
        const cardTypes = card.dataset.type;

        if (type === 'all' || cardTypes.includes(type)) {
            setTimeout(() => {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.3s ease';
            }, index * 50);
        } else {
            card.style.display = 'none';
        }
    });
}

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== Download Resource =====
function downloadResource(resourceId, type) {
    // Increment download counter for this resource
    let downloads = parseInt(localStorage.getItem(`downloads_${resourceId}`) || '0');
    downloads++;
    localStorage.setItem(`downloads_${resourceId}`, downloads.toString());

    // Update total downloads
    let totalDownloads = parseInt(localStorage.getItem('totalDownloads') || '0');
    totalDownloads++;
    localStorage.setItem('totalDownloads', totalDownloads.toString());

    // Update UI counter if exists
    const downloadCountElements = document.querySelectorAll('.download-count');
    downloadCountElements.forEach(el => {
        const currentCount = parseInt(el.textContent.match(/\d+/)[0]);
        el.textContent = `${currentCount + 1} yükləmə`;
    });

    if (type === 'free') {
        // Check if user already registered
        const userData = localStorage.getItem('alielUser');

        if (userData) {
            // Direct download
            alert('✅ Yükləmə başladı! PDF bir neçə saniyə ərzində email ünvanınıza göndəriləcək.');

            // Simulate download
            const link = document.createElement('a');
            link.href = '#'; // Real PDF URL buraya
            link.download = `${resourceId}.pdf`;
            link.click();

            // Track in user data
            const user = JSON.parse(userData);
            if (!user.downloads) user.downloads = [];
            user.downloads.push({
                resourceId: resourceId,
                date: new Date().toISOString()
            });
            localStorage.setItem('alielUser', JSON.stringify(user));
        } else {
            // Show email modal first
            alert('📥 Pulsuz yükləmək üçün email ünvanınızı daxil edin');
            openEmailModal();

            // Store which resource user wants to download
            localStorage.setItem('pendingDownload', resourceId);
        }

        // Show premium upgrade after 3 free downloads
        if (totalDownloads >= 3) {
            setTimeout(() => {
                if (confirm('🎁 Artıq 3 pulsuz resurs yüklədiz! Premium üzvlüklə limitsiz giriş əldə edin. İndi baxmaq istəyirsiniz?')) {
                    window.location.href = 'pricing.html';
                }
            }, 2000);
        }
    }
}

// ===== Premium Modal =====
let selectedResource = null;
const premiumPrices = {
    'business-pack': '25 AZN',
    'travel-pack': '20 AZN',
    'video-course': '149 AZN',
    'advanced-grammar': '35 AZN',
    'ielts-bundle': '45 AZN',
    'conversation-pack': '89 AZN'
};

function showPremiumModal(resourceId) {
    selectedResource = resourceId;
    const modal = document.getElementById('premiumModal');

    // Update modal content
    const resourceNames = {
        'business-pack': 'Business English Complete Pack',
        'travel-pack': 'English for Travel & Tourism',
        'video-course': 'Video Course: A1 to B1',
        'advanced-grammar': 'Advanced Grammar Mastery',
        'ielts-bundle': 'IELTS Preparation Bundle',
        'conversation-pack': 'Conversation Practice Sessions'
    };

    document.getElementById('premiumModalText').textContent =
        `"${resourceNames[resourceId]}" premium resursunu əldə etmək üçün ödəniş edin`;

    document.getElementById('premiumPrice').textContent = premiumPrices[resourceId];

    modal.classList.add('active');
}

function closePremiumModal() {
    document.getElementById('premiumModal').classList.remove('active');
}

function proceedToCheckout() {
    // Track conversion attempt
    const conversionData = {
        resourceId: selectedResource,
        price: premiumPrices[selectedResource],
        timestamp: new Date().toISOString()
    };

    // Save to localStorage for analytics
    const conversions = JSON.parse(localStorage.getItem('conversionAttempts') || '[]');
    conversions.push(conversionData);
    localStorage.setItem('conversionAttempts', JSON.stringify(conversions));

    // Show payment processing message
    alert('💳 Stripe ödəniş səhifəsinə yönləndirilirsiniz...\n\nReal integration üçün Stripe API key əlavə edin.');

    // In production, redirect to Stripe checkout:
    // window.location.href = `https://checkout.stripe.com/...`;

    // For now, redirect to pricing page
    setTimeout(() => {
        window.location.href = 'pricing.html';
    }, 1500);
}

// ===== Complete Pending Download =====
document.addEventListener('DOMContentLoaded', function () {
    // Check if there's a pending download after email submission
    const pendingDownload = localStorage.getItem('pendingDownload');

    if (pendingDownload) {
        const userData = localStorage.getItem('alielUser');

        if (userData) {
            // User just registered, complete download
            setTimeout(() => {
                alert(`✅ Qeydiyyatınız tamamlandı! "${pendingDownload}" resursu yüklənir...`);
                localStorage.removeItem('pendingDownload');
            }, 500);
        }
    }
});

// ===== Update Download Counters on Page Load =====
document.addEventListener('DOMContentLoaded', function () {
    // Simulate real download counts (in production, fetch from backend)
    const baseCounts = {
        '50-expressions': 1234,
        'grammar-basics': 892,
        'common-phrases': 1567
    };

    document.querySelectorAll('.resource-card[data-type*="free"]').forEach((card, index) => {
        const downloadCount = card.querySelector('.download-count');
        if (downloadCount) {
            const resourceIds = Object.keys(baseCounts);
            const savedCount = localStorage.getItem(`downloads_${resourceIds[index]}`) || '0';
            const totalCount = baseCounts[resourceIds[index]] + parseInt(savedCount);
            downloadCount.textContent = `${totalCount.toLocaleString()} yükləmə`;
        }
    });
});

// ===== Smooth Scroll to Resources =====
if (window.location.hash === '#resources') {
    setTimeout(() => {
        document.querySelector('.resources-content').scrollIntoView({
            behavior: 'smooth'
        });
    }, 100);
}