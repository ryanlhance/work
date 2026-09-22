#!/usr/bin/env python3
"""Capture uniform card screenshots for the gallery.

    python3 -m pip install --user playwright && python3 -m playwright install chromium
    python3 shoot.py            # all sites
    python3 shoot.py fitmap     # just one
"""
import sys, pathlib
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).parent / "shots"
W, H = 1440, 900          # 16:10, matches the card aspect ratio
SCALE = 2                 # retina

def seed_chat(page):
    """Send a couple of messages so the persona card shows a live conversation."""
    for msg in ["Hi Marty, got a few minutes?",
                "What do you think about farm data software?",
                "What would actually make it worth your time?"]:
        page.click("#input")
        page.type("#input", msg, delay=8)
        page.keyboard.press("Enter")
        # wait out the typing indicator rather than guessing
        for _ in range(40):
            page.wait_for_timeout(500)
            if not page.locator("text=is typing").count():
                break
        page.wait_for_timeout(700)


SITES = {
    "personas":      ("https://ryanlhance.github.io/farmer-persona/", 2500, seed_chat),
    "fitmap":        ("https://ryanlhance.github.io/tiff/",           3000, None),
    "constellation": ("https://ryanlhance.github.io/skills/",         6000, None),
    "managerhub":    ("https://ryanlhance.github.io/dggt/",           3000, None),
    "workshop":      ("https://ryanlhance.github.io/work/workshop/",  2500, None),
}


def shoot(page, name, url, settle, setup=None):
    page.goto(url, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(settle)
    if setup:
        setup(page)
    OUT.mkdir(exist_ok=True)
    path = OUT / f"{name}.png"
    page.screenshot(path=str(path))
    print(f"  {name:14s} {path.stat().st_size // 1024:>5d} KB  {url}")


def main():
    wanted = sys.argv[1:] or list(SITES)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H},
                                device_scale_factor=SCALE)
        for name in wanted:
            if name not in SITES:
                print(f"  ! unknown site: {name}")
                continue
            url, settle, setup = SITES[name]
            try:
                shoot(page, name, url, settle, setup)
            except Exception as e:
                print(f"  ! {name}: {e}")
        browser.close()


if __name__ == "__main__":
    main()
