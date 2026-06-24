// [DEBUG] Phase5bAnimDebug — seleção de animações por personagem
// Esta phase é exclusivamente para testes internos.
// NÃO incluir no build de produção para usuários finais.

import { useState } from 'react'
import { MovementAnimId } from '../engine/animations/movement/index'
import { AttackAnimId, RangeAnimId } from '../engine/animations/attack/index'
import './Phase5bAnimDebug.css'

const TIPOS_ANIMACAO = ['movimento', 'ataqueMelee', 'ataqueRange', 'defesa', 'habilidade', 'efeito']
const OPCOES = [1, 2, 3]

export default function Phase5bAnimDebug({ boardChars, onConfirmar, onBack }) {
  const [animacoes, setAnimacoes] = useState(() => {
    const map = {}
    boardChars.forEach(bc => {
      const id = bc.charData?.id || bc.id
      map[id] = {
        movimento: 1,
        ataqueMelee: 1,
        ataqueRange: 1,
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

  function getAnimIdEnum(tipo) {
    if (tipo === 'movimento') return MovementAnimId
    if (tipo === 'ataqueMelee') return AttackAnimId
    if (tipo === 'ataqueRange') return RangeAnimId
    return null
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
                {TIPOS_ANIMACAO.map(tipo => {
                  const enumObj = getAnimIdEnum(tipo)
                  return (
                    <div key={tipo} className="tab-anim-debug-row">
                      <span className="tab-anim-debug-label">
                        {tipo === 'ataqueMelee' ? 'Attack Melee' :
                         tipo === 'ataqueRange' ? 'Attack Range' :
                         tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </span>
                      <div className="tab-anim-debug-btns">
                        {enumObj ? (
                          Object.entries(enumObj).map(([name, animId]) => (
                            <button
                              key={animId}
                              className={`tab-anim-debug-btn ${chAnim?.[tipo] === animId ? 'active' : ''}`}
                              onClick={() => setAnim(id, tipo, animId)}
                            >
                              {animId}
                            </button>
                          ))
                        ) : (
                          OPCOES.map(val => (
                            <button
                              key={val}
                              className={`tab-anim-debug-btn ${chAnim?.[tipo] === val ? 'active' : ''}`}
                              onClick={() => setAnim(id, tipo, val)}
                            >
                              {val}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
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
