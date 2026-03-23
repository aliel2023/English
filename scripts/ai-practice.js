/* ==========================================================================
   AI Practice Feedback — Günün Sözü Page
   Provides simulated AI feedback on student sentences using the word of the day.
   ========================================================================== */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var checkBtn = document.getElementById('aiCheckBtn');
        var textarea = document.getElementById('aiPracticeInput');
        var feedbackArea = document.getElementById('aiFeedbackResponse');

        if (!checkBtn || !textarea || !feedbackArea) return;

        // Get the current word of the day from the page
        function getCurrentWord() {
            var el = document.getElementById('wordTitle');
            return el ? el.textContent.trim().toLowerCase() : 'accomplish';
        }

        checkBtn.addEventListener('click', function () {
            var sentence = textarea.value.trim();
            if (!sentence) {
                textarea.focus();
                return;
            }

            checkBtn.disabled = true;
            checkBtn.innerHTML = '⏳ Yoxlanılır...';

            // Show typing indicator
            feedbackArea.innerHTML = '<div class="ai-feedback-box"><div class="ai-typing-indicator"><span></span><span></span><span></span></div></div>';
            feedbackArea.classList.add('visible');

            // Simulate AI processing delay
            setTimeout(function () {
                var word = getCurrentWord();
                var feedback = generateFeedback(sentence, word);
                renderFeedback(feedback);
                checkBtn.disabled = false;
                checkBtn.innerHTML = '🤖 AI ilə Yoxla';
            }, 1500 + Math.random() * 1000);
        });

        // Allow Ctrl+Enter to submit
        textarea.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key === 'Enter') {
                checkBtn.click();
            }
        });

        /**
         * Generate simulated AI feedback based on heuristics.
         * In production, this would call the Gemini API endpoint.
         */
        function generateFeedback(sentence, word) {
            var result = {
                grammar: { score: 0, message: '' },
                usage: { score: 0, message: '' },
                spelling: { score: 0, message: '' },
                overall: 0,
                suggestion: ''
            };

            var lower = sentence.toLowerCase();
            var words = sentence.split(/\s+/);
            var wordCount = words.length;

            // --- Grammar Check (heuristic) ---
            var startsWithCapital = /^[A-ZƏÖÜŞÇĞIİ]/.test(sentence);
            var endsWithPunctuation = /[.!?]$/.test(sentence);
            var grammarScore = 70;

            if (startsWithCapital) grammarScore += 10;
            else result.grammar.message += 'Cümlə böyük hərflə başlamalıdır. ';

            if (endsWithPunctuation) grammarScore += 10;
            else result.grammar.message += 'Cümlə nöqtə, nida və ya sual işarəsi ilə bitməlidir. ';

            if (wordCount >= 5) grammarScore += 10;
            else result.grammar.message += 'Daha uzun cümlə qurmağa çalışın. ';

            result.grammar.score = Math.min(grammarScore, 100);
            if (!result.grammar.message) result.grammar.message = 'Qrammatika baxımından düzgün görünür!';

            // --- Word Usage Check ---
            var usageScore = 0;
            if (lower.includes(word)) {
                usageScore = 80;
                if (wordCount >= 8) {
                    usageScore = 95;
                    result.usage.message = 'Əla! Sözü kontekstdə çox yaxşı istifadə etmisiniz.';
                } else {
                    result.usage.message = 'Sözü düzgün istifadə etmisiniz. Daha geniş kontekst əlavə edin.';
                }
            } else {
                usageScore = 20;
                result.usage.message = '"' + word.toUpperCase() + '" sözünü cümlənizdə istifadə etməmisiniz. Zəhmət olmasa yenidən cəhd edin.';
            }
            result.usage.score = usageScore;

            // --- Spelling Check (basic) ---
            var commonErrors = {
                'teh': 'the', 'adn': 'and', 'becuase': 'because', 'definately': 'definitely',
                'recieve': 'receive', 'occured': 'occurred', 'seperate': 'separate',
                'acheive': 'achieve', 'untill': 'until', 'wich': 'which'
            };


            var spellingIssues = [];
            words.forEach(function (w) {
                var cleaned = w.toLowerCase().replace(/[^a-zəöüşçğıi]/g, '');
                if (commonErrors[cleaned]) {
                    spellingIssues.push('"' + w + '" → "' + commonErrors[cleaned] + '"');
                }
            });

            if (spellingIssues.length === 0) {
                result.spelling.score = 100;
                result.spelling.message = 'Heç bir orfoqrafiya xətası tapılmadı!';
            } else {
                result.spelling.score = Math.max(40, 100 - (spellingIssues.length * 20));
                result.spelling.message = 'Düzəlişlər: ' + spellingIssues.join(', ');
            }

            // --- Overall Score ---
            result.overall = Math.round(
                (result.grammar.score * 0.3 + result.usage.score * 0.5 + result.spelling.score * 0.2)
            );

            // Suggestion
            if (result.overall >= 85) {
                result.suggestion = 'Əla iş! Cümləni arkadaşınızla paylaşın. 🎉';
            } else if (result.overall >= 60) {
                result.suggestion = 'Yaxşı cəhd! Aşağıdakı tövsiyələrə baxın və yenidən yoxlayın.';
            } else {
                result.suggestion = '"' + word.toUpperCase() + '" sözünü daxil edərək yeni bir cümlə yazın.';
            }

            return result;
        }

        /**
         * Render the feedback into the DOM
         */
        function renderFeedback(fb) {
            var scoreColor = fb.overall >= 80 ? '#22c55e' : (fb.overall >= 50 ? '#f59e0b' : '#ef4444');
            var scoreLabel = fb.overall >= 80 ? 'Əla' : (fb.overall >= 50 ? 'Yaxşı' : 'Təkmilləşdirmə lazımdır');

            var html = '<div class="ai-feedback-box">' +
                '<div class="feedback-header">🤖 AI Müəllim Rəyi</div>' +
                '<div class="feedback-body">' +

                '<div class="feedback-category">' +
                '<span class="feedback-category-icon">📝</span>' +
                '<div><span class="feedback-category-label">Qrammatika (' + fb.grammar.score + '/100)</span>' +
                '<span>' + fb.grammar.message + '</span></div></div>' +

                '<div class="feedback-category">' +
                '<span class="feedback-category-icon">🎯</span>' +
                '<div><span class="feedback-category-label">Söz İstifadəsi (' + fb.usage.score + '/100)</span>' +
                '<span>' + fb.usage.message + '</span></div></div>' +

                '<div class="feedback-category">' +
                '<span class="feedback-category-icon">✏️</span>' +
                '<div><span class="feedback-category-label">Orfoqrafiya (' + fb.spelling.score + '/100)</span>' +
                '<span>' + fb.spelling.message + '</span></div></div>' +

                '<div class="feedback-score" style="border-color:' + scoreColor + '33; background:' + scoreColor + '18; color:' + scoreColor + '">' +
                '⭐ Ümumi Bal: ' + fb.overall + '/100 — ' + scoreLabel + '</div>' +

                '<p style="margin-top:1rem;font-size:.85rem;color:#a0a0a0">💡 ' + fb.suggestion + '</p>' +

                '</div></div>';

            feedbackArea.innerHTML = html;
            feedbackArea.classList.add('visible');
        }
    });
})();
