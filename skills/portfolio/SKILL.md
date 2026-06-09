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

A **single self-contained HTML file** at `career-graph/documents/portfolios/portfolio-<slug>-<date>.html`. The HTML uses Hope's design tokens — light by default (warm cream + orange), with a dark theme via the toggle and the same layout across both — embeds all CSS inline, generates inline SVG for any graphics, and works opened in any browser with no network connection required.

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

Use the bundled HTML template as the starting structure — load it from the plugin root you resolved above:

```bash
cat "$PLUGIN_ROOT/assets/templates/portfolio.html"
```

Replace placeholders with content from the graph. **Do not deviate from the design tokens** in `$PLUGIN_ROOT/references/design-tokens.md` (loaded above).

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

If the user named a specific file ("use `~/Pictures/jane.jpg`"), use that path instead. If you find more than one candidate, ask which to use rather than guessing.

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

**Before saving the user's file, clean the output:**
- **Strip the template-authoring comment** — the `<!-- Hope portfolio template · v0.4 … See skills/portfolio/SKILL.md for the substitution contract -->` block. It documents the template for *you*; it must not ship in the user's portfolio (it also contains a literal `{{single_tokens}}` that fails a "no unsubstituted tokens" check). Keep the disclosed provenance comments (share-url, generator) — those are intentional.
- **Verify zero unsubstituted placeholders remain** — grep the output for `{{` and `<!-- HOPE:`. If any survive, the substitution is incomplete; fix before saving. Never hand the user a file with raw template tokens.

## Provenance & attribution

Every Hope portfolio carries one **visible** credit — never hidden, never enforced:

- A **"Generated with Hope"** footer linking to the project.
- A `<meta name="generator">` tag and a schema.org **ProfilePage** JSON-LD block in `<head>` — machine-readable so recruiters, ATS, and search can read the portfolio (this serves the user's discoverability, not Hope). Escape `{{name}}` / `{{headline}}` for valid JSON; keep `{{generation_date}}` as an ISO date.

There is **no hidden marker, no signature, no telemetry, nothing that phones home** — Hope is a free gift, given in good faith. The footer is the whole attribution story. Because it's the user's file under MIT, they *can* remove it — but the template asks them, warmly, to keep it so the next person finds Hope too. If a user asks to remove it, help them; don't lecture. Trust is the point.

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
5. **Point out Share & Save as PDF.** The portfolio carries a **Share** button (copies the live link — active once published) and a **Save as PDF** button (opens the browser's print dialog → "Save as PDF"). Name them so the user knows they're there.

## Hand-off — recommend publishing, and own the setup

The moment they like it, lead them to put it online. That's what turns a file on their disk into a link a recruiter can open.

1. Create a Document node (`content_type: "portfolio"`), linked via `UPLOADED` from Person and `INCLUDES_DOCUMENT` from CuratedPortfolio.
2. Recommend publishing — warmly, as the default next step, and **carry the load yourself:**
   > "This is yours. Want me to put it online as your GitHub portfolio — one link you can drop in any application? I'll handle all the setup."
   Route to `hope-publish`. It is built so the user never has to make a technical decision — it sets things up if needed and does the work.
3. If they'd rather wait, respect it — just let them sit with it. Recommend, never coerce.

## Closing the loop — after publish, or when they come back

Once the portfolio is live (or any time the user returns), there's exactly one loop to offer — keep them inside it:

> "Want to **update your portfolio** — feature different work, change the angle, edit a card — or **publish the changes** you've made? I can do either."

- Want to change what's in it? Re-run this skill's iteration loop, then route back to `hope-publish` to push the update.
- Happy with it and just want it online (or re-published after edits)? Route to `hope-publish`.

That's the whole flow: collect their story → show the portfolio → put it online → update or re-publish on demand. Don't point them anywhere outside this loop.

## What you do not do

- You do not generate generic portfolios. Every Hope portfolio is curated.
- You do not invent metrics or experiences. Every claim traces to a graph node.
- You do not use stock photos or stock language. The user's actual work is what's interesting.
- You do not exceed 3-screen vertical scroll without explicit user request.
- You do not ship without the theme toggle (light default + dark).
- You do not ship without the structural signatures — interactive section grid, scanline + 32×32 grid texture, and hex KPIs.

This artifact is the one Artemis (Hope's maker) submits and gets interview calls from. It is the proof that Hope works. Hold the bar.
