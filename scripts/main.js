// ===== MAIN.JS - CORE FUNCTIONS =====

// ===== Mobile Menu Toggle =====
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');

    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    if (mobileToggle) {
        mobileToggle.classList.toggle('active');
    }
}

// ===== Email Modal =====
function openEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== Email Form Submission =====
function handleEmailFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('userName')?.value;
    const email = document.getElementById('userEmail')?.value;

    if (!name || !email) {
        alert('Please fill in all fields');
        return;
    }

    // Save to localStorage
    const userData = {
        name: name,
        email: email,
        date: new Date().toISOString(),
        progress: {
            level: 'A1',
            completedLessons: 0,
            testScore: 0
        }
    };

    localStorage.setItem('alielUser', JSON.stringify(userData));

    // Get message based on current language
    const lang = document.documentElement.lang || 'az';
    const messages = {
        az: `Təşəkkürlər ${name}! Pulsuz e-kitab email ünvanınıza göndəriləcək.`,
        en: `Thank you ${name}! The free e-book will be sent to your email.`
    };

    alert(messages[lang] || messages.az);

    // Track download
    let downloads = parseInt(localStorage.getItem('totalDownloads') || '0');
    downloads++;
    localStorage.setItem('totalDownloads', downloads.toString());

    closeEmailModal();
    e.target.reset();

    // Redirect to resources page
    setTimeout(() => {
        window.location.href = 'resources.html';
    }, 1500);
}

// ===== Progress Tracker =====
function getUserProgress() {
    const userData = localStorage.getItem('alielUser');
    if (userData) {
        return JSON.parse(userData).progress;
    }
    return null;
}

function updateProgress(level, lessons, score) {
    const userData = JSON.parse(localStorage.getItem('alielUser') || '{}');
    if (userData.progress) {
        userData.progress.level = level;
        userData.progress.completedLessons = lessons;
        userData.progress.testScore = score;
        localStorage.setItem('alielUser', JSON.stringify(userData));
    }
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Active Navigation Highlight =====
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== Download Statistics =====
function showDownloadStats() {
    const downloads = parseInt(localStorage.getItem('totalDownloads') || '0');
    if (downloads > 0) {
        console.log(`Total downloads: ${downloads}`);
    }
}

// ===== FAQ Toggle =====
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    if (!faqItem) return;

    const isActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// ===== Keyboard Accessibility =====
function initKeyboardAccessibility() {
    document.addEventListener('keydown', function (e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            closeEmailModal();

            // Close other modals if they exist
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// ===== Close Mobile Menu on Outside Click =====
function initMobileMenuClose() {
    document.addEventListener('click', function (e) {
        const navMenu = document.getElementById('navMenu');
        const toggle = document.querySelector('.mobile-toggle');

        if (navMenu && toggle) {
            if (!navMenu.contains(e.target) && !toggle.contains(e.target) && !e.target.closest('.nav-menu')) {
                navMenu.classList.remove('active');
                toggle.classList.remove('active');
            }
        }
    });
}

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function () {
    // Set active navigation
    setActiveNav();

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize keyboard accessibility
    initKeyboardAccessibility();

    // Initialize mobile menu close
    initMobileMenuClose();

    // Show download stats in console
    showDownloadStats();

    // Email modal close on outside click
    const emailModal = document.getElementById('emailModal');
    if (emailModal) {
        emailModal.addEventListener('click', function (e) {
            if (e.target === emailModal) {
                closeEmailModal();
            }
        });
    }

    // Email form submission
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailFormSubmit);
    }

    // Initialize global AI Chat
    initAIChat();

    // Initialize Footer Modals (FAQ & Privacy)
    initFooterModals();
});

// ===== Language Dropdown Toggle =====
function toggleLangDropdown() {
    const langMenu = document.getElementById('langMenu');
    if (langMenu) {
        langMenu.classList.toggle('show');
    }
}

// Close Dropdown on outside click
document.addEventListener('click', function (e) {
    const langDropdown = document.querySelector('.lang-dropdown');
    const langMenu = document.getElementById('langMenu');

    if (langDropdown && langMenu) {
        if (!langDropdown.contains(e.target)) {
            langMenu.classList.remove('show');
        }
    }
});

function initFooterModals() {
    const modalsHTML = `
        <div id="faqModal" class="modal">
            <div class="modal-content" style="max-width: 600px; text-align: left;">
                <button class="modal-close" onclick="closeDocModal('faqModal')">&times;</button>
                <h2 style="margin-bottom: 20px;">❓ Tez-tez Verilən Suallar</h2>
                <div class="faq-item" onclick="toggleFAQ(this)">
                    <div class="faq-question">Ödəniş üsulları nələrdir? <span class="faq-icon">+</span></div>
                    <div class="faq-answer"><p>Bank kartı, Apple Pay və Google Pay qəbul olunur.</p></div>
                </div>
                <div class="faq-item" onclick="toggleFAQ(this)">
                    <div class="faq-question">Pulsuz planın müddəti varmı? <span class="faq-icon">+</span></div>
                    <div class="faq-answer"><p>Xeyr, pulsuz plan hər zaman pulsuz olaraq qalır.</p></div>
                </div>
            </div>
        </div>
        <div id="privacyModal" class="modal">
            <div class="modal-content" style="max-width: 600px; text-align: left; max-height: 80vh; overflow-y: auto;">
                <button class="modal-close" onclick="closeDocModal('privacyModal')">&times;</button>
                <h2 style="margin-bottom: 20px;">🔒 Məxfilik Siyasəti</h2>
                <p>Biz istifadəçi məlumatlarının məxfiliyinə hörmətlə yanaşırıq.</p>
                <h3 style="margin-top:20px; font-size: 1.1em;">1. Məlumatların Toplanması</h3>
                <p>Qeydiyyat zamanı yalnız tələb olunan minimum informasiya, adınız və e-mail adresiniz toplanır.</p>
                <h3 style="margin-top:20px; font-size: 1.1em;">2. Məlumatların Paylaşılması</h3>
                <p>Şəxsi məlumatlarınız heç bir halda üçüncü tərəflərə ötürülmür və reklam məqsədilə satılmır.</p>
                <p style="margin-top:20px;">Bu məsələlərlə bağlı əlavə sualınız olarsa, əlaqə hissəsindən bizə yazın.</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    const faqLinks = document.querySelectorAll('a[href="#faq"]');
    faqLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('faqModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const privacyLinks = document.querySelectorAll('a[href="#privacy"]');
    privacyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('privacyModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

function closeDocModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// ===== GEMINI AI API =====
const GEMINI_API_KEY = 'AIzaSyAaJUBEN3np_qtqomBokN5XVCxay6u1Jq8';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const GEMINI_SYSTEM_PROMPT = `Sən Alielenglish platformasının AI köməkçisisən. Azərbaycan tələbələrinə ingilis dili öyrənməkdə kömək edirsən.
Qaydalar:
- Azərbaycanca sualları Azərbaycanca cavabla
- İngilis dili sualları həm ingilis, həm Azərbaycanca izah et
- Qrammatika, söz, tələffüz, ifadə haqqında kömək et
- Cavablar qısa və aydın olsun (max 3-4 cümlə)
- Emoji istifadə edə bilərsən`;

async function callGeminiAPI(userMessage) {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: GEMINI_SYSTEM_PROMPT + '\n\nİstifadəçi sualı: ' + userMessage }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 400
                }
            })
        });

        if (!response.ok) throw new Error('API error: ' + response.status);

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return reply.replace(/\n/g, '<br>');
        throw new Error('No content in response');

    } catch (error) {
        console.warn('Gemini API error:', error.message);
        return getFallbackResponse(userMessage);
    }
}

function getFallbackResponse(question) {
    const q = question.toLowerCase();
    if (q.includes('test') || q.includes('seviyye') || q.includes('səviyyə')) return '🎯 Səviyyə testimizə daxil olaraq dil biliklərinizi yoxlaya bilərsiniz!';
    if (q.includes('qiymət') || q.includes('ödəniş')) return '💳 "Qiymətlər" bölməsində pulsuz və premium paketlərimizlə tanış ola bilərsiniz.';
    if (q.includes('salam') || q.includes('hi') || q.includes('hello')) return '👋 Salam! Hansı İngilis dili mövzusunda kömək edə bilərəm?';
    if (q.includes('söz') || q.includes('word')) return '📚 Günün Sözü bölməmizə baxın — hər gün yeni söz öyrənin!';
    if (q.includes('qrammatika') || q.includes('grammar')) return '📝 Qrammatika sualınızı daha ətraflı yazın, izah edim!';
    return '🤖 Sualınızı aldım! İnternet bağlantısı olmadan işləyirəm. Daha ətraflı sual ver, kömək edim.';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ===== AI Chat Widget =====
function initAIChat() {
    const chatHTML = `
        <div class="ai-chat-widget">
            <button class="ai-chat-toggle" id="aiChatToggle" aria-label="Open AI Chat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12C2 13.89 2.525 15.66 3.438 17.168L2.05 21.95L6.832 20.562C8.34 21.475 10.11 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" fill="white"/>
                    <path d="M8 12H8.01M12 12H12.01M16 12H16.01" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="ai-chat-window hidden" id="aiChatWindow">
                <div class="ai-chat-header">
                    <div class="ai-chat-header-info">
                        <div class="ai-chat-avatar">🤖</div>
                        <div>
                            <h3>AI Köməkçi</h3>
                            <span class="ai-status">● Online</span>
                        </div>
                    </div>
                    <button id="aiChatClose">&times;</button>
                </div>
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message bot">
                        Salam! 👋 Mən Gemini AI-ə əsaslanan ingilis dili köməkçinizəm. Qrammatika, söz, tələffüz haqqında istənilən sualı soruşun!
                    </div>
                </div>
                <div class="ai-chat-input">
                    <input type="text" id="aiChatInput" placeholder="Sualınızı yazın...">
                    <button id="aiChatSend">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    const toggleBtn = document.getElementById('aiChatToggle');
    const closeBtn = document.getElementById('aiChatClose');
    const chatWindow = document.getElementById('aiChatWindow');
    const sendBtn = document.getElementById('aiChatSend');
    const chatInput = document.getElementById('aiChatInput');
    const messages = document.getElementById('aiChatMessages');

    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text || chatInput.disabled) return;

        // Show user message
        messages.insertAdjacentHTML('beforeend',
            `<div class="ai-message user">${escapeHtml(text)}</div>`);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        messages.scrollTop = messages.scrollHeight;

        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        messages.insertAdjacentHTML('beforeend',
            `<div class="ai-message bot ai-typing" id="${typingId}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`);
        messages.scrollTop = messages.scrollHeight;

        // Call Gemini API
        const botResponse = await callGeminiAPI(text);

        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        // Show response
        messages.insertAdjacentHTML('beforeend',
            `<div class="ai-message bot">${botResponse}</div>`);
        messages.scrollTop = messages.scrollHeight;

        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) handleSend();
    });
}