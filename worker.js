/**
 * Cloudflare Worker for AI Teacher (Claude API)
 * 
 * Deploy: Cloudflare Dash -> Workers & Pages
 * Secret: CLAUDE_API_KEY
 */

const ALLOWED_ORIGIN = "https://aliel2023.github.io";
const SYSTEM_PROMPT_SEPARATOR = "\n\n---USER_MSG---\n\n";

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const isAllowed = origin === ALLOWED_ORIGIN || origin.startsWith("http://localhost");

    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    try {
      const body = await request.json();
      const { contents } = body;

      if (!Array.isArray(contents) || contents.length === 0) {
        return new Response(JSON.stringify({ error: "Invalid request format" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      const firstText = contents[0]?.parts?.[0]?.text || "";
      let systemPrompt = "";
      let firstUserMessage = firstText;

      if (firstText.includes(SYSTEM_PROMPT_SEPARATOR)) {
        const sepIndex = firstText.indexOf(SYSTEM_PROMPT_SEPARATOR);
        systemPrompt = firstText.substring(0, sepIndex);
        firstUserMessage = firstText.substring(sepIndex + SYSTEM_PROMPT_SEPARATOR.length);
      } else {
        systemPrompt = firstText;
        firstUserMessage = firstText;
      }

      let messages = [{ role: "user", content: firstUserMessage }];

      for (let i = 1; i < contents.length; i++) {
        const part = contents[i];
        if (!part?.parts?.[0]?.text) continue;
        messages.push({
          role: part.role === 'model' ? 'assistant' : 'user',
          content: part.parts[0].text
        });
      }

      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages,
          temperature: 0.7
        })
      });

      if (!claudeResponse.ok) {
        console.error(`Claude API Error: ${claudeResponse.status}`);
        return new Response(JSON.stringify({
          error: "AI xidmətində müvəqqəti problem. Zəhmət olmasa yenidən cəhd edin."
        }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      const claudeData = await claudeResponse.json();
      const aiReply = claudeData.content?.[0]?.text || "";

      return new Response(JSON.stringify({
        candidates: [{
          content: {
            parts: [{ text: aiReply }]
          }
        }]
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (err) {
      console.error('Worker error:', err.message);
      return new Response(JSON.stringify({
        error: "Xidmətdə müvəqqəti problem. Zəhmət olmasa yenidən cəhd edin."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
