import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { POOL, NEW_2026, CATEGORIES, catSeeds, seededShuffle, loadArtCache, artKey } from "../lib/seeds";
import { searchAlbums, resolveSeed } from "../lib/music";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { AlbumGrid, Tile } from "../components/Tile";
import { Avatar, useInView } from "../components/bits";
import Icon from "../components/Icon";

function CatCard({ cat, onOpen }) {
  const rep = catSeeds(cat)[0];
  const [a, setA] = useState(rep);
  const ref = useInView(async () => { if (!a.album_id) setA(await resolveSeed(rep)); }, cat.key);
  return <div ref={ref} onClick={onOpen} style={{ position: "relative", overflow: "hidden", background: cat.color, color: "#fff", borderRadius: 10, aspectRatio: "1.7 / 1", padding: "15px 16px", cursor: "pointer" }}>
    <div className="display" style={{ fontSize: "clamp(16px,2.3vw,22px)", fontWeight: 600, maxWidth: "62%", lineHeight: 1.1 }}>{cat.key}</div>
    <div style={{ position: "absolute", right: -12, bottom: -8, width: "38%", maxWidth: 100, aspectRatio: "1/1", transform: "rotate(25deg)", borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 16px rgba(0,0,0,.35)", background: a.art ? "transparent" : "rgba(255,255,255,.18)" }}>
      {a.art && <img src={a.art} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </div>
  </div>;
}

// Collapse album results into a unique, query-prioritized artist list.
function deriveArtists(albums, q) {
  const ql = q.toLowerCase(); const seen = new Set(); const out = [];
  for (const al of albums) {
    const key = al.artist_id || al.artist;
    if (!al.artist || seen.has(key)) continue;
    seen.add(key);
    out.push({ name: al.artist, artist_id: al.artist_id, match: al.artist.toLowerCase().includes(ql) ? 1 : 0 });
  }
  out.sort((a, b) => b.match - a.match);
  return out;
}

export default function Discover() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { entryFor, quickLog, entries } = useLibrary();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // { albums, artists } | null
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const onQuick = user ? quickLog : () => nav("/login");

  // Featured: stable within the hour, reshuffles hourly, and hides already-listened albums.
  const [hourSeed, setHourSeed] = useState(() => Math.floor(Date.now() / 3600000));
  useEffect(() => {
    const t = setInterval(() => { const h = Math.floor(Date.now() / 3600000); setHourSeed(p => (p === h ? p : h)); }, 60000);
    return () => clearInterval(t);
  }, []);
  const featured = useMemo(() => {
    const art = loadArtCache();
    const vals = Object.values(entries).filter(e => e.listened);
    const listenedIds = new Set(vals.map(e => String(e.album_id)));
    const listenedKeys = new Set(vals.map(e => (e.artist + "|" + e.title).toLowerCase()));
    const pool = [...POOL, ...NEW_2026].filter(s => {
      const cached = art[artKey(s)];
      const id = cached && cached.album_id;
      return !((id && listenedIds.has(String(id))) || listenedKeys.has((s.artist + "|" + s.title).toLowerCase()));
    });
    return seededShuffle(pool, hourSeed);
  }, [hourSeed, entries]);

  // Live suggestions (albums + artists), debounced, refining as the query grows.
  const [sugAlbums, setSugAlbums] = useState([]);
  const [sugArtists, setSugArtists] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const blurTimer = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || results !== null) { setSugAlbums([]); setSugArtists([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await searchAlbums(q);
        setSugAlbums(r.slice(0, 6));
        setSugArtists(deriveArtists(r, q).slice(0, 3));
        setShowSug(true);
      } catch { setSugAlbums([]); setSugArtists([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [query, results]);

  function openAlbum(a) { setShowSug(false); setSugAlbums([]); setSugArtists([]); nav(`/album/${a.album_id}`, { state: { album: a } }); }
  function openArtist(ar) { setShowSug(false); nav(`/artist/${encodeURIComponent(ar.name)}?aid=${ar.artist_id || ""}`); }

  async function run(q) {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true); setShowSug(false);
    try { const r = await searchAlbums(q); setResults({ albums: r, artists: deriveArtists(r, q).slice(0, 8) }); }
    catch { setResults({ albums: [], artists: [] }); }
    finally { setLoading(false); }
  }
  async function surprise() {
    const art = loadArtCache();
    const opts = POOL.filter(s => { const c = art[artKey(s)]; const e = c && c.album_id && entryFor(c.album_id); return !(e && e.listened); });
    const pick = opts[(Math.random() * opts.length) | 0] || POOL[(Math.random() * POOL.length) | 0];
    const r = await resolveSeed(pick);
    if (r.album_id) nav(`/album/${r.album_id}`, { state: { album: r } });
  }

  return <section style={{ paddingTop: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "10px 14px" }}>
          <Icon name="search" size={18} color="var(--muted)" />
          <input value={query}
            onChange={e => { setQuery(e.target.value); if (results !== null) setResults(null); }}
            onFocus={() => (sugAlbums.length || sugArtists.length) && setShowSug(true)}
            onBlur={() => { blurTimer.current = setTimeout(() => setShowSug(false), 150); }}
            onKeyDown={e => { if (e.key === "Enter") { setShowSug(false); run(query); } }}
            placeholder="Search albums or artists…"
            style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 0, color: "var(--ink)" }} />
          {query && <span onClick={() => { setQuery(""); setResults(null); setSugAlbums([]); setSugArtists([]); }} style={{ cursor: "pointer", color: "var(--muted)", lineHeight: 0 }}><Icon name="x" size={16} color="var(--muted)" /></span>}
          <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 14 }} onClick={() => { setShowSug(false); run(query); }}>Search</button>
        </div>
        {showSug && (sugArtists.length > 0 || sugAlbums.length > 0) && <div onMouseDown={() => clearTimeout(blurTimer.current)}
          style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "0 12px 28px rgba(27,26,21,.14)", overflow: "hidden", zIndex: 40 }}>
          {sugArtists.map((ar, i) => <div key={"ar" + (ar.artist_id || ar.name)} onClick={() => openArtist(ar)} className="sug-row"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", cursor: "pointer", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <Avatar name={ar.name} size={38} />
            <div style={{ minWidth: 0 }}>
              <div className="display" style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ar.name}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>Artist</div>
            </div>
          </div>)}
          {sugAlbums.map((a, i) => <div key={a.album_id} onClick={() => openAlbum(a)} className="sug-row"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", cursor: "pointer", borderTop: (i || sugArtists.length) ? "1px solid var(--line)" : "none" }}>
            <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 4, overflow: "hidden", background: "var(--canvas)" }}>{a.art && <img src={a.art} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
            <div style={{ minWidth: 0 }}>
              <div className="display" style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
              <div className="muted" style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.artist}{a.year ? ` · ${a.year}` : ""}</div>
            </div>
          </div>)}
        </div>}
      </div>
      <button className="btn" onClick={surprise} style={{ whiteSpace: "nowrap" }}><Icon name="dice" size={17} color="var(--accent)" /> Surprise me</button>
    </div>

    {results !== null
      ? (loading
        ? <div className="muted" style={{ fontSize: 13, margin: "12px 0" }}>Searching…</div>
        : <>
          {results.artists.length > 0 && <>
            <div className="muted" style={{ fontSize: 13, margin: "14px 0 8px" }}>Artists</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {results.artists.map(ar => <div key={ar.artist_id || ar.name} onClick={() => openArtist(ar)}
                style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "5px 14px 5px 5px", cursor: "pointer" }} className="chip">
                <Avatar name={ar.name} size={30} /><span style={{ fontSize: 14 }}>{ar.name}</span>
              </div>)}
            </div>
          </>}
          <div className="muted" style={{ fontSize: 13, margin: "16px 0 4px" }}>{results.albums.length ? "Albums" : `No results for "${query}"`}</div>
          <AlbumGrid albums={results.albums} entryFor={entryFor} onQuickLog={onQuick} />
        </>)
      : <>
        <h2 className="h2 display">Featured</h2>
        <div className="muted" style={{ fontSize: 12.5 }}>Acclaimed records old and new — refreshed hourly</div>
        <div className="row" style={{ display: "flex", gap: 16, overflowX: "auto", padding: "14px 2px 8px" }}>
          {featured.map(s => <div key={s.id} style={{ flex: "0 0 auto", width: "clamp(142px,44vw,162px)" }}><Tile seed={s} entryFor={entryFor} onQuickLog={onQuick} /></div>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 30, marginBottom: 4 }}>
          {activeCat && <span onClick={() => setActiveCat(null)} style={{ cursor: "pointer", color: "var(--accent)", lineHeight: 0 }}><Icon name="back" size={20} color="var(--accent)" /></span>}
          <h2 className="display" style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>{activeCat ? activeCat.key : "Browse all"}</h2>
        </div>
        {!activeCat
          ? <div className="browse" style={{ marginTop: 14 }}>{CATEGORIES.map(c => <CatCard key={c.key} cat={c} onOpen={() => setActiveCat(c)} />)}</div>
          : <AlbumGrid albums={catSeeds(activeCat)} entryFor={entryFor} onQuickLog={onQuick} />}
      </>}
  </section>;
}
