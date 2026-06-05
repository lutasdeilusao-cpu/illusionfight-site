import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTamagoshiStore } from '../../Tamagoshi/store/useTamagoshiStore'
import { useNotificationStore } from '../../../store/notificationStore'
import { supabase } from '../../../lib/supabase'
import { PERSONALIDADES, getFala } from '../../Tamagoshi/data/personalidades'
import { CRIATURAS } from '../../Tamagoshi/data/criaturas'
import './PerfilTamagoshi.css'

export default function PerfilTamagoshi() {
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

  const carregarTama = useCallback(async () => {
    if (!user) return
    setCarregando(true)
    const { data } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', user.id)
      .eq('slot', 1)
      .maybeSingle()
    setTama(data)
    setCarregando(false)
  }, [user])

  useEffect(() => { carregarTama() }, [carregarTama])

  const handlePropor = async () => {
    if (!tama || tama.status !== 'vivo') { setMsg({ texto: 'só pode trocar tamagoshi vivo', tipo: 'erro' }); return }
    setPropondo(true)
    setMsg({ texto: '', tipo: '' })
    try {
      store.verificarPermissaoTroca(tama, userTier)
      const key = await store.proporTroca(user.id, 1)
      setKeyGerada(key)
      setMsg({ texto: `key gerada! compartilhe com outro jogador`, tipo: 'ok' })
    } catch (e) {
      setMsg({ texto: e.message, tipo: 'erro' })
    }
    setPropondo(false)
  }

  const handleConfirmar = async () => {
    if (!keyInput.trim()) { setMsg({ texto: 'cole a key primeiro', tipo: 'erro' }); return }
    setConfirmando(true)
    setMsg({ texto: '', tipo: '' })
    try {
      const result = await store.confirmarTroca(keyInput.trim().toUpperCase(), user.id, slotB, userTier)
      const c = CRIATURAS.find(x => x.id === result.criaturaId)
      const boasVindas = getFala(result.personalidade, 'fome', result.criaturaId)
      setMsg({ texto: `troca confirmada! ${c?.emoji || ''} ${c?.nome || 'nova criatura'} chegou: ${boasVindas}`, tipo: 'ok' })
      notifStore.push(`${c?.emoji || ''} ${c?.nome || 'Nova criatura'}: ${boasVindas}`, 'ver tamagoshi', '/games/tamagoshi')
      setKeyGerada(null)
      setKeyInput('')
      carregarTama()
    } catch (e) {
      setMsg({ texto: e.message, tipo: 'erro' })
    }
    setConfirmando(false)
  }

  const persCor = (t) => PERSONALIDADES[t]?.cor || '#555'

  if (carregando) return <div className="perfil-tama-loading">CARREGANDO...</div>

  return (
    <div className="perfil-tama">
      <div className="perfil-tama-header">
        <span className="perfil-tama-title">🥚 Meu Tamagoshi</span>
        <span className={`perfil-tama-tier`} style={{ color: userTier === 'primordial' ? '#F5A623' : userTier === 'elite' ? '#00B4D8' : '#555' }}>
          {userTier.toUpperCase()}
        </span>
      </div>

      {!tama ? (
        <p className="perfil-tama-vazio">você ainda não tem um tamagoshi. vá em /games/tamagoshi para começar.</p>
      ) : (
        <>
          <div className="perfil-tama-card" style={{ borderColor: persCor(tama.personalidade) }}>
            <div className="perfil-tama-card-emoji">
              {CRIATURAS.find(c => c.id === tama.criatura_id)?.emoji || '🥚'}
            </div>
            <div className="perfil-tama-card-info">
              <span className="perfil-tama-card-nome">{tama.nome_custom || 'sem nome'}</span>
              <span className="perfil-tama-card-pers" style={{ color: persCor(tama.personalidade) }}>
                {PERSONALIDADES[tama.personalidade]?.nome || tama.personalidade}
              </span>
              <span className="perfil-tama-card-status" style={{
                color: tama.status === 'vivo' ? '#22C55E' : tama.status === 'critico' ? '#E02020' : '#666'
              }}>
                {tama.status?.toUpperCase() || '—'}
              </span>
            </div>
          </div>

          <div className="perfil-tama-limites">
            <span className="perfil-tama-limites-label">limite de trocas:</span>
            <span className="perfil-tama-limites-valor">
              {userTier === 'free' ? '1 a cada 3 meses' :
               userTier === 'elite' ? '1 por mês' :
               '2 por mês (15 dias entre cada)'}
            </span>
          </div>

          <div className="perfil-tama-acoes">
            <button className="perfil-tama-btn perfil-tama-btn--propor"
              onClick={handlePropor}
              disabled={propondo || !tama || tama.status !== 'vivo'}>
              {propondo ? 'GERANDO...' : '[ PROPOR TROCA ]'}
            </button>

            <div className="perfil-tama-confirmar">
              <input className="perfil-tama-input"
                placeholder="cole a key de 8 chars..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                maxLength={8}
                disabled={confirmando}
              />
              {userTier === 'primordial' && (
                <select className="perfil-tama-select" value={slotB} onChange={e => setSlotB(Number(e.target.value))}>
                  <option value={1}>Slot 1</option>
                  <option value={2}>Slot 2</option>
                </select>
              )}
              <button className="perfil-tama-btn perfil-tama-btn--confirmar"
                onClick={handleConfirmar}
                disabled={confirmando || !keyInput.trim()}>
                {confirmando ? 'CONFIRMANDO...' : '[ CONFIRMAR TROCA ]'}
              </button>
            </div>
          </div>

          {keyGerada && (
            <div className="perfil-tama-key-box">
              <span className="perfil-tama-key-label">sua key (válida por 24h):</span>
              <div className="perfil-tama-key" onClick={() => { navigator.clipboard.writeText(keyGerada); setMsg({ texto: 'key copiada!', tipo: 'ok' }) }}>
                {keyGerada}
              </div>
              <span className="perfil-tama-key-hint">clique para copiar</span>
            </div>
          )}

          {msg.texto && (
            <div className={`perfil-tama-msg perfil-tama-msg--${msg.tipo}`}>
              {msg.texto}
            </div>
          )}
        </>
      )}
    </div>
  )
}
