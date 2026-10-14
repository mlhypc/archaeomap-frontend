// archaeomap-frontend/src/shared/config/textRules.js
//
// Mirror of backend infrastructure/textRules.js: description length limits and the "no em or
// en dash" rule. The backend rejects violations with 400; the forms stop them earlier.

export const TEXT_LIMITS = Object.freeze({
  cityDescription: 1500,
  controlDescription: 600,
  landmarkDescription: 500,
  rulerDescription: 1200,
  populationSource: 300,
  landmarkMeta: 300,
  name: 255
});

const DASH_RE = /[–—―]/g;

// " — " and " – " become " - ", bare dashes become "-".
export function cleanDashes(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/ [–—―] /g, ' - ').replace(DASH_RE, '-');
}

// Deep copy with every string cleaned; used on request bodies so pasted text never reaches the API with a dash.
export function cleanDashesDeep(value) {
  if (typeof value === 'string') return cleanDashes(value);
  if (Array.isArray(value)) return value.map(cleanDashesDeep);
  if (value && typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = cleanDashesDeep(v);
    return out;
  }
  return value;
}

export function counterText(value, max, hint) {
  const n = (value || '').length;
  const base = `${n}/${max}`;
  return hint ? `${hint} (${base})` : base;
}
