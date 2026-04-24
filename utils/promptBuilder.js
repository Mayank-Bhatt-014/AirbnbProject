function buildConciergeMessages(query, listings, location = null) {
  // Only include the exact fields we want the AI to read
  const listingPayload = listings.map((l) => ({
    id: l._id,
    description: l.description || '',
    price: l.price ?? null,
    location: l.location || ''
  }));

  const system = {
    role: 'system',
    content:
      "You are an AI travel concierge. IMPORTANT: When judging and ranking listings you must only use the provided `description`, `location`, and `price` fields for each listing. Do NOT use any external knowledge. Do NOT invent listings. If a location was detected in the user's query, prefer listings whose `location` matches that location (case-insensitive), but you may still recommend listings whose descriptions demonstrate strong relevance. Respond with a single JSON object only. The JSON must have a top-level key `recommendations` which is an array of objects with keys: `id` (string, listing id), `title` (string, optional), `score` (number 0-1), `reason` (short string), `highlights` (array of 1-3 short strings). Do not include any extra text or explanation outside the JSON object."
  };

  const user = {
    role: 'user',
    content: `User query: ${query}\nDetected location: ${location || 'none'}\nListings (only description, location, price provided): ${JSON.stringify(listingPayload)}`
  };

  return [system, user];
}

module.exports = { buildConciergeMessages };
