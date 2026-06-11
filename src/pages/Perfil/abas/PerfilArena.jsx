import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { supabase } from '../../../lib/supabase'
import { carregarStats, carregarUltimasPartidas } from '../../../hooks/useTopTrumpsDB'

export default function PerfilArena({ userId }) {
  const { t } = useLanguage()
  const [stats, setStats] = useState({ total_partidas: 0, total_vitorias: 0, total_derrotas: 0, melhor_streak: 0 })
  const [partidas, setPartidas] = useState([])
  const [posicao, setPosicao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!userId) return
    setCarregando(true)
    Promise.all([carregarStats(userId), carregarUltimasPartidas(userId)]).then(([s, p]) => {
      setStats(s); setPartidas(p)
      if (s.total_partidas > 0) {
        supabase.from('toptrumps_stats').select('user_id').order('total_vitorias', { ascending: false }).then(({ data }) => {
          if (data) {
            const idx = data.findIndex(r => r.user_id === userId)
            if (idx >= 0) setPosicao(idx + 1)
          }
        })
      }
      setCarregando(false)
    })
  }, [userId])

  if (carregando) return <div className="perfil-trump-skeleton"><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /></div>

  return (
    <div className="perfil-arena">
      <div className="perfil-jogo-header">
        <h3 className="perfil-jogo-titulo">{t('site.perfil.arena_titulo')}</h3>
        {posicao && <Link to="/leaderboard" className="perfil-jogo-rank">{t('site.perfil.arena_posicao', { posicao })}</Link>}
      </div>

      {stats.total_partidas > 0 ? (
        <>
          <div className="perfil-trump-stats">
            <div className="perfil-trump-stat"><span className="perfil-trump-stat-val">{stats.total_partidas}</span><span className="perfil-trump-stat-label">{t('site.perfil.arena_partidas')}</span></div>
            <div className="perfil-trump-stat"><span className="perfil-trump-stat-val">{stats.total_vitorias}</span><span className="perfil-trump-stat-label">{t('site.perfil.arena_vitorias')}</span></div>
            <div className="perfil-trump-stat"><span className="perfil-trump-stat-val">{stats.total_derrotas}</span><span className="perfil-trump-stat-label">{t('site.perfil.arena_derrotas')}</span></div>
            <div className="perfil-trump-stat"><span className="perfil-trump-stat-val">{stats.melhor_streak}</span><span className="perfil-trump-stat-label">{t('site.perfil.arena_melhor_streak')}</span></div>
          </div>
          <div className="perfil-trump-lista">
            {partidas.map((p, i) => (
              <div key={p.id} className={`perfil-trump-linha${i % 2 === 1 ? ' perfil-trump-linha--alt' : ''}`}>
                <span className="perfil-trump-linha-data">{new Date(p.criada_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                <span className="perfil-trump-linha-icone">{p.resultado === 'vitoria' ? '🏆' : p.resultado === 'derrota' ? '💀' : '🤝'}</span>
                <span className="perfil-trump-linha-info">{p.jogadas} jogadas</span>
                <span className="perfil-trump-linha-placar">{p.vitorias}×{p.derrotas}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="perfil-trump-empty">
          <p>{t('site.perfil.arena_sem_ranking')}</p>
          <Link to="/games/toptrumps" className="perfil-trump-cta">{t('site.perfil.arena_ir_para')}</Link>
        </div>
      )}
    </div>
  )
}
