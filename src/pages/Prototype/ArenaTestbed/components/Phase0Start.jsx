import { useState, useEffect } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { carregarFichas, deletarFicha } from '../data/fichaStorage'
import { podeSalvarNovaFicha } from '../engine/regrasFicha'
import './Phase0Start.css'

export default function Phase0Start({ onNewGame, onLoadGame }) {
  const { t } = useLanguage()
  const [fichas, setFichas] = useState([])

  useEffect(() => {
    carregarFichas().then(setFichas)
  }, [])

  const podeSalvar = podeSalvarNovaFicha(fichas)

  async function handleDelete(id) {
    await deletarFicha(id)
    const atualizadas = await carregarFichas()
    setFichas(atualizadas)
  }

  return (
    <div className="p0-root">
      <div className="p0-card">
        <h1 className="p0-title">Arena Testbed</h1>

        <button className="p0-btn p0-btn--primary" onClick={onNewGame}>
          {t('prototype.arena_testbed.p0_new_game')}
        </button>

        <button
          className="p0-btn p0-btn--secondary"
          disabled={fichas.length === 0}
          onClick={() => {}}
        >
          {t('prototype.arena_testbed.p0_load_game')}
        </button>

        {fichas.length > 0 && (
          <div className="p0-lista">
            <div className="p0-lista-title">
              {t('prototype.arena_testbed.p0_saved_sheets')} ({fichas.length})
            </div>
            {fichas.map(f => (
              <div key={f.id} className="p0-lista-item">
                <div className="p0-lista-info">
                  {f.personagens?.map(p => p.aparencia?.nome || '?').join(', ')}
                </div>
                <div className="p0-lista-acoes">
                  <button className="p0-lista-btn" onClick={() => onLoadGame(f)}>
                    {t('prototype.arena_testbed.p0_load')}
                  </button>
                  <button className="p0-lista-btn p0-lista-btn--del" onClick={() => handleDelete(f.id)}>
                    {t('prototype.arena_testbed.p0_delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!podeSalvar.permitido && (
          <div className="p0-aviso">{t('prototype.arena_testbed.' + podeSalvar.motivo)}</div>
        )}
      </div>
    </div>
  )
}
