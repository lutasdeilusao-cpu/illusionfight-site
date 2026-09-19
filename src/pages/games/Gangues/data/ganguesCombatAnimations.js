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
  //
  // BUG achado pelo Isaias jogando (18/09/2026, print da Catraca sem
  // cabeça em combate) — causa raiz real, achada extraindo a folha crua
  // com sharp e olhando quadro a quadro: a arte ENTREGUE na 1ª leva só
  // preenchia 4 col × 3 linhas (12 poses), mas a config dizia 4×4/16
  // (copiada do Trinca/Muro sem checar se a arte nova respeitava a mesma
  // grade). Isaias redesenhou pra grade real 4×4/16, igual Trinca/Muro —
  // mas CADA arquivo veio com uma ALTURA DE CANVAS DIFERENTE (Fenda
  // 1448×1100, Catraca ataqueNormal 1448×1086, Catraca dano 1448×1200,
  // Faísca 1448×1086) — não dá pra assumir frameH igual pra todo mundo
  // (erro que eu mesmo cometi na 1ª tentativa de reprocessar, forçando
  // 724×544 fixo pra tudo: espremia quem não nascia nessa proporção,
  // cortando pé/mostrando quadro de cima de novo). Cada `.webp` agora é
  // gerado com `sharp(src).resize(width/2, height/2)` (metade exata da
  // altura REAL daquele arquivo, lida do próprio arquivo, nunca chumbada)
  // — por isso frameH varia por personagem/tipo abaixo. Confirmado ao
  // vivo via Playwright, dentro do jogo real.
  fenda: {
    ataqueNormal: {
      // Fonte 1448×1100 → webp 724×550 → frameH real = 550/4 = 137.5.
      // Arma nova (correntes), 2 flashes de impacto — quadros 7 (linha 2
      // col 3) e 16 (linha 4 col 4).
      frameW: 181, frameH: 137.5, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 7, arquivo: som('soco-leve') },
          { frame: 16, arquivo: som('soco-leve') },
        ],
      },
    },
    dano: {
      // Fonte 1448×1100 → webp 724×550 → frameH real = 137.5.
      // Flashes na folha — quadros 3 (linha 1 col 3) e 10 (linha 3 col 2).
      frameW: 181, frameH: 137.5, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 3, arquivo: som('dano-leve') },
          { frame: 10, arquivo: som('dano-leve') },
        ],
      },
    },
  },
  catraca: {
    ataqueNormal: {
      // BUG à parte dos outros (18/09/2026, print do Isaias com guia do
      // Photoshop nas 3 divisões reais: y=288/567/831) — essa folha
      // especificamente NÃO tem 4 linhas de altura uniforme: medindo o
      // canal alfa pixel a pixel (não no olho) as alturas reais são
      // 288/279/264/255px, e a divisão 3→4 nem tem uma linha 100%
      // transparente (chicote de uma pose encosta na de baixo). Como
      // GanguesCombatSpriteAnim.jsx assume linhas de altura IGUAL
      // (`background-position` em % só funciona assim), a saída foi
      // recortar cada linha na altura REAL dela e completar com
      // transparência até a maior (288px) — technique "pad+halve+webp"
      // já usada antes nesse projeto pra sheet fora do padrão. Canvas
      // reconstruído 1448×1152 (4×288), webp final 724×576 →
      // frameH = 576/4 = 144 (exato, sem fração — todas as linhas
      // realmente do mesmo tamanho agora, nada cortado).
      frameW: 181, frameH: 144, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 6, arquivo: som('soco-leve') },
          { frame: 11, arquivo: som('soco-leve') },
        ],
      },
    },
    dano: {
      // Fonte 1448×1200 → webp 724×600 → frameH real = 600/4 = 150.
      // Flashes na folha — quadros 3 (linha 1 col 3) e 10 (linha 3 col 2).
      frameW: 181, frameH: 150, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 3, arquivo: som('dano-leve') },
          { frame: 10, arquivo: som('dano-leve') },
        ],
      },
    },
  },
  faisca: {
    ataqueNormal: {
      // Fonte 1448×1086 → webp 724×543 → frameH real = 135.75.
      // Chute voador, sem flash de impacto desenhado — pico da extensão
      // da perna no ar (quadro 7, linha 2 col 3) é o golpe de fato.
      frameW: 181, frameH: 135.75, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: { golpes: [{ frame: 7, arquivo: som('trinca-soco') }] },
    },
    dano: {
      // Fonte 1448×1086 → webp 724×543 → frameH real = 135.75.
      // Flashes na folha — quadros 3 (linha 1 col 3) e 11 (linha 3 col 3).
      frameW: 181, frameH: 135.75, cols: 4, rows: 4, frames: 16, frameMs: 80,
      sons: {
        golpes: [
          { frame: 3, arquivo: som('muro-soco1') },
          { frame: 11, arquivo: som('muro-soco2') },
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
