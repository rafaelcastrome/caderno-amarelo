-- Jogo "Desafios do Caderno Amarelo" (desafios.html): produto usado pelo paywall Pix.
-- Preço R$ 6,90 (Rafael, 02/11). Pix real ligado em 03/11 (JOGO.pixReal = true em assets/js/desafios.js).
-- Brinde depois do pagamento: PDF com os 66 desafios + gabarito, gerado por produtos/desafios_pdf/completo.js
-- e enviado pro bucket "produtos" em desafios/desafios-do-caderno-v1.pdf.
insert into produtos (slug, nome, preco, arquivo) values
  ('jogo-desafios', 'Desafios do Caderno Amarelo · jogo completo', 6.90, 'desafios/desafios-do-caderno-v1.pdf')
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
