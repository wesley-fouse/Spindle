// Album metadata via our own /api proxy (which forwards to Apple/Wikipedia and
// caches at the edge). Adds client-side throttling + retry so a burst of cover
// lookups doesn't trip Apple's per-IP rate limit. Art/ids cached in localStorage.

const ART = "spindle_art_v2";
const cache = (() => { try { return JSON.parse(localStorage.getItem(ART) || "{}"); } catch { return {}; } })();
const save = () => { try { localStorage.setItem(ART, JSON.stringify(cache)); } catch {} };
const keyOf = (a) => (a.artist + "|" + a.title).toLowerCase();

// ---- fetch with retry/backoff (handles transient 403/429/5xx throttling) ----
async function fetchJSON(path, retries = 3) {
  let err;
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(path);
      if (r.status === 429 || r.status === 403 || r.status >= 500) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { err = e; if (i < retries) await new Promise(s => setTimeout(s, 350 * (i + 1) * (i + 1))); }
  }
  throw err;
}

// ---- concurrency limiter for the bursty background cover resolution ----
const MAXC = 3; let active = 0; const q = [];
function drain() { while (active < MAXC && q.length) { active++; q.shift()().finally(() => { active--; drain(); }); } }
function throttled(path) { return new Promise((res, rej) => { q.push(() => fetchJSON(path).then(res, rej)); drain(); }); }

export function mapAlbum(x) {
  return {
    album_id: String(x.collectionId),
    artist_id: x.artistId ? String(x.artistId) : null,
    title: x.collectionName,
    artist: x.artistName,
    year: x.releaseDate ? x.releaseDate.slice(0, 4) : "",
    genre: x.primaryGenreName || "",
    art: x.artworkUrl100 ? x.artworkUrl100.replace("100x100bb", "600x600bb") : null,
  };
}

export async function searchAlbums(term) {
  const d = await fetchJSON(`/api/itunes/search?media=music&entity=album&limit=25&term=${encodeURIComponent(term)}`);
  const seen = new Set();
  return (d.results || []).filter(x => x.collectionName && !seen.has(x.collectionId) && seen.add(x.collectionId)).map(mapAlbum);
}

// Resolve a {title,artist} seed to a real catalog album (with album_id + art). Cached + throttled.
export async function resolveSeed(seed) {
  const k = keyOf(seed);
  if (cache[k]) return { ...seed, ...cache[k] };
  const terms = [seed.artist + " " + seed.title, seed.title + " " + seed.artist, seed.title];
  const aLow = seed.artist.toLowerCase();
  for (const term of terms) {
    try {
      const d = await throttled(`/api/itunes/search?media=music&entity=album&limit=8&term=${encodeURIComponent(term)}`);
      const hit = (d.results || []).find(x => { const n = (x.artistName || "").toLowerCase(); return n.includes(aLow) || aLow.includes(n); }) || (term === seed.title ? null : (d.results || [])[0]);
      if (hit) { const m = mapAlbum(hit); cache[k] = { album_id: m.album_id, artist_id: m.artist_id, art: m.art, year: m.year, genre: m.genre }; save(); return { ...seed, ...cache[k] }; }
    } catch {}
  }
  return seed;
}

export async function getAlbum(albumId) {
  const d = await fetchJSON(`/api/itunes/lookup?id=${albumId}&entity=song&limit=300`);
  const col = (d.results || []).find(x => x.wrapperType === "collection");
  const tracks = (d.results || [])
    .filter(x => x.wrapperType === "track" || x.kind === "song")
    .sort((a, b) => ((a.discNumber || 1) - (b.discNumber || 1)) || ((a.trackNumber || 0) - (b.trackNumber || 0)));
  return { album: col ? mapAlbum(col) : null, tracks };
}

export async function getArtistAlbums(name, artistId) {
  try {
    if (artistId) {
      const d = await fetchJSON(`/api/itunes/lookup?id=${artistId}&entity=album&limit=80`);
      const al = (d.results || []).filter(x => x.wrapperType === "collection");
      if (al.length) return dedupeSort(al.map(mapAlbum));
    }
    const d2 = await fetchJSON(`/api/itunes/search?term=${encodeURIComponent(name)}&media=music&entity=album&attribute=artistTerm&limit=80`);
    const aLow = name.toLowerCase();
    return dedupeSort((d2.results || []).filter(x => (x.artistName || "").toLowerCase().includes(aLow)).map(mapAlbum));
  } catch { return []; }
}
function dedupeSort(list) { const s = new Set(); return list.filter(a => a.album_id && !s.has(a.album_id) && s.add(a.album_id)).sort((a, b) => (+b.year || 0) - (+a.year || 0)); }

export async function wikiAbout(query) {
  try {
    const sd = await fetchJSON(`/api/wiki/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json`);
    const hit = sd.query && sd.query.search && sd.query.search[0];
    if (!hit) return null;
    const sm = await fetchJSON(`/api/wiki/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`);
    const url = (sm.content_urls && sm.content_urls.desktop && sm.content_urls.desktop.page) || `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`;
    return { title: sm.title || hit.title, extract: sm.type === "disambiguation" ? null : (sm.extract || null), url };
  } catch { return null; }
}

// Fetch the Apple Music top-albums chart (no rate limits, full artwork + IDs).
export async function fetchCharts(limit = 100) {
  const d = await fetchJSON(`https://rss.applemarketingtools.com/api/v2/us/music/most-played/${limit}/albums.json`, 1);
  return (d.feed?.results || []).map(r => ({
    album_id: r.id,
    artist_id: null,
    title: r.name,
    artist: r.artistName,
    art: r.artworkUrl100 ? r.artworkUrl100.replace("100x100bb", "600x600bb") : null,
    year: r.releaseDate ? r.releaseDate.slice(0, 4) : "",
    genre: (r.genreNames || [])[0] || "",
  }));
}

export const spotifyUrl = (a) => `https://open.spotify.com/search/${encodeURIComponent(a.artist + " " + a.title)}`;
export const ytUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
export const geniusUrl = (q) => `https://genius.com/search?q=${encodeURIComponent(q)}`;
