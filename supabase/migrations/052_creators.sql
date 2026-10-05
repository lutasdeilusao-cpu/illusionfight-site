-- ════════════════════════════════════════════════════════════════
-- 052 — Programa Creator
--
-- Tag de creator no perfil, com validade. Só admin concede (RPC) ou o
-- Supabase direto; o usuário nunca se marca sozinho. O próprio creator
-- grava os interesses e o aceite dos termos.
-- Pode rodar de novo sem erro.
-- ════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists is_creator boolean not null default false;
alter table public.profiles add column if not exists creator_ate date;
alter table public.profiles add column if not exists creator_canal text;
alter table public.profiles add column if not exists creator_interesses text[] not null default '{}';
alter table public.profiles add column if not exists creator_termos_em timestamptz;

-- ── Trava: is_creator / creator_ate / creator_canal só mudam por admin ──
create or replace function public.proteger_creator()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'service_role' or auth.uid() is null
     or coalesce(current_setting('ldi.creator_admin', true), '') = '1' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.is_creator := false;
    new.creator_ate := null;
    new.creator_canal := null;
  else
    new.is_creator := old.is_creator;
    new.creator_ate := old.creator_ate;
    new.creator_canal := old.creator_canal;
  end if;
  return new;
end $$;

drop trigger if exists proteger_creator on public.profiles;
create trigger proteger_creator
  before insert or update on public.profiles
  for each row execute function public.proteger_creator();

-- ── Admin concede / renova / tira ──
-- p_meses = 0 tira a tag. p_meses null = sem validade.
create or replace function public.admin_definir_creator(p_email text, p_meses int, p_canal text default null)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_ate date;
begin
  if not public.eh_admin() then
    raise exception 'sem permissao';
  end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then
    return json_build_object('ok', false, 'erro', 'conta_nao_encontrada');
  end if;
  v_ate := case when p_meses is null then null else (current_date + make_interval(months => p_meses))::date end;
  perform set_config('ldi.creator_admin', '1', true);
  insert into public.profiles (id, is_creator, creator_ate, creator_canal)
  values (v_id, coalesce(p_meses, 1) > 0, v_ate, nullif(trim(p_canal), ''))
  on conflict (id) do update set
    is_creator = coalesce(p_meses, 1) > 0,
    creator_ate = case when coalesce(p_meses, 1) > 0 then v_ate else null end,
    creator_canal = coalesce(nullif(trim(p_canal), ''), public.profiles.creator_canal);
  perform set_config('ldi.creator_admin', '', true);
  return json_build_object('ok', true, 'ate', v_ate);
end $$;

-- ── Admin lista os creators ──
create or replace function public.admin_listar_creators()
returns table (email text, nome text, canal text, ate date, interesses text[], termos_em timestamptz, ativo boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then
    raise exception 'sem permissao';
  end if;
  return query
    select u.email::text, p.nome::text, p.creator_canal, p.creator_ate, p.creator_interesses, p.creator_termos_em,
           (p.creator_ate is null or p.creator_ate >= current_date)
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.is_creator
    order by p.creator_ate nulls first;
end $$;

revoke all on function public.admin_definir_creator(text, int, text) from public, anon;
revoke all on function public.admin_listar_creators() from public, anon;
grant execute on function public.admin_definir_creator(text, int, text) to authenticated;
grant execute on function public.admin_listar_creators() to authenticated;
