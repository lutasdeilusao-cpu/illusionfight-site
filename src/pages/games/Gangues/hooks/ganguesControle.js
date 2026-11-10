// Modo de controle do LDI Gangues (Isaias, 10/11/2026: "no começo a gente vai
// perguntar se ele quer jogar com mouse ou com o teclado... se quiser jogar
// com o teclado o jogo inteiro tem que ser navegável via teclado... e o
// analógico e o botão de interação têm que sumir"). Só no computador — no
// celular a pergunta não aparece e o modo é sempre toque.
//
// Modo 'teclado' liga a classe `gang-teclado` no <html>: some o analógico e o
// botão de interagir da rua (styles/teclado.css) e as setas passam a andar
// pelos botões (useGanguesNavTeclado). A escolha fica no navegador e troca nas
// Opções.
import { useSyncExternalStore } from 'react'

const CHAVE = 'ldi-gangues-controle'
const ouvintes = new Set()

export const noComputador = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches)

function ler() {
  try { const v = localStorage.getItem(CHAVE); return v === 'teclado' || v === 'mouse' ? v : null } catch { return null }
}

let atual = typeof window === 'undefined' ? null : ler()

function aplicarClasse() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('gang-teclado', noComputador() && atual === 'teclado')
}
aplicarClasse()

/** 'teclado' | 'mouse' | null (ainda não escolheu). */
export const modoControle = () => atual

export function definirModoControle(modo) {
  atual = modo
  try { localStorage.setItem(CHAVE, modo) } catch { /* modo anônimo: vale só nesta aba */ }
  aplicarClasse()
  ouvintes.forEach(fn => fn())
}

const assinar = fn => { ouvintes.add(fn); return () => ouvintes.delete(fn) }

/** Hook: devolve o modo atual e re-renderiza quando ele muda. */
export function useModoControle() {
  return useSyncExternalStore(assinar, modoControle, () => null)
}
