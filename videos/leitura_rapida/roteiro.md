# "Até que velocidade tu consegue ler?" (leitura uma palavra por vez / RSVP)

Pedido do Rafael em 31/10/2026 (thread 10). Voz Gemini Charon (modelo gemini-3.1-flash-tts-preview, porque a cota diária do 2.5 já tinha acabado), take único em falas/take1.wav, falas em falas/todas.txt.
Gerar: `python3 video.py` (PIL; `python3 video.py 5 12` salva só os quadros desses segundos).

Teste em 4 níveis, sem narração por cima (o silêncio deixa ler): 300, 450, 600 e 900 palavras/min (6, 4, 3 e 2 quadros por palavra a 30 fps).
A letra vermelha é o "ponto ótimo de reconhecimento" (onde o olho mira), como nos apps de leitura rápida tipo Spritz.
A frase do nível final pede pra comentar "pipoca": quem comenta prova que leu, e quem não pegou volta o vídeo.

Fatos: leitura silenciosa média de adulto ~240 palavras/min (Brysbaert, 2019). Na leitura normal o olho faz sacadas (pulos) entre as palavras; na leitura uma palavra por vez ele fica parado. A compreensão cai nas velocidades altas (Rayner et al., 2016), por isso não prometemos que "ler rápido assim é melhor".
