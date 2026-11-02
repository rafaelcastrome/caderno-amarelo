# "Não pisca" com olho e listras (efeito cachoeira), fiel à referência

Pedido do Rafael em 02/11/2026 (thread 19): "Faz desse", com o reel do olho + listras (92 s). Versão anterior (videos/nao_pisca, 01/11) tinha listras indo pro olho por só 23 s; esta segue a referência: listras pretas e brancas em tela cheia se ABRINDO a partir da linha do olho (cima sobe, baixo desce, 210 px/s, período 38 px), 42 s de encarada com contador.
Depois do corte: rosto grande parado no caderno (parece encolher) + "olha pra tua mão" + explicação (adaptação ao movimento, ilusão da cachoeira, descrita em 1834).
Voz: Microsoft Antonio (edge-tts +8%), gravada no PC do Rafael: falas/antonio/fala0..7.mp3.
Gerar: `python3 video.py` (PIL). Olho realista e listras em `cena.py`.
