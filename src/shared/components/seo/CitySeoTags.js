// Per-page SEO tags driven by the currently selected city.
//
// React 19 hoists <title>, <meta>, <link>, and <script> children to
// the document <head> automatically — no react-helmet dependency is
// needed. When selectedCity is null we render the default site-level
// tags so the home view also has a meaningful title.

import React from 'react';
import { cityUrl } from '../../config/generalUtils';

const SITE_NAME = 'ArchaeoMap';
const SITE_ORIGIN = 'https://archaeomap.com';
const DEFAULT_TITLE = 'ArchaeoMap — Explore Ancient Cities Through Time';
const DEFAULT_DESCRIPTION =
  'Explore how cities evolved from ancient times to today. ArchaeoMap offers an interactive historical map with timelines and detailed insights.';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/preview.png`;

const truncate = (s, n = 160) => {
  if (!s) return '';
  const clean = String(s).replace(/\s+/g, ' ').trim();
  return clean.length <= n ? clean : `${clean.slice(0, n - 1).trimEnd()}…`;
};

const formatYear = (year) => {
  if (year === null || year === undefined) return null;
  return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
};

// Collect distinct historical names from a city's controlHistory.
// Skips the modern name itself and "*"-prefixed reconstructed names.
// Used both for schema.org alternateName and for an "(ancient X)"
// hint inserted into the page <title>, both of which strengthen
// discoverability for searches on the historical form.
const collectAlternateNames = (city) => {
  const control = Array.isArray(city.controlHistory) ? city.controlHistory : [];
  const modern = (city.name || '').trim();
  const seen = new Set();
  const out = [];
  for (const c of control) {
    const raw = (c.historical_city_name || '').trim();
    if (!raw) continue;
    if (raw.startsWith('*')) continue;
    if (raw === modern) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);
    out.push(raw);
  }
  return out;
};

const buildCityDescription = (city) => {
  if (city.description) return truncate(city.description, 160);
  const founded = formatYear(city.founded);
  const ended = formatYear(city.endDate);
  const era = founded
    ? ended
      ? `Founded ${founded}, ended ${ended}.`
      : `Founded ${founded}.`
    : '';
  return truncate(
    `${city.name} is a historical city in ${city.country}. ${era} Explore its rulers, landmarks, and population history on ArchaeoMap.`,
    160
  );
};

function CitySeoTags({ city }) {
  if (!city || !city.name || !city.country) {
    return (
      <>
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_ORIGIN}/`} />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={`${SITE_ORIGIN}/`} />
        <meta property="og:image" content={DEFAULT_IMAGE} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_IMAGE} />
      </>
    );
  }

  const alternateNames = collectAlternateNames(city);
  const titleAlias = alternateNames.length ? ` (ancient ${alternateNames[0]})` : '';
  const title = `${city.name}${titleAlias}, ${city.country} — ${SITE_NAME}`;
  const description = buildCityDescription(city);
  const canonical = `${SITE_ORIGIN}${cityUrl(city)}`;
  const image = city.image_url || DEFAULT_IMAGE;

  // schema.org/Place — gives Google enough structured signal to show
  // the city as a rich result (name, location, image, description).
  // additionalType points at the more specific historical-place vocab
  // without locking us out of the wider Place ecosystem.
  const [lat, lng] = Array.isArray(city.coordinates) ? city.coordinates : [null, null];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    additionalType: 'https://schema.org/LandmarksOrHistoricalBuildings',
    name: city.name,
    ...(alternateNames.length ? { alternateName: alternateNames } : {}),
    description,
    url: canonical,
    image,
    ...(lat !== null && lng !== null
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: lat,
            longitude: lng
          }
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      addressCountry: city.country
    },
    ...(city.founded !== undefined && city.founded !== null
      ? { foundingDate: formatYear(city.founded) }
      : {})
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" type="text/plain" href={`${canonical}.txt`} title={`${city.name} — plain text`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

export default CitySeoTags;
