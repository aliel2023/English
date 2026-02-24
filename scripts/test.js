// ===== TEST QUESTION DATABASE =====
const testQuestions = {
    A1: [
        { id: 1, question: "What ___ your name?", options: ["is", "are", "am", "be"], correctIndex: 0 },
        { id: 2, question: "I ___ a student.", options: ["am", "is", "are", "be"], correctIndex: 0 },
        { id: 3, question: "This is ___ book.", options: ["a", "an", "the", "my"], correctIndex: 3 },
        { id: 4, question: "She ___ English.", options: ["speak", "speaks", "speaking", "to speak"], correctIndex: 1 },
        { id: 5, question: "They ___ from Turkey.", options: ["is", "am", "are", "be"], correctIndex: 2 },
        { id: 6, question: "___ is your teacher?", options: ["What", "Who", "Where", "When"], correctIndex: 1 },
        { id: 7, question: "I ___ coffee every morning.", options: ["drink", "drinks", "drinking", "drank"], correctIndex: 0 },
        { id: 8, question: "There ___ two cats.", options: ["is", "are", "am", "be"], correctIndex: 1 },
        { id: 9, question: "My sister ___ tall.", options: ["am", "is", "are", "be"], correctIndex: 1 },
        { id: 10, question: "___ you like pizza?", options: ["Do", "Does", "Is", "Are"], correctIndex: 0 },
        { id: 11, question: "We ___ to school.", options: ["go", "goes", "going", "went"], correctIndex: 0 },
        { id: 12, question: "The book is ___ the table.", options: ["in", "on", "at", "under"], correctIndex: 1 },
        { id: 13, question: "I have ___ apple.", options: ["a", "an", "the", "some"], correctIndex: 1 },
        { id: 14, question: "___ are you from?", options: ["What", "Who", "Where", "When"], correctIndex: 2 },
        { id: 15, question: "He ___ TV now.", options: ["watch", "watches", "watching", "is watching"], correctIndex: 3 }
    ],
    A2: [
        { id: 1, question: "I ___ to the cinema yesterday.", options: ["go", "went", "going", "goes"], correctIndex: 1 },
        { id: 2, question: "She ___ English for 3 years.", options: ["learn", "learning", "has learned", "learned"], correctIndex: 2 },
        { id: 3, question: "They ___ in London since 2020.", options: ["live", "lived", "have lived", "are living"], correctIndex: 2 },
        { id: 4, question: "I ___ my homework now.", options: ["do", "did", "am doing", "have done"], correctIndex: 2 },
        { id: 5, question: "He is ___ than his brother.", options: ["tall", "taller", "tallest", "more tall"], correctIndex: 1 },
        { id: 6, question: "We ___ go there tomorrow.", options: ["will", "would", "can", "must"], correctIndex: 0 },
        { id: 7, question: "She told me ___ wait.", options: ["to", "for", "at", "of"], correctIndex: 0 },
        { id: 8, question: "I have ___ finished.", options: ["yet", "already", "still", "just"], correctIndex: 3 },
        { id: 9, question: "___ you ever been to Paris?", options: ["Did", "Do", "Have", "Are"], correctIndex: 2 },
        { id: 10, question: "He ___ play guitar when he was young.", options: ["can", "could", "should", "would"], correctIndex: 1 },
        { id: 11, question: "If it rains, I ___ stay home.", options: ["will", "would", "can", "must"], correctIndex: 0 },
        { id: 12, question: "She is good ___ mathematics.", options: ["in", "at", "on", "for"], correctIndex: 1 },
        { id: 13, question: "I'm looking ___ my keys.", options: ["at", "for", "after", "forward"], correctIndex: 1 },
        { id: 14, question: "The meeting was ___ 3 PM.", options: ["in", "on", "at", "by"], correctIndex: 2 },
        { id: 15, question: "He ___ here since morning.", options: ["is", "was", "has been", "had been"], correctIndex: 2 },
        { id: 16, question: "I'd like ___ water, please.", options: ["a", "an", "some", "any"], correctIndex: 2 },
        { id: 17, question: "She speaks ___ fluently.", options: ["English", "english", "the English", "an English"], correctIndex: 0 },
        { id: 18, question: "We ___ each other for 5 years.", options: ["know", "knew", "have known", "are knowing"], correctIndex: 2 },
        { id: 19, question: "The book ___ by J.K. Rowling.", options: ["wrote", "written", "was written", "has written"], correctIndex: 2 },
        { id: 20, question: "I'm ___ forward to the trip.", options: ["look", "looks", "looked", "looking"], correctIndex: 3 }
    ],
    B1: [
        { id: 1, question: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], correctIndex: 2 },
        { id: 2, question: "The book ___ by millions.", options: ["reads", "is read", "has read", "reading"], correctIndex: 1 },
        { id: 3, question: "I wish I ___ speak Chinese.", options: ["can", "could", "will", "would"], correctIndex: 1 },
        { id: 4, question: "She suggested ___ early.", options: ["leave", "to leave", "leaving", "left"], correctIndex: 2 },
        { id: 5, question: "By next year, I ___ here for 10 years.", options: ["work", "worked", "will work", "will have worked"], correctIndex: 3 },
        { id: 6, question: "The house ___ needs painting.", options: ["badly", "bad", "worse", "worst"], correctIndex: 0 },
        { id: 7, question: "I'd rather you ___ come.", options: ["don't", "didn't", "won't", "wouldn't"], correctIndex: 1 },
        { id: 8, question: "He ___ have left by now.", options: ["can", "may", "must", "should"], correctIndex: 2 },
        { id: 9, question: "Having ___ the letter, she felt relieved.", options: ["send", "sent", "sending", "to send"], correctIndex: 1 },
        { id: 10, question: "___ the rain, we went out.", options: ["Despite", "Although", "However", "But"], correctIndex: 0 },
        { id: 11, question: "She's used to ___ alone.", options: ["live", "living", "lived", "lives"], correctIndex: 1 },
        { id: 12, question: "The sooner we start, ___ we'll finish.", options: ["the earlier", "the more early", "earlier", "early"], correctIndex: 0 },
        { id: 13, question: "I'm not ___ to make that decision.", options: ["qualified", "qualifying", "qualification", "qualify"], correctIndex: 0 },
        { id: 14, question: "It's high time you ___ a job.", options: ["get", "got", "getting", "to get"], correctIndex: 1 },
        { id: 15, question: "___ he studied hard, he failed.", options: ["Despite", "Although", "However", "But"], correctIndex: 1 },
        { id: 16, question: "The machine ___ properly.", options: ["doesn't work", "isn't working", "hasn't worked", "didn't work"], correctIndex: 0 },
        { id: 17, question: "I'd prefer ___ at home.", options: ["stay", "to stay", "staying", "stayed"], correctIndex: 1 },
        { id: 18, question: "She ___ have been surprised.", options: ["can", "may", "must", "should"], correctIndex: 2 },
        { id: 19, question: "___ my knowledge, he's retired.", options: ["To", "For", "With", "By"], correctIndex: 0 },
        { id: 20, question: "The report needs ___ by Friday.", options: ["finish", "finished", "finishing", "to finish"], correctIndex: 2 },
        { id: 21, question: "I'm ___ interested in history.", options: ["quite", "quiet", "quit", "quite a"], correctIndex: 0 },
        { id: 22, question: "He's ___ intelligent to believe that.", options: ["too", "very", "so", "enough"], correctIndex: 0 },
        { id: 23, question: "___ losing, they celebrated.", options: ["Despite", "Although", "However", "In spite"], correctIndex: 0 },
        { id: 24, question: "She's ___ of three children.", options: ["a mother", "mother", "the mother", "mothers"], correctIndex: 2 },
        { id: 25, question: "I ___ seen him in years.", options: ["haven't", "didn't", "wasn't", "don't"], correctIndex: 0 }
    ],
    B2: [
        { id: 1, question: "By the time you arrive, I ___ the work.", options: ["finish", "finished", "will have finished", "am finishing"], correctIndex: 2 },
        { id: 2, question: "Had I known, I ___ differently.", options: ["act", "acted", "would act", "would have acted"], correctIndex: 3 },
        { id: 3, question: "Rarely ___ such dedication.", options: ["I have seen", "have I seen", "I saw", "did I see"], correctIndex: 1 },
        { id: 4, question: "The proposal ___ under consideration.", options: ["is", "has", "being", "been"], correctIndex: 0 },
        { id: 5, question: "___ to the report, sales increased.", options: ["According", "Due", "Owing", "Thanks"], correctIndex: 0 },
        { id: 6, question: "She's ___ to be the best candidate.", options: ["likely", "liked", "likelihood", "liking"], correctIndex: 0 },
        { id: 7, question: "No sooner ___ than it started raining.", options: ["we arrived", "had we arrived", "we had arrived", "did we arrive"], correctIndex: 1 },
        { id: 8, question: "The issue ___ resolved yet.", options: ["hasn't been", "isn't been", "wasn't been", "didn't been"], correctIndex: 0 },
        { id: 9, question: "___ circumstances, I'd agree.", options: ["In other", "Under other", "With other", "At other"], correctIndex: 1 },
        { id: 10, question: "He's not ___ he used to be.", options: ["as energetic as", "energetic as", "so energetic", "energetic so"], correctIndex: 0 },
        { id: 11, question: "The more I learn, ___ I realize I don't know.", options: ["the more", "more", "most", "the most"], correctIndex: 0 },
        { id: 12, question: "___ being late, he was also unprepared.", options: ["Besides", "Beside", "Despite", "Although"], correctIndex: 0 },
        { id: 13, question: "She ___ have completed the project by now.", options: ["must", "should", "would", "could"], correctIndex: 1 },
        { id: 14, question: "The decision ___ after careful deliberation.", options: ["took", "was taken", "had taken", "has taken"], correctIndex: 1 },
        { id: 15, question: "___ the difficulties, we persevered.", options: ["Despite", "Although", "However", "Nevertheless"], correctIndex: 0 },
        { id: 16, question: "The data ___ carefully analyzed.", options: ["need", "needs", "needed", "needing"], correctIndex: 2 },
        { id: 17, question: "It's imperative that he ___ on time.", options: ["is", "be", "will be", "being"], correctIndex: 1 },
        { id: 18, question: "The committee ___ a decision yesterday.", options: ["reached", "arrived", "got", "came"], correctIndex: 0 },
        { id: 19, question: "___ your assistance, we couldn't have succeeded.", options: ["Without", "With", "Besides", "Despite"], correctIndex: 0 },
        { id: 20, question: "The phenomenon ___ extensively.", options: ["studied", "has studied", "was studied", "has been studied"], correctIndex: 3 },
        { id: 21, question: "___ the circumstances, it was inevitable.", options: ["Given", "Giving", "Give", "Gave"], correctIndex: 0 },
        { id: 22, question: "She's ___ capable of handling it.", options: ["more than", "more as", "as more", "than more"], correctIndex: 0 },
        { id: 23, question: "The project ___ considerable investment.", options: ["requires", "requests", "demands", "needs"], correctIndex: 0 },
        { id: 24, question: "___ to say, he was furious.", options: ["Needless", "Useless", "Hopeless", "Careless"], correctIndex: 0 },
        { id: 25, question: "The findings ___ our hypothesis.", options: ["confirm", "conforms", "conform", "confirmed"], correctIndex: 0 },
        { id: 26, question: "It's ___ that immediate action be taken.", options: ["vital", "vitally", "vitality", "vitalize"], correctIndex: 0 },
        { id: 27, question: "The proposal met with ___ resistance.", options: ["fierce", "fiercely", "fierceness", "fiercer"], correctIndex: 0 },
        { id: 28, question: "___ the evidence, the verdict was clear.", options: ["In light of", "In spite of", "Because of", "Due to"], correctIndex: 0 },
        { id: 29, question: "The atmosphere was ___ tense.", options: ["distinctly", "distinct", "distinction", "distinctive"], correctIndex: 0 },
        { id: 30, question: "His contribution ___ acknowledged.", options: ["was", "were", "has", "have"], correctIndex: 0 }
    ],
    C1: [
        { id: 1, question: "Scarcely ___ arrived when the meeting started.", options: ["had we", "we had", "have we", "we have"], correctIndex: 0 },
        { id: 2, question: "The implications ___ far-reaching.", options: ["are", "is", "was", "were"], correctIndex: 0 },
        { id: 3, question: "He ___ have been more explicit.", options: ["couldn't", "mustn't", "shouldn't", "wouldn't"], correctIndex: 0 },
        { id: 4, question: "The policy ___ considerable scrutiny.", options: ["underwent", "undertook", "overcome", "overtook"], correctIndex: 0 },
        { id: 5, question: "___ were the circumstances, we had no choice.", options: ["Such", "So", "These", "Those"], correctIndex: 0 }
    ],
    C2: [
        { id: 1, question: "The nuances ___ subtle yet significant.", options: ["are", "is", "was", "were"], correctIndex: 0 },
        { id: 2, question: "His erudition ___ apparent.", options: ["was", "were", "is", "are"], correctIndex: 0 },
        { id: 3, question: "The discourse ___ sophisticated analysis.", options: ["requires", "require", "requiring", "required"], correctIndex: 0 },
        { id: 4, question: "___ the paradigm shift, adaptation is essential.", options: ["Given", "Giving", "Gave", "Give"], correctIndex: 0 },
        { id: 5, question: "The methodology ___ rigorous examination.", options: ["warrants", "warrant", "warranting", "warranted"], correctIndex: 0 }
    ]
};

// ===== TEST STATE =====
let currentLevel = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 0;

// ===== START TEST =====
function startTest(level) {
    currentLevel = level;

    if (level === 'Daily') {
        const todayStr = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < todayStr.length; i++) {
            hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Pick exactly 5 pseudorandom questions from A2 and B1 banks for the daily test
        const bank = [...testQuestions['A2'], ...testQuestions['B1']];
        currentQuestions = [];
        for (let i = 0; i < 5; i++) {
            let rndIndex = Math.abs(hash + i * 11) % bank.length;
            currentQuestions.push(bank[rndIndex]);
        }
    } else {
        currentQuestions = [...testQuestions[level]];
    }

    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);

    // Set timer based on level (in seconds)
    const timerMinutes = { 'A1': 10, 'A2': 15, 'B1': 20, 'B2': 25, 'C1': 30, 'C2': 35, 'Daily': 5 };
    timeRemaining = timerMinutes[level] * 60;

    // Hide level selection, show test interface
    document.getElementById('levelSelection').classList.add('hidden');
    document.getElementById('testInterface').classList.remove('hidden');

    // Start timer
    startTimer();

    // Show first question
    showQuestion();
}

// ===== TIMER =====
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            finishTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// ===== SHOW QUESTION =====
function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    // Update progress
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    const questionLabel = t('test.question') !== 'test.question' ? t('test.question') : 'Sual';
    const ofLabel = t('test.of') !== 'test.of' ? t('test.of') : '/';
    document.getElementById('progressText').textContent =
        `${questionLabel} ${currentQuestionIndex + 1}${ofLabel}${currentQuestions.length}`;

    // Update question
    const qLabel2 = t('test.question') !== 'test.question' ? t('test.question') : 'Sual';
    document.getElementById('questionNumber').textContent = `${qLabel2} ${currentQuestionIndex + 1}`;
    document.getElementById('questionText').textContent = question.question;

    // Update options
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';

    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => selectOption(index);

        if (userAnswers[currentQuestionIndex] === index) {
            btn.classList.add('selected');
        }

        optionsGrid.appendChild(btn);
    });

    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) {
        nextBtn.disabled = userAnswers[currentQuestionIndex] === null;
        const finishL = t('test.btnFinish') !== 'test.btnFinish' ? t('test.btnFinish') : 'Bitir';
        const nextL = t('test.btnNext') !== 'test.btnNext' ? t('test.btnNext') : 'Növbəti →';
        nextBtn.textContent = currentQuestionIndex === currentQuestions.length - 1 ?
            finishL : nextL;
    }
}

// ===== SELECT OPTION =====
function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;

    // Update UI
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
    });

    // Enable next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.disabled = false;
}

// ===== NAVIGATION =====
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        finishTest();
    }
}

// ===== FINISH TEST =====
function finishTest() {
    clearInterval(timerInterval);

    // Calculate score
    let correctAnswers = 0;
    currentQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.correctIndex) {
            correctAnswers++;
        }
    });

    const percentage = (correctAnswers / currentQuestions.length) * 100;

    // Save to localStorage (fallback)
    updateProgress(currentLevel, correctAnswers, percentage);

    // Save to auth user profile
    if (typeof saveTestResult === 'function') {
        saveTestResult(currentLevel, correctAnswers, currentQuestions.length, percentage);
    }

    // Show results
    showResults(correctAnswers, percentage);
}

// ===== SHOW RESULTS =====
function showResults(score, percentage) {
    document.getElementById('testInterface').classList.add('hidden');
    document.getElementById('testResults').classList.remove('hidden');

    // Animate score
    let currentScore = 0;
    const scoreInterval = setInterval(() => {
        currentScore++;
        document.getElementById('scoreNumber').textContent = currentScore;
        document.getElementById('scorePercentage').textContent =
            `${Math.round((currentScore / currentQuestions.length) * 100)}%`;

        if (currentScore >= score) {
            clearInterval(scoreInterval);
        }
    }, 50);

    // Set level badge
    document.getElementById('levelBadge').textContent = currentLevel;

    // Set message and action based on score
    const resultsIcon = document.getElementById('resultsIcon');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsMessage = document.getElementById('resultsMessage');
    const resultsAction = document.getElementById('resultsAction');

    if (percentage >= 70) {
        resultsIcon.textContent = '🎉';
        const congratsText = t('test.congratulations') !== 'test.congratulations' ? t('test.congratulations') : 'Təbriklər!';
        resultsTitle.textContent = congratsText;
        const excellentText = t('test.excellentResult') !== 'test.excellentResult' ? t('test.excellentResult') : 'Əla nəticə!';
        const msg1Text = t('test.resultMessage1', { level: currentLevel }) !== 'test.resultMessage1' ? t('test.resultMessage1', { level: currentLevel }) : `Siz ${currentLevel} səviyyəsini uğurla keçdiniz. İndi Premium materiallarımızla öyrənməni davam etdirin!`;
        resultsMessage.innerHTML = `
            <p><strong>${excellentText}</strong></p>
            <p>${msg1Text}</p>
        `;
        const btnPremText = t('test.btnPremium') !== 'test.btnPremium' ? t('test.btnPremium') : 'Premium Planlara Bax';
        resultsAction.textContent = btnPremText;
        resultsAction.onclick = () => window.location.href = 'pricing.html';
    } else {
        resultsIcon.textContent = '💪';
        const practiceText = t('test.needPractice') !== 'test.needPractice' ? t('test.needPractice') : 'Daha çox məşq lazımdır';
        resultsTitle.textContent = practiceText;
        const msg2Text = t('test.resultMessage2') !== 'test.resultMessage2' ? t('test.resultMessage2') : 'Narahat olmayın! Bizim pulsuz resurslarımızla təlimə davam edin və yenidən cəhd edin.';
        resultsMessage.innerHTML = `
            <p>${msg2Text}</p>
        `;
        const btnResText = t('test.btnResources') !== 'test.btnResources' ? t('test.btnResources') : 'Pulsuz Resurslar';
        resultsAction.textContent = btnResText;
        resultsAction.onclick = () => window.location.href = 'resources.html';
    }
}

// ===== HANDLE RESULTS ACTION =====
function handleResultsAction() {
    const percentage = (userAnswers.filter((ans, i) => ans === currentQuestions[i].correctIndex).length / currentQuestions.length) * 100;

    if (percentage >= 70) {
        window.location.href = 'pricing.html';
    } else {
        window.location.href = 'resources.html';
    }
}

// ===== RESTART TEST =====
function restartTest() {
    document.getElementById('testResults').classList.add('hidden');
    document.getElementById('levelSelection').classList.remove('hidden');
    currentQuestionIndex = 0;
    userAnswers = [];
}