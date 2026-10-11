-- ════════════════════════════════════════════════════════════════
-- 056 — Quem vem pela demo da Steam
--
-- 1. profiles.origem_cadastro: 'steam' quando a conta nasceu dentro da
--    demo, 'web' no resto. Vem do signUp (data.origem).
-- 2. profiles.steam_primeiro_em / steam_visto_em: a conta já entrou pela
--    demo (e quando foi a última vez). Marcado pelo próprio site via
--    marcar_acesso_steam().
-- 3. painel_steam: resumo da demo para o painel (só admin).
-- Rodar inteiro no SQL Editor do Supabase. Pode rodar de novo sem erro.
-- ════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists origem_cadastro text not null default 'web';
alter table public.profiles add column if not exists steam_primeiro_em timestamptz;
alter table public.profiles add column if not exists steam_visto_em timestamptz;

alter table public.profiles drop constraint if exists profiles_origem_cadastro_check;
alter table public.profiles add constraint profiles_origem_cadastro_check check (origem_cadastro in ('web', 'steam'));

-- Ninguém muda a própria origem nem as datas da Steam por update direto:
-- só o cadastro (trigger abaixo) e marcar_acesso_steam() escrevem.
create or replace function public.proteger_origem_steam()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'service_role' or auth.uid() is null
     or coalesce(current_setting('ldi.steam_marca', true), '') = '1' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.origem_cadastro := old.origem_cadastro;
    new.steam_primeiro_em := old.steam_primeiro_em;
    new.steam_visto_em := old.steam_visto_em;
  end if;
  return new;
end $$;

drop trigger if exists proteger_origem_steam on public.profiles;
create trigger proteger_origem_steam
  before update on public.profiles
  for each row execute function public.proteger_origem_steam();

-- Cadastro: grava a origem que o site mandou no signUp.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_origem text := case when NEW.raw_user_meta_data->>'origem' = 'steam' then 'steam' else 'web' end;
begin
  begin
    insert into public.profiles (id, nome, telefone, country_code, locale, origem_cadastro, steam_primeiro_em, steam_visto_em)
    values (
      NEW.id,
      coalesce(nullif(NEW.raw_user_meta_data->>'nome', ''), split_part(NEW.email, '@', 1), 'Jogador'),
      '',
      coalesce(nullif(NEW.raw_user_meta_data->>'pais', ''), 'BR'),
      coalesce(nullif(NEW.raw_user_meta_data->>'locale', ''), 'en'),
      v_origem,
      case when v_origem = 'steam' then now() end,
      case when v_origem = 'steam' then now() end
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_auth_user falhou para %: %', NEW.id, SQLERRM;
  end;
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- O site chama ao detectar sessão logada dentro da demo.
create or replace function public.marcar_acesso_steam()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  perform set_config('ldi.steam_marca', '1', true);
  update public.profiles
     set steam_primeiro_em = coalesce(steam_primeiro_em, now()),
         steam_visto_em = now()
   where id = auth.uid();
end $$;

revoke all on function public.marcar_acesso_steam() from public;
grant execute on function public.marcar_acesso_steam() to authenticated;

-- Resumo para o painel.
create or replace function public.painel_steam(p_inicio timestamptz, p_fim timestamptz)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  r json;
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  with ev as (
    select * from public.painel_eventos
     where origem = 'steam' and criado_em >= p_inicio and criado_em < p_fim
  ), por_sessao as (
    select sessao,
           min(criado_em) as inicio,
           greatest(max(coalesce(visto_ate, criado_em)), max(criado_em)) as fim
      from ev group by sessao
  )
  select json_build_object(
    'sessoes', (select count(*) from por_sessao),
    'visitantes', (select count(distinct visitante) from ev),
    'minutos', (select coalesce(round(sum(extract(epoch from (fim - inicio))) / 60), 0) from por_sessao),
    'contas_criadas', (select count(*) from public.profiles p
                        join auth.users u on u.id = p.id
                       where p.origem_cadastro = 'steam' and u.created_at >= p_inicio and u.created_at < p_fim),
    'contas_criadas_total', (select count(*) from public.profiles where origem_cadastro = 'steam'),
    'contas_acessaram', (select count(*) from public.profiles where steam_visto_em >= p_inicio and steam_visto_em < p_fim),
    'versoes', (select coalesce(json_agg(x order by x.n desc), '[]'::json) from (
                  select coalesce(nullif(campanha, ''), '?') as versao, count(distinct sessao) as n
                    from ev group by 1) x),
    'rotas', (select coalesce(json_agg(x order by x.n desc), '[]'::json) from (
                select rota, count(distinct sessao) as n from ev where tipo = 'page'
                 group by rota order by n desc limit 12) x),
    'contas', (select coalesce(json_agg(x order by x.visto desc), '[]'::json) from (
                 select p.nome, u.email, p.origem_cadastro as origem, p.steam_primeiro_em as primeiro, p.steam_visto_em as visto
                   from public.profiles p join auth.users u on u.id = p.id
                  where p.steam_visto_em is not null
                  order by p.steam_visto_em desc limit 100) x)
  ) into r;
  return r;
end $$;

grant execute on function public.painel_steam(timestamptz, timestamptz) to authenticated;
