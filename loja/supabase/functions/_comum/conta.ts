// Utilitários da conta do app de jogos (entrar com e-mail + código).
import { db } from './comum.ts';

export const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '');

export async function sha256(txt: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Planos (slug do produto -> dias liberados por pagamento).
export const PLANOS: Record<string, number> = { 'passe-mensal': 30, 'passe-anual': 365 };

// Premium = soma dos passes pagos desse e-mail, contando a partir do pagamento
// (renovar antes de acabar soma os dias, não perde nada). Devolve a data de validade ou null.
export async function validadePremium(email: string) {
  const { data } = await db.from('pedidos').select('produto, pago_em')
    .eq('email', email).eq('status', 'pago').in('produto', Object.keys(PLANOS)).order('pago_em', { ascending: true });
  let fim = 0;
  for (const p of data ?? []) {
    const ini = Math.max(new Date(p.pago_em).getTime(), fim);
    fim = ini + PLANOS[p.produto] * 864e5;
  }
  return fim > Date.now() ? new Date(fim).toISOString() : null;
}

// Devolve o e-mail da sessão ou null.
export async function emailDaSessao(token: unknown) {
  if (typeof token !== 'string' || token.length < 30) return null;
  const { data } = await db.from('sessoes_jogo').select('email').eq('token_hash', await sha256(token)).single();
  return data?.email ?? null;
}

// Junta dois progressos. Chaves: "1".."30" = fases do Acha do 1 ao 25 (tempo t obrigatório);
// "cor:3", "oque:12"... = nível dos outros jogos (estrelas e; t = tempo, p = pontos, opcionais).
// Fica o melhor de cada: mais estrelas, menor tempo, mais pontos, mais tentativas (n) e em qual tentativa fez o recorde (r).
type Nivel = { t?: number; e: number; p?: number; n?: number; r?: number | null };
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
    const o = r[k];
    if (!o) { r[k] = { e, n, r: tr, ...(t != null ? { t } : {}), ...(pts != null ? { p: pts } : {}) }; continue; }
    const melhor = t != null ? (o.t == null || t < o.t) : pts != null ? (o.p == null || pts > o.p) : e > (o.e || 0);
    const novo: Nivel = { e: Math.max(o.e || 0, e), n: Math.max(int(o.n), n), r: melhor ? tr : (o.r ?? null) };
    const tt = t != null && o.t != null ? Math.min(o.t, t) : (t ?? o.t);
    const pp = pts != null && o.p != null ? Math.max(o.p, pts) : (pts ?? o.p);
    if (tt != null) novo.t = tt;
    if (pp != null) novo.p = pp;
    r[k] = novo;
  }
  return r;
}

// Estrelas de um jogo (ou de todos, sem jogo) dentro do progresso da conta
export function estrelasDe(prog: Record<string, Nivel> | null, jogo: string | null) {
  let estrelas = 0, niveis = 0;
  for (const [k, v] of Object.entries(prog || {})) {
    const id = CHAVE_FASE.test(k) ? 'acha' : k.split(':')[0];
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
