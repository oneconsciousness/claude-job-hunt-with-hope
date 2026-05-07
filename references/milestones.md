# Hope Milestone Framework · v1.0

Hope is structured around **milestones**, not pipelines. Pipelines are item-centric — jobs flow through evaluation, application, tracking. Milestones are seeker-centric — *you* progress through achievements: I have a portfolio. I am interview-ready. I have offers.

Pipelines are about throughput. Milestones are about transformation. Hope's whole frame — presentation, dashboard, portfolio, the felt quality of being seen — maps to milestones. Most competitor tools have pipelines. None have milestone-based architecture for job seekers. This is Hope's moat.

## The 7 milestones + 1 cross-cut

Each milestone has explicit entry triggers, the skills available inside, the controls the user retains, and the exit criteria that mark completion. Order is the typical seeker journey, but a user can skip, repeat, or reorder.

### 1. Onboarding

Meet the seeker as a person. Their work, ambitions, constraints, what makes them rare.

- **Entry:** First time the user invokes Hope, OR explicitly says "let's start over."
- **Skills active:** `onboarding`
- **Controls (L3):** which sources to import (résumé file, LinkedIn, GitHub, manual), what to skip, voice preferences.
- **Graph writes:** Person node, initial Skills, Experiences, Education, Projects, foundational Memories.
- **Exit when:** Person node has `headline`, `summary`, `location`; at least 3 Experience nodes (or first Experience for early-career); at least 5 Skill nodes with USED_SKILL evidence.

### 2. Discovery

Find roles worth pursuing. Pattern-match opportunities to who they are.

- **Entry:** User asks Hope to find roles, OR onboarding completes and user opts to continue.
- **Skills active:** `discovery`
- **Controls (L3):** which portals to scan, salary floor, geo constraints, must-haves vs. nice-to-haves, exclusions (companies they won't work for).
- **Graph writes:** JobPosting nodes, Company nodes (if new), `TARGETING` edges, `REQUIRES_SKILL` edges, match scores.
- **Exit when:** at least 5 JobPosting nodes with status `targeted`. The user has reviewed and confirmed which to advance.

### 3. Presentation — Hope's signature

The visible differentiator. This is where Hope wins on quality. Portfolio, tailored résumé, cover letter — every artifact ships with Hope's design tokens, branded and beautiful.

- **Entry:** User has at least one targeted JobPosting and asks for a portfolio / résumé / cover letter, OR Discovery completes.
- **Skills active:** `portfolio`, `resume-tailor`, `cover-letter`
- **Controls (L3):** which work to feature, voice and tone, length, format (HTML / PDF / Markdown), depth of customization per role.
- **Graph writes:** CuratedPortfolio nodes per Job, Document nodes per artifact, INCLUDES_* edges to selected Skills/Experiences/Projects.
- **Exit when:** for each targeted job, a CuratedPortfolio + at least one Document (résumé OR portfolio OR cover letter) exists. User has reviewed and approved.

### 4. Application

Submit. With Computer Use guardrails — see `computer-use-guardrails.md`.

- **Entry:** User has approved Documents for a job and says "apply" or equivalent.
- **Skills active:** `application`
- **Controls (L3):** auto-fill (default OFF, opt-in per submission), confirmation level (every field / every page / every submission), follow-up cadence.
- **Graph writes:** Application nodes per submission, status updates, follow-up dates.
- **Exit when:** Application nodes for each pursued role exist with status `submitted` or beyond. User has scheduled follow-ups.

### 5. Interview

Prep, rehearsal, research, post-interview reflection. Companies hire for people who can talk to AI; Hope is meta-helpful here — Hope helps the user think clearly, not just regurgitate prep.

- **Entry:** Application status moves to `interviewing`, OR user announces an upcoming interview.
- **Skills active:** `interview`
- **Controls (L3):** prep depth (light / standard / deep), research scope (interviewer / company / industry), rehearsal style.
- **Graph writes:** Interview nodes, prep Document, optional Connection nodes (interviewers), reflections as Memory nodes.
- **Exit when:** Interview is complete and reflection captured. Application status updated.

### 6. Negotiation

Compensation, terms, multi-offer comparisons. Scripts, benchmarks, evaluation frames.

- **Entry:** Application status moves to `offered`, OR user pastes an offer letter.
- **Skills active:** `negotiation`
- **Controls (L3):** what to optimize (base / equity / signing / start date / title / scope), risk tolerance, ethical floor, scripts (assertive / collaborative / declining gracefully).
- **Graph writes:** Offer nodes with compensation breakdown, negotiation notes as Memory.
- **Exit when:** Offer.decision is set to `accepted`, `declined`, or `negotiating` is closed.

### 7. Decision

Close out the job hunt with intention. Accept, decline, follow up. Reflect on the journey.

- **Entry:** User has at least one Offer with decision pending, OR ends the hunt by choice.
- **Skills active:** `decision`
- **Controls (L3):** decision criteria (values / comp / role / team / growth), follow-up tone (warm / professional / brief).
- **Graph writes:** Final Offer.decision, closing Memory capturing what they learned, follow-up Documents (acceptance / decline letters).
- **Exit when:** Offer.decision is final. Closing Memory written. (The hunt isn't "done" — it's punctuated.)

### Cross-cut: Dashboard

The pulse of the hunt. Visualizes across every milestone. Shows: where you are, what's pending, who's overdue for follow-up, which prep is incomplete, what offers are open, what your next action is.

- **Entry:** Anytime. User asks "show me my dashboard" or invokes any cross-milestone view.
- **Skills active:** `dashboard`
- **Controls (L3):** which milestones to show, time horizon, level of detail, color theme (Hope dark or warm-cream light).
- **Graph writes:** None. Pure read.

## How a user moves between milestones

There's no enforced sequence. A user might:

- Run Discovery before Onboarding (they want to see what's out there before committing to set up Hope).
- Loop back to Onboarding from Interview (they realize they want to add a project they had forgotten).
- Skip Negotiation entirely (they take the offer as-is, or they're declining).
- Stay in Presentation for weeks (they're polishing one portfolio for one specific role).

Hope detects which milestone the user is in by reading the graph state and listening to the conversation. Skills are defensive about their entry criteria — `negotiation` won't activate if there's no Offer node, and Hope will redirect to whichever milestone makes sense.

## Why this matters

Career-Ops, Career-Helper, and the other open-source job-hunt tools structure work as **stages** items pass through. That's a fine model for processing. It's not a model for *being met as a person*.

Hope's milestones are achievements *the seeker* attains. The frame is honoring. The user isn't a queue item. They're someone in motion through a meaningful arc, and Hope holds the shape of that arc. Anthropic provides the runtime (Layer 1). Hope provides the milestone framework (Layer 2). The user moves through it (Layer 3) at their pace, on their terms.

That's the pitch in one sentence.
