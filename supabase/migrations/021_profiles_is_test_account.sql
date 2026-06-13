-- 021_profiles_is_test_account.sql
-- Adiciona flag is_test_account para contas de teste (fichas infinitas)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT FALSE;

-- Atualiza todas as contas @teste.com para is_test_account = true
-- Faz join com auth.users para obter o email
UPDATE profiles p
SET is_test_account = true
FROM auth.users u
WHERE p.id = u.id
  AND u.email LIKE '%@teste.com';
