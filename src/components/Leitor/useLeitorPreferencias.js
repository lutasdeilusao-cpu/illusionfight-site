import { useEffect, useState } from 'react'

/* Preferências de leitura do visitante (tamanho, fonte, espaçamento) — valem
   pra todo capítulo de texto do site (livro, contos, obras). Ficam só no
   navegador: é conveniência de tela, não progresso. A antiga "largura" saiu
   (30/09/2026): o portal é mobile only, a coluna é sempre a do celular. */

export const TAMANHO_MIN = 14
export const TAMANHO_MAX = 26
export const FONTES = ['padrao', 'serifa', 'mono']
export const ESPACOS = ['compacto', 'normal', 'amplo']

const CHAVE_TAMANHO = 'ldi-reader-fontsize'
const CHAVE_FONTE = 'ldi-reader-fonte'
const CHAVE_ESPACO = 'ldi-reader-espaco'

function ler(chave, padrao) {
  try { return localStorage.getItem(chave) ?? padrao } catch { return padrao }
}
function gravar(chave, valor) {
  try { localStorage.setItem(chave, String(valor)) } catch { /* storage bloqueado */ }
}

export function useLeitorPreferencias() {
  const [tamanho, setTamanho] = useState(() => {
    const n = Number(ler(CHAVE_TAMANHO, 18))
    return Number.isFinite(n) ? Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, n)) : 18
  })
  const [fonte, setFonte] = useState(() => {
    const f = ler(CHAVE_FONTE, 'padrao')
    return FONTES.includes(f) ? f : 'padrao'
  })
  const [espaco, setEspaco] = useState(() => {
    const e = ler(CHAVE_ESPACO, 'normal')
    return ESPACOS.includes(e) ? e : 'normal'
  })

  useEffect(() => gravar(CHAVE_TAMANHO, tamanho), [tamanho])
  useEffect(() => gravar(CHAVE_FONTE, fonte), [fonte])
  useEffect(() => gravar(CHAVE_ESPACO, espaco), [espaco])

  return {
    tamanho, fonte, espaco, setFonte, setEspaco,
    menor: () => setTamanho(t => Math.max(TAMANHO_MIN, t - 2)),
    maior: () => setTamanho(t => Math.min(TAMANHO_MAX, t + 2)),
  }
}
