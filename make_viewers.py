#!/usr/bin/env python3
"""Generate the full-screen viewer page for each piece.

Every card opens a page inside the portfolio that runs the real thing in a
frame, so there is always a way back. Nothing about the source sites changes.
"""
import html, pathlib

HERE = pathlib.Path(__file__).parent

# slug, title, tag, deployed src, local src (None = same), injected CSS
PIECES = [
    ("front-office", "Front Office", "Data Visualization for Decision Making",
     "../pieces/front-office.html", None, "", "DCHC"),
    ("draft-room", "Draft Room", "Data Visualization for Decision Making",
     "../pieces/draft-room.html", None, "", "DCHC"),
    ("skill-map", "Skill Map", "Creatively Presenting Information",
     "https://ryanlhance.github.io/skills/", None, "", ""),
    ("fit-map", "TIFF Fit Map", "Creatively Presenting Information",
     "https://ryanlhance.github.io/tiff/", None, "", ""),
    ("league", "League Manager Hub", "Improving Standard Communication with Visuals",
     "https://ryanlhance.github.io/dggt/", "/dggt/",
     # The dues link is for Ryan's managers, not for an interview audience.
     # Hidden in the portfolio's copy only; the real hub still shows it.
     '.duescard a[href*="venmo"]{display:none}', ""),
    ("personas", "Agentic Personas", "Information Architecture for Human-like Outputs",
     "https://ryanlhance.github.io/farmer-persona/", None, "", ""),
]

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>{title} — Ryan Hance</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles.css?v={v}" />
  <link rel="stylesheet" href="../viewer.css?v={v}" />
</head>
<body>
  <div class="viewer">
    <nav class="viewer-bar">
      <a class="bar-link" href="../">
        <svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3.5M7.5 4l-4 4 4 4"/></svg>
        <span>All Builds</span>
      </a>
    </nav>
    <div class="viewer-stage">
      <iframe id="app-frame" title="{title}"
              data-src="{src}"{local}{inject}{retitle}></iframe>
    </div>
  </div>
  <script src="../viewer.js?v={v}"></script>
</body>
</html>
"""

V = 6


def main():
    for slug, title, tag, src, local, inject, *rest in PIECES:
        retitle = rest[0] if rest else ""
        d = HERE / slug
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(TEMPLATE.format(
            title=html.escape(title),
            tag=html.escape(tag),
            src=html.escape(src, quote=True),
            local=f'\n              data-src-local="{html.escape(local, quote=True)}"' if local else "",
            inject=f'\n              data-inject="{html.escape(inject, quote=True)}"' if inject else "",
            retitle=(f'\n              data-retitle-prefix="{html.escape(retitle, quote=True)}"'
                     f'\n              data-retitle-club="Dogwood City Hockey Club"') if retitle else "",
            v=V,
        ), encoding="utf-8")
        print(f"  {slug}/index.html  ->  {src}")


if __name__ == "__main__":
    main()
