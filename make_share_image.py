#!/usr/bin/env python3
"""Render share.png, the link preview card, at 1200x630.

    python3 make_share_image.py

Built from the same tokens and screenshots as the site, so it stays honest to
what someone sees when they click through.
"""
import base64, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent
W, H = 1200, 630
# three, not four: at the size a feed renders this, four tiles are unreadable
TILES = ["frontoffice", "careerarch", "records"]


def data_uri(name):
    b = (HERE / "shots" / f"{name}.png").read_bytes()
    return "data:image/png;base64," + base64.b64encode(b).decode()


TEMPLATE = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    width: {w}px; height: {h}px; overflow: hidden;
    background: #f7f6f3; color: #17171a;
    font-family: Archivo, sans-serif;
    display: flex; flex-direction: column; justify-content: center;
  }}
  .top {{ padding: 0 64px; }}
  h1 {{ font-size: 62px; font-weight: 600; letter-spacing: -0.028em; line-height: 1.02; }}
  .url {{ margin-top: 18px; font-size: 21px; color: #5c5b57; }}

  .shelf {{
    margin-top: 54px; padding: 0 64px;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }}
  .tile {{
    aspect-ratio: 16 / 10;
    border: 1px solid #e2e0da; border-radius: 8px;
    overflow: hidden; background: #fff;
    box-shadow: 0 10px 30px rgba(23, 23, 26, 0.08);
  }}
  .tile img {{ width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }}
</style></head>
<body>
  <div class="top">
    <h1>Ryan Hance&rsquo;s AI Builds</h1>
    <p class="url">ryanlhance.github.io/work</p>
  </div>
  <div class="shelf">{tiles}</div>
</body></html>"""


def main():
    tiles = "".join(f'<div class="tile"><img src="{data_uri(t)}"></div>' for t in TILES)
    html = TEMPLATE.format(w=W, h=H, tiles=tiles)
    tmp = HERE / ".share-source.html"
    tmp.write_text(html, encoding="utf-8")
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            page = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
            page.goto(tmp.as_uri(), wait_until="networkidle")
            page.wait_for_timeout(900)
            out = HERE / "share.png"
            page.screenshot(path=str(out))
            b.close()
        print(f"share.png  {W}x{H} @2x  {out.stat().st_size // 1024} KB")
    finally:
        tmp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
