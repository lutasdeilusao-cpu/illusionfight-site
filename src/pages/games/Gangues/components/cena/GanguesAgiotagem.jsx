import { useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import GanguesDialogoEncontro from './GanguesDialogoEncontro'

/* Componente REUTILIZÁVEL e DESACOPLADO do sistema de agiotagem (pedido do
   Isaias, 21/09/2026: "cria um componente reutilizável desacoplado desse
   sistema"). Qualquer NPC de qualquer território que precise oferecer
   empréstimo/fiado monta este componente (com o próprio retrato/nome/
   custoBase/onClube) sem duplicar a escada de dívida nem as 3 telas de
   resultado — hoje só o Nato da Pista usa (GanguesDescanso.jsx), mas nada
   aqui é específico dele.

   A REGRA do sistema (quanto empresta, quanto dobra, o teto, o gate do
   chefe) mora inteiramente no store — `agiotagemInfo`/`pedirEmprestimoNato`/
   `fiarDescanso` em ganguesBiroscaSlice.js, 100% NPC-agnóstica (só lê/grava
   `storyProgress.__birosca`). Este componente só cuida da UI: as 3 telas de
   resultado (empréstimo, cura fiada, socorro forçado) e a info/ações que
   quem usa precisa pra montar os PRÓPRIOS botões junto com os que não são
   de agiotagem (ex. "descansar").

   Contrato de uso: se há um resultado pendente (empréstimo aceito, cura
   fiada aceita, ou o socorro do teto), este componente se renderiza sozinho
   (substitui a tela normal). Caso contrário, chama
   `children({ agio, pedirEmprestimo, pedirCuraFiada, pedirSocorro })` — quem
   usa monta seu próprio diálogo/escolhas com essas peças. Falha (motivo)
   volta no retorno de `pedirEmprestimo`/`pedirCuraFiada` pra quem chama
   decidir a mensagem de erro; sucesso já vira a tela de resultado sozinho. */
export default function GanguesAgiotagem({ retrato, nome, fecharLabel, onClose, custoBase = 10, onClube, comAnimacao, renderDetalheCura, children }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [emprestimo, setEmprestimo] = useState(null)     // resultado do empréstimo em dinheiro
  const [contrato, setContrato] = useState(null)         // resultado da cura fiada (dívida dobrou)
  const [socorroPendente, setSocorroPendente] = useState(false) // teto — Nato remenda de graça e joga pro Clube

  const agio = store.agiotagemInfo()

  const pedirEmprestimo = () => {
    const r = store.pedirEmprestimoNato()
    if (r.ok) setEmprestimo(r)
    return r
  }
  const pedirCuraFiada = () => {
    const r = store.fiarDescanso()
    if (r.ok) comAnimacao(() => setContrato(r))
    return r
  }
  const pedirSocorro = () => setSocorroPendente(true)

  // ── Teto da escada: o Nato não cobra mais nada, cura de graça, mas joga
  // direto pro Clube da Luta — sem a escolha normal de aceitar/recusar
  // (quem chama passa `onClube(custoBase, true)` como entrada forçada).
  if (socorroPendente) {
    return (
      <GanguesDialogoEncontro
        retrato={retrato} nome={nome} sub={t('games.gangues.cena.nato_socorro_tag')}
        falas={[t('games.gangues.cena.nato_socorro_fala')]}
        escolhas={[{ id: 'seguir', label: t('games.gangues.cena.nato_socorro_seguir'), variante: 'go', onClick: () => onClube(custoBase, true) }]}
        onClose={onClose} fecharLabel={fecharLabel}
      />
    )
  }
  // ── Contrato do empréstimo em dinheiro ──
  if (emprestimo) {
    return (
      <GanguesDialogoEncontro
        retrato={retrato} nome={nome} sub={t('games.gangues.cena.emprestimo_contrato_tag')}
        falas={[t('games.gangues.cena.emprestimo_contrato', { valor: emprestimo.valor, divida: emprestimo.divida })]}
        escolhas={[{ id: 'fechar', label: fecharLabel, variante: 'go', onClick: onClose }]}
        onClose={onClose} fecharLabel={fecharLabel}
      />
    )
  }
  // ── Contrato da cura fiada (dívida dobrou) ──
  if (contrato) {
    return (
      <GanguesDialogoEncontro
        retrato={retrato} nome={nome} sub={t('games.gangues.cena.fiado_contrato_tag')}
        falas={[t('games.gangues.cena.fiado_contrato_cura', { divida: contrato.divida })]}
        escolhas={[{ id: 'fechar', label: fecharLabel, variante: 'go', onClick: onClose }]}
        onClose={onClose} fecharLabel={fecharLabel}
      >
        {renderDetalheCura?.(contrato.detalhe)}
      </GanguesDialogoEncontro>
    )
  }

  return children({ agio, pedirEmprestimo, pedirCuraFiada, pedirSocorro })
}
