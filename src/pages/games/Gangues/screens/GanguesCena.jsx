import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { sfx } from '../../../../lib/sfx'
import GangDialog from '../components/GangDialog'
import GanguesPapo from '../components/cena/GanguesPapo'
import GanguesParada from '../components/cena/GanguesParada'
import GanguesDescanso from '../components/cena/GanguesDescanso'
import GanguesLoja from '../components/cena/GanguesLoja'
import GanguesMiniMapa from '../components/cena/GanguesMiniMapa'
import GanguesAlvoTutorial from '../components/cena/GanguesAlvoTutorial'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import CenaCenario from '../components/cena/CenaCenario'
import CenaInterior from '../components/cena/CenaInterior'
import GanguesCenaBagSheet from '../components/cena/GanguesCenaBagSheet'
import GanguesCenaFichaCard from '../components/cena/GanguesCenaFichaCard'
import GanguesRepRecompensaModal from '../components/GanguesRepRecompensaModal'
import { GangMarker, EntryZone, PinoAlvo, WorldControls, interactionLabel } from '../components/cena/GanguesCenaAtores'
import { EventoVS, TretaVS } from '../components/cena/GanguesCenaEncontros'
import { CENAS_POR_ID, portaoAberto, contarCena } from '../data/cenas/cenaHelpers.js'
import { GANGUES_TERRITORIO_POR_ID } from '../data/ganguesTerritorios.js'
import { calcularPontosTime } from '../data/ganguesEncontros.js'
import { getGanguesPortraitByTemplateId } from '../data/ganguesPortraits.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX, getGanguesRosterLimitComHistoria, GANGUES_REP_GATE_EVENTO, GANGUES_REP_GATE_GALPAO, GANGUES_REP_GATE_CLUBE } from '../data/ganguesLoadout.js'
import { WORLD, SPAWN, montarAmbiente, insideZone, validPosition, validPos } from '../engine/ganguesCenaMotor.js'
import useGanguesCenaMovimento from '../hooks/useGanguesCenaMovimento.js'
import useGanguesCenaEventoAleatorio from '../hooks/useGanguesCenaEventoAleatorio.js'
import './GanguesCena.css'

// Cada cena vira um tutorial_id próprio (`cena_intro:<cenaId>`) dentro do
// mesmo dicionário de tutoriais vistos por CONTA (TutorialProgressContext) —
// não mais localStorage por save/aparelho. Pedido do Isaias (14/09/2026):
// "toda vez que abro num aparelho novo, aparece de novo, grava no Supabase".
function cenaIntroTutorialId(cenaId) { return `cena_intro:${cenaId}` }

export default function GanguesCena({ onNavigate }) {
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
    return validPosition(p) ? { x: p.x, y: p.y } : (cena?.mundo?.spawn || SPAWN)
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
  const amb = useMemo(() => montarAmbiente(cena, local, prog, baseFeita, muroAberto), [cena, local, prog, baseFeita, muroAberto])
  const collidersRef = useRef(null); collidersRef.current = amb?.colliders || []
  const worldRef = useRef(null); worldRef.current = amb?.world || WORLD
  const gateRef = useRef(null); gateRef.current = amb?.gateAtivo || null

  const { player, setPlayer, facing, andou, inputRef, passosRef } = useGanguesCenaMovimento({
    intro, encontro, fade, gateRef, collidersRef, worldRef, initialPlayer: posInicial,
  })

  // Encontro aleatório de rua ("selvagem"): conta passos e, com cooldown +
  // teto, dispara vez ou outra enquanto anda na rua (nunca em interior).
  const localRef = useRef(local); localRef.current = local
  const { nivelTropa, tentarEvento } = useGanguesCenaEventoAleatorio({ store, t, cena, localRef, encontro, fade, intro, passosRef, setEncontro })

  const perto = useMemo(() => (amb?.alvos || []).find(a => (a.estado === 'disponivel' || a.repetivel) && insideZone(player, a.zona)) || null, [amb, player])
  const { feitos, total } = cena ? contarCena(cena, prog.resolvidos, prog.boss) : { feitos: 0, total: 0 }
  // local aponta pra um interior/cômodo que não existe (save antigo, cena
  // diferente) → volta pra rua.
  useEffect(() => { if (cena && local && !amb) { setLocal(null); setPlayer(cena.mundo?.spawn || SPAWN) } }, [cena, local, amb])

  // Roll de encontro aleatório a cada mudança de posição (o passosRef só sobe
  // quando o jogador ANDA de fato — ver useGanguesCenaMovimento).
  useEffect(() => { tentarEvento() }, [player])
  useEffect(() => {
    if (intro || encontro) return
    if (!andou) { setHint(t('games.gangues.cena.hint_andar')); return }
    if (local) { setHint(null); return }
    if (perto && Object.keys(prog.resolvidos).length === 0) { setHint(t('games.gangues.cena.hint_interagir')); return }
    if (prog.resolvidos.ferro && !prog.resolvidos.oficina) {
      // Oficina do Nando é OBRIGATÓRIA pro portão e só fecha com 2× sucata
      // (item 13) — 1 no puzzle do ferro-velho, 1 no fundo dele (`achado`).
      // Se o jogador só tem 1, aponta pro achado — MAS só enquanto o achado
      // ainda existir pra pegar. Se falhou a gazua (perdeu aquele pedaço pra
      // sempre) e já pegou o achado, não sobra fonte nenhuma: apontar de
      // novo pro "fundo do ferro-velho" (que ele já esvaziou) é mentira —
      // era exatamente o bug reportado pelo Isaias (13/09/2026).
      if ((store.inventario?.[13] || 0) >= 2) { setHint(t('games.gangues.cena.hint_sucata')); return }
      if (!prog.resolvidos.achado) { setHint(t('games.gangues.cena.hint_sucata_falta')); return }
      setHint(null); return
    }
    setHint(null)
  }, [intro, encontro, andou, perto, prog.resolvidos, local, t, store.inventario])
  if (!cena || !terr) return <main className="gang-lobby"><button className="gang-new-sheet" onClick={() => onNavigate('story')}>← MAPA</button></main>
  // `local` aponta pra um interior inválido — o efeito acima já vai zerar; só
  // não renderiza esse frame pra não quebrar em amb null.
  if (local && !amb) return <main className="gang-cena-worldpage" style={{ '--terr-cor': cena.cor }}><div className="gang-cena-viewport" /></main>
  const fecharIntro = () => { marcarTutorialVisto(cenaIntroTutorialId(cena.id)); setIntro(false) }
  const guardarPosicao = (over) => store.salvarPosicaoCena(cena.id, { ...(over || player), local: over?.local !== undefined ? over.local : local })
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
      if (r.grana || r.rep || r.item) { setToast({ ...r }); setTimeout(() => setToast(null), 2600) }
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
  // Aceitou o Clube da Luta na birosca: a entrada já fia 15× e cura a tropa, e
  // o jogador é vendado e levado pra roda (fase 'clube' → sequestro → combate).
  // `clubeDividaPrevia` = dívida ANTES da entrada — decide se a vitória paga os
  // 200 de grana (entrou limpo) ou só quita a dívida.
  const iniciarClube = (custoBase) => {
    // Rota de escape de quem já tá endividado com o Nato — NUNCA bloqueia
    // quem já tem dívida, senão vira soft-lock cruel (endividado sem rep
    // preso sem conseguir quitar). O gate só vale pra quem entra "por
    // vontade própria" (sem dívida, atrás dos 200 de grana).
    const dividaAtualGate = store.storyProgress.__birosca?.divida || 0
    if (dividaAtualGate <= 0 && store.rep < GANGUES_REP_GATE_CLUBE) {
      setEncontro(null); sfx.cancel?.()
      setAviso(t('games.gangues.cena.aviso_rep_clube', { rep: GANGUES_REP_GATE_CLUBE }))
      setTimeout(() => setAviso(null), 3600)
      return
    }
    setEncontro(null); guardarPosicao(); sfx.vs?.()
    const dividaPrevia = store.storyProgress.__birosca?.divida || 0
    store.entrarClubeDaLuta(custoBase || 10)
    store.setStoryTarget({ clube: true, clubeBase: custoBase || 10, clubeDividaPrevia: dividaPrevia, clubeRonda: 1, clubeHeals: 0, voltar: { territorioId: terr.id } })
    onNavigate('clube')
  }
  const iniciarEvento = () => {
    if (barraSeChao()) return
    if (store.rep < GANGUES_REP_GATE_EVENTO) {
      setEncontro(null); sfx.cancel?.()
      setAviso(t('games.gangues.cena.aviso_rep_evento', { rep: GANGUES_REP_GATE_EVENTO }))
      setTimeout(() => setAviso(null), 3600)
      return
    }
    guardarPosicao(); sfx.vs?.()
    const grana = 6 + Math.floor(Math.random() * 7)
    store.setStoryTarget({
      territorioId: terr.id, cenaId: cena.id, evento: true,
      cenaRecompensa: { grana, rep: 1, item: 20, qtd: 1 }, pontoIds: terr.pontos.map(p => p.id),
    })
    onNavigate('story-combat')
  }
  const iniciarTreta = (poi, { viraTreta, revela } = {}) => {
    if (barraSeChao()) return
    if (poi.repGate && store.rep < poi.repGate) {
      setEncontro(null); sfx.cancel?.()
      setAviso(t('games.gangues.cena.aviso_rep_treta', { rep: poi.repGate }))
      setTimeout(() => setAviso(null), 3600)
      return
    }
    const chefe = Boolean(poi.ehChefe)
    guardarPosicao(); sfx.vs?.()
    // Treta repetível ("farma"): trava o retrato de pontos na primeira vez —
    // as próximas entradas usam sempre esse mesmo número, então o bando não
    // cresce junto com a gangue (ver travarPontosFarm no store).
    // `semTravarPontos`: exceção pra treta repetível que também é passagem
    // obrigatória/osso duro (ex: galpao_m2) — o Isaias usa ela pra TREINAR,
    // então precisa continuar repetível, mas sem congelar força pra sempre
    // no retrato da 1ª vitória (2026-09-14, depois de reportar o galpão
    // fraco de novo porque o retrato tinha travado antes do rebalanceamento).
    let pontosFixos = null
    if (poi.repetivel && !poi.semTravarPontos && !viraTreta && !chefe) {
      const party = store.roster.slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)
      pontosFixos = store.travarPontosFarm(cena.id, poi.id, calcularPontosTime(party))
    }
    store.setStoryTarget({ territorioId: terr.id, cenaId: cena.id, cenaPoiId: poi.id, cenaRevela: viraTreta ? (revela || []) : (poi.revela || []), cenaRecompensa: viraTreta ? (viraTreta.recompensa || null) : poi.recompensa || null, cenaSemTravar: Boolean(viraTreta?.semTravar), pontoIds: terr.pontos.map(p => p.id), noId: chefe ? cena.chefe.poiNo : null, enemyId: viraTreta ? viraTreta.enemy : poi.enemy, fixo: Boolean(viraTreta), liderFixo: viraTreta ? null : poi.liderFixo, moldesPool: viraTreta ? null : poi.moldesPool, revezamento: viraTreta ? (viraTreta.revezamento || null) : poi.revezamento, dificuldade: poi.dificuldade, isChefe: chefe, repDelta: viraTreta?.rep || 0, pontosFixos, qtdMin: viraTreta ? null : (poi.qtdMin ?? null), qtdMax: viraTreta ? null : (poi.qtdMax ?? null), ratioBonus: viraTreta ? 0 : (poi.ratioBonus || 0) })
    onNavigate('story-combat')
  }
  const resolver = res => {
    const poi = encontro.poi; setEncontro(null)
    if (res?.viraTreta) { iniciarTreta(poi, { viraTreta: res.viraTreta, revela: res.revela }); return }
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
    if (r.grana || r.rep || r.xp || r.item || res?.daEquip?.length) { setToast({ ...r }); setTimeout(() => setToast(null), 2600) }
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
    ? `${t(amb.nomeLugar)}${amb.comodoTotal > 1 ? ` · ${t('games.gangues.cena.comodo', { n: amb.comodoIdx + 1, de: amb.comodoTotal })}` : ''}`
    : `A PISTA `
  // Metas obrigatórias da cena (portao.precisa + o chefe) — o que abre o
  // caminho por baixo do muro. Vira a lista do checklist do topo.
  const metaDe = id => {
    const p = cena.pois.find(x => x.id === id)
    return { id, nome: p?.i18n ? t(`${p.i18n}.nome`) : id, feito: Boolean(prog.resolvidos[id]) }
  }
  const metas = local ? [] : [
    ...(cena.portao?.precisa || []).map(metaDe),
    // depois que a brecha abre, os 2 bondes de tocaia pós-muro entram na lista
    ...(baseFeita ? ['posmuro_1', 'posmuro_2'].map(metaDe) : []),
    { id: '__boss', nome: t(`games.gangues.story.bosses.${cena.chefe.boss}.nome`), feito: Boolean(prog.boss) },
  ]
  // Setinhas do mini-mapa: só os objetivos PENDENTES E JÁ REVELADOS (não
  // spoila o que o jogador ainda nem descobriu), com a posição no mundo. Se
  // tudo fechou mas o muro ainda não abriu, o alvo vira a boca do túnel.
  const minimapaAlvos = local ? [] : metas.filter(m => !m.feito).map(m => {
    if (m.id === '__boss' && baseFeita && !muroAberto) {
      // Antes do muro: aponta pra boca do túnel.
      if (player.y >= 1330) return { id: '__tunel', nome: t('games.gangues.cena.minimapa.tunel'), pos: { x: 452, y: 1404 } }
      // Já do outro lado: primeiro os 2 bondes de tocaia (posmuro_1 → posmuro_2),
      // depois a porta do galpão.
      if (!prog.resolvidos.posmuro_1) return { id: 'posmuro_1', nome: t('games.gangues.cena.pista.posmuro_1.nome'), pos: cena.pos.posmuro_1 }
      if (!prog.resolvidos.posmuro_2) return { id: 'posmuro_2', nome: t('games.gangues.cena.pista.posmuro_2.nome'), pos: cena.pos.posmuro_2 }
      return { id: '__galpao', nome: t('games.gangues.cena.minimapa.galpao'), pos: { x: 596, y: 262 } }
    }
    if (m.id === '__boss') return { ...m, pos: cena.pos.boss }
    const pd = cena.pois.find(x => x.id === m.id)
    if (!pd || !(pd.visivel || prog.revelados[m.id])) return null
    return { ...m, pos: cena.pos[m.id] }
  }).filter(m => m?.pos)
  return <main className={`gang-cena-worldpage${local ? ' is-interior' : ''}`} style={{ '--terr-cor': cena.cor }}>
    <AnimatePresence>{intro && <GangDialog lines={t(cena.chegada)} speaker={t(cena.falante)} sub={t(cena.falanteSub)} onFinish={fecharIntro} onSkip={fecharIntro} />}</AnimatePresence>
    <header className="gang-cena-worldhud"><button onClick={() => { local ? sair() : (guardarPosicao(), onNavigate('story')) }}>← {local ? t('games.gangues.cena.acao.sair') : 'MAPA'}</button><strong>{breadcrumb}{!local && (prog.boss ? <i className="gang-cena-dominado-selo">⚑ DOMINADA</i> : <button className="gang-cena-meta-btn" onClick={() => setChecklist(v => !v)}>{feitos}/{total} ▾</button>)}</strong><span>💵 {store.grana}　⚑ {store.rep}</span><button className="gang-cena-ficha-btn" onClick={() => setBagAberta(true)} aria-label={t('games.gangues.bag.titulo')}>🎒</button>{store.activeParty.length > 0 && <button className="gang-cena-ficha-btn" onClick={() => setFichaIndex(0)}>👤</button>}<button className="gang-cena-ficha-btn" onClick={() => { guardarPosicao(); onNavigate('album') }} aria-label={t('games.gangues.album.titulo')}>📕</button></header>
    <AnimatePresence>{checklist && !local && <motion.div className="gang-cena-checklist" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <b>{t('games.gangues.cena.checklist_titulo')}</b>
      <ul>{metas.map(m => <li key={m.id} className={m.feito ? 'is-feito' : ''}><span>{m.feito ? '✓' : '○'}</span>{m.nome}</li>)}</ul>
      <p>{t(baseFeita ? (prog.boss ? 'games.gangues.cena.checklist_dominada' : 'games.gangues.cena.checklist_tunel_aberto') : 'games.gangues.cena.checklist_dica')}</p>
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
      {(amb?.alvos || []).map(p => <EntryZone key={`zone-${p.id}`} poi={p} active={perto?.id === p.id} />)}
      {(amb?.alvos || []).map(p => <PinoAlvo key={p.id} p={p} t={t} />)}
      {/* key=local: rua e cada cômodo de interior são espaços de coordenada
          DIFERENTES (mundo pequeno do cômodo vs WORLD da rua) — sem isso, o
          Framer Motion anima o left/top do marcador DE UMA posição pra OUTRA
          entre esses dois espaços incompatíveis (ex: x=230 no cômodo pequeno
          "voando" até x=332 na rua gigante), um glitch visual de "cair num
          lugar vazio" antes de assentar no lugar certo. key força remontar
          (sem animação) toda vez que entra/sai de um interior. */}
      <GangMarker key={local ? `${local.id}-${local.comodo}` : 'rua'} player={player} facing={facing} gangName={store.gangName} retrato={getGanguesPortraitByTemplateId(store.getLider()?.character_template_id)} />
    </div><div className="gang-cena-vignette" />{hint && <div className="gang-cena-tutorial">{hint}</div>}{!local && !muroAberto && player.y < 1430 && <div className="gang-cena-gatelock">🔒 {t(baseFeita ? 'games.gangues.cena.muro_tunel' : 'games.gangues.cena.boss_trancado')}</div>}<AnimatePresence>{fade && <motion.div className="gang-cena-fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .16 }} />}</AnimatePresence></div>
    {!local && !intro && <GanguesMiniMapa player={player} alvos={minimapaAlvos} />}
    {!local && !intro && !encontro && !fade && <GanguesAlvoTutorial alvos={amb?.alvos} />}
    <WorldControls onInput={v => { inputRef.current = v }} onInteract={() => abrir(perto)} action={perto ? interactionLabel(perto, t) : null} />
    <AnimatePresence>{toast && <motion.div className="gang-cena-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><b>RECOMPENSA</b>{toast.grana ? <span>💵 +{toast.grana}</span> : null}{toast.rep ? <span>⚑ +{toast.rep}</span> : null}{toast.xp ? <span>⚡ +{toast.xp} XP</span> : null}
    </motion.div>}</AnimatePresence>
    <AnimatePresence>{aviso && <motion.div className="gang-cena-toast gang-cena-toast--aviso" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{aviso}</motion.div>}</AnimatePresence>
    {/* Marco de reputação recorrente (a cada 50) — modal BLOQUEANTE, não
        toast: só fecha ao clicar (pedido do Isaias, 2026-09-14). */}
    <GanguesRepRecompensaModal t={t} marco={repModalMarco} onClose={() => setRepModalMarco(null)} />
    <AnimatePresence>{encontro && <motion.div className="gang-cena-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="gang-cena-modal-bg" onClick={() => setEncontro(null)} /><motion.div className="gang-cena-modal-card" initial={{ y: 25 }} animate={{ y: 0 }}>{encontro.evento ? <EventoVS fala={encontro.fala} onSim={iniciarEvento} onNao={() => setEncontro(null)} cenaId={cena.id} t={t} /> : encontro.vs ? <TretaVS poi={encontro.poi} fala={encontro.fala} nivelTropa={nivelTropa} avisoOff={avisoNivelOff} onOcultarAviso={() => setAvisoNivelOff(true)} onSim={() => iniciarTreta(encontro.poi)} onNao={() => setEncontro(null)} t={t} /> : encontro.poi.tipo === 'papo' ? <GanguesPapo poi={encontro.poi} cena={cena} onResolve={resolver} onClose={() => setEncontro(null)} /> : encontro.poi.tipo === 'descanso' ? <GanguesDescanso poi={encontro.poi} cena={cena} onClose={() => setEncontro(null)} onClube={iniciarClube} /> : encontro.poi.tipo === 'loja' ? <GanguesLoja poi={encontro.poi} onClose={() => setEncontro(null)} /> : <GanguesParada poi={encontro.poi} cena={cena} onResolve={resolver} onClose={() => setEncontro(null)} />}</motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{fichaIndex !== null && store.activeParty[fichaIndex] && <motion.div className="gang-cena-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="gang-cena-modal-bg" onClick={() => setFichaIndex(null)} /><motion.div className="gang-cena-modal-card gang-cena-ficha-scroll" initial={{ y: 25 }} animate={{ y: 0 }}><div className="gang-cena-enc-acoes gang-cena-ficha-nav">{store.activeParty.length > 1 && <button className="gang-cena-btn" onClick={() => setFichaIndex(i => (i + store.activeParty.length - 1) % store.activeParty.length)}>◀ ANTERIOR</button>}<button className="gang-cena-btn gang-cena-btn--go" onClick={() => setFichaIndex(null)}>FECHAR</button>{store.activeParty.length > 1 && <button className="gang-cena-btn" onClick={() => setFichaIndex(i => (i + 1) % store.activeParty.length)}>PRÓXIMO ▶</button>}</div>
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
