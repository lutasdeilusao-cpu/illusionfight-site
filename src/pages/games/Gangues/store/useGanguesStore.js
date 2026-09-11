import { create } from 'zustand'
import { supabase } from '../../../../lib/supabase'
import { addGanguesAp, defaultGanguesProgression, getGanguesRosterLimit, normalizeGanguesLoadout, getGanguesResources, GANGUES_STORY_BATTLE_PARTY_MAX } from '../data/ganguesLoadout.js'
import { carregarProgressoHistoria, salvarProgressoHistoria, listarSaves, criarSave, excluirSave } from './ganguesStoryProgress.js'
import { createGanguesTemplateSheet, hydrateGanguesTemplateSheet, getGanguesLevelFromXp, toggleGanguesTemplateSpecial } from '../data/ganguesCharacters.js'
import { createGanguesEquipInstance, normalizeGanguesEquipment, getGanguesEquip, getGanguesAttributesWithEquip, applyGanguesEquipResources } from '../data/ganguesEquip.js'
import { idsValidosUnicos } from '../data/ganguesInimigos.js'

// Debounce dos writes de progresso do modo história: várias ações batem em sequência
// (marcar POI + grana + rep) e não faz sentido um upsert por campo.
let storySaveTimer = null

/**
 * Retorna o limite máximo de fichas de personagem por tier.
 */
export function limiteFichasPorTier(tier) {
  return getGanguesRosterLimit(tier)
}

/**
 * Verifica se o usuário pode criar uma nova ficha dado o total atual.
 */
export function podeCriarFicha(perfil, totalFichas) {
  const limite = limiteFichasPorTier(perfil?.tier)
  return totalFichas < limite
}

const defaultSheet = () => ({
  id: null,
  sheet_name: '',
  attributes: { A: 0, H: 0, R: 0, D: 0, progression: defaultGanguesProgression() },
  elemental: 'neutro',
  combat_path: null,
  loadout_version: 2,
  xp_total: 0,
  character_type: 'legacy',
  character_template_id: null,
})

export const useGanguesStore = create((set, get) => ({
  sheet: defaultSheet(),
  roster: [],
  activeParty: [],
  match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null },
  _userId: null,

  // ── Save slots: qual gangue (save) está aberta agora ──
  // Uma conta pode ter várias gangues em paralelo (ver GANGUES_SAVE_SLOT_LIMITS).
  // _saveId é o save selecionado na tela GanguesSaveSelect — todo load/save de
  // roster e progresso de história passa a ser escopado por ele, não mais só
  // pelo user_id. Guest não tem save (joga só em memória).
  _saveId: null,
  saves: [],

  listSaves: async (userId) => {
    const saves = await listarSaves(userId)
    set({ saves })
    return saves
  },

  criarNovoSave: async (userId) => {
    const id = await criarSave(userId)
    if (id) await get().listSaves(userId)
    return id
  },

  excluirSaveById: async (saveId, userId) => {
    const ok = await excluirSave(saveId)
    if (ok) await get().listSaves(userId)
    return ok
  },

  // Abre um save: carrega o progresso de história e o elenco daquela gangue
  // específica, e passa a persistir tudo nela a partir de agora.
  selecionarSave: async (saveId) => {
    set({ _saveId: saveId, roster: [], activeParty: [], gangName: '', storyProgress: {}, cenaProgresso: {}, grana: 0, rep: 0, inventario: {}, equipamentos: [] })
    await Promise.all([get().loadStoryProgress(saveId), get().loadSheets(saveId)])
  },

  // Qual ficha está aberta na tela dedicada de progressão (fase 'progression').
  progressionTargetId: null,
  setProgressionTarget: (id) => set({ progressionTargetId: id }),

  // Quando a vitória empurra o jogador pra Progressão pra gastar AP parado,
  // guarda aqui o que ele faria em seguida (continuar território, voltar pro
  // mapa etc.) — o botão "voltar" da Progressão executa isso em vez de ir
  // sempre pro lobby, retomando o fluxo pós-vitória de onde ele parou.
  posVitoriaAcao: null,
  setPosVitoriaAcao: (fn) => set({ posVitoriaAcao: fn }),

  newSheet: () => set({ sheet: defaultSheet() }),

  loadSheet: (data) => {
    const templateId = data?.character_template_id || data?.attributes?.character_template_id
    const source = templateId ? { ...data, character_type: 'template', character_template_id: Number(templateId) } : data
    const normalized = source?.character_type === 'template' ? hydrateGanguesTemplateSheet(source) : { ...source, ...normalizeGanguesLoadout(source) }
    set({ sheet: { ...defaultSheet(), ...normalized }, match: { enemy_id: null, score: 0, status: 'idle' } })
  },

  setUserId: (id) => set({ _userId: id }),

  setRoster: (roster) => set(state => {
    const ids = new Set(roster.map(item => item.id))
    return { roster, activeParty: state.activeParty.filter(item => ids.has(item.id)) }
  }),

  setActiveParty: (activeParty) => set({ activeParty }),
  addLocalSheet: (sheet) => {
    const saved = { ...sheet, id: sheet.id || `local-${sheet.character_template_id || 'legacy'}-${Date.now()}` }
    set(state => ({ sheet: saved, roster: [...state.roster, saved] }))
    return saved
  },

  recruitTemplate: async (characterTemplateId, userId, xpTotal = 0) => {
    const templateSheet = createGanguesTemplateSheet(characterTemplateId, xpTotal)
    if (!templateSheet || get().roster.some(item => item.character_template_id === templateSheet.character_template_id)) return null
    set({ sheet: templateSheet })
    return (userId || get()._userId) ? get().saveToCloud(userId) : get().addLocalSheet(templateSheet)
  },

  // playerTeamOverride: usado pelo modo história pra levar só um recorte do
  // elenco pra batalha (teto de 3), sem mexer no activeParty "de verdade"
  // que o resto da UI (lobby, Arena) enxerga.
  startMatch: (enemy, enemyTeam = [enemy], playerTeamOverride = null) => {
    const playerTeam = playerTeamOverride || get().activeParty
    set({ match: { playerTeam, enemyTeam, enemy, enemy_id: enemy.id, score: 0, status: 'fighting', battleReport: null } })
  },

  setBattleReport: (battleReport) => set(state => ({ match: { ...state.match, battleReport } })),

  setEnemyCatalog: (_enemyCatalog) => set({ _enemyCatalog }),

  endMatch: (result) => set(state => {
    const newScore = result === 'victory' ? state.match.score + 1 : state.match.score
    return { match: { ...state.match, score: newScore, status: result === 'victory' ? 'victory' : 'defeat' } }
  }),

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
      const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.R), norm.attributes?.equipment)
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

  deleteSheet: async (sheetId) => {
    if (!sheetId) return false
    if (get()._userId && !String(sheetId).startsWith('local-')) {
      const { error } = await supabase.from('gangues_fichas').delete().eq('id', sheetId)
      if (error) { console.error('[GANGUES] Falha ao excluir ficha:', error.message); return false }
    }
    set(state => ({
      roster: state.roster.filter(item => item.id !== sheetId),
      activeParty: state.activeParty.filter(item => item.id !== sheetId),
      sheet: state.sheet.id === sheetId ? defaultSheet() : state.sheet,
    }))
    return true
  },

  // Álbum de Marélia — registra os inimigos derrotados (ids numéricos) no
  // progresso do save. Guardado dentro do próprio storyProgress (chave
  // reservada __album), igual ao __flags do informante — sem coluna nova no
  // Supabase. Chamado pela tela de vitória com todo o bando batido.
  registrarNoAlbum: (ids = []) => {
    const novos = idsValidosUnicos(ids)
    if (!novos.length) return
    set(state => {
      const atual = state.storyProgress.__album || []
      const merge = [...new Set([...atual, ...novos])]
      if (merge.length === atual.length) return state
      return { storyProgress: { ...state.storyProgress, __album: merge } }
    })
    get()._persistStory()
  },

  // Coleção de ITENS — mesmo padrão do álbum (chave reservada __itens no
  // storyProgress, sem coluna nova). Marca todo id de item/equipamento que o
  // jogador já viu passar pela mão (comprou, ganhou de recompensa, dropou) —
  // a aba "Itens" da Coleção usa isso pra separar descoberto de "???".
  registrarItemVisto: (ids = []) => {
    const novos = ids.map(Number).filter(Number.isFinite)
    if (!novos.length) return
    set(state => {
      const atual = state.storyProgress.__itens || []
      const merge = [...new Set([...atual, ...novos])]
      if (merge.length === atual.length) return state
      return { storyProgress: { ...state.storyProgress, __itens: merge } }
    })
    get()._persistStory()
  },

  // Ganhar item sem pagar (recompensa de POI, drop) — ao contrário de
  // comprarItem, não cobra grana. Marca no __itens.
  darItem: (itemId, qtd = 1) => {
    const id = Number(itemId)
    if (!Number.isFinite(id)) return
    set(state => ({ inventario: { ...state.inventario, [id]: (state.inventario[id] || 0) + Math.max(1, qtd) } }))
    get().registrarItemVisto([id])
    get()._persistCena()
  },

  temItens: (mapa = {}) => Object.entries(mapa).every(([id, q]) => (get().inventario[id] || 0) >= q),

  // Consome vários itens de uma vez (fetch quest: "traz 2 sucata"). Tudo ou
  // nada — devolve false sem gastar se faltar qualquer um.
  gastarItens: (mapa = {}) => {
    if (!get().temItens(mapa)) return false
    set(state => {
      const inv = { ...state.inventario }
      for (const [id, q] of Object.entries(mapa)) inv[id] = (inv[id] || 0) - q
      return { inventario: inv }
    })
    get()._persistCena()
    return true
  },

  // ── Nome da gangue ──
  // É o que reverbera na história (falas dos inimigos, % de domínio, fim).
  gangName: '',
  setGangName: (nome) => {
    const limpo = String(nome || '').replace(/\s+/g, ' ').trim().slice(0, 28)
    set({ gangName: limpo })
    get()._persistStory()
  },

  // ── Modo história ──
  // Progresso salvo em Supabase (tabela `gangues_saves`, uma linha por
  // SAVE — ver `_saveId`/`selecionarSave`) quando logado; guest joga só em
  // memória e perde tudo ao sair — igual à ficha de personagem (ver `addLocalSheet`).
  // storyProgress: { [territorioId]: { pontos: [noId...], chefe: bool } }
  storyProgress: {},
  // Nó em que o jogador entrou: { territorioId, noId, enemyId, isChefe }
  storyTarget: null,
  setStoryTarget: (target) => set({ storyTarget: target }),

  loadStoryProgress: async (saveId) => {
    if (!saveId) return
    const progresso = await carregarProgressoHistoria(saveId)
    if (progresso) set(progresso)
  },

  marcarNoDominado: (territorioId, noId, isChefe) => {
    set(state => {
      const atual = state.storyProgress[territorioId] || { pontos: [], chefe: false }
      const prox = isChefe
        ? { ...atual, chefe: true }
        : { ...atual, pontos: atual.pontos.includes(noId) ? atual.pontos : [...atual.pontos, noId] }
      return { storyProgress: { ...state.storyProgress, [territorioId]: prox } }
    })
    get()._persistStory()
  },

  // Reaproveitamento entre territórios: falar com um informante num bairro
  // já dominado libera algo em outro (ver `precisaInformante` em
  // ganguesTerritorios.js). Guardado dentro do próprio storyProgress (chave
  // reservada __flags) pra não precisar de coluna nova no Supabase — é o
  // mesmo JSONB que já existe.
  marcarInformante: (chave) => {
    set(state => ({ storyProgress: { ...state.storyProgress, __flags: { ...(state.storyProgress.__flags || {}), [chave]: true } } }))
    get()._persistStory()
  },

  // ── Dificuldade do modo história (escolha do jogador) ──────────
  // 'facil' | 'medio' | 'dificil'. Guardada em storyProgress.__dificuldade
  // (mesmo JSONB, sem coluna nova). Afeta o orçamento de TODO bando
  // (gerarBando* em ganguesEncontros.js). NO FÁCIL o túnel/muro NÃO abre —
  // o Carvão não se rebaixa a encarar pivete (ver GanguesCena).
  dificuldadeJogo: () => get().storyProgress.__dificuldade || 'medio',
  setDificuldadeJogo: (modo) => {
    if (!['facil', 'medio', 'dificil'].includes(modo)) return
    set(state => ({ storyProgress: { ...state.storyProgress, __dificuldade: modo } }))
    get()._persistStory()
  },

  // ── Modo Batalha: a Torre (grind de AP pra L→99) ──
  // `torre` = a subida ATIVA (só em memória — some ao sair). O recorde de andar
  // por território fica em storyProgress.__torre (mesmo padrão de __flags).
  torre: null,
  torreIniciar: ({ territorioId, folga }) => set({ torre: { territorioId, folga, andar: 1 } }),
  torreAvancar: () => set(state => ({ torre: state.torre ? { ...state.torre, andar: state.torre.andar + 1 } : null })),
  torreEncerrar: () => {
    const t = get().torre
    if (t) {
      const rec = get().storyProgress.__torre || {}
      if ((rec[t.territorioId] || 0) < t.andar) {
        set(state => ({ storyProgress: { ...state.storyProgress, __torre: { ...rec, [t.territorioId]: t.andar } } }))
        get()._persistStory()
      }
    }
    set({ torre: null })
  },

  resetStory: () => {
    set({ storyProgress: {}, storyTarget: null, torre: null, grana: 0, rep: 0, cenaProgresso: {}, inventario: {}, equipamentos: [] })
    get()._persistStory()
  },

  // ── Modo história: a CENA (bairro navegável) ──
  // Economia leve + progresso por cena.
  // cenaProgresso: { [cenaId]: { resolvidos, revelados, boss, posicao:{x,y} } }
  grana: 0,
  rep: 0,
  campaignClears: 0,
  eventCharacterIds: [],
  cenaProgresso: {},
  // Inventário de item — { [itemId]: quantidade }, compartilhado pela gangue
  // inteira (comprado com a grana de todos), não por personagem. Ver
  // data/ganguesItens.js pro catálogo.
  inventario: {},

  // Inventário de EQUIPAMENTO — lista de instâncias { uid, itemId, cards },
  // compartilhada pela gangue (comprado/dropado com a grana de todos). Uma
  // instância sai daqui quando é equipada num personagem
  // (sheet.attributes.equipment[slot]) e volta pra cá ao ser desequipada,
  // com as cartas que tiver. Ver data/ganguesEquip.js.
  equipamentos: [],

  completeCampaign: () => {
    set(state => ({ campaignClears: state.campaignClears + 1 }))
    get()._persistStory()
  },

  // Escreve no Supabase com debounce — várias ações do modo história disparam
  // essa persistência em sequência (marcar POI + grana + rep) e não
  // faz sentido um upsert por campo. Guest e quem ainda não abriu um save
  // (sem `_saveId`) não salva nada, igual à ficha: o banner já avisa que o
  // progresso não fica.
  _persistStory: () => {
    const saveId = get()._saveId
    if (!saveId) return
    clearTimeout(storySaveTimer)
    storySaveTimer = setTimeout(() => {
      const { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds, inventario, equipamentos } = get()
      salvarProgressoHistoria(saveId, { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds, inventario, equipamentos })
    }, 800)
  },

  _persistCena: () => get()._persistStory(),

  _cena: (cenaId) => get().cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false },

  ganharGrana: (n) => { set(state => ({ grana: Math.max(0, state.grana + (n || 0)) })); get()._persistCena() },
  ganharRep: (n) => { set(state => ({ rep: Math.max(0, state.rep + (n || 0)) })); get()._persistCena() },
  gastarGrana: (n) => {
    if (get().grana < n) return false
    set(state => ({ grana: state.grana - n }))
    get()._persistCena()
    return true
  },

  // Compra 1 unidade de um item da loja (ver data/ganguesItens.js) — cobra a
  // grana e só adiciona ao inventário se o pagamento passar.
  comprarItem: (itemId, custo) => {
    if (!get().gastarGrana(custo)) return false
    set(state => ({ inventario: { ...state.inventario, [itemId]: (state.inventario[itemId] || 0) + 1 } }))
    get().registrarItemVisto([itemId])
    get()._persistCena()
    return true
  },

  // Consome 1 unidade do item do inventário (usado em combate) — devolve
  // false se não tinha nenhum sobrando, pra quem chamar não aplicar o
  // efeito à toa.
  usarItem: (itemId) => {
    const atual = get().inventario[itemId] || 0
    if (atual <= 0) return false
    set(state => ({ inventario: { ...state.inventario, [itemId]: atual - 1 } }))
    get()._persistCena()
    return true
  },

  // ── Equipamento ──
  // Compra 1 instância de equipamento da loja — cobra a grana e só cria a
  // instância (com sockets vazios) se o pagamento passar.
  comprarEquip: (itemId, custo) => {
    const instancia = createGanguesEquipInstance(itemId)
    if (!instancia || !get().gastarGrana(custo)) return false
    set(state => ({ equipamentos: [...state.equipamentos, instancia] }))
    get().registrarItemVisto([itemId])
    get()._persistCena()
    return instancia.uid
  },

  // Compra + equipa numa ação só (fluxo da loja — a decisão de comprar já é a
  // decisão de equipar). Se o slot do personagem já tinha peça, ela volta pro
  // inventário da gangue com as cartas. Devolve false se não deu pra pagar.
  comprarEEquipar: (itemId, custo, memberId) => {
    const uid = get().comprarEquip(itemId, custo)
    if (!uid) return false
    return get().equiparItem(memberId, uid)
  },

  // Equipa a instância `uid` no `slot` do personagem `memberId`. Se o slot já
  // tinha um item, ele volta pro inventário (com as cartas). A instância
  // equipada some do inventário e passa a viver em sheet.attributes.equipment.
  equiparItem: (memberId, uid) => {
    const instancia = get().equipamentos.find(eq => eq.uid === uid)
    const def = instancia && getGanguesEquip(instancia.itemId)
    if (!def) return false
    const slot = def.slot
    let devolvidoAoInventario = null

    const aplicar = member => {
      if (member.id !== memberId) return member
      const equipment = normalizeGanguesEquipment(member.attributes?.equipment)
      const anterior = equipment[slot]
      if (anterior) devolvidoAoInventario = { uid: `eq-${anterior.itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: anterior.itemId, cards: anterior.cards }
      equipment[slot] = { itemId: def.id, cards: instancia.cards }
      return { ...member, attributes: { ...member.attributes, equipment } }
    }

    set(state => {
      const roster = state.roster.map(aplicar)
      const byId = new Map(roster.map(m => [m.id, m]))
      const equipamentos = state.equipamentos.filter(eq => eq.uid !== uid)
      if (devolvidoAoInventario) equipamentos.push(devolvidoAoInventario)
      return {
        roster,
        activeParty: state.activeParty.map(m => byId.get(m.id) || m),
        sheet: byId.get(state.sheet.id) || state.sheet,
        equipamentos,
      }
    })
    get().saveParticipantProgress([memberId])
    get()._persistCena()
    return true
  },

  // Tira o item do `slot` do personagem e devolve ao inventário (com cartas).
  desequiparItem: (memberId, slot) => {
    let devolvido = null
    const aplicar = member => {
      if (member.id !== memberId) return member
      const equipment = normalizeGanguesEquipment(member.attributes?.equipment)
      const atual = equipment[slot]
      if (!atual) return member
      devolvido = { uid: `eq-${atual.itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: atual.itemId, cards: atual.cards }
      equipment[slot] = null
      return { ...member, attributes: { ...member.attributes, equipment } }
    }
    set(state => {
      const roster = state.roster.map(aplicar)
      const byId = new Map(roster.map(m => [m.id, m]))
      return {
        roster,
        activeParty: state.activeParty.map(m => byId.get(m.id) || m),
        sheet: byId.get(state.sheet.id) || state.sheet,
        equipamentos: devolvido ? [...state.equipamentos, devolvido] : state.equipamentos,
      }
    })
    if (devolvido) { get().saveParticipantProgress([memberId]); get()._persistCena() }
    return Boolean(devolvido)
  },

  // Equipa/desequipa um dos até-2 poderes ativos levados pra batalha (pedido
  // do Isaias: a única tela que existia pra isso, GanguesProgression, era
  // 100% leitura — nem no lobby dava pra trocar). Usável de qualquer lugar
  // que tenha o member (lobby E a ficha da cena/combate).
  toggleEspecial: (memberId, specialId) => {
    let mudou = false
    const aplicar = member => {
      if (member.id !== memberId) return member
      const change = toggleGanguesTemplateSpecial(member, specialId)
      if (!change) return member
      mudou = true
      return { ...member, ...change }
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
    if (mudou) { get().saveParticipantProgress([memberId]); get()._persistCena() }
    return mudou
  },

  // Trava o "retrato" de pontos de uma treta repetível na primeira vez que o
  // jogador entra nela — as próximas vezes usam sempre esse mesmo número em
  // vez de recalcular contra o time atual, senão o bando cresceria junto com
  // a gangue e nunca ficaria fácil de farmar de propósito (ver
  // `gerarBandoInimigo` em data/ganguesEncontros.js). Devolve o retrato
  // efetivo (o que já existia, se já tinha sido travado, ou o novo).
  travarPontosFarm: (cenaId, poiId, pontos) => {
    const atual = get().cenaProgresso[cenaId]
    const jaTravado = atual?.pontosFarm?.[poiId]
    if (jaTravado) return jaTravado
    set(state => {
      const base = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...base, pontosFarm: { ...(base.pontosFarm || {}), [poiId]: pontos } } } }
    })
    get()._persistCena()
    return pontos
  },

  revelarPoi: (cenaId, ...poiIds) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
      const revelados = { ...atual.revelados }
      poiIds.flat().forEach(id => { if (id) revelados[id] = true })
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, revelados } } }
    })
    get()._persistCena()
  },

  marcarPoiResolvido: (cenaId, poiId, revela = []) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
      const revelados = { ...atual.revelados }
      ;[].concat(revela).forEach(id => { if (id) revelados[id] = true })
      return {
        cenaProgresso: {
          ...state.cenaProgresso,
          [cenaId]: { ...atual, resolvidos: { ...atual.resolvidos, [poiId]: true }, revelados },
        },
      }
    })
    get()._persistCena()
  },

  marcarBossCena: (cenaId) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, boss: true } } }
    })
    get()._persistCena()
  },

  // Descanso na birosca — cobra a grana, restaura o PV/PM de TODA a tropa pro
  // máximo e devolve o quanto cada um recuperou (pra a tela mostrar o detalhe).
  // Se ninguém estava ferido, não cobra nada e devolve motivo: 'inteira'.
  descansarTropa: (custo = 0) => {
    const detalhe = get().roster.map(m => {
      const norm = normalizeGanguesLoadout(m)
      const attrs = getGanguesAttributesWithEquip(norm.attributes)
      const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.R), norm.attributes?.equipment)
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
    const res = applyGanguesEquipResources(getGanguesResources(norm.combat_path, attrs?.R), norm.attributes?.equipment)
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

  // posicao: { x, y, local? } — `local` guarda em qual prédio/cômodo o jogador
  // estava (null = rua), pra reentrar na cena exatamente onde parou, mesmo
  // dentro do galpão.
  salvarPosicaoCena: (cenaId, posicao) => {
    if (!cenaId || !Number.isFinite(posicao?.x) || !Number.isFinite(posicao?.y)) return
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, posicao: { x: Math.round(posicao.x), y: Math.round(posicao.y), local: posicao.local || null } } } }
    })
    get()._persistCena()
  },

  // Dominar o território a partir da cena: marca todos os pontos + o chefe,
  // pra estadoTerritorio() reconhecer 'dominado' e a próxima região abrir.
  dominarTerritorioViaCena: (territorioId, pontoIds = []) => {
    set(state => {
      const atual = state.storyProgress[territorioId] || { pontos: [], chefe: false }
      const pontos = Array.from(new Set([...(atual.pontos || []), ...pontoIds]))
      return { storyProgress: { ...state.storyProgress, [territorioId]: { pontos, chefe: true } } }
    })
    get()._persistStory()
  },

  reset: () => set({ sheet: defaultSheet(), roster: [], activeParty: [], match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null } }),

  resetCena: () => {
    set({ grana: 0, rep: 0, cenaProgresso: {}, inventario: {}, equipamentos: [] })
    get()._persistStory()
  },
}))

// Gancho de debug — só em dev (npm run dev). Deixa um teste headless (Playwright)
// montar gangue/time/alvo direto no store, sem clicar a UI inteira.
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__ganguesStore = useGanguesStore
}
