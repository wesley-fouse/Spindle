import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function Layout({ children }) {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();
  const tab = ({ isActive }) => "tab" + (isActive ? " on" : "");
  return <div className="wrap">
    <header className="head">
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "var(--ink)" }}>
        <Icon name="disc" size={32} color="var(--accent)" />
        <div><div className="display" style={{ fontSize: "clamp(24px,7vw,30px)", fontWeight: 600, lineHeight: 1 }}>Spindle</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>A diary for albums.</div></div>
      </Link>
      <nav className="nav">
        <NavLink to="/" end className={tab}>Discover</NavLink>
        {user && <NavLink to="/feed" className={tab}>Feed</NavLink>}
        {user && <NavLink to="/profile" className={tab}>Profile</NavLink>}
        {user
          ? <button className="tab" onClick={async () => { await signOut(); nav("/"); }} title={profile?.display_name || ""}>Sign out</button>
          : <NavLink to="/login" className={tab}>Sign in</NavLink>}
      </nav>
    </header>
    {children}
  </div>;
}
