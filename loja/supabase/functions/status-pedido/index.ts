// Consultado pela página a cada poucos segundos. Quando o pedido está pago, devolve o link de download.
import { cors, db, json, linkDownload, sincronizarOrder } from '../_comum/comum.ts';

const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { pedido: id } = await req.json();
    if (typeof id !== 'string' || !UUID.test(id)) return json({ erro: 'Pedido inválido.' }, 400);

    let { data: pedido } = await db.from('pedidos').select('*').eq('id', id).single();
    if (!pedido) return json({ erro: 'Pedido não encontrado.' }, 404);

    // Se o webhook ainda não chegou, confere direto no Mercado Pago (no máximo a cada consulta).
    if (pedido.status === 'pendente' && pedido.mp_order) pedido = (await sincronizarOrder(pedido.mp_order)) ?? pedido;

    if (pedido.status !== 'pago') return json({ status: pedido.status });
    return json({ status: 'pago', download: await linkDownload(pedido.produto) });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Falha ao consultar o pedido.' }, 500);
  }
});
