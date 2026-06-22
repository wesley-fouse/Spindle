import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

export function hashHue(s) { let h = 0; for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
export function coverGradient(seed) { const h = hashHue(seed); return `linear-gradient(135deg, hsl(${h} 45% 38%), hsl(${(h + 40) % 360} 42% 22%))`; }
export const fmtDate = (d) => { try { return new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch { return d; } };
export const fmtDur = (ms) => { if (!ms) return ""; const s = Math.round(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

export function Spins({ value, onChange, size = 18 }) {
  return <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map(n => { const on = n <= value;
      return <span key={n} onClick={onChange ? () => onChange(n === value ? 0 : n) : undefined} style={{ cursor: onChange ? "pointer" : "default", lineHeight: 0 }}>
        <Icon name="disc" size={size} color={on ? "var(--spin)" : "var(--line)"} fill={on ? "solid" : "none"} /></span>; })}
  </div>;
}

export function Avatar({ name, size = 44 }) {
  const init = (name || "?").trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, background: `hsl(${hashHue(name || "x")} 42% 42%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fraunces,serif", fontWeight: 600, fontSize: size * 0.38 }}>{init}</div>;
}

export function useInView(onIn, id) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el || !("IntersectionObserver" in window)) { onIn(); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { onIn(); io.disconnect(); } }), { rootMargin: "300px" });
    io.observe(el); return () => io.disconnect();
  }, [id]);
  return ref;
}

export function Cover({ album, font = 22, innerRef }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [album.art]);
  const initials = (album.title || "").replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("");
  return <div ref={innerRef} className="cover-art" style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 4, overflow: "hidden" }}>
    {album.art && !failed
      ? <img src={album.art} onError={() => setFailed(true)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: coverGradient((album.album_id || album.id || "") + album.title) }}>
          <span className="display" style={{ color: "rgba(255,255,255,.92)", fontWeight: 600, fontSize: font }}>{initials}</span></div>}
  </div>;
}

export function Empty({ icon, title, body }) {
  return <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--muted)" }}>
    <div style={{ display: "inline-flex", color: "var(--accent)" }}><Icon name={icon} size={26} color="var(--accent)" /></div>
    <div className="display" style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", marginTop: 12 }}>{title}</div>
    <div style={{ fontSize: 14, maxWidth: 380, margin: "8px auto 0", lineHeight: 1.5 }}>{body}</div></div>;
}
