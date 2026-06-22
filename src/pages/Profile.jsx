import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { updateProfile, fetchFollowing, fetchFollowers, searchUsers, follow } from "../lib/db";
import { AlbumGrid } from "../components/Tile";
import { Cover, Spins, Avatar, fmtDate, Empty } from "../components/bits";
import Icon from "../components/Icon";

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { entries, entryFor, quickLog } = useLibrary();
  const nav = useNavigate();
  const [tab, setTab] = useState("activity");
  const [actExpanded, setActExpanded] = useState(false);
  const [picker, setPicker] = useState(null);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [find, setFind] = useState("");
  const [found, setFound] = useState([]);
  const [name, setName] = useState("");
  const [uname, setUname] = useState("");

  useEffect(() => { if (user) { fetchFollowing(user.id).then(setFollowing); fetchFollowers(user.id).then(setFollowers); } }, [user]);
  useEffect(() => { if (profile) { setName(profile.display_name || ""); setUname(profile.username || ""); } }, [profile]);

  const all = Object.values(entries);
  const listened = useMemo(() => all.filter(a => a.listened).sort((a, b) => (b.listened_on || "").localeCompare(a.listened_on || "")), [entries]);
  const wantList = all.filter(a => a.want && !a.listened);
  const likeList = all.filter(a => a.liked);
  const reviews = listened.filter(a => a.note && a.note.trim());
  const rated = listened.filter(a => a.rating > 0);
  const avg = rated.length ? rated.reduce((s, a) => s + a.rating, 0) / rated.length : 0;
  const genres = {}; listened.forEach(a => { if (a.genre) genres[a.genre] = (genres[a.genre] || 0) + 1; });
  const topG = Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 6); const maxG = topG[0]?.[1] || 1;

  const favs = (profile?.favorites || []);
  const albumById = id => entries[id] || null;
  async function setFav(slot, id) { const f = [...(profile?.favorites || [])]; while (f.length < 4) f.push(null); f[slot] = id; await updateProfile(user.id, { favorites: f.filter((x, i) => i < 4) }); refreshProfile(); setPicker(null); }
  async function clearFav(slot) { const f = [...(profile?.favorites || [])]; f[slot] = null; await updateProfile(user.id, { favorites: f }); refreshProfile(); }
  async function saveIdentity() { await updateProfile(user.id, { display_name: name.trim() || null, username: uname.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || null }); refreshProfile(); }
  async function runFind(q) { setFind(q); setFound(await searchUsers(q)); }
  async function doFollow(id) { await follow(user.id, id); fetchFollowing(user.id).then(setFollowing); }

  const tabs = [["activity", "Activity"], ["listened", "Listened", listened.length], ["reviews", "Reviews", reviews.length], ["list", "List", wantList.length], ["likes", "Likes", likeList.length], ["network", "Network"]];

  return <section style={{ paddingTop: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Avatar name={profile?.display_name || profile?.username || "You"} size={64} />
      <div style={{ minWidth: 0 }}>
        <div className="display" style={{ fontSize: 24, fontWeight: 600 }}>{profile?.display_name || "Your profile"}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
          {profile?.username ? `@${profile.username} · ` : ""}{listened.length} listened · {reviews.length} reviews · {likeList.length} likes · {following.length} following · {followers.length} followers
        </div>
      </div>
    </div>

    {!profile?.username && <div className="card" style={{ marginTop: 16 }}>
      <div className="display" style={{ fontWeight: 600, marginBottom: 8 }}>Pick a username</div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>People need a username to find and follow you.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input className="input" style={{ flex: "1 1 150px" }} placeholder="Display name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" style={{ flex: "1 1 150px" }} placeholder="username" value={uname} onChange={e => setUname(e.target.value)} />
        <button className="btn-primary" onClick={saveIdentity}>Save</button>
      </div>
    </div>}

    <h3 className="display" style={{ fontSize: 15, fontWeight: 600, margin: "24px 0 10px", color: "var(--muted)" }}>FAVORITE ALBUMS</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "clamp(8px,2vw,16px)" }}>
      {[0, 1, 2, 3].map(slot => { const id = favs[slot]; const a = id && albumById(id);
        return <div key={slot}>{a
          ? <div style={{ position: "relative" }}><Link to={`/album/${a.album_id}`}><Cover album={a} font={18} /></Link>
              <button onClick={() => clearFav(slot)} style={{ position: "absolute", top: 5, right: 5, width: 24, height: 24, borderRadius: 999, border: "none", background: "rgba(27,26,21,.6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={13} color="#fff" /></button></div>
          : <div onClick={() => setPicker(slot)} style={{ cursor: "pointer", aspectRatio: "1/1", borderRadius: 4, border: "1.5px dashed var(--line)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--muted)", background: "var(--surface)" }}><Icon name="plus" size={20} color="var(--muted)" /><span style={{ fontSize: 11.5 }}>Add</span></div>}</div>; })}
    </div>

    <h3 className="display" style={{ fontSize: 15, fontWeight: 600, margin: "26px 0 10px", color: "var(--muted)" }}>STATS</h3>
    {listened.length === 0 ? <div className="muted" style={{ fontSize: 14 }}>Log a few albums and your stats will appear here.</div>
      : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          <div className="card"><div className="muted" style={{ fontSize: 13 }}>Albums logged</div><div className="display" style={{ fontSize: 30, fontWeight: 600, marginTop: 4 }}>{listened.length}</div></div>
          <div className="card"><div className="muted" style={{ fontSize: 13 }}>Average rating</div><div className="display" style={{ fontSize: 30, fontWeight: 600, margin: "4px 0 6px" }}>{avg ? avg.toFixed(1) : "—"}</div><Spins value={Math.round(avg)} size={15} /></div>
          <div className="card" style={{ gridColumn: "1 / -1" }}><div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>Most-logged genres</div>
            {topG.map(([g, n]) => <div key={g} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div className="display" style={{ width: 140, fontSize: 13.5 }}>{g}</div><div style={{ flex: 1, background: "var(--accent-soft)", borderRadius: 999, height: 9 }}><div style={{ width: `${(n / maxG) * 100}%`, background: "var(--accent)", height: 9, borderRadius: 999 }} /></div><div className="muted" style={{ fontSize: 13, width: 20, textAlign: "right" }}>{n}</div></div>)}</div>
        </div>}

    <div className="subnav" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "26px 0 2px", borderBottom: "1px solid var(--line)" }}>
      {tabs.map(([k, l, n]) => <button key={k} onClick={() => setTab(k)} className="display" style={{ border: "none", background: "none", fontSize: 15, padding: "4px 2px 10px", whiteSpace: "nowrap", color: tab === k ? "var(--accent)" : "var(--muted)", fontWeight: tab === k ? 600 : 400, borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -1 }}>{l}{n > 0 ? ` ${n}` : ""}</button>)}
    </div>

    <div style={{ paddingTop: 6 }}>
      {tab === "activity" && (listened.length === 0 ? <Empty icon="cal" title="No activity yet" body="Albums you log show up here as a running diary." />
        : <div style={{ marginTop: 8 }}>
            {listened.slice(0, actExpanded ? listened.length : 10).map(a => <Link key={a.album_id} to={`/album/${a.album_id}`} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}>
              <div style={{ width: 48, flexShrink: 0 }}><Cover album={a} font={13} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><div className="display" style={{ fontSize: 15, fontWeight: 500 }}>{a.title}</div><div className="muted" style={{ fontSize: 12.5 }}>{a.artist} · {fmtDate(a.listened_on)}</div></div>
              {a.rating > 0 && <Spins value={a.rating} size={13} />}</Link>)}
            {listened.length > 10 && <button onClick={() => setActExpanded(v => !v)} style={{ display: "block", margin: "16px auto 0", background: "none", border: "1px solid var(--line)", borderRadius: 999, padding: "8px 20px", color: "var(--accent)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{actExpanded ? "Show less" : `See more (${listened.length - 10} more)`}</button>}
          </div>)}
      {tab === "listened" && (listened.length === 0 ? <Empty icon="cal" title="Nothing logged yet" body="Mark albums as listened from anywhere." /> : <AlbumGrid albums={listened} entryFor={entryFor} showRating />)}
      {tab === "reviews" && (reviews.length === 0 ? <Empty icon="star" title="No reviews yet" body="Add a note to a logged album and it becomes a review." />
        : <div style={{ marginTop: 8 }}>{reviews.map(a => <div key={a.album_id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--line)" }}><Link to={`/album/${a.album_id}`} style={{ width: 64, flexShrink: 0 }}><Cover album={a} font={15} /></Link>
            <div style={{ flex: 1, minWidth: 0 }}><div className="display" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.15 }}>{a.title}</div><div className="muted" style={{ fontSize: 12.5, margin: "2px 0 6px" }}>{a.artist}</div>{a.rating > 0 && <div style={{ marginBottom: 6 }}><Spins value={a.rating} size={14} /></div>}<div style={{ fontSize: 14, lineHeight: 1.5 }}>{a.note}</div></div></div>)}</div>)}
      {tab === "list" && (wantList.length === 0 ? <Empty icon="bookmark" title="Your list is empty" body="Tap “Want to listen” on any album." /> : <AlbumGrid albums={wantList} entryFor={entryFor} />)}
      {tab === "likes" && (likeList.length === 0 ? <Empty icon="heart" title="No likes yet" body="Tap the heart on an album." /> : <AlbumGrid albums={likeList} entryFor={entryFor} />)}
      {tab === "network" && <div style={{ marginTop: 12 }}>
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="display" style={{ fontWeight: 600, marginBottom: 8 }}>Find people</div>
          <input className="input" placeholder="Search by name or username…" value={find} onChange={e => runFind(e.target.value)} />
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {found.filter(u => u.id !== user.id).map(u => <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={u.display_name || u.username} size={30} />
              <Link to={`/u/${u.username}`} style={{ flex: 1, textDecoration: "none", color: "var(--ink)", fontSize: 14 }}>{u.display_name || u.username}<span className="muted"> @{u.username}</span></Link>
              <button className="btn" style={{ padding: "5px 12px", fontSize: 13 }} onClick={() => doFollow(u.id)}>Follow</button></div>)}
          </div>
        </div>
        {[["Following", following], ["Followers", followers]].map(([label, arr]) => <div key={label} style={{ marginBottom: 22 }}>
          <h3 className="display" style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>{label} · {arr.length}</h3>
          {arr.length === 0 ? <div className="muted" style={{ fontSize: 13.5 }}>Nobody yet.</div>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>{arr.map(u => <Link key={u.id} to={`/u/${u.username}`} style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "5px 14px 5px 5px", textDecoration: "none", color: "var(--ink)" }}><Avatar name={u.display_name || u.username} size={32} /><span style={{ fontSize: 14 }}>{u.display_name || u.username}</span></Link>)}</div>}
        </div>)}
      </div>}
    </div>

    {picker !== null && <div onClick={() => setPicker(null)} style={{ position: "fixed", inset: 0, background: "rgba(27,26,21,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--canvas)", borderRadius: 10, width: "min(560px,94vw)", maxHeight: "82vh", overflow: "auto", padding: "clamp(16px,4vw,22px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div className="display" style={{ fontSize: 18, fontWeight: 600 }}>Pick a favorite</div><span onClick={() => setPicker(null)} style={{ cursor: "pointer", color: "var(--muted)", lineHeight: 0 }}><Icon name="x" size={20} color="var(--muted)" /></span></div>
        {all.length === 0 ? <div className="muted" style={{ fontSize: 14 }}>Log, like, or save some albums first.</div>
          : <div className="grid">{all.filter(a => !favs.includes(a.album_id)).map(a => <div key={a.album_id} onClick={() => setFav(picker, a.album_id)} style={{ cursor: "pointer" }}><Cover album={a} font={16} /><div className="display" style={{ fontSize: 13, fontWeight: 500, marginTop: 6, lineHeight: 1.2 }}>{a.title}</div><div className="muted" style={{ fontSize: 12 }}>{a.artist}</div></div>)}</div>}
      </div>
    </div>}
  </section>;
}
