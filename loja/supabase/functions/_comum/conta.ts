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

// Junta dois progressos: melhor tempo e mais estrelas de cada fase.
type Fase = { t: number; e: number; n?: number; r?: number | null };
// junta o progresso: menor tempo (com a tentativa em que foi feito), mais estrelas, mais tentativas
export function juntar(a: Record<string, Fase>, b: Record<string, Fase>) {
  const r: Record<string, Fase> = { ...(a || {}) };
  const int = (x: unknown) => (typeof x === 'number' && x > 0 ? Math.min(99999, Math.round(x)) : 0);
  for (const [k, v] of Object.entries(b || {})) {
    if (!/^\d{1,2}$/.test(k) || typeof v?.t !== 'number' || typeof v?.e !== 'number') continue;
    const t = Math.max(0.5, Math.min(9999, v.t)), e = Math.max(0, Math.min(3, Math.round(v.e)));
    const n = int(v.n), tr = int(v.r) || null;
    const o = r[k];
    r[k] = o
      ? { t: Math.min(o.t, t), e: Math.max(o.e, e), n: Math.max(int(o.n), n), r: t < o.t ? tr : (o.r ?? null) }
      : { t, e, n, r: tr };
  }
  return r;
}
