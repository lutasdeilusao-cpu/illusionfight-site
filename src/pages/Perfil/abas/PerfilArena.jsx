import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { supabase } from '../../../lib/supabase'

export default function PerfilArena({ userId }) {
  const { t } = useLanguage()
  const [sheets, setSheets] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!userId) return
    setCarregando(true)
    supabase
      .from('character_sheets')
      .select('id, sheet_name, attributes, xp_total, enemies_unlocked, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSheets(Array.isArray(data) ? data : [])
        setCarregando(false)
      })
  }, [userId])

  if (carregando) return <div className="perfil-trump-skeleton"><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /></div>

  const totalXp = sheets.reduce((acc, s) => acc + (s.xp_total || 0), 0)

  return (
    <div className="perfil-arena">
      <div className="perfil-jogo-header">
        <h3 className="perfil-jogo-titulo">{t('site.perfil.arena_titulo')}</h3>
        <Link to="/games/ldi-arena" className="perfil-jogo-rank">{t('site.perfil.arena_ir_para')}</Link>
      </div>

      {sheets.length > 0 ? (
        <>
          <div className="perfil-trump-stats">
            <div className="perfil-trump-stat"><span className="perfil-trump-stat-val">{sheets.length}</span><span className="perfil-trump-stat-label">{t('site.perfil.arena_fichas')}</span></div>
            <div className="perfil-trump-stat"><span className="perfil-trump-stat-val">{totalXp}</span><span className="perfil-trump-stat-label">{t('site.perfil.arena_xp_total')}</span></div>
            <div className="perfil-trump-stat"><span className="perfil-trump-stat-val">{sheets.reduce((acc, s) => Math.max(acc, (s.enemies_unlocked || []).length), 0)}</span><span className="perfil-trump-stat-label">{t('site.perfil.arena_inimigos')}</span></div>
          </div>
          <div className="perfil-trump-lista">
            {sheets.map((s, i) => {
              const attrs = s.attributes || {}
              return (
                <div key={s.id} className={`perfil-trump-linha${i % 2 === 1 ? ' perfil-trump-linha--alt' : ''}`}>
                  <span className="perfil-trump-linha-info" style={{ fontWeight: 600, flex: 2 }}>{s.sheet_name}</span>
                  <span className="perfil-trump-linha-data" style={{ flex: 2 }}>
                    {['F','H','R','A','PdF'].map(a => `${a}:${attrs[a]||0}`).join(' ')}
                  </span>
                  <span className="perfil-trump-linha-placar">XP: {s.xp_total || 0}</span>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="perfil-trump-empty">
          <p>{t('site.perfil.arena_sem_fichas')}</p>
          <Link to="/games/ldi-arena" className="perfil-trump-cta">{t('site.perfil.arena_ir_para')}</Link>
        </div>
      )}
    </div>
  )
}
