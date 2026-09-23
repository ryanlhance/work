#!/usr/bin/env python3
"""Re-import the artifacts this portfolio does not author, and re-apply its edits.

Four files here are built somewhere else and exported into this repo. Editing
them by hand means the next export silently undoes the edit, so the edits live
in this script instead. Run it after any re-export:

    python3 import_pieces.py
    python3 shoot.py --local draftroom frontoffice dashboard

It is safe to run repeatedly and it fails loudly rather than shipping a
half-applied edit.
"""
import pathlib, re, sys

HERE = pathlib.Path(__file__).parent
HOME = pathlib.Path.home()
DCHC = HOME / "Documents/Claude/DCHC Portfolio Pieces"
TIFF = HOME / "Documents/Claude/TIFF Project"

META = '<meta name="robots" content="noindex, nofollow" />'
FONT = ('<link href="https://fonts.googleapis.com/css2?'
        'family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600&display=swap" rel="stylesheet">')
LOCKUP_CSS = """<style>
/* Club lockup: the club name sits above the tool name, both in caps case.
   The floor on the club size matters: the draft room's title bar is 17px, so a
   plain em ratio renders it at 7px and it disappears. */
.dchc-title { display: block; }
.dchc-title .club {
  display: block;
  font-family: "Bricolage Grotesque", "Archivo", sans-serif;
  font-weight: 500;
  font-size: max(11px, 0.42em);
  letter-spacing: 0.005em;
  line-height: 1.15;
  opacity: 0.62;
  margin-bottom: 0.12em;
  text-transform: none;
}
.dchc-title .tool {
  display: block;
  font-family: "Bricolage Grotesque", "Archivo", sans-serif;
  font-weight: 600;
  letter-spacing: -0.018em;
  line-height: 1.02;
  text-transform: none;
}
</style>"""

CLUB = "Dogwood City Hockey Club"


def add_noindex(s):
    if re.search(r'name=["\']robots["\']', s, re.I):
        return s, False
    m = re.search(r"<head[^>]*>", s, re.I)
    if not m:
        raise SystemExit("no <head> to put the robots tag in")
    return s[:m.end()] + "\n" + META + s[m.end():], True


def add_lockup(s, tool):
    """Expand the DCHC abbreviation in the title into the club lockup."""
    if 'class="dchc-title"' in s:
        return s, False
    old = f"<h1>DCHC {tool}</h1>"
    if old not in s:
        raise SystemExit(
            f"could not find '{old}'. The export's title markup changed, so the "
            f"lockup was not applied. Fix add_lockup() rather than editing the file."
        )
    s = s.replace(old, '<h1 class="dchc-title">'
                       f'<span class="club">{CLUB}</span>'
                       f'<span class="tool">{tool}</span></h1>', 1)
    i = s.lower().index("</head>")
    return s[:i] + FONT + LOCKUP_CSS + s[i:], True


def copy_html(src, dest, tool=None):
    if not src.exists():
        print(f"  ! missing source, skipped: {src}")
        return
    s = src.read_text(encoding="utf-8", errors="ignore")
    notes = []
    s, did = add_noindex(s)
    if did:
        notes.append("noindex")
    if tool:
        s, did = add_lockup(s, tool)
        if did:
            notes.append("club lockup")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(s, encoding="utf-8")
    print(f"  {dest.relative_to(HERE)}  ({len(s)//1024} KB)"
          + (f"  + {', '.join(notes)}" if notes else "  (already applied)"))


def copy_binary(src, dest):
    if not src.exists():
        print(f"  ! missing source, skipped: {src}")
        return
    dest.write_bytes(src.read_bytes())
    print(f"  {dest.relative_to(HERE)}  ({dest.stat().st_size//1024} KB)")


def main():
    print("importing:")
    copy_html(DCHC / "dchc-draft-room.html", HERE / "pieces/draft-room.html", "Draft Room")
    copy_html(DCHC / "dchc-front-office.html", HERE / "pieces/front-office.html", "Front Office")
    copy_html(TIFF / "weekly-fund-review.html", HERE / "workshop/dashboard/index.html")
    copy_binary(TIFF / "weekly-performance-brief.skill",
                HERE / "workshop/weekly-performance-brief.skill")
    print("\nnow recapture the cards:")
    print("  python3 shoot.py --local draftroom frontoffice dashboard")


if __name__ == "__main__":
    main()
