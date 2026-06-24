// Attack animation — Standard
// Placeholder: visual implementation pending
export function execute({
  charId, atacante, alvo, resultado,
  setAnimTimer, onFinalize,
}) {
  console.log('[ATTACK_ANIM] Standard execute', { charId })
  if (onFinalize) setAnimTimer(onFinalize, 300)
}
