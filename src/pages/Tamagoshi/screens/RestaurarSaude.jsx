import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { CRIATURAS } from '../data/criaturas'
import CriaturaSprite from '../components/CriaturaSprite'
import { DIX_POR_ACAO } from '../data/moedas'

const ACOES = ['termometro', 'curativo', 'xarope']

const INSTRUCOES = {
  termometro: 'Meça a temperatura do Kroniki',
  curativo:   'Coloque um curativo no Kroniki',
  xarope:     'Dê o xarope pro Kroniki',
}

const INSTRUCOES_EN = {
  termometro: 'Take Kroniki\'s temperature',
  curativo:   'Put a bandage on Kroniki',
  xarope:     'Give the syrup to Kroniki',
}

const INSTRUCOES_ES = {
  termometro: 'Toma la temperatura de Kroniki',
  curativo:   'Ponle una curita a Kroniki',
  xarope:     'Dale el jarabe a Kroniki',
}

const ITEM_EMOJI = {
  termometro: '🌡️',
  curativo:   '🩹',
  xarope:     '🍶',
}

const ITEM_LABEL = {
  termometro: 'Termômetro',
  curativo:   'Curativo',
  xarope:     'Xarope',
}

function gerarParticulas() {
  const cores = ['#00B4D8', '#87CEEB', '#FFFFFF', '#B0E0E6']
  return Array.from({ length: 7 }, (_, i) => ({
    id: i,
    dx: (Math.random() - 0.5) * 40,
    delay: i * 0.08,
    cor: cores[Math.floor(Math.random() * cores.length)],
  }))
}

function gerarBolhas() {
  return Array.from({ length: 7 }, (_, i) => ({
    id: i,
    dx: (Math.random() - 0.5) * 40,
    delay: i * 0.1,
    cor: ['#FF6B9D', '#C084FC', '#60A5FA', '#F472B6'][Math.floor(Math.random() * 4)],
  }))
}

export default function RestaurarSaude({ onConcluir }) {
  const { t, locale } = useLanguage()
  const store = useTamagoshiStore()

  const [ordem, setOrdem] = useState([])
  const [acaoAtual, setAcaoAtual] = useState(0)
  const [arrastando, setArrastando] = useState(false)
  const [efeitoAtivo, setEfeitoAtivo] = useState(null)
  const [concluido, setConcluido] = useState(false)
  const [particulas, setParticulas] = useState([])
  const [bolhas, setBolhas] = useState([])
  const [tempNumber, setTempNumber] = useState(null)
  const [curativoVisivel, setCurativoVisivel] = useState(false)
  const [mostrandoConclusao, setMostrandoConclusao] = useState(false)
  const [estrelas, setEstrelas] = useState([])
  const [touchPos, setTouchPos] = useState(null)
  const dropZoneRef = useRef(null)

  const instrucoesMap = locale === 'en' ? INSTRUCOES_EN : locale === 'es' ? INSTRUCOES_ES : INSTRUCOES

  useEffect(() => {
    const shuffled = [...ACOES].sort(() => Math.random() - 0.5)
    setOrdem(shuffled)
    setAcaoAtual(0)
  }, [])

  const dispararEfeito = useCallback((acao) => {
    setEfeitoAtivo(acao)

    if (acao === 'termometro') {
      const temps = ['36.5°C', '37.0°C', '37.2°C', '36.8°C', '37.1°C']
      setTempNumber(temps[Math.floor(Math.random() * temps.length)])
      setParticulas(gerarParticulas())
      setTimeout(() => setParticulas([]), 1200)
      setTimeout(() => setTempNumber(null), 1500)
    }

    if (acao === 'curativo') {
      setCurativoVisivel(true)
      setTimeout(() => setCurativoVisivel(false), 1800)
    }

    if (acao === 'xarope') {
      setBolhas(gerarBolhas())
      setTimeout(() => setBolhas([]), 1300)
    }

    setTimeout(() => setEfeitoAtivo(null), 1500)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastando(false)

    const itemArrastado = e.dataTransfer.getData('acao')
    const acaoEsperada = ordem[acaoAtual]

    if (itemArrastado === acaoEsperada) {
      dispararEfeito(acaoEsperada)

      if (acaoAtual === 2) {
        // Última ação — conclui após delay do efeito
        setTimeout(() => {
          setMostrandoConclusao(true)
          setConcluido(true)
          // Estrelinhas
          const stars = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            dx: (Math.random() - 0.5) * 80,
            dy: -(Math.random() * 60 + 20),
            delay: i * 0.1,
          }))
          setEstrelas(stars)

          // Aplicar saúde +25%
          store.restaurarSaude()
          store.ganharDix(store._userId, DIX_POR_ACAO, 'restaurou saúde')
        }, 600)
      } else {
        setTimeout(() => {
          setAcaoAtual(prev => prev + 1)
        }, 600)
      }
    }
    // Se soltou item errado, não avança
  }, [ordem, acaoAtual, dispararEfeito, store])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragStart = useCallback((e, acao) => {
    e.dataTransfer.setData('acao', acao)
    e.dataTransfer.effectAllowed = 'move'
    setArrastando(true)
  }, [])

  // ── Touch handlers (mobile) ──
  const handleTouchStart = useCallback((e, acao) => {
    const touch = e.touches[0]
    setArrastando(true)
    setTouchPos({ x: touch.clientX, y: touch.clientY, acao, element: e.currentTarget })
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    setTouchPos(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : prev)
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!touchPos) return
    setArrastando(false)

    const dropZone = dropZoneRef.current
    if (!dropZone) {
      setTouchPos(null)
      return
    }

    const rect = dropZone.getBoundingClientRect()
    const touch = e.changedTouches[0]

    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      const acaoEsperada = ordem[acaoAtual]
      if (touchPos.acao === acaoEsperada) {
        dispararEfeito(acaoEsperada)

        if (acaoAtual === 2) {
          setTimeout(() => {
            setMostrandoConclusao(true)
            setConcluido(true)
            const stars = Array.from({ length: 8 }, (_, i) => ({
              id: i,
              dx: (Math.random() - 0.5) * 80,
              dy: -(Math.random() * 60 + 20),
              delay: i * 0.1,
            }))
            setEstrelas(stars)
            store.restaurarSaude()
            store.ganharDix(store._userId, DIX_POR_ACAO, 'restaurou saúde')
          }, 600)
        } else {
          setTimeout(() => {
            setAcaoAtual(prev => prev + 1)
          }, 600)
        }
      }
    }

    setTouchPos(null)
  }, [touchPos, ordem, acaoAtual, dispararEfeito, store])

  const acaoCorrente = ordem[acaoAtual]
  const instrucaoAtual = acaoCorrente ? instrucoesMap[acaoCorrente] : ''

  // Posicionamento visual do item sendo arrastado no touch
  const touchStyle = touchPos ? {
    position: 'fixed',
    left: touchPos.x - 25,
    top: touchPos.y - 25,
    zIndex: 9999,
    pointerEvents: 'none',
    fontSize: '3rem',
    opacity: 0.8,
    transform: 'scale(1.2)',
  } : {}

  return (
    <div className="tama-acao-screen">
      {/* Conclusão */}
      <AnimatePresence>
        {mostrandoConclusao && (
          <motion.div
            className="tama-saude-conclusao-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="tama-saude-conclusao-card"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="tama-saude-conclusao-emoji">🎉</div>
              <div className="tama-saude-conclusao-titulo">{t('games.tamagoshi.saude_concluido')}</div>
              <div className="tama-saude-conclusao-sub">{t('games.tamagoshi.saude_recuperado', { valor: '+25%' })}</div>

              {/* Estrelinhas */}
              <div className="tama-saude-estrelas">
                {estrelas.map(s => (
                  <motion.span
                    key={s.id}
                    className="tama-saude-estrela"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], x: s.dx, y: s.dy, scale: [0, 1.5, 0] }}
                    transition={{ duration: 1.2, delay: s.delay }}
                  >
                    ✨
                  </motion.span>
                ))}
              </div>

              <motion.button
                className="tama-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConcluir}
                style={{ marginTop: '1rem' }}
              >
                {t('games.tamagoshi.saude_feito')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Título */}
      <h2 className="tama-acao-title">{t('games.tamagoshi.saude_titulo')}</h2>

      {/* Bolinhas de progresso */}
      <div className="tama-saude-progresso">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`tama-saude-progresso-dot ${i < acaoAtual ? 'tama-saude-progresso-dot--done' : ''} ${i === acaoAtual ? 'tama-saude-progresso-dot--active' : ''}`}
          />
        ))}
        <span className="tama-saude-progresso-label">
          {acaoAtual + 1}/3
        </span>
      </div>

      {/* Instrução */}
      {instrucaoAtual && (
        <motion.p
          className="tama-acao-hint"
          key={instrucaoAtual}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {instrucaoAtual}
        </motion.p>
      )}

      {/* Área do drop zone + sprite */}
      <div
        ref={dropZoneRef}
        className={`tama-saude-dropzone ${arrastando ? 'tama-saude-dropzone--hover' : ''} ${efeitoAtivo ? 'tama-saude-dropzone--efeito' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onTouchEnd={handleTouchEnd}
      >
        {/* Partículas do termômetro */}
        {efeitoAtivo === 'termometro' && particulas.map(p => (
          <div
            key={p.id}
            className="tama-saude-particula"
            style={{
              '--dx': `${p.dx}px`,
              animationDelay: `${p.delay}s`,
              background: p.cor,
            }}
          />
        ))}

        {/* Número de temperatura */}
        {tempNumber && (
          <motion.div
            className="tama-saude-temp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
          >
            {tempNumber}
          </motion.div>
        )}

        {/* Curativo */}
        {curativoVisivel && (
          <motion.div
            className="tama-saude-curativo"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            🩹
          </motion.div>
        )}

        {/* Bolhas do xarope */}
        {efeitoAtivo === 'xarope' && bolhas.map(b => (
          <div
            key={b.id}
            className="tama-saude-bolha"
            style={{
              '--dx': `${b.dx}px`,
              animationDelay: `${b.delay}s`,
              background: `radial-gradient(circle, ${b.cor}44, transparent)`,
            }}
          />
        ))}

        <div className="tama-saude-sprite">
          <CriaturaSprite
            criaturaId={store.criaturaId}
            status={store.status}
            estagio={store.estagio}
            criaturas={CRIATURAS}
          />
        </div>

        {concluido && (
          <motion.div
            className="tama-saude-sprite-feliz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            😊
          </motion.div>
        )}
      </div>

      {/* Item arrastável */}
      {acaoCorrente && !concluido && (
        <motion.div
          key={acaoCorrente}
          className={`tama-saude-item ${arrastando ? 'tama-saude-item--arrastando' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, acaoCorrente)}
          onTouchStart={(e) => handleTouchStart(e, acaoCorrente)}
          onTouchMove={handleTouchMove}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 1.3 }}
        >
          <span className="tama-saude-item-emoji">{ITEM_EMOJI[acaoCorrente]}</span>
          <span className="tama-saude-item-label">{ITEM_LABEL[acaoCorrente]}</span>
        </motion.div>
      )}

      {/* Touch drag ghost */}
      {touchPos && (
        <div style={touchStyle}>
          {ITEM_EMOJI[touchPos.acao]}
        </div>
      )}

      {/* Botão voltar (só quando não estiver concluindo) */}
      {!mostrandoConclusao && (
        <motion.button
          className="tama-btn"
          style={{ marginTop: '0.5rem', opacity: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConcluir}
        >
          [ {t('games.tamagoshi.voltar')} ]
        </motion.button>
      )}
    </div>
  )
}
