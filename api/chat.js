// api/chat.js — Vercel serverless function
//
// Two modes:
//   Word mode:   POST { word, messages }     → max_tokens 600
//   Phrase mode: POST { phrase, messages }   → max_tokens 400
// Both use Haiku.

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

function wordSystem(word) {
  return `You are Lexiq — thinking partner for an English learner exploring "${word}".

User: Russian speaker, English A2-B1 (growing fast), studies physics/neuroscience/AI.

Rules:
1. Clear, simple English. Short sentences. Common words.
2. NO Russian translation unless the user explicitly asks.
3. If user asks to translate something, translate ONLY that part.
4. Go deeper than a dictionary: why, how, connections to physics/brain/AI.
5. Be a partner, not a teacher. Sometimes ask one sharp follow-up.
6. Keep answers focused. No long lists unless asked.`;
}

// ~35 tokens — under 100 limit.
function phraseSystem(phrase) {
  return `User is learning English (B1). Phrase: "${phrase}". Answer in 3 sentences max. If asked to translate, translate that part. Plain text only.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { word, phrase, messages } = req.body || {};
  if (!word && !phrase) return res.status(400).json({ error: 'word or phrase required' });
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' });
  }

  const isPhrase = !!phrase;
  const system = isPhrase ? phraseSystem(phrase) : wordSystem(word);
  const max_tokens = isPhrase ? 400 : 600;

  const clean = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content }));

  // Mark the last assistant message with cache_control so the growing
  // conversation history is cached on each turn. Below 4096 tokens it's a
  // no-op; above it gives ~10x cheaper reads on the cached prefix.
  const lastAssistantIdx = [...clean].map(m => m.role).lastIndexOf('assistant');
  const messagesWithCache = clean.map((m, i) =>
    i === lastAssistantIdx
      ? { ...m, content: [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }] }
      : m
  );

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: messagesWithCache,
    });

    const reply = msg.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('[chat]', err);
    return res.status(500).json({ error: err?.message || 'chat failed' });
  }
}
