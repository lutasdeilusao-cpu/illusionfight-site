import { useState } from 'react'
import './Phase5bAnimDebug.css'

const TIPOS_ANIMACAO = ['movimento', 'ataque', 'defesa', 'habilidade', 'efeito']
const OPCOES = [1, 2, 3]

export default function Phase5bAnimDebug({ boardChars, onConfirmar, onBack }) {
  const [animacoes, setAnimacoes] = useState(() => {
    const map = {}
    boardChars.forEach(bc => {
      const id = bc.charData?.id || bc.id
      map[id] = {
        movimento: 1,
        ataque: 1,
        defesa: 1,
        habilidade: 1,
        efeito: 1,
      }
    })
    return map
  })

  function setAnim(charId, tipo, valor) {
    setAnimacoes(prev => ({
      ...prev,
      [charId]: { ...prev[charId], [tipo]: valor },
    }))
  }

  return (
    <div className="tab-anim-debug">
      <div className="tab-anim-debug-header">
        <span className="tab-anim-debug-badge">[DEBUG]</span>
        <h2>Animações de Teste</h2>
        <p className="tab-anim-debug-subtitle">
          Selecione o ID da animação para cada personagem.
          Exclusivo para testes internos.
        </p>
      </div>

      <div className="tab-anim-debug-chars">
        {boardChars.map(bc => {
          const charData = bc.charData || bc
          const id = charData.id
          const nome = charData.aparencia?.nome || charData.nome || '?'
          const time = bc.time || charData.time || 'jogador'
          const cor = charData.aparencia?.cor || (time === 'jogador' ? 'var(--color-team-jogador)' : 'var(--color-team-ia)')
          const chAnim = animacoes[id]

          return (
            <div key={id} className="tab-anim-debug-card">
              <div className="tab-anim-debug-card-head">
                <span className="tab-anim-debug-dot" style={{ '--dot-color': cor }} />
                <span className="tab-anim-debug-name">{nome}</span>
                <span className={`tab-anim-debug-team ${time}`}>{time === 'jogador' ? 'Jogador' : 'IA'}</span>
              </div>

              <div className="tab-anim-debug-rows">
                {TIPOS_ANIMACAO.map(tipo => (
                  <div key={tipo} className="tab-anim-debug-row">
                    <span className="tab-anim-debug-label">{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
                    <div className="tab-anim-debug-btns">
                      {OPCOES.map(val => (
                        <button
                          key={val}
                          className={`tab-anim-debug-btn ${chAnim?.[tipo] === val ? 'active' : ''}`}
                          onClick={() => setAnim(id, tipo, val)}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="tab-anim-debug-footer">
        <button className="tab-anim-debug-btn-back" onClick={onBack}>
          Voltar
        </button>
        <button
          className="tab-anim-debug-btn-confirm"
          onClick={() => onConfirmar(animacoes)}
        >
          Iniciar Combate
        </button>
      </div>
    </div>
  )
}
