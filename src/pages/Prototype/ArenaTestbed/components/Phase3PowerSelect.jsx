import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { PODERES_BASE } from '../data/poderes'
import './Phase3PowerSelect.css'

export default function Phase3PowerSelect({ characters, onConfirm, onBack }) {
  const { t } = useLanguage()

  const [selecoes, setSelecoes] = useState({})

  const togglePoder = (charId, poderId, limite) => {
    setSelecoes(prev => {
      const atual = prev[charId] || []
      if (atual.includes(poderId)) {
        return { ...prev, [charId]: atual.filter(id => id !== poderId) }
      }
      if (atual.length >= limite) return prev
      return { ...prev, [charId]: [...atual, poderId] }
    })
  }

  const handleConfirm = () => {
    onConfirm(selecoes)
  }

  const todosConfirmados = characters.every(ch => {
    const limite = Math.min(ch.res || 1, 4)
    return (selecoes[ch.id] || []).length <= limite
  })

  return (
    <div className="tab-power-select">
      <div className="tab-power-select-header">
        <h2>{t('prototype.arena_testbed.power_title')}</h2>
        <p className="tab-power-select-subtitle">{t('prototype.arena_testbed.power_subtitle')}</p>
      </div>

      <div className="tab-power-select-chars">
        {characters.map(ch => {
          const limite = Math.min(ch.res || 1, 4)
          const escolhidos = selecoes[ch.id] || []
          return (
            <div key={ch.id} className="tab-power-char-card">
              <div className="tab-power-char-head">
                <span className={`tab-power-char-dot ${ch.time}`} />
                <span className="tab-power-char-name">{ch.nome}</span>
                <span className="tab-power-char-limit">
                  {t('prototype.arena_testbed.power_limit', { n: escolhidos.length, max: limite })}
                </span>
              </div>
              <div className="tab-power-grid">
                {PODERES_BASE.filter(poder => {
                  const tipoChar = ch.tipoAtaque === 'melee' ? 'forca' : 'pdf'
                  return poder.tipoPersonagem === 'universal' || poder.tipoPersonagem === tipoChar
                }).map(poder => {
                  const selected = escolhidos.includes(poder.id)
                  const atLimit = escolhidos.length >= limite && !selected
                  return (
                    <button
                      key={poder.id}
                      className={`tab-power-btn ${selected ? 'selected' : ''} ${atLimit ? 'disabled' : ''}`}
                      onClick={() => togglePoder(ch.id, poder.id, limite)}
                      disabled={atLimit}
                    >
                      <span className="tab-power-btn-nome">{t('prototype.arena_testbed.' + poder.chaveI18n)}</span>
                      <span className="tab-power-btn-mp">-{poder.custoMP} MP</span>
                      <span className="tab-power-btn-gatilho">
                        {poder.gatilho === 'ataque'
                          ? t('prototype.arena_testbed.power_trigger_attack')
                          : t('prototype.arena_testbed.power_trigger_defense')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="tab-power-select-footer">
        <button className="tab-power-btn-back" onClick={onBack}>
          {t('prototype.arena_testbed.back')}
        </button>
        <button className="tab-power-btn-confirm" onClick={handleConfirm}>
          {t('prototype.arena_testbed.start_match')}
        </button>
      </div>
    </div>
  )
}