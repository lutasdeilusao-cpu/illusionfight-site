import { useState } from 'react'
import { createPortal } from 'react-dom'
import { sfx } from '../../../../lib/sfx'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { GANGUES_INITIAL_PARTY_SIZE, GANGUES_MAX_PARTY_SIZE } from '../data/ganguesLoadout.js'
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'
import { getGanguesPortraitByTemplateId } from '../data/ganguesPortraits.js'
import GanguesRetratoImg from './GanguesRetratoImg'
import GangTip from './GangTip'
import './GanguesEscalacao.css'

// Escalação: quem vai pra briga e em que ordem. Quem está no time luta e
// ganha XP; quem fica no banco não. Abre no lobby e na rua (mochila do topo).
export default function GanguesEscalacao({ t, onFechar }) {
  const roster = useGanguesStore(s => s.roster)
  const time = useGanguesStore(s => s.activeParty)
  const setActiveParty = useGanguesStore(s => s.setActiveParty)
  const liderId = useGanguesStore(s => s.getLiderId())

  const max = Math.min(roster.length, GANGUES_MAX_PARTY_SIZE)
  const min = Math.min(roster.length, GANGUES_INITIAL_PARTY_SIZE)
  const idsTime = new Set(time.map(m => m.id))
  const banco = roster.filter(m => !idsTime.has(m.id))
  const cheio = time.length >= max

  const mudar = (novo) => { sfx.select?.(); setActiveParty(novo) }
  const mover = (i, d) => {
    const j = i + d
    if (j < 0 || j >= time.length) return
    const novo = [...time]; [novo[i], novo[j]] = [novo[j], novo[i]]
    mudar(novo)
  }
  const tirar = (m) => { if (time.length > min) mudar(time.filter(x => x.id !== m.id)) }
  const por = (m) => { if (!cheio) mudar([...time, m]) }

  const linha = (m, extra) => (
    <>
      <span className="gang-esc__foto" aria-hidden="true">
        <GanguesRetratoImg src={getGanguesPortraitByTemplateId(m.character_template_id)} fallback={<i>{(m.sheet_name || '?')[0].toUpperCase()}</i>} />
      </span>
      <span className="gang-esc__nome">
        <strong>{m.sheet_name}{m.id === liderId ? ' ★' : ''}</strong>
        <small>{t('games.gangues.escalacao.nivel', { n: getGanguesLevelFromXp(m.xp_total) })}</small>
      </span>
      {extra}
    </>
  )

  return createPortal(
    <div className="gang-esc-overlay" role="dialog" aria-modal="true" aria-labelledby="gang-esc-titulo">
      <div className="gang-esc-bg" onClick={onFechar} />
      <div className="gang-esc">
        <p className="gang-esc__eyebrow">{t('games.gangues.escalacao.eyebrow')}</p>
        <h2 id="gang-esc-titulo" className="gang-esc__titulo">{t('games.gangues.escalacao.titulo')}</h2>
        <p className="gang-esc__explica">{t('games.gangues.escalacao.explica')}</p>

        <p className="gang-esc__secao">{t('games.gangues.escalacao.no_time', { n: time.length, max })}</p>
        <ol className="gang-esc__lista">
          {time.map((m, i) => (
            <li key={m.id} className="gang-esc__item is-time">
              <b className="gang-esc__n">{i + 1}</b>
              {linha(m, (
                <span className="gang-esc__acoes">
                  <button type="button" className="gang-esc__seta" disabled={i === 0} aria-label={t('games.gangues.escalacao.subir')} onClick={() => mover(i, -1)}>▲</button>
                  <button type="button" className="gang-esc__seta" disabled={i === time.length - 1} aria-label={t('games.gangues.escalacao.descer')} onClick={() => mover(i, 1)}>▼</button>
                  <button type="button" className="gang-esc__tirar" disabled={time.length <= min} onClick={() => tirar(m)}>{t('games.gangues.escalacao.tirar')}</button>
                </span>
              ))}
            </li>
          ))}
        </ol>
        {time.length <= min && <p className="gang-esc__aviso">{t('games.gangues.escalacao.minimo', { n: min })}</p>}

        <p className="gang-esc__secao">{t('games.gangues.escalacao.banco')}</p>
        {banco.length === 0
          ? <p className="gang-esc__vazio">{t('games.gangues.escalacao.banco_vazio')}</p>
          : (
            <ul className="gang-esc__lista">
              {banco.map(m => (
                <li key={m.id} className="gang-esc__item">
                  {linha(m, (
                    <button type="button" className="gang-esc__por" disabled={cheio} onClick={() => por(m)}>{t('games.gangues.escalacao.por')}</button>
                  ))}
                </li>
              ))}
            </ul>
          )}
        {cheio && banco.length > 0 && <p className="gang-esc__aviso">{t('games.gangues.escalacao.cheio')}</p>}

        <button type="button" className="gang-esc__fechar" onClick={onFechar}>{t('games.gangues.escalacao.pronto')}</button>
      </div>
    </div>,
    document.body
  )
}

const TUTORIAL_ID = 'escalacao_v1'

/** Dica do Nego Véio quando a gangue ganha o 1º recruta além da dupla
 *  fundadora: o novato já entrou no time, e é na Escalação que se troca. */
export function GanguesEscalacaoTutorial({ t, onAbrir }) {
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()
  const [fechado, setFechado] = useState(false)
  if (!carregado || fechado || jaViu(TUTORIAL_ID)) return null
  const fechar = () => { marcarVisto(TUTORIAL_ID); setFechado(true) }
  return (
    <GangTip
      text={t('games.gangues.escalacao.tutorial')}
      isLast
      nextLabel={t('games.gangues.escalacao.tutorial_abrir')}
      onNext={() => { fechar(); onAbrir() }}
      onSkip={fechar}
    />
  )
}
