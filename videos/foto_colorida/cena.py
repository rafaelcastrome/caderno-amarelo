"""Fruteira colorida (desenho próprio) + versão P&B com grade de linhas coloridas.
A grade colorida faz o cérebro 'pintar' a imagem cinza (assimilação de cor)."""
import numpy as np, colorsys
from PIL import Image, ImageDraw, ImageFilter

L = 900
INK = (35, 30, 30)


def colorida():
    S = 2; im = Image.new('RGB', (L * S, L * S), (255, 255, 255)); d = ImageDraw.Draw(im)
    s = lambda *v: [x * S for x in v]
    lw = 6 * S
    # fundo: parede e mesa
    d.rectangle(s(0, 0, L, 560), fill=(120, 200, 235))
    d.rectangle(s(0, 560, L, L), fill=(230, 120, 40))
    for x in range(0, L, 90):
        d.line(s(x, 560, x - 60, L), fill=(200, 95, 30), width=4 * S)
    # sol na janela
    d.rounded_rectangle(s(560, 60, 840, 300), 20 * S, fill=(255, 255, 255), outline=INK, width=lw)
    d.rectangle(s(575, 75, 825, 285), fill=(70, 160, 230))
    d.ellipse(s(640, 110, 760, 230), fill=(255, 220, 0), outline=INK, width=lw)
    s = lambda *v: [(x + (40 if i % 2 else 0)) * S for i, x in enumerate(v)]
    # melancia fatia atrás
    d.pieslice(s(40, 300, 420, 680), 180, 360, fill=(30, 160, 60), outline=INK, width=lw)
    d.pieslice(s(65, 325, 395, 655), 180, 360, fill=(235, 40, 60))
    for (x, y) in [(130, 430), (190, 380), (250, 360), (310, 380), (360, 430), (220, 440), (290, 430)]:
        d.ellipse(s(x - 9, y - 14, x + 9, y + 14), fill=INK)
    # uvas roxas
    for (x, y) in [(260, 470), (300, 440), (340, 470), (280, 500), (320, 505), (300, 410), (360, 430), (240, 430)]:
        d.ellipse(s(x - 34, y - 34, x + 34, y + 34), fill=(140, 40, 180), outline=INK, width=lw)
    # banana amarela
    d.chord(s(330, 330, 720, 640), 200, 340, fill=(255, 220, 30), outline=INK, width=lw)
    # laranja
    d.ellipse(s(560, 410, 720, 570), fill=(255, 140, 0), outline=INK, width=lw)
    d.ellipse(s(628, 418, 650, 436), fill=(40, 140, 40))
    # maçã vermelha
    d.ellipse(s(400, 440, 580, 620), fill=(225, 25, 35), outline=INK, width=lw)
    d.line(s(490, 445, 500, 400), fill=INK, width=lw)
    d.ellipse(s(500, 395, 560, 425), fill=(60, 180, 60), outline=INK, width=4 * S)
    # brilhos
    for (x, y, r) in [(450, 490, 16), (600, 450, 10)]:
        d.ellipse(s(x - r, y - r, x + r, y + r), fill=(255, 255, 255))
    s = lambda *v: [x * S for x in v]
    # tigela azul
    d.chord(s(110, 400, 790, 900), 0, 180, fill=(40, 70, 210), outline=INK, width=lw)
    return im.resize((L, L), Image.LANCZOS)


def cinza(im):
    a = np.asarray(im, np.float32)
    g = a @ np.array([0.299, 0.587, 0.114], np.float32)
    return Image.fromarray(np.repeat(g[..., None], 3, 2).clip(0, 255).astype(np.uint8))


def satura(im, f=1.6):
    a = np.asarray(im, np.float32) / 255
    g = (a @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    return Image.fromarray(((g + (a - g) * f).clip(0, 1) * 255).astype(np.uint8))


def grade(im, passo=16, larg=3):
    """linhas diagonais coloridas (cor da imagem original, saturada) por cima do cinza"""
    base = np.asarray(cinza(im), np.float32)
    cor = np.asarray(satura(im.filter(ImageFilter.GaussianBlur(3))), np.float32)
    y, x = np.mgrid[0:L, 0:L]
    m1 = ((x + y) % passo) < larg; m2 = ((x - y) % passo) < larg
    m = (m1 | m2)[..., None]
    return Image.fromarray(np.where(m, cor, base).astype(np.uint8))


if __name__ == '__main__':
    c = colorida(); c.save('t_colorida.png'); grade(c).save('t_grade.png'); cinza(c).save('t_cinza.png')
