// "Fim da escala 6x1" — v3: a mesma historinha e as MESMAS cenas do v2 (importadas, sem alteração), com falas em tom de
// áudio de WhatsApp e uma voz por personagem (Chatterbox, Qwen3-TTS e edge-tts; ver falas.json > vozes).
// Fim6x1 e Fim6x1v2 continuam intactos. Áudio e narracao.json vêm de amostras_vozes/_scripts/previa (ROTEIRO=fim6x1v3).
// Os cortes de câmera ficam dentro de cada cena (<Cortes>); aqui não há zoom geral.
import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from "remotion";
import { carregarFonte } from "../../identidade/fonte";
import { AcabamentoPapel, FundoCaderno } from "../../identidade/FundoCaderno";
import { MarcaDagua } from "../../identidade/MarcaDagua";
import { FPS, H, W } from "../../identidade/tema";
import { Legendas } from "../../legendas/Legendas";
import { CenaProps, Linha } from "../fim6x1/comum";
import { momento } from "../momento";
import { calcularTempos, CenaRoteiro, Narracao } from "../tempo";
import { CENAS_V2 } from "../fim6x1v2/cenas";
import falas from "./falas.json";
import narracao from "./narracao.json";

carregarFonte();

const { cenas: linhas, total } = calcularTempos(falas.cenas as CenaRoteiro[], narracao as Narracao, FPS);

const numeros = [...new Set(linhas.map((l) => l.cena ?? 0))];
const blocos = numeros.map((n) => {
  const doBloco = linhas.filter((l) => l.cena === n);
  const inicio = doBloco[0].inicio;
  const dur = doBloco.reduce((a, l) => a + l.duracao, 0);
  const comOff: Linha[] = doBloco.map((l) => ({ ...l, off: l.inicio - inicio }));
  return { n, inicio, dur, linhas: comOff };
});

const ultima = linhas[linhas.length - 1];
const tArroba = ultima.inicio + ultima.antes + momento(ultima.palavras, "arroba", FPS, 1, 0);
const esconder = Math.max(0, (total - tArroba + 4) / FPS);

export const Fim6x1v3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fbf5df" }}>
    <FundoCaderno />
    {blocos.map((b) => {
      const Cena: React.FC<CenaProps> | undefined = CENAS_V2[b.n];
      return (
        <Sequence key={b.n} from={b.inicio} durationInFrames={b.dur} name={`Cena ${b.n}`}>
          {Cena ? <Cena linhas={b.linhas} dur={b.dur} /> : null}
          {b.linhas.map((l) => (
            <Sequence key={l.id} from={l.off + l.antes} durationInFrames={Math.max(1, l.duracao - l.antes)} layout="none" name={`${l.id} (${l.quem})`}>
              {l.audio ? <Audio src={staticFile(l.audio)} /> : null}
              <Legendas palavras={l.palavras} destaques={l.destaques} trocas={l.trocas} y={1500} />
            </Sequence>
          ))}
        </Sequence>
      );
    })}
    <AcabamentoPapel />
    <MarcaDagua esconderNoFim={esconder} />
  </AbsoluteFill>
);

export const Fim6x1v3Composition: React.FC = () => (
  <Composition id="Fim6x1v3" component={Fim6x1v3} durationInFrames={Math.max(1, total)} fps={FPS} width={W} height={H} />
);
