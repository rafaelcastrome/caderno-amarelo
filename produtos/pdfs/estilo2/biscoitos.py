"""Página de teste do estilo novo: "Noite de biscoitos" (Natal Fofo v3).

Diferenças pro estilo antigo:
- cena ocupa a página inteira (sem moldura pequena nem título solto em cima)
- traço em 3 grossuras: contorno de silhueta (G), detalhe interno (M), textura (P)
- Bolinho com pose de verdade: cabeça inclinada, braços dobrados segurando o rolo
- objetos grandes e texturas pra pintar (madeira, tricô, ladrilho, papel de parede)
"""
import math
import random

W, H = 1000, 1414
G, M, P = 6.5, 3.6, 2.4
K = '#1d1d1d'
random.seed(7)

el = []


def add(s):
    el.append(s)


def path(d, fill='#fff', w=G):
    add(f'<path d="{d}" fill="{fill}" stroke="{K}" stroke-width="{w}"/>')


def linha(d, w=M):
    add(f'<path d="{d}" fill="none" stroke="{K}" stroke-width="{w}"/>')


def circ(cx, cy, r, fill='#fff', w=G):
    add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{K}" stroke-width="{w}"/>')


def elip(cx, cy, rx, ry, fill='#fff', w=G, rot=0):
    tr = f' transform="rotate({rot} {cx} {cy})"' if rot else ''
    add(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" stroke="{K}" stroke-width="{w}"{tr}/>')


def ret(x, y, w_, h_, r=0, fill='#fff', w=G):
    add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w_:.1f}" height="{h_:.1f}" rx="{r}" fill="{fill}" stroke="{K}" stroke-width="{w}"/>')


def ponto(cx, cy, r=4):
    add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{K}"/>')


def g(tx, ty, s=1, rot=0):
    add(f'<g transform="translate({tx} {ty}) rotate({rot}) scale({s})">')


def fg():
    add('</g>')


def texto(x, y, s, tam=34, rot=0, vazado=False):
    tr = f' transform="rotate({rot} {x} {y})"' if rot else ''
    if vazado:
        add(f'<text x="{x}" y="{y}" font-family="Caveat" font-size="{tam}" text-anchor="middle" fill="#fff" '
            f'stroke="{K}" stroke-width="5" paint-order="stroke"{tr}>{s}</text>')
        add(f'<text x="{x}" y="{y}" font-family="Caveat" font-size="{tam}" text-anchor="middle" fill="#fff"{tr}>{s}</text>')
    else:
        add(f'<text x="{x}" y="{y}" font-family="Caveat" font-size="{tam}" text-anchor="middle" fill="{K}"{tr}>{s}</text>')


def estrela(cx, cy, r, ri=None, fill='#fff', w=M, rot=-90, n=5):
    ri = ri or r * 0.5
    pts = []
    for i in range(2 * n):
        a = math.radians(rot + i * 180 / n)
        rr = r if i % 2 == 0 else ri
        pts.append(f'{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}')
    add(f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="{K}" stroke-width="{w}" stroke-linejoin="round"/>')


def coracao(cx, cy, s, fill='#fff', w=M):
    path(f'M{cx} {cy + s * .9} C{cx - s * 1.3} {cy} {cx - s * .9} {cy - s * .9} {cx} {cy - s * .35} '
         f'C{cx + s * .9} {cy - s * .9} {cx + s * 1.3} {cy} {cx} {cy + s * .9}Z', fill, w)


def floco(cx, cy, r, w=P):
    d = ''
    for i in range(6):
        a = math.radians(i * 60 + 15)
        x2, y2 = cx + r * math.cos(a), cy + r * math.sin(a)
        d += f'M{cx:.1f} {cy:.1f}L{x2:.1f} {y2:.1f}'
        for sg in (-1, 1):
            b = a + sg * math.radians(42)
            mx, my = cx + r * .58 * math.cos(a), cy + r * .58 * math.sin(a)
            d += f'M{mx:.1f} {my:.1f}L{mx + r * .32 * math.cos(b):.1f} {my + r * .32 * math.sin(b):.1f}'
    linha(d, w)


def quad(t, p0, p1, p2):
    return ((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
            (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1])


# =====================================================================
# PAREDE
# =====================================================================
ret(-10, -10, W + 20, 900, 0, w=0)
# papel de parede: listras verticais finas + raminhos de azevinho alternados
for x in range(60, W, 120):
    linha(f'M{x} 0L{x} 880', P)
for i, x in enumerate(range(0, W + 60, 120)):
    for j, y in enumerate(range(40, 880, 110)):
        cx, cy = x + (60 if j % 2 else 0), y
        if (i + j) % 2:
            circ(cx, cy, 5, w=P)
        else:
            estrela(cx, cy, 9, w=P)

# rodameio de madeira (aparece atrás da mesa)
ret(-10, 700, W + 20, 30, 0, w=M)

# ---------------- varal de bandeirinhas + luzinhas no topo ----------------
p0, p1, p2 = (-10, 40), (500, 150), (1010, 40)
linha(f'M{p0[0]} {p0[1]}Q{p1[0]} {p1[1]} {p2[0]} {p2[1]}', M)
for i in range(1, 14):
    t = i / 14
    x, y = quad(t, p0, p1, p2)
    x2, y2 = quad(t + 1 / 28, p0, p1, p2)
    ang = math.degrees(math.atan2(y2 - y, x2 - x))
    g(x, y, 1, ang)
    if i % 2:
        path('M-26 0L26 0L0 50Z', w=M)
        estrela(0, 17, 8, w=P) if i % 4 == 1 else circ(0, 16, 6, w=P)
    else:
        # lâmpada pendurada
        ret(-6, 0, 12, 10, 2, w=P)
        path('M-9 9C-15 30 15 30 9 9Z', w=M)
        linha('M-3 15q2-3 5-1', P)
    fg()

# ---------------- janela com cortina ----------------
JX, JY, JW, JH = 60, 190, 320, 380
ret(JX - 18, JY - 18, JW + 36, JH + 36, 14)         # batente
ret(JX, JY, JW, JH, 6)                              # vidro
# paisagem de neve lá fora
path(f'M{JX} {JY + 270}Q{JX + 90} {JY + 230} {JX + 170} {JY + 262}Q{JX + 250} {JY + 290} {JX + JW} {JY + 250}'
     f'L{JX + JW} {JY + JH}L{JX} {JY + JH}Z', w=M)
# casinha distante
ret(JX + 195, JY + 205, 70, 52, 2, w=M)
path(f'M{JX + 186} {JY + 210}L{JX + 230} {JY + 168}L{JX + 274} {JY + 210}Z', w=M)
ret(JX + 222, JY + 228, 18, 29, 2, w=P)
ret(JX + 200, JY + 218, 14, 14, 1, w=P)
ret(JX + 246, JY + 218, 14, 14, 1, w=P)
ret(JX + 248, JY + 172, 14, 22, 1, w=P)
linha(f'M{JX + 255} {JY + 166}q-8-10 0-20q8-10 0-20', P)
# pinheirinhos
for (tx, ty, s) in ((JX + 70, JY + 262, 1), (JX + 120, JY + 250, .75)):
    path(f'M{tx} {ty - 110 * s}L{tx + 34 * s} {ty - 55 * s}L{tx + 20 * s} {ty - 55 * s}L{tx + 46 * s} {ty - 10 * s}'
         f'L{tx - 46 * s} {ty - 10 * s}L{tx - 20 * s} {ty - 55 * s}L{tx - 34 * s} {ty - 55 * s}Z', w=M)
    ret(tx - 7 * s, ty - 11 * s, 14 * s, 14 * s, 1, w=P)
# lua e flocos
path(f'M{JX + 270} {JY + 40}a34 34 0 1 0 22 60a28 28 0 1 1-22-60Z', w=M)
for (fx, fy) in ((JX + 40, JY + 40), (JX + 140, JY + 80), (JX + 200, JY + 30), (JX + 60, JY + 140), (JX + 230, JY + 140)):
    floco(fx, fy, 12)
# cruz da janela
ret(JX + JW / 2 - 7, JY, 14, JH, 0, w=M)
ret(JX, JY + 150, JW, 14, 0, w=M)
# parapeito com vasinho
ret(JX - 34, JY + JH + 10, JW + 68, 24, 8)
path(f'M{JX + 230} {JY + JH + 10}L{JX + 236} {JY + JH - 30}L{JX + 284} {JY + JH - 30}L{JX + 290} {JY + JH + 10}Z', w=M)
linha(f'M{JX + 234} {JY + JH - 18}L{JX + 286} {JY + JH - 18}', P)
for k in range(5):  # bico-de-papagaio (flor de natal)
    a = math.radians(-90 + k * 72)
    cx_, cy_ = JX + 260, JY + JH - 62
    path(f'M{cx_} {cy_}Q{cx_ + 30 * math.cos(a - .5):.1f} {cy_ + 30 * math.sin(a - .5):.1f} '
         f'{cx_ + 38 * math.cos(a):.1f} {cy_ + 38 * math.sin(a):.1f}Q{cx_ + 30 * math.cos(a + .5):.1f} '
         f'{cy_ + 30 * math.sin(a + .5):.1f} {cx_} {cy_}Z', w=M)
circ(JX + 260, JY + JH - 62, 8, w=P)
# vela no parapeito
ret(JX + 40, JY + JH - 40, 22, 50, 3, w=M)
path(f'M{JX + 51} {JY + JH - 44}q-10-14 0-30q10 16 0 30Z', w=P)
# cortinas com amarração
for lado in (-1, 1):
    bx = JX - 30 if lado < 0 else JX + JW + 30
    ix = bx + lado * -70
    path(f'M{bx} {JY - 40}L{ix} {JY - 40}Q{ix - lado * 10} {JY + 160} {bx - lado * 6} {JY + 230}'
         f'Q{ix + lado * 6} {JY + 300} {ix + lado * 14} {JY + JH + 40}L{bx + lado * 30} {JY + JH + 40}'
         f'Q{bx + lado * 10} {JY + 300} {bx} {JY + 230}Z', w=G)
    for k in (1, 2):
        linha(f'M{bx - lado * 18 * k} {JY - 30}Q{bx - lado * 22 * k} {JY + 110} {bx - lado * 6} {JY + 225}', P)
    ret(bx - lado * 30 - 22, JY + 218, 44, 22, 10, w=M)          # laço da cortina
# varão
ret(JX - 70, JY - 52, JW + 140, 16, 8, w=M)
circ(JX - 76, JY - 44, 14, w=M)
circ(JX + JW + 76, JY - 44, 14, w=M)
# babado no topo (bandô)
d = f'M{JX - 60} {JY - 40}'
for k in range(9):
    x0 = JX - 60 + k * (JW + 120) / 9
    d += f'Q{x0 + (JW + 120) / 18:.1f} {JY + 6} {x0 + (JW + 120) / 9:.1f} {JY - 40}'
path(d + 'Z', w=M)

# ---------------- prateleira com potes (direita) ----------------
SX0, SX1, SY = 692, 985, 380
for (px, nome, hp, wp) in ((708, 'canela', 78, 74), (794, 'açúcar', 94, 80), (886, 'biscoito', 108, 66)):
    path(f'M{px} {SY}L{px} {SY - hp + 14}Q{px} {SY - hp} {px + 14} {SY - hp}L{px + wp - 14} {SY - hp}'
         f'Q{px + wp} {SY - hp} {px + wp} {SY - hp + 14}L{px + wp} {SY}Z')
    ret(px - 6, SY - hp - 20, wp + 12, 22, 8, w=M)
    circ(px + wp / 2, SY - hp - 28, 9, w=M)
    if nome == 'biscoito':
        for (cx_, cy_) in ((px + 20, SY - 22), (px + 46, SY - 26), (px + 33, SY - 50)):
            circ(cx_, cy_, 12, w=P)
            ponto(cx_ - 4, cy_ - 3, 2.5)
            ponto(cx_ + 4, cy_ + 3, 2.5)
        ret(px + 6, SY - hp + 16, wp - 12, 26, 5, w=P)
        texto(px + wp / 2, SY - hp + 36, 'biscoito', 17)
    else:
        ret(px + 8, SY - hp / 2 - 16, wp - 16, 32, 6, w=P)
        texto(px + wp / 2, SY - hp / 2 + 8, nome, 22)
ret(SX0, SY, SX1 - SX0, 22, 6)
for bx in (720, 950):
    path(f'M{bx} {SY + 22}L{bx} {SY + 66}L{bx + (36 if bx < 800 else -36)} {SY + 22}Z', w=M)
# canecas penduradas
for k, cx_ in enumerate((790, 868)):
    linha(f'M{cx_} {SY + 22}L{cx_} {SY + 38}', P)
    path(f'M{cx_ - 24} {SY + 38}L{cx_ + 24} {SY + 38}L{cx_ + 20} {SY + 90}Q{cx_} {SY + 98} {cx_ - 20} {SY + 90}Z', w=M)
    path(f'M{cx_ + 22} {SY + 50}q20 2 16 20q-4 12-18 10', fill='none', w=M)
    if k % 2:
        coracao(cx_, SY + 64, 10, w=P)
    else:
        floco(cx_, SY + 64, 12)

# ---------------- relógio ----------------
OX, OY = 880, 580
circ(OX, OY, 62)
circ(OX, OY, 50, w=P)
for k in range(12):
    a = math.radians(k * 30)
    linha(f'M{OX + 42 * math.cos(a):.1f} {OY + 42 * math.sin(a):.1f}L{OX + 48 * math.cos(a):.1f} {OY + 48 * math.sin(a):.1f}', P)
linha(f'M{OX} {OY}L{OX} {OY - 36}M{OX} {OY}L{OX + 24} {OY + 14}', M)
ponto(OX, OY, 5)
path(f'M{OX - 30} {OY - 56}q-26-22 0-42q14 18 0 42ZM{OX + 30} {OY - 56}q26-22 0-42q-14 18 0 42Z', w=M)
circ(OX, OY - 62, 8, w=M)

# ---------------- placa com o título (pendurada no varal) ----------------
PX0, PX1, PY0, PY1 = 450, 790, 150, 240
linha(f'M{PX0 + 50} 112L{PX0 + 70} {PY0}M{PX1 - 50} 104L{PX1 - 70} {PY0}', M)
path(f'M{PX0 + 14} {PY0}L{PX1 - 14} {PY0}Q{PX1} {PY0} {PX1} {PY0 + 14}L{PX1} {PY1 - 14}Q{PX1} {PY1} {PX1 - 14} {PY1}'
     f'L{PX0 + 14} {PY1}Q{PX0} {PY1} {PX0} {PY1 - 14}L{PX0} {PY0 + 14}Q{PX0} {PY0} {PX0 + 14} {PY0}Z')
for (yy, xa) in ((166, PX0 + 16), (226, PX1 - 70)):
    linha(f'M{xa} {yy}q26 -4 52 0', P)
texto((PX0 + PX1) / 2, PY1 - 26, 'Noite de biscoitos', 52, vazado=True)

# =====================================================================
# BOLINHO (atrás da mesa)
# =====================================================================
TOPO_Y, BASE_Y = 800, 1030
BX, BY = 565, 572          # centro da cabeça
CO = 650                   # base do pescoço
path(f'M{BX - 118} {TOPO_Y + 30}C{BX - 130} {CO + 100} {BX - 110} {CO + 30} {BX - 60} {CO}L{BX + 60} {CO}'
     f'C{BX + 110} {CO + 30} {BX + 130} {CO + 100} {BX + 118} {TOPO_Y + 30}Z')
path(f'M{BX - 62} {CO - 2}Q{BX} {CO + 30} {BX + 62} {CO - 2}L{BX + 58} {CO + 12}Q{BX} {CO + 46} {BX - 58} {CO + 12}Z', w=M)
# avental
path(f'M{BX - 62} {TOPO_Y + 30}L{BX - 58} {CO + 70}Q{BX} {CO + 60} {BX + 58} {CO + 70}L{BX + 62} {TOPO_Y + 30}Z', w=M)
linha(f'M{BX - 58} {CO + 72}L{BX - 72} {CO + 12}M{BX + 58} {CO + 72}L{BX + 72} {CO + 12}', M)
path(f'M{BX - 34} {CO + 104}L{BX + 34} {CO + 104}L{BX + 30} {CO + 140}Q{BX} {CO + 147} {BX - 30} {CO + 140}Z', w=M)
coracao(BX, CO + 122, 10, w=P)
for (fx, fy) in ((BX - 40, CO + 90), (BX + 42, CO + 96), (BX - 22, CO + 82)):
    circ(fx, fy, 3.5, w=P)

g(BX, BY, 1, -7)
# orelhas balançando
path('M-92-42C-150-46-170 50-150 108C-140 140-104 136-96 100C-88 60-80 0-92-42Z')
path('M92-42C150-46 170 50 150 108C140 140 104 136 96 100C88 60 80 0 92-42Z')
linha('M-126 20q-10 34 0 70M126 20q10 34 0 70', P)
# cabeça
path('M-112 0C-114-70-60-104 0-104C60-104 114-70 112 0C110 64 64 96 0 96C-64 96-110 64-112 0Z')
path('M14-22C18-48 58-54 76-30C92-8 84 30 58 34C42 36 40 22 26 20C10 18 10 0 14-22Z', w=M)
# gorro de tricô
path('M-108-26C-112-104-58-150 0-150C58-150 112-104 108-26Z')
ret(-118, -46, 236, 40, 20)
for k in range(-4, 5):
    linha(f'M{k * 25} -44l0 36', P)
for yy, span in ((-80, 90), (-112, 64)):
    d = ''
    for xx in range(-span, span, 18):
        d += f'M{xx} {yy}l9 10l9-10'
    linha(d, P)
circ(0, -162, 28)
linha('M-12-174l7 8M8-176l5 10M-6-154l10 4M10-160l8 2', P)
# olhos felizes
linha('M-58 6q16-18 32 0', 6.5)
linha('M28 6q16-18 32 0', 6.5)
# focinho
path('M-18 24Q0 16 18 24Q16 40 0 42Q-16 40-18 24Z', K, 2)
circ(-6, 28, 3, '#fff', 0)
# boca aberta sorrindo com linguinha
path('M-22 50Q0 54 22 50Q18 82 0 82Q-18 82-22 50Z', w=M)
path('M-12 72Q0 62 12 72Q10 82 0 82Q-10 82-12 72Z', w=P)
linha('M0 42l0 9', M)
elip(-74, 34, 14, 9, w=P)
elip(74, 34, 14, 9, w=P)
circ(-30, 46, 3, w=P)
circ(34, 40, 3, w=P)
fg()

# =====================================================================
# MESA
# =====================================================================
path(f'M90 {TOPO_Y}L910 {TOPO_Y}L990 {BASE_Y}L10 {BASE_Y}Z')
for k in range(1, 6):
    xa = 90 + k * 820 / 6
    xb = 10 + k * 980 / 6
    linha(f'M{xa:.1f} {TOPO_Y}L{xb:.1f} {BASE_Y}', M)
for (xa, ya, ln) in ((150, 840, 50), (330, 1000, 70), (500, 1012, 50), (760, 1000, 60), (860, 850, 36)):
    linha(f'M{xa} {ya}q{ln / 2} -8 {ln} 0', P)
    linha(f'M{xa + 10} {ya + 9}q{ln / 2 - 10} -6 {ln - 20} 0', P)
path(f'M10 {BASE_Y}L990 {BASE_Y}L990 {BASE_Y + 34}L10 {BASE_Y + 34}Z')
path(f'M44 {BASE_Y + 34}L956 {BASE_Y + 34}L956 {BASE_Y + 92}L44 {BASE_Y + 92}Z', w=M)
for gx in (120, 400, 680):
    ret(gx, BASE_Y + 44, 200, 38, 6, w=M)
    ret(gx + 80, BASE_Y + 57, 40, 12, 6, w=P)

# ---------------- leite e copo (atrás, à esquerda do Bolinho) ----------------
LX = 222
path(f'M{LX} {TOPO_Y + 40}L{LX} {TOPO_Y - 20}L{LX + 14} {TOPO_Y - 40}L{LX + 14} {TOPO_Y - 60}L{LX + 44} {TOPO_Y - 60}'
     f'L{LX + 44} {TOPO_Y - 40}L{LX + 58} {TOPO_Y - 20}L{LX + 58} {TOPO_Y + 40}Q{LX + 29} {TOPO_Y + 50} {LX} {TOPO_Y + 40}Z')
ret(LX + 10, TOPO_Y - 74, 38, 16, 4, w=M)
ret(LX + 6, TOPO_Y - 6, 46, 30, 4, w=P)
texto(LX + 29, TOPO_Y + 16, 'leite', 21)

# ---------------- massa aberta com forminhas cortadas ----------------
DY = TOPO_Y + 60
path(f'M300 {DY}Q450 {DY - 30} 640 {DY - 8}Q770 {DY + 6} 790 {DY + 60}Q800 {DY + 120} 650 {DY + 140}'
     f'Q470 {DY + 160} 320 {DY + 134}Q220 {DY + 112} 232 {DY + 60}Q244 {DY + 14} 300 {DY}Z')
estrela(330, DY + 80, 30, w=M)
coracao(705, DY + 92, 24, w=M)
path(f'M{560} {DY + 132}L{586} {DY + 92}L{574} {DY + 92}L{592} {DY + 66}L{580} {DY + 66}L{600} {DY + 38}'
     f'L{620} {DY + 66}L{608} {DY + 66}L{626} {DY + 92}L{614} {DY + 92}L{640} {DY + 132}Z', w=M)
path(f'M420 {DY + 96}a30 30 0 1 0 40 36a24 24 0 1 1-40-36Z', w=M)     # lua cortada
for _ in range(30):
    fx, fy = random.uniform(220, 820), random.uniform(DY + 120, DY + 175)
    circ(fx, fy, random.uniform(2, 3.5), w=P)

# ---------------- rolo de massa ----------------
RY = DY + 22
RL, RR = BX - 165, BX + 165
path(f'M{RL} {RY - 20}L{RR} {RY - 20}Q{RR + 12} {RY} {RR} {RY + 20}L{RL} {RY + 20}Q{RL - 12} {RY} {RL} {RY - 20}Z')
linha(f'M{RL + 24} {RY - 8}L{RR - 24} {RY - 8}', P)
elip(RL, RY, 9, 20, w=M)
elip(RR, RY, 9, 20, w=M)
ret(RL - 62, RY - 10, 56, 20, 10, w=M)
ret(RR + 6, RY - 10, 56, 20, 10, w=M)

# ---------------- braços: manga (tubo) + punho + patinha ----------------
def tubo(d, larg=40):
    add(f'<path d="{d}" fill="none" stroke="{K}" stroke-width="{larg + 2 * G}"/>')
    add(f'<path d="{d}" fill="none" stroke="#fff" stroke-width="{larg}"/>')


for lado in (-1, 1):
    sx, sy = BX + lado * 92, CO + 46          # ombro
    hx = BX + lado * 200                      # mão no cabo
    ex, ey = BX + lado * 138, CO + 128        # cotovelo
    wx, wy = hx - lado * 4, RY - 34           # punho
    tubo(f'M{sx} {sy}Q{ex + lado * 4} {ey - 50} {ex} {ey}L{wx} {wy}')
    linha(f'M{sx - lado * 6} {sy - 22}q{lado * 26} 8 {lado * 30} 40', P)
    linha(f'M{ex - lado * 22} {ey - 4}q{lado * 12} 10 {lado * 26} 6', P)
    g(wx, wy, 1, lado * 18)
    ret(-27, -12, 54, 22, 10, w=M)
    for k in (-14, -4, 6, 16):
        linha(f'M{k} -10l0 18', P)
    fg()
    path(f'M{hx - 26} {RY - 12}C{hx - 30} {RY + 18} {hx + 30} {RY + 18} {hx + 26} {RY - 12}'
         f'C{hx + 20} {RY - 32} {hx - 20} {RY - 32} {hx - 26} {RY - 12}Z')
    linha(f'M{hx - 11} {RY + 2}l0 11M{hx + 1} {RY + 3}l0 12M{hx + 13} {RY + 1}l0 10', P)

# ---------------- tigela com fouet (esquerda) ----------------
TY = TOPO_Y + 70
linha(f'M130 {TY + 20}L182 {TY - 80}', G + 4)
linha(f'M130 {TY + 20}L182 {TY - 80}', M + 2)
for k in (-12, 0, 12):
    path(f'M{182 + k * .5} {TY - 80}q{16 + k} -44 4 -62q-20 16-10 62', fill='none', w=P)
path(f'M50 {TY}L270 {TY}Q266 {TY + 70} 160 {TY + 74}Q54 {TY + 70} 50 {TY}Z')
elip(160, TY, 110, 22)
path(f'M74 {TY + 2}q86 22 172 0q-20-12-86-12q-66 0-86 12Z', w=P)
linha(f'M70 {TY + 34}q90 16 180 0', P)
for k in range(5):
    estrela(86 + k * 37, TY + 50 - abs(2 - k) * 2, 6, w=P)

# ---------------- bandeja com biscoitos (frente esquerda) ----------------
BY0 = BASE_Y - 96
path(f'M40 {BY0 + 8}L300 {BY0}L318 {BY0 + 84}L28 {BY0 + 92}Z')
path(f'M52 {BY0 + 18}L292 {BY0 + 11}L306 {BY0 + 76}L42 {BY0 + 82}Z', w=P)
g(0, BY0 - 1030)
path('M110 1050a14 14 0 1 1 18 0l22 4q8 6 0 12l-18-2l4 22l12 14q-2 10-12 6l-14-14l-14 14q-10 4-12-6l12-14l4-22l-18 2q-8-6 0-12Z', w=M)
ponto(114, 1040, 2.5)
ponto(124, 1040, 2.5)
linha('M108 1070q11 4 22 0M110 1082q10 3 20 0', P)
estrela(195, 1072, 26, w=M)
linha('M195 1056l0 32M181 1066l28 12M209 1066l-28 12', P)
circ(262, 1070, 24, w=M)
circ(262, 1070, 15, w=P)
for (dx, dy) in ((-6, -6), (5, -3), (-2, 6), (7, 7)):
    linha(f'M{262 + dx} {1070 + dy}l4 3', P)
fg()

# ---------------- forminhas soltas ----------------
coracao(470, BASE_Y - 30, 18, w=M)
coracao(470, BASE_Y - 30, 10, w=P)
estrela(540, BASE_Y - 26, 19, w=M)
estrela(540, BASE_Y - 26, 10, w=P)

# =====================================================================
# FAROFA espiando de dentro do saco de farinha
# =====================================================================
FX, FY = 892, TOPO_Y + 40
path(f'M{FX - 80} {FY + 100}C{FX - 96} {FY + 40} {FX - 84} {FY - 10} {FX - 62} {FY - 30}'
     f'L{FX + 62} {FY - 30}C{FX + 84} {FY - 10} {FX + 96} {FY + 40} {FX + 80} {FY + 100}Z')
texto(FX, FY + 60, 'farinha', 30)
linha(f'M{FX - 50} {FY + 76}q50 8 100 0', P)
g(FX - 4, FY - 44, 1, 8)
path('M-46-6L-40-58L-14-36ZM46-6L40-58L14-36Z')
linha('M-36-44l6 12M36-44l-6 12', P)
path('M-50 4C-52-36-24-48 0-48C24-48 52-36 50 4C48 28 26 38 0 38C-26 38-48 28-50 4Z')
linha('M-8-44l0 12M8-44l0 12M-20-40l4 10M20-40l-4 10', P)
elip(-18, 2, 6, 8, K, 0)
elip(18, 2, 6, 8, K, 0)
circ(-16, -1, 2, '#fff', 0)
circ(20, -1, 2, '#fff', 0)
path('M-6 14l12 0l-6 7z', K, 2)
linha('M0 21q-6 8-12 4M0 21q6 8 12 4', P)
linha('M-30 16l-26-4M-30 22l-24 6M30 16l26-4M30 22l24 6', P)
circ(-10, -30, 3, w=P)
circ(6, -36, 3, w=P)
fg()
path(f'M{FX - 70} {FY - 34}Q{FX} {FY - 4} {FX + 70} {FY - 34}L{FX + 66} {FY - 14}Q{FX} {FY + 14} {FX - 66} {FY - 14}Z', w=M)

# ---------------- receita da vovó ----------------
g(850, BASE_Y - 60, 1, 10)
ret(-70, -44, 140, 88, 6, w=M)
texto(0, -12, 'receita', 24)
texto(0, 10, 'da vovó', 24)
linha('M-50 24l100 0M-50 34l70 0', P)
fg()

# =====================================================================
# CHÃO
# =====================================================================
CH = BASE_Y + 92
FUNDO = H - 70
add(f'<rect x="-10" y="{CH}" width="{W + 20}" height="{H - CH + 10}" fill="#fff" stroke="none"/>')
for k in range(-6, 17):
    x0 = 500 + (k - 5) * 100
    linha(f'M{500 + (x0 - 500) * .75:.1f} {CH}L{500 + (x0 - 500) * 1.35:.1f} {FUNDO}', P)
for yy in (CH + 34, CH + 76, CH + 128, CH + 190):
    linha(f'M0 {yy}L{W} {yy}', P)
# pernas da mesa
for lx in (70, 870):
    path(f'M{lx} {CH}L{lx + 60} {CH}L{lx + 52} {FUNDO - 10}Q{lx + 30} {FUNDO} {lx + 8} {FUNDO - 10}Z')
    linha(f'M{lx + 8} {CH + 40}L{lx + 52} {CH + 40}M{lx + 10} {CH + 52}L{lx + 50} {CH + 52}', P)
# tapete redondo com franjinha
RYc = FUNDO - 64
elip(500, RYc, 250, 50)
elip(500, RYc, 205, 36, w=P)
elip(500, RYc, 150, 22, w=P)
d = ''
for k in range(36):
    a = math.radians(k * 10)
    d += f'M{500 + 228 * math.cos(a):.1f} {RYc + 43 * math.sin(a) - 4:.1f}l0 8'
linha(d, P)
# novelo de lã (brinquedo da Farofa) com fio solto
NX, NY = 430, RYc - 22
linha(f'M{NX + 30} {NY + 14}C{NX + 80} {NY + 40} {NX + 110} {NY - 6} {NX + 150} {NY + 20}', M)
circ(NX, NY, 34)
linha(f'M{NX - 28} {NY - 14}Q{NX} {NY - 4} {NX + 26} {NY - 22}M{NX - 32} {NY + 4}Q{NX} {NY + 14} {NX + 32} {NY - 2}'
      f'M{NX - 22} {NY + 22}Q{NX + 4} {NY + 28} {NX + 26} {NY + 18}M{NX - 8} {NY - 32}Q{NX + 8} {NY} {NX - 4} {NY + 32}', P)
# biscoito mordido no chão
g(660, RYc - 2)
path('M-26 0a26 18 0 1 0 50 4q-10 4-12-6q-8 6-14-2q-10 2-24 4Z', w=M)
ponto(-10, 6, 2.5)
ponto(6, 10, 2.5)
fg()
# presentinho
GX, GY = 220, FUNDO - 120
ret(GX, GY, 80, 64, 6)
ret(GX - 8, GY - 20, 96, 22, 6, w=M)
ret(GX + 34, GY - 20, 12, 84, 0, w=M)
path(f'M{GX + 40} {GY - 20}q-30-30-36-6q6 14 36 6Zm0 0q30-30 36-6q-6 14-36 6Z', w=M)
for (dx, dy) in ((12, 18), (66, 36), (20, 46), (66, 12)):
    estrela(GX + dx, GY + dy, 6, w=P)
# migalhas
for (mx, my) in ((690, RYc + 14), (705, RYc - 6), (330, RYc + 22)):
    circ(mx, my, 3, w=P)

# =====================================================================
# MARGEM + FUROS + RODAPÉ
# =====================================================================
ML, MT, MR, MB = 74, 34, 966, H - 74
add(f'<path d="M-20-20H{W + 20}V{H + 20}H-20Z M{ML} {MT}V{MB}H{MR}V{MT}Z" fill="#fff" fill-rule="evenodd"/>')
add(f'<rect x="{ML}" y="{MT}" width="{MR - ML}" height="{MB - MT}" rx="26" fill="none" stroke="{K}" stroke-width="8"/>')
for fy in (H / 2 - 150, H / 2 + 150):          # furos (8 cm entre eles no A4 ≈ 300 un)
    add(f'<circle cx="36" cy="{fy}" r="11" fill="none" stroke="#999" stroke-width="2" stroke-dasharray="4 4"/>')
texto(150, H - 34, 'Natal Fofo', 26)
texto(W - 180, H - 34, '@Cardeno_Amarelo · uso pessoal', 22)

svg = (f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" '
       f'stroke-linejoin="round">' + ''.join(el) + '</svg>')
if __name__ == '__main__':
    import sys
    open(sys.argv[1] if len(sys.argv) > 1 else 'biscoitos.svg', 'w').write(svg)
