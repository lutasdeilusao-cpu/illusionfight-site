import { motion } from 'framer-motion'
import { getGanguesCharacter, eventosDoNivel } from '../data/ganguesCharacters.js'
import { combatantName, eventosDoLevelUp } from '../engine/ganguesVictoryResolver.js'

// Tela normal de relatório de batalha (vitória ou derrota) — modal de
// level-up, painel de recompensa, resumo, roster final, ordem de iniciativa
// e log completo. Extraído de GanguesVictory.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2).
export default function GanguesVictoryReport({
  t, store, report, victory, torre, cenaChefe, noModoHistoria, storyAlvo,
  podeRecrutar, recrutar, levelUps, clearLevelUps, rewardSummary, onNavigate,
}) {
  const attacks = report.entries.filter(entry => entry.kind === 'attack_card')
  const playerDamage = attacks.filter(entry => entry.side === 'player').reduce((sum, entry) => sum + entry.dmg, 0)
  const enemyDamage = attacks.filter(entry => entry.side === 'enemy').reduce((sum, entry) => sum + entry.dmg, 0)

  return (
    <main className={`gang-report gang-report--${victory ? 'victory' : 'defeat'}`}>
      {levelUps.length > 0 && (
        <div className="gang-progression-prompt" role="dialog" aria-modal="true" aria-labelledby="gang-levelup-prompt-title">
          <div className="gang-progression-prompt__card">
            <span className="gang-progression-prompt__icon">⬆</span>
            <h2 id="gang-levelup-prompt-title">{t('games.gangues.levelup.titulo')}</h2>
            {levelUps.map(lu => {
              const character = getGanguesCharacter(lu.characterTemplateId)
              const eventos = character ? eventosDoLevelUp(character, lu.fromLevel, lu.toLevel, eventosDoNivel) : []
              // O custo de atributo agora é escalonado (ver custoAtributoGangues em
              // data/ganguesCharacters.js) — é normal e ESPERADO subir de nível sem
              // nenhum atributo junto (o XP fica "bancado" até dar pra pagar o próximo
              // ponto). Sem esse aviso, o jogador acha que travou/bugou, igual o
              // Isaias reportou olhando as fichas dele (NV8/NV9 sem gap nenhum antes
              // desta revisão — pedido dele: "demonstrar de alguma maneira na tela de
              // level up que sim vc passou de level, mas só daqui um ou dois levels
              // vc vai sentir a diferença").
              const temAtributo = eventos.some(evento => evento.type === 'attribute')
              return (
                <div key={lu.id} className="gang-levelup-entry">
                  <div className="gang-levelup-entry__head">
                    <span className={`gang-levelup-entry__avatar gang-path--${character?.combat_path}`}>{lu.name?.[0]?.toUpperCase()}</span>
                    <span className="gang-levelup-entry__nome">{lu.name}</span>
                    <span className="gang-levelup-entry__nivel">NV {lu.toLevel}</span>
                  </div>
                  <div className="gang-levelup-entry__eventos">
                    {!temAtributo && (
                      <span className="gang-levelup-tag gang-levelup-tag--vazio">{t('games.gangues.levelup.sem_atributo')}</span>
                    )}
                    {eventos.map((evento, index) => (
                      <span key={index} className={`gang-levelup-tag${evento.type === 'unlock_special' || evento.type === 'special_rank' ? ' gang-levelup-tag--poder' : ''}`}>
                        {evento.type === 'attribute'
                          ? `+${evento.delta} ${t(`games.gangues.attr_labels.${evento.attribute}`)}`
                          : evento.type === 'unlock_special'
                            ? `⚡ ${t(`games.gangues.progression.skills.${evento.special_id}`)}`
                            : evento.type === 'special_rank'
                              ? `⬆ ${t(`games.gangues.progression.skills.${evento.special_id}`)} NV${evento.rank}`
                              : evento.type === 'max_rank'
                                ? `★ ${evento.title}`
                                : null}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
            <button className="gang-progression-prompt__confirm" onClick={clearLevelUps}>{t('games.gangues.levelup.continuar')}</button>
          </div>
        </div>
      )}
      <motion.header className="gang-report-hero" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
        <h1>{victory ? t('games.gangues.vitoria') : t('games.gangues.derrota')}</h1>
        <p>{victory ? t('games.gangues.report.victory_message') : t('games.gangues.report.defeat_message')}</p>
      </motion.header>

      {/* Recompensa de verdade ganha nesta luta — logo abaixo do resultado,
          antes de qualquer outra coisa, com pop-in escalonado por item. */}
      {victory && rewardSummary && (
        <section className="gang-reward-panel">
          <span className="gang-reward-panel__kicker">{t('games.gangues.report.rewards_title')}</span>
          {/* Pontos de Ação por personagem — não XP. O jogador acompanha AP
              (é o número que ele entende e decidiu como regra); o XP
              convertido é só conta de bastidor, nunca aparece aqui. */}
          <div className="gang-reward-ap-lista">
            {rewardSummary.apLista.map((item, index) => (
              <motion.div key={item.id} className={`gang-reward-ap-item${item.ko ? ' gang-reward-ap-item--ko' : ''}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.12 }}>
                <span className="gang-reward-ap-item__nome">{item.nome}</span>
                <strong className="gang-reward-ap-item__val">+{item.ap}</strong>
                <small className="gang-reward-ap-item__label">{item.ko ? t('games.gangues.report.reward_ap_ko') : t('games.gangues.report.reward_ap')}</small>
              </motion.div>
            ))}
          </div>
          <div className="gang-reward-panel__items">
            {rewardSummary.grana > 0 && (
              <motion.div className="gang-reward-item gang-reward-item--grana" initial={{ scale: 0.5, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 16 }}>
                <b>💵</b><strong>+{rewardSummary.grana}</strong><span>{t('games.gangues.report.reward_grana')}</span>
              </motion.div>
            )}
            {rewardSummary.rep > 0 && (
              <motion.div className="gang-reward-item gang-reward-item--rep" initial={{ scale: 0.5, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.65, type: 'spring', stiffness: 260, damping: 16 }}>
                <b>⚑</b><strong>+{rewardSummary.rep}</strong><span>{t('games.gangues.report.reward_rep')}</span>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Ação principal logo abaixo do resultado — é o botão que mais importa
          (seguir em frente), não precisa rolar o log inteiro pra achar.
          "Voltar pro mapa" só aparece aqui quando é a ÚNICA opção real (chefe
          derrotado, bairro dominado); dentro do bairro já tem um botão de
          volta ao mapa pra quem quiser sair por lá. */}
      <footer className="gang-report-actions gang-report-actions--top">
        {torre ? (
          <>
            {victory && <button className="gang-report-primary" onClick={() => { store.torreAvancar(); onNavigate('batalha') }}>{t('games.gangues.batalha.proximo_andar')}</button>}
            <button className={victory ? 'gang-report-secondary' : 'gang-report-primary'} onClick={() => { store.torreEncerrar(); onNavigate('batalha') }}>{t('games.gangues.batalha.sair_torre')}</button>
          </>
        ) : cenaChefe && victory ? (
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
          </>
        ) : (
          <button className="gang-report-primary" onClick={() => onNavigate('lobby')}>{t('games.gangues.report.back_to_gang')}</button>
        )}
      </footer>

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
    </main>
  )
}
