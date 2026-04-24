const { createOpenAIClient } = require('../services/openaiClient');
const { searchListings } = require('../services/listingService2');
const { buildConciergeMessages } = require('../utils/promptBuilder');
const { parseRecommendations } = require('../utils/aiResponseParser');
const { extractLocation } = require('../utils/queryParser');

async function concierge(req, res, next) {
  try {
    const { query, maxResults = 5 } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const listings = await searchListings(query, maxResults);
    console.log('[concierge] listings.length=', listings && listings.length);
    const detectedLocation = extractLocation(query);
    if (!listings || listings.length === 0) {
      return res.json({ query, recommendations: [] });
    }

    // Lazily create OpenAI client so missing API key doesn't crash the server at require-time
    let openai;
    try {
      openai = createOpenAIClient({ apiKey: process.env.OPENAI_API_KEY });
    } catch (e) {
      console.error('OpenAI client initialization failed:', e.message || e);
      return res.status(500).json({ error: 'OpenAI is not configured on the server' });
    }

    const messages = buildConciergeMessages(query, listings, detectedLocation); // returns [system, user] messages for the concierge prompt
    try {
      console.log('[concierge] messages=', JSON.stringify(messages));
    } catch (e) {}
    let aiText;
    try {
      aiText = await openai.chat(messages);
      console.log('[concierge] aiText=', aiText);
    } catch (e) {
      console.error('OpenAI call failed:', e && e.message ? e.message : e);
      // Fallback: when OpenAI is unavailable (quota/network), return simple heuristic recommendations
      try {
        const qtokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        const maxPrice = listings.reduce((m, l) => (l.price && l.price > m ? l.price : m), 0) || 1;
        const recs = listings.map((l) => {
          const desc = (l.description || '').toLowerCase();
          const matchCount = qtokens.reduce((c, t) => c + (desc.includes(t) ? 1 : 0), 0);
          const textScore = qtokens.length ? matchCount / qtokens.length : 0;
          const priceScore = l.price ? 1 - Math.min(l.price / maxPrice, 1) : 0.5;
          const score = Math.max(0, Math.min(1, textScore * 0.7 + priceScore * 0.3));
          const highlights = [];
          if (matchCount) highlights.push('Matches query terms');
          if (l.price) highlights.push(`Price: $${l.price}`);
          return {
            id: l._id,
            title: l.title || '',
            score: Number(score.toFixed(2)),
            reason: matchCount ? 'Matches your query in the description' : 'Relevant listing',
            highlights,
            listing: l
          };
        }).sort((a,b) => b.score - a.score).slice(0, maxResults);

        return res.status(200).json({ query, recommendations: recs, warning: 'OpenAI unavailable — returned heuristic recommendations' });
      } catch (e2) {
        return res.status(502).json({ error: 'OpenAI request failed', detail: e && e.message ? e.message : String(e) });
      }
    }

    const parsed = parseRecommendations(aiText, listings);
    try { console.log('[concierge] parsed=', JSON.stringify(parsed)); } catch (e) {}
    if (parsed.error) {
      return res.status(200).json({
        query,
        listings,
        ai_raw: parsed.ai_raw,
        warning: 'AI response was not valid JSON'
      });
    }

    return res.json({ query, recommendations: parsed.recommendations });
  } catch (err) {
    next(err);
  }
}

module.exports = { concierge };
