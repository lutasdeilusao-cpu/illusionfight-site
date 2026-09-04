import { supabase } from '../../../../lib/supabase'

/** Carrega o progresso do modo história (gangue) do usuário logado. */
export async function carregarProgressoHistoria(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('gangues_story_progress')
    .select('gang_name, story_progress, cena_progresso, grana, rep')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return {
    gangName: data.gang_name || '',
    storyProgress: data.story_progress || {},
    cenaProgresso: data.cena_progresso || {},
    grana: data.grana || 0,
    rep: data.rep || 0,
  }
}

/** Salva (upsert) o progresso do modo história do usuário logado. */
export async function salvarProgressoHistoria(userId, progresso) {
  if (!userId) return false
  const { gangName, storyProgress, cenaProgresso, grana, rep } = progresso
  const { error } = await supabase
    .from('gangues_story_progress')
    .upsert({
      user_id: userId,
      gang_name: gangName || '',
      story_progress: storyProgress || {},
      cena_progresso: cenaProgresso || {},
      grana: grana || 0,
      rep: rep || 0,
      atualizada_em: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  return !error
}
