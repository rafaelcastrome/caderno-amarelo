-- Conta do app de jogos (jogos/): entrar com e-mail + código de 6 números, sem senha.
-- O Premium fica preso ao E-MAIL (pedido pago do produto caderno-premium com esse e-mail),
-- então vale em qualquer celular. O progresso das fases também fica salvo na conta.
-- Só as funções (service role) leem e escrevem; o navegador nunca acessa estas tabelas direto.

create table if not exists contas_jogo (
  email         text primary key,
  progresso     jsonb not null default '{}'::jsonb,   -- { "1": {"t": 4.2, "e": 3}, ... }
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists codigos_jogo (
  id          bigserial primary key,
  email       text not null,
  codigo_hash text not null,          -- sha-256 do código, nunca o código em si
  expira_em   timestamptz not null,
  tentativas  int not null default 0,
  usado       boolean not null default false,
  criado_em   timestamptz not null default now()
);
create index if not exists codigos_jogo_email_idx on codigos_jogo(email, criado_em desc);

create table if not exists sessoes_jogo (
  token_hash text primary key,        -- sha-256 do token que fica no celular
  email      text not null references contas_jogo(email) on delete cascade,
  criado_em  timestamptz not null default now()
);

alter table contas_jogo  enable row level security;
alter table codigos_jogo enable row level security;
alter table sessoes_jogo enable row level security;
-- sem policies: anon não lê nem escreve nada; só as funções com service role.
