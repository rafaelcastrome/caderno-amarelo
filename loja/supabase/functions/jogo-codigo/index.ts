// Manda um código de 6 números pro e-mail da pessoa (entrar no app de jogos, sem senha).
import { cors, db, json } from '../_comum/comum.ts';
import { EMAIL_OK, normEmail, sha256 } from '../_comum/conta.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { email: bruto } = await req.json();
    const email = normEmail(bruto);
    if (!EMAIL_OK.test(email) || email.length > 200) return json({ erro: 'Confere o teu e-mail.' }, 400);

    // no máximo 3 códigos a cada 10 minutos por e-mail
    const desde = new Date(Date.now() - 10 * 60e3).toISOString();
    const { count } = await db.from('codigos_jogo').select('id', { count: 'exact', head: true }).eq('email', email).gte('criado_em', desde);
    if ((count ?? 0) >= 3) return json({ erro: 'Já mandamos vários códigos. Espera uns minutinhos e tenta de novo.' }, 429);

    const chave = Deno.env.get('RESEND_API_KEY');
    if (!chave) return json({ erro: 'Envio de e-mail ainda não configurado.' }, 503);

    const codigo = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
    await db.from('codigos_jogo').insert({
      email, codigo_hash: await sha256(email + ':' + codigo), expira_em: new Date(Date.now() + 15 * 60e3).toISOString(),
    });

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_REMETENTE') ?? 'Caderno Amarelo <onboarding@resend.dev>',
        to: email,
        subject: `${codigo} é o teu código do Caderno Amarelo`,
        html: `<p>Oi! Teu código pra entrar nos jogos do Caderno Amarelo é:</p>
               <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${codigo}</p>
               <p>Ele vale 15 minutos. Se não foi tu que pediu, é só ignorar este e-mail.</p>`,
      }),
    });
    if (!r.ok) { console.error(await r.text()); return json({ erro: 'Não deu pra mandar o e-mail agora. Tenta de novo.' }, 502); }
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Falha ao mandar o código.' }, 500);
  }
});
