# Tomorrow — Lexiq next step

Wake up. Coffee. Read this. Pick ONE.

## What we have right now (working)
- React + Vite + Vercel deployed
- Word lookup with 3 levels (Simple / Medium / Deep) — Haiku
- Audio with Samantha voice
- Think Together chat per word
- Phrase of the Day banner with daily cache + Go deeper

## ONE next action (pick exactly one)

### Option A — Push to public GitHub (recommended)
Your CLAUDE.md says: "Starts strong, deletes at 70% — push to public GitHub immediately."
This breaks the deletion pattern. 30 minutes of work. Highest leverage.

Steps:
1. `cd ~/Documents/lexiq && git init && git add . && git commit -m "Lexiq v0.1"`
2. Make sure `.env` is gitignored (it is — already configured)
3. Create repo on github.com, follow the push instructions

### Option B — Save conversations feature
The chat (Think Together) currently disappears when you switch words.
Add localStorage persistence per word, so chats survive reload.
Maybe 1-2 hours.

### Option C — Apply prompt engineering KB to existing prompts
Take your `Prompt_Engineering_KB.md` and rewrite the system prompts in
`api/lookup.js`, `api/chat.js`, `api/potd.js` using the techniques there.
Could improve answer quality without raising cost.

### Option D — Third app (the one with separate CLAUDE.md)
This is a different project. Do NOT mix it with Lexiq.
Finish Lexiq to a public-shareable state first.

## DO NOT do all four. Pick ONE.

---

## Prompt template to use with Claude tomorrow

When you ask Claude to add a feature, paste this:

```
<role>
Senior full-stack engineer working on Lexiq.
</role>

<context>
- Lexiq: English learning tool for Russian speakers (B1, growing fast)
- Stack: React 18, Vite, Vercel serverless, Anthropic Claude API
- Model: claude-haiku-4-5 ONLY (cost rule — no Sonnet, no Opus)
- Token budgets: lookup 512, word chat 600, phrase chat 400, POTD 300
- Design tokens in src/index.css: --bg #171717, --surface #242424,
  --border #333, --text #e8e8e8, --muted #888, --accent #4f7ef8,
  --gold #c9a84c
- Existing files: api/lookup.js, api/chat.js, api/potd.js,
  src/App.jsx, src/PhraseOfTheDay.jsx
</context>

<task>
[Write ONE specific thing. Examples:
 "Add localStorage persistence for Think Together chats per word"
 "Add a difficulty meter (CEFR A2/B1/B2) to each word lookup"
 "Add export to Anki flashcards from history"]
</task>

<constraints>
- Haiku only, never Sonnet/Opus
- Reuse existing CSS variables, no new colors
- Do not change working features (word lookup, POTD, audio)
- Keep system prompts tight, count tokens before writing
- Use localStorage for caching, never re-fetch data we already have
</constraints>

<output_format>
1. PLAN — 5 bullets, confirm token/model
2. Code for new/changed files
3. Exact insertion point
4. Cost estimate per 1000 daily users
5. Verification checklist
</output_format>
```

Save this template. Reuse it for every feature.

---

## What NOT to do
- Do NOT start a third app while Lexiq is unfinished.
- Do NOT add 5 features at once. ONE per session.
- Do NOT delete working code "to refactor."
- Do NOT skip the GitHub push.

Sleep first. Then choose.
