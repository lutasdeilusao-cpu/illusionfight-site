import { useState } from 'react'
import { motion } from 'framer-motion'
import PuzzleDecoder from '../../../components/Puzzles/PuzzleDecoder'
import PuzzleStealthGrid from '../../../components/Puzzles/PuzzleStealthGrid'
import PuzzleSlidingTiles from '../../../components/Puzzles/PuzzleSlidingTiles'
import PuzzleLabirinto from '../../../components/Puzzles/PuzzleLabirinto'
import PuzzleAnagrama from '../../../components/Puzzles/PuzzleAnagrama'

export default function PuzzleWrapper({ tipo, onSolve }) {
  const [flash, setFlash] = useState(false)

  if (tipo === 'nenhum' || !tipo) {
    setTimeout(() => onSolve(true), 100)
    return <div className="pp-puzzle-area"><p style={{ color: '#555', fontSize: 12 }}>Nenhum puzzle necessário.</p></div>
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
      <p style={{ color: '#666', fontSize: 11, marginBottom: 12 }}>Resolva o puzzle para investigar este local.</p>
      {tipo === 'decoder' && <PuzzleDecoder onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'stealth' && <PuzzleStealthGrid config={{ size: 4 }} onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'sliding' && <PuzzleSlidingTiles config={{ size: 3 }} onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'labirinto' && <PuzzleLabirinto onSolve={handleSuccess} onFail={handleFail} />}
      {tipo === 'anagrama' && <PuzzleAnagrama onSolve={handleSuccess} onFail={handleFail} />}
    </div>
  )
}
