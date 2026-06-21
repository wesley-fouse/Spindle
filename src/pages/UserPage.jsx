import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { getProfileByUsername, fetchUserEntries, amFollowing, follow, unfollow, fetchFollowing, fetchFollowers } from "../lib/db";
import { AlbumGrid } from "../components/Tile";
import { Cover, Spins, Avatar, Empty } from "../components/bits";
import Icon from "../components/Icon";

export default function UserPage() {
  const { username } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { entryFor } = useLibrary();
  const [prof, setProf] = useState(undefined);
  const [items, setItems] = useState([]);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState({ following: 0, followers: 0 });
  const [tab, setTab] = useState("listened");

  useEffect(() => {
    let dead = false; setProf(undefined); setItems([]); window.scrollTo(0, 0);
    getProfileByUsername(username).then(async p => {
      if (dead) return; setProf(p || null);
      if (!p) return;
      setItems(await fetchUserEntries(p.id));
      fetchFollowing(p.id).then(f => !dead && setCounts(c => ({ ...c, following: f.length })));
      fetchFollowers(p.id).then(f => !dead && setCounts(c => ({ ...c, followers: f.length })));
      if (user && user.id !== p.id) setFollowing(await amFollowing(user.id, p.id));
    });
    return () => { dead = true; };
  }, [username, user]);

  async function toggle() {
    if (!user) { nav("/login"); return; }
    setBusy(true);
    if (following) { await unfollow(user.id, prof.id); setFollowing(false); setCounts(c => ({ ...c, followers: Math.max(0, c.followers - 1) })); }
    else { await follow(user.id, prof.id); setFollowing(true); setCounts(c => ({ ...c, followers: c.followers + 1 })); }
    setBusy(false);
  }

  const listened = items;
  const reviews = useMemo(() => items.filter(a => a.note && a.note.trim()), [items]);
  const likeList = useMemo(() => items.filter(a => a.liked), [items]);
  const favs = prof?.favorites || [];
  const byId = id => items.find(a => a.album_id === id);

  if (prof === undefined) return <section style={{ paddingTop: 28 }} className="muted">Loading…</section>;
  if (prof === null) return <section style={{ paddingTop: 28 }}><Empty icon="users" title="No such person" body={`Couldn't find @${username}.`} /></section>;
  const me = user && user.id === prof.id;
  const name = prof.display_name || prof.username;

  return <section style={{ paddingTop: 24 }}>
    <button onClick={() => nav(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--accent)", fontSize: 14, padding: "0 0 14px" }}><Icon name="back" size={18} color="var(--accent)" /> Back</button>
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <Avatar name={name} size={64} />
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div className="display" style={{ fontSize: 24, fontWeight: 600 }}>{name}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>@{prof.username} · {listened.length} listened · {reviews.length} reviews · {counts.following} following · {counts.followers} followers</div>
      </div>
      {me ? <Link className="btn" to="/profile">Edit profile</Link>
        : <button className="btn" disabled={busy} onClick={toggle} style={following ? {} : { background: "var(--accent)", color: "#fff", border: "none" }}>
            {following ? "Following" : "Follow"}</button>}
    </div>
    {prof.bio && <p style={{ fontSize: 14.5, lineHeight: 1.55, marginTop: 14 }}>{prof.bio}</p>}

    {favs.filter(Boolean).length > 0 && <>
      <h3 className="display" style={{ fontSize: 15, fontWeight: 600, margin: "24px 0 10px", color: "var(--muted)" }}>FAVORITE ALBUMS</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "clamp(8px,2vw,16px)" }}>
        {favs.slice(0, 4).map((id, i) => { const a = id && byId(id); return <div key={i}>{a ? <Link to={`/album/${a.album_id}`}><Cover album={a} font={18} /></Link> : <div style={{ aspectRatio: "1/1", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--line)" }} />}</div>; })}
      </div>
    </>}

    <div className="subnav" style={{ display: "flex", gap: 10, overflowX: "auto", margin: "26px 0 14px", borderBottom: "1px solid var(--line)" }}>
      {[["listened", "Listened", listened.length], ["reviews", "Reviews", reviews.length], ["likes", "Likes", likeList.length]].map(([k, l, n]) =>
        <button key={k} onClick={() => setTab(k)} className="display" style={{ border: "none", background: "none", fontSize: 15, padding: "4px 2px 10px", whiteSpace: "nowrap", color: tab === k ? "var(--accent)" : "var(--muted)", fontWeight: tab === k ? 600 : 400, borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -1 }}>{l}{n > 0 ? ` ${n}` : ""}</button>)}
    </div>

    {tab === "listened" && (listened.length === 0 ? <Empty icon="cal" title="Nothing logged yet" body={`${name} hasn't logged any albums.`} /> : <AlbumGrid albums={listened} entryFor={entryFor} showRating />)}
    {tab === "reviews" && (reviews.length === 0 ? <Empty icon="star" title="No reviews yet" body={`${name} hasn't written any reviews.`} />
      : reviews.map(a => <div key={a.album_id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
          <Link to={`/album/${a.album_id}`} style={{ width: 64, flexShrink: 0 }}><Cover album={a} font={15} /></Link>
          <div style={{ flex: 1, minWidth: 0 }}><div className="display" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.15 }}>{a.title}</div><div className="muted" style={{ fontSize: 12.5, margin: "2px 0 6px" }}>{a.artist}</div>{a.rating > 0 && <div style={{ marginBottom: 6 }}><Spins value={a.rating} size={14} /></div>}<div style={{ fontSize: 14, lineHeight: 1.5 }}>{a.note}</div></div></div>))}
    {tab === "likes" && (likeList.length === 0 ? <Empty icon="heart" title="No likes yet" body={`${name} hasn't liked any albums.`} /> : <AlbumGrid albums={likeList} entryFor={entryFor} />)}
  </section>;
}
