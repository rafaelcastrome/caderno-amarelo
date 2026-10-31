"""Base comum dos PDFs de Natal: páginas A4 brancas (economiza tinta), fonte Caveat e detalhes do caderno amarelo."""
import os

AQUI = os.path.dirname(os.path.abspath(__file__))

CSS = '''
@font-face{font-family:Caveat;src:url(../Caveat-Bold.ttf)}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Caveat,cursive;color:#1d1d1d;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pag{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:#fff;padding:16mm 15mm 18mm}
.pag:last-child{page-break-after:auto}
.rodape{position:absolute;left:15mm;right:15mm;bottom:7mm;display:flex;justify-content:space-between;font-size:15px;color:#999}
.tit{font-size:46px;line-height:1.05}
.tit .m{background:linear-gradient(transparent 58%,#ffd23f 58%);padding:0 4px}
.sub{font-size:24px;color:#555;margin-top:4px}
.r{color:#d62828}.g{color:#2e7d32}
.capa{background:#fbf5df;background-image:linear-gradient(#cfdbee 1px,transparent 1px),linear-gradient(90deg,#cfdbee 1px,transparent 1px);background-size:9mm 9mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.capa .tag{background:#ffd23f;font-size:30px;padding:2px 22px;border-radius:8px;transform:rotate(-2deg);margin-bottom:18px}
.capa h1{font-size:96px;line-height:.95}
.capa .sub{font-size:34px;margin-top:16px}
.capa .icones{display:flex;gap:10px;margin-top:40px}
.corte{border:2px dashed #888}
.txt{font-family:Nunito,Arial,sans-serif}
.pag.cheia{padding:0}
.pag.cheia::before,.pag.cheia::after{display:none}
'''

PASTEIS = ['#ffe1e1', '#def3dc', '#fff2bf', '#dcefff', '#efe2fb', '#ffe8d2']

def ciclo(seletor, n=6, prop='background'):
    """Pinta os filhos de um grid com pastéis que se repetem (nth-child)."""
    return ''.join(f'{seletor}:nth-child({n}n+{k + 1}){{{prop}:{PASTEIS[k % 6]}}}' for k in range(n))

# Tudo que é de recortar ou de jogar já vem pintado. Só o livro de colorir usa pb=True (preto e branco, pra pintar).
COR = (
    '.pag::before,.pag::after{content:"";position:absolute;left:0;right:0;height:4mm;'
    'background:repeating-linear-gradient(135deg,#e63946 0 5mm,#fff 5mm 7mm,#2e9e5b 7mm 12mm,#fff 12mm 14mm)}'
    '.pag::before{top:0}.pag::after{bottom:0}'
    '.capa::before,.capa::after{height:12mm}'
    '.capa h1{text-shadow:3px 3px 0 #ffd23f}.capa .tag{background:#e63946;color:#fff;border:3px solid #1d1d1d}'
    '.tit{color:#1f7a4a}.tit .m{background:linear-gradient(transparent 58%,#ffd23f 58%)}'
    '.sub{color:#8a4b1f}'
    + ciclo('.ct') + ciclo('.papeis>div') + ciclo('.lista>div') + ciclo('.fichas>div') + ciclo('.num>div') + ciclo('.sus>div')
    + ciclo('.tenda') + ciclo('.cal>div') + ciclo('.roleta>div') + ciclo('.eti>.tag') + ciclo('.grade-cartas>div') + ciclo('.caixa')
    + ciclo('.eg2>div')
    + ''.join(f'.enf:nth-child(6n+{k + 1}){{--c:{c}}}' for k, c in enumerate(['#ff9aa2', '#8fd19e', '#ffd966', '#8ecae6', '#c9a7eb', '#ffb085']))
    + '.enf svg{position:relative;z-index:1}.enf .forma{background:radial-gradient(circle,#fff 0 56%,var(--c) 58%)}'
    '.cartela{border-color:#c1121f}.cartela:nth-child(even){border-color:#1f7a4a}.cartela h3{color:#1f7a4a}'
    '.bcg{border-color:#c1121f}.cartela:nth-child(even) .bcg{border-color:#1f7a4a}'
    '.bcg div:nth-child(8n+1),.bcg div:nth-child(8n+3),.bcg div:nth-child(8n+6),.bcg div:nth-child(8n+8){background:#fff2bf}'
    '.bcg div:nth-child(8n+2),.bcg div:nth-child(8n+4),.bcg div:nth-child(8n+5),.bcg div:nth-child(8n+7){background:#def3dc}'
    '.cartao .frente{background:#fff2bf}.cartao .verso{background:#def3dc}'
    '.enig{background:#fff7dd;border-color:#e76f51}.sol{background:#ffe1e1}'
    'table.st tr:nth-child(even) td{background:#fff7dd}table.st th{background:#e63946;color:#fff}'
    'table.gr td:not(.h){background:#dcefff}.bn>div:nth-child(2) table.gr td:not(.h){background:#ffe1e1}'
    '.cartinha{background-color:#fff7dd;border-color:#e76f51}'
)

def documento(titulo, paginas, css_extra='', pb=False):
    cor = '' if pb else COR
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{titulo}</title>
<style>{CSS}{css_extra}{cor}</style></head><body>{''.join(paginas)}</body></html>'''

def pagina(conteudo, classe='', rodape=True, nome=''):
    rod = f'<div class="rodape"><span>{nome}</span><span>@Cardeno_Amarelo · uso pessoal</span></div>' if rodape else ''
    return f'<section class="pag {classe}">{conteudo}{rod}</section>'

def capa(tag, titulo, sub, icones_html):
    return pagina(f'<div class="tag">{tag}</div><h1>{titulo}</h1><div class="sub">{sub}</div><div class="icones">{icones_html}</div>'
                  '<div style="position:absolute;bottom:14mm;font-size:24px;color:#777">@Cardeno_Amarelo</div>', 'capa', rodape=False)

def salvar(nome_arquivo, html):
    os.makedirs(os.path.join(AQUI, 'html'), exist_ok=True)
    caminho = os.path.join(AQUI, 'html', nome_arquivo + '.html')
    open(caminho, 'w', encoding='utf-8').write(html)
    return caminho
