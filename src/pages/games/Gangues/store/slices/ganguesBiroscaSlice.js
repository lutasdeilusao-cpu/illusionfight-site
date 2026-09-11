// Slice: descanso da birosca + agiotagem do Nato + Clube da Luta. Extraído de
// store/useGanguesStore.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { normalizeGanguesLoadout, getGanguesResources } from '../../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources } from '../../data/ganguesEquip.js'

export default function createGanguesBiroscaSlice(set, get) {
  return {
    // Descanso na birosca — cobra a grana, restaura o PV/PM de TODA a tropa pro
    // máximo e devolve o quanto cada um recuperou (pra a tela mostrar o detalhe).
    // Se ninguém estava ferido, não cobra nada e devolve motivo: 'inteira'.
    descansarTropa: (custo = 0) => {
      const detalhe = get().roster.map(m => {
        const norm = normalizeGanguesLoadout(m)
        const attrs = getGanguesAttributesWithEquip(norm.attributes)
        const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.PV, attrs?.PM), norm.attributes?.equipment)
        const pvAtual = Math.min(res.pvMax, Number(norm.attributes?.pv_atual ?? res.pvMax))
        const pmAtual = Math.min(res.pmMax, Number(norm.attributes?.pm_atual ?? res.pmMax))
        return {
          id: m.id,
          nome: m.sheet_name || '?',
          pv: Math.max(0, Math.round(res.pvMax - pvAtual)),
          pm: Math.max(0, Math.round(res.pmMax - pmAtual)),
        }
      })
      const ferido = detalhe.some(d => d.pv > 0 || d.pm > 0)
      if (!ferido) return { ok: false, motivo: 'inteira', detalhe: [] }
      if (get().grana < custo) return { ok: false, motivo: 'grana', detalhe: [] }
      get().gastarGrana(custo)
      get().restaurarPvPmTodos()
      return { ok: true, detalhe: detalhe.filter(d => d.pv > 0 || d.pm > 0) }
    },

    // ── Agiotagem da birosca (o Nato fia o descanso) ──────────────
    // A dívida é GLOBAL (uma caderneta só pra todas as biroscas de todos os
    // bairros) e SILENCIOSA — não tem HUD, o jogador só vê quando abre o
    // descanso. Guardada dentro do próprio storyProgress (chave reservada
    // __birosca), igual __album/__flags — sem coluna nova no Supabase.
    //   { divida: <grana devida>, fiados: <0|1|2|3> }
    // fiados 1 = 5× o preço do descanso, 2 = 10×. Depois de 2, "nome sujo":
    // não fia mais (o 3º fiado, 15×, é o Clube da Luta — outra entrega).
    _birosca: () => get().storyProgress.__birosca || { divida: 0, fiados: 0 },

    // Déficit de PV/PM de toda a tropa (usado pelo descanso e pelo fiado pra
    // saber se tem alguém ferido e mostrar o quanto cada um recuperou).
    _deficitTropa: () => get().roster.map(m => {
      const norm = normalizeGanguesLoadout(m)
      const attrs = getGanguesAttributesWithEquip(norm.attributes)
      const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.PV, attrs?.PM), norm.attributes?.equipment)
      const pvAtual = Math.min(res.pvMax, Number(norm.attributes?.pv_atual ?? res.pvMax))
      const pmAtual = Math.min(res.pmMax, Number(norm.attributes?.pm_atual ?? res.pmMax))
      return { id: m.id, nome: m.sheet_name || '?', pv: Math.max(0, Math.round(res.pvMax - pvAtual)), pm: Math.max(0, Math.round(res.pmMax - pmAtual)) }
    }),

    // A tropa inteira que iria pra luta está com PV zerado (todos caídos) — aí
    // não dá pra entrar em combate, tem que se recuperar antes (é o gatilho do
    // desespero que leva ao Clube da Luta). pv_atual null/ausente = cheio.
    tropaNoChao: () => {
      const party = (get().activeParty.length ? get().activeParty : get().roster).slice(0, 6)
      if (!party.length) return false
      return party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)
    },

    // Fiar o descanso com o Nato. `custoBase` = o preço normal do descanso
    // daquela birosca. NÃO mostra o valor antes — quem chama revela o contrato
    // (o quanto ficou a dívida) só DEPOIS, com o retorno desta função.
    fiarDescanso: (custoBase = 10) => {
      const rec = get()._birosca()
      if (rec.fiados >= 2) return { ok: false, motivo: 'sujo' }
      const detalhe = get()._deficitTropa()
      if (!detalhe.some(d => d.pv > 0 || d.pm > 0)) return { ok: false, motivo: 'inteira' }
      const mult = rec.fiados === 0 ? 5 : 10
      const valor = mult * Math.max(1, Math.round(custoBase))
      const divida = rec.divida + valor
      const fiados = rec.fiados + 1
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida, fiados } } }))
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { ok: true, mult, valor, divida, fiadoN: fiados, detalhe: detalhe.filter(d => d.pv > 0 || d.pm > 0) }
    },

    // Pagar a dívida (parcial ou total). Abate de `grana` o que der. Quando
    // zera, o "nome limpa" e o fiado volta a ser oferecido.
    pagarBirosca: (quanto) => {
      const rec = get()._birosca()
      if (rec.divida <= 0) return { ok: false, motivo: 'quitado' }
      const pago = Math.min(Number.isFinite(quanto) ? quanto : rec.divida, get().grana, rec.divida)
      if (pago <= 0) return { ok: false, motivo: 'grana' }
      get().gastarGrana(pago)
      const restante = Math.max(0, rec.divida - pago)
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida: restante, fiados: restante <= 0 ? 0 : rec.fiados } } }))
      get()._persistStory()
      return { ok: true, pago, restante }
    },

    // (legado — o Clube agora é oferecido SEMPRE na birosca, não só num beco sem
    // saída. Mantido caso algum código antigo referencie.)
    clubeDaLutaElegivel: () => {
      const rec = get()._birosca()
      return rec.fiados >= 2 && rec.divida > 0 && get().tropaNoChao() && get().grana < rec.divida
    },

    // Aceitou o Clube da Luta. Ao entrar, o Nato já te fia 15× o descanso
    // (te "curam adiantado" — a tropa toda volta pro máximo) e a dívida sobe
    // na hora. A luta roda com storyTarget { clube: true, clubeRonda: 1 } —
    // é um gauntlet de 3 rondas (1 fraco → 2 → 3 casca-grossa).
    entrarClubeDaLuta: (custoBase = 10) => {
      const rec = get()._birosca()
      const valor = 15 * Math.max(1, Math.round(custoBase))
      const divida = rec.divida + valor
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida, fiados: Math.max(3, rec.fiados) } } }))
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { valor, divida }
    },

    // Entre uma ronda e outra do gauntlet, o Nato oferece te ajeitar — cura a
    // tropa toda na hora, e DOBRA a dívida na tua cara, na maior cara de pau.
    // É opcional (dá pra encarar a próxima ronda machucado).
    curarNoClubeSala: () => {
      const rec = get()._birosca()
      const antes = Math.max(1, Math.round(rec.divida))
      const divida = antes * 2
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida, fiados: Math.max(3, rec.fiados) } } }))
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { antes, divida }
    },

    // Vazou no meio do gauntlet: te arrastam pra fora e te largam (a tropa é
    // remendada), mas a dívida acumulada FICA — não quita nada.
    desistirDoClube: () => {
      get().restaurarPvPmTodos()
      get()._persistStory()
      return get()._birosca().divida
    },

    // Fim do gauntlet do Clube (só chamado na 3ª ronda ou numa derrota).
    //  `dividaPrevia` = a dívida ANTES de aceitar (antes do 15× de entrada).
    //  `heals` = quantas vezes deixou o Nato ajeitar entre as rondas.
    //  • Venceu (ronda 3): quita TUDO, nome limpa. Se entrou LIMPO e não pediu
    //    nenhum ajeite (dividaPrevia 0 e heals 0), ainda leva 200 na mão. Sem XP.
    //  • Perdeu: te remendam e te largam. A dívida NÃO cresce mais — fica o que
    //    acumulou (15× da entrada + 10× de cada ajeite). Nunca é game over.
    resolverClubeDaLuta: (venceu, custoBase = 10, dividaPrevia = 0, heals = 0) => {
      if (venceu) {
        set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida: 0, fiados: 0 } } }))
        if (Math.round(dividaPrevia) <= 0 && Number(heals) <= 0) get().ganharGrana(200)
      }
      get().restaurarPvPmTodos()
      get()._persistStory()
    },
  }
}
