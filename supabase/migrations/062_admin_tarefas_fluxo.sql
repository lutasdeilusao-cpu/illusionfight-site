-- Tarefas da Área do Administrador: fluxo a fazer → em progresso → em teste → feito,
-- com revisor (quem aprova o teste) e histórico de eventos (comentários e mudanças de status).
-- Como antes, a tabela não tem policy: só as funções abaixo leem e escrevem, e todas conferem eh_admin().

alter table public.admin_tarefas drop constraint if exists admin_tarefas_status_check;
alter table public.admin_tarefas add constraint admin_tarefas_status_check
  check (status in ('fazer', 'progresso', 'teste', 'feito'));
alter table public.admin_tarefas add column if not exists revisor uuid references public.profiles(id) on delete set null;

create table if not exists public.admin_tarefa_eventos (
  id         bigserial primary key,
  tarefa_id  bigint not null references public.admin_tarefas(id) on delete cascade,
  autor      uuid references public.profiles(id) on delete set null,
  tipo       text not null check (tipo in ('comentario', 'status')),
  texto      text,
  de         text,
  para       text,
  criado_em  timestamptz not null default now()
);
alter table public.admin_tarefa_eventos enable row level security;
create index if not exists admin_tarefa_eventos_tarefa_idx on public.admin_tarefa_eventos (tarefa_id, criado_em);

-- O feedback que já existia vira o primeiro comentário da tarefa, escrito por quem fez a tarefa.
insert into public.admin_tarefa_eventos (tarefa_id, autor, tipo, texto, criado_em)
select t.id, coalesce(t.para, t.pedido_por), 'comentario', t.feedback, t.atualizado_em
from public.admin_tarefas t
where coalesce(trim(t.feedback), '') <> ''
  and not exists (select 1 from public.admin_tarefa_eventos e where e.tarefa_id = t.id and e.tipo = 'comentario');

-- Revisor das tarefas antigas: quem pediu, quando é outra pessoa.
update public.admin_tarefas set revisor = pedido_por
where revisor is null and pedido_por is not null and (para is null or para <> pedido_por);

create or replace function public.admin_tarefas_listar()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((
    select jsonb_agg(to_jsonb(t) || jsonb_build_object(
             'comentarios', (select count(*) from public.admin_tarefa_eventos e where e.tarefa_id = t.id and e.tipo = 'comentario'))
           order by t.criado_em desc)
    from public.admin_tarefas t
    where t.arquivada or t.status <> 'feito' or t.feito_em > now() - interval '60 days'), '[]'::jsonb);
end $$;

create or replace function public.admin_tarefa_eventos(p_id bigint)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(to_jsonb(e) order by e.criado_em)
                   from public.admin_tarefa_eventos e where e.tarefa_id = p_id), '[]'::jsonb);
end $$;

-- Cria (sem id) ou atualiza (com id). Quem pediu é sempre quem criou.
create or replace function public.admin_tarefa_salvar(p jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare novo_id bigint; st text := coalesce(p->>'status', 'fazer'); antigo text;
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  if coalesce(trim(p->>'titulo'), '') = '' then raise exception 'titulo vazio'; end if;
  if (p->>'id') is null then
    insert into public.admin_tarefas (titulo, descricao, para, revisor, pedido_por, status, prioridade, prazo, link, feito_em)
    values (left(p->>'titulo', 160), left(p->>'descricao', 8000), nullif(p->>'para', '')::uuid, nullif(p->>'revisor', '')::uuid,
            auth.uid(), st, coalesce(p->>'prioridade', 'normal'), nullif(p->>'prazo', '')::date, nullif(p->>'link', ''),
            case when st = 'feito' then now() end)
    returning id into novo_id;
    insert into public.admin_tarefa_eventos (tarefa_id, autor, tipo, para) values (novo_id, auth.uid(), 'status', st);
  else
    select status into antigo from public.admin_tarefas where id = (p->>'id')::bigint;
    update public.admin_tarefas set
      titulo = left(p->>'titulo', 160), descricao = left(p->>'descricao', 8000),
      para = nullif(p->>'para', '')::uuid, revisor = nullif(p->>'revisor', '')::uuid, status = st,
      prioridade = coalesce(p->>'prioridade', prioridade), prazo = nullif(p->>'prazo', '')::date,
      link = nullif(p->>'link', ''),
      feito_em = case when st = 'feito' then coalesce(feito_em, now()) end,
      atualizado_em = now()
    where id = (p->>'id')::bigint
    returning id into novo_id;
    if antigo is distinct from st then
      insert into public.admin_tarefa_eventos (tarefa_id, autor, tipo, de, para) values (novo_id, auth.uid(), 'status', antigo, st);
    end if;
  end if;
  return novo_id;
end $$;

-- Muda o status e registra no histórico; o texto (opcional) vira comentário junto, como no "reprovar".
drop function if exists public.admin_tarefa_mover(bigint, text);
create or replace function public.admin_tarefa_mover(p_id bigint, p_status text, p_texto text default null)
returns void language plpgsql security definer set search_path = public as $$
declare antigo text;
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  select status into antigo from public.admin_tarefas where id = p_id;
  update public.admin_tarefas set status = p_status, arquivada = false, atualizado_em = now(),
    feito_em = case when p_status = 'feito' then coalesce(feito_em, now()) end
  where id = p_id;
  if antigo is distinct from p_status then
    insert into public.admin_tarefa_eventos (tarefa_id, autor, tipo, de, para, texto)
    values (p_id, auth.uid(), 'status', antigo, p_status, nullif(trim(coalesce(p_texto, '')), ''));
  end if;
end $$;

create or replace function public.admin_tarefa_comentar(p_id bigint, p_texto text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  if coalesce(trim(p_texto), '') = '' then return; end if;
  insert into public.admin_tarefa_eventos (tarefa_id, autor, tipo, texto) values (p_id, auth.uid(), 'comentario', left(p_texto, 8000));
  update public.admin_tarefas set atualizado_em = now() where id = p_id;
end $$;

-- O feedback do fim de capítulo agora é um comentário.
create or replace function public.admin_tarefa_feedback(p_id bigint, p_texto text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_tarefa_comentar(p_id, p_texto);
end $$;

-- Fim do capítulo: quem leu terminou o trabalho, então a tarefa vai pra teste (o revisor confere).
create or replace function public.admin_tarefa_concluir_link(p_link text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t public.admin_tarefas;
begin
  if not public.eh_admin() then return null; end if;
  select * into t from public.admin_tarefas
  where link = p_link and status in ('fazer', 'progresso') and not arquivada and (para is null or para = auth.uid())
  order by status desc, criado_em limit 1;
  if t.id is null then return null; end if;
  perform public.admin_tarefa_mover(t.id, 'teste');
  return jsonb_build_object('id', t.id, 'titulo', t.titulo);
end $$;

revoke all on function public.admin_tarefa_eventos(bigint) from public, anon;
revoke all on function public.admin_tarefa_mover(bigint, text, text) from public, anon;
revoke all on function public.admin_tarefa_comentar(bigint, text) from public, anon;
grant execute on function public.admin_tarefas_listar() to authenticated;
grant execute on function public.admin_tarefa_eventos(bigint) to authenticated;
grant execute on function public.admin_tarefa_salvar(jsonb) to authenticated;
grant execute on function public.admin_tarefa_mover(bigint, text, text) to authenticated;
grant execute on function public.admin_tarefa_comentar(bigint, text) to authenticated;
grant execute on function public.admin_tarefa_feedback(bigint, text) to authenticated;
grant execute on function public.admin_tarefa_concluir_link(text) to authenticated;
