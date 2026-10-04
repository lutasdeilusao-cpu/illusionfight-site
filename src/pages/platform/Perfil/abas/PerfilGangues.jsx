import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { supabase } from '../../../../lib/supabase'
import useGanguesI18n from '../../../games/Gangues/hooks/useGanguesI18n'
import GanguesTrofeusLista from '../../../games/Gangues/components/GanguesTrofeusLista'
import { GANGUES_TROFEUS, estadoDosTrofeus } from '../../../games/Gangues/data/ganguesTrofeus.js'

const TERRITORIOS = ['pista', 'feira', 'baixada', 'vila', 'morro', 'alto', 'laje']
const nivelDe = f => Math.min(99, 1 + Math.floor(Number(f?.xp_total) || 0))

/* Aba Gangues do perfil: progresso de cada gangue (save) e os troféus dela,
   lidos do save na nuvem. */
export default function PerfilGangues({ userId }) {
  const { t } = useLanguage()
  const i18nPronto = useGanguesI18n()
  const [saves, setSaves] = useState([])
  const [fichas, setFichas] = useState([])
  const [saveId, setSaveId] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!userId) return
    setCarregando(true)
    Promise.all([
      supabase.from('gangues_saves').select('id, gang_name, story_progress, grana, rep, campaign_clears, inventario, equipamentos, atualizada_em').eq('user_id', userId),
      supabase.from('gangues_fichas').select('id, save_id, xp_total, attributes').eq('user_id', userId),
    ]).then(([s, f]) => {
      const lista = (Array.isArray(s.data) ? s.data : []).filter(x => x.gang_name)
      lista.sort((a, b) => String(b.atualizada_em || '').localeCompare(String(a.atualizada_em || '')))
      setSaves(lista)
      setFichas(Array.isArray(f.data) ? f.data : [])
      setSaveId(lista[0]?.id || null)
      setCarregando(false)
    })
  }, [userId])

  if (carregando || !i18nPronto) return <div className="perfil-trump-skeleton"><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /><div className="perfil-skeleton-card" /></div>

  const save = saves.find(s => s.id === saveId)
  if (!save) {
    return (
      <div className="perfil-gangues">
        <div className="perfil-jogo-header">
          <h3 className="perfil-jogo-titulo">{t('site.perfil.gangues_titulo')}</h3>
        </div>
        <div className="perfil-trump-empty">
          <p>{t('site.perfil.gangues_sem_fichas')}</p>
          <Link to="/games/ldi-gangues" className="perfil-trump-cta">{t('site.perfil.gangues_ir_para')}</Link>
        </div>
      </div>
    )
  }

  const roster = fichas.filter(f => f.save_id === save.id)
  const sp = save.story_progress || {}
  const estado = estadoDosTrofeus({ storyProgress: sp, roster, grana: save.grana, rep: save.rep, campaignClears: save.campaign_clears, inventario: save.inventario, equipamentos: save.equipamentos })
  const vistos = (sp.__itens || []).map(Number)
  const numeros = [
    [TERRITORIOS.filter(id => sp[id]?.chefe).length, 7, t('site.perfil.gangues_bairros')],
    [(sp.__trofeus || []).length, GANGUES_TROFEUS.length, t('site.perfil.gangues_trofeus')],
    [new Set(vistos.filter(id => id >= 10000)).size, 103, t('site.perfil.gangues_cartas')],
    [Math.max(0, ...roster.map(nivelDe)), null, t('site.perfil.gangues_nivel')],
  ]

  return (
    <div className="perfil-gangues">
      <div className="perfil-jogo-header">
        <h3 className="perfil-jogo-titulo">{t('site.perfil.gangues_titulo')}</h3>
        <Link to="/games/ldi-gangues" className="perfil-jogo-rank">{t('site.perfil.gangues_ir_para')}</Link>
      </div>
      {saves.length > 1 && (
        <div className="perfil-gangues-saves">
          {saves.map(s => (
            <button key={s.id} type="button" className={`perfil-gangues-save${s.id === saveId ? ' is-ativo' : ''}`} onClick={() => setSaveId(s.id)}>{s.gang_name}</button>
          ))}
        </div>
      )}
      <p className="perfil-gangues-nome">{save.gang_name}</p>
      <div className="perfil-trump-stats">
        {numeros.map(([v, total, label]) => (
          <div key={label} className="perfil-trump-stat">
            <span className="perfil-trump-stat-val">{v}{total ? `/${total}` : ''}</span>
            <span className="perfil-trump-stat-label">{label}</span>
          </div>
        ))}
      </div>
      <GanguesTrofeusLista t={t} estado={estado} />
    </div>
  )
}
