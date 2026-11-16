-- Ranking do app de jogos (jogos/): perfil público, recordes e amigos.
-- Rodar DEPOIS de conta-jogo.sql. Só as funções (service role) leem e escrevem.
-- Privacidade (ECA Digital): o @ do Instagram é opcional e só aparece no ranking se a
-- pessoa marcar "mostrar meu @". Sem isso aparece o apelido. E-mail nunca aparece.

alter table contas_jogo add column if not exists apelido text;
alter table contas_jogo add column if not exists arroba text;               -- sem o @, minúsculo
alter table contas_jogo add column if not exists mostrar_arroba boolean not null default false;
alter table contas_jogo add column if not exists id_publico text unique
  default substr(md5(random()::text || clock_timestamp()::text), 1, 10);
update contas_jogo set id_publico = substr(md5(random()::text || email), 1, 10) where id_publico is null;

-- melhor tempo de cada conta em cada ranking: 'dia:2026-11-15' (desafio do dia) ou 'fase:12'
create table if not exists recordes_jogo (
  email       text not null references contas_jogo(email) on delete cascade,
  chave       text not null,
  t           numeric(7,1) not null,
  tentativa   int,                      -- em qual tentativa fez esse tempo
  criado_em   timestamptz not null default now(),
  primary key (email, chave)
);
create index if not exists recordes_jogo_chave_idx on recordes_jogo(chave, t);

-- amizade nasce quando alguém abre o link de duelo de outra pessoa (vale pros dois lados)
create table if not exists amigos_jogo (
  a          text not null references contas_jogo(email) on delete cascade,
  b          text not null references contas_jogo(email) on delete cascade,
  criado_em  timestamptz not null default now(),
  primary key (a, b)
);

alter table recordes_jogo enable row level security;
alter table amigos_jogo   enable row level security;
-- sem policies: anon não lê nem escreve nada; só as funções com service role.

-- ---------- confirmar o @ pela direct (igual ao @arrobanomapa) ----------
-- O site gera um código de 4 números (30 min) pro @ que a pessoa digitou. Ela manda o código
-- na direct do @Cardeno_Amarelo (ou comenta num post). O bot do Instagram, que roda neste mesmo
-- projeto, vê de qual @ veio e chama jogo_usar_codigo_arroba(código, @).
alter table contas_jogo add column if not exists arroba_confirmado boolean not null default false;

create table if not exists codigos_arroba_jogo (
  codigo    text not null,
  email     text not null references contas_jogo(email) on delete cascade,
  arroba    text not null,
  ate       timestamptz not null,
  criado_em timestamptz not null default now()
);
create index if not exists codigos_arroba_jogo_cod_idx on codigos_arroba_jogo(codigo, ate desc);
alter table codigos_arroba_jogo enable row level security;

create or replace function jogo_usar_codigo_arroba(p_codigo text, p_username text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c codigos_arroba_jogo; h text := lower(trim(both '@' from coalesce(p_username, '')));
begin
  select * into c from codigos_arroba_jogo where codigo = p_codigo and ate > now() order by criado_em desc limit 1;
  if c is null then return jsonb_build_object('ok', false, 'motivo', 'vencido'); end if;
  if c.arroba <> h then return jsonb_build_object('ok', false, 'motivo', 'outro_handle', 'handle', c.arroba); end if;
  -- o @ confirmado é de uma conta só: tira o selo de quem tinha digitado o mesmo @
  update contas_jogo set arroba_confirmado = false where arroba = h and email <> c.email;
  update contas_jogo set arroba = h, arroba_confirmado = true where email = c.email;
  update codigos_arroba_jogo set ate = now() where email = c.email;
  return jsonb_build_object('ok', true, 'handle', h);
end $$;
revoke all on function jogo_usar_codigo_arroba(text, text) from public, anon, authenticated;

-- ---------- Pegadinhas (16/11/2026): ranking de cada nível por acertos e tempo médio ----------
-- chave 'peg:N' (N = 1..17): t = tempo médio por pergunta (segundos), acertos = quantas das 10 acertou.
-- Ordem: mais acertos primeiro; empatou, menor tempo médio.
alter table recordes_jogo add column if not exists acertos smallint;
create index if not exists recordes_jogo_peg_idx on recordes_jogo(chave, acertos desc, t) where acertos is not null;
