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

// Cicla entre alguns moldes do pool a cada intervalo — pedido do Isaias,
// 20/09/2026 ("todos os personagens deveriam estar usando carinhas, a
// gente tem um monte de carinha"): antes uma treta com `revezamento` (pool
// aleatório, ex. beco/rinha/beco_2) só mostrava o ícone genérico (✊),
// porque cravar UMA cara fixa seria mentira (quem aparece de verdade é
// sorteado). Ciclando entre 2-3 moldes reais do próprio pool a cada ~2.6s
// vira o oposto do problema: mostra de verdade "é um desses aí" — e de
// quebra já é a "animaçãozinha" que ele pediu pra tirar a impressão de
// mapa estático. Sem pool (molde fixo/chefe/general) não cicla nada.
function useCicloPool(pool) {
  const [i, setI] = useState(0)
  const tamanho = pool?.length || 0
  useEffect(() => {
    if (tamanho < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return
    const id = setInterval(() => setI(v => (v + 1) % tamanho), 2600)
    return () => clearInterval(id)
  }, [tamanho])
  return tamanho ? pool[i % tamanho] : null
}

// Retrato do pino — mesma ideia do GangMarker (cabeça de verdade no lugar
// do ícone genérico, pedido do Isaias, 15/09/2026: "todo personagem agora
// tem que ser uma cabecinha... por que que os personagens não estão com
// cabecinha sendo que eu criei todos"). Papo (NPC nomeado, ex: Nego Véio)
// usa `npcSlug`; treta com identidade FIXA (general/chefe/líder de galpão)
// usa `liderFixo` ou `enemy`; treta com `revezamento` (pool aleatório)
// mostra o molde CICLADO (`enemyCiclado`, ver useCicloPool acima).
function retratoDoPino(p, enemyCiclado) {
  if (p.npcSlug) return getGanguesNpcPortrait(p.npcSlug)
  if (p.revezamento?.pool?.length) return getGanguesEnemyPortraitById(enemyCiclado ?? p.revezamento.pool[0])
  if (p.liderFixo || p.enemy) return getGanguesEnemyPortraitById(p.liderFixo || p.enemy)
  return null
}

// Pino do alvo (POI, porta, saída, passagem). `ehChefe`/`ehPorta`/... decidem o ícone e o rótulo.
// `active`: jogador está perto o bastante pra interagir — antes um retângulo
// tracejado À PARTE (EntryZone) acendia ao lado; removido (pedido do Isaias,
// 20/09/2026: "tira esse quadradinho, usa a colisão do próprio personagem")
// — agora é o PRÓPRIO pino que brilha mais forte (classe `is-perto`).
export function PinoAlvo({ p, t, active }) {
  // useState/useEffect sempre no topo, antes de qualquer return condicional
  // (regra dos hooks) — falha de carregamento (rede ruim) cai pro ícone
  // genérico, igual quando não tem retrato nenhum.
  const [retratoFalhou, setRetratoFalhou] = useState(false)
  const enemyCiclado = useCicloPool(p.revezamento?.pool)
  if (p.estado === 'trancado' && !(p.ehPassagem || p.ehChefe)) return null
  const icone = p.ehChefe ? '★' : p.ehPorta ? '🚪' : p.ehSaida ? '↩' : p.ehVolta ? '↩' : p.ehPassagem ? (p.label === 'subir' ? '▲' : '▶') : (ICONE[p.tipo] || '•')
  const nome = p.ehChefe ? t(`games.gangues.story.bosses.${p.boss}.nome`)
    : p.ehPorta ? t('games.gangues.cena.acao.entrar')
    : p.ehSaida ? t('games.gangues.cena.acao.sair')
    : p.ehVolta ? t('games.gangues.cena.acao.voltar')
    : p.ehPassagem ? (p.estado === 'trancado' ? t('games.gangues.cena.acao.trancado') : t(`games.gangues.cena.acao.${p.label || 'avancar'}`))
    : (p.i18n ? t(`${p.i18n}.nome`) : '')
  const retratoUrl = retratoDoPino(p, enemyCiclado)
  const retrato = retratoUrl && !retratoFalhou ? retratoUrl : null
  return <div className={`gang-world-npc is-${p.estado} ${farolDe(p)} ${p.ehChefe ? 'is-boss' : ''} ${p.farmCompleto ? 'is-farm' : ''} ${active ? 'is-perto' : ''} ${p.ehPorta || p.ehSaida || p.ehVolta || p.ehPassagem ? 'is-nav' : ''} ${retrato ? 'gang-world-npc--retrato' : ''}`} style={{ left: p.world.x, top: p.world.y }}>
    <span>{retrato ? <img src={retrato} alt="" onError={() => setRetratoFalhou(true)} /> : icone}</span>
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
