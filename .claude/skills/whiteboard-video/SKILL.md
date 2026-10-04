---
name: whiteboard-video
description: Cria e renderiza vídeos explicativos verticais (1080x1920, 30 fps, .mp4) no estilo whiteboard / "papel e caneta", com uma mão desenhando em tempo real sobre papel quadriculado, texto manuscrito e narração em português brasileiro, prontos para TikTok, Reels e Shorts. Use esta skill sempre que o usuário pedir um vídeo explicativo, animação de quadro branco, vídeo "desenhado à mão", vídeo para TikTok/Reels/Shorts que explique um conceito, conta, regra ou notícia, ou disser algo como "faz um vídeo daquele tipo/no mesmo estilo/sobre um tema", mesmo sem citar "whiteboard". Também entrega legenda de postagem e dica de música.
---

# Vídeo whiteboard (papel e caneta)

Transforma um contexto ("explica X", um roteiro pronto ou um storyboard) num `.mp4` vertical. A mão com o marcador desenha cada elemento enquanto uma voz pt-BR narra, e tudo fica sincronizado pela duração real de cada trecho de áudio.

Como funciona:
- **O que você escreve:** só dois arquivos, o `projeto.json` (falas de cada cena e @ das redes) e o `cenas.js` (o que desenhar em cada cena).
- **O que a skill já traz:** o motor de animação (`assets/engine.js`) cuida do papel, da mão, do texto manuscrito, da troca de folha, dos ícones das redes e da renderização determinística.
- **Mão ✍🏻:** arte do Twemoji (CC-BY 4.0), com lápis amarelo cuja ponta assume a cor da tinta. Crédito em `assets/LICENSE-twemoji.txt`; se quiser, cite "Mão: Twemoji (CC-BY 4.0)" na descrição do perfil ou do vídeo.

`<skill>` abaixo é a pasta deste SKILL.md.

## Fluxo

### 1. Entender o pedido e escrever o roteiro
- Se o usuário trouxe roteiro/storyboard fechado, **use exatamente o dele**. Não reescreva falas.
- Se trouxe só o tema ou contexto, escreva o roteiro seguindo o **arco de retenção** do `references/roteiro.md`: gancho com promessa de revelação, expectativa crescente com re-ganchos a cada 8–12 s, clímax "uau" guardado para o final (o fato mais surpreendente, com fonte) e fechamento rápido com CTA. Passe o roteiro pelo checklist de retenção antes de mostrar. **Se o usuário pedir uma duração, ela manda**: use o orçamento de caracteres do `roteiro.md` para caber.
- **Fatos com fonte, sempre (inegociável):** curiosidade só funciona se for verdade, e um dado inventado destrói a credibilidade do perfil. Antes de escrever o roteiro, levante cada fato do vídeo (estatística, recorde, data, fato científico, "estudos mostram") e encontre uma **fonte concreta** para ele: órgão oficial, pesquisa publicada, relatório conhecido ou veículo jornalístico sério. Use WebSearch/WebFetch se estiverem disponíveis. Registre tudo em `projeto.json` → `fontes`. As regras completas estão em "Fatos e fontes" no `references/roteiro.md`. Resumo:
  - Sem fonte encontrada → o fato **não entra** no vídeo, ou vira suposição explícita na fala ("se você passar vinte minutos por dia…").
  - Nunca escreva "estudos apontam" ou "segundo pesquisas" sem a fonte nomeada em `fontes`.
  - Sem acesso à internet para verificar, **avise o usuário** e peça a fonte ou a autorização para tratar os números como suposição.
- **Redes sociais:** por padrão use o perfil **Caderno Amarelo**: `"marca": {"handle": "caderno_amarelo", "nome": "Caderno Amarelo"}`. **Nunca coloque logos de plataformas no vídeo** (o TikTok trata como conteúdo reaproveitado e tira do "Para Você"); o motor já mostra só o caderninho + @ (fala: "Me segue no Instagrã e no Tic Tóc: arroba caderno ânderláin amarelo"). Se o usuário disser que o vídeo é para outro perfil, pergunte os @ e troque em `projeto.json`.
- **Aprovação:** a renderização leva vários minutos (~3 quadros/s com 4 CPUs, ou seja, ~10 s de máquina por segundo de vídeo). Antes de gerar, mostre o roteiro em tabela (cena | fala | o que aparece na tela), com a lista de fontes, e peça um OK, a não ser que o usuário tenha dito para fazer direto ou tenha fornecido o roteiro pronto.

### 2. Preparar o ambiente e o projeto
```bash
bash <skill>/scripts/setup.sh                          # dependências (idempotente)
bash <skill>/scripts/novo_projeto.sh <pasta-do-video>  # copia template + motor + fonte
```
Use uma pasta com nome descritivo (ex.: `videos/juros_compostos/`), dentro do repositório atual se o usuário quiser versionar.

### 3. Narração
Preencha `projeto.json` → `cenas[].fala`. Escreva o texto **como se fala**: números por extenso e @ soletrados (veja "Fala ≠ texto na tela" em `references/roteiro.md`). `pausa` é o silêncio depois da fala da cena. Use ~1,0–1,4 s na cena anterior a uma troca de folha e 2,5 s na última (se omitida, vale 2,5 s na última e `pausaPadrao`, 0,6 s, nas demais). Depois rode:
```bash
python3 <skill>/scripts/gerar_audio.py <pasta-do-video>
```
O script gera `narration.mp3` e `timeline.json` (início e fim de cada cena). A ordem de vozes é edge-tts `pt-BR-AntonioNeural` → Kokoro `pm_alex` (neural, offline, baixada do GitHub uma vez) → eSpeak. O campo `motor_tts` do `timeline.json` diz qual foi usada. Se não foi a Antonio, avise o usuário: provavelmente a rede bloqueia `speech.platform.bing.com`.

### 4. Cenas (`cenas.js`)
Leia `references/api.md` (API, coordenadas, zonas seguras do TikTok) e use `references/exemplo_voto_util/cenas.js` como modelo, porque ele cobre gráfico, setas, arrastar blocos, X/círculo, troca de folha, boneco com balão, carimbo e CTA. Princípios:
- **Uma ideia visual por cena**, sincronizada com a fala (frações 0–1 da cena; estime a posição da palavra no texto).
- **Texto curto na tela:** palavras-chave e números, não a fala inteira.
- **Cores com significado fixo** e conteúdo essencial em x 60–940, y 260–1500.
- **Use a tela toda:** planeje cada folha (que faixa de y cada cena ocupa), com textos grandes (64–90) distribuídos até ~y 1550. Metade de baixo vazia e letra pequena é o defeito visual mais comum.
- **Folha cheia ou mudança de parte** → `WB.newPage`. **Última cena** → `WB.ctaRedes`.
- **Mão fora da frente:** quando a fala continua depois do desenho da cena, use `WB.restHand` para a mão não ficar parada em cima do quadro.

### 5. Conferir antes de renderizar (não pule)
```bash
node <skill>/scripts/render.js <pasta-do-video> --preview 4.5,12,20.3,...
```
Escolha instantes no fim de cada cena (o quadro mais cheio) e no meio de animações. Abra os PNGs de `<pasta>/preview/` e procure texto sobreposto, coisas cortadas na borda, texto pequeno demais e a mão cobrindo algo importante no quadro final. Corrija e gere as prévias de novo até ficar limpo. Juntar as prévias lado a lado ajuda: `ffmpeg -i a.png -i b.png -filter_complex hstack=2 lado.png`.

### 6. Renderizar
```bash
node <skill>/scripts/render.js <pasta-do-video> --out <nome>.mp4
```
Rode em segundo plano (um vídeo de 90 s leva ~15 min) e acompanhe pelo log. Ao final, verifique:
```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -of compact <nome>.mp4
ffmpeg -v error -i <nome>.mp4 -f null - && echo DECODE_OK
```
Extraia 2–3 quadros (`ffmpeg -ss <t> -i <nome>.mp4 -frames:v 1 q.png`) e olhe.

### 7. Entregar
- Envie o `.mp4` ao usuário (ferramenta de envio de arquivo, se houver) e informe o caminho.
- Diga qual voz foi usada e peça para ele conferir a pronúncia dos @, porque não dá para ouvir aqui.
- **Sempre, sem o usuário pedir:** entregue as **legendas de engajamento para TikTok e para Instagram** (são diferentes; modelos em "Legendas para postar" no `references/roteiro.md`), cada uma em bloco de código pronto para copiar, mais o texto da capa, o comentário fixado com fontes e a dica de **música de fundo**. Salve tudo em `<projeto>/legenda.txt`.
- Entregue as **fontes** em formato curto, prontas para a legenda ou para um comentário fixado ("📚 Fontes: …"). Isso protege o perfil quando alguém questionar nos comentários.
- Se estiver num repositório git e o usuário não tiver dito o contrário, faça o commit da pasta do vídeo (o `.gitignore` do projeto já exclui `frames/` e `preview/`).

## Ajustes depois de pronto
- **Mudou fala/texto narrado** → rode `gerar_audio.py` de novo (as cenas se reajustam sozinhas) e renderize.
- **Mudou só o visual** → edite `cenas.js`, gere prévias e renderize. Não precisa regerar áudio.
- **Trocou a voz** → `projeto.json` → `voz` (`kokoro`: `pm_alex`, `pm_santa`, `pf_dora`; `edge`: qualquer voz pt-BR do edge-tts) ou `gerar_audio.py --motor kokoro|edge|espeak`.
