# Amostras de vozes TTS pt-BR — Fim6x1v2

Gerado em 15/10/2026. Todas as amostras usam as **falas reescritas** (coloquiais, estilo áudio de WhatsApp). O texto original e o reescrito estão em `falas.txt`.

| Personagem | Fala usada nas amostras |
|---|---|
| Zé do Corre (v6a) | Pô, pra mim é mais tempo com a família, sabe? E descanso de verdade... finalmente! |
| Seu Cláudio (v4a) | Olha... minha padaria abre de segunda a sábado. Aí o Zé folga dois dias, e quem fica no balcão? Eu?! |
| Amarelinho (v3b) | Pera aí! Custo maior por hora não vira preço mais alto do nada, tá? Depende do setor... e de como cada empresa se vira. |

**Hardware:** Intel i5-11400, 32 GB RAM, GPU NVIDIA GeForce GTX 1650 4 GB (driver 595.76, CUDA 13.2). Chatterbox e Qwen rodaram na GPU (torch 2.6.0+cu124).

**Formato final:** todos os `.mp3` da pasta estão em 44,1 kHz mono, 160 kbps, normalizados com `loudnorm` (-16 LUFS, pico -1,5 dB). Os arquivos brutos ficam em `_raw/`.

**Aviso:** não tenho como ouvir os áudios. As observações de pronúncia abaixo saem de uma transcrição automática com Whisper large-v3-turbo (`_raw/transcricoes.tsv`) e da duração de cada arquivo: palavra trocada aparece na transcrição, mas sotaque e "cara de robô" só ouvindo.

## Arquivos

### A) edge-tts, referência (Microsoft, online e grátis)
| Arquivo | Voz | Tempo de geração |
|---|---|---|
| edge_antonio_ze / _claudio / _amarelinho | pt-BR-AntonioNeural (rate +10%) | ~2 s cada |

### B) Outras vozes do edge-tts
| Arquivo | Voz | Tempo |
|---|---|---|
| edge_thalita_* | pt-BR-ThalitaMultilingualNeural (fem.) | 3–7 s |
| edge_francisca_* | pt-BR-FranciscaNeural (fem.) | ~2 s |
| edge_andrew_* | en-US-AndrewMultilingualNeural (masc.) | 5–8 s |
| edge_brian_* | en-US-BrianMultilingualNeural (masc.) | 3–6 s |
| edge_remy_* | fr-FR-RemyMultilingualNeural (masc.) | ~4 s |

Vozes pt-BR que existem hoje no edge-tts: **somente 3**: AntonioNeural (masc.), FranciscaNeural (fem.) e ThalitaMultilingualNeural (fem.). De Portugal: pt-PT-DuarteNeural e pt-PT-RaquelNeural. Vozes "Multilingual" masculinas que falam português: en-US Andrew, Brian e William (en-AU); fr-FR Remy; de-DE Florian; it-IT Giuseppe; ko-KR Hyunsu.

### C) Chatterbox Multilingual pt-BR (Resemble AI, MIT), finetune oficial `ResembleAI/Chatterbox-Multilingual-pt-br`, offline, na GPU
| Arquivo | Voz | Tempo (por fala) |
|---|---|---|
| chatterbox_padrao_* | voz embutida do modelo (`conds.pt`) | 31–67 s |
| chatterbox_ptbrf2_* | voz feminina brasileira de exemplo da Resemble (`pt_br_f2.wav`) | 56–78 s |
| chatterbox_antonio_clone_teste_* | **teste de clonagem**: timbre copiado de 10 s do Antonio (edge-tts), só para mostrar que a clonagem funciona | 37–63 s |
| chatterbox_*_ze_exag08 | as 3 vozes acima na fala do Zé com exaggeration 0.8 (as outras usam 0.5) | 22–44 s |

Carregar o modelo leva cerca de 11 s. Cada fala de 5 a 9 s de áudio leva entre 0,5 e 1 minuto na GTX 1650.

### D) Qwen3-TTS 0.6B CustomVoice (Alibaba, Apache 2.0), offline, na GPU em fp32
| Arquivo | Voz (pré-definida) | Tempo |
|---|---|---|
| qwen06b_ryan_* | Ryan (masc., nativo inglês) | 32–42 s |
| qwen06b_aiden_* | Aiden (masc., nativo inglês, americano) | 19–34 s |
| qwen06b_uncle_fu_* | Uncle_Fu (masc. grave, nativo chinês) | 27–40 s |

O Qwen não tem nenhuma voz pré-definida brasileira. As 9 vozes são chinesas, inglesas, japonesa e coreana, então o português sai com sotaque de estrangeiro.

## Problemas de pronúncia (pela transcrição)

- **edge Antonio, Seu Cláudio:** "Aí o Zé folga" foi transcrito como "A Ilse afolga": ele emendou as palavras. A Francisca teve o mesmo problema ("Aí usa folga").
- **edge Andrew, Brian e Remy (vozes gringas):** o "Eu?!" final virou "U?" ou "Ih!". O resto da fala sai certo, mas é de esperar sotaque de fora.
- **Chatterbox padrão, Zé (0.5):** trocou "descanso" por "te cansa". A versão exag 0.8 saiu certa. Como o modelo varia a cada geração, vale gerar 2 ou 3 vezes e escolher a melhor.
- **Chatterbox ptbrf2, Amarelinho:** falou "Espera aí" em vez de "Pera aí".
- **Chatterbox, geral:** pronunciou todas as palavras e respeitou o "pra", o "Pô" e o "tá". Ignorou as reticências e não fez pausa nelas, mas fez a entonação de pergunta e de exclamação.
- **Qwen Ryan:** foi o pior. Disse "abriu" no lugar de "abre", "os afoga" no lugar de "o Zé folga" e "Bom" no lugar de "Pô". Fala devagar (12 s para uma fala que o Antonio diz em 8 s).
- **Qwen Aiden e Ryan:** leram "pra" como "para". O Uncle_Fu acertou.
- **Qwen Aiden e Uncle_Fu:** transcrição perfeita. O Uncle_Fu também é lento (11–12 s).
- Não apareceu acento lido em voz alta nem sotaque de Portugal na transcrição. Para sotaque, só ouvindo.

## O que deu errado no caminho

1. **Hugging Face devolveu 429 (Too Many Requests)** na API de listagem (`api/models/ResembleAI/chatterbox/tree/...`) por eu estar sem login. Contornei baixando os arquivos direto pelos links `resolve/main/...` para `_models/`. Não precisou de login nem de token.
2. O código do pip `chatterbox-tts` não carrega o finetune pt-BR (V3). Usei o código do Space oficial `ResembleAI/Chatterbox-Multilingual-TTS-pt-br` (MIT), baixado em `_space/`.
3. **Qwen em fp16 travou na GTX 1650** (`device-side assert`, NaN na amostragem). Em fp32 funcionou. Não testei o 1.7B: em fp32 ele não cabe nos 4 GB da placa.
4. O primeiro lote de edge-tts usou o texto original e ficou guardado em `_raw/texto_original/`. Um lote do Chatterbox saiu com textos misturados e foi para `_raw/descartado/`.
5. O endpoint padrão do edge-tts 7.2.8 funcionou normalmente e não precisou de patch.

## Recomendação

- **Para soar humano e de graça, o melhor é o Chatterbox pt-BR.** Ele fala português do Brasil nativo, tem controle de emoção (exaggeration) e clona timbre a partir de 10–15 s de áudio.
- **Próximo passo sugerido:** gravar de 10 a 15 s de uma voz real com autorização (a do Rafael, ou de amigos fazendo o Zé, o Seu Cláudio e o Amarelinho) e usar como referência no Chatterbox. É isso que tira a cara de robô. Não clonamos voz de famoso nem de meme sem autorização.
- O Qwen 0.6B fica como segunda opção. O Aiden e o Uncle_Fu acertam o texto, mas têm sotaque estrangeiro.
- Para regerar: `_scripts/gerar_edge.py`, `_scripts/gerar_chatterbox.py`, `_scripts/gerar_qwen.py` e `_scripts/finalizar.sh`, cada um com seu venv em `_env/`.
