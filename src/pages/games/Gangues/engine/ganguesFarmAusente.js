/* ══════════════════════════════════════════════════════════════
   FARM AUSENTE — o idle do Gangues (pedido do Isaias, 28/09/2026).
   Em vez de deixar o jogo rodando escondido (o navegador desacelera e
   congela aba de fundo; no Android pode até matar), a cena é DESMONTADA
   quando o app vai pra segundo plano com a briga automática ligada, e na
   volta o que teria acontecido é CALCULADO "no seco": as lutas que cabem no
   tempo fora, com as mesmas contas de uma luta de verdade (mesmo gerador de
   bando, mesmo motor da Briga em Multidão — engine/ganguesBrigaMultidao.js —
   e as mesmas ações do store da tela de vitória). Ideia do Horizon Chase:
   fora da tela, o jogo é só dado.

   Regras do Isaias:
   • só conta com a aba ABERTA (app em segundo plano). Fechou a aba, perdeu
     — o ponto de partida mora só na memória da página, de propósito, pra o
     jogo não virar "esquece e volta rico";
   • no máximo +5 níveis por ausência (GANGUES_FARM_TETO_NIVEIS): bateu, para;
   • farma SÓ o adversário que o jogador estava grindando — o da última
     luta (`posicao.adversario`), com o mesmo gerador de bando e o mesmo
     nível daquele ponto. Nunca "a região": o bairro tem gente de todo
     nível, a conta tem que ser a daquele cara (Isaias, 28/09/2026). Sem
     adversário, ou se ele não vale pra briga automática (vermelho, chefe,
     área do chefe — naAreaDoChefe, cenaHelpers.js), não farma nada;
   • segue o AJUSTE do automático: o talento escolhido pra cada um entra na
     luta calculada, e as poções (PV e PM, cada uma com sua opção) são usadas
     DENTRO da luta, rodada a rodada, com a mesma regra da luta ao vivo — e
     também entre uma luta e outra;
   • app foi pro fundo NO MEIO de uma luta da cena com o automático
     ligado: a tela da luta também é desmontada (o som e os relógios param)
     e a MESMA luta é terminada por cálculo, do ponto exato onde parou
     (`lutaAoVivo`); depois segue o farm, se a briga automática estiver
     ligada. Na volta o jogador está no ponto da briga — ou na birosca;
   • perdeu uma luta = para ali, sem XP nenhum dessa luta, a tropa acorda na
     birosca DAQUELE bairro (o mesmo socorro da derrota de verdade — na
     Feira é a pensão) e TODO automático desliga.
   ══════════════════════════════════════════════════════════════ */
import { iniciarBrigaMultidao, iniciarBrigaMultidaoDeCombatentes, avancarRodadaMultidao } from './ganguesBrigaMultidao.js'
import { calcularApTotal, calcularPesosEParticipantes, calcularRecompensaCena } from './ganguesVictoryResolver.js'
import { estadoPoi, posNoMapa } from './ganguesCenaMotor.js'
import { destinoSocorroDerrota, naAreaDoChefe } from '../data/cenas/cenaHelpers.js'
import { gerarBandoRevezamento, gerarBandoInimigo, escalarInimigo } from '../data/ganguesEncontros.js'
import { ajustarPontosFixo } from '../data/ganguesDificuldade.js'
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from '../data/ganguesLoadout.js'
import { GANGUES_SUCATA_ID } from '../data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA } from '../data/ganguesItens.js'
import { getEquippedActiveGanguesSpecials } from './ganguesSpecialEffects.js'
import { lerAutoConfig, melhorPocao, POCAO_LIMIAR_PV } from '../hooks/useGanguesModoAuto.js'

/** Sobra mínima de tempo (depois da luta interrompida) pra ainda farmar. A
 *  espera de 3 minutos antes de tudo isso mora no GanguesFarmAusente.jsx. */
const GANGUES_FARM_MIN_S = 30
/** Upagem no MODO LENTO (Isaias, 28/09/2026: "é o tempo do modo normal, só
 *  que duas vezes mais, pra não ficar fácil demais"). Cada luta calculada
 *  dura o que ela duraria jogada no MANUAL, na velocidade 1x, golpe a golpe —
 *  e conta o DOBRO disso. Ritmo tirado do código do combate:
 *  • dado dramático: ~3,15s por golpe (0,4s de "?", ~1,75s rolando, 1s
 *    revelando — components/DramaticDice.jsx);
 *  • inimigo "pensa" 2,2s antes de bater (enemyDelay, useGanguesTurnMachine);
 *  • jogador no manual: ~2,5s pra abrir o menu e escolher o golpe;
 *  • usar item: ~3s de toques, sem dado;
 *  • por luta: ~12s de telas (carta, resultado, relatório, chegar no próximo). */
const RITMO_DADO_MS = 3150
const RITMO_INIMIGO_PENSA_MS = 2200
const RITMO_JOGADOR_ESCOLHE_MS = 2500
const RITMO_ITEM_MS = 3000
const RITMO_TELAS_POR_LUTA_MS = 12000
const GANGUES_FARM_LENTIDAO = 2
/** Teto de níveis por ausência — "no máximo 5 levels" (Isaias). */
export const GANGUES_FARM_TETO_NIVEIS = 5
/** Rede de segurança de processamento (7h de farm) — o teto de nível
 *  costuma parar bem antes. */
const GANGUES_FARM_MAX_LUTAS = 600
const GANGUES_FARM_MAX_RODADAS = 80
// Mesma chance de sucata da vitória de rua de verdade (useGanguesVictoryResolution).
const GANGUES_FARM_SUCATA_CHANCE = 0.2

const nivelDe = m => getGanguesLevelFromXp(m?.xp_total ?? 0)
const vermelho = (p, prog) => !p.opcional && !prog.resolvidos?.[p.id]

/** O ponto que o farm ausente repete: o adversário da última luta — e só
 *  ele. Null se não tem, ou se ele não vale pra briga automática. */
export function alvoDoFarm(cena, prog, rep = 0) {
  if (!cena || !prog) return null
  const pos = prog.posicao || {}
  if (naAreaDoChefe(cena, prog, pos)) return null
  const p = cena.pois.find(x => x.id === pos.adversario)
  const vale = p && p.tipo === 'treta' && p.repetivel && !p.ehChefe && !vermelho(p, prog)
    && estadoPoi(p, prog) === 'disponivel' && !(p.repGate && rep < p.repGate)
    && (p.revezamento || p.pontosFixo) && !naAreaDoChefe(cena, prog, posNoMapa(cena, p.id) || {})
  return vale ? p : null
}

// Mesmo bando que o GanguesRoute monta pra esse ponto (sem as suavizações de
// 1ª luta/frustração, que não se aplicam a farm).
function bandoDoPoi(poi, { party, enemiesData, modo, territorioId }) {
  if (poi.revezamento) return gerarBandoRevezamento({ ...poi.revezamento, enemiesData, modo, playerTeam: party })
  if (poi.fixo) {
    const molde = enemiesData.find(e => e.id === poi.enemy)
    return molde ? [escalarInimigo(molde, ajustarPontosFixo(poi.pontosFixo, modo))] : null
  }
  return gerarBandoInimigo({ territorioId, pontosFixo: ajustarPontosFixo(poi.pontosFixo, modo), playerTeam: party, enemiesData, liderFixo: poi.liderFixo, moldesPool: poi.moldesPool, qtdMin: poi.qtdMin, qtdMax: poi.qtdMax })
}

// Mesmo bando que o GanguesRoute monta pra uma luta de bairro a partir do
// storyTarget dela (revezamento, ficha fixa ou bando de pontos fixos) — pra
// repetir no farm a luta que estava na tela. Sem as suavizações de 1ª luta/
// frustração, que não valem pra farm.
function bandoDoAlvo(alvo, { party, enemiesData, modo }) {
  let bando = null
  if (alvo.revezamento?.pool?.length) bando = gerarBandoRevezamento({ ...alvo.revezamento, enemiesData, modo, playerTeam: party })
  else if (alvo.fixo) {
    const molde = enemiesData.find(e => e.id === alvo.enemyId)
    bando = molde ? [alvo.pontosFixos > 0 ? escalarInimigo(molde, ajustarPontosFixo(alvo.pontosFixos, modo)) : molde] : null
  } else if (alvo.pontosFixos) {
    bando = gerarBandoInimigo({ territorioId: alvo.territorioId, pontosFixo: ajustarPontosFixo(alvo.pontosFixos, modo), playerTeam: party, enemiesData, liderFixo: alvo.liderFixo, moldesPool: alvo.moldesPool, qtdMin: alvo.qtdMin, qtdMax: alvo.qtdMax })
  }
  if (bando?.length && alvo.ajusteInimigo && bando[0].stats) {
    const stats = { ...bando[0].stats }
    for (const [k, v] of Object.entries(alvo.ajusteInimigo)) stats[k] = Math.max(0, (Number(stats[k]) || 0) + v)
    bando = [{ ...bando[0], stats }, ...bando.slice(1)]
  }
  return bando
}

// Poções DENTRO da luta calculada, rodada a rodada — a mesma regra do
// automático ao vivo (escolherAcaoAuto): alguém com PV ≤ 50% → o MAIS
// INTEIRO da tropa gasta a vez dele dando a poção de PV (1 por rodada); quem
// tem talento no ajuste e ficou sem PM pra ele toma poção de PM na própria
// vez. Quem usa item abre mão do ataque naquela rodada (personagensUsandoItem).
function pocoesDaRodada(estado, { store, config, especiais, resumo }) {
  const usandoItem = {}
  if (!config.pocao && !config.pocaoPm) return { estado, usandoItem }
  const lista = estado.combatants.map(c => ({ ...c }))
  const vivos = lista.filter(c => c.side === 'player' && c.pv > 0 && c.pvMax > 0)
  const itensAgora = () => { const inv = store().inventario; return GANGUES_ITENS_LISTA.map(i => ({ ...i, quantidade: inv[i.id] || 0 })) }
  if (config.pocao) {
    const ferido = vivos.filter(c => c.pv / c.pvMax <= POCAO_LIMIAR_PV).sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
    const maisInteiro = [...vivos].sort((a, b) => (b.pv - a.pv) || (b.pv / b.pvMax - a.pv / a.pvMax))[0]
    const pocao = ferido && maisInteiro && melhorPocao(itensAgora(), 'cura_pv', ferido.pvMax - ferido.pv)
    if (pocao && store().usarItem(pocao.id)) {
      ferido.pv = Math.min(ferido.pvMax, ferido.pv + pocao.valor)
      usandoItem[maisInteiro.id] = true
      resumo.pocoes++
    }
  }
  if (config.pocaoPm) {
    for (const c of vivos) {
      const talento = (especiais[c.id] || []).find(x => x.id === config.talentos?.[c.id])
      const custo = talento?.effect?.cost
      if (usandoItem[c.id] || custo?.kind !== 'pm') continue
      const precisa = custo.values[talento.level - 1]
      if (c.pm >= precisa) continue
      const pocao = melhorPocao(itensAgora(), 'cura_pm', precisa - c.pm)
      if (pocao && store().usarItem(pocao.id)) {
        c.pm = Math.min(c.pmMax, c.pm + pocao.valor)
        usandoItem[c.id] = true
        resumo.pocoes++
      }
    }
  }
  return { estado: { ...estado, combatants: lista }, usandoItem }
}

// Quanto tempo (s) as ações de uma rodada levariam no manual, 1x, já no
// modo lento (× GANGUES_FARM_LENTIDAO).
function segundosDaRodada(eventos) {
  const ms = eventos.reduce((soma, ev) => soma + (
    ev.type === 'item' ? RITMO_ITEM_MS
      : ev.type === 'attack' ? RITMO_DADO_MS + (ev.side === 'enemy' ? RITMO_INIMIGO_PENSA_MS : RITMO_JOGADOR_ESCOLHE_MS)
        : 0
  ), 0)
  return (ms * GANGUES_FARM_LENTIDAO) / 1000
}

// Roda a luta calculada até o fim, com talento e poções do ajuste do
// automático. Devolve também quanto tempo ela "levou" (`segundos`, modo lento).
function rodarLuta(estadoInicial, { party, store, config, resumo }) {
  const especiais = Object.fromEntries(party.map(m => [m.id, getEquippedActiveGanguesSpecials(m)]))
  let estado = estadoInicial
  let segundos = (RITMO_TELAS_POR_LUTA_MS * GANGUES_FARM_LENTIDAO) / 1000
  for (let i = 0; i < GANGUES_FARM_MAX_RODADAS && !estado.terminado; i++) {
    const r = pocoesDaRodada(estado, { store, config, especiais, resumo })
    estado = avancarRodadaMultidao(r.estado, config.talentos, especiais, r.usandoItem)
    segundos += segundosDaRodada(estado.eventosRodada || [])
  }
  return { outcome: estado.outcome || 'defeat', combatants: estado.combatants, segundos }
}

// Entre uma luta e outra (sem vez a perder): com a poção de PV ligada, quem
// saiu de pé com PV ≤ 50% toma poção até passar dos 50%; com a de PM ligada,
// quem tem talento no ajuste e está sem PM pra ele toma poção de PM até dar.
// Devolve quantas foram usadas.
function tomarPocoes(store, combatants, config) {
  let usadas = 0
  const itensAgora = () => { const inv = store().inventario; return GANGUES_ITENS_LISTA.map(i => ({ ...i, quantidade: inv[i.id] || 0 })) }
  const encher = (c, tipo, atual, falta) => {
    while (falta() > 0) {
      const pocao = melhorPocao(itensAgora(), tipo, falta())
      if (!pocao) return
      const { curou } = store().curarMembro(c.id, tipo, pocao.valor)
      if (!curou || !store().usarItem(pocao.id)) return
      atual.v += curou
      usadas++
    }
  }
  for (const c of combatants.filter(x => x.side === 'player' && x.pv > 0)) {
    if (config.pocao) {
      const pv = { v: c.pv }
      encher(c, 'cura_pv', pv, () => (pv.v / c.pvMax <= POCAO_LIMIAR_PV ? c.pvMax - pv.v : 0))
    }
    const talento = config.pocaoPm && store().roster.find(m => m.id === c.id)
      && getEquippedActiveGanguesSpecials(store().roster.find(m => m.id === c.id)).find(x => x.id === config.talentos?.[c.id])
    const custo = talento?.effect?.cost
    if (custo?.kind === 'pm') {
      const pm = { v: c.pm }
      const precisa = custo.values[talento.level - 1]
      encher(c, 'cura_pm', pm, () => (pm.v < precisa ? precisa - pm.v : 0))
    }
  }
  return usadas
}

/** A luta que estava NA TELA quando o app foi pro fundo (GanguesCombat
 *  registra aqui a cada render um leitor do estado vivo — combatentes com o
 *  PV/PM de agora, rodada, automático ligado). O embrulho da luta lê isso na
 *  hora de desmontar a tela, pra terminar a MESMA luta por cálculo. */
export const lutaAoVivo = { ler: null }

// Aplica o resultado de UMA luta (calculada) no store, com as mesmas regras
// da tela de vitória de verdade (useGanguesVictoryResolution): AP, álbum,
// grana/rep/itens do ponto, peça/item de 1ª vitória, aposta da Rinha, sucata,
// ponto resolvido, encontro aleatório finalizado; na derrota, o socorro da
// birosca daquele bairro. `alvo` tem o formato do storyTarget.
// Devolve true se o farm pode continuar.
function aplicarLuta({ store, cena, alvo, party, outcome, combatants, resumo, autoConfig, onDerrota }) {
  const s = store()
  const victory = outcome === 'victory'
  const territorioId = alvo.territorioId
  resumo.lutas++
  s.registrarResultadoStory(outcome)
  s.aplicarDanoPersistente(combatants)
  const inimigos = combatants.filter(c => c.side === 'enemy')
  const aleatorio = alvo.cenaPoiId === '__aleatorio'
  // Repetição da luta que estava na tela (farm dela): só AP/grana/itens de
  // vitória comum — o ponto já foi marcado, prêmio de 1ª vez e rep da escolha
  // já saíram na luta original.
  const repeticao = Boolean(alvo.repeticao)
  if (!victory) {
    const destino = destinoSocorroDerrota(cena, store().cenaProgresso[cena.id])
    if (destino) {
      const custoBase = cena.pois.find(p => p.id === destino.poiId)?.custoGrana || 10
      resumo.socorro = store().socorroDerrota(custoBase)
      store().salvarPosicaoCena(cena.id, destino.posicao)
    }
    if (aleatorio && !repeticao) store().finalizarEncontroAleatorio()
    resumo.derrota = true
    onDerrota?.()
    return false
  }
  resumo.vitorias++
  const pontosMaisForte = Math.max(1, ...party.map(m => ['A', 'H', 'D', 'PV', 'PM'].reduce((t, k) => t + (Number(m.attributes?.[k]) || 0), 0)))
  const apBruto = calcularApTotal({ victory, enemyCount: inimigos.length, cenaChefe: false, torre: false, inimigosAttrs: inimigos.map(c => c.attributes), pontosMaisForte, tamanhoTime: party.length, territorioId })
  const { pesosPorId, nivelPorId } = calcularPesosEParticipantes({ victory, report: { combatants, contribuicoes: {} }, match: { playerTeam: party } })
  s.gainApForParticipants(Math.max(party.length, apBruto), pesosPorId, nivelPorId)
  s.registrarNoAlbum(inimigos.map(c => c.id))
  const { grana, rep, itens, equipPrimeiraVez, itemPrimeiraVez, pagaFavor } = calcularRecompensaCena({ emCena: true, storyAlvo: alvo, enemyCount: inimigos.length })
  const primeiraVitoria = !store().cenaProgresso[cena.id]?.resolvidos?.[alvo.cenaPoiId]
  if (repeticao) { /* ponto já resolvido na luta original */ }
  else if (alvo.cenaSemTravar) s.revelarPoi(cena.id, alvo.cenaRevela || [])
  else if (!aleatorio) s.marcarPoiResolvido(cena.id, alvo.cenaPoiId, alvo.cenaRevela || [])
  if (grana) { s.ganharGrana(grana); resumo.grana += grana }
  if (rep) { s.ganharRep(rep); resumo.rep += rep }
  itens.forEach(({ id, qtd }) => s.darItem(id, qtd))
  if (equipPrimeiraVez && primeiraVitoria && !repeticao) s.comprarEquip(equipPrimeiraVez, 0)
  if (itemPrimeiraVez && primeiraVitoria && !repeticao) s.darItem(itemPrimeiraVez, 1)
  if (pagaFavor && !repeticao) s.pagarFavorRegina()
  if (alvo.aposta > 0) { s.ganharGrana(alvo.aposta * 2); resumo.grana += alvo.aposta * 2 }
  if (Math.random() < GANGUES_FARM_SUCATA_CHANCE) { s.darItem(GANGUES_SUCATA_ID, 1); resumo.sucata++ }
  if (aleatorio && !repeticao) store().finalizarEncontroAleatorio()
  resumo.pocoes += tomarPocoes(store, combatants, autoConfig)
  return true
}

/** O que aconteceu com o app em segundo plano. `store` = useGanguesStore.getState
 *  (lido de novo a cada luta — as ações mudam o estado).
 *  • `lutaEmAndamento` ({ combatants, round }): a luta que estava na tela —
 *    termina por cálculo a partir do estado exato de onde parou (mesmo motor
 *    da Briga em Multidão, com o talento do ajuste do automático).
 *  • `farmar`: depois dela (ou sem ela), segue grindando o adversário da última
 *    luta pelo resto do tempo — só com a briga automática ligada.
 *  Devolve o resumo pra tela "Enquanto você tava fora". */
export function simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota, lutaEmAndamento = null, farmar = true }) {
  const s0 = store()
  const autoConfig = lerAutoConfig()
  const selecionados = s0.activeParty.filter(m => s0.roster.some(r => r.id === m.id))
  const ids = lutaEmAndamento
    ? (s0.match.playerTeam || []).map(m => m.id)
    : (selecionados.length ? selecionados : s0.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => m.id)
  const nivel0 = Object.fromEntries(s0.roster.filter(m => ids.includes(m.id)).map(m => [m.id, nivelDe(m)]))
  const modo = s0.storyProgress?.__dificuldade || 'medio'
  const resumo = { poiId: null, lutas: 0, vitorias: 0, grana: 0, rep: 0, sucata: 0, pocoes: 0, niveis: {}, teto: false, derrota: false, socorro: null }
  let segue = true
  let tempo = segundos

  if (lutaEmAndamento) {
    const alvo = s0.storyTarget || {}
    const party = s0.roster.filter(m => ids.includes(m.id))
    const inicio = iniciarBrigaMultidaoDeCombatentes(lutaEmAndamento.combatants, lutaEmAndamento.round || 1)
    const { outcome, combatants, segundos: duracao } = rodarLuta(inicio, { party, store, config: autoConfig, resumo })
    s0.endMatch(outcome)
    resumo.poiId = alvo.cenaPoiId !== '__aleatorio' ? alvo.cenaPoiId : null
    segue = aplicarLuta({ store, cena, alvo, party, outcome, combatants, resumo, autoConfig, onDerrota })
    tempo -= duracao
  }

  // O que o farm repete pelo resto do tempo:
  // • saiu NO MEIO de uma luta → essa MESMA luta (mesmo tipo de bando, mesmo
  //   nível), de novo e de novo — o jogador estava grindando aquele
  //   adversário (Isaias, 28/09/2026), seja ele o que for (ponto repetível,
  //   papo que virou briga, encontro aleatório);
  // • saiu na rua → o adversário da última luta, se ele vale (alvoDoFarm).
  let gerarBando = null, alvo = null
  if (segue && farmar && tempo >= GANGUES_FARM_MIN_S) {
    const original = lutaEmAndamento ? s0.storyTarget : null
    const poi = original ? null : alvoDoFarm(cena, store().cenaProgresso[cena.id] || { resolvidos: {}, revelados: {} }, store().rep)
    if (original) {
      gerarBando = party => bandoDoAlvo(original, { party, enemiesData, modo })
      alvo = { territorioId, cenaId: cena.id, cenaPoiId: original.cenaPoiId, repeticao: true, cenaRecompensa: original.cenaRecompensa || null }
    } else if (poi) {
      resumo.poiId = poi.id
      gerarBando = party => bandoDoPoi(poi, { party, enemiesData, modo, territorioId })
      alvo = { territorioId, cenaId: cena.id, cenaPoiId: poi.id, cenaRevela: poi.revela || [], cenaRecompensa: poi.recompensa || null }
    }
  }
  // Luta atrás de luta enquanto sobrar tempo fora — cada uma desconta o que
  // ela duraria no manual, modo lento (rodarLuta). A última pode passar um
  // pouco do tempo: é a luta que já tinha começado quando o jogador voltou.
  for (let n = 0; gerarBando && tempo > 0 && n < GANGUES_FARM_MAX_LUTAS; n++) {
    const party = store().roster.filter(m => ids.includes(m.id))
    if (party.some(m => nivelDe(m) - nivel0[m.id] >= GANGUES_FARM_TETO_NIVEIS)) { resumo.teto = true; break }
    if (!party.length || party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)) break
    const bando = gerarBando(party)
    if (!bando?.length) break
    const { outcome, combatants, segundos: duracao } = rodarLuta(iniciarBrigaMultidao({ playerTeam: party, enemyTeam: bando }), { party, store, config: autoConfig, resumo })
    tempo -= duracao
    if (!aplicarLuta({ store, cena, alvo, party, outcome, combatants, resumo, autoConfig, onDerrota })) break
  }

  const fim = store()
  for (const m of fim.roster.filter(r => ids.includes(r.id))) {
    const ganho = nivelDe(m) - nivel0[m.id]
    if (ganho > 0) resumo.niveis[m.id] = { nome: m.sheet_name, de: nivel0[m.id], para: nivelDe(m) }
  }
  if (!resumo.teto) resumo.teto = Object.values(resumo.niveis).some(v => v.para - v.de >= GANGUES_FARM_TETO_NIVEIS)
  if (resumo.lutas) fim.saveParticipantProgress(ids)
  return resumo
}
