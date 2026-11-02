"""Ilusão de deriva periférica (desenho próprio): anéis com a sequência
preto -> azul -> branco -> amarelo. Parada, mas parece girar no canto do olho."""
import numpy as np
from PIL import Image

PRETO = (20, 20, 25); AZUL = (40, 80, 200); BRANCO = (255, 255, 255); AMARELO = (250, 215, 40)
SEQ = np.array([PRETO, AZUL, BRANCO, AMARELO], np.float32)


def disco(R, aneis=6, setores=28, sentido=1, ss=3):
    n = 2 * R * ss
    y, x = np.mgrid[0:n, 0:n].astype(np.float32) / ss - R + 0.5 / ss
    r = np.hypot(x, y); a = (np.arctan2(y, x) / (2 * np.pi)) % 1
    r0 = R * 0.16                      # miolo sem listras
    anel = np.floor((r - r0) / (R - r0) * aneis).astype(int)
    meio = r0 + (anel + 0.5) * (R - r0) / aneis
    nseg = np.maximum(6, np.round(2 * np.pi * meio / ((R - r0) / aneis) / 1.25))
    u = (a * nseg + anel * 0.37) % 1
    if sentido < 0: u = 1 - u
    # cada "peixinho": preto (fino) | azul (largo) | branco (fino) | amarelo (largo)
    idx = np.digitize(u, [0.12, 0.5, 0.62])
    sentido_anel = np.where(anel % 2 == 0, idx, 3 - idx) if False else idx
    img = SEQ[sentido_anel]
    img[r < r0] = SEQ[0]
    alpha = (r < R).astype(np.float32)
    rgba = np.dstack([img, alpha[..., None] * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA').resize((2 * R, 2 * R), Image.LANCZOS)


def painel(L=920):
    im = Image.new('RGBA', (L, L), (0, 0, 0, 0))
    R = L // 4 - 4
    for i, (cx, cy) in enumerate([(L // 4, L // 4), (3 * L // 4, L // 4), (L // 4, 3 * L // 4), (3 * L // 4, 3 * L // 4)]):
        s = 1 if (i in (0, 3)) else -1
        d = disco(R, sentido=s)
        im.paste(d, (cx - R, cy - R), d)
    return im


if __name__ == '__main__':
    bg = Image.new('RGB', (920, 920), (255, 255, 255)); p = painel(); bg.paste(p, (0, 0), p); bg.save('teste_ilusao.png')
