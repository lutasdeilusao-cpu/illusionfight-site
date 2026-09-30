// --app-gutter no CSS usa 100vw, que no desktop INCLUI a barra de rolagem —
// a moldura saía ~8px maior de cada lado e todo overlay fixo (navbar, Rádio
// Nina, avisos) ficava mais estreito que a coluna. Aqui medimos a largura
// real sem a barra (clientWidth) e sobrescrevemos a variável.
function medir() {
  const raiz = document.documentElement
  const larguraApp = parseFloat(getComputedStyle(raiz).getPropertyValue('--app-w')) || 480
  const util = raiz.clientWidth
  raiz.style.setProperty('--app-gutter', `${Math.max(0, (util - larguraApp) / 2)}px`)
  raiz.style.setProperty('--app-vw', `${Math.min(util, larguraApp)}px`)
}
medir()
window.addEventListener('resize', medir)
new ResizeObserver(medir).observe(document.documentElement)
