export default function BurstParticles({ particulas }) {
  return particulas.map(p => (
    <div key={p.id} className={`tt-particula tt-particula--${p.tipo} tt-particula--v${p.variante}`} />
  ))
}
