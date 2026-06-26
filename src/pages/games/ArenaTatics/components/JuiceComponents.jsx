import { getElem } from '../data/elementals'

/**
 * STATUS ICONS — Mapeamento de status para ícones visuais nos tokens
 */
export const STATUS_ICONS_MAP = {
  sangramento:  { icon: '🩸', cor: '#F87171', label: 'Sangramento' },
  envenenamento: { icon: '☠', cor: '#4ADE80', label: 'Envenenamento' },
  atordoamento:  { icon: '💫', cor: '#F4A227', label: 'Atordoado' },
  imobilizacao:  { icon: '⛓', cor: '#A78BFA', label: 'Imobilizado' },
  cegueira:      { icon: '🚫', cor: '#94A3B8', label: 'Cego' },
  silencio:      { icon: '🔇', cor: '#64748B', label: 'Silenciado' },
  congelado:     { icon: '❄', cor: '#BAE6FD', label: 'Congelado' },
  queimadura:    { icon: '🔥', cor: '#FF6B35', label: 'Queimando' },
  medo:          { icon: '💀', cor: '#C084FC', label: 'Medo' },
  esmagado:      { icon: '💢', cor: '#D4A017', label: 'Esmagado' },
  lentidao:      { icon: '🐢', cor: '#6EE7B7', label: 'Lentidão' },
}

export function StatusBadges({ statuses, max = 3 }) {
  if (!statuses?.length) return null

  const visible = statuses.slice(0, max)
  const extra = statuses.length - max

  return (
    <div className="tatics-status-badges">
      {visible.map((st, i) => {
        const info = STATUS_ICONS_MAP[st.tipo] || STATUS_ICONS_MAP[st.toLowerCase?.()] || null
        if (!info) return null
        const pisca = st.tipo === 'envenenamento' || st.tipo === 'sangramento' || st.tipo === 'queimadura'
        return (
          <span
            key={i}
            className={`tatics-status-badge ${pisca ? 'status-pisca' : ''}`}
            title={`${info.label} (${st.duracao || st.turnos || '?'}t)`}
            style={{
              '--status-cor': info.cor,
              '--status-cor-border': `${info.cor}60`,
              '--status-cor-bg': `${info.cor}25`,
            }}
          >
            {info.icon}
          </span>
        )
      })}
      {extra > 0 && (
        <span className="tatics-status-extra">+{extra}</span>
      )}
    </div>
  )
}

/**
 * EfeitoTag — Tags de efeito para skills
 */
export function EfeitoTag({ efeito }) {
  const TAGS = {
    Imobiliza:    { label: 'IMOB',    bg: '#7C3AED20', border: '#7C3AED60', text: '#A78BFA' },
    Veneno:       { label: 'VEN',     bg: '#4ADE8020', border: '#4ADE8060', text: '#4ADE80' },
    Sangramento:  { label: 'SANG',    bg: '#E24B4A20', border: '#E24B4A60', text: '#F87171' },
    Queimadura:   { label: 'QUEIMA',  bg: '#E24B1A20', border: '#E24B1A60', text: '#FF6B35' },
    Congelado:    { label: 'GELO',    bg: '#BAE6FD20', border: '#BAE6FD60', text: '#BAE6FD' },
    Atordoa:      { label: 'ATOR',    bg: '#F4A22720', border: '#F4A22760', text: '#F4A227' },
    Cego:         { label: 'CEGO',    bg: '#94A3B820', border: '#94A3B860', text: '#94A3B8' },
    Silencia:     { label: 'SIL',     bg: '#64748B20', border: '#64748B60', text: '#94A3B8' },
    Empurra:      { label: 'PUSH',    bg: '#00B4D820', border: '#00B4D860', text: '#00B4D8' },
    Cura:         { label: 'CURA',    bg: '#34D39920', border: '#34D39960', text: '#34D399' },
    Terreno:      { label: 'TERR',    bg: '#8B691420', border: '#8B691460', text: '#D4A017' },
    Armadilha:    { label: 'TRAP',    bg: '#A8550020', border: '#A8550060', text: '#F97316' },
  }
  const t = TAGS[efeito]
  if (!t) return null

  return (
    <span className="tatics-efeito-tag" style={{
      '--tag-bg': t.bg,
      '--tag-border': t.border,
      '--tag-text': t.text,
    }}>
      {t.label}
    </span>
  )
}

/**
 * TokenParticulas — Partículas orbitais no token
 */
export function TokenParticulas({ elemental, ativo }) {
  if (!ativo) return null
  const elem = getElem(elemental)

  return (
    <div className="tatics-token-particulas" aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className="tatics-token-particula"
          style={{
            color: elem.cor,
            animationDelay: `${i * -0.4}s`,
            '--orbit-r': `${22 + i * 3}px`,
            '--orbit-start': `${i * 90}deg`,
          }}
        >
          {elem.particula}
        </span>
      ))}
    </div>
  )
}
