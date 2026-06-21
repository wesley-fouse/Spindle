// Cloudflare Pages Function: proxies /api/wiki/* -> https://en.wikipedia.org/*
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/wiki/, "");
  const target = "https://en.wikipedia.org" + path + url.search;
  const resp = await fetch(target, {
    headers: { "User-Agent": "Spindle/1.0 (album diary)", Accept: "application/json" },
  });
  const body = await resp.text();
  return new Response(body, {
    status: resp.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=86400",
    },
  });
}
