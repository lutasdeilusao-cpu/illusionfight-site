import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { runtimePlatform } from '../../lib/runtimePlatform'
import './DesktopShellBar.css'

/**
 * Barra fixa no topo, exclusiva do runtime `steam-demo` (shell Tauri).
 * Garante que o jogador nunca fique preso: sempre há "Voltar aos Games" e
 * "Fechar" a aplicação, independente de qualquer tela de jogo.
 * No portal web normal este componente não renderiza nada.
 */
export default function DesktopShellBar() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const isShell = runtimePlatform.isSteamDemo

  useEffect(() => {
    if (isShell) document.body.classList.add('has-desktop-shell-bar')
    return () => document.body.classList.remove('has-desktop-shell-bar')
  }, [isShell])

  if (!isShell) return null

  const fecharApp = async () => {
    if (!window.confirm(t('runtime.shell_fechar_confirmar'))) return
    const T = window.__TAURI__
    console.log('[shell] fechar — __TAURI__?', Boolean(T), 'core.invoke?', typeof T?.core?.invoke, 'window?', Boolean(T?.window))

    // 1) comando nativo quit_app (process::exit) — mais confiável quando o IPC funciona
    try {
      const invoke = T?.core?.invoke || T?.invoke
      if (typeof invoke === 'function') { await invoke('quit_app'); return }
    } catch (e) { console.warn('[shell] quit_app falhou', e) }

    // 2) destruir/fechar a janela pela API global (core:window:allow-destroy/close)
    try {
      const w = T?.window
      const cur = w?.getCurrentWindow?.() || w?.getCurrent?.() || w?.appWindow
      if (cur?.destroy) { await cur.destroy(); return }
      if (cur?.close) { await cur.close(); return }
    } catch (e) { console.warn('[shell] destroy/close falhou', e) }

    // 3) último recurso do navegador (normalmente bloqueado)
    try { window.close() } catch { /* nada a fazer */ }
    alert(t('runtime.shell_fechar_manual'))
  }

  return (
    <div className="desktop-shell-bar" role="toolbar" aria-label="Illusion Fight Demo">
      <button
        type="button"
        className="desktop-shell-bar__btn"
        onClick={() => navigate('/games')}
      >
        {'← '}{t('runtime.shell_voltar_games')}
      </button>
      <span className="desktop-shell-bar__title">Illusion Fight — Season 1 Demo</span>
      <button
        type="button"
        className="desktop-shell-bar__btn desktop-shell-bar__btn--close"
        onClick={fecharApp}
      >
        {t('runtime.shell_fechar')}{' ✕'}
      </button>
    </div>
  )
}
