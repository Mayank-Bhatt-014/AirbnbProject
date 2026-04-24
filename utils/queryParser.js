function extractLocation(query) {
  if (!query || typeof query !== 'string') return null;
  // Try common preposition patterns: in|near|at|around
  const prepRe = /(?:in|near|at|around)\s+([A-Za-z\u00C0-\u017F0-9][A-Za-z\u00C0-\u017F0-9\s\-\&']*)/i;
  const prepMatch = query.match(prepRe);
  if (prepMatch && prepMatch[1]) return prepMatch[1].trim().replace(/[.,]$/,'');

  // Try comma-separated location like "places, Tokyo"
  const commaRe = /,\s*([A-Za-z\u00C0-\u017F0-9][A-Za-z\u00C0-\u017F0-9\s\-\&']*)/i;
  const commaMatch = query.match(commaRe);
  if (commaMatch && commaMatch[1]) return commaMatch[1].trim().replace(/[.,]$/,'');

  // Fallback: if query contains 'places in <word>' or ends with a single token location
  const endsWithRe = /(?:places|stay|stays|hotels|listings)\s+(in)\s+([A-Za-z\u00C0-\u017F0-9\-\s]+)/i;
  const endsMatch = query.match(endsWithRe);
  if (endsMatch && endsMatch[2]) return endsMatch[2].trim().replace(/[.,]$/,'');

  return null;
}

module.exports = { extractLocation };
