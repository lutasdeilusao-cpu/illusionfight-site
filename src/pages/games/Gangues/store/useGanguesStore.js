import { create } from 'zustand'
import { supabase } from '../../../../lib/supabase'
import { addGanguesAp, defaultGanguesProgression, getGanguesRosterLimit, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'
import { carregarProgressoHistoria, salvarProgressoHistoria, listarSaves, criarSave, excluirSave } from './ganguesStoryProgress.js'
import { createGanguesTemplateSheet, hydrateGanguesTemplateSheet } from '../data/ganguesCharacters.js'

// Debounce dos writes de progresso do modo história: várias ações batem em sequência
// (marcar POI + fôlego + grana + rep) e não faz sentido um upsert por campo.
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
  enemies_unlocked: ['treinamento'],
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
    set({ _saveId: saveId, roster: [], activeParty: [], gangName: '', storyProgress: {}, cenaProgresso: {}, grana: 0, rep: 0 })
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

  recruitTemplate: async (characterTemplateId, userId) => {
    const templateSheet = createGanguesTemplateSheet(characterTemplateId)
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
  // ver GanguesVictory.jsx), não mais dividido em partes iguais. O peso
  // mínimo de 1 (já aplicado em GanguesVictory.jsx) garante que ninguém
  // fica de fora da divisão do MESMO pote — mas o pote continua sendo só
  // o AP da luta (10 por inimigo), nunca AP extra inventado do nada. Uma
  // luta contra 1 inimigo só dá 10 AP no total: raramente vai fechar 1 XP
  // inteiro pra alguém (custa 10 AP no nível 1) e ISSO é o esperado — subir
  // de nível numa primeira luta contra um alvo fraco não devia acontecer.
  gainApForParticipants: (totalAp, pesosPorId = {}) => {
    const ids = Object.keys(pesosPorId)
    const somaPesos = ids.reduce((s, id) => s + (Number(pesosPorId[id]) || 0), 0) || 1
    const apTotalInteiro = Math.round(Math.max(0, Number(totalAp) || 0))
    // Fatia EXATA (fracionária) de cada um — usada de verdade pra converter
    // em XP (addGanguesAp). O que aparece pro jogador (apPorMembro) usa
    // "maior resto" pra arredondar SEM estourar o total: arredondar cada
    // fatia sozinha (ex: 50/3 = 16.67 vira 17 pra todo mundo, 17×3=51) podia
    // fazer a soma exibida passar do total real da luta.
    const sharesExatas = {}
    ids.forEach(id => { sharesExatas[id] = (Number(pesosPorId[id]) || 0) / somaPesos * Math.max(0, Number(totalAp) || 0) })
    const apPorMembro = {}
    let somaPisos = 0
    ids.forEach(id => { const piso = Math.floor(sharesExatas[id]); apPorMembro[id] = piso; somaPisos += piso })
    const sobra = apTotalInteiro - somaPisos
    const ordemPorResto = [...ids].sort((a, b) => (sharesExatas[b] - Math.floor(sharesExatas[b])) - (sharesExatas[a] - Math.floor(sharesExatas[a])))
    for (let i = 0; i < sobra && ordemPorResto.length; i++) apPorMembro[ordemPorResto[i % ordemPorResto.length]] += 1

    const levelUps = []
    let totalXp = 0
    set(state => {
      const advance = member => {
        if (!(member.id in pesosPorId)) return member
        const resultado = addGanguesAp(member, sharesExatas[member.id])
        totalXp += resultado.earnedXp
        const next = { ...member, xp_total: (member.xp_total || 0) + resultado.earnedXp, attributes: { ...member.attributes, progression: resultado.progression } }
        const hydrated = member.character_type === 'template' ? hydrateGanguesTemplateSheet(next) : next
        if (member.character_type === 'template' && hydrated.level > (member.level || 1)) {
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

  saveParticipantProgress: async (participantIds = []) => {
    const uid = get()._userId
    if (!uid) return
    const ids = new Set(participantIds)
    await Promise.all(get().roster.filter(member => ids.has(member.id) && !String(member.id).startsWith('local-')).map(member =>
      supabase.from('character_sheets').update({ attributes: member.attributes, xp_total: member.xp_total }).eq('id', member.id).eq('user_id', uid)
    ))
  },

  saveToCloud: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return null
    const s = get().sheet
    const payload = { user_id: uid, save_id: get()._saveId, sheet_name: s.sheet_name, attributes: s.attributes, elemental: s.elemental, combat_path: s.combat_path, loadout_version: s.loadout_version, xp_total: s.xp_total, enemies_unlocked: s.enemies_unlocked, character_type: s.character_type || 'legacy', character_template_id: s.character_template_id || null }
    const request = s.id
      ? supabase.from('character_sheets').update(payload).eq('id', s.id).select('id').maybeSingle()
      : supabase.from('character_sheets').insert(payload).select('id').maybeSingle()
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
    const { data, error } = await supabase.from('character_sheets').select('id, sheet_name, attributes, elemental, combat_path, loadout_version, xp_total, enemies_unlocked, character_type, character_template_id').eq('save_id', saveId).eq('character_type', 'template').order('created_at', { ascending: false })
    if (error) console.error('[GANGUES] Falha ao carregar fichas:', error.message)
    const roster = Array.isArray(data) ? data.map(item => {
      const templateId = item.character_template_id || item.attributes?.character_template_id
      return templateId ? hydrateGanguesTemplateSheet({ ...item, character_type: 'template', character_template_id: Number(templateId) }) : ({ ...item, ...normalizeGanguesLoadout(item) })
    }) : []
    set({ roster })
    return roster
  },

  deleteSheet: async (sheetId) => {
    if (!sheetId) return false
    if (get()._userId && !String(sheetId).startsWith('local-')) {
      const { error } = await supabase.from('character_sheets').delete().eq('id', sheetId)
      if (error) { console.error('[GANGUES] Falha ao excluir ficha:', error.message); return false }
    }
    set(state => ({
      roster: state.roster.filter(item => item.id !== sheetId),
      activeParty: state.activeParty.filter(item => item.id !== sheetId),
      sheet: state.sheet.id === sheetId ? defaultSheet() : state.sheet,
    }))
    return true
  },

  unlockNextEnemy: (defeatedEnemyId) => set(state => {
    const ENEMY_ORDER = ['treinamento', 'kaeda', 'thunderbolt', 'stormbyte', 'viran', 'campeao', 'kronos', 'primordial_jack']
    const current = state.sheet.enemies_unlocked || ['treinamento']
    const idx = ENEMY_ORDER.indexOf(defeatedEnemyId)
    if (idx === -1 || idx >= ENEMY_ORDER.length - 1) return state
    const nextId = ENEMY_ORDER[idx + 1]
    if (current.includes(nextId)) return state
    return { sheet: { ...state.sheet, enemies_unlocked: [...current, nextId] } }
  }),

  // ── Nome da gangue ──
  // É o que reverbera na história (falas dos inimigos, % de domínio, fim).
  gangName: '',
  setGangName: (nome) => {
    const limpo = String(nome || '').replace(/\s+/g, ' ').trim().slice(0, 28)
    set({ gangName: limpo })
    get()._persistStory()
  },

  // ── Modo história ──
  // Progresso salvo em Supabase (tabela `gangues_story_progress`, uma linha por
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

  resetStory: () => {
    set({ storyProgress: {}, storyTarget: null, grana: 0, rep: 0, cenaProgresso: {} })
    get()._persistStory()
  },

  // ── Modo história: a CENA (bairro navegável) ──
  // Economia leve + progresso por cena.
  // cenaProgresso: { [cenaId]: { resolvidos, revelados, boss, folego, posicao:{x,y} } }
  grana: 0,
  rep: 0,
  campaignClears: 0,
  eventCharacterIds: [],
  cenaProgresso: {},

  completeCampaign: () => {
    set(state => ({ campaignClears: state.campaignClears + 1 }))
    get()._persistStory()
  },

  // Escreve no Supabase com debounce — várias ações do modo história disparam
  // essa persistência em sequência (marcar POI + fôlego + grana + rep) e não
  // faz sentido um upsert por campo. Guest e quem ainda não abriu um save
  // (sem `_saveId`) não salva nada, igual à ficha: o banner já avisa que o
  // progresso não fica.
  _persistStory: () => {
    const saveId = get()._saveId
    if (!saveId) return
    clearTimeout(storySaveTimer)
    storySaveTimer = setTimeout(() => {
      const { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds } = get()
      salvarProgressoHistoria(saveId, { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds })
    }, 800)
  },

  _persistCena: () => get()._persistStory(),

  _cena: (cenaId) => get().cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 },

  ganharGrana: (n) => { set(state => ({ grana: Math.max(0, state.grana + (n || 0)) })); get()._persistCena() },
  ganharRep: (n) => { set(state => ({ rep: Math.max(0, state.rep + (n || 0)) })); get()._persistCena() },
  gastarGrana: (n) => {
    if (get().grana < n) return false
    set(state => ({ grana: state.grana - n }))
    get()._persistCena()
    return true
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
      const base = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...base, pontosFarm: { ...(base.pontosFarm || {}), [poiId]: pontos } } } }
    })
    get()._persistCena()
    return pontos
  },

  revelarPoi: (cenaId, ...poiIds) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      const revelados = { ...atual.revelados }
      poiIds.flat().forEach(id => { if (id) revelados[id] = true })
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, revelados } } }
    })
    get()._persistCena()
  },

  marcarPoiResolvido: (cenaId, poiId, revela = []) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
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
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, boss: true } } }
    })
    get()._persistCena()
  },

  // Fôlego da gangue: cai nas tretas/paradas falhadas, cura na birosca,
  // volta ao cheio ao dominar / sair do bairro.
  ajustarFolego: (cenaId, delta) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      const folego = Math.max(0, Math.min(100, (atual.folego ?? 100) + delta))
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, folego } } }
    })
    get()._persistCena()
  },

  restaurarFolego: (cenaId) => get().ajustarFolego(cenaId, 100),

  salvarPosicaoCena: (cenaId, posicao) => {
    if (!cenaId || !Number.isFinite(posicao?.x) || !Number.isFinite(posicao?.y)) return
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, posicao: { x: Math.round(posicao.x), y: Math.round(posicao.y) } } } }
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
    set({ grana: 0, rep: 0, cenaProgresso: {} })
    get()._persistStory()
  },
}))
