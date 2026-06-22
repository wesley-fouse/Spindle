export async function onRequestGet(context) {
  const target = "https://rss.applemarketingtools.com/api/v2/us/music/most-played/100/albums.json";
  const cacheKey = new Request(target);

  const cached = await caches.default.match(cacheKey);
  if (cached) {
    return new Response(cached.body, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" },
    });
  }

  const upstream = await fetch(target, { headers: { "User-Agent": "Spindle/1.0 (album diary)" } });
  const body = await upstream.text();

  const response = new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      ...(upstream.ok ? { "cache-control": "public, max-age=3600" } : { "cache-control": "no-store" }),
    },
  });

  if (upstream.ok) {
    context.waitUntil(caches.default.put(cacheKey, response.clone()));
  }

  return response;
}
