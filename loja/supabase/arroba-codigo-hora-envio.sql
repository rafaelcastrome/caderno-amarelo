-- Confirmar o @ (16/11/2026, thread 90). Mudanças:
-- 1) O código vale pela HORA EM QUE A PESSOA MANDOU (p_quando = timestamp do comentário/DM), não pela hora
--    em que o robô leu. E vale 24 h (antes 30 min) pra quem manda do mesmo @ que digitou no jogo.
-- 2) Muita gente digita no jogo um @ diferente do real (apelido, erro de digitação: "vt", "cx"...).
--    Se o código chega PELA DIRECT de outra conta em até 1 h, quem mandou provou que é dono DESSA conta:
--    o @ da conta do jogo vira o @ real de quem mandou, já confirmado.
-- 3) motivo 'nao_existe' quando esse número nunca foi código (ex.: alguém comentou "4100" respondendo um
--    desafio): o robô fica quieto em vez de responder "venceu".
-- Código trocado por um novo ou já usado (ate = hora da troca/uso) não vale depois disso.
drop function if exists jogo_usar_codigo_arroba(text, text);
create or replace function jogo_usar_codigo_arroba(p_codigo text, p_username text,
  p_quando timestamptz default now(), p_via text default 'dm')
returns jsonb language plpgsql security definer set search_path = public as $$
declare c codigos_arroba_jogo; h text := lower(trim(both '@' from coalesce(p_username, '')));
        q timestamptz := least(coalesce(p_quando, now()), now());
begin
  if h = '' then return jsonb_build_object('ok', false, 'motivo', 'sem_handle'); end if;
  select * into c from codigos_arroba_jogo
   where codigo = p_codigo and criado_em <= q + interval '2 minutes' and ate > q
     and q < criado_em + interval '24 hours'
   order by (arroba = h) desc, criado_em desc limit 1;
  if c is null then
    if exists (select 1 from codigos_arroba_jogo where codigo = p_codigo and criado_em > now() - interval '7 days')
      then return jsonb_build_object('ok', false, 'motivo', 'vencido');
      else return jsonb_build_object('ok', false, 'motivo', 'nao_existe');
    end if;
  end if;
  if c.arroba <> h and not (p_via = 'dm' and q < c.criado_em + interval '1 hour') then
    return jsonb_build_object('ok', false, 'motivo', 'outro_handle', 'handle', c.arroba);
  end if;
  -- o @ confirmado é de uma conta só: tira o selo de quem tinha o mesmo @
  update contas_jogo set arroba_confirmado = false where arroba = h and email <> c.email;
  update contas_jogo set arroba = h, arroba_confirmado = true where email = c.email;
  update codigos_arroba_jogo set ate = least(ate, now()) where email = c.email and ate > now();
  return jsonb_build_object('ok', true, 'handle', h, 'trocou', c.arroba <> h, 'digitado', c.arroba);
end $$;
revoke all on function jogo_usar_codigo_arroba(text, text, timestamptz, text) from public, anon, authenticated;

-- 24 h sem mexer na função jogo-perfil (ela grava ate = agora + 30 min): o banco estica na hora de gravar.
create or replace function codigo_arroba_24h() returns trigger language plpgsql as $$
begin
  if new.ate > now() then new.ate := greatest(new.ate, new.criado_em + interval '24 hours'); end if;
  return new;
end $$;
drop trigger if exists codigo_arroba_24h on codigos_arroba_jogo;
create trigger codigo_arroba_24h before insert on codigos_arroba_jogo for each row execute function codigo_arroba_24h();
-- códigos das últimas 24 h que venceram sozinhos (não foram usados nem trocados) voltam a valer até completar 24 h
update codigos_arroba_jogo set ate = criado_em + interval '24 hours'
 where ate = criado_em + interval '30 minutes' and criado_em > now() - interval '24 hours';
