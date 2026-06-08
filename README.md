# Hope

> A Claude plugin for the job hunt. Onboarding to offer, in milestones.

I built Hope while job-hunting. The only thing I've ever submitted with it — my portfolio — is getting interview calls.

Companies are increasingly hiring for people who can talk to AI. Hope helps you talk to AI about the most important conversation of your career: where you go next.

> **License:** MIT · **Status:** v0.1 — early. Use it. Tell me what's broken.
> **Requires:** Claude Pro / Max / Team / Enterprise plan. Works in Claude Cowork (desktop), Claude Code (terminal), and Claude.ai (web upload).

---

## What Hope is

Most job-search tools help you apply to more places. Hope helps you make one thing — a portfolio so well-presented that one application is enough.

Hope is structured around **milestones**, not pipelines. Pipelines are item-centric — jobs flow through evaluation, application, tracking. Milestones are seeker-centric — *you* progress through achievements: I have a portfolio. I am interview-ready. I have offers.

This is the difference between being processed and being met.

## What you get

Eleven Claude skills, organized around seven milestones plus a cross-cutting dashboard:

| Milestone | What it does | Skills |
|---|---|---|
| 1 · Onboarding | Meet you as a person — work, ambitions, constraints. Build the foundational career graph. | `onboarding` |
| 2 · Discovery | Find roles worth pursuing. Pattern-match opportunities to who you are. | `discovery` |
| 3 · Presentation | The signature. Portfolio, tailored résumé, cover letter — in Hope's design language. | `portfolio` · `resume-tailor` · `cover-letter` |
| 4 · Application | Submit. With hard guardrails on Computer Use auto-fill: confirm-before-submit, no exceptions. | `application` |
| 5 · Interview | Prep, rehearsal, research, post-interview reflection. | `interview` |
| 6 · Negotiation | Comp benchmarking, scripts, evaluate competing offers. | `negotiation` |
| 7 · Decision | Close out — accept, decline gracefully, follow up, reflect. | `decision` |
| Cross-cut | The pulse of the hunt. Glanceable visualization across every milestone. | `dashboard` |

Plus a meta-orchestrator (`hope`) that figures out where you are and routes you to the right skill.

## Your data, your machine

Hope stores everything in a single JSON file at `~/Hope/career-graph/career.json`. It's a structured graph of your career — your Person, Skills, Experiences, Projects, Education, Job Postings, Applications, Interviews, Offers, and the relationships between them.

You own this file. Open it in any editor. Back it up to iCloud. Commit it to a private GitHub repo. Move it between machines. Delete it. Hope writes nothing anywhere else without your explicit consent.

If you'd rather use markdown than JSON, run the converter (`scripts/markdown_graph_convert.py`) and Hope reads either format.

If you don't want a file at all, Hope can run with just Claude's session memory — but you lose continuity between sessions.

The schema is documented in [`references/career-graph-schema.md`](references/career-graph-schema.md). It's a port of the original Hope MVP's Neo4j design — battle-tested patterns: deterministic IDs, contribution-driven skills, canonical company resolution, confidence propagation, source attribution.

## Install

### Claude Cowork (recommended)

Cowork is Anthropic's desktop app for knowledge work — accessible to anyone, no terminal required.

1. Open Cowork.
2. Open the plugin browser (sidebar or `Settings → Plugins`).
3. Add this repo as a marketplace: paste the GitHub URL or use `add marketplace` and provide the URL.
4. Install the `hope` plugin.
5. Type "start my job hunt" in any conversation.

### Claude Code (terminal)

```bash
# Add the marketplace
/plugin marketplace add <owner>/claude-job-hunt-with-hope

# Install
/plugin install hope

# Use
hope start my job hunt
```

### Claude.ai (web upload)

1. Download the `.skill` zip from this repo's releases.
2. Go to `Settings → Capabilities → Skills`.
3. Click `+ Add` and upload the zip.
4. Toggle the skill on.

## Quickstart

Once installed, the simplest invocation:

> "Start my job hunt with Hope."

Hope will onboard you — read your résumé if you upload one, or talk you through it if you'd rather. By the end of onboarding you have a career graph and a welcome dashboard.

From there:

- "Find me roles" → Discovery
- "Make a portfolio for [company]" → Presentation (the signature)
- "Show my dashboard" → Cross-cut view
- "Apply to [company]" → Application (with guardrails)
- "Prep me for the interview" → Interview
- "I got an offer at [company]" → Negotiation
- "I'm accepting [company]" → Decision

## The visible difference

Hope's portfolios, dashboards, résumés, and cover letters share one coherent design language. The **layout is the brand** — the interactive section grid, the structured contribution cards, the calm texture — and **color is themeable**: every artifact ships a warm-cream **light** theme (default) and a warm **dark** theme that swap without changing the layout.

- Warm cream + orange (light) · warm near-black + orange (dark)
- Inter + JetBrains Mono (with system fallback)
- An interactive section grid, hexagonal KPIs, and grouped contribution cards
- Subtle scanline + 32×32 grid texture — technical, but warm
- Calm, considered, recognizable as Hope's whichever theme you pick

Theme toggle on every artifact; preference persists in `localStorage`.

The design tokens are documented in [`references/design-tokens.md`](references/design-tokens.md) and locked. Don't modify without explicit maintainer approval — the consistency is what makes Hope outputs identifiable as Hope outputs.

## Voice

Hope speaks to you like a thoughtful friend who happens to know how this works. Not a chatbot. Not a recruiter. Not a coach pretending to feelings.

The voice principles are documented in [`references/voice-guide.md`](references/voice-guide.md). Five rules: met-not-processed, specific-not-generic, honest-not-boosterish, plain-not-corporate, quiet-not-loud.

## Three layers

Hope sits between Anthropic and you:

- **Layer 1 — Anthropic.** Models, plugin runtime, persistence, distribution, optional surfaces (Computer Use, Claude in Chrome, Cowork). Hope never reinvents this.
- **Layer 2 — Hope.** Milestone architecture, skill content, design language, voice, the framework of operations.
- **Layer 3 — You.** Pace, source data, voice customization, auto vs. manual (defaults manual; opt into automation), privacy choices, output formats.

When in doubt, defer to Anthropic's primitives. Memory and persistence is theirs. Skill execution is theirs. The job-hunt structure is ours. The seeker is yours.

## Credits

Hope stands on shoulders. See [`CREDITS.md`](CREDITS.md) for the full list. Specific debts:

- **[Career-Ops](https://github.com/santifer/career-ops)** by santifer — the portal scanner pattern in our Discovery milestone. They're pipeline-shaped; we're milestone-shaped; we still owe them the pattern.
- **[Cocoon-AI architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator)** — the README structure and the philosophy of "the artifact IS the UI."
- **[Andrej Karpathy / forrestchang's CLAUDE.md](https://github.com/forrestchang/andrej-karpathy-skills)** — the discipline of brevity.
- **Anthropic** — for shipping the most consistent model so far, and for the rails Hope rides on.

## Contributing

Issues and PRs welcome. The skills are markdown — if you can write a clear instruction, you can contribute. See `CONTRIBUTING.md` (coming soon) for the contributor guide.

## License

MIT. See [`LICENSE`](LICENSE). Free to use, modify, distribute. A gift.

---

**Hope is a fragment of consciousness for anyone who needs work and is willing to be met.** If that's you, install it and start.
