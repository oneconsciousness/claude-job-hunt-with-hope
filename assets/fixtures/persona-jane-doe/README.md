# Persona Fixture · Jane Doe

A fictional persona used for testing Hope skills without requiring real user PII.

## Who Jane is

- **Name:** Jane Doe
- **Role:** Senior Product Designer
- **Years experience:** 9
- **Location:** Brooklyn, NY
- **Domain:** B2B SaaS, focus on developer tools and design systems
- **Companies (chronological):** Indie design studio (2017–2019), Linear (2019–2022), Figma (2022–present)
- **Standout work:** Led Figma's design-system consolidation across 12 product teams, achieving 37% surface-area unification in 8 months.
- **Looking for:** Senior IC role at AI-first or design-mature company. Prefers hybrid; SF/NYC/remote OK.
- **Constraint to remember:** Has a young child; unable to travel >25%.

## Files

- **`resume.txt`** — Plain text résumé. Use this to test the Onboarding skill's résumé-extraction flow.
- **`profile.json`** — Pre-populated career graph in Hope's schema. Use this to test downstream skills (Portfolio, Dashboard, Discovery, etc.) without re-running Onboarding.

## How to use in testing

1. **Test Onboarding:** Start a fresh session, upload `resume.txt`, and let Hope onboard Jane. Compare the resulting graph to `profile.json`.

2. **Test Portfolio:** Copy `profile.json` to `~/Hope/career-graph/career.json` and ask Hope to "make my portfolio for Anthropic." Verify the generated HTML matches Hope's design system and the content is sensible.

3. **Test Dashboard:** With `profile.json` as the graph, ask "show my dashboard." Verify the milestone state reflects Jane's position (between Discovery and Presentation).

## Why fictional

Hope's public repo never ships real user data. Jane is generic enough to test all skills, specific enough to feel real. The maker's actual data (which is what they really test with) stays private.
