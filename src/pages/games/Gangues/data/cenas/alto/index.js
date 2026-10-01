/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — O Alto do Morro como CENA navegável (território 6)
   Regra oficial no GDD (§4, Território 6). Mesmo motor dos outros bairros —
   aqui é só dado: ./mundo.js, ./pois.js, ./interiores.js (a birosca, a sala
   dos Cinco, o escritório do Contador), ./posicoes.js, ./pools.js.

   MECÂNICA DO ALTO — o Caderno do Contador (`caderno` + `ajusteChefe`): cada
   um dos Cinco se resolve comprando a dívida (o Contador perde 1 de Couro)
   ou na porrada (ele ganha 1 de Porrada). A barra do topo mostra o caderno.
   ══════════════════════════════════════════════════════════════ */
import { MUNDO_ALTO, RUAS_ALTO, POSTES_ALTO, QUARTEIROES_ALTO, PREDIOS_ALTO, OBSTACULOS_ALTO, CENARIO_ALTO, FIACAO_ALTO } from './mundo.js'
import { POIS_ALTO, ALTO_CINCO, flagComprou } from './pois.js'
import { INTERIORES_ALTO } from './interiores.js'
import { POS_ALTO, ENTRY_ZONES_ALTO } from './posicoes.js'

// Estado de cada um dos Cinco no caderno: 'comprado' | 'batido' | null (pendente).
function estadoCinco(id, prog, flags) {
  if (flags[flagComprou(id)]) return 'comprado'
  return prog.resolvidos?.[id] ? 'batido' : null
}

export const CENA_ALTO = {
  id: 'alto',
  territorioId: 'alto',
  cor: '#ff6b6b',
  mundo: MUNDO_ALTO,
  ruas: RUAS_ALTO,
  postes: POSTES_ALTO,
  quarteiroes: QUARTEIROES_ALTO,
  predios: PREDIOS_ALTO,
  obstaculos: OBSTACULOS_ALTO,
  cenario: CENARIO_ALTO,
  fiacao: FIACAO_ALTO,
  chegada: 'games.gangues.cena.alto.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',
  falanteSlug: 'nego_veio',

  pois: POIS_ALTO,
  pos: POS_ALTO,
  entryZones: ENTRY_ZONES_ALTO,
  interiores: INTERIORES_ALTO,

  // O Caderno do Contador: a barra do topo (GanguesBaixadaHud → BarraCaderno).
  caderno: {
    ids: ALTO_CINCO.map(c => c.id),
    estado: estadoCinco,
  },
  // Na luta do chefe: −1 de Couro por Cinco comprado, +1 de Porrada por Cinco batido.
  ajusteChefe(prog, flags) {
    let A = 0, D = 0
    for (const { id } of ALTO_CINCO) {
      const e = estadoCinco(id, prog, flags)
      if (e === 'comprado') D -= 1
      else if (e === 'batido') A += 1
    }
    return A || D ? { A, D } : null
  },

  chefe: {
    id: 'boss',
    poiNo: 'alto-chefe',
    tipo: 'treta',
    // O Contador 85 + a escolta (~64 cada) — GANGUES_CHEFE_BUDGET.alto.
    nivelRec: 85,
    enemy: 1505,
    boss: 'doutor',
    // A Bengala do Contador (135, épico) na 1ª vitória.
    recompensa: { rep: 14, equipPrimeiraVez: 135 },
  },

  portao: {
    precisa: ['porta_aco', 'sala_fechada', ...ALTO_CINCO.map(c => c.id), 'roda', 'formacao_completa', 'favor_devido', 'jogo_porrinha', 'jogo_bilhar'],
  },

  textos: {
    bossTrancado: 'games.gangues.cena.alto.checklist_dica',
    muroPassagem: 'games.gangues.cena.alto.checklist_passagem',
    checklistDica: 'games.gangues.cena.alto.checklist_dica',
    checklistPassagem: 'games.gangues.cena.alto.checklist_passagem',
  },

  aleatorio({ divida }) {
    return ['moto', 'policia', 'bonde', ...(divida > 0 ? ['cobranca_divida'] : ['cobranca'])]
  },
}
