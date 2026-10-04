import { useState } from 'react'
import { motion } from 'framer-motion'
import { getGanguesCharacter, eventosDoNivel } from '../data/ganguesCharacters.js'
import { getGanguesPortraitByTemplateId } from '../data/ganguesPortraits.js'
import { getGanguesEnemyPortraitById } from '../data/ganguesEnemyPortraits.js'
import { combatantName, eventosDoLevelUp } from '../engine/ganguesVictoryResolver.js'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import GangTip from '../components/GangTip'
import GanguesRepRecompensaModal from '../components/GanguesRepRecompensaModal'
import GanguesRetratoImg from '../components/GanguesRetratoImg'
import { useGanguesAvancoAutomatico, GANGUES_AVANCO_AUTO_MS } from '../hooks/useGanguesBrigaAutomatica.js'
import { infoDoDrop } from '../data/ganguesDrops.js'
import { getGanguesItem } from '../data/ganguesItens.js'
import { describeGanguesSpecialEffect } from '../engine/ganguesSpecialEffects.js'
import { avancarRinha } from '../data/cenas/cenaHelpers.js'
import useGanguesTeclado from '../hooks/useGanguesTeclado'

// Explica a regra de divisão de XP só na 1ª tela de vitória de verdade
// (pedido do Isaias, 13/09/2026 — tutorial progressivo: a regra só importa
// quando o jogador já tem uma recompensa na tela pra olhar, não antes).
// Escopado por CONTA (TutorialProgressContext), não mais por save/aparelho —
// pedido do Isaias (14/09/2026).
// Um aviso só: como o AP é dividido + por que risco rende mais (29/09/2026 —
// antes eram 2 avisos seguidos na mesma tela).
const XP_TUTORIAL_ID = 'xp_v2'
// "Recompensa por risco" (pedido do Isaias, 19/09/2026 — "não tem porque
// subir, porque subir não dá mais experiência... a gente tem que avisar
// isso também no tutorial, tem que explicar pra upar contra personagens
// [mais fortes]"). Mostra DEPOIS do tutorial de XP (nunca os 2 juntos —
// `apRiscoTipVisto` só é checado quando `xpTipVisto` já é true, ver JSX),
// então na prática aparece na 2ª vitória real em diante.

// Linha do roster "ESTADO FINAL DAS GANGUES" — precisa ser componente
// próprio (não inline no .map) porque a classe `--foto` do wrapper e o
// conteúdo do avatar têm que reagir junto se a imagem falhar ao carregar
// (rede ruim — ver GanguesRetratoImg), não só decidir uma vez se `retrato`
// existe nos dados.
function ReportMemberRow({ member, retrato, nome, gangName, t }) {
  const [falhou, setFalhou] = useState(false)
  const temFoto = Boolean(retrato) && !falhou
  return (
    <div className={`gang-report-member gang-report-member--${member.side} ${member.pv <= 0 ? 'gang-report-member--ko' : ''}${temFoto ? ' gang-report-member--foto' : ''}`}>
      <span>{temFoto ? <img src={retrato} alt="" onError={() => setFalhou(true)} /> : (nome?.[0] || '?')}</span>
      <div><strong>{nome}</strong><small>{member.side === 'player' ? (gangName || t('games.gangues.report.your_gang')) : t('games.gangues.report.enemy_gang')}</small></div>
      <b>{member.pv}/{member.pvMax} PV</b>
    </div>
  )
}

// Tela normal de relatório de batalha (vitória ou derrota) — modal de
// level-up, painel de recompensa, resumo, roster final, ordem de iniciativa
// e log completo. Extraído de GanguesVictory.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2).
export default function GanguesVictoryReport({
  t, store, report, victory, torre, cenaChefe, noModoHistoria, storyAlvo,
  podeRecrutar, recrutar, levelUps, clearLevelUps, rewardSummary, socorro, onNavigate,
}) {
  // Modal bloqueante do marco de reputação (a cada 50, ver
  // GANGUES_REP_MARCO_INTERVALO) — fecha só no clique, nunca sozinho.
  const [repMarcoFechado, setRepMarcoFechado] = useState(false)
  // Teclado (Steam): Enter/Espaço = o que está em destaque na tela.
  const confirmar = () => { const b = document.querySelector('.gang-progression-prompt__confirm, .gang-report-primary'); if (!b) return false; b.click() }
  useGanguesTeclado({ enter: confirmar, espaco: confirmar })
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()
  const xpTipVisto = !carregado || jaViu(XP_TUTORIAL_ID)
  const fecharXpTip = () => marcarVisto(XP_TUTORIAL_ID)
  // Cabeça de quem apanhou de verdade na tela de derrota (pedido do Isaias,
  // 15/09/2026: "usa a cabecinha do derrotado e coloca ele lá, se tiver
  // mais de um pode colocar a galera toda" — futuro banco de "carinhas"
  // tipo emoji, por ora só a derrota mesmo). KO de verdade (pv<=0) primeiro;
  // se a derrota veio de outro jeito (ex: timeout) sem ninguém marcado KO,
  // mostra o time inteiro — a gangue perdeu, não só quem caiu.
  const derrotados = !victory
    ? (() => {
        const caidos = report.combatants.filter(m => m.side === 'player' && m.pv <= 0)
        return caidos.length ? caidos : report.combatants.filter(m => m.side === 'player')
      })()
    : []
  // Volta pra rua (vitória, socorro da derrota ou tentar de novo).
  const seguir = () => { store.setStoryTarget({ territorioId: storyAlvo.territorioId }); onNavigate('territorio') }
  // Rinha infinita: ganhou, a próxima luta vem sozinha (adversário novo, força
  // sorteada, a casa remenda a tropa — ver GanguesRoute). PERDEU com grana, a casa cobrou a recuperação e
  // a roda segue igual (socorro.tipo 'rinha', useGanguesVictoryResolution);
  // perdeu SEM grana, acabou: caminho normal da derrota (birosca).
  const naRinha = Boolean(storyAlvo?.rinha) && noModoHistoria && (victory || socorro?.tipo === 'rinha')
  const proximaRinha = () => { const { rinhaRemendada, ...alvo } = storyAlvo; store.setStoryTarget(avancarRinha(alvo)); onNavigate('story-combat') }
  // Briga automática da cena ligada: "Segue na quebrada" se clica sozinho em
  // 3s (ver useGanguesAvancoAutomatico). A vitória sobre o chefe fica de fora
  // — é o fecho do bairro, com a vaga de recruta pra decidir — e a derrota
  // também (perdeu, o automático desliga e o jogador tem que clicar).
  useGanguesAvancoAutomatico({
    ativo: (victory || naRinha) && Boolean(storyAlvo?.cenaId) && !torre && noModoHistoria && !cenaChefe,
    ms: GANGUES_AVANCO_AUTO_MS.relatorio, acao: naRinha ? proximaRinha : seguir, forcar: naRinha,
  })
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
              return (
                <div key={lu.id} className="gang-levelup-entry">
                  <div className="gang-levelup-entry__head">
                    <span className={`gang-levelup-entry__avatar gang-path--${character?.combat_path}`}>{lu.name?.[0]?.toUpperCase()}</span>
                    <span className="gang-levelup-entry__nome">{lu.name}</span>
                    <span className="gang-levelup-entry__nivel">NV {lu.toLevel}</span>
                  </div>
                  <div className="gang-levelup-entry__eventos">
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
                  {/* Talento novo: o que faz e se vale sempre (passiva) ou se tem que
                      levar pra luta (ativa, máx. 2 na ficha) — Isaias, 30/09/2026. */}
                  {eventos.filter(evento => evento.type === 'unlock_special').map(evento => {
                    const passiva = character?.signature_specials?.find(s => s.id === evento.special_id)?.kind === 'passive'
                    return (
                      <p key={evento.special_id} className="gang-levelup-talento">
                        <b>{t(`games.gangues.progression.skills.${evento.special_id}`)}</b>
                        <em>{t(passiva ? 'games.gangues.levelup.passiva_sempre' : 'games.gangues.levelup.ativa_equipar')}</em>
                        <span>{describeGanguesSpecialEffect(t, evento.special_id, 1)}</span>
                      </p>
                    )
                  })}
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
        {derrotados.length > 0 && (
          <div className="gang-report-derrotados">
            {derrotados.map((member, index) => {
              const retrato = getGanguesPortraitByTemplateId(member.character_template_id)
              const nome = combatantName(t, member)
              return (
                <motion.span
                  key={member.key}
                  className="gang-report-derrotado"
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                >
                  <i><GanguesRetratoImg src={retrato} fallback={nome?.[0]} /></i>
                  <small>{nome}</small>
                </motion.span>
              )
            })}
          </div>
        )}
      </motion.header>

      {/* Derrota na cena — sem game over: a tropa foi arrastada pra birosca e
          a recuperação já foi cobrada (ver socorroDerrota). Mostra o preço. */}
      {!victory && socorro && (
        <section className="gang-reward-panel gang-socorro-panel">
          <span className="gang-reward-panel__kicker">{t(socorro.tipo === 'rinha' ? 'games.gangues.report.socorro_rinha_titulo' : 'games.gangues.report.socorro_titulo')}</span>
          {socorro.perda?.itemId && <p className="gang-socorro-panel__texto">{t('games.gangues.report.perda_item', { item: t(getGanguesItem(socorro.perda.itemId)?.nome || '') })}</p>}
          {socorro.perda?.grana > 0 && <p className="gang-socorro-panel__texto">{t('games.gangues.report.perda_grana', { n: socorro.perda.grana })}</p>}
          <p className="gang-socorro-panel__texto">{t(`games.gangues.report.socorro_${socorro.tipo}`, socorro)}</p>
          {socorro.divida > 0 && (
            <p className="gang-socorro-panel__divida">
              {t('games.gangues.report.socorro_divida', socorro)}
              <small>{t('games.gangues.report.socorro_clube')}</small>
            </p>
          )}
        </section>
      )}

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
                <small className="gang-reward-ap-item__label">{item.ko ? t('games.gangues.report.reward_ap_ko') : item.noTeto ? t('games.gangues.report.reward_ap_teto', { n: item.teto }) : t('games.gangues.report.reward_ap')}</small>
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
          {rewardSummary.drops?.length > 0 && (
            <div className="gang-reward-drops">
              <span className="gang-reward-panel__kicker">{t('games.gangues.drop.titulo')}</span>
              {rewardSummary.drops.map((d, index) => {
                const info = infoDoDrop(t, d)
                return (
                  <motion.div key={`${d.enemyId}-${d.tipo}-${d.id}-${index}`} className={`gang-reward-drop gang-reward-drop--${d.tipo}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 + index * 0.12, type: 'spring', stiffness: 260, damping: 16 }}>
                    <b>{info.icone}</b><strong>{info.nome}</strong><span>{info.tag}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>
      )}
      {/* Marco de reputação cruzado NESSA luta (ex: chegou em 50) — modal
          BLOQUEANTE, não banner solto: nunca silencioso (pedido do Isaias,
          2026-09-14: bateu 66 de rep e não tinha nenhum aviso), e só fecha no
          clique (pedido seguinte, mesmo dia: "tem que esparmar na tela"). */}
      {victory && rewardSummary?.repMarco && !repMarcoFechado && (
        <GanguesRepRecompensaModal t={t} marco={rewardSummary.repMarco} onClose={() => setRepMarcoFechado(true)} />
      )}
      {victory && rewardSummary && !xpTipVisto && (
        <GangTip text={t('games.gangues.xp_tutorial.regra')} side="right" isLast onNext={fecharXpTip} onSkip={fecharXpTip} />
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
        ) : naRinha ? (
          <>
            {podeRecrutar && <button className="gang-report-primary" onClick={recrutar}>{t('games.gangues.report.recrutar')}</button>}
            <button className={podeRecrutar ? 'gang-report-secondary' : 'gang-report-primary'} onClick={proximaRinha}>{t('games.gangues.rinha.proxima')}</button>
            <button className="gang-report-secondary" onClick={seguir}>{t('games.gangues.rinha.sair')}</button>
          </>
        ) : noModoHistoria ? (
          <>
            {podeRecrutar && <button className="gang-report-primary" onClick={recrutar}>{t('games.gangues.report.recrutar')}</button>}
            <button className={podeRecrutar ? 'gang-report-secondary' : 'gang-report-primary'} onClick={seguir}>
              {victory ? t('games.gangues.story.continuar_territorio') : socorro ? t('games.gangues.story.ir_birosca') : t('games.gangues.story.tentar_de_novo')}
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
          {report.combatants.map(member => {
            const retrato = member.side === 'player'
              ? getGanguesPortraitByTemplateId(member.character_template_id)
              : getGanguesEnemyPortraitById(member.id)
            return (
              <ReportMemberRow key={member.key} member={member} retrato={retrato} nome={combatantName(t, member)} gangName={store.gangName} t={t} />
            )
          })}
        </div>
      </section>

      <section className="gang-report-section">
        <h2>{t('games.gangues.report.initiative_order')}</h2>
        <div className="gang-report-initiative">
          {report.initiative.map((item, index) => {
            const member = report.combatants.find(entry => entry.key === item.key)
            return <div key={item.key}><b>{index + 1}</b><span>{combatantName(t, member)}</span><small>{t('games.gangues.attr_labels.H')} {item.ability} + {item.base}</small><strong>{item.total}</strong></div>
          })}
        </div>
      </section>

      <section className="gang-report-section gang-report-section--log">
        <h2>{t('games.gangues.report.complete_log')}</h2>
        <div className="gang-report-log">
          {attacks.map((entry, index) => <article key={entry.id} className={`gang-report-attack gang-report-attack--${entry.side}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{t('games.gangues.report.round_number', { n: entry.round })}</small><strong>{entry.actorName} → {entry.targetName}</strong><p>FA {entry.fa} · FD {entry.fd} · D3 {entry.dice}/{entry.defenseDice}{entry.critical ? ` · 💥 ${t('games.gangues.critico')} +${entry.criticalBonus}` : ''}</p></div><b>−{entry.dmg} PV</b></article>)}
          {!attacks.length && <p className="gang-report-empty">{t('games.gangues.report.no_log')}</p>}
        </div>
      </section>
    </main>
  )
}
