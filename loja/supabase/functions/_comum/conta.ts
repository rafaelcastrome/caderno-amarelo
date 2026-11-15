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
export function juntar(a: Record<string, { t: number; e: number }>, b: Record<string, { t: number; e: number }>) {
  const r: Record<string, { t: number; e: number }> = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) {
    if (!/^\d{1,2}$/.test(k) || typeof v?.t !== 'number' || typeof v?.e !== 'number') continue;
    const t = Math.max(0.5, Math.min(9999, v.t)), e = Math.max(0, Math.min(3, Math.round(v.e)));
    r[k] = r[k] ? { t: Math.min(r[k].t, t), e: Math.max(r[k].e, e) } : { t, e };
  }
  return r;
}
