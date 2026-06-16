import { useState, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { getHP, getMP, getCasasMovimento, criarPersonagem } from '../engine/combat'
import './Phase1SheetBuilder.css'

const ATTRIBUTES = ['forca', 'agi', 'dex', 'pdf', 'res', 'arm']
const BUDGET_OPTIONS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]

export default function Phase1SheetBuilder({ onConfirm, agiUmPraUm = false, onAgiToggle }) {
  const { t } = useLanguage()
  const [characters, setCharacters] = useState([])
  const [editing, setEditing] = useState(null)

  /** Gera nome automático baseado no time e ordem */
  function gerarNomeAutomatico(time, todosChars) {
    const mesmoTime = todosChars.filter(c => c.time === time)
    const ordem = mesmoTime.length + 1
    if (time === 'jogador') return `Jogador ${ordem}`
    return `IA ${ordem}`
  }

  function addCharacter() {
    if (characters.length >= 4) return
    const time = characters.filter(c => c.time === 'jogador').length === 0 ? 'jogador' : 'ia'
    const novoNome = gerarNomeAutomatico(time, characters)

    const isJogador = type => type === 'jogador'
    const newChar = isJogador(time)
      ? {
          id: `temp_${Date.now()}`,
          nome: novoNome,
          time,
          tipoAtaque: 'melee',
          orcamento: 6,
          forca: 3,
          agi: 2,
          dex: 0,
          pdf: 0,
          res: 1,
          arm: 0,
          equipamento: 'nenhum',
          pocaoHP: 0,
          pocaoMP: 0,
        }
      : {
          id: `temp_${Date.now()}`,
          nome: novoNome,
          time,
          tipoAtaque: 'distancia',
          orcamento: 6,
          forca: 0,
          agi: 0,
          dex: 1,
          pdf: 4,
          res: 1,
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
      updated[idx].forca = 0
      updated[idx].agi = 0
      updated[idx].dex = 0
      updated[idx].pdf = 0
      updated[idx].res = 1
      updated[idx].arm = 0
    }
    // Atualiza nome automático se time mudou
    if (field === 'time') {
      const mesmoTime = updated.filter(c => c.time === value)
      updated[idx].nome = gerarNomeAutomatico(value, updated.filter((_, i) => i !== idx))
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
    const allBudgetUsed = characters.every(c => pontosRestantes(c) === 0)
    return hasPlayer && hasIA && allBudgetUsed && characters.length > 0
  }, [characters])

  function handleConfirm() {
    const finalChars = characters.map(c => {
      return criarPersonagem(
        c.nome, c.time, c.tipoAtaque,
        c.forca, c.agi, c.dex, c.pdf, c.res, c.arm,
        c.equipamento, c.pocaoHP, c.pocaoMP
      )
    })
    onConfirm(finalChars, agiUmPraUm)
  }

  return (
    <div className="p1-root">
      <div className="p1-header">
        <h3>{t('prototype.arena_testbed.phase1_title')}</h3>
        <p className="p1-subtitle">{t('prototype.arena_testbed.phase1_desc')}</p>
      </div>

      <div className="p1-chars">
        {characters.map((char, idx) => {
          const restantes = pontosRestantes(char)
          return (
          <div key={char.id} className={`p1-card ${editing === idx ? 'editing' : ''}`}>
            <div className="p1-card-header">
              <span className="p1-char-num">
                {t('prototype.arena_testbed.character')} {idx + 1}
              </span>
              <button
                className="p1-btn-remove"
                onClick={() => removeCharacter(idx)}
                title={t('prototype.arena_testbed.remove')}
              >✕</button>
            </div>

            <div className="p1-auto-name">
              <span className={`p1-char-time-label ${char.time}`}>
                {char.nome}
              </span>
            </div>

            <label className="p1-field">
              <span>{t('prototype.arena_testbed.team')}</span>
              <select value={char.time} onChange={e => updateChar(idx, 'time', e.target.value)}>
                <option value="jogador">{t('prototype.arena_testbed.team_player')}</option>
                <option value="ia">{t('prototype.arena_testbed.team_ia')}</option>
              </select>
            </label>

            <div className="p1-radio-group">
              <span className="p1-radio-label">{t('prototype.arena_testbed.attack_type')}</span>
              <label className="p1-radio">
                <input type="radio" name={`atk_${idx}`} checked={char.tipoAtaque === 'melee'}
                  onChange={() => updateChar(idx, 'tipoAtaque', 'melee')} />
                {t('prototype.arena_testbed.melee')} (FOR)
              </label>
              <label className="p1-radio">
                <input type="radio" name={`atk_${idx}`} checked={char.tipoAtaque === 'distancia'}
                  onChange={() => updateChar(idx, 'tipoAtaque', 'distancia')} />
                {t('prototype.arena_testbed.distance')} (PDF)
              </label>
            </div>

            {/* ── FIX 2: Seletor de orçamento ────── */}
            <div className="p1-budget">
              <label className="p1-field">
                <span>{t('prototype.arena_testbed.budget_label')}</span>
                <select value={char.orcamento} onChange={e => updateChar(idx, 'orcamento', Number(e.target.value))}>
                  {BUDGET_OPTIONS.map(b => (
                    <option key={b} value={b}>{b} {t('prototype.arena_testbed.budget_points')}</option>
                  ))}
                </select>
              </label>
              <div className={`p1-budget-counter ${restantes === 0 ? 'zero' : restantes < 0 ? 'negativo' : ''}`}>
                <span className="p1-budget-label">{t('prototype.arena_testbed.points_remaining')}</span>
                <span className="p1-budget-value">{restantes} / {char.orcamento}</span>
              </div>
            </div>

            {/* ── Atributos ──────────────────────── */}
            <div className="p1-attrs">
              {ATTRIBUTES.map(attr => {
                const isBlocked =
                  (attr === 'pdf' && char.tipoAtaque === 'melee') ||
                  (attr === 'forca' && char.tipoAtaque === 'distancia')
                const val = isBlocked ? 0 : (char[attr] || 0)
                const minVal = attr === 'res' ? 1 : 0
                return (
                  <div key={attr} className="p1-attr-row">
                    <span className={`p1-attr-name ${attr}`}>{t(`prototype.arena_testbed.attr_${attr}`)}</span>
                    <div className="p1-attr-controls">
                      <button className="p1-btn-small"
                        disabled={val <= minVal || isBlocked}
                        onClick={() => updateAttr(idx, attr, -1)}>−</button>
                      <span className={`p1-attr-val ${isBlocked ? 'blocked' : ''}`}>{val}</span>
                      <button className="p1-btn-small"
                        disabled={isBlocked || restantes <= 0}
                        onClick={() => updateAttr(idx, attr, +1)}>+</button>
                      <span className="p1-attr-tokens">({val}/{char.orcamento})</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <label className="p1-field">
              <span>{t('prototype.arena_testbed.equipment')}</span>
              <select value={char.equipamento} onChange={e => updateChar(idx, 'equipamento', e.target.value)}>
                <option value="nenhum">{t('prototype.arena_testbed.equip_none')}</option>
                <option value="ofensivo">{t('prototype.arena_testbed.equip_off')} (+2 FA)</option>
                <option value="defensivo">{t('prototype.arena_testbed.equip_def')} (+2 FD)</option>
                <option value="ambos">{t('prototype.arena_testbed.equip_both')}</option>
              </select>
            </label>

            <div className="p1-items">
              <span className="p1-items-label">{t('prototype.arena_testbed.inventory')}</span>
              <label className="p1-item-row">
                <span>{t('prototype.arena_testbed.potion_hp')} (+5)</span>
                <div className="p1-attr-controls">
                  <button className="p1-btn-small" disabled={char.pocaoHP <= 0}
                    onClick={() => updateChar(idx, 'pocaoHP', Math.max(0, char.pocaoHP - 1))}>−</button>
                  <span className="p1-attr-val">{char.pocaoHP}</span>
                  <button className="p1-btn-small" disabled={char.pocaoHP >= 5}
                    onClick={() => updateChar(idx, 'pocaoHP', char.pocaoHP + 1)}>+</button>
                </div>
              </label>
              <label className="p1-item-row">
                <span>{t('prototype.arena_testbed.potion_mp')} (+5)</span>
                <div className="p1-attr-controls">
                  <button className="p1-btn-small" disabled={char.pocaoMP <= 0}
                    onClick={() => updateChar(idx, 'pocaoMP', Math.max(0, char.pocaoMP - 1))}>−</button>
                  <span className="p1-attr-val">{char.pocaoMP}</span>
                  <button className="p1-btn-small" disabled={char.pocaoMP >= 5}
                    onClick={() => updateChar(idx, 'pocaoMP', char.pocaoMP + 1)}>+</button>
                </div>
              </label>
            </div>

            <div className="p1-summary">
              <div className="p1-summary-row">
                <span className="p1-summary-label">HP</span>
                <span className="p1-summary-val hp">{getHP(char.res)}</span>
              </div>
              <div className="p1-summary-row">
                <span className="p1-summary-label">MP</span>
                <span className="p1-summary-val mp">{getMP(char.res)}</span>
              </div>
              <div className="p1-summary-row">
                <span className="p1-summary-label">{t('prototype.arena_testbed.move')}</span>
                <span className="p1-summary-val">{getCasasMovimento(char.agi)}</span>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {characters.length < 4 && (
        <button className="p1-btn p1-btn-secondary" onClick={addCharacter}>
          + {t('prototype.arena_testbed.add_char')}
        </button>
      )}

      <div className="p1-footer">
        {characters.length > 0 && characters.some(c => pontosRestantes(c) !== 0) && (
          <p className="p1-warning">{t('prototype.arena_testbed.budget_warning')}</p>
        )}

        {/* FIX 4: AGI movement toggle */}
        <label className="p1-agi-toggle">
          <input type="checkbox" checked={agiUmPraUm} onChange={e => onAgiToggle?.(e.target.checked)} />
          <span>{t('prototype.arena_testbed.agi_toggle_label')}</span>
        </label>

        <button className="p1-btn p1-btn-primary" disabled={!canProceed} onClick={handleConfirm}>
          {t('prototype.arena_testbed.next_board')} →
        </button>
      </div>
    </div>
  )
}
