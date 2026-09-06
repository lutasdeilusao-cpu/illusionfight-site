import { supabase } from '../../../../lib/supabase'

/** Lista os saves (gangues) do usuário logado, mais antigo primeiro (Save 1, Save 2...). */
export async function listarSaves(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('gangues_story_progress')
    .select('id, gang_name, story_progress, rep, criada_em, atualizada_em')
    .eq('user_id', userId)
    .order('criada_em', { ascending: true })
  if (error) { console.error('[GANGUES] Falha ao listar saves:', error.message); return [] }
  return data || []
}

/** Cria um novo save (gangue) vazio pro usuário logado. Retorna o id criado. */
export async function criarSave(userId) {
  if (!userId) return null
  const { data, error } = await supabase.from('gangues_story_progress').insert({ user_id: userId }).select('id').single()
  if (error) { console.error('[GANGUES] Falha ao criar save:', error.message); return null }
  return data.id
}

/** Apaga um save inteiro — o elenco vinculado (character_sheets.save_id) cai junto via CASCADE. */
export async function excluirSave(saveId) {
  if (!saveId) return false
  const { error } = await supabase.from('gangues_story_progress').delete().eq('id', saveId)
  if (error) { console.error('[GANGUES] Falha ao excluir save:', error.message); return false }
  return true
}

/** Carrega o progresso do modo história de UM save específico. */
export async function carregarProgressoHistoria(saveId) {
  if (!saveId) return null
  const { data, error } = await supabase
    .from('gangues_story_progress')
    .select('gang_name, story_progress, cena_progresso, grana, rep, campaign_clears, event_character_ids')
    .eq('id', saveId)
    .maybeSingle()
  if (error || !data) return null
  return {
    gangName: data.gang_name || '',
    storyProgress: data.story_progress || {},
    cenaProgresso: data.cena_progresso || {},
    grana: data.grana || 0,
    rep: data.rep || 0,
    campaignClears: data.campaign_clears || 0,
    eventCharacterIds: data.event_character_ids || [],
  }
}

/** Salva (update) o progresso do save aberto no momento. */
export async function salvarProgressoHistoria(saveId, progresso) {
  if (!saveId) return false
  const { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds } = progresso
  const { error } = await supabase
    .from('gangues_story_progress')
    .update({
      gang_name: gangName || '',
      story_progress: storyProgress || {},
      cena_progresso: cenaProgresso || {},
      grana: grana || 0,
      rep: rep || 0,
      campaign_clears: campaignClears || 0,
      event_character_ids: eventCharacterIds || [],
      atualizada_em: new Date().toISOString(),
    })
    .eq('id', saveId)
  if (error) { console.error('[GANGUES] Falha ao salvar progresso:', error.message); return false }
  return true
}
