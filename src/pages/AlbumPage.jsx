import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { getAlbum, wikiAbout, spotifyUrl, ytUrl, geniusUrl } from "../lib/music";
import { fetchAlbumReviews } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { useLibrary, todayISO } from "../context/LibraryContext";
import { Cover, Spins, Avatar, fmtDur } from "../components/bits";
import Icon from "../components/Icon";

export default function AlbumPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const seeded = loc.state && loc.state.album && String(loc.state.album.album_id) === String(id) ? loc.state.album : null;
  const { user } = useAuth();
  const { entryFor, write, remove } = useLibrary();
  const [album, setAlbum] = useState(seeded);
  const [tracks, setTracks] = useState(null);
  const [wiki, setWiki] = useState(undefined);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(false);
  const [tries, setTries] = useState(0);
  const entry = entryFor(id);
  const [draft, setDraft] = useState({ rating: 0, note: "", listened_on: todayISO() });

  useEffect(() => {
    let dead = false;
    setTracks(null); setWiki(undefined); setReviews([]); setError(false);
    if (!seeded) setAlbum(null);
    const wikiFor = (al) => wikiAbout(al.title + " " + al.artist + " album").then(w => !dead && setWiki(w));
    getAlbum(id).then(({ album, tracks }) => {
      if (dead) return;
      if (album) { setAlbum(album); setTracks(tracks); wikiFor(album); }
      else if (seeded) { setTracks([]); wikiFor(seeded); }   // metadata thin but we can still show the page
      else setError(true);
    }).catch(() => {
      if (dead) return;
      if (seeded) { setTracks([]); wikiFor(seeded); }        // lookup failed, but we already have the album
      else setError(true);
    });
    fetchAlbumReviews(id).then(r => !dead && setReviews(r)).catch(() => {});
    window.scrollTo(0, 0);
    return () => { dead = true; };
  }, [id, tries]);
  useEffect(() => { setDraft(entry ? { rating: entry.rating || 0, note: entry.note || "", listened_on: entry.listened_on || todayISO() } : { rating: 0, note: "", listened_on: todayISO() }); }, [entry?.album_id, id]);

  if (error) return <section style={{ paddingTop: 28 }}>
    <button onClick={() => nav(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--accent)", fontSize: 14, padding: "0 0 16px" }}><Icon name="back" size={18} color="var(--accent)" /> Back</button>
    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
      <div className="display" style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)" }}>Couldn't load this album</div>
      <div style={{ fontSize: 14, margin: "8px auto 16px", maxWidth: 360, lineHeight: 1.5 }}>The music service may have briefly rate-limited the request. Give it a second and try again.</div>
      <button className="btn-primary" onClick={() => setTries(t => t + 1)}>Try again</button>
    </div>
  </section>;
  if (!album) return <section style={{ paddingTop: 28 }} className="muted">Loading album…</section>;

  const liked = entry?.liked, want = entry?.want && !entry?.listened, listened = entry?.listened;
  const need = (fn) => user ? fn : () => nav("/login");

  return <section>
    <button onClick={() => nav(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--accent)", fontSize: 14, padding: "16px 0 4px" }}><Icon name="back" size={18} color="var(--accent)" /> Back</button>
    <div style={{ display: "flex", gap: "clamp(16px,4vw,28px)", flexWrap: "wrap" }}>
      <div style={{ width: "clamp(150px,40vw,220px)", flexShrink: 0 }}><Cover album={album} font={30} /></div>
      <div style={{ flex: "1 1 280px", minWidth: 0 }}>
        <div className="display" style={{ fontSize: "clamp(24px,4.4vw,34px)", fontWeight: 600, lineHeight: 1.1 }}>{album.title}</div>
        <div style={{ fontSize: 16, marginTop: 6 }}>
          <Link to={`/artist/${encodeURIComponent(album.artist)}?aid=${album.artist_id || ""}`} style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>{album.artist}</Link>
          <span className="muted">{album.year ? ` · ${album.year}` : ""}{album.genre ? ` · ${album.genre}` : ""}</span>
        </div>
        <a href={spotifyUrl(album)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, background: "var(--spotify)", color: "#fff", textDecoration: "none", borderRadius: 999, padding: "9px 18px", fontSize: 14, fontWeight: 600 }}><Icon name="play" size={14} color="#fff" /> Play on Spotify</a>

        <div className="card" style={{ marginTop: 16 }}>
          {user ? <>
            <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Your rating</div>
            <Spins value={draft.rating} size={24} onChange={r => setDraft({ ...draft, rating: r })} />
            <div className="muted" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, margin: "14px 0 6px" }}><Icon name="cal" size={14} color="var(--muted)" /> Date listened</div>
            <input type="date" value={draft.listened_on} onChange={e => setDraft({ ...draft, listened_on: e.target.value })} className="input" style={{ width: "auto", background: "var(--canvas)" }} />
            <div className="muted" style={{ fontSize: 13, margin: "14px 0 6px" }}>Notes / review</div>
            <textarea value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} rows={3} placeholder="What stood out? A track, a memory, a verdict…" className="input" style={{ background: "var(--canvas)", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 14 }}>
              <button onClick={() => write(album, { liked: !liked })} title="Like" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, background: liked ? "rgba(192,57,43,.1)" : "transparent", color: "var(--like)", border: "1px solid var(--like)", borderRadius: 999 }}><Icon name="heart" size={18} color="var(--like)" fill={liked ? "solid" : "none"} /></button>
              <button className="btn" onClick={() => write(album, { want: !want })} style={{ background: want ? "var(--accent-soft)" : "transparent" }}><Icon name="bookmark" size={15} color="var(--accent)" fill={want ? "solid" : "none"} /> {want ? "On your list" : "Want to listen"}</button>
              <button className="btn-primary" onClick={async () => { await write(album, { listened: true, want: false, rating: draft.rating, note: draft.note, listened_on: draft.listened_on }); const r = await fetchAlbumReviews(id); setReviews(r); }}>{listened ? "Save" : "Log as listened"}</button>
              {entry && <button onClick={() => remove(id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--muted)", fontSize: 14 }}><Icon name="trash" size={15} color="var(--muted)" /> Remove</button>}
            </div>
          </> : <div style={{ fontSize: 14 }} className="muted">Want to log this, rate it, or save it for later? <Link to="/login">Sign in</Link>.</div>}
        </div>
      </div>
    </div>

    <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: "30px 0 12px" }}>Tracklist</h3>
    {tracks === null ? <div className="muted" style={{ fontSize: 14 }}>Loading tracklist…</div>
      : tracks.length === 0 ? <div className="muted" style={{ fontSize: 14 }}>Tracklist unavailable for this release.</div>
      : <div className="card" style={{ padding: 0, overflow: "hidden" }}>{tracks.map((t, i) => <div key={t.trackId || i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", borderTop: i ? "1px solid var(--line)" : "none" }}>
          <span className="muted" style={{ fontSize: 13, width: 22, textAlign: "right", flexShrink: 0 }}>{t.trackNumber || i + 1}</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14.5 }}>{t.trackName}</span>
          <span className="muted" style={{ fontSize: 13 }}>{fmtDur(t.trackTimeMillis)}</span></div>)}</div>}

    <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: "30px 0 12px" }}>About the album</h3>
    {wiki === undefined ? <div className="muted" style={{ fontSize: 14 }}>Loading background…</div>
      : <div>
          {wiki && wiki.extract ? <p style={{ fontSize: 15, lineHeight: 1.65, margin: "0 0 14px" }}>{wiki.extract}</p>
            : <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>No write-up found automatically — the links below are a good place to dig into the story behind it.</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {wiki && wiki.url && <a className="chip" href={wiki.url} target="_blank" rel="noopener noreferrer"><Icon name="ext" size={14} color="var(--accent)" /> Wikipedia</a>}
            <a className="chip" href={ytUrl(album.title + " " + album.artist + " full album")} target="_blank" rel="noopener noreferrer"><Icon name="play" size={13} color="var(--accent)" /> Listen on YouTube</a>
            <a className="chip" href={ytUrl(album.title + " " + album.artist + " making of documentary")} target="_blank" rel="noopener noreferrer"><Icon name="ext" size={14} color="var(--accent)" /> The story / making-of</a>
            <a className="chip" href={geniusUrl(album.title + " " + album.artist)} target="_blank" rel="noopener noreferrer"><Icon name="ext" size={14} color="var(--accent)" /> Lyrics &amp; annotations</a>
          </div>
        </div>}

    <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: "30px 0 12px" }}>Reviews</h3>
    {reviews.length === 0 ? <div className="muted" style={{ fontSize: 14 }}>No reviews yet — be the first to write one above.</div>
      : reviews.map((rv, i) => { const who = rv.profiles?.display_name || rv.profiles?.username || "A listener";
          return <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
            <Avatar name={who} size={36} />
            <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><b style={{ fontSize: 14 }}>{who}</b>{rv.rating > 0 && <Spins value={rv.rating} size={12} />}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>{rv.note}</div></div></div>; })}
  </section>;
}
