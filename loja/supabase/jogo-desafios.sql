-- Jogo "Desafios do Caderno Amarelo" (desafios.html): produto usado pelo paywall Pix.
-- AINDA NÃO RODAR: preço e entrega a confirmar com o Rafael.
-- Só é usado quando JOGO.pixReal = true em assets/js/desafios.js; até lá o paywall roda em modo teste (toggle).
--
-- A coluna "arquivo" é obrigatória porque o fluxo atual entrega um PDF depois do pagamento
-- (link no status-pedido e no e-mail). Opção sugerida: mandar de brinde o PDF "Desafios do Caderno Amarelo".
insert into produtos (slug, nome, preco, arquivo) values
  ('jogo-desafios', 'Desafios do Caderno Amarelo · jogo completo', 3.90, 'desafios/desafios-do-caderno-v1.pdf')
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
