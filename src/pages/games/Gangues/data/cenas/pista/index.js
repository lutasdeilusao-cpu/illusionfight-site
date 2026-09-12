/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Pista como CENA navegável
   (design + lore canônica: docs/Games/Gangues/LDI_GANGUES_GDD.md §17.6)

   O bairro deixa de ser "trilha de nós" e vira uma rua desenhada com
   PINOS (POIs). Cada POI tem um TIPO e um estado
   (escondido → disponível → resolvido). Resolver um POI revela o
   próximo pelo grafo `revela`. O portão do chefe abre quando os
   POIs-chave caíram (`portao`).

   Coordenadas dos pinos: viewBox "0 0 100 240" (rua vertical que rola).
   `ruaPath` é um <path> tortinho subindo — o Isaias troca por arte
   depois; a curva e os pinos ficam.

   TIPOS:
   • treta    → GanguesCombat (fluxo story-combat existente)
   • parada   → GanguesParada  (lib Puzzles/ com skin de gangue)
   • papo     → GanguesPapo    (GangDialog + escolhas)
   • corre    → GanguesCorre   (PuzzleStealthGrid com skin)
   • achado   → GanguesAchado  (loot, sem interação)
   • descanso → GanguesDescanso (cura fôlego gastando grana)

   Este arquivo (antes um único data/cenas/pista.js de 823 linhas) hoje só
   compõe as partes que moram nesta pasta — ver
   PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4/§5:
   ./mundo.js (geometria: rua/quarteirões/prédios/obstáculos/cenário/fiação),
   ./pools.js (moldes de inimigo por revezamento), ./pois.js (POIs do
   exterior), ./interiores.js (interiores navegáveis), ./posicoes.js
   (coordenadas de pino/zona de cada POI, lidas pelo motor genérico via
   cena.pos/cena.entryZones). As 4 funções genéricas de cena
   (temCena/portaoAberto/cenaCompleta/contarCena) saíram pra
   ../cenaHelpers.js, e o motor de navegação (montarAmbiente e cia) saiu
   pra ../../engine/ganguesCenaMotor.js — nenhum dos dois é específico
   da Pista.
   ══════════════════════════════════════════════════════════════ */
import { RUA_PISTA, MUNDO_PISTA, QUARTEIROES_PISTA, PREDIOS_PISTA, OBSTACULOS_PISTA, CENARIO_PISTA, FIACAO_PISTA } from './mundo.js'
import { POIS_PISTA } from './pois.js'
import { INTERIORES_PISTA } from './interiores.js'
import { POS_PISTA, ENTRY_ZONES_PISTA } from './posicoes.js'

export const CENA_PISTA = {
  id: 'pista',
  territorioId: 'pista',
  cor: '#3ddc97',
  ruaPath: RUA_PISTA,
  mundo: MUNDO_PISTA,
  quarteiroes: QUARTEIROES_PISTA,
  predios: PREDIOS_PISTA,
  obstaculos: OBSTACULOS_PISTA,
  cenario: CENARIO_PISTA,
  fiacao: FIACAO_PISTA,
  // Fala de chegada (voz da quebrada — uma ou duas linhas no GangDialog).
  chegada: 'games.gangues.cena.pista.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',

  pois: POIS_PISTA,
  // Coordenadas de pino/zona de interação — lidas pelo motor genérico
  // (engine/ganguesCenaMotor.js) via cena.pos/cena.entryZones, nunca de uma
  // constante global (ver data/cenas/pista/posicoes.js).
  pos: POS_PISTA,
  entryZones: ENTRY_ZONES_PISTA,

  // ── INTERIORES navegáveis (fase 2) ──────────────────────────
  interiores: INTERIORES_PISTA,

  // O chefe — só aparece quando o portão abre.
  chefe: {
    id: 'boss',
    poiNo: 'pista-chefe', // nó real em ganguesTerritorios.js (marcarNoDominado)
    tipo: 'treta',
    pino: { x: 50, y: 12 },
    // Nível recomendado da tropa pra encarar (aviso no TretaVS quando abaixo).
    // O Carvão tem orçamento fixo ~L15+; abaixo disso é pau feio.
    nivelRec: 15,
    i18n: 'games.gangues.cena.pista.boss',
    // Ficha própria (não mais "kaeda" emprestado) — o combate real agora
    // mostra "Fumaça" lutando, batendo com a fala/nome já usados na tela
    // de confronto (games.gangues.story.bosses.fumaca).
    enemy: 1500,
    forca: 3,
    boss: 'fumaca',
    recompensa: { grana: 20, rep: 5 },
  },

  // A área final só abre depois de todo o caminho obrigatório da Pista —
  // incluindo a Rasteira Velha (o General). Só aí o Carvão desce.
  portao: {
    precisa: ['sinal', 'ferro', 'beco', 'birosca', 'beco_2', 'beco_3', 'oficina', 'sinaleiro', 'rasteira_velha'],
  },
}
