import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getArtistAlbums, wikiAbout, ytUrl } from "../lib/music";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { AlbumGrid } from "../components/Tile";
import { Avatar } from "../components/bits";
import Icon from "../components/Icon";

export default function ArtistPage() {
  const { name } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { entryFor, quickLog } = useLibrary();
  const { user } = useAuth();
  const artist = decodeURIComponent(name);
  const aid = sp.get("aid") || null;
  const [albums, setAlbums] = useState(null);
  const [wiki, setWiki] = useState(undefined);

  useEffect(() => { let dead = false; setAlbums(null); setWiki(undefined); window.scrollTo(0, 0);
    getArtistAlbums(artist, aid).then(a => !dead && setAlbums(a));
    wikiAbout(artist + " musician band").then(w => !dead && setWiki(w));
    return () => { dead = true; };
  }, [artist, aid]);

  const onQuick = user ? quickLog : () => nav("/login");
  return <section>
    <button onClick={() => nav(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--accent)", fontSize: 14, padding: "16px 0 4px" }}><Icon name="back" size={18} color="var(--accent)" /> Back</button>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Avatar name={artist} size={72} />
      <div><div className="display" style={{ fontSize: "clamp(24px,4.6vw,34px)", fontWeight: 600, lineHeight: 1.1 }}>{artist}</div>
        <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{albums ? `${albums.length} releases` : "Artist"}</div></div>
    </div>
    <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: "26px 0 12px" }}>About</h3>
    {wiki === undefined ? <div className="muted" style={{ fontSize: 14 }}>Loading…</div>
      : <div>{wiki && wiki.extract ? <p style={{ fontSize: 15, lineHeight: 1.65, margin: "0 0 14px" }}>{wiki.extract}</p> : <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>No biography found automatically.</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {wiki && wiki.url && <a className="chip" href={wiki.url} target="_blank" rel="noopener noreferrer"><Icon name="ext" size={14} color="var(--accent)" /> Wikipedia</a>}
            <a className="chip" href={ytUrl(artist)} target="_blank" rel="noopener noreferrer"><Icon name="play" size={13} color="var(--accent)" /> YouTube</a>
          </div></div>}
    <h3 className="display" style={{ fontSize: 18, fontWeight: 600, margin: "26px 0 0" }}>Discography</h3>
    {albums === null ? <div className="muted" style={{ fontSize: 14, marginTop: 12 }}>Loading releases…</div>
      : albums.length === 0 ? <div className="muted" style={{ fontSize: 14, marginTop: 12 }}>Couldn't load this artist's catalog.</div>
      : <AlbumGrid albums={albums} entryFor={entryFor} onQuickLog={onQuick} />}
  </section>;
}
