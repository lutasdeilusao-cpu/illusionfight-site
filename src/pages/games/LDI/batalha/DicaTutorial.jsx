// Explicação da luta tutorial, sempre na tela: cartões do começo (tempo parado),
// "espera..." enquanto a nota guiada vem, "AGORA!" quando ela chega na hora
// (tempo parado até o toque), aviso nas notas sem ajuda e a aula do super.
const BASE = 'games.ldi.batalha.ritmo.tutorial'

export default function DicaTutorial({ t, s, agora }) {
  const cartoes = t(`${BASE}.cartoes`)
  const i = s.cartao ?? 0
  if (Array.isArray(cartoes) && i < cartoes.length) {
    const c = cartoes[i]
    return (
      <div className="rt-tut-cartao">
        <small>{i + 1}/{cartoes.length}</small>
        <b>{c.titulo}</b>
        <p>{c.texto}</p>
        <button type="button" className="rt-btn" onClick={() => { s.cartao = i + 1 }}>{t(`${BASE}.entendi`)}</button>
      </div>
    )
  }
  if (s.esperaSuper) return <Caixa titulo={t(`${BASE}.super.titulo`)} texto={t(`${BASE}.super.texto`)} baixo />
  if (s.esperaToque) {
    const d = s.esperaToque.dica
    return <Caixa titulo={t(`${BASE}.agora`)} texto={t(`${BASE}.${d}.agora`)} forte />
  }
  const vindo = s.notas.filter(n => n.estado === 'vindo').sort((a, b) => a.hora - b.hora)[0]
  if (!vindo) return null
  if (vindo.dica && !vindo.dicaVista) return <Caixa titulo={t(`${BASE}.${vindo.dica}.titulo`)} texto={t(`${BASE}.${vindo.dica}.antes`)} />
  if (vindo.tipo !== 'super' && vindo.hora - agora < 2500) return <Caixa titulo={t(`${BASE}.sozinho.titulo`)} texto={t(`${BASE}.sozinho.texto`)} leve />
  return null
}

function Caixa({ titulo, texto, forte, leve, baixo }) {
  return (
    <div className={`rt-dica${forte ? ' is-forte' : ''}${leve ? ' is-leve' : ''}${baixo ? ' is-super' : ''}`}>
      <b>{titulo}</b>
      <span>{texto}</span>
    </div>
  )
}
