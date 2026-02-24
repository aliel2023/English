// ===== MAIN.JS - CORE FUNCTIONS =====

// ===== Mobile Menu Toggle (Sidebar style) =====
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const isOpen = navMenu && navMenu.classList.contains('active');

    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (navMenu) navMenu.classList.add('active');
    if (mobileToggle) mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden'; // lock scroll
}

function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (navMenu) navMenu.classList.remove('active');
    if (mobileToggle) mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
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
        if (e.key === 'Escape') {
            // Close mobile menu
            closeMobileMenu();
            // Close email modal
            closeEmailModal();
            // Close all other modals
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// ===== Close Mobile Menu on Outside Click + Swipe =====
function initMobileMenuClose() {
    // Backdrop tap to close
    document.addEventListener('click', function (e) {
        const navMenu = document.getElementById('navMenu');
        const toggle = document.querySelector('.mobile-toggle');

        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && toggle && !toggle.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });

    // Close menu links on click (mobile navigation)
    document.addEventListener('click', function (e) {
        const link = e.target.closest('.nav-menu a');
        if (link) {
            const navMenu = document.getElementById('navMenu');
            if (navMenu && navMenu.classList.contains('active')) {
                // Let the link navigate, then close
                setTimeout(closeMobileMenu, 150);
            }
        }
    });

    // Touch swipe-left to close menu
    let touchStartX = 0;
    document.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        const navMenu = document.getElementById('navMenu');
        if (diff > 60 && navMenu && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }, { passive: true });
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

// ===== GEMINI AI API — Enhanced =====
const GEMINI_API_KEY = 'AIzaSyAaJUBEN3np_qtqomBokN5XVCxay6u1Jq8';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Get current page context to make AI answers contextual
function getPageContext() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const title = document.title || '';
    const pageMap = {
        'index.html': 'Ana Səhifə — ingilis dili öyrənmə platforması haqqında',
        'daily-word.html': 'Günün Sözü — gündəlik ingilis sözləri öyrənmə',
        'test.html': 'Seviyyə Testi — A1-C2 ingilis dili səviyyə testi',
        'speaking.html': 'Danışıq Praktikası — tələffüz və danışıq bacarıqları',
        'resources.html': 'Resurslar — PDF, kitablar, materiallar',
        'favorites.html': 'Sevimlilər — saxlanılmış sözlər və ifadələr',
        'dashboard.html': 'Dashboard — şəxsi irəliləyiş paneli',
        'pricing.html': 'Qiymətlər — pulsuz və premium planlar',
        'contact.html': 'Əlaqə — bizimlə əlaqə',
    };
    return pageMap[page] || `"${title}" səhifəsi`;
}

function getSystemPrompt() {
    const ctx = getPageContext();
    return `Sən Alielenglish platformasının AI köməkçisisən. Hazırda istifadəçi "${ctx}" üzərindədir.

ƏSAS QAYDALAR:
1. Azərbaycanca sualları Azərbaycanca cavabla
2. İngilis dili suallarını həm ingilis, həm Azərbaycanca izah et
3. Cari səhifə ilə əlaqəli suallar gəldikdə ƏTRAFLICAVAB ver
4. Cavabları qısa, aydın saxla (max 4-5 cümlə)
5. Qiymət, ödəniş, texniki problemlər haqqında suallar gəldikdə: "Daha ətraflı kömək üçün [Əlaqə](contact.html) bölməmizə müraciət edin və ya adminlə birbaşa əlaqə qurun" de
6. Spesifik hesab problemlərini həll edə bilmirsənsə: kontakta yönləndir
7. Emoji istifadə et amma həddindən artıq deyil

CAVAB FORMATI: Sadə, oxunaqlı mətn. Markdown istifadə edə bilərsən.`;
}

// Conversation history for context
const chatHistory = [];

async function callGeminiAPI(userMessage) {
    chatHistory.push({ role: 'user', text: userMessage });

    try {
        // Build contents array with history (last 6 messages for context)
        const recent = chatHistory.slice(-6);
        const contents = recent.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.role === 'user' ? m.text : m.text }]
        }));

        // Add system context to first message
        if (contents.length > 0) {
            contents[0].parts[0].text = getSystemPrompt() + '\n\n' + contents[0].parts[0].text;
        }

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    topP: 0.9
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            })
        });

        if (!response.ok) throw new Error(`API ${response.status}`);

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) throw new Error('Empty response');

        // Convert markdown links [text](url) to clickable
        const formatted = reply
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#6c63ff">$1</a>');

        chatHistory.push({ role: 'model', text: reply });
        return formatted;

    } catch (error) {
        console.warn('Gemini API error:', error.message);
        chatHistory.pop(); // remove failed user message
        return getFallbackResponse(userMessage);
    }
}

function getFallbackResponse(q) {
    const ql = q.toLowerCase();
    if (/salam|hi\b|hello|xoş/.test(ql)) return '👋 Salam! İngilis dili ilə bağlı sualınızı soruşun.';
    if (/test|seviyy|səviyy/.test(ql)) return '🎯 Səviyyə testini <a href="test.html" style="color:#6c63ff">buradan</a> edə bilərsiniz!';
    if (/qiymət|pul|ödəni|premium/.test(ql)) return '💳 Qiymət planları üçün <a href="pricing.html" style="color:#6c63ff">Qiymətlər</a> səhifəsinə baxın.';
    if (/əlaqə|contact|problem|kömək/.test(ql)) return '📬 Kömək üçün <a href="contact.html" style="color:#6c63ff">Əlaqə</a> səhifəmizə müraciət edin.';
    if (/söz|word|lüğət/.test(ql)) return '📚 <a href="daily-word.html" style="color:#6c63ff">Günün Sözü</a> bölməmizə baxın!';
    if (/qrammatika|grammar/.test(ql)) return '📝 Qrammatika sualınızı ətraflı yazın, kömək edim!';
    if (/danışıq|speaking|tələffüz/.test(ql)) return '🎤 <a href="speaking.html" style="color:#6c63ff">Danışıq Praktikası</a> bölməmizə daxil olun!';
    if (/resurs|material|pdf|kitab/.test(ql)) return '📖 <a href="resources.html" style="color:#6c63ff">Resurslar</a> bölməsindən materialları yükləyin.';
    return '🤖 Sualınızı aldım. Daha ətraflı məlumat üçün <a href="contact.html" style="color:#6c63ff">adminlə əlaqə</a> qurun.';
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