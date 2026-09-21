// Slice: descanso da birosca + agiotagem do Nato + Clube da Luta. Extraído de
// store/useGanguesStore.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import {
  normalizeGanguesLoadout, getGanguesResources,
  GANGUES_EMPRESTIMO_NATO_VALOR, GANGUES_EMPRESTIMO_NATO_MULT, GANGUES_EMPRESTIMO_NATO_TETO,
} from '../../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources } from '../../data/ganguesEquip.js'

export default function createGanguesBiroscaSlice(set, get) {
  return {
    // Descanso na birosca — cobra a grana e devolve o quanto cada um recuperou
    // (pra a tela mostrar o detalhe). Se ninguém elegível estava ferido, não
    // cobra nada e devolve motivo: 'inteira'.
    //
    // `incluirCaidos` (pedido do Isaias, 21/09/2026: "recuperar quem não caiu
    // custa 10... recuperar com o caído dá mais trabalho, custa 30, e leva um
    // pouco mais de tempo na animação") — duas opções na mesma birosca:
    //  • false (padrão, custo normal): só recupera quem NÃO tá com PV zerado.
    //    Quem já caiu continua caído.
    //  • true (custo × 3): recupera todo mundo, incluindo os caídos (revive).
    descansarTropa: (custo = 0, incluirCaidos = false) => {
      const detalheCompleto = get()._deficitTropa()
      const alvo = incluirCaidos ? detalheCompleto : detalheCompleto.filter(d => !d.caido)
      const ferido = alvo.some(d => d.pv > 0 || d.pm > 0)
      if (!ferido) return { ok: false, motivo: 'inteira', detalhe: [] }
      if (get().grana < custo) return { ok: false, motivo: 'grana', detalhe: [] }
      get().gastarGrana(custo)
      if (incluirCaidos) get().restaurarPvPmTodos()
      else get().restaurarPvPmVivos()
      return { ok: true, detalhe: alvo.filter(d => d.pv > 0 || d.pm > 0) }
    },

    // Info pra UI decidir que botão(ões) de descanso oferecer, sem gastar nada:
    // se tem alguém caído (pra oferecer a opção cara de revive) e se tem
    // alguém ferido em cada categoria (pra não oferecer botão que não faz nada).
    descansoInfo: () => {
      const detalhe = get()._deficitTropa()
      return {
        temCaido: detalhe.some(d => d.caido),
        feridoVivos: detalhe.some(d => !d.caido && (d.pv > 0 || d.pm > 0)),
        feridoTodos: detalhe.some(d => d.pv > 0 || d.pm > 0),
      }
    },

    // ── Agiotagem do Nato (empréstimo em dinheiro) ──────────────────
    // REDESENHO COMPLETO (Isaias, 21/09/2026) do fiado antigo (5×/10× por
    // contagem de fiados, "nome sujo" depois de 2). Agora é uma escada só,
    // sem contador — só a própria dívida em grana:
    //   divida = 0  → pode pegar o EMPRÉSTIMO (dinheiro na mão, GANGUES_
    //                 EMPRESTIMO_NATO_VALOR), que já endivida em ×MULT.
    //   divida > 0  → não pode pegar empréstimo de novo; pode pedir mais
    //                 CURA FIADA, que DOBRA a dívida atual.
    //   divida×2 > GANGUES_EMPRESTIMO_NATO_TETO → chegou no teto: o Nato não
    //                 cobra mais nada (cura de graça), mas força o Clube da
    //                 Luta (ver iniciarClube(custoBase, gratis=true) em
    //                 GanguesCena.jsx — não passa pela oferta normal de
    //                 aceitar/recusar, é jogado direto pra dentro).
    // A dívida é GLOBAL (uma caderneta só pra todas as biroscas de todos os
    // bairros) e SILENCIOSA — não tem HUD, o jogador só vê quando abre o
    // descanso. Guardada dentro do próprio storyProgress (chave reservada
    // __birosca), igual __album/__flags — sem coluna nova no Supabase.
    //   { divida: <grana devida> }
    _birosca: () => get().storyProgress.__birosca || { divida: 0 },

    // Info pra UI decidir que opção de agiotagem oferecer, sem gastar nada.
    // `proximaDivida` = quanto a dívida vai virar se o jogador pedir agora
    // (empréstimo, se ainda não deve nada; ou o dobro, se já deve).
    agiotagemInfo: () => {
      const divida = get()._birosca().divida || 0
      return {
        divida,
        podeEmprestimo: divida <= 0,
        podeFiarCura: divida > 0 && divida * 2 <= GANGUES_EMPRESTIMO_NATO_TETO,
        noTeto: divida > 0 && divida * 2 > GANGUES_EMPRESTIMO_NATO_TETO,
        valorEmprestimo: GANGUES_EMPRESTIMO_NATO_VALOR,
        proximaDivida: divida > 0 ? divida * 2 : GANGUES_EMPRESTIMO_NATO_VALOR * GANGUES_EMPRESTIMO_NATO_MULT,
      }
    },

    // Déficit de PV/PM de toda a tropa (usado pelo descanso e pelo fiado pra
    // saber se tem alguém ferido e mostrar o quanto cada um recuperou).
    // `caido` = pv_atual zerado — decide quem a opção barata de descanso NÃO
    // recupera (ver descansarTropa/descansoInfo).
    _deficitTropa: () => get().roster.map(m => {
      const norm = normalizeGanguesLoadout(m)
      const attrs = getGanguesAttributesWithEquip(norm.attributes)
      const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.PV, attrs?.PM), norm.attributes?.equipment)
      const pvAtual = Math.min(res.pvMax, Number(norm.attributes?.pv_atual ?? res.pvMax))
      const pmAtual = Math.min(res.pmMax, Number(norm.attributes?.pm_atual ?? res.pmMax))
      return {
        id: m.id,
        nome: m.sheet_name || '?',
        caido: pvAtual <= 0,
        pv: Math.max(0, Math.round(res.pvMax - pvAtual)),
        pm: Math.max(0, Math.round(res.pmMax - pmAtual)),
      }
    }),

    // A tropa inteira que iria pra luta está com PV zerado (todos caídos) — aí
    // não dá pra entrar em combate, tem que se recuperar antes (é o gatilho do
    // desespero que leva ao Clube da Luta). pv_atual null/ausente = cheio.
    tropaNoChao: () => {
      const party = (get().activeParty.length ? get().activeParty : get().roster).slice(0, 6)
      if (!party.length) return false
      return party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)
    },

    // Pegar o empréstimo com o Nato — só quando NÃO deve nada ainda (ver
    // agiotagemInfo.podeEmprestimo). Dá grana na mão de verdade (não cura
    // ninguém) e já endivida em ×MULT.
    pedirEmprestimoNato: () => {
      if (get()._birosca().divida > 0) return { ok: false, motivo: 'ja_deve' }
      const valor = GANGUES_EMPRESTIMO_NATO_VALOR
      const divida = valor * GANGUES_EMPRESTIMO_NATO_MULT
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida } } }))
      get().ganharGrana(valor)
      get()._persistStory()
      return { ok: true, valor, divida }
    },

    // Pedir mais cura fiada — DOBRA a dívida atual (só depois de já ter
    // pego o empréstimo, e antes do teto — ver agiotagemInfo).
    fiarDescanso: () => {
      const rec = get()._birosca()
      if (rec.divida <= 0) return { ok: false, motivo: 'sem_emprestimo' }
      if (rec.divida * 2 > GANGUES_EMPRESTIMO_NATO_TETO) return { ok: false, motivo: 'teto' }
      const detalhe = get()._deficitTropa()
      if (!detalhe.some(d => d.pv > 0 || d.pm > 0)) return { ok: false, motivo: 'inteira' }
      const divida = rec.divida * 2
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida } } }))
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { ok: true, divida, detalhe: detalhe.filter(d => d.pv > 0 || d.pm > 0) }
    },

    // Pagar a dívida (parcial ou total). Abate de `grana` o que der.
    pagarBirosca: (quanto) => {
      const rec = get()._birosca()
      if (rec.divida <= 0) return { ok: false, motivo: 'quitado' }
      const pago = Math.min(Number.isFinite(quanto) ? quanto : rec.divida, get().grana, rec.divida)
      if (pago <= 0) return { ok: false, motivo: 'grana' }
      get().gastarGrana(pago)
      const restante = Math.max(0, rec.divida - pago)
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida: restante } } }))
      get()._persistStory()
      return { ok: true, pago, restante }
    },

    // (legado — o Clube agora é oferecido SEMPRE na birosca, não só num beco sem
    // saída. Mantido caso algum código antigo referencie.)
    clubeDaLutaElegivel: () => {
      const rec = get()._birosca()
      return rec.divida > 0 && get().tropaNoChao() && get().grana < rec.divida
    },

    // Aceitou o Clube da Luta. Ao entrar, o Nato já te fia 15× o descanso
    // (te "curam adiantado" — a tropa toda volta pro máximo) e a dívida sobe
    // na hora. A luta roda com storyTarget { clube: true, clubeRonda: 1 } —
    // é um gauntlet de 3 rondas (1 fraco → 2 → 3 casca-grossa).
    entrarClubeDaLuta: (custoBase = 10) => {
      const rec = get()._birosca()
      const valor = 15 * Math.max(1, Math.round(custoBase))
      const divida = rec.divida + valor
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida } } }))
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
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida } } }))
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
    //  `dividaPrevia` = a dívida ANTES de aceitar (antes do 15× de entrada, ou
    //  a dívida que já tava no teto, na entrada forçada do socorro do Nato).
    //  `heals` = quantas vezes deixou o Nato ajeitar entre as rondas.
    //  • Venceu (ronda 3): quita TUDO, nome limpa. Se entrou LIMPO e não pediu
    //    nenhum ajeite (dividaPrevia 0 e heals 0), ainda leva 200 na mão. Sem XP.
    //  • Perdeu: te remendam e te largam. A dívida NÃO cresce mais — fica o que
    //    acumulou. Nunca é game over.
    resolverClubeDaLuta: (venceu, custoBase = 10, dividaPrevia = 0, heals = 0) => {
      if (venceu) {
        set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida: 0 } } }))
        if (Math.round(dividaPrevia) <= 0 && Number(heals) <= 0) get().ganharGrana(200)
      }
      get().restaurarPvPmTodos()
      get()._persistStory()
    },
  }
}
