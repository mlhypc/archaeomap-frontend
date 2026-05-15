// functions/cities-index.html.js — proxy /cities-index.html to backend.
import { proxyToBackend } from './_lib/proxy';

export async function onRequest({ request }) {
  return proxyToBackend(request);
}
