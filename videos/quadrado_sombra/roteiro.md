# "Qual quadrado é mais escuro?" (quadrado na sombra)

Thread 39, 06/11/2026. Ilusão de sombra no tabuleiro (desenho próprio, no espírito do tabuleiro de Adelson):
A (casa escura no sol) e B (casa clara na sombra) têm exatamente o mesmo cinza (119), conferido em `ilusao.py`.

Voz Algieba, gemini-3.1-flash-tts-preview, take único (`falas/todas.txt` -> `falas/take1.wav`), acelerado 1.1x
(`take_rapido.wav`), cortado e montado com `../_comum/montar.py` (montagem.json -> narration.mp3 + timeline.json).
Imagem e efeitos: `python3 video.py` (PIL + numpy) -> quadrado_sombra.mp4 (39,7 s).

Roteiro: gancho A ou B (quadro 0) -> comenta antes, 3-2-1 -> recorta o B e põe do lado do A -> mesma cor ->
apaga as casas uma por uma até sobrar só A e B (pedido do Rafael: a tampa de papel parecia manipulação) -> iguaizinhos -> as casas voltam, B clareia -> por quê (cérebro desconta a sombra) ->
CTA "todo dia uma ilusão" + cartão Seguir -> Seguindo -> volta pro quadro 0 (loop).
