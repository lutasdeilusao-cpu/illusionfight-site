# GDD — Lendas do LDI v3.0
**Versão:** 3.0 — Arco 1: Descobrimento  
**Status:** Implementação em andamento  
**Data:** Junho 2026

---

## Legenda
- ✅ **Implementado e funcionando**
- 🔄 **Em implementação (Ato III)**
- 📅 **Planejado (Ato IV)**
- 🔮 **Futuro (pós-Arco 1)**

---

## 1. VISÃO GERAL

**Lendas do LDI** é um RPG de livro-jogo digital no universo *Lutas de Ilusão*.  
✅ Motor de cenas narrativas com typewriter + escolhas  
✅ Combate 3D&T adaptado com 3 modos  
✅ Criação de ficha (guiada + completa)  
✅ Save/load no Supabase  
✅ Sistema de personagem por prefixo `[NOME]` (cor + fonte + bg)  
✅ Economia com gastos semanais  
✅ Fork narrativo (recusa)  
🔄 Ato III — Loop de investigação  
📅 Ato IV — Confronto final  

---

## 2. SISTEMAS IMPLEMENTADOS

### 2.1 Motor de Cenas
✅ JSON estruturado → Typewriter com efeito de digitação  
✅ Escolhas com requisitos de atributo, crédito e flag  
✅ Opções bloqueadas mostram o que falta  
✅ Múltiplos arquivos de ato (act1.json..act4.json)  

### 2.2 Personagem por Prefixo
✅ Detecção de `[NOME]` no início do parágrafo  
✅ `PERSONAGEM_STYLE`: NEOGULDE, KAEDA, VOZ, STORMBYTE, SISTEMA  
✅ Cor (via `--personagem-cor`), fonte (via inline `fontFamily`), bg sutil (via `--personagem-bg`)  

### 2.3 Combate 3D&T
✅ Três modos: Mãos Livres ✊, Armado ⚔️, Poder ⚡  
✅ FA = atributo base + H + 1d6  
✅ FD = A + H + 1d6  
✅ Esquiva, Ataque Múltiplo, Modo Xamã  
✅ Poderes elementais (até 4 por batalha)  
✅ 10 inimigos implementados (incl. StormByte, Kaeda, GhostPulse, IronVeil, NULL_ENTITY, etc.)  

### 2.4 Economia
✅ `credits` no save  
✅ `advanceDay()` com gasto semanal de 410cr  
✅ `payWeeklyExpenses()`  
✅ Penalidade de −1 R se sem créditos  

### 2.5 Progressão de XP
✅ Custo progressivo: 10, 12, 14, 16... XP por ponto  
✅ `attribute_points_gained` trackeia pontos upados  
✅ `level_up_available` flag + modal de upgrade  

### 2.6 Fork Narrativo
✅ `end_fork` → `status: 'ended_fork'` → tela de fim  
✅ Cena 2.4fim — Recusa da Organização  

### 2.7 Save & Persistência
✅ Supabase: `character_sheets` + `game_saves`  
✅ Save automático a cada escolha  
✅ Ficha reutilizável entre runs  

### 2.8 UI/UX
✅ Manual Drawer (9 seções)  
✅ Ficha do personagem com barras  
✅ Caderno de pistas  
✅ Título animado typewriter + glitch  
✅ Fonte Bring Race no título do Lobby  

---

## 3. ARCO 1 — STATUS POR ATO

### ✅ ATO I — ENTRADA (Completo)
| Cena | Status | Notas |
|------|--------|-------|
| 1.1 → 1.1d | ✅ | NeoGuide — criação de ficha |
| 1.2 | ✅ | Desconexão |
| 1.3 | ✅ | Praça Central (7 opções) |
| 1.3a–f | ✅ | Sub-cenas da Praça |
| 1.3d-mafama | ✅ | Assombro dos Dados |
| 1.4 | ✅ | Dia 2 — Rotina |
| 1.4a–c | ✅ | Sub-cenas do Dia 2 |
| 1.5 | ✅ | Dia 3 — Prazo |
| 1.5a | ✅ | Missão Oficial |

### ✅ ATO II — RECRUTAMENTO (Completo)
| Cena | Status | Notas |
|------|--------|-------|
| 2.1 → 2.1d | ✅ | Contato + Abrigo ⭐ |
| 2.2 | ✅ | Briefing |
| 2.2b | ✅ | Tempo para pensar |
| 2.3 | ✅ | Bem-vindo à Organização |
| 2.4fim | ✅ | Fork — Recusa |

### 🔄 ATO III — INFILTRAÇÃO (Em desenvolvimento)
| Cena | Status | Notas |
|------|--------|-------|
| 3.1 | 📅 | Reconexão |
| 3.2–3.15 | 📅 | Loop de investigação |
| 3.X | 📅 | Percepção do vilão |
| 3.FINAL | 📅 | Armadilha |
| Puzzles | 🔄 | Sliding Tiles, Stealth Grid, Decodificador + novos |

### 📅 ATO IV — CONFRONTO (Planejado)
| Cena | Status | Notas |
|------|--------|-------|
| 4.1 | 📅 | Decisão final (3 rotas) |
| 4.2 | 📅 | Resolução + epílogo |
| Boss | 📅 | NULL_ENTITY forma final |
| Conquistas | 📅 | 4 conquistas ocultas |

---

## 4. MANUAL DE REGRAS (3D&T Adaptado)

### Características
| Sigla | Nome | Base |
|-------|------|------|
| F | Força | Modo Mãos Livres |
| H | Habilidade | Modo Armado, Esquiva |
| R | Resistência | PV = R × 5 |
| A | Armadura | FD = A + H + 1d |
| PdF | Poder de Fogo | Modo Poder, PM = PdF × 4 |

### Combate
- **Iniciativa:** 1d6 + H
- **FA Corpo a corpo:** F + H + 1d
- **FA Armado:** H + arma + 1d
- **FA Poder:** PdF + H + 1d (+nd por gasto de PM)
- **FD Padrão:** A + H + 1d
- **Dano:** FA − FD (mín 0)

### Progressão de XP
| Pontos Ganhos | Custo do Próximo |
|---|---|
| 1º | 10 XP |
| 2º | 12 XP |
| 3º | 14 XP |
| n | `10 + (n-1) × 2` XP |

### Balanceamento de Inimigos (pós-tutorial)
Inimigos se adaptam ao total de atributos do jogador:
```
poder_base_inimigo × (soma_atributos_jogador / soma_base_esperada)
```

---

## 5. PERSONAGENS

### ✅ Implementados
| Personagem | Tipo | Onde aparece |
|---|---|---|
| NeoGuide | NPC guia | Ato I |
| Kaeda | Aliado/Recrutadora | Atos I–II |
| Voz | Organização (mencionada) | Ato II |
| StormByte_91 | Oponente tutorial | Ato I |
| GhostPulse | Oponente médio | Ato I |
| IronVeil | Oponente difícil | Ato I |
| NULL_ENTITY | Boss | Atos III–IV |
| Robô de Rank Baixo | Oponente fácil | Ato I |
| StormByte_Elite | Oponente médio | Ato I |
| Sombra Digital | Oponente difícil | 🔄 Ato III |

### 📅 Planejados
| Personagem | Tipo | Ato |
|---|---|---|
| Pé no Chão | Aliado de campo | III |
| Beto (técnico) | NPC secundário | III |
| Vilão Interno | Antagonista | III–IV |

---

## 6. SISTEMA DE INVESTIGAÇÃO (Em desenvolvimento 🔄)

### Coleta de Pistas
| Método | Atributo | Dificuldade |
|---|---|---|
| Observação (batalha) | H | 6 |
| Análise de logs SBI | Computação | 7 |
| Conversa NPC | Manipulação | 5 |
| Puzzle (terminal) | Computação | 9 |
| Combinação automática | — | — |

### Recompensas de Puzzle
- **Pista completa** → avança investigação
- **XP** → como batalha
- **Item raro** → drop ocasional
- **Informação de rota** → desbloqueia caminho no Ato IV

---

## 7. ECONOMIA

| Item | Valor |
|---|---|
| Trabalho (diária) | 80–150 créditos |
| Vitória LDI (iniciante) | 50–100 créditos |
| Gasto semanal fixo | 410 créditos |
| Penalidade sem crédito | −1 R até pagar |

---

## 8. FINS DE JOGO

| Tipo | Status | Gatilho |
|------|--------|---------|
| Derrota em combate | ✅ | PV = 0 + Teste de Morte 6 |
| Fork — Recusa | ✅ | Recusar Organização (cena 2.4fim) |
| Fork — Investigação insuficiente | 📅 | Ato IV sem pistas |
| Fork — Traição | 📅 | Vazar info no Ato III |
| Vitória | 📅 | Ato IV concluído |

---

## 9. LOJA E ITENS (Planejado 📅)

| Item | Custo | Efeito |
|---|---|---|
| Cura Menor | 1 XP | +5 PV |
| Cura Maior | 3 XP | +10 PV |
| Recarga Menor | 2 XP | +4 PM |
| Arma +1 | 10 XP | Dano +1 |
| SBI Reforçado | 10 XP | A +1 |

---

## 10. PRÓXIMOS PASSOS

1. 🔄 **Ato III** — act3.json com loop de investigação (8 sub-cenas + puzzles)
2. 🔄 **Integração de puzzles** — Sliding Tiles, Stealth Grid, Decodificador no loop
3. 📅 **Ato IV** — act4.json com confronto final + 3 rotas
4. 📅 **Loja de itens** — compra com XP/créditos
5. 📅 **Tela de fim de jogo** — retrospecto + conquistas
6. 📅 **Balanceamento** — scaling de inimigos pós-tutorial

---

*GDD v3.0 — Lendas do LDI | Arco 1: Descobrimento*  
*Sistema de regras: 3D&T Alpha adaptado*  
*Universo Lutas de Ilusão © Isaias Leal*
