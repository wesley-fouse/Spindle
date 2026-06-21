import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchMyEntries, upsertEntry, deleteEntry } from "../lib/db";

const Ctx = createContext(null);
export const useLibrary = () => useContext(Ctx);
export const todayISO = () => new Date().toISOString().slice(0, 10);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState({});

  useEffect(() => {
    if (!user) { setEntries({}); return; }
    let dead = false;
    fetchMyEntries(user.id).then(rows => { if (dead) return; const m = {}; rows.forEach(r => (m[r.album_id] = r)); setEntries(m); }).catch(() => {});
    return () => { dead = true; };
  }, [user]);

  const entryFor = useCallback(id => entries[String(id)] || null, [entries]);
  const write = useCallback(async (album, patch) => {
    if (!user) return null;
    const row = await upsertEntry(user.id, album, patch);
    setEntries(p => ({ ...p, [row.album_id]: row }));
    return row;
  }, [user]);
  const remove = useCallback(async (albumId) => {
    if (!user) return;
    await deleteEntry(user.id, String(albumId));
    setEntries(p => { const n = { ...p }; delete n[String(albumId)]; return n; });
  }, [user]);
  const quickLog = useCallback(async (album) => {
    const e = entries[String(album.album_id)];
    if (e && e.listened) { if (e.want || e.liked) await write(album, { listened: false }); else await remove(album.album_id); }
    else await write(album, { listened: true, want: false, listened_on: (e && e.listened_on) || todayISO() });
  }, [entries, write, remove]);

  return <Ctx.Provider value={{ entries, entryFor, write, remove, quickLog }}>{children}</Ctx.Provider>;
}
