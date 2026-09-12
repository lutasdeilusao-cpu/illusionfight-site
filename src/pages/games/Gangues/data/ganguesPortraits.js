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
// import.meta.glob descobre sozinho o que existir na pasta — hoje só 5 dos
// 30 personagens têm arte (os 5 iniciais: trinca, fenda, muro, catraca,
// faisca). Quem não tem retrato ainda cai no fallback (inicial do nome),
// já tratado em cada componente que consome getGanguesPortrait().
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
