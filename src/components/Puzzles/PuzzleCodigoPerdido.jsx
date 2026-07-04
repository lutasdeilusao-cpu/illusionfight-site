import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { sfxMinigames } from './sfx-minigames'

const WORDS = {
  easy: [
    'NARC','HACK','CHIP','GRID','NODE','BYTE','CORE','DATA','FIRE','LINK',
    'SCAN','PORT','FLUX','LOOP','WIRE','BOOT','KILL','VOID','ROOT','NANO',
    'GLITCH','VIRUS','PROXY','DRONE','CYBER','ROGUE','NEXUS','PULSE','TRACE',
  ],
  normal: [
    'FIREWALL','IMPLANTE','NETRUNNER','BLACKOUT','TERMINAL','PROTOCOLO',
    'SYSADMIN','BACKDOOR','ROOTKIT','MALWARE','SPYWARE','EXPLOIT',
    'FIRMWARE','OVERFLOW','DARKWEB','PAYLOAD','SANDBOX','CLUSTER',
    'QUANTUM','HARDCODE','LOGFILE','DECRYPT','ENCRYPT','NETWORK',
  ],
  hard: [
    'CIBERNETICO','INTELIGENCIA','COMPILADOR','DEPURACAO','SOBRECARGA',
    'ARQUITETURA','PROCESSADOR','DESFRAGMENTAR','CRIPTOGRAFIA',
    'VULNERABILIDADE','AUTENTICACAO','INFRAESTRUTURA','DECODIFICADOR',
    'MONITORAMENTO','IDENTIFICACAO',
  ],
}

const MAX_ERRORS = 6
const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

const MSGS_OK = [
  'games.minigames.codigoperdido.msg_ok_1',
  'games.minigames.codigoperdido.msg_ok_2',
  'games.minigames.codigoperdido.msg_ok_3',
  'games.minigames.codigoperdido.msg_ok_4',
]
const MSGS_FAIL = [
  'games.minigames.codigoperdido.msg_fail_1',
  'games.minigames.codigoperdido.msg_fail_2',
  'games.minigames.codigoperdido.msg_fail_3',
  'games.minigames.codigoperdido.msg_fail_4',
]

const DIFF_LABELS = {
  easy:   { key: 'games.minigames.codigoperdido.dif_facil',   col: '#00e5ff' },
  normal: { key: 'games.minigames.codigoperdido.dif_normal',  col: '#b400ff' },
  hard:   { key: 'games.minigames.codigoperdido.dif_dificil', col: '#ff0055' },
}

const DIFF_SPECS = {
  easy:   'games.minigames.codigoperdido.dif_facil_spec',
  normal: 'games.minigames.codigoperdido.dif_normal_spec',
  hard:   'games.minigames.codigoperdido.dif_dificil_spec',
}

export default function PuzzleCodigoPerdido({ onSolve, onFail, config = {} }) {
  const { t } = useLanguage()
  const difficulty = config.difficulty || 'easy'

  const word = useMemo(() => {
    const pool = WORDS[difficulty]
    return pool[Math.floor(Math.random() * pool.length)]
  }, [difficulty])

  const [guessed, setGuessed] = useState(new Set())
  const [wrongSet, setWrongSet] = useState(new Set())
  const [errors, setErrors] = useState(0)
  const [active, setActive] = useState(true)
  const [guessCount, setGuessCount] = useState(0)
  const [resultMsg, setResultMsg] = useState(null)

  const diffInfo = DIFF_LABELS[difficulty]

  const guess = useCallback((letter) => {
    if (!active) return
    if (guessed.has(letter) || wrongSet.has(letter)) return

    setGuessCount(g => g + 1)

    if (word.includes(letter)) {
      setGuessed(prev => new Set([...prev, letter]))
      sfxMinigames.sucesso()

      const allGuessed = [...guessed, letter]
      if ([...word].every(l => allGuessed.includes(l))) {
        setActive(false)
        sfxMinigames.vitoria()
        setResultMsg(MSGS_OK[Math.floor(Math.random() * MSGS_OK.length)])
        setTimeout(() => onSolve?.(), 500)
      }
    } else {
      const newErrors = errors + 1
      setWrongSet(prev => new Set([...prev, letter]))
      setErrors(newErrors)
      sfxMinigames.erro()

      if (newErrors >= MAX_ERRORS) {
        setActive(false)
        setResultMsg(MSGS_FAIL[Math.floor(Math.random() * MSGS_FAIL.length)])
        setTimeout(() => onFail?.(), 900)
      }
    }
  }, [active, guessed, wrongSet, word, errors, onSolve, onFail])

  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key.toUpperCase()
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        guess(key)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [guess])

  const lives = MAX_ERRORS - errors
  const hearts = '◈'.repeat(lives) + '◇'.repeat(errors)

  return (
    <div className="puzzle-container">
      <div className="codigo-hud">
        <span className="codigo-lives" style={{
          color: lives <= 2 ? '#ff0055' : lives <= 4 ? '#ffcc00' : '#00e5ff'
        }}>{hearts}</span>
        <span className="codigo-diff" style={{ color: diffInfo.col }}>
          {t(diffInfo.key)}
        </span>
      </div>

      <p className="codigo-spec">{t(DIFF_SPECS[difficulty])}</p>

      <div className="codigo-error-track">
        {Array.from({ length: MAX_ERRORS }, (_, i) => (
          <div key={i} className={`codigo-pip ${i < errors ? 'codigo-pip--used' : ''}`} />
        ))}
      </div>

      <div className="codigo-word-display">
        {word.split('').map((char, i) => {
          const revealed = guessed.has(char)
          const isWrong = !active && !revealed
          return (
            <div key={i} className="codigo-letter-slot">
              <motion.span
                className={`codigo-letter-char ${!revealed ? 'codigo-letter-char--hidden' : ''} ${isWrong ? 'codigo-letter-char--wrong' : ''}`}
                animate={revealed ? { scale: [0, 1.2, 1], opacity: [0, 1, 1] } : {}}
                transition={{ duration: 0.35, ease: [0.2, 1.4, 0.4, 1] }}
              >
                {revealed || isWrong ? char : '_'}
              </motion.span>
              <div className={`codigo-letter-line ${revealed ? 'codigo-letter-line--revealed' : ''}`} />
            </div>
          )
        })}
      </div>

      {wrongSet.size > 0 && (
        <p className="codigo-wrong-letters">{[...wrongSet].sort().join('  ')}</p>
      )}

      <div className="codigo-keyboard">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="codigo-kb-row">
            {row.split('').map(letter => {
              const isHit = guessed.has(letter)
              const isMiss = wrongSet.has(letter)
              const used = isHit || isMiss
              return (
                <button
                  key={letter}
                  className={`codigo-kb-key ${used ? (isHit ? 'codigo-kb-key--hit' : 'codigo-kb-key--miss') : ''}`}
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

      {!active && resultMsg && (
        <motion.p
          className="codigo-result"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t(resultMsg)}
        </motion.p>
      )}
    </div>
  )
}
