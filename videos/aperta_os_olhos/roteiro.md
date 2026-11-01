# "Aperta os olhos" (desenhos escondidos em rabiscos)

Pedido do Rafael em 01/11/2026 (thread 11, ideia 4 de 4). Voz Gemini Charon (gemini-2.5-flash-preview-tts), take único em falas/take1.wav, falas em falas/todas.txt.
Gerar: `python3 video.py` (PIL; `python3 video.py 5 12` salva só os quadros desses segundos). A técnica fica em `oculto.py`.

3 fases, cada uma mais difícil: gato (fácil), caveira (médio), palavra UVA (difícil, não é revelada: o público comenta).
Técnica: a imagem escondida vira só "quantidade de tinta" (baixa frequência) e uma textura de rabiscos sem manchas próprias decide onde cai a tinta. De perto o olho vê os traços; apertando os olhos ou afastando o celular, o borrão mostra o desenho. A revelação no vídeo simula isso (borra e aumenta o contraste).
Dificuldade = faixa de tinta (fase 1: 30-70%, fase 2: 37-63%, fase 3: 39-61%).
