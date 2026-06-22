import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveSeed } from "../lib/music";
import { Cover, useInView } from "./bits";
import Icon from "./Icon";

// `seed` may be a curated seed (no album_id yet) or a full catalog/DB album (has album_id).
export function Tile({ seed, entryFor, onQuickLog, width = "100%", big = false }) {
  const nav = useNavigate();
  const [album, setAlbum] = useState(seed.album_id ? seed : null);
  const ref = useInView(async () => { if (!album) { const r = await resolveSeed(seed); setAlbum(r.album_id ? r : { ...seed }); } }, seed.id || seed.album_id);
  const a = album || seed;
  const entry = a.album_id && entryFor ? entryFor(a.album_id) : null;
  const listened = entry && entry.listened;
  const want = entry && entry.want && !entry.listened;

  async function open() { let x = a; if (!x.album_id) x = await resolveSeed(seed); if (x.album_id) nav(`/album/${x.album_id}`); }

  return <div style={{ width }}>
    <div onClick={open} style={{ cursor: "pointer", position: "relative" }}>
      <div style={{ opacity: listened ? 0.45 : 1, transition: "opacity .15s", borderRadius: 4, boxShadow: listened ? "inset 0 0 0 2px var(--accent)" : (want ? "inset 0 0 0 2px var(--spin)" : "none") }}>
        <Cover album={a} innerRef={ref} font={big ? 30 : 26} />
      </div>
      {onQuickLog && <button onClick={e => { e.stopPropagation(); onQuickLog(a); }} title={listened ? "Listened" : "Mark as listened"}
        style={{ position: "absolute", top: 7, right: 7, width: 32, height: 32, borderRadius: 999, border: "none", background: listened ? "var(--accent)" : "rgba(27,26,21,.55)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={listened ? "check" : "plus"} size={16} color="#fff" /></button>}
      {want && <div style={{ position: "absolute", top: 7, left: 7, lineHeight: 0 }}><Icon name="bookmark" size={18} color="#fff" fill="solid" /></div>}
    </div>
    <div className="display" style={{ fontSize: 14, fontWeight: 500, marginTop: 8, lineHeight: 1.2 }}>{a.title}</div>
    <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{a.artist}{a.year ? ` · ${a.year}` : ""}</div>
  </div>;
}

export function AlbumGrid({ albums, entryFor, onQuickLog, showRating }) {
  return <div className="grid" style={{ marginTop: 14 }}>
    {albums.map(a => <div key={a.album_id || a.id}>
      <Tile seed={a} entryFor={entryFor} onQuickLog={onQuickLog} />
      {showRating && a.rating > 0 && <div style={{ marginTop: 6 }}><RatingMini value={a.rating} /></div>}
    </div>)}
  </div>;
}
function RatingMini({ value }) {
  return <div style={{ display: "flex", gap: 3 }}>{[1, 2, 3, 4, 5].map(n => <Icon key={n} name="disc" size={13} color={n <= value ? "var(--spin)" : "var(--line)"} fill={n <= value ? "solid" : "none"} />)}</div>;
}
