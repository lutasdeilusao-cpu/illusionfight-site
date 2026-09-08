import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import {
  GANGUES_ALBUM_CARGOS,
  GANGUES_ALBUM_TOTAL,
  inimigosDoAlbumPorCargo,
} from './data/ganguesInimigos.js'
import './GanguesAlbum.css'

const ATTRS = ['A', 'H', 'R', 'D']

/* Álbum de Marélia — o colecionável de inimigos. Organizado por CARGO da
   hierarquia da Banca (ver docs/Games/Gangues/LDI_GANGUES_GDD.md §5). Cada
   inimigo derrotado (store.storyProgress.__album, alimentado pela tela de
   vitória) vira uma entrada visível; o resto fica "???" com a dica de onde
   caçar. Mobile-only, tokens --if-*. */
export default function GanguesAlbum({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [aba, setAba] = useState('vigia')

  const desbloqueados = useMemo(
    () => new Set(store.storyProgress.__album || []),
    [store.storyProgress.__album],
  )
  const totalFeito = [...desbloqueados].filter(id => {
    const slug = GANGUES_ALBUM_CARGOS.find(c => id >= c.min && id <= c.max)?.slug
    return slug && slug !== 'chefes'
  }).length

  const lista = inimigosDoAlbumPorCargo(aba)
  const feitosNaAba = lista.filter(i => desbloqueados.has(i.id)).length

  return (
    <main className="gang-album">
      <header className="gang-album__top">
        <button className="gang-album__back" onClick={() => { sfx.cancel?.(); onNavigate('lobby') }}>
          ← {t('games.gangues.album.voltar')}
        </button>
        <span className="gang-album__count">
          <b>{totalFeito}</b>/{GANGUES_ALBUM_TOTAL}
        </span>
      </header>

      <div className="gang-album__title">
        <span className="gang-album__eyebrow">IF // MARÉLIA</span>
        <h1>{t('games.gangues.album.titulo')}</h1>
        <p>{t('games.gangues.album.sub')}</p>
      </div>

      <nav className="gang-album__tabs" aria-label={t('games.gangues.album.titulo')}>
        {GANGUES_ALBUM_CARGOS.map(({ slug }) => (
          <button
            key={slug}
            className={`gang-album__tab${aba === slug ? ' is-active' : ''}`}
            onClick={() => { sfx.select?.(); setAba(slug) }}
          >
            {t(`games.gangues.album.cargos.${slug}`)}
          </button>
        ))}
      </nav>

      <p className="gang-album__aba-count">{feitosNaAba}/{lista.length}</p>

      <ul className="gang-album__grid">
        {lista.map(inimigo => {
          const on = desbloqueados.has(inimigo.id)
          const terrId = inimigo.album?.territorioId
          const terr = terrId ? t(`games.gangues.album.terr.${terrId}`) : t('games.gangues.album.cargos.ranking')
          if (!on) {
            return (
              <li key={inimigo.id} className="gang-album__card gang-album__card--locked">
                <span className="gang-album__portrait">?</span>
                <div className="gang-album__body">
                  <strong>{t('games.gangues.album.bloqueado')}</strong>
                  <small>{t(`games.gangues.album.cargos.${aba}`)} · {terr}</small>
                  <em>{t('games.gangues.album.ainda_nao')}</em>
                </div>
              </li>
            )
          }
          const nome = t(`games.gangues.enemy_names.${inimigo.id}`)
          return (
            <li key={inimigo.id} className="gang-album__card">
              <span className="gang-album__portrait">{(nome || '?')[0]}</span>
              <div className="gang-album__body">
                <strong>{nome}</strong>
                <small>
                  {t(`games.gangues.album.cargos.${aba}`)} · {terr}
                  {inimigo.weapon ? ` · ${inimigo.weapon}` : ''}
                </small>
                <span className="gang-album__stats">
                  {ATTRS.map(a => (
                    <span key={a}><i>{a}</i>{inimigo.stats?.[a] ?? '—'}</span>
                  ))}
                </span>
                <em>{t(`games.gangues.enemy_album.${inimigo.id}`)}</em>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
