import { useState } from 'react'
import { motion } from 'framer-motion'
import { getGanguesPortraitByTemplateId } from '../data/ganguesPortraits.js'
import { combatantName } from '../engine/ganguesVictoryResolver.js'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import GangTip from '../components/GangTip'
import GanguesRepRecompensaModal from '../components/GanguesRepRecompensaModal'
import GanguesRetratoImg from '../components/GanguesRetratoImg'
import LevelUpModal from '../components/resultado/LevelUpModal'
import ResultadoRecompensa from '../components/resultado/ResultadoRecompensa'
import ResultadoDestaques from '../components/resultado/ResultadoDestaques'
import ResultadoDetalhes from '../components/resultado/ResultadoDetalhes'
import { useGanguesAvancoAutomatico, GANGUES_AVANCO_AUTO_MS } from '../hooks/useGanguesBrigaAutomatica.js'
import { getGanguesItem } from '../data/ganguesItens.js'
import { avancarRinha } from '../data/cenas/cenaHelpers.js'
import useGanguesTeclado from '../hooks/useGanguesTeclado'
import '../components/resultado/resultado.css'

// Tutorial de como o AP é dividido: aparece na 1ª vitória (por conta).
const XP_TUTORIAL_ID = 'xp_v2'

// Tela de resultado da luta, de cima pra baixo por importância: vitória ou
// derrota, o socorro (derrota na cena), o que a gangue ganhou, os destaques e
// os detalhes (fechados). Os botões ficam presos embaixo.
export default function GanguesVictoryReport({
  t, store, report, victory, torre, cenaChefe, noModoHistoria, storyAlvo,
  podeRecrutar, recrutar, levelUps, clearLevelUps, rewardSummary, socorro, onNavigate,
}) {
  // Modal do marco de reputação: fecha só no clique.
  const [repMarcoFechado, setRepMarcoFechado] = useState(false)
  // Teclado (Steam): Enter/Espaço = o que está em destaque na tela.
  const confirmar = () => { const b = document.querySelector('.gang-progression-prompt__confirm, .gang-report-primary'); if (!b) return false; b.click() }
  useGanguesTeclado({ enter: confirmar, espaco: confirmar })
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()
  const xpTipVisto = !carregado || jaViu(XP_TUTORIAL_ID)
  const fecharXpTip = () => marcarVisto(XP_TUTORIAL_ID)
  // Na derrota: quem caiu (ou o time inteiro, se ninguém ficou marcado KO).
  const derrotados = !victory
    ? (() => {
        const caidos = report.combatants.filter(m => m.side === 'player' && m.pv <= 0)
        return caidos.length ? caidos : report.combatants.filter(m => m.side === 'player')
      })()
    : []
  // Volta pra rua (vitória, socorro da derrota ou tentar de novo).
  const seguir = () => { store.setStoryTarget({ territorioId: storyAlvo.territorioId }); onNavigate('territorio') }
  // Rinha: ganhou (ou perdeu com grana, já remendado), a próxima luta vem em seguida.
  const naRinha = Boolean(storyAlvo?.rinha) && noModoHistoria && (victory || socorro?.tipo === 'rinha')
  const proximaRinha = () => { const { rinhaRemendada, ...alvo } = storyAlvo; store.setStoryTarget(avancarRinha(alvo)); onNavigate('story-combat') }
  // Briga automática ligada: segue sozinho em 3s (menos no chefe e na derrota).
  useGanguesAvancoAutomatico({
    ativo: (victory || naRinha) && Boolean(storyAlvo?.cenaId) && !torre && noModoHistoria && !cenaChefe,
    ms: GANGUES_AVANCO_AUTO_MS.relatorio, acao: naRinha ? proximaRinha : seguir, forcar: naRinha,
  })

  return (
    <main className={`gang-report gang-report--${victory ? 'victory' : 'defeat'} resultado`}>
      {levelUps.length > 0 && <LevelUpModal t={t} levelUps={levelUps} onClose={clearLevelUps} />}
      <motion.header className="gang-report-hero resultado-topo" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
        <span className="resultado-topo__selo">{t(victory ? 'games.gangues.resultado.vitoria' : 'games.gangues.resultado.derrota')}</span>
        <motion.h1 className="resultado-topo__nome" initial={{ scale: 0.85, rotate: -4 }} animate={{ scale: 1, rotate: -2 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
          {store.gangName || t('games.gangues.report.your_gang')}
        </motion.h1>
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

      {/* Derrota na cena: a tropa acordou na birosca e a recuperação foi cobrada. */}
      {!victory && socorro && (
        <section className="resultado-bloco resultado-socorro">
          <h2 className="resultado-titulo">{t(socorro.tipo === 'rinha' ? 'games.gangues.report.socorro_rinha_titulo' : 'games.gangues.report.socorro_titulo')}</h2>
          {socorro.perda?.itens?.length > 0 && <p className="resultado-socorro__texto">{t('games.gangues.report.perda_item', { quem: t(`games.gangues.cena.aleatorio.${socorro.perda.quem}.nome`), itens: Object.entries(socorro.perda.itens.reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {})).map(([id, n]) => `${t(getGanguesItem(id)?.nome || '')}${n > 1 ? ` ×${n}` : ''}`).join(', ') })}</p>}
          {socorro.perda?.grana > 0 && <p className="resultado-socorro__texto">{t('games.gangues.report.perda_grana', { quem: t(`games.gangues.cena.aleatorio.${socorro.perda.quem}.nome`), n: socorro.perda.grana })}</p>}
          <p className="resultado-socorro__texto">{t(`games.gangues.report.socorro_${socorro.tipo}`, socorro)}</p>
          {socorro.divida > 0 && (
            <p className="resultado-socorro__divida">
              {t('games.gangues.report.socorro_divida', socorro)}
              <small>{t('games.gangues.report.socorro_clube')}</small>
            </p>
          )}
        </section>
      )}

      {victory && rewardSummary && <ResultadoRecompensa t={t} rewardSummary={rewardSummary} roster={store.roster} />}
      {/* Marco de reputação cruzado nesta luta. */}
      {victory && rewardSummary?.repMarco && !repMarcoFechado && (
        <GanguesRepRecompensaModal t={t} marco={rewardSummary.repMarco} onClose={() => setRepMarcoFechado(true)} />
      )}
      {victory && rewardSummary && !xpTipVisto && (
        <GangTip text={t('games.gangues.xp_tutorial.regra')} side="right" isLast onNext={fecharXpTip} onSkip={fecharXpTip} />
      )}

      <ResultadoDestaques t={t} report={report} />
      <ResultadoDetalhes t={t} report={report} />

      <footer className="resultado-acoes">
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
    </main>
  )
}
