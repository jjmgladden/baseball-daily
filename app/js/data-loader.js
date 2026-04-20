/**
 * JSON data loader — v4
 *
 * Consumes files written by ingestion/ and scripts/ into data/.
 * The browser NEVER calls a live API. All data comes from these files.
 *
 * Paths are RELATIVE (../data/...) so the app works both on localhost
 * and at a GitHub Pages subpath like /baseball-daily/.
 *
 * Master loaders are memoized — calling them twice reuses the same fetch.
 */

const masterCache = new Map();

export async function loadLatestSnapshot() {
  const res = await fetch('../data/snapshots/latest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Snapshot load failed: HTTP ${res.status}`);
  return res.json();
}

export async function loadSnapshot(date) {
  const res = await fetch(`../data/snapshots/${date}.json`);
  if (!res.ok) throw new Error(`Snapshot ${date} load failed: HTTP ${res.status}`);
  return res.json();
}

export async function loadMaster(name) {
  if (masterCache.has(name)) return masterCache.get(name);
  const promise = fetch(`../data/master/${name}`).then(res => {
    if (!res.ok) throw new Error(`Master ${name} load failed: HTTP ${res.status}`);
    return res.json();
  });
  masterCache.set(name, promise);
  return promise;
}

export async function loadFranchises()        { return loadMaster('franchises.json'); }
export async function loadStories()           { return loadMaster('stories.json'); }
export async function loadPlayerIndex()       { return loadMaster('player-index.json'); }
export async function loadTrivia()            { return loadMaster('trivia.json'); }
export async function loadCardinalsDeep()     { return loadMaster('cardinals-deep.json'); }
export async function loadCardinalsLinks()    { return loadMaster('cardinals-links.json'); }
export async function loadHistoryLinks()      { return loadMaster('history-links.json'); }
export async function loadHistoricalVideos()  { return loadMaster('historical-videos.json'); }
