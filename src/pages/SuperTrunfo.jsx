import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TRIAL_ACTIVE } from '../config/trial'
import deck from '../data/supertrunfo-pt.json'
import './SuperTrunfo.css'

const atributos = deck.atributos
const cartas = deck.cartas

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function avatarCor(id) {
  const cores = {
    kim: '#00B4D8',
    jack: '#4de87a',
    nina: '#e8853a',
    thunderbolt: '#F4A227',
    shuntaro: '#9b59b6',
    lisa: '#e74c3c',
    nexus_phantasm: '#8e44ad',
    yawanari: '#1ea064',
    voidhunter: '#2c3e50',
    kronos: '#6B0F1A'
  }
  return cores[id] || '#555'
}

export default function SuperTrunfo() {
  const [fase, setFase] = useState('menu')
  const [deckJogador, setDeckJogador] = useState([])
  const [deckIA, setDeckIA] = useState([])
  const [cartaJogador, setCartaJogador] = useState(null)
  const [cartaIA, setCartaIA] = useState(null)
  const [atributoEscolhido, setAtributoEscolhido] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [placar, setPlacar] = useState({ jogador: 0, ia: 0 })
  const [rodada, setRodada] = useState(1)

  const deckAtivo = TRIAL_ACTIVE ? cartas : cartas.filter(c => c.tier === 'free')

  function iniciarJogo() {
    const d = embaralhar([...deckAtivo])
    const metade = Math.floor(d.length / 2)
    setDeckJogador(d.slice(0, metade))
    setDeckIA(d.slice(metade))
    setCartaJogador(d[0])
    setCartaIA(d[metade])
    setFase('jogando')
    setRodada(1)
    setPlacar({ jogador: 0, ia: 0 })
  }

  function jogarAtributo(atributoId) {
    const atributo = atributos.find(a => a.id === atributoId)
    const valorJogador = cartaJogador.atributos[atributoId]
    const valorIA = cartaIA.atributos[atributoId]
    let res
    if (atributo.inverso) {
      res = valorJogador < valorIA ? 'ganhou' : valorJogador > valorIA ? 'perdeu' : 'empate'
    } else {
      res = valorJogador > valorIA ? 'ganhou' : valorJogador < valorIA ? 'perdeu' : 'empate'
    }
    setAtributoEscolhido(atributoId)
    setResultado(res)
    if (res === 'ganhou') setPlacar(p => ({ ...p, jogador: p.jogador + 1 }))
    if (res === 'perdeu') setPlacar(p => ({ ...p, ia: p.ia + 1 }))
    setFase('resultado_rodada')
  }

  function proximaRodada() {
    const total = deckAtivo.length
    if (rodada >= total) { setFase('fim_jogo'); return }
    const proxJogador = deckJogador[rodada % deckJogador.length]
    const proxIA = deckIA[rodada % deckIA.length]
    setCartaJogador(proxJogador)
    setCartaIA(proxIA)
    setAtributoEscolhido(null)
    setResultado(null)
    setRodada(r => r + 1)
    setFase('jogando')
  }

  function renderMenu() {
    return (
      <section className="st-page">
        <h1 className="st-titulo">SUPER TRUNFO — LDI</h1>
        <p className="st-sub">Cada lutador tem seus atributos. Escolha o certo e vença.</p>
        <div className="st-cards-info">
          {deckAtivo.length} cartas disponíveis
        </div>
        {!TRIAL_ACTIVE && (
          <Link to="/assinar" className="st-link-assinar">ASSINAR PARA DESBLOQUEAR TODAS AS CARTAS</Link>
        )}
        <div className="st-acoes">
          <button className="st-btn" onClick={iniciarJogo}>JOGAR CONTRA IA</button>
          <button className="st-btn st-btn--disabled" disabled>
            MULTIPLAYER <span className="st-breve">EM BREVE</span>
          </button>
        </div>
      </section>
    )
  }

  function renderCartaFace(carta, lado, resultadoAttr) {
    const inical = carta.nome.charAt(0)
    return (
      <>
        <div className="st-carta-avatar" style={{ background: avatarCor(carta.id) }}>
          {inical}
        </div>
        <div className="st-carta-nome">{carta.nome}</div>
        <div className="st-carta-desc">{carta.descricao}</div>
        <div className="st-atributos">
          {atributos.map(attr => {
            const isEscolhido = lado === 'jogador' && atributoEscolhido === attr.id
            const classeAttr = isEscolhido ? `st-atributo--${resultado}` : ''
            return (
              <div
                key={attr.id}
                className={`st-atributo-btn ${classeAttr}`}
                onClick={lado === 'jogador' && !isEscolhido ? () => jogarAtributo(attr.id) : undefined}
                style={lado === 'jogador' && !isEscolhido ? { cursor: 'pointer' } : undefined}
              >
                <span>{attr.nome}</span>
                <span>{carta.atributos[attr.id]}</span>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  function renderJogando() {
    return (
      <section className="st-page">
        <div className="st-hud">
          <span>RODADA {rodada}/{deckAtivo.length}</span>
          <span>JOGADOR {placar.jogador} × {placar.ia} IA</span>
        </div>
        <div className="st-mesa">
          <div className="st-carta st-carta--jogador">
            {renderCartaFace(cartaJogador, 'jogador', resultado)}
          </div>
          <div className="st-carta st-carta--ia">
            <div className="st-carta-verso">
              <span>?</span>
              <span style={{ fontSize: '0.7rem' }}>CARTA DA IA</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  function renderResultado() {
    const resultadoClass = resultado === 'ganhou' ? 'ganhou' : resultado === 'perdeu' ? 'perdeu' : 'empate'
    const textoResultado = resultado === 'ganhou' ? 'VOCÊ GANHOU!' : resultado === 'perdeu' ? 'IA GANHOU!' : 'EMPATE!'
    return (
      <section className="st-page">
        <div className="st-hud">
          <span>RODADA {rodada}/{deckAtivo.length}</span>
          <span>JOGADOR {placar.jogador} × {placar.ia} IA</span>
        </div>
        <div className="st-mesa">
          <div className="st-carta st-carta--jogador">
            {renderCartaFace(cartaJogador, 'jogador', resultado)}
          </div>
          <div className="st-carta st-carta--ia">
            {renderCartaFace(cartaIA, 'ia', null)}
          </div>
        </div>
        <div className={`st-resultado-texto ${resultadoClass}`}>
          {textoResultado}
        </div>
        <div className="st-acoes">
          <button className="st-btn" onClick={proximaRodada}>PRÓXIMA RODADA →</button>
        </div>
      </section>
    )
  }

  function renderFim() {
    const venceu = placar.jogador > placar.ia
    const empatou = placar.jogador === placar.ia
    const titulo = venceu ? 'VOCÊ VENCEU!' : empatou ? 'EMPATE!' : 'IA VENCEU!'
    return (
      <section className="st-page">
        <h2 className="st-fim-titulo">{titulo}</h2>
        <div className="st-placar-final">{placar.jogador} × {placar.ia}</div>
        <div className="st-acoes">
          <button className="st-btn" onClick={iniciarJogo}>JOGAR NOVAMENTE</button>
          <Link to="/extras" className="st-btn st-btn--secundario">VOLTAR AOS EXTRAS</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      {fase === 'menu' && renderMenu()}
      {fase === 'jogando' && renderJogando()}
      {fase === 'resultado_rodada' && renderResultado()}
      {fase === 'fim_jogo' && renderFim()}
    </>
  )
}
