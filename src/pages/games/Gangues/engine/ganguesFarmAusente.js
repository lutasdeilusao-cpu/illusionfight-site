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
   • o ponto de saída mora no SAVE (storyProgress.__farmAusente, gravado na
     hora em que o app vai pro fundo): se o celular descartar a aba, a volta
     ainda calcula o tempo fora (Isaias, 28/09/2026: "se o cara ficou upando,
     isso tem que estar no save dele"). O que segura o "esquece e volta
     rico" é o ritmo (6 lutas/hora) e o teto de níveis;
   • no máximo +5 níveis por ausência (GANGUES_FARM_TETO_NIVEIS): bateu, para;
   • farma SÓ o adversário que o jogador estava grindando — o da última
     luta (`posicao.adversario`), com o mesmo gerador de bando e o mesmo
     nível daquele ponto. Nunca "a região": o bairro tem gente de todo
     nível, a conta tem que ser a daquele cara (Isaias, 28/09/2026). Sem
     adversário, ou se ele não vale pra briga automática (vermelho, chefe,
     área do chefe — naAreaDoChefe, cenaHelpers.js), não farma nada;
   • toda luta é SIMULADA de verdade, rodada a rodada, no mesmo motor de
     combate (dá pra perder, o dano fica); no segundo plano é sempre ATAQUE
     NORMAL — sem talento, sem gastar PM. Só a poção de PV (se ligada) entra,
     dentro da luta e entre uma luta e outra;
   • app foi pro fundo NO MEIO de uma luta da cena com o automático ligado:
     a tela da luta é desmontada e essa MESMA luta segue por cálculo do ponto
     exato onde parou (`lutaAoVivo`), e depois o farm repete ela;
   • ritmo FIXO: 1 luta a cada 10 minutos fora (6 por hora), não importa
     onde nem o tamanho da luta (GANGUES_FARM_S_POR_LUTA). Os 10 minutos
     que não fecharam são a luta que estava NO MEIO quando o jogador
     voltou — NÃO CONTA (sem dano, poção nem prêmio). Na
     volta o jogador está no último lugar da rua (o ponto da briga) — ou na
     birosca, se perdeu;
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
import { lerAutoConfig, melhorPocao, POCAO_LIMIAR_PV } from '../hooks/useGanguesModoAuto.js'

/** 1 luta a cada 10 minutos fora — 6 por hora, acabou (Isaias, 28/09/2026:
 *  "38 minutos deu 50 brigas... roubado demais. Tem que ter sacrifício").
 *  Antes cada luta custava 2× o tempo dela no manual 1x, e luta de 1 rodada
 *  (tropa forte contra ponto fraco) saía a ~47s — farm virava apelação. A
 *  espera de 3 minutos antes de tudo isso mora no GanguesFarmAusente.jsx
 *  (e conta dentro dos 10 minutos). */
export const GANGUES_FARM_S_POR_LUTA = 10 * 60
/** Teto de níveis por ausência — "no máximo 5 levels" (Isaias). */
export const GANGUES_FARM_TETO_NIVEIS = 5
/** Rede de segurança de processamento (~16h fora) — o teto de nível
 *  costuma parar bem antes. */
const GANGUES_FARM_MAX_LUTAS = 100
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

// Poção de PV DENTRO da luta calculada, rodada a rodada — a mesma regra do
// automático ao vivo (escolherAcaoAuto): alguém com PV ≤ 50% → o MAIS
// INTEIRO da tropa gasta a vez dele dando a poção de PV (1 por rodada). Quem
// usa item abre mão do ataque naquela rodada (personagensUsandoItem). A bolsa
// NÃO é tocada aqui: as poções ficam anotadas em `usos` e só saem da bolsa se
// a luta contar (terminou dentro do tempo fora — ver simularFarmAusente).
function pocaoDaRodada(estado, { store, config, usos }) {
  const usandoItem = {}
  if (!config.pocao) return { estado, usandoItem }
  const lista = estado.combatants.map(c => ({ ...c }))
  const vivos = lista.filter(c => c.side === 'player' && c.pv > 0 && c.pvMax > 0)
  const inv = store().inventario
  const itens = GANGUES_ITENS_LISTA.map(i => ({ ...i, quantidade: (inv[i.id] || 0) - (usos[i.id] || 0) }))
  const ferido = vivos.filter(c => c.pv / c.pvMax <= POCAO_LIMIAR_PV).sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
  const maisInteiro = [...vivos].sort((a, b) => (b.pv - a.pv) || (b.pv / b.pvMax - a.pv / a.pvMax))[0]
  const pocao = ferido && maisInteiro && melhorPocao(itens, 'cura_pv', ferido.pvMax - ferido.pv)
  if (pocao) {
    usos[pocao.id] = (usos[pocao.id] || 0) + 1
    ferido.pv = Math.min(ferido.pvMax, ferido.pv + pocao.valor)
    usandoItem[maisInteiro.id] = true
  }
  return { estado: { ...estado, combatants: lista }, usandoItem }
}

// Simula a luta de verdade, rodada a rodada, até o fim — o MESMO motor de
// combate da Briga em Multidão (dá pra perder; o dano fica). No segundo
// plano é sempre ATAQUE NORMAL: nenhum talento, nenhum PM gasto (Isaias,
// 28/09/2026); só a poção de PV, se ligada. Devolve também as poções que
// usou (`usos`, ainda não tiradas da bolsa).
function rodarLuta(estadoInicial, { store, config }) {
  let estado = estadoInicial
  const usos = {}
  for (let i = 0; i < GANGUES_FARM_MAX_RODADAS && !estado.terminado; i++) {
    const r = pocaoDaRodada(estado, { store, config, usos })
    estado = avancarRodadaMultidao(r.estado, {}, {}, r.usandoItem)
  }
  return { outcome: estado.outcome || 'defeat', combatants: estado.combatants, usos }
}

// A luta contou: as poções que ela usou saem da bolsa de verdade.
function gastarPocoes(store, usos, resumo) {
  for (const [id, n] of Object.entries(usos)) {
    for (let k = 0; k < n; k++) if (store().usarItem(Number(id))) resumo.pocoes++
  }
}

// Entre uma luta e outra (sem vez a perder): com a poção de PV ligada, quem
// saiu de pé com PV ≤ 50% toma poção até passar dos 50%. (Sem PM: no segundo
// plano é só ataque normal.) Devolve quantas foram usadas.
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
  }
  return usadas
}

/** A luta que estava NA TELA quando o app foi pro fundo (GanguesCombat
 *  registra aqui a cada render um leitor do estado vivo — combatentes com o
 *  PV/PM de agora, rodada, automático ligado). O embrulho da luta lê isso na
 *  hora de desmontar a tela, pra terminar a MESMA luta por cálculo. */
export const lutaAoVivo = { ler: null }

/** A última luta de bairro que começou (o storyTarget dela) — o que o farm
 *  repete quando o app vai pro fundo com a tropa já de volta na rua. Nos 3
 *  minutos de espera o jogo segue vivo: a luta no automático termina, o
 *  avanço automático devolve a tropa pra rua e só então a espera acaba —
 *  a luta "de agora" é essa, seja ela o que for (ponto repetível, papo que
 *  virou briga, encontro aleatório). Mora só na memória da página, igual ao
 *  resto do farm ausente. Chefe, Clube e Torre nunca entram. */
export const ultimaLuta = { alvo: null }
export function lutaRepetivel(alvo) {
  return alvo?.cenaId && alvo.cenaPoiId && !alvo.isChefe && !alvo.clube && !alvo.torre ? alvo : null
}

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
  // Rep conta o que MUDOU de verdade (ela não desce abaixo de 0).
  if (rep) { const r0 = store().rep; s.ganharRep(rep); resumo.rep += store().rep - r0 }
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
 *    segue por cálculo a partir do estado exato de onde parou (mesmo motor da
 *    Briga em Multidão, ataque normal); é a 1ª luta — só conta se o tempo
 *    fora fechou os primeiros 10 minutos.
 *  • `farmar`: depois dela (ou sem ela), segue grindando o adversário da última
 *    luta pelo resto do tempo — só com a briga automática ligada.
 *  Devolve o resumo pra tela "Enquanto você tava fora". */
export function simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota, lutaEmAndamento = null, alvoMarcado = null, idsMarcados = null, farmar = true }) {
  const s0 = store()
  const autoConfig = lerAutoConfig()
  const selecionados = s0.activeParty.filter(m => s0.roster.some(r => r.id === m.id))
  const ids = idsMarcados?.length
    ? idsMarcados.filter(id => s0.roster.some(r => r.id === id))
    : (selecionados.length ? selecionados : s0.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => m.id)
  const nivel0 = Object.fromEntries(s0.roster.filter(m => ids.includes(m.id)).map(m => [m.id, nivelDe(m)]))
  const modo = s0.storyProgress?.__dificuldade || 'medio'
  const resumo = { poiId: null, meioNaoConta: false, lutas: 0, vitorias: 0, grana: 0, rep: 0, sucata: 0, pocoes: 0, niveis: {}, teto: false, derrota: false, socorro: null }
  let segue = true
  let tempo = segundos

  if (lutaEmAndamento) {
    const alvo = alvoMarcado || {}
    const party = s0.roster.filter(m => ids.includes(m.id))
    const inicio = iniciarBrigaMultidaoDeCombatentes(lutaEmAndamento.combatants, lutaEmAndamento.round || 1)
    const { outcome, combatants, usos } = rodarLuta(inicio, { store, config: autoConfig })
    resumo.poiId = alvo.cenaPoiId || null
    if (GANGUES_FARM_S_POR_LUTA > tempo) {
      // Nem 10 minutos fora: essa não conta (sem dano, sem poção, sem
      // prêmio) — o jogador volta pra rua, no ponto da briga.
      resumo.meioNaoConta = true
      segue = false
    } else {
      gastarPocoes(store, usos, resumo)
      segue = aplicarLuta({ store, cena, alvo, party, outcome, combatants, resumo, autoConfig, onDerrota })
      tempo -= GANGUES_FARM_S_POR_LUTA
    }
  }

  // O que o farm repete pelo resto do tempo — a ÚLTIMA LUTA, de novo e de
  // novo (mesmo tipo de bando, mesmo nível): o jogador estava grindando
  // aquele adversário (Isaias, 28/09/2026), seja ele o que for (ponto
  // repetível, papo que virou briga, encontro aleatório):
  // • saiu NO MEIO de uma luta → essa luta;
  // • a tropa já tinha voltado pra rua → a última luta de bairro (a marca de
  //   saída guarda ela — ultimaLuta), se é deste bairro e fora da área do
  //   chefe; sem ela, o adversário da última luta salvo (alvoDoFarm).
  let gerarBando = null, alvo = null
  if (segue && farmar && tempo > 0) {
    const prog = store().cenaProgresso[cena.id] || { resolvidos: {}, revelados: {} }
    const daRua = !lutaEmAndamento && lutaRepetivel(alvoMarcado)?.cenaId === cena.id
      && !naAreaDoChefe(cena, prog, prog.posicao || {})
      && !naAreaDoChefe(cena, prog, posNoMapa(cena, alvoMarcado.cenaPoiId) || {})
      ? alvoMarcado : null
    const original = lutaEmAndamento ? alvoMarcado : daRua
    const poi = original ? null : alvoDoFarm(cena, prog, store().rep)
    if (original) {
      resumo.poiId = original.cenaPoiId
      gerarBando = party => bandoDoAlvo(original, { party, enemiesData, modo })
      alvo = { territorioId, cenaId: cena.id, cenaPoiId: original.cenaPoiId, repeticao: true, cenaRecompensa: original.cenaRecompensa || null }
    } else if (poi) {
      resumo.poiId = poi.id
      gerarBando = party => bandoDoPoi(poi, { party, enemiesData, modo, territorioId })
      alvo = { territorioId, cenaId: cena.id, cenaPoiId: poi.id, cenaRevela: poi.revela || [], cenaRecompensa: poi.recompensa || null }
    }
  }
  // Uma luta a cada 10 minutos fora. Os minutos que sobraram (menos de 10) são
  // a luta que estava NO MEIO quando o jogador voltou: não conta.
  for (let n = 0; gerarBando && tempo > 0 && n < GANGUES_FARM_MAX_LUTAS; n++) {
    const party = store().roster.filter(m => ids.includes(m.id))
    if (party.some(m => nivelDe(m) - nivel0[m.id] >= GANGUES_FARM_TETO_NIVEIS)) { resumo.teto = true; break }
    if (!party.length || party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)) break
    const bando = gerarBando(party)
    if (!bando?.length) break
    if (GANGUES_FARM_S_POR_LUTA > tempo) { resumo.meioNaoConta = true; break }
    const { outcome, combatants, usos } = rodarLuta(iniciarBrigaMultidao({ playerTeam: party, enemyTeam: bando }), { store, config: autoConfig })
    tempo -= GANGUES_FARM_S_POR_LUTA
    gastarPocoes(store, usos, resumo)
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
