-- Telefone deixou de fazer parte do cadastro inicial.
-- Mantém compatibilidade com perfis antigos e permite novos registros sem telefone.
ALTER TABLE public.profiles
  ALTER COLUMN telefone DROP NOT NULL;
