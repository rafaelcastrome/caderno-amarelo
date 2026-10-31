"""Lote 1 de Natal, produtos feitos com os desenhos de icones.py: jogo da memória, bingo, enfeites e livro de colorir."""
import random
from base import documento, pagina, capa, salvar
from icones import ICONES, NOMES, svg

TODOS = list(ICONES)

def instrucoes(titulo, itens, nome, extra=''):
    lis = ''.join(f'<li>{i}</li>' for i in itens)
    return pagina(f'<div class="tit">{titulo}</div><ol class="passos">{lis}</ol>{extra}', nome=nome)

CSS_PASSOS = '.passos{font-size:30px;line-height:1.3;margin:26px 0 0 34px}.passos li{margin-bottom:12px}'

# ---------- Jogo da memória (18 pares) ----------
def memoria():
    nome = 'Jogo da Memória de Natal'
    css = CSS_PASSOS + '''.grade{display:grid;grid-template-columns:repeat(3,58mm);grid-auto-rows:58mm;justify-content:center;margin-top:4mm}
.carta{border:1.5px dashed #999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:22px}
.verso{background:#fbf5df;background-image:linear-gradient(#cfdbee 1px,transparent 1px),linear-gradient(90deg,#cfdbee 1px,transparent 1px);background-size:6mm 6mm}
.verso span{font-size:40px;transform:rotate(-8deg)}'''
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
        celulas = ''.join(f'<div class="carta">{svg(n, 140)}<div>{NOMES[n]}</div></div>' for n in cartas[i:i + 12])
        pags.append(pagina(f'<div class="grade">{celulas}</div>', nome=nome))
    versos = ''.join('<div class="carta verso"><span>Caderno<br>Amarelo</span></div>' for _ in range(12))
    pags.append(pagina(f'<div class="sub" style="text-align:center">Verso das cartas (opcional)</div><div class="grade">{versos}</div>', nome=nome))
    return salvar('jogo-da-memoria-natal', documento(nome, pags, css))

# ---------- Bingo de Natal (30 cartelas) ----------
def bingo():
    nome = 'Bingo de Natal em Família'
    css = CSS_PASSOS + '''.cartela{border:2.5px solid #1d1d1d;border-radius:5mm;padding:4mm 5mm;height:126mm;margin-bottom:6mm}
.cartela h3{display:flex;justify-content:space-between;font-size:34px;margin-bottom:2mm}
.cg{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);height:102mm;border:1.5px solid #1d1d1d}
.cg div{border:1px solid #1d1d1d;display:flex;align-items:center;justify-content:center}
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
            bloco += f'<div class="cartela"><h3><span>BINGO DE <span class="r">NATAL</span></span><span style="font-size:22px;color:#777">cartela {i + j + 1}</span></h3><div class="cg">{cel}</div></div>'
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
def colorir():
    nome = 'Natal Fofo pra Colorir'
    css = '''.cc{display:flex;flex-direction:column;align-items:center;height:100%}
.cc .tt{font-size:54px;margin-bottom:4mm}
.moldura{flex:1;width:100%;border:3px solid #1d1d1d;border-radius:8mm;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}
.mini{position:absolute}'''
    frases = {
        'arvore': 'Eu brilho mais que as luzinhas', 'estrela': 'Lá do alto eu vejo tudo', 'presente': 'Será que é meia de novo?',
        'sino': 'Blém, blém, cadê o panetone?', 'bengala': 'Docinho listradinho', 'boneco_neve': 'Gelado por fora, quentinho por dentro',
        'bola': 'Não me derruba da árvore!', 'meia': 'Cabe muito presente aqui', 'biscoito': 'Não me come, por favor',
        'rena': 'Prontinha pra voar', 'gorro': 'O gorro oficial do Noel', 'floco': 'Nenhum floco é igual ao outro',
        'vela': 'Luzinha da ceia', 'luva': 'Mãozinha quentinha', 'caneca': 'Chocolate quente, por favor',
        'guirlanda': 'Bem-vindo, pode entrar!', 'noel': 'Ho ho ho!', 'pirulito': 'Doce de Natal',
    }
    rnd = random.Random(7)
    pags = [capa('livro de colorir', 'Natal<br><span class="r">Fofo</span>', '20 desenhos grandes pra colorir com calma',
                 ''.join(svg(n, 90) for n in ['caneca', 'biscoito', 'meia', 'noel']))]
    for n in TODOS:
        minis = ''
        outros = [o for o in TODOS if o != n]
        pos = [(6, 6), (78, 6), (6, 78), (78, 80), (4, 42), (82, 44)]
        for (x, y), o in zip(pos, rnd.sample(outros, len(pos))):
            minis += f'<div class="mini" style="left:{x}%;top:{y}%">{svg(o, 95)}</div>'
        pontos = []
        while len(pontos) < 22:
            x, y = rnd.uniform(3, 95), rnd.uniform(3, 72)
            if 20 < x < 78 and 14 < y < 76:  # deixa o desenho principal livre
                continue
            pontos.append((x, y))
        neve = ''.join(f'<div class="mini" style="left:{x:.1f}%;top:{y:.1f}%;width:{d}px;height:{d}px;border:2px solid #1d1d1d;border-radius:50%"></div>'
                       for (x, y), d in zip(pontos, [rnd.choice([9, 12, 16]) for _ in pontos]))
        cenario = ('<svg class="mini" style="left:0;top:0;width:100%;height:100%" viewBox="0 0 100 100" preserveAspectRatio="none">'
                   '<g fill="none" stroke="#1d1d1d" stroke-width=".45" vector-effect="non-scaling-stroke">'
                   '<path d="M0 84 Q20 76 40 83 T80 81 T100 80" vector-effect="non-scaling-stroke" style="stroke-width:2.4px"/>'
                   '<path d="M0 92 Q25 87 50 92 T100 90" vector-effect="non-scaling-stroke" style="stroke-width:2px"/>'
                   '</g></svg>' + neve)
        pags.append(pagina(f'<div class="cc"><div class="tt">{frases[n]}</div><div class="moldura">{cenario}{minis}<div style="position:relative">{svg(n, 470)}</div></div></div>', nome=nome))
    # 2 páginas de padrão (estampa) pra colorir
    for k in range(2):
        cel = ''.join(f'<div style="display:flex;align-items:center;justify-content:center">{svg(TODOS[(i * 5 + k * 3) % 18], 120)}</div>' for i in range(20))
        pags.append(pagina(f'<div class="cc"><div class="tt">{"Papel de presente pra colorir" if k == 0 else "Estampa de Natal"}</div>'
                           f'<div class="moldura" style="display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(5,1fr)">{cel}</div></div>', nome=nome))
    return salvar('natal-fofo-colorir', documento(nome, pags, css))

if __name__ == '__main__':
    for f in (memoria, bingo, enfeites, colorir):
        print(f())
