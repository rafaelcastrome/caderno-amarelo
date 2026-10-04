---
name: cartoon-animado
description: Cria vídeos verticais (1080x1920, 30 fps) no estilo DESENHO ANIMADO 2D de esquete de TikTok — personagens de corpo inteiro com contorno preto, olhos grandes, pernas de palito e chinelo, cenários chapados (sala, banheiro, rua, quintal, noite), caixa de título vermelha no topo e legenda preta embaixo, com boca sincronizada e expressões. Use sempre que o usuário pedir vídeo "animado", "desenho animado", "em vez de desenhado", esquete/cartoon, ou recriar um meme/áudio com personagens animados. Para vídeo "desenhado" (mão desenhando no caderno) use a skill whiteboard-video.
---

# Desenho animado (estilo esquete de TikTok)

Referência visual escolhida pelo Rafael (vídeo "quando a namorada quer mandar no cara igual mãe"): desenho 2D chapado, sem textura de papel e sem mão desenhando. **Quando ele pedir vídeo "animado", é este estilo; "desenhado" é a skill `whiteboard-video`.**

O que define o estilo (não fuja disso):
- **Caixa de título fixa no topo**: fundo creme, borda e texto vermelho-escuro, MAIÚSCULAS, 2–3 linhas, no formato de meme "QUANDO ... :". Fica o vídeo inteiro.
- **Legenda** preta em maiúsculas logo abaixo da caixa, com pedaços curtos de 2–5 palavras sincronizados com a fala.
- **Cenários simples e chapados** (sala com porta, janela e quadro; banheiro; rua com casinhas; quintal; frente de casa à noite), chão cinza e tapete oval.
- **Personagens de corpo inteiro**: cabeça grande, olhos brancos enormes com pupila pequena, contorno preto, braços finos, pernas de palito e chinelo. Quem fala mexe a boca e a cabeça. Expressões mudam com a fala (enfado, revira o olho, arregalada, risada...).
- **Cortes secos** entre tomadas (sala → cena imaginada → sala), com zoom rápido nos momentos de piada.
- Só o @ discreto em cinza (sem logo de plataforma).

`<skill>` abaixo é a pasta deste SKILL.md.

## Fluxo

1. **Roteiro e áudio**
   - **Meme / áudio pronto** (o caso mais comum): baixe ou receba o vídeo, extraia o áudio (`ffmpeg -i meme.mp4 -vn -c:a libmp3lame narration.mp3`) e tire o tempo de cada palavra. Sem Whisper na rede, use a legenda embutida no vídeo: recorte a faixa da legenda, detecte as trocas de palavra pela máscara de cor e monte uma folha com os recortes e os tempos para ler (foi assim no meme `videos/meme_quem_luta_sou_eu`). Escreva `timeline.json` à mão: `{ "total": <duração>, "cenas": [{ "n": 1, "start": 0, "end": 3.3, "fala": "..." }, ...] }`.
   - **Roteiro novo com narração**: escreva as falas e gere a voz com `python3 <skill-whiteboard>/scripts/gerar_audio.py <pasta>` (mesmo formato de `projeto.json` → `cenas[].fala`). Os tempos de palavra podem ser estimados pela proporção de caracteres dentro de cada cena.
   - Quando o áudio é de terceiros, entregue **duas versões**: `*_sem_som.mp4` (para postar com o som original pela biblioteca do app) e `*_com_audio_previa.mp4` (só para conferir o sincronismo).
2. **Projeto**: `bash <skill>/scripts/novo_projeto.sh <pasta>` (copia motor, fonte Varela Round e template). Preencha `projeto.json` → `titulo_caixa` (linhas da caixa vermelha).
3. **Planeje as tomadas**: uma tabela "tempo | cenário | quem aparece | ação/expressão". Use a sala (entrevista/conversa) como base e corte para cenas imaginadas quando a fala conta uma história (vó no banheiro, pai em casa, rua...). Uma tomada a cada 3–10 s.
4. **Escreva `cenas.js`** com a API (`references/api.md`) e o exemplo completo `references/exemplo_meme/cenas.js`:
   - `CT.fala(voz, [[t0,t1],...])` com as palavras de cada personagem que fala;
   - `CT.legenda([[t,'TEXTO'],...])`;
   - para cada tomada: `CT.shot(t0, t1, 'sala', {...})`, `CT.pessoa(shot, spec)` e as trilhas `humor/braco/olhar/mover/pulo/treme`; objetos e balões com `CT.obj.*` + `CT.pop`.
5. **Confira prévias** (não pule): `node <skill>/scripts/render.js <pasta> --preview 1.5,7.5,...`. Junte as imagens lado a lado e procure personagem cortado, legenda sobre fundo escuro, braço atravessando o rosto, objeto em cima de rosto.
6. **Renderize**: `node <skill>/scripts/render.js <pasta> --out <nome>_com_audio_previa.mp4` (em segundo plano; ~10 s de máquina por segundo de vídeo com 4 CPUs). Versão sem som: `ffmpeg -i X.mp4 -an -c:v copy X_sem_som.mp4`. Verifique com `ffprobe` e extraia 2–3 quadros.
7. **Entregue**: os .mp4, e **sempre** as legendas de TikTok e Instagram (convenção do projeto; modelo em `<skill-whiteboard>/references/roteiro.md` → "Legendas para postar"), salvas em `legenda.txt`. Commit da pasta do vídeo.

## Cuidados
- Personagens são genéricos; não copie o rosto de pessoas reais do meme nem os personagens do perfil de referência — só o estilo.
- Temas com pessoas vulneráveis (crianças, deficiência): o humor fica na situação e na reação, nunca na caricatura da pessoa.
- Fonte: Varela Round (SIL OFL, `assets/OFL-VarelaRound.txt`).
