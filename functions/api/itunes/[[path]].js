// Pages Function: proxies /api/itunes/* -> https://itunes.apple.com/*
// Caches successful responses at Cloudflare's edge so repeat lookups never re-hit Apple.
export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/itunes/, ""); // /search or /lookup
  const target = "https://itunes.apple.com" + path + url.search;

  const cache = caches.default;
  const cacheKey = new Request("https://cache.spindle" + path + url.search, { method: "GET" });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const upstream = await fetch(target, {
    headers: { "User-Agent": "Spindle/1.0 (album diary)", Accept: "application/json" },
  });
  const body = await upstream.text();
  const resp = new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=86400",
    },
  });
  if (upstream.ok) context.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}
