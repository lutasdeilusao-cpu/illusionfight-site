import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useFichas } from '../../../../context/FichasContext'
import { useReader } from '../../../../context/ReaderContext'
import LutaRitmo from './LutaRitmo'
import { INIMIGOS } from './campanha'
import { ligarSom } from './som'
import './LutaRitmo.css'

// Laboratório da luta rítmica (só admin; no dev abre pra qualquer um):
// escolhe o oponente da campanha e testa a luta dele.
export default function BatalhaLab() {
  const { t } = useLanguage()
  const { isAdmin, loading } = useFichas()
  const { setReaderMode } = useReader()
  const [lutando, setLutando] = useState(false)
  const [oponente, setOponente] = useState(0)

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const liberado = isAdmin || import.meta.env.VITE_DEBUG === 'true'
  if (loading && !liberado) return <div className="rt-page" />
  if (!liberado) return <div className="rt-page"><p className="rt-legenda">{t('games.ldi.batalha.restrito')}</p></div>

  if (lutando) return <LutaRitmo t={t} ficha={INIMIGOS[oponente]} onSair={() => setLutando(false)} />

  return (
    <div className="rt-page rt-menu">
      <p className="if-eyebrow">{t('games.ldi.batalha.lab')}</p>
      <h1 className="rt-menu__titulo">{t('games.ldi.batalha.ritmo.titulo')}</h1>
      <p className="rt-menu__texto">{t('games.ldi.batalha.ritmo.como')}</p>
      <p className="if-eyebrow">{t('games.ldi.batalha.oponente')}</p>
      <ol className="rt-escada">
        {INIMIGOS.map((ini, i) => (
          <li key={ini.id}>
            <button type="button" className={`rt-degrau${oponente === i ? ' is-on' : ''}`} onClick={() => setOponente(i)}>
              <span className="rt-degrau__n">{String(i + 1).padStart(2, '0')}</span>
              <b>{t(`games.ldi.batalha.inimigos.${ini.id}.nome`)}</b>
              <small>{t(`games.ldi.batalha.inimigos.${ini.id}.desc`)}</small>
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="rt-btn rt-menu__lutar" onClick={() => { ligarSom(); setLutando(true) }}>{t('games.ldi.batalha.lutar')}</button>
    </div>
  )
}
