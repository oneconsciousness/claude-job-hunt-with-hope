# JobHunt with Hope

> A free helper for your job hunt. You add it to Claude.

Free · open-source (MIT) · your data stays on your machine · works in Claude Code, Cowork, and claude.ai.

I built Hope while job-hunting. The one thing I've submitted with it — my portfolio — is getting interview calls.

> **v0.1 — early.** Use it. Tell me what's broken.

---

## What Hope is

Claude is an AI assistant. A plugin adds new skills to it. Hope is a plugin for Claude.

Hope helps you with your job hunt. It does not look for job listings. **In v0.1, Hope does one thing well:** it builds your portfolio website and puts it online.

## What you make

A portfolio is a small website about your work. Hope builds one from your own facts. It looks **designed**, not like a form.

Then Hope can put it online. GitHub Pages is a free place to host a small website. Hope publishes your portfolio there, on a page **you own**. You get **one link to share** — in an application, on LinkedIn, in an email.

<!-- IMAGE: portfolio-hero — see tasks/readme-image-prompts/ for the generation prompt -->
<p align="center"><img src="assets/readme/portfolio-hero.png" alt="A finished Hope portfolio website, shown in its light theme and its dark theme side by side" width="720"></p>

<!-- IMAGE: publish-flow — see tasks/readme-image-prompts/ for the generation prompt -->
<p align="center"><img src="assets/readme/publish-flow.png" alt="Three steps left to right: your career.json file, the designed portfolio site, and a web link you own" width="560"></p>

## Who Hope is for

Anyone looking for work. Hope is for job seekers, not recruiters.

## The steps, in v0.1

v0.1 ships one flow: tell Hope about yourself, get a portfolio, put it online.

| Step | What it does | Skill |
|---|---|---|
| Onboarding | Gets to know you and your work | `onboarding` |
| Portfolio | Builds your portfolio website | `portfolio` |
| Publish | Puts it online on a page you own | `publish` |

**Coming in later releases:** weighing roles, tailored resumes, cover letters, applying with care, interview prep, negotiation, deciding, and a dashboard. They're built — they're just not in v0.1 yet.

<!-- IMAGE: journey — see tasks/readme-image-prompts/ for the generation prompt -->
<p align="center"><img src="assets/readme/journey.png" alt="A left-to-right path through the steps — onboarding, discovery, portfolio, publish, resume, cover letter, application, interview, negotiation, decision — with the dashboard as a band across all of them" width="760"></p>

## Your data stays with you

Everything lives in one file on your computer: `career.json`. It holds your facts — your work, skills, and the roles you are chasing.

You own this file. You can open it, move it, back it up, or delete it. **No tracking. Nothing leaves your machine.**

The shape of the file is written down in [`references/career-graph-schema.md`](references/career-graph-schema.md), if you want to look.

<!-- IMAGE: data-stays-home — see tasks/readme-image-prompts/ for the generation prompt -->
<p align="center"><img src="assets/readme/data-stays-home.png" alt="One laptop with a file labeled career.json inside it, and a clear cue that nothing leaves the machine — no cloud, no arrows out" width="420"></p>

## Install

Three ways to get Hope. Pick the one that fits you.

### Cowork (desktop, no terminal) — easiest

1. Open Cowork.
2. Open the plugin browser.
3. Add this repo's URL.
4. Install the `hope` plugin.

### Claude Code (terminal)

```bash
/plugin marketplace add oneconsciousness/claude-job-hunt-with-hope
/plugin install hope@hope
```

### claude.ai (web)

1. Download the skill zip from Releases.
2. Open `Settings → Capabilities → Skills`.
3. Upload the zip.
4. Turn the skill on.

> While the repo is private, the terminal install works for the owner (Claude Code uses your GitHub login). The public marketplace name is set at launch.

## Start

Type: **start my job hunt with Hope.**

Hope asks about you first. Share your resume and it reads that instead.

## Works with your other tools

You can install Hope next to other plugins. They run side by side and do not clash, because each skill has its own name.

A good pair is **career-ops**: **career-ops finds jobs; Hope helps you apply well.**

career-ops: <https://github.com/santifer/career-ops>

<!-- IMAGE: works-with-career-ops — see tasks/readme-image-prompts/ for the generation prompt -->
<p align="center"><img src="assets/readme/works-with-career-ops.png" alt="Two lanes side by side — career-ops finds jobs, Hope helps you apply — running together, not competing" width="560"></p>

## The look

Every page Hope makes shares one design. There is a light theme and a dark theme, with a switch on each page. The look is the same in both.

The design is written down in [`references/design-tokens.md`](references/design-tokens.md).

## The voice

Hope writes plainly and honestly. It does not hype you up or promise outcomes. More on this in [`references/voice-guide.md`](references/voice-guide.md).

## What you need

Hope is free. To use it, you need access to Claude — a paid Claude plan or API billing.

## License

MIT. See [`LICENSE`](LICENSE). Free to use, change, and share.

Hope stands on the work of others. See [`CREDITS.md`](CREDITS.md).

If you need work, install it and start.
