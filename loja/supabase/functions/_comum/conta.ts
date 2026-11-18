// Utilitários da conta do app de jogos (entrar com e-mail + código).
import { db } from './comum.ts';

export const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '');

export async function sha256(txt: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Planos (slug do produto -> dias liberados por pagamento; null = pra sempre, sem data de fim).
export const PLANOS: Record<string, number | null> = { 'passe-mensal': 30, 'passe-anual': 365, 'passe-vitalicio': null };

// Premium = soma dos passes pagos desse e-mail, contando a partir do pagamento
// (renovar antes de acabar soma os dias, não perde nada). Pagou o vitalício: Premium sem data (ate = null),
// que o app já entende como "não vence".
export async function premiumDe(email: string): Promise<{ premium: boolean; ate: string | null }> {
  const { data } = await db.from('pedidos').select('produto, pago_em')
    .eq('email', email).eq('status', 'pago').in('produto', Object.keys(PLANOS)).order('pago_em', { ascending: true });
  let fim = 0;
  for (const p of data ?? []) {
    const dias = PLANOS[p.produto];
    if (dias === null) return { premium: true, ate: null };
    const ini = Math.max(new Date(p.pago_em).getTime(), fim);
    fim = ini + dias * 864e5;
  }
  return fim > Date.now() ? { premium: true, ate: new Date(fim).toISOString() } : { premium: false, ate: null };
}
// Quais desses e-mails têm Premium ativo agora (selo dourado do ranking). Uma consulta só, sem expor e-mail.
export async function premiumDeVarios(emails: string[]): Promise<Set<string>> {
  const ativos = new Set<string>();
  const lista = [...new Set(emails)].filter(Boolean);
  if (!lista.length) return ativos;
  const fim = new Map<string, number>();
  for (let i = 0; i < lista.length; i += 200) {
    const { data } = await db.from('pedidos').select('email, produto, pago_em')
      .eq('status', 'pago').in('produto', Object.keys(PLANOS)).in('email', lista.slice(i, i + 200)).order('pago_em', { ascending: true });
    for (const p of data ?? []) {
      const dias = PLANOS[p.produto];
      if (dias === null) { fim.set(p.email, Infinity); continue; }
      const ini = Math.max(new Date(p.pago_em).getTime(), fim.get(p.email) ?? 0);
      fim.set(p.email, ini + dias * 864e5);
    }
  }
  for (const [e, f] of fim) if (f > Date.now()) ativos.add(e);
  return ativos;
}

// Compatível com quem só quer a data (null também quando é vitalício: use premiumDe pra saber se é Premium).
export async function validadePremium(email: string) { return (await premiumDe(email)).ate; }

// Devolve o e-mail da sessão ou null.
export async function emailDaSessao(token: unknown) {
  if (typeof token !== 'string' || token.length < 30) return null;
  const { data } = await db.from('sessoes_jogo').select('email').eq('token_hash', await sha256(token)).single();
  return data?.email ?? null;
}

// Junta dois progressos. Chaves: "acha:4", "cor:3", "oque:12"... = nível de cada jogo
// ("1".."30" = fases antigas do Acha do 1 ao 25, antes dos níveis crescerem em 16/11/2026: guardadas, mas não contam estrela) (estrelas e; t = tempo, p = pontos, opcionais).
// Fica o melhor de cada: mais estrelas, menor tempo, mais pontos, mais tentativas (n) e em qual tentativa fez o recorde (r).
// Pegadinhas também guardam a = acertos (0..10) e m = tempo médio, que acompanham o melhor p.
type Nivel = { t?: number; e: number; p?: number; n?: number; r?: number | null; a?: number; m?: number };
const CHAVE_FASE = /^\d{1,2}$/, CHAVE_NIVEL = /^[a-z]{2,12}:\d{1,2}$/;
export function juntar(a: Record<string, Nivel>, b: Record<string, Nivel>) {
  const r: Record<string, Nivel> = { ...(a || {}) };
  const int = (x: unknown) => (typeof x === 'number' && x > 0 ? Math.min(99999, Math.round(x)) : 0);
  for (const [k, v] of Object.entries(b || {})) {
    const fase = CHAVE_FASE.test(k);
    if ((!fase && !CHAVE_NIVEL.test(k)) || typeof v?.e !== 'number' || (fase && typeof v?.t !== 'number')) continue;
    const e = Math.max(0, Math.min(3, Math.round(v.e)));
    const t = typeof v.t === 'number' ? Math.max(0.5, Math.min(9999, v.t)) : undefined;
    const pts = typeof v.p === 'number' ? Math.max(0, Math.min(9999, Math.round(v.p))) : undefined;
    const n = int(v.n), tr = int(v.r) || null;
    const am = typeof v.a === 'number' && typeof v.m === 'number'
      ? { a: Math.max(0, Math.min(10, Math.round(v.a))), m: Math.max(0, Math.min(99, Math.round(v.m * 10) / 10)) } : {};
    const o = r[k];
    if (!o) { r[k] = { e, n, r: tr, ...(t != null ? { t } : {}), ...(pts != null ? { p: pts } : {}), ...am }; continue; }
    const melhor = t != null ? (o.t == null || t < o.t) : pts != null ? (o.p == null || pts > o.p) : e > (o.e || 0);
    const novo: Nivel = { e: Math.max(o.e || 0, e), n: Math.max(int(o.n), n), r: melhor ? tr : (o.r ?? null) };
    const tt = t != null && o.t != null ? Math.min(o.t, t) : (t ?? o.t);
    const pp = pts != null && o.p != null ? Math.max(o.p, pts) : (pts ?? o.p);
    if (tt != null) novo.t = tt;
    if (pp != null) novo.p = pp;
    const amFica = melhor && 'a' in am ? am : (o.a != null ? { a: o.a, m: o.m } : am);
    Object.assign(novo, amFica);
    r[k] = novo;
  }
  return r;
}

// Estrelas de um jogo (ou de todos, sem jogo) dentro do progresso da conta
export function estrelasDe(prog: Record<string, Nivel> | null, jogo: string | null) {
  let estrelas = 0, niveis = 0;
  for (const [k, v] of Object.entries(prog || {})) {
    if (CHAVE_FASE.test(k)) continue; // fase antiga do Acha (outra grade): não conta mais
    if (k.startsWith('pegadinha:')) continue; // pegadinha antiga de 1 pergunta (virou o jogo 'pegadinhas', 10 por nível, em 16/11/2026)
    const id = k.split(':')[0];
    if (jogo && id !== jogo) continue;
    estrelas += Math.max(0, Math.min(3, Number(v?.e) || 0));
    niveis++;
  }
  return { estrelas, niveis };
}

// Comprou os 66 Desafios avulso (antes do Premium)? Continua com os 5 jogos de charada liberados.
export async function comprouDesafios(email: string) {
  const { count } = await db.from('pedidos').select('id', { count: 'exact', head: true })
    .eq('email', email).eq('status', 'pago').eq('produto', 'jogo-desafios');
  return (count ?? 0) > 0;
}

// ---------- perfil público e ranking ----------
export const APELIDO_OK = /^[\p{L}\p{N} ._-]{2,20}$/u;
export const ARROBA_OK = /^[a-z0-9._]{1,30}$/;
export const normArroba = (x: unknown) => (typeof x === 'string' ? x.trim().replace(/^@+/, '').toLowerCase() : '');
// nome que aparece no ranking: @ só com autorização; senão apelido; senão "Jogador xxxx"
export function nomePublico(c: { apelido?: string | null; arroba?: string | null; mostrar_arroba?: boolean; arroba_confirmado?: boolean; id_publico?: string | null }) {
  if (c.mostrar_arroba && c.arroba) return '@' + c.arroba;
  return c.apelido || 'Jogador ' + String(c.id_publico || '').slice(0, 4);
}
export const perfilDe = (c: Record<string, unknown> | null) => c ? {
  apelido: c.apelido ?? null, arroba: c.arroba ?? null, mostrar_arroba: !!c.mostrar_arroba,
  arroba_confirmado: !!c.arroba_confirmado, id_publico: c.id_publico ?? null,
} : null;
export const CAMPOS_PERFIL = 'apelido, arroba, mostrar_arroba, arroba_confirmado, id_publico';
// selo ✓ só pra @ confirmado pela direct e que a pessoa deixou aparecer
export const confirmado = (c: { mostrar_arroba?: boolean; arroba?: string | null; arroba_confirmado?: boolean }) =>
  !!(c.mostrar_arroba && c.arroba && c.arroba_confirmado);
