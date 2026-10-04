import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { sfx } from '../../../../../lib/sfx'
import { getGanguesAnimacao, tocarSomCombate } from '../../data/ganguesCombatAnimations.js'
import { fighterName } from '../../engine/ganguesCombatPresentation.js'
import GanguesCombatSpriteAnim from '../GanguesCombatSpriteAnim.jsx'
import { montarGolpe, rostoDe } from './golpeConta.js'
import './GanguesGolpe.css'

const GanguesDado3D = lazy(() => import('./GanguesDado3D.jsx'))

/* O momento do golpe: painel embaixo da tela com quem bate em quem, os dois
   dados (3D), a conta inteira, o dano e cada efeito que entrou com o rosto do
   dono. Gira → revela → fecha sozinho (onComplete). Com sprite do golpe, a
   revelação cai no último quadro da animação. Em 2x/3x fica sem sprite e mais rápido. */
function Rosto({ c, t }) {
  const src = rostoDe(c)
  return src ? <img className="golpe-rosto" src={src} alt="" /> : <span className="golpe-rosto golpe-rosto--letra">{(fighterName(t, c) || '?')[0]}</span>
}

function Conta({ parcelas, total, lado }) {
  return (
    <div className={`golpe-conta golpe-conta--${lado}`}>
      <span className="golpe-conta__parcelas">
        {parcelas.map((p, i) => (
          <span key={i} className={p.dado ? 'is-dado' : ''}>{i > 0 && (p.v < 0 ? ' − ' : ' + ')}<b>{Math.abs(p.v)}</b><small>{p.rotulo}</small></span>
        ))}
      </span>
      <strong className="golpe-conta__total">{total}</strong>
    </div>
  )
}

export default function GanguesGolpe({ result, atacante, alvo, side, velocidade = 1, onComplete }) {
  const { t } = useLanguage()
  const g = montarGolpe({ t, result, atacante, alvo })
  const anim = velocidade > 1 ? null : side === 'player'
    ? (!result.activeSpecialId ? getGanguesAnimacao(atacante?.character_template_id, 'ataqueNormal') : null)
    : getGanguesAnimacao(alvo?.character_template_id, 'dano')
  const [fase, setFase] = useState('rolando')

  // Giro: com sprite, termina junto do último quadro; sem sprite, curto.
  useEffect(() => {
    const giro = (anim ? anim.frames * anim.frameMs : g.critico ? 1300 : 950) / velocidade
    const tique = setInterval(() => sfx.diceTick(), 140)
    const fim = setTimeout(() => { clearInterval(tique); sfx.diceLand(); setFase('revelado') }, giro)
    return () => { clearInterval(tique); clearTimeout(fim) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Revelado: tempo de ler (mais se tiver efeito) e fecha.
  useEffect(() => {
    if (fase !== 'revelado') return
    const leitura = (1300 + Math.min(3, g.efeitos.length) * 350 + (g.critico ? 300 : 0)) / velocidade
    const id = setTimeout(() => onComplete?.(), leitura)
    return () => clearTimeout(id)
  }, [fase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sons da animação do personagem (voz/ambiente no começo, golpes no quadro certo).
  useEffect(() => {
    if (!anim || !sfx.enabled) return
    if (anim.sons.ambiente) tocarSomCombate(anim.sons.ambiente, 0.6)
    if (anim.sons.voz) tocarSomCombate(anim.sons.voz, 0.8)
    const timers = (anim.sons.golpes || []).map(({ frame, arquivo }) => setTimeout(() => tocarSomCombate(arquivo, 0.85), (frame - 1) * anim.frameMs))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const revelado = fase === 'revelado'
  const pct = v => `${Math.round((v / g.pvMax) * 100)}%`

  return (
    <motion.div className={`golpe golpe--${side}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      {anim && (
        <GanguesCombatSpriteAnim sheet={anim.sheet} cols={anim.cols} rows={anim.rows} frames={anim.frames} frameMs={anim.frameMs} frameW={anim.frameW} frameH={anim.frameH} className="golpe-sprite" />
      )}
      <motion.section className={`golpe-painel${g.critico && revelado ? ' is-critico' : ''}`} initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.22 }}>
        <header className="golpe-quem">
          <span className="golpe-quem__lado"><Rosto c={atacante} t={t} /><b>{fighterName(t, atacante)}</b></span>
          <span className="golpe-quem__seta">➜</span>
          <span className="golpe-quem__lado golpe-quem__lado--alvo"><b>{fighterName(t, alvo)}</b><Rosto c={alvo} t={t} /></span>
        </header>

        <div className="golpe-dados">
          <span className="golpe-dados__rotulo">{t('games.gangues.golpe.ataque')}</span>
          <Suspense fallback={<div className="golpe-dado3d" />}>
            <GanguesDado3D ataque={result.rolls.fa} defesa={result.rolls.fd} rolando={!revelado} critico={g.critico} />
          </Suspense>
          <span className="golpe-dados__rotulo golpe-dados__rotulo--def">{t('games.gangues.golpe.defesa')}</span>
        </div>

        {revelado && (
          <motion.div className="golpe-resultado" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="golpe-contas">
              <Conta parcelas={g.ataque} total={g.fa} lado="ataque" />
              <Conta parcelas={g.defesa} total={g.fd} lado="defesa" />
            </div>
            <p className={`golpe-dano${g.dano === 0 ? ' is-zero' : ''}`}>
              {g.critico && <em>{t('games.gangues.golpe.critico')}! </em>}
              {g.bloqueio ? t('games.gangues.golpe.bloqueado') : g.dano > 0 ? t('games.gangues.golpe.dano', { n: g.dano }) : t('games.gangues.golpe.sem_dano')}
            </p>
            <div className="golpe-pv" aria-label={`${g.pvDepois}/${g.pvMax}`}>
              <span className="golpe-pv__barra"><i className="golpe-pv__perdido" style={{ '--pv': pct(g.pvAntes) }} /><i className="golpe-pv__resta" style={{ '--pv': pct(g.pvDepois) }} /></span>
              <small>{t('games.gangues.golpe.pv', { nome: fighterName(t, alvo), de: g.pvAntes, para: g.pvDepois })}</small>
            </div>
            {g.efeitos.length > 0 && (
              <ul className="golpe-efeitos">
                {g.efeitos.map((e, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                    <Rosto c={e.dono} t={t} />
                    <span className="golpe-efeitos__icone">{e.icone}</span>
                    <span className="golpe-efeitos__texto"><b>{e.nome}</b>{e.desc && <small>{e.desc}</small>}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  )
}
