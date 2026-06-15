import { useState, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { getHP, getMP, getCasasMovimento, criarPersonagem } from '../engine/combat'
import './Phase1SheetBuilder.css'

const ATTRIBUTES = ['forca', 'agi', 'dex', 'pdf', 'res', 'arm']
const BUDGET_OPTIONS = [3, 6, 9, 12, 15, 18, 21]

export default function Phase1SheetBuilder({ onConfirm }) {
  const { t } = useLanguage()
  const [characters, setCharacters] = useState([])
  const [editing, setEditing] = useState(null)

  function addCharacter() {
    if (characters.length >= 4) return
    const newChar = {
      id: `temp_${Date.now()}`,
      nome: '',
      time: characters.filter(c => c.time === 'jogador').length === 0 ? 'jogador' : 'ia',
      tipoAtaque: 'melee',
      orcamento: 9,
      forca: 0,
      agi: 0,
      dex: 0,
      pdf: 0,
      res: 1, // FIX 1+3: RES mínimo 1, ocupa 1 ponto
      arm: 0,
      equipamento: 'nenhum',
      pocaoHP: 0,
      pocaoMP: 0,
    }
    setCharacters([...characters, newChar])
    setEditing(characters.length)
  }

  function removeCharacter(idx) {
    const updated = characters.filter((_, i) => i !== idx)
    setCharacters(updated)
    if (editing === idx) setEditing(null)
    else if (editing > idx) setEditing(editing - 1)
  }

  function updateChar(idx, field, value) {
    const updated = [...characters]
    updated[idx] = { ...updated[idx], [field]: value }
    if (field === 'tipoAtaque') {
      if (value === 'melee') {
        updated[idx].pdf = 0
      } else {
        updated[idx].forca = 0
      }
    }
    if (field === 'orcamento') {
      // Reset attributes and redistribuir
      updated[idx].forca = 0
      updated[idx].agi = 0
      updated[idx].dex = 0
      updated[idx].pdf = 0
      updated[idx].res = 1
      updated[idx].arm = 0
    }
    setCharacters(updated)
  }

  /** Calcula pontos gastos por um personagem */
  function pontosGastos(char) {
    let total = 0
    for (const attr of ATTRIBUTES) {
      if (attr === 'res') {
        total += Math.max(0, (char[attr] || 0) - 1) // RES 1 é obrigatório/gratuito... não, RES 1 consome 1 ponto
        total += (char[attr] || 0) // cada ponto de RES conta
      } else {
        total += char[attr] || 0
      }
    }
    return total
  }

  /** Pontos restantes */
  function pontosRestantes(char) {
    const gastos = ATTRIBUTES.reduce((sum, attr) => sum + (char[attr] || 0), 0)
    return char.orcamento - gastos
  }

  function updateAttr(idx, attr, delta) {
    const updated = [...characters]
    const char = updated[idx]
    const newVal = (char[attr] || 0) + delta

    // FIX 1: mínimo 0, exceto RES que é 1
    const minVal = attr === 'res' ? 1 : 0
    if (newVal < minVal) return

    // Bloqueado pelo tipo de ataque
    if (attr === 'pdf' && char.tipoAtaque === 'melee') return
    if (attr === 'forca' && char.tipoAtaque === 'distancia') return

    // FIX 2: verificar orçamento
    const restantes = pontosRestantes(char)
    if (delta > 0 && restantes <= 0) return

    updated[idx] = { ...char, [attr]: newVal }
    setCharacters(updated)
  }

  const canProceed = useMemo(() => {
    const hasPlayer = characters.some(c => c.time === 'jogador')
    const hasIA = characters.some(c => c.time === 'ia')
    const allNamed = characters.every(c => c.nome.trim().length > 0)
    const allBudgetUsed = characters.every(c => pontosRestantes(c) === 0)
    return hasPlayer && hasIA && allNamed && allBudgetUsed && characters.length > 0
  }, [characters])

  function handleConfirm() {
    const finalChars = characters.map(c => {
      return criarPersonagem(
        c.nome, c.time, c.tipoAtaque,
        c.forca, c.agi, c.dex, c.pdf, c.res, c.arm,
        c.equipamento, c.pocaoHP, c.pocaoMP
      )
    })
    onConfirm(finalChars)
  }

  return (
    <div className="tab-fase1">
      <div className="tab-fase1-header">
        <h3>{t('prototype.arena_testbed.phase1_title')}</h3>
        <p className="tab-fase1-subtitle">{t('prototype.arena_testbed.phase1_desc')}</p>
      </div>

      <div className="tab-fase1-chars">
        {characters.map((char, idx) => {
          const restantes = pontosRestantes(char)
          return (
          <div key={char.id} className={`tab-fase1-card ${editing === idx ? 'editing' : ''}`}>
            <div className="tab-fase1-card-header">
              <span className="tab-fase1-char-num">
                {t('prototype.arena_testbed.character')} {idx + 1}
              </span>
              <button
                className="tab-btn-remove"
                onClick={() => removeCharacter(idx)}
                title={t('prototype.arena_testbed.remove')}
              >✕</button>
            </div>

            <label className="tab-fase1-field">
              <span>{t('prototype.arena_testbed.name')}</span>
              <input
                type="text"
                value={char.nome}
                onChange={e => updateChar(idx, 'nome', e.target.value)}
                placeholder={t('prototype.arena_testbed.name_placeholder')}
                maxLength={20}
              />
            </label>

            <label className="tab-fase1-field">
              <span>{t('prototype.arena_testbed.team')}</span>
              <select value={char.time} onChange={e => updateChar(idx, 'time', e.target.value)}>
                <option value="jogador">{t('prototype.arena_testbed.team_player')}</option>
                <option value="ia">{t('prototype.arena_testbed.team_ia')}</option>
              </select>
            </label>

            <div className="tab-fase1-radio-group">
              <span className="tab-fase1-radio-label">{t('prototype.arena_testbed.attack_type')}</span>
              <label className="tab-fase1-radio">
                <input type="radio" name={`atk_${idx}`} checked={char.tipoAtaque === 'melee'}
                  onChange={() => updateChar(idx, 'tipoAtaque', 'melee')} />
                {t('prototype.arena_testbed.melee')} (FOR)
              </label>
              <label className="tab-fase1-radio">
                <input type="radio" name={`atk_${idx}`} checked={char.tipoAtaque === 'distancia'}
                  onChange={() => updateChar(idx, 'tipoAtaque', 'distancia')} />
                {t('prototype.arena_testbed.distance')} (PDF)
              </label>
            </div>

            {/* ── FIX 2: Seletor de orçamento ────── */}
            <div className="tab-fase1-budget">
              <label className="tab-fase1-field">
                <span>{t('prototype.arena_testbed.budget_label')}</span>
                <select value={char.orcamento} onChange={e => updateChar(idx, 'orcamento', Number(e.target.value))}>
                  {BUDGET_OPTIONS.map(b => (
                    <option key={b} value={b}>{b} {t('prototype.arena_testbed.budget_points')}</option>
                  ))}
                </select>
              </label>
              <div className={`tab-fase1-budget-counter ${restantes === 0 ? 'zero' : restantes < 0 ? 'negativo' : ''}`}>
                <span className="tab-fase1-budget-label">{t('prototype.arena_testbed.points_remaining')}</span>
                <span className="tab-fase1-budget-value">{restantes} / {char.orcamento}</span>
              </div>
            </div>

            {/* ── Atributos ──────────────────────── */}
            <div className="tab-fase1-attrs">
              {ATTRIBUTES.map(attr => {
                const isBlocked =
                  (attr === 'pdf' && char.tipoAtaque === 'melee') ||
                  (attr === 'forca' && char.tipoAtaque === 'distancia')
                const val = isBlocked ? 0 : (char[attr] || 0)
                const minVal = attr === 'res' ? 1 : 0
                return (
                  <div key={attr} className="tab-fase1-attr-row">
                    <span className="tab-fase1-attr-name">{t(`prototype.arena_testbed.attr_${attr}`)}</span>
                    <div className="tab-fase1-attr-controls">
                      <button className="tab-btn-small"
                        disabled={val <= minVal || isBlocked}
                        onClick={() => updateAttr(idx, attr, -1)}>−</button>
                      <span className={`tab-fase1-attr-val ${isBlocked ? 'blocked' : ''}`}>{val}</span>
                      <button className="tab-btn-small"
                        disabled={isBlocked || restantes <= 0}
                        onClick={() => updateAttr(idx, attr, +1)}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>

            <label className="tab-fase1-field">
              <span>{t('prototype.arena_testbed.equipment')}</span>
              <select value={char.equipamento} onChange={e => updateChar(idx, 'equipamento', e.target.value)}>
                <option value="nenhum">{t('prototype.arena_testbed.equip_none')}</option>
                <option value="ofensivo">{t('prototype.arena_testbed.equip_off')} (+2 FA)</option>
                <option value="defensivo">{t('prototype.arena_testbed.equip_def')} (+2 FD)</option>
                <option value="ambos">{t('prototype.arena_testbed.equip_both')}</option>
              </select>
            </label>

            <div className="tab-fase1-items">
              <span className="tab-fase1-items-label">{t('prototype.arena_testbed.inventory')}</span>
              <label className="tab-fase1-item-row">
                <span>{t('prototype.arena_testbed.potion_hp')} (+5)</span>
                <div className="tab-fase1-attr-controls">
                  <button className="tab-btn-small" disabled={char.pocaoHP <= 0}
                    onClick={() => updateChar(idx, 'pocaoHP', Math.max(0, char.pocaoHP - 1))}>−</button>
                  <span className="tab-fase1-attr-val">{char.pocaoHP}</span>
                  <button className="tab-btn-small" disabled={char.pocaoHP >= 5}
                    onClick={() => updateChar(idx, 'pocaoHP', char.pocaoHP + 1)}>+</button>
                </div>
              </label>
              <label className="tab-fase1-item-row">
                <span>{t('prototype.arena_testbed.potion_mp')} (+5)</span>
                <div className="tab-fase1-attr-controls">
                  <button className="tab-btn-small" disabled={char.pocaoMP <= 0}
                    onClick={() => updateChar(idx, 'pocaoMP', Math.max(0, char.pocaoMP - 1))}>−</button>
                  <span className="tab-fase1-attr-val">{char.pocaoMP}</span>
                  <button className="tab-btn-small" disabled={char.pocaoMP >= 5}
                    onClick={() => updateChar(idx, 'pocaoMP', char.pocaoMP + 1)}>+</button>
                </div>
              </label>
            </div>

            <div className="tab-fase1-summary">
              <div className="tab-fase1-summary-row">
                <span className="tab-fase1-summary-label">HP</span>
                <span className="tab-fase1-summary-val hp-color">{getHP(char.res)}</span>
              </div>
              <div className="tab-fase1-summary-row">
                <span className="tab-fase1-summary-label">MP</span>
                <span className="tab-fase1-summary-val mp-color">{getMP(char.res)}</span>
              </div>
              <div className="tab-fase1-summary-row">
                <span className="tab-fase1-summary-label">{t('prototype.arena_testbed.move')}</span>
                <span className="tab-fase1-summary-val">{getCasasMovimento(char.agi)}</span>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {characters.length < 4 && (
        <button className="tab-btn tab-btn-secondary" onClick={addCharacter}>
          + {t('prototype.arena_testbed.add_char')}
        </button>
      )}

      <div className="tab-fase1-footer">
        {characters.length > 0 && characters.some(c => pontosRestantes(c) !== 0) && (
          <p className="tab-fase1-warning">{t('prototype.arena_testbed.budget_warning')}</p>
        )}
        <button className="tab-btn tab-btn-primary" disabled={!canProceed} onClick={handleConfirm}>
          {t('prototype.arena_testbed.next_board')} →
        </button>
      </div>
    </div>
  )
}
