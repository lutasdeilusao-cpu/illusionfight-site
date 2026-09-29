/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Feira como CENA navegável (território 2)
   Plano completo: docs/Games/Gangues/PLANO_FEIRA.md · regra oficial no GDD
   (§4, Território 2). Mesmo motor da Pista (engine/ganguesCenaMotor.js) —
   aqui é só dado: ./mundo.js (geometria espelhada da Pista + bancas),
   ./pois.js (37 eventos), ./interiores.js (pensão, rádio, mercearia,
   serralheria, a Galeria dos Gato e o Mercadão), ./posicoes.js, ./pools.js.

   O "muro" da Feira é a BARRICADA DO APAGÃO: a parte de cima da Feira está
   sem luz (Os Gato cortaram). Passa pela Galeria dos Gato (o "túnel" daqui),
   anda no escuro, e quando o Cobrador cai a luz volta (o muro abre).
   ══════════════════════════════════════════════════════════════ */
import { MUNDO_FEIRA, RUAS_FEIRA, MURO_FEIRA, POSTES_FEIRA, QUARTEIROES_FEIRA, PREDIOS_FEIRA, OBSTACULOS_FEIRA, CENARIO_FEIRA, FIACAO_FEIRA } from './mundo.js'
import { POIS_FEIRA } from './pois.js'
import { INTERIORES_FEIRA } from './interiores.js'
import { POS_FEIRA, ENTRY_ZONES_FEIRA } from './posicoes.js'

export const CENA_FEIRA = {
  id: 'feira',
  territorioId: 'feira',
  cor: '#7ee787',
  mundo: MUNDO_FEIRA,
  ruas: RUAS_FEIRA,
  muro: MURO_FEIRA,
  postes: POSTES_FEIRA,
  quarteiroes: QUARTEIROES_FEIRA,
  predios: PREDIOS_FEIRA,
  obstaculos: OBSTACULOS_FEIRA,
  cenario: CENARIO_FEIRA,
  fiacao: FIACAO_FEIRA,
  // Quem apresenta a Feira é o mesmo Nego Véio (ele conhece Marélia inteira).
  chegada: 'games.gangues.cena.feira.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',
  falanteSlug: 'nego_veio',

  pois: POIS_FEIRA,
  pos: POS_FEIRA,
  entryZones: ENTRY_ZONES_FEIRA,
  interiores: INTERIORES_FEIRA,

  // O APAGÃO: do outro lado da barricada a Feira fica no escuro (só um
  // círculo de luz em volta do jogador) até o Cobrador cair.
  apagao: true,

  chefe: {
    id: 'boss',
    poiNo: 'feira-chefe',
    tipo: 'treta',
    // Cobrador 33 (+ Mão do Turco e Caixa Forte de escolta, ~25 cada) — teto da Feira é 33 — ver
    // GANGUES_CHEFE_BUDGET.feira / liderFracChefe em data/ganguesChefes.js.
    nivelRec: 33,
    enemy: 1501,
    boss: 'turco',
    // O Porrete do Cobrador (138, épico) na 1ª vitória.
    recompensa: { rep: 6, equipPrimeiraVez: 138 },
  },

  portao: {
    precisa: ['catraca', 'banca_turco', 'cobranca', 'quadro_luz', 'beco_gato', 'balanca', 'caderneta_viva', 'radio', 'mao_turco', 'caixa_forte'],
  },

  textos: {
    bossTrancado: 'games.gangues.cena.feira.boss_trancado',
    muroPassagem: 'games.gangues.cena.feira.muro_passagem',
    checklistDica: 'games.gangues.cena.feira.checklist_dica',
    checklistPassagem: 'games.gangues.cena.feira.checklist_passagem',
  },

  posMuro: {
    metas: ['deposito_1', 'deposito_2'],
    passagem: { nome: 'games.gangues.cena.feira.minimapa_galeria', pos: { x: 308, y: 1404 } },
    final: { nome: 'games.gangues.cena.feira.minimapa_mercadao', pos: { x: 164, y: 262 } },
  },

  // Dica da quest do rádio: 1 fio de cobre (14) + 3 válvulas (15).
  dicaQuest(prog, inventario) {
    if (!prog.resolvidos.quadro_luz || prog.resolvidos.radio) return null
    const valvulas = inventario[15] || 0
    if (valvulas >= 3 && (inventario[14] || 0) >= 1) return 'games.gangues.cena.feira.hint_radio_pronto'
    return 'games.gangues.cena.feira.hint_radio_falta'
  },

  // As 3 páginas da Caderneta do Turco: com todas, o Cobrador entra na luta
  // com −2 de Couro (aplicado no bando do chefe em GanguesRoute.jsx).
  fraquezaChefe: { precisa: ['pagina_1', 'pagina_2', 'pagina_3'], efeito: { D: -2 } },

  // Encontro aleatório da Feira: os 4 de sempre + o Rapa; o Apagão só do
  // outro lado da barricada (enquanto está escuro); a Cobrança do Turco só
  // pra quem deve ao agiota (a Feira SABE que você deve).
  aleatorio({ divida, ladoApagado }) {
    return [
      'moto', 'policia', 'bonde', 'rapa',
      ...(divida > 0 ? ['cobranca_divida'] : ['cobranca']),
      ...(ladoApagado ? ['apagao'] : []),
    ]
  },
}
