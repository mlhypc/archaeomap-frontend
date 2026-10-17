# Changelog

One entry per version, titled like its commit (`<version> - <short title>`), with Added / Changed / Fixed /
Removed underneath. Versions follow Semantic Versioning (major: a route or URL scheme changes incompatibly;
minor: a new page, feature or panel; patch: fixes, performance, documentation). Work that is not yet
versioned accumulates under Unreleased. Rules: ../../CLAUDE.md section 8.

## Unreleased

## 1.3.0 - My cities filter, map search, Apple login (2026-10-17)

### Added
- "My cities" filter on the map (heart button in the top-right controls, 2D and 3D): all cities, only the
  liked ones, or one of the user's collections. Likes and collection edits in the sidebar apply at once,
  choosing a collection frames its cities in 2D, logout switches it off, logged-out users get the login page.
- "Show on Map" for a collection in the profile (card menu and detail dialog): opens the map filtered to it
  via `/?collection=<id>`, which the map reads once and drops from the URL.
- "Sign in with Apple" button under the Google one, shown only when the backend reports Apple as configured
  (`/api/auth/providers`); the sign-in callback explains a cancelled or unavailable Apple sign-in.
- City search on the map: the leftmost button of the top-right control group, which widens to the left
  into the field when clicked (on phones the other buttons fold away and it spans the screen) and folds back
  after a pick, on Escape or on a click elsewhere. It searches the map's loaded data, so it is instant and matches old names too
  (Constantinople, Byzantion -> Istanbul); picking a city opens it like its URL does.
- The logo links to the About page (desktop header, phone drawer and phone map overlay); centred in the
  desktop header and the phone drawer.

### Changed
- Text selection is off across the interface (buttons, tabs, headers, counters) and stays on where people
  read and quote: city details (name, description, periods, landmarks, sources) and form fields. Global rule
  in `shared/theme/styles.js`; a container opts in with `.selectable`, clickable parts inside it with `.no-select`.
- City panel: years read BCE / CE everywhere (`formatYear`, time slider, liked cities, form hints), as in the
  descriptions; the dates box uses earth tones instead of teal and alarm red for "Ended", with the lifespan
  on the Ended row; every section header carries its item count; Like shows "Liked" and hides a zero count;
  the collections button reads "Save" / "Saved"; the description is 0.8rem on small phones (was 0.65rem).
- City panel periods and landmarks show their full description on every screen (were cut at 280 / 200
  characters with no way to read on, which hid the end of 65% of period and 92% of landmark texts, and were
  hidden on phones); the period covering the time slider's year is highlighted in its ruler's color;
  Historical Control opens by default on desktop; ranges read "2100-1940 BCE"; spans across BCE/CE count
  no year 0 (100 BCE to 100 CE is 199 years).
- The time slider reaches the current year (stopped at 2025).
- Contact address is info@archaeomap.com (was melih@archaeomap.com) in the About page, the structured data of
  both index pages and llms.txt.
- The collections button uses a bookmark icon (was a photo gallery icon).

### Fixed
- Landmarks were sorted in place, reordering the cached city object on every render.
- Google sign-in callback reads the tokens from the URL fragment (backend 1.5.0) and wipes it from the address
  bar at once; the old query form still works.
- Profile header on phones: a long email, the Verified chip and the info row (member since, role, last login)
  could not wrap and pushed the page sideways; they wrap now, and the avatar and name are smaller below 600px.
- The city panel used year 2000 until the slider moved, while the map restored the last year from the
  browser (so its name and highlighted period could be wrong); the map now reports the restored year on load.
- Time slider: fixed to the window at "360px + half the rest", so it sat off-screen between 600 and 900px
  (no sidebar there) and off-centre when the sidebar was resized or collapsed; it is now placed inside the
  map area. On phones it no longer hides the map attribution, and the word "Timeline" gives way to the period.
- Phones: the page used 100vh, which includes the area under the browser's address bar (bottom of the map
  hidden); it uses 100dvh. Below 420px the header shows the logo without the name, which collided with the
  map buttons.
- Profile collection cards: "Updated Invalid Date" (read `updated_at`, the API sends `updatedAt`), and the
  city badge counts the cities actually listed.

## 1.2.2 - Validation reasons in errors (2026-10-15)

### Fixed
- City and ruler API clients append the 400 `details` messages (text and logic rules) to the error,
  so the panel shows why a save was refused instead of "Validation failed".

## 1.2.1 - City description target (2026-10-15)

### Changed
- City description counter in the create and edit forms counts against the 1000-character target
  (`TEXT_TARGETS`) and turns the field red past it; `maxLength` stays at the 1500 hard limit.

## 1.2.0 - Text rules in forms (2026-10-15)

### Added
- `shared/config/textRules.js` mirrors the backend limits: description fields in the city, ruler and
  historical-data editors get a character counter and `maxLength`; typed or pasted em/en dashes become
  hyphens; `cityApi` and `rulerApi` clean every string in a JSON request body before sending.

## 1.1.5 - Map resizes with the sidebar (2026-10-15)

### Fixed
- Collapsing or dragging the sidebar left the newly exposed map strip without tiles and markers: Leaflet
  only re-measured on window resize. A ResizeObserver on the map container now calls `invalidateSize`
  on every container size change.

## 1.1.4 - No em dashes (2026-10-15)

### Changed
- Text rule: no em or en dashes in UI text, titles, meta tags, static pages or comments; plain hyphen
  instead (`ArchaeoMap - Explore Ancient Cities Through Time`).

## 1.1.3 - OpenStreetMap layer without CARTO (2026-10-14)

### Fixed
- The "OpenStreetMap" layer (2D and 3D) loaded CARTO basemap tiles; CARTO stopped serving them without an
  API key on 2026-09-25 and returned an "API KEY REQUIRED" image. The layer now uses tile.openstreetmap.org.

## 1.1.2 - www redirect via Cloudflare rule (2026-10-14)

### Removed
- `functions/_middleware.js`: the www -> apex 301 is now a Cloudflare Redirect Rule on the zone, so no
  request goes through a Pages Function any more.

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
