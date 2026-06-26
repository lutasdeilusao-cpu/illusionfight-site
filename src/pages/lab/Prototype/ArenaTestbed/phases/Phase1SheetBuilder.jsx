import { useState, useMemo } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { getHP, getMP, getCasasMovimento, criarPersonagem } from '../engine/combat'
import { PERSONALIDADES_IA } from '../engine/ai/personalidades/index'
import { audio } from '../engine/audioManager'
import './Phase1SheetBuilder.css'

const ATTRIBUTES = ['forca', 'agi', 'dex', 'pdf', 'res', 'arm']
const BUDGET_OPTIONS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]

export default function Phase1SheetBuilder({ onConfirm }) {
  const { t } = useLanguage()
  const [characters, setCharacters] = useState([])
  const [editing, setEditing] = useState(null)

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
          personalidadeId: 'sanguinaria',
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
    if (field === 'time') {
      const mesmoTime = updated.filter(c => c.time === value)
      updated[idx].nome = gerarNomeAutomatico(value, updated.filter((_, i) => i !== idx))
    }
    setCharacters(updated)
  }

  function pontosRestantes(char) {
    const gastos = ATTRIBUTES.reduce((sum, attr) => sum + (char[attr] || 0), 0)
    return char.orcamento - gastos
  }

  function updateAttr(idx, attr, delta) {
    const updated = [...characters]
    const char = updated[idx]
    const newVal = (char[attr] || 0) + delta

    const minVal = attr === 'res' ? 1 : 0
    if (newVal < minVal) return

    if (attr === 'pdf' && char.tipoAtaque === 'melee') return
    if (attr === 'forca' && char.tipoAtaque === 'distancia') return

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
      const base = criarPersonagem(
        c.nome, c.time, c.tipoAtaque,
        c.forca, c.agi, c.dex, c.pdf, c.res, c.arm,
        c.equipamento, c.pocaoHP, c.pocaoMP
      )
      if (c.time === 'ia') {
        base.personalidadeId = c.personalidadeId || 'sanguinaria'
      }
      return base
    })
    onConfirm(finalChars, true)
  }

  return (
    <div className="p1-root">
      <div className="p1-header">
        <h3>CONSTRUÃ‡ÃƒO DE FICHAS</h3>
      </div>

      <div className="p1-chars">
        {characters.map((char, idx) => {
          const restantes = pontosRestantes(char)
          return (
          <div key={char.id} className={`p1-card ${editing === idx ? 'editing' : ''}`}>
            <div className="p1-card-header">
              <span className="p1-char-num">
                {char.nome}
              </span>
              <button
                className="p1-btn-remove"
                onClick={() => { audio.cancel(); removeCharacter(idx) }}
              >âœ•</button>
            </div>

            <label className="p1-field">
              <span>TIME</span>
              <select value={char.time} onChange={e => updateChar(idx, 'time', e.target.value)}>
                <option value="jogador">JOGADOR</option>
                <option value="ia">IA</option>
              </select>
            </label>

            {char.time === 'ia' && (
              <label className="p1-field">
                <span>{t('prototype.arena_testbed.ia_personalidade_label')}</span>
                <select value={char.personalidadeId || 'sanguinaria'} onChange={e => updateChar(idx, 'personalidadeId', e.target.value)}>
                  {PERSONALIDADES_IA.map(p => (
                    <option key={p.id} value={p.id}>{t('prototype.arena_testbed.' + p.chaveI18n)}</option>
                  ))}
                </select>
              </label>
            )}

            <div className="p1-toggle-group">
              <button
                className={`p1-toggle-btn ${char.tipoAtaque === 'melee' ? 'melee-active' : ''}`}
                onClick={() => { audio.toggle(); updateChar(idx, 'tipoAtaque', 'melee') }}
              >
                âš” CORPO A CORPO
              </button>
              <button
                className={`p1-toggle-btn ${char.tipoAtaque === 'distancia' ? 'distance-active' : ''}`}
                onClick={() => { audio.toggle(); updateChar(idx, 'tipoAtaque', 'distancia') }}
              >
                â—Ž DISTÃ‚NCIA
              </button>
            </div>

            <div className="p1-budget">
              <div className="p1-budget-row">
                  {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b}
                    className={`p1-budget-chip ${char.orcamento === b ? 'active' : ''}`}
                    onClick={() => { audio.select(); updateChar(idx, 'orcamento', b) }}
                  >{b}</button>
                ))}
              </div>
              <div className={`p1-budget-counter ${restantes === 0 ? 'zero' : restantes < 0 ? 'neg' : 'pos'}`}>
                PONTOS: {restantes} / {char.orcamento}
              </div>
            </div>

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
                        onClick={() => { audio.click(); updateAttr(idx, attr, -1) }}>âˆ’</button>
                      <span className={`p1-attr-val ${isBlocked ? 'blocked' : ''}`}>{val}</span>
                      <button className="p1-btn-small"
                        disabled={isBlocked || restantes <= 0}
                        onClick={() => { audio.click(); updateAttr(idx, attr, +1) }}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p1-equip">
              <label className="p1-field">
                <span>EQUIPAMENTO</span>
                <select value={char.equipamento} onChange={e => updateChar(idx, 'equipamento', e.target.value)}>
                  <option value="nenhum">NENHUM</option>
                  <option value="ofensivo">OFENSIVO (+2 FA)</option>
                  <option value="defensivo">DEFENSIVO (+2 FD)</option>
                  <option value="ambos">AMBOS</option>
                </select>
              </label>
            </div>

              <div className="p1-items">
              <div className="p1-item-row">
                <span>â¤ HP</span>
                <button className="p1-btn-small" disabled={char.pocaoHP <= 0}
                  onClick={() => { audio.click(); updateChar(idx, 'pocaoHP', Math.max(0, char.pocaoHP - 1)) }}>âˆ’</button>
                <span className="p1-attr-val">Ã—{char.pocaoHP}</span>
                <button className="p1-btn-small" disabled={char.pocaoHP >= 5}
                  onClick={() => { audio.click(); updateChar(idx, 'pocaoHP', char.pocaoHP + 1) }}>+</button>
              </div>
              <div className="p1-item-row">
                <span>ðŸ’§ MP</span>
                <button className="p1-btn-small" disabled={char.pocaoMP <= 0}
                  onClick={() => { audio.click(); updateChar(idx, 'pocaoMP', Math.max(0, char.pocaoMP - 1)) }}>âˆ’</button>
                <span className="p1-attr-val">Ã—{char.pocaoMP}</span>
                <button className="p1-btn-small" disabled={char.pocaoMP >= 5}
                  onClick={() => { audio.click(); updateChar(idx, 'pocaoMP', char.pocaoMP + 1) }}>+</button>
              </div>
            </div>

            <div className="p1-summary">
              <span className="p1-summary-chip hp">HP {getHP(char.res)}</span>
              <span className="p1-summary-chip mp">MP {getMP(char.res)}</span>
              <span className="p1-summary-chip mov">MOV {getCasasMovimento(char.agi)}</span>
            </div>
          </div>
          )
        })}
      </div>

      {characters.length < 4 && (
        <button className="p1-add-btn" onClick={() => { audio.toggle(); addCharacter() }}>
          + NOVO COMBATENTE
        </button>
      )}

      <div className="p1-footer">
        {characters.length > 0 && characters.some(c => pontosRestantes(c) !== 0) && (
          <p className="p1-warning">DISTRIBUA TODOS OS PONTOS DE ATRIBUTO</p>
        )}

        <button className="p1-btn-primary" disabled={!canProceed} onClick={() => { audio.confirm(); handleConfirm() }}>
          â–¶ MONTAR TABULEIRO
        </button>
      </div>
    </div>
  )
}
