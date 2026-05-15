// functions/llms-full.txt.js — proxy /llms-full.txt to backend.
import { proxyToBackend } from './_lib/proxy';

export async function onRequest({ request }) {
  return proxyToBackend(request);
}
