/**
 * Supabase Edge Function: Gemini Chat Proxy
 * 
 * Secure proxy for Gemini API - keeps API key on server side
 * Frontend calls this function, which then calls Gemini
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Gemini API configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.0-flash";

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  language?: string;
  model?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment (secure - not exposed to client)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("[gemini-chat] GEMINI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { message, history = [], language = "en-US", model = DEFAULT_MODEL }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system instruction based on language
    const languageInstructions: Record<string, string> = {
      "en-US": "Respond in English.",
      "en-IN": "Respond in English with an Indian context when relevant.",
      "hi-IN": "आपको हिंदी में जवाब देना है। सभी responses हिंदी में होने चाहिए।",
      "ta-IN": "நீங்கள் தமிழில் பதிலளிக்க வேண்டும். அனைத்து பதில்களும் தமிழில் இருக்க வேண்டும்।",
    };

    const systemInstruction = `You are Hushh, a friendly and intelligent AI assistant created by Hushh Labs. You help users with a wide variety of tasks including answering questions, creative writing, analysis, coding, and general conversation.

Key traits:
- Warm, professional, and approachable
- Clear and concise in your responses
- Helpful and proactive in offering assistance
- Respectful of user privacy
- Knowledgeable across many domains

${languageInstructions[language] || languageInstructions["en-US"]}

Important: Never mention that you are powered by Gemini or Google. You are Hushh, created by Hushh Labs.`;

    // Build conversation history
    const contents = [
      ...history.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Call Gemini API
    const geminiUrl = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log(`[gemini-chat] Calling ${model} for message: "${message.substring(0, 50)}..."`);
    
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9,
          topK: 40,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error(`[gemini-chat] Gemini API error: ${geminiResponse.status}`, errorData);
      return new Response(
        JSON.stringify({ 
          error: "AI service error", 
          details: geminiResponse.status === 403 ? "API key issue" : "Service unavailable" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResponse.json();
    
    // Extract response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response.";

    console.log(`[gemini-chat] Response generated: "${responseText.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({
        response: responseText,
        model: model,
        usage: data.usageMetadata || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[gemini-chat] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
