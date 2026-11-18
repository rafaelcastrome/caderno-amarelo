-- Funil de venda (Rafael, 18/11/2026): onde a venda morre.
-- Tabela ANÔNIMA: nada de e-mail nem @. "sessao" é um id aleatório guardado no localStorage do aparelho.
-- O site (chave anon) só consegue INSERIR, e só os eventos do navegador. gerou_pix e pagou são gravados
-- pelas Edge Functions (criar-pix e sincronizarOrder), então não dá pra inventar venda pelo navegador.

create table if not exists eventos_funil (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz not null default now(),
  sessao        uuid,                               -- null só em "pagou" de Pix gerado antes do funil existir
  evento        text not null check (evento in (
                  'abriu_site', 'jogou_primeiro_nivel', 'chegou_no_limite', 'abriu_premium', 'pediu_codigo',
                  'entrou_na_conta', 'gerou_pix', 'pagou', 'abriu_loja', 'abriu_produto')),
  detalhe       jsonb not null default '{}'::jsonb check (
                  jsonb_typeof(detalhe) = 'object'
                  and pg_column_size(detalhe) < 600
                  -- só estas chaves (garante que não entra e-mail, @ nem nada pessoal)
                  and (detalhe - array['jogo', 'nivel', 'plano', 'produto', 'origem', 'pagina', 'valor']) = '{}'::jsonb),
  navegador_ig  boolean not null default false      -- user agent do navegador interno do Instagram
);
create index if not exists eventos_funil_dia_idx on eventos_funil (criado_em, evento);

alter table eventos_funil enable row level security;
revoke all on eventos_funil from anon, authenticated;
grant insert (sessao, evento, detalhe, navegador_ig) on eventos_funil to anon, authenticated;
drop policy if exists eventos_funil_site on eventos_funil;
create policy eventos_funil_site on eventos_funil for insert to anon, authenticated
  with check (sessao is not null and evento not in ('gerou_pix', 'pagou'));

-- Pedidos guardam a sessão anônima e o navegador, pro "pagou" cair na mesma sessão do funil.
alter table pedidos add column if not exists sessao uuid;
alter table pedidos add column if not exists navegador_ig boolean;

-- ---------- funil do dia (horário de Brasília) ----------
-- Pessoas = sessões diferentes que fizeram a etapa naquele dia.
create or replace view funil_dia with (security_invoker = true) as
select
  (criado_em at time zone 'America/Sao_Paulo')::date                                    as dia,
  count(distinct sessao) filter (where evento = 'abriu_site')                            as abriu_site,
  count(distinct sessao) filter (where evento = 'jogou_primeiro_nivel')                  as jogou_primeiro_nivel,
  count(distinct sessao) filter (where evento = 'chegou_no_limite')                      as chegou_no_limite,
  count(distinct sessao) filter (where evento = 'abriu_premium')                         as abriu_premium,
  count(distinct sessao) filter (where evento = 'pediu_codigo')                          as pediu_codigo,
  count(distinct sessao) filter (where evento = 'entrou_na_conta')                       as entrou_na_conta,
  count(distinct sessao) filter (where evento = 'gerou_pix' and detalhe ? 'plano')       as gerou_pix_premium,
  count(distinct sessao) filter (where evento = 'gerou_pix' and detalhe ? 'produto')     as gerou_pix_loja,
  count(*)               filter (where evento = 'pagou' and detalhe ? 'plano')           as pagou_premium,
  count(*)               filter (where evento = 'pagou' and detalhe ? 'produto')         as pagou_loja,
  count(distinct sessao) filter (where evento = 'abriu_loja')                            as abriu_loja,
  count(distinct sessao) filter (where evento = 'abriu_produto')                         as abriu_produto,
  count(distinct sessao) filter (where evento = 'abriu_site' and navegador_ig)           as abriu_site_no_instagram
from eventos_funil
group by 1;

-- Mesma coisa em linhas (uma por etapa), mais fácil de ler no celular.
create or replace view funil_etapas with (security_invoker = true) as
select
  (criado_em at time zone 'America/Sao_Paulo')::date as dia,
  case evento
    when 'abriu_site' then 1 when 'jogou_primeiro_nivel' then 2 when 'chegou_no_limite' then 3
    when 'abriu_premium' then 4 when 'pediu_codigo' then 5 when 'entrou_na_conta' then 6
    when 'gerou_pix' then 7 when 'pagou' then 8 when 'abriu_loja' then 9 when 'abriu_produto' then 10 end as ordem,
  evento,
  count(distinct coalesce(sessao::text, id::text))                       as pessoas,
  count(distinct sessao) filter (where navegador_ig)                     as no_instagram,
  count(*)                                                               as vezes
from eventos_funil
group by 1, 2, 3;

-- Pix gerados e não pagos (sem e-mail: só o que foi, quanto, quando e de onde).
create or replace view pix_nao_pagos with (security_invoker = true) as
select
  (criado_em at time zone 'America/Sao_Paulo')                         as gerado_em_brasilia,
  produto,
  valor,
  status,
  navegador_ig,
  sessao
from pedidos
where status <> 'pago'
order by criado_em desc;

revoke all on funil_dia, funil_etapas, pix_nao_pagos from anon, authenticated;

-- Consultas prontas:
--   select * from funil_etapas where dia = (now() at time zone 'America/Sao_Paulo')::date order by ordem;
--   select * from funil_dia order by dia desc limit 7;
--   select * from pix_nao_pagos where gerado_em_brasilia > now() at time zone 'America/Sao_Paulo' - interval '7 days';
