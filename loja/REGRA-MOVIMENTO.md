# Regra de movimento (suavidade) do site

Pedido do Rafael em 16/11/2026: **todo o site tem que ser suave**. Ao tocar num botão,
ao trocar de tela, ao abrir ou fechar qualquer coisa (aba, grupo, filtro, caixa, modal, menu).
Vale pra loja (`loja.html`, `produto.html`...) e pro app de jogos (`jogos/`), e vale
pra tudo que for criado daqui pra frente, inclusive os filtros e agrupamentos de jogos
quando tiver mais jogos.

Tudo vem de dois arquivos compartilhados:

| Arquivo | O que tem |
| --- | --- |
| `assets/css/movimento.css` | Tempos e curvas (variáveis `--mov-*`), toque nos botões, entrada de tela, aparecer/sumir, grupos (sanfona), filtros, modal/lightbox/menu, abas com pílula |
| `assets/js/movimento.js` | `window.CA_MOV`: `esconder`, `mostrar`, `fecharClasse`, `alternarGrupo`, `filtrar`, `vigiarPalco` |

Os dois já estão em todas as páginas (o CSS vem **antes** do CSS da página, o JS logo
depois do `config.js`). Página nova: inclui os dois. Mudou algum deles: sobe a versão do
`jogos/sw.js` (os dois estão na lista de cache).

## As 6 regras

1. **Leve.** Só anima `opacity` e `transform`. Nada de animar `width`, `height`, `top`,
   `box-shadow` grande, `filter: blur`. (A única exceção é a sanfona, que usa
   `grid-template-rows`, barato e sem JS.)
2. **Rápido.** Use só os tempos do `movimento.css`, nunca número solto:
   `--mov-toque` 90 ms (apertar), `--mov-rapido` 140 ms (sumir/fechar),
   `--mov-medio` 200 ms (entrar tela, abrir caixa), `--mov-lento` 280 ms (modal, gaveta, fechar grupo).
   Curva padrão `--mov-curva`. Nada passa de 300 ms, com uma exceção: a sanfona **abrindo**
   usa `--mov-abrir` 400 ms com `--mov-curva-abrir` (começa e termina devagar), pedido do
   Rafael em 17/11/2026 pra abertura ao tocar ficar suave. Fechar continua 280 ms.
3. **Nunca atrasa o jogo.** Nenhum toque espera animação terminar. Dentro da partida
   (grade, cores, botões de resposta) não se coloca animação nova de entrada; o feedback
   de acerto/erro que já existe continua.
4. **Entrar é suave, sair é mais rápido ainda.** Entrada 200 ms subindo 8 px; saída 140 ms.
5. **Menos movimento.** Quem ligou "reduzir movimento" no celular não vê nada mexendo
   (as variáveis viram 1 ms e o JS não espera nada). Não precisa fazer nada a mais,
   desde que use as variáveis e o `CA_MOV`.
6. **Animação de entrada com `backwards`, não `both`/`forwards`.** Assim o elemento não
   fica com `transform` preso depois (isso quebraria `position: fixed` dentro dele).

## Como usar

### Botão novo
Se tiver a sombra "de caderno", use o `:active` que afunda (`translate(2px,2px)` + sombra
menor), igual `.btn`. Se for um botão simples, põe a classe **`mov-toque`** e ele afunda
sozinho (escala 0,97).

### Tela nova nos jogos
Nada a fazer: o `#palco` é vigiado (`CA_MOV.vigiarPalco`). Toda vez que um jogo faz
`palco.innerHTML = ''` + `palco.appendChild(tela)`, a tela nova entra suave.
- Se a tela é **redesenhada** com o mesmo conteúdo (placar mudou etc.), ela não pisca
  (a estrutura é a mesma). Pra forçar isso, dá um `data-tela="nome"` igual.
- Se é a mesma tela com outra **parte** (ex.: abas do início), use
  `data-tela="inicio" data-parte="grupo"` e marque com `mov-troca` só o miolo que muda.
- Pra não animar uma tela: `data-mov="sem"`.

### Coisa que aparece e some (aviso, dica, explicação, erro de formulário)
- No HTML: `class="... mov-aparece" hidden`. Ao fazer `el.hidden = false` ela entra suave.
- Pra sumir suave: `CA_MOV.esconder(el)` em vez de `el.hidden = true`.

### Modal / lightbox (classe `.aberto`)
Abrir: tira `fechando` e põe `aberto`. Fechar: `CA_MOV.fecharClasse(el, 'aberto')`.

### Grupos de jogos (sanfona)
```html
<section class="grupo">
  <button class="grupo-titulo" aria-expanded="true" aria-controls="g-numeros">Jogos de números</button>
  <div class="grupo-corpo" id="g-numeros"><div class="grupo-miolo">
    ...cards dos jogos...
  </div></div>
</section>
```
O clique já funciona sozinho (abre/fecha com a setinha girando). Pra abrir por código:
`CA_MOV.alternarGrupo(botao, true)`.

### Filtros de jogos
```html
<div class="filtros" data-alvo="#lista-jogos">
  <button class="filtro" data-filtro="todos" aria-pressed="true">Todos</button>
  <button class="filtro" data-filtro="numeros" aria-pressed="false">Números</button>
</div>
<div id="lista-jogos">
  <a class="card-jogo" data-tags="numeros rapidos">...</a>
</div>
```
O clique já filtra sozinho: os cards que saem somem, os que ficam deslizam pro lugar novo,
os que voltam entram. Por código: `CA_MOV.filtrar(cards, el => condicao)`.

### Abas
`nav.abas.mov-pilula` com `style="--i:<aba ativa>;--de:<aba anterior>"`: a pílula amarela
desliza de uma aba pra outra (ver `inicio()` em `jogos/js/app.js`).

## Antes de publicar
- Testar no celular (largura de Pixel 7) e no PC.
- Testar com "reduzir movimento" ligado (Playwright: `reducedMotion: 'reduce'`).
- Nenhum jogo pode ficar mais lento: tocar rápido na grade logo que a tela abre tem que funcionar.
