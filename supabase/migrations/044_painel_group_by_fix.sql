-- 044 — conserta painel_dados e painel_financeiro ("aggregate functions are not
-- allowed in GROUP BY": o GROUP BY 1 apontava pro jsonb que já tinha count()
-- dentro). Rodar inteiro no SQL Editor.

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
        from sessoes group by extract(hour from ini at time zone 'America/Sao_Paulo')) x), '[]'::jsonb),
    'paginas', coalesce((select jsonb_agg(p) from (
        select jsonb_build_object('rota', rota, 'titulo', max(titulo),
          'views', count(*), 'visitantes', count(distinct visitante),
          'tempo', round(avg(dur))) p
        from paginas_dur where rota is not null group by rota
        order by count(*) desc limit 30) x), '[]'::jsonb),
    'origens', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(origem, '(direto)') || ' / ' || coalesce(midia, ''), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, origem, midia from base order by sessao, criado_em) s
        group by coalesce(origem, '(direto)') || ' / ' || coalesce(midia, '') order by count(*) desc limit 20) x), '[]'::jsonb),
    'dispositivos', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(dispositivo, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, dispositivo from base order by sessao, criado_em) s
        group by coalesce(dispositivo, '?') order by count(*) desc) x), '[]'::jsonb),
    'sistemas', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(sistema, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, sistema from base order by sessao, criado_em) s
        group by coalesce(sistema, '?') order by count(*) desc limit 20) x), '[]'::jsonb),
    'navegadores', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(navegador, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, navegador from base order by sessao, criado_em) s
        group by coalesce(navegador, '?') order by count(*) desc limit 20) x), '[]'::jsonb),
    'modelos', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(modelo, '(não informado)'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, modelo from base order by sessao, criado_em) s
        group by coalesce(modelo, '(não informado)') order by count(*) desc limit 30) x), '[]'::jsonb),
    'telas', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(tela, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, tela from base order by sessao, criado_em) s
        group by coalesce(tela, '?') order by count(*) desc limit 20) x), '[]'::jsonb),
    'idiomas', coalesce((select jsonb_agg(o) from (
        select jsonb_build_object('chave', coalesce(idioma, '?'), 'sessoes', count(*)) o
        from (select distinct on (sessao) sessao, idioma from base order by sessao, criado_em) s
        group by coalesce(idioma, '?') order by count(*) desc) x), '[]'::jsonb),
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
        group by case when nome = 'game_time' then 'jogo' else 'leitura' end,
          coalesce(dados->>'game_id', dados->>'chapter_titulo', dados->>'chapter_id', dados->>'story_id', '?'), dados->>'story_id'
        order by sum((dados->>'duration_seconds')::numeric) desc limit 40) x), '[]'::jsonb),
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
        group by date_trunc('day', criado_em at time zone 'America/Sao_Paulo'), upper(coalesce(moeda, '?'))) x), '[]'::jsonb),
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

