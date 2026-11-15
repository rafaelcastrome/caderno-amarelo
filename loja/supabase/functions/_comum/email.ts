// Envio de e-mail do app de jogos. Usa o Gmail do Caderno (senha de app) se estiver configurado;
// senão, o Resend. Segredos no Supabase: GMAIL_USUARIO + GMAIL_SENHA_APP, ou RESEND_API_KEY (+ EMAIL_REMETENTE).
// Gmail: porta 465 (SSL), que a Supabase deixa sair (25 e 587 são bloqueadas). Limite do Gmail: ~500 e-mails/dia.
import nodemailer from 'npm:nodemailer@6.9.16';

export const emailConfigurado = () =>
  !!((Deno.env.get('GMAIL_USUARIO') && Deno.env.get('GMAIL_SENHA_APP')) || Deno.env.get('RESEND_API_KEY'));

export async function mandarEmail(para: string, assunto: string, html: string) {
  const user = Deno.env.get('GMAIL_USUARIO'), pass = Deno.env.get('GMAIL_SENHA_APP');
  if (user && pass) {
    const t = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass: pass.replace(/\s+/g, '') } });
    await t.sendMail({ from: `Caderno Amarelo <${user}>`, to: para, subject: assunto, html });
    return;
  }
  const chave = Deno.env.get('RESEND_API_KEY');
  if (!chave) throw new Error('sem e-mail configurado');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('EMAIL_REMETENTE') ?? 'Caderno Amarelo <onboarding@resend.dev>', to: para, subject: assunto, html }),
  });
  if (!r.ok) throw new Error('resend ' + r.status + ' ' + (await r.text()));
}
