// Pages Function: proxies /api/itunes/* -> https://itunes.apple.com/*
// Caches successful upstream responses at Cloudflare's edge for 24h so repeat
// lookups don't re-hit Apple (which rate-limits per IP).
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/api\/itunes/, ""); // /search or /lookup
  const target = "https://itunes.apple.com" + path + url.search;
  const upstream = await fetch(target, {
    headers: { "User-Agent": "Spindle/1.0 (album diary)", Accept: "application/json" },
    // Cache 2xx for 24h; never cache error responses (429/403/5xx) so a
    // rate-limit doesn't get served from edge cache for the next 24 hours.
    cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": 86400, "400-599": 0 } },
  });
  const body = await upstream.text();
  // Pass rate-limit errors through so the client can back off and retry.
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      ...(upstream.ok ? { "cache-control": "public, max-age=86400" } : { "cache-control": "no-store" }),
    },
  });
}
