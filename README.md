# Lexiq

**Live:** [https://lexiq-seven.vercel.app](https://lexiq-seven.vercel.app)

English learning tool for Russian speakers. Look up a word or phrase and get a definition, IPA, part of speech, and three examples — with optional Russian translations. Powered by Claude.

## Features

- **Depth levels** — Simple (A2), Medium, Deep (etymology and ties to physics, neuroscience, AI)
- **Russian** — Toggle translations for definitions and examples
- **Audio** — Speech synthesis for words and example sentences
- **History** — Sidebar keeps your last 20 lookups

## Stack

- **Frontend:** React + Vite  
- **Backend:** Vercel serverless functions  
- **AI:** Claude Haiku via Anthropic SDK

## Local development

1. `cp .env.example .env` and set `ANTHROPIC_API_KEY` (see below).
2. Run app and API together:

   ```bash
   npx vercel dev
   ```

## Deploy

```bash
npx vercel deploy --prod
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
