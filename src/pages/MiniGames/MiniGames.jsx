import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { PuzzleDecoder, PuzzleStealthGrid, PuzzleSlidingTiles, PuzzleLabirinto, PuzzleAnagrama, PuzzleForça, PuzzleSimonSays } from '../../components/Puzzles'
import { useEventos } from '../../context/EventosContext'
import BackToGamesBtn from '../../components/BackToGamesBtn/BackToGamesBtn'
import PassearEnduro from '../Tamagoshi/screens/Passear'
import './MiniGames.css'

const GAMES = [
  { id: 'stealth', puzzleKey: 'infiltracao', emoji: '🥷', cor: '#00B4D8', semImagens: false },
  { id: 'decoder', puzzleKey: 'decoder', emoji: '📡', cor: '#F5A623', semImagens: false },
  { id: 'sliding', puzzleKey: 'sliding', emoji: '🧩', cor: '#A855F4', semImagens: false },
  { id: 'labirinto', puzzleKey: 'labirinto', emoji: '🌀', cor: '#8B0000', semImagens: false },
  { id: 'anagrama', puzzleKey: 'anagrama', emoji: '🔤', cor: '#22C55E', semImagens: false },
  { id: 'forca', puzzleKey: 'forca', emoji: '🎡', cor: '#EC4899', semImagens: false },
  { id: 'enduro', puzzleKey: 'enduro', emoji: '🏎️', cor: '#FF3366', badgeKey: 'games.minigames.badge_lancado', badgeCor: '#22C55E', semImagens: true },
  { id: 'simon', puzzleKey: 'simon', emoji: '🔵', cor: '#A855F4', semImagens: false },
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
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { registrarEvento } = useEventos()

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
    if (game.id === 'enduro') { setJogoAtivo(game); setFase('jogando'); return }
    if (['stealth','decoder','sliding','labirinto','anagrama','forca','simon'].includes(game.id)) { setJogoAtivo(game); setFase('selecionar_dificuldade'); return }
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
    const nomeJogo = jogoAtivo?.puzzleKey || jogoAtivo?.id || 'desconhecido'
    registrarEvento('minigame_completo', `Completou ${nomeJogo}`, 1)
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

  const gameNomeKey = (g) => g.puzzleKey === 'enduro' ? 'games.minigames.puzzle_enduro_nome' : `games.minigames.puzzles.${g.puzzleKey}.nome`
  const gameTagKey = (g) => g.puzzleKey === 'enduro' ? 'games.minigames.puzzle_enduro_tagline' : `games.minigames.puzzles.${g.puzzleKey}.desc`
  const gameDescKey = (g) => g.puzzleKey === 'enduro' ? 'games.minigames.puzzle_enduro_desc' : `games.minigames.puzzles.${g.puzzleKey}.detalhe`
  const gameDifKey = (g) => g.puzzleKey === 'enduro' ? 'games.minigames.puzzle_enduro_dificuldade' : `games.minigames.puzzles.${g.puzzleKey}.dificuldade`

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
      case 'simon': return <PuzzleSimonSays {...props} config={{ difficulty: dificuldadeSelecionada || 'easy' }} />
      case 'enduro':
        return <PassearEnduro onConcluir={voltarHub} />
      default: return null
    }
  }

  if (fase === 'selecionar_dificuldade') {
    const isStealth = jogoAtivo.id === 'stealth'
    const DIF_LABEL_KEYS = { easy: 'games.minigames.dif_facil', medium: 'games.minigames.dif_medio', hard: 'games.minigames.dif_dificil', extreme: 'games.minigames.dif_extreme', epic: 'games.minigames.dif_epico' }
    const DIF_CONFIGS = {
      stealth: [
        { id: 'easy', specs: ['grid 4×4','3 câmeras','⏱ 30s'], preview: 16, cor: '#22C55E', free: true },
        { id: 'medium', specs: ['grid 8×8','5 câmeras','⏱ 60s'], preview: 64, cor: '#F5A623', free: true },
        { id: 'hard', specs: ['grid 12×12','8 câmeras','⏱ 90s'], preview: 144, cor: '#8B0000', free: true },
      ],
      decoder: [
        { id: 'easy', specs: ['1 barra','5 tent.','⏱ 45s'], emoji: '📡', cor: '#22C55E', free: true },
        { id: 'medium', specs: ['2 barras','4 tent.','⏱ 45s'], emoji: '📡', cor: '#F5A623', free: true },
        { id: 'hard', specs: ['3 barras','3 tent.','⏱ 30s'], emoji: '📡', cor: '#8B0000', free: true },
        { id: 'extreme', specs: ['4 barras','3 tent.','⏱ 20s'], emoji: '📡', cor: '#8B0000', free: true },
      ],
      forca: [
        { id: 'easy',    specs: ['6 erros', 'sem timer', '6 opções'],  emoji: '🎡', cor: '#22C55E', free: true },
        { id: 'medium',  specs: ['5 erros', '⏱ 60s',    '8 opções'],  emoji: '🎡', cor: '#F5A623', free: true },
        { id: 'hard',    specs: ['4 erros', '⏱ 45s',    '10 opções'], emoji: '🎡', cor: '#8B0000', free: true },
        { id: 'extreme', specs: ['3 erros', '⏱ 30s',    '12 opções'], emoji: '🎡', cor: '#8B0000', free: true },
      ],
      sliding: [
        { id: 'easy', specs: ['grid 3×3','8 peças','sem timer'], emoji: '🧩', cor: '#22C55E', free: true },
        { id: 'medium', specs: ['grid 4×4','15 peças','sem timer'], emoji: '🧩', cor: '#F5A623', free: true },
        { id: 'hard', specs: ['grid 5×5','24 peças','sem timer'], emoji: '🧩', cor: '#8B0000', free: true },
      ],
      labirinto: [
        { id: 'easy',   specs: ['8×8',  'sem timer', 'sem dica'],   emoji: '🌀', cor: '#22C55E', free: true },
        { id: 'medium', specs: ['12×12','⏱ 90s',    'dica 15s'],   emoji: '🌀', cor: '#F5A623', free: true },
        { id: 'hard',   specs: ['16×16','⏱ 60s',    'dica 15s'],   emoji: '🌀', cor: '#8B0000', free: true },
      ],
      simon: [
        { id: 'easy',   specs: ['5 rounds', '3 passos', '4 cores'], emoji: '🔵', cor: '#22C55E', free: true },
        { id: 'medium', specs: ['6 rounds', '4 passos', '4 cores'], emoji: '🔵', cor: '#F5A623', free: true },
        { id: 'hard',   specs: ['8 rounds', '5 passos', '4 cores'], emoji: '🔵', cor: '#8B0000', free: true },
      ],
      anagrama: [
        { id: 'easy',    specs: ['1 palavra', '5 tent.', '⏱ 45s'], emoji: '🔤', cor: '#22C55E', free: true },
        { id: 'medium',  specs: ['2 palavras','4 tent.', '⏱ 40s'], emoji: '🔤', cor: '#F5A623', free: true },
        { id: 'hard',    specs: ['3 frases',  '3 tent.', '⏱ 35s'], emoji: '🔤', cor: '#8B0000', free: true },
        { id: 'extreme', specs: ['4 frases',  '3 tent.', '⏱ 25s'], emoji: '🔤', cor: '#8B0000', free: true },
        { id: 'epic',    specs: ['5 frases',  '2 tent.', '⏱ 20s'], emoji: '🔤', cor: '#8B0000', free: true },
      ],
    }
    const difs = DIF_CONFIGS[jogoAtivo.id] || []
    return (
      <div className="mg-page"><div className="mg-scanlines" />
        <div className="mg-dif-select">
          <div className="mg-dif-header">
            <h2 className="mg-dif-titulo"><span className="mg-titulo-glitch" data-text={t(gameNomeKey(jogoAtivo)).toUpperCase()}>{t(gameNomeKey(jogoAtivo)).toUpperCase()}</span></h2>
            <p className="mg-dif-sub">{t('games.minigames.dif_escolha')}</p>
          </div>
          <div className="mg-dif-grid">
            {difs.map(d => (
              <div key={d.id} className="mg-dif-card" onClick={() => iniciarJogo(jogoAtivo, d.id)}>
                <div className="mg-dif-card-inner">
                  <span className="mg-dif-nivel" style={{ color: d.cor }}>{t(DIF_LABEL_KEYS[d.id])}</span>
                  <span className="mg-dif-emoji">{d.emoji || '🟢'}</span>
                  <div className="mg-dif-specs">{d.specs.map(s => <span key={s}>{s}</span>)}</div>
                  {isStealth && <div className="mg-dif-preview">{Array.from({length:d.preview}).map((_,i)=><div key={i} className="mg-dif-preview-cell" />)}</div>}
                  <span className="mg-dif-badge mg-dif-badge--free">{t('quiz.modo_free_badge')}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <BackToGamesBtn onClick={voltarHub} label="← VOLTAR AOS MINIGAMES" />
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'vitoria') return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-resultado">
        <div className="mg-resultado-emoji">🏆</div>
        <h2 className="mg-resultado-titulo" style={{ color: jogoAtivo.cor }}>{t('games.minigames.resultado_vitoria')}</h2>
        <p className="mg-resultado-jogo">{t(gameNomeKey(jogoAtivo))}{dificuldadeSelecionada && ` (${dificuldadeSelecionada})`}</p>
        <div className="mg-resultado-tempo"><span className="mg-resultado-tempo-label">{t('games.minigames.resultado_tempo')}</span><span className="mg-resultado-tempo-val" style={{ color: jogoAtivo.cor }}>{formatTempo(tempoFinal)}</span></div>
        {recordes[jogoAtivo.id === 'stealth' ? `${jogoAtivo.id}_${dificuldadeSelecionada}` : jogoAtivo.id] === tempoFinal && <p className="mg-resultado-recorde">{t('games.minigames.resultado_recorde')}</p>}
        <div className="mg-resultado-btns">
          <button className="mg-btn" style={{ borderColor: jogoAtivo.cor, color: jogoAtivo.cor }} onClick={() => iniciarJogo(jogoAtivo, dificuldadeSelecionada || 'easy')}>{t('games.minigames.resultado_jogar_novamente')}</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <BackToGamesBtn onClick={voltarHub} label={t('games.minigames.voltar')} />
        </div>
      </div>
    </div>
  )

  if (fase === 'derrota') return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-resultado">
        <div className="mg-resultado-emoji">💀</div>
        <h2 className="mg-resultado-titulo" style={{ color: '#8B0000' }}>{t('games.minigames.resultado_derrota')}</h2>
        <p className="mg-resultado-jogo">{t(gameNomeKey(jogoAtivo))}</p>
        <div className="mg-resultado-btns">
          <button className="mg-btn" style={{ borderColor: '#8B0000', color: '#8B0000' }} onClick={() => iniciarJogo(jogoAtivo, dificuldadeSelecionada || 'easy')}>{t('games.minigames.resultado_tentar_novamente')}</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <BackToGamesBtn onClick={voltarHub} label={t('games.minigames.voltar')} />
        </div>
      </div>
    </div>
  )

  if (fase === 'jogando') return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-jogando">
        <div className="mg-jogando-header">
          <span className="mg-jogando-nome" style={{ color: jogoAtivo.cor }}>{jogoAtivo.emoji} {t(gameNomeKey(jogoAtivo))}{dificuldadeSelecionada && ` (${dificuldadeSelecionada})`}</span>
        </div>
        <div className="mg-jogando-area">{renderPuzzle()}</div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <BackToGamesBtn onClick={voltarHub} label={t('games.minigames.voltar')} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="mg-page"><div className="mg-scanlines" />
      <div className="mg-header">
        <h1 className="mg-titulo"><span className="mg-titulo-glitch" data-text={t('games.minigames.titulo')}>{t('games.minigames.titulo')}</span></h1>
        <p className="mg-subtitulo"><span className="mg-cursor">█</span> {t('games.minigames.hub_subtitulo')}</p>
      </div>
      <div className="mg-grid">
        {GAMES.map(game => (
          <div key={game.id} className="mg-card" style={{ '--cor': game.cor }} onClick={() => tentarIniciar(game)}>
            <div className="mg-card-inner">
              <div className="mg-card-top"><span className="mg-card-dificuldade">{t(gameDifKey(game))}</span>{game.badgeKey && <span className="mg-card-badge" style={{ background: game.badgeCor+'22', border: '1px solid '+game.badgeCor, color: game.badgeCor }}>{t(game.badgeKey)}</span>}{recordes[game.id] && <span className="mg-card-recorde" style={{ color: game.cor }}>★ {formatTempo(recordes[game.id])}</span>}</div>
              <div className="mg-card-emoji">{game.emoji}{game.semImagens && <span className="mg-card-warn" title="imagens oficiais pendentes">⛔</span>}</div>
              <h2 className="mg-card-nome">{t(gameNomeKey(game))}</h2><p className="mg-card-tagline">{t(gameTagKey(game))}</p><p className="mg-card-desc">{t(gameDescKey(game))}</p>
              <div className="mg-card-cta">{t('games.minigames.jogar')}</div>
            </div>
            <div className="mg-card-borda" />
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <BackToGamesBtn onClick={() => navigate('/games')} label={t('games.minigames.hub_voltar')} />
      </div>
      <div className="mg-footer"><span>{t('games.minigames.hub_footer')}</span></div>
    </div>
  )
}
