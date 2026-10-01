// Encontro JOGO — as fases do Contador (Alto do Morro) que não são porrada
// (Isaias, 30/09/2026: "ele é um cara que gosta de se divertir... jogos bem
// simples, só que únicos"). POI `tipo: 'jogo'` com `jogo: 'porrinha' | 'bilhar'`.
// Ganhou → resolve o ponto (abre a próxima sala). Perdeu → fecha sem marcar
// nada: dá pra jogar de novo quantas vezes quiser, de graça.
import { useCallback, useState } from 'react'
import { useLanguage } from '../../../../../../context/LanguageContext'
import { sfx } from '../../../../../../lib/sfx'
import JogoPorrinha from './JogoPorrinha'
import JogoBilhar from './JogoBilhar'
import './JogosContador.css'

const JOGOS = { porrinha: JogoPorrinha, bilhar: JogoBilhar }

export default function GanguesJogoContador({ poi, onResolve, onClose }) {
  const { t } = useLanguage()
  const [fase, setFase] = useState('intro') // intro | jogo | fim
  const [ganhou, setGanhou] = useState(false)
  const [partida, setPartida] = useState(0)
  const Jogo = JOGOS[poi.jogo] || JogoPorrinha
  const base = poi.i18n

  const fim = useCallback(ok => { setGanhou(ok); setFase('fim'); ok ? sfx.reward?.() : sfx.lose?.() }, [])
  const deNovo = () => { setPartida(n => n + 1); setFase('jogo') }

  return (
    <div className="gang-cena-enc gang-jogo">
      {fase !== 'jogo' && <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>}
      <span className="gang-jogo-tag">{t('games.gangues.jogo.tag')}</span>
      <h3>{t(`${base}.nome`)}</h3>

      {fase === 'intro' && (
        <>
          <p className="gang-jogo-fala">{t(`${base}.fala`)}</p>
          <p className="gang-jogo-regra">{t(`${base}.regra`)}</p>
          <button className="gang-jogo-acao" onClick={() => { sfx.select?.(); setFase('jogo') }}>{t('games.gangues.jogo.comecar')}</button>
        </>
      )}

      {fase === 'jogo' && <Jogo key={partida} t={t} onFim={fim} />}

      {fase === 'fim' && (
        <>
          <p className="gang-jogo-fala">{t(`${base}.${ganhou ? 'ganhou' : 'perdeu'}`)}</p>
          {ganhou
            ? <button className="gang-jogo-acao" onClick={() => onResolve({ ok: true, recompensa: poi.recompensa, revela: poi.revela })}>{t('games.gangues.jogo.seguir')}</button>
            : <div className="gang-jogo-fim-botoes">
                <button className="gang-jogo-acao" onClick={deNovo}>{t('games.gangues.jogo.de_novo')}</button>
                <button className="gang-jogo-acao is-sec" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
              </div>}
        </>
      )}
    </div>
  )
}
