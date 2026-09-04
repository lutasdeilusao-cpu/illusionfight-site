import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useEventos } from '../../../context/EventosContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesTurnMachine from './hooks/useGanguesTurnMachine'
import { getEquippedActiveGanguesSpecials } from './engine/ganguesSpecialEffects.js'
import { simularGanguesBrigaMultidao } from './engine/ganguesBrigaMultidao.js'
import DramaticDice from './components/DramaticDice'
import { sfx } from '../../../lib/sfx'

const ONOMATOPEIAS = ['POW!', 'WHAM!', 'CRACK!', 'SLASH!', 'BOOM!', 'THWACK!']
const randomOnoma = () => ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
const pct = (value, max) => Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))

function fighterName(t, member) {
  if (!member) return '?'
  return member.side === 'enemy' ? (t(`games.gangues.enemy_names.${member.id}`) || member.name) : member.sheet_name
}

function pickTrash(t, enemy, category) {
  const translated = t(`games.gangues.trash_talk_npc.${enemy.id}.${category}`)
  const pool = Array.isArray(translated) ? translated : (enemy.trash_talk?.[category] || [])
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

// Um evento de combate (do motor normal OU do simulador da Briga em
// Multidão — mesmo formato) vira 1-2 entradas de log. Reusado nos dois
// modos pra não duplicar a lógica de nome/trash-talk/onomatopeia.
function transformarEvento(t, event, combatants) {
  if (event.type === 'battle_start') return [{ id: event.id, kind: 'system', text: t('games.gangues.log_batalha_inicio') }]
  if (event.type === 'initiative') {
    return [{ id: event.id, kind: 'initiative', order: event.order.map(item => ({ ...item, name: fighterName(t, combatants.find(m => m.key === item.key)) })) }]
  }
  if (event.type !== 'attack') return []
  const actor = combatants.find(m => m.key === event.actorKey) || { side: event.side }
  const target = combatants.find(m => m.key === event.targetKey)
  const isPlayer = event.side === 'player'
  const entries = [{
    id: event.id, kind: 'attack_card', side: event.side,
    actorName: fighterName(t, actor), targetName: fighterName(t, target), round: event.round,
    fa: event.result.fa, fd: event.result.fd, dice: event.result.rolls.fa, defenseDice: event.result.rolls.fd,
    dmg: event.result.damage, onoma: randomOnoma(),
    attackerBonus: event.result.attackerBonus, defenderBonus: event.result.defenderBonus,
    critical: event.result.critical, criticalBonus: event.result.criticalBonus,
  }]
  const enemyCombatant = isPlayer ? target : actor
  if (enemyCombatant?.trash_talk) {
    const category = event.result.critical ? 'take_critical' : isPlayer ? 'take_damage' : 'attack_hit'
    if (Math.random() < 0.6) {
      const line = pickTrash(t, enemyCombatant, category)
      if (line) entries.push({ id: `${event.id}-trash`, kind: 'trash', sender: fighterName(t, enemyCombatant), text: line })
    }
  }
  return entries
}

// Roster compacto: um quadradinho por lutador (avatar + anel de PV). O nome
// completo só aparece no title/tooltip — a informação que importa segundo a
// segundo é "quem tá vivo, quem tá selecionado, de quem é a vez", não uma
// ficha inteira ocupando a tela. Quem age agora pisca (gang-mini--acting) em
// vez de existir um banner de texto "Vez de X" só pra dizer isso.
function Roster({ members, side, selectable, selectedKey, onSelect, actingKey, t }) {
  return (
    <div className={`gang-roster gang-roster--${side}`}>
      {members.map(member => {
        const dead = member.pv <= 0
        const acted = side === 'player' && member.actedThisRound
        const disabled = dead || acted || !selectable
        const acting = member.key === actingKey && !dead
        const pathClass = member.combat_path ? `gang-path--${member.combat_path}` : ''
        return (
          <button
            key={member.key}
            type="button"
            disabled={disabled}
            title={fighterName(t, member)}
            className={`gang-mini ${pathClass} ${dead ? 'gang-mini--dead' : ''} ${selectedKey === member.key ? 'gang-mini--selected' : ''} ${acting ? 'gang-mini--acting' : ''}`}
            onClick={() => onSelect?.(member.key)}
          >
            <span className="gang-mini-avatar">{fighterName(t, member)[0]}</span>
            <span className="gang-mini-hp"><i style={{ '--pct': `${pct(member.pv, member.pvMax)}%` }} /></span>
            {acting && member.pmMax > 0 && <span className="gang-mini-pm">{member.pm}</span>}
            {acted && <span className="gang-mini-tag">✓</span>}
          </button>
        )
      })}
    </div>
  )
}

export default function GanguesCombat({ onNavigate }) {
  const { t } = useLanguage()
  const { registrarEvento } = useEventos()
  const store = useGanguesStore()
  const [result, setResult] = useState(null)
  // O derrotado fala antes da tela de resultado subir. Sem essa pausa a
  // batalha acabava seca, sem reação de quem perdeu.
  const [falaFinal, setFalaFinal] = useState(null)
  const [showResultBtn, setShowResultBtn] = useState(false)
  const [selectedActor, setSelectedActor] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedSpecialId, setSelectedSpecialId] = useState(null)
  const [log, setLog] = useState([])
  const [trashOptions, setTrashOptions] = useState([])
  const [trashAberto, setTrashAberto] = useState(false)
  const processedEvents = useRef(0)
  const logEndRef = useRef(null)

  // ── Briga em Multidão: bandos de 3+ (jogador + inimigo) podem pular o
  // golpe-a-golpe. Escolhe os poderes uma vez, a luta inteira resolve na
  // hora (mesmas contas do combate normal, ver engine/ganguesBrigaMultidao).
  // "Modo rápido" é um switch persistente (localStorage): uma vez ligado,
  // a pergunta "golpe a golpe x multidão" some — vai direto pra escolha de
  // poderes em toda luta grande, até o jogador cancelar e desligar de novo.
  const totalCombatentes = (store.match.playerTeam?.length || 0) + (store.match.enemyTeam?.length || 0)
  const multidaoDisponivel = totalCombatentes >= 3
  const [modoRapidoAtivo, setModoRapidoAtivoState] = useState(() => {
    try { return localStorage.getItem('ldi-gangues-modo-rapido') === '1' } catch { return false }
  })
  const setModoRapidoAtivo = (ativo) => {
    setModoRapidoAtivoState(ativo)
    try { localStorage.setItem('ldi-gangues-modo-rapido', ativo ? '1' : '0') } catch { /* ignora */ }
  }
  const [ativarModoRapidoMarcado, setAtivarModoRapidoMarcado] = useState(false)
  const [modo, setModo] = useState(null) // null (escolhendo) | 'individual' | 'multidao'
  const [etapaMultidao, setEtapaMultidao] = useState('menu') // 'menu' | 'individual' | 'revelando'
  const [poderesMultidao, setPoderesMultidao] = useState({}) // sheetId -> specialId | null

  useEffect(() => {
    if (modo !== null) return
    if (!multidaoDisponivel) { setModo('individual'); return }
    if (modoRapidoAtivo) setModo('multidao')
  }, [modo, multidaoDisponivel, modoRapidoAtivo])

  const escolherMultidao = () => {
    if (ativarModoRapidoMarcado) setModoRapidoAtivo(true)
    setModo('multidao')
  }

  const cancelarMultidao = () => {
    setModoRapidoAtivo(false)
    setModo('individual')
  }

  const resolverBrigaMultidao = (poderesEscolhidos = poderesMultidao) => {
    sfx.vs?.()
    const especiaisPorPersonagem = {}
    for (const m of store.match.playerTeam) especiaisPorPersonagem[m.id] = getEquippedActiveGanguesSpecials(m)
    const resultado = simularGanguesBrigaMultidao({
      playerTeam: store.match.playerTeam,
      enemyTeam: store.match.enemyTeam,
      poderesPorPersonagem: poderesEscolhidos,
      especiaisPorPersonagem,
    })
    setEtapaMultidao('revelando')
    setTimeout(() => {
      store.endMatch(resultado.outcome)
      const entries = resultado.events.flatMap(event => transformarEvento(t, event, resultado.combatants))
      store.setBattleReport({ outcome: resultado.outcome, entries, initiative: resultado.initiative, combatants: resultado.combatants, rounds: resultado.rounds })
      if (resultado.outcome === 'victory') registrarEvento('arena_vitoria', 'Venceu uma batalha de gangue', 1)
      resultado.outcome === 'victory' ? sfx.win() : sfx.lose()
      onNavigate('victory')
    }, 1400)
  }

  const finish = useCallback(outcome => {
    store.endMatch(outcome)
    setResult(outcome)
    if (outcome === 'victory') registrarEvento('arena_vitoria', 'Venceu uma batalha de gangue', 1)
    outcome === 'victory' ? sfx.win() : sfx.lose()
  }, [store, registrarEvento])

  // Quem perdeu comenta: na vitória do jogador é o inimigo caindo
  // ('defeat'); na derrota, é ele debochando ('player_near_death').
  useEffect(() => {
    if (!result) return
    const inimigo = store.match.enemy
    if (!inimigo) return
    const linha = pickTrash(t, inimigo, result === 'victory' ? 'defeat' : 'player_near_death')
    if (!linha) return
    setFalaFinal({ nome: fighterName(t, { ...inimigo, side: 'enemy' }), texto: linha, outcome: result })
    const timer = setTimeout(() => setFalaFinal(null), 2600)
    return () => clearTimeout(timer)
  }, [result, store.match.enemy, t])

  const machine = useGanguesTurnMachine({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam, onFinish: finish })
  const players = machine.combatants.filter(item => item.side === 'player')
  const enemies = machine.combatants.filter(item => item.side === 'enemy')

  // Só entra no combate golpe-a-golpe se o jogador escolheu (ou não havia
  // escolha — bandos pequenos pulam direto pro modo individual).
  useEffect(() => { if (modo === 'individual' && machine.phase === 'select') machine.enterCombat() }, [modo, machine.phase, machine.enterCombat])

  useEffect(() => {
    if (!selectedActor || !machine.playerActors.some(item => item.key === selectedActor)) {
      setSelectedActor(machine.playerActors[0]?.key || null)
    }
  }, [machine.playerActors, selectedActor])

  useEffect(() => { setSelectedSpecialId(null) }, [selectedActor, machine.round])

  useEffect(() => {
    if (!selectedTarget || enemies.find(item => item.key === selectedTarget)?.pv <= 0) {
      setSelectedTarget(enemies.find(item => item.pv > 0)?.key || null)
    }
  }, [enemies, selectedTarget])

  useEffect(() => {
    const pool = t('games.gangues.trash_talk_player')
    if (Array.isArray(pool) && pool.length >= 3) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      setTrashOptions(shuffled.slice(0, 3))
    }
  }, [machine.round, t])

  useEffect(() => {
    if (machine.events.length <= processedEvents.current) return
    const newEvents = machine.events.slice(processedEvents.current)
    processedEvents.current = machine.events.length

    setLog(prev => {
      let next = prev
      for (const event of newEvents) next = [...next, ...transformarEvento(t, event, machine.combatants)]
      return next
    })
  }, [machine.events, machine.combatants, t])

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [log])

  const sendPlayerTrash = (phrase) => {
    sfx.click()
    setLog(prev => [...prev, { id: `player-trash-${Date.now()}`, kind: 'trash', side: 'player', sender: players[0]?.sheet_name, text: phrase }])
    setTrashAberto(false)
  }

  const handleAttack = () => {
    if (!selectedActor || !selectedTarget) return
    sfx.click()
    machine.playerAction(selectedActor, selectedTarget, selectedSpecialId)
    setSelectedSpecialId(null)
  }

  const actingMember = players.find(item => item.key === selectedActor) || null
  const equippedSpecials = actingMember ? getEquippedActiveGanguesSpecials(actingMember) : []
  const canAffordSpecial = (special) => {
    const cost = special.effect.cost
    if (!cost) return true
    const value = cost.values[special.level - 1]
    if (cost.kind === 'pm') return (actingMember?.pm || 0) >= value
    if (cost.kind === 'pv') return (actingMember?.pv || 0) > 1
    return true
  }

  useEffect(() => {
    if (!result || falaFinal) { setShowResultBtn(false); return }
    const timer = setTimeout(() => setShowResultBtn(true), 1400)
    return () => clearTimeout(timer)
  }, [result, falaFinal])

  const openBattleReport = () => {
    store.setBattleReport({ outcome: result, entries: log, initiative: machine.initiative, combatants: machine.combatants, rounds: machine.round })
    onNavigate('victory')
  }

  if (!store.match.playerTeam?.length) return null

  // ── Escolha do modo: golpe-a-golpe (acompanha tudo) x Briga em Multidão
  // (resolve na hora). Só aparece quando o bando é grande o bastante pra
  // valer a pena perguntar — 1x1 ou 2x1 vai direto pro combate normal. ──
  if (modo === null) {
    return (
      <div className="gang-combat gang-container gang-modo-escolha">
        <h2 className="gang-modo-titulo">{t('games.gangues.multidao.titulo')}</h2>
        <p className="gang-modo-sub">{t('games.gangues.multidao.sub', { seu: store.match.playerTeam.length, deles: store.match.enemyTeam.length })}</p>
        <div className="gang-modo-opcoes">
          <button className="gang-modo-card" onClick={() => setModo('individual')}>
            <strong>{t('games.gangues.multidao.opcao_individual')}</strong>
            <small>{t('games.gangues.multidao.opcao_individual_aviso')}</small>
          </button>
          <button className="gang-modo-card gang-modo-card--destaque" onClick={escolherMultidao}>
            <strong>{t('games.gangues.multidao.opcao_multidao')}</strong>
            <small>{t('games.gangues.multidao.opcao_multidao_desc')}</small>
          </button>
        </div>
        <label className="gang-modo-check">
          <input type="checkbox" checked={ativarModoRapidoMarcado} onChange={e => setAtivarModoRapidoMarcado(e.target.checked)} />
          {t('games.gangues.multidao.ativar_switch')}
        </label>
        <button className="gang-modo-fugir" onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_sair')}</button>
      </div>
    )
  }

  // ── Briga em Multidão: escolhe poderes uma vez, resolve tudo, revela. ──
  if (modo === 'multidao') {
    if (etapaMultidao === 'revelando') {
      return (
        <div className="gang-combat gang-container gang-multidao-revela">
          <div className="gang-multidao-dados">
            {Array.from({ length: 8 }, (_, i) => <span key={i} className="gang-multidao-dado" style={{ '--delay': `${i * 0.07}s` }}>🎲</span>)}
          </div>
          <p className="gang-multidao-revela-texto">{t('games.gangues.multidao.resolvendo')}</p>
        </div>
      )
    }

    // Pergunta simples primeiro: poderes um por um, ou ataque normal pra
    // todo mundo de uma vez (o caminho mais rápido — nem precisa escolher
    // nada, já resolve na hora)?
    if (etapaMultidao === 'menu') {
      return (
        <div className="gang-combat gang-container gang-modo-escolha">
          <h2 className="gang-modo-titulo">{t('games.gangues.multidao.poderes_titulo')}</h2>
          <p className="gang-modo-sub">{t('games.gangues.multidao.poderes_sub')}</p>
          <div className="gang-modo-opcoes">
            <button className="gang-modo-card" onClick={() => setEtapaMultidao('individual')}>
              <strong>{t('games.gangues.multidao.opcao_poderes')}</strong>
              <small>{t('games.gangues.multidao.opcao_poderes_desc')}</small>
            </button>
            <button className="gang-modo-card gang-modo-card--destaque" onClick={() => resolverBrigaMultidao({})}>
              <strong>{t('games.gangues.multidao.opcao_ataque_normal')}</strong>
              <small>{t('games.gangues.multidao.opcao_ataque_normal_desc')}</small>
            </button>
          </div>
          <button className="gang-modo-fugir" onClick={cancelarMultidao}>{t('games.gangues.multidao.cancelar')}</button>
        </div>
      )
    }

    return (
      <div className="gang-combat gang-container gang-modo-escolha">
        <h2 className="gang-modo-titulo">{t('games.gangues.multidao.poderes_titulo')}</h2>
        <p className="gang-modo-sub">{t('games.gangues.multidao.poderes_sub')}</p>
        <div className="gang-multidao-lista">
          {store.match.playerTeam.map(member => {
            const especiais = getEquippedActiveGanguesSpecials(member)
            const escolhido = poderesMultidao[member.id] || null
            return (
              <div key={member.id} className="gang-multidao-lutador">
                <span className="gang-multidao-lutador-nome">{member.sheet_name}</span>
                {especiais.length === 0 ? (
                  <span className="gang-multidao-sem-poder">{t('games.gangues.combat_specials.normal_attack')}</span>
                ) : (
                  <div className="gang-multidao-poderes-grid">
                    <button
                      type="button"
                      className={`gang-power-btn gang-power-btn--normal ${escolhido === null ? 'gang-power-btn--active' : ''}`}
                      onClick={() => setPoderesMultidao(prev => ({ ...prev, [member.id]: null }))}
                    >
                      <span className="gang-power-btn-nome">{t('games.gangues.combat_specials.normal_attack')}</span>
                    </button>
                    {especiais.map(special => (
                      <button
                        key={special.id}
                        type="button"
                        className={`gang-power-btn ${escolhido === special.id ? 'gang-power-btn--active' : ''}`}
                        onClick={() => setPoderesMultidao(prev => ({ ...prev, [member.id]: special.id }))}
                      >
                        <span className="gang-power-btn-nome">{t(`games.gangues.progression.skills.${special.id}`)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="gang-modo-opcoes gang-modo-opcoes--fila">
          <button className="gang-attack-btn" onClick={() => resolverBrigaMultidao()}>{t('games.gangues.multidao.lutar')}</button>
          <button className="gang-modo-fugir" onClick={() => setEtapaMultidao('menu')}>{t('games.gangues.multidao.cancelar')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="gang-combat gang-container">
      <AnimatePresence>
        {machine.pending && (
          <DramaticDice
            key={`${machine.pending.actorKey}-${machine.round}`}
            finalValue={machine.pending.result.rolls.fa}
            sides={3}
            side={machine.pending.side}
            attackerName={fighterName(t, machine.combatants.find(item => item.key === machine.pending.actorKey))}
            targetName={fighterName(t, machine.combatants.find(item => item.key === machine.pending.targetKey))}
            onComplete={machine.completePending}
          />
        )}
        {falaFinal && (
          <motion.div
            className={`gang-fala-final gang-fala-final--${falaFinal.outcome}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="gang-fala-final-bg" />
            <motion.div
              className="gang-fala-final-card"
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <span className="gang-fala-final-avatar">{falaFinal.nome[0]}</span>
              <span className="gang-fala-final-nome">{falaFinal.nome}</span>
              {falaFinal.outcome === 'victory' && (
                <span className="gang-fala-final-selo">{t('games.gangues.beat.derrotado')}</span>
              )}
              <p className="gang-fala-final-texto">“{falaFinal.texto}”</p>
            </motion.div>
          </motion.div>
        )}
        {result && !falaFinal && (
          <motion.div className="gang-match-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="gang-match-result-bg" />
            <div className="gang-match-result-content">
              <motion.div
                className={`gang-match-result-icon gang-match-result-icon--${result === 'victory' ? 'win' : 'lose'}`}
                initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              >
                {result === 'victory' ? '🏆' : '💀'}
              </motion.div>
              <motion.h1
                className={`gang-match-result-title gang-match-result-title--${result === 'victory' ? 'win' : 'lose'}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
              >
                {t(`games.gangues.${result === 'victory' ? 'vitoria' : 'derrota'}`)}
              </motion.h1>
              {result === 'victory' ? (
                <motion.p className="gang-match-result-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                  dangerouslySetInnerHTML={{ __html: t('games.gangues.vitoria_sub', { name: fighterName(t, store.match.enemy && { ...store.match.enemy, side: 'enemy' }) }) }} />
              ) : (
                <motion.p className="gang-match-result-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                  {t('games.gangues.derrota_sub')}
                </motion.p>
              )}
              {showResultBtn && (
                <motion.button
                  className="gang-match-result-btn" onClick={openBattleReport}
                  initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  {t('games.gangues.btn_proximo')}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="gang-vs-bar">
        <button className="gang-vs-bar-back" onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_sair')}</button>
        <div className="gang-vs-bar-line" />
        <span className={`gang-vs-bar-turn ${machine.phase === 'player' ? 'gang-vs-bar-turn--player' : machine.phase === 'enemy' ? 'gang-vs-bar-turn--enemy' : ''}`}>
          {t('games.gangues.loadout.round', { n: machine.round })}
          {(machine.phase === 'player' || machine.phase === 'enemy') && (
            <><i className="gang-vs-bar-turn-dot" />{t(machine.phase === 'player' ? 'games.gangues.combat_specials.sua_vez' : 'games.gangues.combat_specials.vez_inimiga')}</>
          )}
        </span>
        <div className="gang-vs-bar-line" />
        {machine.phase === 'player' && !result && trashOptions.length >= 3 && (
          <div className="gang-trash-toggle-wrap">
            <button type="button" className="gang-trash-toggle" onClick={() => setTrashAberto(v => !v)} aria-label={t('games.gangues.combat_specials.provocar')}>💬</button>
            <AnimatePresence>
              {trashAberto && (
                <motion.div className="gang-trash-pop" initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}>
                  {trashOptions.map((phrase, i) => (
                    <button key={phrase + i} className="gang-trash-pop-btn" onClick={() => sendPlayerTrash(phrase)}>{phrase}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Roster
        members={players} side="player"
        selectable={machine.phase === 'player'}
        selectedKey={selectedActor} onSelect={setSelectedActor}
        actingKey={machine.currentActor?.key} t={t}
      />

      <div className="gang-log-area">
        {log.map(entry => {
          if (entry.kind === 'system') {
            return (
              <motion.div key={entry.id} className="gang-msg-wrap gang-msg-wrap--system" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="gang-bubble gang-bubble--system">{entry.text}</span>
              </motion.div>
            )
          }
          if (entry.kind === 'trash') {
            const isPlayer = entry.side === 'player'
            return (
              <motion.div key={entry.id} className={`gang-msg-wrap ${isPlayer ? 'gang-msg-wrap--player' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="gang-msg-avatar gang-msg-avatar--trash">{(entry.sender || '?')[0]}</div>
                <div className="gang-bubble gang-bubble--trash">{entry.text}</div>
              </motion.div>
            )
          }
          if (entry.kind === 'initiative') {
            return (
              <motion.div key={entry.id} className="gang-initiative-log" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <strong>{t('games.gangues.report.initiative')}</strong>
                {entry.order.map((item, index) => <span key={item.key}><b>{index + 1}</b>{item.name}<small>H {item.ability} + d3 {item.die} = {item.total}</small></span>)}
              </motion.div>
            )
          }
          const isPlayer = entry.side === 'player'
          return (
            <motion.div key={entry.id} className={`gang-msg-wrap ${isPlayer ? 'gang-msg-wrap--player' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`gang-msg-avatar ${isPlayer ? 'gang-msg-avatar--player' : 'gang-msg-avatar--enemy'}`}>{entry.actorName[0]}</div>
              <div className="gang-attack-stack">
                <div className={`gang-attack-card gang-attack-card--${isPlayer ? 'player' : 'enemy'}`}>
                  <div className="gang-attack-card-header">{entry.actorName}</div>
                  <div className="gang-attack-card-body">
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">FA</span><span className="gang-attack-card-val">{entry.fa}</span></div>
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">FD</span><span className="gang-attack-card-val">{entry.fd}</span></div>
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">D3 ATQ</span><span className={`gang-attack-card-val ${entry.critical ? 'gang-attack-card-val--max' : ''}`}>{entry.dice}</span></div>
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">D3 DEF</span><span className={`gang-attack-card-val ${entry.defenseDice === 3 ? 'gang-attack-card-val--max' : ''}`}>{entry.defenseDice}</span></div>
                    {entry.critical && (
                      <div className="gang-attack-card-bonus gang-attack-card-bonus--critical">
                        💥 {t('games.gangues.critico')} +{entry.criticalBonus}
                      </div>
                    )}
                    {entry.attackerBonus?.path && (
                      <div className={`gang-attack-card-bonus ${entry.attackerBonus.applied ? 'gang-attack-card-bonus--hit' : 'gang-attack-card-bonus--miss'}`}>
                        {entry.attackerBonus.applied ? '⚡' : '✕'} {t(`games.gangues.loadout.paths.${entry.attackerBonus.path}.name`)} {t('games.gangues.bonus_ataque')} {entry.attackerBonus.applied ? `+${entry.attackerBonus.amount}` : t('games.gangues.bonus_falhou')}
                      </div>
                    )}
                    {entry.defenderBonus?.path && (
                      <div className={`gang-attack-card-bonus ${entry.defenderBonus.applied ? 'gang-attack-card-bonus--hit' : 'gang-attack-card-bonus--miss'}`}>
                        {entry.defenderBonus.applied ? '🛡️' : '✕'} {t(`games.gangues.loadout.paths.${entry.defenderBonus.path}.name`)} {t('games.gangues.bonus_defesa')} {entry.defenderBonus.applied ? `+${entry.defenderBonus.amount}` : t('games.gangues.bonus_falhou')}
                      </div>
                    )}
                    <div className="gang-attack-card-divider" />
                    <div className="gang-attack-card-damage">
                      <span className="gang-attack-card-damage-label">{t('games.gangues.card_dano')}</span>
                      <span className="gang-attack-card-damage-val">{entry.dmg}</span>
                    </div>
                  </div>
                </div>
                <motion.div className="gang-attack-onoma" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  {entry.onoma}
                </motion.div>
              </div>
            </motion.div>
          )
        })}
        <div ref={logEndRef} />
      </div>

      <Roster
        members={enemies} side="enemy"
        selectable={machine.phase === 'player'}
        selectedKey={selectedTarget} onSelect={setSelectedTarget}
        actingKey={machine.currentActor?.key} t={t}
      />

      {machine.phase === 'player' && !result && (
        <div className="gang-actions-bar">
          <div className="gang-power-attacks">
            <span className="gang-power-attacks-label">{t('games.gangues.combat_specials.escolha_golpe')}</span>
            <div className="gang-power-attacks-grid">
              <button
                type="button"
                className={`gang-power-btn gang-power-btn--normal ${selectedSpecialId === null ? 'gang-power-btn--active' : ''}`}
                onClick={() => setSelectedSpecialId(null)}
              >
                <span className="gang-power-btn-nome">{t('games.gangues.combat_specials.normal_attack')}</span>
                <small>{t('games.gangues.combat_specials.sem_custo')}</small>
              </button>
              {equippedSpecials.map(special => {
                const affordable = canAffordSpecial(special)
                const cost = special.effect.cost
                const custoTxt = cost ? cost.values[special.level - 1] : null
                return (
                  <button
                    key={special.id}
                    type="button"
                    disabled={!affordable}
                    className={`gang-power-btn ${selectedSpecialId === special.id ? 'gang-power-btn--active' : ''} ${!affordable ? 'gang-power-btn--sem-recurso' : ''}`}
                    onClick={() => setSelectedSpecialId(current => current === special.id ? null : special.id)}
                  >
                    <span className="gang-power-btn-nome">{t(`games.gangues.progression.skills.${special.id}`)}</span>
                    {cost && (
                      <small>
                        {t(`games.gangues.combat_specials.cost_${cost.kind}`, { n: custoTxt })}
                        {!affordable && ` · ${t('games.gangues.combat_specials.sem_' + cost.kind)}`}
                      </small>
                    )}
                  </button>
                )
              })}
            </div>
            {equippedSpecials.length === 0 && (
              <p className="gang-power-attacks-vazio">{t('games.gangues.combat_specials.sem_poderes')}</p>
            )}
          </div>

          <div className="gang-actions-row">
            <button className="gang-exit-btn" onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_sair')}</button>
            <button className="gang-attack-btn" disabled={!selectedActor || !selectedTarget} onClick={handleAttack}>
              {selectedSpecialId
                ? t('games.gangues.combat_specials.usar_golpe', { nome: t(`games.gangues.progression.skills.${selectedSpecialId}`) })
                : t('games.gangues.btn_atacar')}
            </button>
          </div>
        </div>
      )}
      {machine.phase === 'enemy' && !machine.pending && <div className="gang2-enemy-thinking"><span className="gang-thinking-pulse" /><strong>{t('games.gangues.report.enemy_thinking')}</strong><small>{t('games.gangues.report.enemy_strategy')}</small></div>}
    </div>
  )
}
