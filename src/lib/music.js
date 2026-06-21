// Album metadata from public catalogs (Apple/iTunes Search) + context from Wikipedia.
// No keys required. Album art + collectionId are cached in localStorage.

const ART = "spindle_art_v2";
const cache = (() => { try { return JSON.parse(localStorage.getItem(ART) || "{}"); } catch { return {}; } })();
const save = () => { try { localStorage.setItem(ART, JSON.stringify(cache)); } catch {} };
const keyOf = (a) => (a.artist + "|" + a.title).toLowerCase();

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
  const r = await fetch(`https://itunes.apple.com/search?media=music&entity=album&limit=25&term=${encodeURIComponent(term)}`);
  const d = await r.json();
  const seen = new Set();
  return (d.results || []).filter(x => x.collectionName && !seen.has(x.collectionId) && seen.add(x.collectionId)).map(mapAlbum);
}

// Resolve a {title,artist} seed to a real catalog album (with album_id + art). Cached.
export async function resolveSeed(seed) {
  const k = keyOf(seed);
  if (cache[k]) return { ...seed, ...cache[k] };
  const terms = [seed.artist + " " + seed.title, seed.title + " " + seed.artist, seed.title];
  const aLow = seed.artist.toLowerCase();
  for (const term of terms) {
    try {
      const r = await fetch(`https://itunes.apple.com/search?media=music&entity=album&limit=8&term=${encodeURIComponent(term)}`);
      const d = await r.json();
      const hit = (d.results || []).find(x => { const n = (x.artistName || "").toLowerCase(); return n.includes(aLow) || aLow.includes(n); }) || (term === seed.title ? null : (d.results || [])[0]);
      if (hit) { const m = mapAlbum(hit); cache[k] = { album_id: m.album_id, artist_id: m.artist_id, art: m.art, year: m.year, genre: m.genre }; save(); return { ...seed, ...cache[k] }; }
    } catch {}
  }
  return seed;
}

export async function getAlbum(albumId) {
  const r = await fetch(`https://itunes.apple.com/lookup?id=${albumId}&entity=song&limit=300`);
  const d = await r.json();
  const col = (d.results || []).find(x => x.wrapperType === "collection");
  const tracks = (d.results || [])
    .filter(x => x.wrapperType === "track" || x.kind === "song")
    .sort((a, b) => ((a.discNumber || 1) - (b.discNumber || 1)) || ((a.trackNumber || 0) - (b.trackNumber || 0)));
  return { album: col ? mapAlbum(col) : null, tracks };
}

export async function getArtistAlbums(name, artistId) {
  try {
    if (artistId) {
      const r = await fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=80`);
      const d = await r.json();
      const al = (d.results || []).filter(x => x.wrapperType === "collection");
      if (al.length) return dedupeSort(al.map(mapAlbum));
    }
    const r2 = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&media=music&entity=album&attribute=artistTerm&limit=80`);
    const d2 = await r2.json();
    const aLow = name.toLowerCase();
    return dedupeSort((d2.results || []).filter(x => (x.artistName || "").toLowerCase().includes(aLow)).map(mapAlbum));
  } catch { return []; }
}
function dedupeSort(list) { const s = new Set(); return list.filter(a => a.album_id && !s.has(a.album_id) && s.add(a.album_id)).sort((a, b) => (+b.year || 0) - (+a.year || 0)); }

export async function wikiAbout(query) {
  try {
    const s = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`);
    const sd = await s.json();
    const hit = sd.query && sd.query.search && sd.query.search[0];
    if (!hit) return null;
    const sum = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`);
    const sm = await sum.json();
    const url = (sm.content_urls && sm.content_urls.desktop && sm.content_urls.desktop.page) || `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`;
    return { title: sm.title || hit.title, extract: sm.type === "disambiguation" ? null : (sm.extract || null), url };
  } catch { return null; }
}

export const spotifyUrl = (a) => `https://open.spotify.com/search/${encodeURIComponent(a.artist + " " + a.title)}`;
export const ytUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
export const geniusUrl = (q) => `https://genius.com/search?q=${encodeURIComponent(q)}`;
