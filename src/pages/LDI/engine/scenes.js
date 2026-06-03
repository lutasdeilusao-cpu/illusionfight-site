let scenesCache = {}
let allScenes = []

export async function loadScene(sceneId) {
  console.log('[LDI] loadScene chamado, sceneId:', sceneId, 'cache hit:', !!scenesCache[sceneId])
  if (!sceneId) {
    console.error('[LDI] loadScene chamado sem sceneId')
    return allScenes.find(s => s.id === '1.2') || null
  }

  if (scenesCache[sceneId]) return scenesCache[sceneId]

  try {
    if (allScenes.length === 0) {
      const { default: act1 } = await import('../data/scenes/act1.json')
      allScenes = [...act1]
    }
    const scene = allScenes.find(s => s.id === sceneId)
    if (scene) {
      scenesCache[sceneId] = scene
      return scene
    }
    console.error(`[LDI] Cena não encontrada: "${sceneId}" — redirecionando para fallback 1.2`)
    const fallback = allScenes.find(s => s.id === '1.2')
    if (fallback) scenesCache['1.2'] = fallback
    return fallback || null
  } catch (err) {
    console.error('[LDI] Erro ao carregar cenas:', err)
    return null
  }
}

export function getSceneFromCache(sceneId) {
  return scenesCache[sceneId] || null
}

export function filterChoices(choices, sheet, flags, credits) {
  const attr = sheet?.attributes || { F: 0, H: 0, R: 0, A: 0, PdF: 0 }
  return choices.map(choice => {
    let available = true
    let reason = null

    if (choice.requires) {
      const [attrName, minVal] = Object.entries(choice.requires)[0]
      if ((attr[attrName] || 0) < minVal) {
        available = false
        const names = { F: 'Potência', H: 'Agilidade', R: 'Resistência', A: 'Proteção', PdF: 'Poder Elemental' }
        reason = `Requer ${names[attrName] || attrName} ${minVal} — você tem ${attr[attrName] || 0}`
      }
    }

    if (choice.cost && credits < choice.cost) {
      available = false
      reason = `Requer ${choice.cost} créditos — você tem ${credits}`
    }

    if (choice.flags_required && choice.flags_required.length > 0) {
      const missing = choice.flags_required.filter(f => !flags[f])
      if (missing.length > 0) {
        available = false
        reason = `Requer evento: ${missing.join(', ')}`
      }
    }

    return { ...choice, available, reason }
  })
}
