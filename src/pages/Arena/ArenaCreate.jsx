import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'

const ATTRS = ['F', 'H', 'R', 'A', 'PdF']
const ATTR_LABELS = { F: 'Força', H: 'Habilidade', R: 'Resistência', A: 'Armadura', PdF: 'Poder Elemental' }
const ATTR_EMOJI = { F: '💪', H: '🎯', R: '🛡️', A: '🦾', PdF: '✨' }
const ATTR_DESC = { F: 'dano corpo a corpo', H: 'iniciativa e esquiva', R: 'PV e PM base', A: 'absorção de dano', PdF: 'ataques elementais' }

const ELEM_CORES = {
  fogo:   { cor: '#FF4500', glow: 'rgba(255,69,0,0.2)' },
  agua:   { cor: '#00B4D8', glow: 'rgba(0,180,216,0.2)' },
  terra:  { cor: '#8B6914', glow: 'rgba(139,105,20,0.2)' },
  ar:     { cor: '#A8DADC', glow: 'rgba(168,218,220,0.2)' },
  trevas: { cor: '#9B59B6', glow: 'rgba(155,89,182,0.2)' },
  luz:    { cor: '#F5A623', glow: 'rgba(245,166,35,0.2)' },
  neutro: { cor: '#00B4D8', glow: 'rgba(0,180,216,0.15)' },
}

const elements = [
  { id: 'fogo', emoji: '🔥', label: 'Fogo', desc: 'explosivo, agressivo' },
  { id: 'agua', emoji: '💧', label: 'Água', desc: 'fluido, adaptável' },
  { id: 'terra', emoji: '🪨', label: 'Terra', desc: 'sólido, resistente' },
  { id: 'ar', emoji: '💨', label: 'Ar', desc: 'veloz, esquivo' },
  { id: 'trevas', emoji: '🌑', label: 'Trevas', desc: 'corrosivo, drenante' },
  { id: 'luz', emoji: '✨', label: 'Luz', desc: 'purificador, protetor' },
  { id: 'neutro', emoji: '⚪', label: 'Neutro', desc: 'equilibrado, versátil' },
]

const advantages = [
  { label: 'Acrobata', cost: 1, desc: '+1 em testes de esquiva e movimentação. Custa 1 PM por uso.' },
  { label: 'Adaptador', cost: 1, desc: 'Ignora 1 de penalidade por ambiente desfavorável.' },
  { label: 'Afortunado', cost: 2, desc: 'Ganha +1 em rolagens de iniciativa.' },
  { label: 'Aliado', cost: 1, desc: 'Invoca aliado com Força 1 para auxiliar no combate.' },
  { label: 'Arcano', cost: 2, desc: '+1d no dano de poderes elementais. Custa 2 PM extra.' },
  { label: 'Arqueiro', cost: 2, desc: 'Pode realizar ataque à distância com 1d de dano.' },
  { label: 'Bloqueio', cost: 1, desc: 'Declara bloqueio contra ataque físico; reduz dano em 1d.' },
  { label: 'Bombardeiro', cost: 1, desc: '+1d em ataques com armas de pólvora.' },
  { label: 'Boxe', cost: 1, desc: '+1d nos ataques desarmados quando em guarda.' },
  { label: 'Camuflagem', cost: 1, desc: '+1 em furtividade quando em terreno favorável.' },
  { label: 'Carismático', cost: 1, desc: '+1 em interações sociais no pré-combate.' },
  { label: 'Contra-ataque', cost: 2, desc: 'Após ser atingido, pode contra-atacar com 1d.' },
  { label: 'Determinado', cost: 1, desc: 'Quando abaixo de metade do PV, +1 em ataque e defesa.' },
  { label: 'Duas Armas', cost: 2, desc: '+1 ataque extra com mão secundária, com -1 na rolagem.' },
  { label: 'Esquiva', cost: 1, desc: '+1 na FD contra ataques diretos.' },
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
  { label: 'Veterano', cost: 2, desc: '+1 em rolagens críticas (15+).' },
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
  { id: 'fundamentos', titulo: 'Fundamentos', conteudo: 'O LDI é um sistema de combate virtual onde a dor é real.\nTrês bilhões de jogadores disputam posição no ranking SDR.\nCada lutador escolhe um elemental primário que define seus poderes.' },
  { id: 'atributos', titulo: 'Atributos', tabela: [['F — Potência','Dano corpo a corpo'],['H — Agilidade','Iniciativa, esquiva, velocidade'],['R — Resistência','PV e PM base'],['A — Proteção','Absorção de dano, defesa passiva'],['PdF — Poder Elemental','Dano e força dos ataques elementais']], extra: 'Escala: 0 = comum | 1 = praticante | 2 = experiente | 3 = veterano | 4 = elite | 5 = topo absoluto\nPV = R × 5 | PM = PdF × 5' },
  { id: 'combate', titulo: 'Sistema de Batalha', conteudo: 'INICIATIVA: H + 1d6 — maior age primeiro\n\nFA (Corpo a Corpo): F + H + 1d6\nFA (Elemental): PdF + H + 1d6\n\nFD (Normal): A + H + 1d6\nFD (Indefeso): A + 1d6\n\nDANO: FA − FD (mínimo 0)\nCRÍTICO: dado = 6 → dobra F, PdF ou A' },
  { id: 'elementais', titulo: 'Os 7 Elementais', tabela: [['🔥 Fogo','Explosivo, agressivo. Alto dano, pressão constante'],['💧 Água','Fluido, adaptável. Controle, cura, versatilidade'],['🪨 Terra','Sólido, resistente. Defesa, atordoamento, sustentação'],['💨 Ar','Veloz, esquivo. Iniciativa, evasão, mobilidade'],['🌑 Trevas','Corrosivo, drenante. Absorção, debuff, enfraquecimento'],['✨ Luz','Purificador, protetor. Cura, proteção, cegueira'],['⚪ Neutro','Equilibrado. Versátil, sem fraquezas, sem picos']] },
  { id: 'vantagens', titulo: 'Vantagens e Desvantagens', conteudo: 'Vantagens custam pontos de personagem e representam técnicas e poderes especiais.\nDesvantagens concedem pontos extras mas impõem restrições reais.\n\nO saldo final deve ser zero: custo das vantagens = ganho das desvantagens.' },
  { id: 'xp', titulo: 'XP e Evolução', conteudo: 'Vitória em batalha justa: +10 XP\nDerrota em batalha justa: +1 XP\n\nA cada 100 XP: 1 ponto de personagem para gastar em atributo ou vantagem.' },
]

function ManualBatalha() {
  const [aberta, setAberta] = useState(null)
  return (
    <div className="arena-manual-sections">
      {MANUAL_SECTIONS.map(sec => (
        <div key={sec.id} className="arena-manual-section">
          <button className={`arena-manual-section-btn ${aberta === sec.id ? 'arena-manual-section-btn--open' : ''}`}
            onClick={() => setAberta(aberta === sec.id ? null : sec.id)}>
            {sec.titulo}
            <span className="arena-manual-section-arrow">{aberta === sec.id ? '▲' : '▼'}</span>
          </button>
          {aberta === sec.id && (
            <div className="arena-manual-section-body">
              {sec.conteudo && <pre className="arena-manual-pre">{sec.conteudo}</pre>}
              {sec.tabela && (
                <table className="arena-manual-table"><tbody>
                  {sec.tabela.map((row, i) => (
                    <tr key={i}>
                      <td className="arena-manual-td-key">{row[0]}</td>
                      <td className="arena-manual-td-val">{row[1]}</td>
                    </tr>
                  ))}
                </tbody></table>
              )}
              {sec.extra && <pre className="arena-manual-pre arena-manual-pre--extra">{sec.extra}</pre>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AdvTooltip({ label, desc, x, y }) {
  const style = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 260),
    top: y - 8,
    transform: 'translateY(-100%)',
    zIndex: 600,
    background: '#0d0d0d',
    border: '1px solid rgba(245,166,35,0.3)',
    padding: '10px 14px',
    maxWidth: 240,
    pointerEvents: 'none',
  }
  return (
    <div className="arena-adv-tooltip" style={style}>
      <div className="arena-adv-tooltip-label">{label}</div>
      <div className="arena-adv-tooltip-desc">{desc}</div>
    </div>
  )
}

export default function ArenaCreate({ onNavigate, skipIntro = false, onFirstVisit }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const store = useArenaStore()
  const [step, setStep] = useState(skipIntro ? 'attrs' : 'intro')
  const [errors, setErrors] = useState({})
  const [manualOpen, setManualOpen] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const longPressRef = useRef(null)

  useEffect(() => {
    if (!skipIntro && onFirstVisit) onFirstVisit()
  }, [])

  const s = store.sheet
  const attrs = s.attributes
  const points = store.points_available

  const ec = ELEM_CORES[s.elemental] || ELEM_CORES.neutro

  const validateStep = () => {
    const e = {}
    if (step === 'attrs' && points > 0) e.points = 'Você ainda tem pontos para distribuir.'
    if (step === 'sheet_name' && !s.sheet_name?.trim()) e.name = 'Dê um nome para sua ficha.'
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
    store.updateSheet({ [key]: exists ? list.filter(x => x.label !== item.label) : [...list, item] })
  }

  const costMap = (list) => list.reduce((sum, x) => sum + (x.cost || x.gain || 0), 0)
  const advantageCost = costMap(s.advantages || [])
  const disadvantageGain = costMap(s.disadvantages || [])
  const perkCost = costMap(s.perks || [])
  const totalPoints = advantageCost + perkCost - disadvantageGain

  const handleAdvEnter = (e, item) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTooltip({ label: item.label, desc: item.desc, x: r.left, y: r.top })
  }
  const handleAdvLeave = () => setTooltip(null)
  const handleAdvPointerDown = (e, item) => {
    longPressRef.current = setTimeout(() => {
      const r = e.currentTarget.getBoundingClientRect()
      setTooltip({ label: item.label, desc: item.desc, x: r.left, y: r.top })
    }, 400)
  }
  const handleAdvPointerUp = () => clearTimeout(longPressRef.current)

  const handleSalvar = async () => {
    if (!s.sheet_name?.trim()) { setErrors({ name: 'Dê um nome para sua ficha.' }); setStep('sheet_name'); return }
    if (totalPoints > 0) { setErrors({ cost: 'Vantagens superam desvantagens. Equilibre o saldo.' }); return }
    if (totalPoints < 0) { setErrors({ cost: 'Desvantagens superam vantagens. Equilibre o saldo.' }); return }
    await store.saveToCloud(user?.id)
    onNavigate('lobby')
  }

  const stepIndex = ['attrs', 'sheet_name', 'specs'].indexOf(step)

  return (
    <div className="arena-create">

      {/* INTRO */}
      {step === 'intro' && (
        <div className="arena-lobby" style={{ paddingTop: 60 }}>
          <div className="arena-lobby-hero">
            <p className="arena-lobby-titulo">modo standalone</p>
            <h1 className="arena-lobby-nome" style={{ fontSize: 36 }}>NOVA FICHA</h1>
            <p className="arena-lobby-sub">você já conhece o sistema de batalha?</p>
          </div>
          <div className="arena-lobby-divider" />
          <div className="arc-intro-grid">
            <div className="arc-intro-card" onClick={() => setManualOpen(true)}>
              <div className="arc-intro-card-icon">📖</div>
              <div className="arc-intro-card-titulo">LER O MANUAL</div>
              <div className="arc-intro-card-sub">aprenda o sistema antes de criar sua ficha</div>
            </div>
            <div className="arc-intro-card arc-intro-card--primary" onClick={() => setStep('attrs')}>
              <div className="arc-intro-card-icon">⚔️</div>
              <div className="arc-intro-card-titulo">CRIAR DIRETO</div>
              <div className="arc-intro-card-sub">já sei o que estou fazendo</div>
            </div>
          </div>
          <p className="arc-intro-hint">💡 o manual fica acessível pelo botão <strong>?</strong> durante a criação</p>
        </div>
      )}

      {/* HEADER steps */}
      {step !== 'intro' && (
        <div className="arc-header">
          <button className="arena-back" onClick={() => navigate('/games')}>← extras</button>
          <div className="arc-header-center">
            <p className="arena-lobby-titulo" style={{ margin: 0, fontSize: 10 }}>nova ficha</p>
            {s.sheet_name && <p className="arc-header-name">{s.sheet_name}</p>}
          </div>
          <div className="arena-create-steps">
            {['attrs','sheet_name','specs'].map((st, i) => (
              <div key={st} className={`arena-create-step-dot ${step === st ? 'arena-create-step-dot--active' : i < stepIndex ? 'arena-create-step-dot--done' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {/* STEP ATTRS */}
      {step === 'attrs' && (
        <div className="arc-step">
          <div className="arc-section-label">ATRIBUTOS <span className="arc-pontos">{points} pts restantes</span></div>
          <div className="arc-attr-list">
            {ATTRS.map(attr => (
              <div key={attr} className="arc-attr-card">
                <div className="arc-attr-avatar">{ATTR_EMOJI[attr]}</div>
                <div className="arc-attr-info">
                  <div className="arc-attr-name">{ATTR_LABELS[attr]}</div>
                  <div className="arc-attr-desc">{ATTR_DESC[attr]}</div>
                </div>
                <div className="arc-attr-controls">
                  <button className="arc-attr-btn" onClick={() => handleAttrChange(attr, -1)} disabled={attrs[attr] <= 0}>−</button>
                  <span className="arc-attr-val">{attrs[attr]}</span>
                  <button className="arc-attr-btn" onClick={() => handleAttrChange(attr, 1)} disabled={attrs[attr] >= 5 || points <= 0}>+</button>
                </div>
              </div>
            ))}
          </div>
          {errors.points && <p className="arena-err">{errors.points}</p>}
          <div className="arc-nav">
            <button className="arc-btn-ghost" onClick={() => onNavigate('lobby')}>← lobby</button>
            <button className="arc-btn-primary" onClick={() => { if (validateStep()) setStep('sheet_name') }}>próximo →</button>
          </div>
        </div>
      )}

      {/* STEP SHEET NAME */}
      {step === 'sheet_name' && (
        <div className="arc-step">
          <div className="arc-section-label">IDENTIDADE</div>

          <div className="arc-name-hero">
            <div className="arc-name-avatar" style={{ '--elem-cor': ec.cor, '--elem-glow': ec.glow, background: `radial-gradient(circle at 35% 35%, ${ec.cor}, #0a0a0a)`, boxShadow: `0 0 32px ${ec.glow}` }}>
              {s.sheet_name ? s.sheet_name[0].toUpperCase() : '?'}
            </div>
            <input
              className="arc-name-input"
              value={s.sheet_name || ''}
              onChange={e => { store.updateSheet({ sheet_name: e.target.value }); setErrors({}) }}
              placeholder="nome do lutador..."
              autoFocus
            />
            {errors.name && <p className="arena-err">{errors.name}</p>}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>ELEMENTAL</div>
          <div className="arc-elem-list">
            {elements.map(el => {
              const ecc = ELEM_CORES[el.id] || ELEM_CORES.neutro
              const active = s.elemental === el.id
              return (
                <div key={el.id}
                  className={`arc-elem-card ${active ? 'arc-elem-card--active' : ''}`}
                  style={{ '--elem-cor': ecc.cor, '--elem-glow': ecc.glow }}
                  onClick={() => store.updateSheet({ elemental: el.id })}>
                  <div className="arc-elem-avatar" style={{ background: active ? `radial-gradient(circle at 35% 35%, ${ecc.cor}, #0a0a0a)` : undefined, boxShadow: active ? `0 0 20px ${ecc.glow}` : undefined }}>
                    {el.emoji}
                  </div>
                  <div className="arc-elem-info">
                    <div className="arc-elem-name">{el.label}</div>
                    <div className="arc-elem-desc">{el.desc}</div>
                  </div>
                  {active && <span className="arc-elem-check">✓</span>}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>ARMA</div>
          <input className="arc-text-input" value={s.weapon || ''} onChange={e => store.updateSheet({ weapon: e.target.value })} placeholder="ex: katana, punhos, bastão..." />

          <div className="arc-nav">
            <button className="arc-btn-ghost" onClick={() => setStep('attrs')}>← voltar</button>
            <button className="arc-btn-primary" onClick={() => { if (validateStep()) setStep('specs') }}>próximo →</button>
          </div>
        </div>
      )}

      {/* STEP SPECS */}
      {step === 'specs' && (
        <div className="arc-step">
          <div className="arc-section-label">PERÍCIAS</div>
          <div className="arc-chip-grid">
            {specializations.map(spec => {
              const active = (s.specializations || []).includes(spec)
              return (
                <div key={spec} className={`arc-chip ${active ? 'arc-chip--active' : ''}`}
                  onClick={() => {
                    const list = s.specializations || []
                    store.updateSheet({ specializations: active ? list.filter(x => x !== spec) : [...list, spec] })
                  }}>
                  {spec}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>VANTAGENS <span className="arc-pontos">{advantageCost} pts</span></div>
          <div className="arc-chip-grid">
            {advantages.map(adv => {
              const has = (s.advantages || []).find(x => x.label === adv.label)
              return (
                <div key={adv.label}
                  className={`arc-chip arc-chip--adv ${has ? 'arc-chip--adv-active' : ''}`}
                  onClick={() => toggleFromList('advantages', adv)}
                  onMouseEnter={e => handleAdvEnter(e, adv)}
                  onMouseLeave={handleAdvLeave}
                  onPointerDown={e => handleAdvPointerDown(e, adv)}
                  onPointerUp={handleAdvPointerUp}>
                  <span className="arc-chip-cost">{adv.cost}</span> {adv.label}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>DESVANTAGENS <span className="arc-pontos arc-pontos--gain">+{disadvantageGain} pts</span></div>
          <div className="arc-chip-grid">
            {disadvantages.map(dis => {
              const has = (s.disadvantages || []).find(x => x.label === dis.label)
              return (
                <div key={dis.label}
                  className={`arc-chip arc-chip--dis ${has ? 'arc-chip--dis-active' : ''}`}
                  onClick={() => toggleFromList('disadvantages', dis)}
                  onMouseEnter={e => handleAdvEnter(e, dis)}
                  onMouseLeave={handleAdvLeave}
                  onPointerDown={e => handleAdvPointerDown(e, dis)}
                  onPointerUp={handleAdvPointerUp}>
                  <span className="arc-chip-cost">+{dis.gain}</span> {dis.label}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>ÚNICAS <span className="arc-pontos">{perkCost} pts</span></div>
          <div className="arc-chip-grid">
            {perks.map(p => {
              const has = (s.perks || []).find(x => x.label === p.label)
              return (
                <div key={p.label}
                  className={`arc-chip arc-chip--adv ${has ? 'arc-chip--adv-active' : ''}`}
                  onClick={() => toggleFromList('perks', p)}
                  onMouseEnter={e => handleAdvEnter(e, p)}
                  onMouseLeave={handleAdvLeave}
                  onPointerDown={e => handleAdvPointerDown(e, p)}
                  onPointerUp={handleAdvPointerUp}>
                  <span className="arc-chip-cost">{p.cost}</span> {p.label}
                </div>
              )
            })}
          </div>

          {errors.cost && <p className="arena-err">{errors.cost}</p>}
          <div className="arc-balance">
            vantagens {advantageCost} + únicas {perkCost} − desvantagens {disadvantageGain} = <strong style={{ color: totalPoints === 0 ? '#22C55E' : '#8B0000' }}>{totalPoints}</strong> (precisa ser 0)
          </div>

          <div className="arc-nav">
            <button className="arc-btn-ghost" onClick={() => setStep('sheet_name')}>← voltar</button>
            <button className="arc-btn-salvar" onClick={handleSalvar}>SALVAR E LUTAR</button>
          </div>
        </div>
      )}

      {/* botão ? */}
      {step !== 'intro' && (
        <button className="arena-manual-btn" onClick={() => setManualOpen(true)} title="Manual de Batalha">?</button>
      )}

      {/* drawer */}
      <div className={`arena-manual-drawer ${manualOpen ? 'arena-manual-drawer--open' : ''}`}>
        <div className="arena-manual-drawer-header">
          <span className="arena-manual-drawer-titulo">MANUAL DE BATALHA</span>
          <button className="arena-manual-drawer-close" onClick={() => setManualOpen(false)}>✕</button>
        </div>
        <div className="arena-manual-drawer-body"><ManualBatalha /></div>
      </div>
      {manualOpen && <div className="arena-manual-overlay" onClick={() => setManualOpen(false)} />}

      {tooltip && <AdvTooltip {...tooltip} />}
    </div>
  )
}