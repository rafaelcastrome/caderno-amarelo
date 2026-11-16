-- Planos do caRdeno Premium no app de jogos (jogos/js/premium.js). Pix não renova sozinho:
-- cada pagamento libera por um prazo (passe). Libera TODOS os jogos (fases pagas, dias anteriores, card dourado, 66 Desafios).
--   passe-mensal  R$ 4,90  -> 30 dias
--   passe-anual   R$ 29,90 -> 365 dias
-- A duração fica em _comum/conta.ts (PLANOS). A coluna "arquivo" é obrigatória no fluxo da loja:
-- entrega de brinde o PDF dos 66 Desafios, o mesmo do produto jogo-desafios.
insert into produtos (slug, nome, preco, arquivo)
select 'passe-mensal', 'caRdeno Premium · 30 dias', 4.90, arquivo from produtos where slug = 'jogo-desafios'
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
insert into produtos (slug, nome, preco, arquivo)
select 'passe-anual', 'caRdeno Premium · 1 ano', 29.90, arquivo from produtos where slug = 'jogo-desafios'
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
