import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'

const ATTRS = ['F', 'H', 'R', 'A', 'PdF']
const ATTR_LABELS = { F: 'Força', H: 'Habilidade', R: 'Resistência', A: 'Armadura', PdF: 'Poder Elemental' }
const ATTR_EMOJI = { F: '💪', H: '🎯', R: '🛡️', A: '🦾', PdF: '✨' }

const elements = [
  { id: 'fogo', emoji: '🔥', label: 'Fogo' },
  { id: 'agua', emoji: '💧', label: 'Água' },
  { id: 'terra', emoji: '🪨', label: 'Terra' },
  { id: 'ar', emoji: '💨', label: 'Ar' },
  { id: 'trevas', emoji: '🌑', label: 'Trevas' },
  { id: 'luz', emoji: '✨', label: 'Luz' },
  { id: 'neutro', emoji: '⚪', label: 'Neutro' },
]

const advantages = [
  { label: 'Acrobata', cost: 1, desc: '+1 em testes de esquiva e movimentação. Custa 1 PM por uso.' },
  { label: 'Adaptador', cost: 1, desc: 'Ignora 1 de penalidade por ambiente desfavorável.' },
  { label: 'Afortunado', cost: 2, desc: 'Ganha +1 em rolagens de iniciativa.' },
  { label: 'Aliado', cost: 1, desc: 'Invoca aliado com Força 1 para auxiliar no combate.' },
  { label: 'Arcano', cost: 2, desc: '+1d no dano de poderes elementais. Custa 2 PM extra.' },
  { label: 'Arqueiro', cost: 2, desc: 'Pode realizar ataque à distância com 1d de dano. Arco obrigatório.' },
  { label: 'Bloqueio', cost: 1, desc: 'Declara bloqueio contra ataque físico; reduz dano em 1d.' },
  { label: 'Bombardeiro', cost: 1, desc: '+1d em ataques com armas de pólvora.' },
  { label: 'Boxe', cost: 1, desc: '+1d nos ataques desarmados quando em guarda.' },
  { label: 'Camuflagem', cost: 1, desc: '+1 em furtividade quando em terreno favorável.' },
  { label: 'Carismático', cost: 1, desc: '+1 em interações sociais no pré-combate.' },
  { label: 'Contra-ataque', cost: 2, desc: 'Após ser atingido, pode contra-atacar com 1d.' },
  { label: 'Determinado', cost: 1, desc: 'Quando abaixo de metade do PV, +1 em ataque e defesa.' },
  { label: 'Duas Armas', cost: 2, desc: '+1 ataque extra com mão secundária, com -1 na rolagem.' },
  { label: 'Esquiva', cost: 1, desc: '+1 na FD (Fator de Defesa) contra ataques diretos.' },
  { label: 'Evocação', cost: 2, desc: 'Permite invocar criatura elemental de PdF 1.' },
  { label: 'Fúria', cost: 2, desc: 'Gasta 3 PM para +2 de Força por 3 rodadas.' },
  { label: 'Imunidade', cost: 4, desc: 'Imune a venenos e doenças inferiores ao seu R.' },
  { label: 'Intuição', cost: 1, desc: '+1 em testes de percepção de armadilhas e emboscadas.' },
  { label: 'Liderança', cost: 2, desc: '+1 para aliados em até 3m enquanto estiver visível.' },
  { label: 'Medicina', cost: 1, desc: 'Cura 1 PV por rodada em aliado adjacente.' },
  { label: 'Mira Letal', cost: 2, desc: 'Gasta 1 rodada mirando para +1d no ataque seguinte.' },
  { label: 'Parkour', cost: 1, desc: 'Ignora penalidade de terreno por 3 rodadas.' },
  { label: 'Reflexos', cost: 1, desc: '+1 na iniciativa e em testes de reação.' },
  { label: 'Regeneração', cost: 3, desc: 'Cura 1 PV por rodada enquanto estiver em combate.' },
  { label: 'Sentidos', cost: 1, desc: '+1 em testes de percepção sensorial.' },
  { label: 'Sorte', cost: 1, desc: 'Ganha 3 PM extras no início do combate.' },
  { label: 'Técnica', cost: 2, desc: 'Saca, guarda e ataca no mesmo turno sem penalidade.' },
  { label: 'Velocista', cost: 1, desc: '+2 em testes de corrida e deslocamento.' },
  { label: 'Veterano', cost: 2, desc: '+1 em rolagens críticas (15+).'},
  { label: 'Vigor', cost: 1, desc: 'Não sofre penalidade por ferimentos leves.' },
]

const disadvantages = [
  { label: 'Azarado', gain: 1, desc: 'Rola 1 dado a menos em testes de sorte.' },
  { label: 'Código', gain: 1, desc: 'Não pode atacar inimigos desarmados ou de costas.' },
  { label: 'Dependência', gain: 1, desc: 'Perde 1 PV por rodada se não consumir item.' },
  { label: 'Doença', gain: 2, desc: 'PV máximo reduzido em 2 permanentemente.' },
  { label: 'Fobia', gain: 1, desc: 'Se falhar teste de Habilidade, perde a ação.' },
  { label: 'Franzino', gain: 1, desc: 'Força reduzida em 1 para dano físico.' },
  { label: 'Honra', gain: 1, desc: 'Não ataca primeiro; sempre deixa o oponente agir.' },
  { label: 'Idade', gain: 2, desc: 'Habilidade reduzida em 1; experiência dá +1 XP por vitória.' },
  { label: 'Insone', gain: 1, desc: 'Recupera metade do PM entre combates.' },
  { label: 'Lento', gain: 1, desc: 'Age por último em empates de iniciativa.' },
  { label: 'Manco', gain: 1, desc: 'Movimento reduzido pela metade.' },
  { label: 'Medroso', gain: 1, desc: 'Se falhar teste de Fuga, perde a ação.' },
  { label: 'Orgulhoso', gain: 1, desc: 'Nunca recusa um duelo ou provocação.' },
  { label: 'Pobre', gain: 1, desc: 'Não pode comprar itens entre combates.' },
  { label: 'Sedento', gain: 1, desc: 'Gasta 1 PM extra por poder usado.' },
  { label: 'Sensível', gain: 1, desc: '+1d de dano recebido do elemento oposto.' },
  { label: 'Surdez', gain: 1, desc: '-1 em testes de percepção auditiva.' },
  { label: 'Teimoso', gain: 1, desc: 'Não pode mudar de tática uma vez declarada.' },
  { label: 'Vício', gain: 1, desc: 'Perde 1 PV após cada vitória.' },
  { label: 'Xingado', gain: 1, desc: '+1d de dano recebido se o inimigo gritar seu nome.' },
]

const perks = [
  { label: 'Chama Interior', cost: 1, desc: 'PdF +1 por 2 rodadas, custa 3 PM.' },
  { label: 'Presença Imponente', cost: 1, desc: 'Inimigo perde 1 em ataque por 1 rodada. Custa 2 PM.' },
  { label: 'Marca do Destino', cost: 1, desc: 'Se derrotado, o inimigo perde 3 PV extras.' },
  { label: 'Sopro Vital', cost: 1, desc: 'Ganha 2 PV extras por rodada por 3 rodadas.' },
  { label: 'Olhar Silencioso', cost: 1, desc: 'Ignora 1 ataque surpresa do inimigo.' },
  { label: 'Passo Sombrio', cost: 1, desc: 'Revela-se após 1 rodada de invisibilidade parcial de trevas.' },
]

const specializations = [
  'Combate corpo a corpo', 'Combate à distância', 'Armas de fogo', 'Armas brancas',
  'Manipulação elemental', 'Furtividade', 'Persuasão', 'Investigação', 'Sobrevivência', 'Primeiros socorros',
]

const MANUAL_SECTIONS = [
  {
    id: 'fundamentos',
    titulo: 'Fundamentos',
    conteudo: 'O LDI é um sistema de combate virtual onde a dor é real.\nTrês bilhões de jogadores disputam posição no ranking SDR.\nCada lutador escolhe um elemental primário que define seus poderes.',
  },
  {
    id: 'atributos',
    titulo: 'Atributos',
    tabela: [
      ['F — Potência', 'Dano corpo a corpo'],
      ['H — Agilidade', 'Iniciativa, esquiva, velocidade'],
      ['R — Resistência', 'PV e PM base'],
      ['A — Proteção', 'Absorção de dano, defesa passiva'],
      ['PdF — Poder Elemental', 'Dano e força dos ataques elementais'],
    ],
    extra: 'Escala: 0 = comum | 1 = praticante | 2 = experiente | 3 = veterano | 4 = elite | 5 = topo absoluto\nPV = R × 5 | PM = PdF × 5',
  },
  {
    id: 'combate',
    titulo: 'Sistema de Batalha',
    conteudo: 'INICIATIVA: H + 1d6 — maior age primeiro\n\nFA (Corpo a Corpo): F + H + 1d6\nFA (Elemental): PdF + H + 1d6\n\nFD (Normal): A + H + 1d6\nFD (Indefeso): A + 1d6\n\nDANO: FA − FD (mínimo 0)\nCRÍTICO: dado = 6 → dobra F, PdF ou A',
  },
  {
    id: 'elementais',
    titulo: 'Os 7 Elementais',
    tabela: [
      ['🔥 Fogo', 'Explosivo, agressivo. Alto dano, pressão constante'],
      ['💧 Água', 'Fluido, adaptável. Controle, cura, versatilidade'],
      ['🪨 Terra', 'Sólido, resistente. Defesa, atordoamento, sustentação'],
      ['💨 Ar', 'Veloz, esquivo. Iniciativa, evasão, mobilidade'],
      ['🌑 Trevas', 'Corrosivo, drenante. Absorção, debuff, enfraquecimento'],
      ['✨ Luz', 'Purificador, protetor. Cura, proteção, cegueira'],
      ['⚪ Neutro', 'Equilibrado. Versátil, sem fraquezas, sem picos'],
    ],
  },
  {
    id: 'vantagens',
    titulo: 'Vantagens e Desvantagens',
    conteudo: 'Vantagens custam pontos de personagem e representam técnicas e poderes especiais.\nDesvantagens concedem pontos extras mas impõem restrições reais.\n\nExemplos de vantagens: Aceleração, Ataque Especial, Cura, Deflexão, Invisível, Paralisia, Regeneração, Teleporte...\n\nO saldo final deve ser zero: custo das vantagens = ganho das desvantagens.',
  },
  {
    id: 'poderes',
    titulo: 'Poderes Elementais',
    conteudo: 'Antes de cada batalha você seleciona poderes do seu elemental.\nLimite de poderes equipados: H + 1 (máximo 5).\n\nPoderes custam PM para ativar. Cada elemental tem 6 poderes disponíveis.\nExemplo (Fogo): Chama Rápida (2 PM, +2 PdF) | Inferno (3 PM, PdF×2) | Escudo de Fogo (2 PM, +2 A)...',
  },
  {
    id: 'pericia',
    titulo: 'Perícias',
    conteudo: 'Perícias custam 1 ponto e representam treinamento especializado.\n\nEspecialização em Arma: +1 FA com a arma escolhida\nEspecialização Elemental: −1 PM em todos os poderes do seu elemental\nCombate Defensivo: troca até 2 FA por 2 FD a cada turno\nGolpe Pesado: +2 de dano quando FA − FD ≥ 5\nSobrevivência: uma vez por batalha, fica com 1 PV em vez de ir a 0',
  },
  {
    id: 'xp',
    titulo: 'XP e Evolução',
    conteudo: 'Vitória em batalha justa: +10 XP\nDerrota em batalha justa: +1 XP\n\nA cada 100 XP: 1 ponto de personagem para gastar em atributo ou vantagem.\nAtributos acima de 5 têm custo progressivo.',
  },
]

function ManualBatalha() {
  const [aberta, setAberta] = useState(null)
  return (
    <div className="arena-manual-sections">
      {MANUAL_SECTIONS.map(sec => (
        <div key={sec.id} className="arena-manual-section">
          <button
            className={`arena-manual-section-btn ${aberta === sec.id ? 'arena-manual-section-btn--open' : ''}`}
            onClick={() => setAberta(aberta === sec.id ? null : sec.id)}
          >
            {sec.titulo}
            <span className="arena-manual-section-arrow">{aberta === sec.id ? '▲' : '▼'}</span>
          </button>
          {aberta === sec.id && (
            <div className="arena-manual-section-body">
              {sec.conteudo && (
                <pre className="arena-manual-pre">{sec.conteudo}</pre>
              )}
              {sec.tabela && (
                <table className="arena-manual-table">
                  <tbody>
                    {sec.tabela.map((row, i) => (
                      <tr key={i}>
                        <td className="arena-manual-td-key">{row[0]}</td>
                        <td className="arena-manual-td-val">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.extra && (
                <pre className="arena-manual-pre arena-manual-pre--extra">{sec.extra}</pre>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ArenaCreate({ onNavigate }) {
  const { user } = useAuth()
  const store = useArenaStore()
  const [step, setStep] = useState('intro')
  const [errors, setErrors] = useState({})
  const [manualOpen, setManualOpen] = useState(false)

  const s = store.sheet
  const attrs = s.attributes
  const points = store.points_available

  const validateStep = () => {
    const e = {}
    if (step === 'attrs') {
      if (points > 0) e.points = 'Você ainda tem pontos para distribuir!'
    }
    if (step === 'sheet_name') {
      if (!s.sheet_name?.trim()) e.name = 'Dê um nome para sua ficha.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAttrChange = (attr, delta) => {
    if (delta > 0 && points <= 0) return
    if (delta < 0 && attrs[attr] <= 0) return
    const newVal = attrs[attr] + delta
    if (newVal > 5) return
    store.updateSheet({ attributes: { ...attrs, [attr]: newVal } })
    if (delta > 0) store.spendPoints(1)
    else store.gainPoints(1)
  }

  const toggleFromList = (key, item) => {
    const list = s[key] || []
    const exists = list.find(x => x.label === item.label)
    let next
    if (exists) next = list.filter(x => x.label !== item.label)
    else next = [...list, item]
    store.updateSheet({ [key]: next })
  }

  const costMap = (list) => list.reduce((sum, x) => sum + (x.cost || x.gain || 0), 0)
  const advantageCost = costMap(s.advantages || [])
  const disadvantageGain = costMap(s.disadvantages || [])
  const perkCost = costMap(s.perks || [])
  const totalPoints = advantageCost + perkCost - disadvantageGain

  const handleSalvarELutar = async () => {
    if (!s.sheet_name?.trim()) {
      setErrors({ name: 'Dê um nome para sua ficha.' })
      setStep('sheet_name')
      return
    }
    if (totalPoints > 0) {
      setErrors({ cost: 'Você ainda tem pontos sobrando! (vantagens + únicas superam desvantagens)' })
      return
    }
    if (totalPoints < 0) {
      setErrors({ cost: 'Você tem mais desvantagens que vantagens! Equilibre ou reduza.' })
      return
    }
    await store.saveToCloud(user?.id)
    onNavigate('lobby')
  }

  return (
    <div className="arena-create">

      {step !== 'intro' && (
        <div className="arena-create-header">
          <button className="arena-back" onClick={() => onNavigate('lobby')}>← lobby</button>
          <h2 className="arena-create-titulo">NOVA FICHA</h2>
          <div className="arena-create-steps">
            {['attrs','sheet_name','specs'].map((st, i) => (
              <div key={st} className={`arena-create-step-dot ${step === st ? 'arena-create-step-dot--active' : i < ['attrs','sheet_name','specs'].indexOf(step) ? 'arena-create-step-dot--done' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {/* Intro */}
      {step === 'intro' && (
        <div className="arena-create-intro">
          <div className="arena-lobby-hero" style={{ paddingTop: 48, marginBottom: 32 }}>
            <p className="arena-lobby-titulo">modo standalone</p>
            <h1 className="arena-lobby-nome" style={{ fontSize: 36 }}>NOVA FICHA</h1>
            <p className="arena-lobby-sub">você já conhece o sistema de batalha?</p>
          </div>
          <div className="arena-intro-cards">
            <div className="arena-intro-card" onClick={() => setManualOpen(true)}>
              <div className="arena-intro-card-icon">📖</div>
              <div className="arena-intro-card-titulo">LER O MANUAL</div>
              <div className="arena-intro-card-sub">aprenda o sistema antes de criar sua ficha. recomendado para iniciantes.</div>
            </div>
            <div className="arena-intro-card arena-intro-card--primary" onClick={() => setStep('attrs')}>
              <div className="arena-intro-card-icon">⚔️</div>
              <div className="arena-intro-card-titulo">CRIAR DIRETO</div>
              <div className="arena-intro-card-sub">já sei o que estou fazendo. vamos montar a ficha.</div>
            </div>
          </div>
          <p className="arena-intro-hint">
            💡 o manual fica sempre acessível pelo botão <strong>?</strong> durante a criação
          </p>
        </div>
      )}

      {/* Botão de ajuda flutuante */}
      {step !== 'intro' && (
        <button className="arena-manual-btn" onClick={() => setManualOpen(true)} title="Manual de Batalha">?</button>
      )}

      {/* Atributos */}
      {step === 'attrs' && (
        <div className="arena-step">
          <div className="arena-section-label">
            <span>▶ ATRIBUTOS</span>
            <span className="arena-pontos">Pontos: {points}</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-attr-grid">
            {ATTRS.map(attr => (
              <div key={attr} className="arena-attr-row">
                <span className="arena-attr-emoji">{ATTR_EMOJI[attr]}</span>
                <span className="arena-attr-name">{ATTR_LABELS[attr]}</span>
                <div className="arena-attr-num">{attrs[attr]}</div>
                <div className="arena-attr-btns">
                  <button className="arena-attr-minus" onClick={() => handleAttrChange(attr, -1)} disabled={attrs[attr] <= 0}>−</button>
                  <button className="arena-attr-plus" onClick={() => handleAttrChange(attr, 1)} disabled={attrs[attr] >= 5 || points <= 0}>+</button>
                </div>
              </div>
            ))}
          </div>
          {errors.points && <p className="arena-err">{errors.points}</p>}
          <div className="arena-steps-nav">
            <button className="arena-btn-nav" onClick={() => { if (validateStep()) setStep('sheet_name') }}>próximo →</button>
          </div>
        </div>
      )}

      {/* Nome + Elemental */}
      {step === 'sheet_name' && (
        <div className="arena-step">
          <div className="arena-section-label">
            <span>▶ IDENTIDADE</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-nome-wrap">
            <label>Nome da Ficha</label>
            <input className="arena-input" value={s.sheet_name || ''} onChange={e => { store.updateSheet({ sheet_name: e.target.value }); setErrors({}) }} placeholder="Ex: Kim, o Relâmpago..." />
            {errors.name && <p className="arena-err">{errors.name}</p>}
          </div>

          <div className="arena-section-label">
            <span>▶ ELEMENTAL</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-elemental-grid">
            {elements.map(el => (
              <div key={el.id} className={`arena-elemental-chip ${s.elemental === el.id ? 'arena-elemental-active' : ''}`}
                onClick={() => store.updateSheet({ elemental: el.id })}>
                {el.emoji} {el.label}
              </div>
            ))}
          </div>

          <div className="arena-section-label">
            <span>▶ ARMA</span>
            <div className="arena-section-linha" />
          </div>
          <input className="arena-input" value={s.weapon || ''} onChange={e => store.updateSheet({ weapon: e.target.value })} placeholder="Ex: katana, punhos, bastão..." />

          <div className="arena-steps-nav">
            <button className="arena-btn-nav-sair" onClick={() => setStep('attrs')}>← voltar</button>
            <button className="arena-btn-nav" onClick={() => { if (validateStep()) setStep('specs') }}>próximo →</button>
          </div>
        </div>
      )}

      {/* Specs */}
      {step === 'specs' && (
        <div className="arena-step">
          <div className="arena-section-label">
            <span>▶ PERÍCIAS</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-spec-grid">
            {specializations.map(spec => (
              <div key={spec} className={`arena-spec-chip ${(s.specializations || []).includes(spec) ? 'arena-spec-active' : ''}`}
                onClick={() => {
                  const list = s.specializations || []
                  store.updateSheet({ specializations: list.includes(spec) ? list.filter(x => x !== spec) : [...list, spec] })
                }}>
                {spec}
              </div>
            ))}
          </div>

          <div className="arena-section-label">
            <span>▶ VANTAGENS (custo: {advantageCost})</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-advantage-grid">
            {advantages.map(adv => {
              const has = (s.advantages || []).find(x => x.label === adv.label)
              return (
                <div key={adv.label} className={`arena-advantage-chip ${has ? 'arena-advantage-active' : ''}`}
                  onClick={() => toggleFromList('advantages', adv)}>
                  <span className="arena-adv-cost">{adv.cost} pts</span> {adv.label}
                  {has && <div className="arena-adv-desc">{adv.desc}</div>}
                </div>
              )
            })}
          </div>

          <div className="arena-section-label">
            <span>▶ DESVANTAGENS (ganho: {disadvantageGain})</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-advantage-grid">
            {disadvantages.map(dis => {
              const has = (s.disadvantages || []).find(x => x.label === dis.label)
              return (
                <div key={dis.label} className={`arena-advantage-chip arena-disadvantage ${has ? 'arena-disadvantage-active' : ''}`}
                  onClick={() => toggleFromList('disadvantages', dis)}>
                  <span className="arena-adv-cost">{dis.gain} pts</span> {dis.label}
                  {has && <div className="arena-adv-desc">{dis.desc}</div>}
                </div>
              )
            })}
          </div>

          <div className="arena-section-label">
            <span>▶ VANTAGENS ÚNICAS (custo: {perkCost})</span>
            <div className="arena-section-linha" />
          </div>
          <div className="arena-advantage-grid">
            {perks.map(p => {
              const has = (s.perks || []).find(x => x.label === p.label)
              return (
                <div key={p.label} className={`arena-advantage-chip ${has ? 'arena-advantage-active' : ''}`}
                  onClick={() => toggleFromList('perks', p)}>
                  <span className="arena-adv-cost">{p.cost} pts</span> {p.label}
                  {has && <div className="arena-adv-desc">{p.desc}</div>}
                </div>
              )
            })}
          </div>

          {errors.cost && <p className="arena-err">{errors.cost}</p>}
          <div className="arena-balance">
            Vantagens: {advantageCost} + Únicas: {perkCost} − Desvantagens: {disadvantageGain} = Saldo: {totalPoints} (precisa ser 0)
          </div>

          <div className="arena-steps-nav">
            <button className="arena-btn-nav-sair" onClick={() => setStep('sheet_name')}>← voltar</button>
            <button className="arena-btn-salvar" onClick={handleSalvarELutar}>SALVAR E LUTAR</button>
          </div>
        </div>
      )}

      {/* Manual Drawer */}
      <div className={`arena-manual-drawer ${manualOpen ? 'arena-manual-drawer--open' : ''}`}>
        <div className="arena-manual-drawer-header">
          <span className="arena-manual-drawer-titulo">MANUAL DE BATALHA</span>
          <button className="arena-manual-drawer-close" onClick={() => setManualOpen(false)}>✕</button>
        </div>
        <div className="arena-manual-drawer-body">
          <ManualBatalha />
        </div>
      </div>

      {manualOpen && (
        <div className="arena-manual-overlay" onClick={() => setManualOpen(false)} />
      )}

    </div>
  )
}
