import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { POOL, NEW_2026, CATEGORIES, catSeeds, shuffle } from "../lib/seeds";
import { searchAlbums, resolveSeed, fetchCharts } from "../lib/music";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { AlbumGrid, Tile } from "../components/Tile";
import { useInView } from "../components/bits";
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

function HScroll({ albums, entryFor, onQuickLog }) {
  return <div className="row" style={{ display: "flex", gap: 16, overflowX: "auto", padding: "14px 2px 8px" }}>
    {albums.map(a => <div key={a.album_id || a.id} style={{ flex: "0 0 auto", width: "clamp(142px,44vw,162px)" }}>
      <Tile seed={a} entryFor={entryFor} onQuickLog={onQuickLog} />
    </div>)}
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
  const [charts, setCharts] = useState(null);
  const newReleases = useMemo(() => shuffle([...NEW_2026]), []);
  const classics = useMemo(() => shuffle([...POOL]), []);
  const onQuick = user ? quickLog : () => nav("/login");

  useEffect(() => {
    fetchCharts(100).then(setCharts).catch(() => setCharts([]));
  }, []);

  async function run(q) {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try { setResults(await searchAlbums(q)); } catch { setResults([]); } finally { setLoading(false); }
  }

  async function surprise() {
    const pool = charts && charts.length ? charts : classics;
    const opts = pool.filter(s => { const e = s.album_id && entryFor(s.album_id); return !(e && e.listened); });
    const pick = opts[(Math.random() * opts.length) | 0] || pool[0];
    if (!pick) return;
    if (pick.album_id) { nav(`/album/${pick.album_id}`, { state: { album: pick } }); return; }
    const r = await resolveSeed(pick);
    if (r.album_id) nav(`/album/${r.album_id}`, { state: { album: r } });
  }

  return <section style={{ paddingTop: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "10px 14px", flex: "1 1 240px", minWidth: 0 }}>
        <Icon name="search" size={18} color="var(--muted)" />
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && run(query)} placeholder="Search any album or artist…" style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 0, color: "var(--ink)" }} />
        {query && <span onClick={() => { setQuery(""); setResults(null); }} style={{ cursor: "pointer", color: "var(--muted)", lineHeight: 0 }}><Icon name="x" size={16} color="var(--muted)" /></span>}
        <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 14 }} onClick={() => run(query)}>Search</button>
      </div>
      <button className="btn" onClick={surprise} style={{ whiteSpace: "nowrap" }}><Icon name="dice" size={17} color="var(--accent)" /> Surprise me</button>
    </div>

    {results !== null
      ? <><div className="muted" style={{ fontSize: 13, margin: "12px 0 4px" }}>{loading ? "Searching…" : `Results for "${query}"`}</div>
          <AlbumGrid albums={results} entryFor={entryFor} onQuickLog={onQuick} /></>
      : <>
          <h2 className="h2 display">Trending now</h2>
          <div className="muted" style={{ fontSize: 12.5 }}>Top albums on Apple Music right now</div>
          {charts === null
            ? <div className="muted" style={{ fontSize: 13, padding: "14px 0" }}>Loading charts…</div>
            : <HScroll albums={charts.length ? charts : classics} entryFor={entryFor} onQuickLog={onQuick} />}

          <h2 className="h2 display">New in 2026</h2>
          <HScroll albums={newReleases} entryFor={entryFor} onQuickLog={onQuick} />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 30, marginBottom: 4 }}>
            {activeCat && <span onClick={() => setActiveCat(null)} style={{ cursor: "pointer", color: "var(--accent)", lineHeight: 0 }}><Icon name="back" size={20} color="var(--accent)" /></span>}
            <h2 className="display" style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>{activeCat ? activeCat.key : "Browse by genre"}</h2>
          </div>
          {!activeCat
            ? <div className="browse" style={{ marginTop: 14 }}>{CATEGORIES.filter(c => c.key !== "New Releases").map(c => <CatCard key={c.key} cat={c} onOpen={() => setActiveCat(c)} />)}</div>
            : <AlbumGrid albums={catSeeds(activeCat)} entryFor={entryFor} onQuickLog={onQuick} />}

          {!activeCat && <>
            <h2 className="h2 display" style={{ marginTop: 34 }}>Essential albums</h2>
            <div className="muted" style={{ fontSize: 12.5 }}>A curated library of classics and must-hears</div>
            <AlbumGrid albums={classics} entryFor={entryFor} onQuickLog={onQuick} />
          </>}
        </>}
  </section>;
}
