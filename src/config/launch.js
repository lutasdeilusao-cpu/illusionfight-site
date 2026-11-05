/**
 * LAUNCH — Datas de lançamento centralizadas
 *
 * Todas as datas de lançamento do site concentradas aqui.
 * Usar: import { LAUNCH_DATE } from '../config/launch'
 *
 * Última atualização: 2026-08-26
 */

/**
 * Data de lançamento oficial do site; null enquanto não há data marcada.
 * Sem data, as liberações futuras dos índices editoriais e do calendário
 * (season-one-schedule.js, radio-nina.config.json) ficam 80 anos à frente,
 * com a ordem e o ritmo dos ciclos intactos: ao marcar a data, desloca-se tudo de volta.
 */
export const LAUNCH_DATE = null

/** Ano previsto do lançamento, mostrado enquanto LAUNCH_DATE é null */
export const LAUNCH_ANO = 2027

/** E-mails de administradores que sempre têm acesso completo */
export const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
