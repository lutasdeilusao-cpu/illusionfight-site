import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useEventos } from '../../../context/EventosContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesTurnMachine from './hooks/useGanguesTurnMachine'
import { getEquippedActiveGanguesSpecials } from './engine/ganguesSpecialEffects.js'
import { getGanguesProgression, ganguesXpMaxForSheet } from './data/ganguesLoadout.js'
import { getGanguesEffectTheme } from './data/ganguesEffectThemes.js'
import { GANGUES_ITENS_LISTA, getGanguesItem } from './data/ganguesItens.js'
import { iniciarBrigaMultidao, avancarRodadaMultidao } from './engine/ganguesBrigaMultidao.js'
import DramaticDice from './components/DramaticDice'
import GanguesCombatTutorial from './components/GanguesCombatTutorial'
import GanguesMultidaoTutorial from './components/GanguesMultidaoTutorial'
import GanguesFichaCard from './components/GanguesFichaCard'
import GanguesActionOrb from './components/GanguesActionOrb'
import { sfx } from '../../../lib/sfx'
import './GanguesCombatRedesign.css'

// Modo automático: vive no menu da bolinha de ação (GanguesActionOrb) e
// APARECE pra todo mundo — é chamariz de assinatura. Beta: liberado geral.
// Quando o site sair do beta, trocar este flag pra true fecha o USO pra quem
// não assina (o botão continua visível, com coroa 👑, e o toque manda pro
// /assinar via toggleModoAuto). O guard em `podeUsarModoAuto` + o check no
// efeito de auto-ataque garantem que non-assinante nunca dispara.
const MODO_AUTO_EXIGE_ASSINATURA = false
const TIERS_COM_MODO_AUTO = ['elite', 'primordial']

const ONOMATOPEIAS = ['POW!', 'WHAM!', 'CRACK!', 'SLASH!', 'BOOM!', 'THWACK!']
const randomOnoma = () => ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]

// Pisca o switch da Briga em Multidão até o jogador ligar ele PELO MENOS UMA
// vez — sem isso, quem nunca reparou no switch nunca descobre o modo (mesmo
// padrão de flag no localStorage dos outros tutoriais autocontidos).
const MULTIDAO_BLINK_KEY = 'ldi-gangues-multidao-blink-visto'
function multidaoBlinkJaVisto() { try { return localStorage.getItem(MULTIDAO_BLINK_KEY) === '1' } catch { return false } }
function marcarMultidaoBlinkVisto() { try { localStorage.setItem(MULTIDAO_BLINK_KEY, '1') } catch {} }
function fighterName(t, member) {
  if (!member) return '?'
  if (member.side !== 'enemy') return member.sheet_name
  const base = t(`games.gangues.enemy_names.${member.id}`) || member.name
  // Mesmo molde pode sair 2x+ no bando (ver gerarBandoInimigo) — sem isso os
  // dois aparecem com nome idêntico, impossível diferenciar quem já apanhou.
  return member.numeroInstancia ? `${base} (${member.numeroInstancia})` : base
}

// Quanto cada personagem do jogador contribuiu na luta (dano causado +
// quantos inimigos ele finalizou) — usado pra pesar a divisão de XP no
// final (GanguesVictory.jsx): quem mais lutou/matou ganha mais, mas todo
// mundo que participou ganha pelo menos alguma coisa. Reconstrói o PV de
// cada inimigo evento a evento (a partir do pvMax, que não muda durante a
// luta) só pra saber qual golpe foi o que derrubou cada um.
function computarContribuicoes(eventosBrutos, combatants) {
  const porId = {}
  const pvSimulado = new Map(combatants.filter(c => c.side === 'enemy').map(c => [c.key, c.pvMax]))
  for (const ev of eventosBrutos) {
    if (ev.type !== 'attack' || ev.side !== 'player') continue
    const ator = combatants.find(c => c.key === ev.actorKey)
    if (!ator) continue
    const stat = porId[ator.id] || (porId[ator.id] = { dano: 0, abates: 0 })
    stat.dano += ev.result?.damage || 0
    const antes = pvSimulado.get(ev.targetKey)
    if (antes != null) {
      const depois = Math.max(0, antes - (ev.result?.damage || 0))
      pvSimulado.set(ev.targetKey, depois)
      if (antes > 0 && depois <= 0) stat.abates += 1
    }
  }
  return porId
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
  if (event.type === 'item') {
    const actor = combatants.find(m => m.key === event.actorKey)
    const alvo = combatants.find(m => m.key === event.targetKey)
    const mesmo = !event.targetKey || event.targetKey === event.actorKey
    const chave = mesmo ? 'games.gangues.log_usou_item' : 'games.gangues.log_usou_item_em'
    return [{ id: event.id, kind: 'system', text: t(chave, { nome: fighterName(t, actor), alvo: fighterName(t, alvo), n: event.curado || 0 }) }]
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
    shieldConsumed: event.result.shieldConsumed || 0,
    attackerBonus: event.result.attackerBonus, defenderBonus: event.result.defenderBonus,
    critical: event.result.critical, criticalBonus: event.result.criticalBonus,
    activeSpecialId: event.result.activeSpecialId || null,
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
function Roster({ members, side, selectable, selectedKey, onSelect, actingKey, onAbrirFicha, dmgPops, t }) {
  return (
    <div className={`gang-roster gang-roster--${side}`}>
      {members.map(member => {
        const dead = member.pv <= 0
        const acted = side === 'player' && member.actedThisRound
        const acting = member.key === actingKey && !dead
        // ── Destaque de dano: barrinha "de sangue" drenando + número flutuante
        // + aviso quando a vida tá baixa (o Isaias reclamou que morria sem ver).
        const pvPct = Math.max(0, Math.min(100, (member.pv || 0) / (member.pvMax || 1) * 100))
        const pops = (dmgPops || []).filter(p => p.targetKey === member.key)
        const baixo = !dead && pvPct <= 20 ? (pvPct <= 10 ? 'gang-mini-wrap--critico' : 'gang-mini-wrap--baixo') : ''
        const wrapFx = `${pops.length ? ' gang-mini-wrap--hit' : ''}${baixo ? ` ${baixo}` : ''}`
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
          <div key={member.key} className={`gang-mini-wrap${wrapFx}`}>
            {pops.map(p => (
              <span key={p.id} className={`gang-dmg-pop${p.heal ? ' gang-dmg-pop--heal' : p.amount > 0 ? '' : ' gang-dmg-pop--zero'}${p.critical ? ' gang-dmg-pop--crit' : ''}${p.fatal ? ' gang-dmg-pop--fatal' : ''}`}>
                <b>{p.heal ? `+${p.heal}` : p.amount > 0 ? `−${p.amount}` : p.shield > 0 ? '🛡' : '0'}{p.critical && p.amount > 0 ? '!' : ''}</b>
                <small>{p.actorName}</small>
              </span>
            ))}
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
            <span className="gang-mini-nome">{nome}</span>
            <span className="gang-mini-bars" aria-label={nome}>
              <span className="gang-hpbar" role="progressbar" aria-valuenow={Math.max(0, member.pv || 0)} aria-valuemax={member.pvMax || 1}>
                <i className="gang-hpbar-ghost" style={{ width: `${pvPct}%` }} />
                <i className="gang-hpbar-fill" style={{ width: `${pvPct}%` }} />
              </span>
              <progress className="gang-mini-resource gang-mini-resource--pm" max={member.pmMax || 1} value={Math.max(0, member.pm || 0)} />
              {side === 'player' && <progress className="gang-mini-resource gang-mini-resource--xp" max={ganguesXpMaxForSheet(member)} value={progression.ap} />}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function GanguesCombat({ onNavigate }) {
  const { t } = useLanguage()
  const { perfil } = useAuth()
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
  // Inimigos que já soltaram a fala de "tô caindo" (enemy_near_death) — uma
  // vez por corpo, quando cruza ~1/3 do PV.
  const nearDeathFalou = useRef(new Set())
  const logEndRef = useRef(null)
  // Eventos brutos (com actorKey/targetKey, não só o texto já traduzido do
  // log) acumulados a luta inteira — dá pra calcular quem matou mais/bateu
  // mais dano só no final, sem precisar recomputar nada durante a luta.
  const eventosBrutosRef = useRef([])
  // Momento de KO — quando alguém (aliado OU inimigo) cai, para a leitura
  // com um overlay grande no centro em vez de um aviso discreto no topo que
  // passava batido. Fila: se cair mais de um no mesmo golpe (multidão),
  // mostra um de cada vez. Ver dispararProximoKo + o overlay .gang-ko-cena.
  const vivosAnterioresRef = useRef(new Set())
  const koQueueRef = useRef([])
  const koAtivoRef = useRef(false)
  const koTimerRef = useRef(null)
  const [koCena, setKoCena] = useState(null)
  const [aviso, setAviso] = useState(null)   // toast curto (ex: item não serve)
  // Callout GRANDE de dano no centro — fila própria (respeita o KO). O Isaias
  // reclamou 3× que o dano passava batido: agora é "FULANO LEVOU −7" no meio
  // da tela, um de cada vez.
  const [danoCena, setDanoCena] = useState(null)
  const danoQueueRef = useRef([])
  const danoAtivoRef = useRef(false)
  const danoTimerRef = useRef(null)
  const dispararProximoDano = useCallback(() => {
    clearTimeout(danoTimerRef.current)
    const next = danoQueueRef.current.shift()
    if (!next) { danoAtivoRef.current = false; setDanoCena(null); return }
    danoAtivoRef.current = true
    setDanoCena(next)
    danoTimerRef.current = setTimeout(() => dispararProximoDano(), next.dur || 820)
  }, [])
  useEffect(() => () => clearTimeout(danoTimerRef.current), [])
  // Números de dano flutuantes sobre quem apanhou (some sozinho ~1,4s depois).
  const [dmgPops, setDmgPops] = useState([])
  const dmgTimersRef = useRef([])
  useEffect(() => () => dmgTimersRef.current.forEach(clearTimeout), [])
  const soltarDmgPop = useCallback((pop) => {
    setDmgPops(prev => [...prev, pop])
    const to = setTimeout(() => setDmgPops(prev => prev.filter(x => x.id !== pop.id)), 1400)
    dmgTimersRef.current.push(to)
  }, [])
  // Nudge de tela quando um PERSONAGEM DO JOGADOR leva pancada (mais fraco que
  // o shake de crítico) — pra o dano não passar batido.
  const [hitNudge, setHitNudge] = useState(false)
  const hitNudgeTimerRef = useRef(null)
  const dispararNudge = useCallback(() => {
    setHitNudge(false)
    requestAnimationFrame(() => setHitNudge(true))
    clearTimeout(hitNudgeTimerRef.current)
    hitNudgeTimerRef.current = setTimeout(() => setHitNudge(false), 320)
  }, [])
  useEffect(() => () => clearTimeout(hitNudgeTimerRef.current), [])
  const dispararProximoKo = useCallback(() => {
    clearTimeout(koTimerRef.current)
    const next = koQueueRef.current.shift()
    if (!next) { koAtivoRef.current = false; setKoCena(null); return }
    koAtivoRef.current = true
    setKoCena(next)
    sfx.explosion?.()
    // Aliado caindo fica MAIS tempo na tela (pedido do Isaias — precisa ser
    // bem sinalizado); inimigo pode ser rapidinho.
    koTimerRef.current = setTimeout(() => dispararProximoKo(), next.side === 'enemy' ? 1500 : 3000)
  }, [])
  useEffect(() => () => clearTimeout(koTimerRef.current), [])

  // Shake + som de crítico — dispara toda vez que um golpe crítico resolve
  // (qualquer lado). Ver .gang-combat-fx--shake e sfx.attackCritical.
  const [critShake, setCritShake] = useState(false)
  const critShakeTimerRef = useRef(null)
  const dispararCriticoFx = useCallback(() => {
    sfx.attackCritical?.()
    setCritShake(false)
    requestAnimationFrame(() => setCritShake(true))
    clearTimeout(critShakeTimerRef.current)
    critShakeTimerRef.current = setTimeout(() => setCritShake(false), 450)
  }, [])
  useEffect(() => () => clearTimeout(critShakeTimerRef.current), [])

  // ── Modo Automático: liga e os personagens atacam sozinhos com o ataque
  // normal, sempre — quem quiser usar poder tem que desligar e voltar pro
  // manual. Liberado geral por enquanto (ver flag no topo do arquivo).
  const navigate = useNavigate()
  // Beta: o botão APARECE pra todo mundo (é chamariz de assinatura — o cara vê
  // toda hora que podia automatizar). `podeUsarModoAuto` só decide se toca ou
  // se manda pro /assinar. Hoje o flag está desligado → todo mundo pode.
  const podeUsarModoAuto = !MODO_AUTO_EXIGE_ASSINATURA || TIERS_COM_MODO_AUTO.includes(perfil?.tier)
  const [modoAutoOn, setModoAutoOn] = useState(false)
  const autoQueuedRef = useRef(false)
  const toggleModoAuto = () => {
    if (!podeUsarModoAuto) { navigate('/assinar'); return }
    setModoAutoOn(v => !v)
  }

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
  const [multidaoBlinkVisto, setMultidaoBlinkVisto] = useState(multidaoBlinkJaVisto)
  const modoMultidaoAtivo = multidaoDisponivel && modoMultidaoOn

  const [poderesMultidao, setPoderesMultidao] = useState({}) // sheetId -> specialId | null
  // Usar item na Briga em Multidão: marcar aqui abre mão do ataque daquele
  // personagem NA PRÓXIMA rodada (ver avancarRodadaMultidao). Sem sistema de
  // item de verdade ainda — reserva só o comportamento de "gastar a ação".
  const [itensMultidao, setItensMultidao] = useState({}) // sheetId -> true | undefined
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
  const toggleItemMultidao = (member) => {
    setItensMultidao(prev => ({ ...prev, [member.id]: !prev[member.id] }))
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

  // Detecta quem caiu — aliado E inimigo — comparando quem tava vivo no
  // render anterior com quem tá vivo agora (mesma lista dos dois modos).
  // Enfileira pro overlay de KO; sem isso o jogador só descobria olhando o
  // roster ficar cinza, fácil de não notar no meio da luta.
  useEffect(() => {
    const todos = [...players, ...enemies]
    const vivosAgora = new Set(todos.filter(c => c.pv > 0).map(c => c.key))
    const caiu = []
    for (const key of vivosAnterioresRef.current) {
      if (!vivosAgora.has(key)) {
        const c = todos.find(x => x.key === key)
        if (c) caiu.push({ nome: fighterName(t, c), side: c.side })
      }
    }
    if (caiu.length) {
      koQueueRef.current.push(...caiu)
      if (!koAtivoRef.current) dispararProximoKo()
    }
    vivosAnterioresRef.current = vivosAgora
  }, [players, enemies])

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
    eventosBrutosRef.current = [...eventosBrutosRef.current, ...newEvents]

    if (newEvents.some(event => event.type === 'attack' && event.result?.critical)) dispararCriticoFx()

    // Destaque de dano: callout GRANDE no centro (fila) + número flutuante +
    // shake do alvo + nudge de tela quando quem apanha é do jogador.
    for (const event of newEvents) {
      const alvo = machine.combatants.find(c => c.key === event.targetKey)
      const atacante = machine.combatants.find(c => c.key === event.actorKey)
      if (event.type === 'attack') {
        const dano = event.result?.damage || 0
        const fatal = (alvo?.pv ?? 1) <= 0
        const escudo = event.result?.shieldConsumed || 0
        // Golpe que NÃO tirou nada (guarda segurou, sem escudo consumido) não
        // mostra nada — nem número flutuante, nem callout (pedido do Isaias:
        // "quando não tá dando dano não precisa mostrar nada").
        if (dano > 0 || escudo > 0) {
          soltarDmgPop({
            id: event.id, targetKey: event.targetKey,
            actorName: fighterName(t, atacante) || '?', amount: dano,
            critical: Boolean(event.result?.critical), shield: escudo, fatal,
          })
          if (!fatal) {
            danoQueueRef.current.push({
              id: event.id,
              alvoNome: fighterName(t, alvo) || '?',
              atacanteNome: fighterName(t, atacante) || '?',
              valor: dano, critico: Boolean(event.result?.critical), escudo,
              side: alvo?.side || (event.side === 'player' ? 'enemy' : 'player'),
              dur: event.side === 'enemy' ? 1500 : 1050,
            })
            if (!danoAtivoRef.current) dispararProximoDano()
          }
          if (dano > 0 && !event.result?.critical) {
            sfx.attackPunch?.()
            if (event.side === 'enemy') dispararNudge()
          }
        }
      } else if (event.type === 'item' && (event.curado || 0) > 0) {
        soltarDmgPop({
          id: event.id, targetKey: event.targetKey,
          actorName: fighterName(t, atacante) || '?', amount: 0, heal: event.curado,
          critical: false, shield: 0, fatal: false,
        })
        danoQueueRef.current.push({
          id: event.id, cura: true,
          alvoNome: fighterName(t, alvo) || '?',
          atacanteNome: fighterName(t, atacante) || '?',
          valor: event.curado, side: 'player', dur: 1150,
        })
        if (!danoAtivoRef.current) dispararProximoDano()
      }
    }

    setLog(prev => {
      let next = prev
      for (const event of newEvents) next = [...next, ...transformarEvento(t, event, machine.combatants)]
      // Fala de "tô caindo": inimigo abaixo de ~1/3 do PV, ainda vivo, que
      // ainda não falou. Segue o mesmo contexto do trash-talk do encontro.
      for (const c of machine.combatants) {
        if (c.side !== 'enemy' || c.pv <= 0 || nearDeathFalou.current.has(c.key)) continue
        if (c.pv / (c.pvMax || 1) > 0.34) continue
        nearDeathFalou.current.add(c.key)
        if (Math.random() > 0.8) continue
        const line = pickTrash(t, c, 'enemy_near_death')
        if (line) next = [...next, { id: `nd-${c.key}-${Date.now()}`, kind: 'trash', sender: fighterName(t, c), text: line }]
      }
      return next
    })
  }, [machine.events, machine.combatants, t, modoMultidaoAtivo])

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [log])

  const sendPlayerTrash = (phrase) => {
    sfx.click()
    setLog(prev => [...prev, { id: `player-trash-${Date.now()}`, kind: 'trash', side: 'player', sender: players[0]?.sheet_name, text: phrase }])
    setTrashAberto(false)
  }

  // Aceita specialId explícito (a bolinha de ação chama isso direto ao
  // escolher um golpe na lista, sem precisar de um botão ATACAR separado
  // depois) — sem parâmetro, usa o que já tava selecionado (compat).
  const handleAttack = (specialId = selectedSpecialId) => {
    if (!selectedActor || !selectedTarget) return
    sfx.click()
    if (!switchTravado) setSwitchTravado(true)
    machine.playerAction(selectedActor, selectedTarget, specialId)
    setSelectedSpecialId(null)
  }

  // Itens disponíveis (quantidade > 0) — a bolinha só mostra o que a gangue
  // realmente tem, lido direto do inventário compartilhado (store.inventario).
  const itensDisponiveis = GANGUES_ITENS_LISTA
    .filter(item => item.tipo === 'cura_pv' || item.tipo === 'cura_pm')
    .map(item => ({ ...item, quantidade: store.inventario[item.id] || 0 }))
    .filter(item => item.quantidade > 0)

  // Usar item consome o turno do ATOR (quem tá na vez) igual um ataque, mas a
  // cura vai pro ALIADO escolhido — o tanque pode ficar curando o atacante.
  const handleUsarItem = (itemId, alvoKey) => {
    if (!selectedActor) return
    const item = getGanguesItem(itemId)
    if (!item) return
    const alvo = alvoKey || selectedActor
    // Não desperdiça o item se o alvo já tá cheio no recurso que ele cura.
    const alvoC = players.find(p => p.key === alvo)
    if (alvoC) {
      if (item.tipo === 'cura_pv' && alvoC.pv >= alvoC.pvMax) { setAviso(t('games.gangues.combat_item_cheio')); setTimeout(() => setAviso(null), 2200); return }
      if (item.tipo === 'cura_pm' && alvoC.pm >= alvoC.pmMax) { setAviso(t('games.gangues.combat_item_cheio')); setTimeout(() => setAviso(null), 2200); return }
    }
    if (!store.usarItem(itemId)) return
    sfx.reward?.()
    if (!switchTravado) setSwitchTravado(true)
    const delta = item.tipo === 'cura_pv' ? { pv: item.valor } : item.tipo === 'cura_pm' ? { pm: item.valor } : {}
    machine.useItemAction(selectedActor, alvo, itemId, delta)
  }

  // ── Modo Automático: quando é a vez do jogador, ataca sozinho com o
  // ataque normal (nunca poder) depois de uma pausa curta — dá pra ver o
  // alvo escolhido antes do golpe sair, em vez de resolver instantâneo.
  // autoQueuedRef evita disparar de novo enquanto o timer da rodada atual
  // ainda não resolveu (mesmo padrão do aiQueued em useGanguesTurnMachine).
  useEffect(() => {
    // koCena: o modo automático PARA enquanto o cartão de KO está na tela —
    // senão o próximo golpe já sai e o momento passa batido (era isso que o
    // Isaias via em auto). Quando o KO fecha, koCena volta a null e o efeito
    // re-dispara sozinho.
    if (modoMultidaoAtivo || !modoAutoOn || !podeUsarModoAuto || machine.phase !== 'player' || result || koCena || !selectedActor || !selectedTarget) {
      autoQueuedRef.current = false
      return
    }
    if (autoQueuedRef.current) return
    autoQueuedRef.current = true
    const timer = setTimeout(() => { handleAttack(null); autoQueuedRef.current = false }, 750)
    return () => clearTimeout(timer)
  }, [modoMultidaoAtivo, modoAutoOn, podeUsarModoAuto, machine.phase, result, koCena, selectedActor, selectedTarget])

  // ── Briga em Multidão: avança exatamente UMA rodada por clique — nunca a
  // luta inteira. Poderes são lidos na hora (o jogador pode trocar entre
  // rodadas, ciclando os chips). ──
  const avancarRodada = () => {
    if (revelandoRodada || result || !estadoMultidao) return
    sfx.vs?.()
    if (!switchTravado) setSwitchTravado(true)

    const especiaisPorPersonagem = {}
    for (const m of store.match.playerTeam) especiaisPorPersonagem[m.id] = getEquippedActiveGanguesSpecials(m)
    const proximoEstado = avancarRodadaMultidao(estadoMultidao, poderesMultidao, especiaisPorPersonagem, itensMultidao)
    // "Usar item" é por rodada (consumível, não um poder fixo) — some depois
    // de gastar, senão o personagem ficaria abrindo mão do ataque pra sempre.
    setItensMultidao({})

    setRevelandoRodada(true)
    setTimeout(() => {
      setEstadoMultidao(proximoEstado)
      eventosBrutosRef.current = [...eventosBrutosRef.current, ...proximoEstado.eventosRodada]
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
    const contribuicoes = computarContribuicoes(eventosBrutosRef.current, combatants)
    store.setBattleReport({ outcome: result, entries: log, initiative, combatants, rounds, contribuicoes })
    onNavigate('victory')
  }

  if (!store.match.playerTeam?.length) return null

  return (
    <div className="gang-combat gang-container">
      {/* Saída do automático — direto no .gang-combat (fora do wrapper que
          treme no crítico) e com z-index acima de TODOS os overlays
          (dado/KO/resultado usam 9999). Aparece sempre que o auto está
          ligado; um toque volta pro manual (a ação em andamento resolve
          sozinha, o efeito de auto-ataque para de enfileirar). */}
      {!modoMultidaoAtivo && modoAutoOn && !result && (
        <button type="button" className="gang-auto-sair" onClick={() => setModoAutoOn(false)}>
          <b>■</b>{t('games.gangues.auto.sair')}
        </button>
      )}
      <AnimatePresence>
        {aviso && (
          <motion.div className="gang-combat-aviso" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {aviso}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {danoCena && !koCena && (
          <motion.div
            key={danoCena.id}
            className={`gang-dano-cena gang-dano-cena--${danoCena.cura ? 'cura' : danoCena.side === 'player' ? 'aliado' : 'inimigo'}${danoCena.critico ? ' gang-dano-cena--crit' : ''}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.i className="gang-dano-cena__faixa" aria-hidden="true"
              initial={{ scaleX: 0, opacity: 0.9 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }} />
            <motion.div className="gang-dano-cena__txt"
              initial={{ scale: 0.7, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: -8 }}
              transition={{ type: 'spring', stiffness: 340, damping: 16 }}>
              {danoCena.critico && <span className="gang-dano-cena__tag">{t('games.gangues.critico')}</span>}
              <strong className="gang-dano-cena__nome">{danoCena.alvoNome}</strong>
              <span className="gang-dano-cena__valor">
                {danoCena.cura ? `+${danoCena.valor}` : danoCena.valor > 0 ? `−${danoCena.valor}` : '🛡'}
              </span>
              <span className="gang-dano-cena__rot">
                {danoCena.cura
                  ? t('games.gangues.dano_cena_cura', { nome: danoCena.atacanteNome })
                  : danoCena.valor > 0
                    ? t('games.gangues.dano_cena_dano', { nome: danoCena.atacanteNome })
                    : t('games.gangues.dano_cena_guarda', { n: danoCena.escudo })}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {koCena && (
          <motion.div
            className={`gang-ko-cena gang-ko-cena--${koCena.side === 'enemy' ? 'inimigo' : 'aliado'}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dispararProximoKo()}
          >
            <motion.div
              className="gang-ko-cena__card"
              initial={{ scale: 0.65, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 17 }}
            >
              <motion.span
                className="gang-ko-cena__skull"
                initial={{ rotate: -18, scale: 0.8 }} animate={{ rotate: [-18, 12, -6, 0], scale: 1 }} transition={{ duration: 0.5 }}
              >💀</motion.span>
              <strong className="gang-ko-cena__nome">{koCena.nome}</strong>
              <span className="gang-ko-cena__label">{t(koCena.side === 'enemy' ? 'games.gangues.ko_cena.inimigo' : 'games.gangues.ko_cena.aliado')}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {machine.pending && !modoMultidaoAtivo && (
          <DramaticDice
            key={`${machine.pending.actorKey}-${machine.round}`}
            finalValue={machine.pending.result.rolls.fa}
            sides={3}
            side={machine.pending.side}
            attackerName={fighterName(t, machine.combatants.find(item => item.key === machine.pending.actorKey))}
            targetName={fighterName(t, machine.combatants.find(item => item.key === machine.pending.targetKey))}
            powerName={machine.pending.result.activeSpecialId ? t(`games.gangues.progression.skills.${machine.pending.result.activeSpecialId}`) : null}
            theme={getGanguesEffectTheme(machine.pending.result.activeSpecialId)}
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
              <GanguesFichaCard
                nome={fighterName(t, fichaAberta)}
                caminho={fichaAberta.combat_path}
                nivel={fichaAberta.side !== 'enemy' ? fichaAberta.level : null}
                atributos={fichaAberta.attributes || fichaAberta.stats}
                pv={{ atual: fichaAberta.pv || 0, max: fichaAberta.pvMax || 1 }}
                pm={{ atual: fichaAberta.pm || 0, max: fichaAberta.pmMax || 0 }}
                xp={fichaAberta.side !== 'enemy' ? (() => {
                  const progression = getGanguesProgression(fichaAberta)
                  return { atual: progression.ap, max: ganguesXpMaxForSheet(fichaAberta), disponivel: progression.xp_unspent }
                })() : null}
              />
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

      <div className={`gang-combat-fx${critShake ? ' gang-combat-fx--shake' : ''}${hitNudge ? ' gang-combat-fx--nudge' : ''}`}>
      <div className="gang-vs-bar">
        <button className="gang-vs-bar-back" onClick={() => onNavigate('territorio')}>{t('games.gangues.btn_sair')}</button>
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
            className={`gang-multidao-switch ${modoMultidaoOn ? 'gang-multidao-switch--on' : ''} ${!multidaoBlinkVisto && !modoMultidaoOn ? 'gang-multidao-switch--blink' : ''}`}
            disabled={switchTravado}
            title={t('games.gangues.multidao.switch_titulo')}
            onClick={() => { setModoMultidaoOn(!modoMultidaoOn); if (!multidaoBlinkVisto) { marcarMultidaoBlinkVisto(); setMultidaoBlinkVisto(true) } }}
          >
            <span className="gang-multidao-switch-track"><span className="gang-multidao-switch-bolinha" /></span>
            <small>{t('games.gangues.multidao.switch_label')}</small>
          </button>
        )}
        {multidaoDisponivel && <GanguesMultidaoTutorial />}
        {/* Modo automático saiu da barra do topo pro menu da bolinha de ação
            (pedido do Isaias) — ver <GanguesActionOrb autoOn ... />. */}
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
        onAbrirFicha={setFichaAberta} dmgPops={dmgPops} t={t}
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
          const fxLog = getGanguesEffectTheme(entry.activeSpecialId)
          return (
            <motion.div key={entry.id} className={`gang-msg-wrap ${isPlayer ? 'gang-msg-wrap--player' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`gang-msg-avatar ${isPlayer ? 'gang-msg-avatar--player' : 'gang-msg-avatar--enemy'}`}>{entry.actorName[0]}</div>
              <div className="gang-attack-stack">
                <div className={`gang-attack-card gang-attack-card--${isPlayer ? 'player' : 'enemy'} ${fxLog ? 'gang-attack-card--fx' : ''}`} style={fxLog ? { '--fx-rgb': fxLog.rgb } : undefined}>
                  <div className="gang-attack-card-header">{entry.actorName}{fxLog && <em className="gang-attack-card-power">{fxLog.glyphs[0]} {t(`games.gangues.progression.skills.${entry.activeSpecialId}`)}</em>}</div>
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
                    {entry.shieldConsumed > 0 && (
                      <div className="gang-attack-card-bonus gang-attack-card-bonus--hit">
                        🛡️ {t('games.gangues.card_escudo')} −{entry.shieldConsumed}
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
        onAbrirFicha={setFichaAberta} dmgPops={dmgPops} t={t}
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
                const usandoItem = Boolean(itensMultidao[member.id])
                const rotulo = usandoItem ? t('games.gangues.multidao.vai_usar_item') : escolhido ? t(`games.gangues.progression.skills.${escolhido}`) : t('games.gangues.combat_specials.normal_attack')
                return (
                  <div key={member.id} className="gang-multidao-chip-wrap">
                    <button
                      type="button"
                      disabled={!especiais.length}
                      className={`gang-multidao-chip ${escolhido ? 'gang-multidao-chip--poder' : ''} ${usandoItem ? 'gang-multidao-chip--item' : ''}`}
                      onClick={() => cicloPoderMultidao(member)}
                    >
                      <strong>{member.sheet_name}</strong>
                      <small>{rotulo}</small>
                    </button>
                    <button
                      type="button"
                      className={`gang-multidao-item-toggle ${usandoItem ? 'gang-multidao-item-toggle--on' : ''}`}
                      title={t('games.gangues.multidao.usar_item')}
                      onClick={() => toggleItemMultidao(member)}
                    >
                      🎒
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="gang-actions-row">
            <button className="gang-exit-btn" onClick={() => onNavigate('territorio')}>{t('games.gangues.btn_sair')}</button>
            <button className="gang-attack-btn" disabled={revelandoRodada || !estadoMultidao} onClick={avancarRodada}>
              {t('games.gangues.multidao.avancar_rodada')}
            </button>
          </div>
        </div>
      )}

      {!modoMultidaoAtivo && machine.phase === 'player' && !result && <GanguesCombatTutorial />}

      {!modoMultidaoAtivo && machine.phase === 'player' && !result && (
        <GanguesActionOrb
          t={t}
          atorNome={fighterName(t, machine.currentActor)}
          disabled={!selectedActor || !selectedTarget}
          equippedSpecials={equippedSpecials}
          canAffordSpecial={canAffordSpecial}
          itens={itensDisponiveis}
          aliados={players.map(p => ({ key: p.key, nome: fighterName(t, p), pv: Math.max(0, p.pv || 0), pvMax: p.pvMax || 1, pm: Math.max(0, p.pm || 0), pmMax: p.pmMax || 0, dead: p.pv <= 0 }))}
          onAtacar={() => handleAttack(null)}
          onUsarPoder={specialId => handleAttack(specialId)}
          onUsarItem={(itemId, alvoKey) => handleUsarItem(itemId, alvoKey)}
          autoOn={modoAutoOn}
          autoBloqueado={!podeUsarModoAuto}
          onToggleAuto={toggleModoAuto}
        />
      )}
      {!modoMultidaoAtivo && machine.phase === 'enemy' && !machine.pending && <div className="gang2-enemy-thinking"><span className="gang-thinking-pulse" /><strong>{t('games.gangues.report.enemy_thinking')}</strong><small>{t('games.gangues.report.enemy_strategy')}</small></div>}
      </div>
    </div>
  )
}
