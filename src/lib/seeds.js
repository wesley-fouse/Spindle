// Curated discovery seeds (resolved to real catalog albums at runtime).
export const POOL = [
  ["To Pimp a Butterfly","Kendrick Lamar","Hip-Hop"],["Illmatic","Nas","Hip-Hop"],["Madvillainy","Madvillain","Hip-Hop"],
  ["My Beautiful Dark Twisted Fantasy","Kanye West","Hip-Hop"],["good kid, m.A.A.d city","Kendrick Lamar","Hip-Hop"],["Aquemini","OutKast","Hip-Hop"],
  ["OK Computer","Radiohead","Rock"],["The Dark Side of the Moon","Pink Floyd","Rock"],["Abbey Road","The Beatles","Rock"],
  ["Revolver","The Beatles","Rock"],["Nevermind","Nirvana","Rock"],["In Rainbows","Radiohead","Rock"],
  ["Thriller","Michael Jackson","Pop"],["Purple Rain","Prince","Pop"],["1989","Taylor Swift","Pop"],
  ["Back to Black","Amy Winehouse","Pop"],["Future Nostalgia","Dua Lipa","Pop"],["BRAT","Charli xcx","Pop"],
  ["What's Going On","Marvin Gaye","R&B & Soul"],["Songs in the Key of Life","Stevie Wonder","R&B & Soul"],["Channel Orange","Frank Ocean","R&B & Soul"],
  ["Blonde","Frank Ocean","R&B & Soul"],["SOS","SZA","R&B & Soul"],["Voodoo","D'Angelo","R&B & Soul"],
  ["Discovery","Daft Punk","Electronic"],["Selected Ambient Works 85-92","Aphex Twin","Electronic"],["Random Access Memories","Daft Punk","Electronic"],
  ["Untrue","Burial","Electronic"],["Music Has the Right to Children","Boards of Canada","Electronic"],["Immunity","Jon Hopkins","Electronic"],
  ["Kind of Blue","Miles Davis","Jazz"],["A Love Supreme","John Coltrane","Jazz"],["Mingus Ah Um","Charles Mingus","Jazz"],
  ["Time Out","The Dave Brubeck Quartet","Jazz"],["The Epic","Kamasi Washington","Jazz"],["Blue Train","John Coltrane","Jazz"],
  ["Blue","Joni Mitchell","Folk & Country"],["Blood on the Tracks","Bob Dylan","Folk & Country"],["Pink Moon","Nick Drake","Folk & Country"],
  ["Carrie & Lowell","Sufjan Stevens","Folk & Country"],["Golden Hour","Kacey Musgraves","Folk & Country"],["folklore","Taylor Swift","Folk & Country"],
  ["Master of Puppets","Metallica","Metal"],["Paranoid","Black Sabbath","Metal"],["Reign in Blood","Slayer","Metal"],
  ["Rust in Peace","Megadeth","Metal"],["Blackwater Park","Opeth","Metal"],["Jane Doe","Converge","Metal"],
  ["In the Aeroplane Over the Sea","Neutral Milk Hotel","Indie & Alternative"],["Funeral","Arcade Fire","Indie & Alternative"],["Loveless","My Bloody Valentine","Indie & Alternative"],
  ["Is This It","The Strokes","Indie & Alternative"],["Sound of Silver","LCD Soundsystem","Indie & Alternative"],["Punisher","Phoebe Bridgers","Indie & Alternative"],
].map((r, i) => ({ id: "s" + i, title: r[0], artist: r[1], genre: r[2], cat: r[2] }));

export const NEW_2026 = [
  ["OCTANE","Don Toliver"],["Kehlani","Kehlani"],["Iceman","Drake"],["Songs About Us","Jason Aldean"],
  ["Dandelion","Ella Langley"],["Middle of Nowhere","Kacey Musgraves"],["BULLY","Ye"],["WOR$T GIRL IN AMERICA","Slayyyter"],
  ["THIS MUSIC MAY CONTAIN HOPE.","RAYE"],["Sexistential","Robyn"],["U","underscores"],["The Way I Am","Luke Combs"],
  ["An Undying Love for a Burning World","Neurosis"],["Girlfriend","Grace Ives"],["Nothing's About to Happen to Me","Mitski"],
  ["Cloud 9","Megan Moroney"],["The Fall-Off","J. Cole"],["Don't Be Dumb","A$AP Rocky"],["With Heaven on Top","Zach Bryan"],
].map((r, i) => ({ id: "n" + i, title: r[0], artist: r[1], year: "2026", genre: "New Releases", cat: "New Releases" }));

export const CATEGORIES = [
  { key: "New Releases", type: "recent", color: "#B5532A" },
  { key: "Hip-Hop", color: "#4A8DB7" }, { key: "Rock", color: "#2A3A86" }, { key: "Pop", color: "#9B5BA5" },
  { key: "R&B & Soul", color: "#7B2CBF" }, { key: "Electronic", color: "#1B998B" }, { key: "Jazz", color: "#9C6644" },
  { key: "Folk & Country", color: "#5A7D2C" }, { key: "Metal", color: "#34343A" }, { key: "Indie & Alternative", color: "#C8553D" },
];
export function catSeeds(c) {
  if (!c) return [];
  if (c.type === "recent") return NEW_2026;
  return POOL.filter(a => a.cat === c.key);
}
export const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Deterministic shuffle: same seed -> same order (used to rotate Featured hourly).
export function seededShuffle(arr, seed) {
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Read the localStorage art/id cache that music.js maintains (artist|title -> {album_id,...}).
export function loadArtCache() { try { return JSON.parse(localStorage.getItem("spindle_art_v2") || "{}"); } catch { return {}; } }
export const artKey = (s) => (s.artist + "|" + s.title).toLowerCase();
