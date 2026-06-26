export function setFlag(flags, key) {
  return { ...flags, [key]: true }
}

export function hasFlag(flags, key) {
  return !!flags[key]
}

export function requiresFlag(flags, required) {
  if (!required || required.length === 0) return true
  return required.every(key => !!flags[key])
}
