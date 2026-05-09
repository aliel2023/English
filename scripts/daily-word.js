let todayWord = null;

async function getTodayWord() {
    const today = new Date().toDateString();
    const storedStr = localStorage.getItem('daily_word_data');
    if (storedStr) {
        try {
            const stored = JSON.parse(storedStr);
            if (stored.date === today && stored.word) {
                return stored.word;
            }
        } catch (e) {}
    }

    // Əgər yoxdursa, süni intellektdən (Gemini) yeni söz alaq
    return await fetchWordFromAI();
}

async function fetchWordFromAI() {
    try {
        const uid = window.currentUser?.id || null;
        if (window.handleAIQueryLimit) {
            const limitCheck = await window.handleAIQueryLimit(uid);
            if (!limitCheck.allowed) {
                if (limitCheck.reason === "guest_limit") {
                    showToast("Süni intellekt limitiniz bitdi. Pulsuz qeydiyyatdan keçin.", "warning");
                } else {
                    showToast("Gündəlik limit (20) bitdi. Premium-a keçid edin.", "warning");
                }
                return getFallbackWord(); // return static word if limit reached
            }
        }

        // Supabase Edge Function çağırışı
        const userLevel = window.currentUserData?.level || "B1";
        const prompt = `Provide a random, highly useful English word for a ${userLevel} level learner. 
        Return ONLY a valid JSON object (without markdown blocks like \`\`\`json) with these exact keys:
        "word" (string), "pronunciation" (string), "type" (string, e.g. "noun", "verb"), 
        "level" (string, e.g. "${userLevel}"), "translation" (string, in Azerbaijani), 
        "definition" (string, in English), 
        "examples" (array of 2 objects with "en" and "az" string keys), 
        "synonyms" (array of 3-4 strings).`;

        let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDvH7wNLFVlkU3Lr_gIf-RD2iBzjVGFWSU`;

        showToast("Süni intellekt sizin üçün günün sözünü seçir...", "info");

        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: "You are an English vocabulary API. Always return raw JSON.\n\n" + prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!resp.ok) throw new Error("API Error");
        const data = await resp.json();
        let aiText = data.candidates[0].content.parts[0].text.trim();
        if (aiText.startsWith("```json")) {
            aiText = aiText.substring(7, aiText.length - 3).trim();
        }
        
        const newWord = JSON.parse(aiText);
        
        // Cache it for today
        localStorage.setItem('daily_word_data', JSON.stringify({
            date: new Date().toDateString(),
            word: newWord
        }));
        
        return newWord;
    } catch (e) {
        console.error("AI Fetch Error:", e);
        showToast("Sözü internetdən çəkmək mümkün olmadı, offline baza istifadə edilir.", "warning");
        return getFallbackWord();
    }
}

function getFallbackWord() {
    return {
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
    };
}

async function loadWordOfDay() {
    document.getElementById("wordTitle").textContent = "Yüklənir...";
    todayWord = await getTodayWord();
    
    document.getElementById("wordLevel").textContent = `${todayWord.level} LEVEL`;
    document.getElementById("wordTitle").textContent = todayWord.word;
    document.getElementById("wordPronunciation").textContent = todayWord.pronunciation;
    document.getElementById("wordType").textContent = todayWord.type;
    document.getElementById("wordTranslation").textContent = todayWord.translation;
    document.getElementById("wordDefinition").textContent = todayWord.definition;
    
    const ex1 = todayWord.examples[0];
    document.getElementById("example1En").textContent = `"${ex1.en}"`;
    document.getElementById("example1Az").textContent = ex1.az;
    
    if (todayWord.examples[1]) {
        document.getElementById("example2En").textContent = `"${todayWord.examples[1].en}"`;
        document.getElementById("example2Az").textContent = todayWord.examples[1].az;
    } else {
        const e2 = document.getElementById("example2En");
        if (e2 && e2.closest(".example-item")) {
            e2.closest(".example-item").style.display = "none";
        }
    }
    
    const tags = todayWord.synonyms.map(e => `<span class="tag">${e}</span>`).join("");
    const tagCont = document.querySelector(".synonym-tags");
    if (tagCont) tagCont.innerHTML = tags;
    
    markWordAsSeen(todayWord.word);
    updateFavoriteButton();
}

function updateFavoriteButton() {
    const btn = document.querySelector('[onclick="addWordToFavBtn()"]');
    if (!btn) return;
    const user = window.currentUserData;
    if (user && user.favorites && user.favorites.words && user.favorites.words.some(w => (typeof w === 'object' ? w.word : w) === todayWord.word)) {
        btn.innerHTML = "❤️ Sevimlilərdir";
        btn.style.opacity = "0.7";
        btn.disabled = true;
    }
}

function playAudio(e) {
    const text = todayWord ? todayWord.word : document.getElementById("wordTitle").textContent;
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 0.8;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
        const btn = e && e.target ? e.target.closest("button") : null;
        if (btn) {
            btn.style.transform = "scale(1.1)";
            setTimeout(() => btn.style.transform = "scale(1)", 300);
        }
    } else {
        if(window.showToast) showToast("Bu cihaz səs oxutmanı dəstəkləmir.", "warning");
    }
}

function addWordToFavBtn() {
    if (!window.currentUserData) {
        window.location.href = "login.html?next=daily-word.html";
        return;
    }
    const favObj = {
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
    if (typeof window.addToFavorites === "function") {
        window.addToFavorites(favObj, "words").then(res => {
            if (res !== false) {
                const btn = document.querySelector('[onclick="addWordToFavBtn()"]');
                if (btn) {
                    btn.innerHTML = "❤️ Sevimlilərdir";
                    btn.style.opacity = "0.7";
                    btn.disabled = true;
                }
                if(window.showToast) showToast("✅ Söz sevimlilərə əlavə edildi!", "success");
            }
        }).catch(() => {
            if(window.showToast) showToast("⚠️ Xəta baş verdi.", "error");
        });
    } else {
        _addToLocalFavorites();
    }
}

function _addToLocalFavorites() {
    const arr = JSON.parse(localStorage.getItem("favoriteWords") || "[]");
    if (arr.find(e => (typeof e === 'object' ? e.word : e) === todayWord.word)) {
        if(window.showToast) showToast("❤️ Bu söz artıq sevimlilərinizdədir!", "info");
        return;
    }
    arr.push({
        word: todayWord.word,
        level: todayWord.level,
        translation: todayWord.translation,
        savedAt: new Date().toISOString()
    });
    localStorage.setItem("favoriteWords", JSON.stringify(arr));
    if(window.showToast) showToast("✅ Söz sevimlilərə əlavə edildi!", "success");
    const counter = document.getElementById("favoriteCount");
    if (counter) counter.textContent = arr.length;
}

function shareWord() {
    const txt = `📚 Günün Sözü: ${todayWord.word}\n\n✅ ${todayWord.translation}\n\n💬 "${todayWord.examples[0].en}"\n\n🔗 Alielenglish ilə öyrən!`;
    if (navigator.share) {
        navigator.share({ title: "Günün Sözü", text: txt, url: window.location.href });
    } else {
        navigator.clipboard.writeText(txt).then(() => {
            if(window.showToast) showToast("📋 Kopyalandı!", "success");
        });
    }
}

function loadStatistics() {
    const user = window.currentUserData;
    let seen = 0, streak = 0, favs = 0;
    if (user) {
        seen = (user.seenWords || []).length;
        streak = user.current_streak || 0;
        favs = (user.favorites?.words || []).length;
    } else {
        seen = JSON.parse(localStorage.getItem("seenWords") || "[]").length;
        streak = parseInt(localStorage.getItem("currentStreak") || "0");
        favs = JSON.parse(localStorage.getItem("favoriteWords") || "[]").length;
    }
    animateCounter(document.getElementById("totalWordsLearned"), seen);
    animateCounter(document.getElementById("currentStreak"), streak);
    animateCounter(document.getElementById("favoriteCount"), favs);
}

function animateCounter(el, target) {
    if (!el || target === 0) {
        if (el) el.textContent = "0";
        return;
    }
    let cur = 0;
    const inc = Math.max(1, target / 30);
    const interval = setInterval(() => {
        cur += inc;
        if (cur >= target) {
            el.textContent = target;
            clearInterval(interval);
        } else {
            el.textContent = Math.floor(cur);
        }
    }, 30);
}

function markWordAsSeen(w) {
    const arr = JSON.parse(localStorage.getItem("seenWords") || "[]");
    if (!arr.includes(w)) {
        arr.push(w);
        localStorage.setItem("seenWords", JSON.stringify(arr));
    }
}

function updateStreak() {
    if (window.currentUserData) return;
    const lastDate = localStorage.getItem("lastDailyWordVisit");
    const today = new Date().toDateString();
    if (lastDate !== today) {
        const yest = new Date(Date.now() - 864e5).toDateString();
        let s = parseInt(localStorage.getItem("currentStreak") || "0");
        s = (lastDate === yest) ? s + 1 : 1;
        localStorage.setItem("currentStreak", s.toString());
        localStorage.setItem("lastDailyWordVisit", today);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const dateEl = document.getElementById("dailyDate");
    if (dateEl) {
        const lang = localStorage.getItem("selectedLanguage") || "az";
        dateEl.textContent = new Date().toLocaleDateString(lang === "az" ? "az-AZ" : "en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
    }
    loadWordOfDay().then(() => {
        loadStatistics();
        updateStreak();
    });
});

document.addEventListener("alielAuthReady", function() {
    updateFavoriteButton();
    loadStatistics();
});

}

let displayedArchiveCount = 0;
const archivePerPage = 6;

function loadArchive() {
    const grid = document.getElementById("archiveGrid");
    if (!grid) return;
    
    // We display seenWords as archive
    let seenWords = [];
    const user = window.currentUserData;
    if (user) {
        seenWords = user.seenWords || [];
    } else {
        seenWords = JSON.parse(localStorage.getItem("seenWords") || "[]");
    }

    // Usually seenWords contains just strings, or objects. If it's strings, we don't have full details.
    // So for the archive, we will load favorites, as favorites store full objects.
    let favWords = [];
    if (user) {
        favWords = user.favorites?.words || [];
    } else {
        favWords = JSON.parse(localStorage.getItem("favoriteWords") || "[]");
    }

    const archiveSource = favWords.filter(w => w.word !== todayWord?.word);

    for (let i = displayedArchiveCount; i < Math.min(displayedArchiveCount + archivePerPage, archiveSource.length); i++) {
        const wordObj = archiveSource[i];
        const isFav = true; // since we pull from favWords
        
        const card = document.createElement("div");
        card.className = "archive-card";
        card.dataset.level = wordObj.level || "B1";
        card.dataset.favorite = "true";
        card.onclick = () => viewArchivedWord(wordObj);
        
        card.innerHTML = `
            <span class="word-badge">${wordObj.level || "B1"}</span>
            <h3>${wordObj.word}</h3>
            <p class="pronunciation">${wordObj.pronunciation || ""}</p>
            <p class="translation">${wordObj.translation || ""}</p>
            <span style="color:var(--primary);font-size:0.8rem;">❤️ Sevimlilərdə</span>
        `;
        grid.appendChild(card);
    }
    displayedArchiveCount += archivePerPage;
    const btn = document.getElementById("loadMoreBtn");
    if (btn) {
        if (displayedArchiveCount >= archiveSource.length) {
            btn.style.display = "none";
        } else {
            btn.style.display = "inline-block";
        }
    }
}

function loadMoreArchive() {
    loadArchive();
}

function filterArchive(filterVal, e) {
    const cards = document.querySelectorAll(".archive-card");
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    if (e && e.target) e.target.classList.add("active");
    
    cards.forEach(c => {
        if (filterVal === "all") c.style.display = "block";
        else if (filterVal === "favorites") c.style.display = c.dataset.favorite === "true" ? "block" : "none";
        else c.style.display = c.dataset.level === filterVal ? "block" : "none";
    });
}

function viewArchivedWord(wordObj) {
    const existing = document.getElementById("archiveWordModal");
    if (existing) existing.remove();
    
    const exEn = wordObj.examples && wordObj.examples.length > 0 ? wordObj.examples[0].en : "";
    const exAz = wordObj.examples && wordObj.examples.length > 0 ? wordObj.examples[0].az : "";

    const modal = document.createElement("div");
    modal.id = "archiveWordModal";
    modal.className = "modal active";
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;text-align:left;">
            <button class="modal-close" onclick="this.closest('.modal').remove();document.body.style.overflow='';">×</button>
            <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem;">
                <span class="word-badge" style="background:rgba(230,57,70,0.15);color:var(--primary);border:1px solid rgba(230,57,70,0.3);padding:0.3rem 0.8rem;border-radius:50px;">${wordObj.level || "B1"}</span>
                <span style="background:var(--bg-dark);border:1px solid var(--border);color:var(--text-muted);padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;">${wordObj.type || "word"}</span>
            </div>
            <h2 style="font-size:2rem;letter-spacing:2px;margin-bottom:0.25rem;">${wordObj.word}</h2>
            <p style="color:var(--primary);font-style:italic;margin-bottom:1.5rem;">${wordObj.pronunciation || ""}</p>
            <div style="background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:1rem;">
                <h4 style="color:var(--primary);margin-bottom:0.5rem;">🌐 Tərcümə</h4>
                <p style="color:var(--text-secondary);">${wordObj.translation || ""}</p>
            </div>
            <div style="background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:1rem;">
                <h4 style="color:var(--primary);margin-bottom:0.5rem;">💬 Nümunə</h4>
                <p style="color:var(--text-primary);font-style:italic;">"${exEn}"</p>
                <p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.3rem;">${exAz}</p>
            </div>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick='speakWord("${wordObj.word}")'>🔊 Dinlə</button>
            </div>
        </div>
    `;
    modal.addEventListener("click", ev => {
        if (ev.target === modal) {
            modal.remove();
            document.body.style.overflow = "";
        }
    });
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
}

function speakWord(w) {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(w);
        utter.lang = "en-US";
        utter.rate = 0.85;
        window.speechSynthesis.speak(utter);
    }
}