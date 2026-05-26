"""Render every SVG under a directory to a high-res PNG next to it.

Used by the /grand-oral skill so that all charts/images produced as SVG also
exist as PNG — Google Docs/Slides refuses SVG uploads.

Method: Microsoft Edge in headless mode (already installed on Windows), no
native dependency, no pip install. Falls back to Chrome if Edge is missing.

Usage:
    python répétition/_convert_svg_to_png.py                       # scans répétition/
    python répétition/_convert_svg_to_png.py <slug>                # scans répétition/<slug>/
    python répétition/_convert_svg_to_png.py <absolute-or-rel-dir> # scans that dir

Output: <name>.png next to each <name>.svg, at SCALE × viewBox, white bg.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCALE = 3  # 3 × viewBox → crisp on Google Docs / Slides / PowerPoint


def parse_size(svg_text: str) -> tuple[int, int]:
    vb = re.search(r'viewBox\s*=\s*"([^"]+)"', svg_text)
    if vb:
        parts = re.split(r"[\s,]+", vb.group(1).strip())
        if len(parts) == 4:
            _, _, w, h = parts
            return int(round(float(w))), int(round(float(h)))
    w = re.search(r'\bwidth\s*=\s*"([\d.]+)', svg_text)
    h = re.search(r'\bheight\s*=\s*"([\d.]+)', svg_text)
    if w and h:
        return int(round(float(w.group(1)))), int(round(float(h.group(1))))
    return 800, 480


def make_wrapper(svg_path: Path, w: int, h: int) -> str:
    svg_uri = svg_path.resolve().as_uri()
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0;background:#fff;}}
img{{display:block;width:{w}px;height:{h}px;}}
</style></head><body><img src="{svg_uri}"></body></html>
"""


def render(browser: str, html_path: Path, png_path: Path, w: int, h: int) -> bool:
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        f"--screenshot={png_path}",
        f"--window-size={w},{h}",
        "--default-background-color=FFFFFFFF",
        html_path.resolve().as_uri(),
    ]
    subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    return png_path.exists() and png_path.stat().st_size > 0


def resolve_root(arg: str | None) -> Path:
    here = Path(__file__).resolve().parent  # répétition/
    if not arg:
        return here
    p = Path(arg)
    if p.is_absolute() and p.exists():
        return p
    candidate = (here / arg).resolve()
    if candidate.exists():
        return candidate
    cwd_candidate = Path.cwd() / arg
    if cwd_candidate.exists():
        return cwd_candidate.resolve()
    raise SystemExit(f"ERROR: directory not found: {arg}")


def main() -> int:
    root = resolve_root(sys.argv[1] if len(sys.argv) > 1 else None)
    browser = EDGE if Path(EDGE).exists() else CHROME if Path(CHROME).exists() else None
    if not browser:
        print("ERROR: no Edge or Chrome found.", file=sys.stderr)
        return 1

    svgs = sorted(root.rglob("*.svg"))
    if not svgs:
        print(f"No SVG found under {root}")
        return 0

    print(f"Browser: {browser}")
    print(f"Root:    {root}")
    print(f"Found {len(svgs)} SVG file(s)")

    tmpdir = Path(tempfile.mkdtemp(prefix="svg2png_"))
    ok = 0
    for svg in svgs:
        text = svg.read_text(encoding="utf-8", errors="replace")
        bw, bh = parse_size(text)
        w, h = bw * SCALE, bh * SCALE
        wrapper = tmpdir / (svg.stem + ".html")
        wrapper.write_text(make_wrapper(svg, w, h), encoding="utf-8")
        png = svg.with_suffix(".png")
        try:
            if render(browser, wrapper, png, w, h):
                size_kb = png.stat().st_size / 1024
                print(f"  OK  {svg.relative_to(root)} -> {png.name} ({w}x{h}, {size_kb:.0f} KB)")
                ok += 1
            else:
                print(f"  FAIL {svg.relative_to(root)}")
        except subprocess.TimeoutExpired:
            print(f"  TIMEOUT {svg.relative_to(root)}")
    shutil.rmtree(tmpdir, ignore_errors=True)
    print(f"Done: {ok}/{len(svgs)} converted.")
    return 0 if ok == len(svgs) else 2


if __name__ == "__main__":
    sys.exit(main())
