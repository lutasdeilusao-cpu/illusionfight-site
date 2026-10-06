import { useEffect, useState } from 'react'
import { PODERES } from './motorPentagrama'

// SUPER com mais de um poder no kit: o jogo pausa e você escolhe qual soltar.
// Escolheu, aparece a sequência dele no tabuleiro. As opções ficam embaixo, no
// alcance do dedão, e só aceitam toque depois de TRAVA_MS — um toque que já
// vinha do tabuleiro não escolhe nada sem querer. Voltar só fecha a pausa: a
// bolinha ⚡ continua pronta pra abrir de novo.
const TRAVA_MS = 450

export default function EscolhaPoder({ t, poderes, onEscolher, onVoltar }) {
  const [pronto, setPronto] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setPronto(true), TRAVA_MS)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="pg-escolha" role="dialog" aria-modal="true">
      <div className="pg-escolha__painel">
        <p className="if-eyebrow">{t('games.ldi.batalha.escolha.pausa')}</p>
        <h2 className="pg-escolha__titulo">{t('games.ldi.batalha.escolha.titulo')}</h2>
        {poderes.map(id => (
          <button key={id} type="button" disabled={!pronto} className={`pg-escolha__poder is-${id}`} onClick={() => onEscolher(id)}>
            <b>{t(`games.ldi.batalha.poderes.${id}`)}</b>
            <small>{t(`games.ldi.batalha.efeitos.${PODERES[id].efeito}`)}</small>
            <small>{t('games.ldi.batalha.escolha.detalhe', { dano: PODERES[id].dano, n: PODERES[id].golpes })}</small>
          </button>
        ))}
        <button type="button" disabled={!pronto} className="pg-escolha__voltar" onClick={onVoltar}>{t('games.ldi.batalha.escolha.voltar')}</button>
      </div>
    </div>
  )
}
