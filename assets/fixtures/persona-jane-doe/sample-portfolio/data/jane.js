/* data/jane.js — demo-persona registry entry: Jane Doe (the DEFAULT persona).
   Sample-only: the production template folder (assets/templates/portfolio/)
   carries data.js / window.HOPE_DATA instead; this sample's data/ folder is
   the persona-switching counterpart for the demo-controls panel.

   AUTHORING CONTRACT (stated once here; data/<other>.js cite this file):

   Each data/<persona>.js is a CLASSIC script — no type=module, no fetch(),
   no import (file:// law, references/design-tokens.md § "Modular structure").
   It registers exactly one entry, order-independently:

     window.HOPE_PERSONAS = window.HOPE_PERSONAS || {};
     window.HOPE_PERSONAS['<id>'] = { … };

   where <id> matches the data-persona attribute on the persona's markup in
   index.html AND the persona-btn that selects it. Fields (all required):
     roles      max Experience cards the persona ships   (slider ceiling)
     skills     max skill cells                          (slider ceiling)
     projects   max project cards                        (segmented ceiling)
     certs      max certification cards                  (segmented ceiling)
     edu        max education cards                      (segmented ceiling)
     career     career length in years                   (career segmented)
     industries      ordered slugs matching the persona's
                     data-industry attributes in index.html
     industryLabels  slug → human label for the rebuilt industry tag group

   Switching personas resets the demo-controls filters to these defaults so
   no slider dangles past the persona's data. Persona CONTENT (cards, skills,
   stats) is NOT here — it lives in index.html markup tagged data-persona;
   portfolio.js toggles data-persona-hidden from these ids. */
window.HOPE_PERSONAS = window.HOPE_PERSONAS || {};
window.HOPE_PERSONAS.jane = {
  roles: 5, skills: 100, projects: 6, certs: 5, edu: 3, career: 9,
  industries: ['saas', 'devtools', 'payments', 'brand', 'academic'],
  industryLabels: { saas: 'SaaS', devtools: 'Dev tools', payments: 'Payments', brand: 'Brand studio', academic: 'Academic' }
};

/* THE THROUGHLINE (sample side) — window.HOPE_DATA, stated once HERE.
   In the template folder this global lives in data.js, filled through the
   {{timeline_data_json}} slot; the entry-field + traveler contract is the
   authoring comment there (assets/templates/portfolio/data.js) — cited, not
   restated. In this multi-persona sample the Throughline ships for JANE
   ONLY: she is the default persona, her identity card carries the
   #throughline strip, and the strip hides with her card on persona switch —
   the other data/<persona>.js files document the omission by citing this
   block. Each entry's `anchor` resolves to a stable id="tl-<id>" on the
   matching card in index.html.
   The list is CURATED, not exhaustive (generator behavior — label rules and
   curation live in skills/portfolio/SKILL.md): dateless cards (e.g. the
   Frontify "Design System Auditor" cert) and near-coincident minor entries
   are left off; cards stay in the panes either way.
   Traveler: "paper-plane" — a deliberate non-default pick for Jane (she's a
   designer; the calm glow dot stays the default). The choice is made in
   chat at generation time and persisted as CuratedPortfolio.timeline_traveler;
   the artifact only renders it. */
window.HOPE_DATA = {
  timeline: [
    { id: 'risd-bfa', type: 'education', date_start: '2013-09', date_end: '2017-05',
      label: 'BFA Graphic Design @ RISD', org: 'Rhode Island School of Design',
      domain: 'risd.edu', metric: 'GPA 3.94',
      skills: ['typography', 'illustration'],
      pane: 'education', anchor: 'tl-risd-bfa' },
    { id: 'risd-studio', type: 'experience', date_start: '2015-09', date_end: '2017-05',
      label: 'Studio Assistant @ RISD Type Studio', org: 'RISD Type Studio',
      domain: 'risd.edu', metric: '142 letterforms digitised',
      skills: ['letterform conservation', 'typography', 'information architecture'],
      pane: 'experience', anchor: 'tl-risd-studio' },
    { id: 'letterform-db', type: 'project', date_start: '2016-09', date_end: '2017-05',
      label: 'Letterform Conservation Database', org: 'RISD Type Studio',
      domain: 'risd.edu', metric: '142 letterforms digitised',
      skills: ['letterform conservation', 'html/css', 'interaction design'],
      pane: 'projects', anchor: 'tl-letterform-db' },
    { id: 'pentagram-studio', type: 'experience', date_start: '2017-06', date_end: '2017-08',
      label: 'Junior Designer @ Pentagram', org: 'Pentagram',
      domain: 'pentagram.com', metric: null,
      skills: ['brand identity', 'illustration', 'typography'],
      pane: 'experience', anchor: 'tl-pentagram-studio' },
    { id: 'stripe', type: 'experience', date_start: '2017-07', date_end: '2019-02',
      label: 'Associate Product Designer @ Stripe', org: 'Stripe',
      domain: 'stripe.com', metric: '-38% pricing support tickets',
      skills: ['user research', 'stakeholder management', 'mentorship', 'typography'],
      pane: 'experience', anchor: 'tl-stripe' },
    { id: 'cert-type-cooper', type: 'certification', date_start: '2018-02', date_end: '2018-02',
      label: 'Type Design Intro · Type@Cooper', org: 'Type@Cooper · The Cooper Union',
      domain: 'cooper.edu', metric: null,
      skills: ['typography'],
      pane: 'certifications', anchor: 'tl-cert-type-cooper' },
    { id: 'linear', type: 'experience', date_start: '2019-03', date_end: '2022-08',
      label: 'Product Designer @ Linear', org: 'Linear',
      domain: 'linear.app', metric: '+18% power-user retention',
      skills: ['interaction design', 'enterprise ux', 'typography', 'html/css'],
      pane: 'experience', anchor: 'tl-linear' },
    { id: 'stanford-hci', type: 'education', date_start: '2019-09', date_end: '2020-06',
      label: 'HCI Certificate @ Stanford', org: 'Stanford Continuing Studies',
      domain: 'stanford.edu', metric: null,
      skills: ['user research', 'interaction design'],
      pane: 'education', anchor: 'tl-stanford-hci' },
    { id: 'pentagram-intensive', type: 'education', date_start: '2021-03', date_end: '2021-03',
      label: 'Brand Identity Intensive @ Pentagram', org: 'Pentagram',
      domain: 'pentagram.com', metric: null,
      skills: ['brand identity'],
      pane: 'education', anchor: 'tl-pentagram-intensive' },
    { id: 'type-walks', type: 'project', date_start: '2022-04', date_end: null,
      label: 'Brooklyn Type Walking Tours', org: 'Community · Founder & Guide',
      domain: null, metric: '200+ walkers across 18 tours',
      skills: ['typography'],
      pane: 'projects', anchor: 'tl-type-walks' },
    { id: 'figma', type: 'experience', date_start: '2022-09', date_end: null,
      label: 'Senior Product Designer @ Figma', org: 'Figma',
      domain: 'figma.com', metric: '37% design-system adoption',
      skills: ['design systems', 'design tokens', 'component architecture', 'typography'],
      pane: 'experience', anchor: 'tl-figma' },
    { id: 'type-specimen', type: 'project', date_start: '2023-03', date_end: null,
      label: 'Type Specimen · open source', org: 'Open Source · Lead Maintainer',
      domain: 'github.com', metric: '1.2k GitHub stars',
      skills: ['typography', 'JavaScript', 'html/css', 'mentorship'],
      pane: 'projects', anchor: 'tl-type-specimen' },
    { id: 'cert-cooper-leadership', type: 'certification', date_start: '2023-06', date_end: '2023-06',
      label: 'Design Leadership Cert @ Cooper', org: 'Cooper',
      domain: null, metric: null,
      skills: ['mentorship', 'stakeholder management'],
      pane: 'certifications', anchor: 'tl-cert-cooper-leadership' },
    { id: 'typebook', type: 'project', date_start: '2023-08', date_end: '2024-04',
      label: 'Typebook · self-published', org: 'Self-published · Author + Designer',
      domain: null, metric: '2,400+ copies sold',
      skills: ['editorial design', 'typography', 'brand identity'],
      pane: 'projects', anchor: 'tl-typebook' },
    { id: 'cert-deque', type: 'certification', date_start: '2024-01', date_end: '2024-01',
      label: 'Color & Contrast Practitioner', org: 'Deque University',
      domain: 'dequeuniversity.com', metric: null,
      skills: ['accessible UX (WCAG)'],
      pane: 'certifications', anchor: 'tl-cert-deque' }
  ],
  traveler: 'paper-plane',
  // Social Feed (sample). Jane is a designer → Dribbble/Behance link cards +
  // a couple of live video embeds + her site. Embeds render on the published
  // https site; offline each post falls back to its "View on …" link.
  social: [
    { platform: 'dribbble', url: 'https://dribbble.com/janedoe', title: 'View on Dribbble', caption: 'Recent UI shots & explorations' },
    { platform: 'behance', url: 'https://www.behance.net/janedoe', title: 'View on Behance', caption: 'Full case studies' },
    { platform: 'vimeo', url: 'https://vimeo.com/76979871', caption: 'Prototype & motion showreel' },
    { platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', caption: 'Config 2024 — type systems at scale' },
    { platform: 'link', url: 'https://janedoe.design', title: 'janedoe.design', caption: 'Personal portfolio site' }
  ]
};
