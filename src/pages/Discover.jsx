import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { POOL, NEW_2026, CATEGORIES, catSeeds, shuffle } from "../lib/seeds";
import { searchAlbums, resolveSeed } from "../lib/music";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { AlbumGrid, Tile } from "../components/Tile";
import { Cover, useInView } from "../components/bits";
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

export default function Discover() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { entryFor, quickLog } = useLibrary();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const featured = useMemo(() => shuffle([...POOL, ...NEW_2026]), []);
  const onQuick = user ? quickLog : () => nav("/login");

  const [suggest, setSuggest] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const blurTimer = useRef(null);

  // Live suggestions: debounce typing, refine as the query grows.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || results !== null) { setSuggest([]); return; }
    const t = setTimeout(async () => {
      try { const r = await searchAlbums(q); setSuggest(r.slice(0, 6)); setShowSug(true); } catch { setSuggest([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [query, results]);

  function pickSuggestion(a) { setShowSug(false); setSuggest([]); nav(`/album/${a.album_id}`, { state: { album: a } }); }

  async function run(q) {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try { setResults(await searchAlbums(q)); } catch { setResults([]); } finally { setLoading(false); }
  }
  async function surprise() {
    const opts = POOL.filter(s => { const e = s.album_id && entryFor(s.album_id); return !(e && e.listened); });
    const pick = opts[(Math.random() * opts.length) | 0];
    const r = await resolveSeed(pick);
    if (r.album_id) nav(`/album/${r.album_id}`);
  }

  return <section style={{ paddingTop: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "10px 14px" }}>
          <Icon name="search" size={18} color="var(--muted)" />
          <input value={query}
            onChange={e => { setQuery(e.target.value); if (results !== null) setResults(null); }}
            onFocus={() => suggest.length && setShowSug(true)}
            onBlur={() => { blurTimer.current = setTimeout(() => setShowSug(false), 150); }}
            onKeyDown={e => { if (e.key === "Enter") { setShowSug(false); run(query); } }}
            placeholder="Search any album or artist…"
            style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 0, color: "var(--ink)" }} />
          {query && <span onClick={() => { setQuery(""); setResults(null); setSuggest([]); }} style={{ cursor: "pointer", color: "var(--muted)", lineHeight: 0 }}><Icon name="x" size={16} color="var(--muted)" /></span>}
          <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 14 }} onClick={() => { setShowSug(false); run(query); }}>Search</button>
        </div>
        {showSug && suggest.length > 0 && <div onMouseDown={() => clearTimeout(blurTimer.current)}
          style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "0 12px 28px rgba(27,26,21,.14)", overflow: "hidden", zIndex: 40 }}>
          {suggest.map((a, i) => <div key={a.album_id} onClick={() => pickSuggestion(a)} className="sug-row"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", cursor: "pointer", borderTop: i ? "1px solid var(--line)" : "none" }}>
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
      ? <><div className="muted" style={{ fontSize: 13, margin: "12px 0 4px" }}>{loading ? "Searching…" : `Results for "${query}"`}</div>
          <AlbumGrid albums={results} entryFor={entryFor} onQuickLog={onQuick} /></>
      : <>
        <h2 className="h2 display">Featured</h2>
        <div className="muted" style={{ fontSize: 12.5 }}>Acclaimed records old and new — reshuffled each visit</div>
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
