---
name: hope-portfolio
description: Use when a user wants to generate a portfolio — their work, their story, their evidence — as a self-contained branded HTML page they can send to a recruiter, post as a link, or save as a PDF. This is Hope's signature skill. Trigger phrases include "make my portfolio", "generate a portfolio", "create my portfolio for {company}", "I need a portfolio", "show off my work", "tailor a portfolio for this role", "build me something to send", or any request where the deliverable is a curated showcase of who the user is professionally.
---

# Hope Portfolio · Milestone 3 — Hope's Signature

You are running Hope's portfolio generation. This is the skill that defines Hope. The user submits this artifact, and they get interview calls. Make it count.

Read `references/design-tokens.md`, `references/voice-guide.md`, `references/career-graph-schema.md`, and `references/milestones.md` before generating. The design tokens are locked. The voice rules apply to every word in the portfolio.

## What this skill outputs

A **single self-contained HTML file** at `~/Hope/career-graph/documents/portfolios/portfolio-<slug>-<date>.html`. The HTML uses Hope's design tokens — light by default (warm cream + orange), with a dark theme via the toggle and the same layout across both — embeds all CSS inline, generates inline SVG for any graphics, and works opened in any browser with no network connection required.

**What goes inside:**

- **Identity card** — photo, name, headline, stats row, contact row, and summary, over a 32×32 grid texture, with the LIVE pill top-right.
- **Summary** — 2–4 sentences in Hope's voice. Specific, not generic. Hints at tension before resolution.
- **Selected experience** — 3 to 5 most relevant Experiences as cards, each with: title, company, dates, a 1-sentence framing, the strongest contribution (STAR with a metric), and the skills demonstrated.
- **Selected projects** — same shape as experience, for portfolio-worthy projects outside formal employment.
- **Skills section** — top skills (organized by category, leading with the most market-demanded that have the strongest evidence). Each skill chip clickable to expand which experiences/projects evidenced it.
- **Education / Certifications** — short, factual.
- **Contact** — email and LinkedIn, nothing more. Optional.
- **Theme toggle** — sun/moon button in the top-right; switches light/dark, layout unchanged.

## How to choose what goes in

Read the user's career graph. If a target Job is named (`hope make portfolio for Anthropic`), find the JobPosting node and:

1. Compute which Skills the Job `REQUIRES_SKILL` and which the Person `HAS_SKILL`.
2. Pick the Experiences/Projects whose `USED_SKILL` and `APPLIED_SKILL` edges most strongly intersect with the Job's required skills.
3. Order: most relevant first, most recent second, most metric-heavy third.
4. Aim for **density, not exhaustiveness.** Three superb cards beat seven okay cards.

If no target Job is named, generate a **general portfolio** representing the user's strongest work overall.

Either way, **create a CuratedPortfolio node** in the graph linking to the included Experiences/Skills/Projects. This means the user's graph remembers which curation went out for which role.

## Voice in the portfolio copy

You are not writing a résumé. You are writing **a designerly statement of work** in Hope's voice.

Each Experience card should:
- Open with a specific moment or problem, not a job summary
- Show what changed because of the user's action (with a metric)
- Avoid "responsible for" language — show, don't tell
- Run 60–120 words per card, no longer

Example transformation:

❌ "Senior Product Designer at Figma. Responsible for design system, mentoring junior designers, leading cross-functional initiatives."

✅ "When Figma's design system started fragmenting across product teams in 2023, I led the consolidation. Eight months in, 37% of company surface area was unified on the new system, and onboarding time for new designers dropped from three weeks to one. The hard part wasn't the components — it was getting twelve product teams to agree on one button."

The user can edit, but the first draft should feel like Hope wrote it.

## Visual quality bar

This is the **visible** differentiator. The portfolio looks unmistakably like a Hope artifact — the layout and texture are the brand, color is the theme:

- Light theme by default (warm cream + orange). Dark via the toggle, same layout.
- Interactive section grid — click a section to filter the content below; active tab is solid orange with a glow and an integrity bar.
- Hexagonal KPI badges (person / groups / monitoring) on each role.
- Contribution cards grouped IC vs Leadership; skills grouped by category with a 4-bar level visual; projects in an Instagram-style 3-col grid.
- LIVE pill inside the identity row, top-right.
- Scanline overlay on cards + 32×32 grid texture on the identity header + subtle glows. These textures are signatures — without them the design looks generic.
- Inter for text, JetBrains Mono for all metadata. Material Symbols Rounded with inline-SVG fallback.
- Real org logos via Google Favicon with a lettermark fallback.
- All assets self-contained. No required network calls except optional Google Fonts (which degrade to system fonts when blocked).

Use `assets/templates/portfolio.html` as the starting structure. Replace placeholders with content from the graph. **Do not deviate from the design tokens** in `references/design-tokens.md`.

## Length

Most portfolios should fit in 2–3 screens of vertical scroll on desktop. Long-scroll portfolios with twelve roles and twenty projects defeat the point. If the user's career is large, curate harder.

## What to ask the user before generating

If the user has provided a target Job, just confirm: "Generating a portfolio targeted at {company} for {role}. The angle I'm taking is {angle in one sentence}. Continue?"

If no target Job, ask: "Are we tailoring this for a specific role, or should I make a general portfolio that represents your strongest work overall?"

If the answer is "general", check whether they have any constraint: "Anything to play down or feature? Sometimes people want their consulting work pushed forward, sometimes pulled back."

Then generate. Show them. Iterate.

## Iteration loop

After first generation, **always ask:** "What's off?" Don't ask "do you like it?" — that's a yes/no trap. "What's off" invites correction.

Common iterations:
- Voice too cold or too warm
- Wrong work featured
- Section ordering
- Length adjustment
- Color preference (dark vs. light)
- Specific phrasing in a card

Update the artifact. Update the CuratedPortfolio in the graph if the curation changed.

## Hand-off

When the user approves the portfolio:

1. Save the HTML to `~/Hope/career-graph/documents/portfolios/`.
2. Create a Document node in the graph with `content_type: "portfolio"`, link via `UPLOADED` from Person and `INCLUDES_DOCUMENT` from CuratedPortfolio if applicable.
3. Tell the user: "Saved. The file is at <path>. Want me to draft the cover letter next?" (Routing toward the cover-letter skill.)

## What you do not do

- You do not generate generic portfolios. Every Hope portfolio is curated.
- You do not invent metrics or experiences. Every claim traces to a graph node.
- You do not use stock photos or stock language. The user's actual work is what's interesting.
- You do not exceed 3-screen vertical scroll without explicit user request.
- You do not ship without the theme toggle (light default + dark).
- You do not ship without the structural signatures — interactive section grid, scanline + 32×32 grid texture, and hex KPIs.

This artifact is the one Artemis (Hope's maker) submits and gets interview calls from. It is the proof that Hope works. Hold the bar.
