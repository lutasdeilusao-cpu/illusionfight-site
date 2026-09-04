import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import enemiesData from './data/gangues-enemies.json'
import { GANGUES_TERRITORIO_POR_ID, estadoNo, estadoTerritorio, totalNos } from './data/ganguesTerritorios.js'
import './GanguesStory.css'

/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — dentro de um território
   Os pontos a dominar viram uma trilha. Cada ponto é uma luta;
   o último é o chefe, que só abre com todos os pontos dominados.

   Ao entrar num ponto: apresentação curta do desafiante (NeoGuide
   ou o próprio inimigo) e então a batalha. Aqui é só o esqueleto —
   o Isaias põe arte dos chefes e os diálogos depois.
   ══════════════════════════════════════════════════════════════ */

export default function GanguesTerritorio({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const terr = GANGUES_TERRITORIO_POR_ID[store.storyTarget?.territorioId] || null
  const [confronto, setConfronto] = useState(null) // { no, enemy, isChefe }

  if (!terr) {
    return (
      <main className="gang-lobby gang-story">
        <p className="gang-lobby-empty">{t('games.gangues.story.sem_territorio')}</p>
        <button className="gang-new-sheet gang-new-sheet--back" onClick={() => onNavigate('story')}>← {t('games.gangues.story.voltar_mapa')}</button>
      </main>
    )
  }

  const progresso = store.storyProgress
  const estadoTerr = estadoTerritorio(terr, progresso)
  const nos = [...terr.pontos.map(p => ({ ...p, isChefe: false })), { ...terr.chefe, isChefe: true }]

  const abrirConfronto = (no) => {
    const estado = estadoNo(terr, no.id, progresso)
    if (estado === 'trancado') { sfx.cancel(); return }
    sfx.select()
    const enemy = enemiesData.find(e => e.id === no.enemy)
    setConfronto({ no, enemy, isChefe: no.isChefe, estado })
  }

  const iniciarLuta = () => {
    if (!confronto) return
    sfx.vs?.()
    store.setStoryTarget({
      territorioId: terr.id,
      noId: confronto.no.id,
      enemyId: confronto.no.enemy,
      isChefe: confronto.isChefe,
    })
    // GanguesRoute lê o storyTarget e monta a batalha.
    onNavigate('story-combat')
  }

  return (
    <main className="gang-lobby gang-story gang-story-terr-view" style={{ '--terr-cor': terr.cor }}>
      <header className="gang-story-head">
        <button className="gang-progression-screen-back" onClick={() => onNavigate('story')}>
          ← {t('games.gangues.story.voltar_mapa')}
        </button>
      </header>

      <div className="gang-story-terr-hero">
        <span className="if-eyebrow">{t(`games.gangues.story.dificuldades.${terr.dificuldade}`)}</span>
        <h1 className="gang-story-terr-titulo">{t(`games.gangues.story.territorios.${terr.id}.nome`)}</h1>
        <p className="gang-story-terr-desc">{t(`games.gangues.story.territorios.${terr.id}.desc`)}</p>
        {estadoTerr === 'dominado' && <span className="gang-story-terr-dominado">⚑ {t('games.gangues.story.dominado')}</span>}
      </div>

      {/* ── A trilha de pontos ── */}
      <ol className="gang-story-trilha">
        {nos.map((no, i) => {
          const estado = estadoNo(terr, no.id, progresso)
          const enemy = enemiesData.find(e => e.id === no.enemy)
          return (
            <motion.li
              key={no.id}
              className={`gang-story-no gang-story-no--${estado} ${no.isChefe ? 'gang-story-no--chefe' : ''}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}
            >
              <button className="gang-story-no-btn" onClick={() => abrirConfronto(no)} disabled={estado === 'trancado'}>
                <span className="gang-story-no-marca">
                  {estado === 'dominado' ? '✓' : no.isChefe ? '★' : i + 1}
                </span>
                <span className="gang-story-no-info">
                  <strong>{t(`games.gangues.story.gangues.${no.gangue}`)}</strong>
                  <small>
                    {no.isChefe ? t('games.gangues.story.gangue_dominante') : t('games.gangues.story.ponto_n', { n: i + 1 })}
                    {' · '}
                    <span className="gang-story-no-forca" aria-hidden="true">{'◆'.repeat(no.forca || 1)}{'◇'.repeat(Math.max(0, 5 - (no.forca || 1)))}</span>
                  </small>
                </span>
                {estado === 'atual' && <span className="gang-story-no-vai">{t('games.gangues.story.enfrentar')} →</span>}
                {estado === 'trancado' && <span className="gang-story-no-lock" aria-hidden="true">🔒</span>}
              </button>
            </motion.li>
          )
        })}
      </ol>

      <button className="gang-lobby-quit" onClick={() => onNavigate('story')}>
        {t('games.gangues.story.voltar_mapa')}
      </button>

      {/* ── Apresentação do desafiante antes da luta ── */}
      <AnimatePresence>
        {confronto && (
          <motion.div className="gang-story-vs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="gang-story-vs-bg" onClick={() => setConfronto(null)} />
            <motion.div
              className={`gang-story-vs-card ${confronto.isChefe ? 'gang-story-vs-card--chefe' : ''}`}
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 210, damping: 20 }}
            >
              <span className="gang-story-vs-avatar">{(t(`games.gangues.story.gangues.${confronto.no.gangue}`) || '?')[0]}</span>
              <span className="gang-story-vs-tag">
                {confronto.no.ehAlan
                  ? t('games.gangues.story.confronto_final')
                  : confronto.isChefe ? t('games.gangues.story.gangue_dominante') : t('games.gangues.story.desafiante')}
              </span>
              <h3 className="gang-story-vs-nome">{t(`games.gangues.story.gangues.${confronto.no.gangue}`)}</h3>
              <p className="gang-story-vs-fala">
                {t(`games.gangues.story.falas.${confronto.no.ehAlan ? 'alan' : confronto.isChefe ? 'chefe' : 'ponto'}`, {
                  territorio: t(`games.gangues.story.territorios.${terr.id}.nome`),
                  gangue: t(`games.gangues.story.gangues.${confronto.no.gangue}`),
                })}
              </p>
              {confronto.enemy && (
                <span className="gang-story-vs-stats">
                  {['A', 'H', 'R', 'D'].map(a => (
                    <span key={a}><i>{a}</i>{confronto.enemy.stats?.[a] ?? '—'}</span>
                  ))}
                </span>
              )}
              <div className="gang-story-vs-acoes">
                <button className="gang-story-vs-no" onClick={() => setConfronto(null)}>{t('games.gangues.story.agora_nao')}</button>
                <button className="gang-story-vs-yes" onClick={iniciarLuta}>{t('games.gangues.story.brigar')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
