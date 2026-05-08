# Igor Interface — analysis & ideas

Date: 2026-05-08, late night session

## What you described
Personal Web UI for Claude API. High-performance space for deep work,
learning, and understanding science topics. Built only for yourself
(your API key, your browser).

## What the other Claude got right
- **Phase 1 / 2 / 3 split** — matches your "delete at 70%" pattern
- **Prompt caching** — single biggest cost lever (~85% cheaper after first message)
- **Shadow chat** instead of two equal panes — less cognitive load
- **WPS for books** — don't rebuild PDF reader, copy-paste is enough
- **Mode switch = new chat** — clean logically, simpler caching
- **localStorage first, no auth** — right scope for personal tool

## What was missing from that conversation

### 1. Search across everything
After 3 months you'll have 200+ chats and 100+ notes. Without search,
the tool dies. Cmd+K palette searching:
- Chat content (full text)
- Notes content
- Tags
- Date ranges

### 2. Auto-tags per chat (Haiku, ~$0.0005 each)
When a chat ends or summary is generated, send messages to Haiku:
"Return 2-3 short tags for this conversation. JSON only."
Tags become the navigation backbone.

### 3. Keyboard-first navigation
For a power tool, mouse is slow.
- Cmd+K — command palette (search anything)
- Cmd+N — new chat
- Cmd+M — switch mode
- Cmd+1/2/3 — switch model (Haiku/Sonnet/Opus)
- Cmd+S — summarize current chat
- Cmd+P — pin current chat
- Cmd+\ — toggle sidebar
- Esc — focus mode

### 4. Thinking pad per chat
Right side, small markdown area. YOU write notes during the chat
(separate from the chat itself). Survives the chat as a "what I learned"
note. Becomes the saved summary later. The chat is conversation, the
pad is your synthesis.

### 5. Cost dashboard
A tiny widget: today's spend, this week's spend, average per chat.
Updates after every API call. Visible somewhere always.
Nothing keeps cost down like seeing it.

### 6. Re-ask with different model
Any assistant message has a small icon: "ask again with Sonnet" or
"ask again with Opus." Cheaper than starting over to compare answers.

## Architecture (lean)

```
igor-interface/
├── src/
│   ├── App.jsx              — main layout
│   ├── components/
│   │   ├── ChatPane.jsx     — single chat (becomes shadow-able later)
│   │   ├── Sidebar.jsx      — history + notes
│   │   ├── TopBar.jsx       — modes + model + new chat
│   │   ├── ThinkingPad.jsx  — right-side notes per chat
│   │   └── CommandPalette.jsx — Cmd+K
│   ├── modes/
│   │   ├── normal.js        — system prompt: empty
│   │   ├── lexiq.js         — system prompt: Lexiq rules
│   │   └── promptforge.js   — system prompt: full PE rules
│   └── lib/
│       ├── claude.js        — API wrapper with cache_control
│       ├── storage.js       — localStorage abstraction
│       └── tagger.js        — Haiku auto-tags on chat end
├── api/
│   └── chat.js              — Vercel serverless, prompt caching enabled
└── .env.local               — ANTHROPIC_API_KEY
```

## Prompt caching — the practical bit

```js
const response = await client.messages.create({
  model: selectedModel,
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: longSystemPrompt,
      cache_control: { type: 'ephemeral' }   // ← THE LINE
    }
  ],
  messages: conversationMessages
});
```

That ONE line on the system prompt = 90% off after first message.

For Haiku to cache, system prompt needs ≥4,096 tokens.
For Sonnet, ≥2,048 tokens.
Your PromptForge prompt is probably long enough for both.
Lexiq mode rules are short — won't cache, but they're tiny so it doesn't matter.

## Phase 1 — REAL minimum (what to actually build first)

Strip even more than the other Claude said:
1. Single chat (no shadow pane yet)
2. Three modes (Normal / Lexiq / PromptForge) — buttons in top bar
3. Model selector — Haiku / Sonnet (skip Opus for now, it's expensive)
4. Sidebar: chat history (no notes yet) + pin
5. Cmd+K search
6. Prompt caching on
7. Cost counter in top right

That's it. Use it 2-3 weeks. Then add notes, summaries, thinking pad.

## What NOT to build in Phase 1
- No shadow chat
- No notes (yet — pin chats first, evaluate need)
- No projects
- No PDF anything
- No Lexiq integration
- No book folder
- No daily brief

## The honest pattern question

Your CLAUDE.md, line 96:
> "Lexiq first — push to GitHub before starting anything new"

Your CLAUDE.md, line 99:
> "Starts strong, deletes at 70% — push to public GitHub immediately"

Igor Interface is app #3. Lexiq is not on GitHub yet.

Two paths:

**Path A — Honor the pattern.** Push Lexiq to GitHub *first*
(literally one hour of work). Then start Igor Interface guilt-free.
This breaks the deletion cycle.

**Path B — Skip Lexiq, start Igor Interface anyway.**
This is the trap. You will love the new project for 2 weeks, hit 70%,
delete it, feel bad. Lexiq still won't be on GitHub.

Pick Path A.

## ONE next action (when you wake up)

```bash
cd ~/Documents/lexiq
git init
git add .
git commit -m "Lexiq v0.1 — working English learning tool"
# create empty repo on github.com/yourname/lexiq
git remote add origin https://github.com/yourname/lexiq.git
git branch -M main
git push -u origin main
```

That is 10 minutes. After that, Igor Interface is fair game.

---

*Sleep first. Pattern second. Project third.*
