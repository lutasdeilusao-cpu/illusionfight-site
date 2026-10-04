import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

// Lê as linhas da cena e separa em três vozes:
//   narração              → texto corrido
//   [NOME] "fala"         → balão com o nome de quem fala
//   [SISTEMA] "mensagem"  → linha de terminal do LDI
//   ---                   → respiro entre dois momentos da cena
// Linha que começa com {veia:N} só aparece pra quem segue a Veia N.
// {nome} vira o nome do jogador; *assim* vira pensamento (itálico).
const NOMES = { NEOGUIDE: 'NeoGuide', STORMBYTE: 'StormByte_91' }

function nomeDe(bruto) {
  if (NOMES[bruto]) return NOMES[bruto]
  if (/[_\d?]/.test(bruto)) return bruto
  return bruto.charAt(0) + bruto.slice(1).toLowerCase()
}

const semAspas = t => t.trim().replace(/^["“]|["”]$/g, '')

export function lerLinha(linha) {
  if (linha.trim() === '---') return { tipo: 'respiro', texto: '' }
  const m = linha.match(/^\[([^\]]+)\]\s*(.*)$/)
  if (m) {
    return m[1] === 'SISTEMA'
      ? { tipo: 'sistema', texto: semAspas(m[2]) }
      : { tipo: 'fala', nome: nomeDe(m[1]), texto: semAspas(m[2]) }
  }
  if (/^["“]/.test(linha)) return { tipo: 'fala', texto: semAspas(linha) }
  return { tipo: 'narra', texto: linha }
}

function prepararLinhas(linhas, { veia, nome }) {
  return linhas
    .filter(l => { const m = l.match(/^\{veia:(\d)\}/); return !m || Number(m[1]) === veia })
    .map(l => l.replace(/^\{veia:\d\}\s*/, '').replaceAll('{nome}', nome || ''))
}

// *trecho* → <em>trecho</em>
function comItalico(texto) {
  return texto.split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p))
}

// Revela um bloco de cada vez; tocar no texto mostra tudo de uma vez.
export default function Narrativa({ linhas, veia, nome, onPronto }) {
  const blocos = useMemo(() => prepararLinhas(linhas, { veia, nome }).map(lerLinha), [linhas, veia, nome])
  const [vistos, setVistos] = useState(1)
  const pronto = vistos >= blocos.length

  useEffect(() => {
    if (pronto) { onPronto?.(); return }
    const espera = Math.min(2200, 450 + blocos[vistos - 1].texto.length * 16)
    const t = setTimeout(() => setVistos(v => v + 1), espera)
    return () => clearTimeout(t)
  }, [vistos, pronto, blocos, onPronto])

  return (
    <div className="ld-narrativa" onClick={() => setVistos(blocos.length)}>
      {blocos.slice(0, vistos).map((b, i) => (
        <motion.div
          key={i}
          className={`ld-bloco ld-bloco--${b.tipo}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {b.nome && <span className="ld-bloco__nome">{b.nome}</span>}
          {b.tipo !== 'respiro' && <p>{comItalico(b.texto)}</p>}
        </motion.div>
      ))}
    </div>
  )
}
