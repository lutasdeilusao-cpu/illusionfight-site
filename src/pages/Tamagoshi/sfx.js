/**
 * SFX — Sons sintéticos via Web Audio API para o Tamagoshi LDI
 *
 * Nenhum arquivo externo necessário.
 * AudioContext é inicializado lazy na primeira interação do usuário.
 */

let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function tocar(frequencia, duracao, tipo = 'sine', volume = 0.3) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = tipo
    osc.frequency.value = frequencia
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duracao)
  } catch (e) {
    // AudioContext pode não estar disponível — ignora silenciosamente
  }
}

export const sfx = {
  clique:       () => tocar(440, 0.1, 'sine'),
  sucesso:      () => tocar(660, 0.2, 'sine'),
  conclusao:    () => { tocar(523, 0.1); setTimeout(() => tocar(659, 0.1), 100); setTimeout(() => tocar(784, 0.2), 200) },
  erro:         () => tocar(200, 0.2, 'sawtooth'),
  drag:         () => tocar(330, 0.1, 'triangle'),
  drop:         () => tocar(550, 0.15, 'sine'),
  compra:       () => tocar(880, 0.15, 'sine'),
  swipe:        () => tocar(300, 0.08, 'triangle'),
  passos:       () => tocar(180, 0.1, 'square', 0.1),
  notificacao:  () => tocar(700, 0.1, 'sine'),
}
