// Slice: ganho de AP/XP, persistência de dano/nível, cura fora de combate, e
// sincronização com o Supabase. Extraído de store/useGanguesStore.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { supabase } from '../../../../../lib/supabase'
import { addGanguesAp, normalizeGanguesLoadout, getGanguesResources } from '../../data/ganguesLoadout.js'
import { hydrateGanguesTemplateSheet, getGanguesLevelFromXp } from '../../data/ganguesCharacters.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources } from '../../data/ganguesEquip.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from '../../data/ganguesLoadout.js'

export default function createGanguesProgressionSlice(set, get) {
  return {
    // Atualiza sheet, roster e activeParty juntos — senão o XP ganho na vitória fica preso
    // na ficha solta e o painel de progressão do lobby (que lê de activeParty) nunca reflete o ganho.
    // Retorna earnedXp pra quem chamou saber se rendeu ponto novo pra gastar (aviso de level up).
    gainAp: (amount) => {
      const { progression, earnedXp } = addGanguesAp(get().sheet, amount)
      set(state => {
        const attributes = { ...state.sheet.attributes, progression }
        const xp_total = (state.sheet.xp_total || 0) + earnedXp
        const sheetId = state.sheet.id
        return {
          sheet: { ...state.sheet, attributes, xp_total },
          roster: state.roster.map(member => member.id === sheetId ? { ...member, attributes, xp_total } : member),
          activeParty: state.activeParty.map(member => member.id === sheetId ? { ...member, attributes, xp_total } : member),
        }
      })
      return earnedXp
    },

    // pesosPorId: { [memberId]: peso } — a fatia de `totalAp` de cada um é
    // proporcional ao peso dele (quem matou mais/bateu mais dano pesa mais,
    // ver GanguesVictory.jsx), não dividido em partes iguais. MAS todo
    // participante recebe 1 AP garantido, reservado do PRÓPRIO pote (nunca
    // inventado por fora — foi exatamente isso que estourou o teto antes: um
    // "empurrão" que dava AP extra além do total real). Só quando o pote é
    // menor que o número de gente (time gigante contra 1 inimigo fraco) é que
    // não dá pra garantir pra todo mundo — aí cai pra divisão só por peso.
    gainApForParticipants: (totalAp, pesosPorId = {}, nivelPorId = {}) => {
      const ids = Object.keys(pesosPorId)
      const somaPesos = ids.reduce((s, id) => s + (Number(pesosPorId[id]) || 0), 0) || 1
      const apTotalInteiro = Math.round(Math.max(0, Number(totalAp) || 0))
      const podeGarantirTodoMundo = ids.length > 0 && apTotalInteiro >= ids.length
      const baseGarantida = podeGarantirTodoMundo ? 1 : 0
      const poteRestante = podeGarantirTodoMundo ? Math.max(0, apTotalInteiro - ids.length) : apTotalInteiro
      // apPorMembro é o número INTEIRO que o jogador vê na tela de vitória —
      // "maior resto" arredonda a fatia de cada um sem deixar a soma passar
      // do total real (ex: 50/3 = 16.67 não pode virar 17 pra todo mundo,
      // 17×3=51 estouraria). ESSE é o valor que também é aplicado de verdade
      // no personagem logo abaixo — antes o número exibido (arredondado) e o
      // valor realmente concedido (fração exata, ex: 5.8) podiam divergir, e
      // o jogador via "+6" na tela mas a ficha fechava com 5. Uma fonte única
      // de verdade agora: o que aparece é exatamente o que é concedido.
      const fracoesExatas = {}
      ids.forEach(id => { fracoesExatas[id] = (Number(pesosPorId[id]) || 0) / somaPesos * poteRestante })
      const apPorMembro = {}
      let somaPisos = 0
      ids.forEach(id => { const piso = Math.floor(fracoesExatas[id]); apPorMembro[id] = baseGarantida + piso; somaPisos += piso })
      const sobra = poteRestante - somaPisos
      // A sobra (divisão que não fecha, número ímpar) respeita PRIMEIRO o peso
      // (quem contribuiu mais tem prioridade — não faz sentido alguém que nem
      // lutou furar na frente de quem matou). SÓ entre pesos EMPATADOS (ex: dois
      // que não atacaram) o desempate vai pro de MENOR nível — o elo fraco que o
      // jogador normalmente quer upar. Por último, maior resto fracionário.
      // BUG CORRIGIDO: antes o nível mandava sozinho, e um recruta novo/fraco
      // (nível baixo) SEMPRE vencia o desempate mesmo sem ter lutado — "o Marreta
      // sempre recebe mais que todo mundo" mesmo parado.
      const resto = id => fracoesExatas[id] - Math.floor(fracoesExatas[id])
      const temNivel = Object.keys(nivelPorId).length > 0
      const ordemSobra = [...ids].sort((a, b) =>
        ((Number(pesosPorId[b]) || 0) - (Number(pesosPorId[a]) || 0)) ||
        (temNivel ? (Number(nivelPorId[a] ?? 999) - Number(nivelPorId[b] ?? 999)) : 0) ||
        (resto(b) - resto(a)))
      for (let i = 0; i < sobra && ordemSobra.length; i++) apPorMembro[ordemSobra[i % ordemSobra.length]] += 1

      const levelUps = []
      let totalXp = 0
      set(state => {
        const advance = member => {
          if (!(member.id in pesosPorId)) return member
          const resultado = addGanguesAp(member, apPorMembro[member.id])
          totalXp += resultado.earnedXp
          const novoXpTotal = (member.xp_total || 0) + resultado.earnedXp
          const subiuDeNivel = member.character_type === 'template' && getGanguesLevelFromXp(novoXpTotal) > (member.level || 1)
          const next = {
            ...member,
            xp_total: novoXpTotal,
            attributes: {
              ...member.attributes,
              progression: resultado.progression,
              // Subiu de nível = descansou/treinou pra chegar lá — restaura
              // PV/PM cheios (null = "usa o máximo", mesma convenção de
              // restaurarPvPmTodos). Sem isso o personagem levava o dano
              // acumulado de antes do level-up pro próximo desafio, sem
              // nenhum benefício imediato de ter evoluído.
              ...(subiuDeNivel ? { pv_atual: null, pm_atual: null } : {}),
            },
          }
          const hydrated = member.character_type === 'template' ? hydrateGanguesTemplateSheet(next) : next
          if (subiuDeNivel) {
            levelUps.push({ id: member.id, name: hydrated.sheet_name, characterTemplateId: hydrated.character_template_id, fromLevel: member.level || 1, toLevel: hydrated.level })
          }
          return hydrated
        }
        const roster = state.roster.map(advance)
        const byId = new Map(roster.map(member => [member.id, member]))
        return {
          roster,
          activeParty: state.activeParty.map(member => byId.get(member.id) || member),
          sheet: byId.get(state.sheet.id) || state.sheet,
        }
      })
      return { levelUps, totalXp, apPorMembro }
    },

    // Grava o PV/PM com que cada lutador do time SAIU da luta — é isso que faz
    // o dano persistir entre reentradas numa treta repetível (ver `prepare` em
    // useGanguesTurnMachine.js, que lê pv_atual/pm_atual pra decidir com quanto
    // cada um COMEÇA a próxima). `finais` é o array de combatentes do
    // battleReport (só os do lado 'player' importam aqui).
    aplicarDanoPersistente: (finais = []) => set(state => {
      const porId = new Map(finais.filter(c => c.side === 'player').map(c => [c.id, c]))
      const aplicar = member => {
        const final = porId.get(member.id)
        if (!final) return member
        return { ...member, attributes: { ...member.attributes, pv_atual: Math.max(0, final.pv), pm_atual: Math.max(0, final.pm) } }
      }
      return {
        roster: state.roster.map(aplicar),
        activeParty: state.activeParty.map(aplicar),
        sheet: porId.has(state.sheet.id) ? aplicar(state.sheet) : state.sheet,
      }
    }),

    // Restaura PV/PM de todo o elenco pro máximo — só acontece descansando na
    // birosca (GanguesDescanso) ou dominando o território (GanguesVictory).
    // Limpar pv_atual/pm_atual (em vez de calcular o máximo aqui) deixa o
    // próximo `prepare()` cair no fallback de "cheio" sozinho.
    restaurarPvPmTodos: () => {
      const limpar = member => ({ ...member, attributes: { ...member.attributes, pv_atual: null, pm_atual: null } })
      set(state => ({ roster: state.roster.map(limpar), activeParty: state.activeParty.map(limpar) }))
      get().saveParticipantProgress(get().roster.map(member => member.id))
    },

    // Cura UM personagem fora de combate (poção usada pela Bolsa da Gangue).
    // `tipo` = 'cura_pm' → PM, qualquer outro → PV. `valor` = quanto restaura.
    // Devolve { curou, nome, campo } — se curou === 0 o membro já estava cheio
    // e quem chamou NÃO deve consumir a poção.
    curarMembro: (memberId, tipo, valor) => {
      const campo = tipo === 'cura_pm' ? 'pm_atual' : 'pv_atual'
      const maxKey = tipo === 'cura_pm' ? 'pmMax' : 'pvMax'
      let curou = 0, nome = '?'
      const aplicar = m => {
        if (m.id !== memberId) return m
        const norm = normalizeGanguesLoadout(m)
        const attrs = getGanguesAttributesWithEquip(norm.attributes)
        const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.PV, attrs?.PM), norm.attributes?.equipment)
        const max = res[maxKey]
        const atual = Math.min(max, Number(m.attributes?.[campo] ?? max))
        const novo = Math.min(max, atual + Math.max(0, valor))
        curou = novo - atual
        nome = m.sheet_name || '?'
        if (curou <= 0) return m
        return { ...m, attributes: { ...m.attributes, [campo]: novo } }
      }
      set(state => {
        const roster = state.roster.map(aplicar)
        const byId = new Map(roster.map(m => [m.id, m]))
        return {
          roster,
          activeParty: state.activeParty.map(m => byId.get(m.id) || m),
          sheet: byId.get(state.sheet.id) || state.sheet,
        }
      })
      if (curou > 0) { get().saveParticipantProgress([memberId]); get()._persistCena() }
      return { curou, nome, campo: campo === 'pm_atual' ? 'PM' : 'PV' }
    },

    saveParticipantProgress: async (participantIds = []) => {
      const uid = get()._userId
      if (!uid) return
      const ids = new Set(participantIds)
      await Promise.all(get().roster.filter(member => ids.has(member.id) && !String(member.id).startsWith('local-')).map(member =>
        supabase.from('gangues_fichas').update({ attributes: member.attributes, xp_total: member.xp_total }).eq('id', member.id).eq('user_id', uid)
      ))
    },

    saveToCloud: async (userId) => {
      const uid = userId || get()._userId
      if (!uid) return null
      const s = get().sheet
      const payload = { user_id: uid, save_id: get()._saveId, sheet_name: s.sheet_name, attributes: s.attributes, elemental: s.elemental, combat_path: s.combat_path, loadout_version: s.loadout_version, xp_total: s.xp_total, character_template_id: s.character_template_id || null }
      const request = s.id
        ? supabase.from('gangues_fichas').update(payload).eq('id', s.id).select('id').maybeSingle()
        : supabase.from('gangues_fichas').insert(payload).select('id').maybeSingle()
      const { data, error } = await request
      if (error) { console.error('[GANGUES] Falha ao salvar ficha:', error.message); return null }
      if (!s.id && data) {
        if (data) set(state => ({ sheet: { ...state.sheet, id: data.id } }))
      }
      const saved = { ...get().sheet, id: s.id || data?.id }
      set(state => ({ roster: [...state.roster.filter(item => item.id !== saved.id), saved], activeParty: state.activeParty.map(item => item.id === saved.id ? saved : item) }))
      return saved
    },

    loadSheets: async (saveId) => {
      if (!saveId) return []
      const { data, error } = await supabase.from('gangues_fichas').select('id, sheet_name, attributes, elemental, combat_path, loadout_version, xp_total, character_template_id').eq('save_id', saveId).order('created_at', { ascending: false })
      if (error) console.error('[GANGUES] Falha ao carregar fichas:', error.message)
      // Toda linha de gangues_fichas é uma ficha de template — hidrata a partir
      // do catálogo (ldi_gangues_30_personagens_v1.json) pelo character_template_id.
      const roster = Array.isArray(data) ? data.map(item => {
        const templateId = item.character_template_id || item.attributes?.character_template_id
        return templateId ? hydrateGanguesTemplateSheet({ ...item, character_type: 'template', character_template_id: Number(templateId) }) : ({ ...item, ...normalizeGanguesLoadout(item) })
      }) : []
      set(state => {
        // Time de batalha: se ainda não tem um escolhido, começa com os N
        // primeiros do elenco (até o teto). Assim dá pra pular o lobby e ir
        // direto pro mapa com um save que já tem gangue.
        const validos = state.activeParty.filter(m => roster.some(r => r.id === m.id))
        const activeParty = validos.length ? validos : roster.slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)
        return { roster, activeParty }
      })
      return roster
    },
  }
}
