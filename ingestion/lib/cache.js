/**
 * Cache layer — v1
 * Thin wrappers over the filesystem for snapshot and master JSON files.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'snapshots');
const MASTER_DIR = path.join(DATA_DIR, 'master');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeSnapshot(name, payload) {
  ensureDir(SNAPSHOTS_DIR);
  const file = path.join(SNAPSHOTS_DIR, name);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
}

function readSnapshot(name) {
  const file = path.join(SNAPSHOTS_DIR, name);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeMaster(name, payload) {
  ensureDir(MASTER_DIR);
  const file = path.join(MASTER_DIR, name);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
}

function readMaster(name) {
  const file = path.join(MASTER_DIR, name);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

module.exports = {
  PROJECT_ROOT,
  DATA_DIR,
  SNAPSHOTS_DIR,
  MASTER_DIR,
  writeSnapshot,
  readSnapshot,
  writeMaster,
  readMaster,
  todayISO,
  yesterdayISO,
};
