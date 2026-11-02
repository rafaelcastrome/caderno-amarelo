"""Figuras realistas (sombreadas em 3D) pro vídeo maior_coisa. Gera sprites/*.png uma vez.
Uso: python3 sprites.py
"""
import math, os
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter

LUZ = np.array([-0.5, -0.62, 0.6]); LUZ = LUZ / np.linalg.norm(LUZ)
HV = LUZ + np.array([0, 0, 1.0]); HV = HV / np.linalg.norm(HV)


def ruido(h, w, seed, oct=6, base=4):
    """fBm 2D em [0,1]"""
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(oct):
        n = base * 2 ** o
        g = r.random((max(2, int(n * h / max(h, w))) + 1, n + 1)).astype(np.float32)
        im = Image.fromarray(g).resize((w, h), Image.BICUBIC)
        out += amp * np.asarray(im); tot += amp; amp *= 0.5
    out /= tot; out = (out - out.min()) / (out.max() - out.min() + 1e-9)
    return out


class Cena3D:
    """z-buffer de primitivas sombreadas (elipsoides e cápsulas) em pixels"""
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.z = np.full((h, w), -1e9, np.float32)
        self.n = np.zeros((h, w, 3), np.float32); self.c = np.zeros((h, w, 3), np.float32)
        self.sp = np.zeros((h, w), np.float32); self.tex = np.zeros((h, w), np.float32)
        self.Y, self.X = np.mgrid[0:h, 0:w].astype(np.float32)

    def _put(self, sl, z, nx, ny, nz, cor, spec, m):
        zz = self.z[sl]; ok = m & (z > zz)
        zz[ok] = z[ok]
        nn = self.n[sl]; nn[ok, 0] = nx[ok]; nn[ok, 1] = ny[ok]; nn[ok, 2] = nz[ok]
        cc = self.c[sl]; cc[ok] = np.array(cor, np.float32) / 255
        ss = self.sp[sl]; ss[ok] = spec

    def _box(self, x0, y0, x1, y1):
        x0 = max(0, int(x0) - 2); y0 = max(0, int(y0) - 2); x1 = min(self.w, int(x1) + 3); y1 = min(self.h, int(y1) + 3)
        return (slice(y0, y1), slice(x0, x1))

    def elipse(self, cx, cy, rx, ry, rz, z0, cor, spec=0.25):
        sl = self._box(cx - rx, cy - ry, cx + rx, cy + ry)
        X, Y = self.X[sl], self.Y[sl]
        q = ((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2; m = q < 1
        h = rz * np.sqrt(np.clip(1 - q, 0, 1))
        nx, ny, nz = (X - cx) / rx ** 2, (Y - cy) / ry ** 2, h / rz ** 2
        L = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2) + 1e-9
        self._put(sl, z0 + h, nx / L, ny / L, nz / L, cor, spec, m)

    def capsula(self, x1, y1, x2, y2, r1, r2, z0, cor, spec=0.25, achata=1.0):
        sl = self._box(min(x1, x2) - max(r1, r2), min(y1, y2) - max(r1, r2), max(x1, x2) + max(r1, r2), max(y1, y2) + max(r1, r2))
        X, Y = self.X[sl], self.Y[sl]
        dx, dy = x2 - x1, y2 - y1; ll = dx * dx + dy * dy + 1e-9
        t = np.clip(((X - x1) * dx + (Y - y1) * dy) / ll, 0, 1)
        px, py = X - (x1 + t * dx), Y - (y1 + t * dy)
        d = np.sqrt(px ** 2 + py ** 2); r = r1 + (r2 - r1) * t; m = d < r
        h = np.sqrt(np.clip(r ** 2 - d ** 2, 0, None))
        nx, ny, nz = px / (r + 1e-9), py / (r + 1e-9), h / (r + 1e-9)
        self._put(sl, z0 + h * achata, nx, ny, nz, cor, spec, m)

    def poligono(self, pts, z0, cor, normal=(0, 0, 1), spec=0.05):
        from PIL import ImageDraw
        mk = Image.new('L', (self.w, self.h), 0); ImageDraw.Draw(mk).polygon(pts, fill=255)
        m = np.asarray(mk) > 127
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        sl = self._box(min(xs), min(ys), max(xs), max(ys)); m = m[sl]
        z = np.full(m.shape, z0, np.float32); nn = np.array(normal, np.float32); nn /= np.linalg.norm(nn)
        self._put(sl, z, z * 0 + nn[0], z * 0 + nn[1], z * 0 + nn[2], cor, spec, m)

    def render(self, textura=None, amb=0.38, dif=0.75, brilho=40, ao=None):
        m = self.z > -1e8
        nl = np.clip((self.n * LUZ).sum(2), 0, 1)
        sh = np.clip((self.n * HV).sum(2), 0, 1) ** brilho
        c = self.c.copy()
        if textura is not None: c *= textura[..., None]
        rim = np.clip(1 - self.n[..., 2], 0, 1) ** 3          # luz de recorte suave
        out = c * (amb + dif * nl)[..., None] + (self.sp * sh)[..., None] + 0.12 * rim[..., None] * c
        if ao is not None: out *= ao[..., None]
        rgba = np.zeros((self.h, self.w, 4), np.uint8)
        rgba[..., :3] = np.clip(out * 255, 0, 255).astype(np.uint8); rgba[..., 3] = m * 255
        return Image.fromarray(rgba)


def reduz(im, f=2):
    return im.resize((im.width // f, im.height // f), Image.LANCZOS)


# ---------------- grão de areia ----------------
def grao():
    S = 1400; im_h = 1200
    Y, X = np.mgrid[0:im_h, 0:S].astype(np.float32)
    cx, cy, R = S / 2, im_h * 0.52, S * 0.43
    th = np.arctan2(Y - cy, X - cx); d = np.hypot(X - cx, (Y - cy) / 0.82)
    rr = R * (1 + 0.1 * np.sin(3 * th + 1) + 0.06 * np.sin(5 * th + 2) + 0.04 * np.cos(9 * th) + 0.02 * np.sin(17 * th))
    q = d / rr; m = q < 1
    h = np.sqrt(np.clip(1 - q ** 2, 0, 1)) * R * 0.75
    h = h + (ruido(im_h, S, 5, 7, 6) - 0.5) * R * 0.18 * np.sqrt(np.clip(1 - q ** 2, 0, 1))
    h = gaussian_filter(np.asarray(h.astype(np.float32), np.float32), 2)
    gy, gx = np.gradient(h)
    n = np.dstack([-gx, -gy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    nl = np.clip((n * LUZ).sum(2), 0, 1); sp = np.clip((n * HV).sum(2), 0, 1) ** 60
    var = ruido(im_h, S, 8, 5, 5)
    base = np.array([222, 192, 135], np.float32) / 255
    cor = base[None, None] * (0.82 + 0.3 * var[..., None])
    pint = ruido(im_h, S, 13, 4, 30) > 0.78
    cor[pint] *= 0.78
    out = cor * (0.35 + 0.8 * nl[..., None]) + 0.55 * sp[..., None]
    a = np.clip((1 - q) * 120, 0, 1)
    rgba = np.dstack([np.clip(out * 255, 0, 255), a * 255]).astype(np.uint8)
    return reduz(Image.fromarray(rgba))         # 700 x 600 ; largura = 1 mm * (S*0.86/S)


# ---------------- formiga (de lado) ----------------
def formiga():
    W_, H_ = 2000, 1000; c = Cena3D(W_, H_)
    u = 2000 / 6.0                                     # px por mm  (sprite cobre 6 mm x 3 mm)
    ox, oy = 3.0 * u, 3.0 * u                          # origem: meio, chão em y = 3 mm
    P = lambda x, y: (ox + x * u, oy - y * u)
    corp = (95, 35, 18); perna = (70, 28, 15)
    # pernas (atrás do corpo)
    for i, (bx, k1, k2) in enumerate([(-0.45, (-1.1, 1.9), (-1.6, 0.0)), (0.0, (0.1, 2.0), (0.2, 0.0)), (0.45, (1.2, 1.9), (1.7, 0.0))]):
        for lado, z in ((-1, -60), (1, 400)):
            dx = 0 if lado > 0 else 0.3; s = 1 if lado > 0 else 0.8
            pc = perna if lado > 0 else (45, 18, 10)
            a = P(bx, 1.2); b = P(bx + dx + (k1[0] - bx) * s, k1[1] + (0 if lado > 0 else 0.15)); e = P(bx + dx + (k2[0] - bx) * s * 1.1, k2[1])
            c.capsula(*a, *b, 0.11 * u, 0.08 * u, z, pc, 0.5)
            c.capsula(*b, *e, 0.08 * u, 0.045 * u, z, pc, 0.5)
    c.elipse(*P(-1.55, 1.45), 1.05 * u, 0.78 * u, 0.8 * u, 0, corp, 0.9)            # gáster
    c.elipse(*P(-0.55, 1.25), 0.2 * u, 0.28 * u, 0.2 * u, 0, corp, 0.7)            # pecíolo
    c.capsula(*P(-0.35, 1.2), *P(0.65, 1.45), 0.33 * u, 0.38 * u, 0, corp, 0.8)     # tórax
    c.elipse(*P(1.3, 1.65), 0.55 * u, 0.5 * u, 0.5 * u, 10, corp, 0.9)              # cabeça
    c.elipse(*P(1.5, 1.8), 0.13 * u, 0.12 * u, 0.1 * u, 0.5 * u + 10, (20, 10, 8), 1.2)  # olho
    c.capsula(*P(1.75, 1.35), *P(2.05, 1.2), 0.09 * u, 0.04 * u, 30, perna, 0.6)    # mandíbula
    c.capsula(*P(1.45, 2.05), *P(1.6, 2.75), 0.05 * u, 0.04 * u, 20, perna, 0.5)    # antena
    c.capsula(*P(1.6, 2.75), *P(2.3, 2.55), 0.04 * u, 0.03 * u, 20, perna, 0.5)
    tex = 0.85 + 0.3 * ruido(H_, W_, 4, 5, 8)
    return reduz(c.render(tex, amb=0.3, dif=0.9, brilho=50))       # 1000 x 500 => 6 mm x 3 mm


# ---------------- pessoa (de frente) ----------------
def pessoa():
    W_, H_ = 800, 1440; c = Cena3D(W_, H_)
    u = H_ / 1.8                                         # px por metro (sprite 1.0 m x 1.8 m)
    P = lambda x, y: (W_ / 2 + x * u, H_ - y * u)
    pele = (232, 182, 140); cam = (30, 150, 150); short = (40, 55, 110); tenis = (240, 240, 240); cabelo = (60, 38, 25)
    for s in (-1, 1):
        c.capsula(*P(s * 0.1, 0.78), *P(s * 0.1, 0.42), 0.075 * u, 0.06 * u, 0, pele, 0.15)      # coxa/joelho
        c.capsula(*P(s * 0.1, 0.42), *P(s * 0.1, 0.08), 0.06 * u, 0.045 * u, 0, pele, 0.15)
        c.elipse(*P(s * 0.11, 0.045), 0.07 * u, 0.05 * u, 0.09 * u, 20, tenis, 0.3)
        c.capsula(*P(s * 0.24, 1.4), *P(s * 0.29, 1.12), 0.055 * u, 0.05 * u, 0, cam, 0.1)        # manga
        c.capsula(*P(s * 0.29, 1.12), *P(s * 0.31, 0.82), 0.045 * u, 0.04 * u, 0, pele, 0.15)    # braço
        c.elipse(*P(s * 0.315, 0.78), 0.045 * u, 0.06 * u, 0.04 * u, 0, pele, 0.15)              # mão
    c.capsula(*P(0, 0.92), *P(0, 0.72), 0.19 * u, 0.2 * u, 10, short, 0.1, 0.5)
    c.capsula(*P(-0.1, 0.78), *P(-0.11, 0.6), 0.09 * u, 0.085 * u, 12, short, 0.1)
    c.capsula(*P(0.1, 0.78), *P(0.11, 0.6), 0.09 * u, 0.085 * u, 12, short, 0.1)
    c.capsula(*P(0, 1.36), *P(0, 0.95), 0.21 * u, 0.19 * u, 20, cam, 0.1, 0.6)              # tronco
    c.capsula(*P(0, 1.47), *P(0, 1.38), 0.05 * u, 0.05 * u, 30, pele, 0.1)                  # pescoço
    c.elipse(*P(0, 1.6), 0.105 * u, 0.13 * u, 0.11 * u, 40, pele, 0.2)                     # cabeça
    c.elipse(*P(0, 1.67), 0.112 * u, 0.085 * u, 0.115 * u, 41, cabelo, 0.3)                # cabelo
    for s in (-1, 1):
        c.elipse(*P(s * 0.04, 1.6), 0.013 * u, 0.016 * u, 0.01 * u, 40 + 0.105 * u, (35, 25, 20), 0.8)
        c.elipse(*P(s * 0.107, 1.59), 0.018 * u, 0.03 * u, 0.02 * u, 30, pele, 0.1)          # orelha
    c.capsula(*P(-0.03, 1.535), *P(0.03, 1.535), 0.006 * u, 0.006 * u, 40 + 0.1 * u, (150, 70, 60), 0.2)
    tex = 0.92 + 0.12 * ruido(H_, W_, 9, 5, 10)
    return reduz(c.render(tex))                           # 400 x 720 => 1.0 m x 1.8 m


# ---------------- Cristo Redentor ----------------
def cristo():
    W_, H_ = 1500, 1950; c = Cena3D(W_, H_)
    u = H_ / 39.0                                       # sprite 30 m x 39 m
    P = lambda x, y: (W_ / 2 + x * u, H_ - y * u)
    pedra = (214, 212, 198); ped = (176, 172, 160)
    c.poligono([P(-5.5, 0), P(5.5, 0), P(4.3, 8), P(-4.3, 8)], 0, ped, (0, 0, 1))
    c.poligono([P(-5.5, 0), P(-4.3, 8), P(-4.9, 8), P(-6.2, 0)], 1, ped, (-1, 0, 0.6))
    c.capsula(*P(0, 26.5), *P(0, 9.2), 2.5 * u, 3.9 * u, 30, pedra, 0.1, 0.45)          # manto
    c.capsula(*P(-13.6, 29.2), *P(13.6, 29.2), 1.25 * u, 1.25 * u, 60, pedra, 0.1, 0.5)  # braços
    c.capsula(*P(0, 29.8), *P(0, 26.0), 2.6 * u, 2.6 * u, 70, pedra, 0.1, 0.5)           # peito/ombros
    c.capsula(*P(0, 31.6), *P(0, 30.8), 0.8 * u, 0.8 * u, 100, pedra, 0.1)
    c.elipse(*P(0, 33.3), 1.6 * u, 2.1 * u, 1.6 * u, 110, pedra, 0.15)                  # cabeça
    for s in (-1, 1):
        c.elipse(*P(s * 14.0, 28.9), 0.9 * u, 1.3 * u, 0.8 * u, 70, pedra, 0.1)        # mãos
    tex = 0.86 + 0.22 * ruido(H_, W_, 2, 6, 8)
    # dobras verticais do manto
    Y, X = np.mgrid[0:H_, 0:W_]
    dob = 1 - 0.1 * (np.sin((X - W_ / 2) / (0.9 * u) * math.pi) ** 8) * ((H_ - Y) / u > 9) * ((H_ - Y) / u < 26)
    return reduz(c.render(tex * dob, amb=0.45, dif=0.65))     # 750 x 975 => 30 m x 39 m


# ---------------- Everest ----------------
def perfil(n, seed, pontos, rug):
    xs = np.linspace(0, 1, n); base = np.interp(xs, [p[0] for p in pontos], [p[1] for p in pontos])
    r = np.random.default_rng(seed); ruid = np.zeros(n)
    for o in range(1, 8):
        k = 2 ** o + 1; g = r.normal(0, 1, k)
        ruid += np.interp(xs, np.linspace(0, 1, k), g) / (1.7 ** o)
    return base + rug * ruid


def everest():
    """terreno 3D (heightmap) visto de lado, renderizado por colunas (voxel)"""
    W_, H_, D = 1800, 1100, 700                      # 100 px/km; profundidade 7 km em 700 linhas
    xs = np.linspace(-9, 9, W_)[None, :]; ds = np.linspace(-3.5, 3.5, D)[:, None]
    def ridged(seed, base):
        n = ruido(D, W_, seed, 7, base); return 1 - np.abs(2 * n - 1)
    rg = ridged(41, 6) * 0.6 + ridged(42, 14) * 0.4
    def pico(x0, d0, h, r):
        rr = np.sqrt((xs - x0) ** 2 + ((ds - d0) * 1.3) ** 2); return h * np.clip(1 - rr / r, 0, 1) ** 1.25
    Z = np.maximum.reduce([pico(0, 0.3, 8.85, 7.5), pico(2.6, -0.8, 8.0, 5.0), pico(-3.6, -1.5, 6.6, 4.5), pico(5.6, -2.5, 6.0, 3.6),
                           pico(-6.8, -2.6, 5.0, 3.0)])
    Z = Z * (0.78 + 0.32 * rg) + 0.35 * ruido(D, W_, 43, 6, 20)
    Z = np.maximum(Z - 0.4, 0)
    Z = Z * np.clip((8.8 - np.abs(xs)) / 2.5, 0, 1)
    Z[:, 0] = Z[:, -1] = 0
    gz_d, gz_x = np.gradient(Z, 7 / D, 18 / W_)
    n = np.dstack([-gz_x, gz_d, np.ones_like(Z)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    L = np.array([-0.6, 0.35, 0.72]); L /= np.linalg.norm(L)
    nl = np.clip((n * L).sum(2), 0, 1)
    incl = 1 - n[..., 2]
    tex = ruido(D, W_, 44, 6, 30)
    rocha = np.array([0.46, 0.43, 0.46]) * (0.75 + 0.5 * tex[..., None])
    neve = ((Z > 4.6 + 1.5 * (tex - 0.5)) & (incl < 0.7 + 0.2 * tex)) | (Z > 7.2)
    col = rocha.copy(); col[neve] = np.array([0.95, 0.96, 1.0])
    col = col * (0.35 + 0.9 * nl[..., None])
    from scipy.ndimage import zoom
    Z = zoom(Z, (4, 1), order=1); col = zoom(col, (4, 1, 1), order=1); D = D * 4
    img = np.zeros((H_, W_, 4), np.float32)
    ybuf = np.full(W_, H_, np.float32)
    rows = np.arange(H_, dtype=np.float32)[:, None]
    for d in range(D - 1, -1, -1):                     # de perto pra longe
        base = H_ - 1 - (D - 1 - d) * 0.075
        top = base - Z[d] * 100
        m = (rows >= top[None, :]) & (rows < ybuf[None, :]) & (Z[d] > 0.01)[None, :]
        if m.any():
            nev = (D - 1 - d) / D * 0.35
            c = col[d] * (1 - nev) + np.array([0.72, 0.78, 0.88]) * nev
            img[..., :3] = np.where(m[..., None], c[None, :, :], img[..., :3])
            img[..., 3] = np.where(m, 1.0, img[..., 3])
            ybuf = np.minimum(ybuf, np.where(Z[d] > 0.01, top, ybuf))
    # névoa no pé (esconde as listras do render por colunas) e bordas suaves
    from scipy.ndimage import gaussian_filter1d
    a = img[..., 3]; rows = np.nonzero(a.max(1) > 0.5)[0]; top, bot = rows.min(), rows.max()
    bl = img.copy()
    for c_ in range(4): bl[..., c_] = gaussian_filter1d(img[..., c_], 6, axis=1)
    mix = (np.clip((np.arange(H_) - (bot - (bot - top) * 0.45)) / ((bot - top) * 0.45), 0, 1) ** 0.8)[:, None, None]
    res = img * (1 - mix) + bl * mix
    res[..., :3] = res[..., :3] * (1 - 0.55 * mix) + np.array([0.66, 0.64, 0.66]) * 0.55 * mix
    res[..., 3] *= np.clip((bot - np.arange(H_)) / ((bot - top) * 0.12), 0, 1)[:, None]
    xx = np.arange(W_); res[..., 3] *= np.clip(np.minimum(xx, W_ - 1 - xx) / (W_ * 0.1), 0, 1)[None, :]
    return Image.fromarray(np.clip(res * 255, 0, 255).astype(np.uint8))     # 18 km x 11 km


# ---------------- Terra ----------------
def terra():
    from global_land_mask import globe
    S = 1300; M = 90; T_ = S + 2 * M
    Y, X = np.mgrid[0:T_, 0:T_].astype(np.float32)
    x = (X - T_ / 2) / (S / 2); y = -(Y - T_ / 2) / (S / 2); rr = x * x + y * y; m = rr < 1
    z = np.sqrt(np.clip(1 - rr, 0, 1))
    lat0, lon0 = math.radians(-12), math.radians(-52)
    # ortográfica inversa
    rho = np.sqrt(rr); cc = np.arcsin(np.clip(rho, 0, 1))
    lat = np.arcsin(np.clip(np.cos(cc) * math.sin(lat0) + np.where(rho > 0, y * np.sin(cc) * math.cos(lat0) / (rho + 1e-9), 0), -1, 1))
    lon = lon0 + np.arctan2(x * np.sin(cc), rho * np.cos(cc) * math.cos(lat0) - y * np.sin(cc) * math.sin(lat0))
    latd = np.degrees(lat); lond = (np.degrees(lon) + 180) % 360 - 180
    land = np.zeros_like(m)
    land[m] = globe.is_land(np.clip(latd[m], -89.9, 89.9), np.clip(lond[m], -179.9, 179.9))
    land = np.asarray(Image.fromarray((land * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) / 255
    # cores
    eq = ruido(T_, T_, 3, 6, 8)
    oceano = np.array([0.04, 0.18, 0.42]) * (0.85 + 0.3 * eq[..., None])
    arid = np.clip(1 - np.abs(np.abs(latd) - 24) / 14, 0, 1) * (0.5 + eq)
    verde = np.array([0.18, 0.36, 0.14]); seco = np.array([0.62, 0.52, 0.32])
    terra_c = verde * (1 - np.clip(arid, 0, 1)[..., None]) + seco * np.clip(arid, 0, 1)[..., None]
    terra_c *= (0.8 + 0.4 * ruido(T_, T_, 6, 6, 16)[..., None])
    gelo = (np.abs(latd) > 68 + 6 * eq)
    col = oceano * (1 - land[..., None]) + terra_c * land[..., None]
    col[gelo] = [0.92, 0.94, 0.97]
    # nuvens em lat/lon
    nv = ruido(400, 800, 11, 7, 6)
    iy = np.clip(((90 - latd) / 180 * 399), 0, 399).astype(int); ix = np.clip(((lond + 180) / 360 * 799), 0, 799).astype(int)
    nuv = np.clip((nv[iy, ix] - 0.55) * 3.5, 0, 0.9)
    col = col * (1 - nuv[..., None]) + nuv[..., None] * 0.97
    n = np.dstack([x, y, z])
    L = np.array([-0.55, 0.5, 0.67]); L /= np.linalg.norm(L)
    nl = np.clip((n * L).sum(2), 0, 1)
    spec = np.clip((n * (L + [0, 0, 1]) / np.linalg.norm(L + [0, 0, 1])).sum(2), 0, 1) ** 30 * (1 - land) * (1 - nuv) * 0.6
    out = col * (0.12 + 1.0 * nl[..., None]) + spec[..., None]
    atm = np.clip(1 - z, 0, 1) ** 2.5
    out = out * (1 - 0.5 * atm[..., None]) + np.array([0.35, 0.6, 1.0]) * 0.6 * atm[..., None] * (0.3 + nl[..., None])
    a = np.clip((1 - np.sqrt(rr)) * S / 2, 0, 1)
    halo = np.clip(1 - (np.sqrt(rr) - 1) * 14, 0, 1) * (np.sqrt(rr) >= 1) * 0.5
    rgba = np.zeros((T_, T_, 4), np.float32)
    rgba[..., :3] = out * a[..., None] + np.array([0.4, 0.65, 1.0]) * (1 - a[..., None])
    rgba[..., 3] = np.maximum(a, halo)
    return Image.fromarray(np.clip(rgba * 255, 0, 255).astype(np.uint8)), S / T_


# ---------------- Sol ----------------
def sol():
    S = 1200; M = 300; T_ = S + 2 * M
    Y, X = np.mgrid[0:T_, 0:T_].astype(np.float32)
    x = (X - T_ / 2) / (S / 2); y = (Y - T_ / 2) / (S / 2); r = np.sqrt(x * x + y * y)
    mu = np.sqrt(np.clip(1 - r * r, 0, 1))
    gran = ruido(T_, T_, 17, 4, 120) * 0.6 + ruido(T_, T_, 18, 6, 6) * 0.4
    I = (0.45 + 0.55 * mu ** 0.6) * (0.85 + 0.25 * gran)
    rng = np.random.default_rng(4)
    for _ in range(6):
        sx, sy, sr = rng.uniform(-0.55, 0.55), rng.uniform(-0.4, 0.4), rng.uniform(0.02, 0.045)
        d = np.hypot(x - sx, y - sy); I *= 1 - 0.75 * np.clip(1 - d / sr, 0, 1) ** 0.5 - 0.25 * np.clip(1 - d / (sr * 2.2), 0, 1)
    c0 = np.array([1.0, 0.98, 0.8]); c1 = np.array([1.0, 0.62, 0.08]); c2 = np.array([0.75, 0.22, 0.02])
    k = np.clip(I, 0, 1)[..., None]
    col = np.where(k > 0.7, c1 + (c0 - c1) * (k - 0.7) / 0.3, c2 + (c1 - c2) * k / 0.7)
    a = np.clip((1 - r) * S / 2, 0, 1)
    glow = np.exp(-np.clip(r - 1, 0, None) * 5.5) * (r >= 1) * 0.85
    rgba = np.zeros((T_, T_, 4), np.float32)
    rgba[..., :3] = col * a[..., None] + np.array([1.0, 0.72, 0.25]) * (1 - a[..., None])
    rgba[..., 3] = np.maximum(a, glow)
    return Image.fromarray(np.clip(rgba * 255, 0, 255).astype(np.uint8)), S / T_


# ---------------- Via Láctea ----------------
def via():
    S = 1600; r = np.random.default_rng(9); N = 260000
    u = r.random(N); rad = 0.03 + 0.97 * u ** 0.85
    arm = r.integers(0, 2, N)
    arm = r.integers(0, 4, N)
    th = arm * math.pi / 2 + np.log(rad / 0.03) / math.tan(math.radians(16)) * 0.32 + r.normal(0, 0.16 + 0.12 * (arm % 2), N)
    disco = r.random(N) < 0.3                         # estrelas espalhadas no disco
    th[disco] = r.uniform(0, 2 * math.pi, disco.sum())
    x = rad * np.cos(th); y = rad * np.sin(th) * 0.78
    nuc = r.random(N) < 0.12
    x[nuc] = r.normal(0, 0.09, nuc.sum()); y[nuc] = r.normal(0, 0.07, nuc.sum())
    H, _, _ = np.histogram2d(y, x, bins=S, range=[[-1, 1], [-1, 1]])
    H = H.astype(np.float32)
    fino = gaussian_filter(np.asarray(H, np.float32), 1.2)
    medio = gaussian_filter(np.asarray(H, np.float32), 8)
    largo = gaussian_filter(np.asarray(H, np.float32), 40)
    b = fino / np.percentile(fino, 99.5) * 0.45 + medio / np.percentile(medio, 99.5) * 0.7 + largo / largo.max() * 0.9
    b = 1 - np.exp(-1.6 * b)
    Y, X = np.mgrid[0:S, 0:S].astype(np.float32)
    rc = np.hypot((X - S / 2) / (S / 2), (Y - S / 2) / (S / 2 * 0.78))
    core = np.clip(1 - rc / 0.35, 0, 1)[..., None]
    col = np.array([0.55, 0.68, 1.0]) * (1 - core) + np.array([1.0, 0.88, 0.6]) * core
    poeira = ruido(S, S, 5, 6, 12)
    b = b * (1 - 0.45 * np.clip((poeira - 0.55) * 4, 0, 1) * (rc > 0.12))
    rosa = (r.random((S, S)) < 0.0004) * (b > 0.35)
    out = col * b[..., None]; out[rosa] = [1.0, 0.45, 0.6]
    rgba = np.dstack([np.clip(out * 1.15, 0, 1), np.clip(b * 1.3, 0, 1)])
    return Image.fromarray((rgba * 255).astype(np.uint8))      # 1600 px = diâmetro


# ---------------- universo visível (teia cósmica) ----------------
def universo():
    S = 1600; r = np.random.default_rng(21)
    from PIL import ImageDraw
    pts = r.uniform(-1, 1, (900, 2)); pts = pts[(pts ** 2).sum(1) < 1]
    im = Image.new('F', (S, S), 0); d = ImageDraw.Draw(im)
    P = lambda p: ((p[0] + 1) * S / 2, (p[1] + 1) * S / 2)
    for i in range(len(pts)):
        dd = np.hypot(*(pts - pts[i]).T); idx = np.argsort(dd)[1:4]
        for j in idx:
            if dd[j] < 0.13: d.line([P(pts[i]), P(pts[j])], fill=0.5, width=2)
    for p in pts:
        x, y = P(p); s = r.uniform(2, 6); d.ellipse([x - s, y - s, x + s, y + s], fill=1.0)
    A = np.asarray(im)
    g = A * 0.6 + gaussian_filter(A, 6) * 2.5 + gaussian_filter(A, 25) * 4
    g = 1 - np.exp(-1.4 * g)
    Y, X = np.mgrid[0:S, 0:S].astype(np.float32)
    rc = np.hypot(X - S / 2, Y - S / 2) / (S / 2)
    fundo = np.clip((1 - rc) * 40, 0, 1)
    col = np.array([0.55, 0.45, 1.0]) * g[..., None] + np.array([1.0, 0.75, 0.4]) * (A > 0.9)[..., None] * 0.8
    base = np.array([0.07, 0.05, 0.2])
    out = base * (1 - g[..., None]) + col
    rim = np.clip(1 - np.abs(rc - 1) * 60, 0, 1) * 0.8
    out = out + np.array([0.6, 0.55, 1.0]) * rim[..., None]
    rgba = np.dstack([np.clip(out, 0, 1), np.maximum(fundo, rim)])
    return Image.fromarray((rgba * 255).astype(np.uint8))


def esfera(cor, S=64):
    c = Cena3D(S * 2, S * 2); c.elipse(S, S, S - 2, S - 2, S - 2, 0, cor, 0.3)
    return reduz(c.render(amb=0.15, dif=1.0))


if __name__ == '__main__':
    os.makedirs('sprites', exist_ok=True)
    for nome, f in [('grao', grao), ('formiga', formiga), ('pessoa', pessoa), ('cristo', cristo), ('everest', everest), ('via', via), ('universo', universo)]:
        f().save(f'sprites/{nome}.png'); print(nome, flush=True)
    im, k = terra(); im.save('sprites/terra.png'); print('terra', k)
    im, k = sol(); im.save('sprites/sol.png'); print('sol', k)
