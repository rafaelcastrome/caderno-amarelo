-- Lote 3: preço cobrado e arquivo no bucket "produtos".
insert into produtos (slug, nome, preco, arquivo) values
  ('bandeirinhas-de-natal', 'Bandeirinhas de Natal', 4.90, 'lote3/bandeirinhas-de-natal.pdf'),
  ('papel-de-presente-natal', 'Papel de Presente de Natal', 4.90, 'lote3/papel-de-presente-natal.pdf'),
  ('marcadores-de-pagina-natal', 'Marcadores de Página de Natal', 3.90, 'lote3/marcadores-de-pagina-natal.pdf'),
  ('kit-ceia-de-natal', 'Kit Ceia de Natal', 5.90, 'lote3/kit-ceia-de-natal.pdf'),
  ('vales-de-natal', 'Vales de Natal', 3.90, 'lote3/vales-de-natal.pdf'),
  ('domino-de-natal', 'Dominó de Natal', 4.90, 'lote3/domino-de-natal.pdf'),
  ('trilha-de-natal', 'Trilha de Natal: Jogo de Tabuleiro', 5.90, 'lote3/trilha-de-natal.pdf'),
  ('adesivos-de-natal', 'Adesivos de Natal', 4.90, 'lote3/adesivos-de-natal.pdf')
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
