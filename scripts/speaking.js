const sentences = [
    "The weather is beautiful today and I feel great.",
    "Learning a new language opens up many opportunities.",
    "I would like to order a cup of coffee, please.",
    "Could you tell me how to get to the train station?",
    "My favorite weekend activity is reading books.",
    "Technology has changed the way we live and work.",
    "He achieved his goals through hard work and dedication.",
    "It is important to eat healthy food and exercise daily."
];

let recognition = null;
let isRecording = false;

function initSpeechRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.SpeechRecognition) {
        alert(t('speaking.errNotSupported') || "Sizin brauzeriniz səs tanıma xüsusiyyətini dəstəkləmir. Lütfən Chrome, Edge və ya Safari istifadə edin.");
        return;
    }

    recognition = new window.SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        evaluateSpeech(transcript);
    };

    recognition.onend = () => {
        stopRecordingState();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopRecordingState();
        if (event.error === 'not-allowed') {
            alert(t('speaking.errNoMic') || "Mikrofona icazə verilməyib. Lütfən brauzer parametrlərindən icazə verin.");
        }
    };
}

function getNewSentence() {
    const targetElement = document.getElementById('targetSentence');
    const randomIndex = Math.floor(Math.random() * sentences.length);
    targetElement.textContent = sentences[randomIndex];

    document.getElementById('resultBox').classList.add('hidden');
}

function toggleRecording() {
    if (!recognition) {
        initSpeechRecognition();
        if (!recognition) return;
    }

    if (isRecording) {
        recognition.stop();
        stopRecordingState();
    } else {
        recognition.start();
        startRecordingState();
    }
}

function startRecordingState() {
    isRecording = true;
    document.getElementById('micBtn').classList.add('recording');
    document.getElementById('micText').textContent = t('speaking.btnStop') || "Dayandır";
    document.getElementById('statusIndicator').classList.remove('hidden');
    document.getElementById('resultBox').classList.add('hidden');
}

function stopRecordingState() {
    isRecording = false;
    document.getElementById('micBtn').classList.remove('recording');
    document.getElementById('micText').textContent = t('speaking.btnStart') || "Danışmağa Başla";
    document.getElementById('statusIndicator').classList.add('hidden');
}

function normalizeString(str) {
    return str.toLowerCase().replace(/[.,?!]/g, '').trim();
}

function evaluateSpeech(transcript) {
    const target = document.getElementById('targetSentence').textContent;
    const resultBox = document.getElementById('resultBox');
    const userSpeechElement = document.getElementById('userSpeech');
    const scoreElement = document.getElementById('accuracyPercentage');
    const feedbackElement = document.getElementById('feedbackMessage');

    const normTarget = normalizeString(target);
    const normTranscript = normalizeString(transcript);

    // Levenshtein distance based accuracy or simple word matching
    const targetWords = normTarget.split(' ');
    const transWords = normTranscript.split(' ');

    let matchCount = 0;
    targetWords.forEach(word => {
        if (transWords.includes(word)) {
            matchCount++;
        }
    });

    // Simple percentage calculation
    let percentage = Math.round((matchCount / targetWords.length) * 100);

    // Exact match bonus
    if (normTarget === normTranscript) {
        percentage = 100;
    }

    // Limit to 100
    percentage = Math.min(percentage, 100);

    userSpeechElement.textContent = `"${transcript}"`;
    scoreElement.textContent = `${percentage}%`;

    // Feedbacks
    feedbackElement.className = 'feedback';
    if (percentage >= 80) {
        feedbackElement.textContent = t('speaking.feedExcellent') || "Əla! Tələffüzünüz çox aydın və düzgündür.";
        feedbackElement.classList.add('excellent');
    } else if (percentage >= 50) {
        feedbackElement.textContent = t('speaking.feedGood') || "Yaxşı bir cəhd! Bir az daha tez və aydın tələffüz etməyə çalışın.";
        feedbackElement.classList.add('good');
    } else {
        feedbackElement.textContent = t('speaking.feedPoor') || "Səsiniz tam aydın deyil və ya fərqli sözlər eşitdim. Zəhmət olmasa bir daha yoxlayın.";
        feedbackElement.classList.add('poor');
    }

    resultBox.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
});
