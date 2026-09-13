import { useEffect } from 'react'
import './WebtoonCompare.css'

// Página de comparação PRIVADA — só acessível por quem tem o link direto
// (/preview-privado/webtoon-00-comparar). Não tem link em nenhum lugar do
// site (navbar, footer, sitemap.xml, prerender-routes.js) e usa noindex
// por garantia. Pedido do Isaias/set-2026: comparar o webtoon 00 antigo
// (37 páginas) com o remake novo (32 páginas), lado a lado, ele e o sócio.
//
// As imagens NÃO ficam em src/assets nem em public/ — grandes demais pra
// viver no histórico do git principal. São recortadas uma vez (imagem
// unificada original → 1 PNG por página, script local, set/2026 — pedido do
// Isaias: "na verdade são várias páginas que foram unificadas", ficava tudo
// num scroll gigante só, difícil de comparar página a página com o sócio) e
// publicadas em dist/preview-privado/paginas/{novo,antigo}/NN.png só na hora
// do deploy — ver scripts/restaurar-preview-privado.cjs, que restaura tudo
// isso sozinho a cada `npm run deploy` (não depende de ninguém copiar
// manualmente). Quando a comparação acabar, é só não restaurar mais no
// próximo deploy (o próprio Isaias pediu "depois vamos destruir ela").
const TOTAL_PAGINAS = { novo: 32, antigo: 37 }

function paginas(versao) {
  return Array.from({ length: TOTAL_PAGINAS[versao] }, (_, i) => i + 1)
}

export default function WebtoonCompare() {
  useEffect(() => {
    document.title = 'Comparar webtoon 00 (privado)'
  }, [])

  return (
    <main className="webtoon-compare">
      <meta name="robots" content="noindex,nofollow" />
      <header className="webtoon-compare__head">
        <h1>Webtoon 00 — comparar versões</h1>
        <p>Página privada, só pra revisão interna. Sem link em lugar nenhum do site.</p>
      </header>

      <section className="webtoon-compare__col">
        <h2>NOVO — remake ({TOTAL_PAGINAS.novo} páginas)</h2>
        {paginas('novo').map(n => (
          <figure key={n} className="webtoon-compare__pagina">
            <figcaption>pág. {n}</figcaption>
            <img src={`/preview-privado/paginas/novo/${String(n).padStart(2, '0')}.png`} alt={`Webtoon 00 novo — página ${n}`} loading="lazy" />
          </figure>
        ))}
      </section>

      <section className="webtoon-compare__col">
        <h2>ANTIGO ({TOTAL_PAGINAS.antigo} páginas)</h2>
        {paginas('antigo').map(n => (
          <figure key={n} className="webtoon-compare__pagina">
            <figcaption>pág. {n}</figcaption>
            <img src={`/preview-privado/paginas/antigo/${String(n).padStart(2, '0')}.png`} alt={`Webtoon 00 antigo — página ${n}`} loading="lazy" />
          </figure>
        ))}
      </section>
    </main>
  )
}
