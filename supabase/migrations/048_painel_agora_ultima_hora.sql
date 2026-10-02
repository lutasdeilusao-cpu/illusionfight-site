-- 048 — Aba "Agora" do painel: quem visitou na ÚLTIMA HORA, não só nos
-- últimos 2 minutos (Isaias, 02/10/2026). Cada sessão volta com `aovivo`
-- (visto nos últimos 2 min) e o total de quem ainda está no site sai em
-- `aovivo`; `online` passa a ser o total da última hora.
create or replace function public.painel_agora()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'sem acesso'; end if;
  return (
    select jsonb_build_object(
      'online', count(*),
      'aovivo', count(*) filter (where ha <= 120),
      'sessoes', coalesce(jsonb_agg(jsonb_build_object('rota', rota, 'titulo', titulo, 'lugar', lugar, 'pais', pais, 'dispositivo', dispositivo, 'logado', logado, 'ha', ha,
          'aovivo', ha <= 120, 'conta', public.painel_conta(user_id)) order by ha), '[]'::jsonb))
    from (
      select distinct on (sessao) sessao, rota, titulo, pais, user_id,
        concat_ws(' · ', dispositivo, modelo, sistema, navegador) dispositivo,
        concat_ws(', ', cidade, regiao) lugar,
        user_id is not null logado,
        extract(epoch from now() - coalesce(visto_ate, criado_em))::int ha
      from public.painel_eventos
      where coalesce(visto_ate, criado_em) > now() - interval '1 hour'
      order by sessao, coalesce(visto_ate, criado_em) desc
    ) s
  );
end $$;

grant execute on function public.painel_agora() to authenticated;
