// functions/sitemap.xml.js — proxy /sitemap.xml to backend.
import { proxyToBackend } from './_lib/proxy';

export async function onRequest({ request }) {
  return proxyToBackend(request);
}
