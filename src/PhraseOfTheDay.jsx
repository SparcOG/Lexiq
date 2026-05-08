import { useEffect, useState } from 'react';
import { ChevronDown, Send, Loader2, AlertCircle } from 'lucide-react';
import './PhraseOfTheDay.css';

// localStorage keys
const STORAGE_KEY = 'lexiq_potd';
const HISTORY_KEY = 'lexiq_potd_history';
const HISTORY_MAX = 30;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj && obj.date === todayISO() && obj.phrase) return obj;
  } catch {}
  return null;
}

function saveCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function pushHistory(phrase) {
  if (!phrase) return;
  const h = loadHistory().filter((p) => p !== phrase);
  const next = [phrase, ...h].slice(0, HISTORY_MAX);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {}
}

async function fetchPotd(history) {
  const res = await fetch('/api/potd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `POTD failed (${res.status})`);
  }
  return res.json();
}

async function fetchPhraseChat(phrase, messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase, messages }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Chat failed (${res.status})`);
  }
  return res.json();
}

export default function PhraseOfTheDay() {
  const [data, setData] = useState(() => loadCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  // Chat state — only used when expanded
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    if (data) return; // today's phrase is cached
    setLoading(true);
    setError(null);
    fetchPotd(loadHistory())
      .then((res) => {
        const cached = { ...res, date: res.date || todayISO() };
        setData(cached);
        saveCache(cached);
        if (res.phrase) pushHistory(res.phrase);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendChat(e) {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading || !data?.phrase) return;
    const newMessages = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);
    try {
      const { reply } = await fetchPhraseChat(data.phrase, newMessages);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="potd-banner">
        <div className="potd-shimmer" />
        <div className="potd-loading">
          <Loader2 size={14} className="potd-spin" />
          Loading phrase of the day...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="potd-banner potd-banner--error">
        <AlertCircle size={14} />
        <span>Couldn't load today's phrase: {error}</span>
      </div>
    );
  }

  if (!data) return null;

  const formattedDate = (() => {
    try {
      return new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
      });
    } catch {
      return data.date;
    }
  })();

  return (
    <div className={`potd-banner ${open ? 'potd-open' : ''}`}>
      <div className="potd-shimmer" />
      <div className="potd-label">✦ Phrase of the Day</div>

      <div className="potd-phrase-wrap">
        <span className="potd-phrase">{data.phrase}</span>
      </div>

      <p className="potd-meaning">{data.meaning}</p>

      <div className="potd-footer">
        <button
          className="potd-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          Go deeper
          <ChevronDown size={14} className="potd-chevron" />
        </button>
        <span className="potd-date">{formattedDate}</span>
      </div>

      <div className="potd-deeper">
        {data.examples && data.examples.length > 0 && (
          <div className="potd-section">
            <h4 className="potd-section-title">Examples</h4>
            <ul className="potd-examples">
              {data.examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="potd-section">
          <h4 className="potd-section-title">Think Together</h4>

          <div className="potd-chat-log">
            {chatMessages.length === 0 && !chatLoading && (
              <p className="potd-chat-empty">
                Ask why it exists, where it comes from, or how to use it.
              </p>
            )}
            {chatMessages.map((m, i) => (
              <div
                key={i}
                className={`potd-msg potd-msg--${m.role}`}
              >
                {m.content}
              </div>
            ))}
            {chatLoading && (
              <div className="potd-msg potd-msg--assistant potd-msg--loading">
                <Loader2 size={12} className="potd-spin" /> Thinking...
              </div>
            )}
            {chatError && (
              <div className="potd-error-inline">
                <AlertCircle size={12} /> {chatError}
              </div>
            )}
          </div>

          <form onSubmit={sendChat} className="potd-chat-form">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask about "${data.phrase}"...`}
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
