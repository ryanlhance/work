#!/usr/bin/env python3
"""Capture uniform card screenshots for the gallery.

    python3 -m pip install --user playwright && python3 -m playwright install chromium
    python3 shoot.py              # all sites
    python3 shoot.py fitmap       # just one
    python3 shoot.py --local ...  # shoot this site from the dev server, pre-deploy
"""
import sys, pathlib
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).parent / "shots"
W, H = 1440, 900          # 16:10, matches the card aspect ratio
SCALE = 2                 # retina
PHONE = (375, 812)        # cards that show a mobile app get captured at device size
PHONE_SCALE = 3

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


def safe_area(css):
    """A desktop browser reports env(safe-area-inset-*) as 0, so apps that pad
    with it render flush against the top of the frame. Hand them real insets
    before the shot, the same way the viewer pages do."""
    def setup(page):
        page.add_style_tag(content=css)
        page.wait_for_timeout(500)
    return setup


SITES = {
    "personas":      ("https://ryanlhance.github.io/farmer-persona/", 2500, seed_chat),
    "fitmap":        ("https://ryanlhance.github.io/tiff/",           3000, None),
    "constellation": ("https://ryanlhance.github.io/skills/",         6000, None),
    "managerhub":    ("https://ryanlhance.github.io/dggt/",           3000,
                      # matches what the portfolio's viewer hides
                      safe_area('.duescard a[href*="venmo"]{display:none}')),
    "workshop":      ("https://ryanlhance.github.io/work/workshop/",  2500, None),
    "dashboard":     ("https://ryanlhance.github.io/work/workshop/dashboard/", 3000, None),
    "draftroom":     ("https://ryanlhance.github.io/work/pieces/draft-room.html", 3500, None),
    "frontoffice":   ("https://ryanlhance.github.io/work/pieces/front-office.html", 3500, None),
}

# Captured at phone size and framed as a device on the card.
PHONE_SITES = {
    "records":   ("https://ryanlhance.github.io/record-crate/", 4500, None),
    "feelslike": ("https://ryanlhance.github.io/feels-like/",   4500,
                  safe_area("#app{padding-top:59px !important;"
                            "padding-bottom:34px !important}")),
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


LOCAL = "http://localhost:8011/"
DEPLOYED = "https://ryanlhance.github.io/work/"


def main():
    args = sys.argv[1:]
    local = "--local" in args
    wanted = [a for a in args if a != "--local"] or (list(SITES) + list(PHONE_SITES))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        desktop = browser.new_page(viewport={"width": W, "height": H},
                                   device_scale_factor=SCALE)
        phone = browser.new_page(
            viewport={"width": PHONE[0], "height": PHONE[1]},
            device_scale_factor=PHONE_SCALE,
            is_mobile=True, has_touch=True,
            user_agent=("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
                        "Mobile/15E148 Safari/604.1"),
        )
        for name in wanted:
            table = SITES if name in SITES else PHONE_SITES
            if name not in table:
                print(f"  ! unknown site: {name}")
                continue
            url, settle, setup = table[name]
            if local:
                url = url.replace(DEPLOYED, LOCAL)
            try:
                shoot(phone if table is PHONE_SITES else desktop,
                      name, url, settle, setup)
            except Exception as e:
                print(f"  ! {name}: {e}")
        browser.close()


if __name__ == "__main__":
    main()
