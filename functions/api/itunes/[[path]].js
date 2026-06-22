// Pages Function: proxies /api/itunes/* -> https://itunes.apple.com/*
// Caches successful upstream responses at Cloudflare's edge for 24h so repeat
// lookups don't re-hit Apple (which rate-limits per IP).
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/api\/itunes/, ""); // /search or /lookup
  const target = "https://itunes.apple.com" + path + url.search;
  const upstream = await fetch(target, {
    headers: { "User-Agent": "Spindle/1.0 (album diary)", Accept: "application/json" },
    cf: { cacheTtl: 86400, cacheEverything: true },
  });
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=86400",
    },
  });
}
