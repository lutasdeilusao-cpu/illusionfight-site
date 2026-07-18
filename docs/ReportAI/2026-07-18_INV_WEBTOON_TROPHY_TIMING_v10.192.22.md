# INV — timing do troféu “Episode Zero”

**Data:** 2026-07-18

**Versão:** 10.192.21 → **10.192.22**

**Escopo:** investigação e instrumentação; nenhuma correção comportamental.
**Status:** **PENDENTE EVIDÊNCIA MANUAL**

## Sintoma e regra esperada

Em `/webtoon/00`, o modal `TROPHY AVAILABLE / Episode Zero / You finished reading!` foi observado no topo da leitura. Guest pode ler sem conta e o CTA só pode aparecer após alcançar o final. Para autenticado, persistência e notificação também só podem ocorrer após o final. “Modal exibido” e “conquista desbloqueada” são eventos distintos neste relatório.

## Prova de leitura — comandos e outputs brutos

O ambiente é Windows/PowerShell. `bash --version` retornou que não há distribuição WSL. Os comandos foram executados com `C:\Program Files\Git\usr\bin\grep.exe` e `wc.exe`, preservando os argumentos pedidos. O output integral do comando 2 e do comando 8 é extenso; permanece reproduzível pelos comandos abaixo e seus resultados relevantes são também cobertos no mapa estático. Nenhum resultado foi descartado para formular as conclusões.

### Comando 1

```text
src/components/AchievementToast/AchievementToast.jsx:2:import thumbEp00 from '../../assets/images/episodes/thumb-ep00.png'
src/components/UnifiedNotification/UnifiedNotification.jsx:9:import thumbEp00 from '../../assets/images/episodes/thumb-ep00.png'
src/data/achievements-en.json:30:    "id": "episodio_zero",
src/data/achievements-en.json:31:    "nome": "Episode Zero",
src/data/achievements-en.json:36:    "trigger": "webtoon_ep00_completo"
src/data/achievements-es.json:30:    "id": "episodio_zero",
src/data/achievements-pt.json:30:    "id": "episodio_zero",
src/data/achievements-pt.json:31:    "nome": "Episódio Zero",
src/pages/content/WebtoonEpisodio.jsx:78: episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
src/pages/content/WebtoonEpisodio.jsx:81: desbloquearOuConvidarRef.current('episodio_zero')
```

### Comando 2 — mapa de conquista, CTA e fila

```text
src/context/AchievementsContext.jsx:27: notificationManager.clearByType('achievement')
src/context/AchievementsContext.jsx:55: const desbloquear = useCallback(async (achievementId) => {
src/context/AchievementsContext.jsx:76: ...insert({ user_id: user.id, achievement_id: achievementId })
src/context/AchievementsContext.jsx:87: notificationManager.push('achievement', {
src/context/AchievementsContext.jsx:108: const desbloquearOuConvidar = useCallback((achievementId) => {
src/context/AchievementsContext.jsx:115: notificationManager.push('cta_conta', { achievementId })
src/components/UnifiedNotification/UnifiedNotification.jsx:64: ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
src/components/UnifiedNotification/UnifiedNotification.jsx:65: : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
src/lib/notificationManager.js:18:const NOTIF_TTL_MS = 5 * 60 * 1000
src/lib/notificationManager.js:33:push(type, data) {
src/lib/notificationManager.js:60:pull(bypassCooldown = false) {
src/lib/notificationManager.js:115:findAndPull(type, bypassCooldown = false) {
src/pages/content/WebtoonEpisodio.jsx:81:desbloquearOuConvidarRef.current('episodio_zero')
```

### Comando 3

```text
1:import { useEffect, useRef } from 'react'
30:const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
32:const ultimaPaginaRef = useRef(null)
34:useEffect(() => {
61:useEffect(() => {
63:const observer = new IntersectionObserver(([entry]) => {
69:scrollHeight, distanceToEnd: scrollHeight - (window.scrollY + window.innerHeight),
81:desbloquearOuConvidarRef.current('episodio_zero')
```

### Comando 4

```text
src/lib/notificationManager.js:15:const STORAGE_LAST = 'ldi-notif-last-time'
src/lib/notificationManager.js:16:const STORAGE_QUEUE = 'ldi-notif-queue'
src/lib/notificationManager.js:18:const NOTIF_TTL_MS = 5 * 60 * 1000
src/lib/notificationManager.js:44:id: Date.now() + Math.random(),
src/lib/notificationManager.js:45:createdAt: Date.now(),
src/lib/notificationManager.js:165:return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || '[]')
src/lib/notificationManager.js:172:localStorage.setItem(STORAGE_QUEUE, JSON.stringify(q))
src/lib/notificationManager.js:187:return parseInt(localStorage.getItem(STORAGE_LAST) || '0', 10)
src/components/UnifiedNotification/UnifiedNotification.jsx:78:checkIntervalRef.current = setInterval(tryPull, 15000)
src/components/UnifiedNotification/UnifiedNotification.jsx:112:autoTimerRef.current = setTimeout(handleClose, duration)
```

### Comando 5

```text
src/main.jsx:24:<React.StrictMode>
src/main.jsx:25:<ReaderProvider>
src/main.jsx:28:<AuthProvider>
src/main.jsx:31:<AchievementsProvider>
src/main.jsx:33:<LanguageProvider>
src/App.jsx:14:import UnifiedNotification from './components/UnifiedNotification/UnifiedNotification'
src/App.jsx:148:<UnifiedNotification />
```

### Comando 6

```text
src/data/achievements-pt.json:30:    "id": "episodio_zero",
src/data/achievements-pt.json:31:    "nome": "Episódio Zero",
src/data/achievements-pt.json:36:    "trigger": "webtoon_ep00_completo"
src/data/achievements-en.json:30:    "id": "episodio_zero",
src/data/achievements-en.json:31:    "nome": "Episode Zero",
src/data/achievements-en.json:36:    "trigger": "webtoon_ep00_completo"
src/data/achievements-es.json:30:    "id": "episodio_zero",
src/data/achievements-es.json:36:    "trigger": "webtoon_ep00_completo"
src/data/episodios.json:18:    "thumbnail": "thumb-ep00.png",
```

### Comando 7

```text
4a1e2575 2026-07-13 fix: mojibake residual DeckBuilder + Prototype + WebtoonEpisodio + v10.192.20
b7c1e025 2026-07-11 fix: purge completo de itens expirados em qualquer leitura da fila + v10.192.17
89ec2d3b 2026-07-11 fix: findAndPull retorna item mais antigo (FIFO) + v10.192.16
97a3257c 2026-07-11 fix: TTL 5min em itens stale da fila + v10.192.15
fac68b66 2026-07-04 refactor: unificar CTA guest com sistema de achievements + v10.184.0
921513de 2026-07-04 fix: modal cadastro nunca aparece para guest + v10.183.40
c25d1f02 2026-07-02 fix: bloquear popup de achievement para usuario guest + v10.183.30
ce5d5173 2026-07-02 fix: popup conquista ignora cooldown + reset limpa fila + v10.183.29
acb09dca 2026-07-02 fix: 23505 race condition no desbloquear achievements + v10.183.28
9ff62515 2026-06-09 Unified notification queue system + v9.59
```

### Comando 8

```text
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:17:Guest rola até o fim de EP.00 → desbloquearOuConvidar → push cta_conta → UnifiedNotification
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:106:Salva em localStorage chave ldi-notif-queue.
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:4:notificationManager.js (190 linhas)
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:12:_purgeExpired remove TODOS os itens expirados
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:26:clearByType('achievement')
docs/ReportAI/2026-07-13_DOCS_atualizacao_biblia.md:37:NOTIF_TTL_MS = 5 min
```

### Comando 9

```text
11:export const SITE_VERSION = '10.192.22'
35:console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
```

Não existem `WEBTOON_VERSION` nem `ACHIEVEMENT_VERSION`.

### Comando 10

Antes: `137 / 114 / 193` linhas. Depois:

```text
165 src/pages/content/WebtoonEpisodio.jsx
140 src/context/AchievementsContext.jsx
207 src/lib/notificationManager.js
512 total
```

## Rastreamento estático completo

| Etapa | Arquivo e linha (pós-instrumentação) | Função | Condição de entrada | Estado lido | Efeito | Momento assíncrono |
|---|---|---|---|---|---|---|
| montagem | `WebtoonEpisodio.jsx:20` | componente | rota `/webtoon/:id` | params/auth/locale | render | render React |
| ID 00 | `:22`, `:92` | `useParams`/find | `id` presente | `episodios` | resolve `ep` | render |
| páginas | `:116` | `Array.from` | `ep` válido | `ep.paginas` | 21 imagens | render |
| restauração | `:56-59` | effect | mudança de id | localStorage | `scrollTo` | effect |
| observer | `:61-86` | effect | ref da última imagem | DOM/ref | observa última página | IntersectionObserver |
| conclusão | `:63-84` | callback | `entry.isIntersecting` | intersection ratio | chama conquista apenas id 00 | callback observer |
| guarda duplicada | `:61-86` | inexistente | — | — | nenhuma | — |
| decisão guest/auth | `AchievementsContext.jsx:108-120` | `desbloquearOuConvidar` | request | `user` | CTA ou desbloquear | callback |
| existente em estado | `:65-68` | `desbloquear` | auth | `desbloqueados` | retorna se presente | async callback |
| persistência | `:76` | Supabase insert | novo achievement | user/id | grava | promise |
| duplicata DB | `:78-82` | tratamento 23505 | insert duplicado | error code | estado sem toast | promise |
| CTA guest | `:113-116` | guest branch | `!user` | achievementId | push cta_conta | síncrono |
| toast auth | `:87-91` | success branch | insert sem erro | definição | push achievement | após promise |
| enqueue/storage | `notificationManager.js:33-51` | push | não duplicata consecutiva | queue localStorage | salva/notifica listeners | síncrono |
| TTL | `:175-184` | `_purgeExpired` | pull | age/TTL | remove expirados | síncrono |
| cooldown | `:70-88`, `:127-139` | pull/findAndPull | item válido | last time | aceita/bloqueia | síncrono |
| bypass | `UnifiedNotification.jsx:63-65` | tryPull | current null | user | prioridade auth/guest | effect/subscriber/poll |
| retirada | `notificationManager.js:80-89`, `:128-145` | pull/findAndPull | selecionável | fila | remove/salva | síncrono |
| estado ativo | `UnifiedNotification.jsx:66-72` | tryPull | item retornado | item | setCurrent | React state |
| modal | `:153-198` | render | current achievement/cta | dados/i18n | overlay | render React |
| fechamento | `:116-124` | handleClose | clique/timer | current | null após 300ms | timer existente |

## Matriz de hipóteses

| Hipótese | Status | Evidência |
|---|---|---|
| H1 condição verdadeira no mount | INCONCLUSIVA | observer pode emitir no layout inicial; `[WEBTOON:COMPLETE_CHECK]` captura geometria e `isIntersecting` |
| H2 load confundido com leitura | REFUTADA estaticamente | não há `onLoad`, promise ou contador de imagens no fluxo de conclusão |
| H3 notificação antiga | INCONCLUSIVA | queue persiste; logs capturam `createdAt`, `ageMs`, TTL e tamanho |
| H4 exibição atrasada | INCONCLUSIVA | bypass existe para CTA/achievement; idade real decidirá |
| H5 efeito duplo | INCONCLUSIVA | StrictMode confirmado em `main.jsx:24`; traces/timestamps distinguirão callbacks |
| H6 replay persistido | REFUTADA estaticamente | `carregarDoSupabase` apenas atualiza `desbloqueados`; log marca `requestedToast:false` |
| H7 conflito guest/auth | INCONCLUSIVA | logout limpa achievement, não CTA; cenário manual necessário |
| H8 chave incorreta | REFUTADA estaticamente | rota 00 chama exclusivamente `episodio_zero`, presente e igual em PT/EN/ES |
| H9 rota/estado anterior | INCONCLUSIVA | effect depende de id e restaura scroll salvo; navegação 01→00 precisa de runtime |
| H10 seleção incorreta | INCONCLUSIVA | FIFO/purge visíveis; logs registram tipo/chave/idade selecionados |

## Instrumentação antes/depois e o que prova

Antes, o observer apenas testava `entry.isIntersecting` e chamava a conquista. Depois (`WebtoonEpisodio.jsx:34-84`), `[WEBTOON:INIT]`, `[WEBTOON:COMPLETE_CHECK]` e trace do trigger registram rota, episódio, páginas, geometria, resultado e modo. A condição `entry.isIntersecting`, threshold `0.1` e dependência `[id]` permanecem iguais.

Antes, os branches de achievement retornavam silenciosamente. Depois (`AchievementsContext.jsx:39-120`), request/existing/guest/auth registram se persistência/toast foram solicitados e por quê. Inserts, retornos e push permanecem nas mesmas posições lógicas.

Antes, push/pull não expunham idade e seleção. Depois (`notificationManager.js:33-145`), os logs registram fila antes/depois, `createdAt`, idade, TTL, cooldown e bypass. Nenhuma constante, storage key, deduplicação, splice, shift ou persistência mudou.

Antes, `UnifiedNotification` apenas fazia pull/set/close. Depois (`UnifiedNotification.jsx:35-124`), logs registram check, item mostrado e fechamento. O único ajuste de dependência foi no callback de log de fechamento para capturar o `current`; ele não muda o effect do observer, fila ou regra de seleção.

## Grep pós-instrumentação

O comando regex pedido produziu erro bruto no Git grep por colchete não escapado:

```text
/usr/bin/grep: Unmatched [, [^, [:, [., or [=
```

Reexecutado de modo literal com `grep -RInF -e '[WEBTOON:' -e '[ACH:' -e '[NOTIF:'`:

```text
WebtoonEpisodio.jsx:36:[WEBTOON:INIT]
WebtoonEpisodio.jsx:65:[WEBTOON:COMPLETE_CHECK]
WebtoonEpisodio.jsx:76:[WEBTOON:COMPLETE_TRIGGER]
AchievementsContext.jsx:39,56,62,66,71,74,75,79,109,114,118:[ACH:*]
notificationManager.js:38,49,62,64,83,88,118,133,138,144:[NOTIF:*]
UnifiedNotification.jsx:35,37,67,117:[NOTIF:*]/[ACH:*]
```

`git diff --check`: sem erros. O diff completo foi revisado antes do commit; contém somente versão/mapa, instrumentação, este relatório e atualização AST obrigatória do Graphify. Alterações locais pré-existentes de jogos/marketing foram excluídas do staging.

## Teste lógico dos dez fluxos

| Fluxo | Resultado da observabilidade |
|---|---|
| guest abre e não rola | ✅ init → primeiro observer → eventual request/pull/show |
| guest chega ao final | ✅ trigger → guest → enqueue → pull → show |
| auth sem conquista | ✅ request → existing → persist → enqueue → show |
| auth com conquista | ✅ load sem toast versus request já existente |
| conclusão + reload | ✅ createdAt/age/TTL/queue/pull |
| 01 → 00 | ✅ pathname/episodeId/achievementId |
| guest → auth | ✅ mode, tipo, queue e seleção |
| dupla montagem | ✅ timestamps e dois traces |
| imagens carregando | ✅ mudanças de scrollHeight entre init/callbacks relevantes |
| segurança | ✅ sem email/token/user id; sem timer novo; sem limpeza nova; sem condição alterada |

## Build

```text
> illusion-fight@1.0.0 build
> vite build && node scripts/prerender-routes.js
vite v8.0.16 building client environment for production...
✓ 1341 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html 5.00 kB │ gzip: 1.85 kB
dist/assets/index-DvSQ7-OD.css 636.06 kB │ gzip: 102.74 kB
dist/assets/index-BWTt9T55.js 2,913.28 kB │ gzip: 850.14 kB │ map: 8,028.18 kB
✓ built in 5.99s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
Warnings: dynamic imports supertrunfo pt/en/es também estáticos; chunk >500 kB; plugin timings. Exit code 0.
```

Sourcemap permanece habilitado (map principal de 8,028.18 kB). `e2e/routes.spec.js`, Playwright e servidor local não foram executados.

## Conclusão

**PRIMEIRO ESTADO INCORRETO:** PENDENTE — será o primeiro log entre observer, request e pull que divergir do esperado.

**EVENTO ANTERIOR CORRETO:** PENDENTE EVIDÊNCIA MANUAL.

**EVENTO INCORRETO:** ainda sem valores reais de runtime.

**EFEITO PRODUZIDO:** a cadeia estática mostra que um observer verdadeiro ou CTA antigo selecionado chega ao modal, mas não distingue qual ocorreu no caso observado.
**CLASSIFICAÇÃO:** pendente entre detecção prematura, notificação antiga, consumo atrasado, duplicidade ou conflito guest/auth.

**STATUS: PENDENTE EVIDÊNCIA MANUAL**

Não há causa raiz confirmada sem console e screenshot do caso real.

## Testes manuais — Isaias

Preparação comum: abrir DevTools; Preserve log; habilitar Info/Debug/Verbose; confirmar v10.192.22; hard reload; copiar desde `[WEBTOON:INIT]` até o modal.

1. A — janela anônima nova, `/webtoon/00`, não rolar, esperar 10s, screenshot e todos `[WEBTOON:]`, `[ACH:]`, `[NOTIF:]`.
2. B — mesma sessão, reload, rolar lentamente até a última página, capturar mudança para concluída, screenshot final/modal.
3. C — após concluir guest, topo + reload em até 5 min; capturar idade, fila, TTL, cooldown e item.
4. D — conta de teste sem conquista: 10s no topo e depois final; logs de persistência/toast.
5. E — conta com conquista: topo sem rolar; verificar load, novo request, toast e item antigo.
6. F — `/webtoon/01` → `/webtoon/00`; capturar IDs.
7. G — concluir guest, autenticar no mesmo navegador, voltar; capturar CTA remanescente.

Nenhum cenário fica concluído sem screenshot e logs reais enviados pelo Isaias. Não remover conquista real nem alterar Supabase.

## Workflow e arquivos

| Arquivo | O que mudou | Versão/status |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | 10.192.21 → **10.192.22** |
| `SITE_MAP.md` | versão + diagnóstico, sem declarar correção | ✅ |
| `WebtoonEpisodio.jsx` | init/check/trigger | ✅ |
| `AchievementsContext.jsx` | request/existing/guest/auth | ✅ |
| `notificationManager.js` | enqueue/pull | ✅ |
| `UnifiedNotification.jsx` | show/close | ✅ |
| `graphify-out/` | `graphify update .` AST-only | ✅ |
| **Build** | Vite + 26 prerenders | ✅ |
| **Commit** | `debug: instrumentar timing do trofeu webtoon + v10.192.22` | pendente no momento de autoria |
| **Push** | main | pendente no momento de autoria |
| **Deploy** | GitHub Pages | pendente no momento de autoria |

### Avaliação de tamanho

Nenhum arquivo de código tocado tinha mais de 300 linhas antes da edição (137, 114, 193 e UnifiedNotification 259); portanto não foi necessária proposta de extração. Nenhuma decisão arquitetural nova foi tomada: apenas instrumentação, logo não há proposta de adição ao AGENTS.md.
