// ══════════════════════════════════════════
//  CARD DEFINITIONS — Kernel Panic
//  Extraídas de kernel-panic.html (L1159-L1201)
//  SEM ALTERAÇÃO de valores ou textos
// ══════════════════════════════════════════

export function buildAttrCards() {
  const attrs = [
    { attr: 'precisao',   label: 'Mira Ocular',    kind: 'atk' },
    { attr: 'visao',      label: 'Scan',            kind: 'atk' },
    { attr: 'protecao',   label: 'Blindagem',       kind: 'def' },
    { attr: 'camuflagem', label: 'Sinal Fantasma',  kind: 'def' },
  ]
  const cards = []
  attrs.forEach(a => {
    ;[1, 2, 3].forEach(v => {
      for (let i = 0; i < 5; i++) cards.push({
        id: `${a.attr}_${v}_${i}`,
        type: 'attr', kind: a.kind,
        attr: a.attr, label: a.label,
        name: `${a.label} +${v}`,
        bonus: v, desc: '',
      })
    })
  })
  return cards
}

export const EFFECT_CARDS = [
  { type: 'efx', kind: 'efx', id: 'alvo_falso_0',  name: 'Decoy',          desc: 'Ativada ao ser atingido. Obrigatória. Um decoy absorve o ataque.',       trigger: 'on_hit_defend',   mandatory: true  },
  { type: 'efx', kind: 'efx', id: 'alvo_falso_1',  name: 'Decoy',          desc: 'Ativada ao ser atingido. Obrigatória. Um decoy absorve o ataque.',       trigger: 'on_hit_defend',   mandatory: true  },
  { type: 'efx', kind: 'efx', id: 'contra_atk_0',  name: 'Contra-Hack',    desc: 'Após falha do oponente: contra-ataque imediato. Exposição sobe normalmente.', trigger: 'on_enemy_miss', mandatory: false },
  { type: 'efx', kind: 'efx', id: 'contra_atk_1',  name: 'Contra-Hack',    desc: 'Após falha do oponente: contra-ataque imediato. Exposição sobe normalmente.', trigger: 'on_enemy_miss', mandatory: false },
  { type: 'efx', kind: 'efx', id: 'seg_tiro_0',    name: 'Segundo Pulso',  desc: 'Após falhar: execute novamente. Gera metade da Exposição.',             trigger: 'on_own_miss',    mandatory: false },
  { type: 'efx', kind: 'efx', id: 'seg_tiro_1',    name: 'Segundo Pulso',  desc: 'Após falhar: execute novamente. Gera metade da Exposição.',             trigger: 'on_own_miss',    mandatory: false },
]

export const EQUIP_CARDS = [
  { type: 'eqp', kind: 'eqp', id: 'sabotagem_0',    name: 'Vírus',         desc: 'Injeta um vírus que destrói um módulo do oponente.' },
  { type: 'eqp', kind: 'eqp', id: 'sabotagem_1',    name: 'Vírus',         desc: 'Injeta um vírus que destrói um módulo do oponente.' },
  { type: 'eqp', kind: 'eqp', id: 'informante_0',   name: 'Spyware',       desc: 'Copia um módulo do oponente para seu buffer.' },
  { type: 'eqp', kind: 'eqp', id: 'informante_1',   name: 'Spyware',       desc: 'Copia um módulo do oponente para seu buffer.' },
  { type: 'eqp', kind: 'eqp', id: 'emboscada_0',    name: 'DDoS',          desc: 'Ataque distribuído: Exposição do oponente +3, sua +1.' },
  { type: 'eqp', kind: 'eqp', id: 'emboscada_1',    name: 'DDoS',          desc: 'Ataque distribuído: Exposição do oponente +3, sua +1.' },
  { type: 'eqp', kind: 'eqp', id: 'campo_minado_0', name: 'Firewall Trap', desc: 'Bloqueia um slot vazio do grid do oponente por 5 ciclos.' },
  { type: 'eqp', kind: 'eqp', id: 'campo_minado_1', name: 'Firewall Trap', desc: 'Bloqueia um slot vazio do grid do oponente por 5 ciclos.' },
  { type: 'eqp', kind: 'eqp', id: 'intel_0',        name: 'Deep Scan',     desc: 'Escaneia o buffer do oponente, revelando 2 módulos aleatórios.' },
  { type: 'eqp', kind: 'eqp', id: 'intel_1',        name: 'Deep Scan',     desc: 'Escaneia o buffer do oponente, revelando 2 módulos aleatórios.' },
]
