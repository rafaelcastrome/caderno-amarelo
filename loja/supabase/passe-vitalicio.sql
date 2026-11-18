-- Oferta única do caRdeno Premium (Rafael, 18/11/2026): passe-vitalicio R$ 9,90, libera tudo sem data de fim.
-- _comum/conta.ts (PLANOS) trata 'passe-vitalicio' como null = pra sempre: jogo-conta/jogo-entrar devolvem premium = true e ate = null.
-- Mensal e anual continuam no banco (a chave OFERTA_UNICA em assets/js/config.js só escolhe o que aparece).
-- Brinde igual aos outros passes: o PDF dos 66 Desafios.
insert into produtos (slug, nome, preco, arquivo)
select 'passe-vitalicio', 'caRdeno Premium · pra sempre', 9.90, arquivo from produtos where slug = 'jogo-desafios'
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo, ativo = true;
