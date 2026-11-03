"""Padrão de vitrine de todos os produtos da loja (thread 24, 03/11/2026).

1. "Como funciona" na página do produto: os passos de comprar e baixar são iguais pra todos (ficam no loja.js);
   aqui ficam os passos de cada produto (imprimir, montar, usar), curtos e no tom da loja.
2. Prévias: a página de instrução ("Como fazer", "Como jogar"...) é a PRIMEIRA prévia e vai SEM marca d'água,
   em resolução boa pra ler. As páginas de conteúdo continuam com a marca "AMOSTRA" (catalogo.marca_dagua).
   Produtos que já vêm pintados dizem isso nas instruções; só os livros de colorir pedem pra pintar.

Uso: python3 vitrine_padrao.py  (depois de gerar os HTML com lote*.py e rodar `PAGS=8 node render.js`).
Mexe só no campo como_funciona, nas prévias e no ?v= delas; o resto do produtos.json fica como está.
"""
import json, os, re
from PIL import Image
from catalogo import marca_dagua

AQUI = os.path.dirname(os.path.abspath(__file__))
LOJA = os.path.join(AQUI, '..', '..', 'loja')
VERSAO = '2'  # muda quando as prévias mudarem, pra ninguém ver a imagem velha do cache

COR = 'Imprime em folha A4, em impressora colorida (em casa ou na papelaria).'
COR_GROSSO = 'Imprime em A4, em impressora colorida. Papel mais grosso (tipo 180 g) deixa mais firme.'

COMO_FUNCIONA = {
    'natal-fofo-colorir': ['Imprime as páginas em A4, pode ser em preto e branco.',
                           'Pinta as cenas com lápis de cor, giz ou canetinha.',
                           'Se quiser, fura nas marquinhas e monta um caderninho (o passo a passo vem no PDF).'],
    'calendario-advento-desafios': [COR, 'Recorta os 24 cartões e guarda cada um num envelope, saquinho ou meia.',
                                    'De 1 a 24 de dezembro, abre o cartão do dia e a família faz o desafio.'],
    'enfeites-de-papel': [COR_GROSSO, 'Já vêm pintados: é só recortar no tracejado e furar a bolinha de cima.',
                          'Passa uma fitinha no furo e pendura na árvore.'],
    'bingo-de-natal': [COR, 'Recorta as cartelas e as fichas de sorteio e põe as fichas num saquinho.',
                       'Alguém sorteia, quem tem o desenho marca com um feijão. Fechou a linha, grita BINGO!'],
    'kit-amigo-secreto': [COR, 'Escreve os nomes nos papeizinhos e cada um sorteia o seu.',
                          'Cada um preenche a lista de desejos, e na revelação tem a cartinha e as dicas.'],
    'quiz-de-natal': [COR, 'Recorta os cartões de pergunta.',
                      'Divide a família em times e lê as perguntas. O gabarito tá no fim do PDF.'],
    'caca-ao-presente': [COR, 'Recorta as pistas e esconde cada uma no lugar que a pista anterior descreve.',
                         'Entrega a primeira na mão e o presente fica no fim da trilha.'],
    'casinha-papai-noel-3d': ['Imprime em tamanho real (100%), em impressora colorida e papel 180 g ou mais.',
                              'Já vem pintada: recorta na linha contínua e dobra no tracejado.',
                              'Cola as abas e monta a casinha, a árvore 3D e os bonequinhos.'],
    'jogo-da-memoria-natal': [COR_GROSSO, 'As cartas já vêm pintadas: é só recortar as 36 no tracejado.',
                              'Embaralha viradas pra baixo e vira duas por vez. Achou o par, fica com ele.'],
    'retrospectiva-do-ano': ['Imprime as páginas em A4 (colorida ou preto e branco).',
                             'Preenche com caneta: o ano em números, melhores momentos, top 5 e metas.',
                             'Guarda a carta pro teu eu do futuro e abre no fim do ano que vem.'],
    'etiquetas-de-presente': [COR_GROSSO, 'Já vêm pintadas: recorta, fura a bolinha e escreve De e Para.',
                              'Amarra no presente com uma fitinha.'],
    'cartoes-de-natal-colorir': [COR_GROSSO, 'Já vêm pintados: recorta no tracejado e dobra ao meio.',
                                 'Escreve a tua mensagem por dentro e entrega.'],
    'detetive-do-caderno': [COR, 'Recorta as fichas dos suspeitos e as pistas.',
                            'Lê a história, revela as pistas uma a uma e descobre o culpado. A solução vem lacrada no fim.'],
    'escape-room-em-casa': [COR, 'Esconde os enigmas pela casa (ou entrega na mão).',
                            'Cada enigma resolvido dá um número. Os 4 números abrem o cadeado final.'],
    'verdade-ou-desafio': [COR, 'Recorta as cartas e separa em dois montes: Verdade e Desafio.',
                           'Na tua vez, escolhe um monte e tira uma carta.'],
    'quem-sou-eu': [COR, 'Recorta as cartas e embaralha.',
                    'Cada um põe uma carta na testa sem olhar e faz perguntas de sim ou não pra adivinhar.'],
    'stop-adedonha': ['Imprime uma folha por jogador (colorida ou preto e branco).',
                      'Sorteia uma letra e todo mundo preenche as colunas. Quem terminar grita STOP!'],
    'batalha-naval': ['Imprime uma folha por jogador (colorida ou preto e branco).',
                      'Cada um desenha os navios escondido e vocês vão chutando casas: água ou fogo!'],
    'labirintos': ['Imprime as páginas que quiser (colorida ou preto e branco).',
                   'Resolve com lápis, do fácil ao insano. As respostas estão no fim do PDF.'],
    'enigmas-e-sudokus': ['Imprime as páginas que quiser (colorida ou preto e branco).',
                          'Resolve sozinho ou em família. Todas as respostas estão no fim do PDF.'],
    'bandeirinhas-de-natal': [COR, 'Já vêm pintadas: recorta cada bandeirinha e dobra a faixa de cima.',
                              'Passa o barbante por dentro, monta FELIZ NATAL e pendura.'],
    'papel-de-presente-natal': ['Imprime a estampa que quiser em A4, em impressora colorida, tamanho real (100%).',
                                'Embrulha caixinhas e presentes pequenos. Pros grandes, emenda duas folhas com fita.'],
    'marcadores-de-pagina-natal': [COR_GROSSO, 'Já vêm pintados: recorta no tracejado e fura a bolinha de cima.',
                                   'Amarra uma fitinha e usa no teu livro ou dá de presente.'],
    'kit-ceia-de-natal': [COR, 'Recorta os convites, os marcadores de lugar e as plaquinhas.',
                          'Preenche o cardápio e as listas e arruma a mesa da ceia.'],
    'vales-de-natal': [COR, 'Recorta os vales e escolhe os que combinam com a pessoa.',
                       'Põe num envelope ou numa meia e dá de presente. Ela resgata quando quiser.'],
    'domino-de-natal': [COR_GROSSO, 'As 28 peças já vêm pintadas: é só recortar no tracejado.',
                        'Cada um pega 7 peças e vai encaixando figura com figura. Ganha quem acabar primeiro.'],
    'trilha-de-natal': [COR_GROSSO, 'Recorta os peões, monta o dado e separa as cartas surpresa.',
                        'Joga o dado e anda pelas 42 casas. Quem chegar primeiro na casa do Papai Noel ganha.'],
    'adesivos-de-natal': ['Imprime em papel adesivo A4, em impressora colorida (ou em papel comum e usa cola).',
                          'Já vêm pintados: recorta cada adesivo e cola em cartões, presentes e cadernos.'],
    'kit-mentalista': ['Abre o PDF no celular ou imprime, se preferir.',
                       'Escolhe um truque e treina: cada um vem com as falas e o segredo.',
                       'Apresenta pra família e pros amigos e vê a cara deles.'],
}


def paginas(slug):
    h = open(os.path.join(AQUI, 'html', slug + '.html'), encoding='utf-8').read()
    return re.findall(r'<section class="pag[^"]*">(.*?)</section>', h, re.S)


def pagina_instrucao(slug):
    """Número da página (1 = capa) que tem a lista de passos, ou None."""
    for i, s in enumerate(paginas(slug)):
        if 'class="passos"' in s:
            return i + 1
    return None


def limpa(im):
    """Prévia de instrução: sem marca d'água e grande o bastante pra ler no celular."""
    im.thumbnail((760, 1075))
    return im


def aplicar():
    caminho = os.path.join(LOJA, 'produtos.json')
    produtos = json.load(open(caminho, encoding='utf-8'))
    dest = os.path.join(LOJA, 'assets', 'img', 'previas')
    for p in produtos:
        slug = p['slug']
        if slug in COMO_FUNCIONA:
            p['como_funciona'] = COMO_FUNCIONA[slug]
        if not os.path.exists(os.path.join(AQUI, 'html', slug + '.html')) or slug == 'natal-fofo-colorir':
            continue  # kit mentalista e o livro de colorir têm prévias próprias
        instr = pagina_instrucao(slug)
        # páginas de conteúdo que já aparecem na loja (o arquivo slug-N.jpg é a página N+1 do PDF)
        atuais = [int(m.group(1)) + 1 for s in p['previas'] if (m := re.search(r'-(\d+)\.jpg', s))]
        conteudo = [n for n in atuais if n != instr]
        novas = []
        for n, instrucao in ([(instr, True)] if instr else []) + [(n, False) for n in conteudo]:
            orig = os.path.join(AQUI, 'previa', f'{slug}-{n}.png')
            im = Image.open(orig).convert('RGB')
            im = limpa(im) if instrucao else marca_dagua(im)
            nomef = f'{slug}-{n - 1}.jpg'
            im.save(os.path.join(dest, nomef), quality=82 if instrucao else 78)
            novas.append(f'assets/img/previas/{nomef}?v={VERSAO}')
        p['previas'] = novas[:4]
        p['previa_instrucao'] = bool(instr)
    json.dump(produtos, open(caminho, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(caminho, 'a', encoding='utf-8').write('\n')


if __name__ == '__main__':
    aplicar()
