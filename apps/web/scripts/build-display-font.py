#!/usr/bin/env python3
"""
Make the Hindi display font small enough for phones.

The Anek Devanagari variable font from @fontsource-variable is 710 KB because it carries every
weight and width. Headings only use bold at widths 75 to 100, so this pins the weight at 700 and
keeps that width range, which brings it to about 190 KB. Run it again after upgrading the package:

    python3 apps/web/scripts/build-display-font.py

Needs fonttools and brotli (pip install fonttools brotli). The font is under the SIL Open Font
License; the licence is copied next to the output.
"""
import shutil
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

web = Path(__file__).resolve().parent.parent
pkg = web / "node_modules/@fontsource-variable/anek-devanagari"
out = web / "src/fonts"

font = TTFont(pkg / "files/anek-devanagari-devanagari-wdth-normal.woff2")
instantiateVariableFont(font, {"wght": 700, "wdth": (75, 100)}, inplace=True)
font.flavor = "woff2"
out.mkdir(exist_ok=True)
font.save(out / "anek-devanagari-display.woff2")
shutil.copy(pkg / "LICENSE", out / "anek-devanagari-OFL.txt")
print(f"{(out / 'anek-devanagari-display.woff2').stat().st_size // 1024} KB")
