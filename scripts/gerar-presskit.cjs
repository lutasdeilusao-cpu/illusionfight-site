/* Press kit dos creators: junta as artes oficiais + os textos de imprensa
   (scripts/presskit/<idioma>.txt) num .zip só, servido em
   /presskit/illusion-fight-presskit.zip. Roda no fim do `build`, direto em
   dist/ — o .zip nunca entra no git (as artes já estão lá em src/assets).
   Arte nova pro kit: entra na lista ARQUIVOS. Zip escrito à mão com o zlib do
   Node, sem dependência nova. */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const RAIZ = path.join(__dirname, '..')
const A = (p) => path.join(RAIZ, 'src/assets', p)
const PASTA = 'illusion-fight-presskit/'

const CONTOS = fs.readdirSync(A('images/contos/capas')).filter(f => f.endsWith('.webp')).sort()

const ARQUIVOS = [
  ['LEIA-ME-PT.txt', path.join(__dirname, 'presskit/pt.txt')],
  ['README-EN.txt', path.join(__dirname, 'presskit/en.txt')],
  ['LEEME-ES.txt', path.join(__dirname, 'presskit/es.txt')],
  ['01-logos/logo-illusion-fight-pt.png', A('images/logos/logo-completa-pt.png')],
  ['01-logos/logo-illusion-fight-en.png', A('images/logos/logo-completa-en.png')],
  ['01-logos/logo-illusion-fight-es.png', A('images/logos/logo-completa-es.png')],
  ['02-banners/kim-lutas-de-ilusao.webp', A('images/banners/banner-01.webp')],
  ['02-banners/trio-web-shard.webp', A('images/banners/banner-02.webp')],
  ['02-banners/fliperama-games.webp', A('images/banners/banner-03.webp')],
  ['02-banners/banda-radio-nina.webp', A('images/banners/banner-04.webp')],
  ['02-banners/trio-loja.webp', A('images/banners/banner-05.webp')],
  ['03-capas/lutas-de-ilusao-capitulo-01.webp', A('images/livro/capitulo-01.webp')],
  ['03-capas/web-shard.webp', A('webshard/capa-lutas-de-ilusao.webp')],
  ['03-capas/contos-de-ilusao.webp', A('images/contos/capa-illusion-tales.webp')],
  ['03-capas/o-mundo-das-sombras.webp', A('obras/mundo-das-sombras/capa.webp')],
  ['03-capas/mar-de-cinzas.webp', A('obras/mar-de-cinzas/capa.webp')],
  ...CONTOS.map(f => [`04-contos/conto-${f}`, A(`images/contos/capas/${f}`)]),
  ...['kim', 'jack', 'nina', 'ryan'].map(p => [`05-personagens/ficha-${p}.webp`, A(`images/creators/fichas/ficha-${p}.webp`)]),
]

function dosHora(d) {
  return {
    hora: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    data: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  }
}

function montarZip(itens) {
  const locais = []
  const central = []
  let offset = 0
  const { hora, data } = dosHora(new Date())
  for (const [nome, origem] of itens) {
    const bruto = fs.readFileSync(origem)
    const texto = nome.endsWith('.txt')
    const dados = texto ? zlib.deflateRawSync(bruto, { level: 9 }) : bruto
    const metodo = texto ? 8 : 0 // imagem já vem comprimida: guarda como está
    const nomeBuf = Buffer.from(PASTA + nome, 'utf8')
    const crc = zlib.crc32(bruto)
    const loc = Buffer.alloc(30)
    loc.writeUInt32LE(0x04034b50, 0); loc.writeUInt16LE(20, 4); loc.writeUInt16LE(0x0800, 6)
    loc.writeUInt16LE(metodo, 8); loc.writeUInt16LE(hora, 10); loc.writeUInt16LE(data, 12)
    loc.writeUInt32LE(crc, 14); loc.writeUInt32LE(dados.length, 18); loc.writeUInt32LE(bruto.length, 22)
    loc.writeUInt16LE(nomeBuf.length, 26); loc.writeUInt16LE(0, 28)
    const cen = Buffer.alloc(46)
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8)
    cen.writeUInt16LE(metodo, 10); cen.writeUInt16LE(hora, 12); cen.writeUInt16LE(data, 14)
    cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(dados.length, 20); cen.writeUInt32LE(bruto.length, 24)
    cen.writeUInt16LE(nomeBuf.length, 28); cen.writeUInt32LE(offset, 42)
    locais.push(loc, nomeBuf, dados)
    central.push(cen, nomeBuf)
    offset += loc.length + nomeBuf.length + dados.length
  }
  const tamCentral = central.reduce((s, b) => s + b.length, 0)
  const fim = Buffer.alloc(22)
  fim.writeUInt32LE(0x06054b50, 0); fim.writeUInt16LE(itens.length, 8); fim.writeUInt16LE(itens.length, 10)
  fim.writeUInt32LE(tamCentral, 12); fim.writeUInt32LE(offset, 16)
  return Buffer.concat([...locais, ...central, fim])
}

const destino = path.join(RAIZ, 'dist/presskit')
fs.mkdirSync(destino, { recursive: true })
const zip = montarZip(ARQUIVOS)
fs.writeFileSync(path.join(destino, 'illusion-fight-presskit.zip'), zip)
console.log(`[presskit] ${ARQUIVOS.length} arquivos, ${(zip.length / 1048576).toFixed(1)} MB → dist/presskit/illusion-fight-presskit.zip`)
