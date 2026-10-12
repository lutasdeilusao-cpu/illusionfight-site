-- Liberar creator pra uma conta que ainda não tem perfil: o perfil nasce com
-- o nome do cadastro (metadata) ou, sem ele, com o começo do e-mail.
create or replace function public.admin_definir_creator(p_email text, p_meses int, p_canal text default null)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_nome text;
  v_ate date;
begin
  if not public.eh_admin() then
    raise exception 'sem permissao';
  end if;
  select id,
         coalesce(nullif(trim(raw_user_meta_data->>'nome'), ''), nullif(trim(raw_user_meta_data->>'name'), ''), split_part(email, '@', 1))
    into v_id, v_nome
    from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then
    return json_build_object('ok', false, 'erro', 'conta_nao_encontrada');
  end if;
  v_ate := case when p_meses is null then null else (current_date + make_interval(months => p_meses))::date end;
  perform set_config('ldi.creator_admin', '1', true);
  insert into public.profiles (id, nome, is_creator, creator_ate, creator_canal)
  values (v_id, v_nome, coalesce(p_meses, 1) > 0, v_ate, nullif(trim(p_canal), ''))
  on conflict (id) do update set
    is_creator = coalesce(p_meses, 1) > 0,
    creator_ate = case when coalesce(p_meses, 1) > 0 then v_ate else null end,
    creator_canal = coalesce(nullif(trim(p_canal), ''), public.profiles.creator_canal);
  perform set_config('ldi.creator_admin', '', true);
  return json_build_object('ok', true, 'ate', v_ate);
end $$;
