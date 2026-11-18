// Confere o código do e-mail, cria a conta (se não existir) e devolve um token de sessão.
import { cors, db, json } from '../_comum/comum.ts';
import { EMAIL_OK, premiumDe, juntar, normEmail, sha256, perfilDe, CAMPOS_PERFIL, comprouDesafios } from '../_comum/conta.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { email: bruto, codigo, progresso } = await req.json();
    const email = normEmail(bruto);
    if (!EMAIL_OK.test(email) || typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) return json({ erro: 'Código inválido.' }, 400);

    const { data: c } = await db.from('codigos_jogo').select('*').eq('email', email).eq('usado', false)
      .order('criado_em', { ascending: false }).limit(1).single();
    if (!c || new Date(c.expira_em) < new Date()) return json({ erro: 'Esse código expirou. Pede um novo.' }, 400);
    if (c.tentativas >= 5) return json({ erro: 'Muitas tentativas. Pede um código novo.' }, 429);
    if (c.codigo_hash !== await sha256(email + ':' + codigo)) {
      await db.from('codigos_jogo').update({ tentativas: c.tentativas + 1 }).eq('id', c.id);
      return json({ erro: 'Código errado. Confere no e-mail.' }, 400);
    }
    await db.from('codigos_jogo').update({ usado: true }).eq('id', c.id);

    const { data: conta } = await db.from('contas_jogo').select('progresso').eq('email', email).maybeSingle();
    const prog = juntar(conta?.progresso ?? {}, progresso ?? {});
    await db.from('contas_jogo').upsert({ email, progresso: prog, atualizado_em: new Date().toISOString() });
    const { data: perfil } = await db.from('contas_jogo').select(CAMPOS_PERFIL).eq('email', email).single();

    const token = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((x) => x.toString(16).padStart(2, '0')).join('');
    await db.from('sessoes_jogo').insert({ token_hash: await sha256(token), email });
    const { premium, ate } = await premiumDe(email);
    return json({ token, email, premium, ate, progresso: prog, perfil: perfilDe(perfil), desafios: await comprouDesafios(email) });
  } catch (e) {
    console.error(e);
    return json({ erro: 'Falha ao entrar.' }, 500);
  }
});
