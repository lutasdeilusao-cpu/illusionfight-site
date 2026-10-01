// Teclado do LDI Gangues (Isaias, 01/10/2026: "temos que dar suporte ao
// teclado pra movimento e ações porque vamos lançar na Steam"). O movimento
// (setas/WASD) mora em useGanguesCenaMovimento; aqui ficam as AÇÕES.
//
// MAPA DE TECLAS (o mesmo em todo o jogo):
//   E · Enter · Espaço — interagir / confirmar / avançar a fala
//   Esc                — fechar / voltar / pular a fala
//   1–9                — escolher a opção N (conversa, menu da luta, talento)
//   A                  — atacar (na luta)
//   B                  — liga/desliga a briga automática (na rua)
//   I                  — mochila · F — ficha da tropa (na rua)
// Tab + Enter continuam valendo em qualquer botão (o foco aparece com o
// contorno ciano — ver styles/teclado.css).
import { useEffect, useRef } from 'react'

const digitando = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)

/** Normaliza a tecla: 'enter', 'escape', ' ' → 'espaco', 'e', '1'… */
export const teclaDe = e => (e.key === ' ' ? 'espaco' : e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase())

/** Liga um mapa { tecla: fn } enquanto `ativo`. A fn recebe o evento e pode
 *  devolver `false` pra deixar a tecla seguir (não consumir). Atalho com
 *  tecla modificadora (Ctrl/Alt/Meta) nunca dispara — não briga com o
 *  navegador. `prioridade` alta = escuta antes (um modal por cima da cena). */
export default function useGanguesTeclado(mapa, ativo = true, prioridade = 0) {
  const mapaRef = useRef(mapa)
  mapaRef.current = mapa
  useEffect(() => {
    if (!ativo) return
    const onKey = e => {
      if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey || e.repeat) return
      if (digitando(e.target)) return
      const tecla = teclaDe(e)
      const fn = mapaRef.current[tecla] || (/^[1-9]$/.test(tecla) && mapaRef.current.numero)
      if (!fn) return
      const r = fn(e, tecla)
      if (r === false) return
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    // captura: quem tem prioridade maior registra primeiro e consome a tecla
    window.addEventListener('keydown', onKey, { capture: prioridade > 0 })
    return () => window.removeEventListener('keydown', onKey, { capture: prioridade > 0 })
  }, [ativo, prioridade])
}

/** Clica no N-ésimo (1 = primeiro) botão habilitado dentro de `raiz`. */
export function clicarOpcao(raiz, seletor, n) {
  const botoes = [...(raiz?.querySelectorAll(seletor) || [])].filter(b => !b.disabled)
  const b = botoes[n - 1]
  if (!b) return false
  b.click()
  return true
}
