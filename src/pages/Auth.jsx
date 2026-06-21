import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setMsg("");
    const fn = mode === "in" ? signIn : signUp;
    const { data, error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    if (mode === "up" && !data.session) { setMsg("Check your email to confirm your account, then sign in."); return; }
    nav("/");
  }

  return <section style={{ paddingTop: 40, maxWidth: 380, margin: "0 auto" }}>
    <h1 className="display" style={{ fontSize: 26, fontWeight: 600 }}>{mode === "in" ? "Welcome back" : "Create your account"}</h1>
    <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>Log albums, write reviews, and follow friends.</p>
    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
      <button className="btn-primary" disabled={busy} onClick={submit} style={{ justifyContent: "center" }}>{busy ? "…" : (mode === "in" ? "Sign in" : "Sign up")}</button>
    </div>
    {msg && <div style={{ marginTop: 12, fontSize: 13.5, color: "var(--accent)" }}>{msg}</div>}
    <div style={{ marginTop: 16, fontSize: 14 }}>
      {mode === "in" ? "New here? " : "Already have an account? "}
      <a onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} style={{ cursor: "pointer" }}>{mode === "in" ? "Create an account" : "Sign in"}</a>
    </div>
  </section>;
}
