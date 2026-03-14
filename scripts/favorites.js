// ===== FAVORITES PAGE =====
// Firebase alielAuthReady-ə əsaslanır — localStorage YOX
let favInited = false;
let currentFavUid = undefined;

function initFavorites(event) {
    const user = event && event.detail ? event.detail.user : (typeof getCurrentUser === 'function' ? getCurrentUser() : undefined);

    if (user === undefined) return; // auth state unknown

    const newUid = user ? user.uid : null;
    if (favInited && currentFavUid === newUid) return;

    favInited = true;
    currentFavUid = newUid;

    const favContent = document.getElementById('favContent');
    const favAuth = document.getElementById('favAuthRequired');

    if (!user) {
        if (favContent) favContent.classList.add('hidden');
        if (favAuth) favAuth.classList.remove('hidden');
        return;
    }

    if (favContent) favContent.classList.remove('hidden');
    if (favAuth) favAuth.classList.add('hidden');

    renderFavorites(user);
    updateFavStats(user);
}

// Firebase event-ini dinlə
document.addEventListener('alielAuthReady', initFavorites);

// Race condition fallback: əgər auth.js artıq işləyibsə və event keçirilib
// bir neçə dəfə yoxla
let _favCheckCount = 0;
function _checkAuthForFavs() {
    if (favInited && currentFavUid !== undefined) return;
    _favCheckCount++;
    if (_favCheckCount > 20) return; // max 2 saniyə

    if (typeof getCurrentUser === 'function') {
        const user = getCurrentUser();
        if (user !== undefined) { // undefined = hələ yüklənmir, null = giriş yoxdur
            initFavorites({ detail: { user: user } });
            return;
        }
    }
    setTimeout(_checkAuthForFavs, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    // 300ms sonra yenə yoxla - auth.js module yüklənməsi üçün vaxt ver
    setTimeout(_checkAuthForFavs, 300);
});

let currentFavTab = 'words';
let allFavWords = [];
let allFavGrammars = [];
let allFavPhrases = [];

function renderFavorites(user) {
    // Firestore favorites sahəsi: favorites.words, favorites.grammar, favorites.phrases
    const favObj = user.favorites || {};
    allFavWords = favObj.words || user.favoriteWords || [];
    allFavGrammars = favObj.grammar || user.favoriteGrammars || [];
    allFavPhrases = favObj.phrases || user.favoritePhrases || [];

    const wordCountEl = document.getElementById('wordCount');
    const grammarCountEl = document.getElementById('grammarCount');
    const phraseCountEl = document.getElementById('phraseCount');
    if (wordCountEl) wordCountEl.textContent = allFavWords.length;
    if (grammarCountEl) grammarCountEl.textContent = allFavGrammars.length;
    if (phraseCountEl) phraseCountEl.textContent = allFavPhrases.length;

    renderWords(allFavWords);
    renderGrammars(allFavGrammars);
    renderPhrases(allFavPhrases);
}

function updateFavStats(user) {
    const stats = document.getElementById('favStats');
    if (!stats) return;
    const favObj = user.favorites || {};
    const words = (favObj.words || user.favoriteWords || []).length;
    const grammars = (favObj.grammar || user.favoriteGrammars || []).length;
    const phrases = (favObj.phrases || user.favoritePhrases || []).length;
    const seen = (user.seenWords || []).length;

    // XSS-safe: use textContent via DOM creation
    stats.innerHTML = '';
    [
        [words, 'Söz'],
        [grammars, 'Qrammatika'],
        [phrases, 'İfadə'],
        [seen, 'Görünmüş Söz']
    ].forEach(([num, label]) => {
        const div = document.createElement('div');
        div.className = 'fav-stat';
        const span1 = document.createElement('span');
        span1.className = 'fav-stat-num';
        span1.textContent = num;
        const span2 = document.createElement('span');
        span2.textContent = label;
        div.appendChild(span1);
        div.appendChild(span2);
        stats.appendChild(div);
    });
}

function renderWords(words) {
    const grid = document.getElementById('wordsGrid');
    const empty = document.getElementById('wordsEmpty');
    grid.innerHTML = '';

    if (words.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    words.forEach((item, idx) => {
        const word = typeof item === 'object' ? item : { word: item };
        const card = document.createElement('div');
        card.className = 'fav-card fav-word-card';
        card.dataset.search = (word.word || '').toLowerCase();
        card.innerHTML = `
            <div class="fav-card-header">
                <span class="word-level-badge">${word.level || '?'}</span>
                <button class="fav-remove-btn" onclick='removeWordFav("${word.word || item}")' title="Sil">🗑️</button>
            </div>
            <h3 class="fav-word-title">${word.word || item}</h3>
            ${word.pronunciation ? `<p class="fav-pronunciation">${word.pronunciation}</p>` : ''}
            ${word.translation ? `<p class="fav-translation">${word.translation}</p>` : ''}
            ${word.type ? `<span class="fav-type-badge">${word.type}</span>` : ''}
            <div class="fav-actions">
                <button class="fav-action-btn" onclick='playWordAudio("${word.word || item}")'>🔊 Dinlə</button>
                <button class="fav-action-btn" onclick='openWordDetail(${idx})'>📖 Detallar</button>
            </div>
            <div class="fav-date">💾 ${word.savedAt ? new Date(word.savedAt).toLocaleDateString('az-AZ') : 'Yaxınlarda'}</div>
        `;
        grid.appendChild(card);
    });
}

function renderGrammars(grammars) {
    const grid = document.getElementById('grammarsGrid');
    const empty = document.getElementById('grammarsEmpty');
    grid.innerHTML = '';

    if (grammars.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    grammars.forEach((item, idx) => {
        const g = typeof item === 'object' ? item : { title: item };
        const card = document.createElement('div');
        card.className = 'fav-card fav-grammar-card';
        card.dataset.search = (g.title || '').toLowerCase();
        card.innerHTML = `
            <div class="fav-card-header">
                <span class="grammar-category-badge">${g.category || 'Qrammatika'}</span>
                <button class="fav-remove-btn" onclick='removeGrammarFav("${g.title || item}")' title="Sil">🗑️</button>
            </div>
            <h3 class="fav-grammar-title">${g.title || item}</h3>
            ${g.description ? `<p class="fav-grammar-desc">${g.description}</p>` : ''}
            ${g.example ? `<div class="fav-example"><em>${g.example}</em></div>` : ''}
            <div class="fav-date">💾 ${g.savedAt ? new Date(g.savedAt).toLocaleDateString('az-AZ') : 'Yaxınlarda'}</div>
        `;
        grid.appendChild(card);
    });
}

function renderPhrases(phrases) {
    const grid = document.getElementById('phrasesGrid');
    const empty = document.getElementById('phrasesEmpty');
    grid.innerHTML = '';

    if (phrases.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    phrases.forEach((item) => {
        const p = typeof item === 'object' ? item : { phrase: item };
        const card = document.createElement('div');
        card.className = 'fav-card fav-phrase-card';
        card.dataset.search = (p.phrase || '').toLowerCase();
        card.innerHTML = `
            <div class="fav-card-header">
                <span class="phrase-badge">💬 İfadə</span>
                <button class="fav-remove-btn" onclick='removePhraseFav("${p.phrase || item}")' title="Sil">🗑️</button>
            </div>
            <h3 class="fav-phrase-title">"${p.phrase || item}"</h3>
            ${p.translation ? `<p class="fav-phrase-translation">${p.translation}</p>` : ''}
            ${p.usage ? `<p class="fav-phrase-usage">${p.usage}</p>` : ''}
            <div class="fav-actions">
                <button class="fav-action-btn" onclick='playWordAudio("${p.phrase || item}")'>🔊</button>
            </div>
            <div class="fav-date">💾 ${p.savedAt ? new Date(p.savedAt).toLocaleDateString('az-AZ') : 'Yaxınlarda'}</div>
        `;
        grid.appendChild(card);
    });
}

// ===== TABS =====
function switchFavTab(tab, btn) {
    currentFavTab = tab;
    document.querySelectorAll('.fav-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.fav-section').forEach(s => s.classList.add('hidden'));
    if (btn) btn.classList.add('active');
    document.getElementById('tab_' + tab).classList.remove('hidden');

    // Clear search
    document.getElementById('favSearch').value = '';
    showAllCards();
}

// ===== SEARCH =====
function filterFavorites() {
    const query = document.getElementById('favSearch').value.toLowerCase();
    const cards = document.querySelectorAll(`#tab_${currentFavTab} .fav-card`);
    let visible = 0;
    cards.forEach(card => {
        const match = card.dataset.search.includes(query);
        card.style.display = match ? 'flex' : 'none';
        if (match) visible++;
    });
}

function showAllCards() {
    document.querySelectorAll('.fav-card').forEach(c => c.style.display = 'flex');
}

// ===== REMOVE ACTIONS =====
function removeWordFav(word) {
    if (!confirm(`"${word}" sözünü sevimlilərdən silmək istəyirsiniz?`)) return;
    if (typeof window.removeFromFavorites === 'function') {
        window.removeFromFavorites(word, 'words');
    }
    // Optimistically update local state
    allFavWords = allFavWords.filter(w => (typeof w === 'object' ? w.word : w) !== word);
    renderWords(allFavWords);
    const wc = document.getElementById('wordCount');
    if (wc) wc.textContent = allFavWords.length;
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user) updateFavStats({ ...user, favorites: { words: allFavWords, grammar: allFavGrammars, phrases: allFavPhrases } });
}

function removeGrammarFav(title) {
    if (!confirm(`Bu qaydanı sevimlilərdən silmək istəyirsiniz?`)) return;
    if (typeof window.removeFromFavorites === 'function') {
        window.removeFromFavorites(title, 'grammar');
    }
    allFavGrammars = allFavGrammars.filter(g => (typeof g === 'object' ? g.title : g) !== title);
    renderGrammars(allFavGrammars);
    const gc = document.getElementById('grammarCount');
    if (gc) gc.textContent = allFavGrammars.length;
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user) updateFavStats({ ...user, favorites: { words: allFavWords, grammar: allFavGrammars, phrases: allFavPhrases } });
}

function removePhraseFav(phrase) {
    if (!confirm(`Bu ifadəni sevimlilərdən silmək istəyirsiniz?`)) return;
    if (typeof window.removeFromFavorites === 'function') {
        window.removeFromFavorites(phrase, 'phrases');
    }
    allFavPhrases = allFavPhrases.filter(p => (typeof p === 'object' ? p.phrase : p) !== phrase);
    renderPhrases(allFavPhrases);
    const pc = document.getElementById('phraseCount');
    if (pc) pc.textContent = allFavPhrases.length;
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user) updateFavStats({ ...user, favorites: { words: allFavWords, grammar: allFavGrammars, phrases: allFavPhrases } });
}

// ===== WORD DETAIL MODAL =====
function openWordDetail(idx) {
    const word = allFavWords[idx];
    if (!word) return;

    // XSS-safe: use textContent for all user data
    const safe = (v) => String(v || '');
    const content = document.getElementById('wordDetailContent');
    content.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'word-detail-header';
    const badge = document.createElement('span');
    badge.className = 'word-detail-badge';
    badge.textContent = word.level || '?';
    const typeBadge = document.createElement('span');
    typeBadge.className = 'word-detail-type';
    typeBadge.textContent = word.type || '';
    header.appendChild(badge);
    header.appendChild(typeBadge);
    content.appendChild(header);

    const title = document.createElement('h2');
    title.className = 'word-detail-title';
    title.textContent = word.word || '';
    content.appendChild(title);

    const pron = document.createElement('p');
    pron.className = 'word-detail-pronunciation';
    pron.textContent = word.pronunciation || '';
    content.appendChild(pron);

    // Translation
    const transSec = document.createElement('div');
    transSec.className = 'word-detail-section';
    transSec.innerHTML = '<h4>🌐 Tərcümə</h4>';
    const transP = document.createElement('p');
    transP.textContent = word.translation || '-';
    transSec.appendChild(transP);
    content.appendChild(transSec);

    // Definition
    const defSec = document.createElement('div');
    defSec.className = 'word-detail-section';
    defSec.innerHTML = '<h4>📖 Tərif</h4>';
    const defP = document.createElement('p');
    defP.textContent = word.definition || '-';
    defSec.appendChild(defP);
    content.appendChild(defSec);

    // Examples
    if (word.examples && word.examples.length) {
        const exSec = document.createElement('div');
        exSec.className = 'word-detail-section';
        exSec.innerHTML = '<h4>💬 Nümunə cümlələr</h4>';
        word.examples.forEach(ex => {
            const exDiv = document.createElement('div');
            exDiv.className = 'word-detail-example';
            const enP = document.createElement('p');
            enP.className = 'ex-en';
            enP.textContent = '"' + (ex.en || '') + '"';
            const azP = document.createElement('p');
            azP.className = 'ex-az';
            azP.textContent = ex.az || '';
            exDiv.appendChild(enP);
            exDiv.appendChild(azP);
            exSec.appendChild(exDiv);
        });
        content.appendChild(exSec);
    }

    // Synonyms
    if (word.synonyms && word.synonyms.length) {
        const synSec = document.createElement('div');
        synSec.className = 'word-detail-section';
        synSec.innerHTML = '<h4>🔗 Sinonimlər</h4>';
        const synDiv = document.createElement('div');
        synDiv.className = 'synonym-tags';
        word.synonyms.forEach(s => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = s;
            synDiv.appendChild(span);
        });
        synSec.appendChild(synDiv);
        content.appendChild(synSec);
    }

    // Audio button
    const audioBtn = document.createElement('button');
    audioBtn.className = 'btn btn-primary';
    audioBtn.style.marginTop = '1rem';
    audioBtn.textContent = '🔊 Səsləndirmə';
    audioBtn.addEventListener('click', () => playWordAudio(word.word || ''));
    content.appendChild(audioBtn);

    document.getElementById('wordDetailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeWordDetail() {
    document.getElementById('wordDetailModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('wordDetailModal').addEventListener('click', (e) => {
    if (e.target.id === 'wordDetailModal') closeWordDetail();
});

// ===== PLAY AUDIO =====
function playWordAudio(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}
