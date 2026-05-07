# Credits

Hope is a port and synthesis of work done by many people. This file names them.

## Core inspiration

### Career-Ops · santifer

Repository: https://github.com/santifer/career-ops · MIT license

santifer built a 14-skill job-search system on Claude Code, used it to land Head of Applied AI, and open-sourced it. Their **portal scanner pre-loaded with 45 companies** is a winning UX pattern Hope's Discovery milestone borrows directly. Their philosophical contribution — "engineering discipline instead of spray-and-pray" — sharpens the contrast that makes Hope's milestone-vs-pipeline framing visible.

Hope's specific debts: the portal-scanner pattern, the framing of "stages of the hunt" (which we restructure as milestones), and the proof point that an open-source job-hunt skill set can land its author a job.

### Cocoon-AI architecture-diagram-generator

Repository: https://github.com/Cocoon-AI/architecture-diagram-generator · MIT license

Cocoon's pattern of "single-skill repo with a polished README, screenshots, color palette, downloadable .zip, and the artifact IS the UI" is the model Hope's README structure follows. Their discipline of self-contained HTML output that opens in any browser is what Hope's portfolio and dashboard templates aim for.

### forrestchang / andrej-karpathy-skills

Repository: https://github.com/forrestchang/andrej-karpathy-skills · MIT license

The discipline of brevity. 43,000 installs in a week of a single CLAUDE.md file showed that opinion + concision + immediate utility is the shape of viral open-source distribution. Hope tries to keep every skill brief enough to fit in a job seeker's head.

## Layer 1 (the rails Hope rides)

### Anthropic

Hope is built on Anthropic's plugin/skills system, runs on Claude, and rides every Anthropic surface: Claude.ai web, Claude Code CLI, Claude Cowork desktop (macOS + Windows), Claude API, optional Computer Use and Claude in Chrome, optional MCP connectors. Hope's Layer 1 / Layer 2 / Layer 3 architecture explicitly defers all orchestration, models, persistence, and distribution to Anthropic.

The official Anthropic skills repository at https://github.com/anthropics/skills is the canonical reference for skill format and best practices. Hope's `plugin.json` and `.claude-plugin/marketplace.json` follow Anthropic's specifications.

## Predecessors

### Hope MVP (the original)

The Neo4j-based career graph in this plugin is a port of the original Hope MVP's `apps_mvp/backend/services/graph_intelligence/` schema. The load-bearing patterns — deterministic IDs, contribution-driven skills, canonical company resolution, confidence propagation, source attribution, curated portfolios — were designed in that original codebase. Hope-the-plugin preserves them, swapping the Neo4j server for a single JSON file owned by the user.

## Other open-source job-hunt skills we've learned from

### Career-Helper · Zal4DW

Repository: https://github.com/Zal4DW/career-helper · MIT

Their "Tim, your personal career coach who guides you through the right skills in the right order" is the closest existing pattern to Hope's milestone framework. They're skill-centric; Hope formalizes the journey as milestones with state.

### Placed-Skills

Repository: see https://dev.to/ajitsingh25/i-built-26-ai-career-tools-for-claude-code

26 AI career tools — résumé builder, ATS checker, interview coach, salary negotiation, job tracker. Demonstrates the breadth of skills the open-source community already builds; Hope curates a subset and ties them into a coherent journey.

### Proficiently-Claude-Skills · proficientlyjobs

Repository: https://github.com/proficientlyjobs/proficiently-claude-skills · MIT

Résumé tailoring + cover letter focused. Different angle from Hope, useful for users who want narrower scope.

## Tools and libraries

- **Mermaid** (https://mermaid.js.org) — the diagram engine used in Hope's dashboard milestone progression visualization.
- **NetworkX** (https://networkx.org) — Python graph library used by `scripts/graph_query.py` for in-memory graph queries when needed.

## Voice and design influences

- The "Anti-pattern: chatbot voice" frame in Hope's voice guide is influenced by writers who've taught me that warmth in software comes from precision and presence, not pep.
- The dark-first / glassmorphism / cyan-accent design language is the locked design token set from the original Hope MVP, designed by the Hope team.

## Contributors

(To be populated as people contribute. Open a PR.)

---

If you contributed something to Hope and aren't on this list, open an issue or PR. We want to credit everyone whose work made this possible.
