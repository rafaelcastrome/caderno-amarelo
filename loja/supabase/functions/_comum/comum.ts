// Utilitários compartilhados pelas funções da loja.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

const MP_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!;
const ORIGEM = Deno.env.get('LOJA_ORIGEM') ?? '*'; // domínio da loja, ex.: https://loja.cadernoamarelo.com.br

export const cors = {
  'Access-Control-Allow-Origin': ORIGEM,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

export async function mp(caminho: string, init: RequestInit = {}) {
  const r = await fetch(`https://api.mercadopago.com${caminho}`, {
    ...init,
    headers: { Authorization: `Bearer ${MP_TOKEN}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const dados = await r.json();
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${JSON.stringify(dados).slice(0, 300)}`);
  return dados;
}

// Confere o pagamento direto no Mercado Pago e marca o pedido como pago.
// Serve tanto pro webhook quanto pra consulta de status (caso o webhook atrase).
export async function sincronizarPagamento(mpId: string) {
  const pg = await mp(`/v1/payments/${mpId}`);
  const pedidoId = pg.external_reference as string;
  if (!pedidoId) return null;
  const { data: pedido } = await db.from('pedidos').select('*').eq('id', pedidoId).single();
  if (!pedido) return null;

  if (pg.status === 'approved' && pedido.status !== 'pago') {
    if (Number(pg.transaction_amount) < Number(pedido.valor)) return pedido; // valor menor que o cobrado: ignora
    const { data } = await db.from('pedidos')
      .update({ status: 'pago', pago_em: new Date().toISOString() })
      .eq('id', pedidoId).select('*').single();
    await enviarEmail(data);
    return data;
  }
  if (pg.status === 'refunded' || pg.status === 'charged_back') {
    await db.from('pedidos').update({ status: 'reembolsado' }).eq('id', pedidoId);
  }
  return pedido;
}

export async function linkDownload(produtoSlug: string) {
  const { data: prod } = await db.from('produtos').select('arquivo').eq('slug', produtoSlug).single();
  if (!prod) return null;
  const { data } = await db.storage.from('produtos').createSignedUrl(prod.arquivo, 60 * 60 * 24 * 7, { download: true });
  return data?.signedUrl ?? null;
}

// E-mail com o link (opcional: só envia se RESEND_API_KEY estiver configurada).
async function enviarEmail(pedido: { id: string; email: string; produto: string; email_enviado: boolean }) {
  const chave = Deno.env.get('RESEND_API_KEY');
  if (!chave || pedido.email_enviado) return;
  const link = await linkDownload(pedido.produto);
  const { data: prod } = await db.from('produtos').select('nome').eq('slug', pedido.produto).single();
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_REMETENTE') ?? 'Caderno Amarelo <onboarding@resend.dev>',
      to: pedido.email,
      subject: `Teu ${prod?.nome ?? 'produto'} chegou! 🧠`,
      html: `<p>Oi! Teu pagamento foi aprovado.</p>
             <p><a href="${link}">Clica aqui pra baixar o ${prod?.nome ?? 'PDF'}</a> (o link vale 7 dias, salva o PDF no celular).</p>
             <p>Qualquer coisa, chama a gente no Instagram @Cardeno_Amarelo.</p>`,
    }),
  });
  if (r.ok) await db.from('pedidos').update({ email_enviado: true }).eq('id', pedido.id);
}
