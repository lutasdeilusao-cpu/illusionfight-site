-- Corrige a FK legada e transforma o provisionamento de perfil em responsabilidade do banco.
-- A trigger roda na mesma transação do auth.users, antes do frontend liberar os demais providers.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, telefone, country_code)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'nome', ''), split_part(NEW.email, '@', 1), 'Jogador'),
    '',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'pais', ''), 'BR')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Repara contas já existentes no Auth que ficaram sem perfil durante o fluxo antigo.
INSERT INTO public.profiles (id, nome, telefone, country_code)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'nome', ''), split_part(u.email, '@', 1), 'Jogador'),
  '',
  COALESCE(NULLIF(u.raw_user_meta_data->>'pais', ''), 'BR')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
