/**
 * Migration Runner — roda diretamente no Supabase via pg (postgres)
 * 
 * Uso: SUPABASE_KEY="sua_key_aqui" node scripts/migrate.js
 * 
 * A key NÃO fica salva em lugar nenhum — só na variável de ambiente da sessão.
 */

import pg from 'pg'

const KEY = process.env.SUPABASE_KEY
const PROJECT = 'dvxfrzixtetdzmdrzkpx'

if (!KEY) {
  console.log('❌ Defina SUPABASE_KEY primeiro:')
  console.log('   $env:SUPABASE_KEY="sua_service_role_key" ; node scripts/migrate.js')
  process.exit(1)
}

const conn = `postgresql://postgres:${KEY}@db.${PROJECT}.supabase.co:5432/postgres`

const sql = `
  ALTER TABLE public.tamagoshi_saves 
    ADD COLUMN IF NOT EXISTS estagio INT DEFAULT 0;

  ALTER TABLE public.tamagoshi_saves 
    ADD COLUMN IF NOT EXISTS version TEXT;
`

const client = new pg.Client(conn)

try {
  await client.connect()
  console.log('✅ Conectado ao Supabase\n')
  console.log('⚡ Executando migration...')
  await client.query(sql)
  console.log('\n✅ Migration executada com sucesso!')
  console.log('  → Coluna "estagio" adicionada')
  console.log('  → Coluna "version" adicionada')
} catch (err) {
  console.log('\n❌ Erro:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
