// archaeomap-frontend/functions/_middleware.js
//
// Canonical host is the apex: https://archaeomap.com (matches <link rel=canonical>,
// og:url and the backend FRONTEND_URL). www.archaeomap.com used to serve the same
// app without redirecting; since localStorage (auth tokens) is per-origin, a user
// who signed in on one host looked logged-out on the other. 301 www -> apex,
// preserving path and query, so there is exactly one origin.

const CANONICAL_HOST = 'archaeomap.com';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
