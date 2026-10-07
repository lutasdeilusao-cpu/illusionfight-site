/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Pista como CENA navegável
   (design + lore canônica: docs/Games/Gangues/LDI_GANGUES_GDD.md §17.6)

   O bairro deixa de ser "trilha de nós" e vira um mundo navegável com
   POIs. Cada POI tem um TIPO e um estado (escondido → disponível →
   resolvido). Resolver um POI revela o próximo pelo grafo `revela`. O
   portão do chefe abre quando os POIs-chave caíram (`portao`).

   TIPOS (o modal de cada um mora em components/cena/):
   • treta    → GanguesCombat (fluxo story-combat)
   • parada   → GanguesParada  (lib Puzzles/ com skin de gangue)
   • corre    → GanguesParada  (stealth/tempo, mesma skin)
   • papo     → GanguesPapo    (diálogo + escolhas)
   • achado   → loot direto (toast, sem modal)
   • descanso → GanguesDescanso (cura gastando grana)
   • loja / agiota / ferreiro → GanguesLoja / GanguesAgiota / GanguesFerreiro

   Este arquivo (antes um único data/cenas/pista.js de 823 linhas) hoje só
   compõe as partes que moram nesta pasta — ver
   PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4/§5:
   ./mundo.js (geometria: ruas/muro/postes/quarteirões/prédios/obstáculos/cenário/fiação),
   ./pools.js (moldes de inimigo por revezamento), ./pois.js (POIs do
   exterior), ./interiores.js (interiores navegáveis), ./posicoes.js
   (coordenadas e zona de entrada de cada POI, lidas pelo motor genérico via
   cena.pos/cena.entryZones). As 4 funções genéricas de cena
   (temCena/portaoAberto/cenaCompleta/contarCena) saíram pra
   ../cenaHelpers.js, e o motor de navegação (montarAmbiente e cia) saiu
   pra ../../engine/ganguesCenaMotor.js — nenhum dos dois é específico
   da Pista.
   ══════════════════════════════════════════════════════════════ */
import { MUNDO_PISTA, RUAS_PISTA, MURO_PISTA, POSTES_PISTA, QUARTEIROES_PISTA, PREDIOS_PISTA, OBSTACULOS_PISTA, CENARIO_PISTA, FIACAO_PISTA } from './mundo.js'
import { POIS_PISTA } from './pois.js'
import { INTERIORES_PISTA } from './interiores.js'
import { POS_PISTA, ENTRY_ZONES_PISTA } from './posicoes.js'

import { PISTA_POOL_RUA } from './pools.js'
export const CENA_PISTA = {
  id: 'pista',
  territorioId: 'pista',
  // Capangas que completam o bando até o mínimo do bairro (GANGUES_MIN_INIMIGOS).
  poolCapangas: PISTA_POOL_RUA,
  cor: '#3ddc97',
  mundo: MUNDO_PISTA,
  ruas: RUAS_PISTA,
  muro: MURO_PISTA,
  postes: POSTES_PISTA,
  quarteiroes: QUARTEIROES_PISTA,
  predios: PREDIOS_PISTA,
  obstaculos: OBSTACULOS_PISTA,
  cenario: CENARIO_PISTA,
  fiacao: FIACAO_PISTA,
  // Fala de chegada (voz da quebrada — uma ou duas linhas no GangDialog).
  chegada: 'games.gangues.cena.pista.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',
  falanteSlug: 'nego_veio',

  pois: POIS_PISTA,
  // Coordenadas de pino/zona de interação — lidas pelo motor genérico
  // (engine/ganguesCenaMotor.js) via cena.pos/cena.entryZones, nunca de uma
  // constante global (ver data/cenas/pista/posicoes.js).
  pos: POS_PISTA,
  entryZones: ENTRY_ZONES_PISTA,

  // ── INTERIORES navegáveis (fase 2) ──────────────────────────
  interiores: INTERIORES_PISTA,


  // O chefe — só aparece quando o portão abre.
  // Ficha máxima de cada corpo do encontro aleatório (polícia, moto...) neste bairro.
  tetoAleatorio: 15,
  chefe: {
    id: 'boss',
    poiNo: 'pista-chefe', // nó real em ganguesTerritorios.js (marcarNoDominado)
    tipo: 'treta',
    // Nível recomendado da tropa pra encarar (aviso no TretaVS quando abaixo).
    // Atualizado 15/09/2026 (achado nesta mesma revisão — tinha ficado pra
    // trás no rebalanceamento da ladder): o Carvão agora é fixo em 30 (era
    // 15), ver GANGUES_CHEFE_BUDGET.pista em data/ganguesChefes.js.
    nivelRec: 20,
    i18n: 'games.gangues.cena.pista.boss',
    // Ficha própria (não mais "kaeda" emprestado) — o combate real agora
    // mostra "Fumaça" lutando, batendo com a fala/nome já usados na tela
    // de confronto (games.gangues.story.bosses.fumaca).
    enemy: 1500,
    boss: 'fumaca',
    // Grana da vitória: fórmula fixa (calcularGranaTotal, ganguesVictoryResolver.js)
    // — chefe sempre garante pelo menos 500 (Isaias, 19/09/2026), não mais
    // um valor autorado aqui. `rep` continua autorado.
    // O Facão do Carvão (139, épico) — o 1º épico que existe de verdade.
    recompensa: { rep: 5 },
  },

  // A área final só abre depois de todo o caminho obrigatório da Pista —
  // incluindo a Rasteira Velha (o General). Só aí o Carvão desce.
  // BUG REAL achado 21/09/2026: 'birosca' (POI removido no merge com o
  // Descanso, ver AGENTS.md/pois.js) tinha ficado aqui na lista — como
  // esse POI não existe mais, `resolvidos.birosca` nunca vira `true` de
  // novo, e o portão NUNCA mais abria (achado testando o antigo encontro "o bicho",
  // que só aparecia depois do portão aberto). Tirado da lista.
  portao: {
    precisa: ['sinal', 'ferro', 'beco', 'beco_2', 'beco_3', 'oficina', 'sinaleiro', 'rasteira_velha'],
  },

  // Textos que mudam por território (o muro da Pista é muro + túnel).
  textos: {
    bossTrancado: 'games.gangues.cena.boss_trancado',
    muroPassagem: 'games.gangues.cena.muro_tunel',
    checklistDica: 'games.gangues.cena.checklist_dica',
    checklistPassagem: 'games.gangues.cena.checklist_tunel_aberto',
  },

  // Dica da quest da sucata (antes chumbada em GanguesCena.jsx). A Oficina do
  // Nando é OBRIGATÓRIA e só fecha com 2× sucata (item 13) — 1 no puzzle do
  // ferro-velho, 1 no fundo dele (`achado`). Com 1 só, aponta pro achado —
  // MAS só enquanto o achado existir: se falhou a gazua e já pegou o achado,
  // apontar pro "fundo do ferro-velho" vazio é mentira (bug do Isaias,
  // 13/09/2026). Devolve a chave i18n da dica, ou null.
  dicaQuest(prog, inventario) {
    if (!prog.resolvidos.ferro || prog.resolvidos.oficina) return null
    if ((inventario[13] || 0) >= 2) return 'games.gangues.cena.hint_sucata'
    if (!prog.resolvidos.achado) return 'games.gangues.cena.hint_sucata_falta'
    return null
  },

  // Do outro lado do muro (depois do túnel): as metas que entram no
  // checklist e a ordem das setinhas do minimapa até o chefe — antes
  // chumbadas em GanguesCena.jsx.
  posMuro: {
    metas: ['posmuro_1', 'posmuro_2'],
    // boca do túnel (enquanto o jogador ainda está do lado de cá do muro)
    passagem: { nome: 'games.gangues.cena.minimapa.tunel', pos: { x: 452, y: 1404 } },
    // porta da dungeon final (depois das metas pós-muro)
    final: { nome: 'games.gangues.cena.minimapa.galpao', pos: { x: 596, y: 262 } },
  },
}
