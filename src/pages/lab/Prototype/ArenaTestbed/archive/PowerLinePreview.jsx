import { useState, useMemo } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { getPersonagensNaLinha } from '../engine/getLineInDirection'
import './PowerLinePreview.css'

export default function PowerLinePreview({ origemRow, origemCol, forca, cols, rows, personagens, onConfirm, onCancel }) {
  const { t } = useLanguage()
  const distancia = Math.max(1, forca - 1)
  const [selectedDir, setSelectedDir] = useState(null)

  const preview = useMemo(() => {
    if (!selectedDir) return null
    const alvos = getPersonagensNaLinha(origemRow, origemCol, selectedDir, distancia, cols, rows, personagens)
    return { direcao: selectedDir, alvos }
  }, [selectedDir, origemRow, origemCol, distancia, cols, rows, personagens])

  function handleConfirm() {
    if (!preview) return
    onConfirm({ direcao: preview.direcao, alvos: preview.alvos, distancia })
  }

  return (
    <div className="plp-overlay">
      <div className="plp-modal">
        <div className="plp-header">
          <span className="plp-header-label">{t('prototype.arena_testbed.plp_title')}</span>
          <span className="plp-header-info">
            {t('prototype.arena_testbed.attr_forca')} {forca} Â· {distancia} {distancia === 1 ? 'casa' : 'casas'}
          </span>
        </div>

        <div className="plp-direcoes">
          <button
            className={`plp-dir-btn ${selectedDir === 'norte' ? 'plp-dir-btn--active plp-dir-btn--norte' : ''}`}
            onClick={() => setSelectedDir('norte')}
          >
            <span className="plp-dir-arrow">&#9650;</span>
            <span>{t('prototype.arena_testbed.plp_north')}</span>
          </button>
          <button
            className={`plp-dir-btn ${selectedDir === 'sul' ? 'plp-dir-btn--active plp-dir-btn--sul' : ''}`}
            onClick={() => setSelectedDir('sul')}
          >
            <span className="plp-dir-arrow">&#9660;</span>
            <span>{t('prototype.arena_testbed.plp_south')}</span>
          </button>
        </div>

        {preview && (
          <div className="plp-preview">
            <div className="plp-preview-hits-label">{t('prototype.arena_testbed.plp_hits')}</div>
            {preview.alvos.length === 0 ? (
              <div className="plp-preview-empty">{t('prototype.arena_testbed.plp_no_targets')}</div>
            ) : (
              <div className="plp-preview-list">
                {preview.alvos.map((a, i) => (
                  <div key={a.char.id} className="plp-preview-item">
                    <span className="plp-preview-item-name">{a.char.nome}</span>
                    <span className="plp-preview-item-pos">
                      {t('prototype.arena_testbed.plp_cell_damage', { n: a.pos, dano: a.multiplier === 1.0 ? '100%' : '75%' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="plp-actions">
          <button className="plp-btn plp-btn--cancel" onClick={onCancel}>
            &#10005; {t('prototype.arena_testbed.btn_cancel')}
          </button>
          <button
            className="plp-btn plp-btn--confirm"
            disabled={!selectedDir}
            onClick={handleConfirm}
          >
            &#10003; {t('prototype.arena_testbed.plp_confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
