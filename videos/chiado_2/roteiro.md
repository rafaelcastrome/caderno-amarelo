# "Tu não vai entender essa frase" parte 2 (frase no chiado)
Pedido do Rafael em 07/11/2026 (thread 44): "outro da voz distorcida". Mesma mecânica de videos/frase_no_chiado (thread 34).
Voz Algieba (gemini-3.1-flash-tts-preview), take único falas/take1.wav; a frase limpa é o último parágrafo do take (sfx/frase_limpa.wav), 0.9x em sfx/frase_lenta.wav, chiado = `vocoder.py sfx/frase_lenta.wav sfx/chiado.wav 3 30`.
Frase: "Minha mãe escondeu o controle dentro da geladeira." (Whisper não entende o chiado: transcreveu "Tchau!").
Montagem: `python3 ../_comum/montar.py .` e render da skill whiteboard-video; mp4 reencodado crf 26.
