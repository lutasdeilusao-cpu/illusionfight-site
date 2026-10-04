import { getGanguesLevelFromXp } from './ganguesCharacters.js'
import { GANGUES_VENDA_FRAC } from './ganguesItens.js'
import { somaFixaDasCartas } from './ganguesCartas.js'
/* ══════════════════════════════════════════════════════════════
   Catálogo de EQUIPAMENTO — pedido do Isaias.

   ⚠️ ID É NÚMERO, NUNCA NOME. O código só referencia item por `id`
   numérico (mesma regra do catálogo dos 30 personagens). O `slug` é só
   pra leitura humana aqui no arquivo — nada no código depende dele. O
   NOME que aparece na tela mora no i18n (`games.gangues.equip.itens.<id>`
   nos 3 idiomas) — dá pra renomear "Colete de Couro" → "Colete de Pano"
   mexendo SÓ no JSON de idioma, sem tocar em nada aqui.

   Faixa de id: equipamento é 101+ (consumível em data/ganguesItens.js é
   1–99) — faixas separadas de propósito, os dois catálogos alimentam o
   mesmo `poi.itens` da loja e o mesmo resolvedor.

   Cada personagem tem 6 slots (arma + 5 de vestimenta). Bônus = atributo
   em FAIXA (A/H/D, ver abaixo) OU recurso plano (pv/pm — somado em cima do PV/PM máximo,
   NÃO passa por R; +R mexia em PV e PM ao mesmo tempo e ficou forte
   demais). Slot `corpo` é a escolha PV vs PM. `cardSlots` 0–2 (teto 2,
   estilo Ragnarok) — as cartas em si vêm com o sistema de drop.

   Regra de remoção de carta (decisão do Isaias): tirar carta encaixada
   DESTRÓI a carta. Desequipar o item inteiro NÃO.
   ══════════════════════════════════════════════════════════════ */

// Ordem dos slots na UI (bonecão de cima pra baixo, arma por último).
export const GANGUES_EQUIP_SLOTS = [
  { id: 'cabeca', icone: '🪖' },
  { id: 'corpo', icone: '🦺' },
  { id: 'bracos', icone: '🧤' },
  { id: 'pes', icone: '🥾' },
  { id: 'amuleto', icone: '📿' },
  { id: 'arma', icone: '🥊' },
]

export const GANGUES_EQUIP_SLOT_IDS = GANGUES_EQUIP_SLOTS.map(slot => slot.id)

// Chaves de bônus: atributo (A/H/D) ou recurso plano (pv/pm).
export const GANGUES_EQUIP_ATTR_KEYS = ['A', 'H', 'D', 'PM']
export const GANGUES_EQUIP_RES_KEYS = ['pv', 'pm']

const i18nNome = id => `games.gangues.equip.itens.${id}`

// ── FAIXA (range) de bônus — pedido do Isaias, 27/09/2026 (plano completo em
// docs/Games/Gangues/PLANO_ITENS_RANGE.md): Porrada (A), Couro (D) e Pique
// (H) viraram FAIXA — `bonus: { A: [1, 3] }` rola de 1 a 3. Número solto
// continua valendo como fixo. Osso/Malandragem (pv/pm) ficam SEMPRE fixos:
// vida máxima mudando a cada luta não é "arma imprevisível", é só confuso.
//  • A rola a cada golpe, D a cada defesa, H uma vez no começo da luta.
//  • Toda faixa nasceu CENTRADA no valor fixo de antes (a Faca era +2 → 1–3,
//    média 2): simulado, +2 fixo × 1–3 empata em 50,3% num duelo espelhado —
//    o balanço já calibrado da Pista não muda, só a emoção de cada golpe.
//  • Preço = arredonda5(Σ média × peso × raridade). Pesos por ponto de média:
//    A 28 · D 22 · H 30 (Pique é velocidade desde o sistema do Pique, o
//    ponto mais valioso) · pv/pm 6. Raridade: comum 1 · incomum 1,1 ·
//    raro 1,3 · épico 1,6. Sem `custo` = não vende em loja (drop/recompensa).
// Lista bruta — id numérico + slug só pra humano. O resto é dado de balanço.
// Catálogo POR CAMINHO (28/09/2026, Isaias — substitui por completo o 101–120,
// que sumiu dos saves). `caminho` = quem equipa: atacante (Porradeiro),
// defensor (Paredão), mistico (Mandingueiro) ou livre (qualquer um).
// Preço (29/09/2026): comum ×2, incomum ×2,5 do valor inicial — equipar a
// dupla no comum ≈ a Pista inteira + 1 vitória no Clube.
// Orçamento calibrado por simulação contra o Carvão (dupla): conjunto comum
// completo ≈ 2–3 níveis, incomum ≈ 4–5. Porrada/Couro só no incomum (+1 de
// Porrada num comum já valia ~4 níveis). O Mandingueiro rende mais com o
// mesmo orçamento (Malandragem `PM` = força do talento + gás). O Paredão
// nunca passa de +1 de Porrada.
const CATALOGO = [
  { id: 201, slug: 'cabo_vassoura', caminho: 'atacante', slot: 'arma', raridade: 'comum', bonus: { H: [0, 2] }, cardSlots: 0, custo: 35, icone: '🧹' },
  { id: 202, slug: 'bone_aba_reta', caminho: 'atacante', slot: 'cabeca', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🧢' },
  { id: 203, slug: 'regata_rasgada', caminho: 'atacante', slot: 'corpo', raridade: 'comum', bonus: { pv: 3 }, cardSlots: 0, custo: 30, icone: '🎽' },
  { id: 204, slug: 'faixa_punho', caminho: 'atacante', slot: 'bracos', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🩹' },
  { id: 205, slug: 'tenis_furado', caminho: 'atacante', slot: 'pes', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '👟' },
  { id: 206, slug: 'corrente_lata', caminho: 'atacante', slot: 'amuleto', raridade: 'comum', bonus: { pm: 2 }, cardSlots: 0, custo: 30, icone: '📿' },
  { id: 207, slug: 'soqueira_ferro', caminho: 'atacante', slot: 'arma', raridade: 'incomum', bonus: { A: [1, 3] }, cardSlots: 1, custo: 150, icone: '🥊' },
  { id: 208, slug: 'bandana_bonde', caminho: 'atacante', slot: 'cabeca', raridade: 'incomum', bonus: { pv: 2 }, cardSlots: 1, custo: 75, icone: '🏴' },
  { id: 209, slug: 'jaqueta_couro', caminho: 'atacante', slot: 'corpo', raridade: 'incomum', bonus: { pv: 4 }, cardSlots: 1, custo: 95, icone: '🧥' },
  { id: 210, slug: 'munhequeira', caminho: 'atacante', slot: 'bracos', raridade: 'incomum', bonus: { H: [0, 2] }, cardSlots: 1, custo: 100, icone: '🤛' },
  { id: 211, slug: 'coturno', caminho: 'atacante', slot: 'pes', raridade: 'incomum', bonus: { pv: 1 }, cardSlots: 1, custo: 70, icone: '🥾' },
  { id: 212, slug: 'dente_ouro', caminho: 'atacante', slot: 'amuleto', raridade: 'incomum', bonus: { pm: 2 }, cardSlots: 1, custo: 75, icone: '🦷' },
  { id: 213, slug: 'cano_curto', caminho: 'defensor', slot: 'arma', raridade: 'comum', bonus: { pv: 2 }, cardSlots: 0, custo: 30, icone: '🪈' },
  { id: 214, slug: 'gorro_moletom', caminho: 'defensor', slot: 'cabeca', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🧶' },
  { id: 215, slug: 'colete_reforcado', caminho: 'defensor', slot: 'corpo', raridade: 'comum', bonus: { pv: 4 }, cardSlots: 0, custo: 35, icone: '🦺' },
  { id: 216, slug: 'luva_couro', caminho: 'defensor', slot: 'bracos', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🧤' },
  { id: 217, slug: 'chinelo_reforcado', caminho: 'defensor', slot: 'pes', raridade: 'comum', bonus: { pv: 2 }, cardSlots: 0, custo: 30, icone: '🩴' },
  { id: 218, slug: 'medalhinha', caminho: 'defensor', slot: 'amuleto', raridade: 'comum', bonus: { pm: 2 }, cardSlots: 0, custo: 30, icone: '🏅' },
  { id: 219, slug: 'tampa_bueiro', caminho: 'defensor', slot: 'arma', raridade: 'incomum', bonus: { D: [0, 2] }, cardSlots: 1, custo: 110, icone: '🛡️' },
  { id: 220, slug: 'capacete_obra', caminho: 'defensor', slot: 'cabeca', raridade: 'incomum', bonus: { D: [0, 2] }, cardSlots: 1, custo: 110, icone: '⛑️' },
  { id: 221, slug: 'colete_placa', caminho: 'defensor', slot: 'corpo', raridade: 'incomum', bonus: { pv: 8 }, cardSlots: 1, custo: 125, icone: '🛡' },
  { id: 222, slug: 'bracadeira_pneu', caminho: 'defensor', slot: 'bracos', raridade: 'incomum', bonus: { pv: 2 }, cardSlots: 1, custo: 70, icone: '⛓️' },
  { id: 223, slug: 'bota_biqueira', caminho: 'defensor', slot: 'pes', raridade: 'incomum', bonus: { pv: 3 }, cardSlots: 1, custo: 80, icone: '🥾' },
  { id: 224, slug: 'terco_vo', caminho: 'defensor', slot: 'amuleto', raridade: 'incomum', bonus: { pm: 2 }, cardSlots: 1, custo: 75, icone: '📿' },
  { id: 225, slug: 'vela_preta', caminho: 'mistico', slot: 'arma', raridade: 'comum', bonus: { PM: 1 }, cardSlots: 0, custo: 45, icone: '🕯️' },
  { id: 226, slug: 'capuz_surrado', caminho: 'mistico', slot: 'cabeca', raridade: 'comum', bonus: { pm: 2 }, cardSlots: 0, custo: 25, icone: '🧙' },
  { id: 227, slug: 'manto_feira', caminho: 'mistico', slot: 'corpo', raridade: 'comum', bonus: { pm: 4 }, cardSlots: 0, custo: 35, icone: '🥻' },
  { id: 228, slug: 'pulseira_micanga', caminho: 'mistico', slot: 'bracos', raridade: 'comum', bonus: { pv: 2 }, cardSlots: 0, custo: 25, icone: '📿' },
  { id: 229, slug: 'sandalia_couro', caminho: 'mistico', slot: 'pes', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '👡' },
  { id: 230, slug: 'guia_contas', caminho: 'mistico', slot: 'amuleto', raridade: 'comum', bonus: { pm: 2 }, cardSlots: 0, custo: 30, icone: '🔮' },
  { id: 231, slug: 'cajado_galho', caminho: 'mistico', slot: 'arma', raridade: 'incomum', bonus: { A: [0, 2] }, cardSlots: 1, custo: 110, icone: '🪄' },
  { id: 232, slug: 'turbante', caminho: 'mistico', slot: 'cabeca', raridade: 'incomum', bonus: { PM: 1 }, cardSlots: 1, custo: 110, icone: '👳' },
  { id: 233, slug: 'manto_sintonia', caminho: 'mistico', slot: 'corpo', raridade: 'incomum', bonus: { pm: 5, pv: 2 }, cardSlots: 1, custo: 125, icone: '🥋' },
  { id: 234, slug: 'anel_coco', caminho: 'mistico', slot: 'bracos', raridade: 'incomum', bonus: { pv: 3 }, cardSlots: 1, custo: 70, icone: '💍' },
  { id: 235, slug: 'chinelo_benzido', caminho: 'mistico', slot: 'pes', raridade: 'incomum', bonus: { pm: 3 }, cardSlots: 1, custo: 75, icone: '🩴' },
  { id: 236, slug: 'olho_grego', caminho: 'mistico', slot: 'amuleto', raridade: 'incomum', bonus: { PM: 1 }, cardSlots: 1, custo: 110, icone: '🧿' },
  { id: 237, slug: 'soqueira_lata', caminho: 'livre', slot: 'arma', raridade: 'comum', bonus: { A: [0, 2] }, cardSlots: 0, icone: '🥊' },
  { id: 238, slug: 'bone_vira_lata', caminho: 'livre', slot: 'cabeca', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 20, icone: '🧢' },
  // ── RARO (Baixada, 29/09/2026) — a loja do depósito do Seu Nono. Mesmo
  // orçamento por caminho de antes, ~1,5× o incomum: Porradeiro ≈9,7,
  // Paredão ≈10,3, Mandingueiro ≈10,7 (o Mandingueiro segue acima).
  { id: 301, slug: 'espeto_churrasco', caminho: 'atacante', slot: 'arma', raridade: 'raro', bonus: { A: [2, 4] }, cardSlots: 2, custo: 330, icone: '🍢' },
  { id: 302, slug: 'capuz_preto', caminho: 'atacante', slot: 'cabeca', raridade: 'raro', bonus: { pv: 3 }, cardSlots: 2, custo: 75, icone: '🥷' },
  { id: 303, slug: 'colete_cravejado', caminho: 'atacante', slot: 'corpo', raridade: 'raro', bonus: { pv: 6 }, cardSlots: 2, custo: 135, icone: '🦺' },
  { id: 304, slug: 'luva_boxe_rasgada', caminho: 'atacante', slot: 'bracos', raridade: 'raro', bonus: { H: [1, 3] }, cardSlots: 2, custo: 240, icone: '🥊' },
  { id: 305, slug: 'tenis_falsificado', caminho: 'atacante', slot: 'pes', raridade: 'raro', bonus: { H: [0, 2] }, cardSlots: 2, custo: 120, icone: '👟' },
  { id: 306, slug: 'corrente_prata', caminho: 'atacante', slot: 'amuleto', raridade: 'raro', bonus: { pm: 2 }, cardSlots: 2, custo: 45, icone: '⛓️' },
  { id: 307, slug: 'porta_geladeira', caminho: 'defensor', slot: 'arma', raridade: 'raro', bonus: { D: [1, 3] }, cardSlots: 2, custo: 165, icone: '🚪' },
  { id: 308, slug: 'capacete_moto', caminho: 'defensor', slot: 'cabeca', raridade: 'raro', bonus: { D: [0, 2] }, cardSlots: 2, custo: 90, icone: '🪖' },
  { id: 309, slug: 'colete_pneu', caminho: 'defensor', slot: 'corpo', raridade: 'raro', bonus: { pv: 10 }, cardSlots: 2, custo: 240, icone: '🛞' },
  { id: 310, slug: 'caneleira_cano', caminho: 'defensor', slot: 'bracos', raridade: 'raro', bonus: { pv: 4 }, cardSlots: 2, custo: 90, icone: '🦾' },
  { id: 311, slug: 'bota_seguranca', caminho: 'defensor', slot: 'pes', raridade: 'raro', bonus: { pv: 5 }, cardSlots: 2, custo: 120, icone: '🥾' },
  { id: 312, slug: 'figa_arruda', caminho: 'defensor', slot: 'amuleto', raridade: 'raro', bonus: { pm: 3 }, cardSlots: 2, custo: 75, icone: '🤞' },
  { id: 313, slug: 'cajado_arruda', caminho: 'mistico', slot: 'arma', raridade: 'raro', bonus: { PM: 2 }, cardSlots: 2, custo: 315, icone: '🌿' },
  { id: 314, slug: 'chapeu_palha', caminho: 'mistico', slot: 'cabeca', raridade: 'raro', bonus: { pm: 4 }, cardSlots: 2, custo: 90, icone: '👒' },
  { id: 315, slug: 'manto_chita', caminho: 'mistico', slot: 'corpo', raridade: 'raro', bonus: { pm: 6, pv: 3 }, cardSlots: 2, custo: 210, icone: '🥻' },
  { id: 316, slug: 'fita_bonfim', caminho: 'mistico', slot: 'bracos', raridade: 'raro', bonus: { pv: 4 }, cardSlots: 2, custo: 90, icone: '🎗️' },
  { id: 317, slug: 'sandalia_corda', caminho: 'mistico', slot: 'pes', raridade: 'raro', bonus: { pm: 4 }, cardSlots: 2, custo: 90, icone: '🩴' },
  { id: 318, slug: 'patua', caminho: 'mistico', slot: 'amuleto', raridade: 'raro', bonus: { PM: 1, pm: 2 }, cardSlots: 2, custo: 210, icone: '🧿' },
  // ── PESADO da Vila (Brechó da Síndica, PLANO_VILA.md §6.1) — custo ≈ 1,4× o
  // raro equivalente. 405 e 412 não vendem: são o prêmio dos dois Generais. ──
  { id: 401, slug: 'chave_de_cano', caminho: 'atacante', slot: 'arma', raridade: 'pesado', bonus: { A: [3, 5] }, cardSlots: 2, custo: 460, icone: '🔧' },
  { id: 402, slug: 'capacete_obra_pintado', caminho: 'atacante', slot: 'cabeca', raridade: 'pesado', bonus: { pv: 3 }, cardSlots: 2, custo: 105, icone: '⛑️' },
  { id: 403, slug: 'colete_do_bonde', caminho: 'atacante', slot: 'corpo', raridade: 'pesado', bonus: { pv: 6, D: [0, 2] }, cardSlots: 2, custo: 230, icone: '🦺' },
  { id: 404, slug: 'cotoveleira_borracha', caminho: 'atacante', slot: 'bracos', raridade: 'pesado', bonus: { H: [1, 3] }, cardSlots: 2, custo: 335, icone: '💪' },
  { id: 405, slug: 'bota_de_trabalho', caminho: 'atacante', slot: 'pes', raridade: 'pesado', bonus: { A: [0, 2] }, cardSlots: 2, custo: 250, icone: '🥾' },
  { id: 406, slug: 'molho_de_chaves', caminho: 'atacante', slot: 'amuleto', raridade: 'pesado', bonus: { pm: 3 }, cardSlots: 2, custo: 65, icone: '🗝️' },
  { id: 407, slug: 'porta_de_aco', caminho: 'defensor', slot: 'arma', raridade: 'pesado', bonus: { D: [2, 4], A: 1 }, cardSlots: 2, custo: 330, icone: '🚪' },
  { id: 408, slug: 'balde_de_concreto', caminho: 'defensor', slot: 'cabeca', raridade: 'pesado', bonus: { D: [0, 2] }, cardSlots: 2, custo: 125, icone: '🪣' },
  { id: 409, slug: 'colchao_amarrado', caminho: 'defensor', slot: 'corpo', raridade: 'pesado', bonus: { pv: 12 }, cardSlots: 2, custo: 335, icone: '🛏️' },
  { id: 410, slug: 'grade_de_janela', caminho: 'defensor', slot: 'bracos', raridade: 'pesado', bonus: { D: [0, 2] }, cardSlots: 2, custo: 125, icone: '🪟' },
  { id: 411, slug: 'bota_de_borracha', caminho: 'defensor', slot: 'pes', raridade: 'pesado', bonus: { pv: 6 }, cardSlots: 2, custo: 170, icone: '🥾' },
  { id: 412, slug: 'cracha_da_sindica', caminho: 'defensor', slot: 'amuleto', raridade: 'pesado', bonus: { pm: 3, pv: 3 }, cardSlots: 2, custo: 170, icone: '🪪' },
  { id: 413, slug: 'antena_de_tv', caminho: 'mistico', slot: 'arma', raridade: 'pesado', bonus: { PM: [3, 5] }, cardSlots: 2, custo: 440, icone: '📡' },
  { id: 414, slug: 'touca_de_aluminio', caminho: 'mistico', slot: 'cabeca', raridade: 'pesado', bonus: { pm: 4, A: 1 }, cardSlots: 2, custo: 200, icone: '🧢' },
  { id: 415, slug: 'cortina_de_renda', caminho: 'mistico', slot: 'corpo', raridade: 'pesado', bonus: { pm: 6, pv: 3, D: 1 }, cardSlots: 2, custo: 330, icone: '🥻' },
  { id: 416, slug: 'pulseira_de_fio', caminho: 'mistico', slot: 'bracos', raridade: 'pesado', bonus: { H: 1, pv: 3 }, cardSlots: 2, custo: 190, icone: '🧵' },
  { id: 417, slug: 'chinelo_de_quarto', caminho: 'mistico', slot: 'pes', raridade: 'pesado', bonus: { pm: 4 }, cardSlots: 2, custo: 125, icone: '🩴' },
  { id: 418, slug: 'santinho_do_elevador', caminho: 'mistico', slot: 'amuleto', raridade: 'pesado', bonus: { PM: 1, pm: 2 }, cardSlots: 2, custo: 290, icone: '📿' },
  // ── GRIFE — Morro (30/09/2026, reequilíbrio: 1 categoria por bairro). ──
  { id: 501, slug: 'rojao_de_mao', caminho: 'atacante', slot: 'arma', raridade: 'grife', bonus: { A: [4, 6] }, cardSlots: 3, custo: 645, icone: '🧨' },
  { id: 502, slug: 'bone_de_grife', caminho: 'atacante', slot: 'cabeca', raridade: 'grife', bonus: { pv: 4 }, cardSlots: 3, custo: 145, icone: '🧢' },
  { id: 503, slug: 'jaqueta_da_frente', caminho: 'atacante', slot: 'corpo', raridade: 'grife', bonus: { pv: 8, D: [1, 3] }, cardSlots: 3, custo: 320, icone: '🧥' },
  { id: 504, slug: 'luva_de_pedreiro', caminho: 'atacante', slot: 'bracos', raridade: 'grife', bonus: { H: [2, 4] }, cardSlots: 3, custo: 470, icone: '🧤' },
  { id: 505, slug: 'tenis_de_grife', caminho: 'atacante', slot: 'pes', raridade: 'grife', bonus: { A: [1, 3] }, cardSlots: 3, custo: 350, icone: '👟' },
  { id: 506, slug: 'cordao_de_prata', caminho: 'atacante', slot: 'amuleto', raridade: 'grife', bonus: { pm: 4 }, cardSlots: 3, custo: 90, icone: '⛓️' },
  { id: 507, slug: 'tampa_de_caixa_dagua', caminho: 'defensor', slot: 'arma', raridade: 'grife', bonus: { D: [3, 5], A: 1 }, cardSlots: 3, custo: 460, icone: '🛡️' },
  { id: 508, slug: 'capacete_de_laje', caminho: 'defensor', slot: 'cabeca', raridade: 'grife', bonus: { D: [1, 3] }, cardSlots: 3, custo: 175, icone: '⛑️' },
  { id: 509, slug: 'colete_de_cimento', caminho: 'defensor', slot: 'corpo', raridade: 'grife', bonus: { pv: 16 }, cardSlots: 3, custo: 470, icone: '🦺' },
  { id: 510, slug: 'caneleira_de_bambu', caminho: 'defensor', slot: 'bracos', raridade: 'grife', bonus: { D: [1, 3] }, cardSlots: 3, custo: 175, icone: '🦾' },
  { id: 511, slug: 'bota_de_obra', caminho: 'defensor', slot: 'pes', raridade: 'grife', bonus: { pv: 8 }, cardSlots: 3, custo: 240, icone: '🥾' },
  { id: 512, slug: 'escapulario', caminho: 'defensor', slot: 'amuleto', raridade: 'grife', bonus: { pm: 4, pv: 4 }, cardSlots: 3, custo: 240, icone: '📿' },
  { id: 513, slug: 'vara_da_benzedeira', caminho: 'mistico', slot: 'arma', raridade: 'grife', bonus: { PM: [4, 6] }, cardSlots: 3, custo: 615, icone: '🪄' },
  { id: 514, slug: 'lenco_de_cabeca', caminho: 'mistico', slot: 'cabeca', raridade: 'grife', bonus: { pm: 5, A: 2 }, cardSlots: 3, custo: 280, icone: '🧕' },
  { id: 515, slug: 'saia_de_chita', caminho: 'mistico', slot: 'corpo', raridade: 'grife', bonus: { pm: 8, pv: 4, D: 2 }, cardSlots: 3, custo: 460, icone: '🥻' },
  { id: 516, slug: 'pulseira_de_semente', caminho: 'mistico', slot: 'bracos', raridade: 'grife', bonus: { H: 2, pv: 4 }, cardSlots: 3, custo: 265, icone: '📿' },
  { id: 517, slug: 'alpargata', caminho: 'mistico', slot: 'pes', raridade: 'grife', bonus: { pm: 5 }, cardSlots: 3, custo: 175, icone: '🩴' },
  { id: 518, slug: 'guia_de_sete_linhas', caminho: 'mistico', slot: 'amuleto', raridade: 'grife', bonus: { PM: 2, pm: 3 }, cardSlots: 3, custo: 405, icone: '🔮' },
  // ── NOBRE — Alto do Morro (30/09/2026, reequilíbrio: 1 categoria por bairro). ──
  { id: 601, slug: 'taco_de_sinuca', caminho: 'atacante', slot: 'arma', raridade: 'nobre', bonus: { A: [5, 7] }, cardSlots: 3, custo: 900, icone: '🎱' },
  { id: 602, slug: 'chapeu_panama', caminho: 'atacante', slot: 'cabeca', raridade: 'nobre', bonus: { pv: 5 }, cardSlots: 3, custo: 205, icone: '👒' },
  { id: 603, slug: 'paleto_riscado', caminho: 'atacante', slot: 'corpo', raridade: 'nobre', bonus: { pv: 10, D: [2, 4] }, cardSlots: 3, custo: 450, icone: '🧥' },
  { id: 604, slug: 'abotoadura_de_ouro', caminho: 'atacante', slot: 'bracos', raridade: 'nobre', bonus: { H: [3, 5] }, cardSlots: 3, custo: 655, icone: '💛' },
  { id: 605, slug: 'sapato_bicolor', caminho: 'atacante', slot: 'pes', raridade: 'nobre', bonus: { A: [2, 4] }, cardSlots: 3, custo: 490, icone: '👞' },
  { id: 606, slug: 'relogio_de_bolso', caminho: 'atacante', slot: 'amuleto', raridade: 'nobre', bonus: { pm: 5 }, cardSlots: 3, custo: 125, icone: '⌚' },
  { id: 607, slug: 'porta_de_cofre', caminho: 'defensor', slot: 'arma', raridade: 'nobre', bonus: { D: [4, 6], A: 1 }, cardSlots: 3, custo: 645, icone: '🚪' },
  { id: 608, slug: 'boina_de_feltro', caminho: 'defensor', slot: 'cabeca', raridade: 'nobre', bonus: { D: [2, 4] }, cardSlots: 3, custo: 245, icone: '🎩' },
  { id: 609, slug: 'sobretudo_blindado', caminho: 'defensor', slot: 'corpo', raridade: 'nobre', bonus: { pv: 19 }, cardSlots: 3, custo: 655, icone: '🧥' },
  { id: 610, slug: 'luva_de_couro_fino', caminho: 'defensor', slot: 'bracos', raridade: 'nobre', bonus: { D: [2, 4] }, cardSlots: 3, custo: 245, icone: '🧤' },
  { id: 611, slug: 'sapato_de_bico_fino', caminho: 'defensor', slot: 'pes', raridade: 'nobre', bonus: { pv: 10 }, cardSlots: 3, custo: 335, icone: '👞' },
  { id: 612, slug: 'medalha_do_alto', caminho: 'defensor', slot: 'amuleto', raridade: 'nobre', bonus: { pm: 5, pv: 5 }, cardSlots: 3, custo: 335, icone: '🏅' },
  { id: 613, slug: 'baralho_marcado', caminho: 'mistico', slot: 'arma', raridade: 'nobre', bonus: { PM: [5, 7] }, cardSlots: 3, custo: 860, icone: '🃏' },
  { id: 614, slug: 'oculos_escuros', caminho: 'mistico', slot: 'cabeca', raridade: 'nobre', bonus: { pm: 6, A: 2 }, cardSlots: 3, custo: 390, icone: '🕶️' },
  { id: 615, slug: 'colete_de_seda', caminho: 'mistico', slot: 'corpo', raridade: 'nobre', bonus: { pm: 10, pv: 5, D: 2 }, cardSlots: 3, custo: 645, icone: '🥋' },
  { id: 616, slug: 'anel_de_formatura', caminho: 'mistico', slot: 'bracos', raridade: 'nobre', bonus: { H: 2, pv: 5 }, cardSlots: 3, custo: 370, icone: '💍' },
  { id: 617, slug: 'mocassim', caminho: 'mistico', slot: 'pes', raridade: 'nobre', bonus: { pm: 6 }, cardSlots: 3, custo: 245, icone: '👞' },
  { id: 618, slug: 'dado_viciado', caminho: 'mistico', slot: 'amuleto', raridade: 'nobre', bonus: { PM: 2, pm: 3 }, cardSlots: 3, custo: 570, icone: '🎲' },
  // ── LENDARIO — Laje (30/09/2026, reequilíbrio: 1 categoria por bairro). ──
  { id: 701, slug: 'facao_costurado', caminho: 'atacante', slot: 'arma', raridade: 'lendario', bonus: { A: [6, 8] }, cardSlots: 3, custo: 1260, icone: '🗡️' },
  { id: 702, slug: 'bandana_de_retalho', caminho: 'atacante', slot: 'cabeca', raridade: 'lendario', bonus: { pv: 6 }, cardSlots: 3, custo: 290, icone: '🏴' },
  { id: 703, slug: 'jaqueta_de_retalhos', caminho: 'atacante', slot: 'corpo', raridade: 'lendario', bonus: { pv: 11, D: [3, 5] }, cardSlots: 3, custo: 630, icone: '🧥' },
  { id: 704, slug: 'luva_remendada', caminho: 'atacante', slot: 'bracos', raridade: 'lendario', bonus: { H: [4, 6] }, cardSlots: 3, custo: 920, icone: '🧤' },
  { id: 705, slug: 'coturno_costurado', caminho: 'atacante', slot: 'pes', raridade: 'lendario', bonus: { A: [3, 5] }, cardSlots: 3, custo: 685, icone: '🥾' },
  { id: 706, slug: 'dedal_de_ferro', caminho: 'atacante', slot: 'amuleto', raridade: 'lendario', bonus: { pm: 6 }, cardSlots: 3, custo: 180, icone: '🔘' },
  { id: 707, slug: 'escudo_de_lona', caminho: 'defensor', slot: 'arma', raridade: 'lendario', bonus: { D: [5, 7], A: 1 }, cardSlots: 3, custo: 905, icone: '🛡️' },
  { id: 708, slug: 'capacete_remendado', caminho: 'defensor', slot: 'cabeca', raridade: 'lendario', bonus: { D: [3, 5] }, cardSlots: 3, custo: 345, icone: '⛑️' },
  { id: 709, slug: 'colcha_blindada', caminho: 'defensor', slot: 'corpo', raridade: 'lendario', bonus: { pv: 23 }, cardSlots: 3, custo: 920, icone: '🛏️' },
  { id: 710, slug: 'bracadeira_de_couro_grosso', caminho: 'defensor', slot: 'bracos', raridade: 'lendario', bonus: { D: [3, 5] }, cardSlots: 3, custo: 345, icone: '⛓️' },
  { id: 711, slug: 'bota_de_sola_dupla', caminho: 'defensor', slot: 'pes', raridade: 'lendario', bonus: { pv: 11 }, cardSlots: 3, custo: 465, icone: '🥾' },
  { id: 712, slug: 'carretel', caminho: 'defensor', slot: 'amuleto', raridade: 'lendario', bonus: { pm: 6, pv: 6 }, cardSlots: 3, custo: 465, icone: '🧵' },
  { id: 713, slug: 'agulha_de_croche', caminho: 'mistico', slot: 'arma', raridade: 'lendario', bonus: { PM: [6, 8] }, cardSlots: 3, custo: 1205, icone: '🪡' },
  { id: 714, slug: 'touca_de_trico', caminho: 'mistico', slot: 'cabeca', raridade: 'lendario', bonus: { pm: 8, A: 3 }, cardSlots: 3, custo: 550, icone: '🧶' },
  { id: 715, slug: 'manto_de_retalhos', caminho: 'mistico', slot: 'corpo', raridade: 'lendario', bonus: { pm: 11, pv: 6, D: 3 }, cardSlots: 3, custo: 905, icone: '🥻' },
  { id: 716, slug: 'fita_metrica', caminho: 'mistico', slot: 'bracos', raridade: 'lendario', bonus: { H: 3, pv: 6 }, cardSlots: 3, custo: 520, icone: '📏' },
  { id: 717, slug: 'pantufa_de_la', caminho: 'mistico', slot: 'pes', raridade: 'lendario', bonus: { pm: 8 }, cardSlots: 3, custo: 345, icone: '🥿' },
  { id: 718, slug: 'botao_do_retalho', caminho: 'mistico', slot: 'amuleto', raridade: 'lendario', bonus: { PM: 3, pm: 4 }, cardSlots: 3, custo: 795, icone: '🔵' },
  // ── ÉPICO de chefe — drop, nunca à venda, qualquer caminho (vem da branch
  // da Feira, 27/09/2026). Faixa de valor: rola a cada golpe. ──
  { id: 138, slug: 'porrete_do_cobrador', caminho: 'livre', slot: 'arma', raridade: 'epico', bonus: { A: [3, 7], H: [1, 3], D: [0, 2] }, cardSlots: 2, icone: '🏏' },
  // O Espeto do Fura-Bucho — prêmio da 1ª vitória contra o chefe da Baixada.
  { id: 140, slug: 'espeto_do_fura_bucho', caminho: 'livre', slot: 'arma', raridade: 'epico', bonus: { A: [3, 6], D: [1, 3] }, cardSlots: 2, icone: '🗡️' },
  { id: 139, slug: 'facao_do_carvao', caminho: 'livre', slot: 'arma', raridade: 'epico', bonus: { A: [2, 5], D: [0, 2] }, cardSlots: 2, icone: '🔪' },
  // A Coroa da Laje — prêmio da vitória contra o Retalho, o fim do jogo.
  { id: 133, slug: 'coroa_da_laje', caminho: 'livre', slot: 'cabeca', raridade: 'epico', bonus: { D: [2, 4], H: [1, 3] }, cardSlots: 2, icone: '👑' },
  // A Bengala do Contador — prêmio da 1ª vitória contra o chefe do Alto do Morro.
  { id: 135, slug: 'bengala_do_contador', caminho: 'livre', slot: 'amuleto', raridade: 'epico', bonus: { A: [1, 3], D: [1, 3] }, cardSlots: 2, icone: '🦯' },
  // A Vara da Fera — prêmio da 1ª vitória contra a Zefa (chefe do Morro).
  { id: 134, slug: 'vara_da_fera', caminho: 'livre', slot: 'arma', raridade: 'epico', bonus: { A: [4, 7], H: [1, 2] }, cardSlots: 2, icone: '🦯' },
  // O Taco da Ferrugem — prêmio da 1ª vitória contra o chefe da Vila.
  { id: 141, slug: 'taco_da_ferrugem', caminho: 'livre', slot: 'arma', raridade: 'epico', bonus: { A: [3, 6], D: [1, 4] }, cardSlots: 2, icone: '🏏' },
]

export const GANGUES_EQUIP = Object.fromEntries(CATALOGO.map(item => [item.id, { ...item, nome: i18nNome(item.id) }]))
export const GANGUES_EQUIP_LISTA = Object.values(GANGUES_EQUIP)

// Nível mínimo da peça (29/09/2026): sai da faixa do território que vende a
// raridade — comum = Pista (5), incomum = Feira (20), e daí pra cima segue a
// escada de tetos (GDD §9.7). Épico de chefe tem o nível da luta que o dá.
// Uma categoria por bairro (30/09/2026): o nível mínimo é a entrada do bairro.
const NIVEL_MIN_RARIDADE = { comum: 5, incomum: 20, raro: 33, pesado: 46, grife: 59, nobre: 72, lendario: 85, epico: 59 }
const NIVEL_MIN_PECA = { 139: 15, 138: 28, 140: 44 }

export function nivelMinEquip(def) {
  if (!def) return 1
  return NIVEL_MIN_PECA[def.id] ?? NIVEL_MIN_RARIDADE[def.raridade] ?? 1
}

/** O caminho do personagem aceita essa peça? (peça `livre` = qualquer um). */
export function caminhoAceitaGangues(def, member) {
  if (!def) return false
  return def.caminho === 'livre' || def.caminho === member?.combat_path
}

/** Esse personagem pode usar essa peça? Caminho certo E nível mínimo. */
export function podeEquiparGangues(def, member) {
  return caminhoAceitaGangues(def, member) && getGanguesLevelFromXp(member?.xp_total) >= nivelMinEquip(def)
}

export function getGanguesEquip(itemId) {
  const key = Number(itemId)
  if (!Number.isFinite(key)) return null
  return GANGUES_EQUIP[key] || null
}

/** Estrutura vazia dos 6 slots equipados de um personagem. */
export function emptyGanguesEquipment() {
  return GANGUES_EQUIP_SLOT_IDS.reduce((acc, slot) => { acc[slot] = null; return acc }, {})
}

/** Duas versões de cada peça: a da LOJA (sem encaixe, aprimora no ferreiro) e
 *  a de DROP (`encaixe: true`, 1 ou 2 encaixes de carta, pode já vir aprimorada
 *  do drop, mas nunca aprimora no ferreiro). Teto: 2 encaixes. */
export const GANGUES_ENCAIXES_MAX = 2
const nEncaixes = n => Math.min(GANGUES_ENCAIXES_MAX, Math.max(1, Number(n) || 1))
export const cartasVazias = (encaixe, n = 1, antigas = []) => encaixe ? Array.from({ length: nEncaixes(n) }, (_, i) => antigas?.[i] ?? null) : []
/** Nome da peça na tela: "Faca Serrilhada [2] +1" (com encaixe) ou "Faca Serrilhada +3". */
export const nomePeca = (t, def, peca = {}) => `${t(def?.nome || '')}${peca?.encaixe ? ` [${peca.cards?.length || 1}]` : ''}${peca?.aprim ? ` +${peca.aprim}` : ''}`

/** Normaliza o que veio do banco pro shape esperado (6 chaves, encaixes, itemId
 *  numérico, `aprim` dentro do teto da peça). Item que não existe mais no
 *  catálogo é descartado do slot. */
export function normalizeGanguesEquipment(equipment = {}) {
  const safe = emptyGanguesEquipment()
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const equipped = equipment?.[slot]
    const def = equipped && getGanguesEquip(equipped.itemId)
    if (!def || def.slot !== slot) continue
    const encaixe = Boolean(equipped.encaixe)
    safe[slot] = { itemId: def.id, encaixe, cards: cartasVazias(encaixe, equipped.cards?.length, equipped.cards), aprim: normalizarAprim(def, equipped.aprim) }
  }
  return safe
}

/** Instância de item pro inventário. `encaixe` = versão de drop, com `encaixes` (1 ou 2). */
export function createGanguesEquipInstance(itemId, aprim = 0, encaixe = false, encaixes = 1) {
  const def = getGanguesEquip(itemId)
  if (!def) return null
  return { uid: `eq-${def.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: def.id, encaixe, cards: cartasVazias(encaixe, encaixes), aprim: normalizarAprim(def, aprim) }
}

// ── Faixa, aprimoramento e rolagem ──────────────────────────────
// APRIMORAMENTO (plano em PLANO_ITENS_RANGE.md §3): só mexe no atributo
// PRINCIPAL da peça (o 1º com faixa). Nível ímpar = VANTAGEM (rola 2 vezes,
// fica com o maior); nível par = sobe o MÍNIMO em 1. Teto = mínimo encosta no
// máximo (faixa de 2 pontos → +4). "Com dois aprimoramentos, 1–3 dá 2–3."

/** O atributo que o aprimoramento mexe (1º A/H/D em faixa), ou null. */
export function atributoPrincipal(def) {
  if (!def?.bonus) return null
  return Object.keys(def.bonus).find(k => GANGUES_EQUIP_ATTR_KEYS.includes(k) && Array.isArray(def.bonus[k])) || null
}

/** Maior aprimoramento possível da peça (0 = não aprimora). */
export function aprimTeto(def) {
  const principal = atributoPrincipal(def)
  if (!principal) return 0
  const [min, max] = def.bonus[principal]
  return Math.max(0, 2 * (max - min))
}

function normalizarAprim(def, aprim) {
  const n = Math.floor(Number(aprim) || 0)
  return Math.max(0, Math.min(aprimTeto(def), n))
}

/** Faixa efetiva de `attr` numa peça, com o aprimoramento: { min, max, vant } ou null. */
function faixaDaPeca(def, attr, aprim = 0) {
  const raw = def?.bonus?.[attr]
  if (raw == null) return null
  if (!Array.isArray(raw)) {
    const v = Number(raw) || 0
    return v ? { min: v, max: v, vant: false } : null
  }
  let [min, max] = raw
  let vant = false
  if (attr === atributoPrincipal(def)) {
    const n = normalizarAprim(def, aprim)
    min = Math.min(max, min + Math.floor(n / 2))
    vant = n % 2 === 1 && min < max
  }
  return { min, max, vant }
}

/** Valor médio de uma faixa (com vantagem = média do maior de 2 dados). */
function mediaFaixa(f) {
  if (!f) return 0
  const n = f.max - f.min + 1
  if (!f.vant || n <= 1) return (f.min + f.max) / 2
  let soma = 0
  for (let v = f.min; v <= f.max; v++) soma += v * ((v - f.min + 1) ** 2 - (v - f.min) ** 2)
  return soma / (n * n)
}

/** Rola uma faixa (vantagem = rola 2, fica com o maior). */
export function rolarFaixa(f, rnd = Math.random) {
  if (!f) return 0
  const n = f.max - f.min + 1
  const um = () => f.min + Math.floor(rnd() * n)
  return f.vant ? Math.max(um(), um()) : um()
}

// Preço pela fórmula do plano (mesma dos preços do catálogo) — referência
// pra peça que não vende em loja (épico/prêmio) poder ser aprimorada também.
const PESO_PRECO = { A: 28, D: 22, H: 30, pv: 6, pm: 6 }
const FATOR_RARIDADE = { comum: 1, incomum: 1.1, raro: 1.3, pesado: 1.45, grife: 1.6, nobre: 1.75, lendario: 1.9, epico: 1.6 }
function precoReferencia(def) {
  if (!def) return 0
  if (Number.isFinite(def.custo)) return def.custo
  let soma = 0
  for (const [k, v] of Object.entries(def.bonus || {})) soma += (Array.isArray(v) ? (v[0] + v[1]) / 2 : Number(v) || 0) * (PESO_PRECO[k] || 0)
  return Math.round(soma * (FATOR_RARIDADE[def.raridade] || 1) / 5) * 5
}

/** Quanto a loja paga pela peça: 25% do preço (o da fórmula, se não vende), mínimo 1, +2 por nível de aprimoramento. */
export function precoVendaEquip(def, aprim = 0) {
  if (!def) return 0
  return Math.max(1, Math.floor(precoReferencia(def) * GANGUES_VENDA_FRAC)) + 2 * Math.max(0, Number(aprim) || 0)
}

// Custo de levar a peça pro nível `nivel` de aprimoramento: grana = 25% do
// preço × o nível (+1 = 25%, +4 = 100%, arredonda de 5 em 5, mínimo 5) e
// `nivel` pedaços de Sucata (item 13) — a Sucata vira recurso de verdade.
export const GANGUES_SUCATA_ID = 13
const GANGUES_APRIM_CUSTO_FRAC = 0.25
export function custoAprimoramento(def, nivel) {
  const grana = Math.max(5, Math.round(precoReferencia(def) * GANGUES_APRIM_CUSTO_FRAC * nivel / 5) * 5)
  return { grana, sucata: nivel }
}

/** Todas as faixas de A/H/D do que está equipado, peça por peça (o combate
 *  rola cada uma separado): { A: [{min,max,vant}], H: [...], D: [...] }. */
export function getGanguesEquipDados(equipment = {}) {
  const dados = { A: [], H: [], D: [], PM: [] }
  const safe = normalizeGanguesEquipment(equipment)
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const eq = safe[slot]
    const def = eq && getGanguesEquip(eq.itemId)
    if (!def) continue
    for (const attr of GANGUES_EQUIP_ATTR_KEYS) {
      const f = faixaDaPeca(def, attr, eq.aprim)
      if (f) dados[attr].push(f)
    }
  }
  return dados
}

/** Soma dos bônus de todos os itens equipados: A/H/D pela MÉDIA da faixa
 *  (pode ser fracionária — quem exibe arredonda) + pv/pm (recurso plano).
 *  Média, nunca máximo: loja/ficha/aviso de nível não prometem mais do que a
 *  arma entrega. */
export function getGanguesEquipBonuses(equipment = {}) {
  const total = { A: 0, H: 0, D: 0, PM: 0, pv: 0, pm: 0 }
  const safe = normalizeGanguesEquipment(equipment)
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const eq = safe[slot]
    const def = eq && getGanguesEquip(eq.itemId)
    if (!def) continue
    for (const attr of GANGUES_EQUIP_ATTR_KEYS) total[attr] += mediaFaixa(faixaDaPeca(def, attr, eq.aprim))
    for (const key of GANGUES_EQUIP_RES_KEYS) total[key] += Number(def.bonus?.[key]) || 0
  }
  // Soma fixa das cartas encaixadas (atributo, Osso, energia).
  const cartas = somaFixaDasCartas(safe)
  for (const k of Object.keys(total)) total[k] += cartas[k] || 0
  return total
}

/** "+1–3 Porrada ▲ · +6 PV" — resumo do bônus de uma peça nos 3 idiomas. */
export function textoBonusEquip(t, def, aprim = 0) {
  if (!def) return ''
  const parts = []
  for (const attr of GANGUES_EQUIP_ATTR_KEYS) {
    const f = faixaDaPeca(def, attr, aprim)
    if (!f) continue
    const valor = f.min === f.max ? `+${f.min}` : `+${f.min}–${f.max}`
    parts.push(`${valor}${f.vant ? '▲' : ''} ${t(`games.gangues.attr_labels.${attr}`)}`)
  }
  if (def.bonus?.pv) parts.push(`+${def.bonus.pv} PV`)
  if (def.bonus?.pm) parts.push(`+${def.bonus.pm} PM`)
  return parts.join(' · ')
}

/** Atributos A/H/D já com os bônus de equipamento somados (nunca abaixo de
 *  0) — PV/PM NÃO entram aqui: o bônus de equipamento pra eles é plano,
 *  somado direto no PV_max/PM_max (ver applyGanguesEquipResources), não no
 *  atributo em si (nunca foi, mesmo antes com R). */
export function getGanguesAttributesWithEquip(attributes = {}) {
  const bonuses = getGanguesEquipBonuses(attributes.equipment)
  const out = { ...attributes }
  for (const attr of GANGUES_EQUIP_ATTR_KEYS) out[attr] = Math.max(0, Math.round((Number(attributes[attr]) || 0) + (bonuses[attr] || 0)))
  return out
}

/** PV/PM máximos com o bônus PLANO de equipamento somado (não passa por R). */
export function applyGanguesEquipResources(resources = {}, equipment = {}) {
  const b = getGanguesEquipBonuses(equipment)
  return { ...resources, pvMax: (Number(resources.pvMax) || 0) + b.pv, pmMax: (Number(resources.pmMax) || 0) + b.pm }
}

/** Um mapa de equipamento HIPOTÉTICO com `itemId` encaixado no slot dele (troca o que tiver). */
export function withGanguesEquip(equipment = {}, itemId) {
  const eq = normalizeGanguesEquipment(equipment)
  const def = getGanguesEquip(itemId)
  if (def) eq[def.slot] = { itemId: def.id, encaixe: false, cards: [], aprim: 0 }
  return eq
}

/** Atributos efetivos SE `itemId` fosse equipado — usado pela loja pra prever a ficha. */
export function previewGanguesAttributesWithEquip(attributes = {}, itemId) {
  return getGanguesAttributesWithEquip({ ...attributes, equipment: withGanguesEquip(attributes.equipment, itemId) })
}
