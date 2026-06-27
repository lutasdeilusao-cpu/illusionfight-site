export default function FireParticles() {
  return (
    <div className="tt-fire-particles">
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="tt-fire-particle" />
      ))}
    </div>
  )
}
