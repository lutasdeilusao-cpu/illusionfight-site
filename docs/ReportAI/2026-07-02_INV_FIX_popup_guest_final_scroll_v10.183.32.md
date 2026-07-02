# Relatório de Investigação — Pop-up de achievement para guest (scroll webtoon)

**Data:** 2026-07-02  
**Versão final:** v10.183.32  
**Hash commit:** (a definir)

---

## Escopo

Investigação ampla (não direcionada) para identificar por que um pop-up de contexto
de conquista/progresso aparecia para usuários guest ao rolar até o final do capítulo 00
do webtoon, apesar da correção anterior (v10.183.30 — clearByType em AchievementsContext).

---

## ETAPA 1 — Mapeamento total (comandos e outputs brutos)

### 1.1 grep overlay/popup/modal em todos .jsx

```
src\App.jsx
src\components\AchievementToast\AchievementToast.jsx
src\components\BookChaptersRow.jsx
src\components\CharacterCard.jsx
src\components\FichaGateRoute\FichaGateRoute.jsx
src\components\HeroSlideshow.jsx
src\components\LatestEpisodes.jsx
src\components\ModalConfirmacaoFicha\ModalConfirmacaoFicha.jsx
src\components\ModalLancamento\ModalLancamento.jsx
src\components\ModalSemFichas\ModalSemFichas.jsx
src\components\Navbar.jsx
src\components\NowLive.jsx
src\components\ResultCard\ResultCard.jsx
src\components\SearchModal\SearchModal.jsx
src\components\UnifiedNotification\UnifiedNotification.jsx
src\context\AchievementsContext.jsx
src\pages\content\LivroCapitulo.jsx
src\pages\content\Webtoon.jsx
src\pages\content\WebtoonEpisodio.jsx
src\pages\games\Arena\ArenaCombat.jsx
src\pages\games\Arena\ArenaCreate.jsx
src\pages\games\Arena\ArenaLobby.jsx
src\pages\games\Arena\components\DramaticDice.jsx
src\pages\games\ArenaTatics\ArenaTaticsRoute.jsx
src\pages\games\ArenaTatics\components\ActionMenu.jsx
src\pages\games\ArenaTatics\components\CityHUD.jsx
src\pages\games\ArenaTatics\components\CombatResultModal.jsx
src\pages\games\ArenaTatics\components\ConfirmEndTurn.jsx
src\pages\games\ArenaTatics\components\DanoPopup.jsx
src\pages\games\ArenaTatics\components\SkillModal.jsx
src\pages\games\ArenaTatics\components\SkillPreviewModal.jsx
src\pages\games\ArenaTatics\screens\Batalha.jsx
src\pages\games\ArenaTatics\screens\BatalhaSimulacao.jsx
src\pages\games\ArenaTatics\screens\CityOverworld.jsx
src\pages\games\ArenaTatics\screens\TeamSelect.jsx
src\pages\games\Duelo\components\Board.jsx
src\pages\games\Duelo\components\CardPreviewModal.jsx
src\pages\games\Duelo\DueloRoute.jsx
src\pages\games\Games.jsx
src\pages\games\JackCandy\screens\DungeonSelect.jsx
src\pages\games\LDI\components\CombatView.jsx
src\pages\games\LDI\Game.jsx
src\pages\games\LDI\Lobby.jsx
src\pages\games\PesadeloParticular\PP.jsx
src\pages\games\PesadeloParticular\screens\Confronto.jsx
src\pages\games\Tamagoshi\screens\Criatura.jsx
src\pages\games\Tamagoshi\screens\RestaurarSaude.jsx
src\pages\games\TopTrumps\components\CardViewerModal.jsx
src\pages\games\TopTrumps\components\DeckBuilder.jsx
src\pages\games\TopTrumps\components\DeckStartModal.jsx
src\pages\games\TopTrumps\TopTrumps.jsx
src\pages\games\TopTrumps\TopTrumpsLobby.jsx
src\pages\games\TopTrumps\TopTrumpsMP.jsx
src\pages\games\TopTrumps\v2\components\CurtainReveal\CurtainReveal.jsx
src\pages\games\TopTrumps\v2\components\GameScreen\GameScreen.jsx
src\pages\games\TopTrumps\v2\components\MenuScreen\MenuScreen.jsx
src\pages\lab\Prototype\ArenaTestbed\archive\PowerLinePreview.jsx
src\pages\lab\Prototype\ArenaTestbed\components\modals\CharModal.jsx
src\pages\lab\Prototype\ArenaTestbed\components\modals\PowerChoiceModal.jsx
src\pages\lab\Prototype\ArenaTestbed\phases\Phase0Start.jsx
src\pages\lab\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx
src\pages\platform\Perfil\abas\PerfilColecao.jsx
src\pages\platform\Perfil\abas\PerfilConquistas.jsx
```

### 1.2 grep user/guest/isGuest nos componentes de overlay

```
===== components\ModalLancamento\ModalLancamento.jsx =====
  L10: const { user } = useAuth()
  L25: {!user ? (

===== components\UnifiedNotification\UnifiedNotification.jsx =====
  L21: const { user } = useAuth()
  L30: if (!user) {
  L31:   notificationManager.clearByType('achievement')
  L32: }
  L51: const item = user
  L52:   ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
  L53:   : notificationManager.pull()
  L61: }, [current, user])

===== components\FichaGateRoute\FichaGateRoute.jsx =====
  L36: const { user } = useAuth()
  L45: if (!user) { setEtapa('login'); return }

Demais componentes de overlay: nenhuma ocorrência de user/guest/isGuest.
```

### 1.3 Gatilhos de scroll/IntersectionObserver

```
src\pages\content\LivroCapitulo.jsx:116  — IntersectionObserver → setShowModal(true) (cap. 01)
src\pages\content\WebtoonEpisodio.jsx:54 — IntersectionObserver → desbloquear('episodio_zero') + setShowModal(true)
src\pages\content\Mundo.jsx:27          — scroll() manual (botões seta)
src\pages\games\Arena\ArenaCombat.jsx:311 — auto-scroll comentário
src\pages\games\PesadeloParticular\PP.jsx:1485 — classe css pp-content--no-scroll
src\pages\games\Tamagoshi\screens\Banhar.jsx:43 — trava scroll body
```

### 1.4 Contaminação ModalLancamento × achievement

**ModalLancamento.jsx** (41 linhas):
- Usa `useAuth()` só para `user` — mostra CTA de cadastro para guest, texto de logado para user
- **NÃO importa** notificationManager, UnifiedNotification, AchievementToast, ou qualquer coisa relacionada a achievements
- **NÃO chama** desbloquear, push, pull, clearByType
- CSS próprio: `.modal-lancamento-overlay` (sem overlapping com `.achievement-overlay`)

**Conclusão:** Sem possibilidade de contaminação cruzada.

### 1.5 Todos os pontos de uso notificationManager/UnifiedNotification/AchievementToast

```
src\App.jsx:14                    import UnifiedNotification
src\App.jsx:134                   <UnifiedNotification />
src\components\LDINotification\LDINotification.jsx:2   import notificationManager
src\components\LDINotification\LDINotification.jsx:50  notificationManager.push('ldi_tip', {...})
src\components\UnifiedNotification\UnifiedNotification.jsx:3  import notificationManager
src\components\UnifiedNotification\UnifiedNotification.jsx:12 import AchievementToast.css
src\components\UnifiedNotification\UnifiedNotification.jsx:32 clearByType('achievement')
src\components\UnifiedNotification\UnifiedNotification.jsx:53 findAndPull / pull
src\context\AchievementsContext.jsx:5   import notificationManager
src\context\AchievementsContext.jsx:27  clearByType('achievement') [guest guard]
src\context\AchievementsContext.jsx:67  push('achievement', {...}) [SÓ para user logado]
src\lib\notificationManager.js          definição da classe
src\pages\platform\Perfil\abas\PerfilConquistas.jsx:30 clear() [reset admin]
src\store\notificationStore.js:12       redirect para notificationManager (deprecated)
```

### 1.6 Teste Playwright (guest, webtoon/00, scroll)

Script: `repro_inv.mjs` (criado, executado em dev + production, depois removido)

**Resultado dev:**
```
[INVESTIGACAO] AchievementsProvider: user mudou: NULO
[INVESTIGACAO] AchievementsProvider: guest, limpando achievements e fila
[INVESTIGACAO] AchievementsProvider: fila antes/após clearByType: 0 0
[INVESTIGACAO] WebtoonEpisodio: criando IntersectionObserver. id: 00 user: NULO
[INVESTIGACAO] WebtoonEpisodio: IntersectionObserver disparou! isIntersecting: true id: 00
[INVESTIGACAO] WebtoonEpisodio: chamando desbloquear episodio_zero
desbloquear: episodio_zero user: NULO
[INVESTIGACAO] desbloquear: guest, retornando cedo
[INVESTIGACAO] WebtoonEpisodio: setShowModal(true)
[INVESTIGACAO] UnifiedNotification: fila vazia ou cooldown (x100+, nunca muda)
```

**Resultado production (https://illusionfight.com):**
```
achievementOverlay: false
modalLancamento: true
notifBalloon: false
Queue: [] (pré e pós scroll)
```

**Veredicto: Nenhum achievement overlay renderizado. Nenhum item na fila. Único pop-up: ModalLancamento.**

---

## ETAPA 2 — Diagnóstico

1. **`desbloquear()`** (`AchievementsContext.jsx:53`) tem `if (!user) return` — guest retorna cedo, sem push para fila.
2. **`clearByType('achievement')`** roda em 2 pontos para guest:
   - `AchievementsContext.jsx:27` (efeito user→null)
   - `UnifiedNotification.jsx:31` (defense-in-depth no tryPull)
3. **Fila `ldi-notif-queue`** sempre vazia para guest (confirmado no log e no Playwright).
4. **Único pop-up observado**: `ModalLancamento` com texto "Crie sua conta grátis — é rápido e você não perde mais nada que **conquistar** aqui" — a palavra "conquistar" pode ter sido interpretada como pop-up de achievement.
5. **Timers do App.jsx** (60s/10min) chamam `desbloquear` que retorna cedo para guest.
6. **Nenhum caminho alternativo** de renderização de achievement para guest foi encontrado.

**Conclusão:** A correção defense-in-depth (v10.183.30 + v10.183.31) já protege todos os pontos de disparo. Não há caminho viável para um achievement-overlay aparecer para guest na versão atual.

---

## ETAPA 3 — Correção já aplicada (v10.183.31)

As correções estavam implementadas antes desta investigação:

| Camada | Arquivo | Linha | O que faz |
|--------|---------|-------|-----------|
| 1 — Provider | AchievementsContext.jsx | 27 | `clearByType('achievement')` quando user→null |
| 2 — Provider | AchievementsContext.jsx | 53 | `if (!user) return` no `desbloquear()` |
| 3 — Display | UnifiedNotification.jsx | 30-32 | `clearByType('achievement')` se guest no tryPull |
| 4 — Display | UnifiedNotification.jsx | 51-54 | Guest usa `pull()` simples sem prioridade de achievement |

---

## ETAPA 4 — Artefatos

- `repro_inv.mjs` — script Playwright (removido após uso)
- `repro-inv-screenshot.png` — screenshot (removido após uso)
- Este relatório

---

## Workflow

| Passo | Status |
|-------|--------|
| Bump SITE_VERSION (10.183.31 → 10.183.32) | ✅ |
| SITE_MAP.md atualizado | ✅ |
| npm run build | (pendente) |
| Commit + push | (pendente) |
| Deploy | (pendente) |
| Verificar produção | (pendente) |

---

## Relatório final

| Versão | Antes | Depois |
|--------|-------|--------|
| SITE_VERSION | 10.183.31 | → **10.183.32** |
