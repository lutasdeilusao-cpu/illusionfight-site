/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — O Morro como CENA navegável (território 5)
   Regra oficial no GDD (§4, Território 5). Mesmo motor dos outros bairros —
   aqui é só dado: ./mundo.js (a escadaria e os 3 portões), ./pois.js,
   ./interiores.js (a birosca, a creche, a boca da Zefa), ./posicoes.js,
   ./pools.js.

   MECÂNICA DO MORRO — a escadaria negociada (`cena.barreiras`): três portões
   dos Fogueteiro fecham a rua de lado a lado. Cada um só abre com o AVAL de
   um bairro já dominado — o jogador volta lá e negocia (POIs `aval_morro`
   nas salas dos fundos da Pista, da Feira e da Baixada). O Morro nunca foi
   tomado, só negociado.
   ══════════════════════════════════════════════════════════════ */
import { MUNDO_MORRO, RUAS_MORRO, POSTES_MORRO, QUARTEIROES_MORRO, PREDIOS_MORRO, OBSTACULOS_MORRO, CENARIO_MORRO, FIACAO_MORRO, BARREIRAS_MORRO } from './mundo.js'
import { POIS_MORRO } from './pois.js'
import { INTERIORES_MORRO } from './interiores.js'
import { POS_MORRO, ENTRY_ZONES_MORRO } from './posicoes.js'

export const CENA_MORRO = {
  id: 'morro',
  territorioId: 'morro',
  cor: '#ff8f3c',
  mundo: MUNDO_MORRO,
  ruas: RUAS_MORRO,
  postes: POSTES_MORRO,
  quarteiroes: QUARTEIROES_MORRO,
  predios: PREDIOS_MORRO,
  obstaculos: OBSTACULOS_MORRO,
  cenario: CENARIO_MORRO,
  fiacao: FIACAO_MORRO,
  barreiras: BARREIRAS_MORRO,
  chegada: 'games.gangues.cena.morro.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',
  falanteSlug: 'nego_veio',

  pois: POIS_MORRO,
  pos: POS_MORRO,
  entryZones: ENTRY_ZONES_MORRO,
  interiores: INTERIORES_MORRO,

  chefe: {
    id: 'boss',
    poiNo: 'morro-chefe',
    tipo: 'treta',
    // A Fera 72 + a escolta (~54 cada) — GANGUES_CHEFE_BUDGET.morro.
    nivelRec: 72,
    enemy: 1504,
    boss: 'zefa',
    // A Vara da Fera (134, épico) na 1ª vitória.
    recompensa: { rep: 12 },
  },

  portao: {
    precisa: ['escadaria', 'cupim', 'laje_nova', 'posto_rojao', 'segunda_mae', 'escadaria_inteira', 'ultima_escada', 'conta_do_morro'],
  },

  textos: {
    bossTrancado: 'games.gangues.cena.morro.checklist_dica',
    muroPassagem: 'games.gangues.cena.morro.checklist_passagem',
    checklistDica: 'games.gangues.cena.morro.checklist_dica',
    checklistPassagem: 'games.gangues.cena.morro.checklist_passagem',
  },

  aleatorio({ divida }) {
    return ['moto', 'policia', 'bonde', ...(divida > 0 ? ['cobranca_divida'] : ['cobranca'])]
  },
}
