-- 030_signup_hardening.sql
-- Cadastro estava travando pra usuários reais. O backend (Auth + trigger)
-- se mostrou saudável nos testes, mas qualquer exceção dentro da trigger
-- de provisionamento derruba a transação inteira do auth.users e o signUp
-- falha com "Database error saving new user". Esta migração torna a
-- trigger à prova de exceção e garante as policies que o fallback do
-- frontend precisa.

-- ── 1. Trigger de perfil: nunca pode abortar o signup ──
-- Um bloco EXCEPTION engole qualquer erro (coluna faltando, constraint,
-- lock) e deixa o auth.users ser criado mesmo assim. O frontend
-- (ensureUserProfile) recria o perfil depois se preciso.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, nome, telefone, country_code)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'nome', ''), split_part(NEW.email, '@', 1), 'Jogador'),
      '',
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'pais', ''), 'BR')
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

-- ── 2. RLS: o dono do perfil pode ler, criar e atualizar a própria linha ──
-- É o que o fallback ensureUserProfile precisa quando a trigger, por
-- qualquer motivo, não criou a linha.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perfil próprio: select" ON public.profiles;
CREATE POLICY "perfil próprio: select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "perfil próprio: insert" ON public.profiles;
CREATE POLICY "perfil próprio: insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "perfil próprio: update" ON public.profiles;
CREATE POLICY "perfil próprio: update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ── 3. Telefone e país não são mais exigidos no cadastro ──
ALTER TABLE public.profiles ALTER COLUMN telefone DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN telefone SET DEFAULT '';

-- ── 4. Reparo: qualquer conta em auth.users sem perfil ganha um agora ──
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
