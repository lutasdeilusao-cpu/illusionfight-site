// Hook que substitui o useEffect gigante de GanguesVictory.jsx (ver
// PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2). Roda uma vez
// ao montar, usa os cálculos puros de engine/ganguesVictoryResolver.js e
// aplica o resultado no store — devolve só o que a tela precisa renderizar.
import { useEffect, useRef, useState } from 'react'
import { registrarPontuacaoArenaRanking } from '../../../../hooks/useLeaderboardDB'
import { sfx } from '../../../../lib/sfx'
import { calcularApTotal, calcularPesosEParticipantes, calcularRecompensaCena } from '../engine/ganguesVictoryResolver.js'
import { nivelTetoDaHistoria } from '../data/ganguesTerritorios.js'
import { GANGUES_LEVEL_CAP } from '../data/ganguesCharacters.js'
import { CENAS_POR_ID, destinoSocorroDerrota, custoRecuperacaoRinha } from '../data/cenas/cenaHelpers.js'
import { GANGUES_ITENS_LISTA } from '../data/ganguesItens.js'
import { ALEATORIO_TIPOS } from '../engine/ganguesEncontroAleatorio.js'
import { desligarAutomaticos } from './useGanguesBrigaAutomatica.js'
import { bonusGranaDasCartas } from '../engine/ganguesCartaEfeitos.js'

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

    // Clube da Luta: sem AP/grana — o módulo do Clube decide tudo (ver
    // clube/ganguesClubeSlice.js#fecharRondaClube).
    if (clube) {
      const proxima = store.fecharRondaClube({ victory, alvo: storyAlvo, combatants: report.combatants })
      if (proxima) { onNavigate(proxima); return }
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
    // Teto de nível da área (nivelTetoDaHistoria): quem já está nele não sobe
    // mais até o chefe da área cair — a tela avisa em vez de mostrar AP.
    const tetoNivel = nivelTetoDaHistoria(store.storyProgress, GANGUES_LEVEL_CAP)
    const apLista = escaladosIds.map(id => {
      const noTeto = Number(nivelPorId[id] ?? match.playerTeam.find(member => member.id === id)?.level) >= tetoNivel
      return {
        id,
        nome: match.playerTeam.find(member => member.id === id)?.sheet_name || '?',
        ap: noTeto ? 0 : (apPorMembro[id] || 0),
        ko: koIds.has(id),
        noTeto,
        teto: tetoNivel,
      }
    })

    if (victory) {
      // Álbum de Marélia — todo inimigo do bando batido vira entrada.
      store.registrarNoAlbum([match.enemy_id, ...report.combatants.filter(c => c.side === 'enemy').map(c => c.id)])
      // Drop: cada corpo batido sorteia a tabela dele (com garantia). A Rinha
      // não dá drop nem conta pra garantia.
      const drops = storyAlvo?.rinha ? [] : store.aplicarDrops(inimigosCombatentes.map(c => c.id))
      let granaGanha = 0, repGanha = 0, repMarcos = []
      if (emCena || noModoHistoria) {
        const { grana, rep, itens, pagaFavor } = calcularRecompensaCena({ emCena, storyAlvo, enemyCount, ehChefe: Boolean(storyAlvo.isChefe) })
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
        // Cartas de grana do time: +% em cima do que a luta pagou.
        const granaFinal = grana ? Math.round(grana * (1 + bonusGranaDasCartas(report.combatants.filter(c => c.side === 'player')) / 100)) : 0
        if (granaFinal) { store.ganharGrana(granaFinal); granaGanha += granaFinal }
        // Aposta em você (já descontada ao entrar): venceu, paga multiplicado.
        if (rep) { repMarcos = store.ganharRep(rep); repGanha += rep }
        itens.forEach(({ id, qtd }) => store.darItem(id, qtd))
        // Favor da Dona Regina pago (Feira) — libera o fiado da pensão de novo.
        if (pagaFavor) store.pagarFavorRegina()
        // Barra de Alerta (Vila): bater o Portaria desce 1; a última
        // aparição dele zera e trava a barra.
        const cenaAlerta = emCena ? CENAS_POR_ID[storyAlvo.cenaId] : null
        if (cenaAlerta?.alerta) {
          if (storyAlvo.cenaPoiId === cenaAlerta.alerta.zeraCom) store.mexerAlerta(cenaAlerta.id, cenaAlerta.alerta.max, 'zera')
          else if (cenaAlerta.alerta.pois.includes(storyAlvo.cenaPoiId)) store.mexerAlerta(cenaAlerta.id, cenaAlerta.alerta.max, -1)
        }
        // Revanche (o chefe já tinha caído): dá drop e XP, mas não domina o
        // bairro de novo.
        if (emCena && cenaChefe && !storyAlvo.revanche) {
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
      setRewardSummary({ apLista, grana: granaGanha, rep: repGanha, drops, repMarco: repMarcos[repMarcos.length - 1] || null })
      sfx.win()
    } else {
      sfx.lose()
      // Rinha com grana (Isaias, 30/09/2026: "se você perdeu e tá com grana,
      // faz a recuperação e volta pra rinha... até ficar sem grana"): a casa
      // cobra a recuperação do bairro (3× o descanso — 30 na Pista), remenda
      // a tropa e a roda segue; nada desliga. Sem grana pra isso a Rinha
      // acaba e cai no caminho de qualquer derrota (birosca), logo abaixo.
      const cenaRinha = emCena && storyAlvo?.rinha ? CENAS_POR_ID[storyAlvo.cenaId] : null
      const custoRinha = cenaRinha ? custoRecuperacaoRinha(cenaRinha, store.cenaProgresso[cenaRinha.id]) : 0
      if (cenaRinha && store.grana >= custoRinha && store.gastarGrana(custoRinha)) {
        store.restaurarPvPmTodos()
        store.setStoryTarget({ ...storyAlvo, rinhaRemendada: true })
        setSocorro({ tipo: 'rinha', custo: custoRinha, grana: store.grana - custoRinha })
        const timerRinha = setTimeout(() => store.saveParticipantProgress(escaladosIds), 400)
        return () => clearTimeout(timerRinha)
      }
      // Perdeu na cena = desliga TODO automático (Isaias, 28/09/2026: "faz ele
      // começar de novo", pra ter interação) — a próxima luta/cena já nasce manual.
      // Vale pra Rinha também (Isaias, 30/09/2026, 2º relato: "os personagens
      // morreram na rinha, apareceu próxima luta e continuou"): tropa no chão
      // encerra a sessão da Rinha — birosca e cobrança igual a qualquer derrota.
      if (emCena) desligarAutomaticos()
      // Barra de Alerta (Vila): perder aqui avisa o bonde (+1).
      const cenaDoAlerta = emCena ? CENAS_POR_ID[storyAlvo.cenaId] : null
      if (cenaDoAlerta?.alerta) store.mexerAlerta(cenaDoAlerta.id, cenaDoAlerta.alerta.max, 1)
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
