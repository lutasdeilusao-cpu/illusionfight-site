import './CurtainReveal.css'

export default function CurtainReveal({ ativo, texto }) {
  if (!ativo) return null
  return (
    <div className="tt-curtain-overlay">
      <div className="tt-curtain-inner" />
      <div className="tt-curtain-onomatopeia">
        <span className="tt-onoma-texto">{texto}</span>
      </div>
    </div>
  )
}
