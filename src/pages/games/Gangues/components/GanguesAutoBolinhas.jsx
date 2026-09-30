// As bolinhas de controle da luta no automático (Isaias, 30/09/2026: "três
// bolinhas bonitinhas... segurou em cima, vê a explicação"). Toque = faz a
// ação; segurar ~0,45s = mostra o que o botão faz (e soltar não aciona).
import { useRef, useState } from 'react'

const SEGURAR_MS = 450

function Bolinha({ variante, rotulo, dica, onAcionar, children }) {
  const [dicaAberta, setDicaAberta] = useState(false)
  const timer = useRef(null)
  const segurou = useRef(false)

  const soltar = () => { clearTimeout(timer.current); setTimeout(() => setDicaAberta(false), 1200) }
  return (
    <div className="gang-auto-bola-wrap">
      {dicaAberta && <span className="gang-auto-bola-dica" role="tooltip">{dica}</span>}
      <button
        type="button"
        className={`gang-auto-bola is-${variante}`}
        aria-label={rotulo}
        onPointerDown={() => {
          segurou.current = false
          clearTimeout(timer.current)
          timer.current = setTimeout(() => { segurou.current = true; setDicaAberta(true) }, SEGURAR_MS)
        }}
        onPointerUp={soltar}
        onPointerLeave={soltar}
        onPointerCancel={soltar}
        onContextMenu={e => e.preventDefault()}
        onClick={() => { if (!segurou.current) onAcionar() }}
      >
        {children}
      </button>
    </div>
  )
}

export default function GanguesAutoBolinhas({ t, autoLigado, brigaRuaAqui, velocidade, onSairAuto, onPararBrigaRua, onVelocidade, top }) {
  return (
    <div className="gang-auto-barra" style={top != null ? { top: `${top}px` } : undefined}>
      {autoLigado && (
        <Bolinha variante="sair" rotulo={t('games.gangues.auto.sair')} dica={t('games.gangues.auto.sair_dica')} onAcionar={onSairAuto}>
          {/* robô com o "pare": sai do automático */}
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5" /></svg>
        </Bolinha>
      )}
      {brigaRuaAqui && (
        <Bolinha variante="rua" rotulo={t('games.gangues.auto.parar_briga_rua')} dica={t('games.gangues.auto.parar_briga_rua_dica')} onAcionar={onPararBrigaRua}>
          {/* punho cortado: para a briga de rua automática */}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-2a1.5 1.5 0 0 1 3 0" /><path d="M4 4l16 16" /></svg>
        </Bolinha>
      )}
      {autoLigado && (
        <Bolinha variante="vel" rotulo={t('games.gangues.velocidade_auto')} dica={t('games.gangues.auto.velocidade_dica')} onAcionar={onVelocidade}>
          <b>{velocidade}x</b>
        </Bolinha>
      )}
    </div>
  )
}
