/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Vila como CENA navegável (território 4)
   Regra oficial no GDD (§4, Território 4) e o plano em
   docs/Games/Gangues/PLANO_VILA.md. Mesmo motor dos outros bairros
   (engine/ganguesCenaMotor.js) — aqui é só dado: ./mundo.js (o pátio, no
   esqueleto da Pista), ./pois.js, ./interiores.js (o Bloco A com os dez
   andares), ./posicoes.js, ./pools.js.

   O térreo é livre desde o começo. O que tranca o Ferrugem é a SUBIDA: o
   Bloco A só abre batendo o Cadeado, e cada andar só abre batendo quem
   segura o patamar. O chefe mora na cobertura (10º andar), dentro do
   interior — não tem pino na rua.
   ══════════════════════════════════════════════════════════════ */
import { MUNDO_VILA, RUAS_VILA, POSTES_VILA, QUARTEIROES_VILA, PREDIOS_VILA, OBSTACULOS_VILA, CENARIO_VILA, FIACAO_VILA } from './mundo.js'
import { POIS_VILA } from './pois.js'
import { INTERIORES_VILA } from './interiores.js'
import { POS_VILA, ENTRY_ZONES_VILA } from './posicoes.js'
import { VILA_POOL_ELEVADOR } from './pools.js'

export const CENA_VILA = {
  id: 'vila',
  territorioId: 'vila',
  cor: '#ffae32',
  mundo: MUNDO_VILA,
  ruas: RUAS_VILA,
  postes: POSTES_VILA,
  quarteiroes: QUARTEIROES_VILA,
  predios: PREDIOS_VILA,
  obstaculos: OBSTACULOS_VILA,
  cenario: CENARIO_VILA,
  fiacao: FIACAO_VILA,
  chegada: 'games.gangues.cena.vila.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',
  falanteSlug: 'nego_veio',

  pois: POIS_VILA,
  pos: POS_VILA,
  entryZones: ENTRY_ZONES_VILA,
  interiores: INTERIORES_VILA,

  // Barra de Alerta (`mexerAlerta` em store/slices/ganguesStorySlice.js): o
  // Portaria corre avisando o bonde. Sobe +1 ao perder uma luta aqui ou o
  // elevador travar; cada ponto soma +1 de ficha nos corpos das tretas da Vila
  // (nunca passa do Ferrugem). Bater um dos `pois` desce 1; bater `zeraCom`
  // zera e trava a barra (o rádio do Portaria quebra).
  alerta: { max: 3, pois: ['portaria_fuga_1', 'andar_4'], zeraCom: 'andar_6' },

  // O elevador quebrado (POI `elevador`, papo com os andares de destino).
  elevador: { interior: 'bloco_a', chanceTravar: 0.35, pool: VILA_POOL_ELEVADOR },

  chefe: {
    id: 'boss',
    poiNo: 'vila-chefe',
    tipo: 'treta',
    // Ferrugem 59 + os dois Generais de escolta (~44 cada) —
    // GANGUES_CHEFE_BUDGET.vila / liderFracChefe em ganguesChefes.js.
    nivelRec: 59,
    enemy: 1503,
    boss: 'sala',
    // O Taco da Ferrugem (141, épico) na 1ª vitória.
    recompensa: { rep: 10, equipPrimeiraVez: 141 },
  },

  portao: {
    precisa: ['guarita', 'portaria_fuga_1', 'cadeado', 'andar_1', 'andar_2', 'trinco', 'andar_4', 'condominio', 'andar_6', 'bloco_inteiro', 'goteira', 'chave_mestra'],
  },

  textos: {
    bossTrancado: 'games.gangues.cena.vila.checklist_dica',
    muroPassagem: 'games.gangues.cena.vila.checklist_passagem',
    checklistDica: 'games.gangues.cena.vila.checklist_dica',
    checklistPassagem: 'games.gangues.cena.vila.checklist_passagem',
  },

  // A caixa d'água da cobertura: o registro fechado deixa o Ferrugem sem banho.
  fraquezaChefe: { precisa: ['caixa_dagua'], efeito: { D: -2 } },

  // Dica: chegou no 5º sem a chave do elevador.
  dicaQuest(prog, inventario) {
    if (!prog.resolvidos.andar_4 || prog.resolvidos.dona_neide || (inventario[18] || 0) > 0) return null
    return 'games.gangues.cena.vila.hint_elevador'
  },

  // Encontro aleatório do pátio: os de sempre.
  aleatorio({ divida }) {
    return ['moto', 'policia', 'bonde', ...(divida > 0 ? ['cobranca_divida'] : ['cobranca'])]
  },
}
