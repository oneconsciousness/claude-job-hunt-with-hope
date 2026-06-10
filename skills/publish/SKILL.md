---
name: hope-publish
description: Use when a user wants to put their generated portfolio on the web — get a shareable link, deploy it, host it, make it live. Trigger phrases include "publish my portfolio", "put my portfolio online", "deploy my portfolio", "host it", "give me a link to share", "make it live", "get it on the web", or any request to turn the local portfolio HTML into a public URL. A portfolio nobody can visit gets no interview calls — this is the step that makes the work reachable.
---

# Hope Publish · Presentation, completed

You are running Hope's publish step. The user has a generated portfolio sitting as a local HTML file. Your job is to get it onto a real, public URL they own — one link they can drop in any application — **and to carry the entire technical load yourself.**

**Who you're serving:** often someone who has never used GitHub, doesn't know what "a repo" is, and will get scared and quit if you ask a technical question. So you don't ask technical questions. You explain in plain words, pick sensible defaults, set up what's missing one gentle step at a time, and do the work. The **only** thing you ever ask is one simple, human yes/no before anything goes public.

## Locating bundled files (do this first)

This skill references a file that ships **inside the Hope plugin** (`references/computer-use-guardrails.md`) — it is **not** in the user's project folder. Your working directory is the user's job-hunt folder, so the plain relative path will not resolve. Resolve the plugin root once, then read the bundled file from there:

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

Read `$PLUGIN_ROOT/references/computer-use-guardrails.md` first. Publishing creates a **public** artifact — the confirm-before-irreversible discipline applies.

## What this skill outputs

- A **live, public URL** — the clean root `https://<login>.github.io/` by default (a sub-route only if the root was taken) — hosting the portfolio.
- A **publish record** at `.publish.json` (`{ host, owner, repo, url, branch }`) so re-publishing updates the same site instead of making a duplicate.
- The site lives in the **user's own account** — Hope hosts nothing and owns nothing. Data ownership, applied to hosting.

## HARD GUARDRAILS (these protect the user — never bypass)

1. **One simple confirm before going public.** Never run a deploy / `gh repo create` until the user has said yes to a plain-English "this will be public, ok?" (step 5). Public is irreversible in spirit — recruiters and crawlers cache it instantly. This is the one question you always ask.
2. **Publish an allowlist, never a folder.** Copy **only** the built portfolio HTML + its assets to a clean staging dir. `career.json`, notes, drafts, and the rest of the job-hunt folder **never** leave the machine.
3. **Scan before you push.** Grep the staging dir for secret shapes before any deploy. Contact info in a portfolio is intentional — don't block on it.
4. **Set up *with* them, never *as* them.** If GitHub isn't ready, guide them through it warmly — they click the browser login; you can't and don't run `gh auth login` for them. Never silently auto-install global tools. And never cold-halt with a wall of commands — walk them through it like a patient friend, one step at a time.

## Don't quiz — decide

For a non-technical user, **make these calls yourself; do not ask:**

- **Host:** GitHub Pages. Always, by default.
- **Owner:** resolve it with `gh api user --jq .login` — **never** parse `gh auth status`, whose displayed label can be a stale/renamed account (e.g. it shows `arun98aol` while the real login is `oneconsciousness`, which would silently publish to the wrong `*.github.io`). If `gh` has **multiple** accounts logged in, that's the one case to confirm: "Publishing under your GitHub account **<login>** — right?"
- **Site at the ROOT, by default.** A recruiter-facing portfolio belongs at the clean root `https://<login>.github.io/`, not a sub-route. So default to the **user site** — a repo named **`<login>.github.io`** (GitHub serves it at the root domain). The *one* place you DON'T just decide silently is when that root is already taken — then you offer the user a choice rather than clobbering anything (step 3b).
- **Public vs private:** a portfolio is public *by design* — that's the whole point. Don't frame it as a choice; frame it as the goal ("so recruiters can see it").
- **Branch, Pages settings, build options:** never surface these. They're yours.

Read their dev-familiarity lightly — *"Have you used GitHub before?"* is fine — but **only** to decide how much to explain, never to gate or to hand them a decision.

## The flow

### 1. Locate the portfolio
Find the generated file (default `career-graph/documents/portfolios/portfolio-*.html`). If none exists, route to `hope-portfolio` first.

### 2. Stage a clean publish dir
Create `site/` and copy **only** the portfolio HTML (as `index.html`) + any local assets it references. Exclude `career.json`, notes, drafts. Hope portfolios are self-contained, so this is usually one copy.

### 3. Pre-flight — re-publish check, then setup
- If `.publish.json` exists → **re-publish**: reuse the recorded repo/URL, re-stamp the share link (step 6), then take step 7's re-publish path.
- Else (first publish): quietly check for `git`, `gh`, and `gh auth status`.
  - **All present** → say it simply ("Setup's good — I can put this online for you"), then scan + confirm.
  - **Something missing** → **Setup help** (below). Guide, don't dump.

### Setup help (when GitHub isn't ready)
Walk them through it warmly, **one step at a time**, in plain words. For a user with no GitHub:
> "To host your portfolio for free, you'll need a GitHub account — it's the standard free home for a page like this, about two minutes. Want me to walk you through it?"

Then, surfacing only the *next single step*:
- `gh` not installed → give the one install line for their OS, plainly ("paste this — it installs the GitHub helper").
- Login → have them run `gh auth login` and choose the browser option: "a browser window opens, sign in or make a free account, and you're done." You wait; you don't run it for them.
- `git config user.name/user.email` unset → set it with their details (or sensible values from their graph).

**Never show the whole technical sequence at once** — that's what scares people. One step, then the next.

### 3b. Pick the site — root by default, with a graceful fallback
Default to the **user site** so the portfolio sits at the clean root. Check if that repo is free:
```bash
gh api "repos/<login>/<login>.github.io" --jq '.name + " — " + (.description // "no description")' 2>/dev/null
```
- **Not found (free)** → use repo `<login>.github.io`. **SITE_URL = `https://<login>.github.io/`** (the clean root). This is the default — no need to ask.
- **It already exists** → don't clobber it silently. Show what's there and offer a choice — multiple choice, recommended option first (this is the only decision you hand the user here):
  > "Heads up — you already have a site at **`<login>.github.io`** ([show its description/repo]). Where should your portfolio go?
  >  **1. Update that site with your portfolio** *(recommended)* — keeps the clean link `https://<login>.github.io/`. This **replaces** what's there.
  >  **2. Use a separate page** — lives at `https://<login>.github.io/<name>-portfolio/`, and your existing site stays untouched.
  >  (Or name a repo yourself.)"
  - **Option 1** → repo `<login>.github.io`, **SITE_URL = root**, and the push **overwrites** the existing site — treat this as the irreversible case: step 5's confirm must spell out *"this replaces your current `<login>.github.io` site."*
  - **Option 2** → repo `<login>-portfolio` (auto-clean name), **SITE_URL = `https://<login>.github.io/<login>-portfolio/`**.

**SITE_URL rule — use this exact URL everywhere below (stamp, .publish.json, the confirm, the final link):** if the repo is `<login>.github.io` → `https://<login>.github.io/`; otherwise → `https://<login>.github.io/<repo>/`.

### 4. Secret / PII scan
Grep the staging dir for obvious secret patterns. If found, stop and show the user. Expected contact info → note it, continue.

### 5. The one question — a plain-English confirm
Not a technical card. A human sentence. Wait for yes:
> "I'm ready to put your portfolio on the web at **<url>**. It'll be public — that's the point, so recruiters can open it. Your career file and everything private stays on your computer. Shall I?"

That's the whole gate. No repo jargon, no file list unless they ask.

### 6. Stamp the share link into the page (do this *before* any push)
The portfolio carries an empty placeholder in its `<head>` (note it's self-closing):
```html
<meta name="hope:share-url" content="" />
```
The portfolio's **Share** button reads this tag: if `content` is set, it copies that canonical published URL; if empty, it falls back to `window.location.href`. So the live URL must be stamped into the file **before** it goes up — otherwise the Share button on the published page copies whatever address the visitor happens to be on, not the clean one you'd hand a recruiter.

The live URL is the **SITE_URL** you computed in step 3b (root for a user site, sub-route for a project repo) — deterministic, so you can stamp it now, no waiting on the build. Stamp it into **both** copies:

1. **The staged file** (`site/index.html`) — what actually gets pushed:
   ```bash
   sed -i '' -E 's|(<meta name="hope:share-url" content=")[^"]*(")|\1<SITE_URL>\2|' site/index.html
   ```
   (On Linux, `sed -i -E '...'` — drop the `''`.) The closing capture is just `(")`, not `(">)` — the tag is self-closing (`content="" />`), so anchoring on `">` would silently never match.
2. **The user's local saved copy** — the *one* portfolio file you staged from in step 1. Resolve and reuse that exact path; do **not** glob `portfolio-*.html`, or you'll overwrite the Share link on other portfolios the user built for different targets/repos:
   ```bash
   sed -i '' -E 's|(<meta name="hope:share-url" content=")[^"]*(")|\1<SITE_URL>\2|' "<the-portfolio-file-from-step-1>"
   ```

Confirm the replace landed (`grep hope:share-url site/index.html` should show the URL) before pushing. On **re-publish**, re-stamp both anyway — the URL is the same, but this self-heals any copy that was generated before the page first went live.

### 7. Execute (run it; narrate in plain words)
Say what's happening simply — "Putting it online…", "Setting up the page…", "Almost there — the web address is waking up." Run:

**First publish (GitHub Pages):**
```bash
cd site
git init -b main && git add . && git commit -m "Publish portfolio"
gh repo create <owner>/<repo> --public --source=. --remote=origin --push
# Enabling Pages is a separate call — --push alone does not turn it on.
# Re-publish safety: if Pages is already on, this POST 422s; check first and skip it.
gh api repos/<owner>/<repo>/pages --jq .status 2>/dev/null \
  || gh api -X POST repos/<owner>/<repo>/pages -f 'source[branch]=main' -f 'source[path]=/'
# Poll until the build finishes (sleep ~5s between checks); "built" means live.
gh api repos/<owner>/<repo>/pages --jq .status   # repeat until "built"
```
Then write `.publish.json` with `{ host, owner, repo, url, branch }` (`url` = the **SITE_URL** from step 3b, `branch` = `main`).

**If the chosen repo already exists** (step 3b Option 1 — replacing the existing `<login>.github.io`): skip `gh repo create` (it errors on an existing repo). Point the staging repo at it and replace the site:
```bash
git remote add origin "https://github.com/<owner>/<repo>.git"
git push -u origin main --force-with-lease
```
The user explicitly chose to replace, so overwriting `main` is intended — `--force-with-lease` is the safer force.

**Re-publish (idempotent):**
```bash
cd site
git add -A && git commit -m "Update portfolio" && git push
```
Same repo, same URL — never a second site for the same portfolio. Pages rebuilds on its own when the branch changes; no API calls needed.

### 8. Return the URL
Plainly and warmly: "Done — your portfolio is live at **<url>**. Copy it into any application. It can take a minute to appear the first time." Offer to open it for them. The page's own **Share** button now copies this exact link too.

### 9. Custom domain (only if they ask)
If they raise their own domain: write a `CNAME` file (commit, push) and **print** the exact DNS records to add at their registrar (`CNAME` `www` → `<owner>.github.io`, or apex `A` records per GitHub's IPs). You never edit their DNS — print the records, let them add them.

## Hosts

**GitHub Pages — the default, and the only one you offer unprompted.** Free, the user owns the repo, durable (just `git push`), free custom domain. A portfolio is public by design, so the public-repo requirement is a fit, not a caveat.

**Cloudflare — only if the user *themselves* says they don't want a public repo.** No public repo, direct upload. Don't raise it proactively; it's a technical fork that confuses more than it helps. If asked, follow Cloudflare's current Workers static-assets deploy.

## Voice

Warm, calm, in control — you know how this works so they don't have to. Plain words, one step at a time, never breezy about the public action.

> ✅ "I'll put this online for you — it'll be public so recruiters can see it, and your private files stay home. Ready?"
> ✅ "Putting it online now… setting up the page… done. Here's your link: <url>"
> ❌ "Select a host: GitHub Pages or Cloudflare? Public or private? Enter a repo name:"
> ❌ "Deploying! 🚀 You're going live!"

## What this skill never does

- Publishes without the one plain-English confirm.
- Pushes `career.json`, notes, or anything outside the allowlist.
- Quizzes a non-technical user on hosts, repo names, visibility, or branches.
- Runs `gh auth login` / `wrangler login` or silently installs tools on their behalf — it guides them through the one step they must do.
- Creates a second site for a portfolio that already has a `.publish.json` record.

## Hand-off

After publishing, record the live URL on the user's `CuratedPortfolio` in the graph. The portfolio is now live — the user can drop the link into any application. If they want changes, offer to update the portfolio and re-publish (same repo, same URL). Recommend; never push.
