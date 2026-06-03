import { useNavigate } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import CharacterSheetView from './components/CharacterSheetView'
import './LDI.css'

export default function Sheet() {
  const navigate = useNavigate()
  const { sheet, save } = useGameStore()

  return (
    <div className="ldi-page ldi-page--sheet">
      <div className="ldi-page-header">
        <button className="ldi-btn ldi-btn--ghost" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1>Ficha do Personagem</h1>
      </div>
      <CharacterSheetView sheet={sheet} save={save} />
    </div>
  )
}
