import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useEventos } from '../../../context/EventosContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesTurnMachine from './hooks/useGanguesTurnMachine'
import { getEquippedActiveGanguesSpecials } from './engine/ganguesSpecialEffects.js'
import { getGanguesProgression } from './data/ganguesLoadout.js'
import { iniciarBrigaMultidao, avancarRodadaMultidao } from './engine/ganguesBrigaMultidao.js'
import DramaticDice from './components/DramaticDice'
import { sfx } from '../../../lib/sfx'
import './GanguesCombatRedesign.css'

const ONOMATOPEIAS = ['POW!', 'WHAM!', 'CRACK!', 'SLASH!', 'BOOM!', 'THWACK!']
const randomOnoma = () => ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
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

// Um evento de combate (do motor normal OU do avanço de rodada da Briga em
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

// Roster compacto: quadradinho (avatar + anel de PV) + nome curto e PM
// sempre visíveis embaixo — com 6 personagens em campo, "quem é quem" tem
// que dar pra ler sem precisar segurar o dedo pra ver o tooltip. Quem age
// agora pisca (gang-mini--acting) em vez de existir um banner "Vez de X".
// Tocar no quadrado abre a fichinha completa quando tocar não ia selecionar
// nada de novo (já tá selecionado, ou não dá pra selecionar agora — morto,
// já agiu, ou fora da sua vez) — sem precisar de botãozinho separado
// pequeno demais pra tocar no celular.
function Roster({ members, side, selectable, selectedKey, onSelect, actingKey, onAbrirFicha, t }) {
  return (
    <div className={`gang-roster gang-roster--${side}`}>
      {members.map(member => {
        const dead = member.pv <= 0
        const acted = side === 'player' && member.actedThisRound
        const acting = member.key === actingKey && !dead
        // No lado do jogador só quem tá agindo AGORA é selecionável de
        // verdade (a ordem de turno decide quem ataca, não o toque) — sem
        // isso o segundo personagem nunca teria "nada a selecionar" e o
        // toque tentava selecionar (não fazia nada) em vez de abrir a
        // fichinha, que era o bug: a ficha só abria em quem tava na vez.
        const podeSelecionar = selectable && !dead && !acted && (side === 'enemy' || acting)
        const jaSelecionado = selectedKey === member.key
        const pathClass = member.combat_path ? `gang-path--${member.combat_path}` : ''
        const progression = getGanguesProgression(member)
        const nome = fighterName(t, member)
        const tocar = () => {
          if (podeSelecionar && !jaSelecionado) onSelect?.(member.key)
          else onAbrirFicha?.(member)
        }
        return (
          <div key={member.key} className="gang-mini-wrap">
            <button
              type="button"
              title={nome}
              className={`gang-mini ${pathClass} ${!podeSelecionar ? 'gang-mini--indisponivel' : ''} ${dead ? 'gang-mini--dead' : ''} ${jaSelecionado ? 'gang-mini--selected' : ''} ${acting ? 'gang-mini--acting' : ''}`}
              onClick={tocar}
            >
              <span className="gang-mini-avatar">{nome[0]}</span>
              <progress className="gang-mini-hp" max={member.pvMax || 1} value={Math.max(0, member.pv || 0)} />
              {acted && <span className="gang-mini-tag">✓</span>}
            </button>
            <span className="gang-mini-nome">{nome.slice(0, 7)}</span>
            <span className="gang-mini-bars" aria-label={nome}>
              <progress className="gang-mini-resource gang-mini-resource--pv" max={member.pvMax || 1} value={Math.max(0, member.pv || 0)} />
              <progress className="gang-mini-resource gang-mini-resource--pm" max={member.pmMax || 1} value={Math.max(0, member.pm || 0)} />
              <progress className="gang-mini-resource gang-mini-resource--xp" max="10" value={progression.ap} />
            </span>
          </div>
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
  const [fichaAberta, setFichaAberta] = useState(null) // combatant ou null — popup de status completo
  const processedEvents = useRef(0)
  const logEndRef = useRef(null)

  // ── Briga em Multidão: um SWITCH na barra do topo (não uma tela separada),
  // visível só quando o bando é grande o bastante (6+ combatentes somados).
  // Continua por TURNO — cada aperto em "avançar rodada" resolve uma rodada
  // inteira (todo mundo vivo age uma vez) e PARA; o jogador decide se
  // continua. O switch trava assim que a primeira rodada/ataque acontece,
  // pra não ter que sincronizar dois motores de combate no meio da luta.
  const totalCombatentes = (store.match.playerTeam?.length || 0) + (store.match.enemyTeam?.length || 0)
  const multidaoDisponivel = totalCombatentes >= 6
  const [modoMultidaoOn, setModoMultidaoOn] = useState(false)
  const [switchTravado, setSwitchTravado] = useState(false)
  const modoMultidaoAtivo = multidaoDisponivel && modoMultidaoOn

  const [poderesMultidao, setPoderesMultidao] = useState({}) // sheetId -> specialId | null
  const [estadoMultidao, setEstadoMultidao] = useState(null)
  const [revelandoRodada, setRevelandoRodada] = useState(false)

  const cicloPoderMultidao = (member) => {
    const especiais = getEquippedActiveGanguesSpecials(member)
    if (!especiais.length) return
    setPoderesMultidao(prev => {
      const atual = prev[member.id] || null
      const opcoes = [null, ...especiais.map(s => s.id)]
      const proximo = opcoes[(opcoes.indexOf(atual) + 1) % opcoes.length]
      return { ...prev, [member.id]: proximo }
    })
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

  // No modo multidão o motor golpe-a-golpe fica ocioso de propósito — quem
  // resolve a luta é o estadoMultidao (avancarRodadaMultidao).
  useEffect(() => { if (!modoMultidaoAtivo && machine.phase === 'select') machine.enterCombat() }, [modoMultidaoAtivo, machine.phase, machine.enterCombat])

  // Prepara o estado da Briga em Multidão assim que o switch liga — igual o
  // enterCombat() do modo normal, só que pro outro motor. Sem isso o roster
  // mostraria as fichas cruas (sem pv/pvMax/key) até o primeiro clique.
  useEffect(() => {
    if (!modoMultidaoAtivo || estadoMultidao) return
    const inicial = iniciarBrigaMultidao({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam })
    setEstadoMultidao(inicial)
    setLog(prev => [...prev, ...inicial.eventosIniciais.flatMap(event => transformarEvento(t, event, inicial.combatants))])
  }, [modoMultidaoAtivo, estadoMultidao])

  const players = modoMultidaoAtivo
    ? (estadoMultidao?.combatants || []).filter(item => item.side === 'player')
    : machine.combatants.filter(item => item.side === 'player')
  const enemies = modoMultidaoAtivo
    ? (estadoMultidao?.combatants || []).filter(item => item.side === 'enemy')
    : machine.combatants.filter(item => item.side === 'enemy')

  useEffect(() => {
    if (modoMultidaoAtivo) return
    if (!selectedActor || !machine.playerActors.some(item => item.key === selectedActor)) {
      setSelectedActor(machine.playerActors[0]?.key || null)
    }
  }, [machine.playerActors, selectedActor, modoMultidaoAtivo])

  useEffect(() => { setSelectedSpecialId(null) }, [selectedActor, machine.round])

  useEffect(() => {
    if (modoMultidaoAtivo) return
    if (!selectedTarget || enemies.find(item => item.key === selectedTarget)?.pv <= 0) {
      setSelectedTarget(enemies.find(item => item.pv > 0)?.key || null)
    }
  }, [enemies, selectedTarget, modoMultidaoAtivo])

  useEffect(() => {
    const pool = t('games.gangues.trash_talk_player')
    if (Array.isArray(pool) && pool.length >= 3) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      setTrashOptions(shuffled.slice(0, 3))
    }
  }, [machine.round, estadoMultidao?.round, t])

  useEffect(() => {
    if (modoMultidaoAtivo) return
    if (machine.events.length <= processedEvents.current) return
    const newEvents = machine.events.slice(processedEvents.current)
    processedEvents.current = machine.events.length

    setLog(prev => {
      let next = prev
      for (const event of newEvents) next = [...next, ...transformarEvento(t, event, machine.combatants)]
      return next
    })
  }, [machine.events, machine.combatants, t, modoMultidaoAtivo])

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [log])

  const sendPlayerTrash = (phrase) => {
    sfx.click()
    setLog(prev => [...prev, { id: `player-trash-${Date.now()}`, kind: 'trash', side: 'player', sender: players[0]?.sheet_name, text: phrase }])
    setTrashAberto(false)
  }

  const handleAttack = () => {
    if (!selectedActor || !selectedTarget) return
    sfx.click()
    if (!switchTravado) setSwitchTravado(true)
    machine.playerAction(selectedActor, selectedTarget, selectedSpecialId)
    setSelectedSpecialId(null)
  }

  // ── Briga em Multidão: avança exatamente UMA rodada por clique — nunca a
  // luta inteira. Poderes são lidos na hora (o jogador pode trocar entre
  // rodadas, ciclando os chips). ──
  const avancarRodada = () => {
    if (revelandoRodada || result || !estadoMultidao) return
    sfx.vs?.()
    if (!switchTravado) setSwitchTravado(true)

    const especiaisPorPersonagem = {}
    for (const m of store.match.playerTeam) especiaisPorPersonagem[m.id] = getEquippedActiveGanguesSpecials(m)
    const proximoEstado = avancarRodadaMultidao(estadoMultidao, poderesMultidao, especiaisPorPersonagem)

    setRevelandoRodada(true)
    setTimeout(() => {
      setEstadoMultidao(proximoEstado)
      const entradasRodada = proximoEstado.eventosRodada.flatMap(event => transformarEvento(t, event, proximoEstado.combatants))
      setLog(prev => [...prev, ...entradasRodada])
      setRevelandoRodada(false)
      if (proximoEstado.terminado) finish(proximoEstado.outcome)
    }, 900)
  }

  const actingMember = players.find(item => item.key === (modoMultidaoAtivo ? null : selectedActor)) || null
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
    const initiative = modoMultidaoAtivo ? (estadoMultidao?.initiative || []) : machine.initiative
    const combatants = modoMultidaoAtivo ? (estadoMultidao?.combatants || []) : machine.combatants
    const rounds = modoMultidaoAtivo ? (estadoMultidao?.round || 1) : machine.round
    store.setBattleReport({ outcome: result, entries: log, initiative, combatants, rounds })
    onNavigate('victory')
  }

  if (!store.match.playerTeam?.length) return null

  return (
    <div className="gang-combat gang-container">
      <AnimatePresence>
        {machine.pending && !modoMultidaoAtivo && (
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
        {revelandoRodada && (
          <div className="gang-multidao-revela gang-multidao-revela--overlay">
            <div className="gang-multidao-dados">
              {Array.from({ length: 6 }, (_, i) => <span key={i} className="gang-multidao-dado" style={{ '--delay': `${i * 0.07}s` }}>🎲</span>)}
            </div>
            <p className="gang-multidao-revela-texto">{t('games.gangues.multidao.resolvendo')}</p>
          </div>
        )}
        {fichaAberta && (
          <motion.div className="gang-ficha-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFichaAberta(null)}>
            <motion.div
              className="gang-ficha-modal-card"
              initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
              onClick={e => e.stopPropagation()}
            >
              <span className="gang-ficha-modal-kicker">{t('games.gangues.ficha_dossie')}</span>
              <span className="gang-ficha-modal-avatar">{fighterName(t, fichaAberta)[0]}</span>
              <strong className="gang-ficha-modal-nome">{fighterName(t, fichaAberta)}</strong>
              {fichaAberta.combat_path && (
                <span className="gang-ficha-modal-caminho">{t(`games.gangues.loadout.paths.${fichaAberta.combat_path}.name`)}</span>
              )}
              <div className="gang-ficha-modal-stats">
                {['A', 'H', 'R', 'D'].map(k => (
                  <span key={k}><i>{k}</i>{fichaAberta.attributes?.[k] ?? fichaAberta.stats?.[k] ?? 0}</span>
                ))}
              </div>
              <div className="gang-ficha-modal-recursos">
                {(() => {
                  const progression = getGanguesProgression(fichaAberta)
                  return <>
                    <span><em>PV</em><progress className="gang-ficha-bar gang-ficha-bar--pv" max={fichaAberta.pvMax || 1} value={Math.max(0, fichaAberta.pv || 0)} /><strong>{fichaAberta.pv}/{fichaAberta.pvMax}</strong></span>
                    <span><em>PM</em><progress className="gang-ficha-bar gang-ficha-bar--pm" max={fichaAberta.pmMax || 1} value={Math.max(0, fichaAberta.pm || 0)} /><strong>{fichaAberta.pm || 0}/{fichaAberta.pmMax || 0}</strong></span>
                    <span><em>XP</em><progress className="gang-ficha-bar gang-ficha-bar--xp" max="10" value={progression.ap} /><strong>{progression.ap}/10</strong></span>
                    <small>{t('games.gangues.ficha_xp_disponivel', { n: progression.xp_unspent })}</small>
                  </>
                })()}
              </div>
              <button className="gang-modo-fugir" onClick={() => setFichaAberta(null)}>{t('games.gangues.ficha_fechar')}</button>
            </motion.div>
          </motion.div>
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
          {t('games.gangues.loadout.round', { n: modoMultidaoAtivo ? (estadoMultidao?.round || 1) : machine.round })}
          {!modoMultidaoAtivo && (machine.phase === 'player' || machine.phase === 'enemy') && (
            <><i className="gang-vs-bar-turn-dot" />{t(machine.phase === 'player' ? 'games.gangues.combat_specials.sua_vez' : 'games.gangues.combat_specials.vez_inimiga')}</>
          )}
        </span>
        <div className="gang-vs-bar-line" />
        {multidaoDisponivel && (
          <button
            type="button"
            className={`gang-multidao-switch ${modoMultidaoOn ? 'gang-multidao-switch--on' : ''}`}
            disabled={switchTravado}
            title={t('games.gangues.multidao.switch_titulo')}
            onClick={() => setModoMultidaoOn(!modoMultidaoOn)}
          >
            <span className="gang-multidao-switch-track"><span className="gang-multidao-switch-bolinha" /></span>
            <small>{t('games.gangues.multidao.switch_label')}</small>
          </button>
        )}
        {!modoMultidaoAtivo && machine.phase === 'player' && !result && trashOptions.length >= 3 && (
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
        selectable={!modoMultidaoAtivo && machine.phase === 'player'}
        selectedKey={selectedActor} onSelect={modoMultidaoAtivo ? undefined : setSelectedActor}
        actingKey={modoMultidaoAtivo ? null : machine.currentActor?.key}
        onAbrirFicha={setFichaAberta} t={t}
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
                      <span className={`gang-attack-card-damage-val ${entry.dmg === 0 ? 'gang-attack-card-damage-val--zero' : ''}`}>{entry.dmg}</span>
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
        selectable={!modoMultidaoAtivo && machine.phase === 'player'}
        selectedKey={selectedTarget} onSelect={modoMultidaoAtivo ? undefined : setSelectedTarget}
        actingKey={modoMultidaoAtivo ? null : machine.currentActor?.key}
        onAbrirFicha={setFichaAberta} t={t}
      />

      {/* ── Modo Briga em Multidão: poderes configuráveis por toque + avançar rodada ── */}
      {modoMultidaoAtivo && !result && (
        <div className="gang-actions-bar">
          <div className="gang-multidao-poderes-fila">
            <span className="gang-power-attacks-label">{t('games.gangues.multidao.poderes_titulo')}</span>
            <div className="gang-multidao-chips">
              {store.match.playerTeam.map(member => {
                const especiais = getEquippedActiveGanguesSpecials(member)
                const escolhido = poderesMultidao[member.id] || null
                const rotulo = escolhido ? t(`games.gangues.progression.skills.${escolhido}`) : t('games.gangues.combat_specials.normal_attack')
                return (
                  <button
                    key={member.id}
                    type="button"
                    disabled={!especiais.length}
                    className={`gang-multidao-chip ${escolhido ? 'gang-multidao-chip--poder' : ''}`}
                    onClick={() => cicloPoderMultidao(member)}
                  >
                    <strong>{member.sheet_name}</strong>
                    <small>{rotulo}</small>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="gang-actions-row">
            <button className="gang-exit-btn" onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_sair')}</button>
            <button className="gang-attack-btn" disabled={revelandoRodada || !estadoMultidao} onClick={avancarRodada}>
              {t('games.gangues.multidao.avancar_rodada')}
            </button>
          </div>
        </div>
      )}

      {!modoMultidaoAtivo && machine.phase === 'player' && !result && (
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
      {!modoMultidaoAtivo && machine.phase === 'enemy' && !machine.pending && <div className="gang2-enemy-thinking"><span className="gang-thinking-pulse" /><strong>{t('games.gangues.report.enemy_thinking')}</strong><small>{t('games.gangues.report.enemy_strategy')}</small></div>}
    </div>
  )
}
