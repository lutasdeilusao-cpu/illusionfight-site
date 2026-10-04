import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useReader } from '../../../context/ReaderContext'
import { useEventos } from '../../../context/EventosContext'
import { useLendasStore } from './store/useLendasStore'
import { veiaPorId, romano } from './data/veias'
import Narrativa from './components/Narrativa'
import Escolhas from './components/Escolhas'
import Diario from './components/Diario'
import PuzzleRouter from './components/PuzzleRouter'
import './Lendas.css'

export default function Game() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const { registrarEvento } = useEventos()
  const { save, cena, escolhas, subiu, iniciar, escolher, addPista, limparSubida } = useLendasStore()
  const [pronto, setPronto] = useState(false)
  const [diario, setDiario] = useState(false)
  const [puzzle, setPuzzle] = useState(null)
  const [capitulo, setCapitulo] = useState(null)
  const [capsVistos] = useState(() => new Set())

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])
  useEffect(() => { if (!save.nome) navigate('/games/ldi') }, [save.nome, navigate])
  useEffect(() => { if (save.nome) iniciar(locale) }, [locale]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPronto(false)
    if (cena?.capitulo && !capsVistos.has(cena.id)) { capsVistos.add(cena.id); setCapitulo(cena) }
    window.scrollTo(0, 0)
  }, [cena, capsVistos])

  useEffect(() => {
    if (!subiu) return
    const tm = setTimeout(limparSubida, 3200)
    return () => clearTimeout(tm)
  }, [subiu, limparSubida])

  useEffect(() => {
    if (save.status === 'vitoria') registrarEvento('lendas_act', 'Completou o Act 1 em Lendas do LDI', 1)
  }, [save.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const onPronto = useCallback(() => setPronto(true), [])
  const onEscolher = ch => (ch.isPuzzle ? setPuzzle(ch) : escolher(ch))
  const fimPuzzle = (resolvido, pista) => {
    if (pista) addPista(pista)
    const ch = puzzle
    setPuzzle(null)
    escolher(ch, !resolvido)
  }

  if (save.status !== 'ativo') return <Fim t={t} save={save} onSair={() => navigate('/games/ldi')} />
  if (!cena) return <div className="ld-page ld-carregando">{t('games.ldi.jogo.carregando')}</div>

  const veia = veiaPorId(save.veia)
  return (
    <div className={`ld-page${cena.luta ? ' is-luta' : ''}`} style={veia ? { '--veia-cor': veia.cor } : undefined}>
      <header className="ld-barra">
        <button type="button" className="ld-barra__btn" onClick={() => navigate('/games/ldi')}>← {t('games.ldi.jogo.sair')}</button>
        <span className="ld-barra__ato">{t('games.ldi.jogo.ato', { n: romano(save.ato) })}</span>
        <button type="button" className="ld-barra__btn ld-barra__veia" onClick={() => setDiario(true)}>
          {veia ? `${veia.icone} ${t(`games.ldi.veias.${veia.id}.nome`)} ${romano(save.nivel)}` : t('games.ldi.jogo.diario')}
        </button>
      </header>

      <main className="ld-cena" key={cena.id}>
        {cena.luta
          ? <p className="ld-cena__luta"><span>{t('games.ldi.jogo.luta')}</span>{cena.luta}</p>
          : <p className="if-eyebrow">{cena.capitulo || t('games.ldi.jogo.ato', { n: romano(save.ato) })}</p>}
        <h1 className={`ld-cena__titulo${cena.destaque ? ' is-destaque' : ''}`}>{cena.title}</h1>
        <Narrativa linhas={cena.text} veia={save.veia} nome={save.nome} onPronto={onPronto} />
        {pronto
          ? <Escolhas t={t} escolhas={escolhas} onEscolher={onEscolher} />
          : <p className="ld-cena__toque">{t('games.ldi.jogo.continuar')}</p>}
      </main>

      <AnimatePresence>
        {capitulo && (
          <motion.div key="capitulo" className="ld-capitulo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCapitulo(null)} onAnimationComplete={() => setTimeout(() => setCapitulo(null), 1800)}>
            <span>{t('games.ldi.jogo.ato', { n: romano(save.ato) })}</span>
            <strong>{capitulo.capitulo}</strong>
          </motion.div>
        )}
        {subiu > 0 && veia && (
          <motion.div key="subiu" className="ld-subiu" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
            <small>{t('games.ldi.jogo.subiu')}</small>
            <b>{veia.icone} {t(`games.ldi.veias.${veia.id}.nome`)} {romano(subiu)} · {t(`games.ldi.niveis.${subiu}.nome`)}</b>
            <span>{t(`games.ldi.niveis.${subiu}.explica`)}</span>
          </motion.div>
        )}
        {diario && <Diario key="diario" t={t} save={save} onFechar={() => setDiario(false)} />}
      </AnimatePresence>

      {puzzle && (
        <div className="ld-puzzle">
          <PuzzleRouter t={t} type={puzzle.puzzleType} difficulty={puzzle.puzzleDiff || 3} onComplete={fimPuzzle} />
        </div>
      )}
    </div>
  )
}

function Fim({ t, save, onSair }) {
  const veia = veiaPorId(save.veia)
  const s = save.status
  return (
    <div className="ld-page ld-fim" style={veia ? { '--veia-cor': veia.cor } : undefined}>
      <p className="if-eyebrow">{t('games.ldi.fim.jornada')} · {save.nome}</p>
      <h1 className={`ld-fim__titulo is-${s}`}>{t(`games.ldi.fim.${s}_titulo`)}</h1>
      <p className="ld-fim__texto">{t(`games.ldi.fim.${s}_texto`)}</p>
      {veia && (
        <p className="ld-fim__veia">{veia.icone} {t(`games.ldi.veias.${veia.id}.nome`)} {romano(save.nivel)} · {t(`games.ldi.niveis.${save.nivel}.nome`)}</p>
      )}
      <p className="ld-fim__decisoes">{t('games.ldi.fim.decisoes', { n: save.diario.length })}</p>
      <p className="ld-fim__replay">{t('games.ldi.fim.replay')}</p>
      <button type="button" className="if-btn if-btn--primary" onClick={onSair}>{t('games.ldi.fim.lobby')}</button>
    </div>
  )
}
