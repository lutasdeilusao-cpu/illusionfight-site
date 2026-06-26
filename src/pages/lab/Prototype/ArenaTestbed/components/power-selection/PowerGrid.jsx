import PowerCard from './PowerCard'
import './PowerGrid.css'

export default function PowerGrid({ poderes, selecoes, limite, charId, onToggle }) {
  return (
    <div className="pg-grid">
      {poderes.map(poder => (
        <PowerCard
          key={poder.id}
          poder={poder}
          selected={selecoes.includes(poder.id)}
          atLimit={selecoes.length >= limite}
          onToggle={() => onToggle(charId, poder.id, limite)}
        />
      ))}
    </div>
  )
}
