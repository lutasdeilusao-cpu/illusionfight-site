export function calcMaxPV(R) {
  return Math.max(1, R * 5)
}

export function calcMaxPM(PdF) {
  return Math.max(2, PdF * 4)
}

export function applyXP(sheet, amount) {
  return { ...sheet, xp_total: (sheet.xp_total || 0) + amount }
}

export function checkNearDeath(sheet, pvCurrent) {
  return pvCurrent <= sheet.attributes.R
}
