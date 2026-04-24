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
/**
 * Validates that the request origin is an allowed Hushh domain.
 */
function isAllowedOrigin(origin) {
function isAllowedOrigin(origin) {
  // Deny requests that are not from an allowed origin.
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');

  // Enforce origin policy before any other processing.
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden: Invalid origin' });
  }

  // Origin is allowed, set CORS headers for the response.
  ...
