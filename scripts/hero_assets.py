#!/usr/bin/env python3
"""Bouw wereldklasse hero-assets voor PootGelukkig marketing-pagina's.

Privacy: echte klantnaam 'Dierenasiel Amsterdam' + 'Jan' worden geblurrd.
- dashboard: brede blur-band over de hele header-groet (onafhankelijk van exacte x).
- dieren: full-width blur-bands op elke rij waar de locatie-tekst staat.
- copilot: sidebar-groet 'Goedemorgen, Jan' geblurrd, sidebar verder zichtbaar (toont AI-TEAM).

Unieke compositie per pagina:
    home         -> gelaagd: dashboard (achter) + dieren (voor)
    voor-asielen -> dashboard, enkel venster
    ai-assistent -> Copilot-chat (sidebar met geblurde groet)
Plus: 'Voorbeeldweergave'-badge + highlight-chip op key-metric.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = {
    "dashboard": "C:/Users/v_mun/Pictures/Screenshots/Schermafbeelding 2026-07-14 094449.png",
    "dieren": "C:/Users/v_mun/Pictures/Screenshots/Schermafbeelding 2026-07-14 094434.png",
    "copilot": "C:/Users/v_mun/Pictures/Screenshots/Schermafbeelding 2026-07-14 100546.png",
}
OUT = "public/images/hero"


def font(size, bold=True):
    for c in ("C:/Windows/Fonts/SegoeUI-Semibold.ttf", "C:/Windows/Fonts/segoeui.ttf",
              "C:/Windows/Fonts/arial.ttf"):
        try:
            return ImageFont.truetype(c, size)
        except Exception:
            pass
    return ImageFont.load_default()


def blur_abs(im, box, radius=26):
    x0, y0, x1, y1 = [int(v) for v in box]
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(im.width, x1), min(im.height, y1)
    if x1 <= x0 or y1 <= y0:
        return im
    region = im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(radius))
    im = im.copy()
    im.paste(region, (x0, y0))
    return im


def add_badge(im, text="Voorbeeldweergave"):
    d = ImageDraw.Draw(im)
    f = font(22, True)
    tw = d.textlength(text, font=f)
    bw, bh = int(tw) + 58, 42
    x0, y0 = 18, 18
    x1, y1 = x0 + bw, y0 + bh
    d.rounded_rectangle([x0, y0, x1, y1], radius=bh // 2, fill=(255, 255, 255))
    d.ellipse([x0 + 16, y0 + bh // 2 - 7, x0 + 30, y0 + bh // 2 + 7], fill=(238, 91, 43))
    d.text((x0 + 40, y0 + bh // 2 - 15), text, font=f, fill=(51, 51, 92))
    return im


def add_chip(im, text, cx_frac, cy_frac):
    d = ImageDraw.Draw(im)
    f = font(26, True)
    tw = d.textlength(text, font=f)
    w, h = int(tw) + 60, 56
    cx, cy = im.width * cx_frac, im.height * cy_frac
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=h // 2, fill=(238, 91, 43),
                        outline=(255, 255, 255), width=3)
    d.text((x0 + 30, y0 + h // 2 - 17), text, font=f, fill=(255, 255, 255))
    return im


def crop_window(im, left, top, right, bottom):
    return im.crop((int(im.width * left), int(im.height * top),
                    int(im.width * right), int(im.height * bottom)))


# ---------------------------------------------------------------- DASHBOARD
dash = Image.open(SRC["dashboard"]).convert("RGB")   # origineel 1883x987
# Genereuze brede band over de hele header-groet + asielnaam (dekt beide
# gerapporteerde x-posities af); stat-cards zitten lager (y>280) en blijven scherp.
dash = blur_abs(dash, (170, 120, 920, 262))
dash_crop = crop_window(dash, 0, 0.105, 1, 0.958)
dash_base = dash_crop.copy()
dash_crop = add_badge(dash_crop, "Voorbeeldweergave")
dash_crop = add_chip(dash_crop, "307 AI-matches", 0.55, 0.135)
dash_crop.save(f"{OUT}/dashboard.png")
print("dashboard", dash_crop.size)

# ---------------------------------------------------------------- DIEREN
di = Image.open(SRC["dieren"]).convert("RGB")        # origineel 1876x986
# Full-width blur-bands op elke rij waar de locatie-tekst staat (rijen ~260px uit elkaar)
for ry in (390, 650, 910):
    di = blur_abs(di, (0, ry - 12, di.width, ry + 18), radius=22)
di_crop = crop_window(di, 0.16, 0.105, 1, 0.958)
di_base = di_crop.copy()
di_crop = add_badge(di_crop, "Voorbeeldweergave")
di_crop.save(f"{OUT}/dieren.png")
print("dieren", di_crop.size)

# ---------------------------------------------------------------- COPILOT (ai-assistent)
co = Image.open(SRC["copilot"]).convert("RGB")       # 1541x871
# Sidebar-groet 'Goedemorgen, Jan' (bovenaan linker sidebar) blur-en; sidebar blijft staan.
co = blur_abs(co, (0, 118, 380, 240), radius=24)
co_crop = crop_window(co, 0.04, 0.04, 1, 0.99)
co_base = co_crop.copy()
co_crop = add_badge(co_crop, "Voorbeeldweergave")
co_crop = add_chip(co_crop, "Dagelijkse briefing", 0.58, 0.30)
co_crop.save(f"{OUT}/copilot.png")
print("copilot", co_crop.size)

# ---------------------------------------------------------------- HOME (gelaagd)
back = dash_base
front = di_base
fw = int(back.width * 0.72)
fh = int(front.height * (fw / front.width))
front = front.resize((fw, fh))
canvas = back.copy()
ox = 0
oy = back.height - fh - int(back.height * 0.04)
canvas.paste(front, (ox, oy))
canvas = add_badge(canvas, "Voorbeeldweergave")
canvas = add_chip(canvas, "307 AI-matches", 0.52, 0.135)
canvas.save(f"{OUT}/home.png")
print("home", canvas.size)
print("klaar")
