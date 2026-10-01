// PORRINHA (palitinho) contra o Contador — jogo próprio dele, não é um
// minigame do produto. Cada um tem 3 palitos; a cada rodada esconde de 0 até
// o que tem na mão e chuta o TOTAL das duas mãos (o Contador nunca repete o
// teu chute). Quem acerta o total joga um palito fora. Zerou primeiro, ganhou.
import { useState } from 'react'
import { sfx } from '../../../../../../lib/sfx'

const sorteio = n => Math.floor(Math.random() * (n + 1))

// O Contador chuta: a mão dele + o que ele acha que tu tem (a média), sem
// repetir o teu chute — e se a conta der igual, ele desvia pro lado mais provável.
function chuteDoContador(maoDele, meus, dele, meuChute) {
  const max = meus + dele
  let chute = Math.min(max, maoDele + Math.round(meus / 2))
  if (chute === meuChute) chute = chute + 1 <= max ? chute + 1 : chute - 1
  return Math.max(0, chute)
}

export default function JogoPorrinha({ t, onFim }) {
  const [meus, setMeus] = useState(3)
  const [dele, setDele] = useState(3)
  const [mao, setMao] = useState(null)
  const [chute, setChute] = useState(null)
  const [rodada, setRodada] = useState(null) // { maoDele, chuteDele, total, quem }

  const abrir = () => {
    const maoDele = sorteio(dele)
    const chuteDele = chuteDoContador(maoDele, meus, dele, chute)
    const total = mao + maoDele
    const quem = chute === total ? 'voce' : chuteDele === total ? 'ele' : null
    setRodada({ maoDele, chuteDele, total, quem })
    if (quem) sfx.select?.(); else sfx.cancel?.()
  }

  const seguir = () => {
    const proxMeus = rodada.quem === 'voce' ? meus - 1 : meus
    const proxDele = rodada.quem === 'ele' ? dele - 1 : dele
    if (proxMeus === 0) { onFim(true); return }
    if (proxDele === 0) { onFim(false); return }
    setMeus(proxMeus); setDele(proxDele); setMao(null); setChute(null); setRodada(null)
  }

  const palitos = n => '|'.repeat(n) || '—'

  return (
    <div className="gang-jogo-porrinha">
      <div className="gang-jogo-placar">
        <span>{t('games.gangues.jogo.voce')} <b>{palitos(meus)}</b></span>
        <span>{t('games.gangues.jogo.contador')} <b>{palitos(dele)}</b></span>
      </div>

      {!rodada && (
        <>
          <p className="gang-jogo-rotulo">{t('games.gangues.jogo.porrinha_mao')}</p>
          <div className="gang-jogo-opcoes">
            {Array.from({ length: meus + 1 }, (_, n) => (
              <button key={n} className={mao === n ? 'is-on' : ''} onClick={() => { sfx.select?.(); setMao(n) }}>{n}</button>
            ))}
          </div>
          <p className="gang-jogo-rotulo">{t('games.gangues.jogo.porrinha_chute')}</p>
          <div className="gang-jogo-opcoes">
            {Array.from({ length: meus + dele + 1 }, (_, n) => (
              <button key={n} className={chute === n ? 'is-on' : ''} onClick={() => { sfx.select?.(); setChute(n) }}>{n}</button>
            ))}
          </div>
          <button className="gang-jogo-acao" disabled={mao == null || chute == null} onClick={abrir}>{t('games.gangues.jogo.porrinha_abrir')}</button>
        </>
      )}

      {rodada && (
        <div className="gang-jogo-revela">
          <p>{t('games.gangues.jogo.porrinha_revela', { mao, maoDele: rodada.maoDele, total: rodada.total, chute, chuteDele: rodada.chuteDele })}</p>
          <strong className={rodada.quem ? `is-${rodada.quem}` : ''}>
            {t(rodada.quem === 'voce' ? 'games.gangues.jogo.porrinha_voce_acertou' : rodada.quem === 'ele' ? 'games.gangues.jogo.porrinha_ele_acertou' : 'games.gangues.jogo.porrinha_ninguem')}
          </strong>
          <button className="gang-jogo-acao" onClick={seguir}>{t('games.gangues.jogo.seguir')}</button>
        </div>
      )}
    </div>
  )
}
