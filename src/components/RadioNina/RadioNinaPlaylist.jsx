import { useState } from 'react'

export default function RadioNinaPlaylist({
  pool, faixaAtualKey, playlistSalva, logado, S, cor, cores, posicao,
  onCor, onTocar, onTocarMinha, onSalvar, onFechar,
}) {
  const [marcadas, setMarcadas] = useState(() => new Set(playlistSalva))
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const alternarMarca = (key) => {
    setMarcadas((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
    setSalvo(false)
  }

  const salvar = async () => {
    setSalvando(true)
    const ok = await onSalvar([...marcadas])
    setSalvando(false)
    if (ok) setSalvo(true)
  }

  return (
    <div className={`radio-nina-lista radio-nina-lista--${posicao === 'top' ? 'top' : 'bottom'}`} style={{ '--radio-cor': cor }}>
      <div className="radio-nina-lista__topo">
        <span className="radio-nina-lista__titulo">{S.playlist}</span>
        <button className="radio-nina-lista__x" onClick={onFechar} aria-label={S.minimizar}>×</button>
      </div>

      <div className="radio-nina-lista__cores" role="group" aria-label={S.cor}>
        {cores.map((c) => (
          <button
            key={c}
            className={`radio-nina-lista__cor ${c === cor ? 'radio-nina-lista__cor--ativa' : ''}`}
            style={{ background: c }}
            onClick={() => onCor(c)}
            aria-label={c}
          />
        ))}
      </div>

      {logado && playlistSalva.length > 0 && (
        <button className="radio-nina-lista__minha" onClick={onTocarMinha}>
          ▶ {S.tocar_minha} ({playlistSalva.length})
        </button>
      )}

      <ul className="radio-nina-lista__itens">
        {pool.map((t) => (
          <li
            key={t.key}
            className={`radio-nina-lista__item ${t.key === faixaAtualKey ? 'radio-nina-lista__item--atual' : ''}`}
          >
            {logado && (
              <input
                type="checkbox"
                className="radio-nina-lista__check"
                checked={marcadas.has(t.key)}
                onChange={() => alternarMarca(t.key)}
                aria-label={marcadas.has(t.key) ? S.remover : S.adicionar}
              />
            )}
            <button className="radio-nina-lista__nome" onClick={() => onTocar(t.key)}>
              {t.key === faixaAtualKey ? '♪ ' : ''}{t.titulo}
            </button>
          </li>
        ))}
      </ul>

      {logado ? (
        <div className="radio-nina-lista__rodape">
          <button className="radio-nina-lista__salvar" onClick={salvar} disabled={salvando}>
            {salvo ? S.salvo : S.salvar}
          </button>
          <span className="radio-nina-lista__dica">
            {marcadas.size === 0 ? S.vazia : `${S.minha_playlist}: ${marcadas.size}`}
          </span>
        </div>
      ) : (
        <p className="radio-nina-lista__rodape radio-nina-lista__dica">{S.entre_para_salvar}</p>
      )}
    </div>
  )
}
