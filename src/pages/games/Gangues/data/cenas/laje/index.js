/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Laje como CENA navegável (território 7, o FINAL)
   Regra oficial no GDD (§4, Território 7). Mesmo motor dos outros bairros —
   aqui é só dado: ./mundo.js, ./pois.js (a ladder inteira, as revanches dos 6
   chefes e as fases do Retalho), ./interiores.js (a sala de costura e o topo),
   ./posicoes.js, ./pools.js.

   MECÂNICA DA LAJE — as LINHAS DO RETALHO (`ajusteChefe`): ele segura cada um
   dos 6 bairros antigos por uma linha; cada linha que o jogador não cortou (lá
   embaixo, na sala dos fundos da birosca de cada bairro) dá +1 de Porrada e +1
   de Couro pro Retalho na fase final. Barra das linhas no topo da tela.
   ══════════════════════════════════════════════════════════════ */
import { MUNDO_LAJE, RUAS_LAJE, POSTES_LAJE, QUARTEIROES_LAJE, PREDIOS_LAJE, OBSTACULOS_LAJE, CENARIO_LAJE, FIACAO_LAJE } from './mundo.js'
import { POIS_LAJE, LAJE_LINHAS } from './pois.js'
import { INTERIORES_LAJE } from './interiores.js'
import { POS_LAJE, ENTRY_ZONES_LAJE } from './posicoes.js'

const linhaCortada = (l, cenaProgresso) => Boolean(cenaProgresso?.[l.cena]?.resolvidos?.[l.id])

export const CENA_LAJE = {
  id: 'laje',
  territorioId: 'laje',
  cor: '#a855f7',
  mundo: MUNDO_LAJE,
  ruas: RUAS_LAJE,
  postes: POSTES_LAJE,
  quarteiroes: QUARTEIROES_LAJE,
  predios: PREDIOS_LAJE,
  obstaculos: OBSTACULOS_LAJE,
  cenario: CENARIO_LAJE,
  fiacao: FIACAO_LAJE,
  chegada: 'games.gangues.cena.laje.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',
  falanteSlug: 'nego_veio',

  pois: POIS_LAJE,
  pos: POS_LAJE,
  entryZones: ENTRY_ZONES_LAJE,
  interiores: INTERIORES_LAJE,

  // A barra das linhas (GanguesBaixadaHud → BarraLinhas).
  linhas: { lista: LAJE_LINHAS, cortada: linhaCortada },
  // Fase final: +1 de Porrada e +1 de Couro por linha que sobrou.
  ajusteChefe(prog, flags, cenaProgresso) {
    const sobrou = LAJE_LINHAS.filter(l => !linhaCortada(l, cenaProgresso)).length
    return sobrou ? { A: sobrou, D: sobrou } : null
  },

  chefe: {
    id: 'boss',
    poiNo: 'laje-chefe',
    tipo: 'treta',
    // A fase 3: O Retalho 100 + a escolta (~75 cada) — GANGUES_CHEFE_BUDGET.laje.
    nivelRec: 100,
    enemy: 1600,
    boss: 'costura',
    // A Coroa da Laje (133, épico) na vitória — o fim do jogo.
    recompensa: { rep: 20 },
  },

  portao: {
    precisa: ['ultima_guarda', 'revanche_carvao', 'fiapo', 'revanche_cobrador', 'agulha', 'revanche_fura_bucho', 'linha_reta',
      'revanche_ferrugem', 'revanche_zefa', 'costura_fina', 'tesoura', 'corte_certo', 'revanche_contador', 'fase_costura', 'fase_colcha'],
  },

  textos: {
    bossTrancado: 'games.gangues.cena.laje.checklist_dica',
    muroPassagem: 'games.gangues.cena.laje.checklist_passagem',
    checklistDica: 'games.gangues.cena.laje.checklist_dica',
    checklistPassagem: 'games.gangues.cena.laje.checklist_passagem',
  },

  aleatorio({ divida }) {
    return ['moto', 'policia', 'bonde', ...(divida > 0 ? ['cobranca_divida'] : ['cobranca'])]
  },
}
