import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Graphic novel: cada trecho da cena (entre dois ---) é um QUADRO — a arte dele
// (arte/<id da cena>-<n>.webp, n a partir de 1) com as falas daquele momento embaixo.
// Trecho sem arte vira quadro só de texto.
// Lê as linhas da cena e separa em três vozes:
//   narração              → texto corrido
//   [NOME] "fala"         → balão com o nome de quem fala
//   [SISTEMA] "mensagem"  → linha de terminal do LDI
//   ---                   → corte pro próximo quadro
// Linha que começa com {veia:N} só aparece pra quem segue a Veia N;
// com {hab:ID}, só pra quem já sabe aquela habilidade.
// {nome} vira o nome do jogador; *assim* vira pensamento (itálico).
const NOMES = { NEOGUIDE: 'NeoGuide', STORMBYTE: 'StormByte_91' }

function nomeDe(bruto) {
  if (NOMES[bruto]) return NOMES[bruto]
  if (/[_\d?]/.test(bruto)) return bruto
  return bruto.charAt(0) + bruto.slice(1).toLowerCase()
}

const semAspas = t => t.trim().replace(/^["“]|["”]$/g, '')

export function lerLinha(linha) {
  const m = linha.match(/^\[([^\]]+)\]\s*(.*)$/)
  if (m) {
    return m[1] === 'SISTEMA'
      ? { tipo: 'sistema', texto: semAspas(m[2]) }
      : { tipo: 'fala', nome: nomeDe(m[1]), texto: semAspas(m[2]) }
  }
  if (/^["“]/.test(linha)) return { tipo: 'fala', texto: semAspas(linha) }
  return { tipo: 'narra', texto: linha }
}

function prepararLinhas(linhas, { veia, habilidades, nome }) {
  return linhas
    .filter(l => {
      const m = l.match(/^\{(veia|hab):(\d+)\}/)
      if (!m) return true
      return m[1] === 'veia' ? Number(m[2]) === veia : habilidades.includes(Number(m[2]))
    })
    .map(l => l.replace(/^\{(veia|hab):\d+\}\s*/, '').replaceAll('{nome}', nome || ''))
}

// *trecho* → <em>trecho</em>
function comItalico(texto) {
  return texto.split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p))
}

const ARTES = import.meta.glob('../arte/*.webp', { eager: true, query: '?url', import: 'default' })
export const arteDe = nome => ARTES[`../arte/${nome}.webp`] || null

// Revela um quadro de cada vez (sozinho, no tempo de leitura); tocar adianta o próximo.
export default function Narrativa({ cenaId, linhas, veia, habilidades = [], nome, onPronto }) {
  // A lista de habilidades entra pela chave, não pela referência: aprender no
  // meio da cena não pode reiniciar o texto.
  const chaveHabs = habilidades.join(',')
  const quadros = useMemo(() => {
    const trechos = [[]]
    for (const l of linhas) { if (l.trim() === '---') trechos.push([]); else trechos[trechos.length - 1].push(l) }
    return trechos
      .map((t, i) => ({ arte: arteDe(`${cenaId}-${i + 1}`), blocos: prepararLinhas(t, { veia, habilidades, nome }).map(lerLinha) }))
      .filter(q => q.arte || q.blocos.length)
  }, [cenaId, linhas, veia, chaveHabs, nome]) // eslint-disable-line react-hooks/exhaustive-deps
  const [vistos, setVistos] = useState(1)
  const pronto = vistos >= quadros.length
  const ultimo = useRef(null)

  useEffect(() => {
    if (pronto) { onPronto?.(); return }
    const q = quadros[vistos - 1]
    const letras = q.blocos.reduce((s, b) => s + b.texto.length, 0)
    const espera = Math.min(9000, 1800 + letras * 28 + (q.arte ? 1200 : 0))
    const t = setTimeout(() => setVistos(v => v + 1), espera)
    return () => clearTimeout(t)
  }, [vistos, pronto, quadros, onPronto])

  useEffect(() => { if (vistos > 1) ultimo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [vistos])

  return (
    <div className="ld-narrativa" onClick={() => setVistos(v => Math.min(quadros.length, v + 1))}>
      {quadros.slice(0, vistos).map((q, i) => (
        <motion.figure key={i} ref={i === vistos - 1 ? ultimo : null} className={`ld-quadro${q.arte ? ' tem-arte' : ''}`}
          initial={{ opacity: 0, y: 26, rotate: i % 2 ? 1.4 : -1.4, scale: 0.96 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
          {q.arte && <div className="ld-quadro__moldura"><img className="ld-quadro__arte" src={q.arte} alt="" /></div>}
          {q.blocos.map((b, j) => (
            <motion.div key={j} className={`ld-bloco ld-bloco--${b.tipo}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 + j * 0.22 }}>
              {b.nome && <span className="ld-bloco__nome">{b.nome}</span>}
              <p>{comItalico(b.texto)}</p>
            </motion.div>
          ))}
        </motion.figure>
      ))}
    </div>
  )
}
