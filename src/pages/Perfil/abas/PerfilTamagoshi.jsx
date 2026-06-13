import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../../Tamagoshi/store/useTamagoshiStore'
import { useNotificationStore } from '../../../store/notificationStore'
import { supabase } from '../../../lib/supabase'
import { PERSONALIDADES, getFala } from '../../Tamagoshi/data/personalidades'
import { CRIATURAS } from '../../Tamagoshi/data/criaturas'
import { BADGES } from '../../Tamagoshi/data/moedas'
import './PerfilTamagoshi.css'

export default function PerfilTamagoshi() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const store = useTamagoshiStore()
  const notifStore = useNotificationStore()
  const userTier = perfil?.role || 'free'

  const [tama, setTama] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const [keyGerada, setKeyGerada] = useState(null)
  const [keyInput, setKeyInput] = useState('')
  const [slotB, setSlotB] = useState(1)
  const [msg, setMsg] = useState({ texto: '', tipo: '' })
  const [propondo, setPropondo] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const [fama, setFama] = useState([])
  const [badges, setBadges] = useState([])

  const carregarTama = useCallback(async () => {
    if (!user) return
    setCarregando(true)
    const { data } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', user.id)
      .eq('slot', 1)
      .maybeSingle()

    if (!data) {
      const local = await store.loadFromCloud(user.id, 1)
      if (local) {
        setTama({
          criatura_id: local.criaturaId,
          fase: local.fase,
          status: local.status,
        })
        setCarregando(false)
        return
      }
    }

    setTama(data)

    const { data: famaData } = await supabase
      .from('tamagoshi_fama')
      .select('*')
      .eq('user_id', user.id)
    setFama(famaData || [])

    const { data: badgeData } = await supabase
      .from('tamagoshi_badges')
      .select('*')
      .eq('user_id', user.id)
    setBadges(badgeData || [])

    setCarregando(false)
  }, [user])

  useEffect(() => { carregarTama() }, [carregarTama])

  const handlePropor = async () => {
    if (!tama || tama.status !== 'vivo') { setMsg({ texto: t('site.perfil.troca_erro_vivo'), tipo: 'erro' }); return }
    setPropondo(true)
    setMsg({ texto: '', tipo: '' })
    try {
      store.verificarPermissaoTroca(tama, userTier)
      const key = await store.proporTroca(user.id, 1)
      setKeyGerada(key)
      setMsg({ texto: t('site.perfil.troca_key_gerada'), tipo: 'ok' })
    } catch (e) {
      setMsg({ texto: e.message, tipo: 'erro' })
    }
    setPropondo(false)
  }

  const handleConfirmar = async () => {
    if (!keyInput.trim()) { setMsg({ texto: t('site.perfil.troca_cole_key'), tipo: 'erro' }); return }
    setConfirmando(true)
    setMsg({ texto: '', tipo: '' })
    try {
      const result = await store.confirmarTroca(keyInput.trim().toUpperCase(), user.id, slotB, userTier)
      const c = CRIATURAS.find(x => x.id === result.criaturaId)
      const boasVindas = getFala(c?.tipo, 'fome', result.criaturaId)
      setMsg({ texto: t('site.perfil.troca_confirmada', { emoji: c?.emoji || '', nome: c?.nome || t('site.perfil.troca_nova_criatura'), fala: boasVindas }), tipo: 'ok' })
      const notifTitulo = c?.emoji ? `${c.emoji} ${c?.nome || t('site.perfil.troca_nova_criatura')}: ${boasVindas}` : `${t('site.perfil.troca_nova_criatura')}: ${boasVindas}`
      notifStore.push(notifTitulo, t('site.perfil.troca_notif_ver'), '/games/tamagoshi')
      setKeyGerada(null)
      setKeyInput('')
      carregarTama()
    } catch (e) {
      setMsg({ texto: e.message, tipo: 'erro' })
    }
    setConfirmando(false)
  }

  const persCor = (t) => PERSONALIDADES[t]?.cor || '#555'

  if (carregando) return <div className="perfil-tama-loading">{t('site.perfil.tama_carregando')}</div>

  return (
    <div className="perfil-tama">
      <div className="perfil-tama-header">
        <span className="perfil-tama-title">{t('site.perfil.tama_meu_tamagoshi')}</span>
        <span className="perfil-tama-tier" style={{ '--tier-cor': userTier === 'primordial' ? '#F5A623' : userTier === 'elite' ? '#00B4D8' : '#555' }}>
          {userTier.toUpperCase()}
        </span>
      </div>

      {!tama ? (
        <div className="perfil-tama-vazio">
          <p>{t('site.perfil.tama_sem_tamagoshi')}</p>
          <button className="perfil-tama-vazio-btn"
            onClick={() => navigate('/games/tamagoshi')}>
            {t('site.perfil.tama_ir_pegar')}
          </button>
        </div>
      ) : (
        <>
          {(() => {
            const c = CRIATURAS.find(cr => cr.id === tama.criatura_id)
            const tipo = c?.tipo
            return (
              <div className="perfil-tama-card" style={{ '--tama-cor': persCor(tipo) }}
                onClick={() => navigate('/games/tamagoshi')}>
                <div className="perfil-tama-card-avatar">
                  {(() => {
                    const src = c?.gifs?.apresentacao || c?.imagem
                    if (src) {
                      return <img src={src} alt={c?.nome || ''} className="perfil-tama-card-img" draggable={false} />
                    }
                    return <span className="perfil-tama-card-emoji">{c?.emoji || '🥚'}</span>
                  })()}
                </div>
                <div className="perfil-tama-card-info">
                  <span className="perfil-tama-card-nome">{c?.nome || 'sem nome'}</span>
                  <span className="perfil-tama-card-pers" style={{ '--tama-cor': persCor(tipo) }}>
                    {PERSONALIDADES[tipo]?.nome || tipo || '—'}
                  </span>
              <span className="perfil-tama-card-status" style={{
                '--status-cor': tama.status === 'vivo' ? '#22C55E' : tama.status === 'critico' ? '#E02020' : '#666'
              }}>
                {tama.status?.toUpperCase() || '—'}
              </span>
            </div>
          </div>
            )
          })()}

          <button className="perfil-tama-jogar-btn"
            onClick={() => navigate('/games/tamagoshi')}>
            {t('site.perfil.tama_jogar')}
          </button>

          <div className="perfil-tama-limites">
            <span className="perfil-tama-limites-label">{t('site.perfil.tama_limite_trocas')}</span>
            <span className="perfil-tama-limites-valor">
              {userTier === 'free' ? t('site.perfil.tama_free_troca') :
               userTier === 'elite' ? t('site.perfil.tama_elite_troca') :
               t('site.perfil.tama_primordial_troca')}
            </span>
          </div>

          <div className="perfil-tama-acoes">
            <button className="perfil-tama-btn perfil-tama-btn--propor"
              onClick={handlePropor}
              disabled={propondo || !tama || tama.status !== 'vivo'}>
              {propondo ? t('site.perfil.tama_gerando') : t('site.perfil.tama_propor_troca')}
            </button>

            <div className="perfil-tama-confirmar">
              <input className="perfil-tama-input"
                placeholder={t('site.perfil.tama_input_key')}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                maxLength={8}
                disabled={confirmando}
              />
              {userTier === 'primordial' && (
                <select className="perfil-tama-select" value={slotB} onChange={e => setSlotB(Number(e.target.value))}>
                  <option value={1}>{t('site.perfil.slot_1')}</option>
                  <option value={2}>{t('site.perfil.slot_2')}</option>
                </select>
              )}
              <button className="perfil-tama-btn perfil-tama-btn--confirmar"
                onClick={handleConfirmar}
                disabled={confirmando || !keyInput.trim()}>
                {confirmando ? t('site.perfil.tama_confirmando') : t('site.perfil.tama_confirmar_troca')}
              </button>
            </div>
          </div>

          {keyGerada && (
            <div className="perfil-tama-key-box">
              <span className="perfil-tama-key-label">{t('site.perfil.tama_sua_key')}</span>
              <span className="perfil-tama-key" onClick={() => { navigator.clipboard.writeText(keyGerada); setMsg({ texto: t('site.perfil.troca_key_copiada'), tipo: 'ok' }) }}>
                {keyGerada}
              </span>
              <span className="perfil-tama-key-hint">{t('site.perfil.tama_clique_copiar')}</span>
            </div>
          )}

          {msg.texto && (
            <div className={`perfil-tama-msg perfil-tama-msg--${msg.tipo}`}>
              {msg.texto}
            </div>
          )}
        </>
      )}

      {badges.length > 0 && (
        <div className="perfil-tama-secao">
          <span className="perfil-tama-secao-title">{t('site.perfil.tama_badges_titulo')}</span>
          <div className="perfil-tama-badges-grid">
            {badges.map(b => {
              const badgeEntry = Object.values(BADGES).find(bv => bv.id === b.badge_id)
              const c = CRIATURAS.find(cr => cr.id === b.criatura_id)
              return (
                <div key={b.id} className="perfil-tama-badge-item" title={badgeEntry?.nome || b.badge_id}>
                  <span className="perfil-tama-badge-emoji">{badgeEntry?.emoji || '🏅'}</span>
                  <span className="perfil-tama-badge-nome">{badgeEntry?.nome || b.badge_id}</span>
                  {c && <span className="perfil-tama-badge-criatura">{c.emoji}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {fama.length > 0 && (
        <div className="perfil-tama-secao">
          <span className="perfil-tama-secao-title">{t('site.perfil.tama_fama_titulo')}</span>
          <div className="perfil-tama-fama-grid">
            {fama.map(f => {
              const c = CRIATURAS.find(cr => cr.id === f.criatura_id)
              return (
                <div key={f.id} className="perfil-tama-fama-card">
                  <span className="perfil-tama-fama-emoji">{c?.emoji || '✨'}</span>
                  <span className="perfil-tama-fama-nome">{c?.nome || t('site.perfil.tama_sem_nome')}</span>
                  <span className="perfil-tama-fama-badges">{t('site.perfil.fama_badges', { n: f.badges?.length || 0 })}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
