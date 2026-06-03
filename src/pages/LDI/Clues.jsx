import { useNavigate } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import ClueBook from './components/ClueBook'
import './LDI.css'

export default function Clues() {
  const navigate = useNavigate()
  const { save } = useGameStore()

  return (
    <div className="ldi-page ldi-page--clues">
      <ClueBook
        clues={save.clues_collected || []}
        onClose={() => navigate(-1)}
      />
    </div>
  )
}
