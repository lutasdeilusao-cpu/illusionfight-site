import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ONOMATOPEIAS from '../data/onomatopeias.json'

// Graphic novel: cada trecho da cena (entre dois ---) é um QUADRO — a arte dele
// (arte/<id da cena>-<n>.webp, n a partir de 1) com as falas daquele momento embaixo.
// Trecho sem arte vira quadro só de texto.
// Lê as linhas da cena e separa em três vozes:
//   narração              → texto corrido
//   [NOME] "fala"         → balão com o nome de quem fala
//   [SISTEMA] "mensagem"  → linha de terminal do LDI
//   *linha inteira*       → pensamento (balão de nuvem)
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
  if (/^\*[^*]+\*$/.test(linha.trim())) return { tipo: 'pensa', texto: linha.trim().slice(1, -1) }
  return { tipo: 'narra', texto: linha }
}

// Fala gritada (termina em "!" e vem quase toda em maiúscula, ou com "!!") vira balão estourado.
function gritada(texto) {
  const letras = texto.replace(/[^A-Za-zÀ-ÿ]/g, '')
  return /!\s*$/.test(texto) && (/!!/.test(texto) || (letras.length > 3 && letras === letras.toUpperCase()))
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

// Revela um quadro de cada vez. Cada quadro fica o tempo escolhido pelo leitor
// (`tempo`, ms; quadro com muito texto ganha mais, na proporção), com uma barrinha
// enchendo embaixo; tocar adianta. A página só termina (onPronto → a escolha abre)
// DEPOIS do tempo de leitura do último quadro — nunca no instante em que ele aparece.
const LETRAS_POR_TEMPO = 200
export default function Narrativa({ cenaId, linhas, veia, habilidades = [], nome, tempo = 5000, onPronto }) {
  // A lista de habilidades entra pela chave, não pela referência: aprender no
  // meio da cena não pode reiniciar o texto.
  const chaveHabs = habilidades.join(',')
  const quadros = useMemo(() => {
    const trechos = [[]]
    for (const l of linhas) { if (l.trim() === '---') trechos.push([]); else trechos[trechos.length - 1].push(l) }
    return trechos
      .map((t, i) => ({
        arte: arteDe(`${cenaId}-${i + 1}`),
        // trecho longo tem uma 2ª arte no meio do texto (arte/<cena>-<n>b.webp)
        arte2: arteDe(`${cenaId}-${i + 1}b`),
        onoma: ONOMATOPEIAS[`${cenaId}-${i + 1}`] || null,
        blocos: prepararLinhas(t, { veia, habilidades, nome }).map(lerLinha),
      }))
      .filter(q => q.arte || q.blocos.length)
  }, [cenaId, linhas, veia, chaveHabs, nome]) // eslint-disable-line react-hooks/exhaustive-deps
  const [vistos, setVistos] = useState(1)
  const [acabou, setAcabou] = useState(false)
  const atual = quadros[vistos - 1]
  const letrasAtual = atual ? atual.blocos.reduce((s, b) => s + b.texto.length, 0) : 0
  const dur = Math.round(tempo * Math.max(1, letrasAtual / LETRAS_POR_TEMPO))
  const avancar = () => { if (vistos < quadros.length) setVistos(v => v + 1); else setAcabou(true) }
  const ultimo = useRef(null)

  useEffect(() => {
    if (acabou) { onPronto?.(); return }
    const t = setTimeout(avancar, dur)
    return () => clearTimeout(t)
  }, [vistos, acabou, dur, onPronto]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (vistos > 1) ultimo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [vistos])

  return (
    <div className="ld-narrativa" onClick={avancar}>
      {/* quanto falta pro próximo quadro: barrinha discreta, presa no pé da tela */}
      {!acabou && <span key={vistos} className="ld-relogio" style={{ '--dur': `${dur}ms` }} aria-hidden="true" />}
      {quadros.slice(0, vistos).map((q, i) => (
        <motion.figure key={i} ref={i === vistos - 1 ? ultimo : null} className={`ld-quadro${q.arte ? ' tem-arte' : ''}`}
          initial={{ opacity: 0, y: 26, rotate: i % 2 ? 1.4 : -1.4, scale: 0.96 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
          {q.arte && (
            <div className="ld-quadro__moldura">
              <img className="ld-quadro__arte" src={q.arte} alt="" />
              {q.onoma && <motion.span className="ld-onoma" initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: -10 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 380, damping: 11 }}>{q.onoma}</motion.span>}
            </div>
          )}
          {q.blocos.map((b, j) => (
            <Fragment key={j}>
              {q.arte2 && j === Math.ceil(q.blocos.length / 2) && (
                <div className="ld-quadro__moldura is-segunda"><img className="ld-quadro__arte" src={q.arte2} alt="" /></div>
              )}
              <motion.div className={`ld-bloco ld-bloco--${b.tipo}${b.tipo === 'fala' && gritada(b.texto) ? ' is-grito' : ''}`}
                initial={{ opacity: 0, y: 6, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, delay: 0.25 + j * 0.22 }}>
                {b.nome && <span className="ld-bloco__nome">{b.nome}</span>}
                <p>{comItalico(b.texto)}</p>
              </motion.div>
            </Fragment>
          ))}
        </motion.figure>
      ))}
    </div>
  )
}
