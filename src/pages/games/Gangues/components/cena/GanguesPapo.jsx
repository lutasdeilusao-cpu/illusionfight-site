import { useMemo, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'
import { getGanguesItem } from '../../data/ganguesItens.js'
import { getGanguesEquip } from '../../data/ganguesEquip.js'
import { getGanguesNpcPortrait } from '../../data/ganguesNpcPortraits.js'
import GanguesDialogoEncontro from './GanguesDialogoEncontro'

/* Encontro PAPO — conversa com um local da quebrada. 2–3 escolhas com
   consequência: revela POI, custa grana, ou parte pra treta. Container de
   LÓGICA (i18n, store, regras de custo) — a apresentação em si (retrato +
   balão + botões) é o GanguesDialogoEncontro, componente puro e
   reutilizável (ver comentário lá pro histórico do redesign). */
export default function GanguesPapo({ poi, onResolve, onClose }) {
  const { t } = useLanguage()
  const grana = useGanguesStore(s => s.grana)
  const inventario = useGanguesStore(s => s.inventario)
  const temItens = (mapa) => Object.entries(mapa || {}).every(([id, q]) => (inventario[id] || 0) >= q)
  const [resultado, setResultado] = useState(null)

  const base = poi.i18n
  const nome = t(`${base}.nome`)
  const retrato = getGanguesNpcPortrait(poi.npcSlug)
  const sub = t(`${base}.sub`)
  const falas = useMemo(() => {
    const raw = t(`${base}.fala`)
    return Array.isArray(raw) ? raw : [raw]
  }, [t, base])

  const passa = (escolha) => {
    if (escolha.viraTreta) { onResolve({ viraTreta: escolha.viraTreta, revela: escolha.revela }); return }
    onResolve({ ok: true, revela: escolha.revela, recompensa: escolha.recompensa, custoGrana: escolha.custoGrana, informante: escolha.informante, precisaItens: escolha.precisaItens, daEquip: escolha.daEquip })
  }

  const escolher = (escolha) => {
    if (escolha.custoGrana && grana < escolha.custoGrana) { sfx.cancel(); return }
    if (escolha.precisaItens && !temItens(escolha.precisaItens)) { sfx.cancel(); return }
    sfx.select()
    // Mesmo pras escolhas que viram treta (ex: apertar o pivete do sinal),
    // se tiver um `.resultado` no i18n, mostra a linha ANTES de partir pro
    // combate — antes ia direto, sem fala nenhuma.
    const raw = t(`${base}.escolhas.${escolha.id}.resultado`)
    const temTexto = raw && raw !== `${base}.escolhas.${escolha.id}.resultado`
    if (temTexto) {
      setResultado({ texto: Array.isArray(raw) ? raw[Math.floor(Math.random() * raw.length)] : raw, escolha })
      return
    }
    passa(escolha)
  }

  if (resultado) {
    return (
      <GanguesDialogoEncontro
        retrato={retrato}
        nome={nome}
        sub={sub}
        falas={[resultado.texto]}
        escolhas={[{ id: 'fechar', label: t('games.gangues.cena.fechar'), variante: 'go', onClick: () => passa(resultado.escolha) }]}
        onClose={onClose}
        fecharLabel={t('games.gangues.cena.fechar')}
      />
    )
  }

  const escolhas = (poi.escolhas || []).map(escolha => {
    const semGrana = escolha.custoGrana && grana < escolha.custoGrana
    const semItens = escolha.precisaItens && !temItens(escolha.precisaItens)
    const custoItens = escolha.precisaItens
      ? Object.entries(escolha.precisaItens).map(([id, q]) => `${getGanguesItem(id)?.icone || '▪'}×${q}`).join(' ')
      : null
    const ganhaEquip = (escolha.daEquip || []).map(id => getGanguesEquip(id)?.icone).filter(Boolean).join(' ')
    const extra = escolha.custoGrana ? `−${escolha.custoGrana}` : custoItens || (ganhaEquip ? `→ ${ganhaEquip}` : null)
    return {
      id: escolha.id,
      label: t(`${base}.escolhas.${escolha.id}.label`),
      extra,
      variante: escolha.viraTreta ? 'treta' : undefined,
      disabled: semGrana || semItens,
      onClick: () => escolher(escolha),
    }
  })

  return (
    <GanguesDialogoEncontro
      retrato={retrato}
      nome={nome}
      sub={sub}
      falas={falas}
      escolhas={escolhas}
      onClose={onClose}
      fecharLabel={t('games.gangues.cena.fechar')}
    />
  )
}
