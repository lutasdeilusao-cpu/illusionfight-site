import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { ehConfrontoFinal } from './data/ganguesTerritorios.js'
import { getGanguesRosterLimitComHistoria } from './data/ganguesLoadout.js'
import { getGanguesCharacter } from './data/ganguesCharacters.js'
import { registrarPontuacaoArenaRanking } from '../../../hooks/useLeaderboardDB'
import { sfx } from '../../../lib/sfx'
import './GanguesProgressionFlow.css'

function combatantName(t, member) {
  return member?.side === 'enemy' ? (t(`games.gangues.enemy_names.${member.id}`) || member.name) : member?.sheet_name
}

// Junta os eventos (atributo ganho, poder desbloqueado) de todo nível
// cruzado nesta luta — cobre o caso raro de subir mais de um nível de uma
// vez (bando grande, XP dividido mesmo assim empurrando 2 níveis).
function eventosDoLevelUp(character, fromLevel, toLevel) {
  const eventos = []
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    const levelData = character.levels.find(item => item.level === lvl)
    if (levelData) eventos.push(...levelData.events)
  }
  return eventos
}

export default function GanguesVictory({ onNavigate }) {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const store = useGanguesStore()
  const { match } = store
  const report = match.battleReport || { outcome: match.status, entries: [], initiative: [], combatants: [], rounds: 0 }
  const victory = report.outcome === 'victory'
  const processed = useRef(false)
  const [levelUps, setLevelUps] = useState([])
  const attacks = report.entries.filter(entry => entry.kind === 'attack_card')
  const playerDamage = attacks.filter(entry => entry.side === 'player').reduce((sum, entry) => sum + entry.dmg, 0)
  const enemyDamage = attacks.filter(entry => entry.side === 'enemy').reduce((sum, entry) => sum + entry.dmg, 0)

  const storyAlvo = store.storyTarget
  const emCena = Boolean(storyAlvo?.cenaId)
  const noModoHistoria = Boolean(storyAlvo?.noId) || emCena
  const cenaChefe = emCena && storyAlvo.isChefe
  const confrontoFinal = Boolean(storyAlvo?.noId) && ehConfrontoFinal(storyAlvo)
  // Território dominado nesta vitória? (chefe caiu, seja no fluxo de cena
  // da Pista ou na trilha dos outros bairros) — libera 1 vaga de recruta.
  const territorioDominado = victory && (cenaChefe || (noModoHistoria && !emCena && storyAlvo.isChefe))
  const podeRecrutar = territorioDominado
    && store.roster.length < getGanguesRosterLimitComHistoria(perfil?.tier, store.storyProgress, store.rep)
  const recrutar = () => { store.newSheet(); onNavigate('create') }

  // Pra onde o jogador iria depois desta vitória, se não tivesse ponto parado
  // pra distribuir — mesma lógica dos botões do rodapé, sem a opção de recrutar
  // (recrutar é um desvio opcional, não "o que ele tava fazendo").
  const acaoPosVitoria = () => {
    if (confrontoFinal && victory) { onNavigate('story'); return }
    if (cenaChefe && victory) { onNavigate('story'); return }
    if (noModoHistoria) {
      store.setStoryTarget({ territorioId: storyAlvo.territorioId })
      onNavigate('territorio')
      return
    }
    onNavigate('lobby')
  }

  useEffect(() => {
    if (processed.current) return
    processed.current = true
    const ap = victory ? 10 : 1
    const participantIds = match.playerTeam.map(member => member.id)
    setLevelUps(store.gainApForParticipants(ap, participantIds))
    if (victory) {
      store.unlockNextEnemy(match.enemy_id)
      // Modo história — cena: marca o POI resolvido, aplica grana/rep e fôlego.
      if (emCena) {
        store.marcarPoiResolvido(storyAlvo.cenaId, storyAlvo.cenaPoiId, storyAlvo.cenaRevela || [])
        if (storyAlvo.repDelta) store.ganharRep(storyAlvo.repDelta)
        const rec = storyAlvo.cenaRecompensa
        if (rec) { if (rec.grana) store.ganharGrana(rec.grana); if (rec.rep) store.ganharRep(rec.rep) }
        store.ajustarFolego(storyAlvo.cenaId, -14)
        if (cenaChefe) {
          store.marcarBossCena(storyAlvo.cenaId)
          store.dominarTerritorioViaCena(storyAlvo.territorioId, storyAlvo.pontoIds || [])
          store.restaurarFolego(storyAlvo.cenaId)
        }
      } else if (noModoHistoria) {
        // Modo história — trilha: marca o nó dominado.
        store.marcarNoDominado(storyAlvo.territorioId, storyAlvo.noId, storyAlvo.isChefe)
      }
      if (user?.id) registrarPontuacaoArenaRanking(user.id)
      if (confrontoFinal) store.completeCampaign()
      sfx.win()
    } else sfx.lose()
    const timer = setTimeout(() => store.saveParticipantProgress(participantIds), 400)
    return () => clearTimeout(timer)
  }, [])

  // ── Confronto final contra o Alan — canon: Marelia não fica com você ──
  if (confrontoFinal && victory) {
    const suaGangue = store.gangName || t('games.gangues.report.your_gang')
    const paragrafos = (t('games.gangues.story.final.paragrafos') || []).map(par =>
      String(par).replace(/\{gangue\}/g, suaGangue))
    return (
      <main className="gang-report gang-report--final">
        <motion.div className="gang-final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <span className="gang-report-code">{t('games.gangues.story.final.code')}</span>
          <h1 className="gang-final-titulo">{t('games.gangues.story.final.titulo')}</h1>
          {paragrafos.map((par, i) => (
            <motion.p
              key={i}
              className="gang-final-par"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.6 }}
            >
              {par}
            </motion.p>
          ))}
          <motion.button
            className="gang-report-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + paragrafos.length * 0.6 }}
            onClick={() => onNavigate('story')}
          >
            {t('games.gangues.story.voltar_mapa')}
          </motion.button>
          {podeRecrutar && <button className="gang-report-secondary" onClick={recrutar}>{t('games.gangues.report.recrutar')}</button>}
        </motion.div>
      </main>
    )
  }

  return (
    <main className={`gang-report gang-report--${victory ? 'victory' : 'defeat'}`}>
      {levelUps.length > 0 && (
        <div className="gang-progression-prompt" role="dialog" aria-modal="true" aria-labelledby="gang-levelup-prompt-title">
          <div className="gang-progression-prompt__card">
            <span className="gang-progression-prompt__icon">⬆</span>
            <h2 id="gang-levelup-prompt-title">{t('games.gangues.levelup.titulo')}</h2>
            {levelUps.map(lu => {
              const character = getGanguesCharacter(lu.characterTemplateId)
              const eventos = character ? eventosDoLevelUp(character, lu.fromLevel, lu.toLevel) : []
              return (
                <div key={lu.id} className="gang-levelup-entry">
                  <p>{t('games.gangues.levelup.subtitulo', { nome: lu.name, nivel: lu.toLevel })}</p>
                  {eventos.map((evento, index) => (
                    <p key={index}>
                      {evento.type === 'attribute'
                        ? `+${evento.delta} ${t(`games.gangues.attr_labels.${evento.attribute}`)}`
                        : evento.type === 'unlock_special'
                          ? `${t('games.gangues.levelup.poder_novo')}: ${t(`games.gangues.progression.skills.${evento.special_id}`)}`
                          : null}
                    </p>
                  ))}
                </div>
              )
            })}
            <button className="gang-progression-prompt__confirm" onClick={() => setLevelUps([])}>{t('games.gangues.levelup.continuar')}</button>
          </div>
        </div>
      )}
      <motion.header className="gang-report-hero" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
        <span className="gang-report-code">{victory ? t('games.gangues.report.mission_complete') : t('games.gangues.report.mission_failed')}</span>
        <h1>{victory ? t('games.gangues.vitoria') : t('games.gangues.derrota')}</h1>
        <p>{victory ? t('games.gangues.report.victory_message') : t('games.gangues.report.defeat_message')}</p>
      </motion.header>

      <section className="gang-report-summary">
        <div><span>{t('games.gangues.report.rounds')}</span><strong>{report.rounds}</strong></div>
        <div><span>{t('games.gangues.report.attacks')}</span><strong>{attacks.length}</strong></div>
        <div><span>{t('games.gangues.report.damage_dealt')}</span><strong>{playerDamage}</strong></div>
        <div><span>{t('games.gangues.report.damage_taken')}</span><strong>{enemyDamage}</strong></div>
      </section>

      <section className="gang-report-section">
        <h2>{t('games.gangues.report.final_state')}</h2>
        <div className="gang-report-roster">
          {report.combatants.map(member => <div key={member.key} className={`gang-report-member gang-report-member--${member.side} ${member.pv <= 0 ? 'gang-report-member--ko' : ''}`}><span>{combatantName(t, member)?.[0] || '?'}</span><div><strong>{combatantName(t, member)}</strong><small>{member.side === 'player' ? (store.gangName || t('games.gangues.report.your_gang')) : t('games.gangues.report.enemy_gang')}</small></div><b>{member.pv}/{member.pvMax} PV</b></div>)}
        </div>
      </section>

      <section className="gang-report-section">
        <h2>{t('games.gangues.report.initiative_order')}</h2>
        <div className="gang-report-initiative">
          {report.initiative.map((item, index) => {
            const member = report.combatants.find(entry => entry.key === item.key)
            return <div key={item.key}><b>{index + 1}</b><span>{combatantName(t, member)}</span><small>H {item.ability} + d3 {item.die}</small><strong>{item.total}</strong></div>
          })}
        </div>
      </section>

      <section className="gang-report-section gang-report-section--log">
        <h2>{t('games.gangues.report.complete_log')}</h2>
        <div className="gang-report-log">
          {attacks.map((entry, index) => <article key={entry.id} className={`gang-report-attack gang-report-attack--${entry.side}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{t('games.gangues.report.round_number', { n: entry.round })}</small><strong>{entry.actorName} → {entry.targetName}</strong><p>FA {entry.fa} · FD {entry.fd} · D3 {entry.dice}/{entry.defenseDice}{entry.critical ? ` · 💥 ${t('games.gangues.critico')} +${entry.criticalBonus}` : ''}{entry.attackerBonus?.applied ? ` · +${entry.attackerBonus.amount} ${t(`games.gangues.loadout.paths.${entry.attackerBonus.path}.name`)}` : ''}{entry.defenderBonus?.applied ? ` · +${entry.defenderBonus.amount} ${t(`games.gangues.loadout.paths.${entry.defenderBonus.path}.name`)} (def)` : ''}</p></div><b>−{entry.dmg} PV</b></article>)}
          {!attacks.length && <p className="gang-report-empty">{t('games.gangues.report.no_log')}</p>}
        </div>
      </section>

      <footer className="gang-report-actions">
        {cenaChefe && victory ? (
          <>
            {podeRecrutar && <button className="gang-report-primary" onClick={recrutar}>{t('games.gangues.report.recrutar')}</button>}
            <button className={podeRecrutar ? 'gang-report-secondary' : 'gang-report-primary'} onClick={() => onNavigate('story')}>{t('games.gangues.story.voltar_mapa')}</button>
          </>
        ) : noModoHistoria ? (
          <>
            {podeRecrutar && <button className="gang-report-primary" onClick={recrutar}>{t('games.gangues.report.recrutar')}</button>}
            <button className={podeRecrutar ? 'gang-report-secondary' : 'gang-report-primary'} onClick={() => { store.setStoryTarget({ territorioId: storyAlvo.territorioId }); onNavigate('territorio') }}>
              {victory ? t('games.gangues.story.continuar_territorio') : t('games.gangues.story.tentar_de_novo')}
            </button>
            <button className="gang-report-secondary" onClick={() => onNavigate('story')}>{t('games.gangues.story.voltar_mapa')}</button>
          </>
        ) : (
          <>
            <button className="gang-report-primary" onClick={() => onNavigate('lobby')}>{t('games.gangues.report.back_to_gang')}</button>
            <button className="gang-report-secondary" onClick={() => onNavigate('lobby')}>{t('games.gangues.report.new_battle')}</button>
          </>
        )}
      </footer>
    </main>
  )
}
