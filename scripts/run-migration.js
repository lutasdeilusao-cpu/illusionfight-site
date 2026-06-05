/**
 * Migration Runner
 * 
 * Opção 1 (recomendada): Cole o SQL abaixo no SQL Editor do Supabase
 * Opção 2: Forneça a DATABASE_URL como argumento
 *
 * Uso: node scripts/run-migration.js "postgresql://postgres:key@db.supabase.co:5432/postgres"
 */

const sql = `
ALTER TABLE public.tamagoshi_saves 
  ADD COLUMN IF NOT EXISTS estagio INT DEFAULT 0;

ALTER TABLE public.tamagoshi_saves 
  ADD COLUMN IF NOT EXISTS version TEXT;
`

const conn = process.argv[2]

if (conn) {
  console.log('🔧 Conectando ao banco...')
  import('child_process').then(({ execSync }) => {
    try {
      execSync(`psql "${conn}" -c "${sql.replace(/\n/g, ' ')}"`, { stdio: 'inherit' })
      console.log('✅ Migration executada!')
    } catch (e) {
      console.log('❌ Erro ao conectar via psql. Instale o PostgreSQL CLI ou use o SQL Editor.')
      console.log('\n📋 SQL para copiar:\n')
      console.log(sql)
    }
  })
} else {
  console.log('\n📋 Copie o SQL abaixo e cole no SQL Editor do Supabase:\n')
  console.log('─'.repeat(50))
  console.log(sql)
  console.log('─'.repeat(50))
  console.log('\n🔗 https://supabase.com/dashboard/project/dvxfrzixtetdzmdrzkpx/sql/new\n')
}

