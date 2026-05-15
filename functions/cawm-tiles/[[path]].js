// functions/cawm-tiles/[[path]].js — catch-all proxy for tile requests.
// Matches /cawm-tiles/{z}/{x}/{y}.png and forwards the entire path to
// the backend tile proxy (which caches Iowa tiles for 30 days).
import { proxyToBackend } from '../_lib/proxy';

export async function onRequest({ request }) {
  return proxyToBackend(request);
}
