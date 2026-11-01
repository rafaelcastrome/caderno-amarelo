"""Cenas 7 a 11: lago, casinha de biscoito, noite de Natal, piscina e praia."""
import math
import random
from cenas import Cena, F, T
from cenas_natal import biscoito_boneco, biscoito_estrela, biscoito_redondo, pinheiro, caneca, bola_enfeite, bengala, presente
from cenas_natal2 import (chao_tabuas, parede_bolinhas, ceu_estrelado, janela, paisagem_neve, abajur, planta_vaso, quadro,
                          nuvem, casa, monte_neve)


def patins(c, x, y, s=1, rot=0):
    c.grupo(x, y, s, rot)
    c.path('M-30-40L10-40L14-10L36-6Q44 0 40 10L-30 10Z')
    c.linha('M-24-30l26 0M-24-20l28 0', 2.5)
    c.path('M-36 22L44 22Q52 22 50 14', 'none', F)
    c.linha('M-20 10l0 12M30 10l0 12', 3)
    c.fim()


def poste_luz(c, x, base, h):
    c.ret(x - 7, base - h, 14, h, 4)
    c.path(f'M{x - 26} {base - h}L{x + 26} {base - h}L{x + 18} {base - h - 50}L{x - 18} {base - h - 50}Z')
    c.path(f'M{x - 30} {base - h - 50}L{x + 30} {base - h - 50}L{x} {base - h - 76}Z')
    c.linha(f'M{x - 10} {base - h - 14}q10-20 20 0', 2.5)
    c.ret(x - 22, base - 16, 44, 16, 4)
    c.path(f'M{x - 10} {base - h + 30}l-20 10l0 22l20-10zM{x + 10} {base - h + 30}l20 10l0 22l-20-10z', w=2.5)


# ---------- Cena 7: patinação no lago ----------
def cena_lago():
    c = Cena()
    ceu_estrelado(c, 0, 0, 1000, 380, 26, 21)
    c.path('M760 90a54 54 0 1 0 50 78a46 46 0 1 1-50-78Z')
    c.path('M-10 470Q200 340 420 430Q640 320 1010 440L1010 1310L-10 1310Z')
    for (x, b, h) in ((70, 470, 140), (160, 450, 100), (560, 410, 120), (650, 400, 160), (760, 420, 110), (930, 440, 150)):
        pinheiro(c, x, b, h)
    casa(c, 300, 460, 110, 80)
    # lago congelado
    c.elip(500, 830, 520, 240)
    c.elip(500, 830, 470, 205, w=2.5)
    c.linha('M120 760q140-40 260 10M560 940q120 30 260-20M300 900q60 20 140 0M640 720q80-20 160 10', 2.5)
    c.linha('M200 980c60 30 160 20 200-10c40-30 120-30 160 10', 2.5)
    # varal de luzes entre os postes
    poste_luz(c, 90, 700, 260)
    poste_luz(c, 910, 700, 260)
    c.varal_luzes(90, 380, 910, 380, 60, 12, 18)
    # Bolinho patinando
    c.linha('M120 880C120 820 300 800 330 860C360 920 520 920 540 860C560 800 720 800 760 860', 3)
    c.bolinho(400, 600, 1.15, braco_e=(-90, -30), braco_d=(90, -20), cachecol=True, boca='aberta', roupa='listras', pes=False)
    patins(c, 350, 812, 1.15, -8)
    patins(c, 446, 806, 1.15, 6)
    # Farofa de patins também
    c.farofa(680, 830, .8, olhando=-1, gorro=True)
    patins(c, 662, 846, .6)
    patins(c, 700, 846, .6)
    # banquinho com garrafa térmica e cachecol
    c.ret(780, 1060, 200, 26, 8)
    c.ret(780, 1010, 200, 22, 8)
    for x in (800, 950):
        c.ret(x, 1086, 16, 70, 4)
    c.ret(820, 940, 40, 70, 8)
    c.ret(816, 928, 48, 18, 6)
    caneca(c, 900, 1010, .6, 'floco')
    c.path('M880 1030Q930 1020 960 1040L970 1100L950 1102L944 1056Q920 1046 880 1048Z', w=F)
    c.linha('M950 1080l20 0M948 1092l20 0', 2.5)
    # boneco de neve pequeno e montes de neve
    monte_neve(c, 0, 260, 1180, 60)
    c.circ(160, 1100, 50)
    c.circ(160, 1030, 34)
    c.ponto(150, 1024, 4)
    c.ponto(170, 1024, 4)
    c.path('M160 1034l24 4l-24 4z', w=2.5)
    c.path('M128 1052Q160 1068 192 1052L194 1064Q160 1084 126 1064Z', w=2.5)
    c.path('M130 1004L190 1004L176 960L144 960Z', w=F)
    c.ret(124, 998, 72, 12, 5, w=F)
    # passarinho de cachecol patinando
    c.grupo(250, 980)
    c.elip(0, 0, 36, 28)
    c.path('M-30-4L-56-14L-40 8Z', w=F)
    c.circ(26, -24, 20)
    c.ponto(32, -28, 3.5)
    c.path('M44-24l16 4l-16 6z', w=2.5)
    c.path('M10-10Q26 0 42-10L44 0Q26 10 8 0Z', w=2.5)
    c.linha('M-6 28l-6 14M8 28l6 14M-24 44l24 0M2 44l24 0', 3)
    c.fim()
    # cerquinha de madeira na frente
    c.linha('M-10 1180L1010 1180M-10 1220L1010 1220', 6)
    for x in range(20, 1000, 70):
        c.path(f'M{x - 14} 1290L{x - 14} 1150L{x} 1130L{x + 14} 1150L{x + 14} 1290Z')
    c.ret(380, 1080, 240, 70, 8)
    c.ret(486, 1150, 28, 40, 2)
    c.texto(500, 1128, 'Pista de gelo', 36)
    # pegadinhas de patim no gelo
    c.linha('M200 860q60 30 120 10M560 880q60 20 100 0', 2.5)
    for (x, y) in ((260, 610), (560, 600), (840, 560), (100, 560), (480, 240), (230, 130)):
        c.floco(x, y, 13, 2.5)
    return c


# ---------- Cena 8: casinha de biscoito ----------
def cena_casinha_biscoito():
    c = Cena()
    parede_bolinhas(c, 760, 96, evita=((40, 60, 380, 480),))
    chao_tabuas(c, 1120)
    janela(c, 90, 120, 260, 300, lambda c, *a: paisagem_neve(c, *a, lua=False), cortina=False)
    # varal de bengalas e bandeirinhas
    c.linha('M420 80Q700 140 980 80', 3)
    for k in range(7):
        x = 450 + k * 80
        y = 80 + 60 * math.sin((x - 420) / 560 * math.pi) * .9
        bengala(c, x, y + 30, .8, 180 + (-1) ** k * 8)
    # Bolinho confeitando atrás da mesa
    c.bolinho(260, 690, 1.05, braco_e=(-40, 100), braco_d=(110, 40), roupa='estrela')
    # mesa
    c.path('M0 860L1000 860L1000 1000L0 1000Z')
    c.ret(0, 1000, 1000, 40, 0)
    c.ret(40, 1040, 40, 100, 6)
    c.ret(920, 1040, 40, 100, 6)
    # casinha de biscoito grande
    hx, hy, hw, hh = 430, 900, 360, 250
    c.elip(hx + hw / 2, hy + 10, hw / 2 + 80, 34)
    c.ret(hx, hy - hh, hw, hh, 8)
    c.path(f'M{hx - 40} {hy - hh + 10}L{hx + hw / 2} {hy - hh - 190}L{hx + hw + 40} {hy - hh + 10}Z')
    # telhado de glacê ondulado
    d = f'M{hx - 46} {hy - hh + 12}L{hx + hw / 2} {hy - hh - 196}L{hx + hw + 46} {hy - hh + 12}'
    n = 9
    for k in range(n):
        x0 = hx + hw + 46 - k * (hw + 92) / n
        d += f'Q{x0 - (hw + 92) / n / 2} {hy - hh + 46} {x0 - (hw + 92) / n} {hy - hh + 12}'
    c.path(d + 'Z', w=F)
    for k in range(6):
        y = hy - hh - 140 + k * 26
        hwk = (k + 2) * 24
        c.linha(f'M{hx + hw / 2 - hwk} {y + 40}l{hwk * .4} -10l{hwk * .4} 10l{hwk * .4} -10l{hwk * .4} 10l{hwk * .4} -10', 2)
    # balas no telhado
    for (x, y) in ((hx + hw / 2, hy - hh - 150), (hx + 120, hy - hh - 40), (hx + hw - 120, hy - hh - 40), (hx + 60, hy - hh + 4), (hx + hw - 60, hy - hh + 4)):
        c.circ(x, y, 14, w=F)
        c.linha(f'M{x - 10} {y - 4}l20 8', 2)
    # chaminé
    c.ret(hx + hw - 100, hy - hh - 150, 50, 80, 4)
    c.ret(hx + hw - 108, hy - hh - 160, 66, 20, 6)
    # porta, janelas, bengalas na porta
    c.path(f'M{hx + 140} {hy}L{hx + 140} {hy - 110}Q{hx + 180} {hy - 150} {hx + 220} {hy - 110}L{hx + 220} {hy}Z')
    c.linha(f'M{hx + 180} {hy - 132}l0 132', 2.5)
    c.circ(hx + 200, hy - 56, 6, w=2.5)
    bengala(c, hx + 120, hy - 40, 1.1, 0)
    bengala(c, hx + 240, hy - 40, 1.1, 0)
    for wx in (hx + 30, hx + hw - 100):
        c.ret(wx, hy - 200, 70, 70, 8)
        c.linha(f'M{wx + 35} {hy - 200}l0 70M{wx} {hy - 165}l70 0', 2.5)
        c.path(f'M{wx - 6} {hy - 130}q10 14 20 0q10 14 20 0q10 14 20 0q10 14 22 0', 'none', 2.5)
    for k in range(9):
        c.circ(hx + 20 + k * 40, hy - 16, 10, w=2.5)
    c.estrela(hx + 90, hy - 80, 16, w=F)
    c.coracao(hx + hw - 70, hy - 80, 14, w=F)
    # saco de confeitar na mão do Bolinho
    c.path('M330 818L420 778L436 808L350 848Z')
    c.path('M420 778L470 788L436 808Z', w=3)
    c.linha('M350 828l60-26', 2.5)
    c.bolinho(260, 690, 1.05, braco_e=(-40, 100), braco_d=(110, 40), so_bracos=True)
    # potinhos de doces e granulado
    for k, (x, tipo) in enumerate(((90, 'bolas'), (200, 'estrelas'), (860, 'listras'))):
        c.path(f'M{x - 50} 900Q{x - 50} 960 {x} 960Q{x + 50} 960 {x + 50} 900Z')
        c.elip(x, 900, 50, 12, w=F)
        if tipo == 'bolas':
            for (dx, dy) in ((-20, -6), (0, -12), (20, -6), (-10, -18), (10, -18)):
                c.circ(x + dx, 900 + dy, 9, w=2.5)
        elif tipo == 'estrelas':
            for (dx, dy) in ((-18, -6), (14, -8), (0, -20)):
                c.estrela(x + dx, 900 + dy, 11, 5, w=2.5)
        else:
            for dx in (-24, -8, 8, 24):
                c.ret(x + dx - 5, 870, 10, 32, 5, w=2.5)
    biscoito_boneco(c, 940, 950, .7, 10)
    # Farofa lambendo glacê do pote
    c.farofa(130, 1260, .9, olhando=1, rabo=-1)
    c.path('M150 1110Q160 1120 152 1128', 'none', 3)
    c.path('M230 1270L240 1180L340 1180L350 1270Z')
    c.texto(290, 1236, 'glacê', 30)
    c.path('M234 1180Q260 1150 290 1170Q320 1150 346 1180Z', w=F)
    # migalhas e bala no chão
    c.circ(520, 1240, 16, w=F)
    c.path('M504 1240l-14-10l0 20zM536 1240l14-10l0 20z', w=2.5)
    for (x, y) in ((600, 1270), (640, 1250), (430, 1262)):
        c.circ(x, y, 4, w=2.5)
    c.circ(820, 1220, 50)
    c.linha('M780 1200q40 30 80 0M790 1240q30 14 60 0', 2.5)
    return c


# ---------- Cena 9: esperando o Papai Noel ----------
def cena_noite():
    c = Cena()
    parede_bolinhas(c, 840, 110, evita=((560, 60, 980, 520),))

    def ceu(c, jx, jy, jw, jh):
        c.circ(jx + jw * .5, jy + jh * .42, 90, w=F)
        # trenó voando na frente da lua
        x, y = jx + 80, jy + 150
        c.path(f'M{x} {y}l70 0q20 0 20-20l0-14l-14 0l0 14l-56 0l-12-16l-8 0z', w=2.5)
        c.linha(f'M{x - 4} {y + 10}l100 0q10 0 14-10', 2.5)
        for k in range(3):
            rx = x + 120 + k * 46
            c.path(f'M{rx} {y - 30}l24-4l6 8l-6 6l4 14l-6 0l-4-10l-12 0l-4 10l-6 0l2-14z', w=2.5)
            c.linha(f'M{rx + 22} {y - 34}l-4-12M{rx + 26} {y - 34}l8-10', 2)
        c.linha(f'M{x + 90} {y - 24}L{x + 240} {y - 32}', 2)
        ceu_estrelado(c, jx, jy, jx + jw, jy + jh * .7, 10, 4)
        c.path(f'M{jx} {jy + jh * .8}Q{jx + jw / 2} {jy + jh * .7} {jx + jw} {jy + jh * .8}L{jx + jw} {jy + jh}L{jx} {jy + jh}Z', w=F)
        casa(c, jx + 40, jy + jh * .86, 70, 50)
    janela(c, 600, 110, 330, 360, ceu)
    # prateleira com bichinhos e quadro
    quadro(c, 90, 120, 140, 120, 'estrela')
    quadro(c, 260, 150, 100, 90, 'montanha')
    c.ret(80, 300, 340, 18, 5)
    c.circ(130, 270, 30)
    c.circ(110, 246, 10, w=F)
    c.circ(150, 246, 10, w=F)
    c.ponto(122, 268, 3)
    c.ponto(138, 268, 3)
    c.ret(190, 240, 60, 60, 6)
    c.texto(220, 280, 'A', 40)
    c.ret(256, 250, 50, 50, 6)
    c.texto(281, 284, 'B', 36)
    planta_vaso(c, 370, 300, .55)
    # cama
    c.ret(60, 560, 40, 600, 10)
    c.circ(80, 552, 22)
    c.ret(100, 640, 760, 40, 8)
    c.ret(100, 880, 760, 200, 10)
    c.ret(850, 760, 40, 400, 10)
    c.circ(870, 752, 22)
    # travesseiro e Bolinho deitado
    c.path('M120 700C110 650 160 630 260 640C340 650 360 680 350 720C340 760 140 770 120 740Z')
    c.bolinho(250, 700, .85, gorro='noel', pes=False, roupa='pijama', braco_e=(-20, 60), braco_d=(30, 60))
    # edredom de retalhos
    c.path('M110 790Q500 740 860 780L870 980Q500 1010 100 990Z')
    for i in range(6):
        for j in range(3):
            x0, y0 = 130 + i * 120, 800 + j * 62
            if x0 > 820:
                continue
            k = (i + j) % 4
            if k == 0:
                c.estrela(x0 + 50, y0 + 26, 16, 7, w=2.5)
            elif k == 1:
                c.coracao(x0 + 50, y0 + 28, 14, w=2.5)
            elif k == 2:
                c.linha(f'M{x0 + 20} {y0 + 10}l60 40M{x0 + 80} {y0 + 10}l-60 40', 2)
            else:
                c.floco(x0 + 50, y0 + 28, 16, 2)
    for x in range(230, 860, 120):
        c.linha(f'M{x} 785L{x + 6} 990', 2.5)
    for y in (850, 912):
        c.linha(f'M110 {y}Q500 {y - 20} 866 {y - 6}', 2.5)
    # mãozinhas segurando a coberta
    c.circ(220, 790, 15)
    c.circ(300, 788, 15)
    # Farofa dormindo no pé da cama
    c.farofa_dormindo(720, 790, .75)
    # meia pendurada na cabeceira
    c.linha('M870 776l0 20', 3)
    c.path('M850 790L890 790L888 850Q890 880 864 880L830 880Q812 876 816 858Q820 846 846 846Z')
    c.ret(844, 784, 52, 22, 8, w=F)
    # criado-mudo com abajur, relógio e leite
    c.ret(900, 900, 120, 280, 6)
    c.ret(912, 960, 96, 80, 6, w=F)
    c.circ(960, 1000, 6, w=2.5)
    abajur(c, 960, 880, .7)
    c.ret(890, 880, 140, 22, 6)
    # tapete e brinquedos no chão
    chao_tabuas(c, 1160)
    c.ret(100, 1160, 760, 20, 0)
    c.elip(470, 1250, 300, 50)
    c.elip(470, 1250, 250, 34, w=F)
    c.ret(200, 1190, 80, 60, 6)
    c.texto(240, 1236, 'C', 40)
    c.circ(620, 1230, 36)
    c.linha('M586 1220q34 20 68 0M620 1194q-14 36 0 72', 3)
    c.path('M720 1270L700 1210L780 1200L790 1260Z', w=F)
    c.texto(746, 1246, 'livro', 22, rot=-6)
    return c


# ---------- Cena 10: Natal na piscina (verão brasileiro!) ----------
def palmeira(c, x, base, h, lado=1):
    c.tubo(f'M{x} {base}Q{x + lado * 30} {base - h * .6} {x + lado * 10} {base - h}', 28)
    for k in range(5):
        c.linha(f'M{x + lado * (4 + k * 4)} {base - h * (.15 + k * .17)}l-14 6l28 0', 2.5)
    tx, ty = x + lado * 10, base - h
    for ang in (-170, -130, -80, -30, 10):
        a = math.radians(ang)
        ex, ey = tx + 140 * math.cos(a), ty + 140 * math.sin(a) + 40
        mx, my = tx + 70 * math.cos(a), ty + 70 * math.sin(a) - 30
        c.path(f'M{tx} {ty}Q{mx} {my - 20} {ex} {ey}Q{mx} {my + 20} {tx} {ty}Z', w=F)
        c.linha(f'M{tx} {ty}Q{mx} {my} {ex} {ey}', 2)
    for (dx, dy) in ((-12, 14), (10, 16), (0, 30)):
        c.circ(tx + dx, ty + dy, 13, w=F)


def sol_oculos(c, x, y, r):
    for k in range(12):
        a = math.radians(k * 30)
        c.linha(f'M{x + (r + 14) * math.cos(a)} {y + (r + 14) * math.sin(a)}L{x + (r + 40) * math.cos(a)} {y + (r + 40) * math.sin(a)}', F)
    c.circ(x, y, r)
    c.path(f'M{x - r * .7} {y - r * .15}L{x - r * .05} {y - r * .15}L{x - r * .12} {y + r * .2}Q{x - r * .4} {y + r * .35} {x - r * .62} {y + r * .15}Z', '#fff', F)
    c.path(f'M{x + r * .7} {y - r * .15}L{x + r * .05} {y - r * .15}L{x + r * .12} {y + r * .2}Q{x + r * .4} {y + r * .35} {x + r * .62} {y + r * .15}Z', '#fff', F)
    c.linha(f'M{x - r * .05} {y - r * .12}l{r * .1} 0', F)
    c.linha(f'M{x - r * .3} {y + r * .5}q{r * .3} {r * .2} {r * .6} 0', F)


def cena_piscina():
    c = Cena()
    sol_oculos(c, 520, 270, 70)
    nuvem(c, 300, 200, .9)
    nuvem(c, 760, 180, .8)
    # bandeirinhas
    c.linha('M-10 40Q500 110 1010 40', 3)
    for k in range(12):
        x = 20 + k * 84
        y = 40 + 60 * math.sin((x + 10) / 1020 * math.pi) * .95
        c.path(f'M{x} {y}L{x + 60} {y + 2}L{x + 30} {y + 56}Z', w=F)
        c.estrela(x + 30, y + 18, 9, 4, w=2) if k % 2 else c.circ(x + 30, y + 18, 6, w=2)
    # muro e palmeiras com luzinhas
    c.ret(-10, 420, 1020, 200, 0)
    for y in (470, 520, 570):
        c.linha(f'M0 {y}L1000 {y}', 2.5)
    for y in range(420, 620, 50):
        off = 0 if (y // 50) % 2 == 0 else 50
        for x in range(off, 1000, 100):
            c.linha(f'M{x} {y}l0 50', 2.5)
    palmeira(c, 120, 620, 380, 1)
    palmeira(c, 900, 620, 340, -1)
    for k in range(7):
        c.circ(132 + (k % 2) * 14, 590 - k * 48, 7, w=2.5)
    # deque
    c.ret(-10, 620, 1020, 700, 0)
    for y in range(660, 1300, 50):
        c.linha(f'M0 {y}L1000 {y}', 2.5)
    # piscina
    c.ret(120, 720, 760, 420, 40)
    c.ret(146, 746, 708, 368, 28, w=F)
    for k in range(14):
        c.linha(f'M{146 + k * 50} 746l0 14', 2.5)
    c.linha('M180 840q40-14 80 0q40 14 80 0M560 1000q40-14 80 0q40 14 80 0M600 820q40-14 80 0M200 1040q40-14 80 0', 3)
    # escadinha
    c.tubo('M820 700Q820 660 850 660Q880 660 880 700L880 760', 10, 3)
    c.tubo('M760 700Q760 660 790 660Q820 660 820 700L820 760', 10, 3)
    # Bolinho na boia de gorro de Papai Noel
    c.bolinho(470, 830, .95, gorro='noel', roupa='pelado', pes=False, braco_e=(-70, 20), braco_d=(70, 20), boca='aberta')
    c.path('M300 960C300 880 640 880 640 960C640 1040 300 1040 300 960Z')
    c.path('M380 960C380 930 560 930 560 960C560 990 380 990 380 960Z', w=F)
    for (x0, x1) in ((330, 360), (440, 480), (580, 610)):
        c.linha(f'M{x0} 910Q{x0 + 10} 960 {x0} 1010M{x1} 906Q{x1 + 10} 960 {x1} 1014', 2.5)
    c.bolinho(470, 830, .95, braco_e=(-70, 70), braco_d=(70, 70), so_bracos=True)
    c.linha('M300 1000q40 16 80 4M560 1004q40 12 80-4', 2.5)
    # bola de praia e patinho de borracha boiando
    c.circ(260, 1040, 44)
    c.path('M260 996Q230 1040 260 1084M260 996Q290 1040 260 1084', 'none', F)
    c.linha('M218 1030q42 14 84 0', F)
    c.grupo(720, 1040)
    c.path('M-40 0Q-44-30-10-24Q-14-60 14-60Q40-60 36-30L50-34L44-20Q50 10 20 14L-30 14Q-44 10-40 0Z')
    c.ponto(18, -44, 4)
    c.path('M-20-4q14 10 30-2', 'none', 3)
    c.fim()
    c.linha('M680 1060q40 10 80 0', 2.5)
    # Farofa na espreguiçadeira de óculos
    c.path('M640 1190L960 1160L980 1200L660 1230Z')
    c.path('M880 1170L940 1080L980 1100L940 1170Z')
    c.linha('M690 1230l-10 50M940 1200l10 60', F)
    c.farofa_dormindo(820, 1180, .7)
    c.path('M770 1150l20 0l4 10l-28 0zM800 1150l20 0l4 10l-28 0z', '#fff', 2.5)
    # mesinha com panetone e suco
    c.elip(200, 1200, 120, 30)
    c.ret(190, 1230, 20, 70, 4)
    c.path('M140 1190L140 1130Q170 1090 200 1100Q240 1090 260 1130L260 1190Z')
    c.path('M140 1130Q170 1100 200 1110Q240 1100 260 1130L260 1150L140 1150Z', w=F)
    for (x, y) in ((170, 1170), (210, 1160), (236, 1178)):
        c.circ(x, y, 5, w=2.5)
    c.path('M286 1200L280 1110L320 1110L314 1200Z')
    c.path('M300 1110L330 1060', 'none', F)
    c.circ(312, 1112, 14, w=F)
    # boia de patinho, chinelos e toalha
    c.circ(100, 900, 50)
    c.circ(100, 900, 22, w=F)
    for (x, rot) in ((920, -10), (960, 8)):
        c.elip(x, 900, 22, 46, rot=rot)
        c.linha(f'M{x - 14} 880l14 10l14-10', 3)
    c.ret(30, 1010, 80, 120, 10, rot=-6)
    for k in range(3):
        c.linha(f'M{36 + k * 2} {1030 + k * 30}l70-8', 2.5)
    return c


# ---------- Cena 11: Natal na praia ----------
def cena_praia():
    c = Cena()
    sol_oculos(c, 160, 160, 70)
    nuvem(c, 760, 150, 1.1)
    for (x, y) in ((450, 120), (500, 160), (560, 130)):
        c.linha(f'M{x - 16} {y}q8-10 16 0q8-10 16 0', 3)
    # mar e ondas
    c.path('M-10 420L1010 420L1010 640Q900 600 800 640Q700 680 600 640Q500 600 400 640Q300 680 200 640Q100 600-10 640Z')
    c.linha('M40 470q30-14 60 0q30 14 60 0M300 520q30-14 60 0q30 14 60 0M640 480q30-14 60 0q30 14 60 0M820 560q30-14 60 0', 3)
    # barquinho
    c.path('M700 410L840 410L820 440L720 440Z', w=F)
    c.path('M770 410L770 300L830 400Z', w=F)
    c.path('M766 300L730 400L766 400Z', w=F)
    # areia
    c.path('M-10 640Q100 600 200 640Q300 680 400 640Q500 600 600 640Q700 680 800 640Q900 600 1010 640L1010 1310L-10 1310Z')
    for (x, y) in ((80, 760), (300, 1100), (620, 1250), (900, 780), (500, 760), (180, 1240)):
        c.linha(f'M{x} {y}l6-2M{x + 20} {y + 8}l6 2M{x + 8} {y + 18}l6 0', 2.5)
    # guarda-sol e cadeira
    c.tubo('M780 1060L700 560', 6, 4)
    c.path('M520 680Q540 500 700 500Q860 500 880 680Q850 650 820 680Q790 650 760 680Q730 650 700 680Q670 650 640 680Q610 650 580 680Q550 650 520 680Z')
    c.linha('M580 680Q600 540 700 500M640 680Q660 560 700 500M760 680Q740 560 700 500M820 680Q800 540 700 500', 2.5)
    c.circ(700, 494, 10, w=F)
    # boneco de areia de gorrinho
    bx, by = 340, 1000
    c.path(f'M{bx - 120} {by + 40}Q{bx} {by - 60} {bx + 120} {by + 40}Z')
    c.circ(bx, by - 60, 70)
    c.circ(bx, by - 170, 52)
    c.path(f'M{bx - 50} {by - 190}C{bx - 50} {by - 260} {bx + 30} {by - 280} {bx + 70} {by - 230}C{bx + 80} {by - 210} {bx + 74} {by - 196} {bx + 66} {by - 186}L{bx + 50} {by - 196}C{bx + 50} {by - 210} {bx + 40} {by - 220} {bx + 30} {by - 214}L{bx + 50} {by - 190}Z')
    c.ret(bx - 60, by - 200, 120, 22, 10)
    c.circ(bx + 70, by - 178, 14)
    c.ponto(bx - 18, by - 176, 5)
    c.ponto(bx + 18, by - 176, 5)
    c.path(f'M{bx - 20} {by - 152}q20 16 40 0', 'none', 3)
    for (x, y) in ((bx - 6, by - 90), (bx + 6, by - 50), (bx - 10, by - 20)):
        c.path(f'M{x} {y}l12-10l12 10l-12 10z', w=2.5)
    c.linha(f'M{bx - 66} {by - 70}l-60-40M{bx + 66} {by - 70}l50-50', F)
    # Bolinho com baldinho e pá
    c.bolinho(620, 900, .95, gorro='noel', roupa='pelado', braco_e=(-50, 60), braco_d=(70, 30))
    c.path('M720 1000L730 950L790 950L800 1000Z')
    c.path('M724 950Q760 900 796 950', 'none', 3)
    # castelinho de areia
    c.path('M760 1200L760 1120L790 1120L790 1100L810 1100L810 1120L840 1120L840 1100L860 1100L860 1120L890 1120L890 1200Z')
    c.ret(800, 1050, 50, 60, 0)
    c.path('M796 1050L825 1010L854 1050Z')
    c.path('M825 1010L825 980L850 990L825 996', 'none', 3)
    c.path('M810 1200L810 1160Q825 1140 840 1160L840 1200Z', w=F)
    # Farofa e o caranguejo de gorro
    c.farofa(120, 1180, .8, olhando=1, rabo=-1, gorro=True)
    cx, cy = 340, 1130
    c.elip(cx, cy, 50, 30)
    for s_ in (-1, 1):
        for k in range(3):
            c.linha(f'M{cx + s_ * 40} {cy + 6 + k * 8}l{s_ * 24} {10 + k * 4}', 3)
        c.circ(cx + s_ * 70, cy - 30, 18)
        c.path(f'M{cx + s_ * 60} {cy - 30}l{s_ * 20} -4', 'none', 3)
        c.linha(f'M{cx + s_ * 40} {cy - 10}l{s_ * 20} -12', 3)
    c.linha(f'M{cx - 14} {cy - 26}l0-20M{cx + 14} {cy - 26}l0-20', 3)
    c.ponto(cx - 14, cy - 48, 6)
    c.ponto(cx + 14, cy - 48, 6)
    c.path(f'M{cx - 10} {cy + 6}q10 8 20 0', 'none', 2.5)
    c.path(f'M{cx - 24} {cy - 54}C{cx - 20} {cy - 90} {cx + 20} {cy - 96} {cx + 36} {cy - 70}L{cx + 26} {cy - 62}L{cx + 24} {cy - 54}Z', w=2.5)
    c.circ(cx + 38, cy - 66, 8, w=2.5)
    # conchinhas e estrela-do-mar
    c.estrela(940, 1240, 30, 14, w=F)
    for (x, y) in ((60, 1280), (520, 1130), (940, 1100)):
        c.path(f'M{x - 20} {y}Q{x} {y - 34} {x + 20} {y}Z', w=F)
        c.linha(f'M{x} {y}l0-20M{x - 8} {y}l-4-14M{x + 8} {y}l4-14', 2)
    # Feliz Natal escrito na areia
    c.texto_vazado(560, 1272, 'Feliz Natal!', 120, rot=-3)
    for (x, y) in ((60, 1060), (230, 1110), (440, 1100), (980, 1020), (640, 1140)):
        c.circ(x, y, 3, w=2)
    # pinheirinho enfeitado de praia
    c.path('M960 960L900 960L930 900L912 900L940 850L922 850L950 800L978 850L960 850L988 900L970 900L1000 960Z', w=F)
    return c
