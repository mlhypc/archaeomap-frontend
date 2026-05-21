// functions/cities/[country]/[city].js
//
// Per-city plain-text mirror at /cities/:country/:city.txt.
//
// When the request's final path segment ends in ".txt" we proxy to the
// backend's matching route so AI/LLM crawlers fetching a specific city
// URL get a complete, structured text response. Otherwise we fall
// through to the SPA fallback so the regular React route
// /cities/:country/:city keeps working.

import { proxyToBackend } from '../../_lib/proxy';

export async function onRequest(context) {
  const city = context.params?.city;
  if (typeof city === 'string' && city.endsWith('.txt')) {
    return proxyToBackend(context.request);
  }
  return context.next();
}
