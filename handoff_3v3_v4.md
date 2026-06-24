# Handoff — Sistema RPG 3v3 (v4)

*Gerado em 22/06/2026 — arquivo de referência: `rpg_3v3-3-4.html`*

---

## 1. VISÃO GERAL

Sistema de combate tático 3v3 browser-based, implementado em arquivo HTML único sem dependências externas. O jogador cria um personagem, escolhe 2 aliados de 6 templates e enfrenta 3 inimigos sorteados aleatoriamente. Toda a interface e lógica estão em português.

**Pilares de design:**
- Testes por dado visível (dado da arma) vs atributo
- Dano calculado por dado de arma vs dado de armadura (sem valores fixos no tier 1+)
- Seis atributos divididos em ativos (atacam) e passivos (defendem)
- Seis famílias de arma com mecânicas únicas
- Sistema de efeitos com tiers por nível de cajado

---

## 2. ATRIBUTOS

Distribuição na criação: **8 pontos**, máximo **3 por atributo**. Crescem por XP individual.

| Atributo | Tipo | Função em combate |
|---|---|---|
| Fortitude | Ativo | Testa para atacar com Espada/Mãos Livres; +1 HP por ponto |
| Destreza | Ativo | Testa para atacar com Adaga/Arco/Espada e Escudo; cada 2 pts = +1 bônus de ataque |
| Inteligência | Ativo | Testa para magias; +1 MP por ponto |
| Agilidade | Passivo | Defende vs Destreza; cada 2 pts = +1 bônus de defesa |
| Resistência | Passivo | Defende vs Fortitude; base do HP |
| Determinação | Passivo | Defende vs Inteligência; base do MP |

### Antagonismos
| Ataque usa | Defesa usa |
|---|---|
| Fortitude | Resistência |
| Destreza | Agilidade |
| Inteligência | Determinação |

---

## 3. HP E MP

**HP:** Res 0 → base 5 (+5 a cada 2 pts); Res 1+ → base 10 (+10 a cada 2 pts); +1 HP por ponto de Fortitude.

**MP:** Mesma lógica com Determinação (base) e Inteligência (+1 por ponto).

---

## 4. SISTEMA DE TESTES (DADO VISÍVEL)

- **Dado de teste:** definido pelo nível da arma (d6 / d10 / d20)
- **Sucesso:** rolar ≤ atributo testado
- **Falha automática:** rolar o valor máximo do dado
- Atacante e defensor rolam simultaneamente
- Modificadores de buff/debuff se somam ao atributo antes do teste

### Resultados do combate
| Atacante | Defensor | Resultado |
|---|---|---|
| Acerta | Falha | Dano cheio (mínimo 1) |
| Acerta | Passa | Combate frenético (até 5 clashes → sorteio decisivo) |
| Falha | Passa | Contraataque (metade do dano; adaga com Agi maior dá dano cheio) |
| Ambos falham | — | Nada acontece |
| Falha automática | Passa | Contraataque imediato |

---

## 5. ARMAS (3 TIERS)

Dano calculado por `rollDice(dmgDiceSides) + dmgBonus`.

| Família | Nível 1 | Nível 2 | Nível 3 | Atributo de teste | Stat de dano |
|---|---|---|---|---|---|
| Espada | Espada Longa | Espada Bastarda | Espada-Mãe | Fortitude | Potência |
| Adaga | Adaga | Adaga Curva | Adaga Sombria | Destreza | Letalidade |
| Cajado | Cajado | Cajado Avançado | Cajado Arcano | Inteligência | Malícia |
| Espada e Escudo | Espada e Escudo | Espada e Broquel | Espada e Égide | Destreza | Potência |
| Arco | Arco Curto | Arco Longo | Arco Ancestral | Destreza | Depende da flecha |
| Mãos Livres | — (sem tiers) | — | — | Fortitude | Fórmula própria |

### Dados de dano por tier
| Família | Nv1 | Nv2 | Nv3 |
|---|---|---|---|
| Espada | 1d6+2 | 1d10+2 | 1d20+3 |
| Adaga | 1d6 | 1d10 | 1d15 |
| Cajado | 1d6 | 1d10 | 1d20 |
| Espada e Escudo | 1d6 | 1d10 | 1d15 |
| Arco | 1d4 | 1d7 | 1d15 |

### Mecânicas únicas por família

**Espada:** combate frenético encerra com sorteio — vencedor causa metade do dano.

**Adaga:** contraataque com dano cheio se Agi do defensor > Agi do atacante. Habilidade: **Apunhalar** (2 MP, +1 dano, 60% de Sangramento).

**Cajado:** recupera 1 MP por turno (passiva). Acesso ao sistema de magia completo. Quem conjura magia naquele turno não pode defender nem contraatacar.

**Espada e Escudo:** regenera 1 HP a cada 2 turnos (teto 50% HP máximo). Habilidade: **Cobertura** (grátis, redireciona 50% do dano de um aliado). No sorteio decisivo de frenético, mantém dano cheio em vez de metade.

**Arco:** dano definido pela flecha equipada. Sem flechas → usa Mãos Livres. Flechas especiais podem aplicar efeitos (Envenenamento, Paralisia, Sangramento) se o alvo falhar no teste de Resistência.

**Mãos Livres:** `(For + Res) / 2 + 1d4`. Escala para `1d6` quando **For ≥ 10 E Res ≥ 10** individualmente. Chance de Atordoamento após causar dano = `(For + Res) × 0,5%`.

### Flechas (Arco)
| Flecha | Stat de dano | Efeito especial |
|---|---|---|
| Flechas Pesadas | Potência | — |
| Flechas Afiadas | Letalidade | — |
| Flechas Corrompidas | Malícia | — |
| Flechas Afiadas Envenenadas | Letalidade | Pode causar Envenenamento |
| Flechas Afiadas Paralisantes | Letalidade | Pode causar Paralisia |
| Flechas Afiadas Lacerantes | Letalidade | Pode causar Sangramento |

### Helper `weaponFamily(weapon)`
**Sempre usar essa função para comparar famílias de arma.** Espada e Espada e Escudo compartilham `dmgStat: 'potencia'`, portanto comparar por `dmgStat` permite trocas indevidas entre famílias.

---

## 6. ARMADURAS (3 TIERS)

Defesa calculada por `rollDice(statDice)`. Rivalidades: Potência vs Proteção · Letalidade vs Evasiva · Malícia vs Barreira.

| Família | Nível 1 | Nível 2 | Nível 3 | Passiva |
|---|---|---|---|---|
| Malha/Placas | Cota de Malha | Armadura de Placas | Armadura Pesada | Dado máximo = +1 defesa naquele cálculo |
| Couro | Roupa de Couro | Couraça de Couro | Couraça Cravejada | Dado máximo = +1 dano ao atacante (não se aplica a magia) |
| Túnica | Túnica | Túnica Mística | Robe | Absorção de emergência: se Int≥2, Det≥3 e HP<10, absorve 10% do dano consumindo MP |

### Dados de defesa por tier
| Família | Proteção | Evasiva | Barreira |
|---|---|---|---|
| Malha (Nv1/2/3) | d6 / d10 / d20 | d3 / d4 / d7 | 0 / d2 / d4 |
| Couro (Nv1/2/3) | d3 / d4 / d5 | d6 / d10 / d20 | 0 / d4 / d6 |
| Túnica (Nv1/2/3) | 0 / d3 / d5 | d3 / d4 / d6 | d6 / d10 / d20 |

---

## 7. SISTEMA DE MAGIA

Exclusivo de quem usa Cajado. Conjurar magia marca `actedWithMagic = true` — o conjurador fica sem defesa e sem contraataque naquele turno.

### Dano mágico (tiers por nível de cajado)
Três tiers de dano: Dano, Dano Preciso, Dano Maior — custo e dado crescem por tier. Teste de Inteligência com dado da arma. Falha = MP perdido.

### Cura
Teste de Inteligência. Falha = MP perdido. Pode ser usada em si mesmo ou aliados. Suporta área (2 aliados ou todos).

### Reviver
Custo fixo 10 MP. Revive aliado derrotado com 1 HP + limpa efeitos. Não pode ser combinado com área.

### Área
- 3 MP → 2 alvos (escolha manual)
- 5 MP → todos

Ofensiva → mira inimigos. Cura/suporte → mira aliados.

### Síntese
Cajado Nv1: 1 magia por turno. Nv2+: até 2 combinadas (dano + efeito ou suporte). Custo extra por combinação.

---

## 8. EFEITOS E BUFFS

### Estrutura dos modificadores

Dois tipos de modificador, com funções distintas:

| Propriedade | Função | Onde atua |
|---|---|---|
| `attrMod` (fixo) | Soma/subtrai do atributo antes do teste | `getAttrTestMod()` → `resolveAttack` |
| `diceMod` (dado) | Rola dado e soma/subtrai do stat de equipamento | `getEffectMod()` → `calcRawDmg` |

**`getEffectMod` bloqueia `type:'def_attr'`** — esses efeitos só passam por `getAttrTestMod`.

### Debuffs em inimigos (testados pela Determinação do alvo)

| Efeito | Type | Modificador | Onde atua |
|---|---|---|---|
| Fragilidade Menor/Moderada/Maior | `def_attr` | `attrMod: -1/-2/-3` | Teste de defesa do alvo (`defAttr`) |
| Imprudência Menor/Moderada/Maior | `atk_attr` | `attrMod: -1/-2/-3` | Teste de ataque do alvo (`atkAttr`) |
| Negligência Menor/Moderada/Maior | `def` | `diceMod: 4/6/10` | Stat de defesa da armadura do alvo |
| Imperícia Menor/Moderada/Maior | `atk` | `diceMod: 4/6/10` | Stat de ataque da arma do alvo |

### Buffs em aliados (sem teste — aplicados diretamente)

| Efeito | Type | Modificador | Onde atua |
|---|---|---|---|
| Blindagem Menor/Moderada/Maior | `def_attr` | `attrMod: +1/+2/+3` | Teste de defesa do aliado (`defAttr`) |
| Cautela Menor/Moderada/Maior | `atk_attr` | `attrMod: +1/+2/+3` | Teste de ataque do aliado (`atkAttr`) |
| Preparo Menor/Moderado/Maior | `def` | `diceMod: 4/6/10` | Stat de defesa da armadura do aliado |
| Habilidade Menor/Moderada/Maior | `atk` | `diceMod: 4/6/10` | Stat de ataque da arma do aliado |

### Efeitos de status

| Efeito | Fonte | Descrição |
|---|---|---|
| Envenenamento Menor/Moderado/Maior | Magia / Flecha | -10% / -10% / -20% HP máximo por turno |
| Paralisia Menor/Moderada/Maior | Magia / Flecha | 40% / 50% / 60% de perde o turno |
| Desmaio | Magia (Cajado Nv2+) | Perde turno, recupera 5% HP; qualquer dano encerra |
| Sangramento | Flecha / Adaga | Acumula até 3 stacks: -10% / -15% / -20% HP por turno |
| Regeneração | Magia | +10% HP por turno |
| Detox | Magia | Remove veneno, paralisia e desmaio |
| Atordoamento | Mãos Livres | 1 turno: sem magia, 25% chance de atacar aliado |
| Doença Leve/Média/Grave | Evento externo | Reduz HP máximo em 10% / 25% / 50% |

### ⚠️ Gotcha: IDs com sufixo de tier
IDs como `poison_minor`, `paralyze_major`, `fragile_moderate` etc. **nunca usar `id === 'poison'`** — sempre `id.startsWith('poison')`.

---

## 9. MOTOR DE TURNOS

```
startRound()
  → ordena por Agilidade + fator aleatório
  → a cada 10 rodadas: processDiseaseProgression()
  → processTurn()

processTurn()
  → checkBattleEnd()
  → se turnIndex >= total: processEffects() em todos → startRound()
  → se ator morto → pula
  → processWeaponPassives(actor) — cajado +1 MP, escudo +1 HP a cada 2 turnos
  → se paralisado (chance por tier) → perde turno
  → se desmaiado → perde turno, recupera 5% HP
  → se atordoado → marca stunThisTurn (sem magia, 25% ataca aliado)
  → se IA → aiAct() → endTurn()
  → se jogador → exibe painel de ações

endTurn()
  → limpa magicQueue, pendingAction
  → incrementa turnIndex → processTurn()
```

---

## 10. TEMPLATES

### Aliados (6)
| Nome | Papel | For | Dex | Int | Agi | Res | Det | Arma | Armadura |
|---|---|---|---|---|---|---|---|---|---|
| Brunhilda | Guerreira | 3 | 1 | 0 | 1 | 2 | 1 | Espada Longa | Cota de Malha |
| Finn | Ladino | 1 | 3 | 0 | 3 | 1 | 0 | Adaga | Roupa de Couro |
| Elowen | Maga | 0 | 1 | 3 | 1 | 0 | 3 | Cajado | Túnica |
| Boran | Defensor | 2 | 1 | 0 | 0 | 3 | 2 | Espada e Escudo | Cota de Malha |
| Sylvara | Arqueira | 0 | 3 | 0 | 3 | 1 | 1 | Arco Curto | Roupa de Couro |
| Kael | Monge | 3 | 0 | 0 | 1 | 3 | 1 | Mãos Livres | Roupa de Couro |

### Inimigos (5 no pool, 3 sorteados por batalha)
| Nome | For | Dex | Int | Agi | Res | Det | Arma | Armadura |
|---|---|---|---|---|---|---|---|---|
| Soldado Renegado | 2 | 1 | 0 | 1 | 2 | 0 | Espada | Malha |
| Mercenário Errante | 1 | 2 | 0 | 2 | 1 | 0 | Adaga | Couro |
| Cultista Sombrio | 0 | 1 | 2 | 1 | 0 | 2 | Cajado | Túnica |
| Bandido Veloz | 1 | 3 | 0 | 2 | 0 | 0 | Adaga | Couro |
| Bruto das Cavernas | 3 | 0 | 0 | 0 | 3 | 0 | Espada | Malha |

---

## 11. INVENTÁRIO

Acessível no painel de ações. Usar um item consome o turno.

| Item | Efeito |
|---|---|
| Poção Pequena/Média/Grande | Cura 1d10 / 1d20 / 1d100 HP |
| Maná Pequena/Média/Grande | Recupera 1d10 / 1d20 / 1d100 MP |
| Ataduras | Remove Sangramento |
| Antídoto | Remove Envenenamento |
| Camomila | Remove Paralisia |
| Xarope | Remove Doença |
| Café Forte | Revive aliado com 1 HP |

---

## 12. DOENÇA

Aplicada externamente (fora de combate). Progride a cada 10 rodadas com teste de Resistência d20.

| Estágio | Redução de HP máximo |
|---|---|
| Leve | −10% |
| Média | −25% |
| Grave | −50% + Envenenamento automático |

Contágio: aliados testam Resistência a cada 10 rodadas. Curado por Xarope (inventário) ou Detox (magia).

---

## 13. XP E PROGRESSÃO

| Nível atual | XP necessário |
|---|---|
| 1–3 | 5 |
| 4–7 | 10 |
| 8–11 | 15 |
| 12–17 | 20 |
| 18–20 | 25 |

XP concedido ao fim da batalha: +2 em todos os atributos; +5 se os inimigos tinham mais pontos totais.

---

## 14. PENDÊNCIAS E PRÓXIMOS PASSOS

- [ ] Testes extensivos de balanceamento com os novos tiers de arma/armadura
- [ ] IA dos inimigos mais sofisticada (usar magia, priorizar alvos fracos, usar flechas)
- [ ] Habilidades por arma (painel já existe, sem conteúdo ainda)
- [ ] Expansão do pool de inimigos (atualmente só 5 templates)
- [ ] Sistema de progressão de equipamento (como o jogador obtém itens de tier 2/3)
- [ ] Narrativa / integração com o mundo do jogo
- [ ] Modo dois jogadores (PvP ou co-op)
