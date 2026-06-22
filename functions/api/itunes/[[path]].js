// Proxies /api/itunes/* -> https://itunes.apple.com/*
// Uses the explicit Cache API (caches.default) for reliable 24h edge caching
// so repeated lookups never re-hit Apple's rate-limited endpoint.
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/api\/itunes/, "");
  const target = "https://itunes.apple.com" + path + url.search;
  const cacheKey = new Request(target);

  // Serve from edge cache if available (avoids hitting Apple entirely)
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    return new Response(cached.body, {
      status: cached.status,
      headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" },
    });
  }

  const upstream = await fetch(target, {
    headers: { "User-Agent": "Spindle/1.0 (album diary)", Accept: "application/json" },
  });
  const body = await upstream.text();

  const response = new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      // Only set a cacheable cache-control on success — errors must never be cached
      ...(upstream.ok ? { "cache-control": "public, max-age=86400" } : { "cache-control": "no-store" }),
    },
  });

  // Store successful responses in the edge cache for 24h
  if (upstream.ok) {
    context.waitUntil(caches.default.put(cacheKey, response.clone()));
  }

  return response;
}
