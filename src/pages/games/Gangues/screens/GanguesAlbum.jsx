import { useMemo, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { sfx } from '../../../../lib/sfx'
import {
  GANGUES_ALBUM_CARGOS,
  GANGUES_ALBUM_TOTAL,
  inimigosDoAlbumPorCargo,
} from '../data/ganguesInimigos.js'
import { GANGUES_ITENS_LISTA } from '../data/ganguesItens.js'
import { GANGUES_EQUIP_LISTA, normalizeGanguesEquipment } from '../data/ganguesEquip.js'
import './GanguesAlbum.css'

const ATTRS = ['A', 'H', 'D', 'PV', 'PM']
const SECOES = ['inimigos', 'itens', 'cartas']

/* Coleção — o "grande catálogo" do jogador (driver de replay). Três abas:
   INIMIGOS (o Álbum de Marélia, por cargo da Banca — GDD §5), ITENS (consumível
   + equipamento, descoberto vs "???") e CARTAS (sistema de socket, GDD §9.4,
   ainda em breve). Acessível do lobby E do 3º botão da HUD da cena — o back
   volta pro lugar certo. Mobile-only, tokens --if-*. */
export default function GanguesAlbum({ onNavigate, voltar: voltarProp }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [secao, setSecao] = useState('inimigos')
  const [aba, setAba] = useState('vigia')

  const voltar = () => {
    sfx.cancel?.()
    // `voltarProp` (do GanguesRoute) devolve o jogador exatamente pra fase de
    // onde a Coleção foi aberta — lobby OU território (na posição salva).
    if (voltarProp) { voltarProp(); return }
    onNavigate(store.storyTarget?.cenaId ? 'territorio' : 'lobby')
  }

  const desbloqueados = useMemo(
    () => new Set(store.storyProgress.__album || []),
    [store.storyProgress.__album],
  )
  const totalFeito = [...desbloqueados].filter(id => {
    const slug = GANGUES_ALBUM_CARGOS.find(c => id >= c.min && id <= c.max)?.slug
    return slug && slug !== 'chefes'
  }).length

  // Itens "descobertos" = já passaram pela mão do jogador. União (sem migração):
  // o log __itens + o que está no inventário/estoque de equip + o que está
  // equipado nas fichas agora.
  const itensVistos = useMemo(() => {
    const s = new Set((store.storyProgress.__itens || []).map(Number))
    Object.keys(store.inventario || {}).forEach(id => (store.inventario[id] > 0) && s.add(Number(id)))
    ;(store.equipamentos || []).forEach(eq => s.add(Number(eq.itemId)))
    ;(store.roster || []).forEach(m => {
      const eq = normalizeGanguesEquipment(m.attributes?.equipment)
      Object.values(eq).forEach(p => p && s.add(Number(p.itemId)))
    })
    return s
  }, [store.storyProgress.__itens, store.inventario, store.equipamentos, store.roster])

  const catalogoItens = [
    { titulo: t('games.gangues.album.itens_consumivel'), lista: GANGUES_ITENS_LISTA, tipo: 'consumivel' },
    { titulo: t('games.gangues.album.itens_equip'), lista: GANGUES_EQUIP_LISTA, tipo: 'equip' },
  ]
  const totalItens = GANGUES_ITENS_LISTA.length + GANGUES_EQUIP_LISTA.length
  const feitosItens = [...itensVistos].filter(id =>
    GANGUES_ITENS_LISTA.some(i => i.id === id) || GANGUES_EQUIP_LISTA.some(i => i.id === id)).length

  const lista = inimigosDoAlbumPorCargo(aba)
  const feitosNaAba = lista.filter(i => desbloqueados.has(i.id)).length

  return (
    <main className="gang-album">
      <header className="gang-album__top">
        <button className="gang-album__back" onClick={voltar}>
          ← {t('games.gangues.album.voltar')}
        </button>
        <span className="gang-album__count">
          {secao === 'itens'
            ? <><b>{feitosItens}</b>/{totalItens}</>
            : <><b>{totalFeito}</b>/{GANGUES_ALBUM_TOTAL}</>}
        </span>
      </header>

      <div className="gang-album__title">
        <h1>{t('games.gangues.album.titulo')}</h1>
        <p>{t('games.gangues.album.sub')}</p>
      </div>

      <nav className="gang-album__secoes" aria-label={t('games.gangues.album.titulo')}>
        {SECOES.map(s => (
          <button
            key={s}
            className={`gang-album__secao${secao === s ? ' is-active' : ''}`}
            onClick={() => { sfx.select?.(); setSecao(s) }}
          >
            {t(`games.gangues.album.secoes.${s}`)}
          </button>
        ))}
      </nav>

      {secao === 'inimigos' && (
        <>
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
              const terr = t(`games.gangues.album.terr.${terrId}`)
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
        </>
      )}

      {secao === 'itens' && catalogoItens.map(bloco => (
        <div key={bloco.tipo}>
          <p className="gang-album__aba-count">{bloco.titulo}</p>
          <ul className="gang-album__grid">
            {bloco.lista.map(item => {
              const on = itensVistos.has(item.id)
              const isEquip = bloco.tipo === 'equip'
              const dica = isEquip
                ? (item.custo ? t('games.gangues.album.item_dica_loja') : t('games.gangues.album.item_dica_drop'))
                : (item.custo ? t('games.gangues.album.item_dica_loja') : t('games.gangues.album.item_dica_quest'))
              if (!on) {
                return (
                  <li key={item.id} className="gang-album__card gang-album__card--locked">
                    <span className="gang-album__portrait">?</span>
                    <div className="gang-album__body">
                      <strong>{t('games.gangues.album.bloqueado')}</strong>
                      <small>{isEquip ? t(`games.gangues.equip.slots.${item.slot}`) : t('games.gangues.cena.tipo.loja')}</small>
                      <em>{dica}</em>
                    </div>
                  </li>
                )
              }
              const efeito = isEquip
                ? ATTRS.filter(a => item.bonus?.[a]).map(a => `+${item.bonus[a]} ${a}`).concat(
                  item.bonus?.pv ? [`+${item.bonus.pv} PV`] : [], item.bonus?.pm ? [`+${item.bonus.pm} PM`] : []).join(' · ')
                : `+${item.valor} ${item.tipo === 'cura_pm' ? 'PM' : item.tipo === 'cura_pv' ? 'PV' : ''}`.trim()
              return (
                <li key={item.id} className="gang-album__card">
                  <span className="gang-album__portrait">{item.icone}</span>
                  <div className="gang-album__body">
                    <strong>{t(item.nome)}</strong>
                    <small>
                      {isEquip
                        ? `${t(`games.gangues.equip.slots.${item.slot}`)} · ${t(`games.gangues.equip.raridade.${item.raridade}`)}`
                        : t('games.gangues.cena.tipo.loja')}
                    </small>
                    <em>{efeito || '—'}</em>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      {secao === 'cartas' && (
        <div className="gang-album__cartas-vazio">
          <span className="gang-album__portrait">🃏</span>
          <p>{t('games.gangues.album.cartas_explica')}</p>
          <em>{t('games.gangues.album.cartas_em_breve')}</em>
        </div>
      )}
    </main>
  )
}
