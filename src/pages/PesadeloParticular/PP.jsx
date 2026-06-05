import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CASOS } from './data/casos'
import { usePPStore } from './store/usePPStore'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import PuzzleDecoder from '../../components/Puzzles/PuzzleDecoder'
import PuzzleStealthGrid from '../../components/Puzzles/PuzzleStealthGrid'
import PuzzleLabirinto from '../../components/Puzzles/PuzzleLabirinto'
import PuzzleAnagrama from '../../components/Puzzles/PuzzleAnagrama'
import PuzzleSlidingTiles from '../../components/Puzzles/PuzzleSlidingTiles'
import { getTelefonema } from './data/telefonema'
import './PP.css'

const PP_VERSION = '1.5.16'
const LOCALE = 'pt'

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
  1:  { nome: 'Capanga de Terno',     hp: 30, dano: [2,5],  xp: 20,  emoji: '🕴️' },
  2:  { nome: 'Segurança Corrupto',   hp: 45, dano: [3,7],  xp: 30,  emoji: '👮' },
  3:  { nome: 'Detetive Infiltrado',  hp: 60, dano: [4,8],  xp: 40,  emoji: '🔎' },
  4:  { nome: 'Assassino de Aluguel', hp: 80, dano: [5,10], xp: 55,  emoji: '🗡️' },
  5:  { nome: 'Agente de Kronos',     hp: 100,dano: [6,12], xp: 70,  emoji: '⚓' },
}

function getInimigo(nivel) {
  const tier = Math.min(5, Math.ceil(nivel / 4))
  return INIMIGOS_NIVEL[tier]
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
  const [text, setText] = useState('')
  const [fase, setFase] = useState('typing')
  const fullText = 'Marelia, 1954. A chuva não para há três dias.\n\nVocê não é detetive.\n\nMas o sonho não liga pra isso.'
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
      <div className="pp-intro-label">PESADELO PARTICULAR</div>
      <div className="pp-intro-text">
        {text.split('\n').map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <><br /><br /></>}</span>
        ))}
        {fase === 'typing' && <span className="pp-intro-cursor" />}
      </div>
      {fase === 'glitch' && <div className="pp-glitch-overlay" />}
      <div style={{ position:'absolute',bottom:'2rem',left:0,right:0,textAlign:'center',fontSize:'0.65rem',color:'rgba(255,255,255,0.2)',fontFamily:'Courier New',letterSpacing:'0.1em' }}>
        toque para pular
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// TELA FINAL — CRÉDITOS
// ══════════════════════════════════════════════════
function TelaFinal({ nivel, casosResolvidos, onVoltarInicio }) {
  const [fase, setFase] = useState('chat')
  const [texto, setTexto] = useState('')
  const idxRef = useRef(0)

  const msgFinal = 'foi um prazer trabalhar contigo.\nmarelia vai continuar precisando de alguém como você.'

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
      <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', padding:'1rem' }}>
        <div className="pp-convo-header">
          <span style={{ color:'var(--pp-amber)', fontFamily:'Courier New', fontSize:'0.85rem' }}>Jack Cachorrão</span>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', padding:'2rem' }}>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-end', maxWidth:'78%' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#1a3a2a', border:'1.5px solid var(--pp-jack)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0 }}>🕵️</div>
            <div style={{ background:'#1a3a2a', borderRadius:'16px 16px 4px 16px', padding:'0.75rem 1rem', border:'1px solid rgba(0,255,136,0.13)' }}>
              <div style={{ fontSize:'0.95rem', color:'var(--pp-jack)', lineHeight:1.6, whiteSpace:'pre-line' }}>
                {texto}
                <span style={{ display:'inline-block', width:2, height:'1.1em', background:'var(--pp-jack)', verticalAlign:'text-bottom', animation:'pp-blink 1s step-end infinite' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'creditos') {
    return (
      <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
        <div className="pp-rain" />
        <div className="pp-credits-roll">
          <p className="pp-credits-title">PESADELO PARTICULAR</p>
          <p className="pp-credits-sub">Temporada 1</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line">uma história de</p>
          <p className="pp-credits-line" style={{ fontSize:'1.2rem', marginTop:'0.5rem' }}>MARELIA, 1954</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line">escrito e dirigido por</p>
          <p className="pp-credits-line" style={{ fontSize:'1.3rem', color:'var(--pp-amber)', marginTop:'0.5rem' }}>ISAIAS LEAL</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line" style={{ marginTop:'2rem' }}>obrigado por jogar</p>
          <p className="pp-credits-space" />
          <p className="pp-credits-line" style={{ fontSize:'0.9rem', marginTop:'3rem' }}>nos vemos na próxima temporada.</p>
          <p style={{ height:200 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
      <div className="pp-rain" />
      <div style={{ position:'relative', zIndex:2, textAlign:'center' }}>
        <h1 style={{ fontFamily:'Courier New', fontSize:'1.6rem', fontWeight:900, color:'var(--pp-amber)', letterSpacing:'0.15em', marginBottom:'1rem' }}>PESADELO PARTICULAR</h1>
        <p style={{ color:'var(--pp-text-muted)', fontFamily:'Courier New', fontSize:'0.75rem', marginBottom:'2rem' }}>nível {nivel} · {casosResolvidos.length} casos resolvidos</p>
        <button onClick={() => {
          const txt = `terminei Pesadelo Particular — nível ${nivel}, ${casosResolvidos.length} casos resolvidos.\nlutasdeilusao-cpu.github.io/illusionfight-site`
          if (navigator.share) navigator.share({ title:'Pesadelo Particular', text:txt })
          else navigator.clipboard?.writeText(txt).then(() => alert('link copiado!'))
        }}
          style={{ display:'block', width:'100%', maxWidth:280, margin:'0 auto 0.75rem', padding:'0.75rem 0', background:'var(--pp-surface2)', color:'var(--pp-amber)', border:'1px solid var(--pp-amber)', borderRadius:10, fontFamily:'Courier New', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.1em', cursor:'pointer' }}>
          compartilhar com amigos
        </button>
        <button onClick={onVoltarInicio}
          style={{ background:'none', border:'none', color:'var(--pp-text-muted)', fontFamily:'Courier New', fontSize:'0.7rem', cursor:'pointer', textDecoration:'underline' }}>
          voltar ao início
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// ANIMAÇÃO INVESTIGAÇÃO SEM PUZZLE
// ══════════════════════════════════════════════════
function AnimacaoInvestigacao({ onComplete }) {
  const [fase, setFase] = useState('pegadas') // pegadas | lupa | revelando

  useEffect(() => {
    const t1 = setTimeout(() => setFase('lupa'), 2000)
    const t2 = setTimeout(() => setFase('revelando'), 3500)
    const t3 = setTimeout(() => onComplete(), 4800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem 1rem', gap:'1.5rem' }}>
      <AnimatePresence mode="wait">
        {fase === 'pegadas' && (
          <motion.div key="pegadas" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            {['👣','👣','👣'].map((p,i) => (
              <motion.span key={i} style={{ fontSize:'1.5rem' }}
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
            <span style={{ fontSize:'3rem' }}>🔍</span>
          </motion.div>
        )}
        {fase === 'revelando' && (
          <motion.div key="revelando" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <span style={{ fontSize:'0.8rem', color:'var(--pp-amber)', fontFamily:'Courier New', letterSpacing:'0.15em' }}>
              EVIDÊNCIA ENCONTRADA
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ width:'80%', height:'2px', background:'var(--pp-border)', borderRadius:1, overflow:'hidden' }}>
        <motion.div style={{ height:'100%', background:'var(--pp-amber)', borderRadius:1 }}
          initial={{ width:'0%' }} animate={{ width:'100%' }} transition={{ duration:4.5, ease:'linear' }} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// SISTEMA DE BATALHA
// ══════════════════════════════════════════════════
function BatalhaView({ nivel, onVitoria, onDerrota }) {
  const inimigo = getInimigo(nivel)
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
    addLog(`Jack ataca: ${dano} de dano`, 'player')

    if (novoHp <= 0) {
      addLog('Inimigo derrotado!', 'vitoria')
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
      addLog(`${inimigo.nome} ataca: ${danoInimigo} de dano`, 'inimigo')

      if (novoJackHp <= 0) {
        addLog('Jack foi derrotado...', 'derrota')
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
    <div style={{ padding:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ textAlign:'center', fontFamily:'Courier New', fontSize:'0.65rem', letterSpacing:'0.2em', color:'var(--pp-text-muted)', marginBottom:'0.5rem' }}>
        CONFRONTO · NÍVEL {nivel}
      </div>

      {/* Inimigo */}
      <motion.div animate={animAtaque === 'inimigo' ? { x: [0, 8, -8, 0] } : {}} style={{ background:'var(--pp-surface)', border:'1px solid var(--pp-border)', borderRadius:12, padding:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
          <span style={{ fontSize:'2rem' }}>{inimigo.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--pp-nina)' }}>{inimigo.nome}</div>
            <div style={{ fontSize:'0.7rem', color:'var(--pp-text-muted)' }}>HP: {inimigoHp}/{inimigo.hp}</div>
          </div>
        </div>
        <div style={{ height:6, background:'var(--pp-border)', borderRadius:3, overflow:'hidden' }}>
          <motion.div animate={{ width: `${hpPct(inimigoHp, inimigo.hp)}%` }} transition={{ duration:0.3 }}
            style={{ height:'100%', background:'var(--pp-nina)', borderRadius:3 }} />
        </div>
      </motion.div>

      {/* Log */}
      <div ref={logRef} style={{ background:'#050505', border:'1px solid var(--pp-border)', borderRadius:8, padding:'0.75rem', height:120, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
        {log.length === 0 && <div style={{ color:'var(--pp-text-muted)', fontSize:'0.75rem', fontFamily:'Georgia', fontStyle:'italic' }}>O confronto começa.</div>}
        {log.map(l => (
          <div key={l.id} style={{ fontSize:'0.75rem', fontFamily:'Courier New', color: l.tipo === 'player' ? 'var(--pp-jack)' : l.tipo === 'inimigo' ? 'var(--pp-nina)' : l.tipo === 'vitoria' ? 'var(--pp-success)' : l.tipo === 'derrota' ? 'var(--pp-danger)' : 'var(--pp-text-muted)' }}>
            {l.texto}
          </div>
        ))}
      </div>

      {/* Jack */}
      <motion.div animate={animAtaque === 'jack' ? { x: [0, -8, 8, 0] } : {}} style={{ background:'var(--pp-surface)', border:'1px solid var(--pp-border)', borderRadius:12, padding:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
          <span style={{ fontSize:'2rem' }}>🕵️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--pp-jack)' }}>Jack</div>
            <div style={{ fontSize:'0.7rem', color:'var(--pp-text-muted)' }}>HP: {jackHp}/{jackBase.hp}</div>
          </div>
        </div>
        <div style={{ height:6, background:'var(--pp-border)', borderRadius:3, overflow:'hidden' }}>
          <motion.div animate={{ width: `${hpPct(jackHp, jackBase.hp)}%` }} transition={{ duration:0.3 }}
            style={{ height:'100%', background:'var(--pp-jack)', borderRadius:3 }} />
        </div>
      </motion.div>

      {/* Botão */}
      <button
        onClick={atacarInimigo}
        disabled={turno !== 'player' || !!resultado}
        style={{ padding:'0.85rem', background: turno === 'player' && !resultado ? 'var(--pp-amber)' : 'var(--pp-surface2)', color: turno === 'player' && !resultado ? '#000' : 'var(--pp-text-muted)', border:'none', borderRadius:12, fontSize:'0.9rem', fontWeight:700, cursor: turno === 'player' && !resultado ? 'pointer' : 'default', transition:'all 0.2s' }}>
        {turno === 'player' ? '⚔️ ATACAR' : turno === 'inimigo' ? '⏳ Inimigo agindo...' : resultado === 'vitoria' ? '✓ Vitória!' : '✗ Derrota'}
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════
// CONVERSA (WHATSAPP STYLE)
// ══════════════════════════════════════════════════
function ConvoView({ caso, tipo, onBack, onConvoEnd }) {
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
    ? caso.dialogo?.narracao_abertura || ['Caso aberto.']
    : caso.dialogo?.narracao_final || ['Caso encerrado.']
  const narracao = (typeof narracaoRaw === 'object' && !Array.isArray(narracaoRaw))
    ? (narracaoRaw[LOCALE] || Object.values(narracaoRaw)[0] || '...')
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
          texto: msg.i18n[LOCALE],
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
        <div className="pp-chat-avatar" style={{ background: AVATARES.jack.cor, border:`2px solid ${AVATARES.jack.textCor}`, width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
          {AVATARES.jack.emoji}
        </div>
        <div>
          <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--pp-jack)' }}>Jack Cachorrão</div>
          <div style={{ fontSize:'0.65rem', color:'var(--pp-success)' }}>● online</div>
        </div>
      </div>

      {/* Mensagens — scrollável independente */}
      <div ref={msgsContainerRef} style={{ flex:1, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {msgs.map(msg => {
          if (msg.tipo === 'narracao') {
            return (
              <div key={msg.id} style={{ textAlign:'center', padding:'0.5rem 1rem', color:'var(--pp-text-muted)', fontFamily:'Georgia', fontStyle:'italic', fontSize:'0.78rem', maxWidth:'90%', alignSelf:'center' }}>
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
              style={{ display:'flex', flexDirection: isJack ? 'row-reverse' : 'row', alignItems:'flex-end', gap:'0.5rem', alignSelf: isJack ? 'flex-end' : 'flex-start', maxWidth:'78%' }}>

              {/* Avatar fora da bolha */}
              <div style={{ width:28, height:28, borderRadius:'50%', background:av.cor, border:`1.5px solid ${av.textCor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0, marginBottom:2 }}>
                {av.emoji}
              </div>

              <div style={{ background:av.cor, borderRadius: isJack ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding:'0.55rem 0.85rem', border:`1px solid ${av.textCor}22` }}>
                {!isJack && <div style={{ fontSize:'0.62rem', fontWeight:700, color:av.textCor, marginBottom:3 }}>{av.label}</div>}
                <div style={{ fontSize:'0.88rem', color:av.textCor, lineHeight:1.5 }}>{msg.texto}</div>
                <div style={{ fontSize:'0.62rem', opacity:0.4, marginTop:3, textAlign:'right', color:av.textCor }}>{msg.hora}</div>
              </div>
            </motion.div>
          )
        })}

        {/* Digitando */}
        {digitandoDe && (() => {
          const av = AVATARES[digitandoDe] || AVATARES.anonimo
          return (
            <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:av.cor, border:`1.5px solid ${av.textCor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0 }}>
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
  const info = pista.i18n[LOCALE]
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
        {pista.fio && <div className="pp-story-viewer-fio-label">⚡ FIO DA CONSPIRAÇÃO</div>}
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
  const [etapa, setEtapa] = useState('inicio') // inicio | animacao | puzzle | batalha | revelado
  const locInfo = local.i18n[LOCALE]
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
        <span style={{ color:'var(--pp-amber)', fontFamily:'Courier New', fontSize:'0.85rem' }}>{locInfo.nome}</span>
      </div>

      {/* Hero do local */}
      <div className="pp-local-hero">
        <div className="pp-local-emoji">🏚️</div>
        <div className="pp-local-nome">{locInfo.nome}</div>
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
                {local.batalha ? 'Confronto Necessário' : local.puzzle && local.puzzle !== 'nenhum' ? 'Resolver Puzzle para Investigar' : 'Investigar Local'}
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
          <motion.div key="puzzle-container" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ padding:'0 0.5rem' }}>
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
            style={{ margin:'1rem' }}>
            <span className={`pp-local-pista-tipo-badge ${pista.tipo}`}>{pista.tipo}</span>
            {pista.fio && <span className="pp-local-pista-tipo-badge fio" style={{ marginLeft:'0.4rem' }}>⚡ fio</span>}
            <div className="pp-local-pista-title" style={{ marginTop:'0.5rem' }}>{pista.i18n[LOCALE].titulo}</div>
            <div className="pp-local-pista-desc">{pista.i18n[LOCALE].desc}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="pp-local-voltar" onClick={onBack}>← Voltar ao Dossier</button>
    </div>
  )
}

// ══════════════════════════════════════════════════
// MENU INICIAL
// ══════════════════════════════════════════════════
function MenuInicial({ nivel, casosResolvidos, onContinuar, onNovoJogo }) {
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
      <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
        <div ref={rainRef} className="pp-rain" />
        <div style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ color:'var(--pp-amber)', fontFamily:'Courier New', fontSize:'0.85rem', marginBottom:'2rem', lineHeight:1.6 }}>
            tem certeza?<br/>isso apaga tudo.
          </div>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
            <button onClick={() => setConfirmando(false)}
              style={{ padding:'0.6rem 1.5rem', background:'transparent', color:'var(--pp-text-muted)', border:'1px solid var(--pp-border)', borderRadius:8, fontFamily:'Courier New', fontSize:'0.8rem', cursor:'pointer' }}>
              NÃO
            </button>
            <button onClick={onNovoJogo}
              style={{ padding:'0.6rem 1.5rem', background:'#300', color:'var(--pp-nina)', border:'1px solid var(--pp-nina)', borderRadius:8, fontFamily:'Courier New', fontSize:'0.8rem', cursor:'pointer', fontWeight:700 }}>
              SIM
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
      <div ref={rainRef} className="pp-rain" />
      <div style={{ position:'relative', zIndex:2, textAlign:'center' }}>
        <div style={{ fontFamily:'Courier New', fontSize:'0.6rem', letterSpacing:'0.4em', color:'var(--pp-amber)', marginBottom:'1rem', textTransform:'uppercase' }}>
          Marelia, 1954
        </div>
        <h1 style={{ fontFamily:'Courier New', fontSize:'1.6rem', fontWeight:900, color:'var(--pp-amber)', letterSpacing:'0.15em', marginBottom:'2.5rem', lineHeight:1.3 }}>
          PESADELO<br/>PARTICULAR
        </h1>

        <button onClick={onContinuar}
          style={{ display:'block', width:'100%', maxWidth:280, margin:'0 auto 1rem', padding:'0.85rem 0', background:'var(--pp-surface2)', color:'var(--pp-amber)', border:'1px solid var(--pp-amber)', borderRadius:10, fontFamily:'Courier New', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.1em', cursor:'pointer' }}>
          ● CONTINUAR
          <div style={{ fontSize:'0.6rem', fontWeight:400, color:'var(--pp-text-muted)', marginTop:4, letterSpacing:0 }}>
            nível {nivel}, {casosResolvidos.length} casos resolvidos
          </div>
        </button>

        <button onClick={() => setConfirmando(true)}
          style={{ display:'block', width:'100%', maxWidth:280, margin:'0 auto', padding:'0.85rem 0', background:'transparent', color:'var(--pp-text-muted)', border:'1px solid var(--pp-border)', borderRadius:10, fontFamily:'Courier New', fontSize:'0.8rem', letterSpacing:'0.1em', cursor:'pointer' }}>
          ○ NOVO JOGO
        </button>

        <button onClick={() => navigate('/games')}
          style={{ marginTop:'1.5rem', background:'none', border:'none', color:'var(--pp-text-muted)', fontFamily:'Courier New', fontSize:'0.7rem', cursor:'pointer', letterSpacing:'0.1em' }}>
          ← voltar ao site
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// PHONE CALL — 50% pistas trigger
// ══════════════════════════════════════════════════
function PhoneCall({ caso, onAccept, onReject }) {
  const [stage, setStage] = useState('ringing')
  const [msgAtual, setMsgAtual] = useState(0)
  const [textoExibido, setTextoExibido] = useState('')
  const charIdx = useRef(0)
  const timerRef = useRef(null)
  const tf = getTelefonema(caso.id)

  const suspeitoCulpado = caso.suspeitos.find(s => s.culpado)
  const linhas = [
    { de: 'jack', texto: tf.jack_abertura[LOCALE], avatar: '🕵️', cor: '#00ff88', label: 'Jack' },
    // Mostrar apenas 'Suspeito' para preservar o mistério (não revelar o nome real do culpado)
    { de: 'suspeito', texto: tf.suspeito[LOCALE], avatar: '👤', cor: '#ff4444', label: 'Suspeito' },
    { de: 'jack', texto: tf.jack_fechamento[LOCALE], avatar: '🕵️', cor: '#00ff88', label: 'Jack' },
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
          <div className="pp-phone-label">CHAMADA RECEBIDA</div>
          <div className="pp-phone-conhecido">{caso.i18n[LOCALE]?.nome || caso.id}</div>
          <div className="pp-phone-buttons">
            <button className="pp-phone-btn pp-phone-btn--accept" onClick={() => { setStage('accepted'); setMsgAtual(0) }}>
              <span>📞</span> ATENDER
            </button>
            <button className="pp-phone-btn pp-phone-btn--reject" onClick={onReject}>
              <span>✕</span> RECUSAR
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
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const store = usePPStore()
  const [appFase, setAppFase] = useState(null) // null=loading | menu | intro | app
  const [aba, setAba] = useState('feed')
  const [casoAtivo, setCasoAtivo] = useState(null)
  const [faseInterna, setFaseInterna] = useState(null)
  const [storyAtivo, setStoryAtivo] = useState(null)
  const [phoneCall, setPhoneCall] = useState(null)
  const phoneCallTriggered = useRef(new Set())
  const [suspeitoSelecionado, setSuspeitoSelecionado] = useState(null)
  const [feedbackAcusacao, setFeedbackAcusacao] = useState(null) // null | 'errado' | 'bloqueado'

  const { reputacao, casosResolvidos, pistasColetadas, acusacoesErradas, nivel, carregado, saveExists } = store

  // Load save
  useEffect(() => {
    console.log(`[PP] versão carregada: ${PP_VERSION}`)
    if (user) store.loadSave(user.id)
    else store.loadSave(null)
  }, [user])

  // Reader mode (hide navbar/footer/trial banner)
  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // Decide menu vs intro after load
  useEffect(() => {
    if (!carregado || appFase !== null) return
    const hasSave = saveExists || casosResolvidos.length > 0 || reputacao > 0 || Object.keys(pistasColetadas).length > 0 || Object.keys(acusacoesErradas).length > 0
    if (hasSave) {
      setAppFase('menu')
    } else {
      setAppFase('intro')
    }
  }, [carregado, appFase, casosResolvidos, reputacao, pistasColetadas, acusacoesErradas, saveExists])

  const handleNovoJogo = async () => {
    await store.resetSave(user?.id)
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
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem', padding:'0.75rem 0', borderBottom:'1px solid var(--pp-border)' }}>
            <button className="pp-convo-back" onClick={() => { setFaseInterna(null); setCasoAtivo(null); setSuspeitoSelecionado(null) }}>←</button>
            <span style={{ color:'var(--pp-amber)', fontFamily:'Courier New', fontSize:'0.85rem' }}>{casoAtivo.i18n[LOCALE].nome}</span>
          </div>

          {/* Briefing */}
          {!resolvido && (
            <div onClick={() => setFaseInterna({ tipo:'convo', convoTipo:'abertura' })}
              style={{ background:'var(--pp-surface)', border:'1px solid var(--pp-border)', borderRadius:12, padding:'0.75rem 1rem', marginBottom:'1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span style={{ fontSize:'1.5rem' }}>💬</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--pp-text)' }}>Briefing do Caso</div>
                <div style={{ fontSize:'0.7rem', color:'var(--pp-text-muted)' }}>Ver conversa de abertura</div>
              </div>
              <span style={{ color:'var(--pp-amber)' }}>→</span>
            </div>
          )}

          {/* Pistas counter */}
          <div className="pp-pistas-counter">
            <span className="pp-pistas-counter-label">PISTAS COLETADAS</span>
            <span className="pp-pistas-counter-value">{pistas.length} / {casoAtivo.pistas_necessarias}</span>
          </div>

          {/* Pistas coletadas — clicáveis */}
          {pistas.length > 0 && (
            <div style={{ marginBottom:'1rem' }}>
              <div className="pp-dossier-section-title" style={{ marginBottom:'0.5rem' }}>EVIDÊNCIAS</div>
              {pistas.map(pid => {
                const p = casoAtivo.pistas.find(pp => pp.id === pid)
                if (!p) return null
                return (
                  <div key={pid} onClick={() => setStoryAtivo(p)}
                    style={{ background:'var(--pp-surface2)', border:`1px solid ${p.fio ? 'var(--pp-fio)' : 'var(--pp-border)'}`, borderRadius:8, padding:'0.6rem 0.85rem', marginBottom:'0.4rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <span style={{ fontSize:'1rem' }}>{p.tipo === 'fio' ? '🕸️' : p.tipo === 'testemunho' ? '💬' : p.tipo === 'documento' ? '📄' : '🔍'}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.78rem', fontWeight:700, color: p.fio ? 'var(--pp-fio)' : 'var(--pp-text)' }}>{p.i18n[LOCALE].titulo}</div>
                    </div>
                    {p.fio && <span style={{ fontSize:'0.6rem', color:'var(--pp-fio)' }}>⚡ FIO</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Suspeitos */}
          <div className="pp-dossier-section-title">SUSPEITOS</div>
          {casoAtivo.suspeitos.map(s => (
            <div key={s.id} className={`pp-suspeito-card ${suspeitoSelecionado === s.id ? 'selected' : ''}`}
              onClick={() => !resolvido && setSuspeitoSelecionado(s.id)}>
              <div className="pp-suspeito-avatar">{s.avatar}</div>
              <div className="pp-suspeito-info">
                <div className="pp-suspeito-nome">{s.i18n[LOCALE].nome}</div>
                <div className="pp-suspeito-bio">{s.i18n[LOCALE].bio}</div>
              </div>
              {!resolvido && <div className="pp-suspeito-radio" />}
              {resolvido && s.culpado && <span style={{ fontSize:'1.2rem' }}>✓</span>}
            </div>
          ))}

          {/* Locais */}
          <div className="pp-dossier-section-title" style={{ marginTop:'1rem' }}>LOCAIS</div>
          {casoAtivo.locais.map(local => {
            const pistaColetada = pistas.includes(local.pista_id)
            const locInfo = local.i18n[LOCALE]
            return (
              <div key={local.id}
                style={{ background:'var(--pp-surface)', border:`1px solid ${pistaColetada ? 'var(--pp-success)' : 'var(--pp-border)'}`, borderRadius:12, padding:'0.85rem 1rem', marginBottom:'0.5rem', cursor: pistaColetada ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:'0.75rem' }}
                onClick={() => !pistaColetada && setFaseInterna({ tipo:'local', local })}>
                <span style={{ fontSize:'1.3rem' }}>{local.batalha ? '⚔️' : PUZZLE_EMOJI[local.puzzle || 'nenhum']}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:700, color: pistaColetada ? 'var(--pp-success)' : 'var(--pp-text)' }}>{locInfo.nome}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--pp-text-muted)', marginTop:2 }}>{locInfo.desc}</div>
                </div>
                {pistaColetada ? <span style={{ color:'var(--pp-success)' }}>✓</span> : <span style={{ color:'var(--pp-text-muted)' }}>→</span>}
              </div>
            )
          })}

          {/* Acusar */}
          {!resolvido && (
            <>
              {feedbackAcusacao === 'errado' && (
                <div style={{ color:'var(--pp-nina)', fontFamily:'Courier New', fontSize:'0.75rem', textAlign:'center', padding:'0.5rem', marginTop:'0.5rem' }}>
                  pista errada. tente novamente.
                </div>
              )}
              {feedbackAcusacao === 'bloqueado' && (
                <div style={{ color:'var(--pp-nina)', fontFamily:'Courier New', fontSize:'0.75rem', textAlign:'center', padding:'0.5rem', marginTop:'0.5rem' }}>
                  caso fracassado. reinicie para tentar novamente.
                </div>
              )}
              {feedbackAcusacao === 'incompleto' && (
                <div style={{ color:'var(--pp-nina)', fontFamily:'Courier New', fontSize:'0.75rem', textAlign:'center', padding:'0.5rem', marginTop:'0.5rem' }}>
                  complete todas as pistas antes de acusar.
                </div>
              )}
              <button className="pp-acusar-btn"
                disabled={!suspeitoSelecionado || pistas.length < casoAtivo.pistas_necessarias || feedbackAcusacao === 'bloqueado'}
                onClick={handleAcusar}>
              {pistas.length < casoAtivo.pistas_necessarias
                ? `Colete mais ${pistasFaltam} pista${pistasFaltam > 1 ? 's' : ''}`
                : `ACUSAR ${casoAtivo.suspeitos.find(s => s.id === suspeitoSelecionado)?.i18n[LOCALE].nome || '...'}`
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
                  <div className="pp-story-label">{pista.i18n[LOCALE].titulo.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Casos como posts */}
          {casosDisponiveis.map(caso => {
            const resolvido = casosResolvidos.includes(caso.id)
            const cInfo = caso.i18n[LOCALE]
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
                  <span style={{ fontSize:'4rem' }}>{caso.thumbnail}</span>
                  <div className="pp-caso-thumbnail-text">{cInfo.subtitulo}</div>
                  {resolvido && <div className="pp-caso-resolv-badge">RESOLVIDO ✓</div>}
                </div>

                <div className="pp-caso-actions">
                  <div className="pp-caso-action-btn"><span>💬</span> {caso.dialogo?.abertura?.length || 0}</div>
                  <div className="pp-caso-action-btn"><span>🔍</span> {getPistasDoCase(caso.id).length}/{caso.pistas_necessarias}</div>
                  <span className="pp-caso-hashtag">#{cInfo.nome.replace(/\s/g,'')}</span>
                  <button className="pp-caso-open-btn" onClick={() => { setCasoAtivo(caso); setFaseInterna({ tipo:'dossier' }); setSuspeitoSelecionado(null) }}>
                    {resolvido ? 'REVISITAR' : 'INVESTIGAR'}
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
              ultima: primeiraMsg?.i18n?.[LOCALE] || '',
              hora: '--:--',
              unread: casosResolvidos.includes(caso?.id) ? 0 : 1,
            }
          }),
      ]
      return (
        <div className="pp-chat-list">
          <div className="pp-section-header">MENSAGENS</div>
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
      if (todasPistas.length === 0) return <div className="pp-empty">Nenhuma pista coletada ainda.<br /><br />Investigue os locais dos casos para revelar evidências.</div>
      return (
        <div className="pp-stories-grid">
          {todasPistas.map(({ pista }) => (
            <div key={pista.id} className="pp-story-card" onClick={() => setStoryAtivo(pista)}>
              <div className="pp-story-card-bg">{pista.tipo === 'fio' ? '🕸️' : pista.tipo === 'testemunho' ? '💬' : pista.tipo === 'documento' ? '📄' : '🔍'}</div>
              <div className="pp-story-card-overlay" />
              {pista.fio && <div className="pp-story-card-fio-border" />}
              <div className="pp-story-card-content">
                <div className={`pp-story-card-tipo ${pista.tipo}`}>{pista.tipo}</div>
                <div className="pp-story-card-title">{pista.i18n[LOCALE].titulo}</div>
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
          <div className="pp-dossier-section-title" style={{ marginBottom:'0.75rem' }}>STATUS</div>
          <div style={{ background:'var(--pp-surface)', border:'1px solid var(--pp-border)', borderRadius:12, padding:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            <div>
              <div style={{ fontSize:'1.8rem', fontWeight:900, color:'var(--pp-amber)', fontFamily:'Courier New' }}>{reputacao}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--pp-text-muted)' }}>REPUTAÇÃO</div>
            </div>
            <div>
              <div style={{ fontSize:'1.8rem', fontWeight:900, color:'var(--pp-jack)', fontFamily:'Courier New' }}>{casosResolvidos.length}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--pp-text-muted)' }}>CASOS RESOLVIDOS</div>
            </div>
            <div>
              <div style={{ fontSize:'1.8rem', fontWeight:900, color:'var(--pp-kim)', fontFamily:'Courier New' }}>{nivel}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--pp-text-muted)' }}>NÍVEL</div>
            </div>
            <div>
              <div style={{ fontSize:'1.8rem', fontWeight:900, color:'var(--pp-fio)', fontFamily:'Courier New' }}>{fios.length}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--pp-text-muted)' }}>FIOS DA CONSPIRAÇÃO</div>
            </div>
          </div>

          <div className="pp-dossier-section-title" style={{ marginBottom:'1rem' }}>CADERNO DE SUSPEITAS</div>
          {fios.length === 0
            ? <div className="pp-caderno-empty">"ainda não sei quem é.<br />mas cada pista liga um ponto a outro."</div>
            : fios.map(({ pista, caso }) => (
              <div key={pista.id} className="pp-caderno-node" onClick={() => setStoryAtivo(pista)} style={{ cursor:'pointer' }}>
                <div className="pp-caderno-node-caso">{caso.i18n[LOCALE].nome}</div>
                <div className="pp-caderno-node-title">⚡ {pista.i18n[LOCALE].titulo}</div>
                <div className="pp-caderno-node-desc">{pista.i18n[LOCALE].desc}</div>
              </div>
            ))
          }
        </div>
      )
    }
  }

  // Loading
  if (!carregado) {
    return (
      <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--pp-amber)', fontFamily:'Courier New', fontSize:'0.8rem', letterSpacing:'0.2em' }}>
        CARREGANDO...
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
      <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth:480 }}>
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
              <div className="pp-top-bar-name">Pesadelo Particular</div>
              <div className="pp-top-bar-sub">Marelia, 1954 · Nível {nivel}</div>
            </div>
            <div className="pp-top-bar-rep">⭐ {reputacao} REP</div>
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
              { id:'feed',      icon:'🏠', label:'Casos' },
              { id:'mensagens', icon:'💬', label:'Chat',    badge: casosDisponiveis.filter(c => !casosResolvidos.includes(c.id)).length },
              { id:'stories',   icon:'📖', label:'Pistas',  badge: getFiosPistas().length > 0 ? getFiosPistas().length : 0 },
              { id:'arquivos',  icon:'🗂️', label:'Arquivos' },
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