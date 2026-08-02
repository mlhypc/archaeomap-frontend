// archaeomap-frontend/functions/_lib/proxy.js
//
// Shared backend proxy helper for Pages Functions. Cloudflare Pages
// _redirects 200 proxy is restricted to same-origin destinations, so
// our cross-origin proxy targets (sitemap.xml, llms-full.txt,
// cities-index.html, cawm-tiles) live as Functions instead.

const BACKEND = 'https://api.archaeomap.com';

export async function proxyToBackend(request) {
  const url = new URL(request.url);
  const targetUrl = `${BACKEND}${url.pathname}${url.search}`;

  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.delete('host');

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers: upstreamHeaders,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  });

  // Pass through the upstream response verbatim. Cloudflare's edge
  // cache will honour the Cache-Control header the backend sets.
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers
  });
}
