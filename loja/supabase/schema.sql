-- Loja do Caderno Amarelo: catálogo (fonte de verdade do preço) e pedidos.
-- Só as Edge Functions (service role) leem e escrevem; RLS ligado e sem políticas.

create table if not exists produtos (
  slug       text primary key,
  nome       text not null,
  preco      numeric(10,2) not null check (preco > 0),
  arquivo    text not null,              -- caminho no bucket privado "produtos", ex.: kit-mentalista/kit-mentalista-v1.pdf
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

create table if not exists pedidos (
  id            uuid primary key default gen_random_uuid(),
  produto       text not null references produtos(slug),
  email         text not null,
  valor         numeric(10,2) not null,
  status        text not null default 'pendente' check (status in ('pendente','pago','cancelado','reembolsado')),
  mp_pagamento  text unique,
  criado_em     timestamptz not null default now(),
  pago_em       timestamptz,
  email_enviado boolean not null default false
);
create index if not exists pedidos_status_idx on pedidos(status, criado_em);

alter table produtos enable row level security;
alter table pedidos  enable row level security;

-- Bucket privado com os PDFs (o download sai por link assinado, válido por 7 dias).
insert into storage.buckets (id, name, public) values ('produtos', 'produtos', false)
on conflict (id) do nothing;

-- Produto inicial. Pra cadastrar outro: subir o PDF no bucket e inserir uma linha aqui
-- (e um item com o mesmo slug em loja/produtos.json, que é a vitrine).
insert into produtos (slug, nome, preco, arquivo) values
  ('kit-mentalista', 'Kit Mentalista', 5.90, 'kit-mentalista/kit-mentalista-v1.pdf')
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
