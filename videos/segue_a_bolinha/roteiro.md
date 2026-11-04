# Segue a bolinha: 3 fases (thread 31, 03/11/2026)

Vídeo jogável a partir de uma referência de "copinhos" que o Rafael mandou (9 copos, bolinha dourada, "qual copo? comenta o número").
Versão do Caderno Amarelo: papel de caderno, copos vermelhos, bolinha amarela, 3 fases que aceleram
(3 copos/5 trocas, 5 copos/12 rodadas com trocas duplas, 9 copos/13 rodadas com trocas duplas). Depois de cada fase os lugares ganham número,
congela com tique-taque e o copo certo levanta. No fim aparece o placar e a pessoa comenta 1/3, 2/3 ou 3/3.
Embaralhamento honesto (copos em arco, dá pra seguir). Respostas: fase 1 copo 1, fase 2 copo 2, fase 3 copo 6. Na revelação o narrador fala o número do copo.

Voz: Gemini Algieba (aprovada), prompt de apresentador de game show. Trilha e efeitos sintetizados em mixar_som.py.

Fluxo: falas/ (tts.py, tts_lote.py) -> audio/cenaN.mp3 -> montar_audio.py (timeline) -> render.js (vídeo)
-> dump de window.__SWAPS em swaps.json -> mixar_som.py (audio_final.mp3) -> mux com ffmpeg.

v2 (04/11, pedidos do Rafael): narra "Copo N!" na revelação, fase 2 mais difícil, sem chiado (vush grave em vez de ruído branco,
chimbal tonal, fades nas falas) e sem a mão parada no canto.
v3 (04/11): o "chiado de TV" vinha de um estalo de ~0,13 s que o Gemini TTS deixa no FIM do áudio (cenas 1, 2, 10, 11).
Cortei cada fala no último silêncio e o montar_audio.py agora tem noise gate + corte de silêncio em -36 dB.
