import { useState, useEffect } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { carregarFichas, deletarFicha } from '../data/fichaStorage'
import { podeSalvarNovaFicha } from '../engine/regrasFicha'
import { audio } from '../engine/audioManager'
import './Phase0Start.css'

export default function Phase0Start({ onNewGame, onLoadGame }) {
  const { t } = useLanguage()
  const [fichas, setFichas] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    carregarFichas().then(setFichas)
  }, [])

  const podeSalvar = podeSalvarNovaFicha(fichas)

  async function handleDelete(id) {
    await deletarFicha(id)
    setDeleteTarget(null)
    const atualizadas = await carregarFichas()
    setFichas(atualizadas)
  }

  return (
    <div className="p0-root">
      <div className="p0-card">
        <h1 className="p0-title">Arena Testbed</h1>

        <button className="p0-btn p0-btn--primary" onClick={() => { audio.confirm(); onNewGame() }}>
          {t('prototype.arena_testbed.p0_new_game')}
        </button>

        <button
          className="p0-btn p0-btn--secondary"
          disabled={fichas.length === 0}
          onClick={() => { audio.select(); fichas.length > 0 && onLoadGame(fichas[0]) }}
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
                  <button className="p0-lista-btn" onClick={() => { audio.select(); onLoadGame(f) }}>
                    {t('prototype.arena_testbed.p0_load')}
                  </button>
                  <button className="p0-lista-btn p0-lista-btn--del" onClick={() => { audio.cancel(); setDeleteTarget(f) }}>
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

      {deleteTarget && (
        <div className="p0-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="p0-modal" onClick={e => e.stopPropagation()}>
            <div className="p0-modal-text">
              {t('prototype.arena_testbed.p0_delete_confirm', {
                nome: deleteTarget.personagens?.map(p => p.aparencia?.nome || '?').join(', ') || '?'
              })}
            </div>
            <div className="p0-modal-actions">
              <button className="p0-modal-btn" onClick={() => { audio.cancel(); setDeleteTarget(null) }}>
                {t('prototype.arena_testbed.p0_cancel')}
              </button>
              <button className="p0-modal-btn p0-modal-btn--del" onClick={() => { audio.confirm(); handleDelete(deleteTarget.id) }}>
                {t('prototype.arena_testbed.p0_confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
