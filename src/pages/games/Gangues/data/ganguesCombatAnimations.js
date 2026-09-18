// Máquina de animação de combate — registro de dados + cache/preload.
// Substitui o protótipo hardcoded do Trinca (só ele, só DramaticDice.jsx,
// `GANGUES_TRINCA_SPRITE_TESTE_ID` fixo) por um sistema genérico, pedido do
// Isaias em 16/09/2026 depois de aprovar o teste: "a partir de agora a
// gente vai implementar uma máquina de animação... vai ser oficial os 30
// personagens recrutáveis... animação de ataque normal, poderes especiais
// (uma específica pra cada um) e defendendo — só do jogador, os inimigos
// não entram (exceto os 7 chefes, tratados à parte depois)".
//
// Dois TIPOS com uso real hoje — `ataqueNormal` (toca quando o próprio
// personagem ataca) e `dano` (toca quando o personagem É ATACADO pelo
// oponente, pedido no mesmo dia: "sempre que eles forem atacados pelo
// oponente deve tocar essa animação"). `poder` ainda não tem consumidor —
// fica pra quando tiver arte+design desse momento.
//
// Convenção de arquivo — mesma ideia de ganguesPortraits.js/
// ganguesEnemyPortraits.js (pasta por personagem), estendida com o tipo de
// golpe: `assets/personagens/<slug>/ataque-normal.webp` (folha 4×4/16
// quadros), `.../dano.webp` (mesma grade), `.../poder-<id>.webp` (id =
// special_path ou o id exato do poder — decisão de conteúdo, o sistema
// aceita qualquer string). O tamanho de quadro (frameW/frameH) é dado
// explícito por personagem/tipo porque nada garante que toda arte futura
// tenha a mesma proporção 4:3 que Trinca/Muro tiveram (fonte 1448×1086).
const ATAQUE_NORMAL_SHEETS = import.meta.glob('../assets/personagens/*/ataque-normal.webp', { eager: true, import: 'default' })
const DANO_SHEETS = import.meta.glob('../assets/personagens/*/dano.webp', { eager: true, import: 'default' })

function mapaPorSlug(globResult, sufixoArquivo) {
  const regex = new RegExp(`personagens/([^/]+)/${sufixoArquivo}\\.webp$`)
  const mapa = {}
  for (const [caminho, url] of Object.entries(globResult)) {
    const slug = caminho.match(regex)?.[1]
    if (slug) mapa[slug] = url
  }
  return mapa
}

// tipo (usado por getGanguesAnimacao) -> mapa slug->URL da folha desse tipo.
const SHEETS_POR_TIPO = {
  ataqueNormal: mapaPorSlug(ATAQUE_NORMAL_SHEETS, 'ataque-normal'),
  dano: mapaPorSlug(DANO_SHEETS, 'dano'),
}

// Sons do jogo TAMBÉM moram dentro da própria pasta do jogo (import de
// verdade, igual as folhas de sprite acima) — nada de áudio de Gangues em
// `public/` (achado/corrigido 16/09/2026: um som novo tinha ido parar em
// `public/sounds/`, fora da árvore do jogo; o Isaias pediu pra nunca mais
// deixar nada do jogo espalhado fora de `src/pages/games/Gangues/`).
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
  2: 'fenda',
  3: 'muro',
  4: 'catraca',
  5: 'faisca',
}

// Dados de animação por slug e por tipo — grade, timing e sons. `golpes`
// marca os quadros de impacto (1-indexado, como aparece pro Isaias olhando
// a folha no editor de imagem) cada um com seu próprio som — sprites
// diferentes podem ter 1, 2 ou mais impactos. `voz`/`ambiente` tocam desde
// o quadro 1; `ambiente` é opcional (o Trinca tem a corrente do seu
// equipamento balançando, o Muro não usa esse acessório).
//
// `dano` (levando golpe) reaproveita a MESMA voz do `ataqueNormal` — pedido
// explícito: "vai usar a mesma fala do ataque normal pra tocar" — e por ora
// reaproveita também os mesmos arquivos de impacto do soco (nenhum áudio
// novo foi fornecido especificamente pra "tomando golpe" ainda).
const DADOS_POR_SLUG = {
  trinca: {
    ataqueNormal: {
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        ambiente: som('trinca-corrente'),
        voz: som('trinca-ahh'),
        golpes: [{ frame: 9, arquivo: som('trinca-soco') }],
      },
    },
    dano: {
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        voz: som('trinca-ahh'),
        golpes: [
          { frame: 3, arquivo: som('trinca-soco') },
          { frame: 10, arquivo: som('trinca-soco') },
        ],
      },
    },
  },
  muro: {
    ataqueNormal: {
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        voz: som('muro-ahh'),
        golpes: [
          { frame: 6, arquivo: som('muro-soco1') },
          { frame: 12, arquivo: som('muro-soco2') },
        ],
      },
    },
    dano: {
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        voz: som('muro-ahh'),
        golpes: [
          { frame: 3, arquivo: som('muro-soco1') },
          { frame: 10, arquivo: som('muro-soco2') },
        ],
      },
    },
  },
  // Fenda, Catraca, Faísca (17/09-18/09/2026) — arte de combate chegou
  // sem voz ainda ("as vozes eu faço no ElevenLabs depois") — só `golpes`
  // (o som de impacto em si), sem `voz`/`ambiente`. Isaias pediu
  // personalidade sonora por GÊNERO nesse meio tempo: um par de socos
  // (aplicando/tomando) diferente pra personagem mulher, reaproveitando
  // o do Trinca/Muro pra personagem homem ("pra o Faísca talvez a gente
  // possa reaproveitar do Muro e do Trinca... mas pras mulheres precisam
  // de um som de soco diferente, um som de tomar golpe diferente e
  // aplicar golpe diferente"). `soco-leve`/`dano-leve` (Mixkit, licença
  // Mixkit — "Soft quick punch"/"Weak hit impact") são o par feminino,
  // compartilhado entre Fenda e Catraca por ora (não é um som por
  // personagem, é um som por gênero — ajustar se/quando cada uma ganhar
  // um efeito próprio).
  fenda: {
    ataqueNormal: {
      // Chute alto, sem flash de impacto desenhado na folha — quadro do
      // pico da extensão da perna (row2 col2) é o golpe de fato.
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: { golpes: [{ frame: 6, arquivo: som('soco-leve') }] },
    },
    dano: {
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 3, arquivo: som('dano-leve') },
          { frame: 7, arquivo: som('dano-leve') },
        ],
      },
    },
  },
  catraca: {
    ataqueNormal: {
      // Estalo do chicote, com flash de impacto desenhado na folha (row2 col3).
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: { golpes: [{ frame: 7, arquivo: som('soco-leve') }] },
    },
    dano: {
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 3, arquivo: som('dano-leve') },
          { frame: 7, arquivo: som('dano-leve') },
        ],
      },
    },
  },
  faisca: {
    ataqueNormal: {
      // Chute voador, sem flash de impacto desenhado — pico da extensão
      // da perna no ar (row2 col3) é o golpe de fato.
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: { golpes: [{ frame: 7, arquivo: som('trinca-soco') }] },
    },
    dano: {
      frameW: 181, frameH: 136, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 3, arquivo: som('muro-soco1') },
          { frame: 7, arquivo: som('muro-soco2') },
        ],
      },
    },
  },
}

/** Config completa de uma animação (`tipo`: 'ataqueNormal' | 'dano' | ...)
 *  do personagem, ou null se ele ainda não tem arte própria pra esse tipo —
 *  quem chama cai pro visual de sempre, igual `getGanguesPortrait` faz
 *  quando falta retrato. */
export function getGanguesAnimacao(characterTemplateId, tipo) {
  const slug = TEMPLATE_SLUG[characterTemplateId]
  const sheet = slug && SHEETS_POR_TIPO[tipo]?.[slug]
  const dados = slug && DADOS_POR_SLUG[slug]?.[tipo]
  if (!sheet || !dados) return null
  return { slug, sheet, ...dados }
}

// ── Pré-carregamento (pedido do Isaias: "durante a batalha já deixa
// carregada... não precisa ficar baixando toda hora") ───────────────────
// Cache em nível de módulo (sobrevive entre lutas e entre remontagens de
// DramaticDice — só baixa/decodifica cada arquivo UMA vez por sessão de
// jogo, nunca de novo a cada golpe). `precarregarAnimacaoCombate` é
// chamado 1x quando a batalha começa (GanguesCombat.jsx), pra cada membro
// do time do jogador que tiver animação registrada — carrega TODOS os
// tipos de animação do personagem de uma vez (ataque e dano), já que
// qualquer um dos dois pode acontecer a qualquer momento da luta.
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
  for (const tipo of Object.keys(SHEETS_POR_TIPO)) {
    const anim = getGanguesAnimacao(characterTemplateId, tipo)
    if (!anim) continue
    if (!IMAGEM_CACHE.has(anim.sheet)) {
      IMAGEM_CACHE.add(anim.sheet)
      const img = new Image()
      img.src = anim.sheet
    }
    if (anim.sons.ambiente) pegarAudio(anim.sons.ambiente)
    if (anim.sons.voz) pegarAudio(anim.sons.voz)
    for (const golpe of anim.sons.golpes || []) pegarAudio(golpe.arquivo)
  }
}

/** Toca um som já pré-carregado (reinicia do começo — o mesmo <audio> é
 *  reaproveitado em ataques seguintes do mesmo personagem na luta). */
export function tocarSomCombate(url, volume = 0.7) {
  const audio = pegarAudio(url)
  audio.currentTime = 0
  audio.volume = volume
  audio.play().catch(() => {})
}
