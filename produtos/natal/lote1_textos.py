"""Lote 1 de Natal, produtos de texto e montagem: advento, amigo secreto, quiz, caça ao presente, retrospectiva e casinha 3D."""
import math
from base import documento, pagina, capa, salvar
from icones import ICONES, NOMES, svg

TODOS = list(ICONES)
CSS_PASSOS = '.passos{font-size:30px;line-height:1.3;margin:26px 0 0 34px}.passos li{margin-bottom:12px}'
CARTOES = '''.cg{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:62mm;margin-top:3mm}
.ct{border:1.5px dashed #999;padding:5mm 6mm;position:relative;display:flex;flex-direction:column}
.ct .n{font-size:40px;line-height:1}.ct .t{font-size:25px;line-height:1.15;margin-top:2mm}
.ct svg{position:absolute;right:4mm;bottom:3mm}'''

def instrucoes(titulo, itens, nome):
    return pagina(f'<div class="tit">{titulo}</div><ol class="passos">{"".join(f"<li>{i}</li>" for i in itens)}</ol>', nome=nome)

def cartoes(lista, nome, por_pag=8, icone=True):
    pags = []
    for i in range(0, len(lista), por_pag):
        cel = ''
        for k, (num, txt) in enumerate(lista[i:i + por_pag]):
            ic = svg(TODOS[(i + k) % 18], 52) if icone else ''
            cel += f'<div class="ct"><div class="n">{num}</div><div class="t">{txt}</div>{ic}</div>'
        pags.append(pagina(f'<div class="cg">{cel}</div>', nome=nome))
    return pags

# ---------- Calendário do Advento de Desafios ----------
DESAFIOS = [
    'Monta (ou ajuda a montar) a árvore de Natal e tira uma foto de todo mundo junto.',
    'Escreve um bilhete fofo e esconde na mochila ou na bolsa de alguém da casa.',
    'Faz um desenho de Natal e cola na porta da geladeira.',
    'Assiste um filme de Natal com a família, com pipoca.',
    'Liga ou manda áudio pra um parente que tu não fala faz tempo.',
    'Dia sem reclamar! Cada reclamação vale uma flexão.',
    'Separa um brinquedo, roupa ou livro que tu não usa mais pra doar.',
    'Faz um cartão de Natal pra um professor ou vizinho.',
    'Desafio da mímica: imita 3 filmes de Natal sem falar nada.',
    'Ajuda a fazer o jantar hoje (nem que seja só arrumar a mesa).',
    'Monta uma playlist de Natal com a família, cada um escolhe 2 músicas.',
    'Faz um enfeite de papel e pendura na árvore.',
    'Elogia 5 pessoas hoje. Valendo!',
    'Noite de jogos: cartas, tabuleiro ou adedonha.',
    'Escreve 3 coisas boas que aconteceram contigo esse ano.',
    'Faz um chocolate quente (com ajuda de um adulto) e serve pra alguém.',
    'Desafio do sorriso: tira uma selfie em família com a cara mais engraçada.',
    'Arruma o teu quarto como se o Papai Noel fosse dormir nele.',
    'Ensina uma brincadeira de quando tu era pequeno pra alguém.',
    'Escreve a carta pro Papai Noel (ou pro amigo secreto).',
    'Canta uma música de Natal bem alto. Bônus se for no chuveiro.',
    'Prepara uma surpresa pra quem cozinha a ceia.',
    'Pergunta pros mais velhos como era o Natal quando eles eram crianças.',
    'Véspera! Abraça todo mundo da casa e fala o que tu mais gosta em cada um.',
]

def advento():
    nome = 'Calendário do Advento de Desafios'
    css = CSS_PASSOS + CARTOES + '''.cal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:34mm;gap:3mm;margin-top:6mm}
.cal div{border:2.5px solid #1d1d1d;border-radius:4mm;display:flex;align-items:center;justify-content:center;font-size:52px;position:relative}
.cal div svg{position:absolute;right:2mm;bottom:2mm}'''
    pags = [capa('24 dias até o Natal', 'Calendário<br>do <span class="r">Advento</span>', '24 desafios, um por dia, de 1 a 24 de dezembro',
                 ''.join(svg(n, 90) for n in ['vela', 'estrela', 'presente', 'arvore']))]
    pags.append(instrucoes('Como usar', [
        'Imprime as páginas de cartões e recorta na linha tracejada.',
        'Dobra cada cartão e coloca num envelopinho, saquinho ou meia, com o número por fora.',
        'Pendura num varal ou cola na parede. Ou só guarda numa caixa.',
        'Todo dia, de 1 a 24 de dezembro, alguém abre o cartão do dia e a família faz o desafio.',
        'Vai pintando o número do dia no quadro da próxima página pra acompanhar.',
        'Tem cartões em branco no fim pra vocês inventarem desafios próprios.'], nome))
    quad = ''.join(f'<div>{d}{svg(TODOS[d % 18], 34)}</div>' for d in range(1, 25))
    pags.append(pagina(f'<div class="tit">Meu <span class="m">quadro</span> do advento</div><div class="sub">Pinta o número quando cumprir o desafio do dia</div><div class="cal">{quad}</div>', nome=nome))
    pags += cartoes([(f'Dia {i + 1}', t) for i, t in enumerate(DESAFIOS)], nome)
    pags += cartoes([('Dia ___', 'Desafio inventado: _______________________________<br>______________________________________')] * 8, nome)
    return salvar('calendario-advento-desafios', documento(nome, pags, css))

# ---------- Kit Amigo Secreto ----------
def amigo_secreto():
    nome = 'Kit Amigo Secreto'
    css = CSS_PASSOS + '''.papeis{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:34mm;margin-top:4mm}
.papeis>div{border:1.5px dashed #999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:24px}
.papeis .linha{width:80%;border-bottom:2px solid #1d1d1d;height:9mm}
.lista{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:125mm;margin-top:4mm}
.lista>div{border:1.5px dashed #999;padding:6mm;font-size:26px;line-height:1.35}
.lista .l{border-bottom:1.5px solid #bbb;height:11mm}
.carta{border:3px solid #1d1d1d;border-radius:8mm;height:228mm;margin-top:6mm;padding:10mm;font-size:32px;line-height:1.9;
background-image:repeating-linear-gradient(transparent 0 15mm,#cfdbee 15mm 15.5mm);background-position:0 26mm}'''
    pags = [capa('pra família e amigos', 'Kit <span class="r">Amigo</span><br>Secreto', 'Sorteio, lista de desejos, cartinha e regras divertidas',
                 ''.join(svg(n, 90) for n in ['presente', 'gorro', 'meia', 'estrela']))]
    pags.append(instrucoes('Regras da casa (pode mudar!)', [
        'Escreve o nome de cada pessoa num papelzinho, dobra e coloca num gorro, pote ou caneca.',
        'Cada um tira um papel. Se tirar o próprio nome, devolve e tira de novo.',
        'Combinem o valor do presente antes. Ex.: até R$ 30, ou "só presente feito à mão".',
        'Cada um preenche a lista de desejos e entrega pro organizador, que passa pra quem tirou.',
        'Na revelação, quem vai entregar dá 3 dicas do amigo antes de falar o nome.',
        'Variação divertida: amigo da onça, com presente engraçado e barato.'], nome))
    papeis = ''.join(f'<div>{svg(TODOS[i % 18], 40)}<div class="linha"></div></div>' for i in range(24))
    pags.append(pagina(f'<div class="tit">Papeizinhos do <span class="m">sorteio</span></div><div class="papeis">{papeis}</div>', nome=nome))
    um = ('<div><b>Lista de desejos de:</b> ____________<br>Meu tamanho de roupa: ______<br>Minha cor favorita: ______<br>Eu gosto de:'
          + '<div class="l"></div>' * 3 + 'Eu NÃO quero ganhar:<div class="l"></div></div>')
    pags.append(pagina(f'<div class="tit">Lista de <span class="m">desejos</span></div><div class="lista">{um * 4}</div>', nome=nome))
    pags.append(pagina('<div class="tit">Cartinha pro meu <span class="m">amigo secreto</span></div><div class="carta">Querido(a) ____________________,<br><br><br><br><br><br><br>Com carinho, teu amigo secreto 🎁</div>', nome=nome))
    dicas = [('Dica 1', 'Meu amigo secreto gosta muito de...'), ('Dica 2', 'Meu amigo secreto sempre fala...'),
             ('Dica 3', 'Meu amigo secreto não vive sem...'), ('Dica 4', 'Uma vez meu amigo secreto...'),
             ('Dica 5', 'Se meu amigo secreto fosse um bicho, seria...'), ('Dica 6', 'A comida favorita dele(a) é...'),
             ('Dica 7', 'Meu amigo secreto é a pessoa mais ___ da família'), ('Dica 8', 'Meu amigo secreto tá usando...')]
    pags += cartoes(dicas, nome)
    return salvar('kit-amigo-secreto', documento(nome, pags, css))

# ---------- Quiz de Natal ----------
PERGUNTAS = [
    ('Em que dia se comemora o Natal?', '25 de dezembro'),
    ('Qual é a cor tradicional da roupa do Papai Noel?', 'Vermelha (com branco)'),
    ('Na história clássica, quantas renas puxam o trenó, sem contar o Rudolph?', '8'),
    ('Qual rena tem o nariz vermelho?', 'Rudolph'),
    ('Segundo a tradição, onde mora o Papai Noel?', 'No Polo Norte'),
    ('Segundo a Bíblia, em que cidade Jesus nasceu?', 'Belém'),
    ('Quais presentes os Reis Magos levaram?', 'Ouro, incenso e mirra'),
    ('Em que dia é o Dia de Reis?', '6 de janeiro'),
    ('Qual pão doce italiano é a cara do Natal no Brasil?', 'Panetone'),
    ('Como se chama o panetone com gotas de chocolate no lugar das frutas?', 'Chocotone'),
    ('Qual planta de folhas vermelhas é chamada de "flor de Natal"?', 'Bico-de-papagaio (poinsétia)'),
    ('No Brasil, em que mês começa o verão?', 'Dezembro'),
    ('A música "Noite Feliz" foi escrita originalmente em que língua?', 'Alemão'),
    ('Qual ave é tradicional na ceia de Natal brasileira?', 'Peru'),
    ('Como se diz "Feliz Natal" em inglês?', 'Merry Christmas'),
    ('E em espanhol?', 'Feliz Navidad'),
    ('E em francês?', 'Joyeux Noël'),
    ('E em italiano?', 'Buon Natale'),
    ('O que se pendura na lareira pra ganhar presente?', 'Uma meia'),
    ('Qual é o nome do boneco de neve do filme Frozen?', 'Olaf'),
    ('Quem é o personagem verde que odeia o Natal?', 'O Grinch'),
    ('No filme "Esqueceram de Mim", qual é o nome do menino?', 'Kevin'),
    ('Quais são as cores da bengala doce de Natal?', 'Vermelho e branco'),
    ('Na tradição, por onde o Papai Noel entra nas casas?', 'Pela chaminé'),
    ('Que dia é a véspera de Natal?', '24 de dezembro'),
    ('Como se chama a estrela que guiou os Reis Magos?', 'Estrela de Belém'),
    ('Em Minas Gerais, muita gente chama o amigo secreto de quê?', 'Amigo oculto'),
    ('Qual é a risada famosa do Papai Noel?', 'Ho ho ho!'),
    ('Quantas janelinhas tem um calendário do advento tradicional?', '24'),
    ('O que os enfeites redondos da árvore de Natal são chamados no Brasil?', 'Bolas (ou bolinhas) de Natal'),
]
QUEM = [
    'dormir antes da meia-noite', 'comer o último pedaço de panetone escondido', 'chorar abrindo presente',
    'esquecer de comprar o presente do amigo secreto', 'tirar o próprio nome no sorteio e não falar nada',
    'fazer a piada do pavê ("é pavê ou pacomê?")', 'repetir o prato três vezes', 'ficar no celular durante a ceia',
    'cantar mais alto as músicas de Natal', 'chegar atrasado na ceia', 'dar o presente mais criativo',
    'acordar todo mundo cedo no dia 25', 'ser o Papai Noel da família', 'derrubar alguma coisa na mesa',
    'tirar foto de tudo', 'contar a mesma história de todo ano', 'abrir o presente antes da hora',
    'dançar sozinho na sala', 'ganhar meia de presente', 'falar que a comida tá sem sal',
    'pedir pra trocar o presente', 'fazer o melhor prato da ceia', 'dormir no sofá depois da ceia',
    'dar presente comprado no dia 24', 'esconder doce pra comer depois', 'chorar no filme de Natal',
    'perguntar "e as namoradinhas?"', 'ficar com a melhor sobremesa', 'montar a árvore torta', 'ganhar o quiz',
]

def quiz():
    nome = 'Quiz de Natal'
    css = CSS_PASSOS + CARTOES + '.gab{font-size:24px;line-height:1.45;columns:2;column-gap:10mm;margin-top:5mm}'
    pags = [capa('jogo pra ceia', 'Quiz de<br><span class="r">Natal</span>', '30 perguntas de conhecimento + 30 de "quem da família é mais provável"',
                 ''.join(svg(n, 90) for n in ['noel', 'bengala', 'rena', 'caneca']))]
    pags.append(instrucoes('Como jogar', [
        'Imprime e recorta os cartões. Separa as perguntas (com número) das de "quem é mais provável".',
        'Divide a família em dois times, ou joga cada um por si.',
        'Perguntas de conhecimento: quem acertar ganha 1 ponto. O gabarito tá na última página (sem espiar!).',
        'Quem é mais provável: alguém lê, conta até 3 e todo mundo aponta pra pessoa ao mesmo tempo. A mais apontada paga uma prenda.',
        'Prenda pode ser: cantar uma música de Natal, imitar o Papai Noel, ou servir a sobremesa pra todo mundo.'], nome))
    pags += cartoes([(f'#{i + 1}', p) for i, (p, _) in enumerate(PERGUNTAS)], nome)
    pags += cartoes([('Quem é mais provável de...', q) for q in QUEM], nome)
    gab = ''.join(f'<div><b>{i + 1}.</b> {r}</div>' for i, (_, r) in enumerate(PERGUNTAS))
    pags.append(pagina(f'<div class="tit"><span class="m">Gabarito</span></div><div class="gab">{gab}</div>', nome=nome))
    return salvar('quiz-de-natal', documento(nome, pags, css))

# ---------- Caça ao Presente ----------
PISTAS = [
    ('Geladeira', 'Lá dentro é sempre frio, mas guarda tudo que é gostoso. Corre lá que a pista tá esperando!'),
    ('Sofá', 'Todo mundo senta em mim pra ver TV. Procura entre as minhas almofadas!'),
    ('Máquina de lavar', 'Eu giro, giro e giro, e deixo a roupa cheirosa.'),
    ('Debaixo do travesseiro', 'Tu deita a cabeça em mim toda noite. Olha embaixo!'),
    ('Sapateira ou tênis', 'Eu passo o dia no teu pé. Procura dentro de mim!'),
    ('Árvore de Natal', 'Sou verde, cheia de bolinhas e tenho uma estrela na cabeça.'),
    ('Forno ou micro-ondas', 'Esquento a comida rapidinho. Mas cuidado, não me liga!'),
    ('Banheiro (toalha)', 'Depois do banho tu me usa pra se secar.'),
    ('Guarda-roupa', 'Guardo tuas roupas de dia e de noite. Abre a minha porta!'),
    ('Caixa de brinquedos ou estante', 'Aqui moram os livros e os brinquedos. Procura bem!'),
    ('Vaso de planta', 'Eu sou verde, tomo água e não saio do lugar.'),
    ('Mesa da ceia', 'É aqui que a família se junta pra comer. Olha embaixo do prato!'),
]

def caca():
    nome = 'Caça ao Presente'
    css = CSS_PASSOS + CARTOES + '.ct .lugar{font-size:18px;color:#999;margin-top:auto}'
    pags = [capa('brincadeira de Natal', 'Caça ao<br><span class="r">Presente</span>', '12 pistas pra esconder pela casa + cartões em branco',
                 ''.join(svg(n, 90) for n in ['presente', 'meia', 'estrela', 'sino']))]
    pags.append(instrucoes('Como montar', [
        'Imprime e recorta as pistas. Embaixo de cada uma tá escrito (pequeno) o lugar que ela descreve.',
        'Escolhe quantas pistas vai usar (5 a 8 é um bom número pra crianças).',
        'A primeira pista tu entrega na mão. Ela descreve o lugar da 2ª pista. Lá, tu esconde a 2ª pista, que descreve o lugar da 3ª, e assim vai.',
        'No lugar descrito pela última pista, esconde o presente!',
        'Corta ou dobra a parte de baixo com o nome do lugar antes de esconder, pra não entregar a resposta.',
        'Use os cartões em branco pra criar pistas dos lugares da tua casa.'], nome))
    lista = [(f'Pista: {lugar.split(" (")[0].split(" ou ")[0]}' if False else f'Pista {i + 1}', f'{txt}<div class="lugar">lugar: {lugar}</div>') for i, (lugar, txt) in enumerate(PISTAS)]
    pags += cartoes(lista, nome)
    pags += cartoes([('Pista ___', '__________________________________<br>__________________________________<div class="lugar">lugar: __________</div>')] * 8, nome)
    pags += cartoes([('🎁 Achou!', 'Parabéns, detetive! O presente é teu. Feliz Natal!')] * 4, nome, por_pag=4)
    return salvar('caca-ao-presente', documento(nome, pags, css))

# ---------- Retrospectiva do Meu Ano ----------
def retrospectiva():
    nome = 'Retrospectiva do Meu Ano'
    css = '''.campo{font-size:28px;line-height:1.3;margin-top:5mm}.campo .l{border-bottom:1.5px solid #bbb;height:10mm}
.caixa{border:2.5px solid #1d1d1d;border-radius:5mm;padding:4mm 6mm;margin-top:5mm;font-size:28px}
.duas{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.num{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:6mm}.num div{border:2.5px solid #1d1d1d;border-radius:5mm;height:40mm;padding:4mm;font-size:26px}'''
    L = lambda n: '<div class="l"></div>' * n
    pags = [capa('pra preencher', 'Retrospectiva<br>do meu <span class="r">ano</span>', 'O que rolou esse ano, pra guardar e reler no próximo',
                 ''.join(svg(n, 90) for n in ['estrela', 'vela', 'caneca', 'presente']))]
    pags.append(pagina('<div class="tit">Esse ano em <span class="m">números</span></div><div class="num">'
                       + ''.join(f'<div>{t}</div>' for t in ['Livros que li', 'Filmes e séries que vi', 'Lugares novos que conheci',
                                                            'Amigos novos', 'Vezes que ri até chorar', 'Coisas novas que aprendi',
                                                            'Músicas que mais ouvi', 'Nota pro meu ano (0 a 10)']) + '</div>', nome=nome))
    pags.append(pagina('<div class="tit">Os <span class="m">melhores</span> momentos</div>'
                       + ''.join(f'<div class="campo">{t}{L(2)}</div>' for t in ['O dia mais feliz do ano:', 'A maior risada:', 'A melhor viagem ou passeio:',
                                                                                 'Uma coisa que me deixou orgulhoso(a):', 'Uma coisa difícil que eu superei:', 'A pessoa que mais me ajudou:']), nome=nome))
    pags.append(pagina('<div class="tit">Meu <span class="m">top 5</span></div><div class="duas">'
                       + ''.join(f'<div class="caixa">{t}<br>1.<br>2.<br>3.<br>4.<br>5.</div>' for t in ['Músicas', 'Séries ou filmes', 'Comidas', 'Vídeos ou memes', 'Jogos', 'Momentos com amigos'])
                       + '</div>', nome=nome))
    pags.append(pagina('<div class="tit">Desenha ou cola uma <span class="m">foto</span> do teu ano</div><div class="caixa" style="height:225mm"></div>', nome=nome))
    pags.append(pagina('<div class="tit">Pro ano que <span class="m">vem</span></div>'
                       + ''.join(f'<div class="campo">{t}{L(2)}</div>' for t in ['Uma coisa que eu quero aprender:', 'Um lugar que eu quero conhecer:', 'Um hábito que eu quero começar:',
                                                                                 'Um hábito que eu quero largar:', 'Uma meta pra escola ou trabalho:', 'Um sonho grande:']), nome=nome))
    pags.append(pagina('<div class="tit">Carta pro meu <span class="m">eu do futuro</span></div><div class="sub">Lê de novo daqui um ano!</div>'
                       f'<div class="campo">{L(19)}</div>', nome=nome))
    return salvar('retrospectiva-do-ano', documento(nome, pags, css))

# ---------- Casinha do Papai Noel 3D ----------
def casinha():
    nome = 'Casinha do Papai Noel pra Montar'
    W, D, H, G = 66, 55, 55, 27.5          # frente, lado, altura da parede, altura do telhado (mm)
    R = math.hypot(W / 2, G)                # comprimento da água do telhado
    x0, yT = 8, 52
    yB = yT + H
    xs = [x0, x0 + W, x0 + W + D, x0 + 2 * W + D, x0 + 2 * W + 2 * D]
    corte, dobra = [], []

    def aba(p1, p2, larg=6, recuo=5):
        # aba de cola trapezoidal pra fora do segmento p1->p2 (fora = lado esquerdo do sentido)
        (x1, y1), (x2, y2) = p1, p2
        L = math.hypot(x2 - x1, y2 - y1); ux, uy = (x2 - x1) / L, (y2 - y1) / L; nx, ny = uy, -ux
        a = (x1 + ux * recuo + nx * larg, y1 + uy * recuo + ny * larg); b = (x2 - ux * recuo + nx * larg, y2 - uy * recuo + ny * larg)
        corte.append(f'M{x1:.2f} {y1:.2f} L{a[0]:.2f} {a[1]:.2f} L{b[0]:.2f} {b[1]:.2f} L{x2:.2f} {y2:.2f}')
        dobra.append(f'M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}')

    f0, f1, s0, b0, b1, t0 = xs[0], xs[1], xs[1], xs[2], xs[3], xs[3]
    # contorno das paredes (frente, lado, fundo, lado), sem as arestas que levam aba ou telhado
    corte.append(f'M{f0} {yB} L{f0} {yT}')                          # borda esquerda da frente
    aba((f0, yT), (f0 + W / 2, yT - G))                             # empena frente esquerda
    aba((f0 + W / 2, yT - G), (f1, yT))                             # empena frente direita
    aba((b0, yT), (b0 + W / 2, yT - G)); aba((b0 + W / 2, yT - G), (b1, yT))
    # telhados sobre as laterais
    for xa in (s0, t0):
        corte.append(f'M{xa} {yT} L{xa} {yT - R:.2f} L{xa + D} {yT - R:.2f} L{xa + D} {yT}')
        dobra.append(f'M{xa} {yT} L{xa + D} {yT}')
    # aba lateral de fechamento
    aba((xs[4], yT), (xs[4], yB), larg=7)
    corte.append(f'M{xs[4]} {yT} L{xs[4]} {yT}')
    # base (chão) embaixo da frente com abas
    corte.append(f'M{f1} {yB} L{xs[4]} {yB}')
    dobra.append(f'M{f0} {yB} L{f1} {yB}')
    aba((f0, yB + D), (f0, yB)); aba((f1, yB), (f1, yB + D)); aba((f1, yB + D), (f0, yB + D))
    for x in xs[1:4]:
        dobra.append(f'M{x} {yT} L{x} {yB}')
    # decoração (pra colorir)
    cx = f0 + W / 2
    dec = f'''<rect x="{cx - 9}" y="{yB - 26}" width="18" height="26" rx="9"/><circle cx="{cx + 5}" cy="{yB - 12}" r="1.2" class="p"/>
<circle cx="{cx}" cy="{yB - 32}" r="5"/><circle cx="{cx}" cy="{yB - 32}" r="2.6"/>
<rect x="{f0 + 6}" y="{yT + 10}" width="13" height="13"/><path d="M{f0 + 12.5} {yT + 10} v13 M{f0 + 6} {yT + 16.5} h13"/>
<rect x="{f1 - 19}" y="{yT + 10}" width="13" height="13"/><path d="M{f1 - 12.5} {yT + 10} v13 M{f1 - 19} {yT + 16.5} h13"/>
<circle cx="{cx}" cy="{yT - 10}" r="4"/>'''
    for xa in (s0, b1):
        dec += f'<rect x="{xa + D / 2 - 10}" y="{yT + 12}" width="20" height="16"/><path d="M{xa + D / 2} {yT + 12} v16 M{xa + D / 2 - 10} {yT + 20} h20"/>'
    dec += f'<rect x="{b0 + W / 2 - 8}" y="{yT + 14}" width="16" height="16"/><path d="M{b0 + W / 2} {yT + 14} v16"/>'
    for xa in (s0, t0):  # telhas
        for k in range(1, 5):
            y = yT - R * k / 5
            dec += f'<path d="M{xa} {y:.2f} ' + ' '.join(f'q{D / 10:.2f} 4 {D / 5:.2f} 0' for _ in range(5)) + '"/>'
    dec += f'<text x="{f0 + W / 2}" y="{yB + D / 2}" text-anchor="middle" style="font:7px Caveat">chão</text>'
    vb_w, vb_h = xs[4] + 12, yB + D + 10
    desenho = f'''<svg viewBox="0 0 {vb_w:.1f} {vb_h:.1f}" style="width:{vb_h:.1f}mm;height:{vb_w:.1f}mm;display:block;margin:0 auto">
<g transform="translate({vb_h:.1f} 0) rotate(90)">
<g fill="none" stroke="#1d1d1d" stroke-width=".6" stroke-linejoin="round">{''.join(f'<path d="{d}"/>' for d in corte)}</g>
<g fill="none" stroke="#1d1d1d" stroke-width=".4" stroke-dasharray="2 1.5">{''.join(f'<path d="{d}"/>' for d in dobra)}</g>
<g fill="none" stroke="#1d1d1d" stroke-width=".45" stroke-linecap="round">{dec}</g></g></svg>'''
    desenho = desenho.replace('viewBox="0 0 %.1f %.1f"' % (vb_w, vb_h), 'viewBox="0 0 %.1f %.1f"' % (vb_h, vb_w))
    pags = [capa('recorta e monta', 'Casinha do<br><span class="r">Papai Noel</span>', 'Uma casinha 3D de papel pra colorir e montar',
                 ''.join(svg(n, 90) for n in ['noel', 'gorro', 'presente', 'arvore']))]
    pags.append(instrucoes('Como montar', [
        'Imprime em tamanho real (100%, sem "ajustar à página"), de preferência em papel 180 g ou mais.',
        'Colore a casinha antes de recortar: porta, janelas, telhado e a guirlanda da porta.',
        'Recorta pela linha contínua. A linha tracejada é pra dobrar, não pra cortar.',
        'Dobra todas as linhas tracejadas pra dentro, bem marcadinhas (passar a unha ajuda).',
        'Cola a aba da ponta na parede da frente, formando a caixa. Depois cola o chão nas abas.',
        'Desce as duas partes do telhado, cola nas abas das paredes de frente e de trás e une as duas lá em cima.',
        'Pronto! Coloca perto da árvore ou usa como porta-bombom.'], nome))
    pags.append(pagina(f'<div class="sub" style="text-align:center;margin-bottom:3mm">— linha contínua: corta · - - - tracejada: dobra</div>{desenho}', nome=nome))
    return salvar('casinha-papai-noel-3d', documento(nome, pags, CSS_PASSOS))

if __name__ == '__main__':
    for f in (advento, amigo_secreto, quiz, caca, retrospectiva, casinha):
        print(f())
