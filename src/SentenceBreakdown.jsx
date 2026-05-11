import { useState } from 'react';

const COLORS = {
  bgPanel: '#262626',
  bgPanel2: '#404040',
  border: '#262626',
  borderLight: '#404040',
  text: '#f5f5f5',
  textDim: '#a3a3a3',
  textMuted: '#737373',
  blue: '#60a5fa',
};

const TABS = [
  { id: 'hardWords', label: 'Hard Words' },
  { id: 'simple', label: 'Simple Version' },
  { id: 'why', label: 'Why These Words' },
];

const FIELD_COLOR = {
  neuroscience: '#818cf8',
  medicine: '#34d399',
  law: '#fb923c',
  philosophy: '#a78bfa',
  biology: '#4ade80',
  physics: '#60a5fa',
  general: '#9ca3af',
};

export default function SentenceBreakdown({ data, sentence }) {
  const [tab, setTab] = useState('hardWords');

  return (
    <article style={{ maxWidth: 720, margin: '0 auto' }}>
      <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, fontStyle: 'italic', lineHeight: 1.6 }}>
        "{sentence}"
      </p>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: COLORS.textMuted, marginBottom: 8, margin: '0 0 8px' }}>
          Translation
        </h3>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: COLORS.text, margin: 0 }}>
          {data.translation}
        </p>
      </div>

      <div style={{ display: 'inline-flex', background: COLORS.bgPanel, borderRadius: 8, padding: 4, marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '6px 14px',
              fontSize: 14,
              borderRadius: 6,
              background: tab === t.id ? COLORS.bgPanel2 : 'transparent',
              color: tab === t.id ? COLORS.text : COLORS.textMuted,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hardWords' && (
        <div>
          {data.hardWords.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontSize: 14, fontStyle: 'italic' }}>
              No hard words in this sentence.
            </p>
          ) : (
            data.hardWords.map((w, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${COLORS.borderLight}`, paddingLeft: 16, marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{w.word}</span>
                  {w.field && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(96,165,250,0.12)', color: FIELD_COLOR[w.field] || COLORS.blue }}>
                      {w.field}
                    </span>
                  )}
                  {w.register && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: COLORS.textMuted }}>
                      {w.register}
                    </span>
                  )}
                </div>
                <p style={{ color: COLORS.textDim, fontSize: 14, margin: '0 0 8px' }}>{w.ru}</p>
                {w.example && (
                  <p style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                    "{w.example}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'simple' && (
        <div style={{ borderLeft: `2px solid ${COLORS.borderLight}`, paddingLeft: 16 }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: COLORS.text, margin: 0 }}>
            {data.simpleVersion}
          </p>
        </div>
      )}

      {tab === 'why' && (
        <div style={{ borderLeft: `2px solid ${COLORS.borderLight}`, paddingLeft: 16 }}>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.textDim, margin: 0 }}>
            {data.toneAnalysis}
          </p>
        </div>
      )}
    </article>
  );
}
