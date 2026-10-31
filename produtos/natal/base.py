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
'''

def documento(titulo, paginas, css_extra=''):
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{titulo}</title>
<style>{CSS}{css_extra}</style></head><body>{''.join(paginas)}</body></html>'''

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
