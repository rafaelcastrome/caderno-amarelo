-- Caderno Premium do app de jogos (jogos/js/premium.js): R$ 9,90, pagamento único no Pix.
-- Libera modo impossível, desafios anteriores, card dourado e os 66 Desafios no celular de quem pagou.
-- A coluna "arquivo" é obrigatória no fluxo da loja (link de download no status-pedido e no e-mail):
-- entrega de brinde o PDF dos 66 Desafios, o mesmo do produto jogo-desafios.
insert into produtos (slug, nome, preco, arquivo)
select 'caderno-premium', 'Caderno Premium · app de jogos', 9.90, arquivo from produtos where slug = 'jogo-desafios'
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
