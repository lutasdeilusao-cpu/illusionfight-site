// Retratos dos personagens — só a CABEÇA, pixel art (pedido do Isaias,
// set/2026: "juice"/identidade visual que estava faltando no jogo).
//
// Arte mora em src/pages/games/Gangues/assets/personagens/<slug>/<expressao>.png
// — uma PASTA por personagem (não um arquivo direto) de propósito: no
// futuro cada slug ganha mais de uma expressão (raiva, dor, vitória...)
// sem precisar tocar neste arquivo nem em nenhum componente. `slug` é o
// mesmo campo `.slug` do catálogo (ldi_gangues_30_personagens_v1.json),
// já existia lá, não inventei nome novo.
//
// import.meta.glob descobre sozinho o que existir na pasta — hoje 12 dos
// 30 personagens têm arte (os 12 oficiais, ids 1-12: trinca, fenda, muro,
// catraca, faisca, cicatriz, marreta, mira, navalha, ponto, sangue, troco).
// Quem não tem retrato ainda cai no fallback (inicial do nome), já tratado
// em cada componente que consome getGanguesPortrait().
import { getGanguesCharacter } from './ganguesCharacters.js'

const ARQUIVOS_NEUTRO = import.meta.glob('../assets/personagens/*/neutro.png', { eager: true, import: 'default' })

const PORTRAITS = { neutro: {} }
for (const [caminho, url] of Object.entries(ARQUIVOS_NEUTRO)) {
  const slug = caminho.match(/personagens\/([^/]+)\/neutro\.png$/)?.[1]
  if (slug) PORTRAITS.neutro[slug] = url
}

/** Retrato (cabeça) do personagem pelo slug do catálogo. `expressao` default
 *  'neutro' — é a única que existe hoje; outras (raiva, dor, vitória...)
 *  chegam depois sem mudar esta assinatura. Retorna null se não tiver
 *  arte pra esse slug/expressão ainda (a maioria do elenco, por ora). */
export function getGanguesPortrait(slug, expressao = 'neutro') {
  if (!slug) return null
  return PORTRAITS[expressao]?.[slug] || null
}

/** Atalho pra quando só se tem o character_template_id numérico (roster,
 *  combate) em vez do slug — resolve pelo catálogo. */
export function getGanguesPortraitByTemplateId(characterTemplateId, expressao = 'neutro') {
  if (!characterTemplateId) return null
  return getGanguesPortrait(getGanguesCharacter(characterTemplateId)?.slug, expressao)
}

// Corpo inteiro (3 poses: frente/costas/lado) — recorte do turnaround de
// referência (`<Nome>Sheet.png`, arte de corpo inteiro do Isaias) em 3
// arquivos separados por pasta, pedido pra dar o "primeiro contato" do
// jogador com o personagem (lobby de escolha inicial + recrutamento) em
// vez de só a cabeça, que continua usada em todo o resto do jogo (roster
// de combate, cena, progressão). Mesma convenção de pasta/slug dos
// retratos — mesmo glob, arquivo com nome diferente (`corpo-<pose>.webp`
// em vez de `neutro.png`; WebP porque é ilustração pintada de alto
// detalhe, não pixel art — paleta indexada da cabeça ficaria com banding
// feio aqui).
const ARQUIVOS_CORPO = import.meta.glob('../assets/personagens/*/corpo-*.webp', { eager: true, import: 'default' })

const CORPO = {}
for (const [caminho, url] of Object.entries(ARQUIVOS_CORPO)) {
  const match = caminho.match(/personagens\/([^/]+)\/corpo-(frente|costas|lado)\.webp$/)
  if (!match) continue
  const [, slug, pose] = match
  CORPO[slug] = CORPO[slug] || {}
  CORPO[slug][pose] = url
}

/** Poses disponíveis de corpo inteiro, na ordem em que o ciclo de toque
 *  deve percorrer (frente → costas → lado → frente...). */
export const GANGUES_CORPO_POSES = ['frente', 'costas', 'lado']

/** Uma pose de corpo inteiro do personagem pelo slug. `null` se esse slug
 *  ainda não tem arte de corpo (a maioria — só os 12 oficiais por ora). */
export function getGanguesCorpo(slug, pose = 'frente') {
  if (!slug) return null
  return CORPO[slug]?.[pose] || null
}

/** As 3 poses de uma vez (`{ frente, costas, lado }`) — usado pra decidir
 *  se vale a pena nem tentar mostrar o ciclo de corpo (sem nenhuma pose,
 *  cai no retrato de cabeça / fallback de sempre). */
export function getGanguesCorpoPoses(slug) {
  if (!slug) return null
  return CORPO[slug] || null
}
