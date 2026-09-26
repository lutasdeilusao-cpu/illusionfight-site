import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { STEP_MS } from '../../engine/ganguesCenaMotor.js'
import { getGanguesNpcPortrait } from '../../data/ganguesNpcPortraits.js'
import { getGanguesEnemyPortraitById } from '../../data/ganguesEnemyPortraits.js'

// Marcador do jogador (a gangue) no mundo — anda com transição suave entre
// passos. Extraído de GanguesCena.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
// `retrato`: a cabecinha do líder (1º recrutado) flutuando no lugar do
// escudo genérico, quando existe arte pra ele (pedido do Isaias, set/2026 —
// "juice"/identidade visual) — sem retrato ainda, cai no escudo de sempre.
export function GangMarker({ player, facing, gangName, retrato: retratoUrl }) {
  // Falha de carregamento (rede ruim — ver AGENTS.md 15/09/2026) cai pro
  // escudo genérico de sempre, igual quando não tem retrato nenhum.
  const [retratoFalhou, setRetratoFalhou] = useState(false)
  const retrato = retratoUrl && !retratoFalhou ? retratoUrl : null
  // initial={false}: sem isso, toda REMONTAGEM (troca de `key` ao entrar/sair
  // de um interior — ver GanguesCena.jsx) ainda animava a partir de um valor
  // inicial medido do DOM (perto de 0,0), não do alvo — o jogador via o
  // próprio marcador "voar" de um canto vazio até a posição certa mesmo com
  // o `key` forçando remontagem. `initial={false}` diz pro Framer Motion
  // renderizar JÁ no valor de `animate` na primeira pintura, sem transição;
  // o passo a passo normal (mesma instância, só troca de `animate`) continua
  // suave como sempre, porque `initial` só importa na montagem.
  return <motion.div className={`gang-world-player is-gang facing-${facing}${retrato ? ' gang-world-player--retrato' : ''}`} initial={false} animate={{ left: player.x, top: player.y }} transition={{ duration: STEP_MS / 1000, ease: 'easeOut' }}>
    <span>{retrato ? <img src={retrato} alt="" onError={() => setRetratoFalhou(true)} /> : <><i /><i /><i /></>}</span><small>{gangName || 'GANGUE'}</small>
  </motion.div>
}

// Farol universal de status (pedido do Isaias, 13/09/2026 — "vermelho = não
// enfrentou, amarelo = opcional, verde = já enfrentou"): substitui a cor do
// território + o azul de farm nos pontos de CONTEÚDO por um status
// autoexplicativo, sem precisar de tutorial pra ensinar a paleta. Não se
// aplica a navegação (porta/saída/volta/passagem) nem ao chefe — esses
// mantêm a identidade visual própria (neutro/território pra nav, vermelho
// escuro dedicado pro showdown final). Treta repetível já vencida 1x nunca
// vira estado `'resolvido'` de propósito (fica sempre `'disponivel'` pra
// continuar farmável — ver `estadoPoi`/`estadoInternoPoi` em
// ganguesCenaMotor.js); é o `farmCompleto` que sinaliza "já venceu, mas pode
// repetir", e por isso conta como "feito" (verde) aqui também.
function farolDe(p) {
  if (p.ehPorta || p.ehSaida || p.ehVolta || p.ehPassagem || p.ehChefe) return ''
  // Oferta pendente (ex: o corre do Nato, dentro do Descanso) força verde —
  // pedido do Isaias, 20/09/2026 ("tem que ficar verde, óbvio, pro cara
  // saber que tem uma missão ali") — exceção deliberada ao farol normal
  // (aqui verde não é "já feito", é "tem novidade"), só pra quem tem
  // `ofertaFlagId` (ver ganguesCenaMotor.js/pois.js).
  if (p.ofertaPendente) return 'is-feito'
  if (p.estado === 'resolvido' || p.farmCompleto) return 'is-feito'
  if (p.estado !== 'disponivel') return ''
  return p.opcional ? 'is-opcional' : 'is-obrigatorio'
}

const ICONE = { treta: '✊', parada: '🔧', papo: '●', corre: '!', achado: '◆', descanso: '☕', loja: '🏪', agiota: '💰' }

// Hash estável (string -> inteiro não-negativo) — só pra escolher SEMPRE o
// mesmo molde de um pool pro mesmo POI (nunca sorteado de novo a cada
// render/visita) e pra variar a fase/duração da andadinha por pino sem
// precisar guardar estado nenhum. Não precisa ser criptográfico, só estável.
function hashEstavel(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

// Retrato do pino — mesma ideia do GangMarker (cabeça de verdade no lugar
// do ícone genérico, pedido do Isaias, 15/09/2026: "todo personagem agora
// tem que ser uma cabecinha... por que que os personagens não estão com
// cabecinha sendo que eu criei todos"). Papo (NPC nomeado, ex: Nego Véio)
// usa `npcSlug`; treta com identidade FIXA (general/chefe/líder de galpão)
// usa `liderFixo` ou `enemy`; treta com `revezamento` (pool aleatório)
// mostra UM molde fixo do próprio pool, escolhido por hash do id do POI —
// sempre o MESMO pra aquele ponto (nunca troca de cara sozinho). Ciclar a
// imagem foi tentado (20/09/2026) e o Isaias rejeitou: "animação é ele se
// mexendo, andando... não é ficar trocando o rosto, tira essa merda" — a
// "animação" de verdade agora é o movimento (ver `movimentoDoPino`/CSS).
function retratoDoPino(p) {
  if (p.npcSlug) return getGanguesNpcPortrait(p.npcSlug)
  if (p.revezamento?.pool?.length) {
    const pool = p.revezamento.pool
    return getGanguesEnemyPortraitById(pool[hashEstavel(p.id) % pool.length])
  }
  if (p.liderFixo || p.enemy) return getGanguesEnemyPortraitById(p.liderFixo || p.enemy)
  // `retratoEnemyId` (pedido do Isaias, 21/09/2026 — a lojinha de poção
  // "emprestando" a cara do balconista, id 1205): só um retrato de
  // decoração, sem NENHUMA implicação de combate — não confundir com
  // `enemy`/`liderFixo` acima, que SÃO quem o jogador enfrenta de verdade.
  if (p.retratoEnemyId) return getGanguesEnemyPortraitById(p.retratoEnemyId)
  return null
}

// "Personagem" (tem cara — NPC ou inimigo, anda de um lado pro outro) vs.
// "pino estático de ação" (ferro-velho, achado, loja, corre, nav — nunca
// se move). Exportado porque GanguesCena.jsx também precisa saber disso:
// pra um personagem que anda, o botão de interação tem que reagir à
// colisão visual REAL (`onColidir`/`colidindo` aqui embaixo), não à zona
// fixa ancorada no `world.x/y` (que só faz sentido pra pino parado).
export function ehPersonagem(p) {
  // Loja e agiota ficam de fora mesmo tendo retrato — são banca fixa
  // (pedido do Isaias, 21/09/2026, ao emprestar a cara do balconista pra
  // "Balcão do Aperto", e de novo pro agiota: "esse vai ficar parado"),
  // não personagem que anda por aí; continuam no grupo dos "pinos
  // estáticos de ação" (achado/parada/corre/nav).
  return Boolean(retratoDoPino(p)) && !p.ehChefe && p.tipo !== 'loja' && p.tipo !== 'agiota'
}

// Comportamento de movimento de um personagem na cena (26/09/2026). Pedido
// do Isaias: nem todo mundo anda — uns ficam parados, outros inquietos no
// lugar, alguns patrulham devagar (com parada e olhadinha nas pontas) e um ou
// outro dá a volta num quadrado. Ordem de decisão:
//   1. `poi.movimento` no dado ('parado'|'inquieto'|'patrulha-h'|
//      'patrulha-v'|'ronda') — pra fixar um personagem específico;
//   2. "o bicho" sempre patrulha (é quem ronda o pós-muro);
//   3. quem conversa (papo/descanso) fica no seu ponto: parado ou inquieto;
//   4. inimigo de treta: mistura patrulha, ronda, inquieto e parado.
// Sempre o mesmo pra cada personagem (hash do id), nunca sorteado a cada visita.
// Metade fica no lugar (parado/inquieto), metade anda — "nem todos precisam andar".
const MOVIMENTOS_TRETA = ['inquieto', 'patrulha-h', 'parado', 'ronda', 'inquieto', 'patrulha-v', 'parado', 'patrulha-h']
export function movimentoDoPino(p) {
  if (p.movimento) return p.movimento
  if (p.ehBicho) return 'patrulha-h'
  const h = hashEstavel(p.id)
  if (p.tipo === 'papo' || p.tipo === 'descanso') return h % 3 === 0 ? 'inquieto' : 'parado'
  return MOVIMENTOS_TRETA[h % MOVIMENTOS_TRETA.length]
}

// Pino do alvo (POI, porta, saída, passagem). `ehChefe`/`ehPorta`/... decidem o ícone e o rótulo.
// `active`: jogador está dentro da ZONA de interação (`perto`/`insideZone`
// em GanguesCena.jsx — de propósito bem maior que o círculo visual, pra
// facilitar tocar no celular) — antes um retângulo tracejado À PARTE
// (EntryZone) acendia ao lado; removido (pedido do Isaias, 20/09/2026:
// "tira esse quadradinho, usa a colisão do próprio personagem") — agora é
// o PRÓPRIO pino que brilha mais forte (classe `is-perto`). `colidindo`
// (estado local, ver useEffect abaixo) é DIFERENTE — é a colisão visual
// REAL (círculo contra círculo na tela), usada só pra pausar a andadinha
// (`is-colidindo`) no momento exato que o personagem "esbarra" no
// jogador, não assim que entra na zona generosa de interação.
export function PinoAlvo({ p, t, active, onColidir }) {
  // useState/useRef/useEffect sempre no topo, antes de qualquer return
  // condicional (regra dos hooks) — falha de carregamento (rede ruim) cai
  // pro ícone genérico, igual quando não tem retrato nenhum.
  const [retratoFalhou, setRetratoFalhou] = useState(false)
  const [colidindo, setColidindo] = useState(false)
  const spanRef = useRef(null)
  // "Eles estão parando ANTES de chegar no player, eles têm que parar
  // quando colidirem com o player" (Isaias, 20/09/2026) — `active` (zona
  // de interação, `perto`/`insideZone` em GanguesCena.jsx) é de propósito
  // uma área BEM maior que o círculo visual (facilita tocar no celular),
  // então pausar a andadinha só com `active` congelava o personagem cedo
  // demais, antes de encostar de verdade. Aqui mede a colisão REAL — o
  // círculo do pino contra o círculo do marcador do jogador na TELA
  // (getBoundingClientRect, já considerando a posição visual da andadinha
  // em CSS, que o React/JS não sabe onde está exatamente) — só pausa
  // quando as bordas realmente se tocam. Poll leve (150ms, não every
  // frame) porque é só um efeito visual, não precisão de física.
  // AJUSTE (mesmo dia, print na sequência): "o botão de interação só ativa
  // na antiga área do quadradinho... tem que ativar no momento que eu
  // colido com o personagem" — a mesma colisão real também precisa
  // acionar o botão FALAR/ENCARAR, não só pausar o passeio. `onColidir`
  // reporta pro componente pai (GanguesCena.jsx) pra virar a fonte de
  // verdade de "perto" pra QUALQUER personagem que anda — a zona fixa
  // (`insideZone`) só faz sentido pra pino estático, que nunca se afasta
  // do próprio `world.x/y`.
  useEffect(() => {
    // BUG achado 21/09/2026 (Isaias: "Marimbondo não tá parando quando
    // colide comigo, é o único que não tá parando, os outros param") — o
    // guard aqui não conhecia `retratoEnemyId` (o campo usado pelo agiota
    // pra emprestar a cara do inimigo "Fiado Vencido", mesmo truque do
    // balconista), só `revezamento`/`npcSlug`/`liderFixo`/`enemy` — a
    // andadinha dele rodava normal (a variável LOCAL `personagem` logo
    // abaixo já reconhecia `retrato` de qualquer origem), mas esse efeito
    // nunca chegava a rodar pra ele, então `colidindo`/`is-colidindo`
    // (o que pausa a andadinha ao esbarrar) ficava sempre falso — ele
    // "andava" pra sempre, sem nunca parar.
    if (!p.revezamento && !p.npcSlug && !p.liderFixo && !p.enemy && !p.retratoEnemyId) return // não é personagem, nem tenta
    const id = setInterval(() => {
      const pinoEl = spanRef.current
      const playerEl = document.querySelector('.gang-world-player>span')
      if (!pinoEl || !playerEl) return
      const a = pinoEl.getBoundingClientRect()
      const b = playerEl.getBoundingClientRect()
      const dist = Math.hypot((a.left + a.width / 2) - (b.left + b.width / 2), (a.top + a.height / 2) - (b.top + b.height / 2))
      const tocou = dist < a.width / 2 + b.width / 2 + 4
      setColidindo(tocou)
      onColidir?.(p.id, tocou)
    }, 150)
    return () => { clearInterval(id); onColidir?.(p.id, false) }
  }, [p.id, p.revezamento, p.npcSlug, p.liderFixo, p.enemy, p.retratoEnemyId, onColidir])
  if (p.estado === 'trancado' && !(p.ehPassagem || p.ehChefe)) return null
  const icone = p.ehChefe ? '★' : p.ehPorta ? '🚪' : p.ehSaida ? '↩' : p.ehVolta ? '↩' : p.ehPassagem ? (p.label === 'subir' ? '▲' : '▶') : (ICONE[p.tipo] || '•')
  const nome = p.ehChefe ? t(`games.gangues.story.bosses.${p.boss}.nome`)
    : p.ehPorta ? t('games.gangues.cena.acao.entrar')
    : p.ehSaida ? t('games.gangues.cena.acao.sair')
    : p.ehVolta ? t('games.gangues.cena.acao.voltar')
    : p.ehPassagem ? (p.estado === 'trancado' ? t('games.gangues.cena.acao.trancado') : t(`games.gangues.cena.acao.${p.label || 'avancar'}`))
    : (p.i18n ? t(`${p.i18n}.nome`) : '')
  const retratoUrl = retratoDoPino(p)
  const retrato = retratoUrl && !retratoFalhou ? retratoUrl : null
  // "Personagem" (tem cara — NPC ou inimigo) anda de um lado pro outro no
  // próprio ponto; "pino estático de ação" (ferro-velho, achado, loja,
  // corre, nav...) fica parado — distinção pedida pelo Isaias, 20/09/2026
  // ("esses pinos estáticos são de ações... os personagens têm que
  // andar"). Chefe fica de fora de propósito (showdown parado, dramático).
  // Loja fica de fora mesmo com retrato (ver `ehPersonagem` acima) — banca
  // fixa, não anda.
  const personagem = Boolean(retrato) && !p.ehChefe && p.tipo !== 'loja'
  // Movimento (5ª leva, 26/09/2026 — o Isaias jogou e achou forçado todo
  // mundo andando em vaivém contínuo): cada personagem tem UM comportamento
  // fixo — parado, inquieto, patrulha (h/v) ou ronda. Quem decide é
  // `movimentoDoPino` (abaixo); o CSS de cada um mora em styles/cena/mundo.css.
  const movimento = personagem ? movimentoDoPino(p) : null
  const h = personagem ? hashEstavel(p.id) : 0
  const anda = movimento && movimento !== 'parado'
  const dur = movimento === 'ronda' ? 22 + (h % 7) : movimento === 'inquieto' ? 9 + (h % 5) : 14 + (h % 7)
  const movStyle = personagem ? {
    '--gp-w': `${movimento === 'ronda' ? 50 + (h % 21) : 45 + (h % 41)}px`,
    '--gp-dur': `${dur}s`,
    '--gp-delay': `${-((h % 100) / 100) * dur}s`,
    '--gp-resp': `${3.2 + (h % 5) * 0.3}s`,
  } : undefined
  const movClasse = movimento ? `mov-${movimento}${anda ? ' mov-anda' : ''}` : ''
  return <div className={`gang-world-npc is-${p.estado} ${farolDe(p)} ${p.ehChefe ? 'is-boss' : ''} ${p.farmCompleto ? 'is-farm' : ''} ${active ? 'is-perto' : ''} ${colidindo ? 'is-colidindo' : ''} ${p.ehPorta || p.ehSaida || p.ehVolta || p.ehPassagem ? 'is-nav' : ''} ${retrato ? 'gang-world-npc--retrato' : ''} ${movClasse}`} style={{ left: p.world.x, top: p.world.y }}>
    <span ref={spanRef} style={movStyle}>
      <span className={personagem ? 'gang-world-npc-passo' : undefined}>
        {retrato ? <img src={retrato} alt="" onError={() => setRetratoFalhou(true)} /> : icone}
      </span>
    </span>
    {p.estado !== 'trancado' || p.ehPassagem || p.ehChefe ? <small>{nome}</small> : null}
    {p.farmCompleto && <i className="gang-world-npc-farm-tag" aria-hidden="true">↻</i>}
  </div>
}

const LABEL_TIPO = { papo: 'FALAR', treta: 'ENCARAR', parada: 'INVESTIGAR', corre: 'SEGUIR', descanso: 'DESCANSAR', loja: 'COMPRAR', achado: 'PEGAR', agiota: 'AGIOTA' }
export function interactionLabel(p, t) {
  if (p.ehChefe) return t('games.gangues.cena.acao.desafiar')
  if (p.ehPorta) return t('games.gangues.cena.acao.entrar')
  if (p.ehSaida) return t('games.gangues.cena.acao.sair')
  if (p.ehVolta) return t('games.gangues.cena.acao.voltar')
  if (p.ehPassagem) return t(`games.gangues.cena.acao.${p.label || 'avancar'}`)
  return LABEL_TIPO[p.tipo] || 'INTERAGIR'
}

// Joystick + botão de ação contextual (mobile).
export function WorldControls({ onInput, onInteract, action }) {
  const base = useRef(null), active = useRef(null)
  const update = useCallback((x, y) => {
    const r = base.current?.getBoundingClientRect(); if (!r) return
    let dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy), max = 42
    if (d > max) { dx = dx / d * max; dy = dy / d * max }
    base.current.style.setProperty('--jx', `${dx}px`); base.current.style.setProperty('--jy', `${dy}px`)
    onInput({ x: dx / max, y: dy / max })
  }, [onInput])
  const stop = useCallback(() => {
    active.current = null
    if (base.current) { base.current.style.setProperty('--jx', '0px'); base.current.style.setProperty('--jy', '0px') }
    onInput({ x: 0, y: 0 })
  }, [onInput])
  return <div className="gang-world-controls">
    <div ref={base} className="gang-world-stick" onPointerDown={e => { active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e.clientX, e.clientY) }} onPointerMove={e => { if (active.current === e.pointerId) update(e.clientX, e.clientY) }} onPointerUp={stop} onPointerCancel={stop}><i /></div>
    <button disabled={!action} onClick={onInteract}><b>{action || '...'}</b><span>INTERAGIR</span></button>
  </div>
}
