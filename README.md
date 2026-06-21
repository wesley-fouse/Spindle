# Spindle — a diary for albums

A Letterboxd-style album tracker. Search any album, log + rate it (1–5 "spins"),
write reviews, build a favorites shelf, follow people, and see their listening in a feed.

**Stack:** Vite + React + React Router · Supabase (Postgres + Auth + Row-Level Security) · deploy on Cloudflare Pages.
Album metadata (covers, tracklists, artist catalogs) comes live from the public Apple/iTunes
Search API; background blurbs come from Wikipedia. No API keys for either. The backend
exists for the one thing localStorage can't do: real accounts, public reviews, and a social graph.

---

## 1. Create the Supabase project
1. Go to https://supabase.com → New project. Pick a name, a strong DB password, a region.
2. When it finishes provisioning, open **SQL Editor → New query**, paste the entire contents of
   `supabase/schema.sql`, and click **Run**. This creates the `profiles`, `entries`, and `follows`
   tables, the row-level-security policies, and a trigger that auto-creates a profile on signup.
3. (For easy local testing) **Authentication → Providers → Email**: turn **Confirm email** OFF so
   you can sign in immediately without a confirmation link. Turn it back on for production.

## 2. Wire up environment variables
1. In Supabase: **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
2. In this folder: `cp .env.example .env.local` and paste both values:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
   ```
   (The anon key is safe in the browser — RLS is what protects the data.)

## 3. Run it
```
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173). Create an account, set a username
on your Profile, search an album, and log it. Open a second account in a private window,
follow the first, and watch it appear in the Feed.

## 4. Deploy (Cloudflare Pages)
- Push this folder to a GitHub repo (GitHub Desktop is fine).
- Cloudflare Pages → Create project → connect the repo.
  - **Build command:** `npm run build`
  - **Output directory:** `dist`
  - **Environment variables:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Add a redirect so client-side routes work on refresh: create a file `public/_redirects` with:
  ```
  /*  /index.html  200
  ```
- In Supabase **Authentication → URL Configuration**, add your Pages URL to the allowed redirect/site URLs.

---

## How it's organized
```
supabase/schema.sql      tables, RLS policies, signup trigger
src/lib/supabase.js      Supabase client
src/lib/music.js         iTunes search/lookup + Wikipedia (album metadata)
src/lib/seeds.js         curated discovery seeds + 2026 releases + categories
src/lib/db.js            all database reads/writes (entries, follows, feed, reviews)
src/context/AuthContext  session + profile
src/context/LibraryContext  your synced diary (entries map + log/rate/want/like)
src/pages/               Discover, AlbumPage, ArtistPage, Profile, UserPage, Feed, Auth
src/components/          Tile, Layout, Icon, and shared bits (Cover, Spins, Avatar…)
```

## Data model (short version)
- **profiles** — one per user (username, display name, favorites[]). Auto-created on signup.
- **entries** — one row per (user, album). Holds listened/want/liked/rating/note/date plus
  denormalized album fields (title, artist, art, year, genre) keyed by Apple `collectionId`.
- **follows** — (follower_id, following_id) edges.
- RLS: everything is publicly *readable* (a public diary, like Letterboxd's default) but only the
  owner can write their own rows.

## Notes & next steps
- Spotify is intentionally only used for outbound "Play on Spotify" links — its API no longer
  permits third-party catalog/metadata use at this scale, and prohibits training on its data.
- A future optimization is a normalized `albums` cache table so metadata isn't duplicated per
  entry, plus a Postgres view or RPC for the feed. The denormalized approach here keeps v1 simple
  and fast to ship.
- Ideas to layer on later: activity likes/comments, lists, a global "popular this week," and the
  badge/gamification system from your Phase-2 notes.
