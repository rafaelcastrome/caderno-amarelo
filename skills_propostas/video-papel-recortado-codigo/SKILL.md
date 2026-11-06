---
name: video-papel-recortado-codigo
description: Use para vídeos do Caderno Amarelo em papel recortado 3D feito só com código (three.js), desafios ou histórias em série como cena de filme com bonecos que andam, falam e encenam; sem Google Flow.
---

# Vídeo papel recortado em código (three.js) - Caderno Amarelo

Terceiro formato de vídeo do Caderno Amarelo. Os outros dois continuam como estão:
- whiteboard-video: o tradicional (imutável, não mexer).
- video-papel-recortado-flow: o mesmo visual de papel recortado, mas com cenas geradas no Google Flow (créditos contados).

Este aqui faz o diorama de papel recortado (peças de papelão em cima do bloco amarelo pautado, cadernos amarelos desfocados atrás) inteiro por código, em three.js no Chromium headless, na nuvem. Não precisa do PC do Rafael nem de crédito. Vantagens sobre o Flow: letras e números de papel certinhos, refazer à vontade, mesma cara em todas as cenas. Desvantagem: é mais "limpinho", então cada objeto precisa de detalhe de papel (camadas, costura, rebite, borda clara).

Motor: `videos/_papel3d/` (branch claude/project-thread-1ekqk1 até ir pra main; versão com câmera tremendo/zoom na claude/project-thread-4215i7). Amostras aprovadas: `videos/_papel3d/exemplos/cena_mala.js` e `cena_numero.js` (desafio) e `videos/duas_bombas/filme/` (história como cena de filme, aprovada pelo Rafael em 06/11: "Ficou top").

Dois modos:
- **Desafio** (seções 1 a 5): objetos de papel montando, narrador só.
- **História / série como cena de filme** (seção 6): bonecos de verdade que andam, falam e encenam tudo que acontece. É o modo pra historinha.

## 1. Ideia e roteiro (igual ao formato Flow)
- Desafio primeiro. Mandar 3 ideias curtas e esperar o Rafael escolher. Sem revelar a resposta no pitch.
- O truque funciona com quase 100% das pessoas (conta forçada, mentalismo). Nunca "você não percebeu".
- Roteiro em tabela: nº, fala, texto na tela, objeto de papel da cena. 10 a 14 cenas, uma ideia por cena, ~3-4 s cada. Mirar 30-40 s no total, revelação cedo, CTA de compartilhar (o eu_adivinho de 71 s perdeu gente perto de 0:57).
- Fala estilo áudio de WhatsApp: frases curtas, "..." e "!" pras pausas, sem emoji. Pausa clara antes de "Pensou?".
- Final: fato "uau" checado + CTA (manda pro amigo, volta o vídeo, me segue) + loop (última cena igual à primeira).
- Esconder a resposta na primeira cena (ex.: matrioska na etiqueta da mala).
- Roteiro num Claude Doc; ler as edições do Rafael antes de seguir.

## 2. Montar as cenas em código
Preparar uma vez: `cd videos/_papel3d && npm i` (three 0.160.0 e opentype.js 1.3.4; playwright e ffmpeg já existem na nuvem).

Cada cena é um arquivo `videos/<video>/cenas/cenaNN.js`:

```js
window.CENA = (P) => {
  const { F, CORES: C } = P;
  P.peca(F.ret(3.1, 2.1, 0.28), { prof: 0.8, cor: C.VERMELHO, y: 1.08, t: 0.3 });   // peça em pé
  P.texto('18', { tam: 3.2, prof: 0.16, cor: C.VERMELHO, y: 0.05, t: 0.6 });        // número de papel
  P.camera([{ t: 0, pos: [0.5, 10.6, 13.4], alvo: [0, 0.9, 0.4] }, { t: 4, pos: [0.2, 9.6, 12], alvo: [0, 1, 0.5] }]);
  return { dur: 4 };
};
```

O que o motor dá (`papel.js`):
- Formas `F`: `ret(w,h,raio)`, `circulo`, `elipse`, `anel`, `arco`, `poligono([[x,y]...])`, `estrela`, `nuvem`, `coracao`.
- `P.peca(forma, o)`: papelão extrudado em pé. `prof` = espessura (fina 0.02-0.06 = papel com borda clara; grossa > 0.15 = caixa).
- `P.deitado(forma, o)`: recorte deitado na folha (chão, rua, tapete).
- `P.impresso(w, h, (g, w, h) => {desenho canvas 2D}, o)`: papel impresso (etiqueta, foto, bandeira, carta).
- `P.caixa(w, h, d, o)`, `P.rebite(o)`, `P.texto(str, o)` (fonte Caveat Bold, letras uma a uma).
- `P.costura(cor, {w, h, margem, linha})`: material com costura tracejada (tiras, bolsos).
- `P.grupo(o)`, `P.animar((ts, t) => ...)` pra girar/balançar, `P.camera([...])` com quadros-chave.
- Opções de entrada `o`: `x, y, z, rx, ry, rz, pai, t` (quando entra), `dur`, `entra: 'cai' | 'pop' | 'levanta' | 'desliza' | 'fixo'`, `esboco: false` (sem contorno a lápis antes).
- Coordenadas: folha em y=0, objeto principal perto de (0, 0, 0). Altura útil até ~3.5. Tudo que for "palco" fica dentro de x de -2.5 a 2.5.

Regras de visual (o que fez a mala nova ficar perto do Flow):
- Nada de objeto feito de uma peça só: corpo + painel com costura + tiras + cantoneiras + rebites, cada um uma camada.
- Peças entram uma por uma (stop-motion 12 qps), com o contorno a lápis aparecendo antes, 2-4 s pra montar o objeto inteiro.
- Cores do `P.CORES` (papel fosco, quentes). Sombra macia já vem da luz.
- Faixa de cima da tela (y < ~200 px) fica livre: é onde entra o texto na montagem. Objeto no meio.
- Câmera sempre com um empurrãozinho lento (aproxima ~10%) e de cima, ~35° (no modo filme a câmera é mais baixa e acompanha a ação, ver seção 6).
- `P.camOff = (t) => [dx, dy, dz]` treme a câmera (explosão, impacto); `P.fov` muda o zoom.
- Nunca deixar letra pela metade, peça atravessando outra ou peça afundada na folha: conferir quadros antes.

Conferir rápido (quadros soltos, ~5 s):
`node render.js ../<video>/cenas/cena01.js ../<video>/flow/cena01.mp4 --prev 1 3.5` -> abre os .jpg e olha.

Renderizar (~25 s de máquina por segundo de vídeo; rodar várias cenas em paralelo com `&`):
`node render.js ../<video>/cenas/cena01.js ../<video>/flow/cena01.mp4` -> mp4 720x1280 + cena01.json (instantes das peças).
Som de papel: `python3 sfx_papel.py ../<video>/flow/cena01.json` -> cena01.wav (batidinhas graves, sem chiado). Juntar no clipe:
`ffmpeg -i cena01.mp4 -i cena01.wav -c:v copy -c:a aac -shortest cena01_som.mp4` e renomear pra cena01.mp4.

Mandar uma folha com um quadro de cada cena (contact sheet) pro Rafael aprovar ANTES de ligar voz e montagem.

## 3. Voz (igual ao formato Flow)
- Algieba no gemini-3.1-flash-tts-preview com prompt de emoção (apresentador carismático, natural, misterioso nas reticências). Só vozes aprovadas. Antonio é robótico demais pra esse formato.
- UMA requisição com o roteiro inteiro (falas separadas por linha em branco, pausa de 1 s entre parágrafos), cortar nos silêncios (silencedetect -45 dB, d=0.5; d=0.2 onde grudar). Nunca misturar modelos de TTS.
- Conferir com Whisper (npm sts-whisper-small) no vídeo final.

## 4. Montagem (videos/eu_adivinho/montar.py é o modelo, branch claude/project-thread-aq5ap0)
- Copiar o montar.py pra `videos/<video>/`. Ele lê `flow/cenaNN.mp4`: são os clipes renderizados aqui.
- Diferença pro Flow: o clipe em código já começa no ponto certo, então NÃO acelerar 2x nem pegar o final. Se a fala for mais longa que o clipe, segurar o último quadro (ou renderizar a cena com `dur` = duração da fala, o melhor). Dá pra ler a duração de cada fala no timeline.json e renderizar depois da voz.
- Som do clipe (tac de papel) por baixo da voz, volume ~0.35.
- Textos por cima pequenos, etiqueta branca na faixa de cima (y ~105). Tabela A=1... no rodapé quando o truque usar letra; contagem 3-2-1 pequena embaixo nas pausas.
- @Cardeno_Amarelo andando pelo rodapé o vídeo todo.
- Fade no fim de cada fala: `areverse,afade=t=in:d=0.01,areverse`. NUNCA `afade=t=out:st=0` (deixa a voz muda).
- Final 720x1280 30 qps, abaixo de ~10 MB (crf 25).

## 5. Entrega
- mp4 em /mnt/project-files/videos/<video>/ e no git (sem os clipes intermediários se forem grandes).
- Legendas TikTok e Instagram e comentário fixado, uma mensagem por item, em bloco de código, terminando com #cadernoamarelo.
- Sugerir Reel de teste até o formato provar resultado.


## 6. Modo história / série como cena de filme
O Rafael rejeitou história só narrada com objetos parados e com boneco de frente que só balança (06/11: "Ainda não tá legal, quero movimentos imitando a realidade"). O que ele aprovou:
- **Tudo que é narrado é mostrado acontecendo**: a bomba caindo, o boneco sendo arremessado, o trem andando. Nada de cena parada com texto.
- **Os personagens falam de verdade** em vez de o narrador contar tudo. Narrador entra pouco: abertura, passagem de tempo, gancho final.
- **Andar de gente de verdade**: joelho, cotovelo, pé firme no chão (não escorrega), braço balançando oposto à perna.
- **Câmera de filme**: plano aberto da cidade descendo, plano médio de dois personagens conversando, câmera acompanhando quem anda, câmera baixa olhando pro céu, câmera descendo junto com o que cai, tremor no impacto.
- Episódios de 60 a 90 s em série, cada um termina num gancho ("a cidade dele se chamava...") e CTA "a parte dois já tá no meu perfil... me segue pra não perder!".

### Arquivos (modelo: `videos/duas_bombas/filme/`)
- `../lib.js`: props reaproveitáveis (casa, cidade, trem, navio, guindaste, cogumelo, clarão, flash, noite, céu com nuvens e passarinhos, fumaça, ondas, sol, mesa, árvore...).
- `ator.js` (`window.ATOR(P, L)`): o boneco de filme `L.ator` e props de filme.
- `cenas.js`: `window.EP = [ (P, L, D) => {...}, ... ]`, uma função por cena.
- `build.py`: lista `CENAS = [(duração, [(arquivo_da_fala, início_na_cena, personagem_que_mexe_a_boca | None), ...]), ...]`; gera `cenas/fNN.js` (lib + ator + cenas + `window.BOCA`) e renderiza `flow/fNN.mp4` (4 em paralelo). `python3 build.py --prev 1.01 3.5 6 2 5` = só quadros soltos das cenas 2 e 5 (tempo com ponto, senão vira número de cena).
- `sfx_filme.py`: efeitos sintetizados em numpy.
- `montar.py`: junta clipes, vozes nos tempos certos, efeitos, papel, etiquetas, legendas das falas e o @ andando.
- `folha.py saida.jpg quadros...`: folha de quadros pra conferir.

### O boneco `L.ator(o)`
Boneco de perfil (olha pra +x; `dir: -1` olha pra esquerda; virar = a peça de papel gira de lado, fica bonito). Peças: coxa, canela, pé, tronco, braço, antebraço, mão, pescoço, cabeça com nariz, queixo, orelha, olho que pisca, sobrancelha, cabelo e boca. Membros do lado de trás um pouco mais escuros.
- `mov: [[t, x, z?], ...]`: onde ele está no tempo (com suavização; `'lin'` no 4º item = velocidade constante). O passo sai da distância percorrida, então o pé fica plantado (IK de 2 ossos no joelho, passada 1.0).
- `dirs: [[t, ±1], ...]`, `poses: [[t, 'pose', duração_da_transição], ...]` (pode somar: `'sentado+desenha'`).
- Poses prontas: normal, sentado, desenha, levanta_lapis, bracos_cima, mao_cabeca, bolsos, aponta, aponta_cima, olha_cima, protege, voando, deitado, deitado_mexe, ajoelhado, curvado, sentado_chao, abre_bracos, mao_orelha, apoia, ferido. Pose nova = objeto com `lean, head, sN, eN, sF, eF, hipY, tN, kN, tF, kF, pN, pF, rot, ly` (ombro/cotovelo/coxa/joelho/pé, N = lado da frente, F = de trás).
- `voo: {t0, t1, dx, h, giro}`: arremessado (arco + cambalhota); combinar com poses voando -> deitado. Levantar = deitado_mexe -> ajoelhado -> curvado.
- `nome`: liga a boca ao áudio (`window.BOCA[nome]`, amplitude da fala a 30 qps). Enquanto fala, a mão gesticula sozinha (`gesticula: false` desliga).
- `roupa, calca, terno, chapeu (cor), band (enfaixado), mala ([[t, 0|1]] ou true), s (escala), y, pai (ex.: dentro do trem), t: -1` (já está em cena) ou t (monta com lápis).
- Props de filme: `L.fundoCeu` (painel de céu atrás, essencial pra câmera baixa), `L.veu(cor, op)` (tinta de poeira/noite), `L.b29`, `L.bomba({traj})`, `L.boladefogo`, `L.ondaChoque`, `L.destrocos`, `L.tremor([[t, força, duração]])`, `L.K` (keyframes).

### Voz com personagens
- Narrador: Algieba (`videos/_comum/gemini_historia.py`). Falas: `videos/_comum/gemini_dialogo.py` (multi-voz Gemini 3.1, 2 personagens por requisição, linhas `Nome: fala` separadas por linha em branco, `--dir` com a atuação da cena). Usados na série: Tsutomu = Achird, colega = Alnilam. Só vozes aprovadas; mesmo modelo no vídeo todo.
- Cortar cada fala nos silêncios (silencedetect -38 dB, d=0.45), conferir com Whisper, `atempo=1.1` só no narrador.
- Cena dura o que a fala precisa + respiro; o tempo de cada fala vai em `CENAS` do build.py.

### Som
Passos sincronizados com a passada, ronco de avião, assobio de bomba descendo, explosão grave (sem chiado), zumbido no ouvido depois do impacto, fogo crepitando, trem. Papel por baixo baixinho (0.22). loudnorm I=-15.

### Montagem
Etiqueta de lugar/data na faixa de cima ("Hiroshima, 1945", "6 de agosto · 8h15"), legenda das falas embaixo com o nome do personagem em amarelo, @ andando no rodapé. Conferir quadros de cada cena (enquadramento: ninguém cortado na borda; câmera a ~9-10 de distância pra plano médio no vertical) antes de renderizar tudo. Render: ~70 s de vídeo levam ~5 min com 4 em paralelo.

### Checar fatos
História real: conferir os detalhes na internet antes de encenar (Wikipedia é bloqueada na nuvem, usar busca). Detalhe sem fonte fica de fora.
