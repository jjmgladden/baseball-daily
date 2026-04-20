/**
 * Favorites — v1
 *
 * localStorage-backed watchlist of player MLBAM IDs.
 * Kept simple: single array under one key, no per-player metadata.
 */

const KEY = 'baseball-daily.favorites.v1';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(n => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

export function isFavorite(mlbamId) {
  return getFavorites().includes(Number(mlbamId));
}

export function addFavorite(mlbamId) {
  const id = Number(mlbamId);
  if (!Number.isFinite(id)) return;
  const list = getFavorites();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function removeFavorite(mlbamId) {
  const id = Number(mlbamId);
  const list = getFavorites().filter(x => x !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function toggleFavorite(mlbamId) {
  if (isFavorite(mlbamId)) { removeFavorite(mlbamId); return false; }
  addFavorite(mlbamId);
  return true;
}

export function clearFavorites() {
  localStorage.removeItem(KEY);
}
