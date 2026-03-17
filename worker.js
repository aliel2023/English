/**
 * Cloudflare Worker for AI Teacher (Claude 3.5 Sonnet API)
 * 
 * Usage:
 * Deploy this via Cloudflare Dash -> Workers & Pages
 * Set CLAUDE_API_KEY as a secret variable
 */

export default {
  async fetch(request, env, ctx) {
    // Enable CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const { contents } = await request.json();
      
      // Transform format for Claude API
      const systemPrompt = contents[0]?.parts[0]?.text || "";
      let messages = [];
      
      if (contents.length > 0) {
        // Strip system prompt from first message for Claude API
        const firstMessageText = contents[0].parts[0].text;
        const actualUserMessage = firstMessageText.split('\n\n').pop();
        
        messages.push({
          role: "user",
          content: actualUserMessage
        });
        
        for (let i = 1; i < contents.length; i++) {
          messages.push({
            role: contents[i].role === 'model' ? 'assistant' : 'user',
            content: contents[i].parts[0].text
          });
        }
      }

      // Call Claude API (Sonnet 3.5)
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages,
          temperature: 0.7
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        throw new Error(`Claude API Error: ${claudeResponse.status} - ${errorText}`);
      }

      const claudeData = await claudeResponse.json();
      const aiReply = claudeData.content[0].text;

      // Wrap back to the Gemini-like format the frontend expects
      return new Response(JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: aiReply }]
            }
          }
        ]
      }), { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      });
    }
  }
};
