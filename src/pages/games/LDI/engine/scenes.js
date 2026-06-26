let scenesCache = {}
let allScenes = []
let currentLocale = 'pt'

export function setScenesLocale(locale) {
  currentLocale = locale
  scenesCache = {}
  allScenes = []
}

export async function loadScene(sceneId, locale) {
  const lang = locale || currentLocale
  console.log('[LDI] loadScene chamado, sceneId:', sceneId, 'locale:', lang, 'cache hit:', !!scenesCache[sceneId])
  if (!sceneId) {
    console.error('[LDI] loadScene chamado sem sceneId')
    return allScenes.find(s => s.id === '1.2') || null
  }

  if (scenesCache[sceneId]) return scenesCache[sceneId]

  try {
    if (allScenes.length === 0) {
      const { default: act1 } = await import(`../data/scenes/${lang}/act1.json`)
      allScenes = [...act1]
      try {
        const { default: act2 } = await import(`../data/scenes/${lang}/act2.json`)
        allScenes = [...allScenes, ...act2]
      } catch (_) {}
      try {
        const { default: act3 } = await import(`../data/scenes/${lang}/act3.json`)
        allScenes = [...allScenes, ...act3]
      } catch (_) {}
      try {
        const { default: act4 } = await import(`../data/scenes/${lang}/act4.json`)
        allScenes = [...allScenes, ...act4]
      } catch (_) {}
    }
    const scene = allScenes.find(s => s.id === sceneId)
    if (scene) {
      scenesCache[sceneId] = scene
      return scene
    }
    console.error(`[LDI] Scene not found: "${sceneId}" — redirecting to fallback 1.2`)
    const fallback = allScenes.find(s => s.id === '1.2')
    if (fallback) scenesCache['1.2'] = fallback
    return fallback || null
  } catch (err) {
    console.error('[LDI] Error loading scenes:', err)
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
        const names = { F: 'Power', H: 'Agility', R: 'Resistance', A: 'Protection', PdF: 'Elemental Power' }
        reason = `Requires ${names[attrName] || attrName} ${minVal} — you have ${attr[attrName] || 0}`
      }
    }

    if (choice.cost && credits < choice.cost) {
      available = false
      reason = `Requires ${choice.cost} credits — you have ${credits}`
    }

    if (choice.flags_required && choice.flags_required.length > 0) {
      const missing = choice.flags_required.filter(f => !flags[f])
      if (missing.length > 0) {
        available = false
        reason = `Requires event: ${missing.join(', ')}`
      }
    }

    return { ...choice, available, reason }
  })
}
