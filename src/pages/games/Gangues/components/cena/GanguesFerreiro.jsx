import { useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'
import {
  getGanguesEquip, normalizeGanguesEquipment, textoBonusEquip, aprimTeto, custoAprimoramento,
  GANGUES_EQUIP_SLOT_IDS, GANGUES_SUCATA_ID,
} from '../../data/ganguesEquip.js'
import GanguesDialogoEncontro from './GanguesDialogoEncontro'
import './GanguesFerreiro.css'

/* Encontro FERREIRO — aprimoramento de equipamento (27/09/2026, plano em
   docs/Games/Gangues/PLANO_ITENS_RANGE.md §3). Lista toda peça da gangue que
   ainda pode subir (equipada em alguém OU guardada na mochila) e mostra a
   faixa de agora → a de depois, com o custo (grana + Sucata). O teto de CADA
   ferreiro vem do POI (`poi.tetoAprim`): o Nando da Pista faz só +1, a
   Serralheria da Feira vai até +4. A regra (vantagem / sobe o mínimo) mora
   inteira em ganguesEquip.js — aqui é só a tela. */
export default function GanguesFerreiro({ poi, onClose }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [aviso, setAviso] = useState(null)
  const teto = poi.tetoAprim || 1
  const sucata = store.inventario?.[GANGUES_SUCATA_ID] || 0
  const fecharLabel = t('games.gangues.cena.fechar')

  // Toda peça aprimorável: equipadas (por dono) + as guardadas na gangue.
  const pecas = []
  for (const m of store.roster) {
    const eq = normalizeGanguesEquipment(m.attributes?.equipment)
    for (const slot of GANGUES_EQUIP_SLOT_IDS) {
      const peca = eq[slot]
      const def = peca && getGanguesEquip(peca.itemId)
      if (def && aprimTeto(def) > 0) pecas.push({ key: `${m.id}-${slot}`, ref: { memberId: m.id, slot }, def, aprim: peca.aprim || 0, dono: m.sheet_name })
    }
  }
  for (const inst of store.equipamentos) {
    const def = getGanguesEquip(inst.itemId)
    if (def && aprimTeto(def) > 0) pecas.push({ key: inst.uid, ref: { uid: inst.uid }, def, aprim: inst.aprim || 0, dono: null })
  }

  const aprimorar = (peca) => {
    const r = store.aprimorarEquip(peca.ref, teto)
    if (r.ok) { sfx.reward?.(); setAviso(t('games.gangues.ferreiro.feito', { nome: t(peca.def.nome), n: r.nivel })) }
    else { sfx.cancel?.(); setAviso(t(`games.gangues.ferreiro.falta_${r.motivo}`)) }
  }

  return (
    <GanguesDialogoEncontro
      retrato={null} nome={t(`${poi.i18n}.nome`)} sub={t('games.gangues.ferreiro.sub', { n: teto })}
      falas={[aviso || t(`${poi.i18n}.fala`)]}
      escolhas={[{ id: 'fechar', label: fecharLabel, onClick: onClose }]}
      onClose={onClose} fecharLabel={fecharLabel}
    >
      <p className="gang-ferreiro__saldo">💵 {store.grana} · 🔩 {t('games.gangues.ferreiro.sucata', { n: sucata })}</p>
      <p className="gang-ferreiro__regra">{t('games.gangues.ferreiro.regra')}</p>
      {pecas.length === 0 && <p className="gang-ferreiro__vazio">{t('games.gangues.ferreiro.vazio')}</p>}
      <ul className="gang-ferreiro__lista">
        {pecas.map(peca => {
          const proximo = peca.aprim + 1
          const noTeto = proximo > Math.min(aprimTeto(peca.def), teto)
          const custo = noTeto ? null : custoAprimoramento(peca.def, proximo)
          const podePagar = custo && store.grana >= custo.grana && sucata >= custo.sucata
          return (
            <li key={peca.key} className="gang-ferreiro__peca">
              <span className="gang-ferreiro__icone">{peca.def.icone}</span>
              <span className="gang-ferreiro__info">
                <strong>{t(peca.def.nome)}{peca.aprim ? ` +${peca.aprim}` : ''}</strong>
                <small>{peca.dono || t('games.gangues.ferreiro.na_mochila')}</small>
                <em>{textoBonusEquip(t, peca.def, peca.aprim)}{!noTeto && <> → <b>{textoBonusEquip(t, peca.def, proximo)}</b></>}</em>
              </span>
              {noTeto
                ? <span className="gang-ferreiro__teto">{t(aprimTeto(peca.def) <= peca.aprim ? 'games.gangues.ferreiro.no_maximo' : 'games.gangues.ferreiro.teto_aqui')}</span>
                : (
                  <button className="gang-ferreiro__btn" disabled={!podePagar} onClick={() => aprimorar(peca)}>
                    +{proximo}<small>💵{custo.grana} · 🔩{custo.sucata}</small>
                  </button>
                )}
            </li>
          )
        })}
      </ul>
    </GanguesDialogoEncontro>
  )
}
