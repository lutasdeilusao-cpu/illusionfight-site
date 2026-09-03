import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import STRINGS from './radio-nina.i18n.json'
import { useRadioNina, marcarSessao, sessaoRespondida, CORES_RADIO } from './useRadioNina'
import RadioNinaPlaylist from './RadioNinaPlaylist'
import './RadioNina.css'

const CANTO_STORAGE = 'ldi-radio-nina-canto'
const CANTOS = ['tl', 'tr', 'bl', 'br']
const POS_STORAGE = 'ldi-radio-nina-pos'
const POSICOES = ['bottom', 'top']

const mmss = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function conviteDe(pathname, S) {
  if (pathname.startsWith('/games/')) return S.convite.game
  if (pathname.startsWith('/historias/') || pathname.startsWith('/livro/') || pathname.startsWith('/webtoon/')) return S.convite.reading
  return S.convite.default
}

export default function RadioNina() {
  const { locale } = useLanguage()
  const S = STRINGS[locale] || STRINGS.pt
  const location = useLocation()
  const radio = useRadioNina()
  const {
    estado, setEstado, tocando, faixaAtual, tempo, duracao, cor, setCor,
    volume, setVolume, pool, playlistSalva, logado,
    ligar, alternar, pular, fechar, tocarKey, tocarMinhaPlaylist, seek,
  } = radio

  const [listaAberta, setListaAberta] = useState(false)
  const [volAberto, setVolAberto] = useState(false)
  const [canto, setCanto] = useState(() => {
    const c = localStorage.getItem(CANTO_STORAGE)
    return CANTOS.includes(c) ? c : 'br'
  })
  const [arraste, setArraste] = useState(null) // { x, y } durante o drag
  const dragRef = useRef({ ativo: false, moveu: false })
  const [posicao, setPosicao] = useState(() => {
    const p = localStorage.getItem(POS_STORAGE)
    return POSICOES.includes(p) ? p : 'bottom'
  })

  // A barra reserva espaço: no rodapé (top:bottom) ou empurra a navbar (top:top).
  useEffect(() => {
    const naBarra = estado === 'barra'
    const noTopo = naBarra && posicao === 'top'
    document.documentElement.style.setProperty('--radio-nina-h', naBarra && !noTopo ? '54px' : '0px')
    document.documentElement.style.setProperty('--radio-nina-top-h', noTopo ? '54px' : '0px')
    document.body.classList.toggle('radio-nina-top', noTopo)
    return () => {
      document.documentElement.style.setProperty('--radio-nina-h', '0px')
      document.documentElement.style.setProperty('--radio-nina-top-h', '0px')
      document.body.classList.remove('radio-nina-top')
    }
  }, [estado, posicao])

  useEffect(() => { localStorage.setItem(POS_STORAGE, posicao) }, [posicao])

  useEffect(() => { localStorage.setItem(CANTO_STORAGE, canto) }, [canto])

  // Convite da Nina após 30s (uma vez por sessão)
  useEffect(() => {
    if (sessaoRespondida()) return
    const timer = setTimeout(() => {
      if (sessaoRespondida()) return
      window.__ninaPendingNotification = {
        mensagem: conviteDe(location.pathname, S), sim: S.sim, nao: S.nao,
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

  // ── Modo compacto: bolinha arrastável pros 4 cantos ──
  if (estado === 'mini') {
    const LIMIAR = 6 // px de folga: abaixo disso é toque, não arraste
    const abrirBarra = () => { dragRef.current = { ativo: false, moveu: false }; setArraste(null); setEstado('barra') }
    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return
      dragRef.current = { ativo: true, moveu: false, x0: e.clientX, y0: e.clientY }
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
    // A coluna mobile (#root) é o limite: a bolinha nunca sai dela, nem
    // durante o arraste nem ao soltar — o site é mobile only.
    const coluna = () => document.getElementById('root')?.getBoundingClientRect()
      || { left: 0, right: window.innerWidth, width: window.innerWidth }
    const onMove = (e) => {
      const d = dragRef.current
      if (!d.ativo) return
      if (!d.moveu && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < LIMIAR) return
      d.moveu = true
      const col = coluna()
      const x = Math.max(col.left + 8, Math.min(col.right - 48 - 8, e.clientX - 24))
      const y = Math.max(58, Math.min(window.innerHeight - 48 - 8, e.clientY - 24))
      setArraste({ x, y })
    }
    const onUp = (e) => {
      const d = dragRef.current
      if (!d.ativo) return
      d.ativo = false
      e.currentTarget.releasePointerCapture?.(e.pointerId)
      if (!d.moveu) { abrirBarra(); return }
      d.moveu = false
      const col = coluna()
      const meioX = (col.left + col.right) / 2
      setCanto((e.clientY < window.innerHeight / 2 ? 't' : 'b') + (e.clientX < meioX ? 'l' : 'r'))
      setArraste(null)
    }
    const onCancel = () => { dragRef.current = { ativo: false, moveu: false }; setArraste(null) }
    return (
      <div
        className={`radio-nina-mini radio-nina-mini--${canto} ${arraste ? 'radio-nina-mini--arrasta' : ''} ${tocando ? 'radio-nina-mini--tocando' : ''}`}
        style={{ '--radio-cor': cor, ...(arraste ? { left: arraste.x, top: arraste.y } : null) }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
      >
        <button
          type="button"
          className="radio-nina-mini__abrir"
          onClick={() => { if (!dragRef.current.moveu) abrirBarra() }}
          aria-label={S.abrir}
        >
          <img src={ninaImg} alt="" className="radio-nina-mini__face" draggable="false" />
        </button>
        <button
          type="button"
          className="radio-nina-mini__x"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); fechar() }}
          aria-label={S.fechar_de_vez}
        >×</button>
      </div>
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
          posicao={posicao}
          cores={CORES_RADIO}
          onCor={setCor}
          onTocar={(k) => tocarKey(k)}
          onTocarMinha={() => { tocarMinhaPlaylist(); setListaAberta(false) }}
          onSalvar={radio.salvar}
          onFechar={() => setListaAberta(false)}
        />
      )}

      <aside
        className={`radio-nina radio-nina--${posicao} ${tocando ? '' : 'radio-nina--pausado'} ${faixaAtual?.ad ? 'radio-nina--ad' : ''}`}
        style={{ '--radio-cor': cor }}
      >
        <div className="radio-nina__progresso">
          <div className="radio-nina__progresso-fill" style={{ width: `${pct}%` }} />
          <input
            className="radio-nina__seek"
            type="range" min="0" max={duracao || 0} step="1" value={tempo}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={S.tocando_agora}
          />
        </div>

        <img src={ninaImg} alt="Nina" className="radio-nina__face" />

        <div className="radio-nina__now">
          <span className="radio-nina__label">
            {faixaAtual?.ad ? S.publicidade : S.nome}
            <span className="radio-nina__tempo"> · {mmss(tempo)} / {mmss(duracao)}</span>
          </span>
          <div className="radio-nina__marquee">
            <span className="radio-nina__track">
              {faixaAtual?.ad ? S.publicidade : (faixaAtual?.titulo || '…')}
            </span>
          </div>
        </div>

        <div className="radio-nina__controls">
          <button className="radio-nina__btn" onClick={() => pular(-1, 'user')} aria-label={S.anterior}>⏮</button>
          <button className="radio-nina__btn radio-nina__btn--play" onClick={alternar} aria-label={tocando ? S.pause : S.play}>
            {tocando ? '⏸' : '▶'}
          </button>
          <button className="radio-nina__btn" onClick={() => pular(1, 'user')} aria-label={S.proxima}>⏭</button>
        </div>

        <div className="radio-nina__pop-wrap">
          <button className="radio-nina__btn" onClick={() => setVolAberto((v) => !v)} aria-label={S.volume}>
            {volume === 0 ? '🔇' : '🔊'}
          </button>
          {volAberto && (
            <div className="radio-nina__pop radio-nina__pop--vol">
              <input
                type="range" min="0" max="1" step="0.05" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label={S.volume}
              />
            </div>
          )}
        </div>

        <button
          className={`radio-nina__btn ${listaAberta ? 'radio-nina__btn--ativo' : ''}`}
          onClick={() => setListaAberta((v) => !v)}
          aria-label={S.playlist}
        >☰</button>

        <button
          className="radio-nina__btn"
          onClick={() => setPosicao((p) => (p === 'top' ? 'bottom' : 'top'))}
          aria-label={posicao === 'top' ? S.mover_para_baixo : S.mover_para_cima}
          title={posicao === 'top' ? S.mover_para_baixo : S.mover_para_cima}
        >{posicao === 'top' ? '⤓' : '⤒'}</button>

        <button className="radio-nina__btn radio-nina__close" onClick={() => setEstado('mini')} aria-label={S.minimizar}>{posicao === 'top' ? '▴' : '▾'}</button>
      </aside>
    </>
  )
}
