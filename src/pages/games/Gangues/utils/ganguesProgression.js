export function getGanguesProgression(xpTotal = 0) {
  const xp = Math.max(0, Number(xpTotal) || 0)
  let completedLevels = 0
  let levelStartXp = 0

  while (true) {
    const levelCost = 10 + completedLevels * 2
    if (levelStartXp + levelCost > xp) break
    levelStartXp += levelCost
    completedLevels += 1
  }

  const xpNeeded = 10 + completedLevels * 2
  const xpInLevel = xp - levelStartXp

  return {
    level: completedLevels + 1,
    completedLevels,
    xpInLevel,
    xpNeeded,
    xpRemaining: xpNeeded - xpInLevel,
    progress: xpInLevel / xpNeeded,
  }
}
