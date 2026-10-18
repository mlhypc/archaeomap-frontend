// archaeomap-frontend/src/home/sections/Map/features/cityCertainty.js
//
// How sure we are about a city, from three optional fields of the bulk timeline and city detail payloads
// (backend contract, snake_case; a missing field means the default):
//   investigation       excavation (default) | sounding | survey | unexamined
//   identification      certain (default) | less_certain | uncertain
//   location_precision  precise (default) | rough
// Map rule: survey or unexamined draws a hollow marker, uncertain identification a dashed outline; a rough
// location adds no marker style of its own (the text line says it). A city with none of the fields looks
// exactly as before, so these helpers return "nothing to show" for today's data.

const INVESTIGATION_TEXT = {
  sounding: 'sounding only',
  survey: 'surface survey only',
  unexamined: 'unexamined'
};

const IDENTIFICATION_TEXT = {
  less_certain: 'debated',
  uncertain: 'uncertain'
};

const LOCATION_TEXT = {
  rough: 'approximate'
};

// camelCase is read too, in case a route maps the payload like endDate / controlHistory
const field = (city, key, camelKey = key) => city?.[key] ?? city?.[camelKey] ?? null;

export const isHollowCity = (city) => {
  const v = field(city, 'investigation');
  return v === 'survey' || v === 'unexamined';
};

export const isDashedCity = (city) => field(city, 'identification') === 'uncertain';

// Short English lines for the marker tooltip and the city panel; empty for a city with default values
export const getCertaintyLines = (city) => {
  const lines = [];
  const investigation = INVESTIGATION_TEXT[field(city, 'investigation')];
  const identification = IDENTIFICATION_TEXT[field(city, 'identification')];
  const location = LOCATION_TEXT[field(city, 'location_precision', 'locationPrecision')];
  if (investigation) lines.push(`Investigation: ${investigation}`);
  if (identification) lines.push(`Identification: ${identification}`);
  if (location) lines.push(`Location: ${location}`);
  return lines;
};

// Which legend rows the given cities need: { hollow, dashed }; stops early once both are found
export const getLegendNeeds = (cityLists) => {
  let hollow = false;
  let dashed = false;
  for (const list of cityLists) {
    for (let i = 0; i < list.length; i++) {
      if (!hollow && isHollowCity(list[i])) hollow = true;
      if (!dashed && isDashedCity(list[i])) dashed = true;
      if (hollow && dashed) return { hollow, dashed };
    }
  }
  return { hollow, dashed };
};
