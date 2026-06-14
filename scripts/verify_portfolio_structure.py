#!/usr/bin/env python3
"""verify_portfolio_structure.py — sequence & placement gate for Hope portfolios.

The PDF checker (verify_portfolio_pdf.py) proves a portfolio *renders*; this
one proves it's *assembled right*. It parses a generated portfolio FOLDER
(index.html + its data script) and asserts the three structural invariants
that type-checking and "no unsubstituted tokens" never catch — the bugs a
human reviewer kept having to spot by eye:

  * AGREEMENT    every timeline entry has its card in index.html
                 (id="tl-<id>"), and every tl- card has a timeline entry —
                 no dead rail clicks, no orphan cards.
  * CONTAINMENT  each card physically sits inside the section-pane its
                 timeline entry names (an experience card never nested in
                 the projects pane's HTML, nothing stranded outside a pane).
  * ORDER        within each pane, cards run reverse-chronological
                 (newest first) — what recruiters expect; catches the
                 "promotion shown oldest-first" class of bug.

The data script is JavaScript (window.HOPE_DATA), so it is parsed with node
when available — the only reliable way to read JS-literal syntax (unquoted
keys, single quotes, trailing commas). A stdlib JSON fallback covers the
common case (a generated data.js whose timeline is valid JSON) when node is
absent; if neither can read it, that's an environment error, not a silent pass.

Usage:
  scripts/verify_portfolio_structure.py [portfolio-folder | .../index.html]

Default subject: assets/fixtures/persona-jane-doe/sample-portfolio/

Exit code: 0 = all invariants hold, 1 = at least one FAIL,
2 = environment/usage error (folder/data/index.html unreadable).
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

REPO = Path(__file__).resolve().parent.parent
SUBJECT_DEFAULT = (REPO / "assets" / "fixtures" / "persona-jane-doe" / "sample-portfolio")

# Panes that hold dated cards. "overview" (stat-only) and "skills" (chips) are
# real panes but carry no tl- cards, so they're excluded from order/containment.
CARD_PANES = ("experience", "projects", "education", "certifications")


# ── Result plumbing (mirrors verify_portfolio_pdf.py) ────────────────────────
@dataclass
class Check:
    section: str
    name: str
    status: str  # PASS | FAIL | WARN | INFO
    detail: str


@dataclass
class Report:
    checks: list[Check] = field(default_factory=list)

    def add(self, section: str, name: str, status: str, detail: str) -> None:
        self.checks.append(Check(section, name, status, detail))

    @property
    def hard_failures(self) -> list[Check]:
        return [c for c in self.checks if c.status == "FAIL"]


# ── Subject resolution ───────────────────────────────────────────────────────
def resolve_folder(subject: Path) -> Path:
    """Accept a portfolio folder (containing index.html) or its index.html."""
    if subject.is_dir():
        if not (subject / "index.html").is_file():
            raise FileNotFoundError(f"folder has no index.html: {subject}")
        return subject
    if subject.is_file():
        if (subject.parent / "index.html").is_file():
            return subject.parent
        raise FileNotFoundError(f"not a portfolio folder/index.html: {subject}")
    raise FileNotFoundError(f"subject not found: {subject}")


# ── Timeline parse — node first (handles JS literal), JSON fallback ──────────
def data_files(folder: Path) -> list[Path]:
    """The script(s) that define window.HOPE_DATA. A generated portfolio ships
    one data.js; the multi-persona sample sets HOPE_DATA inside data/<default>.js
    and registers the rest into HOPE_PERSONAS — load every data/ script so the
    default persona's HOPE_DATA is present."""
    if (folder / "data.js").is_file():
        return [folder / "data.js"]
    return sorted((folder / "data").glob("*.js")) if (folder / "data").is_dir() else []


def load_timeline_node(files: list[Path]) -> list[dict]:
    js = (
        "globalThis.window = {};"
        "const p = require('path');"
        "for (const f of " + json.dumps([str(f) for f in files]) + ") { try { require(p.resolve(f)); } catch (e) {} }"
        "const t = (window.HOPE_DATA && window.HOPE_DATA.timeline) || [];"
        "process.stdout.write(JSON.stringify(t));"
    )
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True, timeout=20)
    if out.returncode != 0:
        raise RuntimeError(f"node failed: {out.stderr.strip() or 'unknown error'}")
    return json.loads(out.stdout or "[]")


def load_timeline_py(files: list[Path]) -> list[dict]:
    """Fallback: extract the timeline array textually and JSON-parse it. Works
    when the array is valid JSON (a generated data.js); raises otherwise."""
    src = ""
    for f in files:
        text = f.read_text(encoding="utf-8", errors="replace")
        if "HOPE_DATA" in text:
            src = text
            break
    if not src:
        raise RuntimeError("no window.HOPE_DATA found in data script(s)")
    src = _strip_js_comments(src)
    m = re.search(r'HOPE_DATA\b', src)
    key = re.search(r'["\']?timeline["\']?\s*:', src[m.end():]) if m else None
    if not key:
        raise RuntimeError("no `timeline` key after HOPE_DATA")
    base = m.end() + key.end()
    br = src.find("[", base)
    arr = _balanced_array(src, br) if br != -1 else None
    if arr is None:
        raise RuntimeError("could not isolate the timeline array (install node for JS-literal support)")
    cleaned = re.sub(r",(\s*[}\]])", r"\1", arr)  # drop trailing commas
    return json.loads(cleaned)


def _strip_js_comments(s: str) -> str:
    out, i, n, quote = [], 0, len(s), None
    while i < n:
        c = s[i]
        if quote:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(s[i + 1]); i += 2; continue
            if c == quote:
                quote = None
            i += 1; continue
        if c in "\"'`":
            quote = c; out.append(c); i += 1; continue
        if c == "/" and i + 1 < n and s[i + 1] == "*":
            j = s.find("*/", i + 2); i = j + 2 if j != -1 else n; continue
        if c == "/" and i + 1 < n and s[i + 1] == "/":
            j = s.find("\n", i + 2); i = j if j != -1 else n; continue
        out.append(c); i += 1
    return "".join(out)


def _balanced_array(s: str, start: int) -> Optional[str]:
    depth, i, n, quote = 0, start, len(s), None
    while i < n:
        c = s[i]
        if quote:
            if c == "\\":
                i += 2; continue
            if c == quote:
                quote = None
            i += 1; continue
        if c in "\"'`":
            quote = c
        elif c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return s[start:i + 1]
        i += 1
    return None


def load_timeline(folder: Path) -> tuple[list[dict], str]:
    files = data_files(folder)
    if not files:
        raise RuntimeError(f"no data.js or data/*.js in {folder}")
    src = "data.js" if files[0].name == "data.js" else f"data/*.js ({len(files)} file{'s' if len(files) != 1 else ''})"
    if shutil.which("node"):
        return load_timeline_node(files), src
    return load_timeline_py(files), src + " [json fallback — node absent]"


# ── index.html parse ─────────────────────────────────────────────────────────
def parse_panes(html: str) -> dict[str, list[str]]:
    """{pane_name: [tl-id, ...] in DOM order} for cards physically inside each
    pane. Panes are siblings: a pane's slice runs to the next data-pane mark
    (or to #resume-view / EOF for the last), which bounds card membership."""
    marks = sorted((m.start(), m.group(1)) for m in re.finditer(r'data-pane\s*=\s*"([^"]+)"', html))
    rv = re.search(r'id\s*=\s*"resume-view"', html)
    rv_pos = rv.start() if rv else len(html)
    panes: dict[str, list[str]] = {}
    for idx, (pos, name) in enumerate(marks):
        end = marks[idx + 1][0] if idx + 1 < len(marks) else len(html)
        end = min(end, rv_pos) if pos < rv_pos else end
        ids = re.findall(r'id\s*=\s*"tl-([^"]+)"', html[pos:end])
        panes.setdefault(name, []).extend(ids)
    return panes


# ── Date ordering ────────────────────────────────────────────────────────────
_ONGOING = (9999, 12, 31)


def _dt(s) -> Optional[tuple]:
    if s is None:
        return None
    m = re.match(r'\s*(\d{4})-(\d{1,2})(?:-(\d{1,2}))?', str(s))
    return (int(m.group(1)), int(m.group(2)), int(m.group(3) or 1)) if m else None


def _start_key(e: dict) -> tuple:
    return _dt(e.get("date_start")) or (0, 0, 0)


def _end_key(e: dict) -> tuple:
    end = e.get("date_end")
    if end is None or str(end).strip().lower() in ("", "null", "present", "current", "ongoing", "now"):
        return _ONGOING
    return _dt(end) or (0, 0, 0)


def is_older(a: dict, b: dict) -> bool:
    """True only when `a` is UNAMBIGUOUSLY older than `b` — earlier by both
    start AND end date (ongoing counts as the most recent end). When the two
    measures disagree (e.g. an ongoing project that started before a later
    finished one), the ordering is defensible, so it isn't flagged."""
    return _start_key(a) < _start_key(b) and _end_key(a) < _end_key(b)


def _span(e: dict) -> str:
    end = e.get("date_end")
    return f"{e.get('date_start') or '?'}→{end or 'now'}"


# ── Verification ─────────────────────────────────────────────────────────────
def verify(folder: Path, report: Report) -> None:
    raw = (folder / "index.html").read_text(encoding="utf-8", errors="replace")
    # Strip HTML comments first: the template's authoring notes contain literal
    # examples like id="tl-<id>", and a commented-out card is not rendered — both
    # would otherwise register as phantom cards.
    index_html = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
    try:
        timeline, source = load_timeline(folder)
    except Exception as exc:
        report.add("parse", "data", "FAIL", str(exc))
        return
    report.add("parse", "timeline", "INFO", f"{len(timeline)} entries ({source})")

    panes = parse_panes(index_html)
    all_ids = re.findall(r'id\s*=\s*"tl-([^"]+)"', index_html)
    in_pane = [i for ids in panes.values() for i in ids]
    id_set = set(all_ids)

    by_id: dict[str, dict] = {}
    dupes: list[str] = []
    for e in timeline:
        eid = str(e.get("id", "")).strip()
        if not eid:
            report.add("agreement", "entry-id", "FAIL", f"timeline entry missing id: {e.get('label', e)!r}")
            continue
        if eid in by_id:
            dupes.append(eid)
        by_id[eid] = e
    for d in sorted(set(dupes)):
        report.add("agreement", "entry-id", "FAIL", f"duplicate timeline id: {d}")

    # AGREEMENT — entry → card, card → entry
    anchor_ids = {str(e.get("anchor") or "")[3:] for e in timeline if str(e.get("anchor") or "").startswith("tl-")}
    entry_ids = set(by_id) | anchor_ids
    missing = []
    for eid, e in by_id.items():
        anchor = str(e.get("anchor") or f"tl-{eid}")
        want = anchor[3:] if anchor.startswith("tl-") else anchor
        if want not in id_set:
            missing.append((eid, want))
    for eid, want in sorted(missing):
        report.add("agreement", "card-exists", "FAIL", f'timeline "{eid}" → no card id="tl-{want}" (dead rail click)')
    orphans = sorted(c for c in id_set if c not in entry_ids)
    for c in orphans:
        report.add("agreement", "card-orphan", "FAIL", f'card id="tl-{c}" → no timeline entry (missing rail node)')
    if not missing and not orphans and not dupes:
        report.add("agreement", "dom<->data", "PASS", f"{len(id_set)} cards ↔ {len(by_id)} entries aligned")

    # CONTAINMENT — outside any pane, and pane vs declared pane
    cont_fail = False
    for c in sorted(set(all_ids) - set(in_pane)):
        report.add("containment", "outside-pane", "FAIL", f"card tl-{c} sits outside every section-pane")
        cont_fail = True
    for pane_name, ids in panes.items():
        if pane_name not in CARD_PANES:
            if ids:
                report.add("containment", f"pane:{pane_name}", "WARN",
                           f"non-card pane '{pane_name}' holds tl- ids: {', '.join('tl-' + s for s in ids)}")
            continue
        for c in ids:
            e = by_id.get(c)
            if e is None:
                continue  # flagged as orphan above
            want = str(e.get("pane", "")).strip()
            if want != pane_name:
                report.add("containment", f"pane:{pane_name}", "FAIL",
                           f"card tl-{c} is in the '{pane_name}' pane but its timeline entry says pane='{want}'")
                cont_fail = True
    if not cont_fail:
        report.add("containment", "pane-fit", "PASS", "every card sits in its declared pane")

    # ORDER — within each pane, reverse-chronological (newest first)
    for pane_name, ids in panes.items():
        if pane_name not in CARD_PANES:
            continue
        active = [(c, by_id[c]) for c in ids if c in by_id]
        if len(active) < 2:
            continue
        problems = [
            f"tl-{ca} ({_span(ea)}) before newer tl-{cb} ({_span(eb)})"
            for (ca, ea), (cb, eb) in zip(active, active[1:])
            if is_older(ea, eb)
        ]
        if problems:
            report.add("order", f"pane:{pane_name}", "FAIL", "not newest-first: " + "; ".join(problems))
        else:
            report.add("order", f"pane:{pane_name}", "PASS", f"{len(active)} cards newest-first")


# ── Reporting ────────────────────────────────────────────────────────────────
def print_table(report: Report) -> None:
    cols = ("SECTION", "CHECK", "STATUS", "DETAIL")
    rows = [(c.section, c.name, c.status, c.detail) for c in report.checks]
    w0 = max(len(cols[0]), *(len(r[0]) for r in rows)) if rows else len(cols[0])
    w1 = max(len(cols[1]), *(len(r[1]) for r in rows)) if rows else len(cols[1])
    w2 = max(len(cols[2]), *(len(r[2]) for r in rows)) if rows else len(cols[2])
    line = f"{{:<{w0}}}  {{:<{w1}}}  {{:<{w2}}}  {{}}"
    print(line.format(*cols))
    print(line.format("-" * w0, "-" * w1, "-" * w2, "-" * 40))
    for r in rows:
        print(line.format(*r))


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Verify Hope portfolio structure: order, placement, timeline↔DOM agreement.")
    parser.add_argument("subject", type=Path, nargs="?", default=SUBJECT_DEFAULT,
                        help=f"portfolio folder or its index.html (default: {SUBJECT_DEFAULT})")
    args = parser.parse_args(argv)

    try:
        folder = resolve_folder(args.subject)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    print(f"verify_portfolio_structure: {folder}")
    print(f"feature: node: {'yes (' + shutil.which('node') + ')' if shutil.which('node') else 'no — JSON fallback only'}\n")

    report = Report()
    verify(folder, report)
    print_table(report)

    n_fail = len(report.hard_failures)
    n_pass = sum(1 for c in report.checks if c.status == "PASS")
    n_warn = sum(1 for c in report.checks if c.status == "WARN")
    print(f"\nRESULT: {'FAIL' if n_fail else 'PASS'} — {n_pass} pass, {n_fail} fail, {n_warn} warn")
    return 1 if n_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
