import { useEffect } from 'react'
import './WebtoonCompare.css'

// Página de comparação PRIVADA — só acessível por quem tem o link direto
// (/preview-privado/webtoon-00-comparar). Não tem link em nenhum lugar do
// site (navbar, footer, sitemap.xml, prerender-routes.js) e usa noindex
// por garantia. Pedido do Isaias/set-2026: comparar o webtoon 00 antigo
// (37 páginas) com o remake novo (32 páginas), lado a lado, ele e o sócio.
//
// As duas imagens (webtoon-00-novo.png, webtoon-00-antigo.png) NÃO ficam
// em src/assets nem em public/ — são grandes demais (90MB/28MB) pra viver
// no histórico do git principal. Elas são copiadas manualmente pra
// dist/preview-privado/ só na hora do deploy (não fazem parte do build
// normal) — ver instrução no PR/commit. Quando a comparação acabar, é só
// não copiar mais elas no próximo deploy (o próprio Isaias pediu "depois
// vamos destruir ela").
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
        <h2>NOVO — remake (32 páginas)</h2>
        <img src="/preview-privado/webtoon-00-novo.png" alt="Webtoon 00 — versão nova" loading="lazy" />
      </section>

      <section className="webtoon-compare__col">
        <h2>ANTIGO (37 páginas)</h2>
        <img src="/preview-privado/webtoon-00-antigo.png" alt="Webtoon 00 — versão antiga" loading="lazy" />
      </section>
    </main>
  )
}
