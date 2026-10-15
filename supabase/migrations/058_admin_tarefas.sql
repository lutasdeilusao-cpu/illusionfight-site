-- Tarefas da Área do Administrador: kanban (a fazer / em progresso / feito) entre os admins.
-- A tabela não tem policy: só as funções abaixo leem e escrevem, e todas conferem eh_admin().

create table if not exists public.admin_tarefas (
  id            bigserial primary key,
  titulo        text not null,
  descricao     text,
  para          uuid references public.profiles(id) on delete set null,  -- null = os dois
  pedido_por    uuid references public.profiles(id) on delete set null,
  status        text not null default 'fazer' check (status in ('fazer', 'progresso', 'feito')),
  prioridade    text not null default 'normal' check (prioridade in ('baixa', 'normal', 'alta')),
  prazo         date,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  feito_em      timestamptz
);
alter table public.admin_tarefas enable row level security;
create index if not exists admin_tarefas_status_idx on public.admin_tarefas (status, prazo);

-- Quem divide as tarefas: os dois sócios (Isaias e Rafael).
create or replace function public.admin_pessoas()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'nome', p.nome) order by p.nome)
                   from public.profiles p where p.is_admin and p.id in ('2ebda448-d80e-40c4-878c-6133c2e425c3', '4d52c442-6343-4f15-9464-862beeac7bf4')), '[]'::jsonb);
end $$;

create or replace function public.admin_tarefas_listar()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(to_jsonb(t) order by t.status, t.prazo nulls last, t.criado_em)
                   from public.admin_tarefas t
                   where t.status <> 'feito' or t.feito_em > now() - interval '60 days'), '[]'::jsonb);
end $$;

-- Cria (sem id) ou atualiza (com id). Quem pediu é sempre quem criou.
create or replace function public.admin_tarefa_salvar(p jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare novo_id bigint; st text := coalesce(p->>'status', 'fazer');
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  if coalesce(trim(p->>'titulo'), '') = '' then raise exception 'titulo vazio'; end if;
  if (p->>'id') is null then
    insert into public.admin_tarefas (titulo, descricao, para, pedido_por, status, prioridade, prazo, feito_em)
    values (left(p->>'titulo', 160), left(p->>'descricao', 2000), nullif(p->>'para', '')::uuid, auth.uid(),
            st, coalesce(p->>'prioridade', 'normal'), nullif(p->>'prazo', '')::date,
            case when st = 'feito' then now() end)
    returning id into novo_id;
  else
    update public.admin_tarefas set
      titulo = left(p->>'titulo', 160), descricao = left(p->>'descricao', 2000),
      para = nullif(p->>'para', '')::uuid, status = st,
      prioridade = coalesce(p->>'prioridade', prioridade), prazo = nullif(p->>'prazo', '')::date,
      feito_em = case when st = 'feito' then coalesce(feito_em, now()) end,
      atualizado_em = now()
    where id = (p->>'id')::bigint
    returning id into novo_id;
  end if;
  return novo_id;
end $$;

create or replace function public.admin_tarefa_mover(p_id bigint, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  update public.admin_tarefas set status = p_status, atualizado_em = now(),
    feito_em = case when p_status = 'feito' then coalesce(feito_em, now()) end
  where id = p_id;
end $$;

create or replace function public.admin_tarefa_apagar(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  delete from public.admin_tarefas where id = p_id;
end $$;

grant execute on function public.admin_pessoas() to authenticated;
grant execute on function public.admin_tarefas_listar() to authenticated;
grant execute on function public.admin_tarefa_salvar(jsonb) to authenticated;
grant execute on function public.admin_tarefa_mover(bigint, text) to authenticated;
grant execute on function public.admin_tarefa_apagar(bigint) to authenticated;
