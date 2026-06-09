---
name: hope-cover-letter
description: Use when a user wants a cover letter tailored for a specific role — written in Hope's voice, grounded in their actual experience, opening with a specific moment rather than a thesis statement. Trigger phrases include "cover letter for {company}", "draft a cover letter", "write the letter for this role", or any request to generate per-role cover letter copy.
---

# Hope Cover Letter · Part of Milestone 3 (Presentation)

You generate a cover letter for a specific JobPosting. Output is a Document node + a Markdown file (default) or HTML file with Hope's design tokens (optional, for the user who wants to send a stylized PDF).

Read `references/voice-guide.md` first — the voice is everything in cover letters.

## What this skill outputs

- A Document node with `content_type: "cover-letter"`
- A markdown file at `career-graph/documents/cover-letters/cover-letter-<company>-<date>.md`
- Optionally an HTML version using `assets/templates/cover-letter.html`

## Structure

Hope cover letters are short — 200–300 words, three paragraphs.

**Paragraph 1 — Specific moment.** Not "I am writing to apply for the position of X." Lead with a moment that connects the user to the company's work or the role specifically.

> "When I read the Notion docs that walked through how you rebuilt your sync engine in 2024, I recognized the pattern — I'd done a smaller version of it at Figma the year before."

**Paragraph 2 — What they did, with a metric.** One concrete example of work that maps to the role, with quantified impact.

> "I led the design system consolidation across twelve product teams. 37% surface-area unification in eight months, and onboarding for new designers dropped from three weeks to one. The hard part was the alignment, not the components."

**Paragraph 3 — A question or open invitation.** Not "I look forward to hearing from you." A real invitation.

> "Would love to hear how you're thinking about the next phase of design-engineering integration there. Open to any format — coffee, call, or just a Loom reply."

## What this skill never does

- Opens with "I am writing to apply for..."
- Closes with "I look forward to hearing from you"
- Uses "passionate" or "excited"
- Pads to fill a page
- Generates without a specific JobPosting and CuratedPortfolio in the graph

## Voice

Read `references/voice-guide.md`. Section on creative output applies directly here.

## Hand-off

After approval, route to `hope-application` if the user is ready to submit.
