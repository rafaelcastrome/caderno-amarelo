-- Kit Natal Completo (Rafael, 18/11/2026): os 18 PDFs do especial de Natal por R$ 19,90.
-- O preço cobrado vem daqui. "itens" diz quais PDFs o kit entrega (status-pedido e o e-mail mandam um link por item).
-- "arquivo" é obrigatório na tabela: fica o do primeiro item, só pra não quebrar quem lê um link só.

alter table produtos add column if not exists itens text[];

-- 1) Conferência: os 18 itens existem, estão ativos e quanto somam no banco (a página mostra "de R$ 91,20").
select count(*) as itens_achados, sum(preco) as soma_no_banco
from produtos
where ativo and slug in (
  'natal-fofo-colorir', 'calendario-advento-desafios', 'enfeites-de-papel', 'bingo-de-natal', 'kit-amigo-secreto',
  'quiz-de-natal', 'caca-ao-presente', 'casinha-papai-noel-3d', 'jogo-da-memoria-natal', 'retrospectiva-do-ano',
  'etiquetas-de-presente', 'cartoes-de-natal-colorir', 'bandeirinhas-de-natal', 'papel-de-presente-natal',
  'marcadores-de-pagina-natal', 'kit-ceia-de-natal', 'vales-de-natal', 'adesivos-de-natal');

-- 2) O kit
insert into produtos (slug, nome, preco, arquivo, itens)
select 'kit-natal-completo', 'Kit Natal Completo', 19.90, arquivo, array[
  'natal-fofo-colorir', 'calendario-advento-desafios', 'enfeites-de-papel', 'bingo-de-natal', 'kit-amigo-secreto',
  'quiz-de-natal', 'caca-ao-presente', 'casinha-papai-noel-3d', 'jogo-da-memoria-natal', 'retrospectiva-do-ano',
  'etiquetas-de-presente', 'cartoes-de-natal-colorir', 'bandeirinhas-de-natal', 'papel-de-presente-natal',
  'marcadores-de-pagina-natal', 'kit-ceia-de-natal', 'vales-de-natal', 'adesivos-de-natal']
from produtos where slug = 'natal-fofo-colorir'
on conflict (slug) do update set nome = excluded.nome, preco = excluded.preco, arquivo = excluded.arquivo, itens = excluded.itens, ativo = true;
