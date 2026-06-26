import { useState } from 'react'
import { useJackStore } from '../store/useJackStore'
import { useLanguage } from '../../../../context/LanguageContext'
import { CASOS } from '../data/casos'
import DialogoCaso from '../components/DialogoCaso'
import IntroNoir from '../components/IntroNoir'

export default function CasoAbertura() {
  const { t } = useLanguage()
  const store = useJackStore()
  const casoId = useJackStore(s => s._casoPreview)
  const caso = CASOS[casoId]
  const [introFim, setIntroFim] = useState(false)

  if (!caso) { store.setFase('caso_select'); return null }

  console.log('[CASO_ABERTURA] carregando caso:', casoId, '| tem dialogoAbertura:', !!caso.dialogoAbertura)

  const handleContinuar = () => {
    store.iniciarCaso(casoId, caso.suspeitos)
    useJackStore.setState({ _casoPreview: null })
    console.log('[CASO_ABERTURA] iniciando caso:', casoId)
  }

  return (
    <div className="jdc-investigacao">
      {!introFim && (
        <IntroNoir onFim={() => {
          setIntroFim(true)
          console.log('[CASO_ABERTURA] intro noir concluÃ­da')
        }} />
      )}
      {introFim && (
        <>
          <div className="jdc-investigacao-header">
            <span className="jack-text--amber">ðŸ“‹ {caso.nome}</span>
            <button className="jack-btn" onClick={() => store.setFase('caso_select')}
              style={{ fontSize: '0.7rem' }}>{t('games.jackcandy.voltar')}</button>
          </div>
          <div className="jdc-caso-dialogo" style={{ marginTop: '1rem' }}>
            <DialogoCaso
              linhas={caso.dialogoAbertura || caso.abertura.map(t => ({ personagem: 'jack', texto: t }))}
              onFim={handleContinuar}
            />
          </div>
        </>
      )}
    </div>
  )
}
