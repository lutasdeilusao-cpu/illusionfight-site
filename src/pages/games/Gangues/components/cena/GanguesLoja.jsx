import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { getGanguesItem, grupoDoItem, textoEfeitoItem } from '../../data/ganguesItens.js'
import { getGanguesEquip, textoBonusEquip, atributoPrincipal, nivelMinEquip } from '../../data/ganguesEquip.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from '../../data/ganguesLoadout.js'
import { getGanguesNpcPortrait } from '../../data/ganguesNpcPortraits.js'
import { getGanguesEnemyPortraitById } from '../../data/ganguesEnemyPortraits.js'
import GanguesRetratoImg from '../GanguesRetratoImg'
import { sfx } from '../../../../../lib/sfx'
import GanguesLojaVenda from './GanguesLojaVenda'
import { Candidato } from './GanguesBagEquip'
import PuzzleAnagrama from '../../../../../components/Puzzles/PuzzleAnagrama'
import '../../../../../components/Puzzles/Puzzles.css'

// Loja da cena. Duas portas no topo: COMPRAR e VENDER. Comprar separa o
// catálogo por categoria; tocar num item abre a ficha dele com o "quem
// veste?" (o mesmo cartão da bolsa). Vender mora em GanguesLojaVenda.

const CATEGORIAS = ['pocao', 'arma', 'protecao', 'amuleto']
const categoriaDo = item => {
  if (!item._equip) return 'pocao'
  if (item.slot === 'arma' || item.slot === 'amuleto') return item.slot
  return 'protecao' // cabeca / corpo / bracos / pes
}

/** Ficha do item: história, o que dá, requisitos e quem veste. */
function FichaItem({ item, store, t, onClose, avisar }) {
  const podePagar = store.grana >= item.custo
  const time = (store.activeParty.length ? store.activeParty : store.roster)
    .filter(m => m.character_type === 'template').slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)

  const comprarEEquipar = memberId => {
    if (store.comprarEEquipar(item.id, item.custo, memberId)) { sfx.reward?.(); avisar(t('games.gangues.loja.compra_equipou', { item: t(item.nome) })); onClose() }
    else { sfx.cancel(); avisar(t('games.gangues.loja.sem_grana'), true) }
  }
  const soComprar = () => {
    const ok = item._equip ? store.comprarEquip(item.id, item.custo) : store.comprarItem(item.id, item.custo)
    if (ok) { sfx.reward?.(); avisar(t('games.gangues.loja.compra_feita', { item: t(item.nome) })); onClose() }
    else { sfx.cancel(); avisar(t('games.gangues.loja.sem_grana'), true) }
  }

  return createPortal((
    <div className="gang-loja-det" role="dialog" aria-modal="true">
      <button className="gang-loja-det__scrim" onClick={onClose} aria-label={t('games.gangues.cena.fechar')} />
      <div className="gang-loja-det__card">
        <button className="gang-loja-det__x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>×</button>
        <span className="gang-loja-det__icone">{item.icone}</span>
        <h4 className="gang-loja-det__nome">{t(item.nome)}</h4>
        <p className="gang-loja-det__tag">
          {item._equip
            ? <>{t(`games.gangues.equip.slots.${item.slot}`)} · {t(`games.gangues.equip.raridade.${item.raridade}`)} · {item.caminho === 'livre' ? t('games.gangues.equip.qualquer_caminho') : t('games.gangues.equip.so_caminho', { caminho: t(`games.gangues.loadout.paths.${item.caminho}.name`) })} · {t('games.gangues.equip.nivel_min', { n: nivelMinEquip(item) })}</>
            : t(`games.gangues.bag.abas.${grupoDoItem(item)}`)}
        </p>
        <p className="gang-loja-det__lore">{t(`games.gangues.lore.${item.id}`)}</p>
        <div className="gang-loja-det__da">
          <small>{t('games.gangues.equip.o_que_da')}</small>
          <strong>{(item._equip ? textoBonusEquip(t, item) : textoEfeitoItem(t, item)) || '—'}</strong>
        </div>
        {item._equip && atributoPrincipal(item) && <p className="gang-loja-det__faixa">{t('games.gangues.equip.faixa_explica')}</p>}
        {item._equip && <p className="gang-loja-det__cards">{t('games.gangues.equip.loja_sem_encaixe')}</p>}

        {item._equip && time.length > 0 && <div className="gloja-ficha__quem">
          <small className="gang-bagq-det__quem">{t('games.gangues.bag.quem_usa')}</small>
          {time.map(m => (
            <Candidato key={m.id} t={t} member={m} def={item} peca={{ aprim: 0 }}
              acao={{ label: t('games.gangues.loja.comprar_equipar'), preco: item.custo, semGrana: !podePagar, onClick: comprarEEquipar }} />
          ))}
        </div>}

        <button className="gloja-ficha__comprar" disabled={!podePagar} onClick={soComprar}>
          <span>{item._equip ? t('games.gangues.equip.so_comprar') : t('games.gangues.loja.comprar')}</span>
          <b>💵 {item.custo}</b>
        </button>
        {!podePagar && <p className="gloja-ficha__falta">{t('games.gangues.loja.falta_grana', { n: item.custo - store.grana })}</p>}
      </div>
    </div>
  ), document.body)
}

export default function GanguesLoja({ poi, onClose }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [modo, setModo] = useState('comprar') // comprar | vender
  const [categoria, setCategoria] = useState(null)
  const [ficha, setFicha] = useState(null)
  const [aviso, setAviso] = useState(null) // { texto, ruim }
  const timerAviso = useRef(null)
  const [pechincha, setPechincha] = useState('nao') // nao | jogando | ganhou | perdeu

  const avisar = (texto, ruim = false) => {
    clearTimeout(timerAviso.current)
    setAviso({ texto, ruim })
    timerAviso.current = setTimeout(() => setAviso(null), 1800)
  }

  const desconto = pechincha === 'ganhou' ? (poi.pechincha?.desconto || 0) : 0
  const multiplicador = (poi.precoMultiplicador || 1) * (1 - desconto)
  const catalogo = (poi.itens || []).map(id => {
    const equip = getGanguesEquip(id)
    const base = equip ? { ...equip, _equip: true } : getGanguesItem(id)
    if (!base || !Number.isFinite(base.custo)) return null
    return multiplicador === 1 ? base : { ...base, custo: Math.max(1, Math.round(base.custo * multiplicador)) }
  }).filter(Boolean)

  const categorias = CATEGORIAS.filter(c => catalogo.some(item => categoriaDo(item) === c))
  const catAtiva = categorias.includes(categoria) ? categoria : categorias[0]
  const visiveis = catalogo.filter(item => categoriaDo(item) === catAtiva)
  const retrato = poi.npcSlug ? getGanguesNpcPortrait(poi.npcSlug) : poi.retratoEnemyId ? getGanguesEnemyPortraitById(poi.retratoEnemyId) : null
  const nome = t(`${poi.i18n}.nome`)

  const tens = item => item._equip
    ? store.equipamentos.filter(eq => eq.itemId === item.id).length
    : (store.inventario[item.id] || 0)

  const comprarRapido = item => {
    const ok = item._equip ? store.comprarEquip(item.id, item.custo) : store.comprarItem(item.id, item.custo)
    if (ok) { sfx.reward?.(); avisar(t('games.gangues.loja.compra_feita', { item: t(item.nome) })) }
    else { sfx.cancel(); avisar(t('games.gangues.loja.sem_grana'), true) }
  }

  return (
    <div className="gang-cena-enc gloja">
      <header className="gloja__topo">
        <span className="gloja__retrato">
          <GanguesRetratoImg src={retrato} alt="" fallback={<b aria-hidden="true">🛒</b>} />
        </span>
        <span className="gloja__quem">
          <small>{t('games.gangues.cena.tipo.loja')}</small>
          <strong>{nome}</strong>
        </span>
        <span className="gloja__grana">💵 {store.grana}</span>
      </header>

      <p className={`gloja__aviso${aviso ? ' is-on' : ''}${aviso?.ruim ? ' is-ruim' : ''}`} aria-live="polite">{aviso?.texto}</p>

      <div className="gloja__corpo">
      {modo === 'comprar' && <>
        {poi.pechincha && pechincha === 'nao' && (
          <button className="gloja__pechincha" onClick={() => { sfx.select?.(); setPechincha('jogando') }}>
            {t('games.gangues.loja.pechincha_botao', { n: Math.round(poi.pechincha.desconto * 100) })}
          </button>
        )}
        {pechincha === 'ganhou' && <p className="gloja__pechincha-res is-ok">{t('games.gangues.loja.pechincha_ok', { n: Math.round(poi.pechincha.desconto * 100) })}</p>}
        {pechincha === 'perdeu' && <p className="gloja__pechincha-res">{t('games.gangues.loja.pechincha_falha')}</p>}
        {pechincha === 'jogando' && (
          <div className="gang-cena-puzzle-wrap">
            <PuzzleAnagrama config={{ difficulty: 'easy' }} onSolve={() => { sfx.reward?.(); setPechincha('ganhou') }} onFail={() => { sfx.lose?.(); setPechincha('perdeu') }} />
          </div>
        )}

        {pechincha !== 'jogando' && <>
          {categorias.length > 1 && <div className="gloja__cats" role="tablist">
            {categorias.map(c => (
              <button key={c} role="tab" aria-selected={c === catAtiva} className={`gang-bagq-slot${c === catAtiva ? ' is-ativa' : ''}`}
                onClick={() => { sfx.select?.(); setCategoria(c) }}>
                {t(`games.gangues.loja.abas.${c}`)}<b>{catalogo.filter(item => categoriaDo(item) === c).length}</b>
              </button>
            ))}
          </div>}
          <div className="gloja__lista">
            {visiveis.map(item => {
              const n = tens(item)
              const podePagar = store.grana >= item.custo
              return (
                <div key={item.id} className="gloja-item">
                  <button className="gloja-item__info" onClick={() => { sfx.click?.(); setFicha(item) }}>
                    <span className="gloja-item__icone">{item.icone}</span>
                    <span className="gloja-item__texto">
                      <strong>{t(item.nome)}</strong>
                      <small className="gloja-item__da">{(item._equip ? textoBonusEquip(t, item) : textoEfeitoItem(t, item)) || '—'}</small>
                      <small className="gloja-item__meta">
                        {item._equip && <>{t(`games.gangues.equip.slots.${item.slot}`)} · {t('games.gangues.equip.nivel_min', { n: nivelMinEquip(item) })} · </>}
                        {n > 0 ? t('games.gangues.loja.tens', { n }) : t('games.gangues.loja.nao_tens')}
                      </small>
                    </span>
                  </button>
                  <button className="gloja-preco" disabled={!podePagar} onClick={() => comprarRapido(item)}>
                    <b>💵 {item.custo}</b>
                    <small>{t('games.gangues.loja.comprar')}</small>
                  </button>
                </div>
              )
            })}
          </div>
          <p className="gloja__nota">{t('games.gangues.loja.toque_detalhe')}</p>
        </>}
      </>}

      {modo === 'vender' && <GanguesLojaVenda store={store} t={t} avisar={avisar} />}
      </div>


      <nav className="gloja__barra" role="tablist">
        {['comprar', 'vender'].map(m => (
          <button key={m} role="tab" aria-selected={modo === m} className={`gloja__modo${modo === m ? ' is-ativo' : ''}`}
            onClick={() => { sfx.select?.(); setModo(m) }}>
            {t(`games.gangues.loja.modo.${m}`)}
          </button>
        ))}
        <button className="gloja__sair" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
      </nav>

      {ficha && <FichaItem item={ficha} store={store} t={t} avisar={avisar} onClose={() => setFicha(null)} />}
    </div>
  )
}
