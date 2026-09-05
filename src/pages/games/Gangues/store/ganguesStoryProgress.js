import { supabase } from '../../../../lib/supabase'

const GANGUES_SAVE_VERSION = 2

/** Carrega o progresso do modo história (gangue) do usuário logado. */
export async function carregarProgressoHistoria(userId) {
  if (!userId) return null
  let { data, error } = await supabase
    .from('gangues_story_progress')
    .select('gang_name, story_progress, cena_progresso, grana, rep, campaign_clears, event_character_ids, save_version')
    .eq('user_id', userId)
    .maybeSingle()
  if (error && /(campaign_clears|event_character_ids)/i.test(error.message || '')) {
    const legacy = await supabase.from('gangues_story_progress').select('gang_name, story_progress, cena_progresso, grana, rep').eq('user_id', userId).maybeSingle()
    data = legacy.data
    error = legacy.error
  }
  if (error || !data) return null
  if (data.save_version !== GANGUES_SAVE_VERSION) {
    await supabase.from('gangues_story_progress').delete().eq('user_id', userId)
    return {
      gangName: '', storyProgress: {}, cenaProgresso: {}, grana: 0, rep: 0,
      campaignClears: 0, eventCharacterIds: [],
    }
  }
  return {
    gangName: data.gang_name || '',
    storyProgress: data.story_progress || {},
    cenaProgresso: data.cena_progresso || {},
    grana: data.grana || 0,
    rep: data.rep || 0,
    campaignClears: data.campaign_clears || data.story_progress?.__meta?.campaign_clears || 0,
    eventCharacterIds: data.event_character_ids || data.story_progress?.__meta?.event_character_ids || [],
  }
}

/** Salva (upsert) o progresso do modo história do usuário logado. */
export async function salvarProgressoHistoria(userId, progresso) {
  if (!userId) return false
  const { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds } = progresso
  const persistedStoryProgress = {
    ...(storyProgress || {}),
    __meta: { campaign_clears: campaignClears || 0, event_character_ids: eventCharacterIds || [] },
  }
  let { error } = await supabase
    .from('gangues_story_progress')
    .upsert({
      user_id: userId,
      gang_name: gangName || '',
      story_progress: persistedStoryProgress,
      cena_progresso: cenaProgresso || {},
      grana: grana || 0,
      rep: rep || 0,
      campaign_clears: campaignClears || 0,
      event_character_ids: eventCharacterIds || [],
      save_version: GANGUES_SAVE_VERSION,
      atualizada_em: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  if (error && /(campaign_clears|event_character_ids)/i.test(error.message || '')) {
    const legacy = await supabase.from('gangues_story_progress').upsert({
      user_id: userId,
      gang_name: gangName || '',
      story_progress: persistedStoryProgress,
      cena_progresso: cenaProgresso || {},
      grana: grana || 0,
      rep: rep || 0,
      atualizada_em: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    error = legacy.error
  }
  return !error
}
