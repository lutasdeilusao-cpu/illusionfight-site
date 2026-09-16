// Máquina de animação de combate — registro de dados + cache/preload.
// Substitui o protótipo hardcoded do Trinca (só ele, só DramaticDice.jsx,
// `GANGUES_TRINCA_SPRITE_TESTE_ID` fixo) por um sistema genérico, pedido do
// Isaias em 16/09/2026 depois de aprovar o teste: "a partir de agora a
// gente vai implementar uma máquina de animação... vai ser oficial os 30
// personagens recrutáveis... animação de ataque normal, poderes especiais
// (uma específica pra cada um) e defendendo — só do jogador, os inimigos
// não entram (exceto os 7 chefes, tratados à parte depois)".
//
// Hoje só `ataqueNormal` tem uso real (Trinca + Muro) — `poder`/`defesa`
// ficam como formato já pronto no dado (mesma convenção de pasta), sem
// nenhuma tela ainda consumindo eles (não existe HOJE nenhum "momento" de
// defesa na tela de combate — é conceito novo, fica pra quando tiver
// arte+design desse momento).
//
// Convenção de arquivo — mesma ideia de ganguesPortraits.js/
// ganguesEnemyPortraits.js (pasta por personagem), estendida com o tipo de
// golpe: `assets/personagens/<slug>/ataque-normal.webp` (uma folha 4×4/16
// quadros), `.../defesa.webp`, `.../poder-<id>.webp` (id = special_path ou
// o id exato do poder — decisão de conteúdo, o sistema aceita qualquer
// string). Cada folha vem com uma folha 4×4 igual em proporção — o
// tamanho de quadro (frameW/frameH) é dado explícito por personagem
// porque nada garante que toda arte futura tenha a mesma proporção 4:3
// que Trinca/Muro tiveram por coincidência (ambos vieram de fonte
// 1448×1086).
const ATAQUE_NORMAL_SHEETS = import.meta.glob('../assets/personagens/*/ataque-normal.webp', { eager: true, import: 'default' })

const SHEETS_POR_SLUG = {}
for (const [caminho, url] of Object.entries(ATAQUE_NORMAL_SHEETS)) {
  const slug = caminho.match(/personagens\/([^/]+)\/ataque-normal\.webp$/)?.[1]
  if (slug) SHEETS_POR_SLUG[slug] = url
}

// Sons do jogo TAMBÉM moram dentro da própria pasta do jogo (import de
// verdade, igual as folhas de sprite acima) — nada de áudio de Gangues em
// `public/` (achado/corrigido 16/09/2026: um som novo tinha ido parar em
// `public/sounds/`, fora da árvore do jogo; o Isaias pediu pra nunca mais
// deixar nada do jogo espalhado fora de `src/pages/games/Gangues/`).
// `assets/sons/<arquivo>.mp3` num glob só, resolvido por NOME de arquivo
// (sem pasta por personagem — é só áudio curto, não precisa da mesma
// estrutura de pasta-por-entidade dos retratos/sprites).
const SONS = import.meta.glob('../assets/sons/*.mp3', { eager: true, import: 'default' })
const SOM_POR_NOME = {}
for (const [caminho, url] of Object.entries(SONS)) {
  const nome = caminho.match(/sons\/([^/]+)\.mp3$/)?.[1]
  if (nome) SOM_POR_NOME[nome] = url
}
/** Resolve um "nome de som" (sem extensão/pasta) pra URL importada de
 *  verdade — usado pelos dados abaixo em vez de escrever o caminho como
 *  string solta (assim um nome errado vira `undefined` na hora, não um
 *  404 silencioso só descoberto jogando). */
function som(nome) {
  const url = SOM_POR_NOME[nome]
  if (!url) throw new Error(`[ganguesCombatAnimations] som "${nome}" não existe em assets/sons/`)
  return url
}

// character_template_id (catálogo dos 30 recrutáveis) -> slug da pasta.
const TEMPLATE_SLUG = {
  1: 'trinca',
  11: 'muro',
}

// Dados de animação por slug — grade, timing e sons. `golpes` marca os
// quadros de impacto (1-indexado, como aparece pro Isaias olhando a folha
// no editor de imagem) cada um com seu próprio som — sprites diferentes
// podem ter 1, 2 ou mais impactos (o Trinca tem 1 soco reto; o Muro bate
// 2x, quadro 6 e quadro 12, cada soco com um som PRÓPRIO — pedido
// explícito: "esse deve ter som de soco diferente, tem que ser 2 sons de
// socos diferentes"). `voz`/`ambiente` tocam desde o quadro 1; `ambiente`
// é opcional (o Trinca tem a corrente do seu equipamento balançando, o
// Muro não usa esse acessório e não tem esse som).
const DADOS_POR_SLUG = {
  trinca: {
    frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
    sons: {
      ambiente: som('trinca-corrente'),
      voz: som('trinca-ahh'),
      golpes: [{ frame: 9, arquivo: som('trinca-soco') }],
    },
  },
  muro: {
    frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
    sons: {
      voz: som('muro-ahh'),
      golpes: [
        { frame: 6, arquivo: som('muro-soco1') },
        { frame: 12, arquivo: som('muro-soco2') },
      ],
    },
  },
}

/** Config completa da animação de ataque normal do personagem (ou null se
 *  ele ainda não tem arte própria — quem chama cai pro visual de sempre,
 *  igual `getGanguesPortrait` faz quando falta retrato). */
export function getGanguesAtaqueNormalAnimacao(characterTemplateId) {
  const slug = TEMPLATE_SLUG[characterTemplateId]
  const sheet = slug && SHEETS_POR_SLUG[slug]
  const dados = slug && DADOS_POR_SLUG[slug]
  if (!sheet || !dados) return null
  return { slug, sheet, ...dados }
}

// ── Pré-carregamento (pedido do Isaias: "durante a batalha já deixa
// carregada... não precisa ficar baixando toda hora") ───────────────────
// Cache em nível de módulo (sobrevive entre lutas e entre remontagens de
// DramaticDice — só baixa/decodifica cada arquivo UMA vez por sessão de
// jogo, nunca de novo a cada golpe). `precarregarAnimacaoCombate` é
// chamado 1x quando a batalha começa (GanguesCombat.jsx), pra cada membro
// do time do jogador que tiver animação registrada.
const AUDIO_CACHE = new Map() // url -> HTMLAudioElement (já com .load() chamado)
const IMAGEM_CACHE = new Set() // urls já pedidas (aquece o cache HTTP do navegador)

function pegarAudio(url) {
  let audio = AUDIO_CACHE.get(url)
  if (!audio) {
    audio = new Audio(url)
    audio.preload = 'auto'
    audio.load()
    AUDIO_CACHE.set(url, audio)
  }
  return audio
}

export function precarregarAnimacaoCombate(characterTemplateId) {
  const anim = getGanguesAtaqueNormalAnimacao(characterTemplateId)
  if (!anim) return
  if (!IMAGEM_CACHE.has(anim.sheet)) {
    IMAGEM_CACHE.add(anim.sheet)
    const img = new Image()
    img.src = anim.sheet
  }
  if (anim.sons.ambiente) pegarAudio(anim.sons.ambiente)
  if (anim.sons.voz) pegarAudio(anim.sons.voz)
  for (const golpe of anim.sons.golpes || []) pegarAudio(golpe.arquivo)
}

/** Toca um som já pré-carregado (reinicia do começo — o mesmo <audio> é
 *  reaproveitado em ataques seguintes do mesmo personagem na luta). */
export function tocarSomCombate(url, volume = 0.7) {
  const audio = pegarAudio(url)
  audio.currentTime = 0
  audio.volume = volume
  audio.play().catch(() => {})
}
