import './SoundToggle.css'

export default function SoundToggle({
  ativo,
  onToggle,
  labelAtivo,
  labelInativo,
  iconAtivo,
  iconInativo,
  className = '',
}) {
  const label = ativo ? labelAtivo : labelInativo
  return (
    <button
      className={`tt-sound-toggle${className ? ` ${className}` : ''}`}
      onClick={onToggle}
      title={label}
      aria-label={label}
    >
      {ativo ? (iconAtivo || labelAtivo) : (iconInativo || labelInativo)}
    </button>
  )
}
