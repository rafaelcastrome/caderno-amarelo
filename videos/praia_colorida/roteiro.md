# "Teu olho pinta a praia" (pós-imagem sobre desenho cinza)

Pedido do Rafael em 11/11/2026 22h51 (thread 57): "quero um parecido com o da bandeira do Brasil".

## A sacada
1. Quadro 0: desenho de praia do Rio (Pão de Açúcar, bondinho, coqueiro, guarda-sol, bandeira do Brasil) todo CINZA + "esse desenho é PRETO E BRANCO".
2. Encarada de ~15 s no ponto com contagem: o desenho vira o negativo das cores (céu laranja, morro rosa, areia azul).
3. "Agora!": volta o MESMO desenho cinza com o ponto no lugar. A pós-imagem pinta o cinza: céu azul, mar, bandeira verde e amarela.
4. A diferença pra bandeira: a cor aparece EM CIMA de um desenho, e some quando a pessoa mexe o olho ("sumiu! sempre foi cinza").
5. Explicação curta + fato uau (ponto cego) + CTA "comenta VI ou NÃO VI" + loop "volta e não pisca".

## Técnica
Voz: Algieba (gemini-3.1-flash-tts-preview), take único `falas/take1.wav`, atempo 1.1 (`take1_r.wav`), cortes em montagem.json, `python3 ../_comum/montar.py .`.
Cinza = L* (Lab) de cada cor real; negativo = 255 - cor real (mesmo esquema da bandeira).
Render: `node ../../.claude/skills/whiteboard-video/scripts/render.js . --out render_bruto.mp4`, depois 720p crf 28.
