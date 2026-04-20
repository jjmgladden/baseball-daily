/**
 * Minimal .env loader — no dependencies.
 *
 * Reads KEY=VALUE lines from the project-root .env (if present) into
 * process.env. Does NOT override variables that are already set — so
 * GitHub Actions (which passes secrets via the job's env: block) still
 * wins over a stale .env file.
 *
 * Ignores blank lines, # comments, and malformed lines.
 * Strips surrounding single/double quotes from values.
 */

const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return { loaded: 0, path: envPath, found: false };

  const content = fs.readFileSync(envPath, 'utf8');
  let loaded = 0;

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Do NOT override if the variable is already in the real environment
    // (e.g. GitHub Actions passing the secret via env:)
    if (!(key in process.env)) {
      process.env[key] = value;
      loaded++;
    }
  }

  return { loaded, path: envPath, found: true };
}

module.exports = { loadEnvFile };
