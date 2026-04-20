#!/usr/bin/env node
/**
 * check-secrets — Pre-commit scanner.
 *
 * Scans the repo (excluding gitignored + data + node_modules) for common
 * API-key and private-key patterns. Exits 1 on any hit so CI/pre-commit
 * hooks can block the push.
 *
 * Usage:  node scripts/check-secrets.js    (or:  npm run check-secrets)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const PATTERNS = [
  { name: 'Google API Key',        regex: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'GitHub Token',          regex: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: 'AWS Access Key',        regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'OpenAI API Key',        regex: /sk-[A-Za-z0-9]{32,}/ },
  { name: 'Anthropic API Key',     regex: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'Slack Token',           regex: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'Private Key (PEM)',     regex: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'JSON api_key field',    regex: /"api[_-]?key"\s*:\s*"[A-Za-z0-9][^"]{12,}"/i },
  { name: 'ENV-style API_KEY',     regex: /\b[A-Z_]*API[_-]?KEY\b\s*=\s*["']?[A-Za-z0-9_-]{20,}/ },
];

const SKIP_DIRS = new Set(['.git', 'node_modules', 'data', 'logs', 'archive', '.vscode', '.idea']);
const SKIP_FILES = new Set(['.env.example', 'check-secrets.js']);

function walk(dir, hits) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), hits);
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      const file = path.join(dir, entry.name);
      let content;
      try { content = fs.readFileSync(file, 'utf8'); }
      catch { continue; }
      for (const p of PATTERNS) {
        const match = content.match(p.regex);
        if (match) {
          hits.push({
            file: path.relative(PROJECT_ROOT, file),
            pattern: p.name,
            preview: match[0].slice(0, 12) + '...',
          });
        }
      }
    }
  }
}

const hits = [];
walk(PROJECT_ROOT, hits);

if (hits.length === 0) {
  console.log('[check-secrets] OK — no secrets detected.');
  process.exit(0);
}

console.error('[check-secrets] FAIL — potential secrets found:');
for (const h of hits) {
  console.error(`  [${h.pattern}]  ${h.file}  (${h.preview})`);
}
console.error('\nRemove or move to .env before committing.');
process.exit(1);
