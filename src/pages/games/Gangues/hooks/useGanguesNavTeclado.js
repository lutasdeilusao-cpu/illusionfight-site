// Navegação por setas no modo teclado (ver ganguesControle.js). As setas pulam
// pro botão mais próximo naquela direção, em QUALQUER tela do jogo, sem cada
// tela precisar declarar nada; Enter/Espaço apertam o botão em foco (nativo do
// navegador) e o resto dos atalhos segue em useGanguesTeclado.
//
// Escopo: se tem um modal/diálogo aberto, a navegação fica presa dentro dele
// (o último aberto). Na rua/clube sem modal as setas ANDAM com o boneco — aí
// os botões do HUD seguem no Tab e nos atalhos (I, F, B, Esc).
import { useEffect } from 'react'

const FOCAVEIS = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [role="button"], [role="switch"], [role="tab"], [role="option"], [tabindex]:not([tabindex="-1"])'
// Camadas que ficam por cima da tela. As que são só o fundo escuro (irmão do
// cartão) contam pelo pai.
const MODAIS = '[role="dialog"], [aria-modal="true"], .gang-cena-modal, .gang-modes-party-modal, .gang-world__pergunta-bg, .gang-aviso-conta, .gang-dlg-stage, .gang-tip-card, .gang-dados-rodada, .gang-controle-pergunta, .gang-orb-panel, .gang-opcoes, .gang-trash-pop'
const FUNDOS = '.gang-story-vs-bg, .gang-esc-bg'
const MUNDO = '.gang-cena-worldpage, .gang-clube'
const HUD = '.gang-cena-worldhud'

const visivel = el => {
  const r = el.getBoundingClientRect()
  if (r.width < 4 || r.height < 4) return false
  if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
  // fundo que cobre a tela inteira (botão invisível de "fechar ao tocar fora")
  if (r.height >= window.innerHeight * .9) return false
  if (/scrim|fundo|backdrop|-bg|overlay/i.test(String(el.className))) return false
  return true
}

const aberta = el => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && (!el.checkVisibility || el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) }

function escopo() {
  const camadas = [...document.querySelectorAll(MODAIS), ...[...document.querySelectorAll(FUNDOS)].map(f => f.parentElement)].filter(Boolean).filter(aberta)
  if (!camadas.length) return null
  // a mais "de cima": a última na ordem do documento
  camadas.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
  return camadas[camadas.length - 1]
}

const candidatos = raiz => [...raiz.querySelectorAll(FOCAVEIS)].filter(el => !el.closest('[aria-hidden="true"], [inert]') && visivel(el))

const centro = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r } }

function proximo(atual, lista, dir) {
  const a = centro(atual)
  let melhor = null, nota = Infinity
  for (const el of lista) {
    if (el === atual || atual.contains(el)) continue
    const c = centro(el)
    const dx = c.x - a.x, dy = c.y - a.y
    let frente, lado
    if (dir === 'right') { frente = dx; lado = dy } else if (dir === 'left') { frente = -dx; lado = dy }
    else if (dir === 'down') { frente = dy; lado = dx } else { frente = -dy; lado = dx }
    if (frente <= 2) continue
    const n = frente + Math.abs(lado) * 2.2
    if (n < nota) { nota = n; melhor = el }
  }
  return melhor
}

// Onde o seletor nasce: campo de texto (tela de nome) > conteúdo da tela >
// faixas de topo (aviso de conta sem login, Opções) só se não tiver mais nada.
const SECUNDARIOS = '.guest-notice, .gang-opcoes-abrir, .gang-voltar-btn'
const primeiro = lista => {
  // a tela pode marcar onde o seletor começa (ex.: o card do meio do recrutamento)
  const marcado = lista.find(el => el.hasAttribute('data-nav-inicio'))
  if (marcado) return marcado
  const campo = lista.find(el => el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search' || !el.type))
  if (campo) return campo
  const miolo = lista.filter(el => !el.closest(SECUNDARIOS) && !/voltar|back|sair|close|fechar|__x/i.test(String(el.className)) && el.textContent.trim() !== '✕' && el.textContent.trim() !== '×')
  return ordenar(miolo.length ? miolo : lista)
}
const ordenar = lista => [...lista].sort((a, b) => { const A = centro(a), B = centro(b); return Math.abs(A.y - B.y) > 8 ? A.y - B.y : A.x - B.x })[0]

const DIRS = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' }

export default function useGanguesNavTeclado(ativo) {
  useEffect(() => {
    if (!ativo) return
    const onKey = e => {
      if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return
      // Enter/Espaço num "botão" que não é <button> (div com role=button): o
      // navegador não clica sozinho — clica aqui.
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        const f = document.activeElement
        if (f && f.matches?.('[role="button"], [role="option"], [role="tab"]') && !/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(f.tagName)) { e.preventDefault(); e.stopImmediatePropagation(); f.click() }
        return
      }
      // Rua: M entra no menu do topo; Esc no menu volta a andar.
      if (!escopo() && document.querySelector(MUNDO)) {
        const f = document.activeElement
        if (e.key.toLowerCase() === 'm' && !e.repeat && !f?.closest?.(HUD)) {
          const b = document.querySelector(HUD)?.querySelector('button:not([disabled])')
          if (b) { e.preventDefault(); e.stopImmediatePropagation(); b.focus({ focusVisible: true }); return }
        }
        if (e.key === 'Escape' && f?.closest?.(HUD)) { e.preventDefault(); e.stopImmediatePropagation(); f.blur(); return }
      }
      const dir = DIRS[e.key.toLowerCase()]
      if (!dir) return
      const foco = document.activeElement
      // campos que usam as setas pra si: ←/→ no texto e no slider ficam com eles
      if (foco && (dir === 'left' || dir === 'right') && (foco.tagName === 'TEXTAREA' || (foco.tagName === 'INPUT' && foco.type !== 'checkbox' && foco.type !== 'radio' && foco.type !== 'button'))) return
      if (foco?.tagName === 'SELECT' || foco?.tagName === 'TEXTAREA') return
      let camada = escopo()
      // HUD da rua (o menu do topo): com o foco nele, as setas andam pelos
      // botões do HUD; fora dele (rua sem nada aberto) as setas andam com o boneco.
      const hud = !camada && foco?.closest?.(HUD)
      if (hud) camada = hud
      if (!camada && document.querySelector(MUNDO)) return
      const raiz = camada || document.body
      const lista = candidatos(raiz)
      if (!lista.length) return
      e.preventDefault()
      e.stopImmediatePropagation()
      const dentro = foco && foco !== document.body && raiz.contains(foco) && lista.includes(foco)
      const alvo = dentro ? proximo(foco, lista, dir) : primeiro(lista)
      if (!alvo) return
      escolhaDoVigia = null
      alvo.focus({ focusVisible: true })
      alvo.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }
    // Seletor sempre visível: tela nova ou modal novo sem nada em foco (o
    // botão focado sumiu, abriu um diálogo por cima) → foca o primeiro botão.
    // Na rua sem modal não mexe (o foco num botão do HUD roubaria o Enter).
    let escolhaDoVigia = null
    const vigia = setInterval(() => {
      const foco = document.activeElement
      const camada = escopo()
      if (!camada && document.querySelector(MUNDO)) return
      const raiz = camada || document.body
      const lista = candidatos(raiz)
      if (foco && foco !== document.body && raiz.contains(foco)) {
        // o vigia escolheu algo de passagem (o botão principal estava sumido
        // numa animação) e ele voltou: devolve o seletor pro principal
        const inicio = lista.find(el => el.hasAttribute('data-nav-inicio'))
        if (foco === escolhaDoVigia && inicio && inicio !== foco) { escolhaDoVigia = inicio; inicio.focus({ focusVisible: true, preventScroll: true }) }
        return
      }
      if (lista.length) { escolhaDoVigia = primeiro(lista); escolhaDoVigia.focus({ focusVisible: true, preventScroll: true }) }
    }, 350)
    // Marca visual própria (classe), além do :focus — o contorno aparece mesmo
    // quando o navegador não pinta o foco (janela sem foco, foco programático).
    let marcado = null
    const marcar = () => {
      const f = document.activeElement
      const alvo = f && f !== document.body && f.matches?.(FOCAVEIS) ? f : null
      if (alvo === marcado) return
      marcado?.classList.remove('gang-nav-sel')
      marcado = alvo
      marcado?.classList.add('gang-nav-sel')
    }
    const tique = setInterval(marcar, 120)
    document.addEventListener('focusin', marcar)
    document.addEventListener('focusout', marcar)
    window.addEventListener('keydown', onKey, { capture: true })
    return () => { clearInterval(vigia); clearInterval(tique); document.removeEventListener('focusin', marcar); document.removeEventListener('focusout', marcar); marcado?.classList.remove('gang-nav-sel'); window.removeEventListener('keydown', onKey, { capture: true }) }
  }, [ativo])
}
