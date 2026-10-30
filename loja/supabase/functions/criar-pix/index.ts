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

    const valor = Number(prod.preco).toFixed(2); // a API de Orders recebe valores como texto
    const ord = await mp('/v1/orders', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': pedido.id },
      body: JSON.stringify({
        type: 'online',
        processing_mode: 'automatic',
        external_reference: pedido.id,
        total_amount: valor,
        description: prod.nome,
        // Modo teste do Mercado Pago: first_name "APRO" faz o Pix de teste ser aprovado (secret MP_MODO_TESTE=1).
        payer: Deno.env.get('MP_MODO_TESTE') ? { email, first_name: 'APRO' } : { email },
        transactions: {
          payments: [{ amount: valor, payment_method: { id: 'pix', type: 'bank_transfer' }, expiration_time: 'PT30M' }],
        },
      }),
    });

    await db.from('pedidos').update({ mp_order: String(ord.id) }).eq('id', pedido.id);
    const t = ord.transactions?.payments?.[0]?.payment_method ?? {};
    return json({ pedido: pedido.id, qr_base64: t.qr_code_base64, copia_cola: t.qr_code, valor: prod.preco });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Não deu pra gerar o Pix agora. Tenta de novo em instantes.' }, 500);
  }
});
