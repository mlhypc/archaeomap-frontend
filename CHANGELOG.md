# Changelog

One entry per version, titled like its commit (`<version> - <short title>`), with Added / Changed / Fixed /
Removed underneath. Versions follow Semantic Versioning (major: a route or URL scheme changes incompatibly;
minor: a new page, feature or panel; patch: fixes, performance, documentation). Work that is not yet
versioned accumulates under Unreleased. Rules: ../../CLAUDE.md section 14.

## Unreleased

## 1.1.1 - Restore www middleware (2026-10-14)

### Fixed
- The `_redirects` host rule from 1.1.0 is ignored by Cloudflare Pages (www served 200 for ~10 minutes).
  `functions/_middleware.js` is back; a dashboard Redirect Rule remains the way to drop the Function.

## 1.1.0 - Review fixes (2026-10-14)

Two code reviews (home/map/SEO and panel/auth) cross-checked against the backend contracts. Backend
counterpart: archaeomap-backend 1.1.0.

### Fixed
- Contributor application sent snake_case fields (`interest_areas`, ...) while the backend validates
  camelCase: every submission failed with 400.
- `time_remaining` is milliseconds from the backend; the pending-applications and my-applications views
  expected `{expired, hours, minutes}` ("undefinedm remaining", buttons never disabled after the deadline).
- Users were logged out after 24 h: a 401 removed both tokens. A shared interceptor now exchanges the
  refresh token once (concurrent 401s share it), retries the request and only clears tokens if the refresh
  fails (`shared/services/tokenRefresh.js`). AuthContext reads the rotated pair back from storage.
- After unlinking Google (or any `UPDATE_USER`) the auth state stayed `LOADING`, so the panel showed the
  login form until a reload.
- Moderation list: the status filter was frozen on "pending" (stale closure); the list did not refresh after
  approve/reject; the statistics tab read `data.workflow` while the backend sends `data.stats`/`data.summary`.
- City edit: an empty end date was saved as the current year (ongoing cities ended in 2026); changes to
  rulers, population or landmarks did not enable Save.
- Removing a city from a collection left the detail view stale (read the pre-fetch closure).
- OAuth callback redirected to `/login` (404 page); it goes to `/panel`, and the success redirect replaces
  the token-carrying callback URL in history.
- `AuthProvider` and the theme were mounted twice (index.js and App.js): two `/auth/me` calls and two auth states.
- Map: `CityMarkers` memo compared only array lengths, so a pan to another place with the same number of
  cities kept the old markers. react-leaflet 5 removed `whenCreated`; the map instance now comes via `ref`,
  so `invalidateSize` works again when the sidebar resizes (the mobile zoom reset on every resize is gone).
- Map labels put the city name into innerHTML unescaped (stored XSS through a contributor-submitted name);
  the ruler colour is validated as a hex value.
- City pages had two canonicals and two og:url sets (static index.html + React 19 hoisted tags; Google took
  the first = homepage). The static tags carry `data-default-seo` for non-JS crawlers and are removed at
  runtime; the homepage renders `DefaultSeoTags`. `og:image` is absolute.
- Back button: every city click pushed two or three history entries; same-URL pushes are skipped. Going
  back to `/` clears the selected city. Only a real 404 renders the not-found page (a 429/5xx did too).
- Sidebar image: the `/api` strip broke `https://api.` hosts; lazy-loading inside `display:none` never fired.
- Contributors had no way to submit a city (Cities section is now in their Contribution group).

### Changed
- Cesium (5.7 MB) is loaded with `defer` instead of blocking first paint on every page.
- www -> apex 301 moved to a `_redirects` host rule (reverted in 1.1.1: Pages ignored it).

### Known, not fixed
- Every panel section is mounted for every visitor and hidden with CSS; hidden sections poll.
- `GET /city-creation/validate/:name` and the sources upload call endpoints that do not exist.
- Cesium click/camera handlers capture stale callbacks; Sidebar abort check reads the newer controller.

## 1.0.0 - Versioning baseline (2026-10-14)

The site as live on Cloudflare Pages at commit 8a5cd1b: map + timeline, city and ruler panels, moderation
and admin panel, Google and password login, SEO endpoints via Pages Functions, www -> apex 301 middleware.
Earlier history is in git only. `package.json` version was 0.0.3 before this entry.
