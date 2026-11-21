#!/usr/bin/env python3
"""Imagem híbrida (Oliva/Torralba/Schyns 2006): baixa frequência de A (visto de LONGE)
+ alta frequência de B (visto de PERTO). Gera PNGs para o vídeo e simulações de perto/longe.
uso: hibrida.py  -> img/<nome>.png, img/sim_<nome>.png"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter

FONTE = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
W = H = 900
BASE = 0.80
PAPEL = np.array([255, 252, 240], float) / 255
os.makedirs("img", exist_ok=True)

def texto(linhas, tam, peso=0):
    im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONTE, tam)
    alturas = [d.textbbox((0, 0), l, font=f) for l in linhas]
    tot = sum(b[3] - b[1] for b in alturas) + (len(linhas) - 1) * tam * 0.25
    y = (H - tot) / 2
    for l, b in zip(linhas, alturas):
        w = b[2] - b[0]
        d.text(((W - w) / 2 - b[0], y - b[1]), l, font=f, fill=255, stroke_width=peso, stroke_fill=255)
        y += (b[3] - b[1]) + tam * 0.25
    return np.asarray(im, float) / 255

def emoji(path, tam=760):
    im = Image.open(path).convert("RGBA").resize((tam, tam), Image.LANCZOS)
    bg = Image.new("RGBA", (W, H), (255, 252, 240, 255)); bg.alpha_composite(im, ((W - tam) // 2, (H - tam) // 2))
    return np.asarray(bg.convert("RGB"), float) / 255

def hibrida(longe, perto, s_low=22, s_high=5, k_low=0.85, k_high=1.6):
    """longe/perto: máscaras 0..1 (1 = tinta) ou imagens RGB (0..1)."""
    def tinta(m):  # máscara -> quanto escurece
        return m if m.ndim == 2 else 1 - m.mean(2)
    A = tinta(longe); B = tinta(perto)
    low = gaussian_filter(A, s_low)
    high = B - gaussian_filter(B, s_high)
    L = BASE - k_low * low - k_high * high
    tom = np.array([1.0, 0.97, 0.88])  # papel amarelado
    return np.clip(L[..., None] * tom[None, None, :], 0, 1)

def simula(img, nome):
    """painel: perto (como no celular) | longe (borrado+pequeno) para conferir."""
    a = Image.fromarray((img * 255).astype(np.uint8))
    perto = a.resize((450, 450), Image.LANCZOS)
    longe = Image.fromarray((np.clip(gaussian_filter(img, (9, 9, 0)), 0, 1) * 255).astype(np.uint8)).resize((120, 120), Image.LANCZOS).resize((450, 450), Image.LANCZOS)
    p = Image.new("RGB", (920, 470), "white"); p.paste(perto, (5, 10)); p.paste(longe, (465, 10))
    p.save(f"img/sim_{nome}.png")

if __name__ == "__main__":
    import sys
    PARES = {
        "sim_nao": (texto(["NÃO"], 330, 6), texto(["SIM"], 300)),
    }
    for nome, (lo, pe) in PARES.items():
        im = hibrida(lo, pe)
        Image.fromarray((im * 255).astype(np.uint8)).save(f"img/{nome}.png")
        simula(im, nome)
        print(nome)
