#!/usr/bin/env node
/**
 * fetch-highlights — Phase 3B
 *
 * Queries the official MLB YouTube channel for recent clips mentioning
 * a team (Cardinals and Nationals by default). Returns normalized entries
 * for inclusion in the daily snapshot.
 *
 * If YOUTUBE_API_KEY is not set, this returns [] without error — the rest
 * of ingestion continues normally. Graceful degradation.
 */

const yt = require('./lib/youtube-api');

// Canonical MLB channel on YouTube. Verified via a quick `search` once —
// all first-party recaps, press conferences, and highlight reels come
// through this channel.
const MLB_CHANNEL_ID = 'UCoLrcjPV5PbUrUyXq5mjc_A';

/**
 * Fetch recent MLB-channel videos that mention a given team name.
 *
 * @param {string} teamName          - e.g. 'Cardinals', 'Nationals'
 * @param {object} [options]
 * @param {number} [options.lookbackHours=48]  - window of videos to search
 * @param {number} [options.maxResults=3]      - cap on returned videos
 */
async function fetchTeamHighlights(teamName, options = {}) {
  if (!process.env.YOUTUBE_API_KEY) {
    return [];  // graceful skip when key is not configured
  }

  const lookbackHours = options.lookbackHours ?? 48;
  const maxResults = options.maxResults ?? 3;
  const publishedAfter = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();

  const result = await yt.search({
    channelId: MLB_CHANNEL_ID,
    q: teamName,
    publishedAfter,
    maxResults,
    order: 'date',
  });

  return (result.items || [])
    .filter(item => item.id?.videoId)
    .map(item => ({
      videoId: item.id.videoId,
      title: item.snippet?.title || '',
      description: (item.snippet?.description || '').slice(0, 240),
      publishedAt: item.snippet?.publishedAt || null,
      channelTitle: item.snippet?.channelTitle || null,
      thumbnailUrl:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null,
    }));
}

module.exports = { fetchTeamHighlights, MLB_CHANNEL_ID };

if (require.main === module) {
  (async () => {
    for (const team of ['Cardinals', 'Nationals']) {
      const vids = await fetchTeamHighlights(team);
      console.log(`[fetch-highlights] ${team}: ${vids.length} videos`);
      for (const v of vids) console.log(`  - ${v.publishedAt}  ${v.title}`);
    }
  })().catch(err => { console.error(err); process.exit(1); });
}
