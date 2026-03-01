/**
 * Vercel Serverless Function: Gemini Agent Chat
 * 
 * Like gemini-chat but accepts a custom systemInstruction
 * for agent-specific chatbots (Kirkland agents, etc.)
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.0-flash";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const {
      message,
      history = [],
      systemInstruction = '',
      model = DEFAULT_MODEL,
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use custom system instruction or fallback
    const sysText = systemInstruction || 
      'You are a helpful AI assistant powered by Hushh Intelligence. Be concise and helpful.';

    // Build contents from history
    const contents = [
      ...history.map((msg) => ({
        role: msg.role,
        parts: msg.parts || [{ text: msg.content || '' }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const geminiUrl = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: sysText }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9,
          topK: 40,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error(`[gemini-agent-chat] Error: ${geminiResponse.status}`, errorData);
      return res.status(500).json({ error: 'AI service error', status: geminiResponse.status });
    }

    const data = await geminiResponse.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response.";

    return res.status(200).json({
      response: responseText,
      model,
      usage: data.usageMetadata || null,
    });
  } catch (error) {
    console.error('[gemini-agent-chat] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
