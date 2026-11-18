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

// Confere a order direto no Mercado Pago (API de Orders) e marca o pedido como pago.
// Serve tanto pro webhook quanto pra consulta de status (caso o webhook atrase).
export async function sincronizarOrder(orderId: string) {
  const ord = await mp(`/v1/orders/${orderId}`);
  const pedidoId = ord.external_reference as string;
  if (!pedidoId) return null;
  const { data: pedido } = await db.from('pedidos').select('*').eq('id', pedidoId).single();
  if (!pedido) return null;

  if (ord.status === 'processed' && pedido.status !== 'pago') {
    if (Number(ord.total_amount) < Number(pedido.valor)) return pedido; // valor menor que o cobrado: ignora
    const { data } = await db.from('pedidos')
      .update({ status: 'pago', pago_em: new Date().toISOString() })
      .eq('id', pedidoId).neq('status', 'pago').select('*').maybeSingle();
    if (!data) return { ...pedido, status: 'pago' }; // o webhook e a consulta chegaram juntos: o outro já gravou
    await eventoFunil('pagou', data.sessao ?? null, !!data.navegador_ig, data.produto, data.valor);
    await enviarEmail(data);
    return data;
  }
  if (ord.status === 'refunded' || ord.status === 'charged_back') {
    await db.from('pedidos').update({ status: 'reembolsado' }).eq('id', pedidoId);
  } else if (ord.status === 'canceled' || ord.status === 'expired') {
    await db.from('pedidos').update({ status: 'cancelado' }).eq('id', pedidoId).eq('status', 'pendente');
  }
  return pedido;
}

// ---------- funil de venda (tabela anônima eventos_funil: sem e-mail) ----------
export const sessaoOk = (s: unknown) => (typeof s === 'string' && /^[0-9a-f-]{36}$/i.test(s) ? s : null);
const ehPlano = (slug: string) => slug.startsWith('passe-');
export async function eventoFunil(evento: 'gerou_pix' | 'pagou', sessao: string | null, ig: boolean, produto: string, valor: unknown, origem?: unknown) {
  try {
    const detalhe: Record<string, unknown> = { [ehPlano(produto) ? 'plano' : 'produto']: produto, valor: Number(valor) };
    if (typeof origem === 'string' && /^[a-z]{2,12}$/.test(origem)) detalhe.origem = origem;
    const { error } = await db.from('eventos_funil').insert({ evento, sessao, navegador_ig: ig, detalhe });
    if (error) console.error('funil', error.message);
  } catch (e) { console.error('funil', e); } // medir nunca pode atrapalhar a venda
}

export async function linkDownload(produtoSlug: string) {
  const { data: prod } = await db.from('produtos').select('arquivo').eq('slug', produtoSlug).single();
  if (!prod) return null;
  const { data } = await db.storage.from('produtos').createSignedUrl(prod.arquivo, 60 * 60 * 24 * 7, { download: true });
  return data?.signedUrl ?? null;
}

// Kit (produtos.itens com os slugs): um link pra cada PDF, na ordem do kit. Produto normal: um link só.
export async function linksDownload(produtoSlug: string): Promise<{ slug: string; nome: string; url: string }[]> {
  const { data: prod } = await db.from('produtos').select('slug, nome, arquivo, itens').eq('slug', produtoSlug).single();
  if (!prod) return [];
  const lista = prod.itens?.length
    ? ((await db.from('produtos').select('slug, nome, arquivo').in('slug', prod.itens)).data ?? [])
        .sort((a, b) => prod.itens.indexOf(a.slug) - prod.itens.indexOf(b.slug))
    : [prod];
  const out = [];
  for (const it of lista) {
    const { data } = await db.storage.from('produtos').createSignedUrl(it.arquivo, 60 * 60 * 24 * 7, { download: true });
    if (data?.signedUrl) out.push({ slug: it.slug, nome: it.nome, url: data.signedUrl });
  }
  return out;
}

// E-mail com o link (opcional: só envia se RESEND_API_KEY estiver configurada).
async function enviarEmail(pedido: { id: string; email: string; produto: string; email_enviado: boolean }) {
  const chave = Deno.env.get('RESEND_API_KEY');
  if (!chave || pedido.email_enviado) return;
  const links = await linksDownload(pedido.produto);
  const link = links[0]?.url;
  const { data: prod } = await db.from('produtos').select('nome').eq('slug', pedido.produto).single();
  const corpo = links.length > 1
    ? `<p>Oi! Teu pagamento foi aprovado. Aqui estão os ${links.length} PDFs do teu ${prod?.nome ?? 'kit'} (cada link vale 7 dias, salva os PDFs no celular):</p>
       <ol>${links.map((l) => `<li style="margin:6px 0"><a href="${l.url}">${l.nome}</a></li>`).join('')}</ol>
       <p>Qualquer coisa, chama a gente no Instagram @Cardeno_Amarelo.</p>`
    : `<p>Oi! Teu pagamento foi aprovado.</p>
       <p><a href="${link}">Clica aqui pra baixar o ${prod?.nome ?? 'PDF'}</a> (o link vale 7 dias, salva o PDF no celular).</p>
       <p>Qualquer coisa, chama a gente no Instagram @Cardeno_Amarelo.</p>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_REMETENTE') ?? 'caRdeno Amarelo <onboarding@resend.dev>',
      to: pedido.email,
      subject: `Teu ${prod?.nome ?? 'produto'} chegou! 🧠`,
      html: corpo,
    }),
  });
  if (r.ok) await db.from('pedidos').update({ email_enviado: true }).eq('id', pedido.id);
}
