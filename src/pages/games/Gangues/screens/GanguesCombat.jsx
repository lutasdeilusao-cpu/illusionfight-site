import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useEventos } from '../../../../context/EventosContext'
import { useGanguesStore } from '../store/useGanguesStore'
import useGanguesTurnMachine from '../hooks/useGanguesTurnMachine'
import useGanguesCombatFx from '../hooks/useGanguesCombatFx.js'
import useGanguesModoAuto from '../hooks/useGanguesModoAuto.js'
import useGanguesModoMultidao from '../hooks/useGanguesModoMultidao.js'
import useGanguesBattleOutcome from '../hooks/useGanguesBattleOutcome.js'
import useGanguesCombatLog from '../hooks/useGanguesCombatLog.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'
import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import { GANGUES_ITENS_LISTA, getGanguesItem } from '../data/ganguesItens.js'
import GanguesCombatTutorial from '../components/GanguesCombatTutorial'
import GanguesCombatRoster from '../components/GanguesCombatRoster'
import GanguesCombatTopBar from '../components/GanguesCombatTopBar'
import GanguesCombatLogList from '../components/GanguesCombatLogList'
import GanguesCombatOverlays from '../components/GanguesCombatOverlays'
import GanguesMultidaoActionBar from '../components/GanguesMultidaoActionBar'
import GanguesActionOrb from '../components/GanguesActionOrb'
import { sfx } from '../../../../lib/sfx'
import './GanguesCombatRedesign.css'

// Orquestrador do combate — a resolução de log/FX, os modos automático e
// Multidão, e o desfecho de batalha viraram hooks próprios; os overlays e o
// roster viraram componentes de apresentação. Ver
// PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6.
export default function GanguesCombat({ onNavigate }) {
  const { t } = useLanguage()
  const { perfil } = useAuth()
  const { registrarEvento } = useEventos()
  const store = useGanguesStore()
  const [selectedActor, setSelectedActor] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedSpecialId, setSelectedSpecialId] = useState(null)
  const [log, setLog] = useState([])
  const [trashOptions, setTrashOptions] = useState([])
  const [trashAberto, setTrashAberto] = useState(false)
  const [fichaAberta, setFichaAberta] = useState(null) // combatant ou null — popup de status completo
  const logEndRef = useRef(null)
  // Eventos brutos (com actorKey/targetKey, não só o texto já traduzido do
  // log) acumulados a luta inteira — dá pra calcular quem matou mais/bateu
  // mais dano só no final, sem precisar recomputar nada durante a luta.
  // Compartilhado entre useGanguesCombatLog, useGanguesModoMultidao e
  // openBattleReport — por isso vive aqui, não dentro de nenhum hook.
  const eventosBrutosRef = useRef([])
  const [aviso, setAviso] = useState(null)   // toast curto (ex: item não serve)
  const [switchTravado, setSwitchTravado] = useState(false)

  const fx = useGanguesCombatFx()
  const battleOutcome = useGanguesBattleOutcome({ store, t, registrarEvento, onNavigate })
  const { result, falaFinal, showResultBtn, finish, openBattleReport } = battleOutcome

  const machine = useGanguesTurnMachine({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam, onFinish: finish })

  const multidao = useGanguesModoMultidao({
    store, machine, t, setLog, eventosBrutosRef, finish, result, switchTravado, setSwitchTravado,
  })
  const { modoMultidaoAtivo, estadoMultidao, multidaoDisponivel, modoMultidaoOn, setModoMultidaoOn, multidaoBlinkVisto, marcarBlinkVisto, poderesMultidao, itensMultidao, cicloPoderMultidao, toggleItemMultidao, avancarRodada, revelandoRodada } = multidao

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
  const vivosAnterioresRef = useRef(new Set())
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
      fx.koQueueRef.current.push(...caiu)
      if (!fx.koAtivoRef.current) fx.dispararProximoKo()
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

  useGanguesCombatLog({
    modoMultidaoAtivo, machine, t, eventosBrutosRef, setLog,
    dispararCriticoFx: fx.dispararCriticoFx, soltarDmgPop: fx.soltarDmgPop,
    danoQueueRef: fx.danoQueueRef, danoAtivoRef: fx.danoAtivoRef,
    dispararProximoDano: fx.dispararProximoDano, dispararNudge: fx.dispararNudge,
  })

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

  const modoAuto = useGanguesModoAuto({
    perfil, modoMultidaoAtivo, machinePhase: machine.phase, result, koCena: fx.koCena,
    selectedActor, selectedTarget, handleAttack,
  })

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

  if (!store.match.playerTeam?.length) return null

  // Alguém do SEU lado tá quase apagando (<=10% PV)? O farol de cada
  // quadradinho no roster (GanguesCombatRedesign.css .gang-mini-wrap--critico)
  // some fácil no meio da luta — coberto pelo modal de dado, ficha aberta,
  // toast de recompensa etc. O Isaias pediu algo "sobre tudo, em tempo
  // real": uma vinheta na borda da tela inteira, no z-index mais alto do
  // combate, que nenhum overlay consegue tampar — atualiza sozinha a cada
  // render porque `players` já é o estado vivo do turno.
  const algumJogadorCritico = players.some(p => p.pv > 0 && (p.pv / (p.pvMax || 1)) <= 0.10)

  return (
    <div className="gang-combat gang-container">
      {algumJogadorCritico && !result && <div className="gang-critico-vinheta" aria-hidden="true" />}
      {/* Saída do automático — direto no .gang-combat (fora do wrapper que
          treme no crítico) e com z-index acima de TODOS os overlays
          (dado/KO/resultado usam 9999). Aparece sempre que o auto está
          ligado; um toque volta pro manual (a ação em andamento resolve
          sozinha, o efeito de auto-ataque para de enfileirar). */}
      {!modoMultidaoAtivo && modoAuto.modoAutoOn && !result && (
        <button type="button" className="gang-auto-sair" onClick={() => modoAuto.setModoAutoOn(false)}>
          <b>■</b>{t('games.gangues.auto.sair')}
        </button>
      )}

      <GanguesCombatOverlays
        t={t} aviso={aviso} danoCena={fx.danoCena} koCena={fx.koCena}
        dispararProximoKo={fx.dispararProximoKo} machine={machine} modoMultidaoAtivo={modoMultidaoAtivo}
        revelandoRodada={revelandoRodada} fichaAberta={fichaAberta} setFichaAberta={setFichaAberta}
        falaFinal={falaFinal} result={result} showResultBtn={showResultBtn}
        openBattleReport={() => openBattleReport({ modoMultidaoAtivo, estadoMultidao, machine, log, eventosBrutosRef })}
        enemy={store.match.enemy}
      />

      <div className={`gang-combat-fx${fx.critShake ? ' gang-combat-fx--shake' : ''}${fx.hitNudge ? ' gang-combat-fx--nudge' : ''}`}>
      <GanguesCombatTopBar
        t={t} onNavigate={onNavigate} machine={machine} modoMultidaoAtivo={modoMultidaoAtivo}
        estadoMultidao={estadoMultidao} result={result}
        multidaoDisponivel={multidaoDisponivel} modoMultidaoOn={modoMultidaoOn} setModoMultidaoOn={setModoMultidaoOn}
        switchTravado={switchTravado} multidaoBlinkVisto={multidaoBlinkVisto} marcarBlinkVisto={marcarBlinkVisto}
        trashOptions={trashOptions} trashAberto={trashAberto} setTrashAberto={setTrashAberto} sendPlayerTrash={sendPlayerTrash}
      />

      <GanguesCombatRoster
        members={players} side="player"
        selectable={!modoMultidaoAtivo && machine.phase === 'player'}
        selectedKey={selectedActor} onSelect={modoMultidaoAtivo ? undefined : setSelectedActor}
        actingKey={modoMultidaoAtivo ? null : machine.currentActor?.key}
        onAbrirFicha={setFichaAberta} dmgPops={fx.dmgPops} t={t}
      />

      <GanguesCombatLogList log={log} t={t} ref={logEndRef} />

      <GanguesCombatRoster
        members={enemies} side="enemy"
        selectable={!modoMultidaoAtivo && machine.phase === 'player'}
        selectedKey={selectedTarget} onSelect={modoMultidaoAtivo ? undefined : setSelectedTarget}
        actingKey={modoMultidaoAtivo ? null : machine.currentActor?.key}
        onAbrirFicha={setFichaAberta} dmgPops={fx.dmgPops} t={t}
      />

      {/* ── Modo Briga em Multidão: poderes configuráveis por toque + avançar rodada ── */}
      {modoMultidaoAtivo && !result && (
        <GanguesMultidaoActionBar
          t={t} onNavigate={onNavigate} playerTeam={store.match.playerTeam}
          poderesMultidao={poderesMultidao} itensMultidao={itensMultidao}
          cicloPoderMultidao={cicloPoderMultidao} toggleItemMultidao={toggleItemMultidao}
          avancarRodada={avancarRodada} revelandoRodada={revelandoRodada} estadoMultidao={estadoMultidao}
        />
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
          autoOn={modoAuto.modoAutoOn}
          autoBloqueado={!modoAuto.podeUsarModoAuto}
          onToggleAuto={modoAuto.toggleModoAuto}
        />
      )}
      {!modoMultidaoAtivo && machine.phase === 'enemy' && !machine.pending && <div className="gang2-enemy-thinking"><span className="gang-thinking-pulse" /><strong>{t('games.gangues.report.enemy_thinking')}</strong><small>{t('games.gangues.report.enemy_strategy')}</small></div>}
      </div>
    </div>
  )
}
