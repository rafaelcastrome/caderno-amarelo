# "Esse desenho é colorido?" (grade de linhas coloridas sobre imagem P&B)

Pedido do Rafael em 02/11/2026 (thread 19): ele quer espanto ao descobrir o final, como bandeira e elefante.
Voz Gemini Charon (gemini-2.5-flash-preview-tts), take único em falas/take1.wav, falas em falas/todas.txt.
Gerar: `python3 video.py` (PIL; `python3 video.py 5 12` salva só os quadros desses segundos). Desenho e grade em `cena.py` (desenho próprio).

Técnica (assimilação de cor): a imagem é cinza; só uma grade fina de linhas diagonais (passo 16 px, 3 px) tem a cor original saturada. No celular o cérebro espalha a cor das linhas e vê o desenho todo colorido.
Roteiro: "é colorido?" -> rótulos vermelha/amarela/azul -> "vou tirar só as linhas" -> fica cinza: "era preto e branco o tempo todo!" -> mostra só as linhas no branco -> "o resto teu cérebro pintou" -> "volta e confere" (loop com a grade de volta).
