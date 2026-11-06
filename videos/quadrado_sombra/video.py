#!/usr/bin/env python3
"""Quadrado na sombra: gera quadros (PIL) e o mp4 final com narração + efeitos.
uso: python3 video.py            -> quadrado_sombra.mp4
     python3 video.py 3 12.5     -> só salva os quadros desses segundos em /tmp/claude-0/q_*.png"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import ilusao as I

AQUI = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQUI)
W, H, FPS = 1080, 1920, 30
PX, PY = 60, 470                      # canto do painel da ilusão
PAPEL = (251, 245, 223); TINTA = (31, 31, 36); VERM = (214, 40, 40); AZUL = (29, 78, 216)
TL = json.load(open("timeline.json"))["cenas"]
T = [c["start"] for c in TL]; FIM = TL[-1]["end"]
fonte = lambda s: ImageFont.truetype("Caveat-Bold.ttf", s)
F_DS = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 44)
F_D = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 34)

def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def back(x):
    x = min(1, max(0, x)); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ---------- fundo: papel quadriculado + margem ----------
def papel():
    im = Image.new("RGB", (W, H), PAPEL); d = ImageDraw.Draw(im)
    for x in range(0, W, 44): d.line([(x, 0), (x, H)], fill=(214, 224, 232), width=2)
    for y in range(0, H, 44): d.line([(0, y), (W, y)], fill=(214, 224, 232), width=2)
    d.line([(88, 0), (88, H)], fill=(236, 140, 140), width=3)
    return im

ILU = I.desenhar()
ILU_LET = I.letras(ILU.copy(), fonte(96))
def qcel(c, r, enc=0.0):
    return [(x + PX, y + PY) for x, y in I.quad_cel(c, r, enc)]
QA, QB = qcel(*I.A_CEL), qcel(*I.B_CEL)
QDEST = qcel(I.A_CEL[0] + 1, I.A_CEL[1])     # casa à direita do A
CINZA = (I.CINZA,) * 3

def base(letras=True):
    im = papel()
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([PX - 4, PY + 10, PX + I.S + 12, PY + I.S + 22], fill=(60, 40, 10, 90))
    im.paste(sh.filter(ImageFilter.GaussianBlur(14)), (0, 0), sh.filter(ImageFilter.GaussianBlur(14)))
    d = ImageDraw.Draw(im)
    d.rectangle([PX - 12, PY - 12, PX + I.S + 11, PY + I.S + 11], fill=(255, 255, 255))
    im.paste(ILU_LET if letras else ILU, (PX, PY))
    for (x, y, a) in ((PX + 60, PY - 22, -8), (PX + I.S - 60, PY - 22, 8)):   # fitas
        f = Image.new("RGBA", (170, 54), (246, 226, 150, 190)); f = f.rotate(a, expand=True)
        im.paste(f, (int(x - f.width / 2), int(y - f.height / 2)), f)
    return im

BASE, BASE_SEM = base(True), base(False)

def texto(d, xy, s, tam, cor=TINTA, anc="mm", contorno=0):
    d.text(xy, s, font=fonte(tam), fill=cor, anchor=anc,
           stroke_width=contorno, stroke_fill=PAPEL if contorno else None)

def rich(d, y, partes, tam):
    """linha centralizada com trechos coloridos: [(texto, cor), ...]"""
    f = fonte(tam); larg = sum(d.textlength(s, font=f) for s, _ in partes); x = (W - larg) / 2
    for s, c in partes:
        d.text((x, y), s, font=f, fill=c, anchor="lm"); x += d.textlength(s, font=f)

def sublinha(d, x0, x1, y, p, cor=VERM):
    if p <= 0: return
    pts = [(x0 + (x1 - x0) * k / 40, y + 6 * math.sin(k * 0.9)) for k in range(int(40 * p) + 1)]
    if len(pts) > 1: d.line(pts, fill=cor, width=6, joint="curve")

def anel(d, quad, t, cor=VERM, larg=8):
    cx = sum(p[0] for p in quad) / 4; cy = sum(p[1] for p in quad) / 4
    r = 95 + 6 * math.sin(t * 9)
    d.ellipse([cx - r, cy - r * 0.8, cx + r, cy + r * 0.8], outline=cor, width=larg)

def tracejado(d, quad, t, cor=VERM):
    pts = quad + [quad[0]]
    off = (t * 120) % 36
    for a, b in zip(pts, pts[1:]):
        L = math.dist(a, b); s = -off
        while s < L:
            s0, s1 = max(0, s), min(L, s + 20)
            if s1 > s0:
                p = lambda u: (a[0] + (b[0] - a[0]) * u / L, a[1] + (b[1] - a[1]) * u / L)
                d.line([p(s0), p(s1)], fill=cor, width=7)
            s += 36

def interp(q1, q2, k):
    return [(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k) for a, b in zip(q1, q2)]

def peca(im, quad, sombra=0.0, escala=1.0, borda=True):
    cx = sum(p[0] for p in quad) / 4; cy = sum(p[1] for p in quad) / 4
    q = [(cx + (x - cx) * escala, cy + (y - cy) * escala) for x, y in quad]
    if sombra > 0:
        s = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(s).polygon([(x + 18 * sombra, y + 26 * sombra) for x, y in q], fill=(0, 0, 0, int(110 * sombra)))
        s = s.filter(ImageFilter.GaussianBlur(10)); im.paste(s, (0, 0), s)
    d = ImageDraw.Draw(im); d.polygon(q, fill=CINZA)
    if borda: d.line(q + [q[0]], fill=VERM, width=5)
    return q

# ---------- capa (tampa com 2 buracos) ----------
def tampa():
    im = papel().convert("RGBA")
    m = Image.new("L", (W, H), 255); dm = ImageDraw.Draw(m)
    for q in (qcel(*I.A_CEL, 0.12), qcel(*I.B_CEL, 0.12)): dm.polygon(q, fill=0)
    im.putalpha(m)
    d = ImageDraw.Draw(im)
    for q in (qcel(*I.A_CEL, 0.12), qcel(*I.B_CEL, 0.12)): d.line(q + [q[0]], fill=TINTA, width=6)
    for nome, q in (("A", qcel(*I.A_CEL, 0.12)), ("B", qcel(*I.B_CEL, 0.12))):
        cx = sum(p[0] for p in q) / 4; y = min(p[1] for p in q)
        d.text((cx, y - 40), nome, font=fonte(84), fill=VERM, anchor="mm")
    return im
TAMPA = tampa()

# ---------- cartão Seguir ----------
def cartao(seguindo, apertar):
    c = Image.new("RGBA", (900, 470), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    d.rounded_rectangle([0, 0, 899, 469], 46, fill=(255, 255, 255, 255), outline=(220, 214, 190), width=3)
    d.ellipse([50, 50, 210, 210], fill=(255, 210, 63)); d.ellipse([50, 50, 210, 210], outline=TINTA, width=5)
    for k in range(3): d.line([(88, 100 + k * 30), (172, 100 + k * 30)], fill=(29, 78, 216), width=5)
    d.line([(100, 80), (100, 182)], fill=VERM, width=4)
    d.text((245, 100), "Cardeno_Amarelo", font=F_DS, fill=TINTA, anchor="lm")
    d.text((245, 160), "uma ilusão nova todo dia", font=F_D, fill=(90, 90, 96), anchor="lm")
    s = 1 - 0.06 * apertar
    bw, bh = 800 * s, 140 * s; x0, y0 = 450 - bw / 2, 300 - bh / 2
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], 30, fill=(225, 225, 230) if seguindo else (0, 149, 246))
    d.text((450, 300), "Seguindo ✓" if seguindo else "Seguir", font=ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60), fill=TINTA if seguindo else (255, 255, 255), anchor="mm")
    return c

def dedo(d, x, y, k):
    # dedinho simples: círculo + onda do toque
    if k > 0:
        r = 40 + 90 * k; d.ellipse([x - r, y - r, x + r, y + r], outline=(0, 149, 246), width=6)
    d.ellipse([x - 34, y - 34, x + 34, y + 34], fill=(247, 222, 206), outline=TINTA, width=4)

# ---------- marca d'água móvel ----------
MARCAS = [(300, 405), (780, 405), (780, 1860), (300, 1860)]
def marca(im, t):
    i = int(t // 5); k = ease((t % 5 - 4.4) / 0.6)
    a, b = MARCAS[i % 4], MARCAS[(i + 1) % 4]
    x, y = a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(l)
    d.rounded_rectangle([x - 175, y - 30, x + 175, y + 30], 30, fill=(255, 250, 240, 170))
    d.text((x, y), "@Cardeno_Amarelo", font=fonte(46), fill=(31, 31, 36, 150), anchor="mm")
    im.paste(l, (0, 0), l)

# ---------- quadro ----------
TOPO_Y = 150
def titulo(d, t):
    rich(d, TOPO_Y, [("qual quadrado é ", TINTA)], 78)
    texto(d, (W / 2, TOPO_Y + 105), "MAIS ESCURO?", 128, VERM)
    sublinha(d, 250, 830, TOPO_Y + 180, 1)

def rodape(d, s, cor=TINTA, tam=96, y=1580):
    texto(d, (W / 2, y), s, tam, cor)

def quadro(t):
    im = BASE.copy(); d = ImageDraw.Draw(im)
    c = sum(1 for s in T if t >= s)          # cena atual (1..10)
    ct = t - T[c - 1]
    if c <= 2:
        titulo(d, t)
        if c == 1:
            rich(d, 1580, [("A", VERM), (" ou ", TINTA), ("B", VERM), ("?", TINTA)], 150)
            rodape(d, "responde rápido!", TINTA, 70, 1720)
        else:
            rodape(d, "comenta antes de eu mostrar!", TINTA, 74, 1540)
            n = 3 - int((t - (T[1] + TL[1]["fala"] * 0.55)) // 0.85)
            if t >= T[1] + TL[1]["fala"] * 0.55 and n >= 1:
                k = ((t - (T[1] + TL[1]["fala"] * 0.55)) % 0.85) / 0.85
                r = 90 * back(k * 3)
                d.ellipse([W / 2 - r, 1700 - r, W / 2 + r, 1700 + r], outline=VERM, width=8)
                texto(d, (W / 2, 1700), str(n), int(140 * back(k * 3)) + 1, VERM)
    elif c == 3:
        titulo(d, t)
        if ct < 1.9:
            anel(d, QA, t); rodape(d, "o A é mais escuro... né?", TINTA, 80, 1560)
        else:
            rodape(d, "recorta o B...", TINTA, 84, 1560)
            k = ease((ct - 3.0) / 1.7)
            if ct < 3.0:
                tracejado(d, QB, t)
            else:
                q = interp(QB, QDEST, k)
                peca(im, q, sombra=math.sin(k * math.pi), escala=1 + 0.15 * math.sin(k * math.pi))
                d = ImageDraw.Draw(im)
            if ct > 4.7: rodape(d, "...e põe do lado do A", TINTA, 84, 1680)
    elif c == 4:
        peca(im, QDEST, borda=ct % 0.5 < 0.3)
        d = ImageDraw.Draw(im)
        k = back(ct / 0.35)
        texto(d, (W / 2, TOPO_Y + 60), "A MESMA COR!", int(150 * k) + 1, VERM)
        sublinha(d, 200, 880, TOPO_Y + 150, min(1, ct / 0.6))
        rodape(d, "o mesmíssimo cinza", TINTA, 90, 1580)
        x0 = QA[1][0]; y0 = (QA[1][1] + QA[2][1]) / 2
        d.line([(x0, y0 + 210), (x0, y0 + 80)], fill=VERM, width=7)
        d.polygon([(x0 - 22, y0 + 95), (x0 + 22, y0 + 95), (x0, y0 + 60)], fill=VERM)
    elif c in (5, 6, 7):
        if c == 5 and ct < 0.6:
            k = ease(ct / 0.6); peca(im, interp(QDEST, QB, k), sombra=math.sin(k * math.pi)); d = ImageDraw.Draw(im)
        if c == 5:
            y = -H + H * ease((ct - 0.5) / 1.0)
        elif c == 6:
            y = 0
        else:
            y = -H * ease(ct / 0.8)
        if y > -H: im.paste(TAMPA, (0, int(y)), TAMPA)
        d = ImageDraw.Draw(im)
        if c == 5: texto(d, (W / 2, TOPO_Y + 60), "ainda não acredita?", 100, TINTA)
        if c == 6:
            texto(d, (W / 2, TOPO_Y + 60), "IGUAIZINHOS!", int(150 * back(ct / 0.35)) + 1, VERM)
            sublinha(d, 220, 860, TOPO_Y + 150, min(1, ct / 0.6))
        if c == 7: texto(d, (W / 2, TOPO_Y + 60), "agora tira o papel...", 96, TINTA)
        if c >= 6: rodape(d, "mesma cor", TINTA, 96, 1580)
    elif c == 8:
        anel(d, QB, t); texto(d, (W / 2, TOPO_Y + 60), "...e o B clareou de novo!", 92, TINTA)
        texto(d, (W / 2, 1600), "?!", 170, VERM)
    elif c == 9:
        linhas = [(0.0, [("teu cérebro vê a ", TINTA), ("SOMBRA", VERM)]),
                  (2.2, [("e clareia o ", TINTA), ("B", VERM), (" sozinho", TINTA)]),
                  (4.9, [("tu não vê a cor de verdade", TINTA)]),
                  (6.6, [("tu vê o que ele ", TINTA), ("ACHA", VERM)])]
        texto(d, (W / 2, TOPO_Y + 60), "por quê?", 110, VERM)
        for i, (t0, partes) in enumerate(linhas):
            if ct >= t0: rich(d, 1530 + i * 95, partes, 76)
        if ct < 4.9:
            tracejado(d, [(PX + 340, PY + 470), (PX + 520, PY + 300), (PX + 640, PY + 380), (PX + 430, PY + 640)], t, AZUL)
    else:
        texto(d, (W / 2, TOPO_Y + 40), "todo dia uma ilusão", 92, TINTA)
        texto(d, (W / 2, TOPO_Y + 140), "que teu cérebro não aguenta", 80, VERM)
        k = ease(ct / 0.5)
        tap = T[9] + 2.7
        car = cartao(t >= tap + 0.1, max(0, 1 - abs(t - tap) / 0.12))
        cy = int(H - (H - 1240) * k)
        im.paste(car, (90, cy), car); d = ImageDraw.Draw(im)
        if ct > 1.3:
            kk = ease((t - (tap - 1.2)) / 1.0)
            dedo(d, 1000 - 180 * kk, 1760 - 190 * kk, max(0, (t - tap) / 0.5) if t - tap < 0.5 else 0)
        rodape(d, "amanhã tem outra", TINTA, 70, 1820)
    if c < 10: marca(im, t)
    # loop: últimos 0,35 s voltam pro quadro de abertura
    if t > FIM - 0.35:
        a = (t - (FIM - 0.35)) / 0.35
        im = Image.blend(im, QUADRO0, ease(a))
    return im

QUADRO0 = None
QUADRO0 = quadro(0.0)

def sfx():
    SR = 44100; n = int(FIM * SR) + SR; x = np.zeros(n)
    def put(t, s):
        i = int(t * SR); x[i:i + len(s)] += s[:max(0, n - i)]
    tt = lambda d: np.arange(int(d * SR)) / SR
    tick = lambda f: np.sin(2 * np.pi * f * tt(0.09)) * np.exp(-tt(0.09) * 40) * 0.35
    def whoop(d, f0, f1, v=0.18):
        u = tt(d); f = f0 + (f1 - f0) * u / d
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * u / d) * v
    def ding():
        u = tt(1.2); return sum(np.sin(2 * np.pi * f * u) * np.exp(-u * 3) for f in (784, 988, 1175)) * 0.12
    c0 = T[1] + TL[1]["fala"] * 0.55
    for k in range(3): put(c0 + k * 0.85, tick(1200))
    put(T[2] + 3.0, whoop(0.8, 300, 700)); put(T[2] + 4.65, tick(500))
    put(T[3], ding())
    put(T[4], whoop(0.5, 700, 300)); put(T[4] + 0.6, whoop(0.9, 200, 120, 0.25))
    put(T[5], ding())
    put(T[6], whoop(0.7, 150, 260, 0.22))
    put(T[9] + 2.7, tick(900)); put(T[9] + 2.75, tick(1400))
    import wave
    with wave.open("audio/sfx.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for s in sys.argv[1:]:
            quadro(float(s)).save(f"/tmp/claude-0/q_{s}.png")
        sys.exit()
    sfx()
    nf = int(FIM * FPS)
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-i", "narration.mp3", "-i", "audio/sfx.wav",
                          "-filter_complex", "[1:a][2:a]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]",
                          "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "23",
                          "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest", "quadrado_sombra.mp4"],
                         stdin=subprocess.PIPE)
    for i in range(nf):
        p.stdin.write(quadro(i / FPS).convert("RGB").tobytes())
    p.stdin.close(); p.wait()
    print("ok", nf / FPS, "s")
