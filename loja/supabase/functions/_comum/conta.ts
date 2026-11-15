// Utilitários da conta do app de jogos (entrar com e-mail + código).
import { db } from './comum.ts';

export const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '');

export async function sha256(txt: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
}

export async function ehPremium(email: string) {
  const { count } = await db.from('pedidos').select('id', { count: 'exact', head: true })
    .eq('email', email).eq('produto', 'caderno-premium').eq('status', 'pago');
  return (count ?? 0) > 0;
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
