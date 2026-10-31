"""Dados de vitrine do lote 1 de Natal. Gera capas, prévias, entradas do loja/produtos.json e o SQL dos preços.
Uso: python3 catalogo.py  (depois de gerar os PDFs com lote1_*.py e node render.js)"""
import json, os, shutil, subprocess
from PIL import Image
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
         titulo_conteudo='Os desenhos', conteudo=['Árvore', 'Estrela', 'Presente', 'Sino', 'Bengala doce', 'Boneco de neve', 'Bolinha', 'Meia', 'Biscoito', 'Rena', 'Gorro', 'Floco de neve', 'Vela', 'Luva', 'Chocolate quente', 'Guirlanda', 'Papai Noel', 'Pirulito', '2 estampas']),
    dict(slug='calendario-advento-desafios', nome='Calendário do Advento de Desafios', preco=5.90, icones=['vela', 'estrela', 'presente'],
         tag='24 dias até o Natal', linha1='Calendário', linha2='do Advento', frase='um desafio por dia, de 1 a 24 de dezembro',
         subtitulo='24 desafios divertidos pra família, um por dia até o Natal',
         descricao='Em vez de chocolate, cada dia de dezembro tem um desafio pra fazer junto: noite de jogos, bilhete escondido, mímica de filme, selfie mais engraçada. Vem com quadro pra pintar os dias e cartões em branco pra vocês inventarem os seus.',
         inclui=['24 cartões de desafio pra recortar', 'Quadro do advento pra pintar os dias', '8 cartões em branco pra inventar desafios', 'Instruções de como montar'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='enfeites-de-papel', nome='Enfeites de Papel pra Pendurar', preco=4.90, icones=['bola', 'floco', 'sino'],
         tag='recorta e monta', linha1='Enfeites', linha2='de Papel', frase='pra colorir, recortar e pendurar',
         subtitulo='18 enfeites redondos pra colorir, recortar e pendurar na árvore',
         descricao='Uma atividade gostosa pra fazer em família antes do Natal: colore, recorta, faz o furinho e pendura. Também dá pra usar como marcador de lugar na mesa da ceia.',
         inclui=['18 enfeites prontos pra recortar', 'Marcação do furinho pra fitinha', 'Dica pra fazer dupla face', 'Instruções passo a passo'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='bingo-de-natal', nome='Bingo de Natal em Família', preco=5.90, icones=['presente', 'sino', 'estrela'],
         tag='jogo pra ceia', linha1='Bingo de', linha2='Natal', frase='30 cartelas diferentes',
         subtitulo='30 cartelas diferentes com desenhos, pra jogar na ceia',
         descricao='Bingo com desenhos em vez de números, então até as crianças pequenas jogam. São 30 cartelas diferentes (2 por folha) e as fichas de sorteio pra recortar.',
         inclui=['30 cartelas diferentes', 'Fichas de sorteio pra recortar', 'Regras e ideias de prêmio', 'Serve pra até 30 jogadores'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='kit-amigo-secreto', nome='Kit Amigo Secreto', preco=4.90, icones=['presente', 'gorro', 'meia'],
         tag='pra família e amigos', linha1='Kit Amigo', linha2='Secreto', frase='sorteio, lista de desejos e cartinha',
         subtitulo='Tudo pro amigo secreto: sorteio, lista de desejos, cartinha e dicas',
         descricao='Organiza o amigo secreto sem estresse: papeizinhos do sorteio, lista de desejos pra cada um preencher, cartinha pro amigo e cartões de dicas pra hora da revelação.',
         inclui=['24 papeizinhos de sorteio', '4 listas de desejos por folha', 'Cartinha pro amigo secreto', '8 cartões de dicas pra revelação', 'Regras divertidas'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='quiz-de-natal', nome='Quiz de Natal', preco=4.90, icones=['noel', 'rena', 'bengala'],
         tag='jogo pra ceia', linha1='Quiz de', linha2='Natal', frase='60 cartas pra ceia',
         subtitulo='30 perguntas de Natal + 30 de "quem da família é mais provável"',
         descricao='Perguntas de Natal com gabarito (renas, Reis Magos, filmes, "Feliz Natal" em outras línguas) e 30 cartas de "quem é mais provável de...", aquelas que fazem todo mundo apontar pro tio do pavê.',
         inclui=['30 perguntas com gabarito', '30 cartas de "quem é mais provável"', 'Regras pra jogar em times', 'Ideias de prenda'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='caca-ao-presente', nome='Caça ao Presente', preco=4.90, icones=['presente', 'meia', 'estrela'],
         tag='brincadeira de Natal', linha1='Caça ao', linha2='Presente', frase='12 pistas pra esconder pela casa',
         subtitulo='Pistas prontas pra esconder o presente pela casa',
         descricao='Transforma a entrega do presente numa aventura: uma pista leva à outra pela casa até o presente. Vem com 12 pistas prontas, cartões em branco e o cartão final de "Achou!".',
         inclui=['12 pistas prontas', '8 pistas em branco pra criar', 'Cartões de "Achou!"', 'Passo a passo de como montar'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='casinha-papai-noel-3d', nome='Casinha do Papai Noel pra Montar', preco=5.90, icones=['noel', 'gorro', 'arvore'],
         tag='recorta e monta', linha1='Casinha do', linha2='Papai Noel', frase='casinha 3D de papel',
         subtitulo='Casinha 3D de papel pra colorir, recortar e montar',
         descricao='Uma casinha de papel com porta, janelas, guirlanda e telhado de telhas, pra colorir e montar. Fica linda perto da árvore ou como porta-bombom.',
         inclui=['Molde da casinha em tamanho real', 'Linhas de corte e de dobra marcadas', 'Passo a passo de montagem'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='jogo-da-memoria-natal', nome='Jogo da Memória de Natal', preco=4.90, icones=['noel', 'rena', 'boneco_neve'],
         tag='jogo pra imprimir', linha1='Jogo da', linha2='Memória', frase='18 pares de desenhos fofos',
         subtitulo='18 pares de desenhos de Natal pra recortar e jogar',
         descricao='36 cartas com desenhos fofos de Natal pra colorir, recortar e jogar com as crianças. Tem também uma página de verso pra deixar as cartas iguais por trás.',
         inclui=['36 cartas (18 pares)', 'Página de verso opcional', 'Regras do jogo'],
         titulo_conteudo='', conteudo=[]),
    dict(slug='retrospectiva-do-ano', nome='Retrospectiva do Meu Ano', preco=4.90, icones=['estrela', 'vela', 'caneca'],
         tag='pra preencher', linha1='Retrospectiva', linha2='do meu ano', frase='pra guardar e reler',
         subtitulo='Páginas pra preencher o que rolou esse ano e o que vem no próximo',
         descricao='O ano em números, melhores momentos, top 5 de músicas e séries, metas pro ano que vem e uma carta pro teu eu do futuro. Perfeito pra fazer na última semana do ano.',
         inclui=['6 páginas pra preencher', 'Top 5 e ano em números', 'Metas pro próximo ano', 'Carta pro eu do futuro'],
         titulo_conteudo='', conteudo=[]),
]

def capa_html(p):
    ics = ''.join(svg(n, 170) for n in p['icones'])
    return f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="base.css"></head><body>
<div class="tag" style="top:70px;left:110px">{p['tag']}</div>
<div style="position:absolute;top:150px;left:100px;right:40px;font-size:112px;line-height:.95">{p['linha1']}<br><span class="u red">{p['linha2']}</span></div>
<div style="position:absolute;top:410px;left:104px;right:50px;font-size:44px">{p['frase']}</div>
<div style="position:absolute;top:560px;left:100px;right:60px;display:flex;justify-content:space-around">{ics}</div>
<div style="position:absolute;top:790px;left:104px;font-size:36px;background:#ffd23f;padding:0 16px;border-radius:8px;transform:rotate(-2deg)">🎄 Natal</div>
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
            im = Image.open(orig).convert('RGB'); im.thumbnail((600, 850))
            nomef = f'{p["slug"]}-{i - 1}.jpg'; im.save(os.path.join(dest, nomef), quality=78)
            previas.append(f'assets/img/previas/{nomef}')
        entradas.append({
            'slug': p['slug'], 'nome': p['nome'], 'subtitulo': p['subtitulo'], 'preco': p['preco'], 'preco_antigo': None,
            'selo': None, 'categoria': 'Natal', 'capa': f'assets/img/capa-{p["slug"]}.png', 'ativo': True, 'destaque': False,
            'descricao': p['descricao'], 'inclui': p['inclui'], 'titulo_conteudo': p['titulo_conteudo'], 'conteudo': p['conteudo'],
            'previas': previas, 'formato': 'PDF pra imprimir · acesso na hora', 'faq': [FAQ_RECEBER, FAQ_IMPRIMIR]})
    # junta no produtos.json sem mexer nos produtos que já existem
    caminho = os.path.join(LOJA, 'produtos.json')
    atuais = json.load(open(caminho, encoding='utf-8'))
    slugs = {e['slug'] for e in entradas}
    atuais = [a for a in atuais if a['slug'] not in slugs]
    ativos_antes = [a for a in atuais if a.get('ativo')]
    inativos = [a for a in atuais if not a.get('ativo')]
    json.dump(entradas + ativos_antes + inativos, open(caminho, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    # SQL e lista de upload
    sql = ['-- Lote 1 de Natal: preço cobrado e arquivo no bucket "produtos".', 'insert into produtos (slug, nome, preco, arquivo) values']
    sql.append(',\n'.join(f"  ('{p['slug']}', '{p['nome']}', {p['preco']:.2f}, 'natal/{p['slug']}.pdf')" for p in PRODUTOS))
    sql.append('on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;')
    open(os.path.join(LOJA, 'supabase', 'lote-natal-1.sql'), 'w', encoding='utf-8').write('\n'.join(sql) + '\n')

if __name__ == '__main__':
    gerar()
