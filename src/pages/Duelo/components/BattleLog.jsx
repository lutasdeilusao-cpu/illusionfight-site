import { useEffect, useRef } from 'react'

export default function BattleLog({ log }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  const last5 = log ? log.slice(-6) : []

  return (
    <div className="duelo-battle-log">
      {last5.map((msg, i) => (
        <div key={i} className="duelo-battle-log-msg" style={{
          background: i === last5.length - 1 ? 'rgba(245,166,35,0.05)' : 'transparent',
          borderLeft: i === last5.length - 1 ? '2px solid rgba(245,166,35,0.2)' : '2px solid transparent',
        }}>
          {msg}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
