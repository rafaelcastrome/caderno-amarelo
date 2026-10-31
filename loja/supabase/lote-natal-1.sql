-- Lote 1 de Natal: preço cobrado e arquivo no bucket "produtos".
insert into produtos (slug, nome, preco, arquivo) values
  ('natal-fofo-colorir', 'Natal Fofo pra Colorir', 6.90, 'natal/natal-fofo-colorir.pdf'),
  ('calendario-advento-desafios', 'Calendário do Advento de Desafios', 5.90, 'natal/calendario-advento-desafios.pdf'),
  ('enfeites-de-papel', 'Enfeites de Papel pra Pendurar', 4.90, 'natal/enfeites-de-papel.pdf'),
  ('bingo-de-natal', 'Bingo de Natal em Família', 5.90, 'natal/bingo-de-natal.pdf'),
  ('kit-amigo-secreto', 'Kit Amigo Secreto', 4.90, 'natal/kit-amigo-secreto.pdf'),
  ('quiz-de-natal', 'Quiz de Natal', 4.90, 'natal/quiz-de-natal.pdf'),
  ('caca-ao-presente', 'Caça ao Presente', 4.90, 'natal/caca-ao-presente.pdf'),
  ('casinha-papai-noel-3d', 'Casinha do Papai Noel pra Montar', 5.90, 'natal/casinha-papai-noel-3d.pdf'),
  ('jogo-da-memoria-natal', 'Jogo da Memória de Natal', 4.90, 'natal/jogo-da-memoria-natal.pdf'),
  ('retrospectiva-do-ano', 'Retrospectiva do Meu Ano', 4.90, 'natal/retrospectiva-do-ano.pdf')
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
