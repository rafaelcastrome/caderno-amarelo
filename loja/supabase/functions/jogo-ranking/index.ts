// Ranking do app de jogos.
// { acao: 'ver', chave, token? }            -> top 10 + tua posição + teus amigos nesse ranking
// { acao: 'enviar', token, chave, t, tentativa } -> guarda o tempo se for teu melhor
// { acao: 'amigo', token, id }              -> vira amigo de quem mandou o link de duelo
// { acao: 'amigos', token }                 -> teus amigos com estrelas e fases
// chave: 'dia:AAAA-MM-DD' (desafio do dia, mesma grade pra todos) ou 'fase:N'.
import { cors, db, json } from '../_comum/comum.ts';
import { emailDaSessao, nomePublico, confirmado } from '../_comum/conta.ts';

// tamanho da grade de cada fase (igual ao jogos/js/acha.js), pra barrar tempo impossível
const N = [3, 4, 5, 5, 5, 6, 5, 5, 6, 5, 6, 5, 6, 6, 7, 5, 6, 7, 6, 7, 5, 6, 7, 6, 7, 6, 7, 7, 7, 7];
const CHAVE_OK = /^(dia:\d{4}-\d{2}-\d{2}|fase:([1-9]|[12]\d|30))$/;
const minimo = (chave: string) => chave.startsWith('dia:') ? 25 * 0.12 : (N[+chave.slice(5) - 1] ** 2) * 0.07;
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
        const p = Object.values(c.progresso || {}) as any[];
        return { nome: nomePublico(c), ok: confirmado(c), estrelas: p.reduce((s, x) => s + (x.e || 0), 0), fases: p.length, eu: c.email === eu };
      }).sort((x, y) => y.estrelas - x.estrelas || y.fases - x.fases);
      return json({ amigos: lista.map((x, i) => ({ pos: i + 1, ...x })) });
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
