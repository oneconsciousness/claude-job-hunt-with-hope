(function() {
  // PUBLISHED-MODE CONTRACT (see the matching CSS block by the same title):
  // a published copy carries data-hope-mode="published" on <html>; the local
  // generated file never does. Every EDITING affordance below checks this
  // flag; visitor FEATURES (theme toggle, Share, Save-as-PDF, section
  // navigation, card expansion) deliberately do not.
  var isPublished = document.documentElement.dataset.hopeMode === 'published';
  const STORAGE_KEY = 'hope-portfolio-theme';
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }
  let savedTheme = 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') savedTheme = stored;
  } catch (e) {}
  applyTheme(savedTheme);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  // Share — #share-btn opens the #share-menu popover.
  // Items: Copy link · LinkedIn · X · WhatsApp · Email. Canonical URL: the
  // <meta name="hope:share-url"> content, which the publish skill rewrites to
  // the live GitHub Pages URL. Empty (un-published) → window.location.href.
  var shareBtn = document.getElementById('share-btn');
  var shareMenu = document.getElementById('share-menu');
  var shareLabel = shareBtn ? shareBtn.querySelector('span') : null;
  if (shareLabel) shareLabel.dataset.idle = shareLabel.textContent;
  var flash = function (text, ok) {
    if (shareLabel) shareLabel.textContent = text;
    if (ok) shareBtn.classList.add('copied');
    setTimeout(function () {
      if (shareLabel) shareLabel.textContent = shareLabel.dataset.idle;
      shareBtn.classList.remove('copied');
    }, 1600);
  };
  var getCanonicalUrl = function () {
    var meta = document.querySelector('meta[name="hope:share-url"]');
    return meta && meta.content ? meta.content.trim() : '';
  };
  var getShareUrl = function () { return getCanonicalUrl() || window.location.href; };
  // A share only works when it points at a public URL. Before publishing, the
  // page is opened from disk (file://) or a local preview server (localhost) and
  // the canonical meta is still empty — sharing that gives a dead/empty card on
  // LinkedIn / X / WhatsApp / email. Every share target gates on this.
  var canShare = function () {
    if (getCanonicalUrl()) return true; // publish stamped a real URL
    var u = window.location.href;
    if (u.indexOf('file:') === 0) return false;
    return !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(u);
  };
  var getName = function () {
    var el = document.querySelector('h1.name');
    return el ? el.textContent.trim() : '';
  };
  var getShareText = function () {
    var el = document.querySelector('.headline');
    var headline = el ? el.textContent.trim() : '';
    return headline ? getName() + ' — ' + headline : getName();
  };
  var copyFallback = function (url) {
    // Non-secure context (file://, http) — navigator.clipboard is undefined there.
    // document.execCommand('copy') is deprecated but the only path that works.
    try {
      var ta = document.createElement('textarea');
      ta.value = url; ta.setAttribute('readonly', '');
      ta.style.position = 'absolute'; ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, url.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      flash(ok ? 'Copied!' : 'Copy: ' + url, ok);
    } catch (e) { flash('Copy: ' + url, false); }
  };
  var copyShareUrl = function () {
    var canonical = getCanonicalUrl();
    var url = canonical || window.location.href;
    // No published link yet (opened from disk or a local preview server) →
    // don't leak the local path; tell them to publish first.
    if (!canShare()) { flash('Publish first to share a link', false); return; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(
        function () { flash('Copied!', true); },
        function () { copyFallback(url); }
      );
      return;
    }
    copyFallback(url);
  };
  var closeShareMenu = function () {
    if (shareMenu && !shareMenu.hidden) {
      shareMenu.hidden = true;
      if (shareBtn) shareBtn.setAttribute('aria-expanded', 'false');
    }
  };
  if (shareBtn && shareMenu) {
    shareBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (shareMenu.hidden) {
        shareMenu.hidden = false;
        shareBtn.setAttribute('aria-expanded', 'true');
      } else {
        closeShareMenu();
      }
    });
    shareMenu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-share]');
      if (!item) return;
      var action = item.getAttribute('data-share');
      closeShareMenu();
      if (action === 'copy') { copyShareUrl(); return; }
      // Same guard as copy: never open a social share pointing at a local/preview URL.
      if (!canShare()) { flash('Publish first to share a link', false); return; }
      var url = getShareUrl();
      var text = getShareText();
      var href = '';
      if (action === 'linkedin') {
        href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
      } else if (action === 'x') {
        href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
      } else if (action === 'whatsapp') {
        href = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url);
      } else if (action === 'email') {
        // %0D%0A%0D%0A = RFC 6068 blank line between the text and the link.
        href = 'mailto:?subject=' + encodeURIComponent(getName() + ' — Portfolio') +
               '&body=' + encodeURIComponent(text) + '%0D%0A%0D%0A' + encodeURIComponent(url);
      }
      if (href) window.open(href, '_blank', 'noopener');
    });
    document.addEventListener('click', function (e) {
      if (!shareMenu.hidden && !e.target.closest('.share-wrap')) closeShareMenu();
    });
  }
  // Save as PDF — #pdf-btn opens the #export-modal chooser. THIS RELEASE the
  // export is RESUME-ONLY: the dialog picks style + font + fit, "Save as PDF"
  // sets body.print-doc-resume + .print-style-<style>, applies the chosen
  // family via --resume-font on #resume-view, optionally runs floor-aware
  // auto-fit (--rfs), closes the modal and calls window.print(); 'afterprint'
  // tears it all down (classes, --rfs, --resume-font, width pin). The last
  // choice persists in localStorage ('hope-resume-pref') and is preselected
  // next time. The default no-class browser print (Cmd+P) still prints the
  // paginated classic portfolio — the browser's native path, untouched.
  var pdfBtn = document.getElementById('pdf-btn');
  var exportModal = document.getElementById('export-modal');
  var resumeView = document.getElementById('resume-view');

  // ── READABILITY FLOOR — recruiters reject smaller. Hard constraints:
  // body text never below 10pt; line-height never below 1.2 (encoded in the
  // resume style blocks — auto-fit never touches leading); page margins never
  // below 0.5in (the @page rule already sits at the floor).
  var RESUME_MIN_BODY_PT = 10;
  var RESUME_MIN_LEADING = 1.2;
  // Per-style base body size in pt. Auto-fit's floor scale is
  // RESUME_MIN_BODY_PT / base: classic → 0.909, modern → 0.952,
  // compact → 1.0 (compact never shrinks — it already sits at the floor).
  var RESUME_BASE_PT = { classic: 11, modern: 10.5, compact: 10 };

  var RESUME_PREF_KEY = 'hope-resume-pref';
  var RESUME_STYLES = ['classic', 'modern', 'compact'];
  var RESUME_FONTS = ['georgia', 'times', 'inter'];
  var RESUME_FITS = ['comfortable', 'auto'];
  // ATS-safe system families only — no decorative faces, no icon fonts.
  var RESUME_FONT_STACKS = {
    georgia: "Georgia, 'Times New Roman', serif",
    times: "'Times New Roman', Times, serif",
    inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };
  var RESUME_DEFAULT_FONT = { classic: 'georgia', modern: 'inter', compact: 'inter' };
  // {style, font, fit} — validated field-by-field; anything unexpected falls
  // back to the defaults (font's default depends on the resolved style).
  var readResumePref = function () {
    var pref = { style: 'classic', font: '', fit: 'comfortable' };
    try {
      var raw = localStorage.getItem(RESUME_PREF_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && RESUME_STYLES.indexOf(p.style) !== -1) pref.style = p.style;
        if (p && RESUME_FONTS.indexOf(p.font) !== -1) pref.font = p.font;
        if (p && RESUME_FITS.indexOf(p.fit) !== -1) pref.fit = p.fit;
      }
    } catch (e) {}
    if (!pref.font) pref.font = RESUME_DEFAULT_FONT[pref.style] || 'georgia';
    return pref;
  };

  /* PORTFOLIO PDF — gated for the next release; re-enable by restoring the
     Document fieldset. Everything from here through enableContinuousPrint is
     the portfolio print engine's plumbing: kept intact, but no UI path
     reaches it this release. hope-export-pref (the old combined pref) is
     still read harmlessly by readExportPref; the resume dialog persists to
     hope-resume-pref instead. */
  var EXPORT_PREF_KEY = 'hope-export-pref';
  var EXPORT_STYLES = { portfolio: ['classic', 'ink', 'showcase'], resume: ['classic', 'modern', 'compact'] };
  var EXPORT_LAYOUTS = ['continuous', 'paginated'];
  var readExportPref = function () {
    var pref = { doc: 'portfolio', style: 'classic', layout: 'continuous' };
    try {
      var raw = localStorage.getItem(EXPORT_PREF_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && EXPORT_STYLES[p.doc]) {
          pref.doc = p.doc;
          if (EXPORT_STYLES[p.doc].indexOf(p.style) !== -1) pref.style = p.style;
          if (EXPORT_LAYOUTS.indexOf(p.layout) !== -1) pref.layout = p.layout;
        }
      }
    } catch (e) {}
    return pref;
  };
  // Continuous single-page export. The @page rule cannot be selector-scoped,
  // so it is injected as the LAST style in <head> (wins the @page cascade over
  // the base Letter rule) sized to the measured document height. The height is
  // measured ON SCREEN under body.print-continuous — its rules live outside
  // @media print so the measured layout IS the printed layout — at the exact
  // print width (816px = 8.5in @ 96dpi; px only: exact 0.75 px→pt). +1px
  // absorbs fractional rounding; the 19200px cap (200in) is Acrobat's MediaBox
  // ceiling — past it Chrome flows the remainder onto N continuous pages.
  // enable() is idempotent: it clears stale state first, so a killed print
  // dialog (afterprint never fired) can't leak into the next export.
  var CONT_PAGE_W_PX = 816;
  var CONT_MAX_H_PX = 19200;
  var disableContinuousPrint = function () {
    document.body.classList.remove('print-continuous');
    document.body.style.width = '';
    var stale = document.getElementById('continuous-page');
    if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
  };
  var enableContinuousPrint = function () {
    disableContinuousPrint();
    // The 816px body pin below does NOT un-match the ≥1440px viewport media
    // query (MQs read the viewport, not body width) — the rails CSS is gated
    // off via body:not(.print-continuous), but the relocated summary NODE
    // must also be back in the identity card before the height is measured.
    // unmountRails is a hoisted function declaration (rails block below).
    unmountRails();
    document.body.classList.add('print-continuous');
    document.body.style.width = CONT_PAGE_W_PX + 'px'; // measure at print width
    void document.body.offsetHeight;                   // force reflow before measuring
    var h = Math.ceil(document.documentElement.scrollHeight) + 1;
    if (h > CONT_MAX_H_PX) h = CONT_MAX_H_PX;
    var pageStyle = document.createElement('style');
    pageStyle.id = 'continuous-page';
    pageStyle.textContent = '@page { size: ' + CONT_PAGE_W_PX + 'px ' + h + 'px; margin: 0; }';
    document.head.appendChild(pageStyle);
  };
  /* end PORTFOLIO PDF gate */

  // ── Resume auto-fit ──
  // Paginated Letter geometry at 96dpi: page = 816×1056px; @page margin is
  // 0.5in (vertical) / 0.55in (horizontal) → printable content 710.4×960px.
  var RESUME_PAGE_CONTENT_W_PX = 816 - 2 * (0.55 * 96); // 710.4
  var RESUME_PAGE_CONTENT_H_PX = 1056 - 2 * (0.5 * 96); // 960
  var RESUME_RFS_STEP = 0.02;
  var measureResumePages = function () {
    void resumeView.offsetHeight; // force reflow before measuring
    return Math.max(1, Math.ceil(resumeView.scrollHeight / RESUME_PAGE_CONTENT_H_PX));
  };
  // Step --rfs down 0.02 per iteration, re-measuring, until either the
  // estimated page count drops (target: one page less than start, or a
  // single page) or the chosen style's floor scale is hit. Compact's floor
  // scale is 1.0 — it never shrinks. If the floor is hit before fitting,
  // print anyway at the floor — that's correct behavior, never go smaller.
  var runResumeAutoFit = function (style) {
    var basePt = RESUME_BASE_PT[style] || RESUME_BASE_PT.classic;
    var floorScale = RESUME_MIN_BODY_PT / basePt;
    document.body.style.width = RESUME_PAGE_CONTENT_W_PX + 'px'; // pin measurement to print width
    resumeView.style.setProperty('--rfs', '1');
    var startPages = measureResumePages();
    if (startPages <= 1) return; // already a single page — nothing to tighten
    var targetPages = Math.max(1, startPages - 1);
    var scale = 1;
    while (scale > floorScale) {
      scale = Math.max(floorScale, +(scale - RESUME_RFS_STEP).toFixed(4));
      resumeView.style.setProperty('--rfs', String(scale));
      if (measureResumePages() <= targetPages) return; // page-count drop — stop
    }
    // Floor reached without fitting: keep the floor scale and print.
  };
  var checkedValue = function (name) {
    var el = exportModal ? exportModal.querySelector('input[name="' + name + '"]:checked') : null;
    return el ? el.value : '';
  };
  var syncExportUI = function () {
    exportModal.querySelectorAll('.export-opt').forEach(function (opt) {
      var input = opt.querySelector('input');
      opt.classList.toggle('selected', !!(input && input.checked));
    });
  };
  var closeExportModal = function () { if (exportModal) exportModal.hidden = true; };
  if (pdfBtn && exportModal && resumeView) {
    pdfBtn.addEventListener('click', function () {
      var pref = readResumePref();
      var styleRadio = exportModal.querySelector('input[name="export-style-resume"][value="' + pref.style + '"]');
      if (styleRadio) styleRadio.checked = true;
      var fontRadio = exportModal.querySelector('input[name="export-font-resume"][value="' + pref.font + '"]');
      if (fontRadio) fontRadio.checked = true;
      var fitRadio = exportModal.querySelector('input[name="export-fit-resume"][value="' + pref.fit + '"]');
      if (fitRadio) fitRadio.checked = true;
      syncExportUI();
      exportModal.hidden = false;
    });
    exportModal.addEventListener('change', function (e) {
      // Style drives the Font default: switching style pre-selects that
      // style's default family (the user can still override it after).
      if (e.target && e.target.name === 'export-style-resume') {
        var def = RESUME_DEFAULT_FONT[e.target.value] || 'georgia';
        var defRadio = exportModal.querySelector('input[name="export-font-resume"][value="' + def + '"]');
        if (defRadio) defRadio.checked = true;
      }
      syncExportUI();
    });
    exportModal.addEventListener('click', function (e) {
      if (e.target.closest('[data-export-close]')) closeExportModal();
    });
    document.getElementById('export-confirm').addEventListener('click', function () {
      var style = checkedValue('export-style-resume') || 'classic';
      var font = checkedValue('export-font-resume') || RESUME_DEFAULT_FONT[style] || 'georgia';
      var fit = checkedValue('export-fit-resume') || 'comfortable';
      try { localStorage.setItem(RESUME_PREF_KEY, JSON.stringify({ style: style, font: font, fit: fit })); } catch (e) {}
      document.body.classList.add('print-doc-resume', 'print-style-' + style);
      resumeView.style.setProperty('--resume-font', RESUME_FONT_STACKS[font] || RESUME_FONT_STACKS.georgia);
      closeExportModal();
      if (fit === 'auto') runResumeAutoFit(style);
      window.print();
    });
    window.addEventListener('afterprint', function () {
      var stale = [];
      document.body.classList.forEach(function (c) {
        if (c.indexOf('print-doc-') === 0 || c.indexOf('print-style-') === 0) stale.push(c);
      });
      stale.forEach(function (c) { document.body.classList.remove(c); });
      // Resume teardown: auto-fit scale, font override, measurement width pin.
      resumeView.style.removeProperty('--rfs');
      resumeView.style.removeProperty('--resume-font');
      document.body.style.width = '';
      disableContinuousPrint(); // gated portfolio engine — keep its state clean too
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (exportModal && !exportModal.hidden) closeExportModal();
    closeShareMenu();
  });
  // Default-open app: Overview when its pane shipped (show_summary kept),
  // else the markup's static Experience fallback stands. This script runs
  // synchronously before first paint, so there's no active-tab flash.
  var overviewPane = document.getElementById('pane-overview');
  if (overviewPane) {
    document.querySelectorAll('.section-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-section') === 'overview');
    });
    document.querySelectorAll('.section-pane').forEach(function (p) {
      p.classList.toggle('active', p === overviewPane);
    });
  }
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-section');
      document.querySelectorAll('.section-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.section-pane').forEach(p => p.classList.toggle('active', p.getAttribute('data-pane') === target));
    });
  });
  document.querySelectorAll('.item-card[data-expand] .item-head').forEach(head => {
    head.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      head.closest('.item-card').classList.toggle('expanded');
    });
  });

  // ── THE SPOTLIGHT — show-before-you-ask (#spotlight=<key> hash directive) ──
  // AUTHORING NOTE — Hope's SKILLS use this to POINT while asking: when a
  // question is about something visual, the skill hands the user this page's
  // URL with #spotlight=<key> appended (file://, localhost, or the published
  // link — a location hash needs no server), says in plain words what will be
  // glowing, THEN asks. Visitors who never use the hash never see any of
  // this. Registry keys → targets:
  //   timeline → #throughline · highlights → #pane-overview (tile activated
  //   first) · share → #share-btn · pdf → #pdf-btn · photo → the photo box ·
  //   summary → the summary paragraph · experience / skills / education /
  //   certifications / projects → that pane (tile activated first).
  // Plays on load AND on hashchange: scroll into view (smooth; auto under
  // prefers-reduced-motion), then ~3 soft pulses over ~3s via .hope-spotlight
  // (token glow — beside the tl-flash block in portfolio.css). Cleanup is
  // total: the class is removed when the run ends and the hash is cleared via
  // history.replaceState — no URL pollution, no history entry, and nothing
  // for print to see (interactive-only, the class lives ~3s).
  (function () {
    var SPOTLIGHT = {
      timeline: { sel: '#throughline' },
      highlights: { sel: '#pane-overview', pane: 'overview' },
      share: { sel: '#share-btn' },
      pdf: { sel: '#pdf-btn' },
      photo: { sel: '#photo-upload' },
      summary: { sel: '.summary' },
      experience: { sel: '.section-pane[data-pane="experience"]', pane: 'experience' },
      skills: { sel: '.section-pane[data-pane="skills"]', pane: 'skills' },
      education: { sel: '.section-pane[data-pane="education"]', pane: 'education' },
      certifications: { sel: '.section-pane[data-pane="certifications"]', pane: 'certifications' },
      projects: { sel: '.section-pane[data-pane="projects"]', pane: 'projects' },
      social: { sel: '.section-pane[data-pane="social"]', pane: 'social' }
    };
    var spotEl = null;
    var spotCleanup = null;
    var spotTimer = 0;
    function clearSpotlightHash() {
      // replaceState, not location.hash = '' — no history entry, no stray '#'.
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
    }
    function playSpotlight() {
      var m = /^#spotlight=([a-z]+)$/.exec(window.location.hash || '');
      var entry = m && SPOTLIGHT.hasOwnProperty(m[1]) ? SPOTLIGHT[m[1]] : null;
      if (!entry) return; // not a spotlight hash — plain anchors (#pane-overview) stay untouched
      var el = document.querySelector(entry.sel);
      if (!el) { clearSpotlightHash(); return; } // feature not in this build (e.g. show_summary stripped)
      if (entry.pane) {
        // Activate the tile via the EXISTING section-grid code path — the
        // button's own click handler owns the tab + pane class state, the
        // same doctrine as the throughline's click-navigate.
        var paneBtn = document.querySelector('.section-btn[data-section="' + entry.pane + '"]');
        if (paneBtn) paneBtn.click();
      }
      if (el.getClientRects().length === 0) { clearSpotlightHash(); return; } // hidden (e.g. empty throughline) — directive is inert
      var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      if (spotTimer) { clearTimeout(spotTimer); spotTimer = 0; }
      if (spotCleanup) { spotCleanup(); spotCleanup = null; }
      if (spotEl && spotEl !== el) spotEl.classList.remove('hope-spotlight');
      el.classList.remove('hope-spotlight');
      void el.offsetWidth; // restart the pulse on a repeated directive
      el.classList.add('hope-spotlight');
      spotEl = el;
      // Pulse until the user actually ENGAGES — the whole point is being
      // seen, and a fixed 3s could finish before they even look. First
      // pointer move / click / wheel / touch / key counts as "they're
      // looking": then exactly TWO more full flashes and stop. The smooth
      // scrollIntoView above fires no pointer/wheel events, so it can't
      // self-trigger. 60s hard cap so an untouched tab never pulses forever.
      var engaged = false, flashesLeft = 2;
      var ENGAGE_EVENTS = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown'];
      function spotTeardown() {
        el.removeEventListener('animationiteration', onIter);
        ENGAGE_EVENTS.forEach(function (t) { window.removeEventListener(t, onEngage, true); });
      }
      function spotDone() {
        el.classList.remove('hope-spotlight');
        if (spotTimer) { clearTimeout(spotTimer); spotTimer = 0; }
        spotTeardown(); spotCleanup = null; spotEl = null;
      }
      function onIter() { if (engaged && --flashesLeft <= 0) spotDone(); }
      function onEngage() { engaged = true; ENGAGE_EVENTS.forEach(function (t) { window.removeEventListener(t, onEngage, true); }); }
      spotCleanup = spotTeardown;
      el.addEventListener('animationiteration', onIter);
      ENGAGE_EVENTS.forEach(function (t) { window.addEventListener(t, onEngage, true); });
      spotTimer = setTimeout(spotDone, 60000);
      clearSpotlightHash();
    }
    // One tick deferred: the throughline strip is built LATER in this same
    // synchronous pass (its IIFE below un-hides #throughline), so targets are
    // resolved only after the outer IIFE has finished.
    window.setTimeout(playSpotlight, 0);
    window.addEventListener('hashchange', playSpotlight);
  })();

  // ── WIDE-SCREEN RAILS (≥1440px) — minimal JS relocation, one node, no clones ──
  // AUTHORING NOTE — approach: the summary lives INSIDE .identity-card, whose
  // overflow:hidden + border/background chrome make a pure-CSS escape
  // impossible without dissolving the card (display:contents — the reverted
  // v0.8.0 mistake). So: minimal JS relocation on a matchMedia listener. At
  // ≥1440px the summary <p> (the ORIGINAL node — never cloned) moves into a
  // .summary-rail <aside> appended to .wrap; below the breakpoint the summary
  // moves back to its original slot — it is .identity-info's LAST child, so a
  // plain appendChild restores the exact generated markup — and the aside is
  // removed from the DOM entirely, leaving the narrow document identical to
  // what the generator wrote. The section-grid is NEVER moved: it is already
  // a direct .wrap child, so the rails grid in portfolio.css re-columns it in
  // place — its click wiring, the Overview default-open promotion above, and
  // the {{#show_summary}}-stripped 5-tile variant all work untouched.
  // This block runs synchronously here (classic script, end of body) — same
  // before-first-paint doctrine as the Overview promotion above, so there is
  // no relocation flash at load. The MQ 'change' listener covers resize in
  // BOTH directions. Print stays single-column with the summary in-card:
  // beforeprint moves it home (afterprint re-syncs), and the continuous
  // engine calls unmountRails() before measuring — the 816px body pin does
  // NOT un-match a viewport media query, so the DOM must be restored
  // explicitly there (the CSS side is gated with body:not(...) classes).
  var railsMql = window.matchMedia ? window.matchMedia('(min-width: 1440px)') : null;
  var railSummary = document.querySelector('.identity-card .identity-info > .summary');
  var railHome = railSummary ? railSummary.parentNode : null; // .identity-info
  var railAside = null;
  function mountRails() {
    if (!railSummary || !railHome) return; // no summary in this build — grid-only rails via CSS
    if (!railAside) {
      railAside = document.createElement('aside');
      railAside.className = 'summary-rail';
      railAside.setAttribute('aria-label', 'About');
    }
    if (!railAside.parentNode) {
      var wrap = document.querySelector('.wrap');
      if (wrap) wrap.appendChild(railAside);
    }
    if (railSummary.parentNode !== railAside) railAside.appendChild(railSummary);
  }
  function unmountRails() {
    // appendChild = the original slot: the summary is .identity-info's last child.
    if (railSummary && railHome && railSummary.parentNode !== railHome) railHome.appendChild(railSummary);
    if (railAside && railAside.parentNode) railAside.parentNode.removeChild(railAside);
  }
  function syncRails() {
    if (railsMql && railsMql.matches) mountRails(); else unmountRails();
  }
  syncRails(); // before first paint
  if (railsMql) {
    if (railsMql.addEventListener) railsMql.addEventListener('change', syncRails);
    else if (railsMql.addListener) railsMql.addListener(syncRails);
  }
  window.addEventListener('beforeprint', unmountRails); // every print mode is single-column; summary prints in-card
  window.addEventListener('afterprint', syncRails);
  const PHOTO_KEY = 'hope_headshot_data_url';
  const photoInput = document.getElementById('photo-input');
  const photoPreview = document.getElementById('photo-preview');
  const photoUpload = document.getElementById('photo-upload');
  const photoRemove = document.getElementById('photo-remove');
  // A photo baked into the file at generation time arrives as the img's src +
  // the .has-photo class already on the label. Remember it so "remove" reverts
  // to it instead of wiping the published photo. A localStorage upload (the
  // "change your photo" fallback) overrides it in this browser only.
  const bakedPhoto = (photoPreview && photoPreview.getAttribute('src')) || '';
  function setPhoto(dataUrl) {
    if (dataUrl) { photoPreview.src = dataUrl; photoUpload.classList.add('has-photo'); }
    else { photoPreview.removeAttribute('src'); photoUpload.classList.remove('has-photo'); }
  }
  // Normalize the load-time state: drop an empty src="" (no baked photo) so it
  // never fires a spurious request, and honor whatever's correct on first paint.
  if (photoPreview) { if (bakedPhoto) setPhoto(bakedPhoto); else setPhoto(null); }
  // PUBLISHED-MODE CONTRACT: on a published copy the photo is the owner's
  // baked-in one, full stop. The file input is disabled (the CSS gate already
  // makes the box inert) and the photo localStorage is neither read nor
  // written — a visitor's stale local photo must never shadow the owner's
  // baked photo.
  if (photoInput && isPublished) {
    photoInput.disabled = true;
  }
  if (photoInput && !isPublished) {
    photoInput.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhoto(ev.target.result);
        try { localStorage.setItem(PHOTO_KEY, ev.target.result); } catch (e) {}
      };
      reader.readAsDataURL(file);
    });
    // A locally-uploaded photo wins over the baked-in one for this viewer.
    try { const stored = localStorage.getItem(PHOTO_KEY); if (stored) setPhoto(stored); } catch (e) {}
  }
  if (photoRemove && !isPublished) {
    photoRemove.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      try { localStorage.removeItem(PHOTO_KEY); } catch (e) {}
      // Revert to the baked-in photo if the file shipped with one; else clear.
      setPhoto(bakedPhoto || null);
    });
  }

  // ── THE THROUGHLINE — chronological strip in the identity card ──
  // ── Social Feed (optional app) ───────────────────────────────────────────
  // Renders window.HOPE_DATA.social into #social-grid. Social posts are NOT
  // career events: no Throughline node, no tl- id, no pane-order rule. Each
  // card shows the platform's live embed AND a "View on …" link that always
  // works — so when the page is opened offline / from file:// (embeds need an
  // http origin + a connection) or a post is gone, the card degrades to a
  // clickable link, never a blank box. This is the one app that loads
  // third-party embed scripts / iframes (Hope is otherwise self-contained) —
  // a deliberate, disclosed trade-off (see skills/portfolio/SKILL.md).
  (function () {
    var grid = document.getElementById('social-grid');
    var posts = (window.HOPE_DATA && Array.isArray(window.HOPE_DATA.social)) ? window.HOPE_DATA.social : [];
    if (!grid || !posts.length) return;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    // Platform registry. cls 'iframe' → src(url) returns an <iframe> URL (or
    // null → link card only); 'script' → block(url) returns the platform's
    // blockquote + names the async script to load once; 'link' → link card only.
    var P = {
      youtube:    { name: 'YouTube',     cls: 'iframe', h: 220, src: function (u) { var m = u.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/); return m ? 'https://www.youtube.com/embed/' + m[1] : null; } },
      vimeo:      { name: 'Vimeo',       cls: 'iframe', h: 220, src: function (u) { var m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/); return m ? 'https://player.vimeo.com/video/' + m[1] : null; } },
      spotify:    { name: 'Spotify',     cls: 'iframe', h: 152, src: function (u) { var m = u.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/(\w+)/); return m ? 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] : null; } },
      soundcloud: { name: 'SoundCloud',  cls: 'iframe', h: 166, src: function (u) { return 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(u) + '&color=%23d97706&visual=false'; } },
      applemusic: { name: 'Apple Music', cls: 'iframe', h: 175, src: function (u) { return u.replace('music.apple.com', 'embed.music.apple.com'); } },
      figma:      { name: 'Figma',       cls: 'iframe', h: 300, src: function (u) { return 'https://www.figma.com/embed?embed_host=hope&url=' + encodeURIComponent(u); } },
      codepen:    { name: 'CodePen',     cls: 'iframe', h: 300, src: function (u) { var m = u.match(/codepen\.io\/([^\/]+)\/(?:pen|details)\/(\w+)/); return m ? 'https://codepen.io/' + m[1] + '/embed/' + m[2] + '?default-tab=result' : null; } },
      loom:       { name: 'Loom',        cls: 'iframe', h: 240, src: function (u) { return u.indexOf('/embed/') > -1 ? u : u.replace('/share/', '/embed/'); } },
      bluesky:    { name: 'Bluesky',     cls: 'iframe', h: 300, src: function (u) { var m = u.match(/bsky\.app\/profile\/([^\/]+)\/post\/(\w+)/); return m ? 'https://embed.bsky.app/embed/' + m[1] + '/app.bsky.feed.post/' + m[2] : null; } },
      linkedin:   { name: 'LinkedIn',    cls: 'iframe', h: 320, src: function (u) { var m = u.match(/(urn:li:(?:share|ugcPost|activity):[\w-]+)/) || u.match(/activity-(\d+)/); return m ? 'https://www.linkedin.com/embed/feed/update/' + (m[1].indexOf('urn:') === 0 ? m[1] : 'urn:li:activity:' + m[1]) : null; } },
      substack:   { name: 'Substack',    cls: 'iframe', h: 320, src: function (u) { return u; } },
      flickr:     { name: 'Flickr',      cls: 'iframe', h: 280, src: function (u) { return u; } },
      tiktok:     { name: 'TikTok',      cls: 'script', script: 'https://www.tiktok.com/embed.js', block: function (u) { var m = u.match(/video\/(\d+)/); return '<blockquote class="tiktok-embed" cite="' + esc(u) + '"' + (m ? ' data-video-id="' + m[1] + '"' : '') + ' style="max-width:325px;min-width:240px"><a href="' + esc(u) + '"></a></blockquote>'; } },
      instagram:  { name: 'Instagram',   cls: 'script', script: '//www.instagram.com/embed.js', global: 'instgrm', process: function () { window.instgrm && window.instgrm.Embeds && window.instgrm.Embeds.process(); }, block: function (u) { return '<blockquote class="instagram-media" data-instgrm-permalink="' + esc(u) + '" data-instgrm-version="14"></blockquote>'; } },
      x:          { name: 'X',           cls: 'script', script: 'https://platform.twitter.com/widgets.js', block: function (u) { return '<blockquote class="twitter-tweet"><a href="' + esc(String(u).replace('//x.com', '//twitter.com')) + '"></a></blockquote>'; } },
      threads:    { name: 'Threads',     cls: 'script', script: 'https://www.threads.net/embed.js', block: function (u) { return '<blockquote class="text-post-media" data-text-post-permalink="' + esc(u) + '"></blockquote>'; } },
      pinterest:  { name: 'Pinterest',   cls: 'script', script: '//assets.pinterest.com/js/pinit.js', block: function (u) { return '<a data-pin-do="embedPin" href="' + esc(u) + '"></a>'; } },
      dribbble:   { name: 'Dribbble',    cls: 'link' },
      behance:    { name: 'Behance',     cls: 'link' },
      medium:     { name: 'Medium',      cls: 'link' },
      gist:       { name: 'GitHub',      cls: 'link' },
      link:       { name: 'Link',        cls: 'link' }
    };

    var loaded = {};
    function loadScript(src) {
      if (!src || loaded[src]) return;
      loaded[src] = 1;
      var s = document.createElement('script');
      s.async = true; s.src = src;
      document.body.appendChild(s);
    }

    var needsProcess = {};
    posts.forEach(function (post) {
      if (!post || typeof post !== 'object' || !post.url) return;
      var key = String(post.platform || 'link').toLowerCase();
      var cfg = P[key] || P.link;
      var card = document.createElement('article');
      card.className = 'social-card social-' + key + ' social-cls-' + cfg.cls;
      var head = '<div class="social-head"><span class="social-plat">' + esc(cfg.name) + '</span>'
        + (post.caption ? '<span class="social-cap">' + esc(post.caption) + '</span>' : '') + '</div>';
      var body = '';
      if (cfg.cls === 'iframe') {
        var src = null; try { src = cfg.src(String(post.url)); } catch (e) { src = null; }
        if (src) body = '<div class="social-embed"><iframe src="' + esc(src) + '" height="' + (cfg.h || 240)
          + '" loading="lazy" frameborder="0" scrolling="no" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write" allowfullscreen title="' + esc(cfg.name) + ' embed"></iframe></div>';
      } else if (cfg.cls === 'script') {
        try { body = '<div class="social-embed">' + cfg.block(String(post.url)) + '</div>'; } catch (e) { body = ''; }
        loadScript(cfg.script);
        if (cfg.process) needsProcess[key] = cfg;
      }
      var foot = '<a class="social-link" href="' + esc(post.url) + '" target="_blank" rel="noopener">'
        + esc(post.title || ('View on ' + cfg.name)) + '<span class="material-symbols-rounded ext">open_in_new</span></a>';
      card.innerHTML = head + body + foot;
      grid.appendChild(card);
    });

    // Script-class platforms that need an explicit processor once their script
    // lands and the blockquotes are in the DOM (Instagram). Twitter/TikTok
    // widgets auto-observe new nodes, so they need no nudge.
    Object.keys(needsProcess).forEach(function (k) {
      var cfg = needsProcess[k];
      var t = setInterval(function () { if (window[cfg.global]) { try { cfg.process(); } catch (e) {} clearInterval(t); } }, 400);
      setTimeout(function () { clearInterval(t); }, 8000);
    });
  })();

  // Data: window.HOPE_DATA (data.js — the single authoring source; loaded
  // before this script). Shell: #throughline in index.html; visuals: the
  // tl-* block in portfolio.css. This code BUILDS the rail (track, year
  // ticks, hex nodes, playhead + traveler, tooltip) and DRIVES the play
  // loop: the playhead advances one node per second, looping. Every DOM
  // write (class swaps + the playhead transform) is scheduled through
  // requestAnimationFrame; motion is transform/opacity only. Paused while
  // the strip is hovered or focused, while the tab is hidden
  // (visibilitychange), while the strip is off-viewport
  // (IntersectionObserver), and entirely under prefers-reduced-motion
  // (static rail — .tl-static). Published mode: deliberately NOT gated —
  // the Throughline is a visitor feature, like theme toggle and Share.
  (function () {
    var strip = document.getElementById('throughline');
    var hopeData = window.HOPE_DATA || {};
    var timeline = Array.isArray(hopeData.timeline) ? hopeData.timeline : [];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function parseYM(s) { // "YYYY-MM" → months since year 0, or null
      var m = /^(\d{4})-(\d{2})$/.exec(String(s || ''));
      if (!m) return null;
      var mo = +m[2];
      if (mo < 1 || mo > 12) return null;
      return +m[1] * 12 + (mo - 1);
    }
    function fmtYM(months) { return MONTHS[months % 12] + ' ' + Math.floor(months / 12); }
    // Validate each entry at the data boundary — generated data is untrusted
    // here. Invalid date_start or missing label → entry skipped, not crashed.
    var TL_TYPES = { experience: 1, education: 1, project: 1, certification: 1 };
    var TL_PANES = { experience: 1, education: 1, projects: 1, certifications: 1 };
    var entries = [];
    timeline.forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      var startM = parseYM(e.date_start);
      if (startM === null || !e.label) return;
      entries.push({
        type: TL_TYPES[e.type] ? String(e.type) : 'experience',
        startM: startM,
        endM: e.date_end ? parseYM(e.date_end) : null,
        label: String(e.label),
        org: e.org ? String(e.org) : '',
        metric: e.metric ? String(e.metric) : '',
        skills: Array.isArray(e.skills) ? e.skills.slice(0, 4) : [],
        pane: TL_PANES[e.pane] ? String(e.pane) : '',
        anchor: e.anchor ? String(e.anchor) : ''
      });
    });
    if (!strip || entries.length === 0) return; // template ships [] — strip stays hidden

    var now = new Date();
    var nowM = now.getFullYear() * 12 + now.getMonth();
    var minM = Infinity, maxM = -Infinity;
    entries.forEach(function (e) {
      if (e.startM < minM) minM = e.startM;
      var end = e.endM === null ? nowM : e.endM;
      if (end > maxM) maxM = end;
      if (e.startM > maxM) maxM = e.startM;
    });
    var span = Math.max(1, maxM - minM);
    entries.forEach(function (e) {
      e.pct = ((e.startM - minM) / span) * 100; // positioned by start date
      e.dateText = fmtYM(e.startM) + ' – ' + (e.endM === null ? 'Present' : fmtYM(e.endM));
    });

    // ── The ridge — the rail's vertical dimension ("mountain peaks"). ──
    // Density at any month = how many entries are active then (ongoing runs
    // to now); smoothed into terrain (two 5-tap passes), normalized min→max
    // so a single-thread career stays FLAT — the ridge degrades to the
    // classic rail — while concurrency rises into peaks. Every career gets
    // its own silhouette. RIDGE_H pairs with the .tl-has-ridge headroom in
    // portfolio.css — change both together.
    var RIDGE_H = 28;
    var SAMPLES = 120;
    var density = [];
    var s, j, k;
    for (s = 0; s <= SAMPLES; s++) {
      var mAt = minM + span * s / SAMPLES;
      var cnt = 0;
      entries.forEach(function (e) {
        var end = e.endM === null ? nowM : Math.max(e.endM, e.startM + 1);
        if (mAt >= e.startM && mAt <= end) cnt++;
      });
      density.push(cnt);
    }
    for (var pass = 0; pass < 2; pass++) {
      var sm = density.slice();
      for (j = 0; j < density.length; j++) {
        var acc = 0, n = 0;
        for (k = -2; k <= 2; k++) { if (density[j + k] !== undefined) { acc += density[j + k]; n++; } }
        sm[j] = acc / n;
      }
      density = sm;
    }
    var dMin = Infinity, dMax = -Infinity;
    density.forEach(function (v) { if (v < dMin) dMin = v; if (v > dMax) dMax = v; });
    var hasRidge = (dMax - dMin) >= 0.25;
    function liftAt(pct) { // px of lift at a 0–100 rail position
      if (!hasRidge) return 0;
      var f = pct / 100 * SAMPLES;
      var i0 = Math.floor(f), i1 = Math.min(SAMPLES, i0 + 1), t = f - i0;
      var v = density[i0] * (1 - t) + density[i1] * t;
      return (v - dMin) / (dMax - dMin) * RIDGE_H;
    }
    entries.forEach(function (e) { e.lift = liftAt(e.pct); });

    var rail = document.createElement('div');
    rail.className = 'tl-rail';
    var track = document.createElement('span');
    track.className = 'tl-track';
    rail.appendChild(track);

    // The ridge area — inline SVG (vector: prints crisp; colors ride the
    // tokens, so dark theme and ink's monochrome override cover it for
    // free). z-index 0 in CSS: under the ticks, nodes, and traveler.
    if (hasRidge) {
      rail.classList.add('tl-has-ridge'); // unlocks the taller label headroom in CSS
      var NS = 'http://www.w3.org/2000/svg';
      var ridge = document.createElementNS(NS, 'svg');
      ridge.setAttribute('class', 'tl-ridge');
      ridge.setAttribute('viewBox', '0 0 ' + SAMPLES + ' ' + (RIDGE_H + 2));
      ridge.setAttribute('preserveAspectRatio', 'none');
      ridge.setAttribute('aria-hidden', 'true');
      var pts = '';
      for (s = 0; s <= SAMPLES; s++) {
        var lift = (density[s] - dMin) / (dMax - dMin) * RIDGE_H;
        pts += (s === 0 ? 'M' : 'L') + s + ' ' + (RIDGE_H + 1 - lift).toFixed(2);
      }
      var fillPath = document.createElementNS(NS, 'path');
      fillPath.setAttribute('class', 'tl-ridge-fill');
      fillPath.setAttribute('d', pts + 'L' + SAMPLES + ' ' + (RIDGE_H + 2) + 'L0 ' + (RIDGE_H + 2) + 'Z');
      var linePath = document.createElementNS(NS, 'path');
      linePath.setAttribute('class', 'tl-ridge-line');
      linePath.setAttribute('d', pts);
      linePath.setAttribute('vector-effect', 'non-scaling-stroke');
      ridge.appendChild(fillPath);
      ridge.appendChild(linePath);
      rail.appendChild(ridge);
    }

    // Year ticks — at most ~7, January-aligned, styled by .tl-tick/-year.
    var firstYear = Math.ceil(minM / 12);
    var lastYear = Math.floor(maxM / 12);
    var stepYears = Math.max(1, Math.ceil((lastYear - firstYear + 1) / 7));
    for (var y = firstYear; y <= lastYear; y += stepYears) {
      var tickM = y * 12;
      if (tickM < minM || tickM > maxM) continue;
      var tickEl = document.createElement('span'); // tickEl, not tick — `var tick` would clobber the hoisted play-engine function tick() below
      tickEl.className = 'tl-tick';
      tickEl.style.left = (((tickM - minM) / span) * 100) + '%';
      var yearEl = document.createElement('span');
      yearEl.className = 'tl-tick-year';
      yearEl.textContent = String(y);
      tickEl.appendChild(yearEl);
      rail.appendChild(tickEl);
    }

    // Nodes — keyboard-accessible buttons. Print tiers: .tl-below (every 2nd
    // node) puts the label under the rail, .tl-far (every 3rd+4th of each
    // quartet) pushes it to an outer row — four label tiers total, so even
    // date-clustered neighbors print without overlap (T8 print block in
    // portfolio.css). On screen only the active label shows; tiers are inert.
    var nodes = [];
    entries.forEach(function (e, i) {
      var node = document.createElement('button');
      node.type = 'button';
      node.className = 'tl-node tl-' + e.type +
        (e.endM === null ? ' tl-ongoing' : '') +
        (i % 2 ? ' tl-below' : '') +
        (i % 4 >= 2 ? ' tl-far' : '');
      node.style.left = e.pct + '%';
      if (e.lift) node.style.top = 'calc(50% - ' + e.lift.toFixed(1) + 'px)'; // riding the ridge
      node.setAttribute('aria-label', e.label + ', ' + e.dateText);
      var hex = document.createElement('span');
      hex.className = 'tl-hex';
      node.appendChild(hex);
      var lab = document.createElement('span');
      lab.className = 'tl-node-label';
      var labText = document.createElement('span');
      labText.className = 'tl-node-text';
      labText.textContent = e.label;
      var labDate = document.createElement('span');
      labDate.className = 'tl-node-date';
      labDate.textContent = e.dateText;
      lab.appendChild(labText);
      lab.appendChild(labDate);
      node.appendChild(lab);
      rail.appendChild(node);
      nodes.push(node);
    });

    // Traveler (T7): "dot" (default) → the soft orange glow dot (pure CSS);
    // a curated slug → its monochrome single-path SVG below (embedded from
    // assets/icons/travelers/ — classic-script law: no fetch, ever);
    // { inline: "<svg…>" } → a generator-inlined custom SVG. Anything else
    // falls back to the dot. No picker UI here — the choice arrives via
    // data.js (window.HOPE_DATA.traveler).
    var TRAVELER_SVGS = {
      'paper-plane': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
      'car': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
      'train': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm5.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-7h-5V6h5v4z"/></svg>',
      'sailboat': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3l7 11h-7zM11 6v8H5zM3 16h18l-2.5 4h-13z"/></svg>',
      'bicycle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S3.1 13.5 5 13.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>',
      'rocket': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5s4.5 2.04 4.5 10.5c0 2.49-1.04 5.57-1.6 7H9.1c-.56-1.43-1.6-4.51-1.6-7C7.5 4.54 12 2.5 12 2.5zm2 8.5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-6.31 9.52c-.48-1.23-1.52-4.17-1.67-6.87l-1.13.75c-.56.38-.89 1-.89 1.67V22l3.69-1.48zM20 22v-5.93c0-.67-.33-1.29-.89-1.66l-1.13-.75c-.15 2.69-1.2 5.64-1.67 6.87L20 22z"/></svg>',
      'footprints': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 2a2.5 4 0 1 0 0 8 2.5 4 0 1 0 0-8zM8 11.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6zM16 8.5a2.5 4 0 1 0 0 8 2.5 4 0 1 0 0-8zM16 18a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6z"/></svg>'
    };
    var playhead = document.createElement('span');
    playhead.className = 'tl-playhead';
    var traveler = document.createElement('span');
    traveler.className = 'tl-traveler';
    var travPref = hopeData.traveler;
    var travSvg = '';
    if (travPref && typeof travPref === 'object' && typeof travPref.inline === 'string' &&
        travPref.inline.lastIndexOf('<svg', 0) === 0) {
      travSvg = travPref.inline;
    } else if (typeof travPref === 'string' && TRAVELER_SVGS.hasOwnProperty(travPref)) {
      travSvg = TRAVELER_SVGS[travPref];
    }
    if (travSvg) { traveler.className += ' tl-svg'; traveler.innerHTML = travSvg; }
    else { traveler.className += ' tl-dot'; }
    playhead.appendChild(traveler);
    rail.appendChild(playhead);
    strip.appendChild(rail);
    strip.hidden = false;

    // Tooltip — appended to <body>, not the strip: the identity card clips
    // (overflow:hidden + the materialize transform makes it the containing
    // block even for position:fixed), so a card-level tooltip could never
    // escape it. Hidden in all print modes by the CSS.
    var tip = document.createElement('div');
    tip.className = 'tl-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    document.body.appendChild(tip);
    function showTip(node, e) {
      tip.innerHTML = '';
      var l = document.createElement('div'); l.className = 'tl-tip-label'; l.textContent = e.label; tip.appendChild(l);
      if (e.org) { var o = document.createElement('div'); o.className = 'tl-tip-org'; o.textContent = e.org; tip.appendChild(o); }
      var d = document.createElement('div'); d.className = 'tl-tip-dates'; d.textContent = e.dateText; tip.appendChild(d);
      if (e.metric) { var m = document.createElement('div'); m.className = 'tl-tip-metric'; m.textContent = e.metric; tip.appendChild(m); }
      if (e.skills.length) {
        var chips = document.createElement('div'); chips.className = 'tl-tip-skills';
        e.skills.forEach(function (s) {
          var chip = document.createElement('span'); chip.className = 'skill-chip'; chip.textContent = String(s); chips.appendChild(chip);
        });
        tip.appendChild(chips);
      }
      tip.hidden = false;
      // Clamp inside the viewport (T5): horizontally pinned to [8, vw-8];
      // above the node by default, flipped below when the top would clip.
      var nr = node.getBoundingClientRect();
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var vx = nr.left + nr.width / 2 - tw / 2;
      vx = Math.max(8, Math.min(vx, window.innerWidth - tw - 8));
      var vy = nr.top - th - 10;
      if (vy < 8) vy = nr.bottom + 10;
      tip.style.left = (vx + window.scrollX) + 'px';
      tip.style.top = (vy + window.scrollY) + 'px';
    }
    function hideTip() { tip.hidden = true; }

    // Edge-clamp the labels near the rail ends (px-measured, viewport-aware).
    function classifyClamps() {
      var rw = rail.clientWidth;
      if (!rw) return;
      nodes.forEach(function (node, i) {
        var x = rw * entries[i].pct / 100;
        node.classList.toggle('tl-clamp-start', x < 110);
        node.classList.toggle('tl-clamp-end', rw - x < 110);
      });
    }
    classifyClamps();

    // ── Play engine (T4) — advance every 1s; DOM writes ride rAF. ──
    var current = -1;
    var rafId = 0;
    var reducedMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var reduced = !!(reducedMq && reducedMq.matches);
    var hovered = false, focused = false, inView = true;
    function playheadX(i) { return rail.clientWidth * entries[i].pct / 100; }
    function applyStep(i, backward) {
      if (current >= 0 && nodes[current]) nodes[current].classList.remove('tl-active');
      nodes[i].classList.add('tl-active');
      playhead.style.transform = 'translate(' + playheadX(i) + 'px, ' + (-entries[i].lift).toFixed(1) + 'px)'; // transform-only motion — the traveler climbs the ridge
      traveler.classList.toggle('tl-flip', !!backward); // face backward on the loop wrap
      current = i;
    }
    function schedule(i, backward) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () { rafId = 0; applyStep(i, backward); });
    }
    function shouldRun() {
      return !reduced && entries.length > 1 && !hovered && !focused && inView && !document.hidden;
    }
    function tick() {
      if (!shouldRun()) return;
      var next = (current + 1) % entries.length;
      schedule(next, next < current);
    }
    function setStatic(on) { // prefers-reduced-motion branch
      strip.classList.toggle('tl-static', on);
      if (on) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
        if (current >= 0 && nodes[current]) nodes[current].classList.remove('tl-active');
        current = -1;
      } else if (current < 0) {
        schedule(0, false);
      }
    }
    if (reduced) setStatic(true); else schedule(0, false); // park on the first node
    window.setInterval(tick, 1000); // the 1s cadence; tick() no-ops while paused
    if (reducedMq) {
      var onReducedChange = function () { reduced = reducedMq.matches; setStatic(reduced); };
      if (reducedMq.addEventListener) reducedMq.addEventListener('change', onReducedChange);
      else if (reducedMq.addListener) reducedMq.addListener(onReducedChange);
    }
    // Pause sources: hover/focus anywhere on the strip…
    strip.addEventListener('mouseenter', function () { hovered = true; });
    strip.addEventListener('mouseleave', function () { hovered = false; hideTip(); });
    strip.addEventListener('focusin', function () { focused = true; });
    strip.addEventListener('focusout', function (e) {
      if (!strip.contains(e.relatedTarget)) { focused = false; hideTip(); }
    });
    // …a hidden tab (shouldRun also reads document.hidden each tick)…
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    });
    // …and the strip scrolled off-viewport.
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(function (recs) {
        inView = !!(recs[0] && recs[0].isIntersecting);
      }, { threshold: 0.1 }).observe(strip);
    }
    window.addEventListener('resize', function () {
      if (current >= 0) playhead.style.transform = 'translateX(' + playheadX(current) + 'px)';
      classifyClamps();
      hideTip();
    });

    // Hover/focus tooltip + click-navigate (T5/T6).
    nodes.forEach(function (node, i) {
      var e = entries[i];
      node.addEventListener('mouseenter', function () { showTip(node, e); });
      node.addEventListener('mouseleave', hideTip);
      node.addEventListener('focus', function () { showTip(node, e); });
      node.addEventListener('blur', hideTip);
      node.addEventListener('click', function () {
        // Navigate via the EXISTING pane-activation path — the section-grid
        // button's own click handler owns the tab + pane class state.
        if (e.pane) {
          var paneBtn = document.querySelector('.section-btn[data-section="' + e.pane + '"]');
          if (paneBtn) paneBtn.click();
        }
        if (!reduced) schedule(i, i < current); // park the playhead on the chosen entry
        var card = e.anchor ? document.getElementById(e.anchor) : null;
        if (!card) return;
        if (card.hasAttribute('data-expand')) card.classList.add('expanded'); // expand collapsibles
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        card.classList.remove('tl-flash');
        void card.offsetWidth; // restart the pulse on re-click
        card.classList.add('tl-flash');
        setTimeout(function () { card.classList.remove('tl-flash'); }, 1300);
      });
    });
  })();
})();
