import { CASOS } from './casos'

/**
 * Lista plana de todas as pistas de todos os casos,
 * usada pelo CadernoSuspeitas e FinalScreen para tracking de fios.
 *
 * Cada entrada: { id, casoId, tipo, texto, titulo }
 */
export const PISTAS = CASOS.flatMap(caso =>
  (caso.pistas || []).map(p => ({
    id: p.id,
    casoId: caso.id,
    tipo: p.tipo || 'objeto',
    fio: p.fio || false,
    texto: (p.i18n?.pt?.desc || p.i18n?.pt?.titulo || ''),
    titulo: (p.i18n?.pt?.titulo || ''),
  }))
)
