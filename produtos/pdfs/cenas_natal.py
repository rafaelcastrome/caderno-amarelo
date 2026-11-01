"""Cenas de Natal pra colorir: cada página conta uma historinha do Bolinho e da Farofa."""
import math
import random
from cenas import Cena, F, T


# ---------- peças reaproveitáveis ----------
def biscoito_boneco(c, cx, cy, s=1, rot=0):
    c.grupo(cx, cy, s, rot)
    c.path('M0-46C14-46 20-36 18-24C30-26 44-22 44-12C44-2 30 0 20 0L26 30C30 40 24 48 14 46L0 30L-14 46C-24 48-30 40-26 30L-20 0C-30 0-44-2-44-12C-44-22-30-26-18-24C-20-36-14-46 0-46Z')
    c.ponto(-7, -30, 3.5)
    c.ponto(7, -30, 3.5)
    c.linha('M-7-20q7 6 14 0', 2.5)
    c.circ(0, -4, 3.5, w=2.5)
    c.circ(0, 10, 3.5, w=2.5)
    c.linha('M-38-14q4 4 8 0M30-14q4 4 8 0M-20 34q4 3 8 0M12 34q4 3 8 0', 2.5)
    c.fim()


def biscoito_estrela(c, cx, cy, r, rot=-90):
    c.estrela(cx, cy, r, r * .55, rot=rot, w=F + .5)
    c.estrela(cx, cy, r * .62, r * .34, rot=rot, w=2.5)


def biscoito_arvore(c, cx, cy, s=1):
    c.grupo(cx, cy, s)
    c.path('M0-44L28-6L16-6L36 24L-36 24L-16-6L-28-6Z', w=F + .5)
    c.ret(-8, 24, 16, 12, 2, w=F)
    c.linha('M-14-14q14 8 28 0M-22 10q22 10 44 0', 2.5)
    for (x, y) in ((-6, -22), (8, -2), (-12, 2), (14, 16), (-18, 18)):
        c.circ(x, y, 3, w=2)
    c.fim()


def biscoito_redondo(c, cx, cy, r):
    c.circ(cx, cy, r, w=F + .5)
    c.path(f'M{cx - r * .65} {cy}c{r * .2}-{r * .3} {r * .4} {r * .3} {r * .65} 0s{r * .45} {r * .3} {r * .65} 0', 'none', 2.5)
    c.circ(cx, cy, r * .72, 'none', 2)


def pinheiro(c, cx, base, h, w=F):
    """Pinheirinho de três andares com neve na ponta."""
    lg = h * .55
    for i, (topo, larg) in enumerate(((0, .55), (.28, .75), (.55, 1))):
        y0 = base - h + topo * h
        y1 = y0 + h * .45
        c.path(f'M{cx} {y0}L{cx + lg * larg / 1} {y1}Q{cx} {y1 + h * .06} {cx - lg * larg} {y1}Z', w=w)
    c.ret(cx - h * .07, base, h * .14, h * .12, 2, w=w)


def caneca(c, x, y, s=1, desenho='coracao'):
    c.grupo(x, y, s)
    c.path('M28-34C48-34 50-4 26-4', 'none', T)
    c.path('M-30-50L30-50L26 0Q0 8-26 0Z')
    c.elip(0, -50, 30, 7, w=F)
    if desenho == 'coracao':
        c.coracao(0, -26, 9)
    elif desenho == 'floco':
        c.floco(0, -26, 12, 2.5)
    else:
        c.linha('M-28-30l56 0M-28-20l54 0', 2.5)
    c.fim()


# ---------- Cena 1: noite de biscoitos ----------
def cena_biscoitos():
    c = Cena()
    rnd = random.Random(12)

    # parede com papel de parede de estrelinhas
    for y in range(70, 760, 95):
        for x in range(30 + (y // 95 % 2) * 48, 1000, 96):
            if 50 < x < 430 and y < 520:
                continue
            if x > 500 and 140 < y < 1000:
                continue
            c.estrela(x, y, 9, 4.2, w=2.5)

    # chão de ladrilhos
    c.ret(0, 1000, 1000, 300, 0)
    for y in (1060, 1140, 1240):
        c.linha(f'M0 {y}L1000 {y}', 3.5)
    for x in range(-200, 1300, 120):
        c.linha(f'M{x} 1000L{500 + (x - 500) * 1.6} 1300', 3.5)

    # ---- janela com a vila nevada lá fora ----
    jx, jy, jw, jh = 70, 110, 330, 360
    c.ret(jx - 18, jy - 18, jw + 36, jh + 36, 10)
    c.ret(jx, jy, jw, jh, 4)
    # lá fora
    c.path(f'M{jx} {jy + 250}Q{jx + 90} {jy + 200} {jx + 190} {jy + 245}T{jx + jw} {jy + 230}L{jx + jw} {jy + jh}L{jx} {jy + jh}Z', w=F)
    c.path(f'M{jx} {jy + 300}Q{jx + 140} {jy + 260} {jx + jw} {jy + 300}L{jx + jw} {jy + jh}L{jx} {jy + jh}Z', w=F)
    # casinha
    hx, hy = jx + 210, jy + 180
    c.ret(hx, hy, 70, 56, 2, w=F)
    c.path(f'M{hx - 10} {hy + 2}L{hx + 35} {hy - 34}L{hx + 80} {hy + 2}Z', w=F)
    c.ret(hx + 52, hy - 36, 12, 22, 1, w=F)
    c.linha(f'M{hx + 58} {hy - 44}q-10-10 0-20q10-10 0-22', 3)
    c.ret(hx + 10, hy + 16, 18, 18, 2, w=2.5)
    c.ret(hx + 42, hy + 22, 18, 34, 2, w=2.5)
    pinheiro(c, jx + 60, jy + 238, 90)
    pinheiro(c, jx + 130, jy + 222, 64)
    pinheiro(c, jx + 300, jy + 236, 70)
    # lua e flocos
    c.path(f'M{jx + 80} {jy + 40}a36 36 0 1 0 34 52a30 30 0 1 1-34-52Z', w=F)
    for (x, y) in ((160, 150), (230, 140), (310, 160), (360, 220), (110, 230), (200, 250), (290, 250), (240, 200)):
        c.bolinha_neve(x, y, 5)
    c.floco(330, 130, 14, 2.5)
    c.floco(170, 200, 11, 2.5)
    # caixilho
    c.ret(jx + jw / 2 - 8, jy, 16, jh, 2)
    c.ret(jx, jy + jh / 2 - 8, jw, 16, 2)
    # cortinas com laço
    for lado in (-1, 1):
        cx0 = jx + (0 if lado < 0 else jw)
        def X(dx):
            return cx0 - lado * dx
        c.path(f'M{X(48)} {jy - 40}L{X(-46)} {jy - 40}Q{X(-40)} {jy + 120} {X(-14)} {jy + 200}'
               f'Q{X(-50)} {jy + 280} {X(-30)} {jy + jh + 14}L{X(54)} {jy + jh + 14}Q{X(40)} {jy + 260} {X(42)} {jy + 200}'
               f'Q{X(52)} {jy + 100} {X(48)} {jy - 40}Z')
        c.linha(f'M{X(10)} {jy - 30}Q{X(4)} {jy + 110} {X(10)} {jy + 196}M{X(-20)} {jy - 30}Q{X(-24)} {jy + 110} {X(-6)} {jy + 196}'
                f'M{X(14)} {jy + 214}Q{X(0)} {jy + 290} {X(10)} {jy + jh + 10}M{X(-14)} {jy + 214}Q{X(-30)} {jy + 290} {X(-10)} {jy + jh + 10}', 3)
        c.elip(X(14), jy + 204, 40, 13, w=F)
        c.circ(X(14), jy + 204, 7, w=3)
    # bandô com babadinho
    d = f'M{jx - 50} {jy - 50}L{jx + jw + 50} {jy - 50}L{jx + jw + 50} {jy - 10}'
    for i in range(10, -1, -1):
        x = jx - 50 + i * (jw + 100) / 10
        d += f'Q{x + (jw + 100) / 20} {jy + 18} {x} {jy - 10}' if i < 10 else ''
    c.path(d + 'Z')
    c.linha(f'M{jx - 50} {jy - 34}L{jx + jw + 50} {jy - 34}', 3)
    for i in range(10):
        c.circ(jx - 50 + (i + .5) * (jw + 100) / 10, jy - 2, 4, w=2.5)
    # parapeito com vaso e vela
    c.ret(jx - 40, jy + jh + 20, jw + 80, 22, 6)
    c.path(f'M{jx + 30} {jy + jh + 20}L{jx + 22} {jy + jh - 30}L{jx + 88} {jy + jh - 30}L{jx + 80} {jy + jh + 20}Z')
    c.ret(jx + 16, jy + jh - 40, 78, 14, 4, w=F)
    for ang in (-60, -25, 10, 45, 80, 140, 175, 210):
        import math
        a = math.radians(ang - 90)
        cx, cy = jx + 55, jy + jh - 66
        c.path(f'M{cx} {cy}Q{cx + 30 * math.cos(a - .5)} {cy + 30 * math.sin(a - .5)} {cx + 44 * math.cos(a)} {cy + 44 * math.sin(a)}'
               f'Q{cx + 30 * math.cos(a + .5)} {cy + 30 * math.sin(a + .5)} {cx} {cy}Z', w=3)
    for (dx, dy) in ((-4, -4), (6, 2), (-2, 8)):
        c.circ(jx + 55 + dx, jy + jh - 66 + dy, 5, w=2.5)
    c.ret(jx + 283, jy + jh - 40, 34, 60, 4, w=F)
    c.path(f'M{jx + 300} {jy + jh - 74}Q{jx + 315} {jy + jh - 54} {jx + 300} {jy + jh - 46}Q{jx + 285} {jy + jh - 54} {jx + 300} {jy + jh - 74}Z', w=3)
    c.linha(f'M{jx + 300} {jy + jh - 46}l0 6', 3)
    c.linha(f'M{jx + 293} {jy + jh - 20}l0 18', 3)

    # guirlanda entre a janela e a prateleira
    c.tubo('M470 130a42 42 0 1 0 0.1 0', 22)
    for i in range(14):
        ang = math.radians(i * 360 / 14)
        x, y = 470 + 42 * math.cos(ang), 172 + 42 * math.sin(ang)
        c.elip(x, y, 13, 7, w=2.5, rot=i * 360 / 14 + 60)
    for i in range(5):
        ang = math.radians(30 + i * 72)
        c.circ(470 + 46 * math.cos(ang), 172 + 46 * math.sin(ang), 6, w=2.5)
    c.path('M470 214l-26-12l0 24zM470 214l26-12l0 24z', w=F)
    c.circ(470, 214, 7, w=F)
    c.path('M464 220l-12 30M476 220l12 30', 'none', F)
    c.linha('M470 90l0 40', 3)
    # calendário na parede, abaixo da janela
    cx0, cy0 = 40, 560
    c.circ(cx0 + 65, cy0 - 14, 6, w=3)
    c.ret(cx0, cy0, 130, 190, 8)
    c.ret(cx0, cy0, 130, 38, 8, w=F)
    c.texto(cx0 + 65, cy0 + 30, 'DEZEMBRO', 26)
    for i in range(23):
        x, y = cx0 + 16 + (i % 6) * 20, cy0 + 56 + (i // 6) * 24
        c.linha(f'M{x - 5} {y - 5}l10 10M{x + 5} {y - 5}l-10 10', 2)
    c.texto(cx0 + 98, cy0 + 176, '24', 32)
    c.coracao(cx0 + 98, cy0 + 164, 20, 'none', 3)
    # ---- bancada com forno ----
    # azulejos atrás
    c.ret(520, 400, 500, 200, 0, w=F)
    for y in range(440, 600, 40):
        c.linha(f'M520 {y}L1000 {y}', 2.5)
    for y in range(400, 600, 40):
        off = 0 if (y // 40) % 2 == 0 else 30
        for x in range(520 + off, 1000, 60):
            c.linha(f'M{x} {y}L{x} {y + 40}', 2.5)
    # prateleira
    c.ret(540, 300, 440, 20, 5)
    for x in (580, 920):
        c.path(f'M{x} 320L{x} 360L{x + 24} 320Z', w=F)
    # potes
    for (x, larg, alt, rot) in ((570, 90, 120, 'açúcar'), (680, 80, 90, 'chá'), (850, 100, 140, 'biscoitos')):
        c.ret(x, 300 - alt, larg, alt, 14)
        c.ret(x - 4, 300 - alt - 18, larg + 8, 22, 8)
        c.circ(x + larg / 2, 300 - alt - 26, 8, w=F)
        c.ret(x + 10, 300 - alt * .62, larg - 20, alt * .34, 5, w=2.5)
        c.texto(x + larg / 2, 300 - alt * .62 + alt * .25, rot, 26 if len(rot) < 7 else 22)
    # vasinho com raminho na prateleira
    c.path('M775 300L770 260L820 260L815 300Z')
    for (dx, a) in ((-14, -30), (0, -40), (14, -26)):
        c.path(f'M{795 + dx * .4} 260q{dx} -20 {dx * 1.6} {a}', 'none', F)
        c.elip(795 + dx * 1.6, 260 + a, 9, 5, w=2.5, rot=dx * 3)
    # canecas penduradas
    for i, (x, des) in enumerate(((610, 'coracao'), (720, 'floco'), (830, 'listra'))):
        c.linha(f'M{x} 320l0 14', 3)
        caneca(c, x, 400, .8, des)

    # bancada
    c.ret(520, 600, 500, 400, 0)
    c.ret(510, 590, 510, 30, 8)
    # forno
    c.ret(545, 640, 260, 330, 14)
    c.ret(565, 660, 220, 36, 8, w=F)
    for i in range(4):
        c.circ(590 + i * 56, 678, 11, w=3)
        c.linha(f'M{590 + i * 56} 670l0 8', 3)
    c.ret(580, 720, 190, 22, 11, w=F)
    c.ret(575, 760, 200, 180, 18)
    c.ret(600, 790, 150, 120, 12, w=F)
    c.linha('M612 840l36 0M612 860l60 0', 3)
    c.linha('M690 810l40 0', 3)
    # gavetas
    for i in range(3):
        y = 640 + i * 112
        c.ret(825, y, 160, 100, 10)
        c.ret(885, y + 42, 40, 14, 7, w=F)
    # pano de prato pendurado
    c.path('M600 720L590 800L650 806L654 724Z', w=F)
    c.linha('M592 780l58 4M594 768l58 4', 2.5)
    # tigela, fouet, saco de farinha e ovos na bancada
    c.path('M600 592C600 520 760 520 760 592Z')
    c.elip(680, 560, 80, 14, w=F)
    c.linha('M610 576q70 14 140 0', 2.5)
    c.path('M700 552L760 470', 'none', T)
    c.path('M760 470C780 440 800 430 804 448C808 470 776 480 760 470ZM760 470C770 450 796 446 792 462', 'none', F)
    c.path('M830 592L838 480Q880 470 922 480L930 592Z')
    c.path('M838 480L846 458L870 470L892 456L914 470L922 480', 'none', F)
    c.texto(882, 548, 'farinha', 28)
    c.ret(930, 560, 60, 30, 6, w=F)
    for i in range(2):
        c.elip(946 + i * 28, 556, 11, 14, w=3)

    # ---- Bolinho atrás da mesa ----
    c.bolinho(330, 660, 1.25, braco_e=(-70, 119), braco_d=(70, 119))

    # ---- mesa com toalha xadrez ----
    c.path('M40 840L960 840L1000 1000L0 1000Z')
    c.path('M0 1000L1000 1000L1000 1130Q975 1160 950 1130Q925 1160 900 1130Q875 1160 850 1130Q825 1160 800 1130'
           'Q775 1160 750 1130Q725 1160 700 1130Q675 1160 650 1130Q625 1160 600 1130Q575 1160 550 1130Q525 1160 500 1130'
           'Q475 1160 450 1130Q425 1160 400 1130Q375 1160 350 1130Q325 1160 300 1130Q275 1160 250 1130Q225 1160 200 1130'
           'Q175 1160 150 1130Q125 1160 100 1130Q75 1160 50 1130Q25 1160 0 1130Z')
    for x in range(50, 1000, 50):
        c.linha(f'M{x} 1000L{x} 1132', 2.5)
    for y in (1035, 1070, 1105):
        c.linha(f'M0 {y}L1000 {y}', 2.5)

    # massa aberta com forminhas já cortadas
    c.path('M175 870C200 850 300 846 360 852C430 858 480 868 478 900C476 940 420 968 330 968C240 968 180 950 170 920C164 900 160 884 175 870Z')
    c.estrela(230, 925, 22, 11, w=2.5)
    c.coracao(420, 925, 16, w=2.5)
    c.estrela(380, 940, 14, 7, w=2.5)
    for (x, y) in ((280, 950), (450, 880), (200, 880)):
        c.ponto(x, y, 2.5)
    # rolo de massa
    c.ret(205, 876, 260, 40, 20)
    c.ret(165, 886, 44, 20, 10)
    c.ret(461, 886, 44, 20, 10)
    c.linha('M240 886l0 20M430 886l0 20', 2.5)
    # braços do Bolinho por cima da mesa
    c.bolinho(330, 660, 1.25, braco_e=(-70, 119), braco_d=(70, 119), so_bracos=True)

    # copo de leite e receita
    c.path('M70 812L78 920Q100 928 122 920L130 812Z')
    c.elip(100, 812, 30, 8, w=F)
    c.linha('M74 850q26 8 54 0', 3)
    c.path('M106 820L150 760', 'none', 10)
    c.path('M106 820L150 760', 'none', 4)
    c.ret(56, 940, 190, 54, 6, rot=-4)
    c.texto(150, 966, 'receita da vovó', 26, rot=-4)
    c.linha('M76 982l140-10', 2)
    # forminhas soltas
    c.estrela(530, 940, 26, 13, fill='none', w=F + 1)
    c.estrela(530, 940, 19, 9, fill='none', w=2)
    c.coracao(520, 880, 16, fill='none', w=F + 1)
    # potinho de confeitos
    c.ret(156, 800, 50, 60, 10)
    c.ret(152, 790, 58, 16, 6, w=F)
    for (x, y) in ((168, 824), (186, 836), (176, 846), (194, 818), (170, 840)):
        c.linha(f'M{x} {y}l6-4', 3)

    # assadeira cheia de biscoitos
    c.path('M570 860L940 860L960 990L560 990Z')
    c.path('M584 872L926 872L942 978L576 978Z', w=F)
    biscoito_boneco(c, 630, 922, .85)
    biscoito_estrela(c, 712, 912, 34)
    biscoito_arvore(c, 790, 916, .95)
    biscoito_redondo(c, 870, 912, 30)
    biscoito_estrela(c, 664, 960, 18, -60)
    c.coracao(910, 958, 14, w=F)
    c.coracao(910, 958, 8, w=2)
    biscoito_redondo(c, 760, 962, 15)
    # fumacinha de biscoito quentinho
    for x in (690, 790, 880):
        c.linha(f'M{x} 852q-12-16 0-30q12-14 0-30', 3)

    # ---- Farofa no chão de olho num biscoito que caiu ----
    c.farofa(830, 1280, 1.0, olhando=-1, rabo=1)
    biscoito_boneco(c, 680, 1226, .9, 18)
    c.path('M640 1232l-10-6l4 10z', '#fff', 2.5)
    # migalhinhas
    for (x, y) in ((620, 1270), (606, 1252), (720, 1286), (740, 1262)):
        c.circ(x, y, 3.5, w=2.5)
    # tapetinho redondo no canto
    c.elip(170, 1250, 150, 50)
    c.elip(170, 1250, 112, 34, w=F)
    c.elip(170, 1250, 70, 20, w=2.5)
    # presentinho no chão e novelo no tapete
    c.ret(330, 1196, 120, 92, 6)
    c.ret(322, 1180, 136, 28, 6)
    c.ret(380, 1180, 20, 108, 0, w=F)
    c.path('M390 1180C360 1140 330 1150 350 1172ZM390 1180C420 1140 450 1150 430 1172Z', w=F)
    for (x, y) in ((348, 1226), (430, 1222), (352, 1264), (428, 1262)):
        c.circ(x, y, 7, w=2.5)
    c.circ(220, 1236, 30)
    c.linha('M196 1222q24 20 48 0M194 1240q26 20 52 0M206 1210q20 30 4 54', 2.5)
    c.linha('M250 1240q40 30 80 4', F)
    # varal de luzinhas no alto
    c.varal_luzes(-10, 30, 1010, 30, 34, 13, 20)
    return c


def bola_enfeite(c, x, y, r, tipo=0):
    c.linha(f'M{x} {y - r - 8}l0 -8', 2.5)
    c.ret(x - r * .35, y - r - 8, r * .7, 9, 2, w=2.5)
    c.circ(x, y, r, w=F)
    if tipo == 0:
        c.linha(f'M{x - r} {y}q{r} {r * .5} {r * 2} 0', 2.5)
    elif tipo == 1:
        for (dx, dy) in ((-.4, -.3), (.35, -.1), (-.1, .4), (.45, .45), (-.55, .25)):
            c.circ(x + dx * r, y + dy * r, r * .13, w=2)
    elif tipo == 2:
        c.linha(f'M{x - r * .9} {y - r * .35}l{r * 1.8} 0M{x - r * .9} {y + r * .35}l{r * 1.8} 0', 2.5)
        c.linha(f'M{x - r * .7} {y}l{r * .35} {-r * .25}l{r * .35} {r * .25}l{r * .35} {-r * .25}l{r * .35} {r * .25}', 2)
    else:
        c.estrela(x, y + 1, r * .55, r * .26, w=2)


def bengala(c, x, y, s=1, rot=0):
    c.grupo(x, y, s, rot)
    c.tubo('M0 40L0-14Q0-30 14-30Q28-30 28-16', 10, 3.5)
    c.linha('M-6 30l12-8M-6 14l12-8M-6-2l12-8M2-26l8 8', 2.5)
    c.fim()


def presente(c, x, y, w, h, padrao, laco=True):
    c.ret(x, y, w, h, 4)
    c.ret(x - 6, y - 16, w + 12, 24, 4)
    c.ret(x + w / 2 - 9, y - 16, 18, h + 16, 0, w=F)
    if laco:
        cx = x + w / 2
        c.path(f'M{cx} {y - 16}C{cx - 40} {y - 60} {cx - 54} {y - 24} {cx - 6} {y - 16}ZM{cx} {y - 16}C{cx + 40} {y - 60} {cx + 54} {y - 24} {cx + 6} {y - 16}Z', w=F)
        c.circ(cx, y - 18, 7, w=3)
    if padrao == 'bolas':
        for i in range(4):
            for j in range(2):
                px = x + 14 + i * (w - 28) / 3
                if abs(px - (x + w / 2)) > 16:
                    c.circ(px, y + 24 + j * (h - 44), 6, w=2.5)
    elif padrao == 'listras':
        for k in range(1, 6):
            px = x + k * w / 6
            if abs(px - (x + w / 2)) > 14:
                c.linha(f'M{px} {y + 8}L{px} {y + h - 4}', 2.5)
    elif padrao == 'estrelas':
        for (fx, fy) in ((.2, .3), (.78, .32), (.25, .75), (.8, .76)):
            c.estrela(x + fx * w, y + fy * h, 9, 4.5, w=2.5)
    elif padrao == 'zigue':
        d = f'M{x + 4} {y + h / 2}'
        for k in range(8):
            d += f'l{w / 8 - 1} {(-1) ** k * 12}'
        c.linha(d, 2.5)


# ---------- Cena 2: hora de montar a árvore ----------
def cena_arvore():
    c = Cena()
    # papel de parede listrado com bolinhas
    for x in range(0, 1000, 56):
        c.linha(f'M{x} 0L{x} 1030', 2.5)
        if (x // 56) % 2 == 0:
            for y in range(70, 1020, 64):
                c.circ(x + 28, y + (x // 56 % 4) * 8, 4, w=2)
    # rodapé e piso de tábuas
    c.ret(-10, 1010, 1020, 30, 0)
    c.ret(-10, 1040, 1020, 280, 0)
    for i, y in enumerate((1080, 1130, 1190, 1260)):
        c.linha(f'M0 {y}L1000 {y}', 3.5)
    for i, y0 in enumerate((1040, 1080, 1130, 1190, 1260)):
        for x in range(90 + (i % 3) * 110, 1000, 330):
            c.linha(f'M{x} {y0}l0 {[40, 50, 60, 70, 60][i]}', 3)

    # ---- janela com boneco de neve lá fora ----
    jx, jy, jw, jh = 70, 110, 270, 300
    c.ret(jx - 16, jy - 16, jw + 32, jh + 32, 10)
    c.ret(jx, jy, jw, jh, 4)
    c.path(f'M{jx} {jy + 220}Q{jx + 120} {jy + 180} {jx + jw} {jy + 210}L{jx + jw} {jy + jh}L{jx} {jy + jh}Z', w=F)
    pinheiro(c, jx + 50, jy + 218, 110)
    pinheiro(c, jx + 105, jy + 202, 70)
    # boneco de neve
    bx, by = jx + 200, jy + 250
    c.circ(bx, by, 38, w=F)
    c.circ(bx, by - 54, 26, w=F)
    c.ret(bx - 20, by - 100, 40, 26, 3, w=F)
    c.ret(bx - 30, by - 78, 60, 8, 3, w=F)
    c.ponto(bx - 9, by - 58, 3.5)
    c.ponto(bx + 9, by - 58, 3.5)
    c.path(f'M{bx} {by - 50}l22 4l-22 4z', w=2.5)
    c.path(f'M{bx - 24} {by - 34}Q{bx} {by - 22} {bx + 24} {by - 34}L{bx + 26} {by - 26}Q{bx} {by - 12} {bx - 26} {by - 26}Z', w=2.5)
    for k in range(3):
        c.ponto(bx, by - 14 + k * 16, 3.5)
    c.linha(f'M{bx - 36} {by - 6}l-34-26l-6-10M{bx - 58} {by - 22}l-12 4M{bx + 36} {by - 6}l30-30', 3)
    for (x, y) in ((110, 150), (170, 130), (250, 160), (300, 140), (140, 210), (210, 200), (320, 230), (280, 270), (100, 280)):
        c.bolinha_neve(x, y, 5)
    c.floco(220, 150, 13, 2.5)
    c.ret(jx + jw / 2 - 7, jy, 14, jh, 2)
    c.ret(jx, jy + jh / 2 - 7, jw, 14, 2)
    c.ret(jx - 34, jy + jh + 14, jw + 68, 20, 6)
    # bandeirinhas no alto
    pts = []
    for i in range(12):
        x0 = -20 + i * 88
        y0 = 40 + 16 * math.sin(i * .9)
        pts.append((x0, y0))
    c.linha('M' + 'L'.join(f'{x} {y}' for x, y in pts), 3.5)
    for i in range(11):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        mx = (x0 + x1) / 2
        c.path(f'M{x0 + 8} {y0 + (y1 - y0) * .1}L{x1 - 8} {y1 - (y1 - y0) * .1}L{mx} {(y0 + y1) / 2 + 66}Z', w=F)
        cy = (y0 + y1) / 2 + 22
        k = i % 4
        if k == 0:
            c.estrela(mx, cy, 11, 5, w=2.5)
        elif k == 1:
            c.coracao(mx, cy, 9, w=2.5)
        elif k == 2:
            c.circ(mx, cy, 7, w=2.5)
        else:
            c.floco(mx, cy, 10, 2.5)

    # ---- lareira ----
    c.ret(40, 640, 340, 380, 6)
    for y in range(680, 1020, 34):
        c.linha(f'M40 {y}L380 {y}', 2.5)
        off = 0 if (y // 34) % 2 == 0 else 30
        for x in range(40 + off + 30, 380, 60):
            c.linha(f'M{x} {y - 34}l0 34', 2.5)
    c.path('M110 1020L110 800Q210 720 310 800L310 1020Z')
    c.path('M128 1020L128 806Q210 744 292 806L292 1020Z', w=F)
    # lenha e foguinho
    c.ret(140, 980, 140, 28, 14)
    c.ret(150, 958, 120, 26, 13, rot=-6)
    c.circ(268, 994, 9, w=2.5)
    c.path('M170 960C150 920 180 900 176 870C200 890 196 910 210 900C206 870 226 850 222 820C254 860 262 900 246 960Z', w=F)
    c.path('M196 960C188 936 204 926 202 910C214 924 212 934 222 932C224 944 230 950 226 960Z', w=3)
    c.ret(20, 610, 380, 34, 8)
    c.ret(34, 640, 352, 14, 4, w=F)
    # coisas em cima da lareira
    c.ret(70, 520, 34, 90, 4)
    c.path('M87 482Q102 504 87 512Q72 504 87 482Z', w=3)
    c.linha('M87 512l0 8', 3)
    c.ret(116, 550, 26, 60, 4)
    c.path('M129 516Q141 534 129 540Q117 534 129 516Z', w=3)
    c.linha('M129 540l0 10', 3)
    c.ret(170, 490, 110, 120, 8)
    c.ret(184, 504, 82, 92, 4, w=F)
    c.bolinho(225, 548, .3, braco_e=(-30, 30), braco_d=(30, 30), gorro=False)
    c.ret(300, 560, 64, 50, 6)
    c.circ(332, 584, 16, w=F)
    c.linha('M332 584l0-10M332 584l8 4', 2.5)
    # galho com luzinhas na beirada da lareira
    c.tubo('M24 612Q120 650 210 618Q300 650 396 612', 12, 3.5)
    for k in range(9):
        t = k / 8
        x = 24 + t * 372
        y = 620 + 14 * math.sin(t * math.pi * 2) ** 2
        c.elip(x, y + 6, 8, 5, w=2.5, rot=30)
    # meias penduradas
    for i, (x, nome) in enumerate(((84, 'Bolinho'), (210, 'Farofa'), (336, '?'))):
        c.linha(f'M{x} 640l0 18', 3)
        c.path(f'M{x - 26} 656L{x + 26} 656L{x + 24} 730Q{x + 26} 770 {x - 6} 772L{x - 44} 772Q{x - 70} 768 {x - 66} 744Q{x - 60} 726 {x - 30} 724Z')
        c.ret(x - 32, 650, 64, 28, 8, w=F)
        c.texto(x, 672, nome, 22 if len(nome) > 2 else 28)
        if i == 0:
            c.linha(f'M{x - 26} 700l48 0M{x - 28} 716l50 0', 2.5)
        elif i == 1:
            c.coracao(x - 4, 730, 12, w=2.5)
        else:
            c.estrela(x - 6, 726, 14, 6, w=2.5)
        c.path(f'M{x - 66} 744Q{x - 60} 726 {x - 30} 724L{x - 36} 772L{x - 44} 772Q{x - 70} 768 {x - 66} 744Z', w=2.5)

    # ---- árvore ----
    tx = 750
    c.ret(tx - 24, 900, 48, 60, 4)
    camadas = [(330, 470, 95), (400, 590, 145), (480, 710, 190), (570, 830, 230), (660, 940, 255)]
    for (top, base, hw) in reversed(camadas):
        n = max(3, hw // 34)
        d = f'M{tx} {top}L{tx + hw} {base}'
        for k in range(n):
            x0 = tx + hw - k * 2 * hw / n
            x1 = x0 - 2 * hw / n
            d += f'Q{(x0 + x1) / 2} {base + 22} {x1} {base}'
        c.path(d + 'Z')
        c.linha(f'M{tx - hw * .45} {base - 40}l-14 14M{tx + hw * .5} {base - 30}l12 12', 3)
    # vaso de cestinha
    c.path(f'M{tx - 110} 940L{tx + 110} 940L{tx + 90} 1040L{tx - 90} 1040Z')
    c.ret(tx - 122, 928, 244, 30, 10)
    for k in range(1, 8):
        c.linha(f'M{tx - 110 + k * 27.5} 958L{tx - 92 + k * 23} 1040', 2.5)
    c.linha(f'M{tx - 104} 990L{tx + 104} 990M{tx - 96} 1018L{tx + 96} 1018', 2.5)
    # cordão de contas
    for (y0, y1, hw0, hw1) in ((436, 400, 50, 80), (548, 514, 90, 130), (668, 628, 130, 170), (790, 750, 170, 210)):
        x0, x1 = tx - hw0, tx + hw1
        n = 14
        for k in range(n + 1):
            t = k / n
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t + 30 * math.sin(t * math.pi)
            c.circ(x, y, 5, w=2.5)
    # enfeites
    enf = [(700, 420, 0), (790, 455, 1), (670, 560, 2), (790, 570, 3), (870, 545, 1),
           (620, 690, 1), (740, 690, 0), (850, 680, 2), (570, 820, 3), (690, 815, 2), (810, 810, 1), (920, 820, 0),
           (540, 920, 0), (660, 925, 1)]
    for i, (x, y, t) in enumerate(enf):
        bola_enfeite(c, x, y, 18 if y < 600 else 21, t)
    bengala(c, 735, 520, .8, 10)
    bengala(c, 900, 690, .9, -10)
    bengala(c, 640, 760, .9, 6)
    c.coracao(760, 760, 16, w=F)
    c.coracao(880, 920, 15, w=F)
    # laço no meio
    c.path(f'M{tx} 630C{tx - 30} 600 {tx - 50} 640 {tx - 6} 636ZM{tx} 630C{tx + 30} 600 {tx + 50} 640 {tx + 6} 636Z', w=3)
    # Farofa espiando de dentro da árvore!
    c.elip(840, 870, 30, 24)
    c.path('M816 862L810 834L830 850ZM864 862L870 834L850 850Z', w=F)
    c.elip(840, 872, 30, 22)
    c.ponto(830, 870, 4)
    c.ponto(850, 870, 4)
    c.path('M836 880l8 0l-4 5z', '#1d1d1d', 2)
    c.linha('M818 880l-16 0M862 880l16 0', 2)

    # ---- escada e Bolinho com a estrela ----
    c.tubo('M472 540L442 1060', 10, 5)
    c.tubo('M590 540L620 1060', 10, 5)
    for k, y in enumerate(range(560, 1040, 110)):
        dx = (y - 540) / 520 * 30
        c.ret(472 - dx, y, 118 + 2 * dx, 18, 4)
    c.ret(458, 530, 146, 26, 6)
    c.bolinho(530, 340, 1.05, braco_e=(-60, 30), braco_d=(80, -118), cachecol=True)
    # estrela na mão
    c.estrela(680, 270, 48, 22)
    c.estrela(680, 270, 30, 14, w=2.5)
    c.linha('M620 214l-14-14M680 200l0-20M740 214l14-14M744 290l20 6', 3)

    # ---- presentes ----
    presente(c, 590, 960, 110, 90, 'bolas')
    presente(c, 870, 930, 100, 120, 'listras')
    presente(c, 720, 1000, 140, 80, 'estrelas')
    # caixa de enfeites no chão
    c.path('M150 1080L370 1080L360 1200L160 1200Z')
    c.path('M150 1080L120 1040L330 1040L370 1080Z', w=F)
    for (x, t) in ((200, 1), (250, 2), (300, 0)):
        bola_enfeite(c, x, 1060, 22, t)
    c.ret(150, 1080, 220, 34, 4)
    c.texto(260, 1106, 'ENFEITES', 30)
    c.linha('M172 1140l170 0M176 1170l162 0', 2.5)
    # tapete redondo
    c.elip(640, 1250, 340, 86)
    c.elip(640, 1250, 290, 64, w=F)
    c.elip(640, 1250, 200, 40, w=2.5)
    for k in range(16):
        ang = k * math.pi * 2 / 16
        c.estrela(640 + 245 * math.cos(ang), 1250 + 52 * math.sin(ang), 8, 4, w=2)
    # lanchinho pro Papai Noel em cima do tapete
    c.elip(600, 1236, 92, 30)
    c.elip(600, 1236, 70, 20, w=2.5)
    biscoito_boneco(c, 560, 1222, .55, -12)
    biscoito_estrela(c, 612, 1226, 22)
    biscoito_redondo(c, 655, 1238, 18)
    c.path('M720 1150L728 1250Q748 1258 768 1250L776 1150Z')
    c.elip(748, 1150, 28, 8, w=F)
    c.linha('M724 1180q24 8 50 0', 3)
    c.ret(800, 1176, 130, 74, 6, rot=6)
    c.texto(865, 1208, 'pro Noel', 30, rot=6)
    c.coracao(866, 1230, 9, w=2.5)
    # bolinha que rolou pro chão
    bola_enfeite(c, 70, 1230, 26, 3)
    return c
