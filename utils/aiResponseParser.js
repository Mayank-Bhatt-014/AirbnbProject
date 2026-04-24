function parseRecommendations(aiText, listings) {
  try {
    const aiJson = JSON.parse(aiText);
    const recs = (aiJson.recommendations || []).map((r) => {
      const listing = listings.find(
        (l) => l._id.toString() === r.id || l._id == r.id
      );
      return {
        id: r.id,
        title: r.title || (listing && listing.title),
        score: r.score,
        reason: r.reason,
        highlights: r.highlights || [],
        listing: listing || null
      };
    });
    return { recommendations: recs };
  } catch (e) {
    return { error: 'invalid_json', ai_raw: aiText };
  }
}

module.exports = { parseRecommendations };
