/**
 * ALIELENGLISH — AI System v3.0
 * Gemini 1.5 Flash powered English teacher for Azerbaijani students
 * 30 messages/day free tier, resets at midnight Baku time (UTC+4)
 */
import { supabase } from '../js/config.js';

const AI_CONFIG = {
    apiKey: 'AIzaSyDvH7wNLFVlkU3Lr_gIf-RD2iBzjVGFWSU',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    dailyLimit: 30,
    guestLimit: 3,
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: `You are an English language teacher assistant for Azerbaijani students. Your name is "Aliel AI Müəllim".

RULES:
1. Only answer questions about English learning: grammar, vocabulary, pronunciation, writing, speaking, exercises, translations.
2. If asked anything unrelated to English learning, politely decline in Azerbaijani: "Bağışlayın, mən yalnız İngilis dili öyrənmə ilə bağlı suallara cavab verə bilərəm."
3. Never discuss politics, religion, harmful content, or anything outside English education.
4. Respond in the language the student uses (Azerbaijani or English).
5. Be encouraging, patient, and provide examples.
6. Use emojis sparingly for engagement.
7. For grammar explanations, always give at least 2 examples.
8. If the student's level is provided, adjust difficulty accordingly.`
};

// Get Baku midnight for reset
function getBakuDateString() {
    const now = new Date();
    const bakuOffset = 4 * 60; // UTC+4
    const bakuTime = new Date(now.getTime() + (bakuOffset + now.getTimezoneOffset()) * 60000);
    return bakuTime.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Check and manage daily usage
async function checkDailyUsage(userId) {
    const today = getBakuDateString();

    if (!userId) {
        // Guest user - use localStorage
        let guestData = JSON.parse(localStorage.getItem('ai_guest_usage') || '{}');
        if (guestData.date !== today) {
            guestData = { date: today, count: 0 };
        }
        return {
            allowed: guestData.count < AI_CONFIG.guestLimit,
            count: guestData.count,
            max: AI_CONFIG.guestLimit,
            remaining: Math.max(0, AI_CONFIG.guestLimit - guestData.count),
            isGuest: true
        };
    }

    try {
        // Check premium status
        const user = window.getCurrentUser ? window.getCurrentUser() : null;
        const isPremium = user && (user.role === 'admin' || user.premium_active);
        if (isPremium) {
            return { allowed: true, count: 0, max: Infinity, remaining: Infinity, isPremium: true };
        }

        // Check Supabase usage - use users table directly
        const { data, error } = await supabase
            .from('users')
            .select('daily_query_count, last_reset_date')
            .eq('uid', userId)
            .single();

        if (error) throw error;

        let count = data?.daily_query_count || 0;
        const lastReset = data?.last_reset_date ? data.last_reset_date.split('T')[0] : '';

        // Reset if new day
        if (lastReset !== today) {
            count = 0;
            await supabase.from('users').update({
                daily_query_count: 0,
                last_reset_date: new Date().toISOString()
            }).eq('uid', userId);
        }

        return {
            allowed: count < AI_CONFIG.dailyLimit,
            count: count,
            max: AI_CONFIG.dailyLimit,
            remaining: Math.max(0, AI_CONFIG.dailyLimit - count)
        };
    } catch (e) {
        console.error('Usage check error:', e);
        // Fallback to localStorage
        let localData = JSON.parse(localStorage.getItem(`ai_usage_${userId}`) || '{}');
        if (localData.date !== today) localData = { date: today, count: 0 };
        return {
            allowed: localData.count < AI_CONFIG.dailyLimit,
            count: localData.count,
            max: AI_CONFIG.dailyLimit,
            remaining: Math.max(0, AI_CONFIG.dailyLimit - localData.count)
        };
    }
}

// Increment usage count
async function incrementUsage(userId) {
    const today = getBakuDateString();

    if (!userId) {
        let guestData = JSON.parse(localStorage.getItem('ai_guest_usage') || '{}');
        if (guestData.date !== today) guestData = { date: today, count: 0 };
        guestData.count++;
        localStorage.setItem('ai_guest_usage', JSON.stringify(guestData));
        return guestData.count;
    }

    try {
        const { data } = await supabase
            .from('users')
            .select('daily_query_count')
            .eq('uid', userId)
            .single();

        const newCount = ((data?.daily_query_count) || 0) + 1;
        await supabase.from('users').update({
            daily_query_count: newCount,
            last_reset_date: new Date().toISOString()
        }).eq('uid', userId);

        return newCount;
    } catch (e) {
        // Fallback
        let localData = JSON.parse(localStorage.getItem(`ai_usage_${userId}`) || '{}');
        if (localData.date !== today) localData = { date: today, count: 0 };
        localData.count++;
        localStorage.setItem(`ai_usage_${userId}`, JSON.stringify(localData));
        return localData.count;
    }
}

// Call Gemini API
async function callGemini(message, history = [], userLevel = 'B1') {
    const systemInstruction = AI_CONFIG.systemPrompt + `\nStudent's current level: ${userLevel}`;

    const contents = [];

    // Add conversation history
    history.forEach(h => {
        contents.push({ role: 'user', parts: [{ text: h.user }] });
        contents.push({ role: 'model', parts: [{ text: h.ai }] });
    });

    // Add current message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const body = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: contents,
        generationConfig: {
            maxOutputTokens: AI_CONFIG.maxTokens,
            temperature: AI_CONFIG.temperature,
            topP: 0.95,
            topK: 40
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    };

    const response = await fetch(`${AI_CONFIG.apiUrl}?key=${AI_CONFIG.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Cavab alınmadı. Yenidən cəhd edin.';
}

// Export for global use
window.AISystem = {
    checkUsage: checkDailyUsage,
    incrementUsage: incrementUsage,
    chat: callGemini,
    config: AI_CONFIG,
    getBakuDate: getBakuDateString
};

export { checkDailyUsage, incrementUsage, callGemini, AI_CONFIG };
