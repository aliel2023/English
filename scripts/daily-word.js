// ===== WORD DATABASE - Expanded 30 words =====
const wordDatabase = [
    {
        word: "ACCOMPLISH",
        pronunciation: "/əˈkʌmplɪʃ/",
        type: "verb",
        level: "A2",
        translation: "Başarmaq, həyata keçirmək, nail olmaq",
        definition: "To succeed in doing or completing something, especially something difficult",
        examples: [
            { en: "She accomplished her goal of learning English in one year.", az: "O, bir il ərzində ingilis dili öyrənmək məqsədinə çatdı." },
            { en: "The team accomplished a lot during the project.", az: "Komanda layihə zamanı çox şey bacardı." }
        ],
        synonyms: ["achieve", "complete", "fulfill", "succeed"]
    },
    {
        word: "CHALLENGE",
        pronunciation: "/ˈtʃælɪndʒ/",
        type: "noun/verb",
        level: "A2",
        translation: "Çətinlik, sınaq; meydan oxumaq",
        definition: "Something new and difficult that requires great effort and determination",
        examples: [
            { en: "Learning a new language is a big challenge.", az: "Yeni dil öyrənmək böyük bir sınaqdır." },
            { en: "She challenged herself to run every day.", az: "O, özünə hər gün qaçmaq çağırışını qoydu." }
        ],
        synonyms: ["difficulty", "problem", "obstacle", "test"]
    },
    {
        word: "OPPORTUNITY",
        pronunciation: "/ˌɒpəˈtjuːnəti/",
        type: "noun",
        level: "B1",
        translation: "Fürsət, imkan",
        definition: "A time or situation that makes it possible to do something that you want to do",
        examples: [
            { en: "This job offers great opportunities for growth.", az: "Bu iş inkişaf üçün əla fürsətlər təklif edir." },
            { en: "Don't miss this opportunity to learn English.", az: "İngilis dili öyrənmək fürsətini əldən verməyin." }
        ],
        synonyms: ["chance", "possibility", "occasion", "opening"]
    },
    {
        word: "PERSEVERANCE",
        pronunciation: "/ˌpɜːsɪˈvɪərəns/",
        type: "noun",
        level: "B2",
        translation: "Əzmkarlıq, inadkarlıq, tab gətirmə",
        definition: "Continued effort to do something despite difficulty, failure, or opposition",
        examples: [
            { en: "Her perseverance helped her pass the exam.", az: "Onun əzmkarlığı imtahanı keçməsinə kömək etdi." },
            { en: "Success requires perseverance and hard work.", az: "Uğur əzmkarlıq və çətin iş tələb edir." }
        ],
        synonyms: ["determination", "persistence", "tenacity", "endurance"]
    },
    {
        word: "ELOQUENT",
        pronunciation: "/ˈeləkwənt/",
        type: "adjective",
        level: "C1",
        translation: "Natiq, ifadəli danışan, yaxşı nitq verən",
        definition: "Well-spoken and able to express ideas or feelings clearly and effectively",
        examples: [
            { en: "She gave an eloquent speech at the conference.", az: "O, konfransda natiqanə bir nitq söylədi." },
            { en: "His eloquent writing impressed everyone.", az: "Onun natiqanə yazısı hamını heyran etdi." }
        ],
        synonyms: ["articulate", "fluent", "expressive", "persuasive"]
    },
    {
        word: "AMBIGUOUS",
        pronunciation: "/æmˈbɪɡjuəs/",
        type: "adjective",
        level: "B2",
        translation: "Qeyri-müəyyən, iki mənalı, aydın olmayan",
        definition: "Open to more than one interpretation; not having one obvious meaning",
        examples: [
            { en: "The instructions were ambiguous and confusing.", az: "Təlimatlar qeyri-müəyyən və çaşdırıcı idi." },
            { en: "His answer was deliberately ambiguous.", az: "Onun cavabı qəsdən qeyri-müəyyən idi." }
        ],
        synonyms: ["unclear", "vague", "equivocal", "uncertain"]
    },
    {
        word: "RESILIENT",
        pronunciation: "/rɪˈzɪliənt/",
        type: "adjective",
        level: "B2",
        translation: "Dayanıqlı, çevik, bərkimiş",
        definition: "Able to recover quickly from difficult conditions or setbacks",
        examples: [
            { en: "Children are remarkably resilient.", az: "Uşaqlar müstəsna dərəcədə dayanıqlıdırlar." },
            { en: "She proved to be resilient in the face of adversity.", az: "O, çətinliklərlə üz-üzə dayanıqlı olduğunu sübut etdi." }
        ],
        synonyms: ["tough", "adaptable", "strong", "flexible"]
    },
    {
        word: "ELOQUENCE",
        pronunciation: "/ˈeləkwəns/",
        type: "noun",
        level: "C1",
        translation: "Natiqlik, gözəl, inandırıcı nitq",
        definition: "The practice or art of using language with fluency and aptness",
        examples: [
            { en: "The president spoke with great eloquence.", az: "Prezident böyük natiqlik ilə danışdı." }
        ],
        synonyms: ["fluency", "articulacy", "expression", "rhetoric"]
    },
    {
        word: "ENDEAVOUR",
        pronunciation: "/ɪnˈdevər/",
        type: "noun/verb",
        level: "B2",
        translation: "Cəhd etmək, səy göstərmək",
        definition: "To try hard to do or achieve something; an earnest attempt",
        examples: [
            { en: "We endeavour to provide the best service possible.", az: "Biz mümkün olan ən yaxşı xidməti təqdim etməyə çalışırıq." }
        ],
        synonyms: ["attempt", "try", "strive", "effort"]
    },
    {
        word: "PROFOUND",
        pronunciation: "/prəˈfaʊnd/",
        type: "adjective",
        level: "B2",
        translation: "Dərin, dərindən hiss olunan, mühüm",
        definition: "Having or showing great knowledge or insight; very great or intense",
        examples: [
            { en: "The book had a profound effect on me.", az: "Kitab məndə dərin bir təsir buraxdı." },
            { en: "She has a profound understanding of the subject.", az: "Mövzunu dərin biliklərlə mənimsəyir." }
        ],
        synonyms: ["deep", "intense", "thoughtful", "significant"]
    },
    {
        word: "DILIGENT",
        pronunciation: "/ˈdɪlɪdʒənt/",
        type: "adjective",
        level: "B1",
        translation: "Çalışqan, zəhmətkeş, müntəzəm",
        definition: "Having or showing care and conscientiousness in one's work or duties",
        examples: [
            { en: "She is a diligent student who never misses class.", az: "O, heç vaxt dərsi buraxmayan çalışqan bir tələbədir." }
        ],
        synonyms: ["hardworking", "dedicated", "industrious", "thorough"]
    },
    {
        word: "ENTHUSIASM",
        pronunciation: "/ɪnˈθjuːziæzəm/",
        type: "noun",
        level: "B1",
        translation: "Həvəs, coşqu, maraq",
        definition: "Intense and eager enjoyment, interest, or approval",
        examples: [
            { en: "She approached every task with great enthusiasm.", az: "O, hər tapşırığa böyük həvəslə yanaşdı." }
        ],
        synonyms: ["eagerness", "passion", "excitement", "zeal"]
    },
    {
        word: "COLLABORATE",
        pronunciation: "/kəˈlæbəreɪt/",
        type: "verb",
        level: "B1",
        translation: "Əməkdaşlıq etmək, birgə işləmək",
        definition: "To work jointly on an activity or project; cooperate",
        examples: [
            { en: "The two companies collaborated on the project.", az: "İki şirkət layihədə əməkdaşlıq etdi." }
        ],
        synonyms: ["cooperate", "work together", "partner", "team up"]
    },
    {
        word: "INNOVATIVE",
        pronunciation: "/ˈɪnəveɪtɪv/",
        type: "adjective",
        level: "B2",
        translation: "Yenilikçi, novator, müasir",
        definition: "Featuring new methods; advanced and original",
        examples: [
            { en: "The company is known for its innovative products.", az: "Şirkət yenilikçi məhsulları ilə tanınır." }
        ],
        synonyms: ["creative", "original", "inventive", "pioneering"]
    },
    {
        word: "ARTICULATE",
        pronunciation: "/ɑːˈtɪkjʊleɪt/",
        type: "adjective/verb",
        level: "B2",
        translation: "Fikirlərini aydın ifadə edən; aydın danışmaq",
        definition: "Having or showing the ability to speak fluently and coherently",
        examples: [
            { en: "She is very articulate and persuasive.", az: "O, çox aydın danışan və inandırıcıdır." }
        ],
        synonyms: ["eloquent", "clear", "fluent", "expressive"]
    },
    {
        word: "TENACIOUS",
        pronunciation: "/tɪˈneɪʃəs/",
        type: "adjective",
        level: "C1",
        translation: "Inamlı, möhkəm dayanan, inadkar",
        definition: "Tending to keep a firm hold of something; persistent; not easily discouraged",
        examples: [
            { en: "He is a tenacious negotiator.", az: "O, inadkar bir danışıqçıdır." }
        ],
        synonyms: ["persistent", "determined", "stubborn", "resolute"]
    },
    {
        word: "EMPATHY",
        pronunciation: "/ˈempəθi/",
        type: "noun",
        level: "B2",
        translation: "Empatiya, başqasının hislərini anlamaq",
        definition: "The ability to understand and share the feelings of another person",
        examples: [
            { en: "Good teachers show empathy towards their students.", az: "Yaxşı müəllimlər şagirdlərinə empatiya göstərir." }
        ],
        synonyms: ["compassion", "understanding", "sympathy", "sensitivity"]
    },
    {
        word: "INEVITABLE",
        pronunciation: "/ɪnˈevɪtəbl/",
        type: "adjective",
        level: "B2",
        translation: "Qaçılmaz, mütləq baş verəcək",
        definition: "Certain to happen; unavoidable",
        examples: [
            { en: "Change is inevitable in life.", az: "Həyatda dəyişiklik qaçılmazdır." }
        ],
        synonyms: ["unavoidable", "certain", "inescapable", "imminent"]
    },
    {
        word: "METICULOUS",
        pronunciation: "/mɪˈtɪkjʊləs/",
        type: "adjective",
        level: "C1",
        translation: "Ən kiçik ətraflara diqqət edən, dəqiq",
        definition: "Showing great attention to detail or being very careful and precise",
        examples: [
            { en: "She is meticulous about her work.", az: "O, işinə çox diqqətlidir." }
        ],
        synonyms: ["precise", "careful", "thorough", "attentive"]
    },
    {
        word: "VERSATILE",
        pronunciation: "/ˈvɜːsətaɪl/",
        type: "adjective",
        level: "B2",
        translation: "Çoxfunksiyalı, universal, çevik",
        definition: "Able to adapt or be adapted to many different functions or activities",
        examples: [
            { en: "She is a versatile musician who plays many instruments.", az: "O, bir çox musiqi aləti çalan universal bir musiqiçidir." }
        ],
        synonyms: ["adaptable", "flexible", "multitalented", "resourceful"]
    },
    {
        word: "BENEVOLENT",
        pronunciation: "/bɪˈnevələnt/",
        type: "adjective",
        level: "C1",
        translation: "Xeyirxah, xoşniyyətli, əliaçıq",
        definition: "Well-meaning and kindly; showing goodwill towards others",
        examples: [
            { en: "The benevolent leader helped many poor families.", az: "Xeyirxah lider bir çox kasıb ailəyə kömək etdi." }
        ],
        synonyms: ["kind", "generous", "charitable", "good-hearted"]
    },
    {
        word: "IMPECCABLE",
        pronunciation: "/ɪmˈpekəbl/",
        type: "adjective",
        level: "C1",
        translation: "Qüsursuz, mükəmməl",
        definition: "In accordance with the highest standards; faultless",
        examples: [
            { en: "His English pronunciation is impeccable.", az: "Onun ingilis dili tələffüzü qüsursuzdur." }
        ],
        synonyms: ["perfect", "flawless", "faultless", "immaculate"]
    },
    {
        word: "DILEMMA",
        pronunciation: "/dɪˈlemə/",
        type: "noun",
        level: "B1",
        translation: "İkiləm, çıxılmaz vəziyyət",
        definition: "A situation requiring a choice between two equally undesirable alternatives",
        examples: [
            { en: "She faced a difficult dilemma about her career.", az: "O, karyerasına dair çətin bir ikiləmlə üzləşdi." }
        ],
        synonyms: ["predicament", "quandary", "difficulty", "problem"]
    },
    {
        word: "ACQUIRE",
        pronunciation: "/əˈkwaɪər/",
        type: "verb",
        level: "B1",
        translation: "Əldə etmək, qazanmaq, öyrənmək",
        definition: "To obtain or come to have something; to learn or develop a skill or habit",
        examples: [
            { en: "She acquired fluency in English through practice.", az: "O, məşq etməklə ingiliscəni axıcı öyrəndi." }
        ],
        synonyms: ["obtain", "gain", "develop", "learn"]
    },
    {
        word: "DISTINGUISH",
        pronunciation: "/dɪˈstɪŋɡwɪʃ/",
        type: "verb",
        level: "B1",
        translation: "Fərqləndirmək, ayırd etmək",
        definition: "To recognize or treat as different; to be the distinguishing feature of",
        examples: [
            { en: "Can you distinguish British from American English?", az: "Britaniya ilə Amerikan ingiliscəsini fərqləndirə bilirsiniz?" }
        ],
        synonyms: ["differentiate", "tell apart", "discern", "separate"]
    },
    {
        word: "FLOURISH",
        pronunciation: "/ˈflʌrɪʃ/",
        type: "verb",
        level: "B2",
        translation: "Çiçəklənmək, inkişaf etmək, rövnəqlənmək",
        definition: "To grow or develop in a healthy and vigorous way; to be very successful",
        examples: [
            { en: "Her business flourished after the new strategy.", az: "Yeni strategiyadan sonra onun işi çiçəkləndi." }
        ],
        synonyms: ["thrive", "prosper", "grow", "bloom"]
    },
    {
        word: "IMPLICIT",
        pronunciation: "/ɪmˈplɪsɪt/",
        type: "adjective",
        level: "C1",
        translation: "Gizli, deyilmədən başa düşülən",
        definition: "Suggested though not directly expressed; complete and unquestioning",
        examples: [
            { en: "There was an implicit agreement between them.", az: "Onlar arasında gizli bir razılaşma var idi." }
        ],
        synonyms: ["implied", "unstated", "unspoken", "absolute"]
    },
    {
        word: "SUBSTANTIAL",
        pronunciation: "/səbˈstænʃəl/",
        type: "adjective",
        level: "B2",
        translation: "Əhəmiyyətli, ciddi miqdarda, tutarlı",
        definition: "Of considerable importance, size, or worth",
        examples: [
            { en: "She made a substantial improvement in her English.", az: "O, ingiliscəsini əhəmiyyətli dərəcədə inkişaf etdirdi." }
        ],
        synonyms: ["significant", "considerable", "large", "important"]
    },
    {
        word: "COHERENT",
        pronunciation: "/kəʊˈhɪərənt/",
        type: "adjective",
        level: "B2",
        translation: "Ardıcıl, məntiqi, ahəngdar",
        definition: "Logical and consistent; (of a person) able to speak clearly and logically",
        examples: [
            { en: "Her essay was well-structured and coherent.", az: "Onun ese yaxşı qurulmuş və ardıcıl idi." }
        ],
        synonyms: ["logical", "consistent", "clear", "structured"]
    },
    {
        word: "ADJACENT",
        pronunciation: "/əˈdʒeɪsənt/",
        type: "adjective",
        level: "B1",
        translation: "Yanındakı, qonşu, bitişik",
        definition: "Next to or adjoining something else; close to something",
        examples: [
            { en: "The school is adjacent to the park.", az: "Məktəb parkın yanındadır." }
        ],
        synonyms: ["neighboring", "next to", "nearby", "adjoining"]
    }
];

// ===== TODAY'S WORD =====
function getTodayWord() {
    const todayStr = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
        hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return wordDatabase[Math.abs(hash) % wordDatabase.length];
}

// Store today's word globally
let todayWord = null;

// ===== INITIALIZE PAGE =====
document.addEventListener('DOMContentLoaded', function () {
    todayWord = getTodayWord();

    // Set today's date
    const today = new Date();
    const dateEl = document.getElementById('dailyDate');
    if (dateEl) {
        const lang = localStorage.getItem('selectedLanguage') || 'az';
        dateEl.textContent = today.toLocaleDateString(lang === 'az' ? 'az-AZ' : 'en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    loadWordOfDay();
    loadStatistics();
    loadArchive();
    updateStreak();
});

// Sync data when auth resolves
document.addEventListener('alielAuthReady', function () {
    updateFavoriteButton();
    loadStatistics();
});

// ===== LOAD WORD OF DAY =====
function loadWordOfDay() {
    document.getElementById('wordLevel').textContent = `${todayWord.level} LEVEL`;
    document.getElementById('wordTitle').textContent = todayWord.word;
    document.getElementById('wordPronunciation').textContent = todayWord.pronunciation;
    document.getElementById('wordType').textContent = todayWord.type;
    document.getElementById('wordTranslation').textContent = todayWord.translation;
    document.getElementById('wordDefinition').textContent = todayWord.definition;

    // Examples
    const ex1 = todayWord.examples[0];
    document.getElementById('example1En').textContent = `"${ex1.en}"`;
    document.getElementById('example1Az').textContent = ex1.az;

    if (todayWord.examples[1]) {
        document.getElementById('example2En').textContent = `"${todayWord.examples[1].en}"`;
        document.getElementById('example2Az').textContent = todayWord.examples[1].az;
    } else {
        const ex2Container = document.getElementById('example2En');
        if (ex2Container && ex2Container.closest('.example-item')) {
            ex2Container.closest('.example-item').style.display = 'none';
        }
    }

    // Synonyms
    const synonymTags = todayWord.synonyms.map(syn => `<span class="tag">${syn}</span>`).join('');
    const synContainer = document.querySelector('.synonym-tags');
    if (synContainer) synContainer.innerHTML = synonymTags;

    // Mark as seen (for auth user and localStorage)
    markWordAsSeen(todayWord.word);

    // Update favorite button state
    updateFavoriteButton();
}

// ===== UPDATE FAVORITE BUTTON =====
function updateFavoriteButton() {
    const favBtn = document.querySelector('[onclick="addWordToFavBtn()"]');
    if (!favBtn) return;

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const alreadyFav = user && user.favorites && user.favorites.words &&
        user.favorites.words.some(w => (typeof w === 'object' ? w.word : w) === todayWord.word);

    if (alreadyFav) {
        favBtn.innerHTML = '❤️ Sevimlilərdir';
        favBtn.style.opacity = '0.7';
        favBtn.disabled = true;
    }
}

// ===== PLAY AUDIO (FIXED - uses today's word) =====
function playAudio(e) {
    const wordToSpeak = todayWord ? todayWord.word : document.getElementById('wordTitle').textContent;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);

        const btn = (e && e.target) ? e.target.closest('button') : null;
        if (btn) {
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => btn.style.transform = 'scale(1)', 300);
        }
    } else {
        alert('Bu cihaz səs oxutmanı dəstəkləmir. Lütfən Chrome/Edge istifadə edin.');
    }
}

// ===== ADD TO FAVORITES BUTTON HANDLER =====
// Bu funksiya HTML-dəki onclick="addWordToFavBtn()" ilə çağırılır.
// auth.js-in window.addToFavorites ilə ad təsadüfü etməsin deyə fərqli ad verildi.
function addWordToFavBtn() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    if (!user) {
        window.location.href = 'login.html?next=daily-word.html';
        return;
    }

    const wordData = {
        word: todayWord.word,
        pronunciation: todayWord.pronunciation,
        type: todayWord.type,
        level: todayWord.level,
        translation: todayWord.translation,
        definition: todayWord.definition,
        examples: todayWord.examples,
        synonyms: todayWord.synonyms,
        savedAt: new Date().toISOString()
    };

    // auth.js-dən window.addToFavorites-i çağır (Firestore-a yazacaq)
    if (typeof window.addToFavorites === 'function') {
        window.addToFavorites(wordData, 'words').then(added => {
            if (added !== false) {
                const btn = document.querySelector('[onclick="addWordToFavBtn()"]');
                if (btn) {
                    btn.innerHTML = '❤️ Sevimlilərdir';
                    btn.style.opacity = '0.7';
                    btn.disabled = true;
                }
                if (typeof showToast === 'function') {
                    showToast('✅ Söz sevimlilərə əlavə edildi!', 'success');
                } else {
                    alert('✅ Söz sevimlilərə əlavə edildi!');
                }
            }
        }).catch(() => {
            alert('⚠️ Sevimlilərə əlavə edilmədi. Yenidən cəhd edin.');
        });
    } else {
        _addToLocalFavorites();
    }
}

function _addToLocalFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favoriteWords') || '[]');
    if (favorites.find(f => (typeof f === 'object' ? f.word : f) === todayWord.word)) {
        alert('❤️ Bu söz artıq sevimlilərinizdədir!');
        return;
    }
    const wordData = {
        word: todayWord.word, level: todayWord.level,
        translation: todayWord.translation, savedAt: new Date().toISOString()
    };
    favorites.push(wordData);
    localStorage.setItem('favoriteWords', JSON.stringify(favorites));
    alert('✅ Söz sevimlilərə əlavə edildi!');
    const countEl = document.getElementById('favoriteCount');
    if (countEl) countEl.textContent = favorites.length;
}

// ===== SHARE WORD (FIXED - uses today's word) =====
function shareWord() {
    const shareText = `📚 Günün Sözü: ${todayWord.word}\n\n✅ ${todayWord.translation}\n\n💬 "${todayWord.examples[0].en}"\n\n🔗 Alielenglish ilə öyrən!`;

    if (navigator.share) {
        navigator.share({ title: 'Günün Sözü - Alielenglish', text: shareText, url: window.location.href });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('📋 Mətn kopyalandı!', 'success');
        }).catch(() => {
            alert(shareText);
        });
    }
}

// ===== LOAD STATISTICS =====
function loadStatistics() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    let seenWords, streak, favorites;

    if (user) {
        seenWords = (user.seenWords || []).length;
        streak = user.currentStreak || 0;
        favorites = (user.favoriteWords || []).length;
    } else {
        seenWords = JSON.parse(localStorage.getItem('seenWords') || '[]').length;
        streak = parseInt(localStorage.getItem('currentStreak') || '0');
        favorites = JSON.parse(localStorage.getItem('favoriteWords') || '[]').length;
    }

    animateCounter(document.getElementById('totalWordsLearned'), seenWords);
    animateCounter(document.getElementById('currentStreak'), streak);
    animateCounter(document.getElementById('favoriteCount'), favorites);
}

// ===== ANIMATE COUNTER =====
function animateCounter(element, target) {
    if (!element || target === 0) {
        if (element) element.textContent = '0';
        return;
    }

    let current = 0;
    const increment = Math.max(1, target / 30);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// ===== MARK WORD AS SEEN (localStorage fallback) =====
function markWordAsSeen(word) {
    const seenWords = JSON.parse(localStorage.getItem('seenWords') || '[]');
    if (!seenWords.includes(word)) {
        seenWords.push(word);
        localStorage.setItem('seenWords', JSON.stringify(seenWords));
    }
}

// ===== UPDATE STREAK =====
function updateStreak() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user) return; // Auth system handles streak for logged-in users

    const lastVisit = localStorage.getItem('lastDailyWordVisit');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let streak = parseInt(localStorage.getItem('currentStreak') || '0');
        streak = (lastVisit === yesterday) ? streak + 1 : 1;
        localStorage.setItem('currentStreak', streak.toString());
        localStorage.setItem('lastDailyWordVisit', today);
    }
}

// ===== LOAD ARCHIVE =====
let displayedArchiveCount = 0;
const archivePerPage = 6;

function loadArchive() {
    const archiveGrid = document.getElementById('archiveGrid');
    if (!archiveGrid) return;

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const userFavs = user ? (user.favoriteWords || []).map(f => typeof f === 'object' ? f.word : f) :
        JSON.parse(localStorage.getItem('favoriteWords') || '[]');

    const archiveWords = wordDatabase.filter(w => w.word !== todayWord.word);

    for (let i = displayedArchiveCount; i < Math.min(displayedArchiveCount + archivePerPage, archiveWords.length); i++) {
        const word = archiveWords[i];
        const isFav = userFavs.includes(word.word);

        const card = document.createElement('div');
        card.className = 'archive-card';
        card.dataset.level = word.level;
        card.dataset.favorite = isFav;
        card.onclick = () => viewArchivedWord(word);

        card.innerHTML = `
            <span class="word-badge">${word.level}</span>
            <h3>${word.word}</h3>
            <p class="pronunciation">${word.pronunciation}</p>
            <p class="translation">${word.translation}</p>
            ${isFav ? '<span style="color:var(--primary);font-size:0.8rem;">❤️ Sevimlilərdə</span>' : ''}
        `;

        archiveGrid.appendChild(card);
    }

    displayedArchiveCount += archivePerPage;

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn && displayedArchiveCount >= archiveWords.length) {
        loadMoreBtn.style.display = 'none';
    }
}

function loadMoreArchive() { loadArchive(); }

function filterArchive(filter, e) {
    const cards = document.querySelectorAll('.archive-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');

    cards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else if (filter === 'favorites') {
            card.style.display = card.dataset.favorite === 'true' ? 'block' : 'none';
        } else {
            card.style.display = card.dataset.level === filter ? 'block' : 'none';
        }
    });
}

function viewArchivedWord(word) {
    // Create a mini modal to show archived word
    const existing = document.getElementById('archiveWordModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'archiveWordModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;text-align:left;">
            <button class="modal-close" onclick="this.closest('.modal').remove();document.body.style.overflow='';">×</button>
            <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem;">
                <span class="word-badge" style="background:rgba(230,57,70,0.15);color:var(--primary);border:1px solid rgba(230,57,70,0.3);padding:0.3rem 0.8rem;border-radius:50px;">${word.level}</span>
                <span style="background:var(--bg-dark);border:1px solid var(--border);color:var(--text-muted);padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;">${word.type}</span>
            </div>
            <h2 style="font-size:2rem;letter-spacing:2px;margin-bottom:0.25rem;">${word.word}</h2>
            <p style="color:var(--primary);font-style:italic;margin-bottom:1.5rem;">${word.pronunciation}</p>
            <div style="background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:1rem;">
                <h4 style="color:var(--primary);margin-bottom:0.5rem;">🌐 Tərcümə</h4>
                <p style="color:var(--text-secondary);">${word.translation}</p>
            </div>
            <div style="background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:1rem;">
                <h4 style="color:var(--primary);margin-bottom:0.5rem;">💬 Nümunə</h4>
                <p style="color:var(--text-primary);font-style:italic;">"${word.examples[0].en}"</p>
                <p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.3rem;">${word.examples[0].az}</p>
            </div>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick='speakWord("${word.word}")'>🔊 Dinlə</button>
                <button class="btn btn-secondary" onclick='addArchiveWordToFav(${JSON.stringify(word).replace(/'/g, "&#39;")})'>❤️ Sevimlilərə</button>
            </div>
        </div>
    `;

    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } });
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function speakWord(word) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US'; u.rate = 0.85;
        window.speechSynthesis.speak(u);
    }
}

function addArchiveWordToFav(wordObj) {
    if (typeof addToFavorites === 'function') {
        addToFavorites({ ...wordObj, savedAt: new Date().toISOString() }, 'words');
    }
}

// ===== Global showToast bridge =====
// daily-word.js non-module scopeda olduğu üçün DS.toast-a bridge lazımdır
if (typeof showToast === 'undefined') {
    window.showToast = function (msg, type) {
        if (window.DS && typeof window.DS.toast === 'function') {
            window.DS.toast({ msg: msg, type: type || 'info', duration: 3500 });
        } else {
            // fallback
            const t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1c2333;color:#fff;padding:.75rem 1.5rem;border-radius:8px;z-index:9999;font-size:.9rem;box-shadow:0 4px 20px rgba(0,0,0,.4)';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
        }
    };
}