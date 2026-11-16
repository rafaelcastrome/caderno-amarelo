// Robô do @Cardeno_Amarelo: "MENTE" num comentário -> resposta privada na DM.
//  modo "lista": "Anotado!..." e quem responde SIM entra em kit_lista (só @ e dia).
//  modo "link": comentou MENTE (ou mandou SIM) e já recebe o link da Kiwify.
// CAMPANHAS de seguidores (PIPOCA no vídeo da leitura rápida, ELEFANTE no vídeo do elefante...):
//  resposta pública + DM com botão -> pede pra seguir (confere pela API) -> manda o link do presente.
//  Se no 2º toque ainda não segue, libera mesmo assim (pedido suave, sem obrigar).
// FOGUETE (palavra escondida no nível secreto): só resposta pública.
// JOGO / "tem mais" em qualquer post: resposta pública + DM com o link do jogo Desafios (ligado por padrão).
// As públicas das campanhas de segredo vendem o jogo, e a DM entregue termina com o link dele.
// Config em kit_config: 'campanhas' (JSON: ativo, link, midias por campanha), placar em 'seguidores'. Ver campanhas.sql.
// Segredos: IG_TOKEN (token de longa duração da conta, gerado no app da Meta) e IG_USER_ID (id da conta).
// Chamado por pg_cron a cada minuto com o header x-chave (kit_config.cron_chave). Deploy com verify_jwt desligado.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const API = "https://graph.instagram.com/v23.0";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const cfg = async (k: string) => (await db.from("kit_config").select("v, em").eq("k", k).maybeSingle()).data;
const grava = (k: string, v: string) => db.from("kit_config").upsert({ k, v, em: new Date().toISOString() });
const sorteia = <T>(l: T[]) => l[Math.floor(Math.random() * l.length)];
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

// textos variam um pouco pra não parecer robô repetindo
const ANOTADO = [
  "Anotado! 🧠 Presente pra você: pede pro teu amigo multiplicar a idade dele por 7 e depois por 1443. Vai aparecer a idade repetida 3 vezes 🤯 O kit com 20 truques e mágicas sai essa semana por R$ 5,90 no Pix. Quer o link? Responde SIM",
  "Anotado! 🧠 Presente pra você: pede pro teu amigo multiplicar a idade dele por 7 e depois por 1443. A idade dele vai aparecer repetida 3 vezes 🤯 O kit com 20 truques e mágicas sai essa semana por R$ 5,90 no Pix. Quer o link? Responde SIM",
  "Anotado! 🧠 Presente pra você: manda teu amigo multiplicar a idade dele por 7 e depois por 1443. Vai aparecer a idade repetida 3 vezes 🤯 O kit com 20 truques e mágicas sai essa semana por R$ 5,90 no Pix. Quer o link? Responde SIM",
  "Anotado! 🧠 Presente pra você: pede pro teu amigo multiplicar a idade dele por 7 e depois por 1443. Olha só: a idade aparece repetida 3 vezes 🤯 O kit com 20 truques e mágicas sai essa semana por R$ 5,90 no Pix. Quer o link? Responde SIM",
];
const NA_LISTA = [
  "Fechado! ✅ Tu tá na lista. Quando o kit sair (R$ 5,90 no Pix), o link chega aqui nessa conversa.",
  "Fechado! ✅ Tu tá na lista. Quando o kit sair (R$ 5,90 no Pix), o link chega aqui nesta conversa.",
  "Fechado! ✅ Tu tá na lista. Quando o kit sair (R$ 5,90 no Pix), o link vem aqui nessa conversa.",
];
const LINK = (l: string) => sorteia([
  `Aqui está o kit 🧠 ${l}`,
  `Prontinho! O kit tá aqui 🧠 ${l}`,
  `Chegou o kit 🧠 ${l}`,
  `Bora lá 🧠 o kit tá aqui: ${l}`,
]);

// --- campanhas de seguidores ---
const PUB_MENTE = ["Te mandei na DM 🧠", "Olha tua DM 🧠", "Mandei lá na DM 👀", "Chegou na tua DM 🧠"];
// jogo Desafios do Caderno Amarelo (Rafael, 03/11): resposta pública das campanhas vende o jogo, sem preço e sem contar o segredo
const JOGO_URL = "https://caderno-amarelo-loja.pages.dev/desafios.html";
const PUB_VENDE = [
  "Tem mais 66 desafios desse tipo no joguinho do Caderno Amarelo 👀 os 2 primeiros são grátis, link na bio!",
  "Gostou? Tem um jogo com 66 desafios assim, os 2 primeiros são de graça. Link na bio 🧠",
  "Esse foi fácil? Testa os 66 desafios do joguinho, link na bio 👀",
  "Te mandei o segredo na DM (se não aparecer, olha em Solicitações). E tem mais 66 desafios no joguinho, link na bio!",
];
const DM_JOGO = `Quer mais? Tem 66 desafios no joguinho, os 2 primeiros são grátis: ${JOGO_URL}`;
type Campanha = {
  chave: string;                      // palavra que a pessoa manda na DM quando o Insta dela bloqueia nossa DM
  acha: RegExp;                       // palavras do comentário (texto já sem acento e minúsculo)
  pub: string[];                      // resposta pública
  dm: string[]; botao: string;        // 1ª DM (resposta privada) e o botão dela
  segue: string[];                    // pedido pra seguir (vem com o botão "Já segui ✅")
  libera: (l: string) => string;      // entrega pra quem segue
  liberaSem: (l: string) => string;   // entrega no 2º toque pra quem ainda não segue
};
const SEGUE = (o_que: string) => [
  `${o_que} é só pros meus seguidores 🔒 Se tu já me segue, ou assim que seguir, toca no botão aqui embaixo 👇`,
  `${o_que} é só pra quem me segue 🔒 Se tu já segue, ou assim que seguir, toca no botão aqui embaixo 👇`,
];
// 1ª DM pra quem comentou SEGREDO: já avisa que é pra seguidor (a pessoa pediu, então o pedido faz sentido)
const DM_SEGREDO = (de: string) => [
  `Tu pediu o segredo ${de} 🤫 Ele é só pros meus seguidores: me segue e toca no botão (ou responde QUERO) que eu te mando na hora.`,
  `Bora! O segredo ${de} é só pra quem me segue 🤫 Me segue e toca no botão (ou responde QUERO) que eu te mando.`,
];
const CAMPANHAS: Record<string, Campanha> = {
  pipoca: {
    chave: "PIPOCA",
    acha: /\bpipoca\b/,
    pub: [
      "Leu a 900! 🍿 Te mandei um desafio na DM 👀",
      "Passou no teste 🍿 olha tua DM",
      "🍿 Tu lê rápido! Corre na DM que tem nível secreto",
      "Lê rápido demais 👀 te chamei na DM",
    ],
    dm: [
      "Tu leu a 900 palavras por minuto 🍿 Pouca gente consegue! Tenho um nível secreto, mais rápido ainda. Quer tentar?",
      "Leu a 900 palavras por minuto 🍿 mandou bem demais! Tenho um nível secreto, bem mais rápido. Bora tentar?",
      "Passou no teste da pipoca 🍿 Agora tenho um nível secreto, mais rápido ainda. Quer tentar?",
    ],
    botao: "Quero! 🍿",
    segue: SEGUE("Esse nível secreto"),
    libera: (l) => sorteia([
      `Liberado! 🔓 O nível secreto tá aqui: ${l} Se pegar a palavra escondida, comenta ela no vídeo 😉`,
      `Pronto, liberado 🔓 ${l} Tem uma palavra escondida lá, se pegar comenta no vídeo 😉`,
    ]),
    liberaSem: (l) => `Ainda não apareceu aqui que tu me segue, mas vou liberar mesmo assim 😉 ${l} Se curtir, me segue que vem mais desafio assim.`,
  },
  elefante: {
    chave: "SEGREDO",
    // só nos posts listados em campanhas.elefante.midias (o vídeo do elefante)
    acha: /\bsegredo\b/,                // só quem pediu (o vídeo/comentário fixado diz "comenta SEGREDO")
    pub: [
      "Como eu sabia? 🐘 Te contei o segredo na DM",
      "🐘 O segredo tá na tua DM (olha em solicitações) 👀",
      "Quer saber como funciona? 🐘 olha tua DM",
      "🔮 Te mandei o segredo na DM",
    ],
    dm: DM_SEGREDO("do elefante 🐘"),
    botao: "Quero o segredo 🔮",
    segue: SEGUE("O segredo"),
    libera: (l) => sorteia([
      `Liberado! 🔓 O segredo do elefante tá aqui: ${l} Só não conta nos comentários, hein 🤫`,
      `Pronto 🔓 ${l} Lá tem o segredo e um truque bônus. Não conta pra ninguém 🤫`,
    ]),
    liberaSem: (l) => `Ainda não apareceu aqui que tu me segue, mas vou liberar mesmo assim 😉 ${l} Se curtir, me segue que vem mais truque assim.`,
  },
  fruta: {
    chave: "SEGREDO",
    // só no post da fruta (kiwi)
    acha: /\bsegredo\b/,
    pub: ["🤫 Te mandei o segredo na DM", "🥝 Olha tua DM", "Mandei o segredo do kiwi na DM 🤫", "🥝 Segredo na tua DM"],
    dm: DM_SEGREDO("do kiwi 🥝"),
    botao: "Quero o segredo 🔮",
    segue: SEGUE("O segredo"),
    libera: (l) => sorteia([
      `Liberado! 🔓 O segredo do kiwi tá aqui: ${l} Só não conta nos comentários, hein 🤫`,
      `Pronto 🔓 ${l} Lá tem o segredo e um truque bônus. Não conta pra ninguém 🤫`,
    ]),
    liberaSem: (l) => `Ainda não apareceu aqui que tu me segue, mas vou liberar mesmo assim 😉 ${l} Se curtir, me segue que vem mais truque assim.`,
  },
  bandeira: {
    chave: "SEGREDO",
    // só no post da bandeira; o vídeo pede "comenta: vi ou não vi"
    acha: /\bsegredo\b/,
    pub: [
      "Teu cérebro pintou 🇧🇷 Te mandei uma ilusão secreta na DM",
      "🇧🇷 Tem uma ilusão mais forte na tua DM 👀",
      "Olha tua DM 👀 mandei outra ilusão",
      "🇧🇷 Te mandei o porquê na DM",
    ],
    dm: DM_SEGREDO("da bandeira 🇧🇷 (e uma ilusão secreta mais forte)"),
    botao: "Quero ver 👀",
    segue: SEGUE("A ilusão secreta"),
    libera: (l) => sorteia([
      `Liberado! 🔓 A ilusão secreta tá aqui: ${l} Brilho no máximo e não pisca 😉`,
      `Pronto 🔓 ${l} Põe o brilho no máximo e encara até o fim 😉`,
    ]),
    liberaSem: (l) => `Ainda não apareceu aqui que tu me segue, mas vou liberar mesmo assim 😉 ${l} Se curtir, me segue que vem mais ilusão assim.`,
  },
  dedo: {
    chave: "SEGREDO",
    // só no post do "põe o dedo na tela"; o vídeo pede "comenta: sim ou não"
    acha: /\bsegredo\b/,
    pub: [
      "🦒 Te contei o segredo da girafa na DM",
      "Como eu sabia? 🦒 olha tua DM",
      "🦒 O segredo tá na tua DM 👀",
      "Te mandei o segredo na DM 🦒",
    ],
    dm: DM_SEGREDO("da girafa 🦒"),
    botao: "Quero o segredo 🔮",
    segue: SEGUE("O segredo"),
    libera: (l) => sorteia([
      `Liberado! 🔓 O segredo da girafa tá aqui: ${l} Só não conta nos comentários, hein 🤫`,
      `Pronto 🔓 ${l} Lá tem o segredo e um truque bônus. Não conta pra ninguém 🤫`,
    ]),
    liberaSem: (l) => `Ainda não apareceu aqui que tu me segue, mas vou liberar mesmo assim 😉 ${l} Se curtir, me segue que vem mais truque assim.`,
  },
  jogo: {
    chave: "JOGO",
    // vale em QUALQUER post (midias vazio); fica por último pra campanha do próprio vídeo ganhar.
    // Só responde quem comentou JOGO ou "tem mais": nunca DM sem pedido.
    acha: /\bjogo\b|\btem mais\b/,
    pub: [
      "Te mandei o link do joguinho na DM 👀 (se não aparecer, olha em Solicitações). 66 desafios, os 2 primeiros são grátis!",
      "Mandei na DM 🧠 São 66 desafios, os 2 primeiros de graça. Se não chegar, o link tá na bio!",
      "Chegou na tua DM 👀 (olha em Solicitações) Tem 66 desafios no joguinho, link na bio também!",
      "Olha tua DM 🧠 66 desafios te esperando, os 2 primeiros são grátis. Link na bio também!",
    ],
    dm: [`Aqui o joguinho do Caderno Amarelo 🧠 66 desafios, os 2 primeiros são grátis. Toca no botão ou responde QUERO 👇`],
    botao: "Quero jogar 🧠",
    segue: SEGUE("O joguinho"),
    libera: (l) => sorteia([
      `Aqui o joguinho do Caderno Amarelo 🧠 66 desafios, os 2 primeiros são grátis: ${l}`,
      `Bora jogar 🧠 São 66 desafios e os 2 primeiros são de graça: ${l}`,
    ]),
    liberaSem: (l) => `Aqui o joguinho 🧠 66 desafios, os 2 primeiros são grátis: ${l}`,
  },
};
// campanhas que não precisam de linha em kit_config 'campanhas' pra funcionar (dá pra desligar com "ativo": false lá)
const PADRAO: Record<string, { ativo: boolean; link: string }> = { jogo: { ativo: true, link: JOGO_URL } };
const PUB_FOGUETE = ["🚀 Lenda! Leu a 1200", "Leu a 1200?! 🚀 respeito", "🚀 Tu é rápido demais", "Nível secreto zerado 🚀"];
const BOTAO = (title: string, payload: string) => [{ content_type: "text", title, payload }];

async function ig(path: string, token: string, body?: unknown) {
  const sep = path.includes("?") ? "&" : "?";
  const r = await fetch(`${API}/${path}${sep}access_token=${token}`, body
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    : undefined);
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, j };
}

// token de longa duração: renova com 20 dias (a Meta deixa renovar depois de 24 h e antes de vencer em 60 dias)
async function token() {
  const salvo = await cfg("token");
  let t = salvo?.v || Deno.env.get("IG_TOKEN") || null;
  if (!t) return null;
  const idade = salvo ? Date.now() - new Date(salvo.em).getTime() : Infinity;
  if (idade > 20 * 86400e3) {
    const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${t}`);
    const j = await r.json().catch(() => ({}));
    if (j.access_token) { t = j.access_token; await grava("token", t); }
    else if (!salvo) await grava("token", t); // primeira vez: só marca a data
  }
  return t;
}

// limite nosso, por minuto e por hora
// reserva: quantas da hora ficam guardadas pra quem já está conversando (os comentários novos usam reserva 20)
async function podeResponder(reserva = 0) {
  const l = { m: 6, h: 120, ...JSON.parse((await cfg("limite"))?.v || "{}") };
  const m = new Date().toISOString().slice(0, 16), h = m.slice(0, 13);
  let s: any = {};
  try { s = JSON.parse((await cfg("respostas"))?.v || "{}"); } catch { /* recomeça */ }
  const nm = s.m === m ? s.nm : 0, nh = s.h === h ? s.nh : 0;
  if (nm >= l.m || nh >= l.h - reserva) return false;
  await grava("respostas", JSON.stringify({ m, nm: nm + 1, h, nh: nh + 1 }));
  return true;
}

// quem é "a gente": o id que a Meta põe em from.id nem sempre é o IG_USER_ID, então junta os ids de /me e o @
let meusIds = new Set<string>(), meuArroba = "cardeno_amarelo";
async function carregaEu(t: string, eu: string) {
  const { j: me } = await ig(`me?fields=id,user_id,username`, t);
  meusIds = new Set([eu, me?.id, me?.user_id].filter(Boolean).map(String));
  if (me?.username) meuArroba = me.username.toLowerCase();
}
const ehEu = (c: any) => !!c && (meusIds.has(String(c.from?.id || "")) ||
  (c.username || c.from?.username || "").toLowerCase() === meuArroba);

const visto = async (id: string) => !!(await db.from("kit_visto").select("id").eq("id", id).maybeSingle()).data;
const marca = (id: string) => db.from("kit_visto").upsert({ id });

// 1) comentários com MENTE (e respostas a eles, inclusive no comentário fixado) nos posts/Reels dos últimos 7 dias
const CAMPOS = "id,text,username,timestamp,from{id,username},replies.limit(50){id,text,username,timestamp,from{id,username}}";
// quem comentou: o @ quando a Meta manda (em username ou em from.username); se não vier, o id da pessoa
const quem = (c: any) => {
  const u = c.username || c.from?.username;
  return u ? u.toLowerCase() : c.from?.id ? `id:${c.from.id}` : null;
};

// palavra-chave do comentário (a primeira que aparecer na ordem abaixo)
// código do post no link (instagram.com/reel/DQabc123/ -> DQabc123); dá pra pôr em midias o id, o código ou o link inteiro
function codigo(link?: string) {
  return (link || "").match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)?.[1] || link || "";
}

function palavra(texto: string, midia: string[], camps: Camps): string | null {
  if (CODIGO_ARROBA.test(texto || "")) return "codigo"; // código do app de jogos pra confirmar o @
  const t = norm(texto);
  if (/\bmente\b/.test(t)) return "mente";
  if (camps.pipoca?.ativo && /\bfoguete\b/.test(t)) return "foguete";
  for (const [k, c] of Object.entries(CAMPANHAS)) {
    const cf = camps[k];
    if (!cf?.ativo) continue;
    if (cf.midias.length && !midia.some((m) => m && cf.midias.includes(m))) continue;
    if (c.acha.test(t)) return k;
  }
  return null;
}

// ---------- confirmar o @ do app de jogos (jogos/ da loja) ----------
// No site a pessoa pega um código de 4 números e manda aqui (direct ou comentário). A gente vê de
// qual @ veio e confirma no banco (função jogo_usar_codigo_arroba, mesmo projeto Supabase da loja).
const CODIGO_ARROBA = /^\s*\d{4}\s*$/;
// na direct aceita o código com algum texto em volta ("meu código é 1234", "1234."), só com um número de 4 dígitos
const CODIGO_DM = /^(?!.*\d{5})(?!.*\d{4}\D+\d{4})[^\d]{0,30}\d{4}[^\d]{0,10}$/s;
// quando = hora em que a pessoa comentou/mandou (o código vale pela hora do envio, não pela hora em que o robô leu).
// Devolve "erro" quando o banco falhou: aí não marca como visto e tenta de novo no minuto seguinte.
async function confirmaArroba(texto: string, handle: string | null, quando: string | undefined, via: "dm" | "comentario") {
  if (!handle || handle.startsWith("id:")) return null;
  const cod = (texto.match(/\d{4}/) || [""])[0];
  const { data, error } = await db.rpc("jogo_usar_codigo_arroba", { p_codigo: cod, p_username: handle, p_quando: quando || new Date().toISOString(), p_via: via });
  if (error) { console.error("confirma arroba", error.message); return "erro" as const; }
  await placar(data?.ok ? (data.trocou ? "arroba_confirmado_trocou" : "arroba_confirmado") : `arroba_${data?.motivo || "codigo_ruim"}`);
  // atraso entre a pessoa mandar e o robô ler (pra conferir: select v from kit_config where k = 'arroba_atraso')
  if (quando) await grava("arroba_atraso", JSON.stringify({ seg: Math.round((Date.now() - new Date(quando).getTime()) / 1000), ok: !!data?.ok, motivo: data?.motivo }));
  return data as { ok: boolean; motivo?: string; handle?: string; trocou?: boolean } | null;
}

async function acha(t: string, eu: string, ate: number, camps: Camps) {
  const achados: any[] = [];
  const { j: midias } = await ig(`me/media?fields=id,timestamp,permalink&limit=25`, t);
  for (const m of midias.data || []) {
    if (Date.now() - new Date(m.timestamp).getTime() > 8 * 86400e3) continue; // comentário nesse post já passou dos 7 dias
    let url: string | null = `${API}/${m.id}/comments?fields=${encodeURIComponent(CAMPOS)}&limit=50&access_token=${t}`;
    for (let pag = 0; url && pag < 40 && Date.now() < ate; pag++) {
      const j = await (await fetch(url)).json().catch(() => ({}));
      for (const c of j.data || []) {
        achados.push({ ...c, raiz: c.id, midia: m.id, codigo: codigo(m.permalink) });
        let r = c.replies;
        for (let k = 0; r && k < 20; k++) {
          for (const x of r.data || []) achados.push({ ...x, raiz: c.id, midia: m.id, codigo: codigo(m.permalink) }); // no Instagram só dá pra responder o comentário principal
          r = r.paging?.next ? await (await fetch(r.paging.next)).json().catch(() => null) : null;
        }
      }
      url = j.paging?.next || null;
    }
  }
  // limpeza: respostas públicas nossas que saíram como "@undefined ..." (bug do @ vazio, 01/11) são apagadas, 10 por rodada
  const lixo = achados.filter((c) => c.from?.id === eu && /^@undefined\b/.test(c.text || "")).slice(0, 10);
  for (const c of lixo) {
    const r = await fetch(`${API}/${c.id}?access_token=${t}`, { method: "DELETE" });
    if (r.ok) await placar("apagou_undefined");
  }
  // comentário da própria conta (fixado "comenta SEGREDO", respostas públicas do robô) nunca vira DM.
  return achados.map((c) => ({ ...c, palavra: palavra(c.text || "", [c.midia, c.codigo], camps) })).filter((c) =>
    c.palavra && !ehEu(c) &&
    Date.now() - new Date(c.timestamp).getTime() < 6.5 * 86400e3); // resposta privada vale 7 dias
}

// guarda os últimos 5 motivos de recusa: select v from kit_config where k = 'erros'
async function erro(c: any, r: { status: number; j: any }) {
  console.error("recusado", r.status, JSON.stringify(r.j));
  const e = JSON.parse((await cfg("erros"))?.v || "[]");
  await grava("erros", JSON.stringify([{ c: c.id, u: c.username, s: r.status, e: r.j?.error?.message, code: r.j?.error?.code, sub: r.j?.error?.error_subcode }, ...e].slice(0, 5)));
}

// a Meta recusou porque a pessoa não aceita mensagem de quem ela não segue (conta de adolescente,
// "só de quem eu sigo"...). Aí não adianta insistir: nada de 2ª tentativa nem de outra campanha.
const naoRecebe = (r: { ok: boolean; j: any }) => !r.ok && (r.j?.error?.code === 551 ||
  [1545041, 2534022, 2018278].includes(r.j?.error?.error_subcode) ||
  /isn.t available|not available|cannot receive|n[aã]o (aceita|pode receber)/i.test(r.j?.error?.message || ""));
// só vale mandar de novo sem botão quando o erro é de parâmetro (o botão não foi aceito)
const erroDeBotao = (r: { ok: boolean; j: any }) => !r.ok && r.j?.error?.code === 100 && !naoRecebe(r);

// resposta pública no comentário principal (texto varia pra não parecer spam)
async function responderPublico(t: string, c: any, textos: string[]) {
  const r = await ig(`${c.raiz || c.id}/replies`, t, { message: (c.username || c.from?.username) ? `@${c.username || c.from.username} ${sorteia(textos)}` : sorteia(textos) });
  if (!r.ok) await erro(c, r);
  return r.ok;
}

// placar do funil: select v from kit_config where k = 'seguidores'
async function placar(campo: string) {
  let p: any = {};
  try { p = JSON.parse((await cfg("seguidores"))?.v || "{}"); } catch { /* recomeça */ }
  p[campo] = (p[campo] || 0) + 1;
  await grava("seguidores", JSON.stringify(p));
}

// kit_config 'campanhas': {"pipoca": {"ativo": true, "link": "..."}, "elefante": {"ativo": true, "link": "...", "midias": ["<id do post>"]}}
type Camps = Record<string, { ativo: boolean; link: string; midias: string[] }>;
async function campanhasCfg(): Promise<Camps> {
  let j: any = {};
  try { j = JSON.parse((await cfg("campanhas"))?.v || "{}"); } catch { /* tudo desligado */ }
  const out: Camps = {};
  for (const k of Object.keys(CAMPANHAS)) {
    const c = j[k] || PADRAO[k] || {};
    out[k] = { ativo: !!c.ativo && !!c.link, link: c.link || "", midias: (c.midias || []).map((m: unknown) => codigo(String(m))) };
  }
  return out;
}

const CONVITE_SEGUIR = [
  "Me segue que toda semana tem segredo novo 👀",
  "Se curtiu, me segue que vem mais truque assim 👀",
  "Me segue pra não perder o próximo segredo 🤫",
];
async function comentarios(t: string, eu: string, modo: string, link: string, camps: Camps) {
  const entregaDireta = ((await cfg("entrega"))?.v || "direta") !== "botao";
  const achados = await acha(t, eu, Date.now() + 35000, camps);
  const vistos = new Set<string>();
  for (let i = 0; i < achados.length; i += 150) {
    const { data } = await db.from("kit_visto").select("id").in("id", achados.slice(i, i + 150).map((c) => c.id));
    (data || []).forEach((v) => vistos.add(v.id));
  }
  const faltam = achados.filter((c) => !vistos.has(c.id));
  const falhas = new Set<string>();
  for (let i = 0; i < faltam.length; i += 75) {
    const ids = faltam.slice(i, i + 75).flatMap((c) => ["f1:" + c.id, "f2:" + c.id]);
    const { data } = await db.from("kit_visto").select("id").in("id", ids);
    (data || []).forEach((v) => falhas.add(v.id));
  }
  const publica = ((await cfg("publica"))?.v || "sim") !== "nao";
  let enviados = 0;
  // códigos do app de jogos ANTES de tudo: antes eles entravam na fila por ordem de hora e, quando o limite
  // da hora acabava num comentário mais antigo, o laço parava (break) e o código esperava horas.
  // A confirmação no banco não gasta limite da Meta; só a resposta pública gasta (e tem prioridade, sem reserva).
  for (const c of faltam.filter((x) => x.palavra === "codigo")) {
    const r = await confirmaArroba(c.text || "", quem(c), c.timestamp, "comentario");
    if (r === "erro") continue; // banco falhou: tenta de novo na próxima rodada
    await marca(c.id);
    // número que nunca foi código (resposta de desafio, ano...): fica quieto, sem "venceu" em público
    if (r && r.motivo !== "nao_existe" && r.motivo !== "sem_handle" && publica && await podeResponder()) await responderPublico(t, c, r.ok
      ? ["✓ @ confirmado! Volta no jogo que teu nome já tá com o selo no ranking 🏆"]
      : r.motivo === "outro_handle" ? ["esse código é de outro @ 🤔 manda ele na minha direct que eu confirmo a conta que mandou 😉"]
      : ["esse código venceu 😅 pega um novo no jogo e manda aqui."]);
  }
  for (const c of faltam.sort((x, y) => +new Date(x.timestamp) - +new Date(y.timestamp))) { // mais antigos primeiro (vencem antes)
    if (c.palavra === "codigo") continue; // já tratado acima
    // 1 DM por pessoa e por fluxo: comentário repetido da mesma pessoa só é marcado como visto
    const fluxo = c.palavra === "mente" ? modo : c.palavra;
    // a mesma pessoa às vezes vem com @ e às vezes sem (só o id): marca e confere as duas formas
    const chaves = [c.username || c.from?.username ? `u:${fluxo}:${(c.username || c.from.username).toLowerCase()}` : null,
                    c.from?.id ? `u:${fluxo}:id:${c.from.id}` : null].filter(Boolean) as string[];
    const pessoa = chaves[0] || null;
    const jaFoi = async () => { for (const k of chaves) if (await visto(k)) return true; return false; };
    const marcaPessoa = async () => { for (const k of chaves) await marca(k); };
    if (chaves.length && await jaFoi()) { await marca(c.id); continue; }
    if (!(await podeResponder(20))) break;

    if (c.palavra === "foguete") { // achou a palavra do nível secreto: só parabéns em público
      await responderPublico(t, c, PUB_FOGUETE);
      await marca(c.id); await marcaPessoa();
      await placar("foguete_publica");
      continue;
    }

    let r;
    const camp = CAMPANHAS[c.palavra];
    if (camp && entregaDireta) {
      // sem Acesso Avançado na Meta, a 2ª DM é sempre recusada (code 10 / 2534022): a resposta privada já entrega
      // o segredo e convida a seguir. kit_config 'entrega' = 'botao' volta pro fluxo com botão depois da análise do app.
      const texto = c.palavra === "jogo"
        ? `${camp.libera(camps.jogo.link)} Me segue que vem desafio novo toda semana 👀`
        : `${camp.libera(camps[c.palavra].link)} ${sorteia(CONVITE_SEGUIR)}\n\n${DM_JOGO}`;
      r = await ig("me/messages", t, { recipient: { comment_id: c.id }, message: { text: texto } });
      if (r.ok && quem(c)) {
        await db.from("kit_fluxo").upsert({ handle: quem(c), fluxo: c.palavra, passo: 9, em: new Date().toISOString() });
        await placar(`${c.palavra}_entregue_direto`);
      }
    } else if (camp) {
      // o botão nem sempre aparece (DM cai em "solicitações"), então o texto também pede pra responder QUERO
      const d = sorteia(camp.dm), texto = /QUERO/.test(d) ? d : `${d} Toca no botão ou responde QUERO 👇`;
      r = await ig("me/messages", t, { recipient: { comment_id: c.id }, message: { text: texto, quick_replies: BOTAO(camp.botao, "QUERO") } });
      if (erroDeBotao(r)) // se a resposta privada não aceitar botão, vai só o texto
        r = await ig("me/messages", t, { recipient: { comment_id: c.id }, message: { text: texto } });
      if (r.ok && quem(c)) {
        await db.from("kit_fluxo").upsert({ handle: quem(c), fluxo: c.palavra, passo: 0, em: new Date().toISOString() });
        await placar(`${c.palavra}_pediu`);
      }
    } else {
      const texto = modo === "link" && link ? LINK(link) : sorteia(ANOTADO);
      r = await ig("me/messages", t, { recipient: { comment_id: c.id }, message: { text: texto } });
    }
    if (r.ok) {
      enviados++;
      if (publica && await podeResponder(20)) // a DM de quem não segue cai em "Solicitações": avisa onde olhar
        await responderPublico(t, c, !camp ? PUB_MENTE.map((x) => `${x} (tá em Solicitações 📩)`)
          : c.palavra === "jogo" ? camp.pub
          // campanhas de segredo: a pública vende o jogo; quem não fala da DM ganha o aviso de onde olhar
          : PUB_VENDE.map((x) => /\bDM\b/.test(x) ? x : `📩 Olha tua DM (tá em Solicitações). ${x}`));
    } else if (camp && naoRecebe(r)) {
      // Insta da pessoa não aceita DM de quem ela não segue: convida em público a seguir e mandar a palavra na DM
      await placar(`${c.palavra}_nao_recebe`);
      if (publica && await podeResponder(20)) await responderPublico(t, c, c.palavra === "jogo" ? [
        "Teu Insta não deixa eu te mandar DM 😢 mas o link do joguinho tá na bio! 66 desafios, os 2 primeiros são grátis",
        "Tentei te mandar na DM mas teu Insta bloqueou 😢 O joguinho tá no link da bio 🧠",
      ] : [
        `Teu Insta não deixa eu te mandar DM 😢 Me segue e manda ${camp.chave} na minha DM que eu te mando`,
        `Tentei te mandar na DM mas teu Insta bloqueou 😢 Me segue e manda ${camp.chave} lá que eu te mando`,
      ]);
    }
    if (r.ok || (r.status >= 400 && r.status < 500)) {
      await marca(c.id); // 4xx = não adianta tentar de novo
      await marcaPessoa();
      if (!r.ok) await erro(c, r);
    } else {
      // erro 5xx da Meta: tenta de novo no minuto seguinte, mas desiste depois de 3 falhas pra não gastar o limite à toa
      console.error("dm comentario", r.status, JSON.stringify(r.j));
      const f = ["f1:", "f2:"].find((p) => !falhas.has(p + c.id));
      if (f) await marca(f + c.id); else await marca(c.id);
    }
  }
  // placar pra conferir no SQL: select * from kit_config where k = 'varredura'
  const ant = JSON.parse((await cfg("varredura"))?.v || "{}");
  await grava("varredura", JSON.stringify({
    achados: achados.length, ja_respondidos: achados.length - faltam.length, faltavam: faltam.length,
    enviados_agora: enviados, enviados_total: (ant.enviados_total || 0) + enviados,
  }));
}

// 2a) fluxo das campanhas na DM: pessoa tocou "Quero!" / "Já segui" (ou escreveu qualquer coisa)
//   passo 0 -> confere se segue: segue = manda o link; não segue = pede pra seguir (passo 1)
//   passo 1 -> confere de novo: segue = link (seguidor novo); não segue = libera mesmo assim
//   passo 9 -> já entregou, o robô fica quieto (o Rafael responde se quiser)
// devolve true quando a conversa é desse fluxo (aí o SIM do MENTE não mexe nela)
// qual campanha foi a nossa última DM, pelo texto (pra quem recebeu a 1ª DM quando o @ vinha vazio e ficou sem kit_fluxo)
function campanhaPeloTexto(texto: string): string | null {
  const t0 = norm(texto || "");
  if (/900 palavras|pipoca|nivel secreto/.test(t0)) return "pipoca";
  if (/elefante/.test(t0)) return "elefante";
  if (/girafa/.test(t0)) return "dedo";
  if (/kiwi/.test(t0)) return "fruta";
  if (/bandeira|ilusao/.test(t0)) return "bandeira";
  return null;
}

async function passoCampanha(t: string, msg: any, camps: Camps, nossa?: any) {
  // procura pelo @ e, se não achar, pelo id (quando o comentário veio sem @)
  let handle = msg.from.username ? msg.from.username.toLowerCase() : `id:${msg.from.id}`;
  let f = (await db.from("kit_fluxo").select("passo, fluxo, em").eq("handle", handle).maybeSingle()).data;
  if (!f && msg.from.username) {
    const porId = (await db.from("kit_fluxo").select("passo, fluxo, em").eq("handle", `id:${msg.from.id}`).maybeSingle()).data;
    if (porId) { f = porId; handle = `id:${msg.from.id}`; }
  }
  if (!f && nossa) { // recebeu nossa 1ª DM mas o passo não foi guardado: descobre a campanha pela nossa mensagem
    const k = campanhaPeloTexto(nossa.message);
    if (k && camps[k]?.ativo) {
      f = { passo: 0, fluxo: k, em: nossa.created_time };
      await db.from("kit_fluxo").upsert({ handle, ...f });
    }
  }
  if (!f || f.passo >= 9) { // mandou a palavra da campanha direto na DM (ex.: o Insta dela bloqueou nossa 1ª DM)
    const t0 = norm(msg.message || "");
    // várias campanhas usam SEGREDO: vale a da nossa última DM nessa conversa, senão a fruta (único vídeo com o comentário fixado SEGREDO)
    const pelaNossa = nossa ? campanhaPeloTexto(nossa.message) : null;
    // JOGO só vale em comentário (não abre fluxo por DM)
    const casam = Object.keys(CAMPANHAS).filter((k) => k !== "jogo" && camps[k]?.ativo && t0.includes(CAMPANHAS[k].chave.toLowerCase()));
    const k = pelaNossa && casam.includes(pelaNossa) ? pelaNossa : casam.includes("fruta") ? "fruta" : casam[0];
    if (k && !(await visto(`dm:${k}:${handle}`))) {
      await marca(`dm:${k}:${handle}`);
      f = { passo: 0, fluxo: k, em: new Date(0).toISOString() };
      await db.from("kit_fluxo").upsert({ handle, ...f });
    }
  }
  const camp = f && CAMPANHAS[f.fluxo], link = f && camps[f.fluxo]?.link;
  if (!f || !camp || !link) return false;
  if (await visto(msg.id)) return true;
  if (f.passo >= 9) { await marca(msg.id); return true; }
  // a conversa aberta pela resposta privada pode trazer o comentário da pessoa como "mensagem dela":
  // isso não é ela respondendo. Só anda o fluxo com mensagem escrita depois da nossa última DM.
  if (new Date(msg.created_time).getTime() <= new Date(f.em).getTime() || !(msg.message || "").trim()) {
    await marca(msg.id); return true;
  }
  if (!(await podeResponder())) return true;

  // true / false; se a Meta não responder (undefined), libera pra não travar a pessoa
  const { ok, j } = await ig(`${msg.from.id}?fields=is_user_follow_business`, t);
  const segue: boolean | undefined = ok ? j.is_user_follow_business : undefined;
  const manda = (message: unknown) => ig("me/messages", t, { recipient: { id: msg.from.id }, message });

  let r, passo = 9, campo = "";
  if (segue !== false) {
    r = await manda({ text: camp.libera(link) });
    campo = segue === undefined ? "sem_conferir" : f.passo === 0 ? "ja_seguiam" : "novos_seguidores";
  } else if (f.passo === 0) {
    const texto = sorteia(camp.segue);
    r = await manda({ text: texto, quick_replies: BOTAO("Já segui ✅", "SEGUI") });
    if (erroDeBotao(r)) r = await manda({ text: `${texto.replace(/,? toca no botão aqui embaixo 👇$/, "")} e responde JÁ SEGUI aqui.` });
    passo = 1; campo = "pediu_pra_seguir";
  } else {
    r = await manda({ text: camp.liberaSem(link) });
    campo = "liberou_sem_seguir";
  }
  if (r.ok) {
    await db.from("kit_fluxo").update({ passo, em: new Date().toISOString() }).eq("handle", handle);
    await placar(`${f.fluxo}_${campo}`);
  } else {
    // ela acabou de falar com a gente, então recusa aqui não é "não aceita DM": guarda o motivo exato
    // (select v from kit_config where k = 'erros') e não trava a pessoa; a próxima mensagem dela tenta de novo
    await erro({ id: msg.id, username: handle }, r);
    await placar(`${f.fluxo}_dm_recusada`);
  }
  if (r.ok || (r.status >= 400 && r.status < 500)) await marca(msg.id);
  else console.error("dm campanha", r.status, JSON.stringify(r.j));
  return true;
}

// 2b) quem respondeu SIM na DM (janela de 24 h aberta pela mensagem da pessoa)
async function respostasSim(t: string, eu: string, modo: string, link: string, camps: Camps) {
  // todas as conversas das últimas 23 h (até 20 páginas de 50, as mais recentes primeiro)
  const convs: any[] = [];
  let { j } = await ig(`me/conversations?platform=instagram&fields=updated_time,messages.limit(3){id,message,from,created_time}&limit=50`, t);
  let pags = 0, erroConv = j?.error?.message || "";
  for (; pags < 20; pags++) {
    convs.push(...(j.data || []));
    const ultima = j.data?.[j.data.length - 1]?.updated_time;
    if (!j.paging?.next || (ultima && Date.now() - new Date(ultima).getTime() > 23 * 3600e3)) break;
    j = await (await fetch(j.paging.next)).json().catch(() => ({}));
  }
  // só as que a última fala é da pessoa, dentro das 23 h e ainda não vistas (confere o kit_visto em lote)
  const delas = convs.filter((c) => {
    const m = c.messages?.data?.[0];
    return m && !ehEu(m) && Date.now() - new Date(m.created_time).getTime() <= 23 * 3600e3;
  });
  const jaVistas = new Set<string>();
  for (let i = 0; i < delas.length; i += 150) {
    const { data } = await db.from("kit_visto").select("id").in("id", delas.slice(i, i + 150).map((c) => c.messages.data[0].id));
    (data || []).forEach((v) => jaVistas.add(v.id));
  }
  const fila = delas.filter((c) => !jaVistas.has(c.messages.data[0].id)).reverse(); // mais antigas primeiro (vencem antes)
  // raio-x: select v from kit_config where k = 'dm_varredura'
  await grava("dm_varredura", JSON.stringify({ em: new Date().toISOString(), paginas: pags + 1, conversas: convs.length,
    ultima_fala_delas_23h: delas.length, sem_resposta: fila.length, erro: erroConv || undefined }));
  for (const conv of fila) {
    const nossa = (conv.messages?.data || []).find((x: any) => ehEu(x)); // nossa última mensagem nessa conversa
    // código do app de jogos pela direct: vale mesmo se depois do código a pessoa mandou "oi" ou outra coisa
    // (olha as falas dela depois da nossa última), e aceita "meu código é 1234"
    const delaCod: any[] = [];
    for (const x of conv.messages?.data || []) { if (ehEu(x)) break; delaCod.push(x); }
    const codMsg = delaCod.find((x: any) => CODIGO_DM.test(x.message || ""));
    let msg = conv.messages.data[0];
    if (codMsg && !(await visto(codMsg.id))) msg = codMsg;
    if (codMsg && msg === codMsg) { // código do app de jogos pela direct
      if (await visto(msg.id)) continue;
      const r = await confirmaArroba(msg.message, msg.from?.username ? msg.from.username.toLowerCase() : null, msg.created_time, "dm");
      if (r === "erro") continue; // banco falhou: tenta de novo na próxima rodada
      await marca(msg.id);
      if (!r || r.motivo === "nao_existe" || r.motivo === "sem_handle") continue;
      // pode ser recusada pela Meta (sem Acesso Avançado); o site confirma sozinho de qualquer jeito.
      if (!(await podeResponder())) { await placar("arroba_dm_sem_limite"); continue; }
      const nome = r.handle || (msg.from?.username || "").toLowerCase();
      const resp = await ig("me/messages", t, { recipient: { id: msg.from.id }, message: { text: r.ok
          ? `pronto, @${nome} ✓ confirmado!${r.trocou ? " (no jogo já troquei pro teu @ certinho)" : ""} volta no jogo que teu nome já tá com o selo no ranking 🏆`
          : r.motivo === "outro_handle" ? `esse código é do @${r.handle}. no jogo, digita o teu @ e pega um código novo 😉`
          : "esse código venceu 😅 pega um novo no jogo e manda aqui." } });
      if (resp.ok) await placar("arroba_dm_ok");
      else { await erro({ id: msg.id, username: nome }, resp); await placar("arroba_dm_recusada"); }
      continue;
    }
    if (msg.from?.id && await passoCampanha(t, msg, camps, nossa)) continue;
    if (!/^(sim|s|quero|bora|pode)\b[\s!.]*$/.test(norm(msg.message || ""))) continue;
    if (await visto(msg.id)) continue;
    if (!(await podeResponder())) return;
    if (msg.from?.username) await db.from("kit_lista").upsert({ handle: msg.from.username.toLowerCase() }, { ignoreDuplicates: true });
    const texto = modo === "link" && link ? LINK(link) : sorteia(NA_LISTA);
    const r = await ig("me/messages", t, { recipient: { id: msg.from.id }, message: { text: texto } });
    if (r.ok || (r.status >= 400 && r.status < 500)) await marca(msg.id);
    else console.error("dm sim", r.status, JSON.stringify(r.j));
  }
}

Deno.serve(async (req) => {
  const chave = (await cfg("cron_chave"))?.v;
  if (!chave || req.headers.get("x-chave") !== chave) return new Response("não", { status: 403 });
  const t = await token(), eu = Deno.env.get("IG_USER_ID");
  if (!t || !eu) return new Response("sem token ou IG_USER_ID", { status: 500 });
  const modo = (await cfg("modo"))?.v || "lista", link = (await cfg("link"))?.v || "";
  try {
    const camps = await campanhasCfg();
    await carregaEu(t, eu);
    // primeiro quem já está conversando (tocou "Quero"/"Já segui"): senão a fila de comentários gasta
    // o limite de 6/min e 120/h inteiro e a pessoa que respondeu fica sem o segredo
    await respostasSim(t, eu, modo, link, camps);
    await comentarios(t, eu, modo, link, camps);
    if (new Date().getMinutes() === 17) {
      const limite = new Date(Date.now() - 10 * 86400e3).toISOString();
      await db.from("kit_visto").delete().lt("em", limite);
      await db.from("kit_fluxo").delete().lt("em", limite);
    }
  } catch (e) { console.error(e); return new Response("erro", { status: 500 }); }
  return new Response("ok");
});
