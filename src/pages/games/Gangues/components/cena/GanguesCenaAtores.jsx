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

const ICONE = { treta: '✊', parada: '🔧', papo: '●', corre: '!', achado: '◆', descanso: '☕', loja: '🏪' }

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
// "animação" de verdade agora é a andadinha (ver `is-patrulha`/CSS).
function retratoDoPino(p) {
  if (p.npcSlug) return getGanguesNpcPortrait(p.npcSlug)
  if (p.revezamento?.pool?.length) {
    const pool = p.revezamento.pool
    return getGanguesEnemyPortraitById(pool[hashEstavel(p.id) % pool.length])
  }
  if (p.liderFixo || p.enemy) return getGanguesEnemyPortraitById(p.liderFixo || p.enemy)
  return null
}

// "Personagem" (tem cara — NPC ou inimigo, anda de um lado pro outro) vs.
// "pino estático de ação" (ferro-velho, achado, loja, corre, nav — nunca
// se move). Exportado porque GanguesCena.jsx também precisa saber disso:
// pra um personagem que anda, o botão de interação tem que reagir à
// colisão visual REAL (`onColidir`/`colidindo` aqui embaixo), não à zona
// fixa ancorada no `world.x/y` (que só faz sentido pra pino parado).
export function ehPersonagem(p) {
  return Boolean(retratoDoPino(p)) && !p.ehChefe
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
    if (!p.revezamento && !p.npcSlug && !p.liderFixo && !p.enemy) return // não é personagem, nem tenta
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
  }, [p.id, p.revezamento, p.npcSlug, p.liderFixo, p.enemy, onColidir])
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
  const personagem = Boolean(retrato) && !p.ehChefe
  // Andadinha, 4ª leva (20/09/2026 — histórico completo em GanguesCena.css,
  // logo acima da keyframe `gang-patrulha-h`): rotação removida ("parecia
  // bêbado"), alcance subiu de ±18-33px pra 60-115px ("nem parecia
  // deslocamento"), e por fim a timing function voltou de `steps()` pra
  // `ease-in-out` ("ficou muito tutu... faz uma caminhada mais suave, de
  // quem tá vigiando"). Dois movimentos em elementos SEPARADOS (senão uma
  // `transform` sobrescreve a outra):
  //  • `--gp-w`/`is-patrulha-h/-v` no `<span>` DE FORA: o deslocamento de
  //    verdade (60-115px, ida e volta), contínuo.
  //  • `.gang-world-npc-passo` no `<span>` DE DENTRO: um bounce vertical
  //    bem sutil, também contínuo, independente da direção — só o
  //    suficiente pra não parecer flutuando.
  // Fase/duração/alcance/eixo variam por pino (hash do id) só pra não
  // sincronizar todo mundo andando igual.
  const h = personagem ? hashEstavel(p.id) : 0
  const patrulhaVertical = personagem && h % 2 === 0
  const patrulhaClasse = personagem ? (patrulhaVertical ? 'is-patrulha-v' : 'is-patrulha-h') : ''
  const patrulhaDur = 3.2 + (h % 6) * 0.4
  const patrulhaStyle = personagem ? {
    '--gp-w': `${60 + (h % 56)}px`,
    '--gp-dur': `${patrulhaDur}s`,
    animationDelay: `${-((h % 100) / 100) * patrulhaDur}s`,
  } : undefined
  return <div className={`gang-world-npc is-${p.estado} ${farolDe(p)} ${p.ehChefe ? 'is-boss' : ''} ${p.farmCompleto ? 'is-farm' : ''} ${active ? 'is-perto' : ''} ${colidindo ? 'is-colidindo' : ''} ${p.ehPorta || p.ehSaida || p.ehVolta || p.ehPassagem ? 'is-nav' : ''} ${retrato ? 'gang-world-npc--retrato' : ''} ${patrulhaClasse}`} style={{ left: p.world.x, top: p.world.y }}>
    <span ref={spanRef} style={patrulhaStyle}>
      <span className={personagem ? 'gang-world-npc-passo' : undefined}>
        {retrato ? <img src={retrato} alt="" onError={() => setRetratoFalhou(true)} /> : icone}
      </span>
    </span>
    {p.estado !== 'trancado' || p.ehPassagem || p.ehChefe ? <small>{nome}</small> : null}
    {p.farmCompleto && <i className="gang-world-npc-farm-tag" aria-hidden="true">↻</i>}
  </div>
}

const LABEL_TIPO = { papo: 'FALAR', treta: 'ENCARAR', parada: 'INVESTIGAR', corre: 'SEGUIR', descanso: 'DESCANSAR', loja: 'COMPRAR', achado: 'PEGAR' }
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
