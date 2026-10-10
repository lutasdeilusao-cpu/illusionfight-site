-- ════════════════════════════════════════════════════════════════
-- 055 — Convite de creator que vale pra várias contas
--
-- Convite `multiplo` é um link só, mandado pra vários creators: cada
-- conta que entra por ele vira creator. Todo resgate fica em
-- creator_convite_usos, e o painel mostra cada conta com o que acessou.
-- Pode rodar de novo sem erro.
-- ════════════════════════════════════════════════════════════════

alter table public.creator_convites add column if not exists multiplo boolean not null default false;

create table if not exists public.creator_convite_usos (
  codigo    text not null references public.creator_convites(codigo) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  usado_em  timestamptz not null default now(),
  primary key (codigo, user_id)
);
alter table public.creator_convite_usos enable row level security;

insert into public.creator_convite_usos (codigo, user_id, usado_em)
select codigo, usado_por, coalesce(usado_em, now()) from public.creator_convites where usado_por is not null
on conflict do nothing;

drop function if exists public.admin_criar_convite(text, int);
create or replace function public.admin_criar_convite(p_canal text, p_meses int, p_multiplo boolean default false)
returns text language plpgsql security definer set search_path = public as $$
declare v_codigo text;
begin
  if not public.eh_admin() then raise exception 'sem permissao'; end if;
  v_codigo := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
  insert into public.creator_convites (codigo, canal, meses, multiplo)
  values (v_codigo, nullif(trim(p_canal), ''), p_meses, coalesce(p_multiplo, false));
  return v_codigo;
end $$;

create or replace function public.creator_resgatar_convite(p_codigo text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  c public.creator_convites;
  v_ate date;
begin
  if v_uid is null then return json_build_object('ok', false, 'erro', 'sem_login'); end if;
  select * into c from public.creator_convites where codigo = trim(p_codigo) for update;
  if not found then return json_build_object('ok', false, 'erro', 'invalido'); end if;
  if not c.multiplo and c.usado_por is not null and c.usado_por <> v_uid then
    return json_build_object('ok', false, 'erro', 'usado');
  end if;
  if not c.multiplo and c.usado_por is null then
    update public.creator_convites set usado_por = v_uid, usado_em = now() where codigo = c.codigo;
  end if;
  insert into public.creator_convite_usos (codigo, user_id) values (c.codigo, v_uid) on conflict do nothing;
  v_ate := case when c.meses is null then null else (current_date + make_interval(months => c.meses))::date end;
  perform set_config('ldi.creator_admin', '1', true);
  insert into public.profiles (id, is_creator, creator_ate, creator_canal)
  values (v_uid, true, v_ate, case when c.multiplo then null else c.canal end)
  on conflict (id) do update set
    is_creator = true,
    creator_ate = case when public.profiles.is_creator and public.profiles.creator_ate is null then null
                       else greatest(coalesce(public.profiles.creator_ate, v_ate), v_ate) end,
    creator_canal = coalesce(public.profiles.creator_canal, case when c.multiplo then null else c.canal end);
  perform set_config('ldi.creator_admin', '', true);
  return json_build_object('ok', true, 'ate', v_ate);
end $$;

-- Cada convite com as contas que entraram por ele e o que cada uma acessou.
create or replace function public.admin_listar_convites()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem permissao'; end if;
  return coalesce((
    select json_agg(x order by x.criado_em desc) from (
      select c.codigo, c.canal, c.meses, c.multiplo, c.criado_em,
        (select min(e.criado_em) from public.painel_eventos e
          where e.nome = 'creator_convite_aberto' and e.dados->>'convite' = c.codigo) as aberto_em,
        (select count(*) from public.painel_eventos e
          where e.nome = 'creator_convite_aberto' and e.dados->>'convite' = c.codigo) as aberturas,
        coalesce((
          select json_agg(json_build_object(
            'email', u.email, 'nome', p.nome, 'usado_em', us.usado_em,
            'visto_em', (select max(coalesce(e.visto_ate, e.criado_em)) from public.painel_eventos e where e.user_id = us.user_id),
            'acessos', coalesce((
              select json_agg(a order by a.ultimo desc) from (
                select e.rota, max(e.titulo) as titulo, sum(e.repeticoes)::int as vezes,
                  max(coalesce(e.visto_ate, e.criado_em)) as ultimo,
                  round(sum(extract(epoch from (coalesce(e.visto_ate, e.criado_em) - e.criado_em))))::int as segundos
                from public.painel_eventos e
                where e.user_id = us.user_id and e.tipo = 'page'
                group by e.rota order by ultimo desc limit 60
              ) a), '[]'::json)
          ) order by us.usado_em)
          from public.creator_convite_usos us
          left join auth.users u on u.id = us.user_id
          left join public.profiles p on p.id = us.user_id
          where us.codigo = c.codigo
        ), '[]'::json) as contas
      from public.creator_convites c
    ) x
  ), '[]'::json);
end $$;

revoke all on function public.admin_criar_convite(text, int, boolean) from public, anon;
grant execute on function public.admin_criar_convite(text, int, boolean) to authenticated;
