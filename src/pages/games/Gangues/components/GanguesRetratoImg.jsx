import { useState } from 'react'

/** <img> de retrato com fallback se a imagem falhar ao CARREGAR (não só se
 *  não existir) — conexão ruim, CDN fora do ar, asset corrompido etc.
 *  Achado do Isaias, 15/09/2026 (jogando num evento com wifi ruim): o
 *  retrato do "Pingo" existia nos dados (o `src` resolvia certinho), mas a
 *  imagem não baixou a tempo — como o código só decidia "tem retrato? usa
 *  <img>" e nunca revisitava isso, sobrava um quadrado vazio no lugar da
 *  cara, sem nenhum fallback pra letra/emoji de sempre. Substitui os vários
 *  `{retrato ? <img src={retrato}/> : <fallback>}` espalhados pelo jogo por
 *  um componente só que também reage a falha de rede. */
export default function GanguesRetratoImg({ src, fallback = null, alt = '', ...imgProps }) {
  const [falhou, setFalhou] = useState(false)
  if (!src || falhou) return fallback
  return <img src={src} alt={alt} onError={() => setFalhou(true)} {...imgProps} />
}
