-- Tarefas com link: "Iniciar" abre o link e passa a tarefa pra Em progresso;
-- chegar ao fim do capítulo do link conclui a tarefa e pede o feedback.

alter table public.admin_tarefas add column if not exists link text;
alter table public.admin_tarefas add column if not exists feedback text;

create or replace function public.admin_tarefa_salvar(p jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare novo_id bigint; st text := coalesce(p->>'status', 'fazer');
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  if coalesce(trim(p->>'titulo'), '') = '' then raise exception 'titulo vazio'; end if;
  if (p->>'id') is null then
    insert into public.admin_tarefas (titulo, descricao, para, pedido_por, status, prioridade, prazo, link, feedback, feito_em)
    values (left(p->>'titulo', 160), left(p->>'descricao', 2000), nullif(p->>'para', '')::uuid, auth.uid(),
            st, coalesce(p->>'prioridade', 'normal'), nullif(p->>'prazo', '')::date,
            nullif(left(p->>'link', 300), ''), left(p->>'feedback', 8000),
            case when st = 'feito' then now() end)
    returning id into novo_id;
  else
    update public.admin_tarefas set
      titulo = left(p->>'titulo', 160), descricao = left(p->>'descricao', 2000),
      para = nullif(p->>'para', '')::uuid, status = st,
      prioridade = coalesce(p->>'prioridade', prioridade), prazo = nullif(p->>'prazo', '')::date,
      link = nullif(left(p->>'link', 300), ''), feedback = left(p->>'feedback', 8000),
      feito_em = case when st = 'feito' then coalesce(feito_em, now()) end,
      atualizado_em = now()
    where id = (p->>'id')::bigint
    returning id into novo_id;
  end if;
  return novo_id;
end $$;

-- Fim do capítulo: conclui a tarefa aberta de quem leu (dele ou dos dois) com esse link.
-- Devolve a tarefa concluída, ou null se não havia nenhuma.
create or replace function public.admin_tarefa_concluir_link(p_link text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t public.admin_tarefas;
begin
  if not public.eh_admin() then return null; end if;
  update public.admin_tarefas set status = 'feito', feito_em = now(), atualizado_em = now()
  where id = (select id from public.admin_tarefas
              where link = p_link and status <> 'feito' and (para is null or para = auth.uid())
              order by status desc, criado_em limit 1)
  returning * into t;
  return case when t.id is null then null else jsonb_build_object('id', t.id, 'titulo', t.titulo) end;
end $$;

create or replace function public.admin_tarefa_feedback(p_id bigint, p_texto text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  update public.admin_tarefas set feedback = left(p_texto, 8000), atualizado_em = now() where id = p_id;
end $$;

grant execute on function public.admin_tarefa_concluir_link(text) to authenticated;
grant execute on function public.admin_tarefa_feedback(bigint, text) to authenticated;
