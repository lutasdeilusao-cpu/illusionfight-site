# LDI TACTICS — Sistema de Combate

## Atributos (atuais no código)

| Código | Nome | Efeito |
|--------|------|--------|
| forca (FOR) | Força | Dano corpo a corpo |
| velocidade (AGI) | Agilidade | Esquiva, ASPD |
| resistencia (VIT) | Vitalidade | HP, DEF, tolerâncias |
| energia (INT) | Energia | SP, dano mágico |
| precisao (DES) | Destreza | Precisão, dano à distância |
| tenacidade (SOR) | Sorte | Crítico, esquiva perfeita |

## Sequência de Resolução de Ataque (seção 12)

1. Calcular Dano Bruto
2. Esquiva Perfeita do defensor? (SOR/10 %) → MISS
3. Chance de acerto = Precisão - Esquiva → MISS se falhar (mín 5%)
4. Crítico (físico): dano × 1.4
5. Aplicar DEF: dano - DEF_leve, depois × (1 - DEF_pesada%)
6. Subtrair do HP

## Defesa

| Tipo | Fórmula |
|------|---------|
| DEF leve | VIT×0.5 + AGI×0.2 |
| DEF pesada% | DEF_valor / (DEF_valor + 500) × 100 |
| DEFM leve | INT×0.5 + DES×0.1 + VIT×0.1 |
| DEFM pesada% | DEFM_valor / (DEFM_valor + 125) × 100 |

## Precisão e Esquiva

| Stat | Fórmula |
|------|---------|
| Precisão | 24 + DES + SOR/3 |
| Esquiva | AGI + SOR/5 |
| Esquiva Perfeita | SOR/10 % |
| CRIT | SOR × 0.3 % |

## ASPD → Ataques por turno (no grid)

| ASPD | Ataques/turno |
|------|-------------|
| < 175 | 1 |
| ≥ 175 | 2 |
| ≥ 184 | 3 |

## Status Negativos

| Efeito | Efeito | Tolerância |
|--------|--------|-----------|
| Sangramento | Perde HP/turno | AGI |
| Envenenamento | Perde HP/turno (forte) | VIT |
| Atordoamento | Não age | VIT |
| Imobilizado | Não move, age | FOR |
| Cego | Precisão reduzida | INT |
| Silêncio | Sem habilidades | INT |
| Congelado | Não move, não age | AGI |
| Queimadura | HP/turno | VIT |
| Medo | -2 MOV, sem CD longo | INT |
| Cegueira | Falha ataques distância | INT |

Fórmula: Chance_aplicar = Chance_base - Tolerância_alvo
Duração_real = Duração_base - Redução_por_atributo

## Grid (8×16)

- MOV classe: 2-5 casas/turno (definido por classe)
- Corpo a corpo: 1 casa
- Médio alcance: 1-3
- Longo alcance: 3-8 (linha de visão)
- Conjuração: 1 turno por segundo de conjuração
- Pós-conjuração: delay em turnos, bloqueia TODAS habilidades
- Recarga (CD): bloqueia APENAS aquela habilidade
