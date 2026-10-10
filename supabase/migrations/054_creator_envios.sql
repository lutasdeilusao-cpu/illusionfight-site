-- ════════════════════════════════════════════════════════════════
-- 054 — Conteúdo dos creators
--
-- O creator (conta com a tag ativa) envia o link do conteúdo que fez
-- sobre o projeto. O envio cai na fila do painel; o admin aprova ou
-- recusa. O aprovado aparece na vitrine pública /creators/destaques.
-- Pode rodar de novo sem erro.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.creator_envios (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  nome         text not null,
  arroba       text,
  rede         text,
  link         text not null,
  status       text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado')),
  destaque     boolean not null default false,
  criado_em    timestamptz not null default now(),
  decidido_em  timestamptz
);
create index if not exists creator_envios_status on public.creator_envios (status, decidido_em desc);
alter table public.creator_envios enable row level security;
-- sem policy: só as funções abaixo leem e escrevem

create or replace function public.creator_pode_enviar()
returns boolean language sql stable security definer set search_path = public as $$
  select public.eh_admin() or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_creator and (p.creator_ate is null or p.creator_ate >= current_date))
$$;

-- ── O creator envia um link ──
create or replace function public.creator_enviar(p_nome text, p_arroba text, p_rede text, p_link text)
returns json language plpgsql security definer set search_path = public as $$
declare v_link text := trim(p_link);
begin
  if auth.uid() is null or not public.creator_pode_enviar() then
    return json_build_object('ok', false, 'erro', 'sem_permissao');
  end if;
  if v_link !~* '^https?://[^\s]+\.[^\s]+$' or length(v_link) > 500 then
    return json_build_object('ok', false, 'erro', 'link_invalido');
  end if;
  if coalesce(trim(p_nome), '') = '' then
    return json_build_object('ok', false, 'erro', 'sem_nome');
  end if;
  if (select count(*) from public.creator_envios where user_id = auth.uid() and status = 'pendente') >= 20 then
    return json_build_object('ok', false, 'erro', 'muitos_pendentes');
  end if;
  if exists (select 1 from public.creator_envios where link = v_link) then
    return json_build_object('ok', false, 'erro', 'repetido');
  end if;
  insert into public.creator_envios (user_id, nome, arroba, rede, link)
  values (auth.uid(), left(trim(p_nome), 80), left(nullif(trim(p_arroba), ''), 60), left(nullif(trim(p_rede), ''), 30), v_link);
  return json_build_object('ok', true);
end $$;

-- ── O creator vê os próprios envios ──
create or replace function public.creator_meus_envios()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id', id, 'link', link, 'rede', rede, 'status', status, 'criado_em', criado_em)
    order by criado_em desc), '[]'::json)
  from public.creator_envios where user_id = auth.uid()
$$;

-- ── Vitrine pública: só o aprovado ──
create or replace function public.creator_destaques()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id', id, 'nome', nome, 'arroba', arroba, 'rede', rede, 'link', link,
    'destaque', destaque, 'data', decidido_em) order by destaque desc, decidido_em desc), '[]'::json)
  from public.creator_envios where status = 'aprovado'
$$;

-- ── Painel: fila e decisão ──
create or replace function public.admin_listar_envios()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem permissao'; end if;
  return coalesce((
    select json_agg(json_build_object('id', e.id, 'nome', e.nome, 'arroba', e.arroba, 'rede', e.rede, 'link', e.link,
      'status', e.status, 'destaque', e.destaque, 'criado_em', e.criado_em, 'email', u.email)
      order by (e.status = 'pendente') desc, e.criado_em desc)
    from public.creator_envios e left join auth.users u on u.id = e.user_id
  ), '[]'::json);
end $$;

create or replace function public.admin_decidir_envio(p_id bigint, p_status text, p_destaque boolean default false)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem permissao'; end if;
  if p_status not in ('pendente', 'aprovado', 'recusado') then
    return json_build_object('ok', false, 'erro', 'status_invalido');
  end if;
  update public.creator_envios
    set status = p_status, destaque = coalesce(p_destaque, false) and p_status = 'aprovado',
        decidido_em = case when p_status = 'pendente' then null else now() end
    where id = p_id;
  return json_build_object('ok', found);
end $$;

revoke all on function public.creator_pode_enviar() from public, anon;
revoke all on function public.creator_enviar(text, text, text, text) from public, anon;
revoke all on function public.creator_meus_envios() from public, anon;
revoke all on function public.admin_listar_envios() from public, anon;
revoke all on function public.admin_decidir_envio(bigint, text, boolean) from public, anon;
grant execute on function public.creator_pode_enviar() to authenticated;
grant execute on function public.creator_enviar(text, text, text, text) to authenticated;
grant execute on function public.creator_meus_envios() to authenticated;
grant execute on function public.admin_listar_envios() to authenticated;
grant execute on function public.admin_decidir_envio(bigint, text, boolean) to authenticated;
grant execute on function public.creator_destaques() to anon, authenticated;
