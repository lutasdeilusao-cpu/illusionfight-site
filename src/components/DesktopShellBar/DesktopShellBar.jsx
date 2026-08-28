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

  const fecharApp = () => {
    if (!window.confirm(t('runtime.shell_fechar_confirmar'))) return
    // 1) comando nativo da shell (mais confiável)
    const invoke = window.__TAURI__?.core?.invoke || window.__TAURI__?.invoke
    if (typeof invoke === 'function') {
      Promise.resolve(invoke('quit_app')).catch(() => fecharPelaJanela())
      return
    }
    fecharPelaJanela()
  }

  const fecharPelaJanela = () => {
    const tauriWindow = window.__TAURI__?.window
    const currentWindow = tauriWindow?.getCurrentWindow?.() || tauriWindow?.getCurrent?.() || tauriWindow?.appWindow
    if (currentWindow?.close) {
      Promise.resolve(currentWindow.close()).catch(() => {
        try { currentWindow.destroy?.() } catch { /* nada a fazer */ }
      })
      return
    }
    try { window.close() } catch { /* nada a fazer */ }
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
