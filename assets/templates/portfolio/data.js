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

   The portfolio skill substitutes the timeline_data_json slot below with the
   generated timeline array. The template ships the empty-array placeholder
   after the comment slot so this file is valid JS as-is (node --check passes). */
window.HOPE_DATA = {
  "timeline": /* {{timeline_data_json}} */ [],
  "traveler": "dot"
};
