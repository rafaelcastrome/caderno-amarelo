// Painel gerencial do funil de venda (Rafael, 18/11/2026). Só leitura e só números.
// POST { senha, de: 'AAAA-MM-DD', ate: 'AAAA-MM-DD' }  (datas no horário de Brasília, no máximo 92 dias)
// Devolve: funil do período (pessoas por etapa, Instagram x fora), funil dia a dia, vendas Premium e Loja,
// onde a pessoa bate no limite e o que mais abrem na loja. NUNCA devolve e-mail, @ ou id de sessão.
// Senha: o secret PAINEL_SENHA_SHA256 guarda só o hash SHA-256 (hex) da senha, nunca a senha.
// Deploy: supabase functions deploy painel-funil --no-verify-jwt
import { cors, db, json } from '../_comum/comum.ts';

const HASH = (Deno.env.get('PAINEL_SENHA_SHA256') ?? '').trim().toLowerCase();
const TZ = 'America/Sao_Paulo';
const ETAPAS = ['abriu_site', 'jogou_primeiro_nivel', 'chegou_no_limite', 'abriu_premium', 'pediu_codigo',
  'entrou_na_conta', 'gerou_pix_premium', 'pagou_premium', 'abriu_loja', 'abriu_produto', 'gerou_pix_loja', 'pagou_loja'] as const;
// gerou_pix e pagou viram duas etapas cada: Premium (detalhe.plano) e Loja (detalhe.produto)
const etapa = (e: Ev) => (e.evento === 'gerou_pix' || e.evento === 'pagou') ? e.evento + (e.detalhe && 'plano' in e.detalhe ? '_premium' : '_loja') : e.evento;

async function sha256(txt: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function igual(a: string, b: string) { // compara sem vazar tempo
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const diaBr = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: TZ });
const dataOk = (s: unknown) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z'));
// meia-noite de Brasília (UTC-3, sem horário de verão desde 2019) em UTC
const inicioBr = (d: string) => new Date(d + 'T03:00:00Z');

async function tudo<T>(consulta: (de: number, ate: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const linhas: T[] = [];
  for (let i = 0; i < 100; i++) { // até 100 mil linhas
    const { data, error } = await consulta(i * 1000, i * 1000 + 999);
    if (error) throw new Error(String((error as { message?: string }).message ?? error));
    linhas.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return linhas;
}

type Ev = { criado_em: string; sessao: string | null; evento: string; detalhe: Record<string, unknown>; navegador_ig: boolean };
type Ped = { criado_em: string; produto: string; valor: number; status: string; navegador_ig: boolean | null };

function contar(evs: Ev[]) {
  const pessoas: Record<string, Set<string>> = {}, ig: Record<string, Set<string>> = {}, vezes: Record<string, number> = {};
  for (const e of ETAPAS) { pessoas[e] = new Set(); ig[e] = new Set(); vezes[e] = 0; }
  evs.forEach((e, i) => {
    const k = etapa(e);
    if (!(k in pessoas)) return;
    const quem = e.sessao ?? 'x' + i;
    pessoas[k].add(quem);
    if (e.navegador_ig) ig[k].add(quem);
    vezes[k]++;
  });
  return ETAPAS.map((e) => ({ evento: e, pessoas: pessoas[e].size, no_instagram: ig[e].size, vezes: vezes[e] }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const b = await req.json().catch(() => ({}));
    if (!HASH) return json({ erro: 'Painel sem senha configurada.' }, 503);
    if (typeof b.senha !== 'string' || !igual(await sha256(b.senha), HASH)) {
      await new Promise((r) => setTimeout(r, 1200)); // freia chute de senha
      return json({ erro: 'Senha errada.' }, 401);
    }
    const hoje = diaBr(new Date().toISOString());
    const ate = dataOk(b.ate) ? b.ate : hoje;
    let de = dataOk(b.de) ? b.de : ate;
    if (de > ate) de = ate;
    const dias = Math.round((Date.parse(ate) - Date.parse(de)) / 864e5) + 1;
    if (dias > 92) return json({ erro: 'Escolhe no máximo 92 dias.' }, 400);
    const t0 = inicioBr(de).toISOString();
    const t1 = new Date(inicioBr(ate).getTime() + 864e5).toISOString();

    const [evs, peds] = await Promise.all([
      tudo<Ev>((i, j) => db.from('eventos_funil').select('criado_em, sessao, evento, detalhe, navegador_ig')
        .gte('criado_em', t0).lt('criado_em', t1).order('id').range(i, j)),
      tudo<Ped>((i, j) => db.from('pedidos').select('criado_em, produto, valor, status, navegador_ig')
        .gte('criado_em', t0).lt('criado_em', t1).order('criado_em').range(i, j)),
    ]);

    // funil do período e dia a dia
    const porDia: Record<string, Ev[]> = {};
    for (const e of evs) (porDia[diaBr(e.criado_em)] ??= []).push(e);
    const diario = Object.keys(porDia).sort().reverse().map((d) => ({ dia: d, etapas: contar(porDia[d]) }));

    // vendas (pedidos: Pix gerado = linha criada; pago = status pago). Sem e-mail.
    const ehPlano = (s: string) => s.startsWith('passe-');
    const vendas = { premium: { pix: 0, pagos: 0, valor: 0 }, loja: { pix: 0, pagos: 0, valor: 0 } };
    const porProduto: Record<string, { produto: string; pix: number; pagos: number; valor: number }> = {};
    const vendasDia: Record<string, { pagos: number; valor: number }> = {};
    for (const p of peds) {
      const lado = ehPlano(p.produto) ? vendas.premium : vendas.loja;
      const pr = (porProduto[p.produto] ??= { produto: p.produto, pix: 0, pagos: 0, valor: 0 });
      lado.pix++; pr.pix++;
      if (p.status === 'pago') {
        const v = Number(p.valor);
        lado.pagos++; lado.valor += v; pr.pagos++; pr.valor += v;
        const vd = (vendasDia[diaBr(p.criado_em)] ??= { pagos: 0, valor: 0 });
        vd.pagos++; vd.valor += v;
      }
    }
    const { data: nomes } = await db.from('produtos').select('slug, nome').in('slug', Object.keys(porProduto).length ? Object.keys(porProduto) : ['-']);
    const nomeDe = Object.fromEntries((nomes ?? []).map((n) => [n.slug, n.nome]));

    // onde batem no limite (nível) e o que mais abrem na loja
    const ranking = (evento: string, chave: string) => {
      const m: Record<string, Set<string>> = {};
      evs.forEach((e, i) => {
        if (e.evento !== evento || e.detalhe?.[chave] == null) return;
        const k = String(e.detalhe[chave]).slice(0, 40);
        (m[k] ??= new Set()).add(e.sessao ?? 'x' + i);
      });
      return Object.entries(m).map(([k, s]) => ({ item: k, pessoas: s.size })).sort((a, b) => b.pessoas - a.pessoas).slice(0, 8);
    };
    const limitePorJogo = ranking('chegou_no_limite', 'jogo');
    const produtosAbertos = ranking('abriu_produto', 'produto').map((x) => ({ ...x, item: nomeDe[x.item] ?? x.item }));

    return json({
      de, ate, gerado_em: new Date().toISOString(),
      funil: contar(evs),
      diario,
      vendas,
      vendas_dia: vendasDia,
      produtos: Object.values(porProduto).map((p) => ({ ...p, nome: nomeDe[p.produto] ?? p.produto })).sort((a, b) => b.valor - a.valor || b.pix - a.pix),
      limite_por_jogo: limitePorJogo,
      produtos_abertos: produtosAbertos,
    });
  } catch (e) {
    console.error('painel', e);
    return json({ erro: 'Não consegui ler os dados agora.' }, 500);
  }
});
