"""Olho realista no meio de listras pretas e brancas que se abrem (efeito cachoeira).
Listras de cima sobem, as de baixo descem, a partir da linha do olho."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
CY = 960                 # linha do olho
PER = 38                 # período das listras (px)
VEL = 210                # px/s


def olho(L=300):
    """olho realista (RGBA) L x L*0.55"""
    S = 3; w, h = L * S, int(L * 0.55) * S
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w / 2, h / 2
    # formato amendoado: duas parábolas
    u = (x - cx) / (w / 2)
    lim = (1 - u ** 2) * (h / 2) * 0.98
    dentro = np.abs(y - cy) < lim
    # esclera com sombra nas bordas
    esc = np.clip(1 - (np.abs(y - cy) / (lim + 1e-3)) ** 3 * 0.35 - np.abs(u) ** 4 * 0.3, 0, 1)
    img = np.dstack([235 * esc + 10, 232 * esc + 10, 236 * esc + 12])
    # íris
    R = h * 0.47; dx, dy = x - cx, y - cy; r = np.hypot(dx, dy); a = np.arctan2(dy, dx)
    fib = 0.5 + 0.5 * np.sin(a * 70 + np.sin(a * 13) * 2) * np.sin(a * 23 + 1.3)
    rr = r / R
    base = np.array([60, 140, 170], np.float32)
    claro = np.array([140, 205, 215], np.float32)
    cor = base[None, None] * (1 - fib[..., None] * 0.35) + claro[None, None] * (fib[..., None] * 0.35)
    cor = cor * (0.75 + 0.35 * (1 - rr[..., None]))
    anel = np.clip((rr - 0.82) / 0.18, 0, 1)[..., None]           # borda escura da íris
    cor = cor * (1 - anel * 0.75)
    iris = rr < 1
    img = np.where(iris[..., None], cor, img)
    pup = r < R * 0.36
    img = np.where(pup[..., None], np.array([12, 14, 18], np.float32), img)
    # sombra da pálpebra de cima
    somb = np.clip(1 - (y - (cy - lim)) / (h * 0.25), 0, 1) * 0.45
    img = img * (1 - somb[..., None])
    # brilhos
    for (bx, by, br) in [(cx - R * 0.35, cy - R * 0.38, R * 0.16), (cx + R * 0.3, cy + R * 0.3, R * 0.06)]:
        g = np.exp(-((x - bx) ** 2 + (y - by) ** 2) / (2 * br ** 2))
        img = img + (255 - img) * g[..., None] * 0.95
    alpha = dentro.astype(np.float32) * 255
    out = Image.fromarray(np.dstack([img.clip(0, 255), alpha]).astype(np.uint8), 'RGBA')
    out = out.resize((L, int(L * 0.55)), Image.LANCZOS)
    # contorno da pálpebra
    m = Image.new('RGBA', out.size, (0, 0, 0, 0)); d = ImageDraw.Draw(m)
    return out


OLHO = olho(300)


def listras(t, vel=VEL):
    """quadro das listras no tempo t (np uint8 HxWx3)"""
    y = np.arange(H, dtype=np.float32)
    dist = np.abs(y - CY)                       # distância da linha do olho
    fase = (dist - t * vel) / PER               # conteúdo anda pra longe do olho
    v = (np.sin(fase * 2 * np.pi) > 0).astype(np.float32)
    # antialias leve
    v = 0.5 + 0.5 * np.tanh(np.sin(fase * 2 * np.pi) * 6)
    col = (18 + v * 230)
    img = np.repeat(col[:, None], W, 1)
    rgb = np.dstack([img, img, img * 1.0 + 6 * v[:, None]]).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(rgb)
    # faixa fina na linha do olho
    d = ImageDraw.Draw(im); d.rectangle([0, CY - 3, W, CY + 3], fill=(20, 20, 24))
    # moldura escura atrás do olho
    im.paste(OLHO, (W // 2 - OLHO.width // 2, CY - OLHO.height // 2), OLHO)
    return im


if __name__ == '__main__':
    listras(1.0).resize((540, 960)).save('t1.png')
    OLHO.save('t_olho.png')
