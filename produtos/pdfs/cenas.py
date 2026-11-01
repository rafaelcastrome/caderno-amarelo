"""Cenas detalhadas pra colorir (estilo aconchegante, arte própria do Caderno Amarelo).

Tudo em SVG de traço preto grosso com miolo branco. Desenha de trás pra frente:
o que vem depois cobre o de antes, então as linhas nunca se cruzam.
Personagens próprios: Bolinho (cachorrinho de orelha caída) e Farofa (gatinha listrada).
"""
import math

W, H = 1000, 1300
T = 6      # traço principal
F = 3.5    # traço fino (detalhes)


class Cena:
    def __init__(self):
        self.el = []

    def add(self, s):
        self.el.append(s)

    # ---------- primitivas ----------
    def path(self, d, fill='#fff', w=T, extra=''):
        self.add(f'<path d="{d}" fill="{fill}" stroke="#1d1d1d" stroke-width="{w}" {extra}/>')

    def linha(self, d, w=F):
        self.add(f'<path d="{d}" fill="none" stroke="#1d1d1d" stroke-width="{w}"/>')

    def circ(self, cx, cy, r, fill='#fff', w=T):
        self.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}" stroke="#1d1d1d" stroke-width="{w}"/>')

    def elip(self, cx, cy, rx, ry, fill='#fff', w=T, rot=0):
        tr = f' transform="rotate({rot} {cx} {cy})"' if rot else ''
        self.add(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="#1d1d1d" stroke-width="{w}"{tr}/>')

    def ret(self, x, y, w_, h_, r=0, fill='#fff', w=T, rot=0):
        tr = f' transform="rotate({rot} {x + w_ / 2} {y + h_ / 2})"' if rot else ''
        self.add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w_}" height="{h_}" rx="{r}" fill="{fill}" stroke="#1d1d1d" stroke-width="{w}"{tr}/>')

    def ponto(self, cx, cy, r=5):
        self.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="#1d1d1d"/>')

    def tubo(self, d, larg=26, w=T):
        """Tubo com contorno (braço, rabo, fio, bengala): traço preto largo + traço branco por cima."""
        self.add(f'<path d="{d}" fill="none" stroke="#1d1d1d" stroke-width="{larg + 2 * w}"/>')
        self.add(f'<path d="{d}" fill="none" stroke="#fff" stroke-width="{larg}"/>')

    def texto(self, x, y, s, tam=34, rot=0, anchor='middle'):
        tr = f' transform="rotate({rot} {x} {y})"' if rot else ''
        self.add(f'<text x="{x}" y="{y}" font-family="Caveat" font-size="{tam}" text-anchor="{anchor}" fill="#1d1d1d"{tr}>{s}</text>')

    def texto_vazado(self, x, y, s, tam=60, rot=0):
        """Letra só de contorno, pra pintar por dentro."""
        tr = f' transform="rotate({rot} {x} {y})"' if rot else ''
        self.add(f'<text x="{x}" y="{y}" font-family="Caveat" font-size="{tam}" text-anchor="middle" fill="#fff" stroke="#1d1d1d" stroke-width="4.5" paint-order="stroke"{tr}>{s}</text>')

    def grupo(self, tx, ty, s=1, rot=0):
        self.add(f'<g transform="translate({tx} {ty}) rotate({rot}) scale({s})">')

    def fim(self):
        self.add('</g>')

    def svg(self, moldura=True, vb=None, estilo='width:100%;height:100%'):
        vb = vb or f'0 0 {W} {H}'
        cab = (f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" style="{estilo}">')
        if not moldura:
            return cab + ''.join(self.el) + '</svg>'
        return (cab + f'<defs><clipPath id="moldura"><rect x="8" y="8" width="{W - 16}" height="{H - 16}" rx="44"/></clipPath></defs>'
                f'<g clip-path="url(#moldura)">{"".join(self.el)}</g>'
                f'<rect x="8" y="8" width="{W - 16}" height="{H - 16}" rx="44" fill="none" stroke="#1d1d1d" stroke-width="9"/></svg>')

    # ---------- formas ----------
    def estrela(self, cx, cy, r, ri=None, n=5, fill='#fff', w=T, rot=-90):
        ri = ri or r * 0.48
        pts = []
        for i in range(2 * n):
            a = math.radians(rot + i * 180 / n)
            rr = r if i % 2 == 0 else ri
            pts.append(f'{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}')
        self.add(f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="#1d1d1d" stroke-width="{w}" stroke-linejoin="round"/>')

    def coracao(self, cx, cy, s, fill='#fff', w=F):
        self.path(f'M{cx} {cy + s * .9} C{cx - s * 1.3} {cy} {cx - s * .9} {cy - s * .9} {cx} {cy - s * .35} '
                  f'C{cx + s * .9} {cy - s * .9} {cx + s * 1.3} {cy} {cx} {cy + s * .9}Z', fill, w)

    def floco(self, cx, cy, r, w=F):
        d = ''
        for i in range(6):
            a = math.radians(i * 60)
            x2, y2 = cx + r * math.cos(a), cy + r * math.sin(a)
            d += f'M{cx} {cy}L{x2:.1f} {y2:.1f}'
            for sgn in (-1, 1):
                b = a + sgn * math.radians(40)
                mx, my = cx + r * .6 * math.cos(a), cy + r * .6 * math.sin(a)
                d += f'M{mx:.1f} {my:.1f}L{mx + r * .3 * math.cos(b):.1f} {my + r * .3 * math.sin(b):.1f}'
        self.linha(d, w)

    def bolinha_neve(self, cx, cy, r=7):
        self.circ(cx, cy, r, w=3)

    def varal_luzes(self, x1, y1, x2, y2, queda, n, tam=16):
        """Fio de luzinhas em catenária com lâmpadas penduradas."""
        mx, my = (x1 + x2) / 2, max(y1, y2) + queda
        self.linha(f'M{x1} {y1}Q{mx} {my + queda * .9} {x2} {y2}', 4)
        for i in range(1, n + 1):
            t = i / (n + 1)
            # ponto na quadrática
            cxq, cyq = mx, my + queda * .9
            x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cxq + t ** 2 * x2
            y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cyq + t ** 2 * y2
            ang = (-1) ** i * 12
            self.grupo(x, y, 1, ang)
            self.ret(-tam * .35, 0, tam * .7, tam * .5, 2, w=3.5)
            self.path(f'M{-tam * .45} {tam * .45}C{-tam * .7} {tam * 1.4} {tam * .7} {tam * 1.4} {tam * .45} {tam * .45}Z', w=3.5)
            self.linha(f'M{-tam * .15} {tam * .8}q{tam * .1} {-tam * .2} {tam * .25} {-tam * .1}', 2.5)
            self.fim()

    def ramo_pinheiro(self, d, n=14, tam=18):
        """Galho de guirlanda: fio + agulhinhas em V ao longo do caminho (aproximado por pontos dados)."""
        self.linha(d, 4)

    # ---------- personagens ----------
    def bolinho(self, x, y, s=1, braco_e=(-60, 40), braco_d=(60, 40), gorro=True, cachecol=False, olhos='abertos', boca='sorriso', so_bracos=False, segura=None, roupa='estrela', pes=True):
        """Bolinho, o cachorrinho. (x, y) = centro da cabeça. braços: ponta da mão relativa ao ombro."""
        self.grupo(x, y, s)
        if so_bracos:
            self._bracos(braco_e, braco_d)
            self.fim()
            return
        # corpo (moletom)
        self.path('M-52 48C-78 110-74 160-62 172L62 172C74 160 78 110 52 48Z')
        if roupa == 'pelado':                                       # verão: barriguinha e short
            self.path('M-30 80C-40 120-30 140 0 140C30 140 40 120 30 80C20 70-20 70-30 80Z', w=F)
            self.path('M-66 138L66 138L64 172L-64 172Z', w=F)
            self.linha('M0 140l0 32M-56 150l8 0M-40 160l8 0M44 150l8 0M30 160l8 0', 3)
        else:
            self.linha('M-64 140L64 140', F)                         # barra do moletom
            self.linha('M-60 152l8 0M-40 152l8 0M-20 152l8 0M0 152l8 0M20 152l8 0M40 152l8 0', 3)
            if roupa == 'estrela':
                self.estrela(0, 105, 20, fill='#fff', w=F)
            elif roupa == 'coracao':
                self.coracao(0, 102, 18, w=F)
            elif roupa == 'listras':
                self.linha('M-64 92L64 92M-68 118L68 118', F)
            elif roupa == 'pijama':
                for (px, py) in ((-30, 80), (20, 92), (-10, 120), (34, 124), (-44, 112), (6, 70)):
                    self.circ(px, py, 5, w=2.5)
                self.linha('M0 56l0 80', 3)
        # pés
        if pes:
            self.elip(-32, 178, 30, 16)
            self.elip(32, 178, 30, 16)
            self.linha('M-44 172l0 8M-34 172l0 9M44 172l0 8M34 172l0 9', 3)
        self._bracos(braco_e, braco_d)
        # cabeça
        self.elip(0, 0, 78, 66)
        # manchinha no olho (marca registrada do Bolinho)
        self.path('M6-12C8-30 34-34 48-18C60-4 54 22 36 26C26 28 24 18 14 16C2 14 4 0 6-12Z', w=F)
        # orelhas caídas
        self.path('M-56-40C-108-40-118 50-100 84C-90 102-64 96-60 66C-56 36-50-6-56-40Z')
        self.path('M56-40C108-40 118 50 100 84C90 102 64 96 60 66C56 36 50-6 56-40Z')
        self.linha('M-84 14q-8 28 0 54M84 14q8 28 0 54', 3)
        # gorro de tricô
        if gorro == 'noel':
            self.path('M-74-22C-70-90 10-120 70-96C100-80 112-50 104-20L90-22C88-50 70-70 60-60C70-50 74-34 74-22Z')
            self.ret(-82, -36, 164, 30, 15)
            self.circ(104, -10, 18)
            self.linha('M-60-30q4 6 10 0M-30-30q4 6 10 0M0-30q4 6 10 0M30-30q4 6 10 0M60-30q4 6 10 0', 2.5)
        elif gorro:
            self.path('M-74-22C-78-80-40-110 0-110C40-110 78-80 74-22Z')
            self.ret(-80, -34, 160, 26, 13)
            self.linha('M-56-34l0 26M-32-34l0 26M-8-34l0 26M16-34l0 26M40-34l0 26M64-34l0 26', 3)
            self.linha('M-50-60q50-14 100 0M-36-84q36-10 72 0', F)
            self.circ(0, -116, 20)
            self.linha('M-10-124l6 6M6-126l4 8M-4-110l8 4', 2.5)
        # rosto
        if olhos == 'fechados':
            self.linha('M-36 4q10 10 20 0M16 4q10 10 20 0', 5)
        else:
            self.elip(-26, 6, 7, 9, '#1d1d1d', 0)
            self.elip(26, 6, 7, 9, '#1d1d1d', 0)
            self.circ(-24, 2, 2.4, '#fff', 0)
            self.circ(28, 2, 2.4, '#fff', 0)
        self.path('M-13 18Q0 12 13 18Q12 30 0 31Q-12 30-13 18Z', '#1d1d1d', 2)
        if boca == 'aberta':
            self.path('M-12 34Q0 58 12 34Z', w=3.5)
        else:
            self.linha('M-12 34q6 8 12 0q6 8 12 0', 3.5)
        self.linha('M-56 26l6-6M-48 28l6-6M44 22l6 6M52 20l6 6', 3)   # bochechinha
        if cachecol:
            self.path('M-58 44Q0 70 58 44L60 60Q0 88-60 60Z')
            self.path('M28 62L44 120L66 112L52 58Z')
            self.linha('M40 100l20-6M36 86l18-6', 3)
        self.fim()

    def _bracos(self, braco_e, braco_d):
        for (sx, (bx, by)) in ((-48, braco_e), (48, braco_d)):
            self.tubo(f'M{sx} 70Q{sx + bx * .3} {70 + by * .2} {sx + bx} {70 + by}', 24)
            self.circ(sx + bx, 70 + by, 15)

    def farofa(self, x, y, s=1, olhando=1, rabo=1, gorro=False, laco=False):
        """Farofa, a gatinha listrada sentada. (x, y) = base no chão."""
        self.grupo(x, y, s)
        # rabo
        self.tubo(f'M{rabo * 40}-14C{rabo * 100}-10 {rabo * 110}-60 {rabo * 84}-90', 18)
        # corpo
        self.path('M-44 0C-56-40-46-80-26-96L26-96C46-80 56-40 44 0Z')
        self.linha('M-48-40l14 4M-50-24l16 2M48-40l-14 4M50-24l-16 2', F)
        self.path('M-30 0C-34-20-14-24-8-4ZM30 0C34-20 14-24 8-4Z', w=F)   # patinhas
        # cabeça
        self.grupo(olhando * 4, -128)
        self.path('M-46-8L-42-60L-16-38ZM46-8L42-60L16-38Z')
        self.linha('M-38-48l6 12M38-48l-6 12', 3)
        self.elip(0, 0, 50, 42)
        self.linha('M-8-40l0 12M8-40l0 12M-20-38l4 10M20-38l-4 10', 3)
        ex = olhando * 4
        self.elip(-18 + ex, 0, 5, 7, '#1d1d1d', 0)
        self.elip(18 + ex, 0, 5, 7, '#1d1d1d', 0)
        self.path(f'M{-6 + ex} 12l12 0l-6 7z', '#1d1d1d', 2)
        self.linha(f'M{ex} 19q-6 8-12 4M{ex} 19q6 8 12 4', 3)
        self.linha('M-30 14l-26-4M-30 20l-24 6M30 14l26-4M30 20l24 6', 2.5)
        if gorro:
            self.path('M-34-30C-30-70 20-84 44-60C54-48 56-34 50-24L40-30C38-44 28-50 20-44C26-40 30-34 30-30Z')
            self.ret(-40, -40, 80, 20, 10)
            self.circ(52, -20, 11)
        if laco:
            self.path('M24 30L4 20L4 44ZM24 30L44 20L44 44Z', w=F)
            self.circ(24, 32, 6, w=3)
        self.fim()
        self.fim()

    def farofa_dormindo(self, x, y, s=1):
        """Farofa enroladinha dormindo. (x, y) = base."""
        self.grupo(x, y, s)
        self.path('M-80 0C-90-50-40-80 10-76C60-72 90-40 80 0Z')
        self.linha('M-40-70l6 16M-10-76l2 18M20-74l-2 18M50-62l-6 14', F)
        self.tubo('M78-6C70 14 10 16-30 8', 16)
        self.grupo(-50, -30)
        self.path('M-36-10L-34-52L-12-34ZM30-10L30-50L8-34Z')
        self.elip(0, 0, 42, 34)
        self.linha('M-24 2q8 6 14 0M10 2q8 6 14 0', 3.5)
        self.path('M-6 10l12 0l-6 6z', '#1d1d1d', 2)
        self.linha('M-26 14l-22-2M26 14l22-2', 2.5)
        self.fim()
        self.texto(30, -100, 'z', 40)
        self.texto(60, -130, 'z', 30)
        self.texto(84, -152, 'z', 24)
        self.fim()
