import { motion } from 'framer-motion'
import { getGanguesLevelFromXp } from '../../data/ganguesCharacters.js'
import { getGanguesProgression, ganguesXpMaxForSheet } from '../../data/ganguesLoadout.js'
import { getGanguesPortraitByTemplateId } from '../../data/ganguesPortraits.js'
import { infoDoDrop } from '../../data/ganguesDrops.js'
import GanguesRetratoImg from '../GanguesRetratoImg'

/* O que a gangue ganhou: AP de cada lutador com a barra do nível, grana,
   reputação e o que caiu do bando. */
export default function ResultadoRecompensa({ t, rewardSummary, roster }) {
  const { apLista, grana, rep, drops = [] } = rewardSummary
  return (
    <section className="resultado-bloco resultado-recompensa">
      <h2 className="resultado-titulo">{t('games.gangues.report.rewards_title')}</h2>
      <ul className="resultado-lutadores">
        {apLista.map((item, i) => {
          const ficha = roster.find(m => m.id === item.id)
          const nivel = getGanguesLevelFromXp(ficha?.xp_total)
          const pct = ficha ? Math.min(100, Math.round((getGanguesProgression(ficha).ap / ganguesXpMaxForSheet(ficha)) * 100)) : 0
          return (
            <motion.li key={item.id} className={item.ko ? 'is-ko' : ''} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }}>
              <span className="resultado-lutadores__rosto"><GanguesRetratoImg src={getGanguesPortraitByTemplateId(ficha?.character_template_id)} fallback={item.nome?.[0]} /></span>
              <span className="resultado-lutadores__info">
                <b>{item.nome} <small>NV {nivel}</small></b>
                <span className="resultado-barra"><i style={{ '--pct': `${item.noTeto ? 100 : pct}%` }} /></span>
              </span>
              <span className="resultado-lutadores__ap">
                <strong>+{item.ap}</strong>
                <small>{item.ko ? t('games.gangues.report.reward_ap_ko') : item.noTeto ? t('games.gangues.report.reward_ap_teto', { n: item.teto }) : t('games.gangues.report.reward_ap')}</small>
              </span>
            </motion.li>
          )
        })}
      </ul>
      {(grana > 0 || rep > 0) && (
        <div className="resultado-moedas">
          {grana > 0 && <span className="resultado-moeda is-grana">💵 <b>+{grana}</b></span>}
          {rep > 0 && <span className="resultado-moeda is-rep">⚑ <b>+{rep}</b></span>}
        </div>
      )}
      {drops.length > 0 && (
        <div className="gang-reward-drops">
          <h3 className="resultado-subtitulo">{t('games.gangues.drop.titulo')}</h3>
          {drops.map((d, i) => {
            const info = infoDoDrop(t, d)
            return (
              <motion.div key={`${d.enemyId}-${d.tipo}-${d.id}-${i}`} className={`gang-reward-drop gang-reward-drop--${d.tipo}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 + i * 0.12, type: 'spring', stiffness: 260, damping: 16 }}>
                <b>{info.icone}</b><strong>{info.nome}</strong><span>{info.tag}</span>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
