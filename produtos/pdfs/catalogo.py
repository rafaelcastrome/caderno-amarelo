"""Dados de vitrine do lote 1 de Natal. Gera capas, prévias, entradas do loja/produtos.json e o SQL dos preços.
Uso: python3 catalogo.py  (depois de gerar os PDFs com lote1_*.py e node render.js)"""
import json, os, shutil, subprocess
from PIL import Image, ImageDraw, ImageFont
from icones import svg

AQUI = os.path.dirname(os.path.abspath(__file__))
LOJA = os.path.join(AQUI, '..', '..', 'loja')

FAQ_IMPRIMIR = ['Precisa imprimir?', 'Sim, é feito pra imprimir em casa ou na papelaria, em folha A4. Dá pra imprimir quantas vezes quiser pra uso da família.']
FAQ_RECEBER = ['Como eu recebo?', 'Assim que o Pix cai, o botão de download aparece na tela e você também recebe o link no e-mail.']

PRODUTOS = [
    dict(slug='natal-fofo-colorir', nome='Natal Fofo pra Colorir', preco=6.90, icones=['caneca', 'biscoito', 'noel'],
         tag='livro de colorir', linha1='Natal', linha2='Fofo', frase='20 desenhos fofos de traço grosso',
         subtitulo='20 desenhos fofos de Natal com traço grosso, pra colorir com calma',
         descricao='Papai Noel, rena, boneco de neve, biscoito, caneca de chocolate quente e muito mais, todos com carinha. Traço grosso, desenhos grandes e cenário de neve, no estilo aconchegante que tá todo mundo colorindo.',
         inclui=['21 páginas A4 pra imprimir', '18 personagens de Natal em página inteira', '2 estampas de papel de presente pra colorir', 'Imprime quantas vezes quiser'],
         titulo_conteudo='Os desenhos', conteudo=['Árvore', 'Estrela', 'Presente', 'Sino', 'Bengala doce', 'Boneco de neve', 'Bolinha', 'Meia', 'Biscoito', 'Rena', 'Gorro', 'Floco de neve', 'Vela', 'Luva', 'Chocolate quente', 'Guirlanda', 'Papai Noel', 'Pirulito', '2 estampas'], categoria='Natal', pasta='natal', lote=1),
    dict(slug='calendario-advento-desafios', nome='Calendário do Advento de Desafios', preco=5.90, icones=['vela', 'estrela', 'presente'],
         tag='24 dias até o Natal', linha1='Calendário', linha2='do Advento', frase='um desafio por dia, de 1 a 24 de dezembro',
         subtitulo='24 desafios divertidos pra família, um por dia até o Natal',
         descricao='Em vez de chocolate, cada dia de dezembro tem um desafio pra fazer junto: noite de jogos, bilhete escondido, mímica de filme, selfie mais engraçada. Vem com quadro pra pintar os dias e cartões em branco pra vocês inventarem os seus.',
         inclui=['24 cartões de desafio pra recortar', 'Quadro do advento pra pintar os dias', '8 cartões em branco pra inventar desafios', 'Instruções de como montar'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='enfeites-de-papel', nome='Enfeites de Papel pra Pendurar', preco=4.90, icones=['bola', 'floco', 'sino'],
         tag='recorta e monta', linha1='Enfeites', linha2='de Papel', frase='pra colorir, recortar e pendurar',
         subtitulo='18 enfeites redondos pra colorir, recortar e pendurar na árvore',
         descricao='Uma atividade gostosa pra fazer em família antes do Natal: colore, recorta, faz o furinho e pendura. Também dá pra usar como marcador de lugar na mesa da ceia.',
         inclui=['18 enfeites prontos pra recortar', 'Marcação do furinho pra fitinha', 'Dica pra fazer dupla face', 'Instruções passo a passo'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='bingo-de-natal', nome='Bingo de Natal em Família', preco=5.90, icones=['presente', 'sino', 'estrela'],
         tag='jogo pra ceia', linha1='Bingo de', linha2='Natal', frase='30 cartelas diferentes',
         subtitulo='30 cartelas diferentes com desenhos, pra jogar na ceia',
         descricao='Bingo com desenhos em vez de números, então até as crianças pequenas jogam. São 30 cartelas diferentes (2 por folha) e as fichas de sorteio pra recortar.',
         inclui=['30 cartelas diferentes', 'Fichas de sorteio pra recortar', 'Regras e ideias de prêmio', 'Serve pra até 30 jogadores'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='kit-amigo-secreto', nome='Kit Amigo Secreto', preco=4.90, icones=['presente', 'gorro', 'meia'],
         tag='pra família e amigos', linha1='Kit Amigo', linha2='Secreto', frase='sorteio, lista de desejos e cartinha',
         subtitulo='Tudo pro amigo secreto: sorteio, lista de desejos, cartinha e dicas',
         descricao='Organiza o amigo secreto sem estresse: papeizinhos do sorteio, lista de desejos pra cada um preencher, cartinha pro amigo e cartões de dicas pra hora da revelação.',
         inclui=['24 papeizinhos de sorteio', '4 listas de desejos por folha', 'Cartinha pro amigo secreto', '8 cartões de dicas pra revelação', 'Regras divertidas'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='quiz-de-natal', nome='Quiz de Natal', preco=4.90, icones=['noel', 'rena', 'bengala'],
         tag='jogo pra ceia', linha1='Quiz de', linha2='Natal', frase='60 cartas pra ceia',
         subtitulo='30 perguntas de Natal + 30 de "quem da família é mais provável"',
         descricao='Perguntas de Natal com gabarito (renas, Reis Magos, filmes, "Feliz Natal" em outras línguas) e 30 cartas de "quem é mais provável de...", aquelas que fazem todo mundo apontar pro tio do pavê.',
         inclui=['30 perguntas com gabarito', '30 cartas de "quem é mais provável"', 'Regras pra jogar em times', 'Ideias de prenda'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='caca-ao-presente', nome='Caça ao Presente', preco=4.90, icones=['presente', 'meia', 'estrela'],
         tag='brincadeira de Natal', linha1='Caça ao', linha2='Presente', frase='12 pistas pra esconder pela casa',
         subtitulo='Pistas prontas pra esconder o presente pela casa',
         descricao='Transforma a entrega do presente numa aventura: uma pista leva à outra pela casa até o presente. Vem com 12 pistas prontas, cartões em branco e o cartão final de "Achou!".',
         inclui=['12 pistas prontas', '8 pistas em branco pra criar', 'Cartões de "Achou!"', 'Passo a passo de como montar'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='casinha-papai-noel-3d', nome='Vilinha do Papai Noel pra Montar', preco=5.90, icones=['noel', 'arvore', 'rena'],
         tag='recorta e monta', linha1='Vilinha do', linha2='Papai Noel', frase='casinha 3D, árvore e bonequinhos',
         subtitulo='Casinha 3D, árvore de encaixar e 12 bonequinhos de pé pra montar a cena',
         descricao='Monta uma vilinha de Natal de papel: a casinha do Papai Noel com porta, janelas e telhado de telhas, uma árvore 3D de encaixar e 12 bonequinhos que ficam em pé (Noel, rena, boneco de neve, biscoito e mais). Tudo pra colorir antes de recortar.',
         inclui=['Molde da casinha 3D em tamanho real', 'Árvore 3D de encaixar', '12 bonequinhos de pé', 'Linhas de corte e de dobra marcadas', 'Passo a passo de montagem'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='jogo-da-memoria-natal', nome='Jogo da Memória de Natal', preco=4.90, icones=['noel', 'rena', 'boneco_neve'],
         tag='jogo pra imprimir', linha1='Jogo da', linha2='Memória', frase='18 pares de desenhos fofos',
         subtitulo='18 pares de desenhos de Natal pra recortar e jogar',
         descricao='36 cartas com desenhos fofos de Natal pra colorir, recortar e jogar com as crianças. Tem também uma página de verso pra deixar as cartas iguais por trás.',
         inclui=['36 cartas (18 pares)', 'Página de verso opcional', 'Regras do jogo'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
    dict(slug='retrospectiva-do-ano', nome='Retrospectiva do Meu Ano', preco=4.90, icones=['estrela', 'vela', 'caneca'],
         tag='pra preencher', linha1='Retrospectiva', linha2='do meu ano', frase='pra guardar e reler',
         subtitulo='Páginas pra preencher o que rolou esse ano e o que vem no próximo',
         descricao='O ano em números, melhores momentos, top 5 de músicas e séries, metas pro ano que vem e uma carta pro teu eu do futuro. Perfeito pra fazer na última semana do ano.',
         inclui=['6 páginas pra preencher', 'Top 5 e ano em números', 'Metas pro próximo ano', 'Carta pro eu do futuro'],
         titulo_conteudo='', conteudo=[], categoria='Natal', pasta='natal', lote=1),
]

FAQ_JOGO = ['Quantas pessoas jogam?', 'Depende do jogo, mas todos funcionam em família ou com amigos. As regras estão no começo do PDF.']
J = dict(categoria='Jogos', pasta='lote2', lote=2, titulo_conteudo='', conteudo=[])
N2 = dict(categoria='Natal', pasta='lote2', lote=2, titulo_conteudo='', conteudo=[])
PRODUTOS += [
    dict(slug='etiquetas-de-presente', nome='Etiquetas de Presente de Natal', preco=3.90, icones=['presente', 'gorro', 'sino'],
         tag='pra embrulhar', linha1='Etiquetas', linha2='de Presente', frase='48 etiquetas fofas "De / Para"',
         subtitulo='48 etiquetas fofas de "De / Para" pra colorir e amarrar no presente',
         descricao='Etiquetas no formato de tag, com furinho pra fitinha, desenhos de Natal com carinha e frases como "Não abre antes!". Colore, recorta e deixa os presentes mais bonitos.',
         inclui=['48 etiquetas em 3 folhas', 'Campos De e Para', '6 frases diferentes', 'Marcação do furinho'], **N2),
    dict(slug='cartoes-de-natal-colorir', nome='Cartões de Natal pra Colorir', preco=4.90, icones=['guirlanda', 'noel', 'arvore'],
         tag='pra dar de presente', linha1='Cartões', linha2='de Natal', frase='12 cartões pra colorir e dobrar',
         subtitulo='12 cartões dobráveis pra colorir, escrever e entregar',
         descricao='Cartões de Natal que a criança (ou tu mesmo) colore e entrega pra família, professores e amigos. Cada um tem um desenho grande e uma mensagem, e o lado de dentro fica livre pra escrever.',
         inclui=['12 cartões, 2 por folha', 'Mensagens como "Feliz Natal, vovó!"', 'Linha de dobra marcada', 'Instruções de montagem'], **N2),
    dict(slug='detetive-do-caderno', nome='Detetive do Caderno: o Mistério do Pudim', preco=5.90, icones=['caneca', 'estrela', 'luva'],
         tag='jogo de mistério', linha1='Detetive', linha2='do Caderno', frase='o Mistério do Pudim Sumido',
         subtitulo='Um mistério pra resolver em grupo: 6 suspeitos, 8 pistas e 1 culpado',
         descricao='O pudim da vovó sumiu da geladeira e seis pessoas estavam na casa. Vocês leem a história, revelam as pistas uma a uma e eliminam suspeitos até achar o culpado. A solução vem explicada no final.',
         inclui=['História do mistério', 'Fichas dos 6 suspeitos', '8 cartas de pista', 'Solução explicada passo a passo'], **J),
    dict(slug='escape-room-em-casa', nome='Escape Room em Casa', preco=5.90, icones=['estrela', 'vela', 'sino'],
         tag='jogo de fuga', linha1='Escape Room', linha2='em Casa', frase='5 enigmas pra sair do quarto',
         subtitulo='5 enigmas em sequência pra abrir o cadeado e escapar',
         descricao='Vocês estão trancados no Quarto do Caderno. Cada enigma (mensagem secreta, sequência, espelho e relógio) revela um número do cadeado. Dá pra esconder os enigmas pela casa e jogar contra o relógio.',
         inclui=['4 enigmas + o cadeado final', 'Dicas pra quem organiza', 'Respostas no final'], **J),
    dict(slug='verdade-ou-desafio', nome='Verdade ou Desafio Fofo', preco=5.90, icones=['estrela', 'pirulito', 'caneca'],
         tag='jogo pra galera', linha1='Verdade', linha2='ou Desafio', frase='100 cartas leves e engraçadas',
         subtitulo='50 verdades e 50 desafios leves, pra rir com os amigos e a família',
         descricao='Perguntas e desafios divertidos, sem nada pesado ou constrangedor: imitar bicho, falar com sotaque, contar o maior mico. Bom pra festa do pijama, viagem e reunião de família.',
         inclui=['50 cartas de verdade', '50 cartas de desafio', 'Regras do jogo'], **J),
    dict(slug='quem-sou-eu', nome='Quem Sou Eu?', preco=5.90, icones=['rena', 'noel', 'biscoito'],
         tag='jogo de adivinhar', linha1='Quem', linha2='Sou Eu?', frase='120 cartas pra colar na testa',
         subtitulo='120 cartas em 5 categorias pra adivinhar fazendo perguntas de sim ou não',
         descricao='Cada um segura uma carta na testa sem ver e tem que descobrir o que é fazendo perguntas de sim ou não. São 120 cartas de bichos, profissões, comidas, objetos e lugares.',
         inclui=['120 cartas pra recortar', '5 categorias', 'Regras do jogo'], **J),
    dict(slug='stop-adedonha', nome='Stop / Adedonha', preco=3.90, icones=['estrela', 'vela', 'pirulito'],
         tag='jogo clássico', linha1='Stop!', linha2='Adedonha', frase='4 folhas temáticas',
         subtitulo='Folhas prontas de Stop em 4 temas e letras pra sortear',
         descricao='O clássico jogo de papel com folhas prontas em 4 temas: Clássico, Natal, Escola e Galera. Imprime quantas quiser e vem com as letras pra sortear.',
         inclui=['4 folhas temáticas', '15 rodadas por folha', 'Letras pra sortear', 'Regras e pontuação'], **J),
    dict(slug='batalha-naval', nome='Batalha Naval de Papel', preco=3.90, icones=['estrela', 'floco', 'bola'],
         tag='jogo de dupla', linha1='Batalha', linha2='Naval', frase='10 folhas, só precisa de lápis',
         subtitulo='Folhas prontas de Batalha Naval pra jogar em dupla',
         descricao='Cada folha tem o teu mar e o mar do inimigo, duas partidas por folha. É só imprimir, pegar um lápis e começar a afundar navios.',
         inclui=['10 folhas (20 partidas)', 'Lista da frota', 'Regras do jogo'], **J),
    dict(slug='labirintos', nome='Labirintos Impossíveis', preco=4.90, icones=['estrela', 'floco', 'rena'],
         tag='pra quebrar a cabeça', linha1='Labirintos', linha2='Impossíveis', frase='40 labirintos com respostas',
         subtitulo='40 labirintos do fácil ao insano, com as respostas no final',
         descricao='Labirintos em 4 níveis: fácil, médio, difícil e insano. Bom pra criança, pra adulto que acha que é fácil e pra viagem longa. As respostas vêm desenhadas no final.',
         inclui=['40 labirintos em 4 níveis', 'Respostas desenhadas', '1 labirinto por página'], **J),
    dict(slug='enigmas-e-sudokus', nome='Enigmas e Sudokus', preco=4.90, icones=['estrela', 'vela', 'floco'],
         tag='pra quebrar a cabeça', linha1='Enigmas', linha2='e Sudokus', frase='20 enigmas + 30 sudokus',
         subtitulo='20 enigmas de lógica e 30 sudokus do fácil ao difícil, com respostas',
         descricao='Charadas e enigmas de lógica pra desafiar a família ("quantos meses têm 28 dias?") e 30 sudokus em 3 níveis. Todas as respostas no final.',
         inclui=['20 enigmas de lógica', '30 sudokus em 3 níveis', 'Respostas de tudo'], **J),
]

def marca_dagua(im):
    """Prévia da loja: resolução baixa e marca d'água em diagonal, pra não servir de cópia pra imprimir."""
    im.thumbnail((480, 680))
    camada = Image.new('RGBA', (im.width * 2, im.height * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    fonte = ImageFont.truetype(os.path.join(AQUI, 'Caveat-Bold.ttf'), 34)
    texto = 'AMOSTRA · @Cardeno_Amarelo · '
    for y in range(0, camada.height, 70):
        d.text(((y // 70) % 2 * -120, y), texto * 6, font=fonte, fill=(214, 40, 40, 70))
    camada = camada.rotate(30, resample=Image.BICUBIC)
    camada = camada.crop((im.width // 2, im.height // 2, im.width // 2 + im.width, im.height // 2 + im.height))
    faixa = ImageDraw.Draw(camada)
    faixa.rectangle((0, im.height - 44, im.width, im.height), fill=(255, 210, 63, 235))
    f2 = ImageFont.truetype(os.path.join(AQUI, 'Caveat-Bold.ttf'), 30)
    faixa.text((im.width / 2, im.height - 22), 'amostra · o PDF completo vem sem marca', font=f2, fill=(29, 29, 29, 255), anchor='mm')
    return Image.alpha_composite(im.convert('RGBA'), camada).convert('RGB')

def capa_html(p):
    ics = ''.join(svg(n, 170) for n in p['icones'])
    return f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="base.css"></head><body>
<div class="tag" style="top:70px;left:110px">{p['tag']}</div>
<div style="position:absolute;top:150px;left:100px;right:40px;font-size:112px;line-height:.95">{p['linha1']}<br><span class="u red">{p['linha2']}</span></div>
<div style="position:absolute;top:410px;left:104px;right:50px;font-size:44px">{p['frase']}</div>
<div style="position:absolute;top:560px;left:100px;right:60px;display:flex;justify-content:space-around">{ics}</div>
<div style="position:absolute;top:790px;left:104px;font-size:36px;background:#ffd23f;padding:0 16px;border-radius:8px;transform:rotate(-2deg)">{'🎄 Natal' if p['categoria'] == 'Natal' else '🎲 ' + p['categoria']}</div>
<div style="position:absolute;bottom:50px;right:50px;font-size:34px;color:#8a8a8a">@Cardeno_Amarelo</div>
</body></html>'''

def gerar():
    fonte = os.path.join(LOJA, '_fonte_capas')
    for p in PRODUTOS:
        open(os.path.join(fonte, f'natal-{p["slug"]}.html'), 'w', encoding='utf-8').write(capa_html(p))
    # prévias: páginas 2 a 4 de cada PDF, em JPG leve
    dest = os.path.join(LOJA, 'assets', 'img', 'previas'); os.makedirs(dest, exist_ok=True)
    entradas = []
    for p in PRODUTOS:
        previas = []
        for i in (2, 3, 4):
            orig = os.path.join(AQUI, 'previa', f'{p["slug"]}-{i}.png')
            if not os.path.exists(orig):
                continue
            im = marca_dagua(Image.open(orig).convert('RGB'))
            nomef = f'{p["slug"]}-{i - 1}.jpg'; im.save(os.path.join(dest, nomef), quality=78)
            previas.append(f'assets/img/previas/{nomef}')
        entradas.append({
            'slug': p['slug'], 'nome': p['nome'], 'subtitulo': p['subtitulo'], 'preco': p['preco'], 'preco_antigo': None,
            'selo': None, 'categoria': p['categoria'], 'capa': f'assets/img/capa-{p["slug"]}.png', 'ativo': True, 'destaque': False,
            'descricao': p['descricao'], 'inclui': p['inclui'], 'titulo_conteudo': p['titulo_conteudo'], 'conteudo': p['conteudo'],
            'previas': previas, 'formato': 'PDF pra imprimir · acesso na hora', 'faq': [FAQ_RECEBER, FAQ_IMPRIMIR] + ([FAQ_JOGO] if p['categoria'] == 'Jogos' else [])})
    # junta no produtos.json sem mexer nos produtos que já existem
    caminho = os.path.join(LOJA, 'produtos.json')
    atuais = json.load(open(caminho, encoding='utf-8'))
    slugs = {e['slug'] for e in entradas}
    atuais = [a for a in atuais if a['slug'] not in slugs]
    ativos_antes = [a for a in atuais if a.get('ativo')]
    inativos = [a for a in atuais if not a.get('ativo')]
    json.dump(entradas + ativos_antes + inativos, open(caminho, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    # um SQL por lote, com o preço cobrado e o caminho do PDF no bucket
    for lote in sorted({p['lote'] for p in PRODUTOS}):
        do_lote = [p for p in PRODUTOS if p['lote'] == lote]
        sql = [f'-- Lote {lote}: preço cobrado e arquivo no bucket "produtos".', 'insert into produtos (slug, nome, preco, arquivo) values']
        sql.append(',\n'.join(f"  ('{p['slug']}', '{p['nome']}', {p['preco']:.2f}, '{p['pasta']}/{p['slug']}.pdf')" for p in do_lote))
        sql.append('on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;')
        nome_sql = 'lote-natal-1.sql' if lote == 1 else f'lote-{lote}.sql'
        open(os.path.join(LOJA, 'supabase', nome_sql), 'w', encoding='utf-8').write('\n'.join(sql) + '\n')

if __name__ == '__main__':
    gerar()
