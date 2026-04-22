/**
 * tests/llmKeyLeakPrevention.test.ts
 *
 * Verifies that no VITE_GEMINI_* or VITE_OPENAI_API_KEY environment variable
 * references exist inside the src/ directory.
 *
 * Background:
 * Any environment variable prefixed with VITE_ is embedded into the client-side
 * JS bundle at build time by Vite. This means VITE_GEMINI_API_KEY would be visible
 * to anyone who opens DevTools → Sources on the deployed site.
 *
 * The correct pattern is to use server-side env vars (no VITE_ prefix) accessed
 * only through the /api/llm-proxy serverless route.
 *
 * This test fails the CI pipeline if any developer accidentally re-introduces
 * a browser-exposed LLM key reference in source code.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

// Patterns that must NOT appear in src/ files
const FORBIDDEN_PATTERNS: RegExp[] = [
  /VITE_GEMINI_API_KEY/,
  /VITE_GEMINI_API_KEY_FALLBACK_\d/,
  /VITE_OPENAI_API_KEY/,
  /import\.meta\.env\.VITE_GEMINI/,
  /import\.meta\.env\.VITE_OPENAI/,
];

// File extensions to scan
const SCANNABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

// Directories to skip inside src/
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);

/**
 * Recursively collects all scannable source files under a given directory.
 */
function collectFiles(dir: string): string[] {
  const results: string[] = [];
  let entries: string[];

  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (SCANNABLE_EXTENSIONS.has(extname(entry))) {
      results.push(fullPath);
    }
  }

  return results;
}

describe('LLM API key browser-exposure prevention', () => {
  it('src/ must not reference VITE_GEMINI_API_KEY (would expose key in JS bundle)', () => {
    const files = collectFiles('src');
    expect(files.length).toBeGreaterThan(0, 'Test failed: No source files found to scan in src/.');
    const violations: string[] = [];

    for (const file of files) {
      let content: string;
      try {
        content = readFileSync(file, 'utf-8');
      } catch {
        continue;
      }

      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${file} — matches forbidden pattern: ${pattern.source}`);
          break;
        }
      }
    }

    if (violations.length > 0) {
      const report = [
        '',
        '❌ Browser-exposed LLM key references found in src/:',
        ...violations.map(v => `  • ${v}`),
        '',
        'Fix: Use /api/llm-proxy instead of calling LLM APIs directly from the browser.',
        'Server-side env vars (no VITE_ prefix) are set in Vercel project settings.',
        'See: api/llm-proxy.js',
        '',
      ].join('\n');

      expect.fail(report);
    }

    expect(violations).toHaveLength(0);
  });

  it('api/llm-proxy.js must exist to serve as the server-side LLM gateway', () => {
    let exists = false;
    try {
      statSync('api/llm-proxy.js');
      exists = true;
    } catch {
      exists = false;
    }

    expect(
      exists,
      'api/llm-proxy.js is missing. This file is the required server-side proxy for LLM keys.'
    ).toBe(true);
  });
});
