---
name: hope-portfolio
description: Use when a user wants to generate a portfolio — their work, their story, their evidence — as a self-contained branded HTML page they can send to a recruiter, post as a link, or save as a PDF. This is Hope's signature skill. Trigger phrases include "make my portfolio", "generate a portfolio", "create my portfolio for {company}", "I need a portfolio", "show off my work", "tailor a portfolio for this role", "build me something to send", or any request where the deliverable is a curated showcase of who the user is professionally.
---

# Hope Portfolio · Milestone 3 — Hope's Signature

You are running Hope's portfolio generation. This is the skill that defines Hope. The user submits this artifact, and they get interview calls. Make it count.

## Locate the plugin files first (do this before anything else)

Hope's reference docs and the HTML template ship **inside the plugin**, not in the user's project. The paths below (`references/…`, `assets/templates/…`) are **relative to the plugin root** — they are NOT relative to your working directory (which is the user's project folder). `${CLAUDE_PLUGIN_ROOT}` is **not** substituted inside this Markdown, so you must resolve the plugin root yourself with Bash, once, before you read anything:

```bash
# Resolve the Hope plugin root (references/, assets/, scripts/ live there).
# $CLAUDE_PLUGIN_ROOT is NOT expanded in this Markdown — resolve in Bash. Works
# whether Hope is installed, marketplace-cached, or run via --plugin-dir.
PLUGIN_ROOT=""
for c in "$CLAUDE_PLUGIN_ROOT" "$HOME"/.claude/plugins/cache/hope/hope/*/ "$HOME/.claude/plugins/marketplaces/hope"; do
  [ -n "$c" ] && [ -f "${c%/}/plugin.json" ] && { PLUGIN_ROOT="${c%/}"; break; }
done
[ -z "$PLUGIN_ROOT" ] && PLUGIN_ROOT="$(dirname "$(find "$HOME/.claude/plugins" -path '*hope*/plugin.json' -print -quit 2>/dev/null)")"
echo "PLUGIN_ROOT=$PLUGIN_ROOT"   # sanity-check before reading bundled files
```

If `PLUGIN_ROOT` comes back empty, ask the user where the Hope plugin is checked out (e.g. a `--plugin-dir` path) rather than guessing relative paths — a relative `references/…` read resolves against the user's project folder and will 404.

Read these before generating — they're load-bearing. The design tokens are locked; the voice rules apply to every word in the portfolio:

```bash
cat "$PLUGIN_ROOT/references/design-tokens.md"
cat "$PLUGIN_ROOT/references/voice-guide.md"
cat "$PLUGIN_ROOT/references/career-graph-schema.md"
cat "$PLUGIN_ROOT/references/milestones.md"
```

## What this skill outputs

A **single self-contained HTML file** at `career-graph/documents/portfolios/portfolio-<slug>-<date>.html`, plus two **share-card pages** (`share-card.html` and `share-card-square.html`) in the same folder — see "Share cards & link-preview meta" below. The HTML uses Hope's design tokens — light by default (warm cream + orange), with a dark theme via the toggle and the same layout across both — embeds all CSS inline, generates inline SVG for any graphics, and works opened in any browser with no network connection required.

**What goes inside:**

- **Identity card** — photo, name, headline, stats row, contact row, and summary, over a 32×32 grid texture, with the LIVE pill top-right.
- **Overview app (opt-in)** — a section-grid tab, not a standalone band: a grid tile (`data-section="overview"`, labeled "Overview", icon `insights`, meta-count "`{{stat_count}} highlights`") plus a pane (`id="pane-overview"`) that sits first among the panes and opens by default when present. Inside: up to 4 curated hero stats as large hex badges plus a quiet interests line. Renders **only** when the user opted in (`CuratedPortfolio.show_summary` is true) and `Person.headline_stats` exist — see "Overview app — substitution contract" below.
- **Summary** — 2–4 sentences in Hope's voice. Specific, not generic. Hints at tension before resolution.
- **Selected experience** — 3 to 5 most relevant Experiences as cards, each with: title, company, dates, a 1-sentence framing, the strongest contribution (STAR with a metric), and the skills demonstrated.
- **Selected projects** — same shape as experience, for portfolio-worthy projects outside formal employment.
- **Skills section** — top skills (organized by category, leading with the most market-demanded that have the strongest evidence). Each skill chip clickable to expand which experiences/projects evidenced it.
- **Education / Certifications** — short, factual.
- **Contact** — email and LinkedIn, nothing more. Optional.
- **Theme toggle** — sun/moon button in the top-right; switches light/dark, layout unchanged.
- **Hidden résumé view** — `#resume-view`, invisible on screen, populated at generation time for the résumé print path (see "Resume view — substitution contract" below).
- **Export & share controls** — the template's **Save as PDF** button exports the **résumé**: a chooser (`#export-modal`) for style + font + fit, with a **hard readability floor — body text never drops below 10pt**. The portfolio-PDF chooser is **gated for the next release** — the live page IS the portfolio, and Cmd+P still prints it natively. **Share** opens a Copy link / LinkedIn / X / WhatsApp / Email menu (`#share-menu`). These ship in the template; your job is the content they depend on (resume view, OG meta, share cards).

## How to choose what goes in

Read the user's career graph. If a target Job is named (`hope make portfolio for Anthropic`), find the JobPosting node and:

1. Compute which Skills the Job `REQUIRES_SKILL` and which the Person `HAS_SKILL`.
2. Pick the Experiences/Projects whose `USED_SKILL` and `APPLIED_SKILL` edges most strongly intersect with the Job's required skills.
3. Order: most relevant first, most recent second, most metric-heavy third.
4. Aim for **density, not exhaustiveness.** Three superb cards beat seven okay cards.

If no target Job is named, generate a **general portfolio** representing the user's strongest work overall.

Either way, **create a CuratedPortfolio node** in the graph linking to the included Experiences/Skills/Projects, and record the user's Overview-app decision on it as `"show_summary": true|false` (see the opt-in prompt below — it's a per-portfolio presentation choice, not a Person fact). This means the user's graph remembers which curation went out for which role.

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
- Contribution cards grouped IC vs Leadership; skills grouped by category with a 4-bar level visual; projects render as the same expandable Experience-style `.item-card`s (see the projects-loop contract below) so each project's full story shows.
- LIVE pill inside the identity row, top-right.
- Scanline overlay on cards + 32×32 grid texture on the identity header + subtle glows. These textures are signatures — without them the design looks generic.
- Inter for text, JetBrains Mono for all metadata. Material Symbols Rounded with inline-SVG fallback.
- Real org logos via Google Favicon with a lettermark fallback.
- All assets self-contained. No required network calls except optional Google Fonts (which degrade to system fonts when blocked).

Use the bundled HTML template as the starting structure — load it from the plugin root you resolved above:

```bash
cat "$PLUGIN_ROOT/assets/templates/portfolio.html"
```

Replace placeholders with content from the graph. **Do not deviate from the design tokens** in `$PLUGIN_ROOT/references/design-tokens.md` (loaded above).

### Projects loop — substitution contract (item-cards, not tiles)

The Projects pane uses the **same collapsible `.item-card` structure as Experience** — projects carry real content (`description`, `tagline`, `impact`, a full `skills_applied` list), and a tile would throw all of it away. The `<!-- HOPE:projects_loop_start … projects_loop_end -->` block in the template renders **one `.item-card.project` per project**. For each project, substitute:

| Field | Goes into | Notes |
|---|---|---|
| `{{project_name}}` | `.role-title` (and `img alt`) | The project's name — the card title. |
| `{{project_tagline}}` | `.role-company` | One-line framing of the project; fall back to a short tech/role summary if the project has no tagline. |
| `{{project_dates}}` | `.role-dates` | Optional — **omit the whole `<span class="role-dates">` when the project has no dates** (don't emit an empty span). |
| `{{#is_active}}…{{/is_active}}` | `.active-pill` | Render the "Active" pill for in-progress / ongoing projects; drop it otherwise. |
| `{{project_domain}}` / `{{project_initial}}` | `.org-logo` favicon + `.org-fallback` | If the project has a link/host, use the Google favicon with the lettermark fallback; with no domain, render just `<span class="org-fallback">{{project_initial}}</span>`. |
| `{{best_metric}}` | `.contrib-pill` | Optional headline metric (e.g. `1.2k stars`, `2,400 sold`); omit the pill if there's none. |
| `{{project_description}}` | `.contrib-action` | The project's full description / what it is — the body's lead paragraph. |
| `{{#impact}}…{{/impact}}` | `.contrib-impact` | The impact / outcome line; omit the block when absent. |
| `{{skill_category}}` / `{{skill_name}}` | `.skill-chip` (in the `HOPE:project_skills_loop`) | One chip per entry in `skills_applied`; `skill_category` drives chip color via the same category map as Experience. Wrap in `{{#has_skills}}…{{/has_skills}}`. |
| `{{link}}` / `{{link_label}}` | trailing `<a class="item linkedin">` | Optional external link (repo, live site, writeup); omit the block when the project has no link. |

Mark the **first** project card `expanded` (so the pane opens populated). The card reuses Experience's `.item-card[data-expand] .item-head` markup verbatim, so the card-expand JS and the section-grid "Projects" filter work on project cards with no extra wiring. There is **no** project tile, hero gradient, or metric tag — those were removed.

### Overview app — substitution contract (opt-in, zero residue)

The old standalone `#summary-band` between the identity card and the section grid is **gone** — its content (the hex-stat row + interests row) now lives in an **Overview app** inside the section grid. The template carries two pieces, **both** wrapped in `{{#show_summary}} … {{/show_summary}}` conditional markers (same conditional style as `{{#target_company}}`):

- **Tile** — `<button class="section-btn" data-section="overview">`, labeled "Overview", Material Symbols icon `insights`, meta-count line "`{{stat_count}} highlights`".
- **Pane** — `<div class="section-pane" data-pane="overview" id="pane-overview">`, placed **first** among the panes. Inside it the band's content classes are unchanged — `.summary-stats` / `.summary-stat` / `.stat-value` / `.stat-label` / `.summary-interests` — so the premium styling carries over (a KPI row of up to 4 large hex badges, a quiet interests line of neutral pill chips), and the pane's inner panel keeps the 32×32 grid texture.

The look is template-owned and token-driven — your job is the content.

**Render gate:** the app renders **only** when `CuratedPortfolio.show_summary` is `true` AND `Person.headline_stats` is non-empty. In every other case — `show_summary` false or absent, or no stats captured — **strip every `{{#show_summary}}…{{/show_summary}}` block (tile AND pane) from the output. Zero residue:** no empty tile, no empty pane, no leftover loop comments, no stray tokens. When stripped, the section grid is the old 5 tiles and Experience stays the default app.

**Default-open:** on load, the active app is **Overview when the pane exists, else Experience**. The template's init JS handles this — it promotes Overview (activating both pane and tile classes) at/before first paint; the markup may keep Experience's static `active` as the fallback the JS overrides. Don't strip or fight that JS during substitution.

When rendering, substitute:

| Loop / token | Source | Notes |
|---|---|---|
| `{{stat_count}}` | count of rendered `headline_stats` | The tile's meta-count line, e.g. `4 highlights` — a number, nothing else. |
| `<!-- HOPE:summary_stats_loop --> … <!-- /HOPE:summary_stats_loop -->` | `Person.headline_stats` (optional field, max **4**) | One hex badge + stacked value/label per stat. These are **curated by the human — never auto-summed**: metrics are heterogeneous, so don't invent, aggregate, or derive them from other graph nodes. |
| `{{stat_icon}}` | `headline_stats[].icon` | Material Symbols name, e.g. `rocket_launch`, `payments`, `groups`, `public`. |
| `{{stat_value}}` | `headline_stats[].value` | The hero number, e.g. `$2M+` — renders bold sans over the label. |
| `{{stat_label}}` | `headline_stats[].label` | Short, e.g. `client pipeline` — renders mono uppercase, muted. |
| `<!-- HOPE:summary_interests_loop --> … <!-- /HOPE:summary_interests_loop -->` | `Person.interests` (optional field, max **6**) | One neutral pill chip per interest — no category colors. If `interests` is empty but stats exist, drop the interests row entirely and keep the KPI row. |
| `{{interest}}` | `interests[]` | Genuinely personal (typography, trail running) — not skill keywords. |

**Print behavior is template-owned, but don't break it:** the Overview pane prints **first** among the panes (DOM order), and the print TOC carries a **conditional Overview entry** — the TOC chips' numbers are CSS counters, not the old static 01–05, so numbering self-adjusts when Overview is absent (no "02-first" lists). Every **résumé** print mode still hides all of it. The ink/showcase print rules that used to reference `#summary-band` now point at the pane — don't reintroduce the old id or leave selectors dangling. Never duplicate stats or interests into `#resume-view`.

### Resume view — substitution contract

The template carries `<div id="resume-view" hidden>` as a **sibling of the portfolio content inside `.wrap`**. On screen it never renders (`#resume-view{display:none}`); it exists solely for the print path — when the user picks **Resume** in the export chooser, `body.print-doc-resume` hides the portfolio panes and shows this view instead. **Populate it on every generation.** An empty resume view passes a visual check (it's hidden) but silently prints a blank résumé.

Substitute, from the graph:

| Placeholder | Content |
|---|---|
| `{{name}}` / `{{headline}}` | Same values as the identity card. |
| `{{resume_contact_line}}` | Plain text: `location · email · linkedin · site` — include only the fields the user actually has, joined with ` · `. No links-as-icons, no markup tricks. |
| `{{resume_summary}}` | 2–3 tight sentences from the graph. Résumé register — factual and scannable, not Hope's designerly portfolio voice. |
| `<!-- HOPE:resume_experience_loop_start/end -->` | One block per role: title, company, dates, and **2–4 achievement bullets led by metrics** pulled from the role's contributions ("Cut onboarding from 3 weeks to 1 by …" — number first, mechanism second). Bullets use the inner loop `<!-- HOPE:resume_bullets_loop --> … <!-- /HOPE:resume_bullets_loop -->`, one `<li>{{resume_bullet}}</li>` per achievement. |
| `<!-- HOPE:resume_education_loop_start/end -->` | One block per education/certification entry: institution, credential, year. |
| `<!-- HOPE:resume_skills_line -->` | Top **10–14 skills, comma-joined**, strongest-evidenced and most market-demanded first. |

**ATS rules — non-negotiable inside `#resume-view`:** real text only, standard section headings (Experience, Education, Skills), semantic markup — real `<h1>`/`<h2>` and `<ul><li>` — **no tables, no images or icons, no icon fonts, no text rendered as graphics.** Recruiters' parsers must be able to read every word.

## Bake the headshot into the file (do this at generation time)

The published portfolio must **already contain the user's photo**. The template still ships a client-side upload widget, but that only lives in *this* browser's `localStorage` — it never reaches the published file, so a published site with no baked-in photo shows an empty upload box to recruiters. Fix that by embedding the photo as a `data:` URL when you generate the HTML.

**1 — Find a headshot in the user's project folder.** Look for the obvious names first, then any image the user points you at:

```bash
# From the user's project folder (your cwd). Pick the first match.
find . -maxdepth 2 -type f \( \
    -iname 'headshot.*' -o -iname 'photo.*' -o -iname 'profile.*' \
    -o -iname 'avatar.*' -o -iname 'me.*' \
  \) \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) \
  -print 2>/dev/null | head -5
```

If the user named a specific file ("use `~/Pictures/jane.jpg`"), use that path instead. If you find more than one candidate, ask which to use rather than guessing — list them as numbered choices (voice-guide rule #6), recommending the most headshot-looking one.

**2 — Resize to ~480px and base64-encode it.** Keep the file small so the HTML stays portable. On macOS use `sips` (always present); otherwise fall back to Python/PIL:

```bash
SRC="<the image you found>"
OUT="$(mktemp -t hope_headshot).jpg"
# macOS: longest edge → 480px, re-encode as JPEG.
sips -Z 480 -s format jpeg "$SRC" --out "$OUT" >/dev/null 2>&1 \
  || python3 - "$SRC" "$OUT" <<'PY'
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
im.thumbnail((480, 480))
im.save(out, "JPEG", quality=82)
PY
# Emit a ready-to-paste data: URL (single line, no wrapping).
printf 'data:image/jpeg;base64,%s' "$(base64 < "$OUT" | tr -d '\n')"
```

**3 — Substitute it into the template.** The template's photo `<img>` carries a `{{photo_data_url}}` placeholder and the identity card carries a `{{photo_class}}` hook:
- Put the `data:image/jpeg;base64,…` string into `{{photo_data_url}}`.
- Set `{{photo_class}}` to ` has-photo` (note the leading space) so the photo renders and the "add a photo" prompt is hidden.

**4 — No photo found? Leave the upload prompt intact.** If there's no headshot and the user doesn't point you at one, substitute `{{photo_data_url}}` with an empty string and `{{photo_class}}` with an empty string. The card then shows the dashed "Photo" upload box exactly as before — the no-photo case must not break.

Either way the localStorage "change your photo" widget stays in the file as a fallback the user can use after publishing.

**Before saving the user's files, clean and verify the output:**
- **Strip the template-authoring comment** — the `<!-- Hope portfolio template · v0.4 … See skills/portfolio/SKILL.md for the substitution contract -->` block. It documents the template for *you*; it must not ship in the user's portfolio (it also contains a literal `{{single_tokens}}` that fails a "no unsubstituted tokens" check). Keep the disclosed provenance comments (share-url, generator) — those are intentional.
- **"Generated" means all of it** — the portfolio HTML with a **populated `#resume-view`**, plus **`share-card.html` and `share-card-square.html`** next to it (see "Share cards & link-preview meta"). A run that produces only the portfolio file is incomplete.
- **Verify zero unsubstituted placeholders remain** — grep **every generated file** (the portfolio AND both share cards) for `{{` and `<!-- HOPE:`. This explicitly includes the newer tokens — `{{og_description}}`, `{{resume_contact_line}}`, `{{resume_summary}}`, the `resume_*` loop blocks, AND the Overview-app tokens: `{{#show_summary}}`/`{{/show_summary}}`, `{{stat_count}}`, `{{stat_icon}}`, `{{stat_value}}`, `{{stat_label}}`, `{{interest}}`, and the `summary_stats_loop` / `summary_interests_loop` comments — because an unpopulated resume view is invisible on screen and only fails when the user prints a résumé, and a half-stripped Overview app (a stray tile with no pane, or vice versa) only fails for users who opted out. If any survive, the substitution is incomplete; fix before saving. Never hand the user a file with raw template tokens.
- **Verify the PDF export — produce and inspect, don't assume.** After generating, print one résumé PDF and check it. When `python3` is available, run the bundled checker against the generated file: `python3 "$PLUGIN_ROOT/scripts/verify_portfolio_pdf.py" <portfolio.html> --modes resume-classic`. Read its PASS/FAIL table and fix any FAIL before handing the file over. If `python3` isn't available, say so plainly instead of claiming the export was verified.

## Share cards & link-preview meta (generate alongside the portfolio)

A bare URL pasted into LinkedIn/X/WhatsApp unfurls as a rich card only when the page's OG meta points at a real image. **You make the content and the image sources; the publish skill stamps URLs and takes the screenshots.** Division of labor:

**1 — `{{og_description}}`.** The template's `og:description` / `twitter:description` carry this token. Write a **1–2 sentence third-person hook** distilled from the summary — recruiter-facing, specific, no hype. ("Product designer who unified Figma's design system across twelve teams" — not "Visionary design leader passionate about impact.") Also substitute the OG/Twitter title tokens (`{{name}} — {{headline}}`). **Leave `og:url`, `og:image`, and `twitter:image` with `content=""` exactly as the template ships them** — the publish skill stamps absolute URLs once it knows `SITE_URL`.

**2 — Generate two share-card pages next to the portfolio** (same folder, exactly these names — the publish skill looks for them):

- `share-card.html` — fixed **1200×630** (the OG link-preview size).
- `share-card-square.html` — fixed **1080×1080** (IG / WhatsApp avatar variant).

Both are self-contained HTML styled with **Hope's design tokens**, containing: the **baked headshot** if you have one (reuse the same `data:` URL as the portfolio), the user's **name**, **headline**, up to **3 hero metric badges** (the strongest numbers from the graph), and the **live URL in mono at the bottom**. The real URL is stamped at publish time — showing the expected URL is fine. The body is locked to the pixel size with `overflow: hidden` and **no scrollbars**: the publish skill screenshots these pages 1:1 with headless Chrome into `og-image.png` / `og-image-square.png`, so a stray scrollbar or overflowing element ships straight into the recruiter's link preview.

You do **not** take the screenshots — that's the publish skill's step (it needs `SITE_URL` first, and it degrades gracefully if Chrome is missing). Your job ends at two pixel-exact HTML files that render correctly at their fixed sizes.

## Provenance & attribution

Every Hope portfolio carries one **visible** credit — never hidden, never enforced:

- A **"Generated with Hope"** footer linking to the project.
- A `<meta name="generator">` tag and a schema.org **ProfilePage** JSON-LD block in `<head>` — machine-readable so recruiters, ATS, and search can read the portfolio (this serves the user's discoverability, not Hope). Escape `{{name}}` / `{{headline}}` for valid JSON; keep `{{generation_date}}` as an ISO date.

There is **no hidden marker, no signature, no telemetry, nothing that phones home** — Hope is a free gift, given in good faith. The footer is the whole attribution story. Because it's the user's file under MIT, they *can* remove it — but the template asks them, warmly, to keep it so the next person finds Hope too. If a user asks to remove it, help them; don't lecture. Trust is the point.

## Length

Most portfolios should fit in 2–3 screens of vertical scroll on desktop. Long-scroll portfolios with twelve roles and twenty projects defeat the point. If the user's career is large, curate harder.

## What to ask the user before generating

Every question this skill asks follows **voice-guide rule #6 — "Choices, not blanks"**: numbered options (2–4), exactly one "(recommended)" with a one-clause why, free text always honored as the escape hatch. Numbered so the user can answer "2".

If the user has provided a target Job, just confirm: "Generating a portfolio targeted at {company} for {role}. The angle I'm taking is {angle in one sentence}. Continue?" (A plain yes/no confirm IS rule-#6 compliant — don't pad it with fake options.)

If no target Job, ask as a choice:

> Should this portfolio aim somewhere specific?
> 1. **General portfolio of your strongest work** (recommended — you can always tailor a copy when a specific role shows up)
> 2. **Tailored to a role you have in mind** — name the company or role and I'll angle everything at it
>
> Or tell me in your own words.

If the answer is "general", scaffold the constraint question instead of leaving it blank:

> Anything to feature or play down? For example:
> 1. **Keep the balance as-is** (recommended — I'll order by strength of evidence)
> 2. **Push the consulting/freelance work forward**
> 3. **Pull the older roles back** — lead with recent work
>
> Or tell me in your own words — these are just sparks.

**Overview app opt-in — ask once per portfolio.** If `Person.headline_stats` exist and this CuratedPortfolio has no recorded `show_summary` decision yet, ask before first including the app:

> Want an Overview tab opening the section grid — your proudest numbers and a line of interests, the first thing a recruiter sees?
> 1. **Show it** (recommended — recruiters skim, and your strongest numbers deserve the first screen)
> 2. **Skip it** — open straight on your Experience
>
> Or tell me in your own words.

Record the answer on the CuratedPortfolio node as `"show_summary": true|false`; it's a per-portfolio presentation choice, so don't re-ask while iterating on the same portfolio — and an existing decision is honored when regenerating (see "Updating an existing portfolio" below). If the Person has **no** `headline_stats` and no `interests`, don't ask at all — skip the app silently (leave `show_summary` absent; the conditional blocks strip with zero residue).

Then generate. Show them. Iterate.

## Iteration loop

After first generation, **always ask "What's off?"** Don't ask "do you like it?" — that's a yes/no trap; "what's off" invites correction. It's an inherently narrative question, so per voice-guide rule #6 the options are **example-scaffolds** that spark the user's own answer — no "(recommended)" pick, because there's no right answer to what's bothering them:

> What's off? Pick anything that itches:
> 1. **Voice** — too cold, too warm, too salesy somewhere
> 2. **Featured work** — wrong roles or projects up front
> 3. **Order** — sections or cards in the wrong sequence
> 4. **Length** — too much scroll, or too thin
> 5. **Theme** — light vs. dark default
> 6. **Phrasing** — a specific line in a card reads wrong
>
> Or tell me in your own words.

Update the artifact. Update the CuratedPortfolio in the graph if the curation changed (including a changed `show_summary` decision).

## Show it — then hand over the keys

The portfolio is the payoff. Don't just save a file and move on — **present it.** Preview it the robust way, in this order — stop at the first one that works for the user's environment:

1. **Render it in the viewer — this is the primary path.** Save the file (step 2), then surface its path in the chat as the deliverable so the Claude app's **preview pane renders it inline**. Clicking an HTML path in the chat opens it in the embedded preview — no local server, no macOS permission prompts, no working-directory pitfalls. This is the canonical, most reliable path; reach for it first and you're usually done.
2. **Hand over the file path.** Save to `career-graph/documents/portfolios/portfolio-<slug>-<date>.html` and tell them the exact path in plain words.
3. **Open it in the browser via `file://` — the simple fallback.** If they want the full-browser view (and the cleanest PDF), open the file directly — no server needed: `open "file://<absolute-path>"` (or `open -a "Google Chrome" "<absolute-path>"`) on macOS; `xdg-open "<absolute-path>"` on Linux; `start "" "<absolute-path>"` on Windows. Tell them they can also just double-click the file.
4. **Only if a local server is genuinely required** (rare — a `file://` page can't do something the user specifically needs), **never run `python -m http.server` from a `~/Documents` / `~/Desktop` / `~/Downloads` working directory.** On macOS those folders sit behind the TCC sandbox, and a process Claude spawns can't read them even when Claude itself can — and a pyenv-shimmed `python` will also fail because it calls `getcwd()` on an unreadable directory. Instead, **copy the file into a temp dir, `chdir` there first, then serve with a pinned system Python:**

   ```bash
   TMP="$(mktemp -d)"
   cp "<absolute-path-to-portfolio.html>" "$TMP/portfolio.html"
   cd "$TMP"                     # chdir FIRST so getcwd() never touches a TCC folder
   /usr/bin/python3 -m http.server --bind 127.0.0.1 --directory "$TMP" 8080
   # → http://127.0.0.1:8080/portfolio.html
   ```

   Use `/usr/bin/python3` (the system interpreter), not a bare `python`/`python3` that may be a pyenv shim. Pin `--directory` to the absolute temp path. Never serve from the user's project folder under `~/Documents`.
5. **Point out Share & Save as PDF.** The portfolio carries a **Share** button that opens a small share menu — **Copy link · LinkedIn · X · WhatsApp · Email** (the social links go live once published; Copy keeps its "Copied!" feedback) — and a **Save as PDF** button that exports the **résumé**: a chooser for style (classic / modern / compact), font, and fit, with a **hard readability floor — body text never drops below 10pt**. The portfolio-PDF chooser is gated for the next release — the live page IS the portfolio, and **Cmd+P still prints it natively**. Tell the user plainly: "Save as PDF prints an ATS-clean résumé from this same file — pick a style, font, and fit; it never shrinks body text below 10pt. The page itself is your portfolio: share the link, or Cmd+P to print it." Your last choice is remembered for next time. Name both buttons so the user knows they're there.

## Hand-off — recommend publishing, and own the setup

The moment they like it, lead them to put it online. That's what turns a file on their disk into a link a recruiter can open.

1. Create a Document node (`content_type: "portfolio"`), linked via `UPLOADED` from Person and `INCLUDES_DOCUMENT` from CuratedPortfolio.
2. Recommend publishing — warmly, as the default next step, and **carry the load yourself:**
   > "This is yours. Want me to put it online as your GitHub portfolio — one link you can drop in any application? I'll handle all the setup."
   Route to `hope-publish`. It is built so the user never has to make a technical decision — it sets things up if needed and does the work.
3. If they'd rather wait, respect it — just let them sit with it. Recommend, never coerce.

## Closing the loop — after publish, or when they come back

Once the portfolio is live (or any time the user returns), there's exactly one loop to offer — keep them inside it (numbered per voice-guide rule #6, no "(recommended)" — both paths are equally right depending on where they are):

> Where are we picking up?
> 1. **Update your portfolio** — feature different work, change the angle, edit a card
> 2. **Publish the changes** you've made — I'll push them live
>
> Or tell me in your own words.

- Want to change what's in it? Re-run this skill's iteration loop, then route back to `hope-publish` to push the update.
- Happy with it and just want it online (or re-published after edits)? Route to `hope-publish`.

That's the whole flow: collect their story → show the portfolio → put it online → update or re-publish on demand. Don't point them anywhere outside this loop.

### Updating an existing portfolio

**Regenerating from the user's existing graph against the current bundled template is THE update path** — never patch old HTML in place. New template features (like the Overview app and the published-mode gates) flow into the regenerated file automatically; then re-publishing via `hope-publish` re-stages the file and re-stamps the published flag, so updates stay sustainable release after release. Honor the existing `CuratedPortfolio.show_summary` decision without re-asking. One distinction to keep straight: **the local file is the owner's editable copy — it never carries `data-hope-mode="published"`; the published copy is the one the publish skill stamps read-only.**

## What you do not do

- You do not generate generic portfolios. Every Hope portfolio is curated.
- You do not invent metrics or experiences. Every claim traces to a graph node.
- You do not use stock photos or stock language. The user's actual work is what's interesting.
- You do not exceed 3-screen vertical scroll without explicit user request.
- You do not ship without the theme toggle (light default + dark).
- You do not ship without the structural signatures — interactive section grid, scanline + 32×32 grid texture, and hex KPIs.

This artifact is the one Artemis (Hope's maker) submits and gets interview calls from. It is the proof that Hope works. Hold the bar.
