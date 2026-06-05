import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PuzzleDecoder, PuzzleStealthGrid, PuzzleSlidingTiles, PuzzleLabirinto, PuzzleAnagrama, PuzzleForça } from '../../components/Puzzles'
import { useFichas } from '../../context/FichasContext'
import { MINIGAMES_VERSION } from './version'
import './MiniGames.css'

const GAMES = [
  { id: 'stealth', nome: 'Infiltração', tagline: 'evite as câmeras. chegue ao objetivo.', emoji: '🥷', cor: '#00B4D8', desc: 'câmeras com cone de visão rotativo. uma rota existe. encontre.', dificuldade: '★★☆' },
  { id: 'decoder', nome: 'Decoder', tagline: 'mensagem cifrada. descubra o código.', emoji: '📡', cor: '#F5A623', desc: 'cada símbolo representa uma letra. decodifique antes do tempo acabar.', dificuldade: '★☆☆' },
  { id: 'sliding', nome: 'Sliding Tiles', tagline: 'documento rasgado. reconstitua as peças.', emoji: '🧩', cor: '#A855F4', desc: 'mova as peças até reconstituir a imagem. sem desfazer.', dificuldade: '★★☆' },
  { id: 'labirinto', nome: 'Labirinto', tagline: 'sem mapa. sem saída óbvia.', emoji: '🌀', cor: '#8B0000', desc: 'navegue pelo labirinto. cada geração é única.', dificuldade: '★★★' },
  { id: 'anagrama', nome: 'Anagrama', tagline: 'as letras estão certas. a ordem não.', emoji: '🔤', cor: '#22C55E', desc: 'reorganize as letras para formar a palavra correta.', dificuldade: '★☆☆' },
  { id: 'forca', nome: 'Palavra Secreta', tagline: 'descubra a palavra. uma letra de cada vez.', emoji: '🎡', cor: '#EC4899', desc: 'adivinhe letras e acuse a palavra certa.', dificuldade: '★★☆' },
]

const STEALTH_CONFIG = {
  easy:   { size: 4,  hasTimer: true, timerSegundos: 30, cameras: 3, visionRange: 2 },
  medium: { size: 8,  hasTimer: true, timerSegundos: 60, cameras: 5, visionRange: 2 },
  hard:   { size: 12, hasTimer: true, timerSegundos: 90, cameras: 8, visionRange: 3 },
}

function formatTempo(ms) {
  if (!ms) return '--'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}

export default function MiniGames() {
  const navigate = useNavigate()
  const { isAdmin } = useFichas()
  const tier = 'free'
  const podeElite = isAdmin || tier !== 'free'

  const [jogoAtivo, setJogoAtivo] = useState(null)
  const [fase, setFase] = useState('hub')
  const [tempoInicio, setTempoInicio] = useState(null)
  const [tempoFinal, setTempoFinal] = useState(null)
  const [recordes, setRecordes] = useState({})
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ldi-minigames-recordes')
      if (saved) setRecordes(JSON.parse(saved))
    } catch (_) {}
    console.log('[MINIGAMES] hub carregado | recordes:', Object.keys(recordes).length)
  }, [])

  const tentarIniciar = (game) => {
    if (['stealth','decoder','sliding','labirinto','anagrama','forca'].includes(game.id)) { setJogoAtivo(game); setFase('selecionar_dificuldade'); return }
    iniciarJogo(game, 'easy')
  }

  const iniciarJogo = (game, dif = 'easy') => {
    setJogoAtivo(game)
    setDificuldadeSelecionada(dif)
    setFase('jogando')
    setTempoInicio(Date.now())
    setTempoFinal(null)
    console.log('[MINIGAMES] iniciando:', game.id, '| dificuldade:', dif)
  }

  const handleVitoria = () => {
    const tempo = Date.now() - tempoInicio
    setTempoFinal(tempo)
    setFase('vitoria')
    const key = jogoAtivo.id === 'stealth' ? `${jogoAtivo.id}_${dificuldadeSelecionada}` : jogoAtivo.id
    const novosRecordes = { ...recordes }
    if (!novosRecordes[key] || tempo < novosRecordes[key]) {
      novosRecordes[key] = tempo
      setRecordes(novosRecordes)
      try { localStorage.setItem('ldi-minigames-recordes', JSON.stringify(novosRecordes)) } catch (_) {}
      console.log('[MINIGAMES] novo recorde:', key, formatTempo(tempo))
    }
  }

  const handleDerrota = () => { setFase('derrota'); console.log('[MINIGAMES] derrota em:', jogoAtivo.id) }

  const voltarHub = () => { setJogoAtivo(null); setFase('hub'); setTempoInicio(null); setTempoFinal(null); setDificuldadeSelecionada(null) }

  const renderPuzzle = () => {
    if (!jogoAtivo) return null
    const props = { onSolve: handleVitoria, onFail: handleDerrota }
    switch (jogoAtivo.id) {
      case 'stealth': {
        const cfg = STEALTH_CONFIG[dificuldadeSelecionada || 'easy']
        return <PuzzleStealthGrid {...props} config={{ size: cfg.size, hasTimer: cfg.hasTimer, timerSegundos: cfg.timerSegundos, cameraCount: cfg.cameras, visionRange: cfg.visionRange }} />
      }
      case 'forca': return <PuzzleForça {...props} config={{ difficulty: dificuldadeSelecionada || 'easy' }} />
      case 'decoder': return <PuzzleDecoder {...props} config={{ difficulty: dificuldadeSelecionada || 'easy' }} />
      case 'sliding':
        const difSliding = dificuldadeSelecionada || 'easy'
        const slidingSize = difSliding === 'hard' ? 5 : difSliding === 'medium' ? 4 : 3
        console.log('[SLIDING] difficulty:', difSliding, '| size:', slidingSize)
        return <PuzzleSlidingTiles {...props} config={{ size: slidingSize }} />
      case 'labirinto': return <PuzzleLabirinto {...props} config={{ difficulty: dificuldadeSelecionada || 'easy' }} />
      case 'anagrama': return <PuzzleAnagrama {...props} config={{ difficulty: dificuldadeSelecionada || 'easy' }} />
      default: return null
    }
  }

  if (fase === 'selecionar_dificuldade') {
    const isStealth = jogoAtivo.id === 'stealth'
    const DIF_CONFIGS = {
      stealth: [
        { id: 'easy', label: 'FÁCIL', specs: ['grid 4×4','3 câmeras','⏱ 30s'], preview: 16, badge: 'FREE', free: true, cor: '#22C55E' },
        { id: 'medium', label: 'MÉDIO', specs: ['grid 8×8','5 câmeras','⏱ 60s'], preview: 64, badge: 'ELITE', free: false, cor: '#F5A623' },
        { id: 'hard', label: 'DIFÍCIL', specs: ['grid 12×12','8 câmeras','⏱ 90s'], preview: 144, badge: 'ELITE', free: false, cor: '#8B0000' },
      ],
      decoder: [
        { id: 'easy', label: 'FÁCIL', specs: ['1 barra','5 tent.','⏱ 45s'], emoji: '📡', badge: 'FREE', free: true, cor: '#22C55E' },
        { id: 'medium', label: 'MÉDIO', specs: ['2 barras','4 tent.','⏱ 45s'], emoji: '📡', badge: 'ELITE', free: false, cor: '#F5A623' },
        { id: 'hard', label: 'DIFÍCIL', specs: ['3 barras','3 tent.','⏱ 30s'], emoji: '📡', badge: 'ELITE', free: false, cor: '#8B0000' },
        { id: 'extreme', label: 'EXTREME', specs: ['4 barras','3 tent.','⏱ 20s'], emoji: '📡', badge: 'ELITE', free: false, cor: '#8B0000' },
      ],
      forca: [
        { id: 'easy',    label: 'FÁCIL',   specs: ['6 erros', 'sem timer', '6 opções'],  emoji: '🎡', badge: 'FREE',  free: true,  cor: '#22C55E' },
        { id: 'medium',  label: 'MÉDIO',   specs: ['5 erros', '⏱ 60s',    '8 opções'],  emoji: '🎡', badge: 'ELITE', free: false, cor: '#F5A623' },
        { id: 'hard',    label: 'DIFÍCIL', specs: ['4 erros', '⏱ 45s',    '10 opções'], emoji: '🎡', badge: 'ELITE', free: false, cor: '#8B0000' },
        { id: 'extreme', label: 'EXTREME', specs: ['3 erros', '⏱ 30s',    '12 opções'], emoji: '🎡', badge: 'ELITE', free: false, cor: '#8B0000' },
      ],
      sliding: [
        { id: 'easy', label: 'FÁCIL', specs: ['grid 3×3','8 peças','sem timer'], emoji: '🧩', badge: 'FREE', free: true, cor: '#22C55E' },
        { id: 'medium', label: 'MÉDIO', specs: ['grid 4×4','15 peças','sem timer'], emoji: '🧩', badge: 'ELITE', free: false, cor: '#F5A623' },
        { id: 'hard', label: 'DIFÍCIL', specs: ['grid 5×5','24 peças','sem timer'], emoji: '🧩', badge: 'ELITE', free: false, cor: '#8B0000' },
      ],
      labirinto: [
        { id: 'easy',   label: 'FÁCIL',   specs: ['8×8',  'sem timer', 'sem dica'],   emoji: '🌀', badge: 'FREE',  free: true, cor: '#22C55E'  },
        { id: 'medium', label: 'MÉDIO',   specs: ['12×12','⏱ 90s',    'dica 15s'],   emoji: '🌀', badge: 'ELITE', free: false, cor: '#F5A623' },
        { id: 'hard',   label: 'DIFÍCIL', specs: ['16×16','⏱ 60s',    'dica 15s'],   emoji: '🌀', badge: 'ELITE', free: false, cor: '#8B0000' },
      ],
      anagrama: [
        { id: 'easy',    label: 'FÁCIL',   specs: ['1 palavra', '5 tent.', '⏱ 45s'], emoji: '🔤', badge: 'FREE',  free: true,  cor: '#22C55E' },
        { id: 'medium',  label: 'MÉDIO',   specs: ['2 palavras','4 tent.', '⏱ 40s'], emoji: '🔤', badge: 'ELITE', free: false, cor: '#F5A623' },
        { id: 'hard',    label: 'DIFÍCIL', specs: ['3 frases',  '3 tent.', '⏱ 35s'], emoji: '🔤', badge: 'ELITE', free: false, cor: '#8B0000' },
        { id: 'extreme', label: 'EXTREME', specs: ['4 frases',  '3 tent.', '⏱ 25s'], emoji: '🔤', badge: 'ELITE', free: false, cor: '#8B0000' },
        { id: 'epic',    label: 'ÉPICO',   specs: ['5 frases',  '2 tent.', '⏱ 20s'], emoji: '🔤', badge: 'ELITE', free: false, cor: '#8B0000' },
      ],
    }
    const difs = DIF_CONFIGS[jogoAtivo.id] || []
    return (
      <div className="mg-page"><div className="mg-scanlines" />
        <div className="mg-dif-select">
          <div className="mg-dif-header">
            <button className="mg-btn-sair" onClick={() => { setFase('hub'); setJogoAtivo(null) }}>← voltar</button>
            <h2 className="mg-dif-titulo"><span className="mg-titulo-glitch" data-text={jogoAtivo.nome.toUpperCase()}>{jogoAtivo.nome.toUpperCase()}</span></h2>
            <p className="mg-dif-sub">escolha a dificuldade</p>
          </div>
          <div className="mg-dif-grid">
            {difs.map(d => {
              const locked = !d.free && !podeElite
              return (
                <div key={d.id} className={`mg-dif-card ${locked ? 'mg-dif-card--locked' : ''}`}
                  onClick={() => !locked && iniciarJogo(jogoAtivo, d.id)}>
                  <div className="mg-dif-card-inner">
                    <span className="mg-dif-nivel" style={{ color: d.cor }}>{d.label}</span>
                    <span className="mg-dif-emoji">{locked ? '🔒' : d.emoji || '🟢'}</span>
                    <div className="mg-dif-specs">{d.specs.map(s => <span key={s}>{s}</span>)}</div>
                    {isStealth && <div className="mg-dif-preview">{Array.from({length:d.preview}).map((_,i)=><div key={i} className="mg-dif-preview-cell" />)}</div>}
                    <span className={`mg-dif-badge ${d.free ? 'mg-dif-badge--free' : locked ? 'mg-dif-badge--locked' : 'mg-dif-badge--elite'}`}>
                      {locked ? 'ELITE+' : d.badge}
                    </span>
                    {locked && <p className="mg-dif-locked-msg">assine Elite para desbloquear</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'vitoria') return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-resultado">
        <div className="mg-resultado-emoji">🏆</div>
        <h2 className="mg-resultado-titulo" style={{ color: jogoAtivo.cor }}>MISSÃO COMPLETA</h2>
        <p className="mg-resultado-jogo">{jogoAtivo.nome}{dificuldadeSelecionada && ` (${dificuldadeSelecionada})`}</p>
        <div className="mg-resultado-tempo"><span className="mg-resultado-tempo-label">TEMPO</span><span className="mg-resultado-tempo-val" style={{ color: jogoAtivo.cor }}>{formatTempo(tempoFinal)}</span></div>
        {recordes[jogoAtivo.id === 'stealth' ? `${jogoAtivo.id}_${dificuldadeSelecionada}` : jogoAtivo.id] === tempoFinal && <p className="mg-resultado-recorde">★ NOVO RECORDE ★</p>}
        <div className="mg-resultado-btns">
          <button className="mg-btn" style={{ borderColor: jogoAtivo.cor, color: jogoAtivo.cor }} onClick={() => iniciarJogo(jogoAtivo, dificuldadeSelecionada || 'easy')}>[ jogar de novo ]</button>
          <button className="mg-btn" onClick={voltarHub}>[ voltar ]</button>
        </div>
      </div>
    </div>
  )

  if (fase === 'derrota') return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-resultado">
        <div className="mg-resultado-emoji">💀</div>
        <h2 className="mg-resultado-titulo" style={{ color: '#8B0000' }}>GAME OVER</h2>
        <p className="mg-resultado-jogo">{jogoAtivo.nome}</p>
        <div className="mg-resultado-btns">
          <button className="mg-btn" style={{ borderColor: '#8B0000', color: '#8B0000' }} onClick={() => iniciarJogo(jogoAtivo, dificuldadeSelecionada || 'easy')}>[ tentar de novo ]</button>
          <button className="mg-btn" onClick={voltarHub}>[ voltar ]</button>
        </div>
      </div>
    </div>
  )

  if (fase === 'jogando') return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-jogando">
        <div className="mg-jogando-header">
          <span className="mg-jogando-nome" style={{ color: jogoAtivo.cor }}>{jogoAtivo.emoji} {jogoAtivo.nome}{dificuldadeSelecionada && ` (${dificuldadeSelecionada})`}</span>
          <button className="mg-btn-sair" onClick={voltarHub}>[ ← sair ]</button>
        </div>
        <div className="mg-jogando-area">{renderPuzzle()}</div>
      </div>
    </div>
  )

  return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-header">
        <button className="mg-back" onClick={() => navigate('/games')}>← extras</button>
        <h1 className="mg-titulo"><span className="mg-titulo-glitch" data-text="MINI GAMES">MINI GAMES</span></h1>
        <p className="mg-subtitulo"><span className="mg-cursor">█</span> puzzles standalone. sem login. sem save. só habilidade.</p>
      </div>
      <div className="mg-grid">
        {GAMES.map(game => (
          <div key={game.id} className="mg-card" style={{ '--cor': game.cor }} onClick={() => tentarIniciar(game)}>
            <div className="mg-card-inner">
              <div className="mg-card-top"><span className="mg-card-dificuldade">{game.dificuldade}</span>{recordes[game.id] && <span className="mg-card-recorde" style={{ color: game.cor }}>★ {formatTempo(recordes[game.id])}</span>}</div>
              <div className="mg-card-emoji">{game.emoji}</div>
              <h2 className="mg-card-nome">{game.nome}</h2><p className="mg-card-tagline">{game.tagline}</p><p className="mg-card-desc">{game.desc}</p>
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
