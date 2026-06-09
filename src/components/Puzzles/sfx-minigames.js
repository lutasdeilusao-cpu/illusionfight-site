/**
 * SFX — Sound Effects para Minigames
 *
 * Sons sintéticos via Web Audio API.
 * Nenhum arquivo externo necessário.
 * AudioContext é inicializado lazy na primeira interação do usuário.
 */

const getCtx = (() => {
  let ctx = null
  return () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }
})()

const tom = (freq, dur, tipo = 'sine', vol = 0.3, delay = 0) => {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = tipo
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime + delay)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur)
  } catch (_) {
    // AudioContext pode não estar disponível — ignora silenciosamente
  }
}

export { tom }

export const sfxMinigames = {
  // ── Gerais ──────────────────────────────────────
  clique:    () => tom(440, 0.08),
  sucesso:   () => { tom(523, 0.1); tom(659, 0.1, 'sine', 0.3, 0.12); tom(784, 0.2, 'sine', 0.3, 0.24) },
  erro:      () => tom(180, 0.3, 'sawtooth', 0.4),
  vitoria:   () => { [523,659,784,1047].forEach((f,i) => tom(f, 0.15, 'sine', 0.3, i*0.1)) },
  movimento: () => tom(330, 0.06, 'triangle', 0.2),
  slide:     () => tom(280, 0.08, 'triangle', 0.15),
  revelar:   () => tom(660, 0.1, 'sine', 0.25),

  // ── Simon Says — cada cor tem frequência única ──
  simon: {
    vermelho: () => tom(261, 0.4, 'sine', 0.5),
    azul:     () => tom(329, 0.4, 'sine', 0.5),
    verde:    () => tom(392, 0.4, 'sine', 0.5),
    amarelo:  () => tom(523, 0.4, 'sine', 0.5),
    erroSimon: () => { tom(150, 0.6, 'sawtooth', 0.5); tom(130, 0.6, 'sawtooth', 0.3, 0.1) },
    sequenciaCompleta: () => { [392,523,659,784].forEach((f,i) => tom(f, 0.1, 'sine', 0.3, i*0.08)) },
  },
}
