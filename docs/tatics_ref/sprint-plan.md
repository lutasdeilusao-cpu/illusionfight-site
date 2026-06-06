# LDI TACTICS — Plano de Sprints

## Sprint 1 ✅ FINALIZADA
**Roster dos 20 personagens + Combate básico**

- [x] Substituir `roster.js` pelos 20 personagens do documento
- [x] Atributos convertidos: forca=FOR, velocidade=AGI, resistencia=VIT, energia=INT, precisao=DES, tenacidade=SOR
- [x] Cada personagem com 2 skills (ataque básico + especial) usando DMG/RNG/CD/FX
- [x] Ataque físico funcional com cálculo de dano
- [x] Grid 8×16 com posicionamento de aliados (3) e inimigos (4)
- [x] `/LDI` — deploy v4.3.0

## Sprint 2 ✅ FINALIZADA
**Sistema de precisão, esquiva e crítico**

- [x] Implementar sequência de resolução de combate (seção 12)
- [x] Precisão vs Esquiva (chance de acerto)
- [x] Esquiva Perfeita (SOR)
- [x] Crítico (dano ×1.4)
- [x] DEF leve e DEF pesada
- [x] Aplicar no combate jogador e inimigo
- [x] BFS pathfinding para inimigos
- [x] `/LDI` — deploy v4.4.0

## Sprint 3 ✅ FINALIZADA
**Efeitos de status**

- [x] Sistema de status negativos (Sangramento, Veneno, Atordoamento, etc.)
- [x] Tolerância por atributo
- [x] Duração por atributo
- [x] Aplicar nas skills dos personagens
- [x] Renderização de ícones de status no StatusBar
- [x] `/LDI` — deploy

## Sprint 4 ✅ FINALIZADA
**UI para 3 personagens + desbloqueio**

- [x] Grid adaptado para 3 aliados (posições fixas espaçadas)
- [x] Sistema de desbloqueio (`maxSlots`, `personagensDesbloqueados`)
- [x] Slots de seleção: admin escolhe até `maxSlots`, normal randomiza 2
- [x] Persistência no Supabase (`max_slots`, `personagens_desbloqueados`)
- [x] `/LDI` — deploy v4.6.0

## Sprint 5 ✅ FINALIZADA
**Sistema de equipamentos**

- [x] 8 armas, 5 armaduras, 6 acessórios com ATQ/DEF/CRIT/HP
- [x] Slots funcionais no modal de detalhe do personagem
- [x] Painel de seleção de equipamento com bônus visíveis
- [x] Equipamento afeta ATQ total no `resolverAtaque`
- [x] Equipamento afeta DEF leve e chance de crítico
- [x] Persistência no Supabase (`equipamento_map`)
- [x] `/LDI` — deploy v4.7.0

## Sprint 6 ✅ FINALIZADA
**Balanceamento e polimento**

- [x] HP reduzido: 40 + VIT × 10 (era 40 + VIT × 15)
- [x] Dano base aumentado: `danoBase * 5` (era `danoBase * 3`)
- [x] Documentação atualizada (sprint-plan.md, SITE_MAP.md, docs)
- [x] `/LDI` — deploy v4.8.0

- [ ] Ajuste de valores
- [ ] Teste de gameplay
- [ ] Correções finais
- [ ] `/LDI` — deploy
