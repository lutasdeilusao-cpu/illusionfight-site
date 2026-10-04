import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useFichas } from '../../../../context/FichasContext'
import { useReader } from '../../../../context/ReaderContext'
import Luta, { VELOCIDADES } from './LutaPentagrama'
import { INIMIGOS } from './campanhaPentagrama'
import { ligarSom } from './somPentagrama'
import './Batalha.css'

// Laboratório da batalha do pentagrama (só admin; no dev abre pra qualquer um).
// Uma batida = um compasso de 8 tempos: você desenha o seu combo até a barra
// amarela acabar. O combo do inimigo não aparece — só com a habilidade de ler
// a origem, e aí só de onde nasce o 1º golpe. Soltou o traço, o último ponto
// pisca: tocar nele carrega. Depois vem um compasso de replay: o seu
// pentagrama contra o dele, inteiro, e o passo a passo.
// Campanha: os inimigos do Lendas em ordem de dificuldade; cada luta define
// também quantos pontos você liga e quais poderes tem (campanhaPentagrama.js).
// Tocar/segurar a bolinha em cima da cabeça enche a barra de poder; cheia, o
// jogo pausa pra você escolher o poder, e aparece a sequência dele. O inimigo
// também tem super: avisa, mostra a sequência em vermelho, e você tem que tocar
// todos os pontos dela pra não tomar.
// Tudo de uma mão: leitura em cima, tabuleiro embaixo, no alcance do dedão.

export default function BatalhaLab() {
  const { t } = useLanguage()
  const { isAdmin, loading } = useFichas()
  const { setReaderMode } = useReader()
  const [fase, setFase] = useState('menu')
  const [oponente, setOponente] = useState(0)
  const [velocidade, setVelocidade] = useState('normal')
  const [verOrigem, setVerOrigem] = useState(false)

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const liberado = isAdmin || import.meta.env.VITE_DEBUG === 'true'
  if (loading && !liberado) return <div className="pg-page" />
  if (!liberado) return <div className="pg-page"><p className="pg-aviso">{t('games.ldi.batalha.restrito')}</p></div>

  if (fase === 'menu') {
    return (
      <div className="pg-page">
        <p className="if-eyebrow">{t('games.ldi.batalha.lab')}</p>
        <h1 className="pg-titulo">{t('games.ldi.batalha.titulo')}</h1>
        <p className="pg-texto">{t('games.ldi.batalha.como')}</p>
        <details className="pg-como">
          <summary>{t('games.ldi.batalha.como_joga')}</summary>
          <ul className="pg-regras">
            {['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9'].map(k => <li key={k}>{t(`games.ldi.batalha.regras.${k}`)}</li>)}
          </ul>
        </details>
        <div className="pg-menu-acoes">
          <p className="if-eyebrow">{t('games.ldi.batalha.oponente')}</p>
          <ol className="pg-escada">
            {INIMIGOS.map((ini, i) => (
              <li key={ini.id}>
                <button type="button" className={`pg-degrau${oponente === i ? ' is-on' : ''}`} onClick={() => setOponente(i)}>
                  <span className="pg-degrau__n">{String(i + 1).padStart(2, '0')}</span>
                  <b>{t(`games.ldi.batalha.inimigos.${ini.id}.nome`)}</b>
                  <small>{t(`games.ldi.batalha.inimigos.${ini.id}.desc`)}</small>
                  <small className="pg-degrau__kit">
                    {t('games.ldi.batalha.kit', { n: ini.kit.golpes })}
                    {' · '}
                    {ini.kit.poderes.length ? ini.kit.poderes.map(p => t(`games.ldi.batalha.poderes.${p}`)).join(', ') : t('games.ldi.batalha.sem_poder')}
                  </small>
                </button>
              </li>
            ))}
          </ol>
          <p className="if-eyebrow">{t('games.ldi.batalha.velocidade')}</p>
          <div className="pg-opcoes">
            {Object.keys(VELOCIDADES).map(v => (
              <button key={v} type="button" className={`pg-opcao${velocidade === v ? ' is-on' : ''}`} onClick={() => setVelocidade(v)}>
                {t(`games.ldi.batalha.vel.${v}`)}
              </button>
            ))}
          </div>
          <p className="if-eyebrow">{t('games.ldi.batalha.habilidade')}</p>
          <button type="button" className={`pg-opcao${verOrigem ? ' is-on' : ''}`} onClick={() => setVerOrigem(v => !v)}>
            {verOrigem ? '✓ ' : ''}{t('games.ldi.batalha.ver_origem')}
          </button>
          <button type="button" className="if-btn if-btn--primary pg-comecar" onClick={() => { ligarSom(); setFase('luta') }}>{t('games.ldi.batalha.lutar')}</button>
        </div>
      </div>
    )
  }

  return <Luta t={t} ficha={INIMIGOS[oponente]} batida={VELOCIDADES[velocidade]} verOrigem={verOrigem} onSair={() => setFase('menu')} />
}
