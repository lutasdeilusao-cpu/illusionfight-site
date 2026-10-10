-- ════════════════════════════════════════════════════════════════
-- 053 — Convite de creator
--
-- O admin gera um link (/creators?convite=CODIGO). Quem abre o link e
-- entra (ou cria a conta) resgata o convite e vira creator sozinho.
-- O painel acompanha cada convite: se o link foi aberto, quem criou a
-- conta e o que essa conta acessou (painel_eventos).
-- Pode rodar de novo sem erro.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.creator_convites (
  codigo     text primary key,
  canal      text,
  meses      int,                       -- null = sem prazo
  criado_em  timestamptz not null default now(),
  usado_por  uuid references auth.users(id) on delete set null,
  usado_em   timestamptz
);
alter table public.creator_convites enable row level security;
-- sem policy: só as funções abaixo leem e escrevem

-- ── Admin gera um convite ──
create or replace function public.admin_criar_convite(p_canal text, p_meses int)
returns text language plpgsql security definer set search_path = public as $$
declare v_codigo text;
begin
  if not public.eh_admin() then raise exception 'sem permissao'; end if;
  v_codigo := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
  insert into public.creator_convites (codigo, canal, meses) values (v_codigo, nullif(trim(p_canal), ''), p_meses);
  return v_codigo;
end $$;

-- ── Quem está logado resgata o convite ──
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
  if c.usado_por is not null and c.usado_por <> v_uid then
    return json_build_object('ok', false, 'erro', 'usado');
  end if;
  if c.usado_por is null then
    update public.creator_convites set usado_por = v_uid, usado_em = now() where codigo = c.codigo;
  end if;
  v_ate := case when c.meses is null then null else (current_date + make_interval(months => c.meses))::date end;
  perform set_config('ldi.creator_admin', '1', true);
  insert into public.profiles (id, is_creator, creator_ate, creator_canal)
  values (v_uid, true, v_ate, c.canal)
  on conflict (id) do update set
    is_creator = true,
    creator_ate = case when public.profiles.is_creator and public.profiles.creator_ate is null then null
                       else greatest(coalesce(public.profiles.creator_ate, v_ate), v_ate) end,
    creator_canal = coalesce(public.profiles.creator_canal, c.canal);
  perform set_config('ldi.creator_admin', '', true);
  return json_build_object('ok', true, 'ate', v_ate);
end $$;

-- ── Painel: cada convite, quem usou e o que acessou ──
create or replace function public.admin_listar_convites()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem permissao'; end if;
  return coalesce((
    select json_agg(x order by x.criado_em desc) from (
      select c.codigo, c.canal, c.meses, c.criado_em, c.usado_em,
        u.email::text as email,
        p.nome::text as nome,
        (select min(e.criado_em) from public.painel_eventos e
          where e.nome = 'creator_convite_aberto' and e.dados->>'convite' = c.codigo) as aberto_em,
        (select count(*) from public.painel_eventos e
          where e.nome = 'creator_convite_aberto' and e.dados->>'convite' = c.codigo) as aberturas,
        (select max(coalesce(e.visto_ate, e.criado_em)) from public.painel_eventos e
          where c.usado_por is not null and e.user_id = c.usado_por) as visto_em,
        coalesce((
          select json_agg(a order by a.ultimo desc) from (
            select e.rota, max(e.titulo) as titulo, sum(e.repeticoes)::int as vezes,
              max(coalesce(e.visto_ate, e.criado_em)) as ultimo,
              round(sum(extract(epoch from (coalesce(e.visto_ate, e.criado_em) - e.criado_em))))::int as segundos
            from public.painel_eventos e
            where c.usado_por is not null and e.user_id = c.usado_por and e.tipo = 'page'
            group by e.rota
            order by ultimo desc
            limit 60
          ) a
        ), '[]'::json) as acessos
      from public.creator_convites c
      left join auth.users u on u.id = c.usado_por
      left join public.profiles p on p.id = c.usado_por
    ) x
  ), '[]'::json);
end $$;

revoke all on function public.admin_criar_convite(text, int) from public, anon;
revoke all on function public.creator_resgatar_convite(text) from public, anon;
revoke all on function public.admin_listar_convites() from public, anon;
grant execute on function public.admin_criar_convite(text, int) to authenticated;
grant execute on function public.creator_resgatar_convite(text) to authenticated;
grant execute on function public.admin_listar_convites() to authenticated;
