// ===== FAVORITES PAGE =====
// Firebase alielAuthReady-ə əsaslanır — localStorage YOX
let favInited = false;

function initFavorites(event) {
    if (favInited) return;
    favInited = true;

    const user = event && event.detail ? event.detail.user : null;

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
    if (favInited) return;
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
    removeFromFavorites('word', word);
    const user = getCurrentUser();
    if (user) {
        allFavWords = user.favoriteWords || [];
        renderWords(allFavWords);
        document.getElementById('wordCount').textContent = allFavWords.length;
        updateFavStats(user);
    }
}

function removeGrammarFav(title) {
    if (!confirm(`Bu qaydanı sevimlilərdən silmək istəyirsiniz?`)) return;
    removeFromFavorites('grammar', title);
    const user = getCurrentUser();
    if (user) {
        allFavGrammars = user.favoriteGrammars || [];
        renderGrammars(allFavGrammars);
        document.getElementById('grammarCount').textContent = allFavGrammars.length;
        updateFavStats(user);
    }
}

function removePhraseFav(phrase) {
    if (!confirm(`Bu ifadəni sevimlilərdən silmək istəyirsiniz?`)) return;
    removeFromFavorites('phrase', phrase);
    const user = getCurrentUser();
    if (user) {
        allFavPhrases = user.favoritePhrases || [];
        renderPhrases(allFavPhrases);
        document.getElementById('phraseCount').textContent = allFavPhrases.length;
        updateFavStats(user);
    }
}

// ===== WORD DETAIL MODAL =====
function openWordDetail(idx) {
    const word = allFavWords[idx];
    if (!word) return;

    const content = document.getElementById('wordDetailContent');
    content.innerHTML = `
        <div class="word-detail-header">
            <span class="word-detail-badge">${word.level || '?'}</span>
            <span class="word-detail-type">${word.type || ''}</span>
        </div>
        <h2 class="word-detail-title">${word.word}</h2>
        <p class="word-detail-pronunciation">${word.pronunciation || ''}</p>
        <div class="word-detail-section">
            <h4>🌐 Tərcümə</h4>
            <p>${word.translation || '-'}</p>
        </div>
        <div class="word-detail-section">
            <h4>📖 Tərif</h4>
            <p>${word.definition || '-'}</p>
        </div>
        ${word.examples && word.examples.length ? `
        <div class="word-detail-section">
            <h4>💬 Nümunə cümlələr</h4>
            ${word.examples.map(ex => `
                <div class="word-detail-example">
                    <p class="ex-en">"${ex.en}"</p>
                    <p class="ex-az">${ex.az}</p>
                </div>
            `).join('')}
        </div>` : ''}
        ${word.synonyms && word.synonyms.length ? `
        <div class="word-detail-section">
            <h4>🔗 Sinonimlər</h4>
            <div class="synonym-tags">${word.synonyms.map(s => `<span class="tag">${s}</span>`).join('')}</div>
        </div>` : ''}
        <button class="btn btn-primary" onclick='playWordAudio("${word.word}")' style="margin-top:1rem;">🔊 Səsləndirmə</button>
    `;

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
