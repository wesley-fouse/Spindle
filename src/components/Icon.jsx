export default function Icon({ name, size = 18, color = "currentColor", fill = "none" }) {
  const p = {
    search: <g><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></g>,
    disc: <g><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.4" fill={fill === "solid" ? color : "none"} /></g>,
    check: <polyline points="20 6 9 17 4 12" />,
    plus: <g><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    x: <g><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></g>,
    cal: <g><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /></g>,
    trash: <g><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></g>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.6 7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" fill={fill === "solid" ? color : "none"} />,
    bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill={fill === "solid" ? color : "none"} />,
    dice: <g><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.2" fill={color} /><circle cx="15.5" cy="15.5" r="1.2" fill={color} /><circle cx="12" cy="12" r="1.2" fill={color} /></g>,
    back: <polyline points="15 18 9 12 15 6" />, play: <polygon points="6 4 20 12 6 20 6 4" fill={color} />,
    ext: <g><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></g>,
    users: <g><circle cx="9" cy="8" r="3.5" /><path d="M3 21a6 6 0 0 1 12 0" /><path d="M16 5.5a3.5 3.5 0 0 1 0 7M21 21a6 6 0 0 0-5-5.9" /></g>,
    star: <polygon points="12 2 15 9 22 9.3 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.3 9 9" />,
  }[name];
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
}
