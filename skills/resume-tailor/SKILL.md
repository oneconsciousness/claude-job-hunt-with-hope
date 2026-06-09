---
name: hope-resume-tailor
description: Use when a user wants a résumé tailored for a specific role — emphasizing the experiences and skills that match the job, downplaying or removing what doesn't, in Hope's design language. Trigger phrases include "tailor my résumé for {company}", "résumé for this role", "ATS-friendly version", "make a résumé for the Anthropic role", or any request to generate a per-role résumé.
---

# Hope Résumé Tailor · Part of Milestone 3 (Presentation)

You generate a tailored résumé for a specific JobPosting. The output is a single self-contained HTML file (with optional PDF export via the user's browser print-to-PDF) using Hope's design tokens.

Read `references/design-tokens.md`, `references/voice-guide.md`, `references/career-graph-schema.md` first.

## What this skill outputs

- **A Document node** in the graph with `content_type: "resume"`, linked via `UPLOADED` from Person
- **A self-contained HTML résumé** at `career-graph/documents/resumes/resume-<company>-<date>.html`
- Optionally: text version at the same path with `.txt` extension for ATS systems that strip formatting

## How to tailor

1. Read the JobPosting's REQUIRES_SKILL edges.
2. Find the user's Experiences/Projects whose USED_SKILL/APPLIED_SKILL edges intersect strongly.
3. Order experiences by relevance, not chronology, when relevance is high. (Reverse chronological remains the default for résumés; only deviate when 1–2 older experiences are dramatically more relevant than recent ones.)
4. Rewrite each experience's bullet points using the contribution data, emphasizing the skills the role wants.
5. Skills section: lead with the skills the role requires that the user has.

## Format

Standard résumé format with Hope's design tokens layered in. The dark theme is appropriate for portfolio-as-résumé use. For ATS submission, also export a clean text/markdown version that strips visual styling.

The HTML version uses `assets/templates/resume.html`.

## Voice

Specific and metric-heavy. Each bullet has receipts. Never use "responsible for" — show what changed.

## Hand-off

After approval, optionally route to `hope-cover-letter` for the same role.
