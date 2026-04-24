const Listing = require('../models/listing');
const { extractLocation } = require('../utils/queryParser');

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&');
}

async function searchListings(query, maxResults = 5) {
  if (!query) return [];

  const location = extractLocation(query); // e.g. "Tokyo"

  // build content words but remove location words so we don't double-match
  let words = query
    .split(/\s+/)
    .map((w) => w.replace(/[^\u0000-\u007F]/g, ''))
    .map((w) => w.trim())
    .filter(Boolean);

  // remove obvious stopwords that don't help matching
  const stopwords = new Set(['in', 'near', 'nearby', 'around', 'the', 'a', 'an', 'places', 'place', 'close', 'closest']);
  words = words.filter((w) => !stopwords.has(w.toLowerCase()));

  if (location) {
    const locTokens = location.split(/\\s+/).map((t) => t.toLowerCase());
    words = words.filter((w) => !locTokens.includes(w.toLowerCase()));
  }

  // create simple morphological variants for each token so plurals/singulars match
  function tokenVariants(token) {
    const t = token.toLowerCase();
    const variants = new Set();
    variants.add(t);
    if (t.length > 2) {
      if (t.endsWith('ies')) variants.add(t.replace(/ies$/, 'y'));
      if (t.endsWith('y')) variants.add(t.replace(/y$/, 'ies'));
      if (t.endsWith('s')) variants.add(t.replace(/s$/, ''));
      else variants.add(t + 's');
      if (t.endsWith('es')) variants.add(t.replace(/es$/, 'e'));
    }
    return Array.from(variants).filter(Boolean);
  }

  const patternParts = [];
  for (const w of words) {
    const parts = tokenVariants(w).map(escapeRegex).filter(Boolean);
    if (parts.length) patternParts.push(parts.join('|'));
  }

  const contentRegex = patternParts.length ? new RegExp('\\b(?:' + patternParts.join('|') + ')\\b', 'i') : null;
  const locationRegex = location ? new RegExp('\\\\b' + escapeRegex(location) + '\\\\b', 'i') : null;

  const contentClauses = contentRegex
    ? [
        { title: { $regex: contentRegex } },
        { description: { $regex: contentRegex } }
      ]
    : [];

  const locationClauses = locationRegex
    ? [{ location: { $regex: locationRegex } }, { country: { $regex: locationRegex } }]
    : [];

  let mongoQuery = {};
  if (contentClauses.length && locationClauses.length) {
    // be permissive: match listings that match either the content tokens OR the location
    mongoQuery = { $or: [{ $or: contentClauses }, { $or: locationClauses }] };
  } else if (locationClauses.length) {
    mongoQuery = { $or: locationClauses };
  } else if (contentClauses.length) {
    mongoQuery = { $or: contentClauses.concat([{ location: { $regex: contentRegex } }, { country: { $regex: contentRegex } }]) };
  } else {
    return [];
  }

  try {
    console.log('[searchListings2] query=', query);
    console.log('[searchListings2] detectedLocation=', location);
    console.log('[searchListings2] contentRegex=', contentRegex);
    console.log('[searchListings2] locationRegex=', locationRegex);
    console.log('[searchListings2] mongoQuery=', JSON.stringify(mongoQuery));
  } catch (e) {}

  const listings = await Listing.find(mongoQuery).limit(Number(maxResults)).lean();
  console.log(`[searchListings2] found ${listings.length} listings`);

  return listings;
}

module.exports = { searchListings };
