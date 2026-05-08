# Lexiq

**[https://lexiq-seven.vercel.app](https://lexiq-seven.vercel.app)**

English learning tool for Russian speakers. Look up any word or phrase and get a definition, IPA pronunciation, part of speech, and three examples — all with Russian translations. Powered by Claude AI.

## Features

- **3 depth levels** — Simple (A2), Medium, Deep (with etymology and connections to physics/neuroscience/AI)
- **Russian translations** — toggle on/off for definitions and examples
- **Audio** — hear any word or example sentence via browser speech synthesis
- **Search history** — sidebar keeps your last 20 lookups

## Stack

- React + Vite (frontend)
- Vercel serverless functions (backend)
- Claude Haiku via Anthropic SDK (AI)

## Local development

```bash
cp .env.example .env   # add your ANTHROPIC_API_KEY
npx vercel dev         # runs frontend + API routes together
```

## Deploy

```bash
npx vercel deploy --prod
```

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
