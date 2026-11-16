// Ranking do app de jogos.
// { acao: 'ver', chave, token? }            -> top 10 + tua posição + teus amigos nesse ranking
// { acao: 'enviar', token, chave, t, tentativa } -> guarda o tempo se for teu melhor
// { acao: 'amigo', token, id }              -> vira amigo de quem mandou o link de duelo
// { acao: 'amigos', token }                 -> teus amigos com estrelas (de todos os jogos) e níveis
// { acao: 'estrelas', jogo?, token? }       -> ranking de estrelas de um jogo, ou geral (todos os jogos somados)
// chave: 'dia:AAAA-MM-DD' (desafio do dia, mesma grade pra todos) ou 'nivel:N' (níveis do Caça-números).
import { cors, db, json } from '../_comum/comum.ts';
import { emailDaSessao, nomePublico, confirmado, estrelasDe } from '../_comum/conta.ts';

// quantos números tem cada nível do Caça-números (igual ao jogos/js/acha.js), pra barrar tempo impossível.
// Desde 16/11/2026 os níveis crescem e a chave é 'nivel:N' (as antigas 'fase:N' eram de outra grade e não valem mais).
const Q = [9, 12, 16, 20, 25, 25, 25, 30, 30, 30, 36, 36, 36, 36, 42, 42, 42, 42, 49, 49, 49, 49, 49, 56, 56, 56, 56, 64, 64, 64];
const CHAVE_OK = /^(dia:\d{4}-\d{2}-\d{2}|nivel:([1-9]|[12]\d|30))$/;
const minimo = (chave: string) => chave.startsWith('dia:') ? 25 * 0.12 : Q[+chave.slice(6) - 1] * 0.1;
const CAMPOS = 'email, apelido, arroba, mostrar_arroba, arroba_confirmado, id_publico';

async function amigosDe(email: string) {
  const { data } = await db.from('amigos_jogo').select('b').eq('a', email);
  return (data ?? []).map((x) => x.b as string);
}
const linha = (r: Record<string, any>, c: Record<string, any> | undefined, eu: string | null, pos: number) => ({
  pos, nome: c ? nomePublico(c) : 'Jogador', ok: c ? confirmado(c) : false, t: Number(r.t), tentativa: r.tentativa ?? null, eu: r.email === eu,
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const b = await req.json();
    const eu = b.token ? await emailDaSessao(b.token) : null;

    if (b.acao === 'enviar') {
      if (!eu) return json({ erro: 'Entra na conta pra aparecer no ranking.' }, 401);
      const t = Math.round(Number(b.t) * 10) / 10;
      if (!CHAVE_OK.test(b.chave) || !(t >= minimo(b.chave)) || t > 9999) return json({ erro: 'Tempo inválido.' }, 400);
      if (b.chave.startsWith('dia:')) {
        // só vale o desafio de hoje ou de ontem (fuso de Brasília)
        const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
        const ontem = new Date(Date.now() - 27 * 3600e3).toISOString().slice(0, 10);
        if (![hoje, ontem].includes(b.chave.slice(4))) return json({ ok: true, ignorado: true });
      }
      const tent = Number.isInteger(b.tentativa) && b.tentativa > 0 ? Math.min(b.tentativa, 99999) : null;
      const { data: ant } = await db.from('recordes_jogo').select('t').eq('email', eu).eq('chave', b.chave).maybeSingle();
      if (!ant || t < Number(ant.t)) await db.from('recordes_jogo').upsert({ email: eu, chave: b.chave, t, tentativa: tent, criado_em: new Date().toISOString() });
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
      const lista = (data ?? []).map((c: any) => {
        const { estrelas, niveis } = estrelasDe(c.progresso, null);
        return { nome: nomePublico(c), ok: confirmado(c), estrelas, niveis, fases: niveis, eu: c.email === eu };
      }).sort((x, y) => y.estrelas - x.estrelas || y.niveis - x.niveis);
      return json({ amigos: lista.map((x, i) => ({ pos: i + 1, ...x })) });
    }

    if (b.acao === 'estrelas') {
      // soma as estrelas guardadas no progresso de cada conta (quem tem 0 não entra)
      const jogo = typeof b.jogo === 'string' && /^[a-z]{2,12}$/.test(b.jogo) ? b.jogo : null;
      const { data } = await db.from('contas_jogo').select(CAMPOS + ', progresso').limit(20000);
      const lista = (data ?? []).map((c: any) => ({ c, ...estrelasDe(c.progresso, jogo) }))
        .filter((x) => x.estrelas > 0)
        .sort((x, y) => y.estrelas - x.estrelas || y.niveis - x.niveis);
      const fmt = (x: any, i: number) => ({ pos: i + 1, nome: nomePublico(x.c), ok: confirmado(x.c), estrelas: x.estrelas, niveis: x.niveis, eu: x.c.email === eu });
      const iMeu = eu ? lista.findIndex((x) => x.c.email === eu) : -1;
      return json({ jogo, total: lista.length, top: lista.slice(0, 10).map(fmt), meu: iMeu >= 0 ? fmt(lista[iMeu], iMeu) : null });
    }

    // ver
    if (!CHAVE_OK.test(b.chave)) return json({ erro: 'Ranking inválido.' }, 400);
    const { data: top } = await db.from('recordes_jogo').select('email, t, tentativa').eq('chave', b.chave)
      .order('t', { ascending: true }).order('criado_em', { ascending: true }).limit(10);
    let meu = null, amigos: any[] = [];
    const precisa = new Set((top ?? []).map((r) => r.email));
    if (eu) {
      const { data: m } = await db.from('recordes_jogo').select('email, t, tentativa').eq('chave', b.chave).eq('email', eu).maybeSingle();
      if (m) {
        const { count } = await db.from('recordes_jogo').select('email', { count: 'exact', head: true }).eq('chave', b.chave).lt('t', m.t);
        meu = { ...m, pos: (count ?? 0) + 1 };
        precisa.add(eu);
      }
      const am = await amigosDe(eu);
      if (am.length) {
        const { data: ra } = await db.from('recordes_jogo').select('email, t, tentativa').eq('chave', b.chave).in('email', [eu, ...am]).order('t').limit(50);
        amigos = ra ?? [];
        amigos.forEach((r) => precisa.add(r.email));
      }
    }
    const { data: contas } = precisa.size ? await db.from('contas_jogo').select(CAMPOS).in('email', [...precisa]) : { data: [] };
    const porEmail = new Map((contas ?? []).map((c: any) => [c.email, c]));
    const { count: total } = await db.from('recordes_jogo').select('email', { count: 'exact', head: true }).eq('chave', b.chave);
    return json({
      total: total ?? 0,
      top: (top ?? []).map((r, i) => linha(r, porEmail.get(r.email), eu, i + 1)),
      meu: meu ? linha(meu, porEmail.get(eu!), eu, meu.pos) : null,
      amigos: amigos.map((r, i) => linha(r, porEmail.get(r.email), eu, i + 1)),
    });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Falha no ranking.' }, 500);
  }
});
