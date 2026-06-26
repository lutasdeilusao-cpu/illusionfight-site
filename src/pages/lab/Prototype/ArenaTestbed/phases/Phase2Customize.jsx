import { useState, useEffect } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { podeAdicionarPersonagemABatalha, getCoresDisponiveis, getNomesDisponiveis } from '../engine/regrasFicha'
import { audio } from '../engine/audioManager'
import './Phase2Customize.css'

const ICONES = ['circle', 'square', 'diamond']

export default function Phase2Customize({ personagens, onConfirm, onBack }) {
  const { t } = useLanguage()
  const [chars, setChars] = useState([])

  useEffect(() => {
    const maxPersonagens = 3
    const jogadores = personagens.filter(c => c.time === 'jogador')
    const ias = personagens.filter(c => c.time === 'ia')
    const selecionados = jogadores.slice(0, maxPersonagens)
    setChars(selecionados.map((c, i) => ({
      ...c,
      aparencia: c.aparencia || {
        cor: ['#00ff88', '#4488ff', '#ffcc00'][i],
        icone: ICONES[i],
        nome: ['Kim', 'Jack', 'Nina'][i],
      },
    })))
  }, [personagens])

  function updateChar(idx, campo, valor) {
    setChars(prev => prev.map((c, i) => i === idx ? { ...c, aparencia: { ...c.aparencia, [campo]: valor } } : c))
  }

  function confirmar() {
    const personagensCompletos = [
      ...chars,
      ...personagens.filter(c => c.time === 'ia'),
    ]
    onConfirm(personagensCompletos)
  }

  return (
    <div className="p2-root">
      <div className="p2-header">
        <h2>{t('prototype.arena_testbed.p2_title')}</h2>
        <p className="p2-subtitle">{t('prototype.arena_testbed.p2_subtitle')}</p>
      </div>

      <div className="p2-lista">
        {chars.map((ch, idx) => {
          const coresDisponiveis = getCoresDisponiveis(chars.filter((_, i) => i !== idx))
          const nomesDisponiveis = getNomesDisponiveis(chars.filter((_, i) => i !== idx))
          return (
            <div key={idx} className="p2-card">
              <div className="p2-card-header">
                <div className="p2-card-num">{t('prototype.arena_testbed.p2_jogador')} {idx + 1}</div>
                <div className="p2-card-type">{ch.tipoAtaque === 'melee' ? t('prototype.arena_testbed.attr_forca') : 'PDF'}</div>
              </div>

              <div className="p2-field">
                <div className="p2-label">{t('prototype.arena_testbed.p2_cor')}</div>
                <div className="p2-cores">
                  {['#00ff88', '#4488ff', '#ffcc00'].map(cor => {
                    const ocupada = !coresDisponiveis.includes(cor) && ch.aparencia?.cor !== cor
                    return (
                    <button
                      key={cor}
                      className={`p2-cor-btn ${ch.aparencia?.cor === cor ? 'p2-cor-btn--sel' : ''}`}
                      style={{ '--cor': cor }}
                      onClick={() => { audio.select(); updateChar(idx, 'cor', cor) }}
                      disabled={ocupada}
                    />
                    )
                  })}
                </div>
              </div>

              <div className="p2-field">
                <div className="p2-label">{t('prototype.arena_testbed.p2_icone')}</div>
                <div className="p2-icones">
                  {ICONES.map(ico => (
                    <button
                      key={ico}
                      className={`p2-ico-btn ${ch.aparencia?.icone === ico ? 'p2-ico-btn--sel' : ''}`}
                      onClick={() => { audio.select(); updateChar(idx, 'icone', ico) }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ch.aparencia?.cor || '#00ff88'} strokeWidth="2">
                        {ico === 'circle' && <circle cx="12" cy="12" r="8" />}
                        {ico === 'square' && <rect x="5" y="5" width="14" height="14" />}
                        {ico === 'diamond' && <polygon points="12,4 20,12 12,20 4,12" />}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p2-field">
                <div className="p2-label">{t('prototype.arena_testbed.p2_nome')}</div>
                <div className="p2-nomes">
                  {['Kim', 'Jack', 'Nina'].map(nome => {
                    const ocupado = !nomesDisponiveis.includes(nome) && ch.aparencia?.nome !== nome
                    return (
                      <button
                        key={nome}
                        className={`p2-nome-btn ${ch.aparencia?.nome === nome ? 'p2-nome-btn--sel' : ''}`}
                        onClick={() => { audio.select(); updateChar(idx, 'nome', nome) }}
                        disabled={ocupado}
                      >
                        {nome}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p2-footer">
        <button className="p2-btn p2-btn--back" onClick={() => { audio.cancel(); onBack() }}>
          {t('prototype.arena_testbed.back')}
        </button>
        <button className="p2-btn p2-btn--confirm" onClick={() => { audio.confirm(); confirmar() }}>
          {t('prototype.arena_testbed.p2_confirm')}
        </button>
      </div>
    </div>
  )
}
