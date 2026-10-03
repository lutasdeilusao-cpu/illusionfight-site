// Mantém o Gangues rodando com o app no fundo (Isaias, 30/09/2026: "deixa ficar rolando o jogo até a
// memória estourar, até o navegador fechar a aba").
//
// Quem pausava não era o jogo — era o navegador: aba escondida tem os timers
// segurados (Chrome: 1x/s, e depois de ~5 min os encadeados caem pra 1x/min)
// e o Android congela a página de vez. Duas defesas:
//  1. timers pelo Worker: setTimeout/setInterval da página passam a ser
//     disparados por um Web Worker, que o navegador não segura do mesmo jeito;
//  2. áudio quase mudo tocando sempre (ver tocarAudio). Aba tocando áudio
//     não é congelada nem estrangulada (é o que já mantém a Rádio Nina viva).
// Voltou pra frente → os timers voltam ao normal; o áudio segue até sair do jogo.
import { useEffect } from 'react'

const ID_BASE = 1e9 // ids do Worker não colidem com os do navegador
const nativo = {
  setTimeout: window.setTimeout.bind(window),
  clearTimeout: window.clearTimeout.bind(window),
  setInterval: window.setInterval.bind(window),
  clearInterval: window.clearInterval.bind(window),
}

let worker = null
let proximoId = ID_BASE
const pendentes = new Map() // id → { fn, args, repete }

function criarWorker() {
  const codigo = `const t = new Map();
    onmessage = ({ data: m }) => {
      if (m.op === 'set') {
        const f = () => postMessage(m.id)
        t.set(m.id, m.repete ? setInterval(f, m.ms) : setTimeout(f, m.ms))
      } else { clearTimeout(t.get(m.id)); clearInterval(t.get(m.id)); t.delete(m.id) }
    }`
  const w = new Worker(URL.createObjectURL(new Blob([codigo], { type: 'text/javascript' })))
  w.onmessage = ({ data: id }) => {
    const p = pendentes.get(id)
    if (!p) return
    if (!p.repete) pendentes.delete(id)
    try { typeof p.fn === 'function' ? p.fn(...p.args) : null } catch (e) { console.error(e) }
  }
  return w
}

function agendar(repete) {
  return (fn, ms = 0, ...args) => {
    const id = proximoId++
    pendentes.set(id, { fn, args, repete })
    worker.postMessage({ op: 'set', id, ms: Math.max(0, Number(ms) || 0), repete })
    return id
  }
}
function cancelar(nativoCancel) {
  return id => {
    if (typeof id === 'number' && id >= ID_BASE) {
      pendentes.delete(id)
      worker?.postMessage({ op: 'clear', id })
    } else nativoCancel(id)
  }
}

let timersNoWorker = false
function ligarTimers() {
  if (timersNoWorker) return
  try { worker = worker || criarWorker() } catch { return } // sem Worker: fica o normal
  window.setTimeout = agendar(false)
  window.setInterval = agendar(true)
  window.clearTimeout = cancelar(nativo.clearTimeout)
  window.clearInterval = cancelar(nativo.clearInterval)
  timersNoWorker = true
}
function desligarTimers() {
  if (!timersNoWorker) return
  // os agendados pelo Worker continuam valendo até disparar; só os NOVOS
  // voltam pro navegador. clear* segue sabendo cancelar os dois tipos.
  window.setTimeout = nativo.setTimeout
  window.setInterval = nativo.setInterval
  window.clearTimeout = cancelar(nativo.clearTimeout)
  window.clearInterval = cancelar(nativo.clearInterval)
  timersNoWorker = false
}

// Áudio de fundo quase mudo, num <audio> de verdade (não WebAudio). Mídia
// TOCANDO é o que o Android respeita pra não congelar a aba no fundo — é o
// que já mantém a Rádio Nina viva. Ele nasce no 1º toque dentro do jogo
// (regra de autoplay) e fica tocando o tempo todo enquanto o Gangues está
// aberto: começar a tocar SÓ depois de ir pro fundo (como era antes, com o
// WebAudio suspenso) é bloqueado pelo navegador sem um toque, e a aba
// congelava mesmo assim (Isaias, 03/10/2026: "tá pausando o jogo").
let audio = null
function ruidoWav(segundos = 2, taxa = 8000) {
  const n = segundos * taxa
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const txt = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  txt(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); txt(8, 'WAVE'); txt(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, taxa, true); v.setUint32(28, taxa * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  txt(36, 'data'); v.setUint32(40, n * 2, true)
  // ruído baixíssimo: inaudível, mas não é silêncio digital (silêncio puro
  // o navegador trata como "não está tocando")
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.round((Math.random() * 2 - 1) * 12), true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}
function tocarAudio() {
  try {
    if (!audio) {
      audio = new Audio(ruidoWav())
      audio.loop = true
      audio.setAttribute('playsinline', '')
    }
    audio.play().catch(() => {})
  } catch { audio = null }
}
function pararAudio() {
  try { audio?.pause() } catch { /* nada */ }
}

export default function useGanguesManterVivo() {
  useEffect(() => {
    // 1º toque (e qualquer toque depois, caso o navegador tenha pausado a
    // mídia) garante o áudio de fundo tocando.
    const aoTocar = () => { if (audio?.paused !== false) tocarAudio() }
    window.addEventListener('pointerdown', aoTocar)
    window.addEventListener('keydown', aoTocar)

    // Aba escondida: timers pelo Worker, SEMPRE (antes só com automático
    // ligado — se a leitura do automático falhasse, nada segurava o jogo).
    const aoMudar = () => {
      if (document.hidden) { ligarTimers(); if (audio?.paused) audio.play().catch(() => {}) } else desligarTimers()
    }
    document.addEventListener('visibilitychange', aoMudar)
    return () => {
      window.removeEventListener('pointerdown', aoTocar)
      window.removeEventListener('keydown', aoTocar)
      document.removeEventListener('visibilitychange', aoMudar)
      desligarTimers()
      pararAudio()
    }
  }, [])
}
