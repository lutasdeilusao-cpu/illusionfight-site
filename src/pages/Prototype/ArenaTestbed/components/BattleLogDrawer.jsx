import { useEffect, useRef } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'

export default function BattleLogDrawer({ open, battleLog, onClose }) {
  const { t } = useLanguage()
  const listRef = useRef(null)

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [battleLog, open])

  if (!open) return null

  return (
    <div className="atb-drawer-overlay" onClick={onClose}>
      <div className="atb-drawer" onClick={e => e.stopPropagation()}>
        <div className="atb-drawer-handle" />
        <div className="atb-drawer-title">{t('prototype.arena_testbed.battle_log')}</div>
        <div className="atb-drawer-list" ref={listRef}>
          {battleLog.slice(-30).map((entry, i) => (
            <div key={i} className="atb-drawer-entry">{entry.text}</div>
          ))}
        </div>
      </div>
    </div>
  )
}