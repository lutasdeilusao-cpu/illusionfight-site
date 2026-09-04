import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import enemiesData from './data/gangues-enemies.json'
import GangDialog from './components/GangDialog'
import GanguesPapo from './components/cena/GanguesPapo'
import GanguesParada from './components/cena/GanguesParada'
import GanguesDescanso from './components/cena/GanguesDescanso'
import { CENAS_POR_ID, portaoAberto, contarCena } from './data/cenas/pista.js'
import { GANGUES_TERRITORIO_POR_ID } from './data/ganguesTerritorios.js'
import './GanguesCena.css'

/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o bairro como CENA navegável
   Uma rua desenhada (SVG) atravessa a tela; os POIs são pinos ao
   longo dela; o token da gangue anda (hop) do pino atual pro próximo
   quando o jogador toca. Revelação progressiva: pino escondido não
   desenha. O chefe só aparece quando o portão abre.

   Substitui o GanguesTerritorio (trilha linear) para os bairros que
   têm cena definida em data/cenas/. Os demais continuam na trilha.
   ══════════════════════════════════════════════════════════════ */

const VIEW_H = 240

function pct(y) { return (y / VIEW_H) * 100 }

export default function GanguesCena({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const territorioId = store.storyTarget?.territorioId
  const cena = CENAS_POR_ID[territorioId] || null
  const terr = GANGUES_TERRITORIO_POR_ID[territorioId] || null

  const prog = store.cenaProgresso[cena?.id] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
  const introKey = `ldi-gangues-cena-intro-${cena?.id}`
  const [intro, setIntro] = useState(() => {
    try { return cena ? !localStorage.getItem(introKey) : false } catch { return false }
  })
  const [tokenPoi, setTokenPoi] = useState(null)
  const [pendente, setPendente] = useState(null)
  const [encontro, setEncontro] = useState(null) // { poi, vs?: bool }
  const [toast, setToast] = useState(null)

  const bossAberto = cena ? portaoAberto(cena, prog.resolvidos) : false
  const folego = prog.folego ?? 100

  // Pinos visíveis (revelação progressiva) + o chefe quando o portão abre.
  const pinos = useMemo(() => {
    if (!cena) return []
    const lista = cena.pois
      .filter(poi => poi.visivel || prog.revelados[poi.id])
      .map(poi => ({ ...poi, estado: estadoPoi(poi, prog) }))
    if (bossAberto) lista.push({ ...cena.chefe, estado: prog.boss ? 'resolvido' : 'disponivel', ehChefe: true })
    return lista
  }, [cena, prog, bossAberto])

  const { feitos, total } = cena ? contarCena(cena, prog.resolvidos, prog.boss) : { feitos: 0, total: 0 }

  // Onde o token está: último pino tocado, senão o primeiro disponível.
  const tokenAlvo = useMemo(() => {
    const byId = id => pinos.find(p => p.id === id)
    return byId(tokenPoi) || pinos.find(p => p.estado === 'disponivel') || pinos[0] || null
  }, [pinos, tokenPoi])

  if (!cena || !terr) {
    return (
      <main className="gang-lobby gang-story">
        <p className="gang-lobby-empty">{t('games.gangues.story.sem_territorio')}</p>
        <button className="gang-new-sheet gang-new-sheet--back" onClick={() => onNavigate('story')}>← {t('games.gangues.story.voltar_mapa')}</button>
      </main>
    )
  }

  const fecharIntro = () => {
    try { localStorage.setItem(introKey, '1') } catch { /* ignora */ }
    setIntro(false)
  }

  const tocarPino = (poi) => {
    if (poi.estado === 'escondido') { sfx.cancel(); return }
    if (poi.estado === 'resolvido' && !poi.repetivel) { sfx.cancel(); return }
    sfx.select()
    if (tokenAlvo?.id === poi.id) { abrirEncontro(poi); return }
    setTokenPoi(poi.id)
    setPendente(poi)
  }

  const abrirEncontro = (poi) => {
    if (poi.tipo === 'treta') setEncontro({ poi, vs: true })
    else setEncontro({ poi })
  }

  // ── Treta: usa o fluxo story-combat existente (GanguesRoute + GanguesVictory) ──
  const iniciarTreta = (poi, { viraTreta, revela } = {}) => {
    const ehChefe = Boolean(poi.ehChefe)
    sfx.vs?.()
    store.setStoryTarget({
      territorioId: terr.id,
      cenaId: cena.id,
      cenaPoiId: poi.id,
      cenaRevela: viraTreta ? (revela || []) : (poi.revela || []),
      cenaRecompensa: viraTreta ? null : poi.recompensa || null,
      pontoIds: terr.pontos.map(p => p.id),
      noId: ehChefe ? cena.chefe.poiNo : null,
      enemyId: viraTreta ? viraTreta.enemy : poi.enemy,
      // viraTreta (punição de papo/parada, ex: bot de treinamento) é ficha
      // fixa e sozinha — não sorteia bando. Treta normal sorteia (ver
      // GanguesRoute → gerarBandoInimigo), com dificuldade alternando por POI.
      fixo: Boolean(viraTreta),
      dificuldade: poi.dificuldade,
      isChefe: ehChefe,
      repDelta: viraTreta?.rep || 0,
    })
    onNavigate('story-combat')
  }

  // ── Desfecho de encontro não-combate ──
  const resolver = (res) => {
    const poi = encontro.poi
    setEncontro(null)
    if (res?.viraTreta) { iniciarTreta(poi, { viraTreta: res.viraTreta, revela: res.revela }); return }

    if (res?.custoGrana) store.gastarGrana(res.custoGrana)
    if (typeof res?.folego === 'number') store.ajustarFolego(cena.id, res.folego)

    const r = res?.recompensa || {}
    if (r.grana) store.ganharGrana(r.grana)
    if (r.rep) store.ganharRep(r.rep)
    if (r.grana || r.rep || r.xp || r.item) {
      setToast(r)
      setTimeout(() => setToast(null), 2600)
    }

    if (!poi.repetivel) store.marcarPoiResolvido(cena.id, poi.id, res?.revela || poi.revela || [])
    else if (res?.revela) store.revelarPoi(cena.id, res.revela)
  }

  // ── Bairro tomado ──
  if (prog.boss) {
    return (
      <main className="gang-lobby gang-story gang-cena" style={{ '--terr-cor': cena.cor }}>
        <div className="gang-cena-tomado">
          <span className="if-eyebrow">IF // {t(`games.gangues.story.territorios.${cena.id}.nome`)}</span>
          <h1>{t('games.gangues.cena.bairro_tomado')}</h1>
          <p>{t(`games.gangues.story.territorios.${cena.id}.desc`)}</p>
          <button className="gang-cena-btn gang-cena-btn--go" onClick={() => onNavigate('story')}>
            {t('games.gangues.story.voltar_mapa')}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="gang-lobby gang-story gang-cena" style={{ '--terr-cor': cena.cor }}>
      <AnimatePresence>
        {intro && (
          <GangDialog
            lines={t(cena.chegada)}
            speaker={t(cena.falante)}
            sub={t(cena.falanteSub)}
            onFinish={fecharIntro}
            onSkip={fecharIntro}
          />
        )}
      </AnimatePresence>

      <header className="gang-cena-top">
        <button className="gang-progression-screen-back" onClick={() => onNavigate('story')}>
          ← {t('games.gangues.story.voltar_mapa')}
        </button>
        <span className="gang-cena-breadcrumb">
          {t(`games.gangues.story.territorios.${cena.id}.nome`)} · {feitos}/{total}
        </span>
      </header>

      <div className="gang-cena-hud">
        <span className="gang-cena-moeda">💵 <b>{store.grana}</b> <i>{t('games.gangues.cena.grana')}</i></span>
        <span className="gang-cena-moeda">⚑ <b>{store.rep}</b> <i>{t('games.gangues.cena.rep')}</i></span>
        <span className={`gang-cena-folego ${folego <= 30 ? 'is-low' : ''}`} title={t('games.gangues.cena.folego')}>
          <span className="gang-cena-folego-bar"><i style={{ '--pct': `${folego}%` }} /></span>
        </span>
      </div>
      {folego <= 30 && <p className="gang-cena-folego-aviso">{t('games.gangues.cena.folego_baixo')}</p>}

      {/* ── A rua ── */}
      <div className="gang-cena-rua-wrap">
        <div className="gang-cena-rua-scroll">
          <svg className="gang-cena-rua-svg" viewBox={`0 0 100 ${VIEW_H}`} preserveAspectRatio="none" aria-hidden="true">
            <path d={cena.ruaPath} className="gang-cena-rua-asfalto" />
            <path d={cena.ruaPath} className="gang-cena-rua-faixa" />
          </svg>

          {/* token da gangue */}
          {tokenAlvo && (
            <motion.span
              className="gang-cena-token"
              initial={false}
              animate={{ left: `${tokenAlvo.pino.x}%`, top: `${pct(tokenAlvo.pino.y)}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              onAnimationComplete={() => {
                if (pendente) { const p = pendente; setPendente(null); abrirEncontro(p) }
              }}
            >
              {(store.gangName || '?')[0]}
            </motion.span>
          )}

          {/* pinos */}
          {pinos.map((poi) => (
            <button
              key={poi.id}
              className={`gang-cena-pino gang-cena-pino--${poi.estado} ${poi.ehChefe ? 'gang-cena-pino--chefe' : ''}`}
              style={{ left: `${poi.pino.x}%`, top: `${pct(poi.pino.y)}%` }}
              onClick={() => tocarPino(poi)}
            >
              <span className="gang-cena-pino-dot" aria-hidden="true">
                {poi.estado === 'resolvido' && !poi.repetivel ? '✓' : poi.ehChefe ? '★' : ICONE[poi.tipo] || '•'}
              </span>
              <span className="gang-cena-pino-label">
                {poi.ehChefe
                  ? t(`games.gangues.story.bosses.${poi.boss}.nome`)
                  : t(`${poi.i18n}.nome`)}
                <em>{t(`games.gangues.cena.tipo.${poi.tipo}`)}{poi.opcional ? ` · ${t('games.gangues.cena.opcional')}` : ''}</em>
              </span>
            </button>
          ))}
        </div>

        {!bossAberto && (
          <p className="gang-cena-boss-lock">🔒 {t('games.gangues.cena.boss_trancado')}</p>
        )}
      </div>

      <button className="gang-lobby-quit" onClick={() => onNavigate('story')}>
        {t('games.gangues.story.voltar_mapa')}
      </button>

      {/* ── Toast de recompensa ── */}
      <AnimatePresence>
        {toast && (
          <motion.div className="gang-cena-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <b>{t('games.gangues.cena.recompensa')}</b>
            {toast.grana ? <span>💵 +{toast.grana}</span> : null}
            {toast.rep ? <span>⚑ +{toast.rep}</span> : null}
            {toast.xp ? <span>⚡ +{toast.xp} XP</span> : null}
            {toast.item ? <span>🎒 {t(`games.gangues.cena.itens.${toast.item}`)}</span> : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Encontro ── */}
      <AnimatePresence>
        {encontro && (
          <motion.div className="gang-cena-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="gang-cena-modal-bg" onClick={() => setEncontro(null)} />
            <motion.div
              className="gang-cena-modal-card"
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              {encontro.vs
                ? <TretaVS poi={encontro.poi} folegoBaixo={folego <= 30} onSim={() => iniciarTreta(encontro.poi)} onNao={() => setEncontro(null)} t={t} />
                : encontro.poi.tipo === 'papo'
                  ? <GanguesPapo poi={encontro.poi} cena={cena} onResolve={resolver} onClose={() => setEncontro(null)} />
                  : encontro.poi.tipo === 'descanso'
                    ? <GanguesDescanso poi={encontro.poi} cena={cena} onClose={() => setEncontro(null)} />
                    : <GanguesParada poi={encontro.poi} cena={cena} onResolve={resolver} onClose={() => setEncontro(null)} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

const ICONE = { treta: '✊', parada: '🔧', papo: '💬', corre: '🏃', achado: '🎒', descanso: '☕' }

function estadoPoi(poi, prog) {
  if (!poi.visivel && !prog.revelados[poi.id]) return 'escondido'
  if (prog.resolvidos[poi.id] && !poi.repetivel) return 'resolvido'
  return 'disponivel'
}

function TretaVS({ poi, folegoBaixo, onSim, onNao, t }) {
  const enemy = enemiesData.find(e => e.id === poi.enemy)
  const nome = poi.ehChefe ? t(`games.gangues.story.bosses.${poi.boss}.nome`) : t(`${poi.i18n}.nome`)
  const fala = poi.ehChefe
    ? t(`games.gangues.story.bosses.${poi.boss}.fala`, { suaGangue: t('games.gangues.report.your_gang') })
    : t(`${poi.i18n}.fala`)
  return (
    <div className="gang-cena-enc gang-cena-enc--vs">
      <span className="gang-cena-enc-selo">{(nome || '?')[0]}</span>
      <span className="gang-cena-eyebrow">{poi.ehChefe ? t('games.gangues.story.boss_tag') : t('games.gangues.cena.tipo.treta')}</span>
      <h3 className="gang-cena-enc-titulo">{nome}</h3>
      <p className="gang-cena-papo-fala">{fala}</p>
      {enemy && (
        <span className="gang-cena-vs-stats">
          {['A', 'H', 'R', 'D'].map(a => <span key={a}><i>{a}</i>{enemy.stats?.[a] ?? '—'}</span>)}
        </span>
      )}
      {folegoBaixo && <p className="gang-cena-vs-aviso">{t('games.gangues.cena.folego_baixo')}</p>}
      <div className="gang-cena-enc-acoes">
        <button className="gang-cena-btn" onClick={onNao}>{t('games.gangues.cena.treta_nao')}</button>
        <button className="gang-cena-btn gang-cena-btn--go" onClick={onSim}>{t('games.gangues.cena.treta_sim')}</button>
      </div>
    </div>
  )
}
