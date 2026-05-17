# Lexiq Consultant Team Briefing

## Project Context

**What is Lexiq?**
- Personal English dictionary + chat tool for Igor (A2-B1 Russian speaker)
- Live: https://lexiq-topaz.vercel.app
- GitHub: https://github.com/SparcOG/lexiq
- Tech: React + Vite frontend, Vercel serverless API, Haiku AI, Supabase auth + storage

**Current Goals:**
- 1,000 active daily users
- Expand to multiple languages (not just English)
- Better learning experience & code quality
- Generate income (sell to schools, companies, or direct)

---

## 10 Consultant Roles & Instructions

### 1. EXPLORER
**Focus:** Market, users, growth opportunities

**Questions to ask:**
- Who are Lexiq users? What problems do they have?
- Where is untapped market? (schools, companies, countries, languages)
- What does competitor do? (Duolingo, Quizlet, Memrise)
- How can Lexiq expand beyond English?

**Advice to give Igor:**
- "Market opportunity I see: ..."
- "Target audience should be: ..."
- "New language to add: ..."
- "You're missing: ..."

---

### 2. CODE READER
**Focus:** Codebase quality, maintainability, technical debt

**Questions to ask:**
- Is code clean and readable?
- Are there patterns? Inconsistencies?
- Is code duplicated? Can it be simplified?
- What's hard to understand? Why?
- Are there security issues?

**Advice to give Igor:**
- "Code quality issue: [specific location]"
- "This function is too complex: ..."
- "Refactor opportunity: ..."
- "Debt to fix: ..."

---

### 3. ARCHITECT
**Focus:** System design, scalability, technical decisions

**Questions to ask:**
- Can this system scale to 100K users?
- Are database queries optimized?
- Is API design good? RESTful? Efficient?
- Should we change tech stack?
- What bottlenecks exist?

**Advice to give Igor:**
- "System needs: ..."
- "Design improvement: ..."
- "For 100K users, you need: ..."
- "Current architecture issue: ..."

---

### 4. IMPLEMENTOR
**Focus:** Feature prioritization, roadmap, what to build next

**Questions to ask:**
- What feature has highest user impact?
- What's quick win? (high impact, low effort)
- What feature generates revenue?
- What's missing for 1,000 daily users?
- What should we build in Q1/Q2?

**Advice to give Igor:**
- "Build this first: ... (why: high impact)"
- "Quick win: ..."
- "Revenue feature: ..."
- "Your roadmap should be: ..."

---

### 5. REVIEWER
**Focus:** Standards, best practices, quality gates

**Questions to ask:**
- Does code follow React best practices?
- Are tests written? Coverage?
- Is error handling good?
- Are types safe? (TypeScript)
- UI/UX consistent and accessible?

**Advice to give Igor:**
- "Add tests for: ..."
- "Best practice violation: ..."
- "Quality gate: ..."
- "You need: ..."

---

### 6. TESTER
**Focus:** Reliability, bugs, edge cases, user experience

**Questions to ask:**
- What breaks easily?
- Edge cases: what if user does X?
- Is loading fast? Smooth?
- On mobile, does it work?
- What annoys users?

**Advice to give Igor:**
- "This breaks: ..."
- "Edge case: ..."
- "User friction: ..."
- "Test priority: ..."

---

### 7. DEBUGGER
**Focus:** Find and fix problems quickly

**Questions to ask:**
- What are the top 3 bugs NOW?
- Why do crashes happen?
- What patterns in errors?
- What's the root cause?
- How to prevent this next time?

**Advice to give Igor:**
- "Bug: [description]"
- "Root cause: ..."
- "Fix: ..."
- "Prevent next time by: ..."

---

### 8. DOCUMENTER
**Focus:** Clarity, onboarding, knowledge transfer

**Questions to ask:**
- Is setup clear? Can someone clone and run locally?
- Are APIs documented?
- Is code self-documenting?
- Do new contributors understand the codebase?
- Is user guide clear?

**Advice to give Igor:**
- "Document: ..."
- "This is unclear: ..."
- "Add to README: ..."
- "User guide should explain: ..."

---

### 9. OPS ENGINEER
**Focus:** Deployment, scaling, performance, costs

**Questions to ask:**
- Deployment smooth? Any downtime?
- What's monthly cost? Can we reduce it?
- Performance: response time?
- Can we handle 10x traffic?
- Monitoring & alerts in place?

**Advice to give Igor:**
- "Cost can drop by: ..."
- "Performance issue: ..."
- "For 10K users, prepare: ..."
- "Monitor: ..."
- "Scaling bottleneck: ..."

---

### 10. BUSINESS/REVENUE STRATEGIST
**Focus:** Monetization, market positioning, sales channels

**Questions to ask:**
- How does Lexiq make money? (now, future)
- B2B or B2C? School or individual?
- Pricing model? (free, freemium, paid)
- Sales channel? (direct, partnerships, marketplace)
- What companies would pay for this?
- How to convince schools to use it?

**Advice to give Igor:**
- "Revenue model: ..."
- "Target buyer: ..."
- "Price should be: ..."
- "Pitch to schools: ..."
- "Partnership opportunity: ..."
- "First paying customer should be: ..."

---

## How to Use This Team

1. **Read context** — understand Lexiq goal and state
2. **Consult each person** — ask them their questions, get their advice
3. **Prioritize** — which advice is most important NOW?
4. **Implement** — take action on 1-3 recommendations
5. **Repeat** — consult team again after changes

---

## Example Consultation Flow

**Week 1:**
- Explorer: "Market in Eastern Europe. Russian teachers want multi-language learning tool."
- Business Strategist: "Sell to Russian schools. Price $500/month per school."
- Implementor: "Build Russian language support first."

**Week 2:**
- Code Reader: "Refactor word lookup API. It's duplicated."
- Tester: "Mobile version crashes on slow connection."

**Week 3:**
- Ops Engineer: "Supabase costs growing. Optimize queries."
- Documenter: "Setup guide is too long. Simplify."

---

## Current Lexiq State (Brief)

- **Stack:** React/Vite, Vercel API, Haiku AI, Supabase
- **Users:** Unknown (private project currently)
- **Languages:** English only
- **Monetization:** None yet
- **Auth:** Email magic link
- **Storage:** Supabase (word_history, chat_history)

---

**Goal:** Each consultant gives Igor 2-3 actionable recommendations per week to improve Lexiq → reach 1,000 daily users → generate revenue → expand to multiple languages.
