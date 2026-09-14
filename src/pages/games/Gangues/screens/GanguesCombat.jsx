import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useEventos } from '../../../../context/EventosContext'
import { useGanguesStore } from '../store/useGanguesStore'
import useGanguesTurnMachine from '../hooks/useGanguesTurnMachine'
import useGanguesCombatFx from '../hooks/useGanguesCombatFx.js'
import useGanguesModoAuto from '../hooks/useGanguesModoAuto.js'
import useGanguesModoAutoMultidao from '../hooks/useGanguesModoAutoMultidao.js'
import useGanguesModoMultidao from '../hooks/useGanguesModoMultidao.js'
import useGanguesBattleOutcome from '../hooks/useGanguesBattleOutcome.js'
import useGanguesCombatLog from '../hooks/useGanguesCombatLog.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'
import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import { GANGUES_ITENS_LISTA, getGanguesItem } from '../data/ganguesItens.js'
import GanguesCombatTutorial from '../components/GanguesCombatTutorial'
import GanguesKoTutorial from '../components/GanguesKoTutorial'
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
  // Botão de sair do automático: a ÚNICA coisa que dá pra monitorar em modo
  // automático é o PV dos próprios lutadores (pedido do Isaias, 13/09/2026,
  // depois de ver o botão tampando a barra de PV do roster do jogador) — por
  // isso a posição dele NUNCA pode ser um número de "top" chutado, tem que
  // sempre respeitar a altura de verdade do roster do jogador (que muda com o
  // tamanho do time e pode quebrar linha). Medido de verdade via
  // ResizeObserver, com fallback pro valor antigo enquanto não mediu ainda.
  const playerRosterRef = useRef(null)
  const [autoSairTop, setAutoSairTop] = useState(null)
  useLayoutEffect(() => {
    const el = playerRosterRef.current
    if (!el) return
    const medir = () => setAutoSairTop(el.getBoundingClientRect().bottom + 10)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    window.addEventListener('resize', medir)
    return () => { ro.disconnect(); window.removeEventListener('resize', medir) }
  }, [])
  // Eventos brutos (com actorKey/targetKey, não só o texto já traduzido do
  // log) acumulados a luta inteira — dá pra calcular quem matou mais/bateu
  // mais dano só no final, sem precisar recomputar nada durante a luta.
  // Compartilhado entre useGanguesCombatLog, useGanguesModoMultidao e
  // openBattleReport — por isso vive aqui, não dentro de nenhum hook.
  const eventosBrutosRef = useRef([])
  const [aviso, setAviso] = useState(null)   // toast curto (ex: item não serve)

  const fx = useGanguesCombatFx()
  const battleOutcome = useGanguesBattleOutcome({ store, t, registrarEvento, onNavigate })
  const { result, falaFinal, showResultBtn, finish, openBattleReport } = battleOutcome

  // O switch da Briga em Multidão precisa ser conhecido ANTES de construir o
  // motor normal (useGanguesTurnMachine) — ele usa isso pra PAUSAR o próprio
  // efeito de IA enquanto a Multidão estiver no controle. Sem isso, o motor
  // normal continuava rodando escondido atrás da UI da Multidão e resolvia o
  // ataque do inimigo em segredo (bug reportado pelo Isaias, 2026-09-14: "só
  // de apertar o botãozinho já para os inimigos de atacar" — na real o
  // ataque acontecia sim, só que invisível). Por isso o estado mora aqui
  // (não mais dentro de useGanguesModoMultidao) e é passado pros dois lados.
  const [modoMultidaoOn, setModoMultidaoOn] = useState(false)
  const multidaoDisponivelPreMachine = ((store.match.playerTeam?.length || 0) + (store.match.enemyTeam?.length || 0)) >= 5
  const modoMultidaoAtivoPreMachine = multidaoDisponivelPreMachine && modoMultidaoOn
  // Pergunta de início de luta (pedido do Isaias, 2026-09-14): toda luta
  // elegível pra Multidão (5+ combatentes) PARA TUDO antes do 1º ataque e
  // pergunta Sim/Não. Sim = já começa a rodada 1 em Multidão (contínua até o
  // jogador desligar no switch); Não = combate normal, jogador liga o switch
  // manualmente depois se quiser (respeitando a trava de "só na sua vez").
  // Só combates SEM elegibilidade (menos de 5 combatentes) pulam a pergunta
  // direto (`respondida` já nasce true).
  const [multidaoPromptRespondida, setMultidaoPromptRespondida] = useState(!multidaoDisponivelPreMachine)
  const perguntaMultidaoAtiva = multidaoDisponivelPreMachine && !multidaoPromptRespondida

  const machine = useGanguesTurnMachine({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam, onFinish: finish, pausado: modoMultidaoAtivoPreMachine || perguntaMultidaoAtiva })

  const multidao = useGanguesModoMultidao({ store, machine, t, setLog, eventosBrutosRef, finish, result, modoMultidaoOn, setModoMultidaoOn })
  const { modoMultidaoAtivo, estadoMultidao, multidaoDisponivel, alternarMultidao, multidaoBlinkVisto, poderesMultidao, itensMultidao, cicloPoderMultidao, toggleItemMultidao, avancarRodada, revelandoRodada } = multidao
  const modoAutoMultidao = useGanguesModoAutoMultidao({
    modoMultidaoAtivo, estadoMultidao, revelandoRodada, result, koCena: fx.koCena, avancarRodada,
  })

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
    .filter(item => item.tipo === 'cura_pv' || item.tipo === 'cura_pm' || item.tipo === 'poder_unico')
    .map(item => ({ ...item, quantidade: store.inventario[item.id] || 0 }))
    .filter(item => item.quantidade > 0)

  // Usar item consome o turno do ATOR (quem tá na vez) igual um ataque, mas a
  // cura vai pro ALIADO escolhido — o tanque pode ficar curando o atacante.
  // `poder_unico` é diferente: é um golpe de ataque (chip emprestando um
  // poder que o personagem nem treinou), então o alvo é um INIMIGO — usa o
  // `selectedTarget` que o fluxo de ataque normal já mantém, não o
  // aliado/`alvoKey` que a cura usa.
  const handleUsarItem = (itemId, alvoKey) => {
    if (!selectedActor) return
    const item = getGanguesItem(itemId)
    if (!item) return
    if (item.tipo === 'poder_unico') {
      if (!selectedTarget) return
      if (!store.usarItem(itemId)) return
      sfx.reward?.()
      machine.playerAction(selectedActor, selectedTarget, item.poderId, { id: item.poderId, level: item.poderNivel || 1 })
      return
    }
    const alvo = alvoKey || selectedActor
    // Não desperdiça o item se o alvo já tá cheio no recurso que ele cura.
    const alvoC = players.find(p => p.key === alvo)
    if (alvoC) {
      if (item.tipo === 'cura_pv' && alvoC.pv >= alvoC.pvMax) { setAviso(t('games.gangues.combat_item_cheio')); setTimeout(() => setAviso(null), 2200); return }
      if (item.tipo === 'cura_pm' && alvoC.pm >= alvoC.pmMax) { setAviso(t('games.gangues.combat_item_cheio')); setTimeout(() => setAviso(null), 2200); return }
    }
    if (!store.usarItem(itemId)) return
    sfx.reward?.()
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

  // Vinheta de PV baixo — o farol de cada quadradinho no roster
  // (GanguesCombatRedesign.css .gang-mini-wrap--baixo/--critico) some fácil
  // no meio da luta, coberto pelo modal de dado, ficha aberta, toast etc. O
  // Isaias pediu "sobre tudo, em tempo real" E a régua certa de farol: <=50%
  // PV já começa um aviso leve, <=25% já é o efeito pesado/vermelho de "tá
  // perto de morrer" (não só nos últimos 10%). Duas vinhetas, a mais forte
  // tem prioridade; atualiza sozinha a cada render (`players` = estado vivo).
  const menorPvPctJogador = players.reduce((min, p) => p.pv > 0 ? Math.min(min, (p.pv / (p.pvMax || 1)) * 100) : min, 100)
  const algumJogadorCritico = menorPvPctJogador <= 25
  const algumJogadorAviso = !algumJogadorCritico && menorPvPctJogador <= 50

  return (
    <div className="gang-combat gang-container">
      {/* Pergunta de início de luta (pedido do Isaias, 2026-09-14): toda luta
          elegível pra Multidão para tudo (motor normal pausado — ver
          `pausado` em useGanguesTurnMachine — e nada de roster/orb clicável
          aqui embaixo) até o jogador escolher Sim/Não. Backdrop sólido de
          propósito: nenhum ataque pode acontecer atrás dela. */}
      {perguntaMultidaoAtiva && (
        <div className="gang-multidao-prompt-overlay">
          <div className="gang-multidao-prompt-box">
            <p className="gang-multidao-prompt-texto">{t('games.gangues.multidao.prompt_pergunta')}</p>
            <div className="gang-multidao-prompt-acoes">
              <button
                type="button"
                className="gang-multidao-prompt-btn gang-multidao-prompt-btn--sim"
                onClick={() => { setModoMultidaoOn(true); setMultidaoPromptRespondida(true) }}
              >
                {t('games.gangues.multidao.prompt_sim')}
              </button>
              <button
                type="button"
                className="gang-multidao-prompt-btn"
                onClick={() => setMultidaoPromptRespondida(true)}
              >
                {t('games.gangues.multidao.prompt_nao')}
              </button>
            </div>
          </div>
        </div>
      )}
      {!result && algumJogadorCritico && <div className="gang-critico-vinheta" aria-hidden="true" />}
      {!result && algumJogadorAviso && <div className="gang-critico-vinheta gang-critico-vinheta--aviso" aria-hidden="true" />}
      {/* Saída do automático — direto no .gang-combat (fora do wrapper que
          treme no crítico) e com z-index acima de TODOS os overlays
          (dado/KO/resultado usam 9999). Aparece sempre que o auto está
          ligado; um toque volta pro manual (a ação em andamento resolve
          sozinha, o efeito de auto-ataque para de enfileirar). */}
      {!modoMultidaoAtivo && modoAuto.modoAutoOn && !result && (
        <button
          type="button"
          className="gang-auto-sair"
          style={autoSairTop != null ? { top: `${autoSairTop}px` } : undefined}
          onClick={() => modoAuto.setModoAutoOn(false)}
        >
          <b>■</b>{t('games.gangues.auto.sair')}
        </button>
      )}
      {modoMultidaoAtivo && modoAutoMultidao.modoAutoMultidaoOn && !result && (
        <button
          type="button"
          className="gang-auto-sair"
          style={autoSairTop != null ? { top: `${autoSairTop}px` } : undefined}
          onClick={() => modoAutoMultidao.setModoAutoMultidaoOn(false)}
        >
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
        estadoMultidao={estadoMultidao} result={result} revelandoRodada={revelandoRodada}
        multidaoDisponivel={multidaoDisponivel} modoMultidaoOn={modoMultidaoOn} alternarMultidao={alternarMultidao}
        multidaoBlinkVisto={multidaoBlinkVisto}
        trashOptions={trashOptions} trashAberto={trashAberto} setTrashAberto={setTrashAberto} sendPlayerTrash={sendPlayerTrash}
      />

      <GanguesCombatRoster
        ref={playerRosterRef}
        members={players} side="player"
        selectable={!modoMultidaoAtivo && !perguntaMultidaoAtiva && machine.phase === 'player'}
        selectedKey={selectedActor} onSelect={modoMultidaoAtivo ? undefined : setSelectedActor}
        actingKey={modoMultidaoAtivo ? null : machine.currentActor?.key}
        onAbrirFicha={setFichaAberta} dmgPops={fx.dmgPops} t={t}
      />

      <GanguesCombatLogList log={log} t={t} ref={logEndRef} />

      <GanguesCombatRoster
        members={enemies} side="enemy"
        selectable={!modoMultidaoAtivo && !perguntaMultidaoAtiva && machine.phase === 'player'}
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
          autoOn={modoAutoMultidao.modoAutoMultidaoOn} onToggleAuto={modoAutoMultidao.toggleModoAutoMultidao}
        />
      )}

      {!modoMultidaoAtivo && !perguntaMultidaoAtiva && machine.phase === 'player' && !result && <GanguesCombatTutorial />}
      <GanguesKoTutorial koSide={fx.koCena?.side} />

      {!modoMultidaoAtivo && !perguntaMultidaoAtiva && machine.phase === 'player' && !result && (
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
