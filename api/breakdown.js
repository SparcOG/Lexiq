import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are Lexiq — a vocabulary analyzer for an English learner (Russian speaker, A2-B1, studies physics/neuroscience/AI).

Analyze the given English sentence. Return ONLY this JSON, no markdown, no prose:

{
  "translation": "Full natural Russian translation of the sentence",
  "hardWords": [
    {
      "word": "the difficult word",
      "ru": "Russian translation",
      "field": "neuroscience|medicine|law|philosophy|biology|physics|general",
      "register": "formal|informal|technical|academic|neutral",
      "example": "One real example sentence using this word in a science or academic context"
    }
  ],
  "simpleVersion": "The sentence rewritten in simple A2-level English",
  "toneAnalysis": "2-3 sentences in Russian explaining what tone this text creates (academic, cautious, precise, etc) and why those specific words were chosen"
}

Rules for hardWords:
- Include only B2+ level or domain-specific words
- Skip common words (the, is, and, but, have, can, be, etc.)
- Maximum 6 words, minimum 0
- If sentence has no hard words, return empty array`;

function strip(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { sentence } = req.body || {};
  if (!sentence) return res.status(400).json({ error: 'sentence required' });

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: sentence }],
    });

    const raw = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const parsed = JSON.parse(strip(raw));

    return res.status(200).json({
      translation: parsed.translation || '',
      hardWords: Array.isArray(parsed.hardWords) ? parsed.hardWords : [],
      simpleVersion: parsed.simpleVersion || '',
      toneAnalysis: parsed.toneAnalysis || '',
    });
  } catch (err) {
    console.error('[breakdown]', err);
    return res.status(500).json({ error: err?.message || 'breakdown failed' });
  }
}
