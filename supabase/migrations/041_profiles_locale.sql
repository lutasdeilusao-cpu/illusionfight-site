-- 041_profiles_locale.sql
-- Idioma padrão do site vira INGLÊS pra todo visitante novo (1º contato).
-- A troca manual no menu (idioma) só persiste de verdade quando existe
-- conta — é o que esta migração viabiliza: uma coluna própria em
-- `profiles` pra guardar a preferência de idioma do usuário logado,
-- lida no login e escrita quando ele troca de idioma no menu.
--
-- Contas criadas ANTES desta migração vinham de um site cujo padrão
-- era português — backfill pra `pt` evita que o lançamento desta feature
-- troque o idioma de quem já usava o site sem avisar.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale text;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_locale_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_locale_check CHECK (locale IS NULL OR locale IN ('pt', 'en', 'es'));

UPDATE public.profiles SET locale = 'pt' WHERE locale IS NULL;

-- Trigger de criação de perfil (handle_new_auth_user, ver 028/030): passa a
-- gravar o idioma ativo no momento do cadastro (enviado pelo frontend em
-- `data.locale` do signUp), pra a conta nascer já lembrando o idioma que a
-- pessoa estava usando quando decidiu criar conta. Sem valor -> 'en',
-- mesmo padrão do frontend pra visitante sem conta.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, nome, telefone, country_code, locale)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'nome', ''), split_part(NEW.email, '@', 1), 'Jogador'),
      '',
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'pais', ''), 'BR'),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'locale', ''), 'en')
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_auth_user falhou para %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
