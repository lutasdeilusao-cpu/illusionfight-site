import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useReader } from '../../../context/ReaderContext'
import { useEventos } from '../../../context/EventosContext'
import { useLendasStore } from './store/useLendasStore'
import { veiaPorId, romano } from './data/veias'
import Narrativa, { arteDe } from './components/Narrativa'
import Escolhas from './components/Escolhas'
import Diario from './components/Diario'
import PuzzleRouter from './components/PuzzleRouter'
import LutaRitmo from './batalha/LutaRitmo'
import { INIMIGOS } from './batalha/campanha'
import { ligarSom, somPagina } from './batalha/som'
import './Lendas.css'

export default function Game() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const { registrarEvento } = useEventos()
  const { save, cena, escolhas, aprendeu, iniciar, escolher, addPista, limparAprendeu } = useLendasStore()
  const [pronto, setPronto] = useState(false)
  const [diario, setDiario] = useState(false)
  const [puzzle, setPuzzle] = useState(null)
  const [luta, setLuta] = useState(null) // { escolha, tentativa, abertura, vs }
  const [escolhaAberta, setEscolhaAberta] = useState(false)
  const [vencidaEm, setVencidaEm] = useState(null) // cena cuja luta de abertura já foi vencida
  const [capitulo, setCapitulo] = useState(null)
  const [capsVistos] = useState(() => new Set())

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])
  useEffect(() => { if (!save.nome) navigate('/games/ldi') }, [save.nome, navigate])
  useEffect(() => { if (save.nome) iniciar(locale) }, [locale]) // eslint-disable-line react-hooks/exhaustive-deps

  // O som nasce no primeiro toque (o navegador não deixa antes).
  useEffect(() => {
    const ligar = () => ligarSom()
    window.addEventListener('pointerdown', ligar, { once: true })
    return () => window.removeEventListener('pointerdown', ligar)
  }, [])

  useEffect(() => {
    somPagina() // virou a página (antes do 1º toque não toca: o som ainda não nasceu)
    setPronto(false)
    setEscolhaAberta(false)
    if (cena?.capitulo && !capsVistos.has(cena.id)) { capsVistos.add(cena.id); setCapitulo(cena) }
    window.scrollTo(0, 0)
  }, [cena, capsVistos])

  // Cena de briga (com `luta` no topo e uma escolha só, que leva o inimigo):
  // a batalha abre ANTES da narração. Vencida, o texto conta como foi e a
  // escolha só segue a história.
  const lutaDaCena = cena?.luta && escolhas.length === 1 && escolhas[0].luta ? escolhas[0] : null
  useEffect(() => {
    if (!lutaDaCena || vencidaEm === cena.id) return
    ligarSom()
    setLuta({ escolha: lutaDaCena, tentativa: 0, abertura: true, vs: true })
  }, [cena?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!aprendeu) return
    const tm = setTimeout(limparAprendeu, 3600)
    return () => clearTimeout(tm)
  }, [aprendeu, limparAprendeu])

  useEffect(() => {
    if (save.status === 'vitoria') registrarEvento('lendas_act', 'Completou o Act 1 em Lendas do LDI', 1)
  }, [save.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Acabou de contar a página: as escolhas abrem no centro da tela.
  const onPronto = useCallback(() => { setPronto(true); setEscolhaAberta(true) }, [])
  // Escolha com `luta` (id do inimigo da campanha) abre a luta rítmica
  // por cima da cena. Venceu, segue; perdeu, vai pro `next_falha` ou tenta de novo.
  const onEscolher = ch => {
    if (ch.luta && vencidaEm !== cena.id) { ligarSom(); setEscolhaAberta(false); setLuta({ escolha: ch, tentativa: 0, vs: true }); return }
    if (ch.isPuzzle) setPuzzle(ch); else escolher(ch)
  }
  const fimLuta = resultado => {
    const ch = luta.escolha
    if (resultado === 'vitoria' && luta.abertura) { setLuta(null); setVencidaEm(cena.id) }
    else if (resultado === 'vitoria') { setLuta(null); escolher(ch) }
    else if (ch.next_falha) { setLuta(null); escolher(ch, true) }
    else setLuta(l => ({ ...l, tentativa: l.tentativa + 1 }))
  }
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
          {veia ? `${veia.icone} ${t(`games.ldi.veias.${veia.id}.nome`)} · ${save.habilidades.length}/3` : t('games.ldi.jogo.diario')}
        </button>
      </header>

      {/* Cada cena é uma página: a anterior vira (dobra pela esquerda) e a nova aparece embaixo. */}
      <div className="ld-livro">
      <AnimatePresence mode="wait" initial={false}>
      <motion.main className="ld-cena ld-pagina" key={cena.id}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1, transition: { duration: 0.35 } }}
        exit={{ rotateY: -115, opacity: 0.2, transition: { duration: 0.55, ease: [0.55, 0, 0.75, 0.3] } }}>
        {cena.luta
          ? <p className="ld-cena__luta"><span>{t('games.ldi.jogo.luta')}</span>{cena.luta}</p>
          : <p className="if-eyebrow">{cena.capitulo || t('games.ldi.jogo.ato', { n: romano(save.ato) })}</p>}
        <h1 className={`ld-cena__titulo${cena.destaque ? ' is-destaque' : ''}`}>{cena.title}</h1>
        <Narrativa cenaId={cena.id} linhas={cena.text} veia={save.veia} habilidades={save.habilidades} nome={save.nome} onPronto={onPronto} />
        {pronto
          ? <button type="button" className="if-btn if-btn--primary ld-abrir-escolha" onClick={() => setEscolhaAberta(true)}>{t('games.ldi.jogo.abrir_escolha')}</button>
          : <p className="ld-cena__toque">{t('games.ldi.jogo.continuar')}</p>}
      </motion.main>
      </AnimatePresence>
      </div>

      <AnimatePresence>
        {capitulo && (
          <motion.div key="capitulo" className="ld-capitulo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCapitulo(null)} onAnimationComplete={() => setTimeout(() => setCapitulo(null), 1800)}>
            {/* capa do capítulo: a primeira arte dele, escurecida, com o título por cima */}
            {arteDe(`${capitulo.id}-1`) && <motion.img className="ld-capitulo__capa" src={arteDe(`${capitulo.id}-1`)} alt=""
              initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2.6, ease: 'easeOut' }} />}
            <motion.span initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>{t('games.ldi.jogo.ato', { n: romano(save.ato) })}</motion.span>
            <motion.strong initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 14 }}>{capitulo.capitulo}</motion.strong>
          </motion.div>
        )}
        {aprendeu && veia && (
          <motion.div key="aprendeu" className="ld-aprendeu" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} onClick={limparAprendeu}>
            <small>{veia.icone} {t('games.ldi.jogo.aprendeu')}</small>
            <b>{t(`games.ldi.habilidades.${aprendeu}.nome`)}</b>
            <span>{t(`games.ldi.habilidades.${aprendeu}.desc`)}</span>
          </motion.div>
        )}
        {diario && <Diario key="diario" t={t} save={save} onFechar={() => setDiario(false)} />}
        {/* A história da página acabou: a escolha sobe pro centro da tela, por cima do quadrinho. */}
        {pronto && escolhaAberta && !luta && !capitulo && escolhas.length > 0 && (
          <motion.div key={`escolha-${cena.id}`} className="ld-escolha-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="ld-escolha-overlay__caixa" initial={{ scale: 0.8, rotate: -2, y: 30 }} animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}>
              <Escolhas t={t} escolhas={escolhas} veiaJogador={save.veia} onEscolher={onEscolher} />
              <button type="button" className="ld-reler" onClick={() => setEscolhaAberta(false)}>{t('games.ldi.jogo.reler')}</button>
            </motion.div>
          </motion.div>
        )}
        {/* Antes da luta: splash page de quadrinho, você contra ele. A luta carrega por baixo. */}
        {luta?.vs && (
          <motion.div key="vs" className="ld-vs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.15 }}
            onAnimationComplete={() => setTimeout(() => setLuta(l => (l ? { ...l, vs: false } : l)), 1900)}>
            <motion.span className="ld-vs__voce" initial={{ x: -200 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>{save.nome}</motion.span>
            <motion.b className="ld-vs__x" initial={{ scale: 3, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 12 }}>VS</motion.b>
            <motion.span className="ld-vs__ele" initial={{ x: 200 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>{t(`games.ldi.batalha.inimigos.${luta.escolha.luta}.nome`)}</motion.span>
            <motion.strong className="ld-vs__grito" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring', stiffness: 320, damping: 10 }}>{t('games.ldi.jogo.vs_grito')}</motion.strong>
          </motion.div>
        )}
      </AnimatePresence>

      {luta && (
        <div className="ld-luta">
          <LutaRitmo key={luta.tentativa} t={t} ficha={INIMIGOS.find(i => i.id === luta.escolha.luta)}
            onSair={() => (luta.abertura ? navigate('/games/ldi') : setLuta(null))} onResultado={fimLuta} />
        </div>
      )}
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
        <p className="ld-fim__veia">{veia.icone} {t(`games.ldi.veias.${veia.id}.nome`)} · {t('games.ldi.fim.habilidades', { n: save.habilidades.length })}</p>
      )}
      <p className="ld-fim__decisoes">{t('games.ldi.fim.decisoes', { n: save.diario.length })}</p>
      <p className="ld-fim__replay">{t('games.ldi.fim.replay')}</p>
      <button type="button" className="if-btn if-btn--primary" onClick={onSair}>{t('games.ldi.fim.lobby')}</button>
    </div>
  )
}
