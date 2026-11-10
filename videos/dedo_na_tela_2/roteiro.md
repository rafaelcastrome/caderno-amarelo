# "Põe o dedo na tela 2" (thread 54, 10/11/2026)

Continuação do formato que passou de 500k (videos/dedo_na_tela, branch claude/project-thread-sz2v7n), com grade nova e final engraçado.
Rafael escolheu no cartão depois de não gostar do "braço sobe" (dava trabalho: levantar, 30 s, 76 s de vídeo).
Agora: sentado, celular na mão, ~48 s, recompensa na hora.

## Grade (4 linhas x 3 colunas)
| | | |
|---|---|---|
| SORVETE | GATO | LUA |
| FLOR | PEIXE | PIPA |
| OVO | BANANA | BALÃO |
| DADO | CHINELO | BOLA |

Truque: paridade de tabuleiro. Casas "pretas" (linha+coluna par) têm palavra de nº ímpar de letras, as "brancas" nº par,
então depois da 1ª andada (nº de letras) todo mundo está nas brancas. Depois: apaga SORVETE e LUA, +3; apaga GATO, PIPA, FLOR, +1;
apaga PEIXE, OVO, BALÃO, +1 -> todo mundo no CHINELO. Conferido em verificacao/sim2.py (todos os começos e todos os caminhos, voltando
casas inclusive). Exemplo do vídeo: OVO (3) -> FLOR 1, SORVETE 2, GATO 3.

## Final
"Tu tá no chinelo! ... O chinelo da tua mãe... corre!": o chinelo sai da grade girando, cresce, bate no vidro (rachadura, tremida, "CORRE!!", baque).
Depois "Acertei? Comenta aí! Duvida? Volta e começa em outro desenho" (replay).

## Montagem
Voz Algieba (gemini-3.1-flash-tts-preview), 1 take (falas/falas.txt -> falas/take1.wav), cortes em montagem.json, ../_comum/montar.py.
SFX sintetizados (sfx/fx.wav: tique na contagem, ding no achei, swoosh tonal + baque no chinelo), sem ruído branco.
Render: node ../../.claude/skills/whiteboard-video/scripts/render.js . --out render_bruto.mp4, depois recomprimir (crf 30).
