// archaeomap-frontend/src/shared/services/tokenRefresh.js
//
// Shared 401 handling for the axios instances (authApi, userInteractionsApi).
// Access tokens live 24h, refresh tokens 7d. Before this, any 401 removed BOTH
// tokens, so every user was logged out after 24h even with a valid refresh
// token. Now: on 401, exchange the refresh token once (concurrent 401s share
// the same in-flight refresh), store the new pair, retry the request. Only
// when the refresh itself fails are the tokens cleared.

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const TOKEN_KEY = 'archaeomap_token';
export const REFRESH_KEY = 'archaeomap_refresh_token';

let inflight = null;

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function refreshAccessToken() {
  if (inflight) return inflight;
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return Promise.resolve(null);
  inflight = axios
    .post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 15000 })
    .then((res) => {
      const tokens = res.data?.tokens;
      if (!tokens?.accessToken || !tokens?.refreshToken) throw new Error('refresh: bad response');
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
      window.dispatchEvent(new CustomEvent('archaeomap:tokens', { detail: tokens }));
      return tokens;
    })
    .catch(() => {
      clearTokens();
      window.dispatchEvent(new CustomEvent('archaeomap:tokens', { detail: null }));
      return null;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

export function attachRefreshInterceptor(instance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      if (!response || response.status !== 401 || !config || config._retried) {
        return Promise.reject(error);
      }
      // /auth/refresh, /auth/login etc. must not trigger a refresh loop
      if (/\/auth\/(refresh|login|register)$/.test(config.url || '')) {
        return Promise.reject(error);
      }
      const tokens = await refreshAccessToken();
      if (!tokens) return Promise.reject(error);
      config._retried = true;
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${tokens.accessToken}` };
      return instance.request(config);
    }
  );
}
