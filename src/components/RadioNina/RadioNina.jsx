import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import STRINGS from './radio-nina.i18n.json'
import { useRadioNina, marcarSessao, sessaoRespondida, CORES_RADIO } from './useRadioNina'
import RadioNinaPlaylist from './RadioNinaPlaylist'
import './RadioNina.css'

const mmss = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function conviteDe(pathname, S) {
  if (pathname.startsWith('/games/')) return S.convite.game
  if (pathname.startsWith('/livro/') || pathname.startsWith('/webtoon/')) return S.convite.reading
  return S.convite.default
}

export default function RadioNina() {
  const { locale } = useLanguage()
  const S = STRINGS[locale] || STRINGS.pt
  const location = useLocation()
  const radio = useRadioNina()
  const {
    estado, setEstado, tocando, faixaAtual, tempo, duracao, cor, setCor,
    pool, playlistSalva, logado, ligar, alternar, pular, tocarKey, tocarMinhaPlaylist, seek,
  } = radio

  const [paletaAberta, setPaletaAberta] = useState(false)
  const [listaAberta, setListaAberta] = useState(false)

  // Convite da Nina após 30s (uma vez por sessão)
  useEffect(() => {
    if (sessaoRespondida()) return
    const timer = setTimeout(() => {
      if (sessaoRespondida()) return
      window.__ninaPendingNotification = {
        mensagem: conviteDe(location.pathname, S),
        sim: S.sim,
        nao: S.nao,
      }
      window.__ninaNotificationCb?.((sim) => {
        window.__ninaPendingNotification = null
        marcarSessao(sim ? 'aceitou' : 'recusou')
        if (sim) ligar('escolha')
      })
    }, 30000)
    return () => clearTimeout(timer)
  }, [location.pathname, S, ligar])

  if (estado === 'oculto') return null

  if (estado === 'mini') {
    return (
      <button
        className={`radio-nina-mini ${tocando ? 'radio-nina-mini--tocando' : ''}`}
        style={{ '--radio-cor': cor }}
        onClick={() => setEstado('barra')}
        aria-label={S.abrir}
      >
        <img src={ninaImg} alt="" className="radio-nina-mini__face" />
      </button>
    )
  }

  const pct = duracao > 0 ? (tempo / duracao) * 100 : 0

  return (
    <>
      {listaAberta && (
        <RadioNinaPlaylist
          pool={pool}
          faixaAtualKey={faixaAtual?.key}
          playlistSalva={playlistSalva}
          logado={logado}
          S={S}
          cor={cor}
          onTocar={(k) => tocarKey(k)}
          onTocarMinha={() => { tocarMinhaPlaylist(); setListaAberta(false) }}
          onSalvar={radio.salvar}
          onFechar={() => setListaAberta(false)}
        />
      )}

      <aside className={`radio-nina ${tocando ? '' : 'radio-nina--pausado'}`} style={{ '--radio-cor': cor }}>
        <div className="radio-nina__progresso">
          <div className="radio-nina__progresso-fill" style={{ width: `${pct}%` }} />
          <input
            className="radio-nina__seek"
            type="range"
            min="0"
            max={duracao || 0}
            step="1"
            value={tempo}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={S.tocando_agora}
          />
        </div>

        <img src={ninaImg} alt="Nina" className="radio-nina__face" />

        <div className="radio-nina__now">
          <span className="radio-nina__label">
            {S.nome}<span className="radio-nina__tempo"> · {mmss(tempo)} / {mmss(duracao)}</span>
          </span>
          <div className="radio-nina__marquee">
            <span className="radio-nina__track">{faixaAtual?.titulo || '…'}</span>
          </div>
        </div>

        <div className="radio-nina__controls">
          <button className="radio-nina__btn" onClick={() => pular(-1, 'user')} aria-label={S.anterior}>⏮</button>
          <button className="radio-nina__btn radio-nina__btn--play" onClick={alternar} aria-label={tocando ? S.pause : S.play}>
            {tocando ? '⏸' : '▶'}
          </button>
          <button className="radio-nina__btn" onClick={() => pular(1, 'user')} aria-label={S.proxima}>⏭</button>
        </div>

        <button
          className={`radio-nina__btn ${listaAberta ? 'radio-nina__btn--ativo' : ''}`}
          onClick={() => setListaAberta((v) => !v)}
          aria-label={S.playlist}
        >☰</button>

        <div className="radio-nina__palette-wrap">
          <button className="radio-nina__btn radio-nina__swatch" onClick={() => setPaletaAberta((v) => !v)} aria-label={S.cor} />
          {paletaAberta && (
            <div className="radio-nina__palette">
              {CORES_RADIO.map((c) => (
                <button
                  key={c}
                  className={`radio-nina__cor ${c === cor ? 'radio-nina__cor--ativa' : ''}`}
                  style={{ background: c }}
                  onClick={() => { setCor(c); setPaletaAberta(false) }}
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>

        <button className="radio-nina__btn radio-nina__close" onClick={() => setEstado('mini')} aria-label={S.minimizar}>▾</button>
      </aside>
    </>
  )
}
