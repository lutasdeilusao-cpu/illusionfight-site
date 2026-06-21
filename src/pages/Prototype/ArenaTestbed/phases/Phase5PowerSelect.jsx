import { useState, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { PODERES_BASE } from '../data/poderes'
import PowerFilterBar from '../components/power-selection/PowerFilterBar'
import PowerGrid from '../components/power-selection/PowerGrid'
import './Phase5PowerSelect.css'

export default function Phase5PowerSelect({ characters, onConfirm, onBack, modoJogo }) {
  const { t } = useLanguage()
  const [selecoes, setSelecoes] = useState({})
  const [expandido, setExpandido] = useState(null)
  const [filtroElemento, setFiltroElemento] = useState(null)
  const [ordenacao, setOrdenacao] = useState(null)
  const [sortDir, setSortDir] = useState('crescente')

  // TODO: quando ModoJogo.CAMPANHA existir de verdade, filtrar characters
  // para esconder time === 'ia' aqui. Hoje não faz nada — Campanha não está
  // disponível para o jogador escolher ainda.

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

  function toggleExpandir(charId) {
    setExpandido(prev => prev === charId ? null : charId)
  }

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
          const isExpanded = expandido === ch.id
          const tipoChar = ch.tipoAtaque === 'melee' ? 'forca' : 'pdf'

          const poderesFiltrados = useMemo(() => {
            if (!isExpanded) return []
            let lista = PODERES_BASE.filter(p => {
              if (p.tipoPersonagem !== 'universal' && p.tipoPersonagem !== tipoChar) return false
              if (filtroElemento !== null && p.elemento !== filtroElemento) return false
              return true
            })

            if (ordenacao === 'fa') {
              lista.sort((a, b) => {
                const va = a.valorComparativo?.fa ?? -1
                const vb = b.valorComparativo?.fa ?? -1
                return sortDir === 'crescente' ? va - vb : vb - va
              })
            } else if (ordenacao === 'fd') {
              lista.sort((a, b) => {
                const va = a.valorComparativo?.fd ?? -1
                const vb = b.valorComparativo?.fd ?? -1
                return sortDir === 'crescente' ? va - vb : vb - va
              })
            } else if (ordenacao === 'az') {
              lista.sort((a, b) => {
                const na = t('prototype.arena_testbed.' + a.chaveI18n)
                const nb = t('prototype.arena_testbed.' + b.chaveI18n)
                return na.localeCompare(nb)
              })
            }

            return lista
          }, [isExpanded, filtroElemento, ordenacao, sortDir, tipoChar, t])

          return (
            <div key={ch.id} className={`tab-power-char-card ${isExpanded ? 'tab-power-char-card--expanded' : ''}`}>
              <button className="tab-power-char-head" onClick={() => toggleExpandir(ch.id)}>
                <span className={`tab-power-char-dot ${ch.time}`} />
                <span className="tab-power-char-name">{ch.nome}</span>
                <span className="tab-power-char-limit">
                  {t('prototype.arena_testbed.power_limit', { n: escolhidos.length, max: limite })}
                </span>
                <span className="tab-power-chevron">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <>
                  <PowerFilterBar
                    filtroElemento={filtroElemento}
                    setFiltroElemento={setFiltroElemento}
                    ordenacao={ordenacao}
                    setOrdenacao={setOrdenacao}
                    sortDir={sortDir}
                    setSortDir={setSortDir}
                  />
                  <PowerGrid
                    poderes={poderesFiltrados}
                    selecoes={escolhidos}
                    limite={limite}
                    charId={ch.id}
                    onToggle={togglePoder}
                  />
                </>
              )}
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
