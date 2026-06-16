#!/usr/bin/env python3
# Recorta cada personaje de un grid de Gemini en archivos individuales (resolución nativa).
# Detecta los separadores color crema entre tiles (filas y columnas) y recorta cada celda.
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(HERE, 'recortes')
os.makedirs(OUT, exist_ok=True)

def is_sep(p):  # separador crema/blanco entre tiles
    return p[0] > 216 and p[1] > 216 and p[2] > 203

def crop_grid(path, prefix, start):
    im = Image.open(path).convert('RGB'); W, H = im.size; px = im.load()
    step = 3
    def row_is_gap(y):
        w = t = 0
        for x in range(0, W, step):
            t += 1
            if is_sep(px[x, y]): w += 1
        return w / t > 0.90
    # bandas verticales (filas con contenido)
    gap = [row_is_gap(y) for y in range(H)]
    bands = []; y = 0
    while y < H:
        if not gap[y]:
            y0 = y
            while y < H and not gap[y]: y += 1
            if y - y0 > 130: bands.append((y0, y))
        else: y += 1
    n = start
    for (y0, y1) in bands:
        def col_is_gap(x):
            w = t = 0
            for yy in range(y0, y1, step):
                t += 1
                if is_sep(px[x, yy]): w += 1
            return w / t > 0.90
        cg = [col_is_gap(x) for x in range(W)]
        x = 0
        while x < W:
            if not cg[x]:
                x0 = x
                while x < W and not cg[x]: x += 1
                if x - x0 > 90:
                    box = (max(0, x0 - 4), max(0, y0 - 4), min(W, x), min(H, y1))
                    tile = im.crop(box)
                    tile.save(os.path.join(OUT, f'{prefix}-{n:02d}.png'))
                    n += 1
            else: x += 1
    print(f'{os.path.basename(path)} -> {n - start} personajes ({prefix}-{start:02d}..{n-1:02d})')
    return n

grids = [
    ('/Users/andremacouzet/Downloads/Gemini_Generated_Image_g6ttzzg6ttzzg6tt.png', 'g'),  # 12 grandes
    ('/Users/andremacouzet/Downloads/Gemini_Generated_Image_k7mfgck7mfgck7mf.png', 'k'),  # contact sheet
]
total = 1
for path, pfx in grids:
    if os.path.exists(path):
        total = crop_grid(path, pfx, 1)
print('listo. Carpeta:', OUT)
