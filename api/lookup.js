// api/lookup.js — Vercel serverless function
//
// CHEAP version: uses Haiku for ALL levels. About 3x cheaper than Sonnet.
// You can switch back to Sonnet for "deep" later if you want richer answers.

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-haiku-4-5-20251001'; // cheap & fast for all levels

const SYSTEM_PROMPT = `You are Lexiq — a dictionary engine for an English learner (Russian speaker, A2-B1, studies physics/neuroscience/AI).

Return ONLY this JSON, no markdown, no prose:
{
 "pronunciation": "/IPA/",
 "partOfSpeech": "noun|verb|...",
 "definition": { "en": "...", "ru": "..." },
 "examples": [
   { "en": "...", "ru": "..." },
   { "en": "...", "ru": "..." },
   { "en": "...", "ru": "..." }
 ]
}

Level guide for the English definition:
- simple: 1 short sentence, A2 words.
- medium: 2 sentences, with one usage hint.
- deep: 3-4 sentences. Etymology or connection to physics/brain/AI when natural.

3 examples from 3 different contexts. Natural English. Russian = natural translation.`;

function strip(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { word, level } = req.body || {};
  if (!word) return res.status(400).json({ error: 'word required' });
  if (!['simple', 'medium', 'deep'].includes(level)) {
    return res.status(400).json({ error: 'level must be simple|medium|deep' });
  }

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `"${word}" — level: ${level}` }],
    });

    const raw = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const parsed = JSON.parse(strip(raw));

    return res.status(200).json({
      word,
      level,
      pronunciation: parsed.pronunciation || '',
      partOfSpeech: parsed.partOfSpeech || '',
      definition: parsed.definition || { en: '', ru: '' },
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
    });
  } catch (err) {
    console.error('[lookup]', err);
    return res.status(500).json({ error: err?.message || 'lookup failed' });
  }
}
