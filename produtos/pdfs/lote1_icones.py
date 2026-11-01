"""Lote 1 de Natal, produtos feitos com os desenhos de icones.py: jogo da memória, bingo, enfeites e livro de colorir."""
import random
from base import documento, pagina, capa, salvar
from icones import ICONES, NOMES, svg
from cenas_natal import pinheiro, presente

TODOS = list(ICONES)
PAST = ['#ffe1e1', '#def3dc', '#fff2bf', '#dcefff', '#efe2fb', '#ffe8d2']

def instrucoes(titulo, itens, nome, extra=''):
    lis = ''.join(f'<li>{i}</li>' for i in itens)
    return pagina(f'<div class="tit">{titulo}</div><ol class="passos">{lis}</ol>{extra}', nome=nome)

CSS_PASSOS = '.passos{font-size:30px;line-height:1.3;margin:26px 0 0 34px}.passos li{margin-bottom:12px}'

# ---------- Jogo da memória (18 pares) ----------
def memoria():
    nome = 'Jogo da Memória de Natal'
    css = CSS_PASSOS + '''.grade{display:grid;grid-template-columns:repeat(3,58mm);grid-auto-rows:58mm;justify-content:center;margin-top:4mm}
.carta{border:1.5px dashed #999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:22px}
.verso{background:#e63946;background-image:radial-gradient(#fff 1.4mm,transparent 1.6mm),radial-gradient(#ffd23f 1mm,transparent 1.2mm);background-size:12mm 12mm;background-position:0 0,6mm 6mm;color:#fff}
.verso span{font-size:40px;transform:rotate(-8deg);background:#e63946;padding:1mm 3mm;border-radius:3mm;border:2px solid #fff}'''
    pags = [capa('jogo pra imprimir', 'Jogo da<br><span class="r">Memória</span><br>de Natal',
                 '18 pares de desenhos fofos pra recortar e colorir', ''.join(svg(n, 90) for n in ['noel', 'rena', 'boneco_neve', 'arvore']))]
    pags.append(instrucoes('Como montar e jogar', [
        'Imprime as páginas de cartas (de preferência em papel mais grosso, tipo 180 g).',
        'Se quiser, colore cada par igualzinho (as duas cartas do mesmo jeito!).',
        'Imprime a página de verso atrás de cada folha, ou cola as folhas numa cartolina.',
        'Recorta na linha tracejada.',
        'Embaralha as 36 cartas viradas pra baixo. Cada um vira duas por vez: achou o par, fica com ele e joga de novo.',
        'Ganha quem juntar mais pares no final.'], nome))
    cartas = [n for n in TODOS for _ in range(2)]
    for i in range(0, 36, 12):
        celulas = ''.join(f'<div class="carta" style="background:{PAST[TODOS.index(n) % 6]}">{svg(n, 140)}<div>{NOMES[n]}</div></div>' for n in cartas[i:i + 12])
        pags.append(pagina(f'<div class="grade">{celulas}</div>', nome=nome))
    versos = ''.join('<div class="carta verso"><span>Caderno<br>Amarelo</span></div>' for _ in range(12))
    pags.append(pagina(f'<div class="sub" style="text-align:center">Verso das cartas (opcional)</div><div class="grade">{versos}</div>', nome=nome))
    return salvar('jogo-da-memoria-natal', documento(nome, pags, css))

# ---------- Bingo de Natal (30 cartelas) ----------
def bingo():
    nome = 'Bingo de Natal em Família'
    css = CSS_PASSOS + '''.cartela{border:2.5px solid #1d1d1d;border-radius:5mm;padding:4mm 5mm;height:126mm;margin-bottom:6mm}
.cartela h3{display:flex;justify-content:space-between;font-size:34px;margin-bottom:2mm}
.bcg{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);height:102mm;border:1.5px solid #1d1d1d}
.bcg div{border:1px solid #1d1d1d;display:flex;align-items:center;justify-content:center}
.fichas{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:6mm}
.fichas div{border:1.5px dashed #999;height:58mm;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:22px}'''
    rnd = random.Random(2512)
    vistas, cartelas = set(), []
    while len(cartelas) < 30:
        c = tuple(rnd.sample(TODOS, 16))
        if frozenset(c) in vistas:  # cartelas com o mesmo conjunto empatariam sempre
            continue
        vistas.add(frozenset(c)); cartelas.append(c)
    pags = [capa('jogo pra ceia', 'Bingo de<br><span class="r">Natal</span>', '30 cartelas diferentes + fichas de sorteio',
                 ''.join(svg(n, 90) for n in ['presente', 'sino', 'bola', 'estrela']))]
    pags.append(instrucoes('Como jogar', [
        'Imprime as cartelas (são 2 por folha) e recorta.',
        'Imprime a folha de fichas, recorta e coloca tudo num saquinho ou numa caneca.',
        'Cada jogador pega uma cartela e alguns feijões, milhos ou pedacinhos de papel pra marcar.',
        'Alguém sorteia uma ficha e fala o nome do desenho em voz alta. Quem tiver, marca.',
        'Quem completar uma linha (deitada, em pé ou na diagonal) grita BINGO! Pra rodada longa, vale cartela cheia.',
        'Dica: combina antes um prêmio, tipo escolher a sobremesa ou não lavar a louça.'], nome))
    for i in range(0, 30, 2):
        bloco = ''
        for j, c in enumerate(cartelas[i:i + 2]):
            cel = ''.join(f'<div>{svg(n, 76)}</div>' for n in c)
            bloco += f'<div class="cartela"><h3><span>BINGO DE <span class="r">NATAL</span></span><span style="font-size:22px;color:#777">cartela {i + j + 1}</span></h3><div class="bcg">{cel}</div></div>'
        pags.append(pagina(bloco, nome=nome))
    fichas = ''.join(f'<div>{svg(n, 110)}<div>{NOMES[n]}</div></div>' for n in TODOS[:16])
    pags.append(pagina(f'<div class="tit">Fichas de <span class="m">sorteio</span></div><div class="fichas">{fichas}</div>', nome=nome))
    fichas2 = ''.join(f'<div>{svg(n, 110)}<div>{NOMES[n]}</div></div>' for n in TODOS[16:])
    pags.append(pagina(f'<div class="tit">Fichas de <span class="m">sorteio</span> (continuação)</div><div class="fichas">{fichas2}</div>', nome=nome))
    return salvar('bingo-de-natal', documento(nome, pags, css))

# ---------- Enfeites de papel ----------
def enfeites():
    nome = 'Enfeites de Papel pra Pendurar'
    css = CSS_PASSOS + '''.eg{display:grid;grid-template-columns:repeat(2,80mm);grid-auto-rows:84mm;gap:4mm 12mm;justify-content:center;margin-top:2mm}
.enf{position:relative;display:flex;align-items:center;justify-content:center}
.enf .forma{position:absolute;inset:0;border:2px dashed #888;border-radius:50%}
.enf .furo{position:absolute;top:3mm;left:50%;width:4mm;height:4mm;margin-left:-2mm;border:1.5px solid #888;border-radius:50%}
.enf.estrela .forma{border:none}
'''
    pags = [capa('recorta e monta', 'Enfeites<br>de <span class="r">Papel</span>', '18 enfeites pra colorir, recortar e pendurar na árvore',
                 ''.join(svg(n, 90) for n in ['bola', 'estrela', 'floco', 'sino']))]
    pags.append(instrucoes('Como fazer', [
        'Imprime as folhas (papel mais grosso deixa o enfeite firme).',
        'Colore do teu jeito. Canetinha, lápis de cor, glitter, vale tudo.',
        'Recorta no círculo tracejado.',
        'Pra ficar bonito dos dois lados, imprime duas vezes e cola uma folha nas costas da outra antes de recortar.',
        'Faz o furinho em cima com um lápis ou furador, passa uma linha ou fitinha e pendura!',
        'Ideia: escreve o nome de cada pessoa da família atrás e usa como enfeite de lugar na mesa da ceia.'], nome))
    for i in range(0, 18, 6):
        cel = ''.join(f'<div class="enf"><div class="forma"></div><div class="furo"></div>{svg(n, 210)}</div>' for n in TODOS[i:i + 6])
        pags.append(pagina(f'<div class="eg">{cel}</div>', nome=nome))
    return salvar('enfeites-de-papel', documento(nome, pags, css))

# ---------- Livro de colorir ----------
CENAS_COLORIR = [
    ('cena_carta', 'Querido Papai Noel...', 'Carta pro Papai Noel'),
    ('cena_embrulhos', 'Hora de embrulhar', 'Embrulhando presentes'),
    ('cena_casinha_biscoito', 'A casinha mais doce', 'Casinha de biscoito'),
    ('cena_biscoitos', 'Noite de biscoitos', 'Noite de biscoitos'),
    ('cena_arvore', 'A estrela vai lá em cima!', 'Montando a árvore'),
    ('cena_oficina', 'Ajudando na oficina', 'Oficina do Noel'),
    ('cena_guerra_neve', 'Guerra de bolinha de neve', 'Guerra de bolinha de neve'),
    ('cena_treno', 'Ladeira abaixo!', 'Trenó ladeira abaixo'),
    ('cena_lago', 'Patinando no lago', 'Patinação no lago'),
    ('cena_cantoria', 'Cantando na porta do vizinho', 'Cantoria na porta'),
    ('cena_sofa', 'Chocolate quente e cobertor', 'Chocolate quente no sofá'),
    ('cena_ceia', 'A ceia tá servida!', 'A ceia'),
    ('cena_noite', 'Será que ele já chegou?', 'Esperando o Papai Noel'),
    ('cena_manha', 'Manhã de Natal!', 'Manhã de Natal'),
    ('cena_piscina', 'Natal brasileiro é na piscina', 'Natal na piscina'),
    ('cena_praia', 'Boneco de areia de gorrinho', 'Natal na praia'),
]


def _cena(nome_func):
    import cenas_natal, cenas_natal2, cenas_natal3, cenas_natal4
    for m in (cenas_natal, cenas_natal2, cenas_natal3, cenas_natal4):
        if hasattr(m, nome_func):
            return getattr(m, nome_func)()
    raise KeyError(nome_func)


def _dupla(tam_px, gorro='noel'):
    """Bolinho e Farofa lado a lado (sem moldura), pra capa e páginas especiais."""
    from cenas import Cena
    c = Cena()
    c.bolinho(150, 140, 1, gorro=gorro, cachecol=True, braco_e=(-50, 60), braco_d=(60, 30))
    c.farofa(340, 330, 1, olhando=-1, gorro=True)
    return c.svg(moldura=False, vb='0 0 440 350', estilo=f'width:{tam_px}px')


FUROS_CSS = ('.pag{padding-left:24mm}'
             '.pag::before,.pag::after{content:"";position:absolute;left:8mm;width:6mm;height:6mm;border:1.6px dashed #9a9a9a;border-radius:50%;background:none}'
             '.pag::before{top:105.5mm}.pag::after{top:185.5mm}')   # 2 furos a 80 mm (furador comum), centralizados na folha


def _capa_pra_colorir():
    from cenas import Cena
    c = Cena()
    for (x, y) in ((80, 120), (920, 160), (140, 520), (880, 560), (500, 60), (150, 300), (860, 330)):
        c.floco(x, y, 22, 3)
    for (x, y) in ((220, 140), (780, 100), (60, 360), (950, 380), (420, 200), (600, 180)):
        c.estrela(x, y, 16, 7, w=3)
    c.texto(500, 290, 'Meu caderno de', 90)
    c.texto_vazado(500, 460, 'Natal Fofo', 190, w=8)
    c.path('M-10 1060Q300 980 520 1040Q760 1100 1010 1020L1010 1310L-10 1310Z')
    pinheiro(c, 120, 1060, 260)
    pinheiro(c, 880, 1040, 300)
    c.bolinho(400, 760, 1.25, gorro='noel', cachecol=True, braco_e=(-60, 50), braco_d=(80, 20))
    c.farofa(660, 1010, 1.15, olhando=-1, gorro=True)
    presente(c, 180, 1080, 130, 100, 'bolas')
    presente(c, 760, 1100, 150, 90, 'estrelas')
    c.ret(200, 1190, 600, 80, 14)
    c.texto(330, 1244, 'Este caderno é de:', 40)
    return c.svg()


def _contracapa():
    from cenas import Cena
    c = Cena()
    for (x, y) in ((120, 140), (860, 180), (500, 90), (260, 330), (760, 360), (120, 600), (880, 640)):
        c.floco(x, y, 20, 3)
    c.farofa_dormindo(500, 760, 1.6)
    c.path('M260 800L740 800L720 840L280 840Z')
    c.texto(500, 960, 'Feito com carinho pelo', 50)
    c.texto(500, 1030, 'Caderno Amarelo', 70)
    c.texto(500, 1100, '@Cardeno_Amarelo', 44)
    return c.svg()


def colorir():
    """Livro de colorir: 16 cenas detalhadas do Bolinho e da Farofa, com furos pra virar caderno, capa e passo a passo."""
    from cenas_natal import pinheiro as _p  # noqa: garante import das cenas
    nome = 'Natal Fofo pra Colorir'
    css = FUROS_CSS + '''.cc{display:flex;flex-direction:column;height:100%}
.cc .tt{font-size:50px;text-align:center;line-height:1;margin:-4mm 0 3mm}
.cc .arte{flex:1;min-height:0}
.apres{text-align:center;font-size:30px;line-height:1.25}
.apres h2{font-size:58px;margin:4mm 0 2mm}
.apres p{margin:2mm 10mm}
.livre{border:3px solid #1d1d1d;border-radius:8mm;height:232mm;margin-top:4mm;position:relative}
.passo{font-size:21px;line-height:1.15}
.passo h2{font-size:48px;line-height:1;margin:-4mm 0 1mm}
.passo h3{font-size:27px;margin:2.2mm 0 .3mm;display:flex;align-items:center;gap:3mm}
.passo h3 b{background:#ffd23f;border-radius:50%;width:10mm;height:10mm;display:inline-flex;align-items:center;justify-content:center;font-size:26px}
.passo p{margin:0 0 0 13mm}
.passo .box{border:2.5px solid #1d1d1d;border-radius:4mm;padding:2mm 4mm;margin-top:3mm;background:#fff7d6}'''
    pags = [capa('livro de colorir', 'Natal<br>Fofo', '16 cenas cheias de detalhe pra colorir com calma', _dupla(330))]
    pags.append(pagina('''<div class="passo"><h2>Como montar o teu caderno</h2>
<p style="margin:0">Dá pra pintar folha por folha ou montar um caderninho de verdade. É fácil, vai do começo ao fim:</p>
<h3><b>1</b>O que tu vai precisar</h3>
<p>Impressora (ou a papelaria do bairro), papel A4 pro miolo, papel mais grosso pra capa, furador de 2 furos e fita, barbante ou argolas pra prender.</p>
<h3><b>2</b>Papel das páginas de dentro</h3>
<p>Sulfite A4 de <b>90 a 120 g/m²</b>. O comum (75 g/m²) até funciona, mas canetinha atravessa. Se for usar canetinha ou giz molhado, vai de <b>120 g/m²</b>.</p>
<h3><b>3</b>Papel da capa</h3>
<p>Papel de <b>180 a 240 g/m²</b> (tipo color plus, offset grosso, couché fosco ou cartolina fina). Usa a capa colorida (página 1) ou a capa pra pintar (penúltima página) e a contracapa (última).</p>
<h3><b>4</b>Na hora de imprimir</h3>
<p>Escolhe tamanho <b>A4</b> e escala <b>100% / tamanho real</b> (não marca "ajustar à página"), senão os furos saem do lugar. Imprime <b>só de um lado</b> da folha, pra tinta da canetinha não estragar o desenho de trás. O miolo pode ser em preto e branco.</p>
<h3><b>5</b>Furar</h3>
<p>As bolinhas tracejadas na beirada esquerda mostram onde furar. Com furador de 2 furos (8 cm entre um furo e outro), fura poucas folhas por vez, sempre na marca.</p>
<h3><b>6</b>Montar na ordem</h3>
<p>Capa, página de apresentação, as 16 cenas, a página pra desenhar e, por último, a contracapa. Bate as folhas na mesa pra alinhar.</p>
<h3><b>7</b>Prender</h3>
<p>Passa uma fita ou barbante pelos furos e dá um laço, ou usa colchete bailarina ou argolas. Quer mais caprichado? Leva na papelaria e pede <b>encadernação com espiral</b> (aí nem precisa furar).</p>
<div class="box">Dica: põe uma folha de rascunho embaixo quando for usar canetinha. E não esquece: a Farofa tá escondida em todas as cenas!</div>
</div>''', nome=nome))
    pags.append(pagina(f'''<div class="apres"><h2>Oi! A gente é o Bolinho e a Farofa</h2>{_dupla(520, gorro=True)}
<p>O <b>Bolinho</b> é um cachorrinho de orelha caída que ama biscoito e Natal. A <b>Farofa</b> é a gatinha listrada que vive se escondendo
em tudo que é lugar: dentro da árvore, da caixa, do presente...</p>
<p>Em cada página tem uma historinha do nosso Natal. Pinta do teu jeito, com lápis de cor, giz ou canetinha.
Dica: procura a Farofa em todas as cenas!</p></div>''', nome=nome))
    for func, titulo, _ in CENAS_COLORIR:
        pags.append(pagina(f'<div class="cc"><div class="tt">{titulo}</div><div class="arte">{_cena(func).svg()}</div></div>', nome=nome))
    pags.append(pagina(f'''<div class="cc"><div class="tt">Agora desenha o teu Natal!</div>
<div class="livre"><div style="position:absolute;right:8mm;bottom:6mm">{_dupla(260)}</div></div></div>''', nome=nome))
    pags.append(pagina(f'<div class="cc"><div class="tt">Capa pra pintar</div><div class="arte">{_capa_pra_colorir()}</div></div>', nome=nome))
    pags.append(pagina(f'<div class="cc"><div class="tt">Contracapa</div><div class="arte">{_contracapa()}</div></div>', nome=nome))
    return salvar('natal-fofo-colorir', documento(nome, pags, css, pb=True))

if __name__ == '__main__':
    for f in (memoria, bingo, enfeites, colorir):
        print(f())
