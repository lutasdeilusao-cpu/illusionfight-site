import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useGameStore } from './store/useGameStore'
import { useReader } from '../../context/ReaderContext'
import CharacterSheetView from './components/CharacterSheetView'
import './LDI.css'

export default function Sheet() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { setReaderMode } = useReader()
  const { sheet, save } = useGameStore()

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  return (
    <div className="ldi-page ldi-page--sheet">
      <div className="ldi-page-header">
        <button className="ldi-btn ldi-btn--ghost" onClick={() => navigate(-1)}>
          {t('games.ldi.voltar')}
        </button>
        <h1>{t('games.ldi.sheet.titulo')}</h1>
      </div>
      <CharacterSheetView sheet={sheet} save={save} />
    </div>
  )
}
