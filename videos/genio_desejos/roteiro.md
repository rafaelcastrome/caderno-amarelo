# Gênio da lâmpada: pausa o vídeo e descobre teus 3 desejos de 2027 (vídeo jogável)

Ideia do Rafael em 03/11/2026 (thread 30): o narrador é o gênio da lâmpada, dá 3 desejos, a pessoa pausa o vídeo e o que cair é o desejo dela pra 2027, que só se realiza se ela escrever nos comentários.

- Gancho fixo desde o quadro 0: "PAUSA O VÍDEO / e descobre teus 3 desejos de 2027".
- 3 roletas (ganhar, coração, viagem), 8 desejos cada trocando a cada 0,27 s + 1 DOURADO raro (0,18 s), com tique.
- Fim: "meus desejos de 2027: 1. 2. 3." + balão "comenta!" e CTA manda pro amigo + me segue.

Voz: Microsoft Antonio (edge-tts +12%) gravada no PC do Rafael (audio/cenaN.mp3), `python3 montar_audio.py`.
Render: `node ../../.claude/skills/whiteboard-video/scripts/render.js . --out genio_raw.mp4`, depois mistura audio/ticks.wav e recomprime crf 28 (ver commit).
Emojis dos cartões: fonte Noto Color Emoji.
