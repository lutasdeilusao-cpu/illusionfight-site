// Cartão do quadro, no jeito do Jira: código, título, selos e a ação principal embaixo, no dedão.
import { acaoDe, atrasada, chave, iniciais, revisorDe } from './tarefasFluxo'

export function Avatar({ pessoa, pequeno }) {
  if (!pessoa) return <span className={`tq-avatar is-vazio${pequeno ? ' is-pequeno' : ''}`} aria-hidden="true">·</span>
  return (
    <span className={`tq-avatar is-cor${pessoa.cor}${pequeno ? ' is-pequeno' : ''}`} title={pessoa.nome} aria-label={pessoa.nome}>
      {iniciais(pessoa.nome)}
    </span>
  )
}

export default function TarefaCartao({ x, eu, pessoa, t, data, onAbrir, onAcao }) {
  const acao = acaoDe(x, eu)
  const tarde = atrasada(x)
  const rev = revisorDe(x)
  return (
    <li className={`tq-cartao is-${x.prioridade}${tarde ? ' is-atrasada' : ''}`}>
      <button type="button" className="tq-cartao__corpo" onClick={() => onAbrir(x)}>
        <span className="tq-cartao__topo">
          <span className="tq-chave">{chave(x)}</span>
          {x.prioridade !== 'normal' && <span className={`tq-prio is-${x.prioridade}`}>{t(`painel.tarefas.prio.${x.prioridade}`)}</span>}
        </span>
        <strong className="tq-cartao__titulo">{x.titulo}</strong>
        {x.descricao && <span className="tq-cartao__desc">{x.descricao}</span>}
        <span className="tq-cartao__base">
          {x.prazo && <span className={`tq-selo${tarde ? ' is-perigo' : ''}`}>◷ {data(x.prazo)}</span>}
          {x.comentarios > 0 && <span className="tq-selo">💬 {x.comentarios}</span>}
          {x.link && <span className="tq-selo">↗</span>}
          <span className="tq-cartao__pessoas">
            <Avatar pessoa={pessoa(x.para)} />
            {x.status === 'teste' && rev && <><i aria-hidden="true">→</i><Avatar pessoa={pessoa(rev)} pequeno /></>}
          </span>
        </span>
      </button>
      {acao && (
        <div className="tq-cartao__acoes">
          {acao.reprovar && (
            <button type="button" className="tq-acao is-perigo" onClick={() => onAcao(x, acao.reprovar)}>{t(`painel.tarefas.acao.${acao.reprovar.rotulo}`)}</button>
          )}
          <button type="button" className={`tq-acao${acao.bloqueada ? ' is-espera' : ' is-primaria'}`} disabled={acao.bloqueada}
            onClick={() => onAcao(x, acao)}>
            {acao.bloqueada ? t('painel.tarefas.acao.aguardando', { n: pessoa(rev)?.curto || '—' }) : t(`painel.tarefas.acao.${acao.rotulo}`)}
          </button>
        </div>
      )}
    </li>
  )
}
