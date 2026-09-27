// Slice: descanso da birosca + agiotagem do agiota + Clube da Luta. Extraído
// de store/useGanguesStore.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
// A agiotagem é de NPC agiota (Marimbondo na Pista, Juro Alto na Feira — POI
// tipo `agiota`), a dívida é UMA caderneta global (storyProgress.__birosca).
import {
  normalizeGanguesLoadout, getGanguesResources,
  GANGUES_EMPRESTIMO_VALOR, GANGUES_EMPRESTIMO_MULT, GANGUES_EMPRESTIMO_TETO,
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

    // ── Agiotagem (empréstimo em dinheiro do agiota) ────────────────
    // REDESENHO COMPLETO (Isaias, 21/09/2026) do fiado antigo (5×/10× por
    // contagem de fiados, "nome sujo" depois de 2). Agora é uma escada só,
    // sem contador — só a própria dívida em grana:
    //   divida = 0  → pode pegar o EMPRÉSTIMO (dinheiro na mão, GANGUES_
    //                 EMPRESTIMO_VALOR), que já endivida em ×MULT.
    //   divida > 0  → não pode pegar empréstimo de novo; pode pedir mais
    //                 CURA FIADA, que DOBRA a dívida atual.
    //   divida×2 > GANGUES_EMPRESTIMO_TETO → chegou no teto: o agiota não
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
    // `valor` = quanto AQUELE agiota empresta (Marimbondo 100, Juro Alto 300).
    agiotagemInfo: (valor = GANGUES_EMPRESTIMO_VALOR) => {
      const divida = get()._birosca().divida || 0
      return {
        divida,
        podeEmprestimo: divida <= 0,
        podeFiarCura: divida > 0 && divida * 2 <= GANGUES_EMPRESTIMO_TETO,
        noTeto: divida > 0 && divida * 2 > GANGUES_EMPRESTIMO_TETO,
        valorEmprestimo: valor,
        proximaDivida: divida > 0 ? divida * 2 : valor * GANGUES_EMPRESTIMO_MULT,
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

    // Pegar o empréstimo com o agiota — só quando NÃO deve nada ainda (ver
    // agiotagemInfo.podeEmprestimo). Dá grana na mão de verdade (não cura
    // ninguém) e já endivida em ×MULT.
    pedirEmprestimo: (valor = GANGUES_EMPRESTIMO_VALOR) => {
      if (get()._birosca().divida > 0) return { ok: false, motivo: 'ja_deve' }
      const divida = valor * GANGUES_EMPRESTIMO_MULT
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
      if (rec.divida * 2 > GANGUES_EMPRESTIMO_TETO) return { ok: false, motivo: 'teto' }
      const detalhe = get()._deficitTropa()
      if (!detalhe.some(d => d.pv > 0 || d.pm > 0)) return { ok: false, motivo: 'inteira' }
      const divida = rec.divida * 2
      set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida } } }))
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { ok: true, divida, detalhe: detalhe.filter(d => d.pv > 0 || d.pm > 0) }
    },

    // ── Socorro da derrota — NÃO existe game over (pedido do Isaias,
    // 27/09/2026). A tropa caiu inteira numa luta da cena: é arrastada pra
    // birosca (a posição é resolvida em destinoSocorroDerrota, cenaHelpers.js)
    // e a recuperação completa (o descanso que revive, custoBase × 3 = 30) é
    // cobrada NA HORA, sem perguntar:
    //  • tem os 30 → paga do bolso.
    //  • não tem e nunca pegou empréstimo → pega o empréstimo do agiota
    //    sozinho (100 na mão, dívida 1000), paga os 30 e fica com o troco.
    //  • não tem e JÁ deve → pega só os 30 emprestados, só que a 10× o
    //    valor: +300 na dívida. Sem teto — a dívida vai escalando, e o único
    //    jeito realista de zerar é o Clube da Luta (resolverClubeDaLuta).
    socorroDerrota: (custoBase = 10) => {
      const custo = Math.max(1, Math.round(custoBase)) * 3
      const dividaAntes = get()._birosca().divida || 0
      let tipo = 'pagou'
      let emprestimo = 0
      let divida = dividaAntes
      if (get().grana < custo) {
        if (dividaAntes <= 0) {
          tipo = 'emprestimo'
          emprestimo = GANGUES_EMPRESTIMO_VALOR
          divida = GANGUES_EMPRESTIMO_VALOR * GANGUES_EMPRESTIMO_MULT
        } else {
          tipo = 'fiado'
          emprestimo = custo
          divida = dividaAntes + custo * GANGUES_EMPRESTIMO_MULT
        }
        set(state => ({ storyProgress: { ...state.storyProgress, __birosca: { divida } } }))
        get().ganharGrana(emprestimo)
      }
      get().gastarGrana(custo)
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { tipo, custo, emprestimo, divida, acrescimo: divida - dividaAntes, grana: get().grana }
    },

    // ── Fiado por FAVOR da Dona Regina (Feira) ──────────────────────
    // Sem grana, a Regina cura a tropa inteira igual (revive os caídos) e a
    // gangue fica devendo 1 favor — sem grana e sem juro. Com favor em
    // aberto ela não fia de novo; paga o favor fazendo um dos 3 eventos de
    // favor (recompensa `pagaFavor`, ver data/cenas/feira/pois.js).
    // Guardado em storyProgress.__regina = { favor: bool }.
    reginaDeveFavor: () => Boolean(get().storyProgress.__regina?.favor),
    fiarPorFavor: () => {
      if (get().reginaDeveFavor()) return { ok: false, motivo: 'favor_pendente' }
      const detalhe = get()._deficitTropa().filter(d => d.pv > 0 || d.pm > 0)
      if (!detalhe.length) return { ok: false, motivo: 'inteira' }
      set(state => ({ storyProgress: { ...state.storyProgress, __regina: { favor: true } } }))
      get().restaurarPvPmTodos()
      get()._persistStory()
      return { ok: true, detalhe }
    },
    pagarFavorRegina: () => {
      if (!get().reginaDeveFavor()) return false
      set(state => ({ storyProgress: { ...state.storyProgress, __regina: { favor: false } } }))
      get()._persistStory()
      return true
    },

    // Choque do Quadro de Luz (Feira): tira `n` de PV de cada um da tropa,
    // sem nunca derrubar ninguém (fica com pelo menos 1).
    choqueTropa: (n) => {
      const pvAtualPorId = Object.fromEntries(get()._deficitTropa().map(d => [d.id, d]))
      const aplicar = m => {
        const norm = normalizeGanguesLoadout(m)
        const attrs = getGanguesAttributesWithEquip(norm.attributes)
        const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.PV, attrs?.PM), norm.attributes?.equipment)
        const atual = res.pvMax - (pvAtualPorId[m.id]?.pv || 0)
        if (atual <= 0) return m
        return { ...m, attributes: { ...m.attributes, pv_atual: Math.max(1, atual - n) } }
      }
      set(state => {
        const roster = state.roster.map(aplicar)
        const byId = new Map(roster.map(m => [m.id, m]))
        return { roster, activeParty: state.activeParty.map(m => byId.get(m.id) || m) }
      })
      get().saveParticipantProgress(get().roster.map(m => m.id))
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

    // Aceitou o Clube da Luta. Ao entrar, o agiota já te fia 15× o descanso
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

    // Entre uma ronda e outra do gauntlet, o agiota oferece te ajeitar — cura a
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
    //  a dívida que já tava no teto, na entrada forçada do socorro do agiota).
    //  `heals` = quantas vezes deixou o agiota ajeitar entre as rondas.
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
