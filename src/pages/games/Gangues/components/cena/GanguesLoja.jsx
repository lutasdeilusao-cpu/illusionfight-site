import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { getGanguesItem } from '../../data/ganguesItens.js'
import { getGanguesEquip, getGanguesAttributesWithEquip, previewGanguesAttributesWithEquip, applyGanguesEquipResources, withGanguesEquip, normalizeGanguesEquipment } from '../../data/ganguesEquip.js'
import { getGanguesResources } from '../../data/ganguesLoadout.js'
import { getGanguesCharacter, getGanguesLevelFromXp } from '../../data/ganguesCharacters.js'
import { sfx } from '../../../../../lib/sfx'

/* Encontro LOJA — vende os itens do próprio POI (poi.itens: ['pocao_hp',
   'colete_couro',...]). Catálogo mistura consumível (data/ganguesItens.js) e
   equipamento (data/ganguesEquip.js). Tocar no item abre uma folha de detalhe
   com o que ele dá e como cada personagem da gangue ficaria equipando —
   comprar já equipa no personagem escolhido (o item anterior do slot volta
   pro inventário da gangue). Repetível: sempre disponível. */

const ATTR_ORDER = ['A', 'H', 'R', 'D']

// Abas da loja — tipo de item. Ordem fixa; só aparecem as que têm item.
const ABAS = ['pocao', 'arma', 'protecao', 'amuleto']
const abaDoItem = (item) => {
  if (!item._equip) return 'pocao'
  if (item.slot === 'arma') return 'arma'
  if (item.slot === 'amuleto') return 'amuleto'
  return 'protecao' // cabeca / corpo / bracos / pes
}

function bonusResumo(t, bonus = {}) {
  const parts = ATTR_ORDER.filter(attr => bonus[attr]).map(attr => `+${bonus[attr]} ${t(`games.gangues.attr_labels.${attr}`)}`)
  if (bonus.pv) parts.push(`+${bonus.pv} PV`)
  if (bonus.pm) parts.push(`+${bonus.pm} PM`)
  return parts.join(' · ')
}

/** Uma linha de comparação: como a ficha do `member` fica com este equipamento. */
function LinhaComparacao({ t, member, item, onEquipar, podePagar }) {
  const character = getGanguesCharacter(member.character_template_id)
  if (!character) return null
  const atual = getGanguesAttributesWithEquip(member.attributes)
  const novo = previewGanguesAttributesWithEquip(member.attributes, item.id)
  const eqNovo = withGanguesEquip(member.attributes?.equipment, item.id)
  const resAtual = applyGanguesEquipResources(getGanguesResources(character.combat_path, atual.R), member.attributes?.equipment)
  const resNovo = applyGanguesEquipResources(getGanguesResources(character.combat_path, novo.R), eqNovo)
  const nivel = getGanguesLevelFromXp(member.xp_total)

  const deltas = []
  for (const attr of ATTR_ORDER) if (novo[attr] !== atual[attr]) deltas.push([t(`games.gangues.attr_labels.${attr}`), atual[attr], novo[attr]])
  if (resNovo.pvMax !== resAtual.pvMax) deltas.push(['PV', resAtual.pvMax, resNovo.pvMax])
  if (resNovo.pmMax !== resAtual.pmMax) deltas.push(['PM', resAtual.pmMax, resNovo.pmMax])

  const noSlot = normalizeGanguesEquipment(member.attributes?.equipment)[item.slot]
  const trocaDef = noSlot && getGanguesEquip(noSlot.itemId)

  return (
    <div className="gang-loja-cmp">
      <div className="gang-loja-cmp__quem">
        <strong>{character.name}</strong>
        <small>{t(`games.gangues.loadout.paths.${character.combat_path}.name`)} · NV {nivel}</small>
      </div>
      <div className="gang-loja-cmp__deltas">
        {deltas.map(([label, de, para]) => (
          <span key={label}>{label} <b>{de}</b>→<b className="is-up">{para}</b></span>
        ))}
        {trocaDef && <span className="gang-loja-cmp__troca">↺ {t(trocaDef.nome)}</span>}
      </div>
      <button className="gang-loja-cmp__btn" disabled={!podePagar} onClick={() => onEquipar(member.id)}>
        {t('games.gangues.equip.equipar')}<b>{t('games.gangues.loja.custo', { n: item.custo })}</b>
      </button>
    </div>
  )
}

function DetalheItem({ item, store, t, onClose, notificar }) {
  const podePagar = store.grana >= item.custo
  const elenco = store.roster.filter(m => m.character_type === 'template')

  const equiparEm = (memberId) => {
    if (store.comprarEEquipar(item.id, item.custo, memberId)) { sfx.reward?.(); notificar(t('games.gangues.loja.compra_feita')); onClose() }
    else { sfx.cancel(); notificar(t('games.gangues.loja.sem_grana')) }
  }
  const soComprar = () => {
    const ok = item._equip ? store.comprarEquip(item.id, item.custo) : store.comprarItem(item.id, item.custo)
    if (ok) { sfx.reward?.(); notificar(t('games.gangues.loja.compra_feita')); onClose() }
    else { sfx.cancel(); notificar(t('games.gangues.loja.sem_grana')) }
  }

  return createPortal((
    <div className="gang-loja-det" role="dialog" aria-modal="true">
      <button className="gang-loja-det__scrim" onClick={onClose} aria-label={t('games.gangues.cena.fechar')} />
      <div className="gang-loja-det__card">
        <button className="gang-loja-det__x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>×</button>
        <span className="gang-loja-det__icone">{item.icone}</span>
        <h4 className="gang-loja-det__nome">{t(item.nome)}</h4>
        {item._equip
          ? <p className="gang-loja-det__tag">{t(`games.gangues.equip.slots.${item.slot}`)} · {t(`games.gangues.equip.raridade.${item.raridade}`)}</p>
          : <p className="gang-loja-det__tag">{t('games.gangues.cena.tipo.loja')}</p>}

        <div className="gang-loja-det__da">
          <small>{t('games.gangues.equip.o_que_da')}</small>
          {item._equip
            ? <strong>{bonusResumo(t, item.bonus) || '—'}</strong>
            : <strong>+{item.valor} {item.tipo === 'cura_pm' ? 'PM' : 'PV'}</strong>}
        </div>

        {item._equip && (
          <p className="gang-loja-det__cards">
            {item.cardSlots
              ? t('games.gangues.equip.slots_carta', { n: item.cardSlots })
              : t('games.gangues.equip.sem_carta')}
          </p>
        )}

        {item._equip ? (
          <>
            <small className="gang-loja-det__titulo">{t('games.gangues.equip.equipar_em')}</small>
            {elenco.length === 0
              ? <p className="gang-loja-det__vazio">{t('games.gangues.equip.sem_elenco')}</p>
              : elenco.map(member => (
                <LinhaComparacao key={member.id} t={t} member={member} item={item} podePagar={podePagar} onEquipar={equiparEm} />
              ))}
            <button className="gang-loja-det__so" disabled={!podePagar} onClick={soComprar}>
              {t('games.gangues.equip.so_comprar')}<b>{t('games.gangues.loja.custo', { n: item.custo })}</b>
            </button>
          </>
        ) : (
          <button className="gang-loja-det__so gang-loja-det__so--buy" disabled={!podePagar} onClick={soComprar}>
            {t('games.gangues.loja.comprar')}<b>{t('games.gangues.loja.custo', { n: item.custo })}</b>
          </button>
        )}
      </div>
    </div>
  ), document.body)
}

export default function GanguesLoja({ poi, onClose }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [aviso, setAviso] = useState(null) // { itemId, texto }
  const [detalhe, setDetalhe] = useState(null)
  const [aba, setAba] = useState('pocao')

  const catalogo = (poi.itens || []).map(id => {
    const equip = getGanguesEquip(id)
    if (equip) return { ...equip, _equip: true }
    return getGanguesItem(id)
  }).filter(Boolean).filter(item => Number.isFinite(item.custo)) // sem preço = fora da loja (rede pra não mostrar "UNDEFINED")

  const abasComItem = ABAS.filter(a => catalogo.some(item => abaDoItem(item) === a))
  const abaAtiva = abasComItem.includes(aba) ? aba : (abasComItem[0] || 'pocao')
  const visiveis = catalogo.filter(item => abaDoItem(item) === abaAtiva)

  const contarNoInventario = (item) => item._equip
    ? store.equipamentos.filter(eq => eq.itemId === item.id).length
    : (store.inventario[item.id] || 0)

  const comprar = (item) => {
    const ok = item._equip ? store.comprarEquip(item.id, item.custo) : store.comprarItem(item.id, item.custo)
    if (ok) { sfx.reward?.(); setAviso({ itemId: item.id, texto: t('games.gangues.loja.compra_feita') }) }
    else { sfx.cancel(); setAviso({ itemId: item.id, texto: t('games.gangues.loja.sem_grana') }) }
    setTimeout(() => setAviso(null), 1400)
  }

  const notificar = (texto) => { setAviso({ itemId: '_global', texto }); setTimeout(() => setAviso(null), 1400) }

  return (
    <div className="gang-cena-enc gang-cena-enc--loja">
      <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      <span className="gang-cena-eyebrow">{t('games.gangues.cena.tipo.loja')}</span>
      <h3 className="gang-cena-enc-titulo">{t(`${poi.i18n}.nome`)}</h3>
      <p className="gang-cena-enc-sub">{t('games.gangues.loja.sub')}</p>
      <p className="gang-cena-enc-sub"><b>💵 {store.grana}</b>{aviso?.itemId === '_global' && <span className="gang-loja-cena-item__aviso"> {aviso.texto}</span>}</p>

      <div className="gang-loja-abas" role="tablist">
        {abasComItem.map(a => (
          <button
            key={a}
            role="tab"
            aria-selected={a === abaAtiva}
            className={`gang-loja-aba${a === abaAtiva ? ' is-ativa' : ''}`}
            onClick={() => { sfx.click?.(); setAba(a) }}
          >
            {t(`games.gangues.loja.abas.${a}`)}
          </button>
        ))}
      </div>

      <div className="gang-loja-cena-lista">
        {visiveis.map(item => {
          const quantidade = contarNoInventario(item)
          return (
            <div key={item.id} className="gang-loja-cena-item">
              <button className="gang-loja-cena-item__abrir" onClick={() => { sfx.click?.(); setDetalhe(item) }}>
                <span className="gang-loja-cena-item__icone">{item.icone}</span>
                <span className="gang-loja-cena-item__info">
                  <strong>{t(item.nome)}</strong>
                  {item._equip && <small>{t(`games.gangues.equip.slots.${item.slot}`)}</small>}
                  <small>{t('games.gangues.loja.no_inventario', { n: quantidade })}</small>
                  <em className="gang-loja-cena-item__ver">{t('games.gangues.equip.ver_detalhe')}</em>
                </span>
              </button>
              <button className="gang-loja-cena-item__comprar" onClick={() => comprar(item)}>
                {t('games.gangues.loja.comprar')}<b>{t('games.gangues.loja.custo', { n: item.custo })}</b>
              </button>
              {aviso?.itemId === item.id && <span className="gang-loja-cena-item__aviso">{aviso.texto}</span>}
            </div>
          )
        })}
      </div>

      <div className="gang-cena-enc-acoes">
        <button className="gang-cena-btn" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
      </div>

      {detalhe && <DetalheItem item={detalhe} store={store} t={t} notificar={notificar} onClose={() => setDetalhe(null)} />}
    </div>
  )
}
