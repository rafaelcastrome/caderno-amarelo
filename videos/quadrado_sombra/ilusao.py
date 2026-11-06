"""Ilusão do quadrado na sombra (desenho próprio, no espírito do tabuleiro de Adelson).
Tabuleiro 5x5 em perspectiva, cilindro verde fazendo sombra. O quadrado A (escuro, no sol)
e o B (claro, na sombra) têm EXATAMENTE o mesmo cinza (CINZA)."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

S = 960            # lado do painel
N = 6
CLARO, FATOR = 214.0, 0.56
CINZA = int(round(CLARO * FATOR))   # 120 = cor do A e do B
A_CEL, B_CEL = (4, 4), (2, 3)       # (coluna, linha); linha 0 = fundo
C = np.array([4.6, 1.4])          # pé do cilindro (coords do tabuleiro)
DIR = np.array([2.5, 3.5]) - C; DIR = DIR / np.linalg.norm(DIR)

# cantos do tabuleiro na imagem: (0,0) fundo-esq, (5,0) fundo-dir, (5,5) frente-dir, (0,5) frente-esq
QUAD = np.array([[205, 170], [755, 170], [925, 760], [35, 760]], float)

def homografia(src, dst):
    A = []
    for (x, y), (u, v) in zip(src, dst):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y, -u], [0, 0, 0, x, y, 1, -v * x, -v * y, -v]]
    _, _, vt = np.linalg.svd(np.array(A)); return vt[-1].reshape(3, 3) / vt[-1][-1]

H = homografia([[0, 0], [N, 0], [N, N], [0, N]], QUAD)
Hi = np.linalg.inv(H)

def proj(x, y):
    p = H @ [x, y, 1]; return p[:2] / p[2]

def quad_cel(c, r, enc=0.0):
    return [tuple(proj(x, y)) for x, y in [(c + enc, r + enc), (c + 1 - enc, r + enc), (c + 1 - enc, r + 1 - enc), (c + enc, r + 1 - enc)]]

def sombra(bx, by):
    rel = np.stack([bx - C[0], by - C[1]], -1)
    t = rel @ DIR
    perp = np.abs(rel[..., 0] * DIR[1] - rel[..., 1] * DIR[0])
    d = np.where(t < 0, np.hypot(rel[..., 0], rel[..., 1]), perp)   # meio-disco atrás do cilindro
    d = np.where(t > 5.5, np.hypot(perp, t - 5.5), d)
    k = np.clip((d - 0.82) / 0.55, 0, 1); k = k * k * (3 - 2 * k)   # borda suave
    return FATOR + (1 - FATOR) * k

def desenhar(ss=2):
    W = S * ss
    yy, xx = np.mgrid[0:W, 0:W].astype(float) / ss
    p = np.stack([xx, yy, np.ones_like(xx)], -1) @ Hi.T
    bx, by = p[..., 0] / p[..., 2], p[..., 1] / p[..., 2]
    dentro = (bx >= 0) & (bx < N) & (by >= 0) & (by < N)
    claro = ((np.floor(bx) + np.floor(by)) % 2 == 1)
    base = np.where(claro, CLARO, CLARO * FATOR)
    val = base * sombra(bx, by)
    img = np.zeros((W, W, 3)); img[:] = (236, 232, 224)
    # fundo: parede/mesa clara com leve degradê
    img *= (0.94 + 0.06 * (yy / S))[..., None]
    for k in range(3): img[..., k] = np.where(dentro, val, img[..., k])
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    # espessura frontal do tabuleiro
    fl, fr = proj(0, N) * ss, proj(N, N) * ss
    esp = 34 * ss
    d.polygon([tuple(fl), tuple(fr), (fr[0], fr[1] + esp), (fl[0], fl[1] + esp)], fill=(88, 82, 78))
    # cilindro verde
    cx, cy = proj(*C) * ss
    r = 70 * ss; h = 230 * ss; e = r * 0.36
    cil = Image.new("RGBA", im.size, (0, 0, 0, 0)); dc = ImageDraw.Draw(cil)
    corpo = np.zeros((int(h + 2 * e), int(2 * r), 4), np.uint8)
    xs = np.linspace(-1, 1, corpo.shape[1])
    luz = np.clip(0.35 + 0.75 * np.sqrt(np.clip(1 - xs ** 2, 0, 1)) * (0.6 + 0.4 * (xs > -0.2)) - 0.25 * (xs < -0.3) * (-xs), 0.2, 1.1)
    cor = np.array([60, 168, 72])
    corpo[..., :3] = np.clip(cor[None, :] * luz[:, None], 0, 255).astype(np.uint8)[None]
    corpo[..., 3] = 255
    yy2, xx2 = np.mgrid[0:corpo.shape[0], 0:corpo.shape[1]]
    u = (xx2 - r) / r
    topo = e + 0 * u; fundo = h + e * np.sqrt(np.clip(1 - u ** 2, 0, 1))
    corpo[..., 3] = np.where((yy2 >= topo - e * np.sqrt(np.clip(1 - u ** 2, 0, 1))) & (yy2 <= fundo), 255, 0)
    cil.paste(Image.fromarray(corpo), (int(cx - r), int(cy - h - e)), Image.fromarray(corpo))
    dc.ellipse([cx - r, cy - h - e, cx + r, cy - h + e], fill=(150, 214, 150))
    im.paste(cil, (0, 0), cil)
    im = im.resize((S, S), Image.LANCZOS)
    return im

def letras(im, fonte):
    d = ImageDraw.Draw(im)
    for nome, (c, r) in (("A", A_CEL), ("B", B_CEL)):
        x, y = proj(c + 0.5, r + 0.5)
        d.text((x, y - 4), nome, font=fonte, fill=(235, 40, 40), anchor="mm", stroke_width=5, stroke_fill=(255, 255, 255))
    return im

if __name__ == "__main__":
    im = desenhar()
    a = np.array(im)
    for nome, (c, r) in (("A", A_CEL), ("B", B_CEL)):
        m = Image.new("L", (S, S), 0); ImageDraw.Draw(m).polygon(quad_cel(c, r, 0.04), fill=255)
        v = a[np.array(m) > 0]; print(nome, v.min(0), v.max(0))
    im.save("/tmp/claude-0/ilusao.png")
