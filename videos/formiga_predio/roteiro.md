# Formiga caindo de um prédio de 50 andares

Ideia do Rafael (02/11/2026, thread 20): começo = expectativa (será que sobrevive?), meio = explicação que segura, fim = virada: cai, nada acontece, sai andando e "foi direto fazer o que mais ama na vida": senta no celular, segue o @Cardeno_Amarelo, ri dos vídeos (corações, kkkk) e chama a galera pra seguir (fala12 com voz fininha, balão). Rafael pediu essa propagandinha no fim (exceção à regra de não ter CTA).

Fatos: velocidade terminal de uma formiga ~6,4 km/h, atingida em menos de 1 s (pouca massa, muita área, o ar freia). 50 andares ~150 m -> ~80 s de queda. Pessoa caindo 150 m chegaria a ~155 km/h (terminal ~195 km/h). Formigas planadoras (Cephalotes atratus, Amazônia, Yanoviak 2005) planam de ré de volta pro tronco. Exoesqueleto aguenta o impacto.

Voz: Microsoft Antonio (edge-tts +8%, atempo 1.08 na montagem), gravada no PC do Rafael: falas/antonio/fala0..10.mp3 (texto em falas/todas.txt).
Gerar: `python3 sprites.py` (figuras 3D sombreadas, motor em base3d.py) e `python3 video.py`.

## Versão 3D (02/11, pedido do Rafael: "faz o vídeo em 3D" + narrar o final)
Cenas em three.js (cena3d.js), renderizadas no Chromium headless (render3d.js): prédio de 50 andares numa cidade, formiga 3D (corpo brilhante, pernas animadas) na beirada, queda ao lado da fachada com a câmera girando, calçada com poeira, e sala com parede de caderno, almofada amarela e celular. video3d.py põe por cima os textos, o painel de velocidade, os quadrinhos e a tela do celular (colada em perspectiva). Final narrado: falas 11 (foi direto), 13 (abriu o Insta e seguiu), 14 (rindo à toa) e 12 (a formiga chama a galera, voz fininha).
Gerar: npm install; python3 video3d.py linha; node render3d.js timeline.json fundo3d.mp4; python3 video3d.py; depois 2 passes a 1250k pra ficar < 10 MB.
