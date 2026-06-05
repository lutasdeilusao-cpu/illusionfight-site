import { useEffect, useRef } from 'react'

export default function BattleLog({ log }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  const last5 = log ? log.slice(-6) : []

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      padding: '4px 16px',
      maxHeight: 80,
      overflowY: 'auto',
      overflowX: 'visible',
      fontFamily: "'Courier New', monospace",
      fontSize: 9,
      letterSpacing: 0.5,
      position: 'relative',
      zIndex: 1,
      }}>
      {last5.map((msg, i) => (
        <div key={i} style={{
          padding: '2px 0', color: '#555',
          background: i === last5.length - 1 ? 'rgba(245,166,35,0.05)' : 'transparent',
          borderLeft: i === last5.length - 1 ? '2px solid rgba(245,166,35,0.2)' : '2px solid transparent',
          paddingLeft: 6,
        }}>
          {msg}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
