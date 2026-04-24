const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

function createOpenAIClient({ apiKey, model = DEFAULT_MODEL, fetchImpl } = {}) {
  const fetcher = fetchImpl || global.fetch;
  if (!fetcher) throw new Error('fetch is not available in this environment');
  if (!apiKey) throw new Error('OpenAI API key is required');

  async function chat(messages, options = {}) {
    const payload = {
      model: model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 500
    };

    const resp = await fetcher('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = null;
    }

    if (!resp.ok) {
      console.error('OpenAI API request failed', resp.status, text);
      throw new Error(`OpenAI API request failed: ${resp.status} ${text}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === 'undefined') {
      console.error('OpenAI response missing assistant content', data || text);
      throw new Error('OpenAI returned no assistant content');
    }

    return content;
  }

  return { chat };
}

module.exports = { createOpenAIClient };
