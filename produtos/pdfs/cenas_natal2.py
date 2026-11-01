"""Mais cenas do Bolinho e da Farofa pro caderno de Natal (páginas 3 em diante)."""
import math
import random
from cenas import Cena, F, T
from cenas_natal import (biscoito_boneco, biscoito_estrela, biscoito_arvore, biscoito_redondo, pinheiro, caneca,
                         bola_enfeite, bengala, presente)


# ---------- peças de cenário ----------
def chao_tabuas(c, y0, y1=1300):
    c.ret(-10, y0, 1020, y1 - y0 + 10, 0)
    ys = [y0 + k * 56 for k in range(1, 20) if y0 + k * 56 < y1]
    for y in ys:
        c.linha(f'M0 {y}L1000 {y}', 3)
    for i, y in enumerate([y0] + ys):
        for x in range(80 + (i % 3) * 120, 1000, 360):
            c.linha(f'M{x} {y}l0 56', 2.5)


def parede_bolinhas(c, y1, passo=90, evita=()):
    for y in range(60, y1, passo):
        for x in range(40 + (y // passo % 2) * passo // 2, 1000, passo):
            if any(a <= x <= b and cc <= y <= d for (a, cc, b, d) in evita):
                continue
            c.coracao(x, y, 7, w=2) if (x + y) % 3 == 0 else c.circ(x, y, 4, w=2)


def ceu_estrelado(c, x0, y0, x1, y1, n, semente=3):
    rnd = random.Random(semente)
    for _ in range(n):
        x, y = rnd.uniform(x0 + 15, x1 - 15), rnd.uniform(y0 + 15, y1 - 15)
        if rnd.random() < .3:
            c.estrela(x, y, 9, 4, w=2.5)
        else:
            c.bolinha_neve(x, y, 4.5)


def janela(c, jx, jy, jw, jh, dentro=None, cortina=True):
    c.ret(jx - 16, jy - 16, jw + 32, jh + 32, 10)
    c.ret(jx, jy, jw, jh, 4)
    if dentro:
        dentro(c, jx, jy, jw, jh)
    c.ret(jx + jw / 2 - 7, jy, 14, jh, 2)
    c.ret(jx, jy + jh / 2 - 7, jw, 14, 2)
    c.ret(jx - 32, jy + jh + 14, jw + 64, 20, 6)
    if cortina:
        for lado in (-1, 1):
            x0 = jx if lado < 0 else jx + jw
            X = lambda dx: x0 - lado * dx
            c.path(f'M{X(40)} {jy - 34}L{X(-34)} {jy - 34}Q{X(-30)} {jy + jh * .4} {X(-8)} {jy + jh * .55}'
                   f'Q{X(-36)} {jy + jh * .75} {X(-20)} {jy + jh + 10}L{X(44)} {jy + jh + 10}Q{X(34)} {jy + jh * .7} {X(34)} {jy + jh * .55}'
                   f'Q{X(42)} {jy + jh * .3} {X(40)} {jy - 34}Z')
            c.linha(f'M{X(8)} {jy - 26}Q{X(4)} {jy + jh * .3} {X(10)} {jy + jh * .52}M{X(10)} {jy + jh * .6}Q{X(0)} {jy + jh * .8} {X(8)} {jy + jh + 6}', 3)
            c.elip(X(12), jy + jh * .56, 32, 11, w=F)
        c.ret(jx - 60, jy - 50, jw + 120, 22, 11)


def paisagem_neve(c, jx, jy, jw, jh, lua=True, treno=False):
    c.path(f'M{jx} {jy + jh * .72}Q{jx + jw * .4} {jy + jh * .6} {jx + jw} {jy + jh * .7}L{jx + jw} {jy + jh}L{jx} {jy + jh}Z', w=F)
    pinheiro(c, jx + jw * .2, jy + jh * .72, jh * .3)
    pinheiro(c, jx + jw * .78, jy + jh * .7, jh * .22)
    if lua:
        c.path(f'M{jx + jw * .7} {jy + 30}a30 30 0 1 0 28 44a25 25 0 1 1-28-44Z', w=F)
    if treno:
        x, y = jx + jw * .25, jy + jh * .3
        c.path(f'M{x} {y}l40 0q14 0 14-14l0-6l-10 0l0 8l-40 0Z', w=2.5)
        for k in range(2):
            c.path(f'M{x + 64 + k * 30} {y - 14}l14-6l4 8l-10 2l2 6l-10-2Z', w=2.5)
        c.linha(f'M{x + 52} {y - 10}l70-16', 2)
    for k in range(8):
        c.bolinha_neve(jx + 20 + (k * 53) % (jw - 30), jy + 30 + (k * 37) % (jh * .55), 4)


def abajur(c, x, y, s=1):
    c.grupo(x, y, s)
    c.path('M-50-120L50-120L70-50L-70-50Z')
    c.linha('M-60-86l120 0', 2.5)
    c.ret(-6, -50, 12, 70, 3)
    c.elip(0, 22, 40, 10)
    c.fim()


def planta_vaso(c, x, y, s=1):
    c.grupo(x, y, s)
    for ang in (-70, -40, -10, 20, 50, 80):
        a = math.radians(ang - 90)
        c.path(f'M0-50Q{50 * math.cos(a - .4)} {-50 + 50 * math.sin(a - .4)} {80 * math.cos(a)} {-50 + 80 * math.sin(a)}'
               f'Q{50 * math.cos(a + .4)} {-50 + 50 * math.sin(a + .4)} 0-50Z', w=F)
        c.linha(f'M0-50L{60 * math.cos(a)} {-50 + 60 * math.sin(a)}', 2)
    c.path('M-36-50L36-50L28 0L-28 0Z')
    c.ret(-42, -62, 84, 18, 6)
    c.fim()


def quadro(c, x, y, w, h, dentro='coracao'):
    c.ret(x, y, w, h, 6)
    c.ret(x + 10, y + 10, w - 20, h - 20, 3, w=F)
    cx, cy = x + w / 2, y + h / 2
    if dentro == 'coracao':
        c.coracao(cx, cy, min(w, h) * .2, w=F)
    elif dentro == 'montanha':
        c.path(f'M{x + 12} {y + h - 12}L{cx - 10} {cy - 10}L{cx + 8} {cy + 8}L{cx + 26} {cy - 6}L{x + w - 12} {y + h - 12}Z', w=2.5)
        c.circ(x + w - 30, y + 30, 8, w=2.5)
    elif dentro == 'estrela':
        c.estrela(cx, cy, min(w, h) * .25, w=F)


def estante_livros(c, x, y, w, h, prateleiras=3, semente=5):
    rnd = random.Random(semente)
    c.ret(x, y, w, h, 6)
    alt = (h - 20) / prateleiras
    for p in range(prateleiras):
        yb = y + 10 + (p + 1) * alt
        c.ret(x + 6, yb - 8, w - 12, 12, 2, w=F)
        bx = x + 14
        while bx < x + w - 40:
            bw = rnd.choice((18, 22, 26, 30))
            bh = alt - rnd.choice((20, 28, 36))
            if rnd.random() < .15:
                c.circ(bx + 18, yb - 26, 18, w=F)
                bx += 44
                continue
            c.ret(bx, yb - 8 - bh, bw, bh, 3, w=F)
            c.linha(f'M{bx + 4} {yb - 8 - bh + 14}l{bw - 8} 0', 2)
            bx += bw + 3


def nuvem(c, x, y, s=1):
    c.path(f'M{x - 60 * s} {y}C{x - 80 * s} {y} {x - 80 * s} {y - 34 * s} {x - 52 * s} {y - 36 * s}C{x - 48 * s} {y - 66 * s} {x - 6 * s} {y - 70 * s} {x + 6 * s} {y - 44 * s}'
           f'C{x + 30 * s} {y - 64 * s} {x + 70 * s} {y - 50 * s} {x + 60 * s} {y - 22 * s}C{x + 84 * s} {y - 18 * s} {x + 80 * s} {y} {x + 60 * s} {y}Z', w=F)


def casa(c, x, y, w, h, semente=1):
    """Casinha com telhado de neve. (x, y) = canto de baixo à esquerda."""
    c.ret(x, y - h, w, h, 4)
    c.path(f'M{x - 20} {y - h + 4}L{x + w / 2} {y - h - w * .5}L{x + w + 20} {y - h + 4}Z')
    c.path(f'M{x - 24} {y - h + 6}L{x + w / 2} {y - h - w * .5 - 4}L{x + w + 24} {y - h + 6}Q{x + w * .8} {y - h - 14} {x + w * .6} {y - h + 2}Q{x + w * .4} {y - h - 16} {x + w * .2} {y - h + 2}Q{x} {y - h - 14} {x - 24} {y - h + 6}Z', w=F)
    c.ret(x + w * .14, y - h * .62, w * .26, w * .26, 3, w=F)
    c.linha(f'M{x + w * .27} {y - h * .62}l0 {w * .26}M{x + w * .14} {y - h * .62 + w * .13}l{w * .26} 0', 2.5)
    c.ret(x + w * .56, y - h * .55, w * .26, h * .55, 4, w=F)
    c.circ(x + w * .62, y - h * .27, 3, w=2)
    c.circ(x + w * .69, y - h * .45, w * .07, w=2.5)


def monte_neve(c, x0, x1, y, alt):
    c.path(f'M{x0} {y}Q{(x0 + x1) / 2} {y - alt * 2} {x1} {y}Z', w=F)


# ---------- Cena 3: guerra de bolinha de neve ----------
def cena_guerra_neve():
    c = Cena()
    ceu_estrelado(c, 0, 0, 1000, 420, 30, 9)
    nuvem(c, 200, 140, 1.2)
    nuvem(c, 760, 110, 1)
    # morros e casinhas lá longe
    c.path('M-10 560Q250 420 520 520Q760 430 1010 520L1010 1310L-10 1310Z')
    casa(c, 90, 520, 120, 90)
    casa(c, 680, 500, 140, 100)
    c.linha('M780 380q-10-16 0-30q10-14 0-30', 3)
    c.ret(770, 380, 22, 34, 2)
    pinheiro(c, 290, 520, 120)
    pinheiro(c, 360, 528, 90)
    pinheiro(c, 900, 500, 130)
    pinheiro(c, 560, 516, 80)
    # chão de neve
    c.path('M-10 700Q300 620 600 680Q850 720 1010 660L1010 1310L-10 1310Z')
    # boneco de neve de cachecol no fundo
    bx, by = 520, 690
    c.circ(bx, by, 60)
    c.circ(bx, by - 86, 42)
    c.path(f'M{bx - 40} {by - 54}Q{bx} {by - 34} {bx + 40} {by - 54}L{bx + 42} {by - 40}Q{bx} {by - 18} {bx - 42} {by - 40}Z', w=F)
    c.path(f'M{bx + 20} {by - 40}l10 50l18-4l-6-48z', w=F)
    c.ponto(bx - 14, by - 94, 5)
    c.ponto(bx + 14, by - 94, 5)
    c.path(f'M{bx} {by - 84}l34 6l-34 6z', w=3)
    c.linha(f'M{bx - 14} {by - 70}q14 10 28 0', 3)
    c.path(f'M{bx - 34} {by - 120}L{bx + 34} {by - 120}L{bx + 30} {by - 170}L{bx - 30} {by - 170}Z')
    c.ret(bx - 46, by - 128, 92, 14, 6)
    for k in range(3):
        c.ponto(bx, by - 20 + k * 22, 5)
    c.linha(f'M{bx - 58} {by - 20}l-50-40l-8-16M{bx - 92} {by - 46}l-16 4M{bx + 58} {by - 20}l50-44l14-4M{bx + 96} {by - 54}l4-14', F)
    # forte de neve da Farofa (esquerda)
    c.farofa(200, 900, .9, olhando=1, rabo=-1, gorro=True)
    for fila, (y, n, off) in enumerate(((1000, 5, 0), (950, 5, 36), (900, 4, 72))):
        for k in range(n):
            c.ret(30 + off + k * 72, y - 50, 72, 50, 14)
    for (x, y) in ((340, 1010), (372, 1020), (356, 990)):
        c.circ(x, y, 18)
    # bolinhas voando
    for (x, y, r) in ((420, 760, 18), (620, 820, 16)):
        c.circ(x, y, r)
        c.linha(f'M{x - r - 10} {y - 4}l-40 6M{x - r - 6} {y + 8}l-30 6', 3)
    c.linha('M300 790q40-40 100-34', 3)
    # Bolinho jogando (direita)
    c.bolinho(760, 860, 1.05, braco_e=(-60, 40), braco_d=(96, -150), gorro='noel', cachecol=True, boca='aberta', roupa='listras')
    c.bolinho(760, 860, 1.05, braco_e=(-60, 40), braco_d=(96, -150), so_bracos=True)
    c.circ(924, 762, 22)
    # trenó encostado e pegadas
    c.path('M850 1180l120 0q20 0 20-20l-10 0q0 10-10 10l-120 0z', w=F)
    c.ret(860, 1124, 110, 40, 8)
    c.linha('M880 1164l0 16M950 1164l0 16', F)
    c.tubo('M860 1140q-40-10-60 20', 6, 3)
    for k in range(6):
        x, y = 470 + k * 50, 1250 - k * 30 - (k % 2) * 16
        c.elip(x, y, 12, 8, w=2.5, rot=-30)
    # montanhas lá no fundo e passarinhos
    c.path('M300 470L420 300L480 380L560 250L700 440Z', w=F)
    c.path('M520 296L560 250L600 300L580 290L560 310L540 290Z', w=2.5)
    c.path('M380 356L420 300L450 340L430 334L410 352Z', w=2.5)
    for (x, y) in ((560, 160), (600, 190), (330, 230)):
        c.linha(f'M{x - 16} {y}q8-10 16 0q8-10 16 0', 3)
    # anjo de neve no chão
    c.path('M150 1120C120 1090 70 1100 60 1140C80 1150 110 1140 130 1150C110 1170 90 1210 110 1240C130 1240 150 1210 160 1190'
           'C170 1210 190 1240 210 1240C230 1210 210 1170 190 1150C210 1140 240 1150 260 1140C250 1100 200 1090 170 1120Z', w=F)
    c.circ(160, 1104, 26, w=F)
    # luvinhas, cenoura e balde esquecidos
    for (x, rot) in ((300, -20), (350, 15)):
        c.path(f'M{x - 18} 1250L{x - 22} 1200Q{x - 22} 1176 {x} 1176Q{x + 22} 1176 {x + 20} 1200L{x + 18} 1250Z', w=F)
        c.path(f'M{x - 20} 1206Q{x - 40} 1200 {x - 36} 1186Q{x - 30} 1178 {x - 18} 1190', w=2.5)
        c.ret(x - 22, 1240, 44, 16, 6, w=2.5)
    c.path('M640 1080L700 1070L700 1090Z', w=3)
    c.linha('M700 1072l14-10M700 1080l16 0M700 1088l14 10', 2.5)
    c.path('M560 1150L580 1240L660 1240L680 1150Z')
    c.elip(620, 1150, 60, 14, w=F)
    c.path('M562 1160Q620 1100 678 1160', 'none', 3)
    # placa da vila
    c.ret(462, 950, 18, 140, 4)
    c.ret(386, 930, 170, 60, 8, rot=-4)
    c.texto(471, 970, 'Vila do Caderno', 26, rot=-4)
    # floquinhos caindo
    for (x, y) in ((80, 620), (640, 400), (420, 300), (940, 610), (380, 1180)):
        c.floco(x, y, 14, 2.5)
    return c


# ---------- Cena 4: carta pro Papai Noel ----------
def cena_carta():
    c = Cena()
    parede_bolinhas(c, 760, 100, evita=((40, 60, 460, 560), (560, 40, 980, 420)))
    chao_tabuas(c, 1040)
    janela(c, 90, 120, 320, 340, lambda c, *a: paisagem_neve(c, *a, treno=True))
    # prateleira com brinquedos
    c.ret(580, 330, 380, 20, 5)
    for x in (620, 920):
        c.path(f'M{x} 350L{x} 390L{x + 24} 350Z', w=F)
    # trenzinho
    c.ret(600, 270, 70, 50, 6)
    c.ret(610, 240, 40, 30, 4)
    c.ret(670, 280, 60, 40, 6)
    for x in (620, 652, 690, 716):
        c.circ(x, 322, 11, w=F)
    c.ret(612, 220, 16, 22, 3, w=F)
    # pião e ursinho? não: robôzinho e bola
    c.ret(760, 240, 60, 60, 8)
    c.ret(772, 256, 36, 18, 4, w=F)
    c.linha('M790 240l0-20', 3)
    c.circ(790, 214, 7, w=3)
    c.ret(764, 300, 20, 30, 4, w=F)
    c.ret(796, 300, 20, 30, 4, w=F)
    c.circ(890, 290, 38)
    c.linha('M854 280q36 20 72 0M890 252q-16 38 0 76', 3)
    # quadro e varal de fotos
    c.linha('M580 120Q770 170 960 120', 3)
    for k, x in enumerate((620, 720, 820, 910)):
        y = 120 + 50 * math.sin((x - 580) / 380 * math.pi) * .9
        c.ret(x - 36, y + 6, 72, 80, 4, rot=(-1) ** k * 5)
        c.ret(x - 28, y + 14, 56, 54, 2, w=2.5, rot=(-1) ** k * 5)
        c.ret(x - 6, y - 4, 12, 20, 2, w=2.5)
        [lambda: c.coracao(x, y + 42, 12, w=2.5), lambda: c.estrela(x, y + 42, 14, w=2.5),
         lambda: c.floco(x, y + 42, 14, 2), lambda: c.circ(x, y + 42, 12, w=2.5)][k]()
    # Bolinho sentado escrevendo
    c.bolinho(470, 560, 1.1, braco_e=(-60, 100), braco_d=(60, 100), roupa='coracao', pes=False)
    # escrivaninha
    c.ret(60, 830, 900, 40, 10)
    c.ret(90, 870, 840, 180, 0)
    c.ret(110, 890, 260, 70, 8, w=F)
    c.ret(110, 970, 260, 70, 8, w=F)
    for y in (918, 998):
        c.ret(220, y, 40, 12, 6, w=F)
    c.ret(650, 890, 260, 150, 8, w=F)
    c.ret(760, 950, 40, 12, 6, w=F)
    # papel da carta
    c.path('M340 744L600 740L630 826L310 830Z')
    c.texto(470, 770, 'Querido Papai Noel,', 24)
    c.texto(470, 794, 'esse ano eu fui', 22)
    c.texto(470, 816, 'bonzinho... quase!', 22)
    # lápis na mão
    c.path('M596 742L640 680L652 690L608 752Z', w=3)
    c.path('M596 742L590 760L608 752Z', w=2.5)
    c.bolinho(470, 560, 1.1, braco_e=(-60, 100), braco_d=(60, 100), so_bracos=True)
    # abajur, copo de lápis, livros, vela
    abajur(c, 160, 830, 1.1)
    c.path('M700 830L706 760L760 760L766 830Z')
    for (x, a) in ((716, -14), (730, -4), (746, 8)):
        c.path(f'M{x} 760l{a} -60l8 2l-{a - 4} 60z', w=2.5)
    for k, (w_, h_) in enumerate(((150, 30), (130, 28), (160, 32))):
        y = 830 - sum(hh for _, hh in ((150, 30), (130, 28), (160, 32))[:k + 1])
        c.ret(800 - k * 6, y, w_, h_, 4)
        c.linha(f'M{812 - k * 6} {y + h_ / 2}l{w_ - 30} 0', 2.5)
    c.farofa_dormindo(870, 742, .7)
    # caneca de chocolate
    caneca(c, 250, 820, .8, 'floco')
    # papéis amassados e cestinho
    c.path('M760 1260L780 1130L900 1130L920 1260Z')
    for k in range(5):
        c.linha(f'M{790 + k * 26} 1132l-4 126', 2.5)
    for (x, y, r) in ((800, 1124, 26), (850, 1116, 24), (900, 1128, 22), (690, 1240, 26), (620, 1210, 22)):
        c.circ(x, y, r)
        c.linha(f'M{x - r * .5} {y - r * .2}l{r * .5} {r * .3}l{r * .3} {-r * .5}M{x - r * .2} {y + r * .4}l{r * .5} -4', 2.5)
    # chinelinhos
    for (x, rot) in ((200, -8), (290, 6)):
        c.elip(x, 1200, 50, 26, rot=rot)
        c.path(f'M{x - 10} 1186a26 22 0 0 1 52 6', w=F, fill='#fff')
        c.circ(x + 20, 1180, 8, w=2.5)
    return c


# ---------- Cena 5: chocolate quente e cobertor ----------
def cena_sofa():
    c = Cena()
    parede_bolinhas(c, 760, 100, evita=((560, 60, 960, 470),))
    chao_tabuas(c, 1000)
    janela(c, 620, 110, 280, 320, lambda c, *a: paisagem_neve(c, *a))
    estante_livros(c, 40, 120, 300, 380, 3)
    quadro(c, 380, 160, 130, 110, 'montanha')
    quadro(c, 400, 300, 90, 90, 'coracao')
    # varal de luzinhas
    c.varal_luzes(-10, 40, 1010, 40, 30, 12, 18)
    # sofa
    c.path('M80 600Q80 540 140 540L860 540Q920 540 920 600L920 760L80 760Z')
    for x in (180, 500):
        c.path(f'M{x} 580Q{x} 560 {x + 20} 560L{x + 300} 560Q{x + 320} 560 {x + 320} 580L{x + 320} 760L{x} 760Z', w=F)
        for (dx, dy) in ((80, 620), (240, 620), (160, 700)):
            c.linha(f'M{x + dx - 6} {dy}l12 0M{x + dx} {dy - 6}l0 12', 2.5)
    c.path('M40 660Q40 600 100 600L180 600L180 940L40 940Z')
    c.path('M820 600L900 600Q960 600 960 660L960 940L820 940Z')
    c.ret(60, 760, 880, 120, 16)
    c.ret(100, 820, 380, 52, 10, w=F)
    c.ret(520, 820, 380, 52, 10, w=F)
    for x in (80, 910):
        c.ret(x, 940, 24, 50, 4)
    # almofadas
    c.path('M600 580C640 560 760 560 780 590C800 640 790 700 770 730C730 750 640 750 610 720C590 680 590 620 600 580Z')
    c.coracao(690, 650, 30, w=F)
    c.linha('M610 600l-10-10M770 600l12-10M610 714l-12 10M770 720l12 10', 3)
    # Bolinho enrolado no cobertor com a caneca
    c.bolinho(380, 600, 1.05, gorro=False, braco_e=(30, 70), braco_d=(-20, 74), roupa='pijama', pes=False)
    c.path('M230 680C220 620 300 650 330 670L440 680C480 660 540 620 540 690L560 800C520 830 260 830 230 800Z')
    for (x0, y0) in ((260, 700), (360, 700), (460, 700), (300, 760), (420, 760)):
        c.ret(x0, y0, 64, 50, 6, w=2.5)
        c.linha(f'M{x0 + 8} {y0 + 8}l48 34', 2) if (x0 + y0) % 3 else c.coracao(x0 + 32, y0 + 25, 9, w=2)
    caneca(c, 390, 712, .9, 'coracao')
    c.linha('M380 640q-10-14 0-28M400 640q10-14 0-28', 3)
    c.ret(330, 650, 40, 30, 15)
    c.ret(420, 650, 40, 30, 15)
    # Farofa no braço do sofá
    c.farofa_dormindo(880, 600, .75)
    # mesinha de centro
    c.ret(300, 960, 420, 40, 12)
    c.ret(330, 1000, 26, 120, 6)
    c.ret(664, 1000, 26, 120, 6)
    c.ret(340, 1060, 340, 16, 6, w=F)
    c.elip(420, 950, 70, 18)
    biscoito_estrela(c, 400, 940, 20, -80)
    biscoito_redondo(c, 446, 942, 16)
    for k in range(3):
        c.ret(530 + k * 8, 940 - k * 22, 130, 22, 4)
    c.texto(600, 914, 'contos de Natal', 22)
    # tapete e chinelos
    c.elip(500, 1220, 420, 70)
    c.elip(500, 1220, 360, 50, w=F)
    for k in range(18):
        ang = k * math.pi * 2 / 18
        c.circ(500 + 300 * math.cos(ang), 1220 + 30 * math.sin(ang), 6, w=2)
    for (x, rot) in ((300, -8), (380, 10)):
        c.elip(x, 1150, 46, 22, rot=rot)
        c.path(f'M{x - 10} 1138a24 20 0 0 1 48 6', w=F)
    # meia de tricô e novelo
    c.circ(780, 1150, 34)
    c.linha('M752 1134q28 22 56 0M750 1156q30 20 60 0M770 1118q16 30 2 64', 2.5)
    c.linha('M812 1160q60 30 120 0', F)
    c.path('M930 1140l40-60M946 1140l10-70', 'none', F)
    return c


# ---------- Cena 6: embrulhando presentes ----------
def cena_embrulhos():
    c = Cena()
    parede_bolinhas(c, 760, 90)
    chao_tabuas(c, 1060)
    # guirlanda grande na parede
    c.tubo('M500 90a90 90 0 1 0 0.1 0', 40)
    for i in range(22):
        ang = math.radians(i * 360 / 22)
        c.elip(500 + 90 * math.cos(ang), 180 + 90 * math.sin(ang), 20, 10, w=2.5, rot=i * 360 / 22 + 60)
    for i in range(7):
        ang = math.radians(20 + i * 51)
        bola_enfeite(c, 500 + 96 * math.cos(ang), 180 + 96 * math.sin(ang) + 10, 11, i % 4)
    c.path('M500 280l-50-24l0 48zM500 280l50-24l0 48z', w=F)
    c.circ(500, 280, 12, w=F)
    c.path('M490 290l-24 60M510 290l24 60', 'none', F)
    # prateleira com fitas
    c.ret(700, 330, 260, 18, 5)
    for k, x in enumerate((730, 800, 870, 930)):
        c.ret(x - 24, 280, 48, 50, 8)
        c.circ(x, 305, 10, w=2.5)
    c.ret(700, 460, 260, 18, 5)
    for k in range(3):
        c.ret(720 + k * 80, 380, 66, 80, 6)
        c.linha(f'M{720 + k * 80} 406l66 0', 2.5)
    # Bolinho atrás da mesa
    c.bolinho(500, 560, 1.15, braco_e=(-90, 80), braco_d=(90, 80), roupa='estrela', cachecol=True)
    # mesa
    c.path('M20 740L980 740L1000 900L0 900Z')
    c.ret(0, 900, 1000, 40, 0)
    c.ret(40, 940, 36, 130, 6)
    c.ret(924, 940, 36, 130, 6)
    # papel aberto em cima da mesa com estampa
    c.path('M200 760L760 750L800 880L170 890Z')
    for (x, y) in ((260, 790), (360, 780), (460, 790), (560, 776), (660, 784), (300, 850), (420, 840), (540, 846), (680, 836)):
        c.estrela(x, y, 13, 6, w=2.5) if (x // 100) % 2 else c.coracao(x, y, 10, w=2.5)
    # caixa no meio do embrulho
    c.ret(390, 740, 200, 110, 6)
    c.linha('M390 790l200 0M490 740l0 110', F)
    c.bolinho(500, 560, 1.15, braco_e=(-90, 80), braco_d=(90, 80), so_bracos=True)
    # tesoura
    c.circ(110, 800, 22)
    c.circ(150, 826, 22)
    c.path('M126 790L240 760L246 772L134 808ZM140 812L250 800L250 812L150 826Z', w=3)
    # durex
    c.circ(860, 800, 40)
    c.circ(860, 800, 18, w=F)
    c.path('M820 800l-40 16l10 14l34-20Z', w=3)
    # etiquetas
    for k, (x, y, t) in enumerate(((880, 870, 'Farofa'), (240, 900, 'Vó'))):
        c.path(f'M{x - 50} {y - 20}L{x + 30} {y - 20}L{x + 50} {y}L{x + 30} {y + 20}L{x - 50} {y + 20}Z', w=F)
        c.circ(x + 30, y, 4, w=2)
        c.texto(x - 10, y + 10, t, 26)
    # cesto com rolos de papel
    for k, (x, top, rot) in enumerate(((50, 860, -8), (100, 820, 2), (150, 880, 10))):
        c.ret(x, top, 46, 1200 - top, 23, rot=rot)
        for j in range(3):
            c.linha(f'M{x + 6 + (j * 7) * math.sin(math.radians(rot))} {top + 40 + j * 70}l34 -14', 2.5)
    c.path('M20 1120L230 1120L210 1290L40 1290Z')
    for k in range(1, 6):
        c.linha(f'M{20 + k * 35} 1124l-{3 * (k - 3)} 160', 2.5)
    c.linha('M28 1180l196 0M34 1236l184 0', 2.5)
    # Farofa dentro de uma caixa, enrolada na fita
    c.path('M640 1240L660 1080L900 1080L920 1240Z')
    c.path('M660 1080L620 1040L700 1040L720 1080Z', w=F)
    c.path('M900 1080L940 1040L860 1040L840 1080Z', w=F)
    c.farofa(780, 1100, .85, olhando=-1, laco=True)
    c.path('M640 1240L660 1080L900 1080L920 1240Z')
    c.linha('M660 1120q120 30 240 0', 3)
    c.tubo('M700 1060q-80 60-60 140q10 40-40 60', 8, 3)
    # pilha de presentes prontos
    presente(c, 270, 1160, 140, 110, 'bolas')
    presente(c, 430, 1180, 150, 90, 'zigue')
    presente(c, 300, 1070, 90, 70, 'estrelas')
    return c
