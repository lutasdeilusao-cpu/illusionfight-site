import { calcMaxPV, calcMaxPM, checkNearDeath } from '../engine/character'

const ATTR_LABELS = {
  F: 'Potência',
  H: 'Agilidade',
  R: 'Resistência',
  A: 'Proteção',
  PdF: 'Poder Elemental',
}

const WEAPON_NAMES = {
  katana: 'Katana de Dados',
  laminas: 'Lâminas Gêmeas',
  corrente: 'Lâmina de Corrente',
}

export default function CharacterSheetView({ sheet, save, compact = false }) {
  if (!sheet) return null

  const pvMax = calcMaxPV(sheet.attributes.R)
  const pmMax = calcMaxPM(sheet.attributes.PdF)
  const pvCurrent = save?.pv_current ?? pvMax
  const pmCurrent = save?.pm_current ?? pmMax
  const nearDeath = checkNearDeath(sheet, pvCurrent)
  const pvPct = Math.max(0, (pvCurrent / pvMax) * 100)

  return (
    <div className={`ldi-sheet ${compact ? 'ldi-sheet--compact' : ''}`}>
      <h3 className="ldi-sheet-name">{sheet.sheet_name || 'Sem Nome'}</h3>

      <div className="ldi-sheet-attributes">
        {Object.entries(ATTR_LABELS).map(([key, label]) => (
          <div key={key} className="ldi-sheet-attr">
            <span className="ldi-sheet-attr-label">{label}</span>
            <div className="ldi-sheet-attr-bar">
              <div
                className="ldi-sheet-attr-fill"
                style={{ width: `${Math.min(100, (sheet.attributes[key] || 0) * 20)}%` }}
              />
            </div>
            <span className="ldi-sheet-attr-value">{sheet.attributes[key] || 0}</span>
          </div>
        ))}
      </div>

      <div className="ldi-sheet-bars">
        <div className="ldi-sheet-bar-group">
          <div className="ldi-sheet-bar-label">
            <span>PV</span>
            <span>{pvCurrent}/{pvMax}</span>
          </div>
          <div className="ldi-sheet-bar-track">
            <div
              className={`ldi-sheet-bar-fill ${pvPct <= 30 ? 'ldi-hp--danger' : pvPct <= 60 ? 'ldi-hp--warning' : 'ldi-hp--safe'}`}
              style={{ width: `${pvPct}%` }}
            />
          </div>
        </div>

        <div className="ldi-sheet-bar-group">
          <div className="ldi-sheet-bar-label">
            <span>PM</span>
            <span>{pmCurrent}/{pmMax}</span>
          </div>
          <div className="ldi-sheet-bar-track">
            <div
              className="ldi-sheet-bar-fill ldi-pm-fill"
              style={{ width: `${Math.max(0, (pmCurrent / pmMax) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="ldi-sheet-info">
        <div className="ldi-sheet-info-item">
          <span className="ldi-sheet-info-label">Arma</span>
          <span className="ldi-sheet-info-value">{WEAPON_NAMES[sheet.weapon] || sheet.weapon || 'Nenhuma'}</span>
        </div>
        <div className="ldi-sheet-info-item">
          <span className="ldi-sheet-info-label">Elemento</span>
          <span className="ldi-sheet-info-value">{sheet.elemental || 'Nenhum'}</span>
        </div>
        <div className="ldi-sheet-info-item">
          <span className="ldi-sheet-info-label">XP</span>
          <span className="ldi-sheet-info-value">{sheet.xp_total || 0}</span>
        </div>
      </div>

      {nearDeath && <div className="ldi-near-death-badge">⚠ PERTO DA MORTE</div>}
    </div>
  )
}
