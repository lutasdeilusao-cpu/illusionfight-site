import { ST_TODOS } from '../engine/ganguesStatus.js'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useEventos } from '../../../../context/EventosContext'
import { useGanguesStore } from '../store/useGanguesStore'
import useGanguesTurnMachine from '../hooks/useGanguesTurnMachine'
import useGanguesCombatFx from '../hooks/useGanguesCombatFx.js'
import useGanguesModoAuto, { useGanguesAutoConfig, escolherAcaoAuto } from '../hooks/useGanguesModoAuto.js'
import useGanguesVelocidadeAuto, { useGanguesAutoLembrado, useEscolhaMultidao } from '../hooks/useGanguesVelocidadeAuto.js'
import useGanguesModoMultidao from '../hooks/useGanguesModoMultidao.js'
import useGanguesBattleOutcome from '../hooks/useGanguesBattleOutcome.js'
import useGanguesCombatLog from '../hooks/useGanguesCombatLog.js'
import useGanguesDanoAoVivo from '../hooks/useGanguesDanoAoVivo.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'
import { getGanguesPortraitByTemplateId } from '../data/ganguesPortraits.js'
import { precarregarAnimacaoCombate } from '../data/ganguesCombatAnimations.js'
import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import { GANGUES_ITENS_LISTA, GANGUES_TIPOS_USO_COMBATE, getGanguesItem } from '../data/ganguesItens.js'
import GanguesCombatTutorial from '../components/GanguesCombatTutorial'
import GanguesKoTutorial from '../components/GanguesKoTutorial'
import GanguesCombatRoster from '../components/GanguesCombatRoster'
import GanguesCombatTopBar from '../components/GanguesCombatTopBar'
import GanguesPistaTempo from '../components/GanguesPistaTempo'
import GanguesCombatLogList from '../components/GanguesCombatLogList'
import GanguesAutoBolinhas from '../components/GanguesAutoBolinhas'
import GanguesCombatOverlays from '../components/GanguesCombatOverlays'
import GanguesMultidaoActionBar from '../components/GanguesMultidaoActionBar'
import GanguesMultidaoTatica from '../components/GanguesMultidaoTatica'
import { regraMultidao } from '../engine/ganguesBrigaMultidao.js'
import GanguesActionOrb from '../components/GanguesActionOrb'
import GanguesCombatSairConfirm from '../components/GanguesCombatSairConfirm'
import { useGanguesAvancoAutomatico, GANGUES_AVANCO_AUTO_MS, useBrigaDeRua } from '../hooks/useGanguesBrigaAutomatica.js'
import { lutaAoVivo } from '../engine/ganguesFarmAusente.js'
import { sfx } from '../../../../lib/sfx'
import './GanguesCombat.css'

// Orquestrador do combate: junta o motor golpe a golpe, a Briga em
// Multidão, o automático, o registro/FX e o desfecho (cada um num hook) e
// desenha a tela com os componentes de apresentação.
export default function GanguesCombat({ onNavigate, onSairConfirmado }) {
  const { t } = useLanguage()
  const { perfil } = useAuth()
  const { registrarEvento } = useEventos()
  const store = useGanguesStore()
  const [selectedActor, setSelectedActor] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedSpecialId, setSelectedSpecialId] = useState(null)
  // "Mete o Pé" abre a confirmação (GanguesCombatSairConfirm.jsx); confirmar
  // sai da luta e volta pro lobby.
  const [pedindoSair, setPedindoSair] = useState(false)
  const [log, setLog] = useState([])
  const [trashOptions, setTrashOptions] = useState([])
  const [trashAberto, setTrashAberto] = useState(false)
  const [fichaAberta, setFichaAberta] = useState(null) // combatant ou null — popup de status completo
  const logEndRef = useRef(null)
  // Barra do automático: fica logo ACIMA do roster inimigo, sem tampar PV de
  // ninguém. `autoSairTop` é a borda de cima do roster inimigo, medida de
  // verdade (ResizeObserver: a altura muda com o tamanho do bando); o CSS
  // sobe a barra pela própria altura.
  const enemyRosterRef = useRef(null)
  const [autoSairTop, setAutoSairTop] = useState(null)
  useLayoutEffect(() => {
    const el = enemyRosterRef.current
    if (!el) return
    const medir = () => setAutoSairTop(el.getBoundingClientRect().top - 12)
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

  // A Multidão precisa ser conhecida ANTES de montar o motor normal: ele fica
  // pausado enquanto ela está no controle (senão o inimigo da vez atacava
  // escondido atrás da tela da Multidão). Quando ela pode ligar e quando já
  // começa ligada: regraMultidao (da Feira em diante toda luta começa nela).
  const bairroDaLuta = store.storyTarget?.clube ? store.storyTarget?.voltar?.territorioId : store.storyTarget?.territorioId
  const { disponivel: multidaoDisponivel, padrao: multidaoPadrao } = regraMultidao(store.match, bairroDaLuta)
  // Na Pista a pergunta "começar em Multidão?" aparece só na 1ª luta elegível
  // do save; a escolha guardada vale sozinha depois (o switch troca e regrava).
  const [escolhaMultidao, gravarEscolhaMultidao] = useEscolhaMultidao()
  const [modoMultidaoOn, setModoMultidaoOnState] = useState(() => multidaoDisponivel && (multidaoPadrao || escolhaMultidao === 'sim'))
  const setModoMultidaoOn = useCallback((valor) => {
    setModoMultidaoOnState(valor)
    if (!multidaoPadrao) gravarEscolhaMultidao(valor ? 'sim' : 'nao')
  }, [gravarEscolhaMultidao, multidaoPadrao])
  const modoMultidaoAtivoPreMachine = multidaoDisponivel && modoMultidaoOn
  const [multidaoPromptRespondida, setMultidaoPromptRespondida] = useState(!multidaoDisponivel || multidaoPadrao || escolhaMultidao != null)
  const perguntaMultidaoAtiva = multidaoDisponivel && !multidaoPromptRespondida
  const [taticaAberta, setTaticaAberta] = useState(false)

  // Automático (um só pra luta normal e Multidão), lembrado entre lutas.
  // Velocidade 1x/2x/3x só vale com ele ligado.
  const [modoAutoOn, setModoAutoOn] = useGanguesAutoLembrado('ldi-gangues-auto')
  const { velocidade, ciclarVelocidade } = useGanguesVelocidadeAuto()
  const velocidadeEfetiva = modoAutoOn ? velocidade : 1

  const machine = useGanguesTurnMachine({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam, onFinish: finish, pausado: modoMultidaoAtivoPreMachine || perguntaMultidaoAtiva, enemyDelay: 2200 / velocidadeEfetiva })

  // Pré-carrega a animação (sprite + sons) de cada personagem do time assim
  // que a luta começa. O cache é do módulo (ganguesCombatAnimations.js): só
  // baixa de verdade na 1ª luta de cada personagem por sessão.
  useEffect(() => {
    for (const member of store.match.playerTeam || []) {
      precarregarAnimacaoCombate(member.character_template_id)
    }
  }, [store.match.playerTeam])

  const multidao = useGanguesModoMultidao({ store, machine, t, setLog, eventosBrutosRef, finish, result, multidaoDisponivel, modoMultidaoOn, setModoMultidaoOn, velocidade: velocidadeEfetiva, fx, autoOn: modoAutoOn })
  const { modoMultidaoAtivo, estadoMultidao, alternarMultidao, podeLigar, multidaoBlinkVisto, avancarRodada, revelandoRodada, golpeAtual, golpeNaTela, fecharGolpe, foco, marcarFoco } = multidao

  // PV/PM gravado durante a luta (sair/recarregar não devolve a vida).
  useGanguesDanoAoVivo({ store, combatants: modoMultidaoAtivo ? (estadoMultidao?.combatants || []) : machine.combatants })

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
        if (c) caiu.push({ nome: fighterName(t, c), side: c.side, character_template_id: c.character_template_id, id: c.id })
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
    setLog(prev => [...prev, { id: `player-trash-${Date.now()}`, kind: 'trash', side: 'player', sender: players[0]?.sheet_name, senderRetrato: getGanguesPortraitByTemplateId(players[0]?.character_template_id), text: phrase }])
    setTrashAberto(false)
  }

  // Aceita specialId explícito (a bolinha de ação chama isso direto ao
  // escolher um golpe na lista, sem precisar de um botão ATACAR separado
  // depois) — sem parâmetro, usa o que já tava selecionado (compat).
  const handleAttack = (specialId = selectedSpecialId) => {
    if (!selectedActor || !selectedTarget) return
    sfx.click()
    // Talento de cura (Mandingueiro de cura) vai no aliado mais machucado.
    const ator = players.find(item => item.key === selectedActor)
    const cura = specialId && ator ? getEquippedActiveGanguesSpecials(ator).find(s => s.id === specialId && s.effect.type === 'heal') : null
    if (cura) { machine.playerCura(selectedActor, cura); setSelectedSpecialId(null); return }
    machine.playerAction(selectedActor, selectedTarget, specialId)
    setSelectedSpecialId(null)
  }

  const modoAuto = useGanguesModoAuto({
    modoAutoOn, setModoAutoOn, velocidade: velocidadeEfetiva,
    perfil, modoMultidaoAtivo, machinePhase: machine.phase, turnoSeq: machine.turnoSeq, result, koCena: fx.koCena,
    selectedActor, selectedTarget, agir: agirAuto,
  })
  const autoConfig = useGanguesAutoConfig()

  // Itens disponíveis (quantidade > 0) — a bolinha só mostra o que a gangue
  // realmente tem, lido direto do inventário compartilhado (store.inventario).
  const itensDisponiveis = GANGUES_ITENS_LISTA
    .filter(item => GANGUES_TIPOS_USO_COMBATE.has(item.tipo))
    .map(item => ({ ...item, quantidade: store.inventario[item.id] || 0 }))
    .filter(item => item.quantidade > 0)

  // Usar item consome o turno do ATOR (quem tá na vez) igual um ataque, mas a
  // cura vai pro ALIADO escolhido — o tanque pode ficar curando o atacante.
  // `poder_unico` é diferente: é um golpe de ataque (chip emprestando um
  // poder que o personagem nem treinou), então o alvo é um INIMIGO — usa o
  // `selectedTarget` que o fluxo de ataque normal já mantém, não o
  // aliado/`alvoKey` que a cura usa.
  const handleUsarItem = (itemId, alvoKey) => {
    if (!selectedActor) return false
    const item = getGanguesItem(itemId)
    if (!item) return false
    if (item.tipo === 'poder_unico') {
      if (!selectedTarget) return false
      if (!store.usarItem(itemId)) return false
      sfx.reward?.()
      machine.playerAction(selectedActor, selectedTarget, item.poderId, { id: item.poderId, level: item.poderNivel || 1 })
      return true
    }
    const alvo = alvoKey || selectedActor
    // Não desperdiça o item se o alvo já tá cheio no recurso que ele cura.
    const alvoC = players.find(p => p.key === alvo)
    if (alvoC) {
      if (item.tipo === 'cura_pv' && alvoC.pv >= alvoC.pvMax) { setAviso(t('games.gangues.combat_item_cheio')); setTimeout(() => setAviso(null), 2200); return false }
      if (item.tipo === 'cura_pm' && alvoC.pm >= alvoC.pmMax) { setAviso(t('games.gangues.combat_item_cheio')); setTimeout(() => setAviso(null), 2200); return false }
      if (item.tipo === 'cura_status' && !(alvoC.statuses || []).some(s => item.status === ST_TODOS || s.id === item.status)) { setAviso(t('games.gangues.combat_item_sem_status')); setTimeout(() => setAviso(null), 2200); return false }
    }
    if (!store.usarItem(itemId)) return false
    sfx.reward?.()
    // Cura (PV/PM) + efeitos temporários (status) — ver ganguesItens.js.
    const delta = {
      ...(item.tipo === 'cura_pv' ? { pv: item.valor } : item.tipo === 'cura_pm' ? { pm: item.valor } : {}),
      ...(item.tipo === 'debuff_inimigos' ? { statusInimigos: item.status } : item.tipo === 'cura_status' ? { curaStatus: item.status } : { status: item.status || [] }),
    }
    return machine.useItemAction(selectedActor, alvo, itemId, delta)
  }

  const actingMember = players.find(item => item.key === (modoMultidaoAtivo ? null : selectedActor)) || null
  const equippedSpecials = actingMember ? getEquippedActiveGanguesSpecials(actingMember) : []
  // Tropa pro menu de ação: PV/PM (alvo de item) e talentos (config do automático).
  const aliadosOrb = players.map(p => ({ key: p.key, id: p.id, nome: fighterName(t, p), pv: Math.max(0, p.pv || 0), pvMax: p.pvMax || 1, pm: Math.max(0, p.pm || 0), pmMax: p.pmMax || 0, dead: p.pv <= 0, especiais: getEquippedActiveGanguesSpecials(p) }))
  const canAffordSpecial = (special) => {
    const cost = special.effect.cost
    if (!cost) return true
    const value = cost.values[special.level - 1]
    if (cost.kind === 'pm') return (actingMember?.pm || 0) >= value
    if (cost.kind === 'pv') return (actingMember?.pv || 0) > 1
    return true
  }

  const abrirRelatorio = () => openBattleReport({ modoMultidaoAtivo, estadoMultidao, machine, log, eventosBrutosRef })
  // Briga automática da cena ligada: o "NÓIS É CRIA" avança sozinho em 2s
  // (ver useGanguesAvancoAutomatico). Derrota nunca — o jogador tem que clicar.
  const lutaDaCena = Boolean(store.storyTarget?.cenaId) && !store.storyTarget?.torre && !store.storyTarget?.clube
  const [brigaRua, setBrigaRua] = useBrigaDeRua()
  const naRinha = Boolean(store.storyTarget?.rinha)
  const autoLigado = modoAutoOn
  const brigaRuaAqui = lutaDaCena && !naRinha && brigaRua
  useGanguesAvancoAutomatico({ ativo: lutaDaCena && (result === 'victory' || (naRinha && result)) && !falaFinal, ms: GANGUES_AVANCO_AUTO_MS.resultado, acao: abrirRelatorio, forcar: naRinha })

  // A vez automática (useGanguesModoAuto): talento escolhido / poção / ataque
  // normal, conforme a config do automático — ver escolherAcaoAuto.
  // Farm ausente: leitor do estado vivo desta luta, pra o app em 2º plano
  // terminar a MESMA luta por cálculo (ver lutaAoVivo / GanguesFarmAusente).
  lutaAoVivo.ler = () => ({ combatants: modoMultidaoAtivo ? estadoMultidao?.combatants : machine.combatants, round: modoMultidaoAtivo ? estadoMultidao?.round : machine.round, auto: modoAutoOn, terminou: Boolean(result) })
  useEffect(() => () => { lutaAoVivo.ler = null }, [])
  function agirAuto() {
    const acao = escolherAcaoAuto({ ator: actingMember, aliados: aliadosOrb, especiais: equippedSpecials, pagavel: canAffordSpecial, itens: itensDisponiveis, config: autoConfig.config })
    // Item que não deu pra usar (alvo cheio etc.) vira ataque, senão a vez trava.
    if (acao.tipo === 'item' && handleUsarItem(acao.itemId, acao.alvoKey)) return
    handleAttack(acao.tipo === 'talento' ? acao.specialId : null)
  }

  if (!store.match.playerTeam?.length) return null

  // Vinheta de PV baixo por cima de tudo: alguém do time com até 50% do PV
  // acende o aviso leve; com até 25%, o vermelho pesado. A mais forte vale.
  const menorPvPctJogador = players.reduce((min, p) => p.pv > 0 ? Math.min(min, (p.pv / (p.pvMax || 1)) * 100) : min, 100)
  const algumJogadorCritico = menorPvPctJogador <= 25
  const algumJogadorAviso = !algumJogadorCritico && menorPvPctJogador <= 50

  return (
    <div className="gang-combat gang-container">
      {/* Pergunta "começar em Multidão?" (só na Pista, 1ª luta elegível do
          save): o motor fica pausado e nada embaixo é clicável até responder. */}
      {perguntaMultidaoAtiva && (
        <div className="gang-multidao-prompt-overlay">
          <div className="gang-multidao-prompt-box">
            <p className="gang-multidao-prompt-texto">{t('games.gangues.multidao.prompt_pergunta')}</p>
            <p className="gang-multidao-prompt-lembra">{t('games.gangues.multidao.prompt_lembra')}</p>
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
                onClick={() => { setModoMultidaoOn(false); setMultidaoPromptRespondida(true) }}
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
      {/* "Parar briga de rua": desliga, de dentro da luta, o ciclo da briga
          automática da cena (voltar em cima do adversário e brigar de novo). */}
      {!result && (autoLigado || brigaRuaAqui) && (
        <GanguesAutoBolinhas
          t={t} autoLigado={autoLigado} brigaRuaAqui={brigaRuaAqui} velocidade={velocidade} top={autoSairTop}
          onSairAuto={() => setModoAutoOn(false)}
          onPararBrigaRua={() => setBrigaRua(false)}
          onVelocidade={ciclarVelocidade}
        />
      )}

      <GanguesCombatOverlays
        t={t} aviso={aviso} danoCena={fx.danoCena} koCena={fx.koCena}
        dispararProximoKo={fx.dispararProximoKo} machine={machine} modoMultidaoAtivo={modoMultidaoAtivo}
        golpeMultidao={golpeNaTela && estadoMultidao ? { evento: golpeNaTela, combatants: estadoMultidao.combatants, onComplete: fecharGolpe } : null}
        fichaAberta={fichaAberta} setFichaAberta={setFichaAberta}
        falaFinal={falaFinal} result={result} showResultBtn={showResultBtn}
        openBattleReport={abrirRelatorio}
        enemy={store.match.enemy} velocidade={velocidadeEfetiva}
      />

      <div className={`gang-combat-fx${fx.critShake ? ' gang-combat-fx--shake' : ''}${fx.hitNudge ? ' gang-combat-fx--nudge' : ''}`}>
      <GanguesCombatTopBar
        t={t} onPedirSair={() => setPedindoSair(true)} machine={machine} modoMultidaoAtivo={modoMultidaoAtivo}
        estadoMultidao={estadoMultidao} result={result} revelandoRodada={revelandoRodada}
        multidaoDisponivel={multidaoDisponivel} modoMultidaoOn={modoMultidaoOn} alternarMultidao={alternarMultidao} podeLigar={podeLigar}
        multidaoBlinkVisto={multidaoBlinkVisto}
        trashOptions={trashOptions} trashAberto={trashAberto} setTrashAberto={setTrashAberto} sendPlayerTrash={sendPlayerTrash}
      />

      <GanguesPistaTempo
        t={t}
        tempo={modoMultidaoAtivo ? estadoMultidao?.tempo : machine.tempo}
        combatants={modoMultidaoAtivo ? estadoMultidao?.combatants : machine.combatants}
        vezKey={modoMultidaoAtivo ? golpeAtual?.actorKey : machine.currentActor?.key}
      />

      <GanguesCombatRoster
        members={players} side="player"
        selectable={!modoMultidaoAtivo && !perguntaMultidaoAtiva && machine.phase === 'player'}
        selectedKey={selectedActor} onSelect={modoMultidaoAtivo ? undefined : setSelectedActor}
        actingKey={modoMultidaoAtivo ? golpeAtual?.actorKey : machine.currentActor?.key} alvoKey={modoMultidaoAtivo ? golpeAtual?.targetKey : null}
        onAbrirFicha={setFichaAberta} dmgPops={fx.dmgPops} t={t}
      />

      <GanguesCombatLogList log={log} t={t} ref={logEndRef} />

      <GanguesCombatRoster
        ref={enemyRosterRef}
        members={enemies} side="enemy"
        selectable={modoMultidaoAtivo ? !result : !perguntaMultidaoAtiva && machine.phase === 'player'}
        selectedKey={modoMultidaoAtivo ? foco : selectedTarget} onSelect={modoMultidaoAtivo ? marcarFoco : setSelectedTarget}
        actingKey={modoMultidaoAtivo ? golpeAtual?.actorKey : machine.currentActor?.key} alvoKey={modoMultidaoAtivo ? golpeAtual?.targetKey : null}
        onAbrirFicha={setFichaAberta} dmgPops={fx.dmgPops} t={t}
      />

      {modoMultidaoAtivo && !result && (
        <GanguesMultidaoActionBar
          t={t} focoNome={foco ? fighterName(t, enemies.find(e => e.key === foco)) : null} onLimparFoco={() => marcarFoco(foco)}
          onAbrirTatica={() => setTaticaAberta(true)}
          taticasAtivas={store.match.playerTeam.filter(m => multidao.poderes[m.id] || multidao.itens[m.id]).length}
          avancarRodada={avancarRodada} revelandoRodada={revelandoRodada} prontoPraAvancar={Boolean(estadoMultidao)}
          autoOn={modoAutoOn} onToggleAuto={modoAuto.toggleModoAuto}
        />
      )}
      {taticaAberta && modoMultidaoAtivo && (
        <GanguesMultidaoTatica
          t={t} time={store.match.playerTeam} inventario={store.inventario}
          poderes={multidao.poderes} escolherPoder={multidao.escolherPoder} itens={multidao.itens} escolherItem={multidao.escolherItem}
          onClose={() => setTaticaAberta(false)}
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
          atorKey={selectedActor}
          aliados={aliadosOrb}
          onAtacar={() => handleAttack(null)}
          onUsarPoder={specialId => handleAttack(specialId)}
          onUsarItem={(itemId, alvoKey) => handleUsarItem(itemId, alvoKey)}
          autoOn={modoAuto.modoAutoOn}
          autoBloqueado={!modoAuto.podeUsarModoAuto}
          onToggleAuto={modoAuto.toggleModoAuto}
          autoConfig={autoConfig.config}
          onEscolherTalentoAuto={autoConfig.escolherTalento}
          onAlternarPocaoAuto={autoConfig.alternarPocao}
          onAlternarPocaoPmAuto={autoConfig.alternarPocaoPm}
        />
      )}
      {!modoMultidaoAtivo && machine.phase === 'enemy' && !machine.pending && <div className="gang-enemy-thinking"><span className="gang-thinking-pulse" /><strong>{t('games.gangues.report.enemy_thinking')}</strong><small>{t('games.gangues.report.enemy_strategy')}</small></div>}
      </div>
      {pedindoSair && (
        <GanguesCombatSairConfirm
          onCancelar={() => setPedindoSair(false)}
          onConfirmar={() => onSairConfirmado ? onSairConfirmado() : onNavigate('lobby')}
        />
      )}
    </div>
  )
}
