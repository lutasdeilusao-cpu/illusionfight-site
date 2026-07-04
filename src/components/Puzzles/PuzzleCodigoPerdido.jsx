import { useState, useEffect, useCallback } from 'react'
import { useRafaelI18n } from './useRafaelI18n'
import { useLanguage } from '../../context/LanguageContext'
import './PuzzleCodigoPerdido.css'

const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
const MAX_ERRORS = 6

const DIF_CFG = {
  easy:   { col: '#00e5ff', label: 'FÁCIL' },
  normal: { col: '#b400ff', label: 'NORMAL' },
  hard:   { col: '#ff0055', label: 'DIFÍCIL' },
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function PuzzleCodigoPerdido({ onSolve, onFail }) {
  const { t, loaded } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState('select')
  const [diff, setDiff] = useState(null)
  const [word, setWord] = useState('')
  const [guessed, setGuessed] = useState(new Set())
  const [wrongSet, setWrongSet] = useState(new Set())
  const [errors, setErrors] = useState(0)
  const [active, setActive] = useState(false)
  const [guessCount, setGuessCount] = useState(0)
  const [cdownN, setCdownN] = useState(3)

  const cfg = diff ? DIF_CFG[diff] : null

  const countdown = useCallback((d) => {
    setDiff(d)
    setCdownN(3)
    setPhase('countdown')
  }, [])

  const startGame = useCallback(() => {
    if (!loaded) return
    const pool = t(`codigo_perdido.words.${diff}`)
    if (!Array.isArray(pool) || pool.length === 0) return
    const w = pick(pool)
    setWord(w)
    setGuessed(new Set())
    setWrongSet(new Set())
    setErrors(0)
    setGuessCount(0)
    setActive(true)
    setPhase('game')
  }, [diff, loaded, t])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (cdownN > 0) {
      const t = setTimeout(() => setCdownN(n => n - 1), 850)
      return () => clearTimeout(t)
    }
    const t = setTimeout(startGame, 550)
    return () => clearTimeout(t)
  }, [phase, cdownN, startGame])

  const guess = useCallback((letter) => {
    if (!active) return
    if (guessed.has(letter) || wrongSet.has(letter)) return

    setGuessCount(g => g + 1)

    if (word.includes(letter)) {
      const next = new Set(guessed)
      next.add(letter)
      setGuessed(next)

      if ([...word].every(l => next.has(l))) {
        setActive(false)
        setTimeout(() => onSolve?.(), 500)
      }
    } else {
      const next = new Set(wrongSet)
      next.add(letter)
      setWrongSet(next)
      const newErrors = errors + 1
      setErrors(newErrors)

      if (newErrors >= MAX_ERRORS) {
        setActive(false)
        setTimeout(() => onFail?.(), 900)
      }
    }
  }, [active, guessed, wrongSet, word, errors, onSolve, onFail])

  const livesColor = (MAX_ERRORS - errors) <= 2 ? 'var(--cp-red)' : (MAX_ERRORS - errors) <= 4 ? 'var(--cp-gold)' : 'var(--cp-cyan)'
  const remaining = MAX_ERRORS - errors
  const hearts = '◈'.repeat(remaining) + '◇'.repeat(errors)
  const wrongLetters = wrongSet.size > 0 ? [...wrongSet].sort().join('  ') : ''

  const showWord = !active && errors >= MAX_ERRORS

  if (phase === 'select') {
    return (
      <div className="cp-screen cp-grid-bg">
        <div className="cp-sel-tag">Minigame · MG-03</div>
        <div className="cp-sel-title">CÓDIGO<br />PERDIDO</div>
        <div className="cp-sel-sub">{t('codigo_perdido.subtitulo')}</div>
        <div className="cp-btns">
          <button className="cp-diff-btn cp-dif-easy" onClick={() => countdown('easy')}>
            <span className="cp-dn">◎ {gt('games.minigames.dif_facil')}</span>
            <span className="cp-di">{t('codigo_perdido.dif_easy')}</span>
          </button>
          <button className="cp-diff-btn cp-dif-normal" onClick={() => countdown('normal')}>
            <span className="cp-dn">◎ {gt('games.minigames.dif_medio')}</span>
            <span className="cp-di">{t('codigo_perdido.dif_normal')}</span>
          </button>
          <button className="cp-diff-btn cp-dif-hard" onClick={() => countdown('hard')}>
            <span className="cp-dn">◎ {gt('games.minigames.dif_dificil')}</span>
            <span className="cp-di">{t('codigo_perdido.dif_hard')}</span>
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    const showText = cdownN === 0 ? 'GO!' : String(cdownN)
    const col = cdownN === 0 && cfg ? cfg.col : '#00e5ff'
    return (
      <div className="cp-screen cp-cdown">
        <div className="cp-cdown-n" style={{ color: col, textShadow: `0 0 30px ${col}` }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  return (
    <div className="cp-screen cp-game" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="cp-hud">
        <div className="cp-hud-lives" style={{ color: livesColor }}>{hearts}</div>
        <div className="cp-hud-center">
          <span className="cp-hud-word-len">{word.length}</span>
          <span className="cp-hud-lbl">{t('codigo_perdido.hud_letras')}</span>
        </div>
        <div className="cp-hud-diff" style={{ color: cfg?.col }}>{cfg?.label}</div>
      </div>
      <div className="cp-game-body">
        <div className="cp-error-track">
          {Array.from({ length: MAX_ERRORS }, (_, i) => (
            <div key={i} className={`cp-error-pip${i < errors ? ' cp-used' : ''}`} />
          ))}
        </div>

        <div className="cp-word-display">
          {word.split('').map((char, i) => {
            const revealed = guessed.has(char)
            return (
              <div key={i} className="cp-letter-slot">
                <div className={
                  'cp-letter-char' +
                  (showWord ? '' : !revealed ? ' cp-hidden' : ' cp-new') +
                  (showWord ? ' cp-wrong' : '')
                }>
                  {revealed || showWord ? char : '_'}
                </div>
                <div className={`cp-letter-line${revealed ? ' cp-revealed' : ''}`} />
              </div>
            )
          })}
        </div>

        <div className="cp-wrong-letters">{wrongLetters}</div>

        <div className="cp-keyboard">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="cp-kb-row">
              {row.split('').map(letter => {
                const isHit = guessed.has(letter)
                const isMiss = wrongSet.has(letter)
                const used = isHit || isMiss
                return (
                  <button
                    key={letter}
                    className={'cp-kb-key' +
                      (used ? (isHit ? ' cp-used-hit' : ' cp-used-miss') : '')
                    }
                    onClick={() => guess(letter)}
                    disabled={used || !active}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
