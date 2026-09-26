#!/usr/bin/env node
/* Auditoria do CSS do LDI Gangues (Fase 6 da refatoração de set/2026).
   Roda no predeploy: se achar ERRO, o deploy para. Uso: node scripts/gangues-css-audit.cjs

   ERRO (barra o deploy):
   - seletor morto: classe que nenhum .js/.jsx/.json/.html do src usa
     (nem como prefixo de template `x-${...}` / 'x-' + y). Classe dentro de
     :not(...) não conta.
   - arquivo CSS com mais de 500 linhas (regra oficial do AGENTS.md)
   - @media (max-width|min-width) >= 480px — dentro da coluna de 480 isso é
     sempre verdadeiro/falso; quebra o visual único mobile (Bíblia §4)
   - unidade vw crua — use calc(N * var(--app-vw) / 100)
   - position: fixed com inset: 0 — escapa da coluna; use inset: 0 var(--app-gutter)
   AVISO (só informa):
   - cor hex escrita à mão fora de styles/paleta.css (conta por arquivo) */
const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const GANGUES = path.join(SRC, 'pages/games/Gangues')
const LIMITE_LINHAS = 500

function listar(dir, filtro, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { if (e.name !== 'node_modules') listar(p, filtro, acc) }
    else if (filtro(e.name)) acc.push(p)
  }
  return acc
}

let texto = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
for (const f of listar(SRC, n => /\.(jsx?|json|html)$/.test(n))) texto += '\n' + fs.readFileSync(f, 'utf8')
const tokens = new Set(texto.match(/[A-Za-z0-9_-]+/g))
const prefixos = [
  ...[...texto.matchAll(/([A-Za-z0-9_-]+-)\$\{/g)].map(m => m[1]),
  ...[...texto.matchAll(/['"`]([A-Za-z0-9_-]+-)['"`]\s*\+/g)].map(m => m[1]),
]
const usada = c => tokens.has(c) || prefixos.some(p => c.startsWith(p))
const classesMortas = sel => [...sel.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '')
  .matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map(m => m[1]).filter(c => !usada(c))

const erros = []
const avisos = []
for (const file of listar(GANGUES, n => n.endsWith('.css'))) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const src = fs.readFileSync(file, 'utf8')
  const nLinhas = src.split('\n').length
  if (nLinhas > LIMITE_LINHAS) erros.push(`${rel}: ${nLinhas} linhas (limite ${LIMITE_LINHAS})`)
  const root = postcss.parse(src, { from: file })
  root.walkAtRules('media', at => {
    const m = at.params.match(/(max|min)-width\s*:\s*(\d+)px/)
    if (m && +m[2] >= 480) erros.push(`${rel}:${at.source.start.line}: @media ${at.params} (>= 480px fura o visual único mobile)`)
  })
  root.walkRules(rule => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return
    for (const sel of rule.selectors) {
      const mortas = classesMortas(sel)
      if (mortas.length) erros.push(`${rel}:${rule.source.start.line}: seletor morto "${sel}" (${mortas.join(', ')})`)
    }
    const decls = {}
    rule.each(n => { if (n.type === 'decl') decls[n.prop] = n.value })
    if (decls.position === 'fixed' && decls.inset === '0') erros.push(`${rel}:${rule.source.start.line}: "${rule.selector}" é fixed com inset: 0 — use inset: 0 var(--app-gutter)`)
  })
  let hex = 0
  root.walkDecls(d => {
    if (/\d(\.\d+)?vw\b/.test(d.value)) erros.push(`${rel}:${d.source.start.line}: ${d.prop}: ${d.value} — vw cru, use var(--app-vw)`)
    if (!rel.endsWith('styles/paleta.css') && !d.prop.startsWith('--')) hex += (d.value.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || []).length
  })
  if (hex) avisos.push(`${rel}: ${hex} cor(es) hex fora da paleta`)
}

const totalHex = avisos.reduce((s, a) => s + Number(a.match(/: (\d+) cor/)[1]), 0)
console.log(`[gangues-css-audit] ${avisos.length} arquivo(s) com cor hex fora da paleta (${totalHex} no total) — aviso, não bloqueia`)
if (erros.length) {
  console.error(`[gangues-css-audit] ${erros.length} ERRO(S):`)
  for (const e of erros) console.error('  ✗ ' + e)
  process.exit(1)
}
console.log('[gangues-css-audit] OK — nenhum seletor morto, arquivo > 500 linhas, @media de desktop, vw cru ou overlay fora da coluna.')
