"""Lote 3: produtos de recorte e jogo que já vêm PINTADOS (ninguém precisa colorir). Só os livros de colorir ficam em preto e branco."""
import math
from base import documento, pagina, capa, salvar, PASTEIS
from icones import ICONES, NOMES, svg

TODOS = list(ICONES)
FORTES = ['#e63946', '#2e9e5b', '#2a78c4', '#f4a300', '#7b2cbf', '#e76f51']
CSS_PASSOS = '.passos{font-size:30px;line-height:1.3;margin:26px 0 0 34px}.passos li{margin-bottom:12px}'

def instrucoes(titulo, itens, nome):
    return pagina(f'<div class="tit">{titulo}</div><ol class="passos">{"".join(f"<li>{i}</li>" for i in itens)}</ol>', nome=nome)

# ---------- 1. Bandeirinhas de Natal ----------
def bandeirinha(cor, letra=None, icone=None):
    clara = {'#f4a300': '#ffe9a8'}.get(cor, '#fff')
    corpo = ''
    if letra:
        corpo = (f'<text x="50" y="62" text-anchor="middle" font-size="50" fill="#fff" stroke="#1d1d1d" stroke-width="1.6" paint-order="stroke" '
                 f'style="font-family:Caveat,cursive;font-weight:700">{letra}</text>'
                 f'<text x="20" y="40" font-size="9" fill="{clara}">✦</text><text x="76" y="40" font-size="9" fill="{clara}">✦</text>')
    else:
        corpo = f'<circle cx="50" cy="43" r="27" fill="#fff"/>' + svg(icone, 44, 'x="28" y="21"')
    return (f'<svg viewBox="0 0 100 96" style="width:84mm;height:80.6mm;display:block">'
            f'<polygon points="1,1 99,1 99,58 50,95 1,58" fill="{cor}" stroke="#555" stroke-width="1" stroke-dasharray="3 2"/>'
            f'<rect x="1" y="1" width="98" height="14" fill="#000" fill-opacity=".18"/>'
            f'<line x1="1" y1="15" x2="99" y2="15" stroke="#fff" stroke-width=".8" stroke-dasharray="2 2"/>'
            f'<text x="50" y="11" text-anchor="middle" font-size="7" fill="#fff" style="font-family:Caveat,cursive">dobra aqui e passa o barbante</text>'
            f'<polygon points="7,20 93,20 93,56 50,88 7,56" fill="none" stroke="#fff" stroke-width=".9" stroke-dasharray="1.6 1.6"/>{corpo}</svg>')

def bandeirinhas():
    nome = 'Bandeirinhas de Natal'
    css = '.bg3{display:grid;grid-template-columns:repeat(2,88mm);grid-auto-rows:84mm;justify-content:center;gap:1mm 2mm}.bg3>div{display:flex;align-items:center;justify-content:center}'
    paginas_def = [list('FELIZ') + ['estrela'], list('NATAL') + ['arvore'], list('BOAS') + ['sino', 'presente'], list('FESTAS'),
                   ['noel', 'rena', 'boneco_neve', 'biscoito', 'bola', 'meia'], ['caneca', 'vela', 'guirlanda', 'bengala', 'gorro', 'luva']]
    pags = [capa('pra pendurar', 'Bandeirinhas<br>de <span class="r">Natal</span>', '36 bandeirinhas prontas e pintadas: é só recortar e pendurar',
                 ''.join(svg(n, 90) for n in ['estrela', 'sino', 'arvore', 'noel']))]
    pags.append(instrucoes('Como montar o varal', [
        'Imprime tudo em papel um pouco mais grosso (75 g já funciona, 120 g fica melhor).',
        'Recorta cada bandeirinha pela linha tracejada de fora.',
        'Dobra a faixinha de cima pra trás, na linha branca, e passa o barbante ou a fita por dentro (cola ou fita dupla face segura).',
        'Monta as frases na ordem: FELIZ NATAL e BOAS FESTAS, com as bandeirinhas de desenho no meio ou nas pontas.',
        'Pendura na parede, na porta, na janela ou na árvore. Já vem tudo pintado!',
        'Dica: pra ficar bonito dos dois lados, imprime duas vezes e cola costas com costas.'], nome))
    i = 0
    for pg in paginas_def:
        cel = ''
        for item in pg:
            cor = FORTES[i % 6]; i += 1
            cel += f'<div>{bandeirinha(cor, letra=item) if len(item) == 1 else bandeirinha(cor, icone=item)}</div>'
        pags.append(pagina(f'<div class="bg3">{cel}</div>', nome=nome))
    return salvar('bandeirinhas-de-natal', documento(nome, pags, CSS_PASSOS + css))

# ---------- 2. Papel de Presente de Natal ----------
def estampa(fundo, icones, sep, cols=7, lins=10, bolha=False, extra=''):
    cel, k = '', 0
    tam = 84 if cols >= 7 else 100
    for l in range(lins):
        for c in range(cols):
            if (l + c) % 2 == 0:
                n = icones[k % len(icones)]; k += 1
                ang = [-14, 10, -6, 16][(l * 3 + c) % 4]
                ic = svg(n, tam)
                if bolha:
                    ic = f'<div style="background:#fff;border-radius:50%;padding:2mm;border:2px solid #1d1d1d">{ic}</div>'
                cel += f'<div style="transform:rotate({ang}deg)">{ic}</div>'
            else:
                cel += f'<div style="color:{sep};font-size:34px">✦</div>'
    return (f'<div style="width:210mm;height:297mm;background:{fundo};{extra};display:grid;grid-template-columns:repeat({cols},1fr);grid-template-rows:repeat({lins},1fr);'
            f'align-items:center;justify-items:center">{cel}</div>')

def papel_presente():
    nome = 'Papel de Presente de Natal'
    pags = [capa('pronto pra imprimir', 'Papel de<br><span class="r">Presente</span>', '6 estampas de Natal em folha A4 inteira, já coloridas',
                 ''.join(svg(n, 90) for n in ['presente', 'bola', 'bengala', 'meia']))]
    pags.append(instrucoes('Como usar', [
        'Imprime em A4 com "tamanho real" (100%) e sem margem, se a tua impressora deixar.',
        'Papel comum de 75 g já embrulha caixinhas e presentes pequenos. Pra presentes maiores, emenda duas ou mais folhas com fita.',
        'Fica lindo também como forro de caixa, capa de caderno, fundo de cartão e embalagem de lembrancinha.',
        'Tem 6 estampas diferentes: vermelha, verde, kraft, azul, listrada de bengala e xadrez.',
        'Imprime a estampa que combina com o presente e amarra com uma fitinha ou barbante.'], nome))
    est = [
        estampa('#d62828', ['arvore', 'presente', 'bola', 'sino'], '#fff'),
        estampa('#1f7a4a', ['noel', 'rena', 'estrela', 'biscoito'], '#ffd23f'),
        estampa('#ecd5a8', ['bengala', 'gorro', 'meia', 'caneca'], '#d62828'),
        estampa('#1d3a6e', ['boneco_neve', 'floco', 'vela', 'luva'], '#fff'),
        estampa('repeating-linear-gradient(45deg,#e63946 0 12mm,#fff 12mm 24mm)', ['pirulito', 'bengala', 'guirlanda', 'caneca'], '#2e9e5b', cols=5, lins=7, bolha=True),
        estampa('#d62828', ['estrela', 'noel', 'arvore', 'presente'], '#fff', cols=5, lins=7, bolha=True,
                extra='background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.38) 0 15mm,transparent 15mm 30mm),repeating-linear-gradient(90deg,rgba(0,0,0,.38) 0 15mm,transparent 15mm 30mm)'),
    ]
    for e in est:
        pags.append(pagina(e, 'cheia', rodape=False))
    return salvar('papel-de-presente-natal', documento(nome, pags, CSS_PASSOS))

# ---------- 3. Marcadores de Página de Natal ----------
FRASES_MARCADOR = ['Hoje é dia de ler e comer panetone', 'Um bom livro e um chocolate quente', 'Ho ho ho! Só mais um capítulo', 'Natal é melhor com livro',
    'Esse livro tá na lista do Papai Noel', 'Boas leituras, boas festas!', 'Leitor do ano', 'Neve lá fora, livro aqui dentro', 'Minha meia tá cheia de livros',
    'Feliz Natal, leitor!', 'Biscoito e capítulo', 'Parei aqui: voltei pra ceia', 'Lê só mais um, o peru pode esperar', 'O melhor presente é uma boa história',
    'Pausa pro chocolate quente', 'Estrela guia da leitura', 'Aqui parei... na sobremesa', 'Esse capítulo vale um presente', 'Ler de pijama é o espírito do Natal',
    'Luz de vela, livro e paz', 'Aqui tem magia de Natal', 'Boas festas e boas páginas', 'Presente bom é livro novo', 'Nunca é tarde pra mais um capítulo']

def marcadores():
    nome = 'Marcadores de Página de Natal'
    css = '''.bms{display:grid;grid-template-columns:repeat(4,43mm);gap:5mm;justify-content:center;margin-top:2mm}
.bm{height:118mm;border:1.5px dashed #555;border-radius:3mm;background:var(--c);padding:3mm;display:flex;flex-direction:column}
.bm .in{flex:1;background:#fff;border-radius:2.5mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:7mm 2mm 3mm;text-align:center;border:2px solid #1d1d1d}
.bm .furo{position:absolute;margin-top:-5.5mm;width:4mm;height:4mm;border-radius:50%;background:#fff;border:1.5px solid #555}
.bm .f{font-size:22px;line-height:1.05;color:#1d1d1d}.bm .a{font-size:13px;color:#888}'''
    pags = [capa('pra quem gosta de ler', 'Marcadores<br>de <span class="r">Página</span>', '24 marcadores de Natal já pintados, pra recortar e usar',
                 ''.join(svg(n, 90) for n in ['caneca', 'vela', 'estrela', 'meia']))]
    pags.append(instrucoes('Como fazer', [
        'Imprime em papel mais grosso (180 g é o ideal) e recorta pela linha tracejada.',
        'Faz um furinho na bolinha de cima e amarra uma fitinha ou barbante.',
        'Pra ficar mais durinho, cola o marcador em papelão fino ou plastifica com fita transparente.',
        'Presenteia quem lê: cada marcador tem uma frase diferente.'], nome))
    for p in range(0, 24, 8):
        cel = ''
        for k in range(p, p + 8):
            cel += (f'<div class="bm" style="--c:{FORTES[k % 6]}"><div class="in"><div class="furo"></div>{svg(TODOS[k % 18], 80)}'
                    f'<div class="f">{FRASES_MARCADOR[k]}</div><div class="a">@Cardeno_Amarelo</div></div></div>')
        pags.append(pagina(f'<div class="bms">{cel}</div>', nome=nome))
    return salvar('marcadores-de-pagina-natal', documento(nome, pags, CSS_PASSOS + css))

# ---------- 4. Kit Ceia de Natal ----------
COMIDAS = ['Peru', 'Chester', 'Pernil', 'Tender', 'Bacalhau', 'Arroz com passas', 'Farofa', 'Salpicão', 'Maionese', 'Salada de frutas', 'Torta de frango', 'Batata gratinada',
           'Rabanada', 'Panetone', 'Chocotone', 'Pavê', 'Pudim', 'Mousse', 'Frutas secas', 'Castanhas', 'Vinho', 'Suco', 'Refrigerante', 'Água', 'Café', 'Chocolate quente']

def kit_ceia():
    nome = 'Kit Ceia de Natal'
    css = CSS_PASSOS + '''.conv{height:123mm;border:3px solid #c1121f;border-radius:6mm;margin-bottom:6mm;padding:7mm 10mm;background:#fff7dd;position:relative;font-size:30px;line-height:1.5;
background-image:radial-gradient(#2e9e5b 1.2mm,transparent 1.4mm);background-size:9mm 9mm;background-position:2mm 2mm;background-clip:border-box}
.conv .miolo{position:absolute;inset:6mm;background:#fff7dd;border-radius:4mm;padding:5mm 9mm;border:2px dashed #c1121f}
.conv h2{font-size:48px;color:#c1121f;line-height:1;margin-bottom:2mm}.conv .l{display:inline-block;border-bottom:1.5px solid #1d1d1d;min-width:55mm}
.menu{margin-top:4mm}.menu .sec{margin-bottom:5mm}.menu .sec h3{font-size:34px;color:#fff;padding:0 6mm;border-radius:3mm;display:inline-block;margin-bottom:1mm}
.menu .linha{border-bottom:1.5px solid #bbb;height:9.5mm}
.lugares{display:grid;grid-template-columns:repeat(2,86mm);grid-auto-rows:62mm;justify-content:center;gap:3mm 6mm}
.lugares>div{border:1.5px solid #555;display:flex;flex-direction:column;border-radius:3mm;overflow:hidden}
.lugares>div>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:24px;background:var(--c)}
.lugares>div>div:first-child{transform:rotate(180deg);border-bottom:1.5px dashed #555}
.plq{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:40mm;gap:3mm}
.plq>div{border:1.5px dashed #555;border-radius:3mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:27px;line-height:1;background:var(--c)}
.plq small{font-size:14px;color:#555;margin-top:1mm}
table.q{width:100%;border-collapse:collapse;margin-top:4mm;font-size:26px}table.q th{background:#2e9e5b;color:#fff;height:12mm;font-weight:normal}table.q td{border:1.5px solid #1d1d1d;height:13mm}
table.q tr:nth-child(even) td{background:#fff7dd}
.compras{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:4mm}.compras>div{border:2.5px solid var(--c);border-radius:4mm;padding:3mm 5mm;font-size:24px;line-height:1.55}
.compras b{background:var(--c);color:#fff;padding:0 4mm;border-radius:3mm;font-weight:normal}'''
    pags = [capa('pra ceia perfeita', 'Kit Ceia<br>de <span class="r">Natal</span>', 'Convite, cardápio, marcadores de lugar, plaquinhas e listas, tudo pintado',
                 ''.join(svg(n, 90) for n in ['guirlanda', 'vela', 'caneca', 'biscoito']))]
    pags.append(instrucoes('Como usar o kit', [
        'Convites: recorta ao meio e preenche o dia, a hora, o local e o que cada um leva. Dá pra mandar foto pelo WhatsApp também.',
        'Cardápio: preenche e deixa na mesa ou cola na porta da cozinha.',
        'Marcadores de lugar: recorta e dobra no tracejado. Escreve o nome na frente e na parte de cima fica pra quem está do outro lado.',
        'Plaquinhas: recorta e coloca na frente de cada prato, assim todo mundo sabe o que é (e quem tem restrição sabe o que pode comer).',
        'Quem leva o quê e Lista de compras: pra ninguém esquecer o gelo (nem o panetone).'], nome))
    for _ in range(1):
        conv = ''
        for k in range(2):
            conv += ('<div class="conv"><div class="miolo"><h2>Você é nosso convidado! 🎄</h2>Ceia de Natal na casa de <span class="l"></span><br>'
                     'Dia <span class="l" style="min-width:30mm"></span> às <span class="l" style="min-width:22mm"></span><br>Endereço: <span class="l" style="min-width:90mm"></span><br>'
                     f'Leve: <span class="l" style="min-width:90mm"></span><div style="position:absolute;right:8mm;bottom:3mm">{svg(["arvore", "noel"][k], 62)}</div></div></div>')
        pags.append(pagina(conv, nome=nome))
    sec = [('Entradas', '#2e9e5b'), ('Prato principal', '#c1121f'), ('Acompanhamentos', '#e76f51'), ('Sobremesas', '#7b2cbf'), ('Bebidas', '#2a78c4')]
    menu = ''.join(f'<div class="sec"><h3 style="background:{c}">{t}</h3><div class="linha"></div><div class="linha"></div></div>' for t, c in sec)
    pags.append(pagina(f'<div class="tit">Cardápio da <span class="m">nossa ceia</span></div><div class="menu">{menu}</div>', nome=nome))
    for p in range(2):
        cel = ''.join(f'<div style="--c:{PASTEIS[(p * 8 + k) % 6]}"><div>{svg(TODOS[(p * 8 + k) % 18], 34)}Lugar de: ________</div><div>{svg(TODOS[(p * 8 + k) % 18], 34)}Lugar de: ________</div></div>' for k in range(8))
        pags.append(pagina(f'<div class="tit" style="font-size:34px;margin-bottom:3mm">Marcadores de <span class="m">lugar</span></div><div class="lugares">{cel}</div>', nome=nome))
    nomes = COMIDAS + [''] * 10
    for p in range(0, 36, 18):
        cel = ''
        for k in range(p, p + 18):
            t = nomes[k] if k < len(nomes) else ''
            cel += (f'<div style="--c:{PASTEIS[k % 6]}">{svg(TODOS[k % 18], 44)}<br>{t or "_______________"}<small>☐ vegano &nbsp;☐ sem glúten</small></div>')
        pags.append(pagina(f'<div class="tit" style="font-size:34px;margin-bottom:3mm">Plaquinhas dos <span class="m">pratos</span></div><div class="plq">{cel}</div>', nome=nome))
    linhas = ''.join('<tr><td></td><td></td><td></td></tr>' for _ in range(13))
    pags.append(pagina(f'<div class="tit">Quem leva <span class="m">o quê</span></div><table class="q"><tr><th>Prato ou bebida</th><th>Quem leva</th><th>Pra quantos</th></tr>{linhas}</table>', nome=nome))
    comp = [('Carnes e peixes', '#c1121f'), ('Hortifrúti', '#2e9e5b'), ('Mercearia', '#e76f51'), ('Bebidas e gelo', '#2a78c4'), ('Doces e sobremesas', '#7b2cbf'), ('Descartáveis e decoração', '#f4a300')]
    bloco = ''.join(f'<div style="--c:{c}"><b>{t}</b>' + ''.join('<br>☐ ____________________' for _ in range(5)) + '</div>' for t, c in comp)
    pags.append(pagina(f'<div class="tit">Lista de <span class="m">compras</span></div><div class="compras">{bloco}</div>', nome=nome))
    return salvar('kit-ceia-de-natal', documento(nome, pags, css))

# ---------- 5. Vales de Natal ----------
VALES = ['um abraço apertado', 'uma noite de filme (tu escolhe)', 'um café da manhã na cama', 'uma massagem nos pés', 'escolher a música do carro', 'um dia sem lavar a louça',
         'uma sobremesa só pra ti', 'um passeio juntos', 'um bilhete de carinho', 'uma partida de jogo de tabuleiro', 'dormir até mais tarde', 'uma noite sem reclamar',
         'um pedido sem perguntar o porquê', 'uma foto de família', 'ouvir uma história', 'uma pizza do teu jeito', 'ficar com o controle da TV', 'uma tarde sem horário',
         'um elogio sincero', 'escolher o filme', 'um chocolate quente', 'arrumar a mesa da ceia por ti', 'um abraço em quem tu quiser', 'um "sim" (só um!)']

def vales():
    nome = 'Vales de Natal'
    css = '''.vs{display:grid;grid-template-columns:repeat(2,88mm);grid-auto-rows:49mm;gap:3mm 4mm;justify-content:center;margin-top:2mm}
.vale{position:relative;border:1.5px dashed #555;border-radius:3mm;display:flex;align-items:center;gap:3mm;padding:0 6mm;
background:radial-gradient(circle at 0 50%,#fff 0 3.2mm,transparent 3.3mm),radial-gradient(circle at 100% 50%,#fff 0 3.2mm,transparent 3.3mm),var(--c);
background-repeat:no-repeat}
.vale .ic2{width:25mm;height:25mm;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #1d1d1d;flex:none}
.vale .tx{flex:1;text-align:center;color:#1d1d1d;font-size:25px;line-height:1.05}.vale .tx b{display:block;font-size:42px;color:#c1121f;letter-spacing:1px;line-height:1}
.vale .tx small{display:block;font-size:15px;color:#555;margin-top:1mm}'''
    pags = [capa('de presente pra quem tu ama', 'Vales de<br><span class="r">Natal</span>', '30 vales de carinho já pintados: dá pra dar de presente e a pessoa resgata',
                 ''.join(svg(n, 90) for n in ['presente', 'meia', 'estrela', 'biscoito']))]
    pags.append(instrucoes('Como usar', [
        'Imprime, recorta pelo tracejado e escolhe os vales que combinam com a pessoa.',
        'Coloca num envelope, numa meia, num potinho ou amarra com fita: vira um presente bem fofo (e baratinho!).',
        'Cada vale tem uma validade pra preencher. Combine antes se pode usar mais de um por dia.',
        'Tem 6 vales em branco no final pra tu inventar os teus.'], nome))
    todos = [(v, False) for v in VALES] + [('________________', True)] * 6
    for p in range(0, 30, 10):
        cel = ''
        for k in range(p, p + 10):
            t, _ = todos[k]
            cel += (f'<div class="vale" style="--c:{PASTEIS[k % 6]}"><div class="ic2">{svg(TODOS[k % 18], 70)}</div>'
                    f'<div class="tx"><b>VALE</b>{t}<small>válido até ___/___</small></div></div>')
        pags.append(pagina(f'<div class="vs">{cel}</div>', nome=nome))
    return salvar('vales-de-natal', documento(nome, pags, CSS_PASSOS + css))

# ---------- 6. Dominó de Natal ----------
def domino():
    nome = 'Dominó de Natal'
    figs = ['arvore', 'noel', 'rena', 'presente', 'boneco_neve', 'sino', 'estrela']
    pecas = [(a, b) for a in range(7) for b in range(a, 7)]  # 28 peças
    css = '''.dm{display:grid;grid-template-columns:repeat(5,35mm);grid-auto-rows:73mm;gap:3mm 3.5mm;justify-content:center;margin-top:3mm}
.dom{border:2px dashed #555;border-radius:3mm;display:grid;grid-template-rows:1fr 1fr;overflow:hidden;background:#fff}
.dom>div{display:flex;align-items:center;justify-content:center;background:var(--c)}.dom>div+div{border-top:3px solid #1d1d1d}'''
    pags = [capa('jogo pra imprimir', 'Dominó<br>de <span class="r">Natal</span>', '28 peças pintadas com desenhos de Natal, pra toda a família',
                 ''.join(svg(n, 90) for n in ['noel', 'rena', 'arvore', 'boneco_neve']))]
    pags.append(instrucoes('Como jogar', [
        'Imprime as peças (papel mais grosso ou cola em papelão) e recorta pelo tracejado.',
        'Embaralha com as figuras pra baixo e cada jogador pega 7 peças (em 2 jogadores, sobram 14 pra comprar; com 4 jogadores não sobra nada).',
        'Quem tiver a peça de dois Papais Noéis (dobrada) começa. Se ninguém tiver, começa quem tiver a peça dobrada mais alta da lista.',
        'Na tua vez, encaixa uma peça que combine com a figura de uma das pontas. Não tem? Compra do monte, ou passa a vez.',
        'Ganha quem ficar sem peças primeiro. Se o jogo travar, ganha quem tiver menos peças.',
        'Figuras do jogo: árvore, Papai Noel, rena, presente, boneco de neve, sino e estrela.'], nome))
    cor = [PASTEIS[i % 6] for i in range(7)]
    for p in range(0, 28, 15):
        cel = ''.join(f'<div class="dom"><div style="--c:{cor[a]}">{svg(figs[a], 78)}</div><div style="--c:{cor[b]}">{svg(figs[b], 78)}</div></div>' for a, b in pecas[p:p + 15])
        pags.append(pagina(f'<div class="dm">{cel}</div>', nome=nome))
    return salvar('domino-de-natal', documento(nome, pags, CSS_PASSOS + css))

# ---------- 7. Trilha de Natal (jogo de tabuleiro) ----------
ESPECIAIS = {}
for n in (4, 11, 17, 23, 30, 36): ESPECIAIS[n] = ('Avança 2', '#2e9e5b', 'estrela')
for n in (7, 14, 20, 27, 33, 39): ESPECIAIS[n] = ('Volta 2', '#e63946', 'luva')
for n in (9, 25, 34): ESPECIAIS[n] = ('Joga de novo', '#f4a300', 'presente')
for n in (13, 29): ESPECIAIS[n] = ('Perde a vez', '#2a78c4', 'floco')
for n in (6, 16, 22, 31, 38): ESPECIAIS[n] = ('Carta surpresa', '#7b2cbf', 'sino')
ESPECIAIS[41] = ('Grinch! Volta pra casa 35', '#1f7a4a', 'guirlanda')
SURPRESAS = ['Canta um pedacinho de uma música de Natal e avança 1 casa.', 'Faz o barulho de uma rena e joga de novo.', 'Dá um abraço em alguém e avança 3 casas.',
 'Conta o que tu quer ganhar de presente. Se alguém rir, volta 1 casa.', 'Imita o Papai Noel: "ho ho ho!" e avança 2 casas.', 'Escolhe um jogador pra voltar 2 casas.',
 'Troca de lugar com o jogador que está na frente de ti.', 'Fala 3 coisas de Natal que começam com a letra P e avança 2 casas.', 'Todo mundo avança 1 casa, menos tu.',
 'Dança por 10 segundos e joga de novo.', 'Fala o nome de 3 renas do Papai Noel ou perde a vez.', 'Elogia o jogador à tua direita e avança 2 casas.',
 'Faz uma pose de boneco de neve por 5 segundos e avança 1 casa.', 'Nevou! Todo mundo volta 1 casa.', 'Ganhaste um panetone: avança até o próximo "Avança 2".',
 'Pede uma dica de presente pra alguém e avança 2 casas.']

def trilha():
    nome = 'Trilha de Natal'
    C, L = 6, 7
    ordem = {}
    for r in range(L):  # r = 0 é a linha de baixo
        cols = range(C) if r % 2 == 0 else range(C - 1, -1, -1)
        for k, c in enumerate(cols):
            ordem[(r, c)] = r * C + k + 1
    css = CSS_PASSOS + '''.tab{display:grid;grid-template-columns:repeat(6,30mm);grid-auto-rows:30mm;justify-content:center;border:3px solid #1d1d1d;width:186mm;margin:3mm auto 0;border-radius:3mm;overflow:hidden}
.tab>div{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:17px;line-height:1;border:1px solid #1d1d1d}
.tab .n{position:absolute;left:1.5mm;top:0.5mm;font-size:22px}.tab .sa{position:absolute;right:1.5mm;bottom:0;font-size:22px;opacity:.55}
.leg{display:flex;flex-wrap:wrap;gap:2mm 6mm;justify-content:center;font-size:21px;margin-top:4mm}.leg span{display:flex;align-items:center;gap:2mm}.leg i{width:7mm;height:7mm;border:1.5px solid #1d1d1d;border-radius:1.5mm;display:inline-block}
.cartas{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:57mm;gap:4mm;margin-top:3mm}
.cartas>div{border:1.5px dashed #555;border-radius:4mm;background:#efe2fb;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4mm 8mm;font-size:26px;line-height:1.1}
.cartas b{font-size:30px;color:#7b2cbf;margin-bottom:1mm}
.peoes{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.peoes>div{border:1.5px solid #1d1d1d;height:62mm;display:flex;flex-direction:column;border-radius:2mm;overflow:hidden}
.peoes>div>div{flex:1;display:flex;align-items:center;justify-content:center;background:var(--c)}.peoes>div>div:first-child{transform:rotate(180deg);border-bottom:1.5px dashed #1d1d1d}'''
    cel = ''
    for r in range(L - 1, -1, -1):
        for c in range(C):
            n = ordem[(r, c)]
            seta = '' if n == C * L else ('<span class="sa">↑</span>' if (n % C == 0) else ('<span class="sa">→</span>' if r % 2 == 0 else '<span class="sa">←</span>'))
            if n == 1:
                cel += f'<div style="background:#ffd23f"><span class="n">1</span>{svg("noel", 46)}<b style="font-size:18px">LARGADA</b>{seta}</div>'
            elif n == C * L:
                cel += f'<div style="background:linear-gradient(#ffd23f,#ffb703)"><span class="n">{n}</span>{svg("estrela", 46)}<b style="font-size:17px">CASA DO PAPAI NOEL</b></div>'
            elif n in ESPECIAIS:
                t, cor, ic = ESPECIAIS[n]
                cel += f'<div style="background:{cor};color:#fff"><span class="n" style="color:#fff">{n}</span><div style="background:#fff;border-radius:50%;padding:.8mm;margin-bottom:.8mm">{svg(ic, 33)}</div>{t}{seta}</div>'
            else:
                cel += f'<div style="background:{PASTEIS[(n * 2) % 6]}"><span class="n">{n}</span>{svg(TODOS[n % 18], 40)}{seta}</div>'
    leg = ''.join(f'<span><i style="background:{c}"></i>{t}</span>' for t, c in [('Avança 2', '#2e9e5b'), ('Volta 2', '#e63946'), ('Joga de novo', '#f4a300'), ('Perde a vez', '#2a78c4'), ('Carta surpresa', '#7b2cbf')])
    pags = [capa('jogo de tabuleiro', 'Trilha de<br><span class="r">Natal</span>', 'Tabuleiro, dado, peões e cartas surpresa: tudo pronto e pintado',
                 ''.join(svg(n, 90) for n in ['noel', 'rena', 'presente', 'estrela']))]
    pags.append(instrucoes('Como jogar', [
        'Pra 2 a 6 jogadores. Imprime o tabuleiro, as cartas surpresa, os peões e o dado.',
        'Recorta os peões e dobra no tracejado, assim eles ficam em pé. Monta o dado dobrando nas linhas e colando as abas.',
        'Todo mundo começa na casa 1 (Largada). Joga o dado e anda o número de casas.',
        'Cada cor tem uma regra: verde avança 2, vermelha volta 2, dourada joga de novo, azul perde a vez e roxa é uma carta surpresa.',
        'Quem chegar primeiro na Casa do Papai Noel (casa 42) ganha. Passou do número? Vale também!',
        'Cuidado com o Grinch na casa 41!'], nome))
    pags.append(pagina(f'<div class="tit" style="font-size:36px">Trilha de <span class="m">Natal</span> · tabuleiro</div><div class="tab">{cel}</div><div class="leg">{leg}</div>', nome=nome))
    # peões + dado
    peoes = ''.join(f'<div><div style="--c:{PASTEIS[i % 6]}">{svg(n, 90)}</div><div style="--c:{PASTEIS[i % 6]}">{svg(n, 90)}</div></div>' for i, n in enumerate(['noel', 'rena', 'boneco_neve', 'biscoito', 'estrela', 'pirulito']))
    u = 24
    def face(cx, cy, num, cor):
        pts = {1: [(.5, .5)], 2: [(.25, .25), (.75, .75)], 3: [(.25, .25), (.5, .5), (.75, .75)], 4: [(.25, .25), (.75, .25), (.25, .75), (.75, .75)],
               5: [(.25, .25), (.75, .25), (.5, .5), (.25, .75), (.75, .75)], 6: [(.25, .22), (.75, .22), (.25, .5), (.75, .5), (.25, .78), (.75, .78)]}[num]
        d = ''.join(f'<circle cx="{(cx + x) * u:.1f}" cy="{(cy + y) * u:.1f}" r="2.6" fill="#1d1d1d"/>' for x, y in pts)
        return f'<rect x="{cx * u}" y="{cy * u}" width="{u}" height="{u}" fill="{cor}" stroke="#555" stroke-width=".5" stroke-dasharray="1.5 1"/>{d}'
    tabs = ''
    for (cx, cy, lados) in [(0, 1, 'tb'), (2, 1, 'tb'), (3, 1, 'tbr'), (1, 0, 'lr'), (1, 2, 'lr')]:
        x, y = cx * u, cy * u
        for l in lados:
            pts = {'t': f'{x + 3},{y} {x + u - 3},{y} {x + u - 6},{y - 6} {x + 6},{y - 6}', 'b': f'{x + 3},{y + u} {x + u - 3},{y + u} {x + u - 6},{y + u + 6} {x + 6},{y + u + 6}',
                   'l': f'{x},{y + 3} {x},{y + u - 3} {x - 6},{y + u - 6} {x - 6},{y + 6}', 'r': f'{x + u},{y + 3} {x + u},{y + u - 3} {x + u + 6},{y + u - 6} {x + u + 6},{y + 6}'}[l]
            tabs += f'<polygon points="{pts}" fill="#e9e9e9" stroke="#555" stroke-width=".5"/>'
    dado = (f'<svg viewBox="-8 -8 {4 * u + 16} {3 * u + 16}" style="width:{(4 * u + 16) * 1.1}mm;display:block;margin:4mm auto 0">{tabs}'
            + face(0, 1, 3, '#ffe1e1') + face(1, 1, 1, '#def3dc') + face(2, 1, 4, '#fff2bf') + face(3, 1, 6, '#dcefff') + face(1, 0, 2, '#efe2fb') + face(1, 2, 5, '#ffe8d2') + '</svg>')
    pags.append(pagina(f'<div class="tit" style="font-size:36px">Os <span class="m">peões</span></div><div class="sub">Recorta o retângulo e dobra no tracejado: o peão fica em pé.</div><div class="peoes">{peoes}</div>'
                       f'<div class="tit" style="font-size:36px;margin-top:6mm">O <span class="m">dado</span></div><div class="sub">Recorta, dobra todas as linhas e cola as abas.</div>{dado}', nome=nome))
    for p in range(0, 16, 8):
        cel = ''.join(f'<div><b>Surpresa!</b>{t}</div>' for t in SURPRESAS[p:p + 8])
        pags.append(pagina(f'<div class="tit" style="font-size:36px">Cartas <span class="m">surpresa</span></div><div class="cartas">{cel}</div>', nome=nome))
    return salvar('trilha-de-natal', documento(nome, pags, css))

# ---------- 8. Adesivos de Natal ----------
def adesivos():
    nome = 'Adesivos de Natal'
    css = '''.ad{display:flex;flex-wrap:wrap;justify-content:center;align-content:flex-start;gap:var(--g)}
.ad>div{width:var(--s);height:var(--s);border-radius:50%;border:2px dashed #555;display:flex;align-items:center;justify-content:center;background:var(--c)}
.rot{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm 6mm;margin-top:3mm}
.rot>div{height:21mm;border-radius:11mm;border:2px dashed #555;display:flex;align-items:center;justify-content:center;font-size:36px;color:#fff;background:var(--c);text-shadow:1px 1px 0 rgba(0,0,0,.25)}
.rot>div.cl{color:#1d1d1d;text-shadow:none}'''
    pags = [capa('pra imprimir em papel adesivo', 'Adesivos<br>de <span class="r">Natal</span>', '4 folhas de adesivos coloridos: redondos e etiquetas de frase',
                 ''.join(svg(n, 90) for n in ['estrela', 'boneco_neve', 'bengala', 'biscoito']))]
    pags.append(instrucoes('Como usar', [
        'Imprime em papel adesivo A4 (vende em papelaria, branco fosco ou brilho). Papel comum e cola também funcionam.',
        'Recorta cada adesivo pela linha tracejada (dá pra deixar uma borda branca fofa).',
        'Cola em cartões, presentes, cadernos, agenda, garrafinha e caixas.',
        'Uma folha tem adesivos grandes, outra médios, outra pequenininhos, outra etiquetas de frase.'], nome))
    def folha(titulo, tam, gap, n):
        cel = ''.join(f'<div style="--c:{PASTEIS[k % 6]}">{svg(TODOS[k % 18], int(tam * 3.4))}</div>' for k in range(n))
        return pagina(f'<div class="tit" style="font-size:34px;margin-bottom:3mm">{titulo}</div><div class="ad" style="--s:{tam}mm;--g:{gap}mm">{cel}</div>', nome=nome)
    pags.append(folha('Adesivos <span class="m">grandes</span>', 52, 6, 12))
    pags.append(folha('Adesivos <span class="m">médios</span>', 32, 5, 30))
    pags.append(folha('Adesivos <span class="m">pequeninhos</span>', 21, 3.5, 54))
    frases = ['Feliz Natal!', 'Ho ho ho!', 'Não abre antes!', 'Pra você', 'Com carinho', 'Boas festas!', 'De: ____', 'Para: ____', 'Presente do Noel', 'Joia rara',
              'Frágil!', 'Eu amo o Natal', 'Lista do Noel', 'Fui bonzinho', 'Surpresa!', 'Feito à mão', 'Natal fofo', 'Abra com amor', 'Ceia da família', 'Paz e amor']
    rot = ''.join(f'<div class="{"cl" if FORTES[k % 6] == "#f4a300" else ""}" style="--c:{FORTES[k % 6]}">{t}</div>' for k, t in enumerate(frases))
    pags.append(pagina(f'<div class="tit" style="font-size:34px">Etiquetas de <span class="m">frase</span></div><div class="rot">{rot}</div>', nome=nome))
    return salvar('adesivos-de-natal', documento(nome, pags, CSS_PASSOS + css))

if __name__ == '__main__':
    for f in (bandeirinhas, papel_presente, marcadores, kit_ceia, vales, domino, trilha, adesivos):
        print(f())
