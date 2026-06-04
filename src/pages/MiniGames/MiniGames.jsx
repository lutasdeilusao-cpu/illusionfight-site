import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PuzzleDecoder, PuzzleStealthGrid, PuzzleSlidingTiles, PuzzleLabirinto, PuzzleAnagrama } from '../../components/Puzzles'
import './MiniGames.css'

const GAMES = [
  { id: 'stealth', nome: 'Infiltração', tagline: 'evite as câmeras. chegue ao objetivo.', emoji: '🥷', cor: '#00B4D8', desc: 'câmeras com cone de visão rotativo. uma rota existe. encontre.', dificuldade: '★★☆' },
  { id: 'decoder', nome: 'Decoder', tagline: 'mensagem cifrada. descubra o código.', emoji: '📡', cor: '#F5A623', desc: 'cada símbolo representa uma letra. decodifique antes do tempo acabar.', dificuldade: '★☆☆' },
  { id: 'sliding', nome: 'Sliding Tiles', tagline: 'documento rasgado. reconstitua as peças.', emoji: '🧩', cor: '#A855F4', desc: 'mova as peças até reconstituir a imagem. sem desfazer.', dificuldade: '★★☆' },
  { id: 'labirinto', nome: 'Labirinto', tagline: 'sem mapa. sem saída óbvia.', emoji: '🌀', cor: '#8B0000', desc: 'navegue pelo labirinto. cada geração é única.', dificuldade: '★★★' },
  { id: 'anagrama', nome: 'Anagrama', tagline: 'as letras estão certas. a ordem não.', emoji: '🔤', cor: '#22C55E', desc: 'reorganize as letras para formar a palavra correta.', dificuldade: '★☆☆' },
]

function formatTempo(ms) {
  if (!ms) return '--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}

export default function MiniGames() {
  const navigate = useNavigate()
  const [jogoAtivo, setJogoAtivo] = useState(null)
  const [fase, setFase] = useState('hub')
  const [tempoInicio, setTempoInicio] = useState(null)
  const [tempoFinal, setTempoFinal] = useState(null)
  const [recordes, setRecordes] = useState({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ldi-minigames-recordes')
      if (saved) setRecordes(JSON.parse(saved))
    } catch (_) {}
    console.log('[MINIGAMES] hub carregado | recordes:', Object.keys(recordes).length)
  }, [])

  const iniciarJogo = (game) => {
    setJogoAtivo(game)
    setFase('jogando')
    setTempoInicio(Date.now())
    setTempoFinal(null)
    console.log('[MINIGAMES] iniciando:', game.id)
  }

  const handleVitoria = () => {
    const tempo = Date.now() - tempoInicio
    setTempoFinal(tempo)
    setFase('vitoria')
    const novosRecordes = { ...recordes }
    if (!novosRecordes[jogoAtivo.id] || tempo < novosRecordes[jogoAtivo.id]) {
      novosRecordes[jogoAtivo.id] = tempo
      setRecordes(novosRecordes)
      try { localStorage.setItem('ldi-minigames-recordes', JSON.stringify(novosRecordes)) } catch (_) {}
      console.log('[MINIGAMES] novo recorde:', jogoAtivo.id, formatTempo(tempo))
    }
  }

  const handleDerrota = () => {
    setFase('derrota')
    console.log('[MINIGAMES] derrota em:', jogoAtivo.id)
  }

  const voltarHub = () => {
    setJogoAtivo(null)
    setFase('hub')
    setTempoInicio(null)
    setTempoFinal(null)
  }

  const renderPuzzle = () => {
    if (!jogoAtivo) return null
    const props = { onSolve: handleVitoria, onFail: handleDerrota }
    switch (jogoAtivo.id) {
      case 'stealth': return <PuzzleStealthGrid {...props} config={{ size: 4, hasTimer: true }} />
      case 'decoder': return <PuzzleDecoder {...props} />
      case 'sliding': return <PuzzleSlidingTiles {...props} config={{ size: 3 }} />
      case 'labirinto': return <PuzzleLabirinto {...props} />
      case 'anagrama': return <PuzzleAnagrama {...props} />
      default: return null
    }
  }

  if (fase === 'vitoria') return (
    <div className="mg-page">
      <div className="mg-scanlines" />
      <div className="mg-resultado">
        <div className="mg-resultado-emoji">🏆</div>
        <h2 className="mg-resultado-titulo" style={{ color: jogoAtivo.cor }}>MISSÃO COMPLETA</h2>
        <p className="mg-resultado-jogo">{jogoAtivo.nome}</p>
        <div className="mg-resultado-tempo">
          <span className="mg-resultado-tempo-label">TEMPO</span>
          <span className="mg-resultado-tempo-val" style={{ color: jogoAtivo.cor }}>{formatTempo(tempoFinal)}</span>
        </div>
        {recordes[jogoAtivo.id] === tempoFinal && <p className="mg-resultado-recorde">★ NOVO RECORDE ★</p>}
        {recordes[jogoAtivo.id] && recordes[jogoAtivo.id] !== tempoFinal && (
          <p className="mg-resultado-recorde-atual">recorde: {formatTempo(recordes[jogoAtivo.id])}</p>
        )}
        <div className="mg-resultado-btns">
          <button className="mg-btn" style={{ borderColor: jogoAtivo.cor, color: jogoAtivo.cor }} onClick={() => iniciarJogo(jogoAtivo)}>[ jogar de novo ]</button>
          <button className="mg-btn" onClick={voltarHub}>[ voltar ]</button>
        </div>
      </div>
    </div>
  )

  if (fase === 'derrota') return (
    <div className="mg-page">
      <div className="mg-scanlines" />
      <div className="mg-resultado">
        <div className="mg-resultado-emoji">💀</div>
        <h2 className="mg-resultado-titulo" style={{ color: '#8B0000' }}>GAME OVER</h2>
        <p className="mg-resultado-jogo">{jogoAtivo.nome}</p>
        {recordes[jogoAtivo.id] && <p className="mg-resultado-recorde-atual">seu recorde: {formatTempo(recordes[jogoAtivo.id])}</p>}
        <div className="mg-resultado-btns">
          <button className="mg-btn" style={{ borderColor: '#8B0000', color: '#8B0000' }} onClick={() => iniciarJogo(jogoAtivo)}>[ tentar de novo ]</button>
          <button className="mg-btn" onClick={voltarHub}>[ voltar ]</button>
        </div>
      </div>
    </div>
  )

  if (fase === 'jogando') return (
    <div className="mg-page">
      <div className="mg-scanlines" />
      <div className="mg-jogando">
        <div className="mg-jogando-header">
          <span className="mg-jogando-nome" style={{ color: jogoAtivo.cor }}>{jogoAtivo.emoji} {jogoAtivo.nome}</span>
          <button className="mg-btn mg-btn--small" onClick={voltarHub}>[ sair ]</button>
        </div>
        <div className="mg-jogando-area">{renderPuzzle()}</div>
      </div>
    </div>
  )

  return (
    <div className="mg-page">
      <div className="mg-scanlines" />
      <div className="mg-header">
        <button className="mg-back" onClick={() => navigate('/extras')}>← extras</button>
        <h1 className="mg-titulo"><span className="mg-titulo-glitch" data-text="MINI GAMES">MINI GAMES</span></h1>
        <p className="mg-subtitulo"><span className="mg-cursor">█</span> puzzles standalone. sem login. sem save. só habilidade.</p>
      </div>
      <div className="mg-grid">
        {GAMES.map(game => (
          <div key={game.id} className="mg-card" style={{ '--cor': game.cor }} onClick={() => iniciarJogo(game)}>
            <div className="mg-card-inner">
              <div className="mg-card-top">
                <span className="mg-card-dificuldade">{game.dificuldade}</span>
                {recordes[game.id] && <span className="mg-card-recorde" style={{ color: game.cor }}>★ {formatTempo(recordes[game.id])}</span>}
              </div>
              <div className="mg-card-emoji">{game.emoji}</div>
              <h2 className="mg-card-nome">{game.nome}</h2>
              <p className="mg-card-tagline">{game.tagline}</p>
              <p className="mg-card-desc">{game.desc}</p>
              <div className="mg-card-cta">JOGAR</div>
            </div>
            <div className="mg-card-borda" />
          </div>
        ))}
      </div>
      <div className="mg-footer"><span>© LUTAS DE ILUSÃO — INSERT COIN</span></div>
    </div>
  )
}
