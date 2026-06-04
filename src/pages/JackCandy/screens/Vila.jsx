import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import jackImg from '../../../assets/images/characters/jack-balloon.png'

export default function Vila() {
  const store = useJackStore()

  return (
    <div className="jdc-vila">
      <div className="jdc-avatar" style={{ width: 80, height: 80, marginBottom: '1rem' }}>
        <img src={jackImg} alt="Jack" />
      </div>

      <p className="jack-text jack-text--amber">você tem uma arma agora. no sonho isso significa alguma coisa.</p>
      <p className="jack-text jack-text--dim">a rua estava lá. sempre estava.</p>

      <div className="jack-buttons">
        <button className="jack-btn" disabled>🚧 dungeons (em breve)</button>
      </div>
    </div>
  )
}
