"""Amostra das cenas detalhadas pra colorir (2 páginas) pra aprovação do Rafael."""
from base import documento, pagina, salvar
from cenas_natal import cena_biscoitos, cena_arvore

CSS = '''.cc{display:flex;flex-direction:column;height:100%}
.cc .tt{font-size:50px;text-align:center;line-height:1;margin:-4mm 0 3mm}
.cc .arte{flex:1;min-height:0}'''

def pag(titulo, cena, nome):
    return pagina(f'<div class="cc"><div class="tt">{titulo}</div><div class="arte">{cena.svg()}</div></div>', nome=nome)

if __name__ == '__main__':
    nome = 'Natal Fofo pra Colorir'
    pags = [pag('Noite de biscoitos', cena_biscoitos(), nome), pag('A estrela vai lá em cima!', cena_arvore(), nome)]
    print(salvar('amostra-cenas-colorir', documento(nome, pags, CSS, pb=True)))
