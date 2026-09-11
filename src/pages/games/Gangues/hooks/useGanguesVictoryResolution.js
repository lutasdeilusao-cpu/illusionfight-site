// Hook que substitui o useEffect gigante de GanguesVictory.jsx (ver
// PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2). Roda uma vez
// ao montar, usa os cálculos puros de engine/ganguesVictoryResolver.js e
// aplica o resultado no store — devolve só o que a tela precisa renderizar.
import { useEffect, useRef, useState } from 'react'
import { registrarPontuacaoArenaRanking } from '../../../../hooks/useLeaderboardDB'
import { sfx } from '../../../../lib/sfx'
import { calcularApTotal, calcularPesosEParticipantes, calcularRecompensaCena } from '../engine/ganguesVictoryResolver.js'

export default function useGanguesVictoryResolution({ store, user, report, victory, storyAlvo, match, torre, torreAndar, clube, emCena, noModoHistoria, cenaChefe, confrontoFinal, onNavigate }) {
  const processed = useRef(false)
  const [levelUps, setLevelUps] = useState([])
  // Recompensa de verdade ganha NESTA luta (XP total, grana, rep) — sem isso
  // o jogador nunca via o que realmente ganhou, só via os números mudarem
  // sozinhos em outra tela.
  const [rewardSummary, setRewardSummary] = useState(null)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

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
      victory ? sfx.win() : sfx.lose()
      return
    }

    // O campo `xp` que existia em alguns `recompensa` de treta em pista.js
    // (cenaRecompensa.xp) era resquício de uma versão anterior — removido por
    // completo; recompensa de treta agora só participa via grana/rep.
    const enemyCount = Math.max(1, report.combatants.filter(entry => entry.side === 'enemy').length)
    const ap = calcularApTotal({ victory, enemyCount, cenaChefe, torre, torreAndar })
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
      let granaGanha = 0, repGanha = 0
      if (emCena || noModoHistoria) {
        const { grana, rep, itens } = calcularRecompensaCena({ emCena, storyAlvo })
        if (emCena && !storyAlvo.evento) {
          // Modo história — cena: marca o POI resolvido. O repDelta (rep de
          // uma escolha tipo "aperta") já está somado dentro de `rep` por
          // calcularRecompensaCena — não somar de novo aqui.
          store.marcarPoiResolvido(storyAlvo.cenaId, storyAlvo.cenaPoiId, storyAlvo.cenaRevela || [])
        }
        if (grana) { store.ganharGrana(grana); granaGanha += grana }
        if (rep) { store.ganharRep(rep); repGanha += rep }
        itens.forEach(({ id, qtd }) => store.darItem(id, qtd))
        if (emCena && !storyAlvo.evento && cenaChefe) {
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
      setRewardSummary({ apLista, grana: granaGanha, rep: repGanha })
      sfx.win()
    } else sfx.lose()

    const timer = setTimeout(() => store.saveParticipantProgress(escaladosIds), 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { levelUps, rewardSummary, clearLevelUps: () => setLevelUps([]) }
}
