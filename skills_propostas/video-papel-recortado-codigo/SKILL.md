---
name: video-papel-recortado-codigo
description: Use para fazer vídeos curtos do Caderno Amarelo no formato papel recortado em 3D feito só com código (three.js), sem Google Flow; separado do whiteboard-video e do video-papel-recortado-flow.
---

# Vídeo papel recortado em código (three.js) - Caderno Amarelo

Terceiro formato de vídeo do Caderno Amarelo. Os outros dois continuam como estão:
- whiteboard-video: o tradicional (imutável, não mexer).
- video-papel-recortado-flow: o mesmo visual de papel recortado, mas com cenas geradas no Google Flow (créditos contados).

Este aqui faz o diorama de papel recortado (peças de papelão em cima do bloco amarelo pautado, cadernos amarelos desfocados atrás) inteiro por código, em three.js no Chromium headless, na nuvem. Não precisa do PC do Rafael nem de crédito. Vantagens sobre o Flow: letras e números de papel certinhos, refazer à vontade, mesma cara em todas as cenas. Desvantagem: é mais "limpinho", então cada objeto precisa de detalhe de papel (camadas, costura, rebite, borda clara).

Motor: `videos/_papel3d/` (branch claude/project-thread-1ekqk1 até ir pra main). Amostra aprovada: `videos/_papel3d/exemplos/cena_mala.js` e `cena_numero.js`.

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
- Câmera sempre com um empurrãozinho lento (aproxima ~10%) e de cima, ~35°.
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
