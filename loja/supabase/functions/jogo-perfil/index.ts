// Perfil público da conta do app de jogos (aparece no ranking).
// { token, apelido?, arroba?, mostrar? } salva; { token, pedirCodigo: true } gera o código de 4 números
// que a pessoa manda na direct do @Cardeno_Amarelo pra confirmar o @ (o bot confere).
import { cors, db, json } from '../_comum/comum.ts';
import { emailDaSessao, perfilDe, CAMPOS_PERFIL, APELIDO_OK, ARROBA_OK, normArroba } from '../_comum/conta.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { token, apelido, arroba, mostrar, pedirCodigo } = await req.json();
    const email = await emailDaSessao(token);
    if (!email) return json({ erro: 'Sessão expirada. Entra de novo com teu e-mail.' }, 401);
    const { data: atual } = await db.from('contas_jogo').select(CAMPOS_PERFIL).eq('email', email).single();

    if (pedirCodigo) {
      if (!atual?.arroba) return json({ erro: 'Digita teu @ primeiro.' }, 400);
      const umaHora = new Date(Date.now() - 3600e3).toISOString();
      const { count } = await db.from('codigos_arroba_jogo').select('codigo', { count: 'exact', head: true }).eq('email', email).gte('criado_em', umaHora);
      if ((count ?? 0) >= 6) return json({ erro: 'Muitos códigos em pouco tempo. Tenta daqui a pouco.' }, 429);
      await db.from('codigos_arroba_jogo').update({ ate: new Date().toISOString() }).eq('email', email).gt('ate', new Date().toISOString());
      let codigo = '';
      for (let i = 0; i < 20; i++) {
        codigo = String(1000 + Math.floor(Math.random() * 9000));
        const { count: usado } = await db.from('codigos_arroba_jogo').select('codigo', { count: 'exact', head: true })
          .eq('codigo', codigo).gt('ate', new Date().toISOString());
        if (!usado) break;
      }
      const ate = new Date(Date.now() + 30 * 60e3).toISOString();
      await db.from('codigos_arroba_jogo').insert({ codigo, email, arroba: atual.arroba, ate });
      return json({ codigo, ate, perfil: perfilDe(atual) });
    }

    const novo: Record<string, unknown> = { atualizado_em: new Date().toISOString() };
    if (apelido !== undefined) {
      const a = String(apelido || '').trim().replace(/\s+/g, ' ');
      if (a && !APELIDO_OK.test(a)) return json({ erro: 'Apelido: de 2 a 20 letras ou números.' }, 400);
      novo.apelido = a || null;
    }
    if (arroba !== undefined) {
      const h = normArroba(arroba);
      if (h && !ARROBA_OK.test(h)) return json({ erro: 'Esse @ não parece do Instagram. Usa só letras, números, ponto e _.' }, 400);
      if ((h || null) !== (atual?.arroba ?? null)) { novo.arroba = h || null; novo.arroba_confirmado = false; }
    }
    if (mostrar !== undefined) novo.mostrar_arroba = !!mostrar;
    const { data } = await db.from('contas_jogo').update(novo).eq('email', email).select(CAMPOS_PERFIL).single();
    return json({ perfil: perfilDe(data) });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Falha ao salvar o perfil.' }, 500);
  }
});
