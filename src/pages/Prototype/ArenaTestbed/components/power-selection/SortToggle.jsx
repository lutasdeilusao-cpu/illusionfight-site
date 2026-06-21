import './SortToggle.css'

export default function SortToggle({ label, ativo, crescente, onClick }) {
  return (
    <button
      className={`st-btn ${ativo ? 'st-btn--ativo' : ''}`}
      onClick={onClick}
    >
      <span className="st-label">{label}</span>
      {ativo && (
        <span className="st-seta">{crescente ? '▲' : '▼'}</span>
      )}
    </button>
  )
}
