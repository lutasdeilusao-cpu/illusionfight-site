# Proposta de Expansão — Lendas do LDI

## 1. Estado Atual vs GDD

| Métrica | Atual | GDD Alvo |
|---|---|---|
| Cenas | 26 (até 2.1d) | ~120+ estimado |
| Inimigos | 7 | 12+ |
| Parágrafos | 129 | ~800+ |
| Escolhas | 58 | ~400+ |
| Arcos cobertos | ~30% do Ato I | Atos I a IV completos |
| Tempo de jogo | ~10 min | ~2-4h (completo) |

**O que já temos funcional:**
- Motor de cenas (JSON → Typewriter → escolhas)
- Sistema de combate 3D&T com 3 modos
- Criação de ficha (guiada + completa)
- Save/load no Supabase
- Sistema de personagem (cor, fonte, bg por fala)
- Drawer de manual
- Sistema de poderes elementais

**O que falta (do GDD):**
- Sistema de dias (loop diário com atividades)
- Economia (créditos, gastos semanais)
- Investigação e sistema de pistas com conexões
- Puzzles (já implementados mas não integrados ao loop)
- Sistema de ranking SDR
- Loja de itens e equipamentos
- Habilidades especiais com XP
- Teste de morte
- Fork narrativo (recusar/traição)
- Fim de jogo com retrospecto
- Conquistas ocultas

---

## 2. A Pergunta: 4 Arcos Longos ou muitos Arcos?

**Resposta curta: 4 arcos, mas com填充 denso.**

### Por que 4 arcos é melhor que 16:

1. **Narrativa coerente** — o GDD já tem 4 atos com arco dramático completo (introdução → desenvolvimento → clímax → resolução). 16 arcos forçariam filler ou tramas paralelas desconexas.

2. **Reaproveitamento de assets** — mesmas mecânicas servem os 4 atos. Mais arcos = mais sistemas novos por ato.

3. **Tempo de desenvolvimento realista** — cada ato é ~1-2 semanas de implementação. 4 atos = 2 meses. 16 atos = 8 meses.

4. **Player retention** — 4 atos de ~30-45 min cada = 2-3h de jogo total. Isso é saudável pra um RPG narrativo web.

### Como fazer cada ato durar mais:

Em vez de esticar o número de atos, **preencho cada ato com mais conteúdo**:

- **Mais NPCs secundários** com diálogos ramificados por ato
- **Mais batalhas opcionais** (não só as obrigatórias do GDD)
- **Eventos aleatórios** em dias livres (encontros de rua, notícias no SDR, mensagens misteriosas)
- **Missões secundárias** desbloqueadas por flags específicas
- **Mais puzzles** integrados à investigação (não só terminais)
- **Finais alternativos DENTRO do ato** (não só o fork grande)

### Meta de conteúdo por ato:

| Ato | Cenas | Inimigos | Puzzles | Tempo estimado |
|---|---|---|---|---|
| I — Entrada | 35-40 | 2 | 0 | 25-35 min |
| II — Recrutamento | 30-35 | 3 | 1 | 30-40 min |
| III — Infiltração | 50-60 | 5 | 5+ | 45-60 min |
| IV — Confronto | 25-30 | 3 (incl. boss final) | 1 | 30-40 min |
| **Total** | **140-165** | **13** | **7+** | **2h10min - 3h** |

---

## 3. Plano de Implementação (Fases)

### Fase 0 — Fundação (já feito)
✅ Motor de cenas, combate, criação, save, personagens

### Fase 1 — Loop de Gameplay (1 semana)
- [ ] Sistema de dias (ciclo manhã → atividade → noite)
- [ ] Economia (créditos, gasto semanal)
- [ ] Atividades diárias (trabalhar, treinar, investigar, descansar)
- [ ] Passagem de tempo automática entre cenas
- [ ] **Data estimada**: fim do Ato I jogável com loop completo

### Fase 2 — Investigação + Puzzles (1 semana)
- [ ] Sistema de pistas com contagem
- [ ] Conexão automática entre pistas
- [ ] Integração dos puzzles existentes (sliding tiles, stealth, decoder) ao loop diário
- [ ] Log de pistas no caderno (já existe parcialmente)
- [ ] **Data estimada**: Ato I completo + início do Ato II

### Fase 3 — Conteúdo dos Atos I + II (1-2 semanas)
- [ ] Cenas 1.3 → 1.fim (Dias 1-3): escolhas de dia livre, examinar SBI, flag ANOMALIA
- [ ] Cenas 2.1 → 2.5 (Dias 4-7): mensagem, encontro, fork recusa
- [ ] NPCs: Pé no Chão, Voz, Beto
- [ ] Flag [RECRUTADO] e [ANOMALIA_DETECTADA]
- [ ] Fork narrativo de recusa com cena de fim

### Fase 4 — Atos III + IV (2-3 semanas)
- [ ] Loop de investigação (Dias 8-17): batalhas como cobertura
- [ ] Sistema de pistas conectado ao vilão
- [ ] Encontros com NULL_ENTITY
- [ ] Rota de confronto (combate / exposição / negociação)
- [ ] Boss final (NULL_ENTITY com ficha completa)
- [ ] Epílogo com memória de escolhas + teaser Arco 2
- [ ] Conquistas ocultas

### Fase 5 — Polimento (1 semana)
- [ ] Sistema de XP com habilidades especiais e threshold visual
- [ ] Loja de itens e equipamentos
- [ ] Ranking SDR funcional
- [ ] Teste de morte com tela de fim de jogo
- [ ] Balanceamento de combates
- [ ] SITE_MAP atualizado completo

---

## 4. O que eu posso fazer AGORA vs o que precisa de讨论

### Já implementável (baseado no GDD + código existente):
- **Sistema de dias**: o jogo já tem `day_in_game` no save, é conectar ao loop
- **Atividades diárias**: já existe o padrão de escolhas, só adicionar as opções certas por dia
- **Mais cenas**: escrever JSON seguindo o padrão existente
- **Fork narrativo**: já existe `save.status === 'ended_defeat'`, só adicionar `ended_fork`
- **NULL_ENTITY**: já temos 7 inimigos, adicionar mais é trivial
- **Memória de escolhas**: guardar últimas 3 flags mais impactantes

### Precisa de discussão:
- **Escopo do Ato III**: o GDD descreve "loop de investigação com batalhas como cobertura" — quantas batalhas por dia? Quantos dias de investigação vs dias de trama?
- **Dificuldade dos puzzles**: quão punitivos vs quão perdoáveis?
- **Economia**: valores de crédito, custo de itens, ganho por batalha — quer manter os números do GDD ou ajustar?
- **Habilidades especiais**: quais desbloquear por XP vs por evento narrativo?

---

## 5. Estimativa Realista

| Prazo | Entregável |
|---|---|
| 1 semana | Ato I jogável (loop diário + economia + cenas 1.1-1.fim) |
| 2 semanas | Ato II jogável (recrutamento + fork recusa) |
| 3-4 semanas | Ato III jogável (investigação + batalhas + puzzles integrados) |
| 4-5 semanas | Ato IV jogável (confronto + boss + epílogo) |
| 5-6 semanas | Polimento + balanceamento + SITE_MAP + QA |

**Total: ~6 semanas para o jogo completo de 2-3h.**

---

## 6. Perguntas pra você decidir antes de eu começar

1. **4 atos densos ou mais atos?** Minha recomendação: 4 atos com填充 denso (2-3h total), não 16 atos rasos.

2. **Ordem de prioridade:** quer ver o Ato I completo primeiro (jogável do começo ao fim), ou prefere que eu implemente a base de todos os sistemas primeiro (dias, economia, investigação) e depois preencha o conteúdo de cada ato?

3. **Economia:** os valores de crédito do GDD tão bons ou quer algo diferente?

4. **Puzzles:** quer que eu integre os puzzles já existentes ao loop de investigação, ou prefere puzzles novos?

5. **Dificuldade:** o combate atual tá fácil demais? Os inimigos atuais (StormByte, Kaeda) são tutorial — o GDD tem oponentes mais difíceis (GhostPulse, IronVeil, NULL_ENTITY). Quer escala progressiva ou manter fácil?

Me fala o que pensar disso e a gente alinha antes de eu escrever uma linha de código.
