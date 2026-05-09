/* ==========================================================================
   Home Page — Counter Animation, Feature Reveal, Welcome Message
   ========================================================================== */

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const frameRate = 16; // ~60fps
    const totalFrames = duration / frameRate;
    const increment = target / totalFrames;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target.toLocaleString() + suffix;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current).toLocaleString() + suffix;
        }
    }, frameRate);
}

const observeStats = () => {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.textContent === '0') {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(el => observer.observe(el));
};

const animateFeatureCards = () => {
    const cards = document.querySelectorAll('.feature-card');
    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 100);
            }
        });
    }, { threshold: 0.1 });
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
};

const showWelcomeMessage = () => {
    const user = localStorage.getItem('alielUser');
    if (user) {
        const name = JSON.parse(user).name;
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #e63946, #ff4757);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(230, 57, 70, 0.4);
            z-index: 1001;
            animation: slideIn 0.5s ease;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
        `;
        toast.textContent = `Xoş gəlmisiniz, ${name}! 👋`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
};

const addAnimationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to   { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
};

document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    observeStats();
    animateFeatureCards();
    showWelcomeMessage();
});