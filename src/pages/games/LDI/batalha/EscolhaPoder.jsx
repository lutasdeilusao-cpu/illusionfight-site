import { PODERES } from './motorPentagrama'

// Barra de poder cheia: o jogo pausa inteiro e você escolhe qual poder soltar.
// Escolheu, aparece a sequência dele no tabuleiro. As opções ficam embaixo, no
// alcance do dedão.
export default function EscolhaPoder({ t, poderes, onEscolher, onDepois }) {
  return (
    <div className="pg-escolha" role="dialog" aria-modal="true">
      <div className="pg-escolha__painel">
        <p className="if-eyebrow">{t('games.ldi.batalha.escolha.pausa')}</p>
        <h2 className="pg-escolha__titulo">{t('games.ldi.batalha.escolha.titulo')}</h2>
        {poderes.map(id => (
          <button key={id} type="button" className={`pg-escolha__poder is-${id}`} onClick={() => onEscolher(id)}>
            <b>{t(`games.ldi.batalha.poderes.${id}`)}</b>
            <small>{t(`games.ldi.batalha.efeitos.${PODERES[id].efeito}`)}</small>
            <small>{t('games.ldi.batalha.escolha.detalhe', { dano: PODERES[id].dano, n: PODERES[id].golpes })}</small>
          </button>
        ))}
        <button type="button" className="pg-escolha__depois" onClick={onDepois}>{t('games.ldi.batalha.escolha.depois')}</button>
      </div>
    </div>
  )
}
