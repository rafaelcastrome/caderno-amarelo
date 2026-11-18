// Dados da conta do app de jogos: Premium (pelo e-mail) e progresso das fases.
// { token } lê; { token, progresso } junta o progresso do celular com o da conta; { token, sair: true } encerra a sessão.
import { cors, db, json } from '../_comum/comum.ts';
import { premiumDe, emailDaSessao, juntar, sha256, perfilDe, CAMPOS_PERFIL, comprouDesafios } from '../_comum/conta.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { token, progresso, sair } = await req.json();
    const email = await emailDaSessao(token);
    if (!email) return json({ erro: 'Sessão expirada. Entra de novo com teu e-mail.' }, 401);
    if (sair) { await db.from('sessoes_jogo').delete().eq('token_hash', await sha256(token)); return json({ ok: true }); }

    const { data: conta } = await db.from('contas_jogo').select('progresso, ' + CAMPOS_PERFIL).eq('email', email).single();
    let prog = conta?.progresso ?? {};
    if (progresso && typeof progresso === 'object') {
      prog = juntar(prog, progresso);
      await db.from('contas_jogo').update({ progresso: prog, atualizado_em: new Date().toISOString() }).eq('email', email);
    }
    const { premium, ate } = await premiumDe(email);
    return json({ email, premium, ate, progresso: prog, perfil: perfilDe(conta), desafios: await comprouDesafios(email) });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Falha ao ler a conta.' }, 500);
  }
});
