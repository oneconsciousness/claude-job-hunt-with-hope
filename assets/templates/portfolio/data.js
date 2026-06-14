/* data.js — the chronological dataset the Throughline reads. ONE global,
   classic script — no type=module, no fetch(), no import (file:// law,
   references/design-tokens.md § "Modular structure"). index.html loads this
   BEFORE portfolio.js, so window.HOPE_DATA exists when the script runs.

   AUTHORING CONTRACT (generator side: skills/portfolio/SKILL.md):

   window.HOPE_DATA.timeline — ordered array, one entry per Experience /
   Education / Project / Certification, each:
     {
       id:         string — unique slug; the entry's card in index.html
                   carries the matching stable anchor id="tl-<id>"
       type:       "experience" | "education" | "project" | "certification"
       date_start: "YYYY-MM"
       date_end:   "YYYY-MM" | null            (null = ongoing)
       label:      short phrase, ≤40 chars (e.g. "Lead AI Engineer @ EY") —
                   never a sentence
       org:        string | null
       domain:     string | null               (favicon lookup)
       metric:     string | null               (one short line)
       skills:     [string]                    (≤4)
       pane:       "experience" | "education" | "projects" | "certifications"
                   — the section pane holding the entry's card
       anchor:     the DOM id of the target card in index.html ("tl-<id>")
     }

   window.HOPE_DATA.traveler — the playhead glyph:
     "dot"               default — the soft orange glow dot
     "<slug>"            one of assets/icons/travelers/ (paper-plane, car,
                         train, sailboat, bicycle, rocket, footprints)
     { inline: "<svg…>" } a custom/found traveler, inlined by the generator

   window.HOPE_DATA.social — OPTIONAL (present only when the Social Feed app is
   added; omit the key entirely otherwise). Array, one entry per featured post:
     {
       platform: "youtube" | "vimeo" | "spotify" | "soundcloud" | "applemusic" |
                 "figma" | "codepen" | "loom" | "bluesky" | "linkedin" |
                 "substack" | "flickr" | "tiktok" | "instagram" | "x" |
                 "threads" | "pinterest" | "dribbble" | "behance" | "medium" |
                 "gist" | "link"      ("link" = generic link card, any URL)
       url:      string — the public permalink; the renderer derives the embed
       title:    string | null — label for the always-present "View on …" link
       caption:  string | null — one short line shown above the embed
       pinned:   boolean        — reserved (surface in Overview); optional
     }
   portfolio.js renders these into #social-grid: a live embed where the platform
   supports it, ALWAYS with a "View on …" link as the fallback — embeds need the
   published https site + a connection, so offline / file:// shows the link only.
   Social posts are NOT career events: they carry no tl- id and never appear on
   the Throughline.

   The portfolio skill substitutes the timeline_data_json slot below with the
   generated timeline array. The template ships the empty-array placeholder
   after the comment slot so this file is valid JS as-is (node --check passes). */
window.HOPE_DATA = {
  "timeline": /* {{timeline_data_json}} */ [],
  "traveler": "dot",
  "social": /* {{social_data_json}} */ []
};
