import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { sfx } from '../../../../lib/sfx'
import GangDialog from '../components/GangDialog'
import GanguesPapo from '../components/cena/GanguesPapo'
import GanguesParada from '../components/cena/GanguesParada'
import GanguesJogoContador from '../components/cena/jogos/GanguesJogoContador'
import GanguesDescanso from '../components/cena/GanguesDescanso'
import GanguesAgiota from '../components/cena/GanguesAgiota'
import GanguesBanca from '../components/cena/GanguesBanca'
import GanguesLoja from '../components/cena/GanguesLoja'
import GanguesFerreiro from '../components/cena/GanguesFerreiro'
import GanguesMiniMapa from '../components/cena/GanguesMiniMapa'
import GanguesAlvoTutorial from '../components/cena/GanguesAlvoTutorial'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import CenaCenario from '../components/cena/CenaCenario'
import CenaInterior from '../components/cena/CenaInterior'
import GanguesCenaBagSheet from '../components/cena/GanguesCenaBagSheet'
import GanguesCenaFichaCard from '../components/cena/GanguesCenaFichaCard'
import GanguesRepRecompensaModal from '../components/GanguesRepRecompensaModal'
import { GangMarker, PinoAlvo, ZonaChao, WorldControls, BrigaAutoAviso, interactionLabel, ehPersonagem } from '../components/cena/GanguesCenaAtores'
import { TretaVS } from '../components/cena/GanguesCenaEncontros'
import { CENAS_POR_ID, portaoAberto, contarCena, naAreaDoChefe, alertaDaCena, pontosComAlerta } from '../data/cenas/cenaHelpers.js'
import { GANGUES_TERRITORIO_POR_ID } from '../data/ganguesTerritorios.js'
import { getGanguesPortraitByTemplateId } from '../data/ganguesPortraits.js'
import { getGanguesNpcPortrait } from '../data/ganguesNpcPortraits.js'
import { getGanguesRosterLimitComHistoria } from '../data/ganguesLoadout.js'
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'
import { getGanguesAttributesWithEquip, getGanguesEquip } from '../data/ganguesEquip.js'
import useGanguesBrigaAutomatica from '../hooks/useGanguesBrigaAutomatica.js'
import { WORLD, SPAWN, montarAmbiente, insideZone, validPosition, validPos, posNoMapa } from '../engine/ganguesCenaMotor.js'
import { ALEATORIO_TIPOS } from '../engine/ganguesEncontroAleatorio.js'
import useGanguesCenaMovimento from '../hooks/useGanguesCenaMovimento.js'
import useGanguesEncontroAleatorio from '../hooks/useGanguesEncontroAleatorio.js'
import useGanguesTrem from '../hooks/useGanguesTrem.js'
import { TremFaixa, BarraRespeito, BarraAlerta, BarreiraFaixa, BarraCaderno, BarraLinhas } from '../components/cena/GanguesBaixadaHud'
import './GanguesCena.css'

// Cada cena vira um tutorial_id próprio (`cena_intro:<cenaId>`) dentro do
// mesmo dicionário de tutoriais vistos por CONTA (TutorialProgressContext) —
// não mais localStorage por save/aparelho. Pedido do Isaias (14/09/2026):
// "toda vez que abro num aparelho novo, aparece de novo, grava no Supabase".
function cenaIntroTutorialId(cenaId) { return `cena_intro:${cenaId}` }

// Referência estável pra lista vazia (a briga automática observa `alvos`).
const EMPTY_ALVOS = []

export default function GanguesCena({ onNavigate, onVoltar }) {
  const { perfil } = useAuth()
  const { t } = useLanguage(), store = useGanguesStore(), territorioId = store.storyTarget?.territorioId
  const cena = CENAS_POR_ID[territorioId] || null, terr = GANGUES_TERRITORIO_POR_ID[territorioId] || null
  const prog = store.cenaProgresso[cena?.id] || { resolvidos: {}, revelados: {}, boss: false }
  // `local` = null (rua) OU { id: <interiorId>, comodo: <n> }. Restaurado do
  // save junto da posição, pra reentrar na cena onde parou (até dentro do galpão).
  const [local, setLocal] = useState(() => prog.posicao?.local || null)
  const posInicial = () => {
    const p = prog.posicao
    if (p?.local) { const c = cena?.interiores?.[p.local.id]?.comodos?.[p.local.comodo]; return c ? (validPos(p, c.world) ? { x: p.x, y: p.y } : c.spawn) : SPAWN }
    return validPosition(p, cena?.mundo) ? { x: p.x, y: p.y } : (cena?.mundo?.spawn || SPAWN)
  }
  const { jaViu: jaViuTutorial, marcarVisto: marcarTutorialVisto, carregado: tutoriaisCarregados } = useTutorialProgress()
  // Começa assumindo "não visto" (mostra a intro) e corrige assim que os
  // tutoriais da conta terminam de carregar — falha pro lado de MOSTRAR,
  // nunca de esconder (mesmo raciocínio de fail-open dos outros tutoriais).
  const [intro, setIntro] = useState(Boolean(cena))
  useEffect(() => {
    if (!cena || !tutoriaisCarregados) return
    setIntro(!jaViuTutorial(cenaIntroTutorialId(cena.id)))
  }, [cena?.id, tutoriaisCarregados, jaViuTutorial])
  const [encontro, setEncontro] = useState(null), [toast, setToast] = useState(null)
  // Marco de reputação recorrente (a cada 50, ver GANGUES_REP_MARCO_INTERVALO)
  // cruzado na cena — abre o modal BLOQUEANTE de recompensa (não o toast
  // pequeno que já existe), guardando o ÚLTIMO marco cruzado se mais de um
  // vier de uma vez (o item de cada um já foi concedido no store).
  const [repModalMarco, setRepModalMarco] = useState(null)
  const registrarMarcosRep = marcos => { if (marcos?.length) setRepModalMarco(marcos[marcos.length - 1]) }
  const [hint, setHint] = useState(() => t('games.gangues.cena.hint_andar'))
  const [fade, setFade] = useState(false)
  const [fichaIndex, setFichaIndex] = useState(null)
  const [bagAberta, setBagAberta] = useState(false)
  // Vaga de recrutamento liberada por território dominado — a ficha do
  // personagem (aberta daqui, na rua) é onde o Isaias esperava ver isso, não
  // só um toast que passa (pedido do Isaias, 2026-09-14: "deveria aparecer
  // aqui algo como recrutamento liberado").
  const podeRecrutarAgora = store.roster.length < getGanguesRosterLimitComHistoria(perfil?.tier, store.storyProgress)
  const irRecrutar = () => { store.newSheet(); setFichaIndex(null); onNavigate('create') }
  // Aviso: a tropa inteira caiu — não entra em luta até se recuperar na birosca.
  const [aviso, setAviso] = useState(null)
  // Checklist: o que ainda falta fechar na cena (toca no "X/10" do topo).
  const [checklist, setChecklist] = useState(false)
  const viewportRef = useRef(null)
  // baseFeita = fechou os ponto (portao.precisa) → destranca o TÚNEL e libera o
  // lado de lá. muroAberto = bateu o Carvão → aí sim o muro abre de vez (pra
  // facilitar o vai-e-vem). O muro NUNCA abre só por fechar os ponto.
  const baseFeita = cena ? portaoAberto(cena, prog.resolvidos) : false
  const muroAberto = Boolean(prog.boss)
  const flagsHistoria = store.storyProgress.__flags
  const amb = useMemo(() => montarAmbiente(cena, local, prog, baseFeita, muroAberto, flagsHistoria || {}), [cena, local, prog, baseFeita, muroAberto, flagsHistoria])
  const collidersRef = useRef(null); collidersRef.current = amb?.colliders || []
  const worldRef = useRef(null); worldRef.current = amb?.world || WORLD
  const gateRef = useRef(null)

  const congeladoRef = useRef(false)
  const { player, setPlayer, facing, andou, inputRef } = useGanguesCenaMovimento({
    intro, encontro, fade, gateRef, collidersRef, worldRef, initialPlayer: posInicial, congeladoRef,
  })

  // Linha do trem (Baixada): enquanto passa, os trilhos viram muro; quem tava neles leva dano.
  const trem = useGanguesTrem({ trem: cena?.trem, rodando: Boolean(cena?.trem) && !local && !intro && !encontro && !fade, player, setPlayer, onAtropelo: () => { store.choqueTropa(cena.trem.dano); setAviso(t('games.gangues.cena.baixada.trem_atropelo')); setTimeout(() => setAviso(null), 3000) } })
  gateRef.current = amb?.gateAtivo || (local ? null : trem.gate)
  const localRef = useRef(local); localRef.current = local

  // Nível MÉDIO da tropa de batalha — base do aviso "recomendado nível X" no
  // TretaVS (o Isaias: o cara entra consciente ou upa antes). Morava no
  // hook do antigo encontro aleatório (useGanguesCenaEventoAleatorio,
  // removido 21/09/2026 junto com o próprio sistema) — nada a ver com o encontro em si, só ficava junto por
  // conveniência; movido pra cá.
  const nivelTropa = useMemo(() => {
    const time = store.activeParty.length ? store.activeParty : store.roster
    if (!time.length) return 1
    // Nível EFETIVO: o nível de XP + o que o equipamento soma de atributo —
    // assim o aviso conta a soqueira/colete que o cara já pôs.
    const nivelEf = m => {
      const base = getGanguesLevelFromXp(m.xp_total ?? 0)
      const eff = getGanguesAttributesWithEquip(m.attributes)
      const bonus = ['A', 'H', 'D'].reduce((s, k) => s + Math.max(0, (Number(eff?.[k]) || 0) - (Number(m.attributes?.[k]) || 0)), 0)
      return base + bonus
    }
    return Math.max(1, Math.round(time.reduce((s, m) => s + nivelEf(m), 0) / time.length))
  }, [store.activeParty, store.roster])

  // Colisão visual REAL (círculo do personagem contra o do jogador na
  // tela, reportada por cada PinoAlvo — ver useEffect/onColidir em
  // GanguesCenaAtores.jsx) — pedido do Isaias, 20/09/2026, depois de ver
  // o personagem parar de andar mas o botão de interação não acender:
  // "só ativa quando eu vou na antiga área do quadradinho... tem que
  // ativar no momento que eu colido com o personagem". A zona fixa
  // (`insideZone`) só faz sentido pra pino ESTÁTICO (nunca se afasta do
  // próprio `world.x/y`) — pra "personagem" que anda de verdade
  // (`ehPersonagem`), o botão tem que seguir a MESMA colisão que já pausa
  // a andadinha, não a zona ancorada numa posição que ele não está mais.
  const [colisoes, setColisoes] = useState({})
  const reportarColisao = useCallback((id, colide) => {
    setColisoes(prev => (Boolean(prev[id]) === colide ? prev : { ...prev, [id]: colide }))
  }, [])
  const colidindo = useCallback(a => ehPersonagem(a) ? Boolean(colisoes[a.id]) : insideZone(player, a.zona), [colisoes, player])
  const perto = useMemo(() => (amb?.alvos || []).find(a => {
    if (a.estado !== 'disponivel' && !a.repetivel) return false
    return colidindo(a)
  }) || null, [amb, colidindo])
  const { feitos, total } = cena ? contarCena(cena, prog.resolvidos, prog.boss) : { feitos: 0, total: 0 }
  // local aponta pra um interior/cômodo que não existe (save antigo, cena
  // diferente) → volta pra rua.
  useEffect(() => { if (cena && local && !amb) { setLocal(null); setPlayer(cena.mundo?.spawn || SPAWN) } }, [cena, local, amb])

  // Encontro aleatório (26/09/2026 — ver engine/ganguesEncontroAleatorio.js):
  // relógio de jogo + perseguidor. Só corre com o jogador na RUA e sem nada
  // aberto por cima; senão congela e continua de onde parou.
  const iniciarAleatorioRef = useRef(null)
  // Briga automática (switch dos controles) — regra no hook. Voltar em cima
  // do adversário e brigar de novo é o farm; quem anda nasce na ponta mais
  // longe (`longeDe` no PinoAlvo do adversário da última luta, `volta`).
  const brigaAutoRef = useRef(null), volta = useRef(prog.posicao)
  const onBrigaAuto = useCallback((poi, opcoes) => brigaAutoRef.current?.(poi, opcoes), [])
  const brigaAuto = useGanguesBrigaAutomatica({
    alvos: amb?.alvos || EMPTY_ALVOS, colidindo,
    rodando: Boolean(cena) && !intro && !encontro && !fade && fichaIndex === null && !bagAberta && !repModalMarco,
    bloqueado: naAreaDoChefe(cena, prog, { ...player, local }),
    onBriga: onBrigaAuto,
  })
  // Lado apagado (Feira): do outro lado da barricada, até o chefe cair.
  const ladoApagado = Boolean(cena?.apagao) && !local && !prog.boss && player.y < (cena?.muro?.y1 ?? 0)
  // Interior (a Galeria dos Gato) ou cômodo (a escada sem luz da Vila) marcado `escuro` também fica no breu até o chefe cair.
  const interLocal = local ? cena?.interiores?.[local.id] : null
  const noEscuro = ladoApagado || (Boolean(interLocal?.escuro || interLocal?.comodos?.[local.comodo]?.escuro) && !prog.boss)
  // Tipos de encontro aleatório que esta cena sorteia agora (cada território
  // tem os seus — ver `aleatorio` em data/cenas/<território>/index.js).
  const tiposAleatorioRef = useRef(null)
  tiposAleatorioRef.current = () => cena?.aleatorio?.({ divida: store.storyProgress.__birosca?.divida || 0, ladoApagado }) || null
  const aleatorio = useGanguesEncontroAleatorio({
    store, player, collidersRef, worldRef, gateRef, tiposRef: tiposAleatorioRef,
    rodando: Boolean(cena) && !intro && !encontro && !fade && !local && fichaIndex === null && !bagAberta && !repModalMarco,
    onAlcancou: tipo => iniciarAleatorioRef.current?.(tipo),
  })
  // Encostou (briga automática ou encontro aleatório): trava o boneco até a luta abrir.
  congeladoRef.current = Boolean(brigaAuto.anuncio || aleatorio.onomatopeia || aleatorio.aviso)
  useEffect(() => {
    if (intro || encontro) return
    if (!andou) { setHint(t('games.gangues.cena.hint_andar')); return }
    if (local) { setHint(null); return }
    if (perto && Object.keys(prog.resolvidos).length === 0) { setHint(t('games.gangues.cena.hint_interagir')); return }
    // Dica da quest de coleta do território (cada cena decide a sua — ver
    // `dicaQuest` em data/cenas/<território>/index.js).
    const dica = cena?.dicaQuest?.(prog, store.inventario || {})
    setHint(dica ? t(dica) : null)
  }, [intro, encontro, andou, perto, prog, local, t, store.inventario, cena])
  if (!cena || !terr) return <main className="gang-lobby"><button className="gang-new-sheet" onClick={onVoltar || (() => onNavigate('story'))}>{t('games.gangues.btn_voltar')}</button></main>
  // `local` aponta pra um interior inválido — o efeito acima já vai zerar; só
  // não renderiza esse frame pra não quebrar em amb null.
  if (local && !amb) return <main className="gang-cena-worldpage" style={{ '--terr-cor': cena.cor }}><div className="gang-cena-viewport" /></main>
  const fecharIntro = () => { marcarTutorialVisto(cenaIntroTutorialId(cena.id)); setIntro(false) }
  const guardarPosicao = (over) => store.salvarPosicaoCena(cena.id, { ...(over || player), local: over?.local !== undefined ? over.local : local })
  // Saindo da cena (luta, app em 2º plano — farm ausente —, voltar) grava onde o jogador está, sem perder o adversário marcado.
  const saidaRef = useRef(null); saidaRef.current = () => cena && store.salvarPosicaoCena(cena.id, { ...player, local, adversario: useGanguesStore.getState().cenaProgresso[cena.id]?.posicao?.adversario })
  useEffect(() => () => saidaRef.current?.(), [])
  // troca de ambiente com fade curto (rua↔interior, cômodo↔cômodo)
  const trocarPara = (novoLocal, spawn) => {
    sfx.select?.(); setFade(true)
    setTimeout(() => {
      setLocal(novoLocal); if (spawn) setPlayer(spawn)
      guardarPosicao({ ...(spawn || player), local: novoLocal })
      setFade(false)
    }, 170)
  }
  const entrar = (interId, comodo = 0, spawnOver) => {
    const inter = cena.interiores?.[interId]; if (!inter?.comodos?.length) return
    const idx = inter.comodos[comodo] ? comodo : 0
    trocarPara({ id: interId, comodo: idx }, spawnOver || inter.comodos[idx].spawn)
  }
  // `paraPredio` = túnel que emerge no OUTRO lado do muro; senão volta pela
  // porta pela qual entrou (prédio pequeno: entrada = saída). `+8` no y pra
  // não re-acionar o ENTRAR no ato.
  const sair = (paraPredio) => {
    const inter = cena.interiores?.[local.id]
    const predId = paraPredio || inter?.porta?.predio
    const pr = (cena.predios || []).find(p => p.id === predId)
    const zx = pr?.porta?.zx ?? (pr ? (pr.x + pr.w / 2) : player.x)
    const zy = (pr?.porta?.zy ?? (pr ? pr.y + pr.h + 16 : player.y)) + 8
    trocarPara(null, { x: zx, y: zy })
  }
  const irComodo = (n) => {
    const inter = cena.interiores?.[local.id]; const com = inter?.comodos?.[n]; if (!com) return
    trocarPara({ id: local.id, comodo: n }, com.spawn)
  }
  const abrir = poi => {
    if (!poi || poi.estado === 'trancado') return
    if (poi.ehPorta) { entrar(poi.interId, poi.comodo || 0, poi.spawn); return }
    if (poi.ehSaida) { sair(poi.paraPredio); return }
    if (poi.ehVolta) { irComodo(poi.para); return }
    if (poi.ehPassagem) { irComodo(poi.para); return }
    guardarPosicao()
    if (poi.tipo === 'achado') {
      sfx.reward?.()
      const r = poi.recompensa || {}
      if (r.grana) store.ganharGrana(r.grana)
      const marcos = r.rep ? store.ganharRep(r.rep) : []
      registrarMarcosRep(marcos)
      if (r.item) store.darItem(r.item, r.qtd || 1)
      if (r.equip) store.comprarEquip(r.equip, 0)
    // Favor da Dona Regina pago (Feira) — libera o fiado da pensão de novo.
    if (r.pagaFavor) store.pagarFavorRegina()
      if (r.grana || r.rep || r.item || r.equip) { setToast({ ...r }); setTimeout(() => setToast(null), 2600) }
      store.marcarPoiResolvido(cena.id, poi.id, poi.revela || [])
      return
    }
    sfx.select(); setEncontro({ poi, vs: poi.tipo === 'treta', fala: poi.tipo === 'treta' ? escolherFala(poi) : null })
  }
  // fala pré-treta: se o i18n traz um array (variações de trash talk, ver
  // gangues-pt.json cena.pista.*.fala), sorteia uma linha — assim não repete
  // sempre a mesma quando o jogador reencara o mesmo ponto.
  const escolherFala = poi => {
    const raw = poi.ehChefe
      ? t(`games.gangues.story.bosses.${poi.boss}.fala`, { suaGangue: t('games.gangues.report.your_gang') })
      : t(`${poi.i18n}.fala`)
    return Array.isArray(raw) ? raw[Math.floor(Math.random() * raw.length)] : raw
  }
  // "não ver mais o aviso de nível" — só neste território (reseta ao trocar,
  // porque a cena remonta com outro territorioId).
  const [avisoNivelOff, setAvisoNivelOff] = useState(false)
  // Tropa toda no chão → barra a entrada em qualquer luta e manda pra birosca.
  const barraSeChao = () => {
    if (!store.tropaNoChao()) return false
    setEncontro(null); sfx.cancel?.()
    setAviso(t('games.gangues.cena.tropa_no_chao'))
    setTimeout(() => setAviso(null), 3600)
    return true
  }
  // Aceitou o Clube da Luta com o agiota: a entrada já fia 15× e cura a
  // tropa, e o jogador é vendado e levado pra roda (fase 'clube' →
  // sequestro → combate). `clubeDividaPrevia` = dívida ANTES da entrada (a
  // vitória quita a dívida e paga o prêmio do bairro, ver clubePremioDe).
  //
  // `gratis` (Isaias, 21/09/2026: "chegou em 10.000, ele não vai nem te
  // cobrar, ele vai te remendar, só que já vai te jogar pro Clube da Luta") —
  // o socorro do teto da agiotagem: cura de graça (sem somar o 15× de
  // entrada) e joga direto pra dentro, sem a tela normal de aceitar/recusar
  // (ver GanguesAgiota.jsx, botão "socorro" quando agiotagemInfo().noTeto).
  // Nome do agiota DESTA cena (Marimbondo na Pista, Juro Alto na Feira) —
  // os textos da caderneta/clube são genéricos, com {agiota}.
  const nomeAgiota = () => { const ag = cena?.pois.find(p => p.tipo === 'agiota'); return ag ? t(`${ag.i18n}.nome`) : '' }
  const iniciarClube = (custoBase, gratis = false, aposta = 0) => {
    // Regra (gate de rep, entrada, alvo da 1ª ronda) é do módulo do Clube.
    const r = store.prepararEntradaClube({ custoBase, gratis, territorioId: terr.id, aposta })
    setEncontro(null)
    if (!r.ok) {
      sfx.cancel?.()
      setAviso(r.motivo === 'grana' ? t('games.gangues.clube.aposta_sem_grana') : t('games.gangues.cena.aviso_rep_clube', { rep: r.rep, agiota: nomeAgiota() }))
      setTimeout(() => setAviso(null), 3600)
      return
    }
    guardarPosicao(); sfx.vs?.()
    onNavigate('clube')
  }
  // Encontro aleatório: o perseguidor alcançou o jogador → luta direto, sem
  // escolha. Devolve false se a tropa tá no chão (aí ele espera e tenta de novo).
  iniciarAleatorioRef.current = tipo => {
    const def = ALEATORIO_TIPOS[tipo]
    if (!def || barraSeChao()) return false
    guardarPosicao(); sfx.vs?.()
    store.setStoryTarget({
      aleatorioTipo: tipo,
      territorioId: terr.id, cenaId: cena.id, cenaPoiId: '__aleatorio',
      cenaRevela: [], cenaRecompensa: null, pontoIds: terr.pontos.map(p => p.id),
      revezamento: def.revezamento,
    })
    onNavigate('story-combat')
    return true
  }
  brigaAutoRef.current = (poi, opcoes) => iniciarTreta(poi, { ...opcoes, anunciar: brigaAuto.anunciar })
  const iniciarTreta = (poi, { viraTreta, revela, anunciar } = {}) => {
    if (barraSeChao()) return
    const chefe = Boolean(poi.ehChefe)
    // Gate da dívida com o agiota (Isaias, 21/09/2026: "antes de enfrentar o
    // Carvão você tem que pagar sua dívida, não importa o tamanho... o
    // melhor esquema pra pagar é o Clube da Luta") — só trava o CHEFE
    // especificamente; o resto da Pista (farm, pós-muro) continua livre com
    // dívida em aberto, senão vira soft-lock cruel demais.
    // Ponte entre territórios (`precisaInformante`, ganguesTerritorios.js): o
    // chefe daqui só aceita depois de falar com o informante do bairro
    // anterior (a Feira precisa do Duda, na Pista).
    if (chefe && terr.precisaInformante && !store.storyProgress.__flags?.[terr.id]) {
      setEncontro(null); sfx.cancel?.()
      setAviso(t(`games.gangues.cena.${cena.id}.aviso_informante`))
      setTimeout(() => setAviso(null), 3600)
      return
    }
    const dividaAgiota = store.storyProgress.__birosca?.divida || 0
    if (chefe && dividaAgiota > 0) {
      setEncontro(null); sfx.cancel?.()
      setAviso(t('games.gangues.cena.aviso_divida_chefe', { divida: dividaAgiota, agiota: nomeAgiota(), chefe: t(`games.gangues.story.bosses.${cena.chefe.boss}.nome`) }))
      setTimeout(() => setAviso(null), 3600)
      return
    }
    if (poi.repGate && store.rep < poi.repGate) {
      setEncontro(null); sfx.cancel?.()
      setAviso(t('games.gangues.cena.aviso_rep_treta', { rep: poi.repGate }))
      setTimeout(() => setAviso(null), 3600)
      return
    }
    // Briga automática: passou das travas → aviso de 2,5s e aí sim a luta.
    if (anunciar) { anunciar(() => iniciarTreta(poi, { viraTreta, revela })); return }
    guardarPosicao({ ...player, adversario: poi.id }); sfx.vs?.()
    // `poi.fixo`: POI de NÍVEL FIXO, single-enemy (Generais da Pista) — a
    // luta é sempre contra a MESMA ficha (`poi.enemy`) escalada pro ponto
    // autorado `poi.pontosFixo`. `poi.pontosFixo` também existe em POIs
    // multi-corpo (ex: galpao_m2) sem `poi.fixo` — aí GanguesRoute usa
    // gerarBandoInimigo pra sortear os corpos com esse total fixo. Sistema
    // antigo de "farm-lock" (travarPontosFarm, congelava o ponto do
    // jogador na 1ª vitória de uma treta repetível) removido — não existe
    // mais nada que escale contra o jogador pra precisar congelar.
    const pontosFixo = viraTreta ? null : poi.pontosFixo
    // Ajustes na ficha do inimigo líder desta luta: o ponto fraco do chefe
    // (Feira: as 3 páginas da caderneta → −2 Couro) e o inimigo que fica mais
    // forte contra quem deve ao agiota (o Caderneta, +1 Malícia).
    const fraqueza = chefe && cena.fraquezaChefe && cena.fraquezaChefe.precisa.every(id => prog.resolvidos[id]) ? cena.fraquezaChefe.efeito : null
    const bonusDivida = !viraTreta && poi.inimigoBonusSeDivida && dividaAgiota > 0 ? poi.inimigoBonusSeDivida : null
    // Ajuste do chefe que a própria cena calcula (Alto: o Caderno do Contador).
    const ajusteCena = chefe && cena.ajusteChefe ? cena.ajusteChefe(prog, store.storyProgress.__flags || {}, store.cenaProgresso) : null
    const ajusteInimigo = [fraqueza, bonusDivida, ajusteCena].filter(Boolean).reduce((acc, a) => { for (const [k, v] of Object.entries(a)) acc[k] = (acc[k] || 0) + v; return acc }, null) || null
    // Barra de Alerta (Vila): +1 de ficha por corpo a cada ponto de alerta, nunca no chefe nem acima dele.
    const comAlerta = pts => (chefe || !pts ? pts : pontosComAlerta(pts, cena, store.storyProgress))
    const revez = viraTreta ? (viraTreta.revezamento || null) : poi.revezamento
    const revezamento = revez && !revez.nivelDaTropa ? { ...revez, budgetPorCorpo: comAlerta(revez.budgetPorCorpo) } : revez
    store.setStoryTarget({ ajusteInimigo, rinha: Boolean(poi.rinhaInfinita && !viraTreta), semGrana: !viraTreta && Boolean(poi.semGrana), territorioId: terr.id, cenaId: cena.id, cenaPoiId: poi.id, cenaRevela: viraTreta ? (revela || []) : (poi.revela || []), cenaRecompensa: viraTreta ? (viraTreta.recompensa || null) : poi.recompensa || null, cenaSemTravar: Boolean(viraTreta?.semTravar), pontoIds: terr.pontos.map(p => p.id), noId: chefe ? cena.chefe.poiNo : null, enemyId: viraTreta ? viraTreta.enemy : poi.enemy, fixo: Boolean(viraTreta) || Boolean(poi.fixo), liderFixo: (viraTreta || poi.fixo) ? null : poi.liderFixo, moldesPool: viraTreta ? null : poi.moldesPool, revezamento, isChefe: chefe, repDelta: viraTreta?.rep || 0, pontosFixos: comAlerta(pontosFixo), qtdMin: viraTreta ? null : (poi.qtdMin ?? null), qtdMax: viraTreta ? null : (poi.qtdMax ?? null) })
    onNavigate('story-combat')
  }
  // O elevador quebrado (Vila, `cena.elevador`): leva pro andar escolhido — ou
  // trava no caminho (+1 de alerta) e o bonde abre a porta na marra.
  const usarElevador = destino => {
    const el = cena.elevador
    if (Math.random() < el.chanceTravar) {
      if (cena.alerta) store.mexerAlerta(cena.id, cena.alerta.max, 1)
      sfx.cancel?.(); setAviso(t('games.gangues.cena.vila.elevador.travou'))
      setTimeout(() => { setAviso(null); iniciarTreta({ id: 'elevador' }, { viraTreta: { enemy: el.pool[0], revezamento: { pool: el.pool, budgetPorCorpo: destino.pontos, chanceDupla: 0.6 }, semTravar: true } }) }, 1600)
      return
    }
    if (local?.id === el.interior) irComodo(destino.comodo); else entrar(el.interior, destino.comodo)
  }
  const resolver = res => {
    const poi = encontro.poi; setEncontro(null)
    // Choque do Quadro de Luz (Feira): errar o gato tira PV da tropa inteira
    // antes da treta (nunca derruba — fica com pelo menos 1).
    if (res?.choque) store.choqueTropa(res.choque)
    if (res?.viraTreta) { iniciarTreta(poi, { viraTreta: res.viraTreta, revela: res.revela }); return }
    if (res?.elevador) { usarElevador(res.elevador); return }
    // Escolha com requisito de item (fetch quest do Nando): consome os itens —
    // aborta sem marcar nada se faltar (o botão já vem travado, isso é rede).
    if (res?.precisaItens && !store.gastarItens(res.precisaItens)) return
    if (res?.custoGrana) store.gastarGrana(res.custoGrana)
    if (res?.informante) store.marcarInformante(res.informante)
    ;(res?.daEquip || []).forEach(id => store.comprarEquip(id, 0))
    const r = res?.recompensa || {}
    if (r.grana) store.ganharGrana(r.grana)
    const marcos = r.rep ? store.ganharRep(r.rep) : []
    registrarMarcosRep(marcos)
    if (r.item) store.darItem(r.item, r.qtd || 1)
    // `recompensa.equip`: peça de equipamento de prêmio (ex.: a Bota com
    // Biqueira do corre do Nato — fonte dos raros, PLANO_ITENS_RANGE.md §6).
    if (r.equip) store.comprarEquip(r.equip, 0)
    if (r.grana || r.rep || r.xp || r.item || r.equip || res?.daEquip?.length) { setToast({ ...r }); setTimeout(() => setToast(null), 2600) }
    // marcarPoiResolvido também pra papo repetível (ex: Duda/informante) —
    // não trava a interação de novo (estadoPoi trata repetível como sempre
    // disponível), só liga farmCompleto (pino vira azul, igual treta
    // repetível já vencida) pra sinalizar "já conversei com esse aqui".
    // Antes só marcava POI não-repetível; papo repetível ficava verde pra
    // sempre mesmo depois de conversar, porque nada chamava
    // marcarPoiResolvido nesse caminho (pedido do Isaias, 13/09/2026: "verde
    // é o que precisa visitar, azul é o que já está visitado").
    store.marcarPoiResolvido(cena.id, poi.id, res?.revela || poi.revela || [])
  }
  // Território dominado NÃO fecha a cena — as tretas repetíveis (rinha) e o
  // informante moram aqui e têm que continuar alcançáveis pra sempre. Antes
  // isso trocava a cena inteira por uma tela de "dominado" sem saída, o que
  // trancava o jogador pra fora do próprio conteúdo de farm que ele tinha
  // que revisitar. Agora só mostra um selo no cabeçalho.
  const W = amb?.world || WORLD
  const vw = viewportRef.current?.clientWidth || 390, vh = viewportRef.current?.clientHeight || 620, lookX = facing === 'right' ? 52 : facing === 'left' ? -52 : 0, lookY = facing === 'down' ? 60 : facing === 'up' ? -60 : 0
  const camX = W.w <= vw ? (W.w - vw) / 2 : Math.max(0, Math.min(W.w - vw, player.x - vw / 2 + lookX))
  const camY = W.h <= vh ? (W.h - vh) / 2 : Math.max(0, Math.min(W.h - vh, player.y - vh / 2 + lookY))
  const breadcrumb = local
    ? `${t(amb.nomeLugar)}${amb.nomeComodo ? ` · ${t(amb.nomeComodo)}` : amb.andares ? ` · ${amb.comodoIdx ? t('games.gangues.cena.andar', { n: amb.comodoIdx }) : t('games.gangues.cena.andar_terreo')}` : amb.comodoTotal > 1 ? ` · ${t('games.gangues.cena.comodo', { n: amb.comodoIdx + 1, de: amb.comodoTotal })}` : ''}`
    : `${t(`games.gangues.story.territorios.${terr.id}.nome`)} `
  // Metas obrigatórias da cena (portao.precisa + o chefe) — o que abre o
  // caminho por baixo do muro. Vira a lista do checklist do topo.
  const metaDe = id => {
    const p = cena.pois.find(x => x.id === id)
    return { id, nome: p?.i18n ? t(`${p.i18n}.nome`) : id, feito: Boolean(prog.resolvidos[id]) }
  }
  const metas = local ? [] : [
    ...(cena.portao?.precisa || []).map(metaDe),
    // depois que a passagem abre, as metas do outro lado do muro entram na lista
    ...(baseFeita ? (cena.posMuro?.metas || []).map(metaDe) : []),
    { id: '__boss', nome: t(`games.gangues.story.bosses.${cena.chefe.boss}.nome`), feito: Boolean(prog.boss) },
  ]
  // Setinhas do mini-mapa: só os objetivos PENDENTES E JÁ REVELADOS (não
  // spoila o que o jogador ainda nem descobriu), com a posição no mundo. Se
  // tudo fechou mas o muro ainda não abriu, o alvo vira a boca do túnel.
  const minimapaAlvos = local ? [] : metas.filter(m => !m.feito).map(m => {
    if (m.id === '__boss' && baseFeita && !muroAberto && cena.posMuro) {
      // Antes do muro: aponta pra passagem (túnel/galeria).
      if (player.y >= (cena.muro?.y1 ?? 0)) return { id: '__passagem', nome: t(cena.posMuro.passagem.nome), pos: cena.posMuro.passagem.pos }
      // Já do outro lado: as metas pós-muro em ordem, depois a dungeon final.
      const proxima = (cena.posMuro.metas || []).find(id => !prog.resolvidos[id])
      if (proxima) return { id: proxima, nome: t(`${cena.pois.find(x => x.id === proxima)?.i18n}.nome`), pos: posNoMapa(cena, proxima) }
      return { id: '__final', nome: t(cena.posMuro.final.nome), pos: cena.posMuro.final.pos }
    }
    if (m.id === '__boss') return { ...m, pos: posNoMapa(cena, 'boss') }
    const pd = cena.pois.find(x => x.id === m.id)
    if (!pd || !(pd.visivel || prog.revelados[m.id])) return null
    return { ...m, pos: posNoMapa(cena, m.id) }
  }).filter(m => m?.pos)
  return <main className={`gang-cena-worldpage${local ? ' is-interior' : ''}`} style={{ '--terr-cor': cena.cor }}>
    <AnimatePresence>{intro && <GangDialog lines={t(cena.chegada)} speaker={t(cena.falante)} sub={t(cena.falanteSub)} retrato={getGanguesNpcPortrait(cena.falanteSlug)} onFinish={fecharIntro} onSkip={fecharIntro} />}</AnimatePresence>
    <AnimatePresence>{aleatorio.aviso && <GangDialog key="aleatorio" lines={t(`games.gangues.cena.aleatorio.${aleatorio.aviso}.aviso`)} speaker={t(cena.falante)} sub={t(cena.falanteSub)} retrato={getGanguesNpcPortrait(cena.falanteSlug)} onFinish={aleatorio.confirmarAviso} onSkip={aleatorio.confirmarAviso} />}</AnimatePresence>
    <header className="gang-cena-worldhud"><button onClick={() => { local ? sair() : (guardarPosicao(), (onVoltar || (() => onNavigate('story')))()) }}>← {local ? t('games.gangues.cena.acao.sair') : t('games.gangues.cena.acao.voltar')}</button><strong>{breadcrumb}{!local && (prog.boss ? <i className="gang-cena-dominado-selo">⚑ {t('games.gangues.cena.dominada')}</i> : <button className="gang-cena-meta-btn" onClick={() => setChecklist(v => !v)}>{feitos}/{total} ▾</button>)}</strong><span>💵 {store.grana}　⚑ {store.rep}</span><button className="gang-cena-ficha-btn" onClick={() => setBagAberta(true)} aria-label={t('games.gangues.bag.titulo')}>🎒</button>{store.activeParty.length > 0 && <button className="gang-cena-ficha-btn" onClick={() => setFichaIndex(0)}>👤</button>}<button className="gang-cena-ficha-btn" onClick={() => { guardarPosicao(); onNavigate('album') }} aria-label={t('games.gangues.album.titulo')}>📕</button></header>
    <AnimatePresence>{checklist && !local && <motion.div className="gang-cena-checklist" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <b>{t('games.gangues.cena.checklist_titulo')}</b>
      <ul>{metas.map(m => <li key={m.id} className={m.feito ? 'is-feito' : ''}><span>{m.feito ? '✓' : '○'}</span>{m.nome}</li>)}</ul>
      <p>{t(baseFeita ? (prog.boss ? 'games.gangues.cena.checklist_dominada' : cena.textos.checklistPassagem) : cena.textos.checklistDica)}</p>
    </motion.div>}</AnimatePresence>
    <div className="gang-cena-viewport" ref={viewportRef}>
    {/* key=local, igual o GangMarker logo abaixo: `.gang-cena-world` tem
        `transition:transform .11s` (CSS, pra suavizar a câmera acompanhando
        o passo a passo normal DENTRO do mesmo espaço). Sem essa key, trocar
        de local (rua↔interior) só muda `camX/camY` num elemento que
        continua vivo — o navegador anima essa transição normalmente,
        varrendo a câmera pela tela toda entre dois espaços de coordenada
        incompatíveis (cômodo pequeno vs WORLD gigante da rua), o mesmo
        glitch de "lançado num lugar aleatório antes de assentar" que o
        GangMarker já tinha (ver nota abaixo) — só que na câmera em vez do
        boneco. Isaias reportou de novo em 13/09/2026 achando que era a
        MESMA regressão; na verdade nunca tinha sido corrigido aqui, só no
        marcador. Forçar remontagem via key evita o navegador ter um valor
        anterior pra transicionar (elemento novo já nasce no transform
        final), sem tocar a suavização do passo a passo normal. */}
    <div key={local ? `${local.id}-${local.comodo}` : 'rua'} className="gang-cena-world" style={{ width: W.w, height: W.h, transform: `translate3d(${-camX}px,${-camY}px,0)` }}>
      {local ? <CenaInterior amb={amb} /> : <CenaCenario cena={cena} bossAberto={baseFeita || muroAberto} muroAberto={muroAberto} />}
      {!local && cena.trem && <TremFaixa trem={cena.trem} fase={trem.fase} t={t} />}
      {!local && (amb?.barreiras || []).map(b => <BarreiraFaixa key={b.id} b={b} t={t} />)}
      {(amb?.alvos || []).map(p => <ZonaChao key={`z-${p.id}`} p={p} active={perto?.id === p.id} />)}
      {(amb?.alvos || []).map(p => <PinoAlvo key={p.id} p={p} t={t} active={perto?.id === p.id} onColidir={reportarColisao} ignorado={brigaAuto.ignorados.has(p.id)} longeDe={p.id === volta.current?.adversario ? volta.current : null} />)}
      {/* key=local: rua e cada cômodo de interior são espaços de coordenada
          DIFERENTES (mundo pequeno do cômodo vs WORLD da rua) — sem isso, o
          Framer Motion anima o left/top do marcador DE UMA posição pra OUTRA
          entre esses dois espaços incompatíveis (ex: x=230 no cômodo pequeno
          "voando" até x=332 na rua gigante), um glitch visual de "cair num
          lugar vazio" antes de assentar no lugar certo. key força remontar
          (sem animação) toda vez que entra/sai de um interior. */}
      {!local && aleatorio.perseguidor && <div className={`gang-world-perseguidor is-${ALEATORIO_TIPOS[aleatorio.perseguidor.tipo]?.cor}`} style={{ left: aleatorio.perseguidor.x, top: aleatorio.perseguidor.y }}><span /><small>{t(`games.gangues.cena.aleatorio.${aleatorio.perseguidor.tipo}.nome`)}</small></div>}
      <GangMarker key={local ? `${local.id}-${local.comodo}` : 'rua'} player={player} facing={facing} gangName={store.gangName} retrato={getGanguesPortraitByTemplateId(store.getLider()?.character_template_id)} />
    </div><div className="gang-cena-vignette" />{noEscuro && <div className="gang-cena-apagao" style={{ '--px': `${player.x - camX}px`, '--py': `${player.y - camY}px` }} aria-hidden="true" />}{!local && (aleatorio.perseguidor?.tipo === 'policia' || aleatorio.onomatopeia === 'policia') && <div className="gang-cena-sirene" aria-hidden="true" />}{!local && cena.respeito && !prog.boss && <BarraRespeito cena={cena} prog={prog} t={t} />}{!local && cena.linhas && !prog.boss && <BarraLinhas cena={cena} cenaProgresso={store.cenaProgresso} t={t} />}{!local && cena.caderno && !prog.boss && <BarraCaderno cena={cena} prog={prog} flags={store.storyProgress.__flags || {}} t={t} />}{cena.alerta && !prog.boss && <BarraAlerta cena={cena} n={alertaDaCena(cena, store.storyProgress)} t={t} />}{hint && <div className="gang-cena-tutorial">{hint}</div>}{!local && !muroAberto && cena.muro && player.y < cena.muro.aviso && <div className="gang-cena-gatelock">🔒 {t(baseFeita ? cena.textos.muroPassagem : cena.textos.bossTrancado)}</div>}<AnimatePresence>{aleatorio.onomatopeia && <motion.div key="onomatopeia" className={`gang-cena-onomatopeia is-${ALEATORIO_TIPOS[aleatorio.onomatopeia]?.cor}`} initial={{ scale: .3, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: -6 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 14 }}><b>{t(`games.gangues.cena.aleatorio.${aleatorio.onomatopeia}.onomatopeia`)}</b></motion.div>}</AnimatePresence><AnimatePresence>{fade && <motion.div className="gang-cena-fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .16 }} />}</AnimatePresence></div>
    {!local && !intro && <GanguesMiniMapa player={player} alvos={minimapaAlvos} />}
    {!local && !intro && !encontro && !fade && <GanguesAlvoTutorial alvos={amb?.alvos} />}
    <WorldControls onInput={v => { inputRef.current = v }} onInteract={() => abrir(perto)} action={perto ? interactionLabel(perto, t) : null} rotulo={t('games.gangues.cena.acao.interagir')} brigaAuto={brigaAuto.ligado} brigaAutoBloqueada={brigaAuto.bloqueado} onBrigaAuto={brigaAuto.alternar} rotuloBrigaAuto={t('games.gangues.cena.briga_auto')} />
    <AnimatePresence>{toast && <motion.div className="gang-cena-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><b>{t('games.gangues.cena.recompensa')}</b>{toast.grana ? <span>💵 +{toast.grana}</span> : null}{toast.rep ? <span>⚑ +{toast.rep}</span> : null}{toast.xp ? <span>⚡ +{toast.xp} XP</span> : null}{toast.equip ? <span>{getGanguesEquip(toast.equip)?.icone} {t(getGanguesEquip(toast.equip)?.nome || '')}</span> : null}
    </motion.div>}</AnimatePresence>
    <BrigaAutoAviso anuncio={brigaAuto.anuncio} t={t} />
    <AnimatePresence>{aviso && <motion.div className="gang-cena-toast gang-cena-toast--aviso" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{aviso}</motion.div>}</AnimatePresence>
    {/* Marco de reputação recorrente (a cada 50) — modal BLOQUEANTE, não
        toast: só fecha ao clicar (pedido do Isaias, 2026-09-14). */}
    <GanguesRepRecompensaModal t={t} marco={repModalMarco} onClose={() => setRepModalMarco(null)} />
    <AnimatePresence>{encontro && <motion.div className="gang-cena-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="gang-cena-modal-bg" onClick={() => setEncontro(null)} /><motion.div className="gang-cena-modal-card" initial={{ y: 25 }} animate={{ y: 0 }}>{encontro.vs ? <TretaVS poi={encontro.poi} fala={encontro.fala} nivelTropa={nivelTropa} avisoOff={avisoNivelOff} onOcultarAviso={() => setAvisoNivelOff(true)} onSim={() => iniciarTreta(encontro.poi)} onNao={() => setEncontro(null)} t={t} territorioId={terr.id} /> : encontro.poi.tipo === 'papo' ? <GanguesPapo poi={encontro.poi} cena={cena} onResolve={resolver} onClose={() => setEncontro(null)} /> : encontro.poi.tipo === 'descanso' ? <GanguesDescanso poi={encontro.poi} cena={cena} onClose={() => setEncontro(null)} /> : encontro.poi.tipo === 'agiota' ? <GanguesAgiota poi={encontro.poi} territorioId={terr.id} onClose={() => setEncontro(null)} onClube={iniciarClube} /> : encontro.poi.tipo === 'banca' ? <GanguesBanca poi={encontro.poi} onClose={() => setEncontro(null)} /> : encontro.poi.tipo === 'loja' ? <GanguesLoja poi={encontro.poi} onClose={() => setEncontro(null)} /> : encontro.poi.tipo === 'ferreiro' ? <GanguesFerreiro poi={encontro.poi} onClose={() => setEncontro(null)} /> : encontro.poi.tipo === 'jogo' ? <GanguesJogoContador poi={encontro.poi} onResolve={resolver} onClose={() => setEncontro(null)} /> : <GanguesParada poi={encontro.poi} cena={cena} onResolve={resolver} onClose={() => setEncontro(null)} />}</motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{fichaIndex !== null && store.activeParty[fichaIndex] && <motion.div className="gang-cena-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="gang-cena-modal-bg" onClick={() => setFichaIndex(null)} /><motion.div className="gang-cena-modal-card gang-cena-ficha-scroll" initial={{ y: 25 }} animate={{ y: 0 }}><div className="gang-cena-enc-acoes gang-cena-ficha-nav">{store.activeParty.length > 1 && <button className="gang-cena-btn" onClick={() => setFichaIndex(i => (i + store.activeParty.length - 1) % store.activeParty.length)}>◀ {t('games.gangues.cena.ficha_anterior')}</button>}<button className="gang-cena-btn gang-cena-btn--go" onClick={() => setFichaIndex(null)}>{t('games.gangues.cena.fechar')}</button>{store.activeParty.length > 1 && <button className="gang-cena-btn" onClick={() => setFichaIndex(i => (i + 1) % store.activeParty.length)}>{t('games.gangues.cena.ficha_proximo')} ▶</button>}</div>
      {/* Vaga de recrutamento liberada — nunca silencioso (mesmo motivo do
          marco de reputação): quem abre a ficha vê na hora que dá pra chamar
          mais alguém, com o botão pra ir direto lá. */}
      {podeRecrutarAgora && (
        <div className="gang-cena-recrutar-banner">
          <b>🎖 {t('games.gangues.recrutar_banner.titulo')}</b>
          <span>{t('games.gangues.recrutar_banner.desc')}</span>
          <button className="gang-cena-btn gang-cena-btn--go" onClick={irRecrutar}>{t('games.gangues.recrutar_banner.cta')}</button>
        </div>
      )}
      <GanguesCenaFichaCard member={store.activeParty[fichaIndex]} t={t} onToggleEspecial={store.toggleEspecial} /></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{bagAberta && <motion.div className="gang-cena-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="gang-cena-modal-bg" onClick={() => setBagAberta(false)} /><motion.div className="gang-cena-modal-card gang-cena-ficha-scroll" initial={{ y: 25 }} animate={{ y: 0 }}><GanguesCenaBagSheet store={store} t={t} onClose={() => setBagAberta(false)} /></motion.div></motion.div>}</AnimatePresence>
  </main>
}
