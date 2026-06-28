export default function SoundToggle({ ativo, onToggle, labelAtivo, labelInativo }) {
  return (
    <button className="tt-sound-toggle" onClick={onToggle} title={ativo ? labelAtivo : labelInativo}>
      {ativo ? labelAtivo : labelInativo}
    </button>
  )
}
