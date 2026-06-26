import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CASOS } from './data/casos'
import { usePPStore } from './store/usePPStore'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import PuzzleDecoder from '../../../components/Puzzles/PuzzleDecoder'
import PuzzleStealthGrid from '../../../components/Puzzles/PuzzleStealthGrid'
import PuzzleLabirinto from '../../../components/Puzzles/PuzzleLabirinto'
import PuzzleAnagrama from '../../../components/Puzzles/PuzzleAnagrama'
import PuzzleSlidingTiles from '../../../components/Puzzles/PuzzleSlidingTiles'
import { getTelefonema } from './data/telefonema'
import { useLanguage } from '../../../context/LanguageContext'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { PP_VERSION } from '../../../config/version'
import './PP.css'

const AVATARES = {
  jack:     { emoji: '🕵️', cor: '#1a3a2a', textCor: '#00ff88',  label: 'Jack' },
  nina:     { emoji: '⚔️',  cor: '#2a1a1a', textCor: '#ff8888',  label: 'Nina' },
  kim:      { emoji: '🔥',  cor: '#1a2a3a', textCor: '#00ccff',  label: 'Kim' },
  pajé:     { emoji: '🪄',  cor: '#2a2a1a', textCor: '#ffd700',  label: 'Pajé' },
  anonimo:  { emoji: '❓',  cor: '#1a1a1a', textCor: '#888888',  label: 'Desconhecido' },
  helena:   { emoji: '🚬',  cor: '#1a1a1a', textCor: '#c8c8c8',  label: 'Helena' },
  shuntaro: { emoji: '⚡',  cor: '#1a1a2a', textCor: '#8888ff',  label: 'Shuntaro' },
}

const PUZZLE_EMOJI = {
  decoder: '📻', stealth: '🥷', labirinto: '🌀',
  anagrama: '🔤', sliding: '🧩', nenhum: '🔍',
}

// ── INIMIGOS POR NÍVEL ──────────────────────────────
const INIMIGOS_NIVEL = {
  1:  { nome: { pt:'Capanga de Terno', en:'Suit Thug', es:'Matón de Traje' },     hp: 30, dano: [2,5],  xp: 20,  emoji: '🕴️' },
  2:  { nome: { pt:'Segurança Corrupto', en:'Corrupt Guard', es:'Guardia Corrupto' },   hp: 45, dano: [3,7],  xp: 30,  emoji: '👮' },
  3:  { nome: { pt:'Detetive Infiltrado', en:'Undercover Detective', es:'Detective Infiltrado' },  hp: 60, dano: [4,8],  xp: 40,  emoji: '🔎' },
  4:  { nome: { pt:'Assassino de Aluguel', en:'Hitman', es:'Sicario' }, hp: 80, dano: [5,10], xp: 55,  emoji: '🗡️' },
  5:  { nome: { pt:'Agente de Kronos', en:'Kronos Agent', es:'Agente de Kronos' },     hp: 100,dano: [6,12], xp: 70,  emoji: '⚓' },
}

function getInimigo(nivel, locale = 'pt') {
  const tier = Math.min(5, Math.ceil(nivel / 4))
  const base = INIMIGOS_NIVEL[tier]
  return { ...base, nome: base.nome[locale] || base.nome.pt }
}

function getJackStats(nivel) {
  return {
    hp: 30 + nivel * 5,
    dano: [3 + nivel, 6 + nivel * 2],
    emoji: '🕵️',
  }
}

// ── UTILS ──────────────────────────────────────────
function rolar(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ══════════════════════════════════════════════════
// INTRO NOIR
// ══════════════════════════════════════════════════
function IntroNoir({ onComplete }) {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [fase, setFase] = useState('typing')
  const fullText = t('pp.intro.texto')
  const idx = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    // gotas de chuva
    const rain = document.querySelector('.pp-rain')
    if (rain) {
      for (let i = 0; i < 40; i++) {
        const d = document.createElement('div')
        d.className = 'pp-rain-drop'
        d.style.cssText = `left:${Math.random()*100}%;height:${60+Math.random()*80}px;animation-duration:${0.6+Math.random()*0.8}s;animation-delay:${Math.random()*2}s;opacity:${0.2+Math.random()*0.4}`
        rain.appendChild(d)
      }
    }
    timerRef.current = setInterval(() => {
      idx.current++
      setText(fullText.slice(0, idx.current))
      if (idx.current >= fullText.length) {
        clearInterval(timerRef.current)
        setFase('pause')
        setTimeout(() => setFase('glitch'), 2000)
        setTimeout(() => onComplete(), 3200)
      }
    }, 45)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div className="pp-intro" onClick={() => { clearInterval(timerRef.current); onComplete() }}>
      <div className="pp-rain" />
      <div className="pp-intro-label">{t('pp.intro.titulo')}</div>
      <div className="pp-intro-text">
        {text.split('\n').map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <><br /><br /></>}</span>
        ))}
        {fase === 'typing' && <span className="pp-intro-cursor" />}
      </div>
      {fase === 'glitch' && <div className="pp-glitch-overlay" />}
      <div className="pp-intro-skip">
        {t('pp.intro.pular')}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// TELA FINAL — CRÉDITOS
// ══════════════════════════════════════════════════
function TelaFinal({ nivel, casosResolvidos, onVoltarInicio }) {
  const { t } = useLanguage()
  const [fase, setFase] = useState('chat')
  const [texto, setTexto] = useState('')
  const idxRef = useRef(0)

  const msgFinal = t('pp.final.msg_jack')

  useEffect(() => {
    if (fase !== 'chat') return
    const t = setInterval(() => {
      idxRef.current++
      setTexto(msgFinal.slice(0, idxRef.current))
      if (idxRef.current >= msgFinal.length) { clearInterval(t); setTimeout(() => setFase('creditos'), 3000) }
    }, 40)
    return () => clearInterval(t)
  }, [fase])

  useEffect(() => {
    if (fase !== 'creditos') return
    const t = setTimeout(() => setFase('final'), 9000)
    return () => clearTimeout(t)
  }, [fase])

  if (fase === 'chat') {
    return (
      <div className="pp-final-chat">
        <div className="pp-convo-header">
          <span className="pp-amber-mono-sm">{t('pp.final.jack_label')}</span>
        </div>
        <div className="pp-final-chat-body">
          <div className="pp-final-chat-msg">
            <div className="pp-final-chat-avatar">🕵️</div>
            <div className="pp-final-chat-bubble">
              <div className="pp-final-chat-bubble-text">
                {texto}
                <span className="pp-cursor-blink" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'creditos') {
    return (
      <div className="pp-final-credits">
        <div className="pp-rain" />
        <div className="pp-credits-roll">
          <p className="pp-credits-title">{t('pp.final.creditos_titulo')}</p>
          <p className="pp-credits-sub">{t('pp.final.creditos_temporada')}</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line">{t('pp.final.creditos_historia')}</p>
          <p className="pp-credits-line pp-credits-line--md">{t('pp.final.creditos_marelia')}</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line">{t('pp.final.creditos_escrito')}</p>
          <p className="pp-credits-line pp-credits-line--lg">{t('pp.final.creditos_autor')}</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line pp-credits-line--mt2">{t('pp.final.creditos_obrigado')}</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line pp-credits-line--sm">{t('pp.final.creditos_prox_temp')}</p>
          <p className="pp-credits-spacer" />
        </div>
      </div>
    )
  }

  return (
    <div className="pp-final-screen">
      <div className="pp-rain" />
      <div className="pp-page-content">
        <h1 className="pp-credits-h1">{t('pp.final.creditos_titulo')}</h1>
        <p className="pp-text-mono-muted pp-text-mb2">{t('pp.final.nivel_casos_label', { nivel, casos: casosResolvidos.length })}</p>
        <button onClick={() => {
          const txt = `${t('pp.final.compartilhar')} — ${t('pp.final.nivel_casos_label', { nivel, casos: casosResolvidos.length })}.\nlutasdeilusao-cpu.github.io/illusionfight-site`
          if (navigator.share) navigator.share({ title:t('pp.final.creditos_titulo'), text:txt })
          else navigator.clipboard?.writeText(txt).then(() => alert(t('pp.final.link_copiado')))
        }}
          className="pp-btn-share">
          {t('pp.final.compartilhar')}
        </button>
        <button onClick={onVoltarInicio}
          className="pp-btn-back-link">
          {t('pp.final.voltar_inicio')}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// ANIMAÇÃO INVESTIGAÇÃO SEM PUZZLE
// ══════════════════════════════════════════════════
function AnimacaoInvestigacao({ onComplete }) {
  const { t } = useLanguage()
  const [fase, setFase] = useState('pegadas') // pegadas | lupa | revelando

  useEffect(() => {
    const t1 = setTimeout(() => setFase('lupa'), 2000)
    const t2 = setTimeout(() => setFase('revelando'), 3500)
    const t3 = setTimeout(() => onComplete(), 4800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="pp-anim-invest">
      <AnimatePresence mode="wait">
        {fase === 'pegadas' && (
          <motion.div key="pegadas" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="pp-flex-center-gap-sm">
            {['👣','👣','👣'].map((p,i) => (
              <motion.span key={i} className="pp-footprint-icon"
                initial={{ opacity:0, x:-10 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.4 }}>
                {p}
              </motion.span>
            ))}
          </motion.div>
        )}
        {fase === 'lupa' && (
          <motion.div key="lupa" initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }}
            transition={{ type:'spring', stiffness:200 }}>
            <span className="pp-magnifier-icon">🔍</span>
          </motion.div>
        )}
        {fase === 'revelando' && (
          <motion.div key="revelando" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <span className="pp-evidence-found">
              {t('pp.local.evidencia_encontrada')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pp-progress-bar">
        <motion.div className="pp-progress-fill"
          initial={{ width:'0%' }} animate={{ width:'100%' }} transition={{ duration:4.5, ease:'linear' }} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// SISTEMA DE BATALHA
// ══════════════════════════════════════════════════
function BatalhaView({ nivel, onVitoria, onDerrota }) {
  const { t, locale } = useLanguage()
  const inimigo = getInimigo(nivel, locale)
  const jackBase = getJackStats(nivel)

  const [jackHp, setJackHp] = useState(jackBase.hp)
  const [inimigoHp, setInimigoHp] = useState(inimigo.hp)
  const [log, setLog] = useState([])
  const [turno, setTurno] = useState('player') // player | inimigo | fim
  const [resultado, setResultado] = useState(null)
  const [animAtaque, setAnimAtaque] = useState(null)
  const logRef = useRef(null)

  const addLog = (texto, tipo = 'normal') => {
    setLog(prev => [...prev, { texto, tipo, id: Date.now() + Math.random() }])
    setTimeout(() => logRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 50)
  }

  const atacarInimigo = () => {
    if (turno !== 'player' || resultado) return
    const dano = rolar(...jackBase.dano)
    const novoHp = Math.max(0, inimigoHp - dano)
    setAnimAtaque('jack')
    setTimeout(() => setAnimAtaque(null), 400)
    setInimigoHp(novoHp)
    addLog(t('pp.batalha.jack_ataca', { dano }), 'player')

    if (novoHp <= 0) {
      addLog(t('pp.batalha.inimigo_derrotado'), 'vitoria')
      setResultado('vitoria')
      setTurno('fim')
      setTimeout(() => onVitoria(), 1500)
      return
    }

    setTurno('inimigo')
    setTimeout(() => {
      const danoInimigo = rolar(...inimigo.dano)
      const novoJackHp = Math.max(0, jackHp - danoInimigo)
      setAnimAtaque('inimigo')
      setTimeout(() => setAnimAtaque(null), 400)
      setJackHp(novoJackHp)
      addLog(t('pp.batalha.inimigo_ataca', { nome: inimigo.nome, dano: danoInimigo }), 'inimigo')

      if (novoJackHp <= 0) {
        addLog(t('pp.batalha.jack_derrotado'), 'derrota')
        setResultado('derrota')
        setTurno('fim')
        setTimeout(() => onDerrota(), 1500)
        return
      }
      setTurno('player')
    }, 900)
  }

  const hpPct = (hp, max) => Math.max(0, (hp / max) * 100)

  return (
    <div className="pp-battle-section">
      <div className="pp-battle-header">
        {t('pp.batalha.titulo', { nivel })}
      </div>

      {/* Inimigo */}
      <motion.div animate={animAtaque === 'inimigo' ? { x: [0, 8, -8, 0] } : {}} className="pp-battle-card">
        <div className="pp-battle-card-row">
          <span className="pp-battle-card-icon">{inimigo.emoji}</span>
          <div className="pp-battle-card-info">
            <div className="pp-battle-card-name pp-battle-text-nina">{inimigo.nome}</div>
            <div className="pp-battle-card-hp">HP: {inimigoHp}/{inimigo.hp}</div>
          </div>
        </div>
        <div className="pp-hp-bar">
          <motion.div animate={{ width: `${hpPct(inimigoHp, inimigo.hp)}%` }} transition={{ duration:0.3 }}
            className="pp-hp-bar-fill" style={{ background:'var(--pp-nina)' }} />
        </div>
      </motion.div>

      {/* Log */}
      <div ref={logRef} className="pp-battle-log">
        {log.length === 0 && <div className="pp-battle-log-empty">{t('pp.batalha.comeca')}</div>}
        {log.map(l => (
          <div key={l.id} className="pp-battle-log-entry" style={{ color: l.tipo === 'player' ? 'var(--pp-jack)' : l.tipo === 'inimigo' ? 'var(--pp-nina)' : l.tipo === 'vitoria' ? 'var(--pp-success)' : l.tipo === 'derrota' ? 'var(--pp-danger)' : 'var(--pp-text-muted)' }}>
            {l.texto}
          </div>
        ))}
      </div>

      {/* Jack */}
      <motion.div animate={animAtaque === 'jack' ? { x: [0, -8, 8, 0] } : {}} className="pp-battle-card">
        <div className="pp-battle-card-row">
          <span className="pp-battle-card-icon">🕵️</span>
          <div style={{ flex:1 }}>
            <div className="pp-battle-card-name" style={{ color:'var(--pp-jack)' }}>Jack</div>
            <div className="pp-battle-card-hp">HP: {jackHp}/{jackBase.hp}</div>
          </div>
        </div>
        <div className="pp-hp-bar">
          <motion.div animate={{ width: `${hpPct(jackHp, jackBase.hp)}%` }} transition={{ duration:0.3 }}
            className="pp-hp-bar-fill" style={{ background:'var(--pp-jack)' }} />
        </div>
      </motion.div>

      {/* Botão */}
      <button
        onClick={atacarInimigo}
        disabled={turno !== 'player' || !!resultado}
        className={`pp-battle-btn ${turno === 'player' && !resultado ? 'pp-battle-btn-ready' : 'pp-battle-btn-disabled'}`}>
        {turno === 'player' ? t('pp.batalha.atacar') : turno === 'inimigo' ? t('pp.batalha.inimigo_agindo') : resultado === 'vitoria' ? t('pp.batalha.vitoria') : t('pp.batalha.derrota')}
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════
// CONVERSA (WHATSAPP STYLE)
// ══════════════════════════════════════════════════
function ConvoView({ caso, tipo, onBack, onConvoEnd }) {
  const { t, locale } = useLanguage()
  const [msgs, setMsgs] = useState([])
  const [digitandoDe, setDigitandoDe] = useState(null)
  const msgsContainerRef = useRef(null)
  const mountedRef = useRef(true)
  const runIdRef = useRef(Date.now())
  const timeoutsRef = useRef([])

  const dialogo = tipo === 'abertura'
    ? caso.dialogo?.abertura || []
    : caso.dialogo?.resolucao || []
  const narracaoRaw = tipo === 'abertura'
    ? caso.dialogo?.narracao_abertura || [t('pp.convo.caso_aberto')]
    : caso.dialogo?.narracao_final || [t('pp.convo.caso_encerrado')]
  const narracao = (typeof narracaoRaw === 'object' && !Array.isArray(narracaoRaw))
    ? (narracaoRaw[locale] || Object.values(narracaoRaw)[0] || '...')
    : Array.isArray(narracaoRaw) ? (narracaoRaw[0] || '...') : (narracaoRaw || '...')

  useEffect(() => {
    const runId = runIdRef.current
    mountedRef.current = true
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []

    if (!dialogo.length) {
      const t = setTimeout(() => onBack(), 1000)
      timeoutsRef.current.push(t)
      return () => { clearTimeout(t); mountedRef.current = false }
    }

    setMsgs([{ tipo: 'narracao', texto: narracao, id: `narr-start-${runId}` }])

    dialogo.forEach((msg, i) => {
      const delayBase = msg.delay + 800
      const t1 = setTimeout(() => {
        if (!mountedRef.current) return
        setDigitandoDe(msg.de)
      }, delayBase)
      timeoutsRef.current.push(t1)

      const t2 = setTimeout(() => {
        if (!mountedRef.current) return
        setDigitandoDe(null)
        setMsgs(prev => [...prev, {
          id: `msg-${runId}-${i}`,
          de: msg.de,
          texto: msg.i18n[locale],
          hora: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
        }])
        if (i === dialogo.length - 1) {
          const t3 = setTimeout(() => {
            if (!mountedRef.current) return
            setMsgs(prev => [...prev, { tipo:'narracao', texto: narracao, id: `narr-end-${runId}` }])
            if (onConvoEnd) {
              const t4 = setTimeout(() => {
                if (!mountedRef.current) return
                onConvoEnd()
              }, 2000)
              timeoutsRef.current.push(t4)
            }
          }, 1000)
          timeoutsRef.current.push(t3)
        }
      }, delayBase + 700)
      timeoutsRef.current.push(t2)
    })

    return () => {
      mountedRef.current = false
      timeoutsRef.current.forEach(t => clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [])

  useEffect(() => {
    const el = msgsContainerRef.current
    if (!el) return
    if (el.scrollHeight > el.clientHeight) {
      el.scrollTop = el.scrollHeight
    }
  }, [msgs, digitandoDe])

  return (
    <div className="pp-convo">
      {/* Header */}
      <div className="pp-convo-header">
        <button className="pp-convo-back" onClick={onBack}>←</button>
        <div className="pp-chat-avatar" style={{ background: AVATARES.jack.cor, border:`2px solid ${AVATARES.jack.textCor}` }}>
          {AVATARES.jack.emoji}
        </div>
        <div>
          <div className="pp-battle-card-name pp-battle-text-jack">{t('pp.convo.jack_nome')}</div>
          <div className="pp-text-mono-xs pp-convo-online">{t('pp.convo.online')}</div>
        </div>
      </div>

      {/* Mensagens — scrollável independente */}
      <div ref={msgsContainerRef} className="pp-chat-container">
        {msgs.map(msg => {
          if (msg.tipo === 'narracao') {
            return (
              <div key={msg.id} className="pp-msg-narracao">
                {msg.texto}
              </div>
            )
          }
          const av = AVATARES[msg.de] || AVATARES.anonimo
          const isJack = msg.de === 'jack'

          return (
            <motion.div key={msg.id}
              initial={{ opacity:0, scale:0.85, y:8 }}
              animate={{ opacity:1, scale:1, y:0 }}
              transition={{ type:'spring', stiffness:300, damping:25 }}
              className={`pp-msg-row ${isJack ? 'pp-msg-row-jack' : 'pp-msg-row-other'}`}>

              <div className="pp-convo-avatar" style={{ background:av.cor, border:`1.5px solid ${av.textCor}` }}>
                {av.emoji}
              </div>

              <div className="pp-convo-msg-bubble" style={{ background:av.cor, borderRadius: isJack ? '16px 16px 4px 16px' : '16px 16px 16px 4px', border:`1px solid ${av.textCor}22` }}>
                {!isJack && <div className="pp-convo-msg-sender" style={{ color:av.textCor }}>{av.label}</div>}
                <div className="pp-convo-msg-text" style={{ color:av.textCor }}>{msg.texto}</div>
                <div className="pp-convo-msg-time" style={{ color:av.textCor }}>{msg.hora}</div>
              </div>
            </motion.div>
          )
        })}

        {/* Digitando */}
        {digitandoDe && (() => {
          const av = AVATARES[digitandoDe] || AVATARES.anonimo
          return (
            <div className="pp-flex-gap-sm pp-typing-row">
              <div className="pp-convo-avatar" style={{ background:av.cor, border:`1.5px solid ${av.textCor}` }}>
                {av.emoji}
              </div>
              <div style={{ background:av.cor, borderRadius:'16px 16px 16px 4px', padding:'0.5rem 0.85rem', border:`1px solid ${av.textCor}22` }}>
                <div className="pp-msg-typing">
                  <div className="pp-msg-typing-dot" style={{ background:av.textCor }} />
                  <div className="pp-msg-typing-dot" style={{ background:av.textCor, animationDelay:'0.2s' }} />
                  <div className="pp-msg-typing-dot" style={{ background:av.textCor, animationDelay:'0.4s' }} />
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// STORY VIEWER
// ══════════════════════════════════════════════════
function StoryViewer({ pista, onClose }) {
  const { t, locale } = useLanguage()
  const info = pista.i18n[locale]
  const TIPO_EMOJI = { objeto:'🔍', testemunho:'💬', documento:'📄', rastro:'👣', fio:'🕸️' }
  return (
    <motion.div className="pp-story-viewer" onClick={onClose}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="pp-story-viewer-bar">
        <div className="pp-story-viewer-seg"><div className="pp-story-viewer-seg-fill" /></div>
      </div>
      <button className="pp-story-viewer-close" onClick={(e) => { e.stopPropagation(); onClose() }}>✕</button>
      <div className="pp-story-viewer-content">
        <div className="pp-story-viewer-emoji">{TIPO_EMOJI[pista.tipo] || '🔍'}</div>
        <div className="pp-story-viewer-tipo">{pista.tipo}</div>
        {pista.fio && <div className="pp-story-viewer-fio-label pp-fio-badge">{t('pp.story.fio_label')}</div>}
        <div className="pp-story-viewer-title">{info.titulo}</div>
        <div className="pp-story-viewer-desc">{info.desc}</div>
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════
// LOCAL VIEW
// ══════════════════════════════════════════════════
function LocalView({ local, caso, nivel, onPistaColetada, onBack }) {
  const { t, locale } = useLanguage()
  const [etapa, setEtapa] = useState('inicio') // inicio | animacao | puzzle | batalha | revelado
  const locInfo = local.i18n[locale]
  const pista = caso.pistas.find(p => p.id === local.pista_id)

  const iniciarInvestigacao = () => {
    console.log('[PP] etapa mudou:', 'inicio ->',
      local.batalha ? 'batalha' : local.puzzle && local.puzzle !== 'nenhum' ? 'puzzle' : 'animacao')
    if (local.batalha) {
      setEtapa('batalha')
    } else if (local.puzzle && local.puzzle !== 'nenhum') {
      setEtapa('puzzle')
    } else {
      setEtapa('animacao')
    }
  }

  const handlePuzzleSolve = () => { console.log('[PP] etapa mudou:', 'puzzle -> revelado'); setEtapa('revelado'); onPistaColetada(pista) }
  const handlePuzzleFail = () => { console.log('[PP] etapa mudou:', 'puzzle -> inicio (fail)'); setEtapa('inicio') }
  const handleBatalhaVitoria = () => { console.log('[PP] etapa mudou:', 'batalha -> revelado'); setEtapa('revelado'); onPistaColetada(pista) }
  const handleBatalhaDerrota = () => { console.log('[PP] etapa mudou:', 'batalha -> inicio (derrota)'); setEtapa('inicio') }
  const handleAnimacaoComplete = () => { console.log('[PP] etapa mudou:', 'anim -> revelado'); setEtapa('revelado'); onPistaColetada(pista) }

  const puzzleProps = { onSolve: handlePuzzleSolve, onFail: handlePuzzleFail, config: { difficulty: 'easy' } }

  const renderPuzzle = () => {
    switch (local.puzzle) {
      case 'decoder':  return <PuzzleDecoder {...puzzleProps} />
      case 'stealth':  return <PuzzleStealthGrid {...puzzleProps} />
      case 'labirinto': return <PuzzleLabirinto {...puzzleProps} />
      case 'anagrama': return <PuzzleAnagrama {...puzzleProps} />
      case 'sliding':  return <PuzzleSlidingTiles {...puzzleProps} />
      default: return null
    }
  }

  return (
    <div className="pp-local">
      <div className="pp-convo-header">
        <button className="pp-convo-back" onClick={onBack}>←</button>
        <span className="pp-local-header-name">{locInfo.nome}</span>
      </div>

      {/* Hero do local */}
      <div className="pp-local-hero">
        <div className="pp-local-emoji">🏚️</div>
        <div className="pp-local-header-name">{locInfo.nome}</div>
        <div className="pp-local-desc">{locInfo.desc}</div>
      </div>

      <AnimatePresence mode="wait">
        {etapa === 'inicio' && (
          <motion.div key="inicio" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className="pp-local-puzzle-cta" onClick={iniciarInvestigacao}>
              <div className="pp-local-puzzle-icon">
                {local.batalha ? '⚔️' : PUZZLE_EMOJI[local.puzzle || 'nenhum']}
              </div>
              <div className="pp-local-puzzle-label">
                {local.batalha ? t('pp.local.confronto') : local.puzzle && local.puzzle !== 'nenhum' ? t('pp.local.puzzle') : t('pp.local.investigar')}
              </div>
              {local.puzzle && local.puzzle !== 'nenhum' && (
                <div className="pp-local-puzzle-sub">{local.puzzle.toUpperCase()}</div>
              )}
            </div>
          </motion.div>
        )}

        {etapa === 'animacao' && (
          <motion.div key="anim" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <AnimacaoInvestigacao onComplete={handleAnimacaoComplete} />
          </motion.div>
        )}

        {etapa === 'puzzle' && (
          <motion.div key="puzzle-container" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="pp-puzzle-container">
            {renderPuzzle()}
          </motion.div>
        )}

        {etapa === 'batalha' && (
          <motion.div key="batalha" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <BatalhaView nivel={nivel} onVitoria={handleBatalhaVitoria} onDerrota={handleBatalhaDerrota} />
          </motion.div>
        )}

        {etapa === 'revelado' && (
          <motion.div key="revelado" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="pp-evidence-card">
            <span className={`pp-local-pista-tipo-badge ${pista.tipo}`}>{pista.tipo}</span>
            {pista.fio && <span className="pp-local-pista-tipo-badge fio pp-local-pista-fio-badge">⚡ fio</span>}
            <div className="pp-local-pista-title pp-evidence-card-inner">{pista.i18n[locale].titulo}</div>
            <div className="pp-local-pista-desc">{pista.i18n[locale].desc}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="pp-local-voltar" onClick={onBack}>{t('pp.local.voltar_dossier')}</button>
    </div>
  )
}

// ══════════════════════════════════════════════════
// MENU INICIAL
// ══════════════════════════════════════════════════
function MenuInicial({ nivel, casosResolvidos, onContinuar, onNovoJogo }) {
  const { t } = useLanguage()
  const [confirmando, setConfirmando] = useState(false)
  const navigate = useNavigate()
  const rainRef = useRef(null)

  useEffect(() => {
    const rain = rainRef.current
    if (rain) {
      for (let i = 0; i < 40; i++) {
        const d = document.createElement('div')
        d.className = 'pp-rain-drop'
        d.style.cssText = `left:${Math.random()*100}%;height:${60+Math.random()*80}px;animation-duration:${0.6+Math.random()*0.8}s;animation-delay:${Math.random()*2}s;opacity:${0.2+Math.random()*0.4}`
        rain.appendChild(d)
      }
    }
  }, [])

  if (confirmando) {
    return (
      <div className="pp-confirm-wrap">
        <div ref={rainRef} className="pp-rain" />
        <div className="pp-page-content">
          <div className="pp-confirm-text">
            {t('pp.menu.confirmar').split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
          </div>
          <div className="pp-confirm-btns">
            <button onClick={() => setConfirmando(false)}
              className="pp-btn-nao">
              {t('pp.menu.nao')}
            </button>
            <button onClick={onNovoJogo}
              className="pp-btn-sim">
              {t('pp.menu.sim')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pp-page-full">
      <div ref={rainRef} className="pp-rain" />
      <div className="pp-page-content">
        <div className="pp-menu-label">
          {t('pp.menu.marelia')}
        </div>
        <h1 className="pp-menu-title">
          {t('pp.menu.titulo_linha1')}<br/>{t('pp.menu.titulo_linha2')}
        </h1>

        <button onClick={onContinuar}
          className="pp-btn-continuar">
          {t('pp.menu.continuar')}
          <div className="pp-btn-continuar-sub">
            {t('pp.menu.nivel_casos', { nivel, casos: casosResolvidos.length })}
          </div>
        </button>

        <button onClick={() => setConfirmando(true)}
          className="pp-btn-novo-jogo">
          {t('pp.menu.novo_jogo')}
        </button>

        <BackToGamesBtn onClick={() => navigate('/games')} label={t('pp.menu.voltar_site')} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// PHONE CALL — 50% pistas trigger
// ══════════════════════════════════════════════════
function PhoneCall({ caso, onAccept, onReject }) {
  const { t, locale } = useLanguage()
  const [stage, setStage] = useState('ringing')
  const [msgAtual, setMsgAtual] = useState(0)
  const [textoExibido, setTextoExibido] = useState('')
  const charIdx = useRef(0)
  const timerRef = useRef(null)
  const tf = getTelefonema(caso.id)

  const suspeitoCulpado = caso.suspeitos.find(s => s.culpado)
  const linhas = [
    { de: 'jack', texto: tf.jack_abertura[locale], avatar: '🕵️', cor: '#00ff88', label: 'Jack' },
    // Mostrar apenas 'Suspeito' para preservar o mistério (não revelar o nome real do culpado)
    { de: 'suspeito', texto: tf.suspeito[locale], avatar: '👤', cor: '#ff4444', label: t('pp.phone.suspeito_label') },
    { de: 'jack', texto: tf.jack_fechamento[locale], avatar: '🕵️', cor: '#00ff88', label: 'Jack' },
  ]

  // Aceitar → mostrar diálogo linha a linha
  useEffect(() => {
    if (stage !== 'accepted') return
    if (msgAtual >= linhas.length) {
      const t = setTimeout(() => onReject(), 2000)
      return () => clearTimeout(t)
    }
    const linha = linhas[msgAtual]
    if (!linha) return

    charIdx.current = 0
    setTextoExibido('')
    timerRef.current = setInterval(() => {
      charIdx.current++
      setTextoExibido(linha.texto.slice(0, charIdx.current))
      if (charIdx.current >= linha.texto.length) {
        clearInterval(timerRef.current)
        const t = setTimeout(() => {
          setMsgAtual(prev => prev + 1)
        }, 1200)
        timerRef.current = t
      }
    }, 30)
    return () => { clearInterval(timerRef.current) }
  }, [stage, msgAtual])

  if (stage === 'ringing') {
    return (
      <motion.div className="pp-phone-call"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="pp-phone-ringing">
          <div className="pp-phone-icon-wrap">
            <div className="pp-phone-vibrate">📞</div>
          </div>
          <div className="pp-phone-label">{t('pp.phone.chamada')}</div>
          <div className="pp-phone-conhecido">{caso.i18n[locale]?.nome || caso.id}</div>
          <div className="pp-phone-buttons">
            <button className="pp-phone-btn pp-phone-btn--accept" onClick={() => { setStage('accepted'); setMsgAtual(0) }}>
              <span>📞</span> {t('pp.phone.atender')}
            </button>
            <button className="pp-phone-btn pp-phone-btn--reject" onClick={onReject}>
              <span>✕</span> {t('pp.phone.recusar')}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (stage === 'accepted') {
    return (
      <motion.div className="pp-phone-call pp-phone-call--accepted"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="pp-phone-accepted">
          {linhas.map((linha, i) => {
            if (i > msgAtual) return null
            const completo = i < msgAtual
            const texto = completo ? linha.texto : textoExibido
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`pp-phone-msg ${linha.de === 'jack' ? 'pp-phone-msg--jack' : 'pp-phone-msg--suspeito'}`}
                style={{ '--pp-phone-cor': linha.cor }}>
                <div className="pp-phone-msg-avatar">{linha.avatar}</div>
                <div className="pp-phone-msg-content">
                  {linha.de !== 'jack' && <div className="pp-phone-msg-label">{linha.label}</div>}
                  <div className="pp-phone-msg-text" style={{ color: linha.cor }}>
                    {texto}
                    {!completo && <span className="pp-phone-cursor" />}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  return null
}

// ══════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════
export default function PP() {
  const { user } = useAuth()
  const { t, locale } = useLanguage()
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const store = usePPStore()
  const [appFase, setAppFase] = useState(null) // null=loading | slots | menu | intro | app
  const [aba, setAba] = useState('feed')
  const [casoAtivo, setCasoAtivo] = useState(null)
  const [faseInterna, setFaseInterna] = useState(null)
  const [storyAtivo, setStoryAtivo] = useState(null)
  const [phoneCall, setPhoneCall] = useState(null)
  const phoneCallTriggered = useRef(new Set())
  const [suspeitoSelecionado, setSuspeitoSelecionado] = useState(null)
  const [feedbackAcusacao, setFeedbackAcusacao] = useState(null) // null | 'errado' | 'bloqueado'
  const [slotsData, setSlotsData] = useState([null, null, null])
  const [slotsLoaded, setSlotsLoaded] = useState(false)

  const { reputacao, casosResolvidos, pistasColetadas, acusacoesErradas, nivel, carregado, saveExists } = store

  // Load all slots first
  useEffect(() => {
    console.log(`[PP] versão carregada: ${PP_VERSION}`)
    if (user) {
      store.loadAllSlots(user.id).then(data => {
        setSlotsData(data)
        setSlotsLoaded(true)
      })
    } else {
      setSlotsData([null, null, null])
      setSlotsLoaded(true)
    }
  }, [user])

  // Reader mode (hide navbar/footer/trial banner)
  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // Quando slots carregados, mostra seleção de slots
  useEffect(() => {
    if (slotsLoaded && appFase === null) {
      setAppFase('slots')
    }
  }, [slotsLoaded, appFase])

  const handleSlotSelect = async (slotNum) => {
    if (!user) {
      // Guest: inicializa estado em memória, sem _userId (não persiste)
      store.resetStore()
      usePPStore.setState({ _slot: 'guest', _userId: null })
      setAppFase('intro')
      return
    }
    const slotSave = slotsData[slotNum - 1]
    if (slotSave) {
      // Carregar save existente
      await store.loadSlot(user.id, slotNum)
      setAppFase('menu')
    } else {
      // Novo jogo neste slot
      await store.loadSlot(user.id, slotNum)
      setAppFase('intro')
    }
  }

  const handleDeleteSlot = async (slotNum) => {
    if (!user) return
    await store.deleteSlot(user.id, slotNum)
    const newSlots = [...slotsData]
    newSlots[slotNum - 1] = null
    setSlotsData(newSlots)
  }

  const handleNovoJogo = async () => {
    const slotNum = store._slot
    await store.resetSave(user?.id)
    // Atualiza slotsData local
    const newSlots = [...slotsData]
    if (slotNum) newSlots[slotNum - 1] = null
    setSlotsData(newSlots)
    setAppFase('intro')
  }

  const casosDesbloqueados = CASOS.filter(c =>
    c.desbloqueado ||
    casosResolvidos.some(r => CASOS.find(cc => cc.id === r)?.desbloqueia?.includes(c.id))
  )

  const casosNaoResolvidosDisponiveis = casosDesbloqueados.filter(c => !casosResolvidos.includes(c.id))
  const proximoCasoDisponivel = casosNaoResolvidosDisponiveis.length > 0 ? [casosNaoResolvidosDisponiveis[0]] : []

  // Mostrar o caso recém-liberado no topo e, em seguida, os casos resolvidos
  // em ordem de resolução (mais recente primeiro).
  const resolvedCases = casosResolvidos.slice().reverse().map(id => CASOS.find(c => c.id === id)).filter(Boolean)
  const casosDisponiveis = [
    ...proximoCasoDisponivel,
    ...resolvedCases
  ]

  const getPistasDoCase = (casoId) => pistasColetadas[casoId] || []

  const getFiosPistas = () =>
    Object.entries(pistasColetadas).flatMap(([casoId, pids]) => {
      const caso = CASOS.find(c => c.id === casoId)
      return (pids || []).map(pid => {
        const p = caso?.pistas.find(pp => pp.id === pid)
        return p?.fio ? { pista: p, caso } : null
      }).filter(Boolean)
    })

  const handlePistaColetada = useCallback((pista) => {
    if (!casoAtivo) return
    const pistasAtuais = usePPStore.getState().pistasColetadas[casoAtivo.id] || []
    const newCount = pistasAtuais.length + 1
    const total = casoAtivo.pistas.length
    const pct = newCount / total

    store.coletarPista(casoAtivo.id, pista.id, user?.id)

    if (pct >= 0.5 && !phoneCallTriggered.current.has(casoAtivo.id) && !casosResolvidos.includes(casoAtivo.id)) {
      phoneCallTriggered.current.add(casoAtivo.id)
      setPhoneCall(casoAtivo)
    }
  }, [casoAtivo, user, casosResolvidos])

  const handleAcusar = () => {
    if (!suspeitoSelecionado || !casoAtivo) return
    const pistas = getPistasDoCase(casoAtivo.id)
    if (pistas.length < casoAtivo.pistas_necessarias) {
      setFeedbackAcusacao('incompleto')
      setTimeout(() => setFeedbackAcusacao(null), 2500)
      return
    }
    const suspeito = casoAtivo.suspeitos.find(s => s.id === suspeitoSelecionado)
    if (suspeito?.culpado) {
      const erros = store.acusacoesErradas[casoAtivo.id] || 0
      const bonus = erros === 0 && pistas.length === casoAtivo.pistas.length ? 1.2 : erros >= 2 ? 0.4 : erros === 1 ? 0.7 : 1
      const reputationGanho = Math.round(casoAtivo.reputacao_ganho * bonus)
      console.log('[PP] acusar resolverCaso inicio', casoAtivo.id, reputationGanho)
      store.resolverCaso(casoAtivo.id, reputationGanho, user?.id)
      console.log('[PP] acusar resolverCaso fim')
      const isUltimo = casosResolvidos.length + 1 >= CASOS.length
      setFaseInterna({ tipo: 'convo', convoTipo: 'resolucao', isFinal: isUltimo })
    } else {
      store.registrarAcusacaoErrada(casoAtivo.id, user?.id)
      setSuspeitoSelecionado(null)
      const errosAgora = (store.acusacoesErradas[casoAtivo.id] || 0) + 1
      const maxErros = casoAtivo.max_acusacoes || 2
      if (errosAgora >= maxErros) {
        setFeedbackAcusacao('bloqueado')
      } else {
        setFeedbackAcusacao('errado')
        setTimeout(() => setFeedbackAcusacao(null), 2500)
      }
    }
  }

  // ── RENDER CONTEÚDO ──────────────────────────────
  const renderConteudo = () => {
    // Local investigação
    if (faseInterna?.tipo === 'local') {
      return (
        <LocalView
          local={faseInterna.local}
          caso={casoAtivo}
          nivel={nivel}
          onPistaColetada={handlePistaColetada}
          onBack={() => setFaseInterna({ tipo: 'dossier' })}
        />
      )
    }

    // Conversa
    if (faseInterna?.tipo === 'convo') {
      return (
        <ConvoView
          caso={casoAtivo}
          tipo={faseInterna.convoTipo}
          onBack={() => setFaseInterna({ tipo: 'dossier' })}
          onConvoEnd={faseInterna.isFinal ? () => setAppFase('final') : undefined}
        />
      )
    }

    // Dossier
    if (faseInterna?.tipo === 'dossier' && casoAtivo) {
      const pistas = getPistasDoCase(casoAtivo.id)
      const pistasFaltam = casoAtivo.pistas_necessarias - pistas.length
      const resolvido = casosResolvidos.includes(casoAtivo.id)

      return (
        <div className="pp-dossier">
          {/* Header */}
          <div className="pp-flex-between">
            <button className="pp-convo-back" onClick={() => { setFaseInterna(null); setCasoAtivo(null); setSuspeitoSelecionado(null) }}>←</button>
            <span className="pp-amber-mono-sm">{casoAtivo.i18n[locale].nome}</span>
          </div>

          {/* Briefing */}
          {!resolvido && (
            <div onClick={() => setFaseInterna({ tipo:'convo', convoTipo:'abertura' })}
              className="pp-briefing-card">
              <span className="pp-briefing-icon">💬</span>
              <div className="pp-briefing-info">
                <div className="pp-briefing-title">{t('pp.dossier.briefing')}</div>
                <div className="pp-briefing-sub">{t('pp.dossier.ver_abertura')}</div>
              </div>
              <span className="pp-briefing-arrow">→</span>
            </div>
          )}

          {/* Pistas counter */}
          <div className="pp-pistas-counter">
            <span className="pp-pistas-counter-label">{t('pp.dossier.pistas_label')}</span>
            <span className="pp-pistas-counter-value">{pistas.length} / {casoAtivo.pistas_necessarias}</span>
          </div>

          {/* Pistas coletadas — clicáveis */}
          {pistas.length > 0 && (
            <div className="pp-dossier-pistas-mb">
              <div className="pp-dossier-section-title pp-dossier-section-title--mb">{t('pp.dossier.evidencias')}</div>
              {pistas.map(pid => {
                const p = casoAtivo.pistas.find(pp => pp.id === pid)
                if (!p) return null
                return (
                  <div key={pid} onClick={() => setStoryAtivo(p)}
                    className={`pp-pista-item ${p.fio ? 'pp-pista-item-fio' : ''}`}>
                    <span className="pp-pista-icon">{p.tipo === 'fio' ? '🕸️' : p.tipo === 'testemunho' ? '💬' : p.tipo === 'documento' ? '📄' : '🔍'}</span>
                    <div className="pp-pista-title" style={{ color: p.fio ? 'var(--pp-fio)' : 'var(--pp-text)' }}>{p.i18n[locale].titulo}</div>
                    {p.fio && <span className="pp-hashtag-fio">{t('pp.story.fio_label')}</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Suspeitos */}
          <div className="pp-dossier-section-title">{t('pp.dossier.suspeitos')}</div>
          {casoAtivo.suspeitos.map(s => (
            <div key={s.id} className={`pp-suspeito-card ${suspeitoSelecionado === s.id ? 'selected' : ''}`}
              onClick={() => !resolvido && setSuspeitoSelecionado(s.id)}>
              <div className="pp-suspeito-avatar">{s.avatar}</div>
              <div className="pp-suspeito-info">
                <div className="pp-suspeito-nome">{s.i18n[locale].nome}</div>
                <div className="pp-suspeito-bio">{s.i18n[locale].bio}</div>
              </div>
              {!resolvido && <div className="pp-suspeito-radio" />}
              {resolvido && s.culpado && <span className="pp-check-icon">✓</span>}
            </div>
          ))}

          {/* Locais */}
          <div className="pp-dossier-section-title pp-dossier-section-title--mt">{t('pp.dossier.locais')}</div>
          {casoAtivo.locais.map(local => {
            const pistaColetada = pistas.includes(local.pista_id)
            const locInfo = local.i18n[locale]
            return (
              <div key={local.id}
                className={`pp-local-card ${pistaColetada ? 'pp-local-card-done' : ''}`}
                onClick={() => !pistaColetada && setFaseInterna({ tipo:'local', local })}>
                <span className="pp-local-icon">{local.batalha ? '⚔️' : PUZZLE_EMOJI[local.puzzle || 'nenhum']}</span>
                <div className="pp-local-info">
                  <div className="pp-local-name" style={{ color: pistaColetada ? 'var(--pp-success)' : 'var(--pp-text)' }}>{locInfo.nome}</div>
                  <div className="pp-local-desc-sm">{locInfo.desc}</div>
                </div>
                {pistaColetada ? <span className="pp-dossier-check-icon">✓</span> : <span className="pp-dossier-arrow-icon">→</span>}
              </div>
            )
          })}

          {/* Acusar */}
          {!resolvido && (
            <>
              {feedbackAcusacao === 'errado' && (
                <div className="pp-acusar-feedback">
                  {t('pp.acusar.errada')}
                </div>
              )}
              {feedbackAcusacao === 'bloqueado' && (
                <div className="pp-acusar-feedback">
                  {t('pp.acusar.bloqueada')}
                </div>
              )}
              {feedbackAcusacao === 'incompleto' && (
                <div className="pp-acusar-feedback">
                  {t('pp.acusar.incompleta')}
                </div>
              )}
              <button className="pp-acusar-btn"
                disabled={!suspeitoSelecionado || pistas.length < casoAtivo.pistas_necessarias || feedbackAcusacao === 'bloqueado'}
                onClick={handleAcusar}>
              {pistas.length < casoAtivo.pistas_necessarias
                ? t('pp.acusar.colete_mais', { n: pistasFaltam, plural: pistasFaltam > 1 ? 's' : '' })
                : t('pp.acusar.btn', { nome: casoAtivo.suspeitos.find(s => s.id === suspeitoSelecionado)?.i18n[locale].nome || '...' })
              }
            </button>
            </>
          )}
        </div>
      )
    }

    // ── ABAS ────────────────────────────────────────
    if (aba === 'feed') {
      const allPistas = casosDisponiveis.flatMap(c =>
        getPistasDoCase(c.id).map(pid => {
          const p = c.pistas.find(pp => pp.id === pid)
          return p ? { pista:p, caso:c } : null
        }).filter(Boolean)
      )

      return (
        <div className="pp-feed">
          {/* Stories bar */}
          {allPistas.length > 0 && (
            <div className="pp-stories-bar">
              {allPistas.slice(0, 8).map(({ pista }) => (
                <div key={pista.id} className="pp-story-thumb" onClick={() => setStoryAtivo(pista)}>
                  <div className={`pp-story-ring ${pista.fio ? 'fio' : ''}`}>
                    <div className="pp-story-inner">{pista.tipo === 'fio' ? '🕸️' : '🔍'}</div>
                  </div>
                  <div className="pp-story-label">{pista.i18n[locale].titulo.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Casos como posts */}
          {casosDisponiveis.map(caso => {
            const resolvido = casosResolvidos.includes(caso.id)
            const cInfo = caso.i18n[locale]
            return (
              <div key={caso.id} className={`pp-caso-card ${resolvido ? 'resolvido' : ''}`}>
                <div className="pp-caso-header">
                  <div className="pp-caso-avatar">🌆</div>
                  <div className="pp-caso-meta">
                    <div className="pp-caso-nome">{cInfo.nome}</div>
                    <div className="pp-caso-sub">Marelia, 1954 · {'★'.repeat(caso.dificuldade)}</div>
                  </div>
                  <div className="pp-caso-dif">+{caso.reputacao_ganho} REP</div>
                </div>

                <div className="pp-caso-thumbnail">
                  <span className="pp-caso-thumb-emoji">{caso.thumbnail}</span>
                  <div className="pp-caso-thumbnail-text">{cInfo.subtitulo}</div>
                  {resolvido && <div className="pp-caso-resolv-badge">{t('pp.dossier.resolvido_badge')}</div>}
                </div>

                <div className="pp-caso-actions">
                  <div className="pp-caso-action-btn"><span>💬</span> {caso.dialogo?.abertura?.length || 0}</div>
                  <div className="pp-caso-action-btn"><span>🔍</span> {getPistasDoCase(caso.id).length}/{caso.pistas_necessarias}</div>
                  <span className="pp-caso-hashtag">#{cInfo.nome.replace(/\s/g,'')}</span>
                  <button className="pp-caso-open-btn" onClick={() => { setCasoAtivo(caso); setFaseInterna({ tipo:'dossier' }); setSuspeitoSelecionado(null) }}>
                    {resolvido ? t('pp.feed.revisitar') : t('pp.feed.investigar')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (aba === 'mensagens') {
      const CORE_CONTATOS = [
        { id:'kim', ultima:'alguém me fotografou de costas', hora:'01:32', unread:0 },
        { id:'helena', ultima:'preciso de alguém que não vá à polícia', hora:'21:47', unread:0 },
        { id:'shuntaro', ultima:'vim ao Brasil a negócios', hora:'14:23', unread:0 },
      ]
      const coreIds = CORE_CONTATOS.map(c => c.id)

      // Build contact list from available cases
      const casoContatos = new Set()
      casosDisponiveis.forEach(caso => {
        ;(caso.dialogo?.abertura || []).forEach(msg => {
          if (msg.de !== 'jack') casoContatos.add(msg.de)
        })
      })

      const contatos = [
        ...CORE_CONTATOS,
        ...[...casoContatos]
          .filter(id => !coreIds.includes(id))
          .map(id => {
            const caso = casosDisponiveis.find(c =>
              c.dialogo?.abertura?.some(m => m.de === id)
            )
            const primeiraMsg = caso?.dialogo?.abertura?.find(m => m.de === id)
            return {
              id,
              ultima: primeiraMsg?.i18n?.[locale] || '',
              hora: '--:--',
              unread: casosResolvidos.includes(caso?.id) ? 0 : 1,
            }
          }),
      ]
      return (
        <div className="pp-chat-list">
          <div className="pp-section-header">{t('pp.feed.mensagens')}</div>
          {contatos.map(c => {
            const av = AVATARES[c.id] || AVATARES.anonimo
            const casoDoContato = CASOS.find(caso =>
              casosDisponiveis.some(cd => cd.id === caso.id) &&
              caso.dialogo?.abertura?.some(m => m.de === c.id)
            )
            return (
              <div key={c.id} className="pp-chat-item" onClick={() => {
                if (casoDoContato) { setCasoAtivo(casoDoContato); setFaseInterna({ tipo:'convo', convoTipo:'abertura' }) }
              }}>
                <div className="pp-chat-avatar-wrap">
                  <div className="pp-chat-avatar" style={{ background:av.cor, border:`2px solid ${av.textCor}` }}>{av.emoji}</div>
                  {c.unread > 0 && <div className="pp-chat-online" />}
                </div>
                <div className="pp-chat-info">
                  <div className="pp-chat-name" style={{ color:av.textCor }}>{av.label}</div>
                  <div className="pp-chat-preview">{c.ultima}</div>
                </div>
                <div className="pp-chat-meta">
                  <div className="pp-chat-time">{c.hora}</div>
                  {c.unread > 0 && <div className="pp-chat-unread">{c.unread}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (aba === 'stories') {
      const todasPistas = casosDisponiveis.flatMap(c =>
        getPistasDoCase(c.id).map(pid => {
          const p = c.pistas.find(pp => pp.id === pid)
          return p ? { pista:p, caso:c } : null
        }).filter(Boolean)
      )
      if (todasPistas.length === 0) return <div className="pp-empty">{t('pp.feed.stories_vazio').split('\n').map((l,i) => <span key={i}>{i > 0 && <><br /><br /></>}{l}</span>)}</div>
      return (
        <div className="pp-stories-grid">
          {todasPistas.map(({ pista }) => (
            <div key={pista.id} className="pp-story-card" onClick={() => setStoryAtivo(pista)}>
              <div className="pp-story-card-bg">{pista.tipo === 'fio' ? '🕸️' : pista.tipo === 'testemunho' ? '💬' : pista.tipo === 'documento' ? '📄' : '🔍'}</div>
              <div className="pp-story-card-overlay" />
              {pista.fio && <div className="pp-story-card-fio-border" />}
              <div className="pp-story-card-content">
                <div className={`pp-story-card-tipo ${pista.tipo}`}>{pista.tipo}</div>
                <div className="pp-story-card-title">{pista.i18n[locale].titulo}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (aba === 'arquivos') {
      const fios = getFiosPistas()
      return (
        <div className="pp-caderno">
          <div className="pp-dossier-section-title pp-caderno-title-mb">{t('pp.caderno.titulo').toUpperCase()}</div>
          <div className="pp-stats-grid">
            <div>
              <div className="pp-stats-cell-amber">{reputacao}</div>
              <div className="pp-stat-label">{t('pp.feed.status_reputacao')}</div>
            </div>
            <div>
              <div className="pp-stats-cell-jack">{casosResolvidos.length}</div>
              <div className="pp-stat-label">{t('pp.feed.status_casos')}</div>
            </div>
            <div>
              <div className="pp-stats-cell-kim">{nivel}</div>
              <div className="pp-stat-label">{t('pp.feed.status_nivel')}</div>
            </div>
            <div>
              <div className="pp-stats-cell-fio">{fios.length}</div>
              <div className="pp-stat-label">{t('pp.feed.status_fios')}</div>
            </div>
          </div>

          <div className="pp-dossier-section-title pp-dossier-pistas-mb">{t('pp.caderno.titulo').toUpperCase()}</div>
          {fios.length === 0
            ? <div className="pp-caderno-empty">{t('pp.feed.caderno_vazio')}</div>
            : fios.map(({ pista, caso }) => (
              <div key={pista.id} className="pp-caderno-node pp-caderno-node-click" onClick={() => setStoryAtivo(pista)}>
                <div className="pp-caderno-node-caso">{caso.i18n[locale].nome}</div>
                <div className="pp-caderno-node-title">⚡ {pista.i18n[locale].titulo}</div>
                <div className="pp-caderno-node-desc">{pista.i18n[locale].desc}</div>
              </div>
            ))
          }
        </div>
      )
    }
  }

  // Loading
  if (!carregado && appFase !== 'slots') {
    return (
      <div className="pp-loading">
        {t('pp.feed.loading')}
      </div>
    )
  }

  // Slot selection screen
  if (appFase === 'slots') {
    return (
      <div className="pp-page-full">
        <div className="pp-rain" />
        <div className="pp-page-content">
          {!user && (
            <div className="pp-guest-aviso">
              <p className="pp-guest-aviso-titulo">
                {t('pp.guest.titulo')}
              </p>
              <p className="pp-guest-aviso-texto">
                {t('pp.guest.desc')}
              </p>
              <Link to="/cadastro" className="pp-guest-aviso-link">
                {t('pp.guest.criar_conta')}
              </Link>
            </div>
          )}
          <div className="pp-menu-label">{t('pp.menu.marelia')}</div>
          <h1 className="pp-menu-title">
            {t('pp.menu.titulo_linha1')}<br/>{t('pp.menu.titulo_linha2')}
          </h1>
          <p className="pp-text-mono-muted pp-slots-select-text">
            {t('pp.menu.selecione_slot')}
          </p>

          <div className="pp-slots-container">
            {[1, 2, 3].map(num => {
              const save = slotsData[num - 1]
              return (
                <div
                  key={num}
                  className="pp-slot-card"
                  style={{
                    background: save ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${save ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                  onClick={() => handleSlotSelect(num)}
                >
                  <div>
                    <div className="pp-slot-card-label" style={{ color: save ? 'var(--pp-jack)' : '#666' }}>
                      {t('pp.menu.slot_label')} {num}
                    </div>
                    {save ? (
                      <div className="pp-slot-card-info">
                        {t('pp.menu.nivel_casos', { nivel: save.nivel || 1, casos: (save.casosResolvidos || []).length })}
                      </div>
                    ) : (
                      <div className="pp-slot-card-empty">
                        {t('pp.menu.slot_vazio')}
                      </div>
                    )}
                  </div>
                  <div className="pp-slot-btn-group">
                    <button
                      className={`pp-slot-btn ${save ? 'pp-slot-btn--continue' : 'pp-slot-btn--new'}`}
                      onClick={(e) => { e.stopPropagation(); handleSlotSelect(num) }}
                    >
                      {save ? t('pp.menu.continuar') : t('pp.menu.novo_jogo')}
                    </button>
                    {save && (
                      <button
                        className="pp-slot-delete-btn"
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(t('pp.menu.deletar_slot', { num }))) handleDeleteSlot(num) }}
                      >🗑️</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <BackToGamesBtn onClick={() => navigate('/games')} />
        </div>
      </div>
    )
  }

  // Menu (save existente)
  if (appFase === 'menu') {
    return (
      <MenuInicial
        nivel={nivel}
        casosResolvidos={casosResolvidos}
        onContinuar={() => setAppFase('app')}
        onNovoJogo={handleNovoJogo}
      />
    )
  }

  // Intro
  if (appFase === 'intro') {
    return (
      <div className="pp-intro-wrapper">
        <div className="pp-intro-inner">
          <IntroNoir onComplete={() => setAppFase('app')} />
        </div>
      </div>
    )
  }

  // Final
  if (appFase === 'final') {
    return (
      <TelaFinal
        nivel={nivel}
        casosResolvidos={casosResolvidos}
        onVoltarInicio={() => { store.resetStore(); setAppFase('menu') }}
      />
    )
  }

  return (
    <div className="pp-wrapper">
      <motion.div className="pp-app" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>

        {/* Fake status bar */}
        <div className="pp-status-bar">
        <span className="pp-status-time">{new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</span>
        <div className="pp-status-icons"><span>📶</span><span>🔋</span></div>
      </div>

        {/* Top bar — só quando não tem fase interna */}
        {!faseInterna && (
          <div className="pp-top-bar">
            <button className="pp-exit-btn" onClick={() => navigate('/games')}>←</button>
            <div className="pp-top-bar-avatar">🌙</div>
            <div className="pp-top-bar-info">
              <div className="pp-top-bar-name">{t('pp.feed.topbar_nome')}</div>
              <div className="pp-top-bar-sub">{t('pp.feed.topbar_sub', { nivel })}</div>
            </div>
            <div className="pp-top-bar-rep">{t('pp.geral.reputacao', { valor: reputacao })} REP</div>
          </div>
        )}

        {/* Conteúdo */}
        <div className={`pp-content ${faseInterna?.tipo === 'convo' ? 'pp-content--no-scroll' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div key={`${aba}-${faseInterna?.tipo}-${faseInterna?.convoTipo}`}
              initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
              transition={{ duration:0.15 }}>
              {renderConteudo()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav — só fora de fase interna */}
        {!faseInterna && (
          <div className="pp-bottom-nav">
            {[
              { id:'feed',      icon:'🏠', label:t('pp.feed.investigar') },
              { id:'mensagens', icon:'💬', label:t('pp.feed.mensagens'),    badge: casosDisponiveis.filter(c => !casosResolvidos.includes(c.id)).length },
              { id:'stories',   icon:'📖', label:t('pp.menu.pistas_label'),  badge: getFiosPistas().length > 0 ? getFiosPistas().length : 0 },
              { id:'arquivos',  icon:'🗂️', label:t('pp.caderno.titulo') },
            ].map(nav => (
              <button key={nav.id} className={`pp-nav-btn ${aba === nav.id ? 'active' : ''}`} onClick={() => setAba(nav.id)}>
                {nav.badge > 0 && <span className="pp-nav-badge">{nav.badge}</span>}
                <span className="pp-nav-btn-icon">{nav.icon}</span>
                {nav.label}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Story viewer overlay */}
      <AnimatePresence>
        {storyAtivo && <StoryViewer pista={storyAtivo} onClose={() => setStoryAtivo(null)} />}
      </AnimatePresence>

      {/* Phone call overlay */}
      <AnimatePresence>
        {phoneCall && <PhoneCall caso={phoneCall} onReject={() => setPhoneCall(null)} />}
      </AnimatePresence>
    </div>
  )
}