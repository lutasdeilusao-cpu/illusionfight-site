import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CASOS } from './data/casos'
import { usePPStore } from './store/usePPStore'
import './PP.css'

const PP_VERSION = '1.3.0'
console.log(`[PP] versão carregada: ${PP_VERSION}`)

const AVATARES = {
  jack: { emoji: '🕵️', cor: '#1a3a2a', textCor: '#00ff88', label: 'Jack' },
  nina: { emoji: '⚔️', cor: '#2a1a1a', textCor: '#ff8888', label: 'Nina' },
  kim: { emoji: '🔥', cor: '#1a2a3a', textCor: '#00ccff', label: 'Kim' },
  pajé: { emoji: '🪄', cor: '#2a2a1a', textCor: '#ffd700', label: 'Pajé Yawanari' },
  anonimo: { emoji: '❓', cor: '#1a1a1a', textCor: '#888888', label: 'Desconhecido' },
  helena: { emoji: '🚬', cor: '#1a1a1a', textCor: '#c8c8c8', label: 'Helena' },
  shuntaro: { emoji: '⚡', cor: '#1a1a2a', textCor: '#8888ff', label: 'Shuntaro' },
}

const PUZZLE_EMOJI = { decoder: '📻', stealth: '🥷', labirinto: '🌀', anagrama: '🔤', sliding: '🧩', nenhum: '🔍' }

function IntroNoir({ onComplete }) {
  const [text, setText] = useState('')
  const [fase, setFase] = useState('typing')
  const fullText = 'Marelia, 1954. A chuva não para há três dias.\n\nVocê não é detetive.\n\nMas o sonho não liga pra isso.'
  const idx = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const rain = document.querySelector('.pp-rain')
    if (rain) {
      for (let i = 0; i < 40; i++) {
        const drop = document.createElement('div')
        drop.className = 'pp-rain-drop'
        drop.style.left = `${Math.random() * 100}%`
        drop.style.height = `${60 + Math.random() * 80}px`
        drop.style.animationDuration = `${0.6 + Math.random() * 0.8}s`
        drop.style.animationDelay = `${Math.random() * 2}s`
        drop.style.opacity = 0.2 + Math.random() * 0.4
        rain.appendChild(drop)
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
        {text.split('\n').map((line, i) => (
          <span key={i}>{line}{i < text.split('\n').length - 1 && <><br /><br /></>}</span>
        ))}
        {fase === 'typing' && <span className="pp-intro-cursor" />}
      </div>
      {fase === 'glitch' && <div className="pp-glitch-overlay" />}
      <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'Courier New', letterSpacing: '0.1em' }}>
        toque para pular
      </div>
    </div>
  )
}

function ConvoView({ caso, tipo, onBack }) {
  const [msgs, setMsgs] = useState([])
  const [digitando, setDigitando] = useState(false)
  const [done, setDone] = useState(false)
  const endRef = useRef(null)
  const locale = 'pt'

  const dialogo = tipo === 'abertura' ? caso.dialogo.abertura : caso.dialogo.resolucao
  const narracao = tipo === 'abertura' ? caso.dialogo.narracao_abertura : caso.dialogo.narracao_final

  useEffect(() => {
    setMsgs([{ tipo: 'narracao', texto: typeof narracao === 'object' ? narracao[locale] : narracao, id: 'narr-start' }])
    dialogo.forEach((msg, i) => {
      setTimeout(() => {
        setDigitando(true)
        setTimeout(() => {
          setDigitando(false)
          setMsgs(prev => [...prev, { id: `msg-${i}`, de: msg.de, texto: msg.i18n[locale], hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }])
          if (i === dialogo.length - 1) {
            setTimeout(() => {
              setMsgs(prev => [...prev, { tipo: 'narracao', texto: typeof narracao === 'object' ? narracao[locale] : narracao, id: 'narr-end' }])
              setDone(true)
            }, 1200)
          }
        }, 600)
      }, msg.delay + 800)
    })
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, digitando])

  return (
    <div className="pp-convo">
      <div className="pp-convo-header">
        <button className="pp-convo-back" onClick={onBack}>←</button>
        <div className="pp-chat-avatar" style={{ background: AVATARES.jack.cor, borderColor: AVATARES.jack.textCor }}>{AVATARES.jack.emoji}</div>
        <div><div className="pp-chat-name">Jack Cachorrão</div><div className="pp-chat-preview" style={{ color: '#00ff88', fontSize: '0.7rem' }}>● online</div></div>
      </div>
      <div className="pp-convo-messages">
        {msgs.map(msg => {
          if (msg.tipo === 'narracao') return <div key={msg.id} className="pp-msg narracao">{msg.texto}</div>
          return (<div key={msg.id} className={`pp-msg ${msg.de}`}>{msg.texto}<span className="pp-msg-time">{msg.hora}</span></div>)
        })}
        {digitando && (
          <div className="pp-msg jack" style={{ padding: '0.4rem 0.75rem' }}>
            <div className="pp-msg-typing"><div className="pp-msg-typing-dot" /><div className="pp-msg-typing-dot" /><div className="pp-msg-typing-dot" /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}

function StoryViewer({ pista, onClose }) {
  const locale = 'pt'; const info = pista.i18n[locale]
  return (
    <motion.div className="pp-story-viewer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
      <div className="pp-story-viewer-bar"><div className="pp-story-viewer-seg"><div className="pp-story-viewer-seg-fill" /></div></div>
      <button className="pp-story-viewer-close" onClick={onClose}>✕</button>
      <div className="pp-story-viewer-content">
        <div className="pp-story-viewer-emoji">{pista.tipo === 'fio' ? '🕸️' : pista.tipo === 'testemunho' ? '💬' : pista.tipo === 'documento' ? '📄' : '🔍'}</div>
        <div className="pp-story-viewer-tipo">{pista.tipo}</div>
        {pista.fio && <div className="pp-story-viewer-fio-label">⚡ FIO DA CONSPIRAÇÃO</div>}
        <div className="pp-story-viewer-title">{info.titulo}</div>
        <div className="pp-story-viewer-desc">{info.desc}</div>
      </div>
    </motion.div>
  )
}

function LocalView({ local, caso, onPistaColetada, onBack }) {
  const [pistaRevelada, setPistaRevelada] = useState(false)
  const locale = 'pt'; const pista = caso.pistas.find(p => p.id === local.pista_id)
  const locInfo = local.i18n ? local.i18n[locale] : { nome: local.id, desc: '' }

  const handleInvestigar = () => {
    setPistaRevelada(true)
    onPistaColetada(pista)
  }

  return (
    <div className="pp-local">
      <div className="pp-convo-header">
        <button className="pp-convo-back" onClick={onBack}>←</button>
        <span style={{ color: 'var(--pp-amber)', fontFamily: 'Courier New', fontSize: '0.85rem' }}>{locInfo.nome}</span>
      </div>
      <div className="pp-local-hero">
        <div className="pp-local-emoji">🏚️</div>
        <div className="pp-local-nome">{locInfo.nome}</div>
        <div className="pp-local-desc">{locInfo.desc}</div>
      </div>
      {!pistaRevelada ? (
        <div className="pp-local-puzzle-cta" onClick={handleInvestigar}>
          <div className="pp-local-puzzle-icon">{PUZZLE_EMOJI[local.puzzle || 'nenhum']}</div>
          <div className="pp-local-puzzle-label">{local.puzzle && local.puzzle !== 'nenhum' ? 'Resolver Puzzle para Investigar' : 'Investigar Local'}</div>
          {local.puzzle && <div className="pp-local-puzzle-sub">{local.puzzle.toUpperCase()}</div>}
        </div>
      ) : (
        <div className="pp-local-pista-reveal" style={{ margin: '1rem' }}>
          <span className={`pp-local-pista-tipo-badge ${pista.tipo}`}>{pista.tipo}</span>
          {pista.fio && <span className="pp-local-pista-tipo-badge fio" style={{ marginLeft: '0.4rem' }}>⚡ fio</span>}
          <div className="pp-local-pista-title">{pista.i18n[locale].titulo}</div>
          <div className="pp-local-pista-desc">{pista.i18n[locale].desc}</div>
        </div>
      )}
      <button className="pp-local-voltar" onClick={onBack}>← Voltar ao Dossier</button>
    </div>
  )
}

export default function PP() {
  // DEBUG: log estrutura do primeiro caso pra confirmar arrays corretos
  const c0 = CASOS[0]
  console.log('[PP-DEBUG] caso_01 suspeitos:', c0.suspeitos?.length, '| locais:', c0.locais?.length, '| pistas:', c0.pistas?.length)
  console.log('[PP-DEBUG] suspeitos[0]:', c0.suspeitos?.[0]?.id, c0.suspeitos?.[0]?.i18n?.pt?.nome)
  console.log('[PP-DEBUG] locais[0]:', c0.locais?.[0]?.id, c0.locais?.[0]?.i18n?.pt?.nome)
  const store = usePPStore()
  const [fase, setFase] = useState('intro')
  const [aba, setAba] = useState('feed')
  const [casoAtivo, setCasoAtivo] = useState(null)
  const [faseInterna, setFaseInterna] = useState(null)
  const [storyAtivo, setStoryAtivo] = useState(null)
  const [reputacao, setReputacao] = useState(0)
  const [pistasColetadas, setPistasColetadas] = useState({})
  const [casosResolvidos, setCasosResolvidos] = useState([])
  const [suspeitoSelecionado, setSuspeitoSelecionado] = useState(null)
  const locale = 'pt'

  useEffect(() => { store.loadSave() }, [])

  const casosDisponiveis = CASOS.filter(c =>
    c.desbloqueado || casosResolvidos.some(r => {
      const cr = CASOS.find(cc => cc.id === r)
      return cr?.desbloqueia?.includes(c.id)
    })
  )

  const getPistasDoCase = (cid) => pistasColetadas[cid] || []
  const getFiosPistas = () => Object.entries(pistasColetadas).flatMap(([cid, pids]) => {
    const caso = CASOS.find(c => c.id === cid)
    return pids.map(pid => { const p = caso?.pistas.find(pp => pp.id === pid); return p?.fio ? { pista: p, caso } : null }).filter(Boolean)
  })

  const handlePistaColetada = useCallback((pista) => {
    if (!casoAtivo) return
    setPistasColetadas(prev => {
      const existentes = prev[casoAtivo.id] || []
      if (existentes.includes(pista.id)) return prev
      return { ...prev, [casoAtivo.id]: [...existentes, pista.id] }
    })
  }, [casoAtivo])

  const handleAcusar = () => {
    if (!suspeitoSelecionado || !casoAtivo) return
    const s = casoAtivo.suspeitos.find(x => x.id === suspeitoSelecionado)
    if (s?.culpado) {
      setCasosResolvidos(prev => [...prev, casoAtivo.id])
      setReputacao(prev => prev + casoAtivo.reputacao_ganho)
      setFaseInterna({ tipo: 'convo', convoTipo: 'resolucao' })
    } else {
      setSuspeitoSelecionado(null)
    }
  }

  const renderAba = () => {
    if (faseInterna?.tipo === 'local') return <LocalView local={faseInterna.local} caso={casoAtivo} onPistaColetada={handlePistaColetada} onBack={() => setFaseInterna({ tipo: 'dossier' })} />
    if (faseInterna?.tipo === 'convo') return <ConvoView caso={casoAtivo} tipo={faseInterna.convoTipo} onBack={() => setFaseInterna(null)} />

    if (faseInterna?.tipo === 'dossier' && casoAtivo) {
      const pistas = getPistasDoCase(casoAtivo.id)
      const pf = casoAtivo.pistas_necessarias - pistas.length
      const resolvido = casosResolvidos.includes(casoAtivo.id)
      return (
        <div className="pp-dossier">
          <div className="pp-convo-header" style={{ margin: '0 -1rem 1rem', padding: '0.75rem 1rem', background: 'var(--pp-surface)', borderBottom: '1px solid var(--pp-border)' }}>
            <button className="pp-convo-back" onClick={() => { setFaseInterna(null); setCasoAtivo(null) }}>←</button>
            <span style={{ color: 'var(--pp-amber)', fontFamily: 'Courier New', fontSize: '0.85rem' }}>{casoAtivo.i18n[locale].nome}</span>
          </div>
          {!resolvido && (
            <div style={{ background: 'var(--pp-surface)', border: '1px solid var(--pp-border)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              onClick={() => setFaseInterna({ tipo: 'convo', convoTipo: 'abertura' })}>
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              <div><div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--pp-text)' }}>Briefing do Caso</div><div style={{ fontSize: '0.7rem', color: 'var(--pp-text-muted)' }}>Ver conversa de abertura</div></div>
              <span style={{ marginLeft: 'auto', color: 'var(--pp-amber)' }}>→</span>
            </div>
          )}
          <div className="pp-pistas-counter"><span className="pp-pistas-counter-label">PISTAS COLETADAS</span><span className="pp-pistas-counter-value">{pistas.length} / {casoAtivo.pistas_necessarias}</span></div>
          <div className="pp-dossier-section-title">SUSPEITOS</div>
          {casoAtivo.suspeitos.map(s => (
            <div key={s.id} className={`pp-suspeito-card ${suspeitoSelecionado === s.id ? 'selected' : ''}`} onClick={() => !resolvido && setSuspeitoSelecionado(s.id)}>
              <div className="pp-suspeito-avatar">{s.avatar}</div>
              <div className="pp-suspeito-info"><div className="pp-suspeito-nome">{s.i18n[locale].nome}</div><div className="pp-suspeito-bio">{s.i18n[locale].bio}</div></div>
              {!resolvido && <div className="pp-suspeito-radio" />}
              {resolvido && s.culpado && <span style={{ fontSize: '1.2rem' }}>✓</span>}
            </div>
          ))}
          <div className="pp-dossier-section-title" style={{ marginTop: '1rem' }}>LOCAIS</div>
          {casoAtivo.locais.map(l => {
            const col = pistas.includes(l.pista_id)
            return (
              <div key={l.id} style={{ background: 'var(--pp-surface)', border: `1px solid ${col ? 'var(--pp-success)' : 'var(--pp-border)'}`, borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '0.5rem', cursor: resolvido || col ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                onClick={() => !resolvido && !col && setFaseInterna({ tipo: 'local', local: l })}>
                <span style={{ fontSize: '1.3rem' }}>{PUZZLE_EMOJI[l.puzzle || 'nenhum']}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: '0.85rem', fontWeight: 700, color: col ? 'var(--pp-success)' : 'var(--pp-text)' }}>{l.i18n ? l.i18n[locale].nome : l.id}</div><div style={{ fontSize: '0.7rem', color: 'var(--pp-text-muted)', marginTop: 2 }}>{l.i18n ? l.i18n[locale].desc : ''}</div></div>
                {col ? <span style={{ color: 'var(--pp-success)', fontSize: '1.1rem' }}>✓</span> : <span style={{ color: 'var(--pp-text-muted)' }}>→</span>}
              </div>
            )
          })}
          {!resolvido && (
            <button className="pp-acusar-btn" disabled={!suspeitoSelecionado || pistas.length < casoAtivo.pistas_necessarias} onClick={handleAcusar}>
              {pistas.length < casoAtivo.pistas_necessarias ? `Colete mais ${pf} pista${pf > 1 ? 's' : ''}` : `ACUSAR ${casoAtivo.suspeitos.find(s => s.id === suspeitoSelecionado)?.i18n[locale].nome || '...'}`}
            </button>
          )}
        </div>
      )
    }

    if (aba === 'feed') {
      return (
        <div className="pp-feed">
          <div className="pp-stories-bar">
            {casosDisponiveis.flatMap(c => getPistasDoCase(c.id).map(pid => { const p = c.pistas.find(pp => pp.id === pid); return p ? { pista: p, caso: c } : null }).filter(Boolean)).slice(0, 8).map(({ pista, caso }) => (
              <div key={pista.id} className="pp-story-thumb" onClick={() => setStoryAtivo(pista)}>
                <div className={`pp-story-ring ${pista.fio ? 'fio' : ''}`}><div className="pp-story-inner">{pista.tipo === 'fio' ? '🕸️' : '🔍'}</div></div>
                <div className="pp-story-label">{String(pista?.i18n?.[locale]?.titulo || '?').split(' ')[0]}</div>
              </div>
            ))}
            {getPistasDoCase(casoAtivo?.id)?.length === 0 && <div style={{ padding: '1rem', color: 'var(--pp-text-muted)', fontSize: '0.75rem', fontFamily: 'Georgia', fontStyle: 'italic' }}>Investigue locais para coletar pistas</div>}
          </div>
          {casosDisponiveis.map(caso => {
            const resolvido = casosResolvidos.includes(caso.id)
            return (
              <div key={caso.id} className={`pp-caso-card ${resolvido ? 'resolvido' : ''}`}>
                <div className="pp-caso-header">
                  <div className="pp-caso-avatar">🌆</div>
                  <div className="pp-caso-meta"><div className="pp-caso-nome">{caso.i18n[locale].nome}</div><div className="pp-caso-sub">Marelia, 1954 · Dif. {'★'.repeat(caso.dificuldade)}</div></div>
                  <div className="pp-caso-dif">+{caso.reputacao_ganho} REP</div>
                </div>
                <div className="pp-caso-thumbnail"><span style={{ fontSize: '4rem' }}>{caso.thumbnail}</span><div className="pp-caso-thumbnail-text">{caso.i18n[locale].subtitulo}</div>{resolvido && <div className="pp-caso-resolv-badge">RESOLVIDO ✓</div>}</div>
                <div className="pp-caso-actions">
                  <div className="pp-caso-action-btn"><span>💬</span> {caso.dialogo?.abertura?.length || 0}</div>
                  <div className="pp-caso-action-btn"><span>🔍</span> {getPistasDoCase(caso.id).length}/{caso.pistas_necessarias}</div>
                  <span className="pp-caso-hashtag">#{caso.i18n[locale].nome.replace(/\s/g, '')}</span>
                  {!resolvido && <button className="pp-caso-open-btn" onClick={() => { setCasoAtivo(caso); setFaseInterna({ tipo: 'dossier' }) }}>INVESTIGAR</button>}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (aba === 'mensagens') {
      const contatos = [
        { id: 'nina', ultima: 'o Osvaldo sumiu', hora: '23:14', unread: 1 },
        { id: 'kim', ultima: 'alguém me fotografou de costas', hora: '01:32', unread: 0 },
        { id: 'pajé', ultima: 'CHEGUEEEEI PRA DIVAR', hora: '02:00', unread: 1 },
        { id: 'helena', ultima: 'preciso de alguém que não vá à polícia', hora: '21:47', unread: 0 },
        { id: 'shuntaro', ultima: 'vim ao Brasil a negócios', hora: '14:23', unread: 0 },
        { id: 'anonimo', ultima: 'me indicaram o senhor', hora: 'ontem', unread: 3 },
      ]
      return (
        <div className="pp-chat-list">
          <div className="pp-section-header">MENSAGENS</div>
          {contatos.map(c => {
            const av = AVATARES[c.id] || AVATARES.anonimo
            const casoDoContato = CASOS.find(caso => caso.dialogo?.abertura?.some(m => m.de === c.id) && casosDisponiveis.includes(caso))
            return (
              <div key={c.id} className="pp-chat-item" onClick={() => { if (casoDoContato) { setCasoAtivo(casoDoContato); setFaseInterna({ tipo: 'convo', convoTipo: 'abertura' }) } }}>
                <div className="pp-chat-avatar-wrap">
                  <div className="pp-chat-avatar" style={{ background: av.cor, borderColor: av.textCor }}>{av.emoji}</div>
                  {c.unread > 0 && <div className="pp-chat-online" />}
                </div>
                <div className="pp-chat-info"><div className="pp-chat-name" style={{ color: av.textCor }}>{av.label}</div><div className="pp-chat-preview">{c.ultima}</div></div>
                <div className="pp-chat-meta"><div className="pp-chat-time">{c.hora}</div>{c.unread > 0 && <div className="pp-chat-unread">{c.unread}</div>}</div>
              </div>
            )
          })}
        </div>
      )
    }

    if (aba === 'stories') {
      const tp = casosDisponiveis.flatMap(c => getPistasDoCase(c.id).map(pid => { const p = c.pistas.find(pp => pp.id === pid); return p ? { pista: p, caso: c } : null }).filter(Boolean))
      if (tp.length === 0) return <div className="pp-empty">Nenhuma pista coletada ainda.<br /><br />Investigue os locais dos casos para revelar evidências.</div>
      return (
        <div className="pp-stories-grid">
          {tp.map(({ pista }) => (
            <div key={pista.id} className="pp-story-card" onClick={() => setStoryAtivo(pista)}>
              <div className="pp-story-card-bg">{pista.tipo === 'fio' ? '🕸️' : pista.tipo === 'testemunho' ? '💬' : pista.tipo === 'documento' ? '📄' : '🔍'}</div>
              <div className="pp-story-card-overlay" />{pista.fio && <div className="pp-story-card-fio-border" />}
              <div className="pp-story-card-content"><div className={`pp-story-card-tipo ${pista.tipo}`}>{pista.tipo}</div><div className="pp-story-card-title">{pista.i18n[locale].titulo}</div></div>
            </div>
          ))}
        </div>
      )
    }

    if (aba === 'arquivos') {
      const fios = getFiosPistas()
      return (
        <div className="pp-caderno">
          <div className="pp-dossier-section-title" style={{ marginBottom: '1rem' }}>CADERNO DE SUSPEITAS</div>
          {fios.length === 0 ? <div className="pp-caderno-empty">"ainda não sei quem é.<br />mas cada pista liga um ponto a outro.<br />e os pontos estão se conectando."</div>
            : fios.map(({ pista, caso }) => (
              <div key={pista.id} className="pp-caderno-node">
                <div className="pp-caderno-node-caso">{caso.i18n[locale].nome}</div>
                <div className="pp-caderno-node-title">⚡ {pista.i18n[locale].titulo}</div>
                <div className="pp-caderno-node-desc">{pista.i18n[locale].desc}</div>
              </div>
            ))}
          <div className="pp-dossier-section-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>REPUTAÇÃO</div>
          <div style={{ background: 'var(--pp-surface)', border: '1px solid var(--pp-border)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--pp-amber)', fontFamily: 'Courier New' }}>{reputacao}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--pp-text-muted)', marginTop: 4 }}>pontos de reputação · {casosResolvidos.length} casos resolvidos</div>
          </div>
        </div>
      )
    }
  }

  if (fase === 'intro') return <div className="pp-wrapper"><IntroNoir onComplete={() => setFase('app')} /></div>

  return (
    <div className="pp-wrapper">
      <motion.div className="pp-app" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="pp-status-bar"><span className="pp-status-time">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span><div className="pp-status-icons"><span>📶</span><span>🔋</span></div></div>
        {!faseInterna && (
          <div className="pp-top-bar">
            <div className="pp-top-bar-avatar">🌙</div>
            <div className="pp-top-bar-info"><div className="pp-top-bar-name">Pesadelo Particular</div><div className="pp-top-bar-sub">Marelia, 1954</div></div>
            <div className="pp-top-bar-rep">⭐ {reputacao} REP</div>
          </div>
        )}
        <div className="pp-content"><AnimatePresence mode="wait"><motion.div key={`${aba}-${faseInterna?.tipo}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>{renderAba()}</motion.div></AnimatePresence></div>
        {!faseInterna && (
          <div className="pp-bottom-nav">
            {[
              { id: 'feed', icon: '🏠', label: 'Casos' },
              { id: 'mensagens', icon: '💬', label: 'Chat', badge: casosDisponiveis.filter(c => !casosResolvidos.includes(c.id)).length },
              { id: 'stories', icon: '📖', label: 'Pistas', badge: getFiosPistas().length },
              { id: 'arquivos', icon: '🗂️', label: 'Arquivos' },
            ].map(nav => (
              <button key={nav.id} className={`pp-nav-btn ${aba === nav.id ? 'active' : ''}`} onClick={() => setAba(nav.id)}>
                {nav.badge > 0 && <span className="pp-nav-badge">{nav.badge}</span>}<span className="pp-nav-btn-icon">{nav.icon}</span>{nav.label}
              </button>
            ))}
          </div>
        )}
      </motion.div>
      <AnimatePresence>{storyAtivo && <StoryViewer pista={storyAtivo} onClose={() => setStoryAtivo(null)} />}</AnimatePresence>
    </div>
  )
}
