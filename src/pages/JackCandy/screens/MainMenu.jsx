import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { getCidade } from '../data/cidades'

export default function MainMenu({ slotsData, onStart, onDeleteSlot }) {
  const { t } = useLanguage()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [confirmNew, setConfirmNew] = useState(null)

  const handleStart = (slotNum) => {
    const save = slotsData[slotNum - 1]
    setSelectedSlot(slotNum)
    if (save) {
      onStart(slotNum, save)
    } else {
      setConfirmNew(slotNum)
    }
  }

  const handleNewGame = () => {
    if (confirmNew === null) return
    onStart(confirmNew, null)
  }

  const handleDelete = (slotNum, e) => {
    e.stopPropagation()
    if (!window.confirm(t('games.jackcandy.confirmar_apagar', { n: slotNum }))) return
    onDeleteSlot(slotNum)
  }

  return (
    <div className="jdc-intro" style={{ paddingTop: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="jdc-main-title">{t('games.jackcandy.titulo')}</h1>
        <p className="jack-text jack-text--dim" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {t('games.jackcandy.subtitulo')}
        </p>
      </motion.div>

      {confirmNew !== null ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="jack-text jack-text--amber" style={{ textAlign: 'center' }}>
            {t('games.jackcandy.confirmar_novo', { n: confirmNew })}
          </p>
          <p className="jack-text jack-text--dim" style={{ textAlign: 'center', fontSize: '0.75rem' }}>
            {t('games.jackcandy.perda_progresso')}
          </p>
          <div className="jack-buttons" style={{ margin: '1.5rem auto', maxWidth: '250px' }}>
            <button className="jack-btn jack-btn--amber" onClick={handleNewGame}>
              {t('games.jackcandy.sim_novo_jogo')}
            </button>
            <button className="jack-btn" onClick={() => setConfirmNew(null)}>
              {t('games.jackcandy.cancelar')}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="jdc-slots">
          {[1, 2, 3].map(num => {
            const save = slotsData[num - 1]
            const isSelected = selectedSlot === num
            const cidade = save?.cidade_atual ? getCidade(save.cidade_atual) : null
            return (
              <motion.button
                key={num}
                className={`jdc-slot-card ${isSelected ? 'jdc-slot-card--selected' : ''} ${save ? 'jdc-slot-card--filled' : ''}`}
                onClick={() => handleStart(num)}
                whileHover={{ scale: 1.02, borderColor: '#F5A623' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="jdc-slot-num">{t('games.jackcandy.slot', { n: num })}</div>
                {save ? (
                  <div className="jdc-slot-info">
                    <div className="jdc-slot-stat">🍺 {save.cervejas || 0}</div>
                    <div className="jdc-slot-stat">LV {save.nivel || 1}</div>
                    <div className="jdc-slot-stat">{cidade?.nome || 'Marelia'}</div>
                    <div className="jdc-slot-stat" style={{ fontSize: '0.6rem', color: '#666' }}>
                      {save.dungeons_completas?.length || 0} dungeons · cap/s {(save.cervejas_por_segundo || 1)}
                    </div>
                    <div className="jdc-slot-stat" style={{ fontSize: '0.55rem', color: '#F5A623' }}>
                      {save.casos_resolvidos?.length > 0 ? `🔍 ${save.casos_resolvidos.length} caso(s)` : ''}
                    </div>
                  </div>
                ) : (
                  <div className="jdc-slot-info">
                    <div className="jdc-slot-stat jack-text--dim">{t('games.jackcandy.slot_vazio')}</div>
                    <div className="jdc-slot-stat jack-text--dim">{t('games.jackcandy.novo_jogo')}</div>
                  </div>
                )}
                {save && (
                  <span className="jdc-slot-delete" onClick={(e) => handleDelete(num, e)} title={t('games.jackcandy.apagar')}>🗑️</span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
