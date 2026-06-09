/**
 * NotificationManager — Fila Centralizada de Notificações
 *
 * Regra de negócio: no máximo 1 notificação a cada 15 minutos.
 * Fila persiste em localStorage. Única exceção: Nina Music (1x/sessão).
 *
 * Uso:
 *   import { notificationManager } from '../../lib/notificationManager'
 *   notificationManager.push('ldi_tip', { mensagem, cta, url, personagem })
 *   notificationManager.push('achievement', { nome, descricao, icone })
 *   notificationManager.push('nina_music', { greetingKey })
 */

const STORAGE_LAST = 'ldi-notif-last-time'
const STORAGE_QUEUE = 'ldi-notif-queue'
const COOLDOWN_MS = 15 * 60 * 1000 // 15 minutos

export const NotificationType = {
  ACHIEVEMENT: 'achievement',
  LDI_TIP: 'ldi_tip',
  NINA_MUSIC: 'nina_music',
}

export const notificationManager = {
  /**
   * Adiciona uma notificação à fila.
   * @param {'achievement'|'ldi_tip'|'nina_music'} type
   * @param {object} data - dados específicos do tipo
   */
  push(type, data) {
    const queue = this._getQueue()
    // Evita duplicatas do mesmo tipo consecutivas
    if (queue.length > 0 && queue[queue.length - 1].type === type) {
      return
    }
    queue.push({
      type,
      data,
      id: Date.now() + Math.random(),
      createdAt: Date.now(),
    })
    this._saveQueue(queue)
    this._notifyListeners()
  },

  /**
   * Tenta obter a próxima notificação da fila.
   * Respeita o cooldown de 15 min (exceto nina_music).
   * Se aprovada, remove da fila e registra o timestamp.
   * @returns {{type, data, id}|null}
   */
  pull() {
    const queue = this._getQueue()
    if (queue.length === 0) return null

    const item = queue[0]

    // Nina Music é exceção — sempre mostra (só aparece 1x/sessão via sessionStorage)
    if (item.type === NotificationType.NINA_MUSIC) {
      // Verifica se já foi mostrada nesta sessão
      if (sessionStorage.getItem('ldi-notif-nina-shown')) {
        queue.shift()
        this._saveQueue(queue)
        return null // já foi, descarta
      }
      queue.shift()
      this._saveQueue(queue)
      sessionStorage.setItem('ldi-notif-nina-shown', '1')
      this._setLastTime(Date.now())
      return item
    }

    // Verifica cooldown de 15 min
    const lastTime = this._getLastTime()
    const now = Date.now()
    if (now - lastTime >= COOLDOWN_MS) {
      queue.shift()
      this._saveQueue(queue)
      this._setLastTime(now)
      return item
    }

    return null // cooldown ativo
  },

  /** Espia a primeira da fila sem remover */
  peek() {
    const queue = this._getQueue()
    return queue.length > 0 ? queue[0] : null
  },

  /** Quantidade de notificações na fila */
  queueLength() {
    return this._getQueue().length
  },

  /** Se pode mostrar notificação agora (cooldown passou) */
  canShow() {
    return Date.now() - this._getLastTime() >= COOLDOWN_MS
  },

  /** Ms restantes até liberar próxima notificação */
  timeUntilNext() {
    const remaining = COOLDOWN_MS - (Date.now() - this._getLastTime())
    return Math.max(0, remaining)
  },

  /** Limpa a fila inteira */
  clear() {
    localStorage.removeItem(STORAGE_QUEUE)
    this._notifyListeners()
  },

  // ── Internals ──

  _getQueue() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || '[]')
    } catch {
      return []
    }
  },

  _saveQueue(q) {
    localStorage.setItem(STORAGE_QUEUE, JSON.stringify(q))
  },

  _getLastTime() {
    return parseInt(localStorage.getItem(STORAGE_LAST) || '0', 10)
  },

  _setLastTime(t) {
    localStorage.setItem(STORAGE_LAST, String(t))
  },

  _listeners: new Set(),

  /** Inscreve callback para mudanças na fila. Retorna unsubscribe. */
  subscribe(fn) {
    this._listeners.add(fn)
    return () => this._listeners.delete(fn)
  },

  _notifyListeners() {
    this._listeners.forEach(fn => {
      try { fn() } catch (e) { /* silencioso */ }
    })
  },
}
