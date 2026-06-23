import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchFeed } from "../lib/db";
import { Cover, Avatar, Spins, fmtDate, Empty } from "../components/bits";

export default function Feed() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  useEffect(() => { if (user) fetchFeed(user.id).then(setItems).catch(() => setItems([])); }, [user]);

  if (items === null) return <section style={{ paddingTop: 28 }} className="muted">Loading your feed…</section>;
  if (!items.length) return <section style={{ paddingTop: 12 }}>
    <Empty icon="users" title="Your feed is quiet" body="Follow some people from their profiles and their listening will show up here." />
  </section>;

  return <section style={{ paddingTop: 24 }}>
    <h1 className="display" style={{ fontSize: 24, fontWeight: 600 }}>Following</h1>
    <div style={{ marginTop: 14 }}>
      {items.map(it => {
        const who = it.profiles?.display_name || it.profiles?.username || "Someone";
        const uname = it.profiles?.username;
        return <div key={it.id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
          <Link to={`/album/${it.album_id}`} state={{ album: it }} style={{ width: 64, flexShrink: 0 }}><Cover album={it} font={15} /></Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={who} size={26} />
              {uname ? <Link to={`/u/${uname}`} style={{ fontSize: 14, fontWeight: 600, textDecoration: "none", color: "var(--ink)" }}>{who}</Link> : <b style={{ fontSize: 14 }}>{who}</b>}
              <span className="muted" style={{ fontSize: 12.5 }}>· {fmtDate(it.listened_on)}</span>
            </div>
            <div className="display" style={{ fontSize: 16, fontWeight: 600, marginTop: 6, lineHeight: 1.15 }}>
              <Link to={`/album/${it.album_id}`} state={{ album: it }} style={{ textDecoration: "none", color: "var(--ink)" }}>{it.title}</Link>
            </div>
            <div className="muted" style={{ fontSize: 12.5 }}><Link to={`/artist/${encodeURIComponent(it.artist)}?aid=${it.artist_id || ""}`} className="artist-link" style={{ color: "inherit", textDecoration: "none" }}>{it.artist}</Link></div>
            {it.rating > 0 && <div style={{ marginTop: 6 }}><Spins value={it.rating} size={13} /></div>}
            {it.note && <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 6 }}>{it.note}</div>}
          </div>
        </div>;
      })}
    </div>
  </section>;
}
