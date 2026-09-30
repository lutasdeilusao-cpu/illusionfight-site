-- 046 — Log de depuração só das contas admin (Isaias, gramikgames, rafaelhoje1).
-- Tudo que um admin faz no jogo vira linha aqui, pra investigar bug estranho.
-- Conta comum nunca grava: o cliente nem liga a coleta e o RPC descarta em
-- silêncio quem não é admin. Tabela sem policy (igual painel_eventos): só as
-- funções SECURITY DEFINER escrevem e leem. Guarda 30 dias.

create table if not exists public.debug_logs (
  id         bigserial primary key,
  user_id    uuid not null,
  sessao     text not null,
  criado_em  timestamptz not null default now(),
  rota       text,
  tipo       text not null,
  dados      jsonb,
  versao     text
);
create index if not exists debug_logs_user_criado_idx on public.debug_logs (user_id, criado_em desc);
create index if not exists debug_logs_sessao_idx on public.debug_logs (sessao);
create index if not exists debug_logs_criado_idx on public.debug_logs (criado_em);
alter table public.debug_logs enable row level security;
revoke all on public.debug_logs from anon, authenticated;

create or replace function public.debug_log_registrar(lote jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_n integer;
begin
  if v_uid is null or not coalesce((select is_admin from public.profiles where id = v_uid), false) then
    return 0;
  end if;
  if lote is null or jsonb_typeof(lote) <> 'array' then return 0; end if;

  insert into public.debug_logs (user_id, sessao, criado_em, rota, tipo, dados, versao)
  select v_uid,
         left(coalesce(e->>'sessao', '?'), 80),
         coalesce(
           case when (e->>'em') ~ '^\d{4}-\d{2}-\d{2}T' then least((e->>'em')::timestamptz, now()) end,
           now()),
         left(e->>'rota', 300),
         left(coalesce(e->>'tipo', '?'), 80),
         case when length(coalesce(e->'dados', 'null'::jsonb)::text) > 8000
              then jsonb_build_object('truncado', left((e->'dados')::text, 8000))
              else e->'dados' end,
         left(e->>'versao', 60)
  from (select value e, ordinality o from jsonb_array_elements(lote) with ordinality) x
  where x.o <= 200 and jsonb_typeof(x.e) = 'object';
  get diagnostics v_n = row_count;

  -- Limpeza barata: tira até 1000 linhas vencidas por chamada.
  delete from public.debug_logs
  where id in (select id from public.debug_logs where criado_em < now() - interval '30 days' limit 1000);

  return v_n;
end $$;

create or replace function public.debug_log_ler(
  p_user uuid default null,
  p_sessao text default null,
  p_tipo text default null,
  p_desde timestamptz default null,
  p_limite int default 500)
returns table (id bigint, user_id uuid, nome text, email text, sessao text, criado_em timestamptz,
               rota text, tipo text, dados jsonb, versao text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false) then
    raise exception 'sem permissão';
  end if;
  return query
    select l.id, l.user_id, pr.nome::text, u.email::text, l.sessao, l.criado_em, l.rota, l.tipo, l.dados, l.versao
    from public.debug_logs l
    left join public.profiles pr on pr.id = l.user_id
    left join auth.users u on u.id = l.user_id
    where (p_user is null or l.user_id = p_user)
      and (p_sessao is null or l.sessao = p_sessao)
      and (p_tipo is null or l.tipo like p_tipo || '%')
      and (p_desde is null or l.criado_em >= p_desde)
    order by l.criado_em desc, l.id desc
    limit least(greatest(coalesce(p_limite, 500), 1), 5000);
end $$;

revoke all on function public.debug_log_registrar(jsonb) from public, anon;
revoke all on function public.debug_log_ler(uuid, text, text, timestamptz, int) from public, anon;
grant execute on function public.debug_log_registrar(jsonb) to authenticated;
grant execute on function public.debug_log_ler(uuid, text, text, timestamptz, int) to authenticated;
