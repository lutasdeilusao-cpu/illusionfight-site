import { useState } from 'react'
import { useAchievements } from '../../../../context/AchievementsContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useFichas } from '../../../../context/FichasContext'
import { supabase } from '../../../../lib/supabase'
import { notificationManager } from '../../../../lib/notificationManager'
import todosAchievements from '../../../../data/achievements-pt.json'

export default function PerfilConquistas() {
  const { t } = useLanguage()
  const { desbloqueados, refresh } = useAchievements()
  const { user } = useAuth()
  const { isAdmin } = useFichas()
  const [confirmando, setConfirmando] = useState(false)
  const [resetando, setResetando] = useState(false)

  async function handleReset() {
    setResetando(true)
    const { data: removidos, error: err1 } = await supabase
      .from('user_achievements').delete().eq('user_id', user.id).select()
    if (err1) { console.error('[Reset] erro user_achievements:', err1); setResetando(false); return }
    if (!removidos || removidos.length === 0) {
      console.error('[Reset] RLS bloqueou DELETE user_achievements — aplicar migration 023 no Supabase dashboard')
      setResetando(false); return
    }
    const { data: removidosEventos, error: err2 } = await supabase
      .from('perfil_eventos').delete().eq('user_id', user.id).eq('tipo', 'conquista').select()
    if (err2) { console.error('[Reset] erro perfil_eventos:', err2); setResetando(false); return }
    notificationManager.clear()
    await refresh()
    setConfirmando(false)
    setResetando(false)
  }

  return (
    <div className="perfil-achievements">
      {todosAchievements.map(a => {
        const unlocked = desbloqueados.includes(a.id)
        const secretoNaoVisto = a.secreto && !unlocked
        return (
          <div key={a.id} className={`perfil-achievement-card ${unlocked ? 'perfil-achievement-card--unlocked' : 'perfil-achievement-card--locked'}`}>
            <div className="perfil-achievement-icone">{a.icone}</div>
            <div className="perfil-achievement-nome">{secretoNaoVisto ? '???' : a.nome}</div>
            <div className="perfil-achievement-desc">{secretoNaoVisto ? t('site.perfil.conquistas_secreto') : a.descricao}</div>
            <div className={`perfil-achievement-status ${unlocked ? 'status-unlocked' : 'status-locked'}`}>
              {unlocked ? t('site.perfil.conquistas_desbloqueado') : t('site.perfil.conquistas_bloqueado')}
            </div>
          </div>
        )
      })}

      {isAdmin && (
        <div className="perfil-admin-reset-area">
          <button className="perfil-admin-reset-btn" onClick={() => setConfirmando(true)}>
            {t('site.perfil.admin_reset_btn')}
          </button>
        </div>
      )}

      {confirmando && (
        <div className="perfil-admin-reset-modal-overlay" onClick={() => !resetando && setConfirmando(false)}>
          <div className="perfil-admin-reset-modal" onClick={e => e.stopPropagation()}>
            <p className="perfil-admin-reset-modal-titulo">{t('site.perfil.admin_reset_confirm_titulo')}</p>
            <p className="perfil-admin-reset-modal-desc">{t('site.perfil.admin_reset_confirm_desc')}</p>
            <div className="perfil-admin-reset-modal-acoes">
              <button className="perfil-admin-reset-btn-cancelar" disabled={resetando} onClick={() => setConfirmando(false)}>
                {t('site.perfil.admin_reset_cancelar')}
              </button>
              <button className="perfil-admin-reset-btn-confirmar" disabled={resetando} onClick={handleReset}>
                {resetando ? t('site.perfil.admin_reset_resetando') : t('site.perfil.admin_reset_confirmar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
