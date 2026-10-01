// OPÇÕES do LDI Gangues (Isaias, 01/10/2026: "coloca um painel de controles no
// menu do jogo... controle de áudio pro sound effects — o jogo não tem trilha
// sonora, a gente oferece a Rádio Nina... e tem que avisar caso você esteja
// jogando no computador"). Abre da tela de fundar gangue e do lobby.
//   • SOM — efeitos liga/desliga + volume (lib/sfx), e a Rádio Nina como a
//     trilha do jogo (o mesmo tocador do site, useRadio).
//   • CONTROLES — o mapa do teclado (hooks/useGanguesTeclado.js); no
//     computador avisa que dá pra jogar só no teclado.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { sfx } from '../../../../lib/sfx'
import { useRadio } from '../../../../components/RadioNina/RadioNinaContext'
import useGanguesTeclado from '../hooks/useGanguesTeclado'
import './GanguesOpcoes.css'

const TECLAS = [
  ['setas', ['↑', '↓', '←', '→'], 'ou', ['W', 'A', 'S', 'D']],
  ['interagir', ['E'], 'ou', ['Enter', 'Espaço']],
  ['voltar', ['Esc']],
  ['opcao', ['1', '…', '9']],
  ['atacar', ['A']],
  ['briga_auto', ['B']],
  ['mochila', ['I']],
  ['ficha', ['F']],
  ['navegar', ['Tab'], 'e', ['Enter']],
]

const noComputador = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

export default function GanguesOpcoes({ t, onFechar }) {
  const radio = useRadio()
  const [somLigado, setSomLigado] = useState(sfx.enabled)
  const [volume, setVolume] = useState(sfx.volume)
  const pc = noComputador()

  useGanguesTeclado({ escape: () => onFechar() }, true, 1)

  const alternarSom = () => { sfx.toggle(); setSomLigado(sfx.enabled); if (sfx.enabled) sfx.select?.() }
  const mudarVolume = v => { sfx.setVolume(v); setVolume(v) }
  const radioNoAr = radio.estado !== 'oculto' && Boolean(radio.faixaAtual)

  return createPortal(
    <div className="gang-opcoes" role="dialog" aria-modal="true" aria-label={t('games.gangues.opcoes.titulo')}>
      <button type="button" className="gang-opcoes__fundo" onClick={onFechar} aria-label={t('games.gangues.opcoes.fechar')} />
      <div className="gang-opcoes__card">
        <header className="gang-opcoes__cabeca">
          <span className="gang-opcoes__eyebrow">LDI GANGUES</span>
          <h2>{t('games.gangues.opcoes.titulo')}</h2>
          <button type="button" className="gang-opcoes__x" onClick={onFechar} aria-label={t('games.gangues.opcoes.fechar')}>✕</button>
        </header>

        {/* ── SOM ── */}
        <section className="gang-opcoes__secao">
          <h3>{t('games.gangues.opcoes.som')}</h3>
          <div className="gang-opcoes__linha">
            <span>{t('games.gangues.opcoes.efeitos')}</span>
            <button type="button" role="switch" aria-checked={somLigado} className={`gang-opcoes__switch${somLigado ? ' is-on' : ''}`} onClick={alternarSom}>
              <i aria-hidden="true" />{t(somLigado ? 'games.gangues.opcoes.ligado' : 'games.gangues.opcoes.desligado')}
            </button>
          </div>
          <label className={`gang-opcoes__linha${somLigado ? '' : ' is-off'}`}>
            <span>{t('games.gangues.opcoes.volume')} · {Math.round(volume * 100)}%</span>
            <input type="range" min="0" max="1" step="0.05" value={volume} disabled={!somLigado} onChange={e => mudarVolume(Number(e.target.value))} onPointerUp={() => sfx.select?.()} />
          </label>

          <div className="gang-opcoes__radio">
            <p>{t('games.gangues.opcoes.sem_trilha')}</p>
            <div className="gang-opcoes__linha">
              <span>{radioNoAr ? radio.faixaAtual.titulo : t('games.gangues.opcoes.radio')}</span>
              <button type="button" className="gang-opcoes__btn" onClick={() => (radioNoAr ? radio.alternar() : radio.ligar('gangues'))}>
                {radio.tocando ? `⏸ ${t('games.gangues.opcoes.pausar_radio')}` : `▶ ${t('games.gangues.opcoes.ligar_radio')}`}
              </button>
            </div>
            <label className="gang-opcoes__linha">
              <span>{t('games.gangues.opcoes.volume_radio')} · {Math.round(radio.volume * 100)}%</span>
              <input type="range" min="0" max="1" step="0.05" value={radio.volume} onChange={e => radio.setVolume(Number(e.target.value))} />
            </label>
          </div>
        </section>

        {/* ── CONTROLES ── */}
        <section className="gang-opcoes__secao">
          <h3>{t('games.gangues.opcoes.controles')}</h3>
          <p className={`gang-opcoes__aviso${pc ? ' is-pc' : ''}`}>{t(pc ? 'games.gangues.opcoes.aviso_pc' : 'games.gangues.opcoes.aviso_toque')}</p>
          <ul className="gang-opcoes__teclas">
            {TECLAS.map(([acao, teclas, liga, outras]) => (
              <li key={acao}>
                <span className="gang-opcoes__acao">{t(`games.gangues.opcoes.teclas.${acao}`)}</span>
                <span className="gang-opcoes__keys">
                  {teclas.map(k => <kbd key={k}>{k === 'Espaço' ? t('games.gangues.opcoes.espaco') : k}</kbd>)}
                  {liga && <em>{t(`games.gangues.opcoes.${liga}`)}</em>}
                  {(outras || []).map(k => <kbd key={k}>{k === 'Espaço' ? t('games.gangues.opcoes.espaco') : k}</kbd>)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <button type="button" className="gang-opcoes__fechar" onClick={onFechar}>{t('games.gangues.opcoes.fechar')}</button>
      </div>
    </div>,
    document.body,
  )
}
