import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKpI18n } from '../hooks/useKpI18n'
import KPManualModal from './KPManualModal'

export default function KPMenu({ onStart }) {
  const { t } = useKpI18n()
  const navigate = useNavigate()
  const [sub, setSub] = useState(null)

  if (sub === 'solo') {
    return (
      <div className="menu-overlay show">
        <div className="diff-box">
          <div className="diff-title">{t('kp.menu.dificuldade')}</div>
          <div className="diff-sub">{t('kp.menu.selecione_nivel')}</div>
          <button className="menu-btn" onClick={() => onStart('solo-easy')}>
            <span className="menu-btn-arrow">▶</span>
            <span className="menu-btn-label">{t('kp.menu.facil')}<span className="menu-btn-sub">{t('kp.menu.facil_sub')}</span></span>
          </button>
          <button className="menu-btn" onClick={() => onStart('solo-medium')}>
            <span className="menu-btn-arrow">▶</span>
            <span className="menu-btn-label">{t('kp.menu.medio')}<span className="menu-btn-sub">{t('kp.menu.medio_sub')}</span></span>
          </button>
          <button className="diff-back" onClick={() => setSub(null)}>{t('kp.menu.voltar')}</button>
        </div>
      </div>
    )
  }

  if (sub === 'manual') {
    return <KPManualModal onClose={() => setSub(null)} />
  }

  return (
    <div className="menu-overlay show">
      <div className="menu-box">
        <div className="menu-logo">{t('kp.menu.titulo')}</div>
        <div className="menu-tagline">{t('kp.menu.tagline')}</div>
        <button className="menu-btn" onClick={() => onStart('local')}>
          <span className="menu-btn-arrow">▶</span>
          <span className="menu-btn-label">{t('kp.menu.versus')}<span className="menu-btn-sub">{t('kp.menu.versus_sub')}</span></span>
        </button>
        <button className="menu-btn" onClick={() => setSub('solo')}>
          <span className="menu-btn-arrow">▶</span>
          <span className="menu-btn-label">{t('kp.menu.solo')}<span className="menu-btn-sub">{t('kp.menu.solo_sub')}</span></span>
        </button>
        <button className="menu-btn" onClick={() => setSub('manual')}>
          <span className="menu-btn-arrow">📖</span>
          <span className="menu-btn-label">{t('kp.menu.manual')}<span className="menu-btn-sub">{t('kp.menu.manual_sub')}</span></span>
        </button>
        <button className="diff-back" style={{ marginTop: 12, width: '100%' }} onClick={() => navigate('/games?aba=kernel')}>{t('kp.menu.voltar_jogos')}</button>
      </div>
    </div>
  )
}
