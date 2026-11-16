// Pontuação do ranking (16/11/2026): conta a VELOCIDADE e os ACERTOS de cada nível, não só as estrelas.
// Lê o progresso que cada conta já guarda ('acha:N' t = tempo, 'cor:N'/'rapido:N' p = acertos,
// 'pegadinhas:N' a = acertos e m = tempo médio, charadas t = segundos até acertar) e calcula:
//  - pontos de cada nível na mesma escala (fazer o tempo/acertos de 3 estrelas = 500 pontos; mais rápido
//    ou mais acertos = mais pontos, até 1000), pra dar pra somar jogos diferentes no ranking geral;
//  - a métrica natural de cada jogo, pro ranking de um jogo só (tempo total, acertos...).
// As tabelas abaixo são cópia das de jogos/js (acha.js, cor.js, rapido.js). Mudou lá, muda aqui.

// Caça-números: [números, regras] de cada nível (acha.js F)
const ACHA: [number, string[]][] = [
  [9, []], [12, []], [16, []], [20, []], [25, []], [25, ['reverso']], [25, ['letras']], [30, []], [30, ['giro']], [30, ['embaralha']],
  [36, []], [36, ['pares']], [36, ['espelho']], [36, ['piscam']], [42, []], [42, ['reverso']], [42, ['cores']], [42, ['giro']],
  [49, []], [49, ['embaralha']], [49, ['pares']], [49, ['giro', 'reverso']], [49, ['piscam']], [56, []], [56, ['espelho']],
  [56, ['giro', 'embaralha']], [56, ['cores', 'reverso']], [64, []], [64, ['piscam', 'giro']], [64, ['giro', 'embaralha', 'piscam']],
];
const PESO: Record<string, number> = { reverso: 1.1, letras: 1.2, giro: 1.25, espelho: 1.3, cores: 1.3, embaralha: 1.35, piscam: 1.45, pares: 1.3 };
// tempo pra 3 estrelas de cada nível do Caça-números (igual a tempos() do acha.js)
const A3 = ACHA.map(([q, regras]) => {
  let a3 = (regras.includes('pares') ? q / 2 : q) * (0.52 + q / 200);
  regras.forEach((r) => { a3 *= PESO[r] || 1; });
  return Math.ceil(a3);
});
// acertos pra 3 estrelas em cada nível (cor.js e rapido.js NIV[..][ALVO][2])
const ALVO3: Record<string, number[]> = {
  cor: [18, 19, 20, 21, 22, 23, 22, 18, 19, 15],
  rapido: [18, 18, 18, 19, 19, 16, 16, 16, 14, 15],
};
export const CHARADAS = ['oque', 'olho', 'proximo', 'emojis']; // charadas.js GRUPOS

type Nivel = { t?: number; e?: number; p?: number; a?: number; m?: number };
const lim = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// pontos de um nível (0 a 1000)
export function pontosNivel(jogo: string, n: number, v: Nivel): number {
  const e = lim(Number(v?.e) || 0, 0, 3);
  if (jogo === 'acha') {
    const a3 = A3[n - 1], t = Number(v.t);
    return a3 && t > 0 ? Math.round(lim(500 * a3 / t, 0, 1000)) : 0;
  }
  if (jogo === 'cor' || jogo === 'rapido') {
    const alvo = ALVO3[jogo][n - 1], p = Number(v.p);
    return alvo && p > 0 ? Math.round(lim(500 * p / alvo, 0, 1000)) : 0;
  }
  if (jogo === 'pegadinhas') {
    // acertos mandam (50 cada); o tempo médio só desempata entre quem acertou igual (até 48)
    if (typeof v.a !== 'number') return 0;
    return lim(v.a, 0, 10) * 50 + Math.round(lim(30 - (Number(v.m) || 30), 0, 30) * 1.6);
  }
  // charadas: acertou (estrelas = sem errar) + bônus de quem respondeu rápido
  if (!e) return 0;
  const t = Number(v.t);
  return 250 + e * 50 + (t > 0 ? Math.round(150 * lim((90 - t) / 80, 0, 1)) : 0);
}

export type Resumo = { estrelas: number; niveis: number; pontos: number; tempo: number; acertos: number; media: number | null };

// resumo de um jogo (ou de todos, jogo = null) a partir do progresso guardado na conta
export function resumoDe(prog: Record<string, Nivel> | null, jogo: string | null): Resumo {
  let estrelas = 0, niveis = 0, pontos = 0, tempo = 0, acertos = 0, somaM = 0, qM = 0;
  for (const [k, v] of Object.entries(prog || {})) {
    if (!/^[a-z]{2,12}:\d{1,2}$/.test(k) || k.startsWith('pegadinha:')) continue; // fases antigas e pegadinha antiga não contam
    const [id, ns] = k.split(':');
    if (jogo && id !== jogo) continue;
    const n = +ns, e = lim(Number(v?.e) || 0, 0, 3);
    estrelas += e;
    niveis++;
    pontos += pontosNivel(id, n, v);
    if (typeof v?.t === 'number') tempo += v.t;
    if (id === 'cor' || id === 'rapido') acertos += Number(v.p) || 0;
    else if (id === 'pegadinhas') { acertos += Number(v.a) || 0; if (typeof v.m === 'number') { somaM += v.m; qM++; } }
    else if (CHARADAS.includes(id) && e > 0) acertos++;
  }
  return { estrelas, niveis, pontos, tempo: Math.round(tempo * 10) / 10, acertos, media: qM ? Math.round(somaM / qM * 10) / 10 : null };
}

// Ordem do ranking. Sem jogo (geral e amigos): mais pontos. Com jogo, a métrica dele:
//  - Caça-números: mais níveis feitos; empatou, menor tempo somado
//  - Fala a cor / Responde rápido: mais acertos somados nos níveis
//  - Pegadinhas: mais acertos; empatou, menor tempo médio
//  - charadas: mais charadas acertadas, mais estrelas (menos erros), menor tempo somado
// Em qualquer empate que sobrar, mais pontos e depois mais estrelas.
export function comparar(jogo: string | null) {
  return (x: Resumo, y: Resumo) => {
    let d = 0;
    if (jogo === 'acha') d = y.niveis - x.niveis || x.tempo - y.tempo;
    else if (jogo === 'cor' || jogo === 'rapido') d = y.acertos - x.acertos;
    else if (jogo === 'pegadinhas') d = y.acertos - x.acertos || (x.media ?? 99) - (y.media ?? 99);
    else if (jogo && CHARADAS.includes(jogo)) d = y.acertos - x.acertos || y.estrelas - x.estrelas || (x.tempo || 1e6) - (y.tempo || 1e6);
    return d || y.pontos - x.pontos || y.estrelas - x.estrelas || y.niveis - x.niveis;
  };
}
