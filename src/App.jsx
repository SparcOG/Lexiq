import { useEffect, useRef, useState } from 'react';
import {
  Search, Volume2, History, Eye, EyeOff, Loader2, Sparkles,
  BookOpen, Send, MessageCircle, AlertCircle,
} from 'lucide-react';
// -----------------------------------------------------------------------------
// Lexiq — English learning tool
// Uses Haiku for everything (cheap). Real API via /api/lookup and /api/chat.
// Run: `npx vercel dev` (no global install needed).
// -----------------------------------------------------------------------------

const LEVELS = [
  { id: 'simple', label: 'Simple' },
  { id: 'medium', label: 'Medium' },
  { id: 'deep', label: 'Deep' },
];

async function apiLookup(word, level) {
  const res = await fetch('/api/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, level }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Lookup failed (${res.status})`);
  }
  return res.json();
}

function getUserId() {
  let id = localStorage.getItem('lexiq:userId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('lexiq:userId', id); }
  return id;
}

async function dbLoadHistory(userId) {
  const r = await fetch(`/api/sync?action=load&userId=${userId}`);
  if (!r.ok) return null;
  const { words } = await r.json();
  return words;
}

function dbSaveHistory(userId, words) {
  fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save-history', userId, words }) }).catch(() => {});
}

async function dbLoadChat(userId, word) {
  const r = await fetch(`/api/sync?action=load-chat&userId=${userId}&word=${encodeURIComponent(word)}`);
  if (!r.ok) return null;
  const { messages } = await r.json();
  return messages;
}

function dbSaveChat(userId, word, messages) {
  fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save-chat', userId, word, messages }) }).catch(() => {});
}

const CHAT_KEY = (word) => `lexiq:chat:${word.toLowerCase()}`;
const CHAT_CAP = 40;

function loadChat(word) {
  try {
    const raw = localStorage.getItem(CHAT_KEY(word));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveChat(word, messages) {
  try {
    localStorage.setItem(CHAT_KEY(word), JSON.stringify(messages.slice(-CHAT_CAP)));
  } catch {}
}

async function apiChat(word, messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, messages }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Chat failed (${res.status})`);
  }
  return res.json();
}

// Preferred voices in order. First available wins.
// macOS comes with Samantha (US, very natural), Moira (Irish), Alex (US),
// Daniel (UK), Karen (AU). "Premium" / "Enhanced" versions sound even better
// if the user has downloaded them in System Settings → Accessibility → Spoken Content.
const VOICE_PRIORITY = [
  'Samantha (Premium)',
  'Samantha (Enhanced)',
  'Samantha',
  'Ava (Premium)',
  'Ava',
  'Allison',
  'Karen (Premium)',
  'Karen',
  'Moira (Premium)',
  'Moira',
  'Daniel (Premium)',
  'Daniel',
  'Alex',
];

let cachedVoice = null;

function pickBestVoice() {
  if (cachedVoice) return cachedVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // not yet loaded
  for (const name of VOICE_PRIORITY) {
    const v = voices.find((v) => v.name === name);
    if (v) { cachedVoice = v; return v; }
  }
  // Fallback: any English voice
  const en = voices.find((v) => v.lang && v.lang.startsWith('en'));
  if (en) { cachedVoice = en; return en; }
  cachedVoice = voices[0] || null;
  return cachedVoice;
}

function speak(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickBestVoice();
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || 'en-US';
  } else {
    utter.lang = 'en-US';
  }
  utter.rate = 0.95;   // 0.9-1.0 range — clear, not rushed
  utter.pitch = 1.0;   // natural, neither high nor low
  utter.volume = 1.0;  // normal full volume
  synth.cancel();
  synth.speak(utter);
}

const COLORS = {
  bg: '#171717',
  bgDark: '#0a0a0a',
  bgPanel: '#262626',
  bgPanel2: '#404040',
  border: '#262626',
  borderLight: '#404040',
  text: '#f5f5f5',
  textDim: '#a3a3a3',
  textMuted: '#737373',
  textFaint: '#525252',
  blue: '#60a5fa',
  blueBg: '#2563eb',
};

const styles = {
  app: { minHeight: '100vh', background: COLORS.bg, color: COLORS.text, display: 'flex' },
  sidebar: { width: 220, background: COLORS.bgDark, borderRight: `1px solid ${COLORS.border}`, padding: 12 },
  sidebarLabel: { display: 'flex', alignItems: 'center', gap: 6, color: COLORS.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, padding: '0 8px' },
  histItem: (active) => ({ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: 4, fontSize: 14, background: active ? COLORS.bgPanel : 'transparent', color: active ? COLORS.text : COLORS.textDim, border: 'none', marginBottom: 2 }),
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: { borderBottom: `1px solid ${COLORS.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  brandTitle: { fontSize: 18, fontWeight: 600, margin: 0 },
  searchWrap: { position: 'relative', flex: 1, maxWidth: 420 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: COLORS.textFaint },
  searchInput: { width: '100%', background: COLORS.bgPanel, border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: '8px 12px 8px 36px', fontSize: 14, color: COLORS.text, outline: 'none' },
  ruBtn: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 6, background: COLORS.bgPanel, color: COLORS.textDim, border: 'none' },
  content: { flex: 1, padding: 24, overflowY: 'auto' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '80px 0' },
  article: { maxWidth: 720, margin: '0 auto' },
  word: { fontSize: 36, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' },
  meta: { display: 'flex', alignItems: 'center', gap: 12, color: COLORS.textMuted, fontSize: 13, marginBottom: 24, marginTop: 4 },
  levelTabs: { display: 'inline-flex', background: COLORS.bgPanel, borderRadius: 8, padding: 4, marginBottom: 20 },
  levelBtn: (active) => ({ padding: '6px 14px', fontSize: 14, borderRadius: 6, background: active ? COLORS.bgPanel2 : 'transparent', color: active ? COLORS.text : COLORS.textDim, border: 'none' }),
  sectionLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: COLORS.textMuted, marginBottom: 8 },
  defText: { fontSize: 17, lineHeight: 1.6, margin: 0 },
  defRu: { marginTop: 12, fontSize: 13, color: COLORS.textDim, lineHeight: 1.6, borderLeft: `2px solid ${COLORS.border}`, paddingLeft: 12 },
  exampleItem: { borderLeft: `2px solid ${COLORS.border}`, paddingLeft: 16, paddingTop: 4, paddingBottom: 4, marginBottom: 12 },
  exampleRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  exampleText: { flex: 1, lineHeight: 1.6, margin: 0 },
  exampleRu: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 0 },
  iconBtn: { background: 'transparent', border: 'none', color: COLORS.textMuted, padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatSection: { borderTop: `1px solid ${COLORS.border}`, paddingTop: 32, marginTop: 32 },
  chatHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  msgRow: (user) => ({ display: 'flex', justifyContent: user ? 'flex-end' : 'flex-start', marginBottom: 12 }),
  msgBubble: (user) => ({ maxWidth: '85%', padding: '10px 14px', borderRadius: 8, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: user ? COLORS.blueBg : COLORS.bgPanel, color: COLORS.text }),
  chatForm: { display: 'flex', gap: 8, alignItems: 'center' },
  chatInput: { flex: 1, background: COLORS.bgPanel, border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: '8px 12px', fontSize: 14, color: COLORS.text, outline: 'none' },
  sendBtn: (disabled) => ({ padding: 8, borderRadius: 6, background: COLORS.blueBg, color: 'white', border: 'none', opacity: disabled ? 0.4 : 1, display: 'flex' }),
  errorBox: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 6, background: 'rgba(127, 29, 29, 0.4)', border: '1px solid rgba(153, 27, 27, 0.6)', color: '#fca5a5', fontSize: 14, marginBottom: 24, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' },
  loadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: COLORS.textMuted },
};

export default function App() {
  const [userId] = useState(getUserId);
  const [input, setInput] = useState('');
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRussian, setShowRussian] = useState(false);
  const [level, setLevel] = useState('medium');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lexiq:history') || '[]'); } catch { return []; }
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Load history from DB on mount; DB is source of truth across devices.
  useEffect(() => {
    dbLoadHistory(userId).then(words => {
      if (words?.length) {
        setHistory(words);
        localStorage.setItem('lexiq:history', JSON.stringify(words));
      }
    }).catch(() => {});
  }, [userId]);

  // Warm up speech voices on mount. Some browsers load them async,
  // so we trigger the load and listen for the voiceschanged event.
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const handler = () => {
      const v = pickBestVoice();
      if (v) console.log(`[Lexiq] voice: ${v.name} (${v.lang})`);
    };
    window.speechSynthesis.getVoices(); // kick off load
    handler(); // try immediately
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handler);
  }, []);

  async function doLookup(word, lvl) {
    setLoading(true);
    setError(null);
    setChatMessages(loadChat(word));
    setChatError(null);
    dbLoadChat(userId, word).then(msgs => {
      if (msgs?.length) { setChatMessages(msgs); saveChat(word, msgs); }
    }).catch(() => {});
    try {
      const data = await apiLookup(word, lvl);
      setWordData({
        word: data.word,
        pronunciation: data.pronunciation,
        partOfSpeech: data.partOfSpeech,
        levels: {
          simple: lvl === 'simple' ? data.definition : null,
          medium: lvl === 'medium' ? data.definition : null,
          deep: lvl === 'deep' ? data.definition : null,
        },
        examples: data.examples,
      });
      setHistory((h) => {
        const updated = [word, ...h.filter((w) => w.toLowerCase() !== word.toLowerCase())].slice(0, 20);
        try { localStorage.setItem('lexiq:history', JSON.stringify(updated)); } catch {}
        dbSaveHistory(userId, updated);
        return updated;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLevel(newLevel) {
    if (!wordData || wordData.levels[newLevel]) return;
    setLevelLoading(true);
    setError(null);
    try {
      const data = await apiLookup(wordData.word, newLevel);
      setWordData((prev) => prev ? { ...prev, levels: { ...prev.levels, [newLevel]: data.definition } } : prev);
    } catch (err) {
      setError(err.message);
    } finally {
      setLevelLoading(false);
    }
  }

  function handleSearch(e) {
    if (e) e.preventDefault();
    const w = input.trim();
    if (!w || loading) return;
    doLookup(w, level);
  }

  function pickFromHistory(w) {
    setInput(w);
    doLookup(w, level);
  }

  function onLevelChange(newLevel) {
    setLevel(newLevel);
    if (wordData && !wordData.levels[newLevel]) fetchLevel(newLevel);
  }

  async function sendChat(e) {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading || !wordData) return;
    const newMessages = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);
    try {
      const { reply } = await apiChat(wordData.word, newMessages);
      setChatMessages((prev) => {
        const updated = [...prev, { role: 'assistant', content: reply }];
        saveChat(wordData.word, updated);
        dbSaveChat(userId, wordData.word, updated);
        return updated;
      });
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  }

  const currentDefinition = wordData ? wordData.levels[level] : null;

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLabel}>
          <History size={14} /> History
        </div>
        {history.length === 0 ? (
          <p style={{ color: COLORS.textFaint, fontSize: 12, padding: '0 8px', lineHeight: 1.5 }}>
            No words yet.
          </p>
        ) : (
          history.map((w, i) => (
            <button key={i} onClick={() => pickFromHistory(w)} style={styles.histItem(wordData?.word === w)}>
              {w}
            </button>
          ))
        )}
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div style={styles.brand}>
            <Sparkles size={20} color={COLORS.blue} />
            <h1 style={styles.brandTitle}>Lexiq</h1>
          </div>
          <form onSubmit={handleSearch} style={styles.searchWrap}>
            <Search size={16} style={styles.searchIcon} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a word or sentence..."
              disabled={loading}
              style={styles.searchInput}
            />
          </form>
          <button onClick={() => setShowRussian((v) => !v)} style={styles.ruBtn} title={showRussian ? 'Hide Russian' : 'Show Russian'}>
            {showRussian ? <EyeOff size={14} /> : <Eye size={14} />} RU
          </button>
        </header>

        <div style={styles.content}>
          {loading && (
            <div style={styles.loadingRow}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
              Looking up...
            </div>
          )}

          {error && !loading && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Something went wrong</div>
                <div style={{ color: '#fca5a5', opacity: 0.8 }}>{error}</div>
              </div>
            </div>
          )}

          {!loading && !wordData && !error && (
            <div style={styles.empty}>
              <BookOpen size={40} color={COLORS.textFaint} style={{ marginBottom: 16 }} />
              <h2 style={{ fontSize: 20, color: COLORS.textDim, margin: '0 0 4px' }}>Start learning</h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, maxWidth: 380, lineHeight: 1.6 }}>
                Type any English word or short sentence. Lexiq will explain it,
                give examples, and read it out loud.
              </p>
            </div>
          )}

          {!loading && wordData && (
            <article style={styles.article}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <h2 style={styles.word}>{wordData.word}</h2>
                <button onClick={() => speak(wordData.word)} style={styles.iconBtn} title="Hear pronunciation">
                  <Volume2 size={20} />
                </button>
              </div>
              <div style={styles.meta}>
                {wordData.pronunciation && <span>{wordData.pronunciation}</span>}
                {wordData.partOfSpeech && (
                  <>
                    <span style={{ color: COLORS.textFaint }}>·</span>
                    <span style={{ fontStyle: 'italic' }}>{wordData.partOfSpeech}</span>
                  </>
                )}
              </div>

              <div style={styles.levelTabs}>
                {LEVELS.map((l) => (
                  <button key={l.id} onClick={() => onLevelChange(l.id)} style={styles.levelBtn(level === l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>

              <section style={{ marginBottom: 32, minHeight: 60 }}>
                <h3 style={styles.sectionLabel}>Definition</h3>
                {levelLoading && !currentDefinition ? (
                  <div style={{ display: 'flex', alignItems: 'center', color: COLORS.textMuted, fontSize: 14, padding: '8px 0' }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
                    Loading {level}...
                  </div>
                ) : currentDefinition ? (
                  <>
                    <p style={styles.defText}>{currentDefinition.en}</p>
                    {showRussian && currentDefinition.ru && <p style={styles.defRu}>{currentDefinition.ru}</p>}
                  </>
                ) : null}
              </section>

              {wordData.examples?.length > 0 && (
                <section style={{ marginBottom: 40 }}>
                  <h3 style={styles.sectionLabel}>Examples</h3>
                  {wordData.examples.map((ex, i) => (
                    <div key={i} style={styles.exampleItem}>
                      <div style={styles.exampleRow}>
                        <p style={styles.exampleText}>{ex.en}</p>
                        <button onClick={() => speak(ex.en)} style={styles.iconBtn} title="Hear">
                          <Volume2 size={16} />
                        </button>
                      </div>
                      {showRussian && ex.ru && <p style={styles.exampleRu}>{ex.ru}</p>}
                    </div>
                  ))}
                </section>
              )}

              <section style={styles.chatSection}>
                <div style={styles.chatHeader}>
                  <MessageCircle size={16} color={COLORS.blue} />
                  <h3 style={styles.sectionLabel}>Ask about this word</h3>
                </div>

                {chatMessages.length === 0 && !chatLoading && (
                  <p style={{ fontSize: 14, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>
                    Ask anything about <span style={{ color: COLORS.textDim }}>"{wordData.word}"</span>.
                    Why it exists. How it connects to other ideas. Ask to translate a part if you want.
                  </p>
                )}

                <div style={{ marginBottom: 16 }}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={styles.msgRow(m.role === 'user')}>
                      <div style={styles.msgBubble(m.role === 'user')}>{m.content}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={styles.msgRow(false)}>
                      <div style={{ ...styles.msgBubble(false), color: COLORS.textMuted, display: 'flex', alignItems: 'center' }}>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
                        Thinking...
                      </div>
                    </div>
                  )}
                  {chatError && (
                    <div style={{ ...styles.errorBox, marginBottom: 0 }}>
                      <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{chatError}</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={sendChat} style={styles.chatForm}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask about "${wordData.word}"...`}
                    disabled={chatLoading}
                    style={styles.chatInput}
                  />
                  <button type="submit" disabled={chatLoading || !chatInput.trim()} style={styles.sendBtn(chatLoading || !chatInput.trim())} title="Send">
                    <Send size={16} />
                  </button>
                </form>
              </section>

            </article>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
