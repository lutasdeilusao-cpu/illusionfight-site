import './HomeSectionHeading.css'

export default function HomeSectionHeading({ eyebrow, title, description, className = '' }) {
  return (
    <header className={`home-section-heading${className ? ` ${className}` : ''}`}>
      <span className="home-section-heading__eyebrow">{eyebrow}</span>
      <h2 className="home-section-heading__title">{title}</h2>
      {description && <p className="home-section-heading__description">{description}</p>}
    </header>
  )
}
