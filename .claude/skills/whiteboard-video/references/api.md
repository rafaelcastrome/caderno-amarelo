# API do motor whiteboard (`WB`)

`cenas.js` define `window.CENAS = function (WB) { ... }`. O motor chama essa função uma vez, e tudo o que ela agenda vira animação. O exemplo completo está em `references/exemplo_voto_util/cenas.js` e vale ler antes de escrever as primeiras cenas.

## Índice
1. Coordenadas e layout
2. Tempo: cenas e frações
3. Desenhar: `draw`, `write`, `writeLines`
4. Traços e formas (`strokePath` + geradores de `d`)
5. Componentes prontos (`WB.C`)
6. Movimento e efeitos
7. Folhas (`newPage`)
8. Redes sociais (`ctaRedes`, marca d'água)
9. Armadilhas comuns

---

## 1. Coordenadas e layout

O quadro tem 1080 × 1920 px, com origem no canto superior esquerdo. A fonte é Caveat Bold. Em `write`, o `y` é a **linha de base** do texto, e as letras sobem cerca de 0,7 × `size` acima dela.

Zonas seguras para TikTok, Reels e Shorts, porque a interface do app cobre partes da tela:

| Região | Uso |
|---|---|
| y 0–260 | título (fica visível) |
| y 260–1500, x 60–940 | **conteúdo principal**: o que não pode ser perdido fica aqui |
| x > 940, y 900–1600 | botões do app (curtir, comentar): evite texto importante |
| y > 1550 | legenda do app cobre parcialmente: use para conteúdo de apoio |
| y 1836–1910 | marca d'água automática com as redes |

Tamanhos que funcionam: título 96–110; texto principal 64–90; números de destaque 90–130; rótulos 44–56. Abaixo de 40 fica difícil de ler no celular. Linhas com no máximo 900 px de largura (use `WB.measure(texto, size)` ou `WB.wrap(texto, size, maxW)`).

**Use a tela toda.** O erro visual mais comum é amontoar tudo no topo com letras pequenas e deixar a metade de baixo vazia. Antes de escrever o `cenas.js`, planeje cada folha:
- Faça uma tabela "cena → faixa de y que ela ocupa".
- Distribua o conteúdo entre y 260 e ~1550, aumentando textos e desenhos até a folha ficar cheia no fim da última cena dela.
- Uma folha costuma comportar 2–4 cenas.

Padrões para reaproveitar a mesma folha:
- **Estrutura que se completa:** a cena 1 desenha a estrutura (colunas, eixos, cabeçalhos) e as seguintes preenchem.
- **Encolher para ícone:** o desenho da abertura vira um ícone no canto com `WB.transform`, como a urna do exemplo.
- **Ao encher:** `WB.newPage`.

Cores (`WB.INK`): `black`, `red`, `blue`, `green`, `orange`, `purple`, `gray`, `white`. Use poucas por cena e com significado fixo, por exemplo azul para um lado e verde para o outro, vermelho para alerta ou meta.

## 2. Tempo: cenas e frações

A cena N dura exatamente o áudio N mais a pausa dele (valores do `timeline.json`). Toda função de desenho recebe `(cena, f0, f1)`: frações de 0 a 1 **dentro da cena**.
- `WB.at(cena, f)` devolve o tempo absoluto em segundos.
- Para sincronizar com a fala, estime a posição da palavra no texto da cena: proporção de caracteres até ela dividida pelo total, vezes `fala/(end-start)` do `timeline.json`.
- A última cena normalmente tem `pausa` de 2,5 s para o quadro final ficar parado. Termine os desenhos em torno de 0,85–0,9.
- Não sobreponha intervalos de desenho dentro do mesmo trecho de tempo, porque a mão só desenha uma coisa por vez. Deixe ao menos ~0,01 entre um e outro.

## 3. Desenhar

```js
WB.draw(cena, f0, f1, tracos)      // revela os traços em sequência; a mão segue a ponta
WB.write(cena, f0, f1, 'texto', x, y, size, cor, { anchor: 'start'|'middle'|'end', parent })
  // -> { strokes, width, x, y, size }   (width serve para sublinhar/posicionar ao lado)
WB.writeLines(cena, f0, f1, ['linha 1', 'linha 2'] | 'texto longo', x, y, size, cor,
              { anchor, lineHeight, maxWidth, parent })   // divide o tempo pelo tamanho de cada linha
```
`draw` aceita arrays aninhados de traços, como `[C.axes(...), WB.strokePath(...)]`. O tempo de cada traço é proporcional ao comprimento dele, e o deslocamento da caneta entre traços também conta.

Velocidade natural de escrita: ~0,08–0,12 s por caractere de título e ~0,05–0,08 s por caractere de texto menor. Se a fração ficar curta demais, a mão "voa", então divida o texto ou dê mais tempo.

## 4. Traços e formas

```js
WB.strokePath(d, cor, largura, parent?, { opacity })   // -> traços (um por subcaminho "M ...")
WB.textStrokes(str, x, y, size, cor, parent?, anchor)  // como write, mas sem agendar (para montar listas)
```
Geradores de `d` (strings SVG):
- `roughLine(x1,y1,x2,y2,amp)`, `roughRect(x0,y0,x1,y1)`, `roughSeg(...)`: linhas com leve tremor de mão
- `zigzagHatch(x0,y0,x1,y1,espaço)`: hachura de marcador para preencher barras ou caixas
- `dashedLine(x0,x1,y)`, `wavyLine(x0,x1,y,amp,comprimento)`
- `loopEllipse(cx,cy,rx,ry, turns=1.12, start=-1.9)`: "circular" algo à mão; passa um pouco da volta de propósito (use `turns: 1` para fechar exato)
- `arcPath(cx,cy,rx,ry,a0,a1)`: arco de elipse em radianos (0 = direita, π/2 = baixo); ex.: base de moeda = `arcPath(cx,cy,rx,ry,0,Math.PI)`
- `arrowHead(x,y,ângulo,tamanho)`, `circlePath(cx,cy,r)`, `roundRectPath(x,y,w,h,r)`, `cloudPath(cx,cy,rx,ry)`

Camada fixa: `WB.overlay` é um grupo acima de todas as folhas que **não sai quando a página vira**. Passe-o como `parent` (ex.: `WB.group(WB.overlay)`, `WB.textStrokes(..., WB.overlay)`) para elementos que atravessam o vídeo, como um post-it com "?" colado no canto desde o gancho e revelado no clímax.

Grupos: `const g = WB.group(parent?, transform?)`. Elementos livres: `WB.mk('path', {...atributos}, parent)`. Elementos criados com `mk` aparecem desde o início, sem animação, então esconda-os com `opacity` 0 e mostre com `fade`.

## 5. Componentes prontos (`const { C } = WB`)

| Função | Retorna |
|---|---|
| `C.axes(x0, yBase, yTop, xEnd)` | eixos com seta |
| `C.bar(x0, yTop, yBase, largura, cor, parent?, opacHachura)` | `{ outline, hatch }`; desenhe em dois momentos |
| `C.arrow(x1,y1,x2,y2,cor,larg)` | seta reta |
| `C.curvedArrow(sx,sy, cx,cy, ex,ey, cor, larg, parent?)` | seta curva (controle cx,cy) |
| `C.underline(x0, x1, y, cor)` | sublinhado ondulado |
| `C.circleAround(cx, cy, rx, ry, cor)` | laço em volta de algo |
| `C.xMark(cx, cy, r, cor)` / `C.check(cx, cy, s, cor)` | X / ✓ |
| `C.box(x0,y0,x1,y1,cor,larg,parent?)` | caixa à mão |
| `C.stickFigure(x, y, { scale, color, label })` | boneco palito (cabeça em x,y; corpo ocupa ~360·scale abaixo) |
| `C.thought(cx, cy, rx, ry, deX, deY)` | balão de pensamento saindo de (deX,deY) |
| `C.stamp('TEXTO', cx, cy, { size, color, rot })` | `{ box, text }` carimbo girado |
| `C.ballotBox(x, y, escala, { ballot })` | `{ group, strokes }` urna |

Para algo que não existe (ícone, objeto), escreva o `d` à mão com `roughSeg`/`roughLine`/curvas `Q`. Mantenha desenhos simples, com 3 a 10 traços, porque o estilo é de rabisco rápido.

## 6. Movimento e efeitos

```js
WB.moveGroup(cena, f0, f1, grupo, dx, dy, { grab: {x, y}, arc: 160, color })  // arrasta em arco; mão segura em grab
WB.transform(cena, f0, f1, grupo, { x, y, s }, { x, y, s })                // translate+scale (ex.: encolher p/ ícone)
WB.fade(cena, f0, f1, elemento, de, para)                                     // opacidade
WB.fillAfter(elemento, tracos, dur)                                           // preenchimento aparece após o último traço
WB.restHand(cena, f0, f1)                                                     // mão vai para a borda inferior (sai da frente)
WB.handFollow(t0, t1, t => ({x, y}), cor)                                     // mão segue uma trajetória (t absoluto)
WB.effect(t => { ... })                                                       // qualquer coisa em função de t (t absoluto)
```
Efeitos precisam ser **funções puras de t**, sem estado entre quadros, porque o renderizador pula para tempos arbitrários.

## 7. Folhas

`WB.newPage(cena, f0 = 0, f1 = 0.06)` faz a mão puxar a folha atual para cima e revela uma folha em branco. Tudo o que for criado depois disso vai para a folha nova. Use quando o quadro encher ou quando a narrativa mudar de parte (por exemplo, explicação → história → conclusão). Deixe uns 0,6–1,4 s de `pausa` na cena anterior para a virada não atropelar a fala.

## 8. Redes sociais (sem logos de plataformas!)

**Não coloque logos do Instagram, TikTok, YouTube etc. no vídeo.** O TikTok trata logo ou marca d'água de outra rede como conteúdo reaproveitado ("não original") e tira o vídeo do "Para Você"; isso já aconteceu com um vídeo do perfil. Por padrão o motor mostra só o @ com o **caderninho amarelo** da marca.

- `projeto.json` → `"marca": { "handle": "caderno_amarelo", "nome": "Caderno Amarelo" }`. Com isso, a **marca d'água** (caderninho + @) aparece no rodapé durante todo o vídeo; `"marcaDagua": false` desliga. Se os @ forem diferentes por rede, use `"instagram"`/`"tiktok"` (aparecem os dois @, ainda sem logos). `"logos": true` reativa os ícones das plataformas, mas evite.
- `WB.ctaRedes(cena, f0, f1, { y: 780, titulo: 'Gostou? Me segue!', iconSize: 190, cor })` desenha o título, o caderninho e o @. Ocupa de `y` até ~`y + 180 + n·280`. A marca d'água some quando o CTA começa.
- Ícone avulso: `WB.notebookIcon(x, y, S, parent, larg)` → `{ bg, outline, rest }`. Desenhe `outline`, use `fillAfter(bg, outline)` e depois desenhe `rest`.
- **Na fala** pode dizer "me segue no Instagram e no TikTok"; o problema é só o visual.

## 9. Armadilhas comuns

- **Texto sobreposto**: antes de renderizar, gere prévias (`render.js --preview`) dos momentos em que cada cena termina e olhe as imagens. É o erro mais comum.
- **Grupo transformado antes do desenho**: a mão usa a posição do traço no momento em que `draw` é chamado. Se um grupo for mover ou escalar, desenhe os traços enquanto ele ainda está na posição inicial (a transformação via `transform`/`moveGroup` vem depois no tempo).
- **`y` de texto é a linha de base**: um texto com size 84 em y=1540 ocupa ~1480–1555.
- **Mão cobrindo o desenho**: entre um desenho e outro, se o intervalo for menor que 1,5 s, a mão fica parada perto do último traço. Se a fala continua depois que o desenho da cena terminou, ou no fim de uma cena antes de uma pausa, chame `WB.restHand(cena, f, f2)` para a mão sair da frente (ela volta sozinha para o próximo desenho).
- **`render.js --out`** é relativo ao diretório atual (sem `--out`, sai `video.mp4` dentro da pasta do projeto).
- **Erros no `cenas.js`** aparecem como `Erro na página` ao rodar o `render.js`, com a mensagem do navegador.
