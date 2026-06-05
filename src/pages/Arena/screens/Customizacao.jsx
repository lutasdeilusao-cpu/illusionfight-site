import { useState } from 'react'
import { motion } from 'framer-motion'
import { ELEMENTAIS } from '../data/elementais'
import { PALETAS_CORES, getCorPorElemental } from '../data/cosmeticos'
import { CLASSES } from '../data/classes'

const ATTR_LABELS = {
  forca: 'Força — dano físico',
  velocidade: 'Velocidade — ordem de ação',
  resistencia: 'Resistência — HP máximo',
  energia: 'Energia — MP máximo',
  precisao: 'Precisão — acerto crítico',
  tenacidade: 'Tenacidade — defesa',
}

export default function Customizacao({ classe, onConfirm, onBack }) {
  const cls = CLASSES[classe]
  const [nome, setNome] = useState('')
  const [elemental, setElemental] = useState('fogo')
  const [pronome, setPronome] = useState('ele')
  const [corSec, setCorSec] = useState('#C0C0C0')
  const [atributos, setAtributos] = useState({ ...cls.atributos_base })
  const [pts, setPts] = useState(10)

  const handleAttr = (attr, delta) => {
    const novo = atributos[attr] + delta
    if (novo < 1 || novo > 20) return
    if (delta > 0 && pts <= 0) return
    setAtributos(s => ({ ...s, [attr]: novo }))
    setPts(s => s - delta)
  }

  const totalAtributos = Object.values(atributos).reduce((a, b) => a + b, 0)
  const hp = 30 + atributos.resistencia * 3
  const mp = 10 + atributos.energia

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '1rem', overflowY: 'auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', fontFamily: 'Courier New', fontSize: '0.7rem', cursor: 'pointer', marginBottom: '0.5rem' }}>← VOLTAR</button>
      <div style={{ textAlign: 'center', color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: '1rem' }}>CRIE SEU LUTADOR</div>

      {/* Seção A — Identidade */}
      <div style={{ background: '#0d0d0d', borderRadius: 12, padding: '1rem', marginBottom: '1rem', border: '1px solid #222' }}>
        <div style={{ color: '#888', fontSize: '0.6rem', fontFamily: 'Courier New', marginBottom: 8, letterSpacing: '0.1em' }}>IDENTIDADE</div>
        <input value={nome} onChange={e => setNome(e.target.value.slice(0, 20))}
          placeholder="Nome do lutador"
          style={{ width: '100%', padding: '0.6rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#eee', fontFamily: 'Courier New', fontSize: '0.85rem', marginBottom: 8, outline: 'none' }} />
        <div style={{ textAlign: 'right', color: '#555', fontSize: '0.6rem', fontFamily: 'Courier New' }}>{nome.length}/20</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {['ele', 'ela', 'elu'].map(p => (
            <button key={p} onClick={() => setPronome(p)}
              style={{
                flex: 1, padding: '0.4rem', borderRadius: 8,
                background: pronome === p ? '#FFD70022' : '#1a1a1a',
                border: `1px solid ${pronome === p ? '#FFD700' : '#333'}`,
                color: pronome === p ? '#FFD700' : '#888',
                fontFamily: 'Courier New', fontSize: '0.7rem', cursor: 'pointer',
              }}>{p}</button>
          ))}
        </div>

        {/* Elemental grid */}
        <div style={{ color: '#888', fontSize: '0.6rem', fontFamily: 'Courier New', marginBottom: 6 }}>ELEMENTAL</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {Object.entries(ELEMENTAIS).map(([id, el]) => (
            <button key={id} onClick={() => setElemental(id)}
              style={{
                padding: '0.4rem', borderRadius: 8,
                background: elemental === id ? `${el.cor}33` : '#1a1a1a',
                border: `1px solid ${elemental === id ? el.cor : '#333'}`,
                fontSize: '1rem', cursor: 'pointer', textAlign: 'center',
              }}>
              {el.icone}
            </button>
          ))}
        </div>
      </div>

      {/* Seção B — Atributos */}
      <div style={{ background: '#0d0d0d', borderRadius: 12, padding: '1rem', marginBottom: '1rem', border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#888', fontSize: '0.6rem', fontFamily: 'Courier New', letterSpacing: '0.1em' }}>ATRIBUTOS</span>
          <span style={{ color: pts > 0 ? '#FFD700' : '#555', fontSize: '0.7rem', fontFamily: 'Courier New' }}>{pts} pts restantes</span>
        </div>
        {Object.entries(atributos).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#aaa', fontFamily: 'Courier New', marginBottom: 2 }}>
              <span>{ATTR_LABELS[k]}</span>
              <span style={{ fontWeight: 700, color: '#eee' }}>{v}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button onClick={() => handleAttr(k, -1)} disabled={v <= 1}
                style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 4, width: 24, height: 24, cursor: v > 1 ? 'pointer' : 'default', fontSize: '0.7rem' }}>−</button>
              <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(v / 20) * 100}%`, background: getCorPorElemental(elemental), borderRadius: 3, transition: 'width 0.2s' }} />
              </div>
              <button onClick={() => handleAttr(k, 1)} disabled={v >= 20 || pts <= 0}
                style={{ background: 'none', border: '1px solid #333', color: pts > 0 && v < 20 ? '#eee' : '#333', borderRadius: 4, width: 24, height: 24, cursor: pts > 0 && v < 20 ? 'pointer' : 'default', fontSize: '0.7rem' }}>+</button>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center', fontSize: '0.65rem', fontFamily: 'Courier New', color: '#666' }}>
          <span>HP: {hp}</span>
          <span>MP: {mp}</span>
        </div>
      </div>

      {/* Seção C — Cor Secundária */}
      <div style={{ background: '#0d0d0d', borderRadius: 12, padding: '1rem', marginBottom: '1rem', border: '1px solid #222' }}>
        <div style={{ color: '#888', fontSize: '0.6rem', fontFamily: 'Courier New', marginBottom: 8, letterSpacing: '0.1em' }}>COR SECUNDÁRIA</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {PALETAS_CORES.map(p => (
            <button key={p.nome} onClick={() => setCorSec(p.cor)}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 8,
                background: p.cor, border: `2px solid ${corSec === p.cor ? '#fff' : 'transparent'}`,
                cursor: 'pointer',
                boxShadow: corSec === p.cor ? `0 0 8px ${p.cor}` : 'none',
              }} />
          ))}
        </div>
      </div>

      {/* Confirmar */}
      <motion.button whileTap={{ scale: 0.97 }}
        onClick={() => onConfirm({ nome: nome || 'Briguento', classe, elemental, pronome, cor_secundaria: corSec, atributos })}
        style={{
          width: '100%', padding: '0.85rem', background: '#FFD70022',
          border: '2px solid #FFD700', borderRadius: 12,
          color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.85rem',
          fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
        }}>
        CONFIRMAR — REGISTRAR NO LDI
      </motion.button>
    </div>
  )
}
