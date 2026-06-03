import { supabase } from '../../../lib/supabase'

export async function saveSheet(userId, sheet) {
  const sheetId = sheet.id || crypto.randomUUID()
  const payload = {
    id: sheetId,
    user_id: userId,
    sheet_name: sheet.sheet_name || 'Aventureiro',
    attributes: sheet.attributes,
    advantages: sheet.advantages || [],
    disadvantages: sheet.disadvantages || [],
    perks: sheet.perks || [],
    specializations: sheet.specializations || [],
    special_skills: sheet.special_skills || [],
    weapon: sheet.weapon || '',
    elemental: sheet.elemental || '',
    xp_total: sheet.xp_total || 0,
  }

  const { data, error } = await supabase
    .from('character_sheets')
    .upsert(payload, { onConflict: 'id', ignoreDuplicates: false })
    .select('id')

  if (error) {
    console.error('[LDI] Erro ao salvar ficha:', error)
    return null
  }
  return data[0]?.id || sheetId
}

export async function saveGameSave(userId, save) {
  if (!save.sheet_id) {
    console.error('[LDI] sheet_id ausente ao salvar game_save')
    return null
  }
  const saveId = save.id || undefined
  const payload = {
    ...(saveId ? { id: saveId } : {}),
    user_id: userId,
    sheet_id: save.sheet_id,
    arc: save.arc || 1,
    current_scene_id: save.current_scene_id || '1.1',
    day_in_game: save.day_in_game || 1,
    credits: save.credits || 0,
    pv_current: save.pv_current || 1,
    pm_current: save.pm_current || 1,
    clues_collected: save.clues_collected || [],
    flags: save.flags || {},
    inventory: save.inventory || [],
    status: save.status || 'active',
  }

  const { data, error } = await supabase
    .from('game_saves')
    .upsert(payload, { onConflict: 'id', ignoreDuplicates: false })
    .select('id')

  if (error) {
    console.error('[LDI] Erro ao salvar save:', error)
    return null
  }
  return data[0]?.id || saveId
}

export async function loadSheets(userId) {
  const { data, error } = await supabase
    .from('character_sheets')
    .select('id, sheet_name, attributes, weapon, elemental, xp_total, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[LDI] Erro ao carregar fichas:', error)
    return []
  }
  return data || []
}

export async function loadFullSheet(sheetId) {
  const { data, error } = await supabase
    .from('character_sheets')
    .select('*')
    .eq('id', sheetId)
    .single()

  if (error) {
    console.error('[LDI] Erro ao carregar ficha completa:', error)
    return null
  }
  return data
}

export async function loadActiveSave(sheetId) {
  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('sheet_id', sheetId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[LDI] Erro ao carregar save ativo:', error)
    return null
  }
  return data?.[0] || null
}

export async function deleteSheet(sheetId) {
  const { error } = await supabase
    .from('character_sheets')
    .delete()
    .eq('id', sheetId)

  if (error) console.error('[LDI] Erro ao deletar ficha:', error)
}
