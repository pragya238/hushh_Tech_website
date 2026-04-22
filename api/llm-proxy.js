/**
 * api/llm-proxy.js
 *
 * Serverless proxy for LLM API calls (Gemini + OpenAI).
 * Keeps API keys out of the client-side JS bundle by handling
 * all LLM requests server-side via this Vercel function.
 *
 * Usage from client:
 *   POST /api/llm-proxy
 *   Body: { provider: 'gemini' | 'openai', payload: {...} }
 *
 * Environment variables required (NO VITE_ prefix — never exposed to browser):
 *   GEMINI_API_KEY
 *   GEMINI_API_KEY_FALLBACK_1
 *   GEMINI_API_KEY_FALLBACK_2
 *   GEMINI_API_KEY_FALLBACK_3
 *   OPENAI_API_KEY
 */

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

const ALLOWED_ORIGINS = [
  'https://hushh-tech.vercel.app',
  'https://hushhtech.com',
  'https://www.hushhtech.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

/**
 * Returns the first available Gemini API key from the environment.
 * Tries primary key then fallbacks in order.
 */
function getGeminiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY_FALLBACK_1 ||
    process.env.GEMINI_API_KEY_FALLBACK_2 ||
    process.env.GEMINI_API_KEY_FALLBACK_3 ||
    null
  );
}

/**
 * Validates that the request origin is an allowed Hushh domain.
 */
function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Main Vercel serverless handler.
 */
export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Vary', 'Origin');

  // Enforce origin policy before any other processing.
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden: Invalid origin' });
  }

  // Origin is allowed, set CORS headers for the response.
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight.
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, model, payload } = req.body || {};

  if (!provider || !payload) {
    return res.status(400).json({ error: 'Missing required fields: provider, payload' });
  }

  try {
    if (provider === 'gemini') {
      const apiKey = getGeminiKey();
      if (!apiKey) {
        return res.status(503).json({ error: 'Gemini service unavailable' });
      }

      const geminiModel = model || 'gemini-2.0-flash';
      const url = `${GEMINI_ENDPOINT}/${geminiModel}:generateContent`;

      const upstream = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    }

    if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'OpenAI service unavailable' });
      }

      const upstream = await fetch(OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    }

    return res.status(400).json({ error: `Unsupported provider: ${provider}` });
  } catch (err) {
    console.error('[llm-proxy] Upstream error:', err?.message || err);
    return res.status(502).json({ error: 'Upstream LLM request failed' });
  }
}
