// Recebe o aviso do Mercado Pago e confere o pagamento direto na API dele (nunca confia só no aviso).
// Deploy com --no-verify-jwt, porque quem chama é o Mercado Pago.
import { json, sincronizarPagamento } from '../_comum/comum.ts';

async function assinaturaValida(req: Request, dataId: string) {
  const segredo = Deno.env.get('MP_WEBHOOK_SECRET');
  if (!segredo) return true; // sem segredo configurado, a checagem na API já garante o status real
  const partes = Object.fromEntries((req.headers.get('x-signature') ?? '').split(',').map(p => p.trim().split('=')));
  const manifesto = `id:${dataId.toLowerCase()};request-id:${req.headers.get('x-request-id') ?? ''};ts:${partes.ts};`;
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(manifesto));
  const hex = [...new Uint8Array(assinatura)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === partes.v1;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const corpo = await req.json().catch(() => ({}));
    const tipo = corpo.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic');
    const dataId = String(corpo.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? '');
    if (tipo !== 'payment' || !dataId) return json({ ok: true });
    if (!(await assinaturaValida(req, dataId))) return json({ erro: 'assinatura' }, 401);
    await sincronizarPagamento(dataId);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ ok: false }, 500); // o Mercado Pago tenta de novo
  }
});
