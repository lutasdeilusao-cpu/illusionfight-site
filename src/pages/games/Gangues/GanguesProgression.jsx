import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useGanguesStore } from './store/useGanguesStore'
import { getGanguesProgression } from './data/ganguesLoadout.js'
import GanguesProgressionPanel from './components/GanguesProgressionPanel'
import { sfx } from '../../../lib/sfx'

/* ══════════════════════════════════════════════════════════════
   PROGRESSÃO DA FICHA — tela dedicada
   Antes era um painel espremido no meio do elenco; dava pra entrar
   sem querer e o jogador se sentia preso. Agora é uma parada
   consciente: você entra pelo botão LEVEL UP, gasta os pontos com
   calma, e volta pelo botão. Todo gasto de XP passa por confirmação.
   ══════════════════════════════════════════════════════════════ */
export default function GanguesProgression({ onNavigate }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useGanguesStore()
  const member = store.roster.find(m => m.id === store.progressionTargetId) || null
  const [pendente, setPendente] = useState(null) // { change, meta } aguardando confirmação
  const [destaque, setDestaque] = useState(null) // id do poder recém-comprado, pra dar feedback

  // Se a Vitória empurrou o jogador pra cá por causa de ponto parado, guardou
  // ali o que ele faria em seguida — o voltar retoma isso em vez de ir pro
  // lobby, terminando ou não de distribuir.
  const voltar = () => {
    store.setProgressionTarget(null)
    const acao = store.posVitoriaAcao
    if (acao) {
      store.setPosVitoriaAcao(null)
      acao()
    } else {
      onNavigate('lobby')
    }
  }

  const aplicar = async (change) => {
    if (!member || !change) return
    store.loadSheet(member)
    store.updateSheet(change)
    if (user?.id) await store.saveToCloud(user.id)
    else store.updateRosterSheet(member.id, change)
  }

  // O painel manda o custo junto. Custo > 0 → confirma antes.
  const onApply = (m, change, meta = {}) => {
    if (!change) return
    if (meta.cost > 0) { sfx.select(); setPendente({ change, meta }); return }
    sfx.select()
    aplicar(change)
  }

  const confirmar = () => {
    const c = pendente
    setPendente(null)
    if (!c) return
    sfx.reward()
    aplicar(c.change)
    if (c.meta.skillId) {
      setDestaque(c.meta.skillId)
      setTimeout(() => setDestaque(null), 2600)
    }
  }
  const cancelar = () => { sfx.cancel(); setPendente(null) }

  const excluir = async () => {
    if (!member) return
    if (!window.confirm(t('games.gangues.progression.delete_confirm', { name: member.sheet_name }))) return
    await store.deleteSheet(member.id)
    voltar()
  }

  if (!member) {
    return (
      <main className="gang-lobby gang-progression-screen">
        <p className="gang-lobby-empty">{t('games.gangues.progression.no_member')}</p>
        <button className="gang-new-sheet gang-new-sheet--back" onClick={voltar}>{t('games.gangues.progression.back_to_roster')}</button>
      </main>
    )
  }

  const prog = getGanguesProgression(member)

  return (
    <main className="gang-lobby gang-progression-screen">
      <header className="gang-progression-screen-head">
        <button className="gang-progression-screen-back" onClick={voltar}>
          ← {t('games.gangues.progression.back_to_roster')}
        </button>
        <div className="gang-progression-screen-xp">
          <span className="gang-progression-screen-xp-num">{prog.xp_unspent}</span>
          <span>{t('games.gangues.progression.xp_label')}</span>
        </div>
      </header>

      <GanguesProgressionPanel member={member} onApply={onApply} onDelete={excluir} destaque={destaque} />

      <AnimatePresence>
        {pendente && (
          <motion.div className="gang-xp-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="gang-xp-confirm-bg" onClick={cancelar} />
            <motion.div className="gang-xp-confirm-card"
              initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}>
              <span className="gang-xp-confirm-icon">✦</span>
              <h3>{t('games.gangues.progression.confirm_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('games.gangues.progression.confirm_body', { label: pendente.meta.label || '—', n: pendente.meta.cost }) }} />
              <div className="gang-xp-confirm-actions">
                <button className="gang-xp-confirm-no" onClick={cancelar}>{t('games.gangues.progression.confirm_cancel')}</button>
                <button className="gang-xp-confirm-yes" onClick={confirmar}>{t('games.gangues.progression.confirm_ok', { n: pendente.meta.cost })}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
