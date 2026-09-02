/**
 * Converte um documento markdown de worldbuilding num modelo estruturado
 * para renderização visual (grupos → verbetes → chips + corpo).
 *
 * Dois formatos de origem são aceitos:
 *   A) ## = grupo (Parte / Seção),  ### = verbete
 *   B) ## = verbete (quando o documento não tem nenhum ###)
 * Em ambos, #### vira sub-rótulo dentro do verbete, e a 1ª linha do verbete
 * no formato "Rótulo: valor  Rótulo: valor" vira chips.
 */

const CHIP_LABELS = [
  'Status no Almirantado', 'Perigo classificado', 'Inspiração cultural', 'Expectativa de vida',
  'Classificação operacional', 'Nível de ameaça', 'Área de ocorrência',
  'Status', 'Território', 'Tamanho', 'Perigo', 'Habitat', 'Alcance', 'Origem', 'Frequência',
]
const CHIP_SPLIT = new RegExp(`\\s+(?=(?:${CHIP_LABELS.join('|')}):\\s)`)
const CHIP_START = new RegExp(`^(?:${CHIP_LABELS.join('|')}):\\s`)

function parseChips(txt) {
  const chunks = txt.split(CHIP_SPLIT)
  const chips = []
  for (const c of chunks) {
    const idx = c.indexOf(': ')
    if (idx < 2) return null
    chips.push([c.slice(0, idx).trim(), c.slice(idx + 2).trim()])
  }
  return chips.length >= 2 ? chips : null
}

function isChipLine(txt) {
  if (txt.length > 320 || !CHIP_START.test(txt)) return false
  return parseChips(txt) != null
}

function truncate(s, n) {
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…'
}

function pushBody(entry, line) {
  if (!entry.corpo.length && !entry.chips.length && isChipLine(line)) {
    entry.chips = parseChips(line)
    return
  }
  const lm = line.match(/^([^.:—]{3,44}):\s+(.+)/)
  entry.corpo.push(lm ? { tipo: 'p', rotulo: lm[1].trim(), texto: lm[2].trim() } : { tipo: 'p', texto: line })
}

export function parseUniverso(md) {
  const src = md || ''
  const entryLevel = /^###\s/m.test(src) ? 3 : 2
  const intro = []
  const grupos = []
  let g = null
  let e = null

  const openGroup = (titulo) => { g = { titulo, intro: [], entradas: [] }; grupos.push(g); e = null }
  const openEntry = (nome) => {
    if (!g) openGroup(null)
    e = { nome, chips: [], corpo: [] }
    g.entradas.push(e)
  }

  for (const raw of src.split('\n')) {
    const line = raw.trim()
    if (!line || line === '---') continue

    const h = line.match(/^(#{2,6})\s+(.+)/)
    if (h) {
      const level = h[1].length
      const text = h[2].trim()
      if (entryLevel === 3 && level === 2) openGroup(text)
      else if (level === entryLevel) openEntry(text)
      else if (level > entryLevel && e) e.corpo.push({ tipo: 'sub', texto: text })
      else if (e) e.corpo.push({ tipo: 'p', texto: text })
      continue
    }

    if (e) pushBody(e, line)
    else if (g) g.intro.push(line)
    else intro.push(line)
  }

  // funde pares de nomes alternativos (dois verbetes seguidos, o 1º sem conteúdo)
  for (const gr of grupos) {
    for (let i = 0; i < gr.entradas.length - 1; i++) {
      const cur = gr.entradas[i]
      if (!cur.corpo.length && !cur.chips.length) {
        gr.entradas[i + 1].nome = `${cur.nome} · ${gr.entradas[i + 1].nome}`
        gr.entradas.splice(i, 1)
        i--
      }
    }
  }

  // remove grupos totalmente vazios (sem intro e sem entradas)
  const limpos = grupos.filter(gr => gr.entradas.length || gr.intro.length)

  let uid = 0
  for (const gr of limpos) {
    for (const en of gr.entradas) {
      en.id = `e${uid++}`
      const first = en.corpo.find(c => c.tipo === 'p' && c.texto.length > 40 && c.texto !== c.texto.toUpperCase())
        || en.corpo.find(c => c.tipo === 'p')
      en.teaser = first ? truncate(first.texto, 170) : ''
    }
  }

  return { intro, grupos: limpos }
}
