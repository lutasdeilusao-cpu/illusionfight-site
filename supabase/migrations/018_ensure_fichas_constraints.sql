-- Migration 018: Ensure fichas table has PRIMARY KEY on user_id
-- Fix: remove duplicatas, drop PK antiga, cria PK em user_id, recria policies.

-- 1. Remove duplicatas: mantém apenas a linha mais recente por user_id
DELETE FROM fichas f
WHERE f.ctid NOT IN (
  SELECT min(ctid)
  FROM fichas
  GROUP BY user_id
);

-- 2. Drop PK antiga (se existir em coluna 'id')
DO $$
DECLARE
  pk_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO pk_name
  FROM information_schema.table_constraints tc
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_name = 'fichas'
  LIMIT 1;

  IF pk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE fichas DROP CONSTRAINT ' || quote_ident(pk_name);
  END IF;
END
$$;

-- 3. Adiciona PK em user_id
ALTER TABLE fichas ADD PRIMARY KEY (user_id);

-- 4. Garante RLS
ALTER TABLE fichas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_historico ENABLE ROW LEVEL SECURITY;

-- 5. Recria policies
DROP POLICY IF EXISTS "Users can read own fichas" ON fichas;
CREATE POLICY "Users can read own fichas" ON fichas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fichas" ON fichas;
CREATE POLICY "Users can insert own fichas" ON fichas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own fichas" ON fichas;
CREATE POLICY "Users can update own fichas" ON fichas
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own historico" ON fichas_historico;
CREATE POLICY "Users can read own historico" ON fichas_historico
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own historico" ON fichas_historico;
CREATE POLICY "Users can insert own historico" ON fichas_historico
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger updated_at
CREATE OR REPLACE FUNCTION set_fichas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_fichas_updated_at ON fichas;
CREATE TRIGGER set_fichas_updated_at
  BEFORE UPDATE ON fichas
  FOR EACH ROW EXECUTE FUNCTION set_fichas_updated_at();
