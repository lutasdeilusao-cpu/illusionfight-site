import { useState } from 'react'
import { useEventos } from '../../../context/EventosContext'
import { useDix } from '../../../context/DixContext'
import { useLanguage } from '../../../context/LanguageContext'
import './PerfilProgresso.css'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'ontem'
  return `${days}d atrás`
}

function iconePorTipo(tipo) {
  const mapa = {
    webtoon_lido: '📖',
    capitulo_lido: '📖',
    sessao_longa: '⏱️',
    jogo_jogado: '🎮',
    caso_resolvido: '🔍',
    arena_vitoria: '⚔️',
    arena_levelup: '⬆️',
    tama_criado: '🥚',
    tama_fase: '🥚',
    lendas_personagem: '📝',
    lendas_act: '🎭',
    trumps_vitoria: '🃏',
    trumps_carta: '🃏',
    jack_caso: '🍺',
    conquista: '🏆',
    minigame_completo: '🎯',
    perfil_completo: '🌟',
  }
  return mapa[tipo] || '📌'
}

export default function PerfilProgresso() {
  const { t } = useLanguage()
  const { eventos, progresso, metasAtingidas, carregandoEventos, registrarEvento, METAS_PROGRESSO, todosEventos } = useEventos()
  const { creditarDix } = useDix()
  const [expandido, setExpandido] = useState(false)
  const [resgatando, setResgatando] = useState(false)

  const jaResgatou = todosEventos.some(e => e.tipo === 'perfil_completo')

  const handleResgatar = async () => {
    if (resgatando || jaResgatou) return
    setResgatando(true)
    await creditarDix(500, 'perfil_100')
    await registrarEvento('perfil_completo', 'Completou 100% do perfil!', 1)
    setResgatando(false)
  }

  if (carregandoEventos) return null

  return (
    <div className="perfil-progresso">
      <div className="perfil-progresso-header" onClick={() => setExpandido(!expandido)}>
        <span className="perfil-progresso-titulo">{t('site.perfil.progresso_titulo')}</span>
        <span className="perfil-progresso-pct">{progresso}%</span>
      </div>

      <div className="perfil-progresso-bar-wrapper">
        <div className="perfil-progresso-bar">
          <div
            className="perfil-progresso-bar-fill"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <span className="perfil-progresso-contagem">{metasAtingidas.length}/{METAS_PROGRESSO.length}</span>
      </div>

      {/* Últimos eventos */}
      {eventos.length > 0 && (
        <div className="perfil-progresso-eventos">
          {eventos.map((ev, i) => (
            <div key={ev.id || i} className="perfil-progresso-evento">
              <span className="perfil-progresso-evento-icone">{iconePorTipo(ev.tipo)}</span>
              <span className="perfil-progresso-evento-desc">{ev.descricao}</span>
              <span className="perfil-progresso-evento-tempo">{timeAgo(ev.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Banner 100% */}
      {progresso === 100 && !jaResgatou && (
        <div className="perfil-progresso-premio">
          <span className="perfil-progresso-premio-icone">🌟</span>
          <span className="perfil-progresso-premio-texto">{t('site.perfil.progresso_100_parabens')}</span>
          <button
            className="perfil-progresso-premio-btn"
            onClick={handleResgatar}
            disabled={resgatando}
          >
            {resgatando ? t('site.perfil.progresso_resgatando') : t('site.perfil.progresso_resgatar')}
          </button>
        </div>
      )}

      {jaResgatou && progresso === 100 && (
        <div className="perfil-progresso-premio perfil-progresso-premio--resgatado">
          <span className="perfil-progresso-premio-icone">✅</span>
          <span className="perfil-progresso-premio-texto">{t('site.perfil.progresso_ja_resgatou')}</span>
        </div>
      )}

      {/* Lista expandida de metas */}
      {expandido && (
        <div className="perfil-progresso-metas">
          {METAS_PROGRESSO.map(meta => {
            const atingida = metasAtingidas.includes(meta.id)
            return (
              <div key={meta.id} className={`perfil-progresso-meta${atingida ? '--ok' : '--pendente'}`}>
                <span className="perfil-progresso-meta-status">{atingida ? '✓' : '○'}</span>
                <span className="perfil-progresso-meta-label">{meta.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
