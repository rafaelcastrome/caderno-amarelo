# API do motor de desenho animado (`CT`)

`cenas.js` define `window.CENAS = function (CT) { ... }`. Tudo é função do tempo `t` (segundos absolutos do áudio); o renderizador pula para qualquer instante.

## Quadro
1080 × 1920. Caixa de título em y 130–~380, legenda em y 470 (`projeto.legenda_y`), @ em (80, 1560). Cenários usam `chao` = 1240 (linha do chão); personagens em pé com os pés em y ≈ 1480–1510, escala padrão 1,15 (≈ 770 px de altura). Mantenha rostos entre x 120 e 960.

## Falas e legenda
```js
CT.fala('menina', [[3.33, 3.67], [3.67, 3.9], ...])   // palavras [início, fim] daquela voz
CT.legenda([[0, 'COMO QUE VAI FICAR'], [0.93, 'QUANDO TU PRECISAR...'], [12, '']])  // '' apaga
```
A pessoa com `voz: 'menina'` mexe a boca e a cabeça nesses intervalos.

## Tomadas
```js
const sh = CT.shot(t0, t1, 'sala', { sofa: true, tv: true, planta: true, noite: false, parede: '#fbf8ef' });
sh.zoom(t, 1.25, cx, cy)   // zoom suave (0,3 s) a partir de t; zoom(t, 1) volta
```
Cenários: `sala` (opções `porta`, `portaX`, `janela`, `janelaX`, `quadro`, `quadroX`, `sofa`, `sofaX`, `sofaW`, `corSofa`, `tv`, `tvX`, `planta`, `plantaX`, `parede`, `piso`, `tapete`, `noite`), `banheiro`, `rua`, `quintal`, `noite` (frente de casa com porta acesa), `vazio`. Também aceita uma função `(g, opts) => {...}` para cenário próprio. A tomada só aparece entre t0 e t1 (corte seco).

## Personagens
```js
const p = CT.pessoa(sh, {
  x: 660, y: 1480, s: 1.15, flip: false, pose: 'em_pe' | 'sentado',
  pele: '#b97a4f', cabelo: { tipo: 'longo'|'coque'|'curto'|'espetado'|'cacheado'|'careca', cor },
  roupa: { tipo: 'camiseta'|'regata'|'vestido', cima, baixo, perna: 'bermuda'|'calca' },
  chinelo: '#7cc8f2', oculos, bigode, barba, bone: '#d62828', cracha, voz: 'id',
  mao: { d: 'mic'|'celular'|fn(g), e: ... },
});
p.humor(t, 'enfado')          // neutro lado enfado sorriso risada seria arregalada pensativa estresse triste revira brava dor confusa feliz malandro
 .braco(t, 'd'|'e'|'ambos', 'queixo')  // baixo cintura queixo cabeca boca orelha aponta acima frente ombro soco acena segura cruzado
 .olhar(t, dx, dy)            // pupilas em coordenadas de tela (dx>0 = direita), ±18
 .mover(t0, t1, x, { y, anda: true })   // anda (pernas alternando) até x
 .pulo(t0, t1, n, altura) .treme(t0, t1, amp) .some(t0, t1)
```
Transições de humor e braço são suaves (0,25–0,3 s). Piscar e respirar são automáticos. Sentado: desenhe `CT.obj.cadeira(sh.g, x, y)` antes da pessoa.

## Objetos e efeitos
`CT.obj`: `cadeira(g,x,y,cor)`, `vaso(g,x,y)`, `coco(g,x,y,s)`, `balao(g,cx,cy,rx,ry,[xCabeça,yCabeça])` (pensamento; desenhe dentro do grupo retornado), `falaBalao(g,x0,y0,x1,y1,tx,ty)`, `sofa`, `tv`, `porta`, `janela`, `quadro`, `planta`, `arbusto`, `casa`.
Formas: `CT.P(g, d, fill, {w})`, `CT.E(g, cx, cy, rx, ry, fill)`, `CT.R(g, x, y, w, h, fill, {r})`, `CT.T(g, texto, x, y, size, cor, {stroke, sw})`, `CT.mk(tag, attrs, parent)`.
`CT.pop(grupo, t0, { anim: 'pop'|'slam'|'fly'|'none', fx, fy, loop: 'shake'|'wiggle'|'bounce'|'float'|'pulse'|'spin', ate: t1 })` faz o grupo aparecer em t0 (e sumir em `ate`).
`CT.effect(t => {...})` para qualquer animação extra (função pura de t).

## Armadilhas
- Ordem de criação = ordem de desenho: cenário → objetos de fundo → pessoas → balões/efeitos.
- `braco(t0 - 1, ...)` antes da tomada define a pose inicial sem transição.
- Legenda tem contorno branco; ainda assim evite texto do cenário atrás dela.
