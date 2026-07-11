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
 *   notificationManager.push('cta_conta', { achievementId })
 *   notificationManager.push('nina_music', { greetingKey })
 */

const STORAGE_LAST = 'ldi-notif-last-time'
const STORAGE_QUEUE = 'ldi-notif-queue'
const COOLDOWN_MS = 15 * 60 * 1000 // 15 minutos
const NOTIF_TTL_MS = 5 * 60 * 1000 // 5 minutos — itens mais velhos são descartados silenciosamente

export const NotificationType = {
  ACHIEVEMENT: 'achievement',
  CTA_CONTA: 'cta_conta',
  LDI_TIP: 'ldi_tip',
  NINA_MUSIC: 'nina_music',
}

export const notificationManager = {
  /**
   * Adiciona uma notificação à fila.
   * @param {'achievement'|'cta_conta'|'ldi_tip'|'nina_music'} type
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
   * Respeita o cooldown de 15 min, a menos que bypassCooldown=true.
   * Se aprovada, remove da fila e registra o timestamp.
   * @param {boolean} [bypassCooldown=false] - se true, ignora o cooldown de 15 min
   * @returns {{type, data, id}|null}
   */
  pull(bypassCooldown = false) {
    const queue = this._getQueue()
    if (queue.length === 0) return null

    const now = Date.now()

    // Remove todos os itens expirados, independente de tipo ou posição
    const changed = this._purgeExpired(queue, now)
    if (queue.length === 0) {
      if (changed) this._saveQueue(queue)
      return null
    }

    const item = queue[0]
    const lastTime = this._getLastTime()
    if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
      queue.shift()
      this._saveQueue(queue)
      this._setLastTime(now)
      return item
    }

    if (changed) this._saveQueue(queue)
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

  /** Busca e remove o primeiro item de um tipo específico, com bypass opcional de cooldown */
  findAndPull(type, bypassCooldown = false) {
    const queue = this._getQueue()
    const now = Date.now()

    // Remove todos os itens expirados, independente de tipo
    const changed = this._purgeExpired(queue, now)

    // Percorre na ordem FIFO (início → fim), retorna o primeiro item válido do tipo
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].type !== type) continue
      // Primeiro item válido do tipo encontrado — aplica cooldown check
      const lastTime = this._getLastTime()
      if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
        const valid = queue[i]
        queue.splice(i, 1)
        this._saveQueue(queue)
        this._setLastTime(now)
        return valid
      }
      // Cooldown ativo — não retorna, mas não remove da fila
      if (changed) this._saveQueue(queue)
      return null
    }

    // Nenhum item do tipo encontrado — salva remoções de expirados se houve
    if (changed) this._saveQueue(queue)
    return null
  },

  /** Remove da fila todos os itens de um tipo específico */
  clearByType(type) {
    const queue = this._getQueue().filter(item => item.type !== type)
    this._saveQueue(queue)
    this._notifyListeners()
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

  _purgeExpired(queue, now) {
    let changed = false
    for (let i = queue.length - 1; i >= 0; i--) {
      if (now - queue[i].createdAt > NOTIF_TTL_MS) {
        queue.splice(i, 1)
        changed = true
      }
    }
    return changed
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
