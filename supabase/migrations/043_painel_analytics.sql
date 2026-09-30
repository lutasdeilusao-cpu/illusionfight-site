-- ════════════════════════════════════════════════════════════════
-- 043 — Painel de administrador (analytics próprio, tempo real)
--
-- 1. Trava o is_admin: só o Supabase (service role / SQL Editor) muda.
--    Antes qualquer usuário podia se marcar admin no próprio perfil.
-- 2. painel_eventos: o site só ESCREVE (via painel_registrar), nunca lê.
-- 3. painel_dados: leitura agregada, só pra admin.
-- Rodar inteiro no SQL Editor do Supabase. Pode rodar de novo sem erro.
-- ════════════════════════════════════════════════════════════════

-- ── 1. is_admin protegido ──────────────────────────────────────
create or replace function public.proteger_is_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'service_role' or auth.uid() is null then
    return new; -- service role, SQL Editor, triggers internos
  end if;
  if tg_op = 'INSERT' then
    new.is_admin := false;
  elsif new.is_admin is distinct from old.is_admin then
    new.is_admin := old.is_admin;
  end if;
  return new;
end $$;

drop trigger if exists proteger_is_admin on public.profiles;
create trigger proteger_is_admin
  before insert or update on public.profiles
  for each row execute function public.proteger_is_admin();

create or replace function public.eh_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ── 2. Eventos ──────────────────────────────────────────────────
create table if not exists public.painel_eventos (
  id          bigserial primary key,
  criado_em   timestamptz not null default now(),
  visitante   text not null,
  sessao      text not null,
  user_id     uuid,
  tipo        text not null,          -- page | evento (o "ping" nunca vira linha)
  visto_ate   timestamptz,            -- até quando ficou nesse registro (os pings atualizam)
  repeticoes  integer not null default 1, -- mesmo evento seguido vira contador
  nome        text,                   -- nome do evento (sign_up, chapter_time...)
  rota        text,
  titulo      text,
  dados       jsonb,
  origem      text,
  midia       text,
  campanha    text,
  referrer    text,
  dispositivo text,                   -- celular | tablet | desktop
  sistema     text,                   -- Android 14, iOS 18.2, Windows...
  navegador   text,                   -- Chrome 131, Safari 18...
  modelo      text,                   -- SM-A576B, iPhone... (quando o navegador conta)
  tela        text,                   -- 412x915@2.6
  idioma      text,
  pais        text,
  regiao      text,
  cidade      text,
  novo        boolean default false   -- 1ª sessão desse visitante
);

alter table public.painel_eventos add column if not exists visto_ate timestamptz;
alter table public.painel_eventos add column if not exists repeticoes integer not null default 1;
alter table public.painel_eventos enable row level security;
-- sem policy nenhuma: ninguém lê nem escreve direto, só pelas funções abaixo

create index if not exists painel_eventos_criado_em on public.painel_eventos (criado_em desc);
create index if not exists painel_eventos_sessao on public.painel_eventos (sessao);

-- IPs que não contam (o do Isaias e equipe). O IP vem do cabeçalho da
-- requisição, nunca do cliente, e NÃO é gravado nos eventos.
create table if not exists public.painel_ips_excluidos (
  ip        text primary key,
  criado_em timestamptz not null default now(),
  por       uuid
);
alter table public.painel_ips_excluidos enable row level security;

create or replace function public.painel_ip_requisicao()
returns text language sql stable as $$
  select nullif(trim(split_part(coalesce(
    current_setting('request.headers', true)::json->>'cf-connecting-ip',
    current_setting('request.headers', true)::json->>'x-real-ip',
    current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1)), '')
$$;

-- O painel chama ao abrir: o IP de quem é admin passa a não contar.
create or replace function public.painel_excluir_meu_ip()
returns text language plpgsql security definer set search_path = public as $$
declare ip text := public.painel_ip_requisicao();
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  if ip is null then return null; end if;
  insert into public.painel_ips_excluidos (ip, por) values (ip, auth.uid()) on conflict (ip) do nothing;
  -- e some com o que esse IP já tinha gravado? não dá: o IP não fica nos eventos.
  return ip;
end $$;
grant execute on function public.painel_excluir_meu_ip() to authenticated;

-- Recebe um lote de eventos do site (até 50). user_id vem do token, nunca do
-- cliente. Admin não é gravado.
create or replace function public.painel_registrar(p_eventos jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  e jsonb;
  uid uuid := auth.uid();
  ult record;
begin
  if jsonb_typeof(p_eventos) <> 'array' then return; end if;
  if uid is not null and public.eh_admin() then return; end if;
  if exists (select 1 from public.painel_ips_excluidos where ip = public.painel_ip_requisicao()) then return; end if;
  for e in select * from jsonb_array_elements(p_eventos) limit 50 loop
    if coalesce(e->>'visitante', '') = '' or coalesce(e->>'sessao', '') = '' then continue; end if;
    if e->>'tipo' not in ('page', 'ping', 'evento') then continue; end if;
    -- Dado enxuto (Isaias, 30/09/2026): o ping não vira linha, só estica o
    -- "visto até" do último registro; o mesmo evento seguido (mesma página,
    -- mesmo nome, mesmos dados) vira contador. Saiu e voltou = linha nova.
    select id, tipo, nome, rota, dados into ult from public.painel_eventos
      where sessao = left(e->>'sessao', 64) order by criado_em desc, id desc limit 1;
    if e->>'tipo' = 'ping' then
      if found then update public.painel_eventos set visto_ate = now() where id = ult.id; end if;
      continue;
    end if;
    if found and ult.tipo = e->>'tipo' and coalesce(ult.nome, '') = coalesce(left(e->>'nome', 64), '')
       and coalesce(ult.rota, '') = coalesce(left(e->>'rota', 300), '')
       and (e->>'tipo' = 'page' or coalesce(ult.dados, '{}'::jsonb) = coalesce(case when jsonb_typeof(e->'dados') = 'object' then e->'dados' end, '{}'::jsonb)) then
      update public.painel_eventos set repeticoes = repeticoes + 1, visto_ate = now() where id = ult.id;
      continue;
    end if;
    insert into public.painel_eventos (visitante, sessao, user_id, tipo, nome, rota, titulo, dados,
      origem, midia, campanha, referrer, dispositivo, sistema, navegador, modelo, tela, idioma, pais, regiao, cidade, novo)
    values (
      left(e->>'visitante', 64), left(e->>'sessao', 64), uid, e->>'tipo',
      left(e->>'nome', 64), left(e->>'rota', 300), left(e->>'titulo', 200),
      case when jsonb_typeof(e->'dados') = 'object' and length((e->'dados')::text) < 2000 then e->'dados' end,
      left(e->>'origem', 80), left(e->>'midia', 40), left(e->>'campanha', 120), left(e->>'referrer', 300),
      left(e->>'dispositivo', 20), left(e->>'sistema', 40), left(e->>'navegador', 40), left(e->>'modelo', 60), left(e->>'tela', 30), left(e->>'idioma', 10),
      left(e->>'pais', 60), left(e->>'regiao', 80), left(e->>'cidade', 80),
      coalesce((e->>'novo')::boolean, false)
    );
  end loop;
end $$;

grant execute on function public.painel_registrar(jsonb) to anon, authenticated;

-- ── 3. Leitura agregada (só admin) ──────────────────────────────
-- p_filtros: { origem, rota, logado: "sim"|"nao", idioma, dispositivo, pais }
create or replace function public.painel_dados(p_inicio timestamptz, p_fim timestamptz, p_filtros jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  f jsonb := coalesce(p_filtros, '{}'::jsonb);
  resultado jsonb;
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;

  with sess_filtro as (
    -- filtro por sessão: a origem/idioma/dispositivo vêm do 1º evento dela
    select sessao from (
      select distinct on (sessao) sessao, origem, midia, idioma, dispositivo, pais, user_id
      from public.painel_eventos
      where criado_em >= p_inicio and criado_em < p_fim
      order by sessao, criado_em
    ) s
    where (f->>'origem' is null or s.origem || ' / ' || coalesce(s.midia, '') = f->>'origem')
      and (f->>'idioma' is null or s.idioma = f->>'idioma')
      and (f->>'dispositivo' is null or s.dispositivo = f->>'dispositivo')
      and (f->>'pais' is null or s.pais = f->>'pais')
      and (f->>'logado' is null
           or (f->>'logado' = 'sim' and exists (select 1 from public.painel_eventos x where x.sessao = s.sessao and x.user_id is not null))
           or (f->>'logado' = 'nao' and not exists (select 1 from public.painel_eventos x where x.sessao = s.sessao and x.user_id is not null)))
  ),
  base as (
    select e.* from public.painel_eventos e
    join sess_filtro using (sessao)
    where e.criado_em >= p_inicio and e.criado_em < p_fim
      and (f->>'rota' is null or e.rota like (f->>'rota') || '%')
  ),
  sessoes as (
    select sessao, min(visitante) visitante, bool_or(novo) novo,
      min(criado_em) ini, max(coalesce(visto_ate, criado_em)) fim,
      count(*) filter (where tipo = 'page') paginas,
      bool_or(user_id is not null) logado,
      bool_or(nome in ('signup_complete', 'signup_requested', 'sign_up')) cadastrou,
      extract(epoch from max(coalesce(visto_ate, criado_em)) - min(criado_em))::int duracao
    from base group by sessao
  ),
  -- tempo em cada página vista: até a próxima página da sessão, ou até o fim dela
  paginas_dur as (
    select b.rota, b.titulo, b.sessao, b.visitante,
      extract(epoch from coalesce(lead(b.criado_em) over (partition by b.sessao order by b.criado_em), s.fim) - b.criado_em)::int dur
    from base b join sessoes s using (sessao) where b.tipo = 'page'
  )
  select jsonb_build_object(
    'kpis', (select jsonb_build_object(
        'visitantes', count(distinct visitante),
        'sessoes', count(*),
        'paginas', coalesce(sum(paginas), 0),
        'duracao_media', coalesce(round(avg(duracao)), 0),
        'rejeicao', case when count(*) = 0 then 0 else round(100.0 * count(*) filter (where paginas <= 1 and duracao < 10) / count(*)) end,
        'novos', count(distinct visitante) filter (where novo),
        'voltaram', count(distinct visitante) filter (where not novo),
        'logados', count(*) filter (where logado),
        'cadastros', count(*) filter (where cadastrou)
      ) from sessoes),
    'serie', coalesce((select jsonb_agg(d order by d->>'dia') from (
        select jsonb_build_object(
          'dia', to_char(date_trunc('day', ini at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD'),
          'visitantes', count(distinct visitante), 'sessoes', count(*), 'paginas', sum(paginas)) d
        from sessoes group by date_trunc('day', ini at time zone 'America/Sao_Paulo')) x), '[]'::jsonb),
    'horas', coalesce((select jsonb_agg(h order by (h->>'hora')::int) from (
        select jsonb_build_object('hora', extract(hour from ini at time zone 'America/Sao_Paulo')::int, 'sessoes', count(*)) h
        from sessoes group by 1) x), '[]'::jsonb),
    'paginas', coalesce((select jsonb_agg(p) from (
        select jsonb_build_object('rota', rota, 'titulo', max(titulo),
          'views', count(*), 'visitantes', count(distinct visitante),
          'tempo', round(avg(dur))) p
        from paginas_dur where rota is not null group by rota
        order by count(*) desc limit 30) x), '[]'::jsonb),
    'origens', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(origem, '(direto)') || ' / ' || coalesce(midia, ''), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, origem, midia from base order by sessao, criado_em) s
        group by 1 order by count(*) desc limit 20) x), '[]'::jsonb),
    'dispositivos', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(dispositivo, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, dispositivo from base order by sessao, criado_em) s
        group by 1 order by count(*) desc) x), '[]'::jsonb),
    'sistemas', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(sistema, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, sistema from base order by sessao, criado_em) s
        group by 1 order by count(*) desc limit 20) x), '[]'::jsonb),
    'navegadores', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(navegador, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, navegador from base order by sessao, criado_em) s
        group by 1 order by count(*) desc limit 20) x), '[]'::jsonb),
    'modelos', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(modelo, '(não informado)'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, modelo from base order by sessao, criado_em) s
        group by 1 order by count(*) desc limit 30) x), '[]'::jsonb),
    'telas', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(tela, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, tela from base order by sessao, criado_em) s
        group by 1 order by count(*) desc limit 20) x), '[]'::jsonb),
    'idiomas', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(idioma, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, idioma from base order by sessao, criado_em) s
        group by 1 order by count(*) desc) x), '[]'::jsonb),
    'lugares', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(cidade, '?') || ' · ' || coalesce(regiao, '?') || ' · ' || coalesce(pais, '?'), 'pais', pais, 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, cidade, regiao, pais from base order by sessao, criado_em) s
        group by cidade, regiao, pais order by count(*) desc limit 30) x), '[]'::jsonb),
    'eventos', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', nome, 'total', sum(repeticoes), 'sessoes', count(distinct sessao)) o
        from base where tipo = 'evento' group by nome order by count(*) desc limit 40) x), '[]'::jsonb),
    'conteudo', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object(
          'tipo', case when nome = 'game_time' then 'jogo' else 'leitura' end,
          'chave', coalesce(dados->>'game_id', dados->>'chapter_titulo', dados->>'chapter_id', dados->>'story_id', '?'),
          'historia', dados->>'story_id',
          'sessoes', count(distinct sessao),
          'tempo_medio', round(avg((dados->>'duration_seconds')::numeric)),
          'tempo_total', round(sum((dados->>'duration_seconds')::numeric))) o
        from base where tipo = 'evento' and nome in ('game_time', 'chapter_time', 'webtoon_time')
          and dados ? 'duration_seconds'
        group by 1, 2, 3 order by sum((dados->>'duration_seconds')::numeric) desc limit 40) x), '[]'::jsonb),
    'funil', (select jsonb_build_object(
        'entraram', count(*),
        'engajaram', count(*) filter (where duracao >= 30 or paginas > 1),
        'consumiram', count(*) filter (where sessao in (select sessao from base where nome in ('chapter_open', 'game_open', 'webtoon_open'))),
        'cadastraram', count(*) filter (where cadastrou)) from sessoes),
    'opcoes', jsonb_build_object(
        'origens', coalesce((select jsonb_agg(distinct coalesce(origem, '(direto)') || ' / ' || coalesce(midia, '')) from public.painel_eventos where criado_em >= p_inicio and criado_em < p_fim), '[]'::jsonb),
        'paises', coalesce((select jsonb_agg(distinct pais) from public.painel_eventos where criado_em >= p_inicio and criado_em < p_fim and pais is not null), '[]'::jsonb))
  ) into resultado;

  return resultado;
end $$;

-- Quem está no site agora (evento nos últimos 2 minutos), sem filtro.
create or replace function public.painel_agora()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return (
    select jsonb_build_object(
      'online', count(*),
      'sessoes', coalesce(jsonb_agg(jsonb_build_object('rota', rota, 'titulo', titulo, 'lugar', lugar, 'dispositivo', dispositivo, 'logado', logado, 'ha', ha) order by ha), '[]'::jsonb))
    from (
      select distinct on (sessao) sessao, rota, titulo, coalesce(modelo, sistema, dispositivo) dispositivo,
        coalesce(cidade, '?') || ' · ' || coalesce(pais, '?') lugar,
        user_id is not null logado,
        extract(epoch from now() - coalesce(visto_ate, criado_em))::int ha
      from public.painel_eventos
      where coalesce(visto_ate, criado_em) > now() - interval '2 minutes'
      order by sessao, criado_em desc
    ) s
  );
end $$;

grant execute on function public.painel_dados(timestamptz, timestamptz, jsonb) to authenticated;
grant execute on function public.painel_agora() to authenticated;

-- ════════════════════════════════════════════════════════════════
-- 4. Financeiro — o webhook do Stripe grava cada movimento aqui
--    (antes só mudava o tier no perfil, sem histórico nenhum).
-- ════════════════════════════════════════════════════════════════
create table if not exists public.painel_pagamentos (
  id             bigserial primary key,
  criado_em      timestamptz not null default now(),
  stripe_id      text unique,          -- id do evento do Stripe (idempotência)
  user_id        uuid,
  tipo           text not null,        -- pagamento | falha | reembolso | cancelamento | assinou
  origem         text,                 -- assinatura | loja
  tier           text,
  valor_centavos integer default 0,
  moeda          text,
  descricao      text
);
alter table public.painel_pagamentos enable row level security;
create index if not exists painel_pagamentos_criado_em on public.painel_pagamentos (criado_em desc);

create or replace function public.painel_financeiro(p_inicio timestamptz, p_fim timestamptz)
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return jsonb_build_object(
    'por_moeda', coalesce((select jsonb_agg(m) from (
        select jsonb_build_object('moeda', upper(coalesce(moeda, '?')),
          'bruto', coalesce(sum(valor_centavos) filter (where tipo = 'pagamento'), 0),
          'reembolsos', coalesce(sum(valor_centavos) filter (where tipo = 'reembolso'), 0),
          'assinaturas', coalesce(sum(valor_centavos) filter (where tipo = 'pagamento' and origem = 'assinatura'), 0),
          'loja', coalesce(sum(valor_centavos) filter (where tipo = 'pagamento' and origem = 'loja'), 0),
          'pagamentos', count(*) filter (where tipo = 'pagamento')) m
        from public.painel_pagamentos where criado_em >= p_inicio and criado_em < p_fim
        group by upper(coalesce(moeda, '?'))) x), '[]'::jsonb),
    'movimento', (select jsonb_build_object(
        'novos', count(*) filter (where tipo = 'assinou'),
        'cancelados', count(*) filter (where tipo = 'cancelamento'),
        'falhas', count(*) filter (where tipo = 'falha'))
      from public.painel_pagamentos where criado_em >= p_inicio and criado_em < p_fim),
    'serie', coalesce((select jsonb_agg(d order by d->>'dia') from (
        select jsonb_build_object('dia', to_char(date_trunc('day', criado_em at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD'),
          'moeda', upper(coalesce(moeda, '?')), 'valor', sum(valor_centavos)) d
        from public.painel_pagamentos where tipo = 'pagamento' and criado_em >= p_inicio and criado_em < p_fim
        group by 1, 2) x), '[]'::jsonb),
    -- estado de agora (não depende do período)
    'assinantes', coalesce((select jsonb_agg(a order by a->>'desde' desc) from (
        select jsonb_build_object('email', u.email, 'nome', p.nome, 'tier', p.tier,
          'status', p.subscription_status, 'renova', p.current_period_end,
          'desde', (select min(criado_em) from public.painel_pagamentos pp where pp.user_id = p.id and pp.tipo in ('assinou', 'pagamento')),
          'ultimo_valor', (select valor_centavos from public.painel_pagamentos pp where pp.user_id = p.id and pp.tipo = 'pagamento' and pp.origem = 'assinatura' order by criado_em desc limit 1),
          'moeda', (select upper(moeda) from public.painel_pagamentos pp where pp.user_id = p.id and pp.tipo = 'pagamento' order by criado_em desc limit 1)) a
        from public.profiles p join auth.users u on u.id = p.id
        where p.subscription_status in ('active', 'trialing', 'past_due')) x), '[]'::jsonb),
    'por_tier', coalesce((select jsonb_object_agg(tier, n) from (
        select coalesce(tier, '?') tier, count(*) n from public.profiles
        where subscription_status in ('active', 'trialing') group by 1) x), '{}'::jsonb),
    'inadimplentes', (select count(*) from public.profiles where subscription_status = 'past_due'),
    'contas', (select count(*) from public.profiles),
    'ultimos', coalesce((select jsonb_agg(r) from (
        select jsonb_build_object('quando', pp.criado_em, 'email', u.email, 'tipo', pp.tipo, 'origem', pp.origem,
          'tier', pp.tier, 'valor', pp.valor_centavos, 'moeda', upper(pp.moeda), 'descricao', pp.descricao) r
        from public.painel_pagamentos pp left join auth.users u on u.id = pp.user_id
        where pp.criado_em >= p_inicio and pp.criado_em < p_fim
        order by pp.criado_em desc limit 50) x), '[]'::jsonb)
  );
end $$;

grant execute on function public.painel_financeiro(timestamptz, timestamptz) to authenticated;

-- ════════════════════════════════════════════════════════════════
-- 5. Custos — cadastro editável no painel (a página /custos lista o
--    que o projeto paga, sem valores; aqui entram os números).
-- ════════════════════════════════════════════════════════════════
create table if not exists public.painel_custos (
  id             bigserial primary key,
  nome           text not null,
  categoria      text,                 -- infra | pagamentos | marketing | ferramentas | outros
  valor_centavos integer not null default 0,
  moeda          text not null default 'BRL',
  recorrencia    text not null default 'mensal',  -- mensal | anual | unico
  desde          date not null default current_date,
  ate            date,
  nota           text,
  atualizado_em  timestamptz not null default now()
);
alter table public.painel_custos enable row level security;

insert into public.painel_custos (nome, categoria, recorrencia, nota)
select * from (values
  ('Domínio illusionfight.com', 'infra', 'anual', 'declarado em /custos'),
  ('Supabase', 'infra', 'mensal', 'declarado em /custos'),
  ('Stripe (taxas)', 'pagamentos', 'mensal', 'declarado em /custos — taxa por transação')
) v(nome, categoria, recorrencia, nota)
where not exists (select 1 from public.painel_custos);

create or replace function public.painel_custos_listar()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(to_jsonb(c) order by c.categoria, c.nome) from public.painel_custos c), '[]'::jsonb);
end $$;

-- Cria (sem id) ou atualiza (com id).
create or replace function public.painel_custo_salvar(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  if (p->>'id') is null then
    insert into public.painel_custos (nome, categoria, valor_centavos, moeda, recorrencia, desde, ate, nota)
    values (left(p->>'nome', 120), p->>'categoria', coalesce((p->>'valor_centavos')::int, 0), coalesce(p->>'moeda', 'BRL'),
      coalesce(p->>'recorrencia', 'mensal'), coalesce((p->>'desde')::date, current_date), (p->>'ate')::date, left(p->>'nota', 300));
  else
    update public.painel_custos set nome = left(p->>'nome', 120), categoria = p->>'categoria',
      valor_centavos = coalesce((p->>'valor_centavos')::int, 0), moeda = coalesce(p->>'moeda', 'BRL'),
      recorrencia = coalesce(p->>'recorrencia', 'mensal'), desde = coalesce((p->>'desde')::date, desde),
      ate = (p->>'ate')::date, nota = left(p->>'nota', 300), atualizado_em = now()
    where id = (p->>'id')::bigint;
  end if;
end $$;

create or replace function public.painel_custo_apagar(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  delete from public.painel_custos where id = p_id;
end $$;

grant execute on function public.painel_custos_listar() to authenticated;
grant execute on function public.painel_custo_salvar(jsonb) to authenticated;
grant execute on function public.painel_custo_apagar(bigint) to authenticated;

-- ════════════════════════════════════════════════════════════════
-- 6. Trilhas — lista de sessões e o caminho de cada uma, em ordem.
-- ════════════════════════════════════════════════════════════════
create or replace function public.painel_sessoes(p_inicio timestamptz, p_fim timestamptz, p_limite int default 100)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(s order by s->>'ini' desc) from (
    select jsonb_build_object(
      'sessao', sessao, 'ini', min(criado_em), 'fim', max(coalesce(visto_ate, criado_em)),
      'duracao', extract(epoch from max(coalesce(visto_ate, criado_em)) - min(criado_em))::int,
      'paginas', count(*) filter (where tipo = 'page'),
      'eventos', count(*) filter (where tipo = 'evento'),
      'entrada', (array_agg(rota order by criado_em))[1],
      'saida', (array_agg(rota order by criado_em desc))[1],
      'origem', (array_agg(coalesce(origem, '(direto)') || ' / ' || coalesce(midia, '') order by criado_em))[1],
      'aparelho', (array_agg(coalesce(modelo, sistema, dispositivo) order by criado_em))[1],
      'navegador', (array_agg(navegador order by criado_em))[1],
      'lugar', (array_agg(coalesce(cidade, '?') || ' · ' || coalesce(pais, '?') order by criado_em))[1],
      'novo', bool_or(novo), 'logado', bool_or(user_id is not null),
      'aovivo', max(coalesce(visto_ate, criado_em)) > now() - interval '2 minutes') s
    from public.painel_eventos
    where criado_em >= p_inicio and criado_em < p_fim
    group by sessao
    order by min(criado_em) desc
    limit least(greatest(p_limite, 1), 500)) x), '[]'::jsonb);
end $$;

-- O caminho de uma sessão: páginas (com o tempo em cada) e eventos, sem os pings.
create or replace function public.painel_trilha(p_sessao text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(t order by t->>'quando') from (
    select jsonb_build_object('quando', e.criado_em, 'tipo', e.tipo, 'nome', e.nome, 'rota', e.rota, 'titulo', e.titulo, 'dados', e.dados,
      'repeticoes', e.repeticoes,
      'tempo', case when e.tipo = 'page' then (
        select extract(epoch from coalesce(
          (select min(n.criado_em) from public.painel_eventos n where n.sessao = e.sessao and n.tipo = 'page' and n.criado_em > e.criado_em),
          (select max(coalesce(n.visto_ate, n.criado_em)) from public.painel_eventos n where n.sessao = e.sessao)) - e.criado_em)::int) end) t
    from public.painel_eventos e
    where e.sessao = p_sessao) x), '[]'::jsonb);
end $$;

grant execute on function public.painel_sessoes(timestamptz, timestamptz, int) to authenticated;
grant execute on function public.painel_trilha(text) to authenticated;
