/**
 * Story state — v1
 *
 * Per-browser, localStorage-backed tracking of which stories the
 * visitor has read and which they've favorited. Two separate stores
 * so reads and favorites can be toggled independently.
 *
 * Keys:
 *   baseball-daily.stories-read.v1        JSON array of story IDs
 *   baseball-daily.stories-favorites.v1   JSON array of story IDs
 *
 * Fails silently if localStorage is unavailable (private browsing, etc.) —
 * the UI still works; marks just don't persist across reloads.
 */

const READ_KEY = 'baseball-daily.stories-read.v1';
const FAV_KEY  = 'baseball-daily.stories-favorites.v1';

function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* storage unavailable or quota hit — degrade silently */
  }
}

export const readStore = {
  isRead: id => loadSet(READ_KEY).has(id),
  markRead: id => { const s = loadSet(READ_KEY); s.add(id); saveSet(READ_KEY, s); },
  markUnread: id => { const s = loadSet(READ_KEY); s.delete(id); saveSet(READ_KEY, s); },
  toggle: id => {
    const s = loadSet(READ_KEY);
    if (s.has(id)) s.delete(id); else s.add(id);
    saveSet(READ_KEY, s);
    return s.has(id);
  },
  count: () => loadSet(READ_KEY).size,
  clear: () => { try { localStorage.removeItem(READ_KEY); } catch {} },
};

export const favStore = {
  isFavorite: id => loadSet(FAV_KEY).has(id),
  toggle: id => {
    const s = loadSet(FAV_KEY);
    if (s.has(id)) s.delete(id); else s.add(id);
    saveSet(FAV_KEY, s);
    return s.has(id);
  },
  count: () => loadSet(FAV_KEY).size,
  clear: () => { try { localStorage.removeItem(FAV_KEY); } catch {} },
};
