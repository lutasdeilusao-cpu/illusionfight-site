const listeners = {}

export function on(evento, fn) {
  if (!listeners[evento]) listeners[evento] = []
  listeners[evento].push(fn)
}

export function off(evento, fn) {
  if (!listeners[evento]) return
  listeners[evento] = listeners[evento].filter(f => f !== fn)
}

export function emit(evento, dados) {
  if (!listeners[evento]) return
  listeners[evento].forEach(fn => fn(dados))
}
