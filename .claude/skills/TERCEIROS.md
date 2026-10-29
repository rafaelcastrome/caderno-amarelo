# Skills de terceiros (teste de 2026-10-29)

A skill oficial continua sendo a `whiteboard-video` (intocável). As três abaixo foram copiadas de repositórios públicos, revisadas e ficam em pastas próprias. Para atualizar, copie de novo a pasta do repositório de origem e confira o diff.

| Pasta | Origem | Commit | Licença | Pra quê |
|---|---|---|---|---|
| `remotion-best-practices/` | github.com/remotion-dev/skills (`skills/remotion-best-practices`) | 30d4553 (v4.0.539) | Remotion | Boas práticas de Remotion para os animados do Zé do Corre (só documentação, sem código executável). |
| `watch/` | github.com/bradautomates/claude-video (`skills/watch`) | 03ceb42 (v0.3.2) | MIT | Assistir um vídeo: tira quadros com ffmpeg e, com chave Gemini, manda o vídeo pro Google analisar. |
| `youtube/` | github.com/AgriciDaniel/claude-youtube (`skills/claude-youtube`) | 84c3fa6 | MIT | Gancho, retenção, título e estratégia de Shorts. |

## Revisão de segurança
- `remotion-best-practices`: só Markdown e exemplos `.tsx`. Pastas `agents/` (config do Codex) removidas.
- `watch`: Python só com biblioteca padrão. Rede apenas para yt-dlp (site do vídeo), `generativelanguage.googleapis.com` (modo Gemini), Groq/OpenAI (se configurados). A chave vai só no cabeçalho. O hook de SessionStart do plugin NÃO foi instalado. `setup.py` pode instalar uv/WhisperX se alguém pedir o modo whisperx; não rode isso sem querer.
- `youtube`: Markdown + scripts opcionais que só usam a API do YouTube com chave própria. A descrição original disparava com qualquer "vídeo"/"roteiro"; foi trocada para só disparar quando pedirem análise de gancho/retenção/título, pra não roubar o lugar da `whiteboard-video`.

## Como usar aqui
- `watch` na nuvem: `python3 .claude/skills/watch/scripts/watch.py <video.mp4> --engine local --detail efficient --no-whisper` (quadros; a transcrição continua sendo a do Whisper via npm). O modo Gemini caiu por tempo de conexão na nuvem em 2026-10-29 (o modelo padrão `gemini-3.7-flash` estava lotado e o `gemini-3.8-flash` passou de 5 min). No PC do Rafael deve funcionar com `WATCH_GEMINI_MODEL=gemini-3.8-flash`.
- `youtube`: usar o sub-skill `sub-skills/shorts.md` (checklist de Shorts). `hook.md` é pensado para vídeo longo (gancho de 30 s) e serve pouco pra Reels.
