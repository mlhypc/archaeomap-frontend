// archaeomap-frontend/src/shared/components/seo/DefaultSeoTags.js
//
// Homepage (no city selected) head tags, rendered by React 19 (hoisted to <head>).
// index.html carries the same tags with data-default-seo for crawlers that do not
// run JavaScript; once React is up those static copies are removed so a city page
// never ends up with two canonicals / two og:url (Google took the first = homepage).

import { useEffect } from 'react';

const SITE_URL = 'https://archaeomap.com';
const TITLE = 'ArchaeoMap — Explore Ancient Cities Through Time';
const DESCRIPTION = 'Explore how cities evolved from ancient times to today. ArchaeoMap offers an interactive historical map with timelines and detailed insights.';
const IMAGE = `${SITE_URL}/preview.png`;

export function useRemoveStaticSeoTags() {
  useEffect(() => {
    document.querySelectorAll('head [data-default-seo]').forEach((el) => el.remove());
  }, []);
}

export default function DefaultSeoTags() {
  return (
    <>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:image" content={IMAGE} />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ArchaeoMap" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={IMAGE} />
    </>
  );
}
