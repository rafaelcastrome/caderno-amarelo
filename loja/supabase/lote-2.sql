-- Lote 2: preço cobrado e arquivo no bucket "produtos".
insert into produtos (slug, nome, preco, arquivo) values
  ('etiquetas-de-presente', 'Etiquetas de Presente de Natal', 3.90, 'lote2/etiquetas-de-presente.pdf'),
  ('cartoes-de-natal-colorir', 'Cartões de Natal', 4.90, 'lote2/cartoes-de-natal-colorir.pdf'),
  ('detetive-do-caderno', 'Detetive do Caderno: o Mistério do Pudim', 5.90, 'lote2/detetive-do-caderno.pdf'),
  ('escape-room-em-casa', 'Escape Room em Casa', 5.90, 'lote2/escape-room-em-casa.pdf'),
  ('verdade-ou-desafio', 'Verdade ou Desafio Fofo', 5.90, 'lote2/verdade-ou-desafio.pdf'),
  ('quem-sou-eu', 'Quem Sou Eu?', 5.90, 'lote2/quem-sou-eu.pdf'),
  ('stop-adedonha', 'Stop / Adedonha', 3.90, 'lote2/stop-adedonha.pdf'),
  ('batalha-naval', 'Batalha Naval de Papel', 3.90, 'lote2/batalha-naval.pdf'),
  ('labirintos', 'Labirintos Impossíveis', 4.90, 'lote2/labirintos.pdf'),
  ('enigmas-e-sudokus', 'Enigmas e Sudokus', 4.90, 'lote2/enigmas-e-sudokus.pdf')
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo;
