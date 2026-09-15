import { useCallback, useRef } from 'react'
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
export function GangMarker({ player, facing, gangName, retrato }) {
  // initial={false}: sem isso, toda REMONTAGEM (troca de `key` ao entrar/sair
  // de um interior — ver GanguesCena.jsx) ainda animava a partir de um valor
  // inicial medido do DOM (perto de 0,0), não do alvo — o jogador via o
  // próprio marcador "voar" de um canto vazio até a posição certa mesmo com
  // o `key` forçando remontagem. `initial={false}` diz pro Framer Motion
  // renderizar JÁ no valor de `animate` na primeira pintura, sem transição;
  // o passo a passo normal (mesma instância, só troca de `animate`) continua
  // suave como sempre, porque `initial` só importa na montagem.
  return <motion.div className={`gang-world-player is-gang facing-${facing}${retrato ? ' gang-world-player--retrato' : ''}`} initial={false} animate={{ left: player.x, top: player.y }} transition={{ duration: STEP_MS / 1000, ease: 'easeOut' }}>
    <span>{retrato ? <img src={retrato} alt="" /> : <><i /><i /><i /></>}</span><small>{gangName || 'GANGUE'}</small>
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
  if (p.estado === 'resolvido' || p.farmCompleto) return 'is-feito'
  if (p.estado !== 'disponivel') return ''
  return p.opcional ? 'is-opcional' : 'is-obrigatorio'
}

// Zona de interação (retângulo invisível em volta do pino) — acende quando o
// jogador está perto o bastante pra interagir.
export function EntryZone({ poi, active }) {
  const z = poi.zona
  if (!z || poi.estado === 'trancado' || poi.estado === 'resolvido') return null
  const farol = farolDe(poi)
  return <div className={`gang-world-entry${active ? ' is-active' : ''}${farol ? ` ${farol}` : ''}${poi.ehPorta || poi.ehSaida || poi.ehVolta || poi.ehPassagem ? ' is-porta' : ''}`} style={{ left: z.x, top: z.y, width: z.w, height: z.h }} />
}

const ICONE = { treta: '✊', parada: '🔧', papo: '●', corre: '!', achado: '◆', descanso: '☕', loja: '🏪' }

// Retrato do pino — mesma ideia do GangMarker (cabeça de verdade no lugar
// do ícone genérico, pedido do Isaias, 15/09/2026: "todo personagem agora
// tem que ser uma cabecinha... por que que os personagens não estão com
// cabecinha sendo que eu criei todos"). Papo (NPC nomeado, ex: Nego Véio)
// usa `npcSlug`; treta com identidade FIXA (general/chefe/líder de galpão)
// usa `liderFixo` ou `enemy` — mas só quando NÃO tem `revezamento` (pool
// aleatório): aí o "molde" na tela é só uma cara de referência, quem
// aparece de verdade na luta é sorteado, então mostrar uma cabeça fixa
// seria mentira.
function retratoDoPino(p) {
  if (p.npcSlug) return getGanguesNpcPortrait(p.npcSlug)
  if (!p.revezamento && (p.liderFixo || p.enemy)) return getGanguesEnemyPortraitById(p.liderFixo || p.enemy)
  return null
}

// Pino do alvo (POI, porta, saída, passagem). `ehChefe`/`ehPorta`/... decidem o ícone e o rótulo.
export function PinoAlvo({ p, t }) {
  if (p.estado === 'trancado' && !(p.ehPassagem || p.ehChefe)) return null
  const icone = p.ehChefe ? '★' : p.ehPorta ? '🚪' : p.ehSaida ? '↩' : p.ehVolta ? '↩' : p.ehPassagem ? (p.label === 'subir' ? '▲' : '▶') : (ICONE[p.tipo] || '•')
  const nome = p.ehChefe ? t(`games.gangues.story.bosses.${p.boss}.nome`)
    : p.ehPorta ? t('games.gangues.cena.acao.entrar')
    : p.ehSaida ? t('games.gangues.cena.acao.sair')
    : p.ehVolta ? t('games.gangues.cena.acao.voltar')
    : p.ehPassagem ? (p.estado === 'trancado' ? t('games.gangues.cena.acao.trancado') : t(`games.gangues.cena.acao.${p.label || 'avancar'}`))
    : (p.i18n ? t(`${p.i18n}.nome`) : '')
  const retrato = retratoDoPino(p)
  return <div className={`gang-world-npc is-${p.estado} ${farolDe(p)} ${p.ehChefe ? 'is-boss' : ''} ${p.farmCompleto ? 'is-farm' : ''} ${p.ehPorta || p.ehSaida || p.ehVolta || p.ehPassagem ? 'is-nav' : ''} ${retrato ? 'gang-world-npc--retrato' : ''}`} style={{ left: p.world.x, top: p.world.y }}>
    <span>{retrato ? <img src={retrato} alt="" /> : icone}</span>
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
