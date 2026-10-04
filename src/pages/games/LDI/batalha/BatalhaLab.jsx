import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useFichas } from '../../../../context/FichasContext'
import { useReader } from '../../../../context/ReaderContext'
import Pentagrama from './Pentagrama'
import { FICHAS, ENERGIA_BASE, escolherCombo, resolverTroca } from './motorPentagrama'
import './Batalha.css'

// Laboratório da batalha do pentagrama (só admin): você contra uma ficha de
// treino, em batidas. Em cada batida o combo do inimigo vai acendendo; você
// desenha o seu até a batida fechar. O centro abre às vezes: tocar nele esquiva.
const VELOCIDADES = { lento: 3400, normal: 2600, rapido: 1900 }
const REVELA = 0.55        // parte da batida em que o combo do inimigo termina de acender
const MOSTRA_RESULTADO = 1300
const VIDA_JOG = 60
const CHANCE_CENTRO = 0.45
const CENTRO_MS = 600

export default function BatalhaLab() {
  const { t } = useLanguage()
  const { isAdmin, loading } = useFichas()
  const { setReaderMode } = useReader()
  const [fase, setFase] = useState('menu')
  const [oponente, setOponente] = useState('saco')
  const [velocidade, setVelocidade] = useState('normal')

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  // No dev (VITE_DEBUG) o laboratório abre pra qualquer um, pra dar pra testar.
  const liberado = isAdmin || import.meta.env.VITE_DEBUG === 'true'
  if (loading && !liberado) return <div className="pg-page" />
  if (!liberado) return <div className="pg-page"><p className="pg-aviso">{t('games.ldi.batalha.restrito')}</p></div>

  if (fase === 'menu') {
    return (
      <div className="pg-page">
        <p className="if-eyebrow">{t('games.ldi.batalha.lab')}</p>
        <h1 className="pg-titulo">{t('games.ldi.batalha.titulo')}</h1>
        <p className="pg-texto">{t('games.ldi.batalha.como')}</p>
        <ul className="pg-regras">
          {['r1', 'r2', 'r3', 'r4', 'r5'].map(k => <li key={k}>{t(`games.ldi.batalha.regras.${k}`)}</li>)}
        </ul>
        <p className="if-eyebrow">{t('games.ldi.batalha.oponente')}</p>
        <div className="pg-opcoes">
          {Object.keys(FICHAS).map(id => (
            <button key={id} type="button" className={`pg-opcao${oponente === id ? ' is-on' : ''}`} onClick={() => setOponente(id)}>
              {t(`games.ldi.batalha.fichas.${id}`)}
            </button>
          ))}
        </div>
        <p className="if-eyebrow">{t('games.ldi.batalha.velocidade')}</p>
        <div className="pg-opcoes">
          {Object.keys(VELOCIDADES).map(v => (
            <button key={v} type="button" className={`pg-opcao${velocidade === v ? ' is-on' : ''}`} onClick={() => setVelocidade(v)}>
              {t(`games.ldi.batalha.vel.${v}`)}
            </button>
          ))}
        </div>
        <button type="button" className="if-btn if-btn--primary pg-comecar" onClick={() => setFase('luta')}>{t('games.ldi.batalha.lutar')}</button>
      </div>
    )
  }

  return <Luta t={t} ficha={FICHAS[oponente]} batida={VELOCIDADES[velocidade]} onSair={() => setFase('menu')} />
}

function Luta({ t, ficha, batida, onSair }) {
  const [vida, setVida] = useState({ jog: VIDA_JOG, ini: ficha.vida })
  const [energia, setEnergia] = useState({ jog: ENERGIA_BASE, ini: ENERGIA_BASE })
  const [n, setN] = useState(0)
  const [combo, setCombo] = useState([])
  const [travado, setTravado] = useState(false)
  const [telegrafo, setTelegrafo] = useState([])
  const [centroAberto, setCentroAberto] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [fim, setFim] = useState(null)
  const estado = useRef({})
  estado.current = { combo, energia, vida }
  const esquivou = useRef(false)

  // Uma batida: escolhe o combo do inimigo, acende ponto a ponto, abre o
  // centro (às vezes) e resolve quando o tempo acaba.
  useEffect(() => {
    if (fim) return
    const timers = []
    const comboIni = escolherCombo(ficha)
    const passo = (batida * REVELA) / comboIni.length
    comboIni.forEach((_, i) => timers.push(setTimeout(() => setTelegrafo(comboIni.slice(0, i + 1)), passo * i)))
    if (Math.random() < CHANCE_CENTRO) {
      const abre = batida * (0.25 + Math.random() * 0.5)
      timers.push(setTimeout(() => setCentroAberto(true), abre))
      timers.push(setTimeout(() => setCentroAberto(false), abre + CENTRO_MS * (batida / VELOCIDADES_REF)))
    }
    timers.push(setTimeout(() => {
      const { combo: cj, energia: en, vida: vd } = estado.current
      const r = resolverTroca(
        { combo: esquivou.current ? [] : cj, esquivou: esquivou.current, energia: en.jog },
        { combo: comboIni, esquivou: Math.random() < ficha.esquiva, energia: en.ini },
      )
      const novaVida = { jog: Math.max(0, vd.jog - r.danoJog), ini: Math.max(0, vd.ini - r.danoIni) }
      setVida(novaVida)
      setEnergia({ jog: r.energiaJog, ini: r.energiaIni })
      setResultado({ ...r, comboJog: cj, comboIni })
      setCentroAberto(false)
      setTravado(true)
      timers.push(setTimeout(() => {
        if (novaVida.jog <= 0 || novaVida.ini <= 0) { setFim(novaVida.ini <= 0 ? 'vitoria' : 'derrota'); return }
        esquivou.current = false
        setCombo([]); setTelegrafo([]); setTravado(false); setResultado(null)
        setN(x => x + 1)
      }, MOSTRA_RESULTADO))
    }, batida))
    return () => timers.forEach(clearTimeout)
  }, [n, fim]) // eslint-disable-line react-hooks/exhaustive-deps

  const soltar = useCallback(() => setTravado(true), [])
  const esquivar = useCallback(() => { esquivou.current = true; setCombo([]); setTravado(true) }, [])

  if (fim) {
    return (
      <div className="pg-page pg-fim">
        <h1 className={`pg-titulo is-${fim}`}>{t(`games.ldi.batalha.${fim}`)}</h1>
        <p className="pg-texto">{t('games.ldi.batalha.trocas', { n: n + 1 })}</p>
        <button type="button" className="if-btn if-btn--primary" onClick={onSair}>{t('games.ldi.batalha.de_novo')}</button>
      </div>
    )
  }

  return (
    <div className="pg-page pg-luta">
      <div className="pg-hud">
        <Barra rotulo={t('games.ldi.batalha.voce')} vida={vida.jog} max={VIDA_JOG} energia={energia.jog} lado="jog" t={t} />
        <span className="pg-hud__vs">VS</span>
        <Barra rotulo={t(`games.ldi.batalha.fichas.${ficha.id}`)} vida={vida.ini} max={ficha.vida} energia={energia.ini} lado="ini" t={t} />
      </div>
      <div className="pg-batida"><i key={n} style={{ '--dur': `${batida}ms` }} /></div>
      <Pentagrama combo={combo} telegrafo={telegrafo} centroAberto={centroAberto} travado={travado}
        onMudar={setCombo} onSoltar={soltar} onEsquiva={esquivar} />
      <div className="pg-resultado">
        {resultado ? resultado.passos.map((p, i) => <p key={i} className={`pg-passo is-${p.tipo}${p.quem ? ` is-${p.quem}` : ''}`}>{textoPasso(t, p)}</p>)
          : <p className="pg-dica">{t(travado ? 'games.ldi.batalha.travado' : 'games.ldi.batalha.desenhe')}</p>}
      </div>
      <button type="button" className="pg-sair" onClick={onSair}>{t('games.ldi.batalha.sair')}</button>
    </div>
  )
}

const VELOCIDADES_REF = VELOCIDADES.normal

// Barra de sangue de jogo de luta: a cor cai na hora e o rastro vermelho
// (o dano que acabou de entrar) desce devagar atrás dela. A do inimigo é
// espelhada, esvazia em direção ao centro.
function Barra({ rotulo, vida, max, energia, lado, t }) {
  const pct = `${(vida / max) * 100}%`
  return (
    <div className={`pg-barra is-${lado}`}>
      <span className="pg-sangue"><i className="pg-sangue__rastro" style={{ '--pct': pct }} /><i className="pg-sangue__vida" style={{ '--pct': pct }} /></span>
      <div className="pg-barra__info"><b>{rotulo}</b><small>{t('games.ldi.batalha.energia', { n: energia })}</small></div>
    </div>
  )
}

function textoPasso(t, p) {
  const nome = id => t(`games.ldi.batalha.pontos.${id}`)
  if (p.tipo === 'esquiva') return t(`games.ldi.batalha.passo.esquiva_${p.quem}`)
  if (p.tipo === 'vazio') return t('games.ldi.batalha.passo.vazio', { golpe: nome(p.ponto) })
  if (p.tipo === 'bloqueio') return t(p.duro ? `games.ldi.batalha.passo.bloqueio_duro_${p.duro}` : 'games.ldi.batalha.passo.bloqueio', { golpe: nome(p.pontoIni) })
  return t(`games.ldi.batalha.passo.acerto_${p.quem}`, { golpe: nome(p.ponto), dano: p.dano })
}
