// ===== Animated Statistics Counter =====
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Intersection Observer for stat counters
const observeStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.textContent === '0') {
                animateCounter(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
};

// ===== Feature Cards Stagger Animation =====
const animateFeatureCards = () => {
    const cards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
};

// ===== Welcome Back Message =====
const showWelcomeMessage = () => {
    const userData = localStorage.getItem('alielUser');
    if (userData) {
        const user = JSON.parse(userData);
        const userName = user.name;
        
        // Create welcome toast
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
        `;
        toast.textContent = `Xoş gəlmisiniz, ${userName}! 👋`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
};

// ===== Progress Display in Hero =====
const displayUserProgress = () => {
    const progress = getUserProgress();
    if (progress) {
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            // Add user progress to stats
            const progressHTML = `
                <div class="stat-item" style="grid-column: span 3; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-secondary);">Sizin səviyyəniz:</span>
                        <span style="color: var(--primary); font-weight: 700; font-size: 1.5rem;">${progress.level}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--border); border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                        <div style="width: ${(progress.completedLessons / 50) * 100}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-light)); transition: width 0.5s ease;"></div>
                    </div>
                    <span style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.3rem;">${progress.completedLessons}/50 dərs tamamlandı</span>
                </div>
            `;
            heroStats.insertAdjacentHTML('beforeend', progressHTML);
        }
    }
};

// ===== Add CSS for animations =====
const addAnimationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

// ===== Initialize Home Page =====
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    observeStats();
    animateFeatureCards();
    showWelcomeMessage();
    displayUserProgress();
});