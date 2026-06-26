import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import { useReader } from '../../../context/ReaderContext'
import ClueBook from './components/ClueBook'
import './LDI.css'

export default function Clues() {
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const { save } = useGameStore()

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  return (
    <div className="ldi-page ldi-page--clues">
      <ClueBook
        clues={save.clues_collected || []}
        onClose={() => navigate(-1)}
      />
    </div>
  )
}
