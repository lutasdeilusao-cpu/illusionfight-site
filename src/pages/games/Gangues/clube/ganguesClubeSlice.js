// Slice: CLUBE DA LUTA (módulo independente, pasta clube/ — regras em
// ./ganguesClubeRegras.js). Antes vivia espalhado pelo slice do descanso/
// agiota, pela cena e pelo hook de vitória; agora o Clube é dono do próprio
// fluxo: entrar → rondas (sala entre elas) → acerto de contas.
// A dívida é a caderneta global da agiotagem (storyProgress.__birosca,
// lida por `_birosca()` do ganguesBiroscaSlice) — o Clube só a aumenta
// (entrada/ajeite) ou quita (vitória na ronda final).
import {
  GANGUES_REP_GATE_CLUBE, GANGUES_CLUBE_RONDAS_TOTAL, GANGUES_CLUBE_ENTRADA_MULT,
  GANGUES_CLUBE_PREMIO_LIMPO, GANGUES_CLUBE_ITEM_PREMIO,
} from './ganguesClubeRegras.js'

export default function createGanguesClubeSlice(set, get) {
  const gravarDivida = (divida) => {
    set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida } } }))
  }

  return {
    // Entrada no Clube (oferecida pelo agiota). `gratis` = o socorro do teto
    // da agiotagem: cura de graça e joga direto pra dentro, sem cobrar a
    // entrada e sem passar pelo gate de reputação (não tem escolha).
    // Devolve { ok: false, motivo: 'rep', rep } quando barrado — quem chama
    // decide a mensagem; com ok, o storyTarget da 1ª ronda já está montado.
    prepararEntradaClube: ({ custoBase = 10, gratis = false, territorioId }) => {
      const dividaPrevia = get()._birosca().divida || 0
      // Gate só pra quem entra "por vontade própria" (sem dívida). Quem já deve
      // nunca é barrado, senão vira soft-lock (endividado sem rep, sem saída).
      if (!gratis && dividaPrevia <= 0 && get().rep < GANGUES_REP_GATE_CLUBE) {
        return { ok: false, motivo: 'rep', rep: GANGUES_REP_GATE_CLUBE }
      }
      const base = custoBase || 10
      if (gratis) get().restaurarPvPmTodos()
      else get().entrarClubeDaLuta(base)
      get().setStoryTarget({ clube: true, clubeBase: base, clubeDividaPrevia: dividaPrevia, clubeRonda: 1, clubeHeals: 0, voltar: { territorioId } })
      return { ok: true }
    },

    // Aceitou o Clube: o agiota já te fia 15× o descanso (te "curam
    // adiantado" — a tropa toda volta pro máximo) e a dívida sobe na hora.
    entrarClubeDaLuta: (custoBase = 10) => {
      const valor = GANGUES_CLUBE_ENTRADA_MULT * Math.max(1, Math.round(custoBase))
      const divida = get()._birosca().divida + valor
      gravarDivida(divida)
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { valor, divida }
    },

    // Entre uma ronda e outra, o agiota oferece te ajeitar — cura a tropa toda
    // na hora e DOBRA a dívida na tua cara. Opcional (dá pra ir machucado).
    curarNoClubeSala: () => {
      const antes = Math.max(1, Math.round(get()._birosca().divida))
      const divida = antes * 2
      gravarDivida(divida)
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

    // Fim de uma luta do Clube (chamado pelo hook de vitória). Sem AP e sem
    // grana de vitória comum. Devolve a próxima tela:
    //  • 'clube-sala' — venceu a ronda 1 ou 2 (vai pra sala, contas depois);
    //  • null         — venceu a ronda final ou perdeu: contas acertadas.
    fecharRondaClube: ({ victory, alvo, combatants }) => {
      const ronda = Number(alvo?.clubeRonda) || GANGUES_CLUBE_RONDAS_TOTAL
      if (victory && ronda < GANGUES_CLUBE_RONDAS_TOTAL) {
        get().aplicarDanoPersistente(combatants)
        return 'clube-sala'
      }
      get().resolverClubeDaLuta(victory, alvo?.clubeDividaPrevia || 0, alvo?.clubeHeals || 0)
      if (victory) get().darItem(GANGUES_CLUBE_ITEM_PREMIO, 1)
      return null
    },

    // Acerto de contas do gauntlet (ronda final ou derrota).
    //  `dividaPrevia` = a dívida ANTES de aceitar; `heals` = quantos ajeites.
    //  • Venceu: quita TUDO. Entrou limpo e sem ajeite → +200 na mão. Sem XP.
    //  • Perdeu: te remendam e te largam; a dívida fica o que acumulou.
    resolverClubeDaLuta: (venceu, dividaPrevia = 0, heals = 0) => {
      if (venceu) {
        gravarDivida(0)
        if (Math.round(dividaPrevia) <= 0 && Number(heals) <= 0) get().ganharGrana(GANGUES_CLUBE_PREMIO_LIMPO)
      }
      get().restaurarPvPmTodos()
      get()._persistStory()
    },
  }
}
