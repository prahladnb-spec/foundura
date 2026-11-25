#!/usr/bin/env python3
"""
Make the Hindi and Marathi fonts small enough for phones.

Headings: the Anek Devanagari variable font from @fontsource-variable is 710 KB because it
carries every weight and width. Headings only use bold, at two widths: narrow (75) for the big
display headlines and regular (100) for the rest. This makes one static bold file for each
(about 85 KB and 88 KB), plus the family's own Latin letters at the same two widths (about
17 KB each), so Hindi and Marathi headings don't also need the 102 KB Anek Latin variable font
for spaces, digits and English words.

Body text: the Mukta Devanagari files from @fontsource are about 100 KB each, nearly half of it
TrueType hinting instructions that modern browsers barely use. The copies here drop the hinting
(about 57 KB each) and keep every glyph and layout feature.

A page's main headline needs only the two narrow heading files, which are preloaded on Hindi and
Marathi pages (src/app/font-urls.tsx). Run this again after upgrading either package:

    python3 apps/web/scripts/build-display-font.py

Needs fonttools and brotli (pip install fonttools brotli). Both fonts are under the SIL Open Font
License; the licences are copied next to the output.
"""
import shutil
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

web = Path(__file__).resolve().parent.parent
anek = web / "node_modules/@fontsource-variable/anek-devanagari"
mukta = web / "node_modules/@fontsource/mukta"
out = web / "src/fonts"
out.mkdir(exist_ok=True)


def save_unhinted(font: TTFont, name: str) -> None:
    """Drop hinting, keep every character, glyph and OpenType feature, save as WOFF2."""
    options = subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.hinting = False
    options.glyph_names = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=list(font.getBestCmap().keys()))
    subsetter.subset(font)
    font.flavor = "woff2"
    path = out / name
    font.save(path)
    print(f"{name}: {path.stat().st_size // 1024} KB")


for subset_name, suffix in (("devanagari", ""), ("latin", "-latin")):
    for width_name, width in (("narrow", 75), ("regular", 100)):
        font = TTFont(anek / f"files/anek-devanagari-{subset_name}-wdth-normal.woff2")
        instantiateVariableFont(font, {"wght": 700, "wdth": width}, inplace=True)
        save_unhinted(font, f"anek-devanagari-bold-{width_name}{suffix}.woff2")

for weight in (400, 600):
    save_unhinted(TTFont(mukta / f"files/mukta-devanagari-{weight}-normal.woff2"), f"mukta-devanagari-{weight}.woff2")

shutil.copy(anek / "LICENSE", out / "anek-devanagari-OFL.txt")
shutil.copy(mukta / "LICENSE", out / "mukta-OFL.txt")
