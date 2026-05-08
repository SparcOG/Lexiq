import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { action, userId, word } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    if (action === 'load') {
      const { data } = await supabase
        .from('word_history')
        .select('words')
        .eq('user_id', userId)
        .single();
      return res.status(200).json({ words: data?.words || [] });
    }

    if (action === 'load-chat') {
      if (!word) return res.status(400).json({ error: 'word required' });
      const { data } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('user_id', userId)
        .eq('word', word.toLowerCase())
        .single();
      return res.status(200).json({ messages: data?.messages || [] });
    }

    return res.status(400).json({ error: 'unknown action' });
  }

  if (req.method === 'POST') {
    const { action, userId, words, word, messages } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    if (action === 'save-history') {
      await supabase.from('word_history').upsert({
        user_id: userId,
        words,
        updated_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === 'save-chat') {
      if (!word) return res.status(400).json({ error: 'word required' });
      await supabase.from('chat_history').upsert({
        user_id: userId,
        word: word.toLowerCase(),
        messages,
        updated_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'unknown action' });
  }

  return res.status(405).json({ error: 'GET or POST only' });
}
