"""Lote 2: etiquetas e cartões de Natal + 8 jogos pra imprimir."""
import random
from base import documento, pagina, capa, salvar
from icones import ICONES, NOMES, svg
import geradores as G

TODOS = list(ICONES)
CSS_PASSOS = '.passos{font-size:30px;line-height:1.3;margin:26px 0 0 34px}.passos li{margin-bottom:12px}'

def instrucoes(titulo, itens, nome):
    return pagina(f'<div class="tit">{titulo}</div><ol class="passos">{"".join(f"<li>{i}</li>" for i in itens)}</ol>', nome=nome)

def grade_cartas(textos, nome, cols=3, alt_mm=50, rotulo='', cor='#1d1d1d', icone=True, fonte=26, titulo=''):
    css_cel = f'border:1.5px dashed #999;height:{alt_mm}mm;padding:4mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;position:relative'
    pags, por = [], cols * int(240 // alt_mm)
    for i in range(0, len(textos), por):
        cel = ''
        for k, t in enumerate(textos[i:i + por]):
            ic = f'<div style="position:absolute;right:2mm;bottom:1mm">{svg(TODOS[(i + k) % 18], 30)}</div>' if icone else ''
            rot = f'<div style="position:absolute;left:3mm;top:2mm;font-size:18px;color:{cor}">{rotulo}</div>' if rotulo else ''
            cel += f'<div style="{css_cel}">{rot}<div style="font-size:{fonte}px;line-height:1.15">{t}</div>{ic}</div>'
        tit = f'<div class="tit" style="font-size:34px;margin-bottom:3mm">{titulo}</div>' if titulo else ''
        pags.append(pagina(f'{tit}<div style="display:grid;grid-template-columns:repeat({cols},1fr)">{cel}</div>', nome=nome))
    return pags

# ---------- 1. Etiquetas de presente ----------
def etiquetas():
    nome = 'Etiquetas de Presente de Natal'
    css = '''.eti{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm 3mm;margin-top:2mm}
.tag{height:59mm;border:2px solid #1d1d1d;border-radius:6mm 6mm 4mm 4mm;clip-path:polygon(18% 0,82% 0,100% 14%,100% 100%,0 100%,0 14%);
display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:7mm;font-size:21px;position:relative}
.tag .furo{width:5mm;height:5mm;border:1.5px solid #1d1d1d;border-radius:50%;position:absolute;top:2mm}
.tag .l{width:80%;text-align:left;border-bottom:1.5px solid #bbb;margin-top:1mm}'''
    pags = [capa('pra embrulhar', 'Etiquetas<br>de <span class="r">Presente</span>', '48 etiquetas fofas pra colorir, recortar e amarrar',
                 ''.join(svg(n, 90) for n in ['presente', 'gorro', 'sino', 'estrela']))]
    frases = ['Feliz Natal!', 'Com carinho', 'Não abre antes!', 'Ho ho ho!', 'Pra você', 'Boas festas!']
    for p in range(3):
        cel = ''
        for k in range(16):
            n = TODOS[(p * 16 + k) % 18]
            cel += (f'<div class="tag"><div class="furo"></div>{svg(n, 78)}<div>{frases[(p * 16 + k) % 6]}</div>'
                    f'<div class="l">De:</div><div class="l">Para:</div></div>')
        pags.append(pagina(f'<div class="eti">{cel}</div>', nome=nome))
    return salvar('etiquetas-de-presente', documento(nome, pags, css))

# ---------- 2. Cartões de Natal pra colorir ----------
def cartoes_natal():
    nome = 'Cartões de Natal pra Colorir'
    css = CSS_PASSOS + '''.cartao{height:132mm;border:1.5px dashed #999;display:grid;grid-template-columns:1fr 1fr;margin-bottom:3mm}
.cartao>div{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6mm;text-align:center}
.cartao .verso{border-right:1.5px dashed #1d1d1d;font-size:20px;color:#888}
.cartao .frente .msg{font-size:40px;line-height:1;margin-top:3mm}'''
    msgs = ['Feliz Natal!', 'Boas festas!', 'Um Natal fofinho pra você', 'Ho ho ho!', 'Que 2027 seja incrível!', 'Você é um presente',
            'Feliz Natal, vovó!', 'Feliz Natal, vovô!', 'Pra melhor família', 'Obrigado por esse ano!', 'Natal quentinho', 'Paz, amor e panetone']
    pags = [capa('pra dar de presente', 'Cartões<br>de <span class="r">Natal</span>', '12 cartões pra colorir, dobrar e escrever',
                 ''.join(svg(n, 90) for n in ['guirlanda', 'noel', 'arvore', 'caneca']))]
    pags.append(instrucoes('Como fazer', ['Imprime as folhas (papel mais grosso fica melhor).', 'Os cartões já vêm pintados. Se quiser, capricha com glitter ou canetinha.',
                                          'Recorta pela linha tracejada de fora.', 'Dobra ao meio na linha do centro, com o desenho pra fora.',
                                          'Escreve a tua mensagem por dentro e entrega!'], nome))
    for i in range(0, 12, 2):
        bloco = ''
        for k in (i, i + 1):
            n = TODOS[(k * 5) % 18]
            bloco += (f'<div class="cartao"><div class="verso">{svg(TODOS[(k * 5 + 7) % 18], 60)}<br>feito com carinho<br>@Cardeno_Amarelo</div>'
                      f'<div class="frente">{svg(n, 260)}<div class="msg">{msgs[k]}</div></div></div>')
        pags.append(pagina(bloco, nome=nome))
    return salvar('cartoes-de-natal-colorir', documento(nome, pags, css))

# ---------- 3. Detetive do Caderno ----------
SUSPEITOS = [
    ('Tia Bete', 'Diz que cochilou na rede da varanda das 14h às 15h30. O vovô estava na rede do lado e confirma.', 'Calça 37'),
    ('Primo Léo', 'Jogou videogame online das 14h às 15h no quarto. O histórico do jogo mostra a partida sem pausa.', 'Calça 38'),
    ('Vovô Zé', 'Cochilou na rede ao lado da Tia Bete. Diz que ouviu ela roncar o tempo todo.', 'Calça 42'),
    ('Clara', 'Diz que saiu pra comprar pão às 14h20 e voltou às 14h50.', 'Calça 38'),
    ('Seu Ari, o vizinho', 'Chegou pra visitar às 15h10, trazendo um guarda-chuva.', 'Calça 40'),
    ('Duda', 'Brincou de massinha na mesa da sala o tempo todo, perto da mãe.', 'Calça 31'),
]
PISTAS_DET = [
    'O pudim estava inteiro na geladeira às 14h. A mãe viu quando guardou o refrigerante.',
    'Às 15h a mãe abriu a geladeira de novo e o pudim tinha sumido.',
    'Começou a chover forte às 14h30 e parou só às 16h.',
    'No chão da cozinha tem pegadas molhadas de tênis, tamanho 38, indo até a geladeira.',
    'O tênis do Léo está seco, debaixo da cama. Ele estava de chinelo.',
    'Tem uma sacola de padaria no lixo da cozinha, com uma colher melada de caramelo dentro.',
    'O guarda-chuva do Seu Ari ainda está pingando na porta, mas ele chegou depois que o pudim sumiu.',
    'A Duda tem massinha nas mãos, mas nenhum cheiro de caramelo.',
]

def detetive():
    nome = 'Detetive do Caderno: o Mistério do Pudim'
    css = CSS_PASSOS + '''.hist{font-size:30px;line-height:1.35;margin-top:6mm}
.sus{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:4mm}.sus>div{border:2.5px solid #1d1d1d;border-radius:5mm;padding:5mm;font-size:24px;line-height:1.2;height:74mm}
.sus b{font-size:34px;display:block;margin-bottom:2mm}.sus .p{color:#d62828;margin-top:2mm}
.sol{border:3px dashed #d62828;border-radius:6mm;padding:8mm;font-size:28px;line-height:1.35;margin-top:6mm}'''
    pags = [capa('jogo de mistério', 'Detetive do<br><span class="r">Caderno</span>', 'O Mistério do Pudim Sumido: 6 suspeitos, 8 pistas e 1 culpado',
                 ''.join(svg(n, 90) for n in ['caneca', 'estrela', 'presente', 'luva']))]
    pags.append(instrucoes('Como jogar', [
        'Pra 2 a 8 detetives. Imprime e recorta as fichas dos suspeitos e as pistas.',
        'Alguém lê a história em voz alta. Depois, as pistas são reveladas uma por uma.',
        'A cada pista, conversem: quem pode ser eliminado? Riscar o suspeito ajuda.',
        'Quando alguém achar que sabe, fala o nome do culpado E explica o porquê.',
        'Só então abram a página da solução (dobrada e grampeada, sem espiar!).'], nome))
    pags.append(pagina('<div class="tit">O Mistério do <span class="m">Pudim Sumido</span></div><div class="hist">'
                       'Domingo de almoço na casa da vovó. A mãe fez o famoso pudim de leite e guardou na geladeira pra sobremesa. '
                       'Depois do almoço, cada um foi pra um canto da casa.<br><br>Quando chegou a hora da sobremesa... <b>o pudim tinha sumido!</b> '
                       'Só sobrou o prato vazio e um rastro de caramelo.<br><br>Seis pessoas estavam por perto naquela tarde. '
                       'Uma delas comeu o pudim inteiro sozinha. Cabe a vocês, detetives, descobrir quem foi.</div>'
                       f'<div style="display:flex;justify-content:center;gap:10mm;margin-top:14mm">{svg("caneca", 150)}{svg("estrela", 150)}</div>', nome=nome))
    sus = ''.join(f'<div><b>{n}</b>{a}<div class="p">{c}</div></div>' for n, a, c in SUSPEITOS)
    pags.append(pagina(f'<div class="tit">Os <span class="m">suspeitos</span></div><div class="sus">{sus}</div>', nome=nome))
    pags += grade_cartas([f'<b>Pista {i + 1}</b><br>{t}' for i, t in enumerate(PISTAS_DET)], nome, cols=2, alt_mm=58, fonte=24, titulo='As pistas (revela uma por vez)')
    pags.append(pagina('<div class="tit">🔒 <span class="m">Solução</span></div><div class="sub">Dobra essa página ao meio e só abre no final!</div>'
                       '<div style="height:90mm"></div><div class="sol"><b>Foi a Clara!</b><br>'
                       'O pudim sumiu entre 14h e 15h (pistas 1 e 2). As pegadas estão molhadas, então quem fez isso veio da rua depois que começou a chover, às 14h30 (pistas 3 e 4). '
                       'O tênis é 38: só o Léo e a Clara calçam 38. O Léo não saiu de casa e o tênis dele está seco (pista 5). '
                       'A Clara voltou da padaria às 14h50, debaixo de chuva, e a sacola do pão estava no lixo com a colher melada de caramelo (pista 6). '
                       'O Seu Ari chegou às 15h10, depois do sumiço (pista 7). A Tia Bete e o vovô estavam juntos na rede, e a Duda ficou do lado da mãe.</div>', nome=nome))
    return salvar('detetive-do-caderno', documento(nome, pags, css))

# ---------- 4. Escape Room em Casa ----------
def escape():
    nome = 'Escape Room em Casa'
    css = CSS_PASSOS + '''.enig{border:3px solid #1d1d1d;border-radius:6mm;padding:7mm;margin-top:6mm;font-size:30px;line-height:1.35}
.enig .simb{font-size:50px;float:right}.simb.s1{color:#e0a800}.simb.s2{color:#e63946}.simb.s3{color:#2e9e5b}.simb.s4{color:#2a78c4}table.alf{border-collapse:collapse;margin-top:3mm;width:100%}table.alf td{border:1px solid #bbb;text-align:center;font-size:24px;width:7.6%}.cod{font-size:54px;letter-spacing:4px;text-align:center;margin:6mm 0}
.cadeado{display:flex;gap:8mm;justify-content:center;margin-top:10mm}.cadeado div{width:32mm;height:40mm;border:3px solid #1d1d1d;border-radius:5mm;display:flex;align-items:flex-start;justify-content:center;font-size:44px;padding-top:2mm}'''
    pags = [capa('jogo de fuga', 'Escape Room<br><span class="r">em Casa</span>', '5 enigmas em sequência pra sair do quarto trancado',
                 ''.join(svg(n, 90) for n in ['estrela', 'vela', 'sino', 'presente']))]
    pags.append(instrucoes('A missão', [
        'Vocês acordaram trancados no Quarto do Caderno. A porta tem um cadeado de 4 números.',
        'Cada enigma revela 1 número e tem um símbolo (★ ● ▲ ■).',
        'Resolve os 4 enigmas, anota cada número no símbolo certo e vai pro cadeado final.',
        'Dica pra quem organiza: imprime cada enigma separado e esconde pela casa. Quem achar, resolve.',
        'Quer mais emoção? Marca 20 minutos no cronômetro!',
        'As respostas estão na última página.'], nome))
    pags.append(pagina('<div class="tit">Enigma 1 · <span class="m">a mensagem secreta</span></div><div class="enig"><span class="simb s1">★</span>'
                       'Alguém deixou essa mensagem na parede. Cada letra virou um número: A = 1, B = 2, C = 3 e assim por diante.'
                       '<div class="cod">19 · 5 · 20 · 5</div>A palavra é o número do ★.<br><br>'
                       + ''.join('<table class="alf"><tr>' + ''.join(f'<td>{chr(65 + i)}</td>' for i in r) + '</tr><tr>' + ''.join(f'<td>{i + 1}</td>' for i in r) + '</tr></table>' for r in (range(13), range(13, 26))) + '</div>', nome=nome))
    pags.append(pagina('<div class="tit">Enigma 2 · <span class="m">a sequência</span></div><div class="enig"><span class="simb s2">●</span>'
                       'Na gaveta tem um papel com uma sequência que nunca acaba:<div class="cod">1 · 1 · 2 · 3 · 5 · 8 · 13 · ?</div>'
                       'Descobre o próximo número. Depois soma os algarismos dele (exemplo: 13 vira 1 + 3 = 4).<br>O resultado é o número do ●.</div>', nome=nome))
    pags.append(pagina('<div class="tit">Enigma 3 · <span class="m">o espelho</span></div><div class="enig"><span class="simb s3">▲</span>'
                       'No espelho do banheiro tem uma frase escrita de trás pra frente:<div class="cod">evon é oremún o</div>'
                       'Lê do jeito certo. O número que ela fala é o do ▲.</div>', nome=nome))
    pags.append(pagina('<div class="tit">Enigma 4 · <span class="m">o relógio</span></div><div class="enig"><span class="simb s4">■</span>'
                       'O relógio da parede marca <b>10 horas da manhã</b>. Um bilhete diz:<br><br>'
                       '"O número que tu procura é a hora que o ponteiro pequeno vai marcar daqui a 16 horas."<br><br>Esse é o número do ■.</div>'
                       f'<div style="display:flex;justify-content:center;margin-top:8mm">{svg("estrela", 1) if False else ""}</div>', nome=nome))
    pags.append(pagina('<div class="tit">Enigma 5 · <span class="m">o cadeado</span></div><div class="enig">'
                       'Na porta, o cadeado mostra os símbolos nessa ordem. Coloca o número de cada um e tu tá livre!'
                       '<div class="cadeado"><div style="color:#2e9e5b;background:#def3dc">▲</div><div style="color:#e0a800;background:#fff2bf">★</div><div style="color:#2a78c4;background:#dcefff">■</div><div style="color:#e63946;background:#ffe1e1">●</div></div>'
                       '<br>Pra conferir sem espiar: os 4 números somados dão <b>21</b>.</div>', nome=nome))
    pags.append(pagina('<div class="tit">🔒 <span class="m">Respostas</span></div><div class="enig" style="font-size:28px">'
                       '★ 19-5-20-5 = S-E-T-E → <b>7</b><br>● o próximo é 21 (cada número é a soma dos dois anteriores) → 2 + 1 = <b>3</b><br>'
                       '▲ "o número é nove" → <b>9</b><br>■ 10h + 16h = 2h da madrugada → <b>2</b><br><br>Código do cadeado (▲ ★ ■ ●): <b>9 7 2 3</b></div>', nome=nome))
    return salvar('escape-room-em-casa', documento(nome, pags, css))

# ---------- 5. Verdade ou Desafio Fofo ----------
VERDADES = ['Qual foi o mico mais engraçado que tu já pagou?', 'Qual é a tua comida favorita de todas?', 'Já fingiu que tava doente pra não ir pra escola?',
 'Qual é o teu maior medo bobo?', 'Qual música tu canta escondido no banho?', 'Quem aqui te faz rir mais?', 'Qual foi o melhor presente que tu já ganhou?',
 'Qual é o teu apelido mais estranho?', 'Já mandou mensagem pra pessoa errada?', 'Qual desenho animado tu ainda assiste?', 'O que tu faria com 1 milhão de reais?',
 'Qual é a tua mania mais esquisita?', 'Já comeu algo que caiu no chão?', 'Qual super poder tu escolheria?', 'Quem foi teu primeiro crush famoso?',
 'Qual foi a última coisa que tu pesquisou no celular?', 'Qual é o teu emoji mais usado?', 'Já riu numa hora que não podia?', 'Qual matéria da escola tu mais odeia?',
 'Se tu fosse um bicho, qual seria?', 'Qual é o teu sonho mais doido?', 'Já chorou vendo filme? Qual?', 'Qual foi a maior bronca que tu levou?',
 'O que tu nunca emprestaria pra ninguém?', 'Qual é o teu talento escondido?', 'Já dormiu na aula?', 'Qual é a pior comida que tu já provou?',
 'Quem aqui tu chamaria pra uma ilha deserta?', 'Qual foi a maior mentira que tu já contou (inofensiva)?', 'Qual é o teu lugar favorito no mundo?',
 'O que te deixa mais irritado?', 'Qual foi o teu dia mais feliz desse ano?', 'Qual personagem tu queria ser?', 'Já falou sozinho na rua?',
 'Qual é a primeira coisa que tu faz quando acorda?', 'Qual vídeo tu já assistiu mais de 10 vezes?', 'O que tu queria ser quando era pequeno?',
 'Qual é a coisa mais cara que tu já quebrou?', 'Tu prefere praia ou piscina? Por quê?', 'Qual é o teu cheiro favorito?', 'Já ficou preso em algum lugar?',
 'Qual foi a última vez que tu chorou de rir?', 'Qual hábito teu tu queria mudar?', 'Quem foi teu melhor amigo de infância?', 'Qual é o teu filme de conforto?',
 'Qual é a coisa mais estranha que tu já comeu?', 'O que tu mais gosta em ti?', 'Qual é a tua lembrança mais antiga?', 'Qual foi o teu maior vacilo com um amigo?',
 'Se pudesse trocar de vida com alguém por um dia, quem seria?']
DESAFIOS2 = ['Imita uma galinha por 10 segundos.', 'Fala o alfabeto de trás pra frente.', 'Faz 10 polichinelos.', 'Canta o refrão de uma música com voz de ópera.',
 'Conta uma piada. Se ninguém rir, conta outra.', 'Fica 1 minuto sem piscar.', 'Imita alguém daqui até adivinharem quem é.', 'Dança sem música por 20 segundos.',
 'Fala com sotaque diferente até a tua próxima vez.', 'Faz a tua melhor cara de bravo.', 'Equilibra um livro na cabeça e anda até a porta.', 'Fala 3 elogios pra pessoa da tua esquerda.',
 'Faz uma pose de estátua até alguém te fazer rir.', 'Desenha um gato de olhos fechados.', 'Imita um apresentador de jornal falando do jantar.', 'Fala "três pratos de trigo para três tigres tristes" 3 vezes rápido.',
 'Faz uma propaganda de 15 segundos de um objeto da sala.', 'Anda como um pinguim até a cozinha e volta.', 'Faz o barulho de 3 bichos diferentes.', 'Fica de olhos fechados e adivinha um objeto pelo tato.',
 'Faz uma dança do TikTok.', 'Fala só cantando até a tua próxima vez.', 'Faz careta e deixa alguém tirar foto.', 'Conta uma história de 30 segundos sobre uma meia perdida.',
 'Tenta lamber o cotovelo.', 'Faz 5 agachamentos falando "sou o melhor".', 'Imita um robô por 20 segundos.', 'Deixa alguém fazer um penteado em ti.',
 'Fala o nome de 10 frutas em 15 segundos.', 'Faz uma declaração dramática de amor pra uma almofada.', 'Imita um bebê chorando.', 'Escreve teu nome com o pé no ar.',
 'Fala uma frase com a língua pra fora.', 'Faz a pose de super-herói por 10 segundos.', 'Narra o que a pessoa da direita tá fazendo como num jogo de futebol.', 'Fala "Feliz Natal" em 3 vozes diferentes.',
 'Fica num pé só até a próxima rodada.', 'Faz um rap com o nome de todos aqui.', 'Imita um gato pedindo comida.', 'Assobia uma música até adivinharem.',
 'Faz uma pirâmide de 5 objetos da mesa.', 'Fala tudo ao contrário na próxima frase.', 'Desfila como modelo até a porta.', 'Faz mímica de um filme até adivinharem.',
 'Conta até 20 pulando os números com 3.', 'Inventa um nome de banda pra cada pessoa aqui.', 'Faz uma reverência pra cada pessoa.', 'Fala o que tu comeu ontem como se fosse chef famoso.',
 'Dá um abraço em grupo em todo mundo.', 'Escolhe alguém pra fazer um desafio no teu lugar (só uma vez!).']

def verdade_desafio():
    nome = 'Verdade ou Desafio Fofo'
    pags = [capa('jogo pra galera', 'Verdade<br>ou <span class="r">Desafio</span>', '100 cartas leves, sem constrangimento pesado',
                 ''.join(svg(n, 90) for n in ['estrela', 'pirulito', 'caneca', 'sino']))]
    pags.append(instrucoes('Como jogar', ['Recorta as cartas e separa em dois montes: Verdade e Desafio.', 'Na tua vez, escolhe verdade ou desafio e tira uma carta.',
                                          'Não quer responder? Troca por um desafio. Não quer o desafio? Paga uma prenda combinada.',
                                          'Regra de ouro: ninguém é obrigado a nada que deixe alguém mal. É pra rir junto!'], nome))
    pags += grade_cartas(VERDADES, nome, cols=3, alt_mm=48, rotulo='VERDADE', cor='#1d4ed8', fonte=23)
    pags += grade_cartas(DESAFIOS2, nome, cols=3, alt_mm=48, rotulo='DESAFIO', cor='#d62828', fonte=23)
    return salvar('verdade-ou-desafio', documento(nome, pags, CSS_PASSOS))

# ---------- 6. Quem Sou Eu? ----------
QUEM_SOU = {
 'Bichos': 'Leão Girafa Pinguim Tubarão Cachorro Gato Elefante Macaco Coruja Jacaré Polvo Tartaruga Capivara Preguiça Tucano Galinha Vaca Cavalo Abelha Formiga Camaleão Canguru Panda Golfinho',
 'Profissões': 'Médico Bombeiro Professor Astronauta Cozinheiro Policial Dentista Pintor Cantor Jogador_de_futebol Piloto Veterinário Padeiro Mágico Palhaço Youtuber Motorista Carteiro Cientista Fazendeiro Arquiteto Fotógrafo Detetive Garçom',
 'Comidas': 'Pizza Brigadeiro Pastel Pipoca Coxinha Feijoada Sorvete Hambúrguer Pão_de_queijo Açaí Lasanha Panetone Banana Melancia Ovo_frito Macarrão Churrasco Chocolate Batata_frita Bolo Tapioca Cachorro-quente Pudim Morango',
 'Objetos': 'Geladeira Celular Guarda-chuva Escova_de_dente Travesseiro Bicicleta Relógio Óculos Chave Lápis Mochila Controle_remoto Vassoura Espelho Tesoura Panela Lâmpada Meia Violão Bola Computador Chinelo Ventilador Garrafa',
 'Lugares': 'Praia Escola Hospital Cinema Supermercado Floresta Deserto Polo_Norte Aeroporto Zoológico Shopping Fazenda Igreja Padaria Piscina Biblioteca Circo Estádio Parque Lua Castelo Ilha Montanha Museu',
}

def quem_sou():
    nome = 'Quem Sou Eu?'
    cartas = [f'<span style="font-size:15px;color:#888">{cat}</span><br><span style="font-size:36px">{p.replace("_", " ")}</span>'
              for cat, txt in QUEM_SOU.items() for p in txt.split()]
    pags = [capa('jogo de adivinhar', 'Quem<br><span class="r">Sou Eu?</span>', f'{len(cartas)} cartas pra colar na testa e adivinhar',
                 ''.join(svg(n, 90) for n in ['rena', 'noel', 'biscoito', 'boneco_neve']))]
    pags.append(instrucoes('Como jogar', ['Recorta as cartas e embaralha.', 'Cada um pega uma carta SEM OLHAR e segura na testa (ou prende numa faixa).',
                                          'Na tua vez, faz perguntas de sim ou não: "Eu sou um bicho?", "Eu sou de comer?"',
                                          'Recebeu um "sim"? Pergunta de novo. Recebeu um "não"? Passa a vez.',
                                          'Quem adivinhar primeiro ganha. Dá pra jogar por categoria pra ficar mais fácil.'], nome))
    pags += grade_cartas(cartas, nome, cols=3, alt_mm=40, icone=False)
    return salvar('quem-sou-eu', documento(nome, pags, CSS_PASSOS)), len(cartas)

# ---------- 7. Stop / Adedonha ----------
def stop():
    nome = 'Stop / Adedonha'
    css = CSS_PASSOS + '''table.st{width:100%;border-collapse:collapse;margin-top:4mm;font-size:21px}
table.st th,table.st td{border:1.5px solid #1d1d1d;height:13mm;text-align:center;padding:0 1mm}table.st th{background:#ffd23f;height:16mm;line-height:1}
.roleta{display:grid;grid-template-columns:repeat(6,1fr);gap:3mm;margin-top:6mm}.roleta div{border:1.5px dashed #999;height:24mm;display:flex;align-items:center;justify-content:center;font-size:52px}'''
    temas = [('Clássico', ['Nome', 'Animal', 'Fruta', 'Cor', 'Objeto', 'Cidade', 'Profissão']),
             ('Natal', ['Presente', 'Comida da ceia', 'Música', 'Enfeite', 'Nome de rena', 'Filme', 'Desejo pro ano']),
             ('Escola', ['Matéria', 'Material', 'Personagem', 'País', 'Esporte', 'Marca', 'Palavra em inglês']),
             ('Galera', ['Série', 'Cantor(a)', 'Comida', 'Gíria', 'Jogo', 'Desculpa esfarrapada', 'Algo que tem no quarto'])]
    pags = [capa('jogo clássico', 'Stop!', '4 folhas temáticas + letras pra sortear',
                 ''.join(svg(n, 90) for n in ['estrela', 'vela', 'sino', 'pirulito']))]
    pags.append(instrucoes('Como jogar', ['Imprime uma folha por jogador (ou várias, pra várias rodadas).', 'Sorteia uma letra (tem as letras pra recortar no fim).',
                                          'Todo mundo preenche cada coluna com uma palavra que comece com aquela letra.',
                                          'Quem terminar primeiro grita STOP! e todo mundo para.',
                                          'Pontos: palavra que só tu escreveu vale 10, repetida vale 5, em branco vale 0.'], nome))
    for tema, cols in temas:
        th = '<th>Letra</th>' + ''.join(f'<th>{c}</th>' for c in cols) + '<th>Pontos</th>'
        linhas = ''.join('<tr>' + '<td></td>' * (len(cols) + 2) + '</tr>' for _ in range(15))
        pags.append(pagina(f'<div class="tit">Stop · <span class="m">{tema}</span></div><table class="st"><tr>{th}</tr>{linhas}</table>', nome=nome))
    letras = 'A B C D E F G H I J L M N O P R S T U V'.split()
    pags.append(pagina('<div class="tit">Letras pra <span class="m">sortear</span></div><div class="sub">Recorta e coloca num pote.</div><div class="roleta">'
                       + ''.join(f'<div>{l}</div>' for l in letras) + '</div>', nome=nome))
    return salvar('stop-adedonha', documento(nome, pags, css))

# ---------- 8. Batalha Naval ----------
def batalha():
    nome = 'Batalha Naval de Papel'
    css = CSS_PASSOS + '''.bn{display:grid;grid-template-columns:1fr 1fr;gap:6mm;margin-top:3mm}.bn h4{font-size:26px;text-align:center;font-weight:normal}
table.gr{border-collapse:collapse;margin:0 auto;font-family:Nunito,Arial;font-size:11px}table.gr td{width:7.4mm;height:7.4mm;border:1px solid #1d1d1d;text-align:center}
table.gr td.h{border:none;font-weight:700}.frota{font-size:22px;text-align:center;margin-top:2mm}'''
    def grade():
        cab = '<tr><td class="h"></td>' + ''.join(f'<td class="h">{n}</td>' for n in range(1, 11)) + '</tr>'
        return '<table class="gr">' + cab + ''.join(f'<tr><td class="h">{l}</td>' + '<td></td>' * 10 + '</tr>' for l in 'ABCDEFGHIJ') + '</table>'
    frota = '<div class="frota">Frota: 1 porta-aviões (5) · 1 navio (4) · 2 submarinos (3) · 1 lancha (2)</div>'
    pags = [capa('jogo de dupla', 'Batalha<br><span class="r">Naval</span>', '10 folhas de jogo, só precisa de lápis',
                 ''.join(svg(n, 90) for n in ['estrela', 'floco', 'sino', 'bola']))]
    pags.append(instrucoes('Como jogar', ['Cada jogador pega uma folha e esconde dos outros.', 'No mapa "Meu mar", desenha a tua frota: os navios ficam em linha reta, em pé ou deitados, sem encostar.',
                                          'Na tua vez, fala uma casa (ex.: C7). O outro responde "água" ou "fogo". Se afundou o navio inteiro, avisa "afundou!".',
                                          'Marca teus tiros no mapa "Mar do inimigo": X pra fogo, bolinha pra água.',
                                          'Quem afundar a frota inteira do outro primeiro ganha.'], nome))
    for _ in range(10):
        pags.append(pagina(f'<div class="bn"><div><h4>Meu mar</h4>{grade()}</div><div><h4>Mar do inimigo</h4>{grade()}</div></div>{frota}'
                           f'<div class="bn" style="margin-top:8mm"><div><h4>Meu mar</h4>{grade()}</div><div><h4>Mar do inimigo</h4>{grade()}</div></div>{frota}', nome=nome))
    return salvar('batalha-naval', documento(nome, pags, css))

# ---------- 9. Labirintos ----------
def labirintos():
    nome = 'Labirintos Impossíveis'
    niveis = [('Fácil', 8, 10, 12), ('Médio', 14, 12, 18), ('Difícil', 20, 10, 26), ('Insano', 28, 8, 36)]
    COR_NIVEL = {'Fácil': ('#2e9e5b', '#effaf0'), 'Médio': ('#2a78c4', '#eaf4ff'), 'Difícil': ('#e76f51', '#fff1e8'), 'Insano': ('#7b2cbf', '#f4eaff')}
    pags = [capa('pra quebrar a cabeça', 'Labirintos<br><span class="r">Impossíveis</span>', '40 labirintos do fácil ao insano, com respostas',
                 ''.join(svg(n, 90) for n in ['estrela', 'floco', 'presente', 'rena']))]
    sols, n = [], 0
    for nivel, tam, qtd, _ in niveis:
        for k in range(qtd):
            n += 1
            ab, cam = G.labirinto(tam, int(tam * 1.25), 1000 + n)
            sols.append((n, tam, int(tam * 1.25), ab, cam, nivel))
            larg = 120 if tam <= 14 else 170
            pags.append(pagina(f'<div class="tit">Labirinto {n} · <span class="m">{nivel}</span></div><div style="margin-top:4mm">{G.svg_labirinto(tam, int(tam * 1.25), ab, larg_mm=larg, cor=COR_NIVEL[nivel][0], fundo=COR_NIVEL[nivel][1])}</div>', nome=nome))
    for i in range(0, len(sols), 4):
        cel = ''.join(f'<div style="text-align:center;font-size:22px">#{n}{G.svg_labirinto(c, l, ab, cam, larg_mm=70, cor=COR_NIVEL[nv][0], fundo=COR_NIVEL[nv][1])}</div>' for n, c, l, ab, cam, nv in sols[i:i + 4])
        pags.append(pagina(f'<div class="tit" style="font-size:34px">Respostas</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm">{cel}</div>', nome=nome))
    return salvar('labirintos', documento(nome, pags, ''))

# ---------- 10. Enigmas e Sudokus ----------
ENIGMAS = [
 ('O que é, o que é: quanto mais se tira, maior fica?', 'O buraco.'), ('O que é, o que é: tem dentes mas não morde?', 'O pente.'),
 ('O que é, o que é: cai em pé e corre deitado?', 'A chuva.'), ('O que é, o que é: tem cabeça e tem dente, não é bicho e nem é gente?', 'O alho.'),
 ('O que é, o que é: quanto mais seca, mais molhada fica?', 'A toalha.'), ('O que é, o que é: tem pescoço mas não tem cabeça?', 'A garrafa.'),
 ('O pai do João tem 5 filhos: Lalá, Lelé, Lili, Loló e...?', 'João.'), ('Um avião cai bem na fronteira do Brasil com a Argentina. Onde enterram os sobreviventes?', 'Em lugar nenhum: sobrevivente não se enterra.'),
 ('Quantos meses do ano têm 28 dias?', 'Todos.'), ('Tu tá numa corrida e ultrapassa o segundo colocado. Em que lugar tu fica?', 'Em segundo.'),
 ('Um galo bota um ovo bem no alto do telhado. Pra que lado o ovo cai?', 'Nenhum: galo não bota ovo.'), ('O que é teu, mas os outros usam muito mais do que tu?', 'O teu nome.'),
 ('Qual palavra está escrita errado em todos os dicionários?', 'A palavra "errado".'), ('Tem coroa mas não é rei, tem escama mas não é peixe. O que é?', 'O abacaxi.'),
 ('3 gatos pegam 3 ratos em 3 minutos. Quantos gatos pegam 100 ratos em 100 minutos?', '3 gatos (cada gato pega 1 rato a cada 3 minutos).'),
 ('Um tijolo pesa 1 kg mais meio tijolo. Quanto pesa o tijolo inteiro?', '2 kg.'),
 ('Uma bola e um taco custam R$ 1,10 juntos. O taco custa R$ 1,00 a mais que a bola. Quanto custa a bola?', '5 centavos (o taco custa R$ 1,05).'),
 ('Num lago, as plantinhas dobram de tamanho todo dia. Em 48 dias cobrem o lago inteiro. Em quantos dias cobrem metade?', '47 dias.'),
 ('O que é, o que é: é cheio de furos mas segura água?', 'A esponja.'), ('O que é, o que é: anda com os pés na cabeça?', 'O piolho.'),
]

def enigmas():
    nome = 'Enigmas e Sudokus'
    css = '''.eg{display:grid;grid-template-columns:1fr;gap:4mm;margin-top:4mm}.eg>div{border:2px solid #1d1d1d;border-radius:4mm;padding:4mm 6mm;font-size:27px;line-height:1.2}
.eg b{color:#d62828}.sg{display:grid;grid-template-columns:1fr 1fr;gap:8mm 6mm;margin-top:5mm;justify-items:center}.sg>div{text-align:center;font-size:22px}
.resp{font-size:22px;line-height:1.4;columns:2}'''
    pags = [capa('pra quebrar a cabeça', 'Enigmas<br>e <span class="r">Sudokus</span>', '20 enigmas de lógica + 30 sudokus do fácil ao difícil',
                 ''.join(svg(n, 90) for n in ['estrela', 'vela', 'caneca', 'floco']))]
    for i in range(0, 20, 5):
        cel = ''.join(f'<div><b>{i + k + 1}.</b> {p}<br><br></div>' for k, (p, _) in enumerate(ENIGMAS[i:i + 5]))
        pags.append(pagina(f'<div class="tit">Enigmas <span class="m">{i + 1} a {i + 5}</span></div><div class="eg">{cel}</div>', nome=nome))
    sudokus = []
    for k in range(30):
        pistas = 38 if k < 10 else (32 if k < 20 else 27)
        sudokus.append(G.sudoku(500 + k, pistas))
    nivel = lambda k: 'fácil' if k < 10 else ('médio' if k < 20 else 'difícil')
    for i in range(0, 30, 4):
        cel = ''.join(f'<div>Sudoku {i + k + 1} · {nivel(i + k)}{G.svg_sudoku(j, 84)}</div>' for k, (j, s) in enumerate(sudokus[i:i + 4]))
        pags.append(pagina(f'<div class="tit">Sudokus</div><div class="sub">Completa com 1 a 9 sem repetir na linha, na coluna e no quadrado 3×3.</div><div class="sg">{cel}</div>', nome=nome))
    pags.append(pagina('<div class="tit"><span class="m">Respostas</span> dos enigmas</div><div class="resp">'
                       + ''.join(f'<div><b>{i + 1}.</b> {r}</div>' for i, (_, r) in enumerate(ENIGMAS)) + '</div>', nome=nome))
    for i in range(0, 30, 6):
        cel = ''.join(f'<div>Sudoku {i + k + 1}{G.svg_sudoku(j, 58, s)}</div>' for k, (j, s) in enumerate(sudokus[i:i + 6]))
        pags.append(pagina(f'<div class="tit" style="font-size:34px">Respostas dos sudokus</div><div class="sg" style="grid-template-columns:1fr 1fr;gap:4mm">{cel}</div>', nome=nome))
    return salvar('enigmas-e-sudokus', documento(nome, pags, css))

if __name__ == '__main__':
    for f in (etiquetas, cartoes_natal, detetive, escape, verdade_desafio, quem_sou, stop, batalha, labirintos, enigmas):
        print(f())
