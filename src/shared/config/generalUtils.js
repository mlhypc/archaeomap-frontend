// frontend\src\config\generalUtils.js

// Constants
export const COLORS = {
    primary: '#774936',
    secondary: '#9b7e52',
    background: '#f8f5ee',
    tableBackground: 'hsla(0, 0%, 83%, 1.00)',
    sectionBackground: '#f9f3e7ff',
    texts: {
      primary: '#433422',
      secondary: '#6b6256',
      muted: '#8c8577'
    },
    border: '#e2d9c8',
    timeline: {
      line: '#d5c7b2',
      dotPrimary: '#9b7e52',
      dotSecondary: '#9b7e52'
    }
  };
  
  export const HISTORICAL_PERIODS = [
    { name: "Neolithic Age", start: -5000, end: -3300, color: "#9c6644" },
    { name: "Bronze Age", start: -3300, end: -1200, color: "#b08968" },
    { name: "Iron Age", start: -1200, end: -500, color: "#6c757d" },
    { name: "Classical Antiquity", start: -500, end: 500, color: "#495057" },
    { name: "Medieval Period", start: 500, end: 1500, color: "#5f0f40" },
    { name: "Renaissance & Age of Discovery", start: 1500, end: 1800, color: "#0f4c5c" },
    { name: "Modern Era", start: 1800, end: 2025, color: "#1d3557" }
  ];
  
  export const TIME_RANGE = {
    MIN_YEAR: -5000,
    MAX_YEAR: new Date().getFullYear()
  };
  
  // Formatting utilities
  export const formatYear = (year) => {
    if (year < 0) return `${Math.abs(year)} BC`;
    if (year === null) return 'Present';
    return `${year}`;
  };
  
  export const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  // Helper function to convert hex to RGB for rgba values
  export const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  };

  // Get current city name based on historical period
  export const getCurrentCityName = (city, currentYear) => {
    // Eğer PeriodCityName verisi yoksa varsayılan adı döndür
    if (!city.PeriodCityName?.length) return city.name;

    // Mevcut yıla uygun period'u bul
    const period = city.PeriodCityName.find(p =>
      currentYear >= p.start && currentYear <= p.end
    );

    // Period bulunursa o dönemdeki adı, bulunamazsa varsayılan adı döndür
    return period ? period.CityName : city.name;
  };

  // URL slug helpers — used to build shareable city URLs like /cities/turkiye/cadir-hoyuk
  //
  // This map covers characters that NFD diacritic stripping cannot decompose.
  // NFD handles most Latin accents on its own (é, ñ, ć, š, etc.); the entries
  // here are the famously non-decomposable letters that would otherwise be
  // dropped by the `[^a-z0-9\s-]` filter and break the slug entirely.
  //
  // Must stay in sync with archaeomap-backend/infrastructure/utils.js#slugify.
  const SLUG_CHAR_MAP = {
    // Turkish
    ç: 'c', Ç: 'c',
    ğ: 'g', Ğ: 'g',
    ı: 'i', İ: 'i',
    ş: 's', Ş: 's',
    ö: 'o', Ö: 'o',
    ü: 'u', Ü: 'u',
    // German
    ß: 'ss',
    // Polish
    ł: 'l', Ł: 'l',
    // Icelandic / Old English
    þ: 'th', Þ: 'th',
    ð: 'd', Ð: 'd',
    // Scandinavian
    ø: 'o', Ø: 'o',
    æ: 'ae', Æ: 'ae',
    // Romanian (comma-below variants — explicit fallback)
    ș: 's', Ș: 's',
    ț: 't', Ț: 't'
  };

  // Match keys built from the map so we never silently drift apart.
  const SLUG_CHAR_REGEX = new RegExp(`[${Object.keys(SLUG_CHAR_MAP).join('')}]`, 'g');

  export const slugify = (s) =>
    (s || '')
      .toString()
      .replace(SLUG_CHAR_REGEX, ch => SLUG_CHAR_MAP[ch] || ch)
      .normalize('NFD')                 // split remaining accents (Latin diacritics)
      .replace(/\p{M}/gu, '')           // strip combining marks
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')     // drop non-alphanumeric (keeps spaces/hyphens)
      .trim()
      .replace(/\s+/g, '-')             // spaces to hyphens
      .replace(/-+/g, '-');             // collapse repeats

  export const cityUrl = (city) => {
    const country = slugify(city.country);
    const name = slugify(city.name || city.generic_city_name);
    if (!country || !name) return '/';
    return `/cities/${country}/${name}`;
  };