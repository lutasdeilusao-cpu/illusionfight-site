import { useState } from 'react'
import { motion } from 'framer-motion'
import PuzzleDecoder from '../../../components/Puzzles/PuzzleDecoder'
import PuzzleStealthGrid from '../../../components/Puzzles/PuzzleStealthGrid'
import PuzzleSlidingTiles from '../../../components/Puzzles/PuzzleSlidingTiles'
import PuzzleLabirinto from '../../../components/Puzzles/PuzzleLabirinto'
import PuzzleAnagrama from '../../../components/Puzzles/PuzzleAnagrama'
import { useLanguage } from '../../../context/LanguageContext'

export default function PuzzleWrapper({ tipo, onSolve }) {
  const { t } = useLanguage()
  const [flash, setFlash] = useState(false)

  if (tipo === 'nenhum' || !tipo) {
    setTimeout(() => onSolve(true), 100)
    return <div className="pp-puzzle-area"><p className="pp-puzzle-instruction">{t('pp.puzzle.nenhum')}</p></div>
  }

  const handleSuccess = () => onSolve(true)

  const handleFail = () => {
    setFlash(true)
    setTimeout(() => { setFlash(false); onSolve(false) }, 600)
  }

  return (
    <div className="pp-puzzle-area">
      {flash && (
        <motion.div className="pp-flash" initial={{ opacity: 0.3 }} animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }} />
      )}
      <p className="pp-puzzle-instruction">{t('pp.puzzle.instrucao')}</p>
      {tipo === 'decoder' && <PuzzleDecoder onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'stealth' && <PuzzleStealthGrid config={{ size: 4 }} onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'sliding' && <PuzzleSlidingTiles config={{ size: 3 }} onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'labirinto' && <PuzzleLabirinto onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'anagrama' && <PuzzleAnagrama onSolve={handleSuccess} onFail={handleFail} />}
    </div>
  )
}
