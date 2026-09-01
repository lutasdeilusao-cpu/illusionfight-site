import { lazy } from 'react'

/**
 * Igual ao React.lazy, mas se o import dinâmico do chunk falhar porque o arquivo
 * não existe mais no servidor (acontece quando o site é redeployado com a aba
 * aberta — o hash do arquivo muda e o chunk antigo some), recarrega a página uma
 * vez pra pegar o index.html novo. Sem isso, o usuário fica preso numa tela preta
 * ao navegar depois de um deploy.
 */
const RELOAD_KEY = 'ldi-chunk-reload-ts'
const RELOAD_COOLDOWN_MS = 15000

function isChunkLoadError(err) {
  const msg = String((err && err.message) || err || '')
  return (
    err?.name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /dynamically imported module/i.test(msg)
  )
}

export default function lazyWithReload(factory) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (err) {
      if (isChunkLoadError(err)) {
        let last = 0
        try { last = Number(sessionStorage.getItem(RELOAD_KEY) || 0) } catch { /* sessionStorage indisponível */ }

        if (Date.now() - last > RELOAD_COOLDOWN_MS) {
          try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())) } catch { /* ignore */ }
          window.location.reload()
          // trava o carregamento enquanto a página recarrega
          return new Promise(() => {})
        }
      }
      throw err
    }
  })
}
