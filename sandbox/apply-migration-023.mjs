import { chromium } from 'playwright'

const SUPABASE_EMAIL = 'isaiasgamedev@gmail.com'
const SUPABASE_PASSWORD = 'Vidanerd123$'
const PROJECT_REF = 'dvxfrzixtetdzmdrzkpx'
const SQL = `
CREATE POLICY "usuario deleta proprias conquistas"
  ON public.user_achievements FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "usuario deleta proprios eventos de conquista"
  ON public.perfil_eventos FOR DELETE
  USING (auth.uid() = user_id AND tipo = 'conquista');
`

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  console.log('[1/5] Indo para página de login do Supabase...')
  await page.goto('https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new', {
    timeout: 60000,
    waitUntil: 'load',
  })
  console.log('  URL após navegação:', page.url())

  // Se estiver na página de login
  if (page.url().includes('sign-in') || page.url().includes('login') || page.url().includes('auth')) {
    console.log('[2/5] Autenticando...')
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'sandbox/01-login-page.png' })

    // Preencher credenciais
    await page.fill('input[name="email"]', SUPABASE_EMAIL)
    await page.fill('input[name="password"]', SUPABASE_PASSWORD)
    await page.click('button[type="submit"]')

    console.log('  Credenciais enviadas, aguardando 10s...')
    await page.waitForTimeout(10000)
    console.log('  URL pós-login:', page.url())
    await page.screenshot({ path: 'sandbox/02-pos-login.png' })
  }

  // Se ainda não está no SQL editor, navegar
  if (!page.url().includes('/sql/new')) {
    console.log('[3/5] Navegando para SQL Editor...')
    await page.goto('https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new', {
      timeout: 30000,
      waitUntil: 'load',
    })
    await page.waitForTimeout(3000)
    console.log('  URL SQL Editor:', page.url())
    await page.screenshot({ path: 'sandbox/03-sql-editor.png' })
  }

  console.log('[4/5] Inserindo SQL no editor...')

  // Aguardar o Monaco carregar
  await page.waitForTimeout(3000)

  // Injetar SQL via page.evaluate — acessa diretamente o Monaco API
  const injected = await page.evaluate((sql) => {
    if (typeof monaco !== 'undefined' && monaco.editor && monaco.editor.getModels) {
      const models = monaco.editor.getModels()
      if (models.length > 0) {
        models[0].setValue(sql)
        return 'OK: setValue via Monaco API'
      }
    }
    // Fallback: tentar achar o textarea oculto
    const ta = document.querySelector('.monaco-editor textarea')
    if (ta) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      ).set
      nativeInputValueSetter.call(ta, sql)
      ta.dispatchEvent(new Event('input', { bubbles: true }))
      return 'OK: native setter via textarea'
    }
    return 'FAIL: Monaco não encontrado'
  }, SQL)
  console.log('  Inject result:', injected)

  await page.waitForTimeout(1000)

  // Executar Ctrl+Enter
  console.log('[5/5] Executando SQL...')
  await page.keyboard.press('Control+Enter')
  await page.waitForTimeout(6000)
  await page.screenshot({ path: 'sandbox/04-pos-execucao.png', fullPage: true })

  // Verificar resultado
  const bodyText = await page.textContent('body')
  if (bodyText.includes('ERROR') || bodyText.includes('error') || bodyText.includes('syntax error') || bodyText.includes('Error')) {
    console.log('⚠️ Possível erro na execução.')
    const errLines = bodyText.split('\n').filter(l => l.includes('ERROR') || l.includes('error') || l.includes('syntax'))
    errLines.forEach(l => console.log('  ' + l.trim()))
  } else if (bodyText.includes('Success') || bodyText.includes('CREATE POLICY')) {
    console.log('✅ Migration 023 aplicada com sucesso!')
  } else {
    console.log('⚠️ Resultado indeterminado. Verificar screenshot sandbox/04-pos-execucao.png')
  }

  await browser.close()
  console.log('Feito. Screenshots em sandbox/.')
}

main().catch(err => {
  console.error('Falha:', err.message)
  process.exit(1)
})
