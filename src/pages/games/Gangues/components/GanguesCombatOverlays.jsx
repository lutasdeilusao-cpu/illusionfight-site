import { AnimatePresence, motion } from 'framer-motion'
import { getGanguesEffectTheme } from '../data/ganguesEffectThemes.js'
import { getGanguesProgression, ganguesXpMaxForSheet } from '../data/ganguesLoadout.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'
import DramaticDice from './DramaticDice'
import GanguesFichaCard from './GanguesFichaCard'

// Todos os overlays mutuamente exclusivos do combate: aviso curto, callout
// grande de dano, cartão de KO, dado dramático, revelação de rodada da
// Multidão, modal de ficha, fala final de quem perdeu, e a tela de
// resultado. Ficam juntos num arquivo só (em vez de 1 componente por
// overlay) porque compartilham muito estado e são exclusivos entre si — ver
// PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6.
export default function GanguesCombatOverlays({
  t, aviso, danoCena, koCena, dispararProximoKo, machine, modoMultidaoAtivo,
  revelandoRodada, fichaAberta, setFichaAberta, falaFinal, result, showResultBtn,
  openBattleReport, enemy,
}) {
  return (
    <>
      <AnimatePresence>
        {aviso && (
          <motion.div className="gang-combat-aviso" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {aviso}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {danoCena && !koCena && (
          <motion.div
            key={danoCena.id}
            className={`gang-dano-cena gang-dano-cena--${danoCena.cura ? 'cura' : danoCena.side === 'player' ? 'aliado' : 'inimigo'}${danoCena.critico ? ' gang-dano-cena--crit' : ''}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.i className="gang-dano-cena__faixa" aria-hidden="true"
              initial={{ scaleX: 0, opacity: 0.9 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }} />
            <motion.div className="gang-dano-cena__txt"
              initial={{ scale: 0.7, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: -8 }}
              transition={{ type: 'spring', stiffness: 340, damping: 16 }}>
              {danoCena.critico && <span className="gang-dano-cena__tag">{t('games.gangues.critico')}</span>}
              <strong className="gang-dano-cena__nome">{danoCena.alvoNome}</strong>
              <span className="gang-dano-cena__valor">
                {danoCena.cura ? `+${danoCena.valor}` : danoCena.valor > 0 ? `−${danoCena.valor}` : '🛡'}
              </span>
              <span className="gang-dano-cena__rot">
                {danoCena.cura
                  ? t('games.gangues.dano_cena_cura', { nome: danoCena.atacanteNome })
                  : danoCena.valor > 0
                    ? t('games.gangues.dano_cena_dano', { nome: danoCena.atacanteNome })
                    : t('games.gangues.dano_cena_guarda', { n: danoCena.escudo })}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {koCena && (
          <motion.div
            className={`gang-ko-cena gang-ko-cena--${koCena.side === 'enemy' ? 'inimigo' : 'aliado'}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dispararProximoKo()}
          >
            <motion.div
              className="gang-ko-cena__card"
              initial={{ scale: 0.65, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 17 }}
            >
              <motion.span
                className="gang-ko-cena__skull"
                initial={{ rotate: -18, scale: 0.8 }} animate={{ rotate: [-18, 12, -6, 0], scale: 1 }} transition={{ duration: 0.5 }}
              >💀</motion.span>
              <strong className="gang-ko-cena__nome">{koCena.nome}</strong>
              <span className="gang-ko-cena__label">{t(koCena.side === 'enemy' ? 'games.gangues.ko_cena.inimigo' : 'games.gangues.ko_cena.aliado')}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {machine.pending && !modoMultidaoAtivo && (
          <DramaticDice
            key={`${machine.pending.actorKey}-${machine.round}`}
            finalValue={machine.pending.result.rolls.fa}
            sides={3}
            side={machine.pending.side}
            attackerName={fighterName(t, machine.combatants.find(item => item.key === machine.pending.actorKey))}
            targetName={fighterName(t, machine.combatants.find(item => item.key === machine.pending.targetKey))}
            powerName={machine.pending.result.activeSpecialId ? t(`games.gangues.progression.skills.${machine.pending.result.activeSpecialId}`) : null}
            theme={getGanguesEffectTheme(machine.pending.result.activeSpecialId)}
            onComplete={machine.completePending}
          />
        )}
        {revelandoRodada && (
          <div className="gang-multidao-revela gang-multidao-revela--overlay">
            <div className="gang-multidao-dados">
              {Array.from({ length: 6 }, (_, i) => <span key={i} className="gang-multidao-dado" style={{ '--delay': `${i * 0.07}s` }}>🎲</span>)}
            </div>
            <p className="gang-multidao-revela-texto">{t('games.gangues.multidao.resolvendo')}</p>
          </div>
        )}
        {fichaAberta && (
          <motion.div className="gang-ficha-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFichaAberta(null)}>
            <motion.div
              className="gang-ficha-modal-card"
              initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
              onClick={e => e.stopPropagation()}
            >
              <span className="gang-ficha-modal-kicker">{t('games.gangues.ficha_dossie')}</span>
              <GanguesFichaCard
                nome={fighterName(t, fichaAberta)}
                caminho={fichaAberta.combat_path}
                nivel={fichaAberta.side !== 'enemy' ? fichaAberta.level : null}
                atributos={fichaAberta.attributes || fichaAberta.stats}
                pv={{ atual: fichaAberta.pv || 0, max: fichaAberta.pvMax || 1 }}
                pm={{ atual: fichaAberta.pm || 0, max: fichaAberta.pmMax || 0 }}
                xp={fichaAberta.side !== 'enemy' ? (() => {
                  const progression = getGanguesProgression(fichaAberta)
                  return { atual: progression.ap, max: ganguesXpMaxForSheet(fichaAberta), disponivel: progression.xp_unspent }
                })() : null}
              />
              <button className="gang-modo-fugir" onClick={() => setFichaAberta(null)}>{t('games.gangues.ficha_fechar')}</button>
            </motion.div>
          </motion.div>
        )}
        {falaFinal && (
          <motion.div
            className={`gang-fala-final gang-fala-final--${falaFinal.outcome}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="gang-fala-final-bg" />
            <motion.div
              className="gang-fala-final-card"
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <span className="gang-fala-final-avatar">{falaFinal.nome[0]}</span>
              <span className="gang-fala-final-nome">{falaFinal.nome}</span>
              {falaFinal.outcome === 'victory' && (
                <span className="gang-fala-final-selo">{t('games.gangues.beat.derrotado')}</span>
              )}
              <p className="gang-fala-final-texto">“{falaFinal.texto}”</p>
            </motion.div>
          </motion.div>
        )}
        {result && !falaFinal && (
          <motion.div className="gang-match-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="gang-match-result-bg" />
            <div className="gang-match-result-content">
              <motion.div
                className={`gang-match-result-icon gang-match-result-icon--${result === 'victory' ? 'win' : 'lose'}`}
                initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              >
                {result === 'victory' ? '🏆' : '💀'}
              </motion.div>
              <motion.h1
                className={`gang-match-result-title gang-match-result-title--${result === 'victory' ? 'win' : 'lose'}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
              >
                {t(`games.gangues.${result === 'victory' ? 'vitoria' : 'derrota'}`)}
              </motion.h1>
              {result === 'victory' ? (
                <motion.p className="gang-match-result-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                  dangerouslySetInnerHTML={{ __html: t('games.gangues.vitoria_sub', { name: fighterName(t, enemy && { ...enemy, side: 'enemy' }) }) }} />
              ) : (
                <motion.p className="gang-match-result-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                  {t('games.gangues.derrota_sub')}
                </motion.p>
              )}
              {showResultBtn && (
                <motion.button
                  className="gang-match-result-btn" onClick={openBattleReport}
                  initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  {t('games.gangues.btn_proximo')}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
