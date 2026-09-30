// Mantém o Gangues rodando com o app no fundo enquanto algum automático
// estiver ligado (Isaias, 30/09/2026: "deixa ficar rolando o jogo até a
// memória estourar, até o navegador fechar a aba").
//
// Quem pausava não era o jogo — era o navegador: aba escondida tem os timers
// segurados (Chrome: 1x/s, e depois de ~5 min os encadeados caem pra 1x/min)
// e o Android congela a página de vez. Duas defesas, só com a aba escondida
// E automático ligado:
//  1. timers pelo Worker: setTimeout/setInterval da página passam a ser
//     disparados por um Web Worker, que o navegador não segura do mesmo jeito;
//  2. áudio quase mudo: um ruído baixíssimo pelo WebAudio. Aba tocando áudio
//     não é congelada nem estrangulada (é o que já mantém a Rádio Nina viva).
// Voltou pra frente ou desligou o automático → tudo volta ao normal.
import { useEffect } from 'react'
import { algumAutomaticoLigado } from './useGanguesBrigaAutomatica.js'

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

let audio = null
function prepararAudio() {
  if (audio) return
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const dados = buffer.getChannelData(0)
    for (let i = 0; i < dados.length; i++) dados[i] = (Math.random() * 2 - 1) * 0.0004 // inaudível, mas não é silêncio
    const fonte = ctx.createBufferSource()
    fonte.buffer = buffer
    fonte.loop = true
    fonte.connect(ctx.destination)
    fonte.start()
    ctx.suspend()
    audio = ctx
  } catch { audio = null }
}

export default function useGanguesManterVivo() {
  useEffect(() => {
    // O áudio precisa nascer num toque do jogador (regra de autoplay); fica
    // suspenso e só "toca" com a aba escondida.
    const aoTocar = () => prepararAudio()
    window.addEventListener('pointerdown', aoTocar, { once: true })

    const aoMudar = () => {
      if (document.hidden && algumAutomaticoLigado()) {
        ligarTimers()
        audio?.resume().catch(() => {})
      } else {
        desligarTimers()
        audio?.suspend().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', aoMudar)
    return () => {
      window.removeEventListener('pointerdown', aoTocar)
      document.removeEventListener('visibilitychange', aoMudar)
      desligarTimers()
      audio?.suspend().catch(() => {})
    }
  }, [])
}
