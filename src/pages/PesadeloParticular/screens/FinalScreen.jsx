import { usePPStore } from '../store/usePPStore'
import { PISTAS } from '../data/pistas'
import { useAuth } from '../../../context/AuthContext'

export default function FinalScreen() {
  const { user } = useAuth()
  const store = usePPStore()

  const totalFios = PISTAS.filter(p => p.tipo === 'fio').length
  const coletados = store.cadernoSuspeitas.length
  const completo = coletados >= totalFios * 0.7

  const handleFim = () => {
    store.setFase('mapa')
    store.saveToCloud(user?.id)
  }

  return (
    <div className="pp-container">
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1 className={`pp-title ${completo ? 'pp-final-completo' : 'pp-final-fragmentado'}`}
          style={{ fontSize: 32, letterSpacing: 6 }}>
          FIM DO PESADELO
        </h1>

        <p style={{ color: '#888', fontSize: 14, marginTop: 16, lineHeight: 1.8, maxWidth: 500, margin: '16px auto' }}>
          {completo
            ? 'Você coletou pistas suficientes. Kim foi confrontado com todas as evidências. O sonho termina com clareza — mas as memórias permanecem.'
            : 'Você não conseguiu todas as pistas. Kim admite parte dos crimes, mas escapa parcialmente. O sonho termina com dúvidas — talvez haja mais para descobrir.'}
        </p>

        <div style={{ marginTop: 24 }}>
          <div style={{ color: '#FFD700', fontSize: 28, fontWeight: 'bold' }}>★ {store.reputacao}</div>
          <div style={{ color: '#666', fontSize: 12 }}>reputação total</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#22C55E', fontSize: 18 }}>{store.casosResolvidos.length}/20</div>
          <div style={{ color: '#666', fontSize: 12 }}>casos resolvidos</div>
        </div>

        <div className="pp-section-label" style={{ marginTop: 32 }}>Pistas Fio coletadas</div>
        <div style={{ height: 6, background: '#1a1a1a', maxWidth: 400, margin: '8px auto' }}>
          <div style={{ height: '100%', background: '#FFD700', width: `${(coletados / totalFios) * 100}%` }} />
        </div>
        <div style={{ color: '#FFD700', fontSize: 12 }}>{coletados}/{totalFios}</div>

        <button className="pp-btn pp-btn--primary" onClick={handleFim} style={{ marginTop: 32 }}>
          VOLTAR AO MAPA
        </button>
      </div>
    </div>
  )
}
