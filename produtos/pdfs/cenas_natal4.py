"""Cenas 12 a 16: ceia, trenó, cantoria na porta, manhã de Natal e oficina de brinquedos."""
import math
from cenas import Cena, F, T
from cenas_natal import biscoito_boneco, biscoito_estrela, biscoito_redondo, pinheiro, caneca, bola_enfeite, bengala, presente
from cenas_natal2 import (chao_tabuas, parede_bolinhas, ceu_estrelado, janela, paisagem_neve, abajur, planta_vaso, quadro,
                          nuvem, casa, monte_neve, estante_livros)


def nota_musical(c, x, y, s=1):
    c.grupo(x, y, s)
    c.elip(0, 0, 12, 9, '#fff', F, -20)
    c.linha('M10-4l0-44l20 8', F)
    c.fim()


def vela(c, x, y, h=70):
    c.ret(x - 12, y - h, 24, h, 4)
    c.path(f'M{x} {y - h - 36}Q{x + 14} {y - h - 14} {x} {y - h - 6}Q{x - 14} {y - h - 14} {x} {y - h - 36}Z', w=3)
    c.elip(x, y, 30, 8)


# ---------- Cena 12: a ceia ----------
def cena_ceia():
    c = Cena()
    parede_bolinhas(c, 700, 100, evita=((330, 60, 680, 420),))
    janela(c, 380, 110, 250, 260, lambda c, *a: paisagem_neve(c, *a))
    # guirlanda de galhos com laços nas laterais
    for x0 in (60, 760):
        c.tubo(f'M{x0} 120Q{x0 + 90} 180 {x0 + 180} 120', 22)
        for k in range(7):
            t = k / 6
            x = x0 + t * 180
            y = 120 + 60 * 4 * t * (1 - t) * .9
            c.elip(x, y, 14, 7, w=2.5, rot=k * 40)
        bola_enfeite(c, x0 + 60, 210, 16, 1)
        bola_enfeite(c, x0 + 130, 214, 16, 2)
    quadro(c, 80, 270, 160, 130, 'coracao')
    quadro(c, 790, 270, 140, 160, 'montanha')
    # Bolinho e Farofa sentados do outro lado da mesa
    c.bolinho(260, 600, 1.0, gorro='noel', braco_e=(-30, 120), braco_d=(30, 120), boca='aberta', roupa='listras', pes=False)
    c.farofa(760, 790, 1.0, olhando=-1, laco=True)
    # mesa com toalha
    c.path('M0 740L1000 740L1000 1180Q950 1210 900 1180Q850 1210 800 1180Q750 1210 700 1180Q650 1210 600 1180Q550 1210 500 1180'
           'Q450 1210 400 1180Q350 1210 300 1180Q250 1210 200 1180Q150 1210 100 1180Q50 1210 0 1180Z')
    c.linha('M0 800L1000 800', F)
    for x in range(40, 1000, 80):
        c.estrela(x, 1120, 12, 5, w=2.5)
    for x in range(80, 1000, 160):
        c.linha(f'M{x} 800q-10 190 0 380', 2.5)
    c.bolinho(260, 600, 1.0, braco_e=(-30, 120), braco_d=(30, 120), so_bracos=True)
    # travessa com o peru no meio
    c.elip(500, 860, 200, 50)
    c.elip(500, 856, 170, 36, w=F)
    c.path('M380 850C370 760 460 720 530 730C620 740 640 800 620 850Z')
    c.linha('M420 800q60-30 140-20M440 830q60-20 150-10', 2.5)
    for s_ in (-1, 1):
        x0 = 500 + s_ * 120
        c.path(f'M{x0} 830L{x0 + s_ * 60} 790', 'none', 18)
        c.path(f'M{x0} 830L{x0 + s_ * 60} 790', 'none', 8)
        c.circ(x0 + s_ * 66, 786, 12)
    for (x, y) in ((360, 870), (640, 870), (420, 890), (590, 890)):
        c.circ(x, y, 12, w=F)
    # panetone
    c.path('M140 900L140 830Q170 780 220 790Q270 780 300 830L300 900Z')
    c.path('M140 830Q170 790 220 800Q270 790 300 830L300 850L140 850Z', w=F)
    for (x, y) in ((170, 876), (220, 866), (270, 880), (196, 840), (250, 836)):
        c.circ(x, y, 5, w=2.5)
    c.elip(220, 902, 100, 18)
    # tigela de farofa (é claro)
    c.path('M720 870Q720 940 800 940Q880 940 880 870Z')
    c.elip(800, 870, 80, 18, w=F)
    for k in range(10):
        c.circ(740 + k * 14, 862 + (k % 3) * 4, 3, w=2)
    c.ret(740, 900, 120, 30, 6, w=2.5)
    c.texto(800, 924, 'farofa', 28)
    # pratos, talheres, taças e velas
    for x in (110, 890):
        c.elip(x, 1010, 80, 28)
        c.elip(x, 1010, 54, 18, w=F)
        c.linha(f'M{x - 100} 990l0 50M{x + 100} 990l0 50', F)
    vela(c, 390, 980, 70)
    vela(c, 610, 980, 90)
    for x in (300, 700):
        c.path(f'M{x - 26} 940Q{x - 26} 990 {x} 994Q{x + 26} 990 {x + 26} 940Z')
        c.linha(f'M{x} 994l0 40M{x - 20} 1036l40 0', F)
    c.elip(500, 1040, 90, 24)
    biscoito_estrela(c, 470, 1032, 18)
    biscoito_redondo(c, 524, 1036, 14)
    bengala(c, 500, 1010, .6, 80)
    # rabanadas
    for k in range(3):
        c.ret(220 + k * 20, 1060 - k * 18, 90, 30, 8, rot=-6)
    return c


# ---------- Cena 13: ladeira abaixo de trenó ----------
def cena_treno():
    c = Cena()
    ceu_estrelado(c, 0, 0, 1000, 500, 24, 31)
    nuvem(c, 780, 140, 1.2)
    nuvem(c, 200, 110, .8)
    # morro em diagonal
    c.path('M-10 380Q300 420 600 640Q800 790 1010 860L1010 1310L-10 1310Z')
    for (x, b, h) in ((90, 400, 150), (190, 420, 110), (300, 440, 130)):
        pinheiro(c, x, b, h)
    casa(c, 360, 480, 100, 70)
    # trilha do trenó
    c.linha('M80 560Q300 600 500 760Q700 920 900 1000', 3)
    c.linha('M60 600Q290 640 480 800Q680 960 880 1040', 3)
    # trenó com Bolinho e Farofa
    c.grupo(560, 820, 1, 24)
    c.path('M-180 60L160 60Q210 60 210 10L190 10Q190 40 160 40L-180 40Z')
    c.linha('M-140 40l0-30M-40 40l0-30M60 40l0-30M140 40l0-30', F)
    c.ret(-170, -10, 330, 30, 10)
    c.fim()
    c.bolinho(560, 640, 1.0, cachecol=True, boca='aberta', braco_e=(-80, -90), braco_d=(80, -100), roupa='estrela', pes=False)
    c.farofa(420, 790, .8, olhando=1, rabo=-1, gorro=True)
    c.tubo('M720 920Q780 950 800 900', 8, 3)
    # neve espirrando
    for (x, y, r) in ((300, 760, 18), (270, 720, 12), (330, 700, 10), (250, 780, 14), (220, 740, 8)):
        c.circ(x, y, r, w=F)
    c.linha('M280 680l-30-30M240 700l-40-10', 3)
    # pinheiros grandes e boneco de neve na lateral
    pinheiro(c, 860, 760, 260)
    pinheiro(c, 120, 1180, 280)
    c.circ(330, 1180, 70)
    c.circ(330, 1080, 48)
    c.ponto(316, 1074, 5)
    c.ponto(344, 1074, 5)
    c.path('M330 1086l30 6l-30 6z', w=3)
    c.path('M290 1040L370 1040L360 990L300 990Z')
    c.ret(282, 1032, 96, 14, 6)
    c.path('M290 1110Q330 1130 370 1110L372 1124Q330 1146 288 1124Z', w=F)
    c.linha('M264 1160l-60-50M396 1160l60-50', F)
    for k in range(3):
        c.ponto(330, 1150 + k * 24, 5)
    # placa "devagar!"
    c.ret(612, 1060, 18, 180, 4)
    c.path('M540 1020L700 1020L720 1060L700 1100L540 1100Z')
    c.texto(620, 1074, 'devagar!', 36)
    # coelhinho espiando na neve e flocos
    c.path('M800 1240Q800 1180 850 1180Q900 1180 900 1240Z')
    c.path('M830 1186C820 1130 834 1110 846 1150ZM870 1186C880 1130 866 1110 854 1150Z', w=F)
    c.ponto(838, 1212, 4)
    c.ponto(862, 1212, 4)
    c.path('M760 1260Q850 1220 940 1260Z', w=F)
    for (x, y) in ((500, 200), (640, 330), (400, 300), (900, 400), (720, 520), (500, 1200), (980, 1150)):
        c.floco(x, y, 14, 2.5)
    return c


# ---------- Cena 14: cantando na porta do vizinho ----------
def cena_cantoria():
    c = Cena()
    ceu_estrelado(c, 0, 0, 1000, 300, 20, 44)
    # fachada da casa
    c.ret(120, 120, 760, 900, 0)
    for y in range(160, 1020, 40):
        c.linha(f'M120 {y}L880 {y}', 2)
    c.path('M60 140L500 -40L940 140Z')
    c.path('M50 146L500 -50L950 146Q900 120 860 150Q820 120 780 150Q740 120 700 150Q660 120 620 150Q580 120 540 150Q500 120 460 150Q420 120 380 150Q340 120 300 150Q260 120 220 150Q180 120 140 150Q100 120 50 146Z', w=F)
    # varal de luzes na beira do telhado
    c.varal_luzes(60, 160, 940, 160, 30, 14, 18)
    # janelas com luz
    for x in (170, 680):
        janela(c, x, 300, 150, 190, None, cortina=False)
        c.linha(f'M{x + 20} 330l40 40M{x + 100} 330l30 30', 2)
        c.path(f'M{x - 20} 530L{x + 170} 530L{x + 160} 580L{x - 10} 580Z')
        for k in range(4):
            c.circ(x + 10 + k * 44, 518, 14, w=2.5)
    # porta com guirlanda
    c.ret(390, 420, 220, 380, 10)
    c.ret(410, 440, 80, 150, 6, w=F)
    c.ret(510, 440, 80, 150, 6, w=F)
    c.ret(410, 620, 80, 160, 6, w=F)
    c.ret(510, 620, 80, 160, 6, w=F)
    c.circ(580, 620, 9, w=F)
    c.tubo('M500 470a56 56 0 1 0 0.1 0', 26)
    for i in range(16):
        ang = math.radians(i * 360 / 16)
        c.elip(500 + 56 * math.cos(ang), 526 + 56 * math.sin(ang), 13, 7, w=2.5, rot=i * 360 / 16 + 60)
    c.path('M500 584l-30-14l0 28zM500 584l30-14l0 28z', w=F)
    c.circ(500, 584, 7, w=3)
    c.ret(370, 400, 260, 26, 8)
    # lampião
    c.ret(650, 470, 40, 60, 6)
    c.path('M644 470L696 470L670 440Z', w=F)
    c.path('M670 488Q680 500 670 512Q660 500 670 488Z', w=2.5)
    # degraus e calçada
    c.ret(340, 800, 320, 40, 6)
    c.ret(300, 840, 400, 40, 6)
    c.ret(-10, 880, 1020, 430, 0)
    for x in range(0, 1000, 100):
        c.linha(f'M{x} 880l-20 420', 2.5)
    # vasos de pinheirinho nos lados da porta
    for x in (330, 670):
        pinheiro(c, x, 760, 150)
        c.path(f'M{x - 40} 800L{x - 34} 760L{x + 34} 760L{x + 40} 800Z')
    # Bolinho e Farofa cantando com o livrinho
    c.bolinho(300, 960, 1.15, cachecol=True, boca='aberta', olhos='fechados', braco_e=(40, 60), braco_d=(80, 50), gorro='noel', roupa='coracao')
    c.path('M330 1060L440 1030L460 1110L350 1140Z')
    c.linha('M396 1046l18 80', 2.5)
    c.texto(370, 1098, '♪', 30, rot=-14)
    c.texto(426, 1082, '♫', 30, rot=-14)
    c.bolinho(300, 960, 1.15, braco_e=(40, 60), braco_d=(80, 50), so_bracos=True)
    c.farofa(680, 1240, 1.0, olhando=-1, gorro=True)
    # sininhos de laço no chão
    for (x, y) in ((790, 1250), (836, 1258)):
        c.path(f'M{x - 26} {y}Q{x - 26} {y - 46} {x} {y - 46}Q{x + 26} {y - 46} {x + 26} {y}Z')
        c.circ(x, y + 6, 7, w=3)
    c.path('M813 1200l-22-14l0 26zM813 1200l22-14l0 26z', w=F)
    for (x, y, s_) in ((520, 900, 1), (580, 860, .8), (180, 820, .9), (860, 940, 1), (900, 860, .7), (460, 1000, .8)):
        nota_musical(c, x, y, s_)
    # lanterninha no chão e neve nos cantos
    c.ret(860, 1180, 60, 90, 8)
    c.path('M856 1180L924 1180L890 1150Z', w=F)
    c.path('M890 1210Q902 1226 890 1240Q878 1226 890 1210Z', w=2.5)
    monte_neve(c, -20, 220, 1300, 60)
    return c


# ---------- Cena 15: manhã de Natal ----------
def cena_manha():
    c = Cena()
    parede_bolinhas(c, 760, 100, evita=((40, 60, 380, 460),))
    janela(c, 90, 120, 260, 280, lambda c, *a: paisagem_neve(c, *a, lua=False))
    c.circ(170, 180, 30, w=F)
    chao_tabuas(c, 900)
    # árvore no canto direito
    tx = 780
    for (top, base, hw) in reversed([(140, 300, 80), (220, 440, 130), (320, 590, 180), (440, 760, 220)]):
        n = max(3, hw // 36)
        d = f'M{tx} {top}L{tx + hw} {base}'
        for k in range(n):
            x0 = tx + hw - k * 2 * hw / n
            d += f'Q{x0 - hw / n} {base + 20} {x0 - 2 * hw / n} {base}'
        c.path(d + 'Z')
    c.estrela(tx, 120, 44, 20)
    for (x, y, t) in ((750, 270, 0), (820, 280, 1), (700, 410, 2), (850, 400, 3), (640, 560, 1), (780, 540, 0), (900, 560, 2),
                      (600, 720, 3), (720, 700, 1), (840, 720, 0), (960, 730, 1)):
        bola_enfeite(c, x, y, 18, t)
    c.ret(tx - 30, 760, 60, 60, 4)
    c.path(f'M{tx - 90} 820L{tx + 90} 820L{tx + 70} 900L{tx - 70} 900Z')
    # Bolinho de pijama abrindo um presente (urso de pelúcia? não: um trenzinho!)
    c.bolinho(380, 680, 1.1, gorro=False, roupa='pijama', boca='aberta', braco_e=(-40, 60), braco_d=(40, 60), pes=False)
    c.path('M180 900L560 900L580 1000L160 1000Z')
    # caixa aberta com papel rasgado
    c.ret(240, 840, 280, 150, 8)
    c.path('M240 840L200 780L280 760L320 840Z', w=F)
    c.path('M520 840L560 790L470 770L440 840Z', w=F)
    c.estrela(300, 920, 16, 7, w=2.5)
    c.estrela(460, 920, 16, 7, w=2.5)
    c.coracao(380, 950, 14, w=2.5)
    # brinquedo novo saindo da caixa: aviãozinho
    c.grupo(380, 560, 1, -10)
    c.path('M-100 0Q-100-30-60-30L80-30Q120-30 120 0Q120 30 80 30L-60 30Q-100 30-100 0Z')
    c.path('M-20-30L20-100L50-100L30-30Z')
    c.path('M-20 30L20 90L50 90L30 30Z')
    c.path('M-100-10L-130-50L-110-50L-80-20Z', w=F)
    c.circ(70, -6, 14, w=F)
    c.circ(30, -6, 14, w=F)
    c.ret(116, -40, 10, 80, 4, w=F)
    c.fim()
    c.linha('M200 500l-30-10M200 540l-40 0M560 520l30-14', 3)
    # Farofa brincando no papel amassado
    c.farofa(620, 1180, .9, olhando=-1, laco=True)
    for (x, y, r) in ((780, 1200, 34), (860, 1250, 26), (700, 1250, 22), (120, 1080, 30), (200, 1200, 24)):
        c.circ(x, y, r)
        c.linha(f'M{x - r * .5} {y - r * .2}l{r * .5} {r * .3}l{r * .3} {-r * .5}M{x - r * .2} {y + r * .4}l{r * .5} -4', 2.5)
    c.tubo('M480 1260Q560 1220 600 1260Q660 1300 700 1250', 8, 3)
    # presentes ainda fechados
    presente(c, 640, 860, 110, 90, 'listras')
    presente(c, 790, 870, 130, 90, 'bolas')
    presente(c, 900, 830, 90, 120, 'estrelas')
    presente(c, 300, 1110, 120, 100, 'zigue')
    # meias cheias penduradas? caneca de chocolate no chão
    caneca(c, 120, 1270, .9, 'coracao')
    return c


# ---------- Cena 16: oficina de brinquedos ----------
def cena_oficina():
    c = Cena()
    # parede de tábuas
    for x in range(0, 1000, 70):
        c.linha(f'M{x} 0L{x} 820', 2.5)
        c.circ(x + 10, 30, 3, w=2)
        c.circ(x + 10, 790, 3, w=2)
    chao_tabuas(c, 1080)
    # placa
    c.ret(320, 50, 360, 90, 12)
    c.texto(500, 112, 'Oficina do Noel', 56)
    c.linha('M360 50l-20-30M640 50l20-30', 3)
    # painel de ferramentas
    c.ret(40, 180, 300, 300, 8)
    for (x, y) in ((80, 220), (140, 220), (200, 220), (260, 220), (300, 220)):
        c.circ(x, y, 4, w=2)
    c.path('M80 230L80 330M64 330L96 330L96 360L64 360Z', w=F)
    c.path('M150 230L150 380', 'none', 8)
    c.path('M140 230L160 230L160 260L140 260Z', w=F)
    c.path('M210 230L230 360M250 230L230 360', 'none', F)
    c.circ(210, 360, 0, w=0)
    c.path('M280 230L280 400L300 400L300 230Z', w=F)
    for k in range(5):
        c.linha(f'M280 {260 + k * 28}l20 0', 2)
    c.ret(70, 400, 180, 60, 6, w=F)
    c.texto(160, 442, 'ideias', 30)
    # prateleiras de brinquedos prontos
    for y in (300, 480):
        c.ret(640, y, 330, 18, 5)
    # ursinho? não: boneco de pano, piãozinho, cavalinho
    c.circ(690, 250, 28)
    c.ret(670, 270, 40, 30, 8)
    c.ponto(682, 246, 3)
    c.ponto(698, 246, 3)
    c.path('M760 300L800 230L840 300Z')
    c.linha('M800 230l0-20M774 270l52 0', 2.5)
    c.path('M880 300L880 250Q880 220 910 220L940 220L950 240L930 240L930 300ZM870 300L960 300', w=F)
    c.ret(660, 420, 60, 60, 6)
    c.texto(690, 464, 'A', 36)
    c.circ(780, 448, 32)
    c.linha('M748 448l64 0M780 416l0 64', 2.5)
    c.path('M850 480L850 400L930 400L930 480Z')
    c.path('M850 400L890 360L930 400', 'none', F)
    c.ret(874, 430, 32, 50, 4, w=F)
    # Bolinho martelando atrás da bancada
    c.bolinho(470, 560, 1.1, gorro='noel', braco_e=(-50, 100), braco_d=(80, -60), roupa='listras')
    # martelo
    c.tubo('M600 580L680 500', 8, 4)
    c.ret(650, 450, 44, 76, 8, rot=45)
    c.bolinho(470, 560, 1.1, braco_e=(-50, 100), braco_d=(80, -60), so_bracos=True)
    c.linha('M720 430l20-20M736 470l26 0M690 410l6-26', 3)
    # bancada
    c.ret(0, 780, 1000, 50, 8)
    c.ret(30, 830, 940, 250, 0)
    for x in (60, 380, 700):
        c.ret(x, 860, 260, 90, 8, w=F)
        c.ret(x + 110, 896, 40, 14, 7, w=F)
        c.ret(x, 970, 260, 90, 8, w=F)
        c.ret(x + 110, 1006, 40, 14, 7, w=F)
    # carrinho sendo montado na bancada
    c.path('M320 780L320 720Q330 690 380 690L480 690Q520 690 540 720L600 720Q620 720 620 750L620 780Z')
    c.ret(390, 700, 50, 30, 6, w=F)
    c.ret(450, 700, 50, 30, 6, w=F)
    c.circ(380, 784, 26)
    c.circ(380, 784, 10, w=F)
    c.circ(570, 784, 26)
    c.circ(570, 784, 10, w=F)
    # pregos, porcas, lápis e lata de tinta
    for (x, y) in ((140, 770), (160, 774), (180, 768)):
        c.linha(f'M{x} {y}l0-24M{x - 6} {y - 24}l12 0', 3)
    c.path('M760 780L770 700L860 700L870 780Z')
    c.elip(815, 700, 45, 12, w=F)
    c.path('M770 720Q790 740 790 760', 'none', 3)
    c.texto(815, 756, 'tinta', 26)
    c.path('M900 770L960 730L966 740L906 780Z', w=3)
    # Farofa dentro do caixote de brinquedos
    c.path('M600 1280L620 1120L900 1120L920 1280Z')
    c.farofa(760, 1140, .85, olhando=1, gorro=True)
    c.path('M600 1280L620 1120L900 1120L920 1280Z')
    c.linha('M612 1180l300 0M606 1230l312 0', 2.5)
    c.texto(760, 1270, 'brinquedos', 30)
    c.circ(660, 1110, 26)
    c.path('M860 1120L880 1060L900 1080L880 1120Z', w=F)
    # aparas de madeira e bola no chão
    for (x, y) in ((100, 1200), (200, 1250), (300, 1190), (420, 1260)):
        c.path(f'M{x} {y}q20-20 40 0q-20 10-40 0', w=2.5)
    c.circ(280, 1240, 40)
    c.linha('M244 1236q36 18 72 0', 2.5)
    return c
