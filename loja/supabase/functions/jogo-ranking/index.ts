// Ranking do app de jogos.
// { acao: 'ver', chave, token? }            -> top 10 + tua posição + teus amigos nesse ranking
// { acao: 'enviar', token, chave, t, tentativa, acertos? } -> guarda o tempo se for teu melhor
//     (Pegadinhas 'peg:N': t = tempo médio por pergunta, acertos 0..10; melhor = mais acertos, depois menor t)
// { acao: 'amigo', token, id }              -> vira amigo de quem mandou o link de duelo
// { acao: 'amigos', token }                 -> teus amigos por pontos (de todos os jogos)
// 'ver' e 'estrelas' aceitam { de, qtd } pra ver o ranking inteiro por páginas (botão "Ver todos", 17/11/2026):
//     de = a partir de qual posição (0 = 1º), qtd = quantos (padrão 10, máximo 50). Sem eles, top 10 como antes.
// { acao: 'estrelas', jogo?, token? }       -> ranking de um jogo (pela métrica dele) ou geral (pontos de todos os jogos)
//     Desde 16/11/2026 conta velocidade e acertos, não só estrelas: ver _comum/pontos.ts.
// chave: 'jdia:AAAA-MM-DD' (desafio do dia desde 16/11/2026: níveis 1 a 3 do jogo do dia, mesma semente pra todos;
//        Caça-números t = tempo somado; Fala a cor/Responde rápido acertos = acertos somados, mais acertos ganha),
//        'dia:AAAA-MM-DD' (desafio antigo, só leitura), 'nivel:N' (níveis do Caça-números)
//        ou 'peg:N' (17 níveis das Pegadinhas, 10 perguntas cada).
import { cors, db, json } from '../_comum/comum.ts';
import { emailDaSessao, nomePublico, confirmado } from '../_comum/conta.ts';
import { resumoDe, comparar } from '../_comum/pontos.ts';

// quantos números tem cada nível do Caça-números (igual ao jogos/js/acha.js), pra barrar tempo impossível.
// Desde 16/11/2026 os níveis crescem e a chave é 'nivel:N' (as antigas 'fase:N' eram de outra grade e não valem mais).
const Q = [9, 12, 16, 20, 25, 25, 25, 30, 30, 30, 36, 36, 36, 36, 42, 42, 42, 42, 49, 49, 49, 49, 49, 56, 56, 56, 56, 64, 64, 64];
const CHAVE_OK = /^(j?dia:\d{4}-\d{2}-\d{2}|nivel:([1-9]|[12]\d|30)|peg:([1-9]|1[0-7])|mais:(\d{4}-\d{2}-\d{2}|rec)|senhad?:\d{4}-\d{2}-\d{2})$/;
const ehPeg = (chave: string) => chave.startsWith('peg:');
const ehJdia = (chave: string) => chave.startsWith('jdia:');
// Só mais uma (17/11/2026): 'mais:AAAA-MM-DD' (desafio do dia) e 'mais:rec' (recorde de sempre); acertos, t = segundos que durou
const ehMais = (chave: string) => chave.startsWith('mais:');
// Senha do dia (17/11/2026): 'senha:DATA' / 'senhad:DATA' (difícil); acertos = 7 - chutes (1..6), t = segundos
const ehSenha = (chave: string) => chave.startsWith('senha');
const ehMaisDia = (chave: string) => ehMais(chave) && chave !== 'mais:rec';
// Pegadinhas: abaixo de 0,4 s por pergunta, em média, é robô; o máximo é 30 s
// desafio do dia: níveis 1 a 3 do Caça-números somam 9+12+16 = 37 números
const minimo = (chave: string) => ehSenha(chave) ? 3 : ehMais(chave) ? 5 : ehPeg(chave) ? 0.4 : ehJdia(chave) ? 37 * 0.1 : chave.startsWith('dia:') ? 25 * 0.12 : Q[+chave.slice(6) - 1] * 0.1;
const maximo = (chave: string) => ehPeg(chave) ? 30 : ehMais(chave) ? 3600 : 9999;
// página pedida (botão "Ver todos"): de = posição inicial (0 = 1º), qtd = tamanho da página
const pagina = (b: Record<string, any>) => {
  const de = Number.isInteger(b.de) && b.de > 0 ? Math.min(b.de, 100000) : 0;
  const qtd = Number.isInteger(b.qtd) && b.qtd > 0 ? Math.min(b.qtd, 50) : 10;
  return { de, qtd };
};
const CAMPOS = 'email, apelido, arroba, mostrar_arroba, arroba_confirmado, id_publico';

async function amigosDe(email: string) {
  const { data } = await db.from('amigos_jogo').select('b').eq('a', email);
  return (data ?? []).map((x) => x.b as string);
}
const linha = (r: Record<string, any>, c: Record<string, any> | undefined, eu: string | null, pos: number) => ({
  pos, nome: c ? nomePublico(c) : 'Jogador', ok: c ? confirmado(c) : false, t: Number(r.t), tentativa: r.tentativa ?? null,
  ...(r.acertos != null ? { acertos: r.acertos } : {}), eu: r.email === eu,
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const b = await req.json();
    const eu = b.token ? await emailDaSessao(b.token) : null;

    if (b.acao === 'enviar') {
      if (!eu) return json({ erro: 'Entra na conta pra aparecer no ranking.' }, 401);
      const t = Math.round(Number(b.t) * 10) / 10;
      if (!CHAVE_OK.test(b.chave) || !(t >= minimo(b.chave)) || t > maximo(b.chave)) return json({ erro: 'Tempo inválido.' }, 400);
      if (b.chave.startsWith('dia:')) return json({ ok: true, ignorado: true }); // desafio antigo não recebe mais
      // com acertos: Pegadinhas (0 a 10) ou desafio do dia de Fala a cor / Responde rápido (3 níveis de 30 s)
      const comAcertos = ehPeg(b.chave) || ehMais(b.chave) || ehSenha(b.chave) || (ehJdia(b.chave) && b.acertos != null);
      const acertos = Number(b.acertos);
      if (comAcertos && !(Number.isInteger(acertos) && acertos >= 0 && acertos <= (ehPeg(b.chave) ? 10 : ehMais(b.chave) ? 999 : ehSenha(b.chave) ? 6 : 300))) return json({ erro: 'Acertos inválidos.' }, 400);
      // Só mais uma: mais de 3 acertos por segundo, em média, é robô
      if (ehMais(b.chave) && acertos > t * 3) return json({ erro: 'Acertos inválidos.' }, 400);
      if (ehJdia(b.chave) || ehMaisDia(b.chave) || ehSenha(b.chave)) {
        // só vale o desafio de hoje ou de ontem (fuso de Brasília)
        const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
        const ontem = new Date(Date.now() - 27 * 3600e3).toISOString().slice(0, 10);
        if (![hoje, ontem].includes(b.chave.slice(b.chave.indexOf(':') + 1))) return json({ ok: true, ignorado: true });
      }
      const tent = Number.isInteger(b.tentativa) && b.tentativa > 0 ? Math.min(b.tentativa, 99999) : null;
      const { data: ant } = await db.from('recordes_jogo').select('t, acertos').eq('email', eu).eq('chave', b.chave).maybeSingle();
      const melhor = !ant || (comAcertos
        ? acertos > Number(ant.acertos ?? -1) || (acertos === Number(ant.acertos) && t < Number(ant.t))
        : t < Number(ant.t));
      if (melhor) await db.from('recordes_jogo').upsert({ email: eu, chave: b.chave, t, tentativa: tent, ...(comAcertos ? { acertos } : {}), criado_em: new Date().toISOString() });
      return json({ ok: true });
    }

    if (b.acao === 'amigo') {
      if (!eu || typeof b.id !== 'string') return json({ ok: false });
      const { data: outro } = await db.from('contas_jogo').select('email').eq('id_publico', b.id).maybeSingle();
      if (!outro || outro.email === eu) return json({ ok: false });
      await db.from('amigos_jogo').upsert([{ a: eu, b: outro.email }, { a: outro.email, b: eu }], { ignoreDuplicates: true });
      return json({ ok: true });
    }

    if (b.acao === 'amigos') {
      if (!eu) return json({ amigos: [] });
      const emails = [eu, ...(await amigosDe(eu))].slice(0, 200);
      const { data } = await db.from('contas_jogo').select(CAMPOS + ', progresso').in('email', emails);
      const ordem = comparar(null);
      const lista = (data ?? []).map((c: any) => ({ c, ...resumoDe(c.progresso, null) }))
        .sort(ordem)
        .map((x) => ({ nome: nomePublico(x.c), ok: confirmado(x.c), estrelas: x.estrelas, niveis: x.niveis, fases: x.niveis, pontos: x.pontos, eu: x.c.email === eu }));
      return json({ amigos: lista.map((x, i) => ({ pos: i + 1, ...x })) });
    }

    if (b.acao === 'estrelas') {
      // lê o progresso de cada conta e ordena pela métrica do jogo (ou pontos, no geral). Quem não jogou não entra.
      const jogo = typeof b.jogo === 'string' && /^[a-z]{2,12}$/.test(b.jogo) ? b.jogo : null;
      const { data } = await db.from('contas_jogo').select(CAMPOS + ', progresso').limit(20000);
      const lista = (data ?? []).map((c: any) => ({ c, ...resumoDe(c.progresso, jogo) }))
        .filter((x) => x.niveis > 0)
        .sort(comparar(jogo));
      const fmt = (x: any, i: number) => ({
        pos: i + 1, nome: nomePublico(x.c), ok: confirmado(x.c), estrelas: x.estrelas, niveis: x.niveis,
        pontos: x.pontos, tempo: x.tempo, acertos: x.acertos, media: x.media, velocidade: x.velocidade, eu: x.c.email === eu,
      });
      const iMeu = eu ? lista.findIndex((x) => x.c.email === eu) : -1;
      const { de, qtd } = pagina(b);
      return json({ jogo, total: lista.length, de, top: lista.slice(de, de + qtd).map((x, i) => fmt(x, de + i)), meu: iMeu >= 0 ? fmt(lista[iMeu], iMeu) : null });
    }

    // ver
    if (!CHAVE_OK.test(b.chave)) return json({ erro: 'Ranking inválido.' }, 400);
    // Pegadinhas e desafio do dia: mais acertos primeiro (no Caça-números do dia acertos fica vazio); empate, menor tempo.
    const peg = ehPeg(b.chave) || ehJdia(b.chave) || ehMais(b.chave) || ehSenha(b.chave);
    const COLS = peg ? 'email, t, tentativa, acertos' : 'email, t, tentativa';
    const ordenar = (q: any) => (peg ? q.order('acertos', { ascending: false, nullsFirst: false }) : q).order('t', { ascending: true });
    const { de, qtd } = pagina(b);
    const { data: top } = await ordenar(db.from('recordes_jogo').select(COLS).eq('chave', b.chave)).order('criado_em', { ascending: true }).range(de, de + qtd - 1);
    let meu = null, amigos: any[] = [];
    const precisa = new Set((top ?? []).map((r) => r.email));
    if (eu) {
      const { data: m } = await db.from('recordes_jogo').select(COLS).eq('chave', b.chave).eq('email', eu).maybeSingle();
      if (m) {
        let qc = db.from('recordes_jogo').select('email', { count: 'exact', head: true }).eq('chave', b.chave);
        qc = peg && m.acertos != null ? qc.or(`acertos.gt.${Number(m.acertos) || 0},and(acertos.eq.${Number(m.acertos) || 0},t.lt.${Number(m.t)})`) : qc.lt('t', m.t);
        const { count } = await qc;
        meu = { ...m, pos: (count ?? 0) + 1 };
        precisa.add(eu);
      }
      const am = await amigosDe(eu);
      if (am.length) {
        const { data: ra } = await ordenar(db.from('recordes_jogo').select(COLS).eq('chave', b.chave).in('email', [eu, ...am])).limit(50);
        amigos = ra ?? [];
        amigos.forEach((r) => precisa.add(r.email));
      }
    }
    const { data: contas } = precisa.size ? await db.from('contas_jogo').select(CAMPOS).in('email', [...precisa]) : { data: [] };
    const porEmail = new Map((contas ?? []).map((c: any) => [c.email, c]));
    const { count: total } = await db.from('recordes_jogo').select('email', { count: 'exact', head: true }).eq('chave', b.chave);
    return json({
      total: total ?? 0, de,
      top: (top ?? []).map((r, i) => linha(r, porEmail.get(r.email), eu, de + i + 1)),
      meu: meu ? linha(meu, porEmail.get(eu!), eu, meu.pos) : null,
      amigos: amigos.map((r, i) => linha(r, porEmail.get(r.email), eu, i + 1)),
    });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Falha no ranking.' }, 500);
  }
});
