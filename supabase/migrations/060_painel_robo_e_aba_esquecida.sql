-- 060 — Robô e aba esquecida fora das métricas do painel. Rodar inteiro no SQL
-- Editor; pode rodar de novo sem erro.
--
-- Robô: computador nos EUA que não informa o sistema operacional é o renderizador
-- do Google (abre uma página, fica menos de 3 s, nunca clica nem rola). Navegador
-- de verdade num computador sempre informa Windows, macOS ou Linux.
-- Aba esquecida: página parada por mais de 3 horas não conta no tempo médio.

-- 1. Trava única do que não conta (rota do painel + robôs).
create or replace function public.painel_ignorar_rota_admin()
returns trigger language plpgsql as $$
begin
  if new.rota like '/admin%' or new.rota like '/central-if-7k2q%' then
    return null; -- descarta a linha
  end if;
  if coalesce(new.modelo, '') like 'Nexus 5X Build/MMB29P%' then
    return null; -- renderizador do Google fingindo ser celular
  end if;
  if new.dispositivo = 'desktop' and coalesce(new.sistema, '') in ('', '?') and new.pais = 'United States' then
    return null; -- renderizador do Google no computador
  end if;
  return new;
end $$;

-- 2. Apaga os robôs que já entraram.
delete from public.painel_eventos
where dispositivo = 'desktop' and coalesce(sistema, '') in ('', '?') and pais = 'United States';

-- 3. Tempo médio sem aba esquecida.
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
  ),
  -- página parada por mais de 3 horas é aba esquecida aberta: não entra no tempo de leitura
  sessoes_tempo as (
    select s.sessao, greatest(s.duracao - coalesce(sum(p.dur) filter (where p.dur > 10800), 0), 0) duracao_util
    from sessoes s left join paginas_dur p using (sessao) group by s.sessao, s.duracao
  )
  select jsonb_build_object(
    'kpis', (select jsonb_build_object(
        'visitantes', count(distinct visitante),
        'sessoes', count(*),
        'paginas', coalesce(sum(paginas), 0),
        'duracao_media', coalesce((select round(avg(duracao_util)) from sessoes_tempo), 0),
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
          'tempo', round(avg(dur) filter (where dur <= 10800))) p
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
