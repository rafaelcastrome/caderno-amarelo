# Caderno Amarelo

Vídeos curtos narrados em português no estilo whiteboard ("papel e caneta") para o perfil **@caderno_amarelo** no TikTok e no Instagram.

## Estrutura

- `.claude/skills/whiteboard-video/`: skill que gera os vídeos (motor de animação, template, roteiro, scripts de áudio e render). Instruções completas no `SKILL.md`.
- `videos/<projeto>/`: um projeto por vídeo (`projeto.json`, `cenas.js`, áudios, legenda e o `.mp4` final).
- `videos/amostras_voz/`: amostras das vozes testadas para a narração.
- `perfil_caderno_amarelo/`: identidade do perfil (fotos e post de apresentação).
- `video_voto_util/`: primeiro vídeo, feito antes da skill existir (pipeline próprio).

## Como gerar um vídeo novo

Peça ao Claude um vídeo sobre um tema; a skill `whiteboard-video` cuida do roteiro, da narração e do render. Depois de cada vídeo pronto, saem também as legendas para TikTok e Instagram.

Migrado do repositório `rafaelcastrome/ETL-VENDAS` (branch `ccr-dd74903f-spofhv`, commit `d6b7b8a`).
