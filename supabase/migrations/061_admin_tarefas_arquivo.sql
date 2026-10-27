-- Arquivo das tarefas: o botão "Arquivar" tira a tarefa do quadro; ela continua
-- consultável na aba Arquivo e volta ao quadro quando é movida de novo.
alter table public.admin_tarefas add column if not exists arquivada boolean not null default false;

-- Tarefas feitas há mais de uma semana entram já arquivadas.
update public.admin_tarefas set arquivada = true
where status = 'feito' and feito_em < now() - interval '7 days' and not arquivada;

create or replace function public.admin_tarefas_listar()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(to_jsonb(t) order by t.status, t.prazo nulls last, t.criado_em)
                   from public.admin_tarefas t
                   where t.arquivada or t.status <> 'feito' or t.feito_em > now() - interval '60 days'), '[]'::jsonb);
end $$;

create or replace function public.admin_tarefa_mover(p_id bigint, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  update public.admin_tarefas set status = p_status, arquivada = false, atualizado_em = now(),
    feito_em = case when p_status = 'feito' then coalesce(feito_em, now()) end
  where id = p_id;
end $$;

create or replace function public.admin_tarefa_arquivar(p_id bigint, p_arquivar boolean default true)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  update public.admin_tarefas set arquivada = p_arquivar, atualizado_em = now() where id = p_id;
end $$;

revoke all on function public.admin_tarefa_arquivar(bigint, boolean) from public, anon;
grant execute on function public.admin_tarefa_arquivar(bigint, boolean) to authenticated;
