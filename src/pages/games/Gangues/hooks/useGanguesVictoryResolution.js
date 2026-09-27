// Hook que substitui o useEffect gigante de GanguesVictory.jsx (ver
// PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2). Roda uma vez
// ao montar, usa os cálculos puros de engine/ganguesVictoryResolver.js e
// aplica o resultado no store — devolve só o que a tela precisa renderizar.
import { useEffect, useRef, useState } from 'react'
import { registrarPontuacaoArenaRanking } from '../../../../hooks/useLeaderboardDB'
import { sfx } from '../../../../lib/sfx'
import { calcularApTotal, calcularPesosEParticipantes, calcularRecompensaCena } from '../engine/ganguesVictoryResolver.js'
import { CENAS_POR_ID, destinoSocorroDerrota } from '../data/cenas/cenaHelpers.js'
import { GANGUES_SUCATA_ID } from '../data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA } from '../data/ganguesItens.js'
import { ALEATORIO_TIPOS } from '../engine/ganguesEncontroAleatorio.js'

// Sucata virou recurso do aprimoramento (27/09/2026, PLANO_ITENS_RANGE.md §3):
// cai em ~20% das vitórias de rua na cena (não no chefe, que já paga 500).
const GANGUES_SUCATA_DROP_CHANCE = 0.2

export default function useGanguesVictoryResolution({ store, user, report, victory, storyAlvo, match, torre, torreAndar, clube, emCena, noModoHistoria, cenaChefe, confrontoFinal, onNavigate }) {
  const processed = useRef(false)
  const [levelUps, setLevelUps] = useState([])
  // Recompensa de verdade ganha NESTA luta (XP total, grana, rep) — sem isso
  // o jogador nunca via o que realmente ganhou, só via os números mudarem
  // sozinhos em outra tela.
  const [rewardSummary, setRewardSummary] = useState(null)
  // Derrota na cena: o que custou ser arrastado pra birosca (ver socorroDerrota).
  const [socorro, setSocorro] = useState(null)

  useEffect(() => {
    if (processed.current) return
    processed.current = true
    // Proteção REDUNDANTE (pedido do Isaias, 19/09/2026 — exploit real
    // que ele achou: apertar Voltar reentrava nesta tela e reaplicava
    // XP/AP/grana/item de novo, dava pra upar de graça só clicando
    // voltar). `processed` (useRef) só protege a MESMA instância
    // montada — some numa remontagem (ex: a fase 'victory' sendo
    // revisitada por engano via navegação). Isso aqui protege contra
    // remontagem: o battleReport em si fica marcado `__resolvido` no
    // STORE (sobrevive à remontagem), então mesmo que outro bug de
    // navegação reabra essa tela no futuro, a recompensa NUNCA aplica
    // 2x pro mesmo relatório de batalha. A causa raiz (fases
    // transitórias entrando na pilha do Voltar) foi corrigida em
    // GanguesRoute.jsx — isso aqui é só o cinto e a suspensório.
    if (report.__resolvido) return
    store.setBattleReport({ ...report, __resolvido: true })

    // Clube da Luta: NÃO dá AP nem grana. Gauntlet de 3 rondas.
    //  • venceu ronda 1 ou 2 → vai pra sala do Nato (não acerta contas ainda).
    //  • venceu a 3 → quita tudo (e +200 se entrou limpo, sem ajeites).
    //  • perdeu qualquer ronda → te remendam, dívida acumulada fica.
    if (clube) {
      const ronda = Number(storyAlvo?.clubeRonda) || 3
      if (victory && ronda < 3) {
        store.aplicarDanoPersistente(report.combatants)
        onNavigate('clube-sala')
        return
      }
      store.resolverClubeDaLuta(victory, storyAlvo.clubeBase || 10, storyAlvo.clubeDividaPrevia || 0, storyAlvo.clubeHeals || 0)
      // Chip Ígneo: só na vitória da RONDA FINAL (ronda 3) — as vitórias das
      // rondas 1/2 caem no branch acima (vão pra sala do Nato) e não chegam aqui.
      if (victory) store.darItem(22, 1)
      victory ? sfx.win() : sfx.lose()
      return
    }

    // O campo `xp` que existia em alguns `recompensa` de treta em pista.js
    // (cenaRecompensa.xp) era resquício de uma versão anterior — removido por
    // completo; recompensa de treta agora só participa via grana/rep.
    const inimigosCombatentes = report.combatants.filter(entry => entry.side === 'enemy')
    const enemyCount = Math.max(1, inimigosCombatentes.length)
    // "Recompensa por risco" (pedido do Isaias, 19/09/2026) — cada inimigo
    // rende AP relativo à distância entre a ficha DELE e a ficha do
    // personagem MAIS FORTE da gangue (ver apPorInimigo em
    // ganguesVictoryResolver.js pra régua completa).
    const inimigosAttrs = inimigosCombatentes.map(c => c.attributes)
    const pontosMaisForte = Math.max(1, ...match.playerTeam.map(m => ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(m.attributes?.[k]) || 0), 0)))
    const apBruto = calcularApTotal({ victory, enemyCount, cenaChefe, torre, torreAndar, inimigosAttrs, pontosMaisForte, tamanhoTime: match.playerTeam.length, territorioId: storyAlvo?.territorioId })
    // Piso: "vai chegar no limiar mínimo que vai dar um ponto por
    // personagem da gangue e acabou" — mesmo depois de descontar tudo (farm
    // de inimigo muito mais fraco), a luta nunca rende menos que 1 AP por
    // integrante da gangue escalada.
    const ap = victory ? Math.max(match.playerTeam.length, apBruto) : apBruto
    const { koIds, escaladosIds, participantIds, pesosPorId, nivelPorId } = calcularPesosEParticipantes({ victory, report, match })

    // Dano persiste entre lutas repetíveis dentro da mesma cena — TEM que
    // rodar ANTES de gainApForParticipants: quem sobe de nível é curado
    // (pv_atual/pm_atual viram null lá dentro) — se isso rodasse primeiro,
    // aplicarDanoPersistente reescrevia por cima com o PV/PM que sobrou da
    // luta, apagando a cura do level-up.
    store.aplicarDanoPersistente(report.combatants)
    const { levelUps: newLevelUps, apPorMembro } = store.gainApForParticipants(ap, pesosPorId, nivelPorId)
    setLevelUps(newLevelUps)

    // Mostra TODOS os escalados na tela de vitória (inclusive quem caiu, com
    // 0 e a marca de KO) — o rateio já ignorou os mortos acima.
    const apLista = escaladosIds.map(id => ({
      id,
      nome: match.playerTeam.find(member => member.id === id)?.sheet_name || '?',
      ap: apPorMembro[id] || 0,
      ko: koIds.has(id),
    }))

    if (victory) {
      // Álbum de Marélia — todo inimigo do bando batido vira entrada.
      store.registrarNoAlbum([match.enemy_id, ...report.combatants.filter(c => c.side === 'enemy').map(c => c.id)])
      let granaGanha = 0, repGanha = 0, repMarcos = [], sucataGanha = 0, equipGanho = null, itemGanho = null, apostaGanha = 0
      if (emCena || noModoHistoria) {
        const { grana, rep, itens, equipPrimeiraVez, itemPrimeiraVez, pagaFavor } = calcularRecompensaCena({ emCena, storyAlvo, enemyCount, ehChefe: Boolean(storyAlvo.isChefe) })
        // Checa "1ª vitória" ANTES de marcar o ponto como resolvido logo abaixo.
        const progAntes = emCena ? (store.cenaProgresso[storyAlvo.cenaId] || {}) : {}
        const primeiraVitoria = cenaChefe ? !progAntes.boss : !progAntes.resolvidos?.[storyAlvo.cenaPoiId]
        if (emCena) {
          // Modo história — cena: marca o POI resolvido. O repDelta (rep de
          // uma escolha tipo "aperta") já está somado dentro de `rep` por
          // calcularRecompensaCena — não somar de novo aqui.
          // cenaSemTravar (ex: falhar a gazua do ferro-velho) só revela o
          // mapa sem travar o ponto como resolvido — o jogador pode voltar e
          // tentar de novo (evita perder pra sempre um item obrigatório de
          // progresso por causa de UM minigame falhado, ver AGENTS.md 13/09/2026).
          if (storyAlvo.cenaSemTravar) store.revelarPoi(storyAlvo.cenaId, storyAlvo.cenaRevela || [])
          // `__aleatorio` (perseguidor) não é ponto do mapa — não marca nada.
          else if (storyAlvo.cenaPoiId !== '__aleatorio') store.marcarPoiResolvido(storyAlvo.cenaId, storyAlvo.cenaPoiId, storyAlvo.cenaRevela || [])
        }
        if (grana) { store.ganharGrana(grana); granaGanha += grana }
        if (rep) { repMarcos = store.ganharRep(rep); repGanha += rep }
        itens.forEach(({ id, qtd }) => store.darItem(id, qtd))
        if (equipPrimeiraVez && primeiraVitoria) { store.comprarEquip(equipPrimeiraVez, 0); equipGanho = equipPrimeiraVez }
        if (itemPrimeiraVez && primeiraVitoria) { store.darItem(itemPrimeiraVez, 1); itemGanho = itemPrimeiraVez }
        // Favor da Dona Regina pago (Feira) — libera o fiado da pensão de novo.
        if (pagaFavor) store.pagarFavorRegina()
        // Rinha de Apostas: a aposta saiu do bolso na entrada; venceu, volta em dobro.
        if (storyAlvo.aposta > 0) { apostaGanha = storyAlvo.aposta * 2; store.ganharGrana(apostaGanha) }
        if (emCena && !cenaChefe && Math.random() < GANGUES_SUCATA_DROP_CHANCE) { store.darItem(GANGUES_SUCATA_ID, 1); sucataGanha = 1 }
        if (emCena && cenaChefe) {
          store.marcarBossCena(storyAlvo.cenaId)
          store.dominarTerritorioViaCena(storyAlvo.territorioId, storyAlvo.pontoIds || [])
          store.restaurarPvPmTodos()
        }
        if (!emCena && noModoHistoria) {
          // Modo história — trilha: marca o nó dominado.
          store.marcarNoDominado(storyAlvo.territorioId, storyAlvo.noId, storyAlvo.isChefe)
        }
      }
      if (user?.id) registrarPontuacaoArenaRanking(user.id)
      if (confrontoFinal) store.completeCampaign()
      // repMarco: só o ÚLTIMO marco cruzado (pra mostrar 1 modal) — todos os
      // itens já foram concedidos de verdade no inventário dentro de ganharRep.
      setRewardSummary({ apLista, grana: granaGanha, rep: repGanha, sucata: sucataGanha, equip: equipGanho, item: itemGanho, aposta: apostaGanha, repMarco: repMarcos[repMarcos.length - 1] || null })
      sfx.win()
    } else {
      sfx.lose()
      // Sem game over (Isaias, 27/09/2026): tropa caída numa luta da cena é
      // arrastada pra birosca mais perto, já DENTRO, recuperada — e a
      // recuperação é cobrada na hora (grana, empréstimo ou dívida a 10×).
      const cena = emCena ? CENAS_POR_ID[storyAlvo.cenaId] : null
      const destino = cena ? destinoSocorroDerrota(cena, store.cenaProgresso[cena.id]) : null
      // O que o encontro aleatório leva quando GANHA de você (Feira): o Rapa
      // leva 1 consumível, a Cobrança do Turco leva 10% da grana na mão
      // (nunca mexe na dívida — só o Clube quita). Antes do socorro, que cobra
      // a recuperação em cima do que sobrou.
      const regraDerrota = storyAlvo?.cenaPoiId === '__aleatorio' ? ALEATORIO_TIPOS[storyAlvo.aleatorioTipo]?.derrota : null
      let perda = null
      if (regraDerrota?.levaConsumivel) {
        const consumiveis = GANGUES_ITENS_LISTA.filter(it => (it.tipo === 'cura_pv' || it.tipo === 'cura_pm' || it.tipo === 'buff' || it.tipo === 'debuff_inimigos') && (store.inventario[it.id] || 0) > 0)
        const levado = consumiveis[Math.floor(Math.random() * consumiveis.length)]
        if (levado && store.usarItem(levado.id)) perda = { itemId: levado.id }
      }
      if (regraDerrota?.levaGranaFrac) {
        const valor = Math.floor(store.grana * regraDerrota.levaGranaFrac)
        if (valor > 0 && store.gastarGrana(valor)) perda = { grana: valor }
      }
      if (destino) {
        const custoBase = cena.pois.find(p => p.id === destino.poiId)?.custoGrana || 10
        setSocorro({ ...store.socorroDerrota(custoBase), perda })
        store.salvarPosicaoCena(cena.id, destino.posicao)
      }
    }

    // Encontro aleatório (perseguidor da cena, 26/09/2026): vitória OU derrota,
    // ele some do mapa e o próximo fica agendado (finalizarEncontroAleatorio).
    if (emCena && storyAlvo.cenaPoiId === '__aleatorio') store.finalizarEncontroAleatorio()

    const timer = setTimeout(() => store.saveParticipantProgress(escaladosIds), 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { levelUps, rewardSummary, socorro, clearLevelUps: () => setLevelUps([]) }
}
