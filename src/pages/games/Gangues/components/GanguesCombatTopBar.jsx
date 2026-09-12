import { AnimatePresence, motion } from 'framer-motion'
import GanguesMultidaoTutorial from './GanguesMultidaoTutorial'

// Barra superior do combate: botão de sair, rodada/vez, switch da Briga em
// Multidão, e o toggle de provocação (trash talk do jogador).
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
export default function GanguesCombatTopBar({
  t, onNavigate, machine, modoMultidaoAtivo, estadoMultidao, result,
  multidaoDisponivel, modoMultidaoOn, setModoMultidaoOn, switchTravado,
  multidaoBlinkVisto, marcarBlinkVisto,
  trashOptions, trashAberto, setTrashAberto, sendPlayerTrash,
}) {
  return (
    <div className="gang-vs-bar">
      {/* Sair do combate no meio da luta = fugir (nenhuma recompensa, volta
          direto pra quebrada) — usa o rótulo FUGIR (não SAIR), já traduzido
          nos 3 idiomas, pra deixar claro que é isso que o botão faz. */}
      <button className="gang-vs-bar-back" onClick={() => onNavigate('territorio')}>{t('games.gangues.btn_fugir')}</button>
      <div className="gang-vs-bar-line" />
      <span className={`gang-vs-bar-turn ${machine.phase === 'player' ? 'gang-vs-bar-turn--player' : machine.phase === 'enemy' ? 'gang-vs-bar-turn--enemy' : ''}`}>
        {t('games.gangues.loadout.round', { n: modoMultidaoAtivo ? (estadoMultidao?.round || 1) : machine.round })}
        {!modoMultidaoAtivo && (machine.phase === 'player' || machine.phase === 'enemy') && (
          <><i className="gang-vs-bar-turn-dot" />{t(machine.phase === 'player' ? 'games.gangues.combat_specials.sua_vez' : 'games.gangues.combat_specials.vez_inimiga')}</>
        )}
      </span>
      <div className="gang-vs-bar-line" />
      {multidaoDisponivel && (
        <button
          type="button"
          className={`gang-multidao-switch ${modoMultidaoOn ? 'gang-multidao-switch--on' : ''} ${!multidaoBlinkVisto && !modoMultidaoOn ? 'gang-multidao-switch--blink' : ''}`}
          disabled={switchTravado}
          title={t('games.gangues.multidao.switch_titulo')}
          onClick={() => { setModoMultidaoOn(!modoMultidaoOn); if (!multidaoBlinkVisto) marcarBlinkVisto() }}
        >
          <span className="gang-multidao-switch-track"><span className="gang-multidao-switch-bolinha" /></span>
          <small>{t('games.gangues.multidao.switch_label')}</small>
        </button>
      )}
      {multidaoDisponivel && <GanguesMultidaoTutorial />}
      {/* Modo automático saiu da barra do topo pro menu da bolinha de ação
          (pedido do Isaias) — ver <GanguesActionOrb autoOn ... />. */}
      {!modoMultidaoAtivo && machine.phase === 'player' && !result && trashOptions.length >= 3 && (
        <div className="gang-trash-toggle-wrap">
          <button type="button" className="gang-trash-toggle" onClick={() => setTrashAberto(v => !v)} aria-label={t('games.gangues.combat_specials.provocar')}>💬</button>
          <AnimatePresence>
            {trashAberto && (
              <motion.div className="gang-trash-pop" initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}>
                {trashOptions.map((phrase, i) => (
                  <button key={phrase + i} className="gang-trash-pop-btn" onClick={() => sendPlayerTrash(phrase)}>{phrase}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
