// Pages Function: proxies /api/wiki/* -> https://en.wikipedia.org/*  (edge-cached 24h)
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/api\/wiki/, "");
  const target = "https://en.wikipedia.org" + path + url.search;
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
