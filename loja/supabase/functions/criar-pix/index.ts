// Cria o pedido e a cobrança Pix no Mercado Pago. O preço vem SEMPRE do banco, nunca do navegador.
import { cors, db, json, mp } from '../_comum/comum.ts';

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { produto, email } = await req.json();
    if (typeof email !== 'string' || !EMAIL_OK.test(email) || email.length > 200) return json({ erro: 'Confere o teu e-mail.' }, 400);

    const { data: prod } = await db.from('produtos').select('slug, nome, preco').eq('slug', produto).eq('ativo', true).single();
    if (!prod) return json({ erro: 'Produto não encontrado.' }, 404);

    const { data: pedido, error } = await db.from('pedidos')
      .insert({ produto: prod.slug, email: email.toLowerCase(), valor: prod.preco })
      .select('id').single();
    if (error) throw error;

    const pg = await mp('/v1/payments', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': pedido.id },
      body: JSON.stringify({
        transaction_amount: Number(prod.preco),
        description: prod.nome,
        payment_method_id: 'pix',
        payer: { email },
        external_reference: pedido.id,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-mercadopago`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }),
    });

    await db.from('pedidos').update({ mp_pagamento: String(pg.id) }).eq('id', pedido.id);
    const t = pg.point_of_interaction?.transaction_data ?? {};
    return json({ pedido: pedido.id, qr_base64: t.qr_code_base64, copia_cola: t.qr_code, valor: prod.preco });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Não deu pra gerar o Pix agora. Tenta de novo em instantes.' }, 500);
  }
});
