"""Imagens escondidas em rabiscos: de perto só se vê rabisco de caneta,
apertando os olhos (ou afastando o celular) aparece o desenho.

Técnica: a imagem escondida vira só "quantidade de tinta" (baixa frequência).
Uma textura de rabiscos funciona como retícula: em cada pixel tem tinta se
textura < cobertura(imagem). De perto o olho vê os traços; borrado, só a média.
"""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = 1000                                   # lado do quadro escondido (px)


def blur(a, sigma):
    """borrão gaussiano em float (FFT, bordas circulares)"""
    h, w = a.shape
    fy = np.fft.fftfreq(h)[:, None]; fx = np.fft.rfftfreq(w)[None, :]
    g = np.exp(-2 * (math.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))
    return np.fft.irfft2(np.fft.rfft2(a) * g, s=a.shape)


def textura(seed, n=1500, larg=(9, 14), k=1.0):
    """campo de rabiscos 0..1 (uniforme depois de equalizar)"""
    rnd = random.Random(seed)
    im = Image.new('L', (S * 2, S * 2), 0); d = ImageDraw.Draw(im)
    for _ in range(int(n / k ** 2)):
        x, y = rnd.uniform(-100, S * 2 + 100), rnd.uniform(-100, S * 2 + 100)
        a = rnd.uniform(0, 2 * math.pi); passo = rnd.uniform(10, 18) * k
        curva = rnd.uniform(-0.25, 0.25); pts = []
        for _ in range(rnd.randint(8, 30)):
            pts.append((x, y)); a += curva + rnd.uniform(-0.3, 0.3)
            x += math.cos(a) * passo; y += math.sin(a) * passo
        d.line(pts, fill=rnd.randint(60, 255), width=int(rnd.randint(*larg) * k), joint='curve')
    im = im.filter(ImageFilter.GaussianBlur(2)).resize((S, S), Image.LANCZOS)
    a = np.asarray(im, np.float64)
    # tira a baixa frequência da própria textura (senão aparecem manchas no borrão)
    lo = blur(a, 12 * k)
    lo2 = blur((a - lo) ** 2, 12 * k)
    a = (a - lo) / np.sqrt(lo2 + 1) + np.random.default_rng(seed).random((S, S)) * 1e-3
    r = a.ravel().argsort().argsort().reshape(S, S) / (S * S)     # equaliza
    r = r - blur(r, 10 * k) + 0.5                                      # média local plana
    r = r.ravel().argsort().argsort().reshape(S, S) / (S * S)
    return r


def esconde(alvo, seed, faixa=(0.30, 0.62), sigma=14, k=1.0):
    """alvo: L 0..255 (0 = escuro). devolve máscara de tinta bool SxS"""
    b = np.asarray(alvo.filter(ImageFilter.GaussianBlur(sigma)), np.float64) / 255
    cob = faixa[1] - b * (faixa[1] - faixa[0])        # escuro -> mais tinta
    return textura(seed, k=k) < cob


# ---------- desenhos escondidos (silhuetas simples, legíveis só em borrão) ----------

def gato():
    im = Image.new('L', (S, S), 255); d = ImageDraw.Draw(im)
    d.polygon([(220, 380), (250, 110), (430, 290)], fill=0)            # orelhas
    d.polygon([(780, 380), (750, 110), (570, 290)], fill=0)
    d.ellipse([170, 230, 830, 860], fill=0)                             # cabeça
    for cx in (370, 630):                                               # olhos
        d.ellipse([cx - 80, 440, cx + 80, 590], fill=255)
        d.ellipse([cx - 28, 455, cx + 28, 575], fill=0)
    d.polygon([(455, 650), (545, 650), (500, 705)], fill=255)          # nariz
    for s in (-1, 1):                                                   # bigodes
        for dy in (-25, 20, 65):
            d.line([(500 + s * 110, 690), (500 + s * 420, 690 + dy * 1.6)], fill=255, width=16)
    return im


def caveira():
    im = Image.new('L', (S, S), 255); d = ImageDraw.Draw(im)
    d.ellipse([200, 90, 800, 700], fill=0)
    d.rounded_rectangle([320, 560, 680, 860], 60, fill=0)
    for cx in (375, 625):
        d.ellipse([cx - 105, 330, cx + 105, 540], fill=255)
    d.polygon([(500, 560), (450, 660), (550, 660)], fill=255)
    for x in range(355, 660, 75):
        d.rectangle([x, 740, x + 22, 860], fill=255)
    return im


def palavra(txt, fonte='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf', borda=0):
    im = Image.new('L', (S, S), 255); d = ImageDraw.Draw(im)
    tam = 420
    while True:
        f = ImageFont.truetype(fonte, tam)
        l, t, r, b = d.textbbox((0, 0), txt, font=f, stroke_width=borda)
        if r - l < S * 0.86: break
        tam -= 10
    d.text(((S - (r - l)) / 2 - l, (S - (b - t)) / 2 - t), txt, font=f, fill=0,
           stroke_width=borda, stroke_fill=0)
    return im


def render(mask, tinta=(28, 40, 110), papel=(255, 255, 255)):
    out = np.empty((S, S, 3), np.uint8); out[:] = papel; out[mask] = tinta
    return Image.fromarray(out)


if __name__ == '__main__':
    import sys
    for nome, alvo, faixa in [('gato', gato(), (0.24, 0.76)), ('caveira', caveira(), (0.33, 0.67)),
                              ('palavra', palavra('BOLO'), (0.37, 0.63))]:
        im = render(esconde(alvo, 7, faixa))
        im.save(f'/tmp/claude-0/-home-user-caderno-amarelo/8119f128-bafd-5c6d-b830-7e2d10738b81/scratchpad/{nome}.png')
        # "celular na mão" (pequeno) e "apertando os olhos" (borrado)
        peq = im.resize((300, 300), Image.LANCZOS)
        bor = im.filter(ImageFilter.GaussianBlur(14)).resize((300, 300), Image.LANCZOS)
        lado = Image.new('RGB', (620, 300), 'white'); lado.paste(peq, (0, 0)); lado.paste(bor, (320, 0))
        lado.save(f'/tmp/claude-0/-home-user-caderno-amarelo/8119f128-bafd-5c6d-b830-7e2d10738b81/scratchpad/{nome}_teste.png')
