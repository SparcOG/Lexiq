// api/potd.js — Phrase of the Day endpoint
//
// Model: claude-haiku-4-5 ONLY. Never Sonnet/Opus.
// Budget: max_tokens 300, system prompt ~55 tokens.
// Called at most ONCE per user per day (client-side localStorage cache).

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

// ~55 tokens. Keep tight.
const SYSTEM = `Return ONLY valid JSON: {"phrase":"...","meaning":"...","examples":["...","..."]}.
phrase: a well-known English idiom or fixed expression.
meaning: ONE clear B1 sentence.
examples: 2 short natural sentences using the phrase.
No markdown. No code fences.`;

function strip(s) {
  return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { history } = req.body || {};
  const avoid = Array.isArray(history) && history.length
    ? `Avoid these recent: ${history.slice(0, 30).join(', ')}.`
    : 'Pick any well-known idiom.';

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: 'user', content: avoid }],
    });

    const raw = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const parsed = JSON.parse(strip(raw));

    return res.status(200).json({
      phrase: String(parsed.phrase || '').trim(),
      meaning: String(parsed.meaning || '').trim(),
      examples: Array.isArray(parsed.examples) ? parsed.examples.slice(0, 2) : [],
      date: new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error('[potd]', err);
    return res.status(500).json({ error: err?.message || 'potd failed' });
  }
}
