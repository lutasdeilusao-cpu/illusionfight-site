/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Baixada como CENA navegável (território 3)
   Regra oficial no GDD (§4, Território 3). Mesmo motor da Pista e da Feira
   (engine/ganguesCenaMotor.js) — aqui é só dado: ./mundo.js (esqueleto da
   Pista, sem muro, com a LINHA DO TREM), ./pois.js (o velho, a cadeia do
   folgado, o café), ./interiores.js, ./posicoes.js, ./pools.js.

   Sem muro: o bairro inteiro é andável desde o começo. O que tranca o chefe
   é a história — ganhar respeito (a cadeia do folgado), bater o folgado,
   buscar o café na Dona Cida e acordar o velho. O chefe mora no MESMO lugar
   do velho, na entrada, e só aparece quando o café é entregue.
   ══════════════════════════════════════════════════════════════ */
import { MUNDO_BAIXADA, RUAS_BAIXADA, POSTES_BAIXADA, QUARTEIROES_BAIXADA, PREDIOS_BAIXADA, OBSTACULOS_BAIXADA, CENARIO_BAIXADA, FIACAO_BAIXADA, TREM_BAIXADA } from './mundo.js'
import { POIS_BAIXADA, BAIXADA_RESPEITO } from './pois.js'
import { INTERIORES_BAIXADA } from './interiores.js'
import { POS_BAIXADA, ENTRY_ZONES_BAIXADA } from './posicoes.js'

import { BAIXADA_POOL_RUA } from './pools.js'
export const CENA_BAIXADA = {
  id: 'baixada',
  territorioId: 'baixada',
  // Capangas que completam o bando até o mínimo do bairro (GANGUES_MIN_INIMIGOS).
  poolCapangas: BAIXADA_POOL_RUA,
  cor: '#18dafb',
  mundo: MUNDO_BAIXADA,
  ruas: RUAS_BAIXADA,
  postes: POSTES_BAIXADA,
  quarteiroes: QUARTEIROES_BAIXADA,
  predios: PREDIOS_BAIXADA,
  obstaculos: OBSTACULOS_BAIXADA,
  cenario: CENARIO_BAIXADA,
  fiacao: FIACAO_BAIXADA,
  // A linha do trem (ver hooks/useGanguesTrem.js).
  trem: TREM_BAIXADA,
  chegada: 'games.gangues.cena.baixada.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',
  falanteSlug: 'nego_veio',

  pois: POIS_BAIXADA,
  pos: POS_BAIXADA,
  entryZones: ENTRY_ZONES_BAIXADA,
  interiores: INTERIORES_BAIXADA,

  // Barra de Respeito: cada treta da cadeia do folgado enche um pedaço.
  respeito: { pois: BAIXADA_RESPEITO },

  chefe: {
    id: 'boss',
    poiNo: 'baixada-chefe',
    tipo: 'treta',
    // Fura-Bucho 46 (o velho, acordado) + os dois Generais de escolta (~35
    // cada) — GANGUES_CHEFE_BUDGET.baixada / liderFracChefe em ganguesChefes.js.
    nivelRec: 46,
    enemy: 1502,
    boss: 'espeto',
    // O Espeto do Fura-Bucho (140, épico) na 1ª vitória.
    recompensa: { rep: 8 },
  },

  portao: {
    precisa: [...BAIXADA_RESPEITO, 'folgado_final', 'dona_cida', 'veio_cafe'],
  },

  textos: {
    bossTrancado: 'games.gangues.cena.baixada.checklist_dica',
    muroPassagem: 'games.gangues.cena.baixada.checklist_passagem',
    checklistDica: 'games.gangues.cena.baixada.checklist_dica',
    checklistPassagem: 'games.gangues.cena.baixada.checklist_passagem',
  },

  // Dica da quest do café: o folgado já caiu e o café ainda não foi entregue.
  dicaQuest(prog, inventario) {
    if (!prog.resolvidos.folgado_final || prog.resolvidos.veio_cafe) return null
    return (inventario[16] || 0) >= 1 ? 'games.gangues.cena.baixada.hint_cafe_pronto' : 'games.gangues.cena.baixada.hint_cafe_falta'
  },

  // Encontro aleatório da Baixada: os de sempre (sem o Rapa, que é da Feira).
  aleatorio({ divida }) {
    return ['moto', 'policia', 'bonde', ...(divida > 0 ? ['cobranca_divida'] : ['cobranca'])]
  },
}
