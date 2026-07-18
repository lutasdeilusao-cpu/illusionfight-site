# INV — timing do troféu “Episode Zero”

**Data:** 2026-07-18

**Versão da instrumentação:** 10.192.21 → **10.192.22**

**Versão da complementação documental:** 10.192.22 → **10.192.23**

**Escopo:** investigação e instrumentação; nenhuma correção comportamental.
**Status:** **PENDENTE EVIDÊNCIA MANUAL**

## Sintoma e regra esperada

Em `/webtoon/00`, o modal `TROPHY AVAILABLE / Episode Zero / You finished reading!` foi observado no topo da leitura. Guest pode ler sem conta e o CTA só pode aparecer após alcançar o final. Para autenticado, persistência e notificação também só podem ocorrer após o final. “Modal exibido” e “conquista desbloqueada” são eventos distintos neste relatório.

## Prova de leitura — comandos e outputs brutos

O ambiente é Windows/PowerShell. `bash --version` retornou que não há distribuição WSL. Os comandos foram executados com `C:\Program Files\Git\usr\bin\grep.exe` e `wc.exe`, preservando os argumentos pedidos. Os outputs brutos integrais dos comandos 2 e 8 estão nos apêndices A e B, sem resumo ou omissão.

**Nota temporal obrigatória:** os comandos 2 e 8 integrais dos apêndices foram reexecutados após a edição de instrumentação. Eles complementam a auditoria do estado entregue, mas não constituem prova temporal original da Etapa 1 anterior à primeira edição.

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

Antes, `UnifiedNotification` apenas fazia pull/set/close. A primeira entrega alterou `handleClose` de `useCallback(..., [])` para `useCallback(..., [current])`. Essa troca poderia recriar `handleClose`, propagar nova identidade a callbacks dependentes e interferir em efeitos ou timers. Na complementação v10.192.23, a dependência foi restaurada para `[]`; `currentRef.current = current` fornece ao log o valor ativo sem recriar `handleClose`. O diff integral do apêndice D prova a inclusão do ref, a leitura por `activeNotification` e a dependência final `[]`.

Os trechos integrais ANTES/DEPOIS, com numeração equivalente a `nl -ba`, estão no apêndice C.

### Auditoria de encoding dos quatro arquivos

O mojibake visível em alguns trechos DEPOIS foi produzido pela leitura do terminal PowerShell sem encoding UTF-8 explícito. Ele não está gravado nos arquivos. A leitura foi repetida com `[System.IO.File]::ReadAllText(..., Encoding.UTF8)` e a busca literal por `Ã.`, `â€`, `â€”`, `Â.` e `ðŸ` retornou `ZERO OCORRENCIAS` em cada arquivo:

```text
===== MOJIBAKE LITERAL: src/pages/content/WebtoonEpisodio.jsx =====
ZERO OCORRENCIAS
===== MOJIBAKE LITERAL: src/context/AchievementsContext.jsx =====
ZERO OCORRENCIAS
===== MOJIBAKE LITERAL: src/lib/notificationManager.js =====
ZERO OCORRENCIAS
===== MOJIBAKE LITERAL: src/components/UnifiedNotification/UnifiedNotification.jsx =====
ZERO OCORRENCIAS
```

Leituras UTF-8 reais encontraram `Leu o episódio`, `—`, `notificações`, `sessão` e `não` corretamente. A prova de bytes para `episódio` em `WebtoonEpisodio.jsx` foi:

```text
offset=2235
65 70 69 73 C3 B3 64 69 6F
```

`C3 B3` é a codificação UTF-8 de `ó`. Como não havia mojibake nos quatro arquivos, nenhum conteúdo de encoding foi alterado e não existe trecho corretivo ANTES/DEPOIS a registrar; apenas a captura documental foi esclarecida.

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

`git diff --check`: sem erros. O diff integral dos arquivos autorais da entrega está no apêndice D. Alterações locais pré-existentes de jogos/marketing foram excluídas do staging.

### Graphify

A inclusão dos arquivos rastreados de `graphify-out/` é exigida literalmente pelo `AGENTS.md`, seção `graphify`: **“After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).”** Portanto, os artefatos rastreados atualizados permanecem na task. Backups e cache AST não rastreados gerados pela ferramenta não foram incluídos no commit. O diff autoral completo permanece no apêndice D; `graph.json` e demais saídas mecânicas são identificados separadamente pelo commit.

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

O output bruto completo, incluindo todos os assets e warnings reais, está no apêndice E. Exit code: 0.

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

Preparação comum: abrir DevTools; Preserve log; habilitar Info/Debug/Verbose; confirmar v10.192.23; hard reload; copiar desde `[WEBTOON:INIT]` até o modal.

1. A — janela anônima nova, `/webtoon/00`, não rolar, esperar 10s, screenshot e todos `[WEBTOON:]`, `[ACH:]`, `[NOTIF:]`.
2. B — mesma sessão, reload, rolar lentamente até a última página, capturar mudança para concluída, screenshot final/modal.
3. C — após concluir guest, topo + reload em até 5 min; capturar idade, fila, TTL, cooldown e item.
4. D — conta de teste sem conquista: 10s no topo e depois final; logs de persistência/toast.
5. E — conta com conquista: topo sem rolar; verificar load, novo request, toast e item antigo.
6. F — `/webtoon/01` → `/webtoon/00`; capturar IDs.
7. G — concluir guest, autenticar no mesmo navegador, voltar; capturar CTA remanescente.

Nenhum cenário fica concluído sem screenshot e logs reais enviados pelo Isaias. Não remover conquista real nem alterar Supabase.

## Teste Playwright local visível — guest

Executado em Chromium visível (`--headed`), sem conta e sem escrita no Supabase. O cenário confirmou `SITE_VERSION=10.192.23`, permaneceu 10 segundos no topo sem overlay, rolou até o fim e registrou o trigger somente depois da rolagem. Dez segundos depois do enqueue, o overlay não estava visível. Esta execução é evidência automatizada complementar e não substitui os cenários manuais nem autoriza declarar causa raiz.

```text
Running 1 test using 1 worker

[PW] SITE_VERSION=10.192.23
[PW] TOPO_10S={"url":"http://localhost:5173/webtoon/00","title":"Apresentação — Lutas de Ilusão","overlay":0}
[PW] FINAL={"scrollY":26284.544921875,"scrollHeight":27005,"queue":"[]","lastTime":null,"overlay":0,"dialogs":0}
[PW] LOGS_INSTRUMENTADOS_INICIO
[log] [WEBTOON:INIT] {timestamp: 2026-07-18T19:14:46.397Z, pathname: /webtoon/00, episodeId: 00, totalPages: 21, origin: mount}
[log] [WEBTOON:INIT] {timestamp: 2026-07-18T19:14:48.149Z, pathname: /webtoon/00, episodeId: 00, totalPages: 21, origin: mount}
[log] [WEBTOON:COMPLETE_CHECK] {timestamp: 2026-07-18T19:14:50.594Z, pathname: /webtoon/00, episodeId: 00, totalPages: 21, origin: observer}
[log] [WEBTOON:COMPLETE_CHECK] {timestamp: 2026-07-18T19:15:11.148Z, pathname: /webtoon/00, episodeId: 00, totalPages: 21, origin: observer}
[trace] [WEBTOON:COMPLETE_TRIGGER] {timestamp: 2026-07-18T19:15:11.148Z, pathname: /webtoon/00, episodeId: 00, achievementId: episodio_zero, origin: observer}
[trace] [ACH:REQUEST] {timestamp: 2026-07-18T19:15:11.148Z, achievementId: episodio_zero, mode: guest, entrypoint: desbloquearOuConvidar}
[log] [ACH:GUEST_PATH] {timestamp: 2026-07-18T19:15:11.149Z, achievementId: episodio_zero, mode: guest, requestedPersistence: false, requestedToast: true}
[log] [NOTIF:ENQUEUE] {timestamp: 2026-07-18T19:15:11.149Z, type: cta_conta, key: episodio_zero, origin: push, notificationId: 1784402111149.8076}
[PW] LOGS_INSTRUMENTADOS_FIM
[PW] ERROS=[]

1 passed (44.3s)
```

## Workflow e arquivos

| Arquivo | O que mudou | Versão/status |
|---|---|---|
| `src/config/version.js` | SITE_VERSION da instrumentação | 10.192.21 → **10.192.22** |
| `src/config/version.js` | SITE_VERSION da complementação | 10.192.22 → **10.192.23** |
| `SITE_MAP.md` | versão + diagnóstico, sem declarar correção | ✅ |
| `WebtoonEpisodio.jsx` | init/check/trigger | ✅ |
| `AchievementsContext.jsx` | request/existing/guest/auth | ✅ |
| `notificationManager.js` | enqueue/pull | ✅ |
| `UnifiedNotification.jsx` | show/close | ✅ |
| `graphify-out/` | `graphify update .` AST-only | ✅ |
| **Build** | Vite + 26 prerenders | ✅ |
| **Commit inicial** | `1427c48b` — `debug: instrumentar timing do trofeu webtoon + v10.192.22` | ✅ |
| **Commit v10.192.23** | `430f0d82` — `docs: completar evidencias da investigacao webtoon + v10.192.23` | ✅ |
| **Push v10.192.23** | `1427c48b..430f0d82 main -> main`; remoto confirmado em `430f0d822a577ff97f57acd29deb6a78f31f72a5` | ✅ |
| **Deploy v10.192.23** | `gh-pages -d dist` → `Published` (exit code 0) | ✅ |

O commit documental que renomeia este próprio arquivo é informado na resposta da conversa, pois um commit não pode conter autorreferencialmente o próprio hash sem alterá-lo.

### Avaliação de tamanho

Nenhum arquivo de código tocado tinha mais de 300 linhas antes da edição (137, 114, 193 e UnifiedNotification 259); portanto não foi necessária proposta de extração. Nenhuma decisão arquitetural nova foi tomada: apenas instrumentação, logo não há proposta de adição ao AGENTS.md.

## Apêndice A — Output bruto integral do comando 2

```text
src/context/AchievementsContext.jsx:5:import { notificationManager } from '../lib/notificationManager'
src/context/AchievementsContext.jsx:6:import todosAchievements from '../data/achievements-pt.json'
src/context/AchievementsContext.jsx:8:const STORAGE_KEY = 'ldi-achievements'
src/context/AchievementsContext.jsx:14:  const [toastPendente, setToastPendente] = useState(null)
src/context/AchievementsContext.jsx:24:      // Sem conta = sem achievements. Limpa fila p/ evitar que notificações
src/context/AchievementsContext.jsx:25:      // de achievements de sessão anterior apareçam para guest (issue #guest-popup)
src/context/AchievementsContext.jsx:27:      notificationManager.clearByType('achievement')
src/context/AchievementsContext.jsx:37:    const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
src/context/AchievementsContext.jsx:38:    if (error) { console.error('Erro ao carregar achievements:', error); return }
src/context/AchievementsContext.jsx:42:      reason: 'existing-achievements-loaded-without-toast',
src/context/AchievementsContext.jsx:44:    if (data && data.length > 0) setDesbloqueados(data.map(d => d.achievement_id))
src/context/AchievementsContext.jsx:50:    const inserts = salvos.map(id => ({ user_id: userId, achievement_id: id }))
src/context/AchievementsContext.jsx:51:    await supabase.from('user_achievements').upsert(inserts, { onConflict: 'user_id,achievement_id' })
src/context/AchievementsContext.jsx:55:  const desbloquear = useCallback(async (achievementId) => {
src/context/AchievementsContext.jsx:57:      timestamp: new Date().toISOString(), achievementId,
src/context/AchievementsContext.jsx:58:      mode: user ? 'authenticated' : 'guest', alreadyExisting: desbloqueados.includes(achievementId),
src/context/AchievementsContext.jsx:60:    // Sem conta logada = não desbloqueia achievement
src/context/AchievementsContext.jsx:62:      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: false, reason: 'no-authenticated-user' })
src/context/AchievementsContext.jsx:65:    if (desbloqueados.includes(achievementId)) {
src/context/AchievementsContext.jsx:66:      console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: false, requestedToast: false, reason: 'already-unlocked-in-state' })
src/context/AchievementsContext.jsx:69:    const achievement = todosAchievements.find(a => a.id === achievementId)
src/context/AchievementsContext.jsx:70:    if (!achievement) {
src/context/AchievementsContext.jsx:71:      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: false, requestedToast: false, reason: 'achievement-definition-not-found' })
src/context/AchievementsContext.jsx:74:    console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: false, requestedPersistence: true, requestedToast: true, reason: 'new-unlock-request' })
src/context/AchievementsContext.jsx:75:    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'persisting-new-achievement' })
src/context/AchievementsContext.jsx:76:    const { error } = await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
src/context/AchievementsContext.jsx:79:        console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: true, requestedToast: false, reason: 'database-duplicate' })
src/context/AchievementsContext.jsx:80:        setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
src/context/AchievementsContext.jsx:86:    setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
src/context/AchievementsContext.jsx:87:    notificationManager.push('achievement', {
src/context/AchievementsContext.jsx:88:      nome: achievement.nome,
src/context/AchievementsContext.jsx:89:      descricao: achievement.descricao,
src/context/AchievementsContext.jsx:90:      icone: achievement.icone,
src/context/AchievementsContext.jsx:92:    // Registrar evento de conquista (usa supabase diretamente p/ evitar dependência cíclica)
src/context/AchievementsContext.jsx:95:        .select('id').eq('user_id', user.id).eq('tipo', 'conquista').eq('descricao', `Desbloqueou: ${achievement.nome}`).limit(1)
src/context/AchievementsContext.jsx:98:          user_id: user.id, tipo: 'conquista', descricao: `Desbloqueou: ${achievement.nome}`, valor: achievement.tier || 1,
src/context/AchievementsContext.jsx:101:    } catch (e) { console.error('[Eventos] erro ao registrar conquista:', e) }
src/context/AchievementsContext.jsx:105:    desbloquear('conhece_a_gangue')
src/context/AchievementsContext.jsx:108:  const desbloquearOuConvidar = useCallback((achievementId) => {
src/context/AchievementsContext.jsx:110:      timestamp: new Date().toISOString(), achievementId,
src/context/AchievementsContext.jsx:111:      mode: user ? 'authenticated' : 'guest', entrypoint: 'desbloquearOuConvidar',
src/context/AchievementsContext.jsx:114:      console.log('[ACH:GUEST_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: true, reason: 'guest-cta-enqueue' })
src/context/AchievementsContext.jsx:115:      notificationManager.push('cta_conta', { achievementId })
src/context/AchievementsContext.jsx:118:    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'delegating-to-unlock' })
src/context/AchievementsContext.jsx:119:    desbloquear(achievementId)
src/context/AchievementsContext.jsx:120:  }, [desbloquear, user])
src/context/AchievementsContext.jsx:123:    setToastPendente(null)
src/context/AchievementsContext.jsx:128:    const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
src/context/AchievementsContext.jsx:129:    if (error) { console.error('Erro ao recarregar achievements:', error); return }
src/context/AchievementsContext.jsx:130:    setDesbloqueados(data ? data.map(d => d.achievement_id) : [])
src/context/AchievementsContext.jsx:134:    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, desbloquearOuConvidar, toastPendente, fecharToast, refresh, migrarLocalParaSupabase, registrarGangue }}>
src/context/AuthContext.jsx:90:              await supabase.from('user_achievements').upsert({
src/context/AuthContext.jsx:92:                achievement_id: 'recrutado'
src/context/AuthContext.jsx:93:              }, { onConflict: 'user_id,achievement_id' })
src/context/EventosContext.jsx:23:  { id: 'conquista_1',    label: 'Desbloqueou uma conquista',         tipo: 'conquista',          valor_min: 1 },
src/components/AchievementToast/AchievementToast.css:1:.achievement-overlay {
src/components/AchievementToast/AchievementToast.css:9:  animation: achievement-fadein 0.3s ease;
src/components/AchievementToast/AchievementToast.css:12:@keyframes achievement-fadein {
src/components/AchievementToast/AchievementToast.css:17:.achievement-card {
src/components/AchievementToast/AchievementToast.css:26:  animation: achievement-enter 0.5s ease forwards;
src/components/AchievementToast/AchievementToast.css:30:@keyframes achievement-enter {
src/components/AchievementToast/AchievementToast.css:36:.achievement-jack {
src/components/AchievementToast/AchievementToast.css:45:.achievement-label {
src/components/AchievementToast/AchievementToast.css:54:.achievement-icone {
src/components/AchievementToast/AchievementToast.css:60:.achievement-nome {
src/components/AchievementToast/AchievementToast.css:69:.achievement-descricao {
src/components/AchievementToast/AchievementToast.css:77:.achievement-btn {
src/components/AchievementToast/AchievementToast.css:91:.achievement-btn:hover {
src/components/AchievementToast/AchievementToast.css:98:.achievement-particles {
src/components/AchievementToast/AchievementToast.jsx:4:import './AchievementToast.css'
src/components/AchievementToast/AchievementToast.jsx:6:export default function AchievementToast({ achievement, fecharToast }) {
src/components/AchievementToast/AchievementToast.jsx:14:    <div className="achievement-overlay" onClick={fecharToast}>
src/components/AchievementToast/AchievementToast.jsx:15:      <div className="achievement-card" onClick={e => e.stopPropagation()}>
src/components/AchievementToast/AchievementToast.jsx:16:        <div className="achievement-particles">
src/components/AchievementToast/AchievementToast.jsx:21:        <img src={thumbEp00} className="achievement-jack" alt="Jack" />
src/components/AchievementToast/AchievementToast.jsx:22:        <div className="achievement-label">{t('achievement.titulo')}</div>
src/components/AchievementToast/AchievementToast.jsx:23:        <div className="achievement-icone">{achievement.icone}</div>
src/components/AchievementToast/AchievementToast.jsx:24:        <div className="achievement-nome">{achievement.nome}</div>
src/components/AchievementToast/AchievementToast.jsx:25:        <div className="achievement-descricao">{achievement.descricao}</div>
src/components/AchievementToast/AchievementToast.jsx:26:        <button className="achievement-btn" onClick={fecharToast}>{t('achievement.continuar')}</button>
src/components/LDINotification/LDINotification.jsx:2:import { notificationManager } from '../../lib/notificationManager'
src/components/LDINotification/LDINotification.jsx:50:    notificationManager.push('ldi_tip', {
src/components/Puzzles/PuzzleLabirinto.jsx:26:  const queue = [{ r: start.r, c: start.c, path: [start] }]
src/components/Puzzles/PuzzleLabirinto.jsx:32:  while (queue.length) {
src/components/Puzzles/PuzzleLabirinto.jsx:33:    const { r, c, path } = queue.shift()
src/components/Puzzles/PuzzleLabirinto.jsx:40:        queue.push({ r: nr, c: nc, path: [...path, { r: nr, c: nc }] })
src/components/Puzzles/PuzzleStealthGrid.jsx:34:  const queue = [[0,0]]
src/components/Puzzles/PuzzleStealthGrid.jsx:36:  while (queue.length) {
src/components/Puzzles/PuzzleStealthGrid.jsx:37:    const [r,c] = queue.shift()
src/components/Puzzles/PuzzleStealthGrid.jsx:43:        visited.add(key); queue.push([nr,nc])
src/components/Puzzles/PuzzleStealthGrid.jsx:92:  const [toast, setToast] = useState(false)
src/components/Puzzles/PuzzleStealthGrid.jsx:175:      setAlarm(true); setDone(true); setToast(true)
src/components/Puzzles/PuzzleStealthGrid.jsx:177:      setTimeout(() => setToast(false), 1500)
src/components/UnifiedNotification/UnifiedNotification.jsx:3:import { notificationManager, NotificationType } from '../../lib/notificationManager'
src/components/UnifiedNotification/UnifiedNotification.jsx:10:import achievPt from '../../data/achievements-pt.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:11:import achievEn from '../../data/achievements-en.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:12:import achievEs from '../../data/achievements-es.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:13:import stringsPt from '../../data/achievements-strings-pt.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:14:import stringsEn from '../../data/achievements-strings-en.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:15:import stringsEs from '../../data/achievements-strings-es.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:18:import '../AchievementToast/AchievementToast.css'
src/components/UnifiedNotification/UnifiedNotification.jsx:35:  // Tenta puxar da fila — mas primeiro verifica notificação pendente da Nina
src/components/UnifiedNotification/UnifiedNotification.jsx:37:    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', mode: user ? 'authenticated' : 'guest', currentType: current?.type ?? null, queueLength: notificationManager.queueLength() })
src/components/UnifiedNotification/UnifiedNotification.jsx:39:      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', result: 'active-notification-blocks-pull', currentType: current.type, queueLength: notificationManager.queueLength() })
src/components/UnifiedNotification/UnifiedNotification.jsx:43:    // Defesa: guest não pode ver achievement de jeito nenhum
src/components/UnifiedNotification/UnifiedNotification.jsx:45:      notificationManager.clearByType('achievement')
src/components/UnifiedNotification/UnifiedNotification.jsx:48:    // PRIORIDADE MÁXIMA: Nina notification (não passa pelo notificationManager)
src/components/UnifiedNotification/UnifiedNotification.jsx:63:    // Fallback: fila normal do notificationManager
src/components/UnifiedNotification/UnifiedNotification.jsx:64:    // Achievement (logado) ou CTA (guest) tem prioridade — busca na fila inteira com bypass de cooldown
src/components/UnifiedNotification/UnifiedNotification.jsx:66:      ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
src/components/UnifiedNotification/UnifiedNotification.jsx:67:      : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
src/components/UnifiedNotification/UnifiedNotification.jsx:69:      console.log('[ACH:TOAST_SHOW]', { timestamp: new Date().toISOString(), type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: Date.now() - item.createdAt, mode: user ? 'authenticated' : 'guest', reason: 'queue-item-selected' })
src/components/UnifiedNotification/UnifiedNotification.jsx:81:    const unsub = notificationManager.subscribe(tryPull)
src/components/UnifiedNotification/UnifiedNotification.jsx:120:    console.log('[ACH:TOAST_CLOSE]', { timestamp: new Date().toISOString(), type: activeNotification?.type ?? null, key: activeNotification?.data?.achievementId ?? activeNotification?.data?.nome ?? null, notificationId: activeNotification?.id ?? null, reason: 'close-requested' })
src/components/UnifiedNotification/UnifiedNotification.jsx:152:  // ACHIEVEMENT — reusa classes de AchievementToast.css
src/components/UnifiedNotification/UnifiedNotification.jsx:157:      <div className="achievement-overlay" onClick={handleClose}>
src/components/UnifiedNotification/UnifiedNotification.jsx:158:        <div className="achievement-card" onClick={e => e.stopPropagation()}>
src/components/UnifiedNotification/UnifiedNotification.jsx:159:          <div className="achievement-particles">
src/components/UnifiedNotification/UnifiedNotification.jsx:164:          <img src={thumbEp00} className="achievement-jack" alt="Jack" />
src/components/UnifiedNotification/UnifiedNotification.jsx:165:          <div className="achievement-label">{t('achievement.titulo')}</div>
src/components/UnifiedNotification/UnifiedNotification.jsx:166:          <div className="achievement-icone">{ach.icone}</div>
src/components/UnifiedNotification/UnifiedNotification.jsx:167:          <div className="achievement-nome">{ach.nome}</div>
src/components/UnifiedNotification/UnifiedNotification.jsx:168:          <div className="achievement-descricao">{ach.descricao}</div>
src/components/UnifiedNotification/UnifiedNotification.jsx:169:          <button className="achievement-btn" onClick={handleClose}>
src/components/UnifiedNotification/UnifiedNotification.jsx:170:            {t('achievement.continuar')}
src/components/UnifiedNotification/UnifiedNotification.jsx:178:  // CTA_CONTA — guest CTA, mesma UI do achievement
src/components/UnifiedNotification/UnifiedNotification.jsx:181:    const ach = achievList.find(a => a.id === current.data.achievementId)
src/components/UnifiedNotification/UnifiedNotification.jsx:183:      <div className="achievement-overlay" onClick={handleClose}>
src/components/UnifiedNotification/UnifiedNotification.jsx:184:        <div className="achievement-card" onClick={e => e.stopPropagation()}>
src/components/UnifiedNotification/UnifiedNotification.jsx:185:          <div className="achievement-particles">
src/components/UnifiedNotification/UnifiedNotification.jsx:190:          <img src={thumbEp00} className="achievement-jack" alt="Jack" />
src/components/UnifiedNotification/UnifiedNotification.jsx:191:          <div className="achievement-label">{ctaStrings.cta_conta.titulo}</div>
src/components/UnifiedNotification/UnifiedNotification.jsx:192:          {ach && <div className="achievement-icone">{ach.icone}</div>}
src/components/UnifiedNotification/UnifiedNotification.jsx:193:          {ach && <div className="achievement-nome">{ach.nome}</div>}
src/components/UnifiedNotification/UnifiedNotification.jsx:194:          <div className="achievement-descricao">{ctaStrings.cta_conta.mensagem}</div>
src/components/UnifiedNotification/UnifiedNotification.jsx:195:          <button className="achievement-btn" onClick={() => { handleClose(); navigate('/cadastro') }}>
src/components/UnifiedNotification/UnifiedNotification.jsx:196:            {ctaStrings.cta_conta.botao}
src/lib/notificationManager.js:8: *   import { notificationManager } from '../../lib/notificationManager'
src/lib/notificationManager.js:9: *   notificationManager.push('ldi_tip', { mensagem, cta, url, personagem })
src/lib/notificationManager.js:10: *   notificationManager.push('achievement', { nome, descricao, icone })
src/lib/notificationManager.js:11: *   notificationManager.push('cta_conta', { achievementId })
src/lib/notificationManager.js:12: *   notificationManager.push('nina_music', { greetingKey })
src/lib/notificationManager.js:16:const STORAGE_QUEUE = 'ldi-notif-queue'
src/lib/notificationManager.js:18:const NOTIF_TTL_MS = 5 * 60 * 1000 // 5 minutos — itens mais velhos são descartados silenciosamente
src/lib/notificationManager.js:21:  ACHIEVEMENT: 'achievement',
src/lib/notificationManager.js:22:  CTA_CONTA: 'cta_conta',
src/lib/notificationManager.js:27:export const notificationManager = {
src/lib/notificationManager.js:29:   * Adiciona uma notificação à fila.
src/lib/notificationManager.js:30:   * @param {'achievement'|'cta_conta'|'ldi_tip'|'nina_music'} type
src/lib/notificationManager.js:34:    const queue = this._getQueue()
src/lib/notificationManager.js:35:    const beforeLength = queue.length
src/lib/notificationManager.js:37:    if (queue.length > 0 && queue[queue.length - 1].type === type) {
src/lib/notificationManager.js:38:      console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', queueBefore: beforeLength, queueAfter: queue.length, createdAt: null, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'rejected-consecutive-duplicate' })
src/lib/notificationManager.js:47:    queue.push(item)
src/lib/notificationManager.js:48:    this._saveQueue(queue)
src/lib/notificationManager.js:49:    console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', notificationId: item.id, queueBefore: beforeLength, queueAfter: queue.length, createdAt: item.createdAt, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'enqueued' })
src/lib/notificationManager.js:54:   * Tenta obter a próxima notificação da fila.
src/lib/notificationManager.js:55:   * Respeita o cooldown de 15 min, a menos que bypassCooldown=true.
src/lib/notificationManager.js:56:   * Se aprovada, remove da fila e registra o timestamp.
src/lib/notificationManager.js:57:   * @param {boolean} [bypassCooldown=false] - se true, ignora o cooldown de 15 min
src/lib/notificationManager.js:60:  pull(bypassCooldown = false) {
src/lib/notificationManager.js:61:    const queue = this._getQueue()
src/lib/notificationManager.js:62:    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'pull', requestedType: null, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })
src/lib/notificationManager.js:63:    if (queue.length === 0) {
src/lib/notificationManager.js:64:      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'empty-queue', queueAfter: 0 })
src/lib/notificationManager.js:71:    const changed = this._purgeExpired(queue, now)
src/lib/notificationManager.js:72:    if (queue.length === 0) {
src/lib/notificationManager.js:73:      if (changed) this._saveQueue(queue)
src/lib/notificationManager.js:77:    const item = queue[0]
src/lib/notificationManager.js:79:    if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
src/lib/notificationManager.js:80:      queue.shift()
src/lib/notificationManager.js:81:      this._saveQueue(queue)
src/lib/notificationManager.js:83:      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'selected', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:87:    if (changed) this._saveQueue(queue)
src/lib/notificationManager.js:88:    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'cooldown-active', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:92:  /** Espia a primeira da fila sem remover */
src/lib/notificationManager.js:94:    const queue = this._getQueue()
src/lib/notificationManager.js:95:    return queue.length > 0 ? queue[0] : null
src/lib/notificationManager.js:98:  /** Quantidade de notificações na fila */
src/lib/notificationManager.js:99:  queueLength() {
src/lib/notificationManager.js:115:  findAndPull(type, bypassCooldown = false) {
src/lib/notificationManager.js:116:    const queue = this._getQueue()
src/lib/notificationManager.js:118:    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'findAndPull', requestedType: type, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })
src/lib/notificationManager.js:121:    const changed = this._purgeExpired(queue, now)
src/lib/notificationManager.js:124:    for (let i = 0; i < queue.length; i++) {
src/lib/notificationManager.js:125:      if (queue[i].type !== type) continue
src/lib/notificationManager.js:128:      if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
src/lib/notificationManager.js:129:        const valid = queue[i]
src/lib/notificationManager.js:130:        queue.splice(i, 1)
src/lib/notificationManager.js:131:        this._saveQueue(queue)
src/lib/notificationManager.js:133:        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'selected', requestedType: type, type: valid.type, key: valid.data?.achievementId ?? valid.data?.nome ?? null, notificationId: valid.id, createdAt: valid.createdAt, ageMs: now - valid.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:136:      // Cooldown ativo — não retorna, mas não remove da fila
src/lib/notificationManager.js:137:      if (changed) this._saveQueue(queue)
src/lib/notificationManager.js:138:      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'cooldown-active', requestedType: type, type: queue[i].type, key: queue[i].data?.achievementId ?? queue[i].data?.nome ?? null, notificationId: queue[i].id, createdAt: queue[i].createdAt, ageMs: now - queue[i].createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:143:    if (changed) this._saveQueue(queue)
src/lib/notificationManager.js:144:    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: changed ? 'expired-items-purged-no-match' : 'no-matching-type', requestedType: type, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:148:  /** Remove da fila todos os itens de um tipo específico */
src/lib/notificationManager.js:150:    const queue = this._getQueue().filter(item => item.type !== type)
src/lib/notificationManager.js:151:    this._saveQueue(queue)
src/lib/notificationManager.js:155:  /** Limpa a fila inteira */
src/lib/notificationManager.js:175:  _purgeExpired(queue, now) {
src/lib/notificationManager.js:177:    for (let i = queue.length - 1; i >= 0; i--) {
src/lib/notificationManager.js:178:      if (now - queue[i].createdAt > NOTIF_TTL_MS) {
src/lib/notificationManager.js:179:        queue.splice(i, 1)
src/lib/notificationManager.js:196:  /** Inscreve callback para mudanças na fila. Retorna unsubscribe. */
src/lib/sfx.js:251:  /** Notificação / achievement */
src/pages/content/LivroCapitulo.jsx:23:  const { desbloquearOuConvidar } = useAchievements()
src/pages/content/LivroCapitulo.jsx:27:  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
src/pages/content/LivroCapitulo.jsx:28:  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
src/pages/content/LivroCapitulo.jsx:109:  // Sentinel: dispara achievement (logado) ou CTA (guest) ao final do capítulo 1
src/pages/content/LivroCapitulo.jsx:113:      if (entry.isIntersecting) desbloquearOuConvidarRef.current('leitor_marelia')
src/pages/content/WebtoonEpisodio.jsx:26:  const { desbloquearOuConvidar } = useAchievements()
src/pages/content/WebtoonEpisodio.jsx:30:  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
src/pages/content/WebtoonEpisodio.jsx:31:  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
src/pages/content/WebtoonEpisodio.jsx:78:            episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
src/pages/content/WebtoonEpisodio.jsx:81:          desbloquearOuConvidarRef.current('episodio_zero')
src/data/achievements-strings-en.json:2:  "cta_conta": {
src/data/achievements-strings-en.json:4:    "mensagem": "You finished reading! Create a free account to unlock this trophy and track your progress.",
src/data/achievements-strings-es.json:2:  "cta_conta": {
src/data/achievements-strings-es.json:4:    "mensagem": "¡Completaste la lectura! Crea una cuenta gratis para desbloquear este trofeo y seguir tu progreso.",
src/data/achievements-strings-pt.json:2:  "cta_conta": {
src/data/achievements-strings-pt.json:4:    "mensagem": "Você completou a leitura! Crie sua conta grátis para desbloquear este troféu e acompanhar seu progresso.",
src/data/livro/en/capitulo-01.md:69:Kim picked up his backpack from the chair. He opened it, checked his things, unlocked the phone with his thumb and checked his balance. Closed it.
src/data/livro/es/capitulo-04.md:47:Kim recorrió las filas con los ojos mientras caía.
src/data/livro/es/capitulo-04.md:51:Jack estaba en la primera fila con el cuerpo de un hombre lobo digital y su rostro inconfundible, con la expresión de quien esperaba ver algún avatar épico y estaba procesando el hecho de haber apostado dinero en la versión normal y cotidiana de su propio amigo. Sobre su cabeza: *Jack Perrazo 987654321*.
src/data/livro/pt/capitulo-04.md:51:Jack estava na primeira fila com o corpo de um lobisomem digital e o rosto inconfundível, a expressão de quem esperava ver algum avatar épico e estava processando que havia apostado dinheiro na versão normal e cotidiana do próprio amigo. Acima da cabeça dele: *Jack Cachorrão 987654321*.
src/data/livro/pt/capitulo-09.md:161:— Os sistemas de monetização já desbloquearam parcialmente. Apostas, doações durante luta, parcerias via Yohu. Tem gente no PowWow te marcando em post com dezenas de milhares de visualizações. Tem live de análise frame por frame da sua luta rolando agora mesmo em Nortalis.
src/data/mundo-es.json:53:      "texto": "Invasores feudales llegan a Bravara. Los Xakaxi, sin protección espiritual ni memoria tecnológica, son conquistados. Yawanari observa impotente como espíritu guardián."
src/data/mundo-es.json:58:      "texto": "Los conquistadores masacran y esclavizan a las poblaciones nativas de Bravara. Yawanari presencia cada muerte, atrapado en el plano espiritual."
src/data/mundo-pt.json:16:      "descricao": "A escola mais avançada de Bravara. Salas com realidade aumentada, IA assistente e câmeras de reconhecimento facial. Kim e Jack estudam aqui com bolsa de 50% — conquistada com a ajuda do porteiro Osvaldo."
src/data/mundo-pt.json:53:      "texto": "Invasores feudais chegam a Bravara. Os Xakaxi, sem proteção espiritual e sem memória de sua tecnologia, são conquistados. Yawanari assiste impotente como espírito guardião."
src/data/personagens-pt.json:207:    "descricaoCompleta": "Dezoito anos. Líder do crime organizado de uma região inteira de Marelia. Alan não chegou onde está por herança ou conexão. Chegou porque era o garoto de rua que ninguém conseguia dobrar, e quando o mundo do crime percebeu isso, foi só questão de tempo. Segurança, cobrador, chefe, chefe do chefe. Um degrau de cada vez, cada um conquistado da única forma que aquele mundo reconhece. Kim e Jack brigaram com ele por anos. Apanharam. Voltaram. Apanharam de novo. Nunca venceram, mas também nunca pararam, e Alan guardou isso. Quando a fama dos dois no LDI começa a respingar nos negócios dele, Alan não age por raiva. Age porque fraqueza visível num mundo como o dele tem preço. O encontro final não termina em derrota nem em vitória. Termina num empate que os dois sabem que significa respeito, e num trato: sumam de Marelia, de preferência do país, e ele garante a proteção de quem ficou para trás. Não é antagonista. É o rival que ensinou que existem lutas que não se vencem, só se sobrevive.",
```

## Apêndice B — Output bruto integral do comando 8

```text
docs/ReportAI/2026-07-10_AUDIT_sitemap_vs_codigo.md:16:| Inconsistências documentadas mas sem ação (informativo) | **1** (#17 — documentação de tipos de notificação) |
docs/ReportAI/2026-07-10_AUDIT_sitemap_vs_codigo.md:93:| 17 | notificationManager não documentado no SITE_MAP (tipos, TTL) | ✅ Nota adicionada em Notas Técnicas |
docs/ReportAI/2026-07-10_AUDIT_sitemap_vs_codigo.md:166:+ ### notificationManager (src/lib/notificationManager.js): Fila centralizada com TTL de 5 min...
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:15:| **Commit da regressão** | `fac68b66` — "refactor: unificar CTA guest com sistema de achievements" |
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:17:| **Comportamento atual** | Guest rola até o fim de EP.00 → `desbloquearOuConvidar('episodio_zero')` → push `cta_conta` → `UnifiedNotification` renderiza modal "TROFÉU DISPONÍVEL" |
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:26:src\data\achievements-strings-en.json: Line 4: "mensagem": "You finished reading! Create a free account to unlock this trophy and track your progress.",
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:27:src\data\achievements-strings-pt.json: Line 3: "titulo": "TROFÉU DISPONÍVEL",
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:32:src\data\achievements-strings-pt.json: Line 5: "botao": "Criar Conta Grátis"
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:40:### Grep: "Episódio Zero" / "episodio_zero" / "EP00" / "webtoon/00"
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:42:src\data\achievements-en.json: Line 30: "id": "episodio_zero",
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:43:src\data\achievements-pt.json: Line 30: "id": "episodio_zero",
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:44:src\data\achievements-pt.json: Line 31: "nome": "Episódio Zero",
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:45:src\data\achievements-es.json: Line 30: "id": "episodio_zero",
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:46:src\data\notificacoes.json: Line 30: "url": "/webtoon/00"
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:52:fac68b66 refactor: unificar CTA guest com sistema de achievements + i18n dedicado + v10.184.0
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:84:const desbloquearOuConvidar = useCallback((achievementId) => {
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:86:      notificationManager.push('cta_conta', { achievementId })  // ← PUSH para guests
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:89:    desbloquear(achievementId)
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:92:**Problema:** Esta função é **propositalmente** designada para guests. A linha 90 faz push de `cta_conta` quando `!user`. Esta é a causa direta do modal aparecer.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:94:### 3.3 Notification Manager: notificationManager.js:32-46
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:97:    const queue = this._getQueue()
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:98:    if (queue.length > 0 && queue[queue.length - 1].type === type) {
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:101:    queue.push({ type, data, id: Date.now() + Math.random(), createdAt: Date.now() })
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:102:    this._saveQueue(queue)
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:106:Salva em `localStorage` chave `ldi-notif-queue`. Persiste entre abas e sessões.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:111:      ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:112:      : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())  // ← guest path
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:114:**Problema:** Linha 61 — o branch `:else` (guest) ativamente busca `cta_conta` na fila com bypass de cooldown.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:119:    const ach = achievList.find(a => a.id === current.data.achievementId)
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:121:      <div className="achievement-overlay" onClick={handleClose}>
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:122:        <div className="achievement-card" onClick={e => e.stopPropagation()}>
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:123:          <div className="achievement-particles">...</div>
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:124:          <img src={thumbEp00} className="achievement-jack" alt="Jack" />
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:125:          <div className="achievement-label">{ctaStrings.cta_conta.titulo}</div>    {/* "TROFÉU DISPONÍVEL" */}
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:126:          {ach && <div className="achievement-icone">{ach.icone}</div>}
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:127:          {ach && <div className="achievement-nome">{ach.nome}</div>}               {/* "Episódio Zero" */}
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:128:          <div className="achievement-descricao">{ctaStrings.cta_conta.mensagem}</div>
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:129:          <button className="achievement-btn" onClick={() => { handleClose(); navigate('/cadastro') }}>
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:130:            {ctaStrings.cta_conta.botao}                                            {/* "Criar Conta Grátis" */}
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:146:| 5 | `notificationManager.push('cta_conta', { achievementId: 'episodio_zero' })` | push executado, salvo em localStorage |
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:147:| 6 | `UnifiedNotification:61` — `findAndPull('cta_conta', true)` | item removido da fila e retornado |
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:148:| 7 | `current` state = `{ type: 'cta_conta', data: { achievementId: 'episodio_zero' } }` | definido |
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:177:#### Commit `fac68b66` (v10.184.0) — "refactor: unificar CTA guest com sistema de achievements"
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:180:- **Criou** `desbloquearOuConvidar` que **propositalmente** faz push de `cta_conta` para guests
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:192:1. Unificou o sistema de achievements (logado) e CTA (guest) em uma única pipeline
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:193:2. Criou `NotificationType.CTA_CONTA` como variante "guest" do achievement
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:201:A correção `921513de` era correta para o `ModalLancamento` antigo. Mas `fac68b66` deletou o `ModalLancamento` e recriou a mesma funcionalidade por um caminho diferente (notificationManager + UnifiedNotification), sem manter a guarda `!user`.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:205:O `user` para guest é `null` (não `undefined`, não `false`, não `0`). A verificação `if (!user)` em `AchievementsContext:89` é corretamente `true` para guests. O problema é que essa condição é **usada corretamente** para decidir fazer push de `cta_conta` — mas o push em si **não deveria existir** para guests.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:211:1. `notificationManager.queue` persiste em `localStorage` — guest que faz `clearByType('achievement')` (AchievementsContext:27) não limpa `cta_conta`. Se o guest fechar o modal e recarregar, pode ver o modal de novo (localStorage persiste).
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:212:2. `UnifiedNotification:38-40` — o `clearByType('achievement')` só roda quando `current` é null. Se já está mostrando uma notificação, o clear não executa.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:213:3. `AchievementsContext:6` — import hardcoded `achievements-pt.json` para `todosAchievements`, mas `UnifiedNotification` importa todas as 3 línguas. Pode causar inconsistência se achievements estiverem em língua diferente.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:214:4. `WebtoonEpisodio:42` — `registrarEvento('webtoon_lido', ...)` é chamado para guest (sem user.id). Verificar se EventosContext trata isso corretamente.
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:224:| A causa raiz é truthy/falsy incorreto? | **Não** — `user` é `null` corretamente; o problema é que o push de `cta_conta` é intencional |
docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:225:| O que precisa ser corrigido? | Remover o push de `cta_conta` para guests OU adicionar guarda `!user` antes do observer em WebtoonEpisodio OU não renderizar `CTA_CONTA` para guests em UnifiedNotification |
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:4:**Arquivo:** `src/lib/notificationManager.js` (190 linhas)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:16:| `this.queue` | `const queue` (local via `this._getQueue()`) | linhas :34, :57, :88, :110, :144 |
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:17:| `item.timestamp` | `queue[i].createdAt` | linhas :43, :64, :117 |
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:18:| `this._persist()` | `this._saveQueue(queue)` | linhas :45, :69, :77, :82, :128, :133, :138, :145 |
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:21:**Causa:** O agente escreveu o trecho ANTES/DEPOIS de memória, hallucinando nomes. Os nomes `this.queue`, `timestamp` e `_persist` **não existem em nenhum lugar do arquivo**. A estrutura real (`_getQueue()` → variável local `queue` → `_saveQueue(queue)` / `createdAt`) está consistente em todas as 190 linhas.
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:33:O commit `97a3257c` (TTL fix) trocou `this.queue` por `const queue = this._getQueue()` e adicionou expiração inline, mas usou `for (let i = queue.length - 1; i >= 0; i--)` — iteração de trás pra frente. Isso fez o primeiro item válido encontrado ser o **último** da fila.
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:43:    const queue = this._getQueue()          // :110
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:48:    for (let i = queue.length - 1; i >= 0; i--) {   // :113 — REVERSO
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:49:      if (queue[i].type !== type) continue
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:50:      if (now - queue[i].createdAt > NOTIF_TTL_MS) { // :117
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:51:        queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:58:        const valid = queue[i]
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:59:        queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:60:        this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:64:      // Cooldown ativo — não retorna, mas não remove da fila
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:65:      if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:74:    const queue = this._getQueue()          // :110
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:79:    for (let i = 0; i < queue.length; i++) {         // :115 — DIRETO
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:80:      if (queue[i].type !== type) continue
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:81:      if (now - queue[i].createdAt > NOTIF_TTL_MS) { // :117
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:82:        queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:90:        const valid = queue[i]
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:91:        queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:92:        this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:96:      // Cooldown ativo — não retorna, mas não remove da fila
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:97:      if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:108:-    for (let i = queue.length - 1; i >= 0; i--) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:109:+    for (let i = 0; i < queue.length; i++) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:110:       if (queue[i].type !== type) continue
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:111:       if (now - queue[i].createdAt > NOTIF_TTL_MS) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:112:         queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:122:1. Direção do loop: `queue.length - 1; i >= 0; i--` → `0; i < queue.length; i++`
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:133:src\lib\notificationManager.js:109:  findAndPull(type, bypassCooldown = false) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:134:src\lib\notificationManager.js:110:    const queue = this._getQueue()
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:135:src\lib\notificationManager.js:111:    const now = Date.now()
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:136:src\lib\notificationManager.js:113:    // Percorre na ordem FIFO (início → fim), descarta expirados do tipo e retorna o primeiro válido
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:137:src\lib\notificationManager.js:114:    let changed = false
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:138:src\lib\notificationManager.js:115:    for (let i = 0; i < queue.length; i++) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:139:src\lib\notificationManager.js:116:      if (queue[i].type !== type) continue
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:140:src\lib\notificationManager.js:117:      if (now - queue[i].createdAt > NOTIF_TTL_MS) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:141:src\lib\notificationManager.js:118:        queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:142:src\lib\notificationManager.js:119:        i--                           // ajusta índice após splice
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:143:src\lib\notificationManager.js:120:        changed = true
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:144:src\lib\notificationManager.js:121:        continue
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:145:src\lib\notificationManager.js:123:      // Primeiro item válido encontrado — aplica cooldown check
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:146:src\lib\notificationManager.js:124:      const lastTime = this._getLastTime()
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:147:src\lib\notificationManager.js:125:      if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:148:src\lib\notificationManager.js:126:        const valid = queue[i]
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:149:src\lib\notificationManager.js:127:        queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:150:src\lib\notificationManager.js:128:        this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:151:src\lib\notificationManager.js:129:        this._setLastTime(now)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:152:src\lib\notificationManager.js:130:        return valid
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:153:src\lib\notificationManager.js:132:      // Cooldown ativo — não retorna, mas não remove da fila
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:154:src\lib\notificationManager.js:133:      if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:155:src\lib\notificationManager.js:134:      return null
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:156:src\lib\notificationManager.js:138:    if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:157:src\lib\notificationManager.js:139:    return null
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:163:src\lib\notificationManager.js:43:      createdAt: Date.now(),
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:164:src\lib\notificationManager.js:52:   * Se aprovada, remove da fila e registra o timestamp.
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:165:src\lib\notificationManager.js:64:    while (queue.length > 0 && now - queue[0].createdAt > NOTIF_TTL_MS) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:166:src\lib\notificationManager.js:117:      if (now - queue[i].createdAt > NOTIF_TTL_MS) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:169:### grep _getQueue|_saveQueue|_persist|this.queue
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:172:src\lib\notificationManager.js:34:    const queue = this._getQueue()
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:173:src\lib\notificationManager.js:45:    this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:174:src\lib\notificationManager.js:57:    const queue = this._getQueue()
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:175:src\lib\notificationManager.js:69:      if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:176:src\lib\notificationManager.js:77:      this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:177:src\lib\notificationManager.js:82:    if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:178:src\lib\notificationManager.js:88:    const queue = this._getQueue()
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:179:src\lib\notificationManager.js:94:    return this._getQueue().length
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:180:src\lib\notificationManager.js:110:    const queue = this._getQueue()
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:181:src\lib\notificationManager.js:128:        this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:182:src\lib\notificationManager.js:133:      if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:183:src\lib\notificationManager.js:138:    if (changed) this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:184:src\lib\notificationManager.js:144:    const queue = this._getQueue().filter(item => item.type !== type)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:185:src\lib\notificationManager.js:145:    this._saveQueue(queue)
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:186:src\lib\notificationManager.js:157:  _getQueue() {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:187:src\lib\notificationManager.js:165:  _saveQueue(q) {
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:190:**Nota:** `_persist` não aparece em lugar nenhum. `this.queue` não aparece em lugar nenhum. `timestamp` só aparece em um comentário (:52).
docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:214:| `src/lib/notificationManager.js` | findAndPull: loop reverso → direto (:115) + i-- (:119) | — |
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:1:# FIX — Purge completo de itens expirados em qualquer leitura da fila
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:4:**Arquivo:** `src/lib/notificationManager.js` (193 linhas)
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:12:Extração de lógica de expiração para método privado único `_purgeExpired(queue, now)` que remove TODOS os itens expirados da fila (de qualquer tipo, em qualquer posição) de uma vez. Chamado no início de `pull()` e `findAndPull()`. A fila nunca acumula lixo por mais de uma chamada.
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:42:### Novo método: `_purgeExpired(queue, now)` — linhas :161-170
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:45:_purgeExpired(queue, now) {
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:47:  for (let i = queue.length - 1; i >= 0; i--) {
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:48:    if (now - queue[i].createdAt > NOTIF_TTL_MS) {
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:49:      queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:63:// Descarta itens expirados do início da fila
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:65:while (queue.length > 0 && now - queue[0].createdAt > NOTIF_TTL_MS) {
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:66:  queue.shift()
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:74:const changed = this._purgeExpired(queue, now)
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:85:for (let i = 0; i < queue.length; i++) {
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:86:  if (queue[i].type !== type) continue
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:87:  if (now - queue[i].createdAt > NOTIF_TTL_MS) {
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:88:    queue.splice(i, 1)
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:98:const changed = this._purgeExpired(queue, now)
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:101:for (let i = 0; i < queue.length; i++) {
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:102:  if (queue[i].type !== type) continue
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:105:**Diferença:** Antes, expiração era inline e só para o tipo buscado (itens expirados de outros tipos ficavam). Agora, purge completo no início — a fila está limpa antes do loop de busca.
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:114:Fila: [ldi_tip(exp), achievement(exp), cta_conta(exp), ldi_tip(valid)]
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:116:  _purgeExpired → remove 3 expirados, changed=true → queue=[ldi_tip(valid)]
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:127:| 3 | todos expirados | remove todos | null, fila vazia | ✅ |
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:138:SEM purge: findAndPull('achievement') removeria só 2 achievements expirados
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:139:           → fila ficaria com 8 itens (6 lixo + 2 válidos) ❌
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:142:           queue = 5 válidos → findAndPull retorna 1º achievement válido
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:160:- Commit: `b7c1e025` — `fix: purge completo de itens expirados em qualquer leitura da fila (preparacao escala) + v10.192.17`
docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:171:| `src/lib/notificationManager.js` | _purgeExpired novo (:161-170), pull() e findAndPull() usam purge | — |
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:1:# INVESTIGAÇÃO: Comportamento da fila com múltiplos itens simultâneos
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:15:| 1 | `achievement` | `AchievementsContext.jsx:67` | Usuário logado desbloqueia achievement |
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:16:| 2 | `cta_conta` | `AchievementsContext.jsx:90` | Guest tenta desbloquear (desbloquearOuConvidar) |
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:18:| 4 | `ldi_tip` | `notificationStore.js:12` | Dica LDI (tama, legado — redireciona p/ notificationManager) |
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:20:**Nota:** `nina_music` NÃO usa `push()` — vai por `window.__ninaPendingNotification` direto (fora da fila).
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:26:| `clearByType('achievement')` | `UnifiedNotification.jsx:39` | Guest (limpa achievements de sessão anterior) |
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:27:| `findAndPull('achievement', true)` ou `findAndPull('cta_conta', true)` + fallback `pull()` | `UnifiedNotification.jsx:60-61` | tryPull — tenta puxar da fila |
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:28:| `clearByType('achievement')` | `AchievementsContext.jsx:27` | User deslogou (limpa fila de achievements) |
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:34:### Cenário A — Dois itens do mesmo tipo na fila
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:36:**Fila:** `[cta_conta (antigo), ldi_tip, cta_conta (novo)]`
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:38:Push dedup (linha 36): `queue[queue.length - 1].type === type` — só bloqueia se o **último** item é do mesmo tipo. Entre os dois cta_conta há um ldi_tip → ambos entraram.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:40:**Rastreamento de `findAndPull('cta_conta', true)`** (linhas 109-138):
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:43:queue = [cta_conta(id=100), ldi_tip(id=200), cta_conta(id=300)]
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:47:Loop i=2 (cta_conta id=300):
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:48:  type === 'cta_conta' ✓
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:55:**Resultado:** `findAndPull` retorna o **mais novo** (id=300). O mais antigo (id=100) permanece na fila indefinidamente até expirar e ser limpo por `pull()`.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:62:  const idx = queue.findIndex(item => item.type === type)  // ← findIndex = PRIMEIRO (mais antigo)
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:67:for (let i = queue.length - 1; i >= 0; i--) {  // ← loop reverso = ÚLTIMO (mais novo)
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:72:**Conclusão:** Regressão introduzida pelo fix de TTL. O `findIndex` original retornava o mais antigo. O loop reverso retorna o mais novo. Com dois cta_conta na fila, o antigo vira lixo permanente.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:78:**Fila:** `[cta_conta (expirado, 10min atrás), cta_conta (válido, agora)]`
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:80:**Rastreamento de `findAndPull('cta_conta', true)`**:
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:83:queue = [cta_conta(id=100, createdAt=now-600000), cta_conta(id=200, createdAt=now)]
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:87:Loop i=1 (cta_conta id=200):
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:88:  type === 'cta_conta' ✓
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:95:**Resultado:** Item válido removido com sucesso. Item expirado (id=100) permanece na fila como lixo.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:97:**Quem limpa o lixo?** `pull()` (linha 64): `while (queue.length > 0 && now - queue[0].createdAt > NOTIF_TTL_MS)` — limpa do **início**. Mas `pull()` só é chamado como fallback em `UnifiedNotification.jsx:60-61` quando `findAndPull` retorna null. Se `findAndPull` já retornou o item válido, `pull()` nunca é chamado nessa passagem de tryPull. O lixo só será limpo na **próxima** chamada de tryPull, quando `findAndPull` não achar mais cta_conta e o fallback `pull()` processar o início da fila.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:99:**É bug real?** Lixo temporário. Funciona mas é ineficiente — o item expirado ocupa espaço na fila até a próxima passagem de `pull()`.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:105:**Fila:** `[ldi_tip, achievement, cta_conta]`
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:111:  ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:112:  : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:115:1. `findAndPull('achievement', true)`:
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:116:   - Loop reverso: i=2 (cta_conta, type não bate), i=1 (achievement, type bate, válido) → REMOVE achievement
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:117:   - Retorna achievement
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:119:3. **Resultado:** achievement é exibido. `ldi_tip` e `cta_conta` permanecem na fila.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:125:  notificationManager.clearByType('achievement')  // ← LIMPA achievement
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:128:const item = notificationManager.findAndPull('cta_conta', true) || notificationManager.pull()
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:131:1. `clearByType('achievement')` → fila vira `[ldi_tip, cta_conta]`
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:132:2. `findAndPull('cta_conta', true)`: i=1 (cta_conta, type bate, válido) → REMOVE cta_conta
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:133:3. Retorna cta_conta. `ldi_tip` permanece na fila.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:134:4. **Resultado:** cta_conta exibido. ldi_tip espera.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:139:- Logado: `findAndPull('achievement')` retorna null (não há mais achievement) → `pull()` processa ldi_tip
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:140:- Guest: `findAndPull('cta_conta')` retorna null → `pull()` processa ldi_tip
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:143:**Conclusão:** Funciona corretamente. Tipos diferentes são processados em passagens separadas de tryPull, respeitando prioridade (achievement/cta_conta > pull genérico). Sem race condition.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:149:**Estado:** `current = { type: 'achievement', ... }` (modal na tela). Novo push: `notificationManager.push('ldi_tip', {...})`.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:154:   - `queue.push(...)` — item entra na fila
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:155:   - `_saveQueue(queue)` — salva em localStorage
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:162:   - **Retorna cedo — item fica na fila**
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:168:   - `tryPull` processa o ldi_tip da fila
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:176:**Conclusão:** Funciona corretamente. Item entra na fila, espera `current` ficar null, e é processado na próxima oportunidade.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:185:if (queue.length > 0 && queue[queue.length - 1].type === type) {
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:190:**Teste:** push('ldi_tip'), push('cta_conta'), push('ldi_tip'):
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:191:- 1º: fila vazia → entra
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:192:- 2º: último é ldi_tip ≠ cta_conta → entra
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:193:- 3º: último é cta_conta ≠ ldi_tip → entra
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:194:- Fila: `[ldi_tip, cta_conta, ldi_tip]` — **3 itens, 2 do mesmo tipo**
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:196:**Conclusão:** Deduplicação é apenas **consecutiva**. Não há garantia estrutural de "máximo 1 item por tipo na fila". Múltiplos itens do mesmo tipo são permitidos sempre que há um item de tipo diferente entre eles.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:212:- `fac68b66` (antes): `queue.findIndex(item => item.type === type)` → mais antigo ✅
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:213:- `97a3257c` (depois): `for (let i = queue.length - 1; i >= 0; i--)` → mais novo ❌
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:218:**Cenário:** Fila = [ldi_tip (expirado), cta_conta (válido)]. findAndPull('cta_conta') remove cta_conta mas ldi_tip expirado fica.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:224:**Cenário:** Fila = [cta_conta (válido, cooldown ativo), cta_conta (válido)]. findAndPull encontra o 2º (mais novo), cooldown ativo → retorna null sem verificar o 1º.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:229:Funciona corretamente. Prioridade: achievement/cta_conta (via findAndPull) > genérico (via pull). Sem race condition.
docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:233:Funciona corretamente. Item entra na fila, espera current=null, processa na próxima oportunidade. Subscriber + intervalo de 15s garantem processamento.
docs/ReportAI/2026-07-13_DOCS_atualizacao_biblia.md:34:**Antes (10.5):** "fila persistida em localStorage, cooldown de 15 min. Problema conhecido: fila persiste entre sessões."
docs/ReportAI/2026-07-13_DOCS_atualizacao_biblia.md:37:- NOTIF_TTL_MS = 5 min (confirmado em notificationManager.js linha 18)
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:12:Em `/webtoon/00`, o modal `TROPHY AVAILABLE / Episode Zero / You finished reading!` foi observado no topo da leitura. Guest pode ler sem conta e o CTA só pode aparecer após alcançar o final. Para autenticado, persistência e notificação também só podem ocorrer após o final. “Modal exibido” e “conquista desbloqueada” são eventos distintos neste relatório.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:23:src/data/achievements-en.json:30:    "id": "episodio_zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:24:src/data/achievements-en.json:31:    "nome": "Episode Zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:25:src/data/achievements-en.json:36:    "trigger": "webtoon_ep00_completo"
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:26:src/data/achievements-es.json:30:    "id": "episodio_zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:27:src/data/achievements-pt.json:30:    "id": "episodio_zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:28:src/data/achievements-pt.json:31:    "nome": "Episódio Zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:29:src/pages/content/WebtoonEpisodio.jsx:78: episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:33:### Comando 2 — mapa de conquista, CTA e fila
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:36:src/context/AchievementsContext.jsx:27: notificationManager.clearByType('achievement')
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:37:src/context/AchievementsContext.jsx:55: const desbloquear = useCallback(async (achievementId) => {
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:38:src/context/AchievementsContext.jsx:76: ...insert({ user_id: user.id, achievement_id: achievementId })
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:39:src/context/AchievementsContext.jsx:87: notificationManager.push('achievement', {
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:40:src/context/AchievementsContext.jsx:108: const desbloquearOuConvidar = useCallback((achievementId) => {
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:41:src/context/AchievementsContext.jsx:115: notificationManager.push('cta_conta', { achievementId })
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:42:src/components/UnifiedNotification/UnifiedNotification.jsx:64: ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:43:src/components/UnifiedNotification/UnifiedNotification.jsx:65: : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:44:src/lib/notificationManager.js:18:const NOTIF_TTL_MS = 5 * 60 * 1000
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:45:src/lib/notificationManager.js:33:push(type, data) {
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:46:src/lib/notificationManager.js:60:pull(bypassCooldown = false) {
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:47:src/lib/notificationManager.js:115:findAndPull(type, bypassCooldown = false) {
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:67:src/lib/notificationManager.js:15:const STORAGE_LAST = 'ldi-notif-last-time'
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:68:src/lib/notificationManager.js:16:const STORAGE_QUEUE = 'ldi-notif-queue'
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:69:src/lib/notificationManager.js:18:const NOTIF_TTL_MS = 5 * 60 * 1000
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:70:src/lib/notificationManager.js:44:id: Date.now() + Math.random(),
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:71:src/lib/notificationManager.js:45:createdAt: Date.now(),
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:72:src/lib/notificationManager.js:165:return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || '[]')
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:73:src/lib/notificationManager.js:172:localStorage.setItem(STORAGE_QUEUE, JSON.stringify(q))
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:74:src/lib/notificationManager.js:187:return parseInt(localStorage.getItem(STORAGE_LAST) || '0', 10)
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:94:src/data/achievements-pt.json:30:    "id": "episodio_zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:95:src/data/achievements-pt.json:31:    "nome": "Episódio Zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:96:src/data/achievements-pt.json:36:    "trigger": "webtoon_ep00_completo"
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:97:src/data/achievements-en.json:30:    "id": "episodio_zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:98:src/data/achievements-en.json:31:    "nome": "Episode Zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:99:src/data/achievements-en.json:36:    "trigger": "webtoon_ep00_completo"
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:100:src/data/achievements-es.json:30:    "id": "episodio_zero",
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:101:src/data/achievements-es.json:36:    "trigger": "webtoon_ep00_completo"
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:109:b7c1e025 2026-07-11 fix: purge completo de itens expirados em qualquer leitura da fila + v10.192.17
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:111:97a3257c 2026-07-11 fix: TTL 5min em itens stale da fila + v10.192.15
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:112:fac68b66 2026-07-04 refactor: unificar CTA guest com sistema de achievements + v10.184.0
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:114:c25d1f02 2026-07-02 fix: bloquear popup de achievement para usuario guest + v10.183.30
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:115:ce5d5173 2026-07-02 fix: popup conquista ignora cooldown + reset limpa fila + v10.183.29
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:116:acb09dca 2026-07-02 fix: 23505 race condition no desbloquear achievements + v10.183.28
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:117:9ff62515 2026-06-09 Unified notification queue system + v9.59
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:123:docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:17:Guest rola até o fim de EP.00 → desbloquearOuConvidar → push cta_conta → UnifiedNotification
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:124:docs/ReportAI/2026-07-10_INV_trofeu_guest_modal.md:106:Salva em localStorage chave ldi-notif-queue.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:125:docs/ReportAI/2026-07-11_FIX_findandpull_ordem_fifo.md:4:notificationManager.js (190 linhas)
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:126:docs/ReportAI/2026-07-11_FIX_purge_completo_fila_escala.md:12:_purgeExpired remove TODOS os itens expirados
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:127:docs/ReportAI/2026-07-11_INV_fila_multiplos_itens.md:26:clearByType('achievement')
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:147:207 src/lib/notificationManager.js
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:155:| montagem | `WebtoonEpisodio.jsx:20` | componente | rota `/webtoon/:id` | params/auth/locale | render | render React |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:160:| conclusão | `:63-84` | callback | `entry.isIntersecting` | intersection ratio | chama conquista apenas id 00 | callback observer |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:164:| persistência | `:76` | Supabase insert | novo achievement | user/id | grava | promise |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:166:| CTA guest | `:113-116` | guest branch | `!user` | achievementId | push cta_conta | síncrono |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:167:| toast auth | `:87-91` | success branch | insert sem erro | definição | push achievement | após promise |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:168:| enqueue/storage | `notificationManager.js:33-51` | push | não duplicata consecutiva | queue localStorage | salva/notifica listeners | síncrono |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:172:| retirada | `notificationManager.js:80-89`, `:128-145` | pull/findAndPull | selecionável | fila | remove/salva | síncrono |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:174:| modal | `:153-198` | render | current achievement/cta | dados/i18n | overlay | render React |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:183:| H3 notificação antiga | INCONCLUSIVA | queue persiste; logs capturam `createdAt`, `ageMs`, TTL e tamanho |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:184:| H4 exibição atrasada | INCONCLUSIVA | bypass existe para CTA/achievement; idade real decidirá |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:187:| H7 conflito guest/auth | INCONCLUSIVA | logout limpa achievement, não CTA; cenário manual necessário |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:194:Antes, o observer apenas testava `entry.isIntersecting` e chamava a conquista. Depois (`WebtoonEpisodio.jsx:34-84`), `[WEBTOON:INIT]`, `[WEBTOON:COMPLETE_CHECK]` e trace do trigger registram rota, episódio, páginas, geometria, resultado e modo. A condição `entry.isIntersecting`, threshold `0.1` e dependência `[id]` permanecem iguais.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:196:Antes, os branches de achievement retornavam silenciosamente. Depois (`AchievementsContext.jsx:39-120`), request/existing/guest/auth registram se persistência/toast foram solicitados e por quê. Inserts, retornos e push permanecem nas mesmas posições lógicas.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:198:Antes, push/pull não expunham idade e seleção. Depois (`notificationManager.js:33-145`), os logs registram fila antes/depois, `createdAt`, idade, TTL, cooldown e bypass. Nenhuma constante, storage key, deduplicação, splice, shift ou persistência mudou.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:200:Antes, `UnifiedNotification` apenas fazia pull/set/close. Depois (`UnifiedNotification.jsx:35-124`), logs registram check, item mostrado e fechamento. O único ajuste de dependência foi no callback de log de fechamento para capturar o `current`; ele não muda o effect do observer, fila ou regra de seleção.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:217:notificationManager.js:38,49,62,64,83,88,118,133,138,144:[NOTIF:*]
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:228:| guest chega ao final | ✅ trigger → guest → enqueue → pull → show |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:229:| auth sem conquista | ✅ request → existing → persist → enqueue → show |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:230:| auth com conquista | ✅ load sem toast versus request já existente |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:231:| conclusão + reload | ✅ createdAt/age/TTL/queue/pull |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:232:| 01 → 00 | ✅ pathname/episodeId/achievementId |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:233:| guest → auth | ✅ mode, tipo, queue e seleção |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:266:**CLASSIFICAÇÃO:** pendente entre detecção prematura, notificação antiga, consumo atrasado, duplicidade ou conflito guest/auth.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:276:1. A — janela anônima nova, `/webtoon/00`, não rolar, esperar 10s, screenshot e todos `[WEBTOON:]`, `[ACH:]`, `[NOTIF:]`.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:278:3. C — após concluir guest, topo + reload em até 5 min; capturar idade, fila, TTL, cooldown e item.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:279:4. D — conta de teste sem conquista: 10s no topo e depois final; logs de persistência/toast.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:280:5. E — conta com conquista: topo sem rolar; verificar load, novo request, toast e item antigo.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:281:6. F — `/webtoon/01` → `/webtoon/00`; capturar IDs.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:284:Nenhum cenário fica concluído sem screenshot e logs reais enviados pelo Isaias. Não remover conquista real nem alterar Supabase.
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:294:| `notificationManager.js` | enqueue/pull | ✅ |
docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.22.md:298:| **Commit** | `debug: instrumentar timing do trofeu webtoon + v10.192.22` | pendente no momento de autoria |
```

## Apêndice C — Trechos ANTES e DEPOIS com números de linha

```text
===== ANTES: src/pages/content/WebtoonEpisodio.jsx @ f6877866 =====
     1  import { useEffect, useRef } from 'react'
     2  import { Helmet } from 'react-helmet-async'
     3  import { useParams, useNavigate } from 'react-router-dom'
     4  import { useLanguage } from '../../context/LanguageContext'
     5  import { useReader } from '../../context/ReaderContext'
     6  import { useAuth } from '../../context/AuthContext'
     7  import { TRIAL_ACTIVE } from '../../config/trial'
     8  import { estaDisponivel } from '../../config/site'
     9  import { useAchievements } from '../../context/AchievementsContext'
    10  import { useEventos } from '../../context/EventosContext'
    11  import episodios from '../../data/episodios.json'
    12  import './WebtoonEpisodio.css'
    13
    14  function formatarData(dataStr) {
    15    if (!dataStr) return ''
    16    const [a, m, d] = dataStr.split('-')
    17    return `${d}/${m}/${a}`
    18  }
    19
    20  export default function WebtoonEpisodio() {
    21    const { setReaderMode } = useReader()
    22    const { id } = useParams()
    23    const navigate = useNavigate()
    24    const { locale, t } = useLanguage()
    25    const { user, perfil } = useAuth()
    26    const { desbloquearOuConvidar } = useAchievements()
    27    const { registrarEvento } = useEventos()
    28    const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
    29    const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
    30    const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
    31    useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
    32    const ultimaPaginaRef = useRef(null)
    33
    34    useEffect(() => {
    35      setReaderMode(true)
    36      return () => setReaderMode(false)
    37    }, [])
    38
    39    useEffect(() => { localStorage.setItem('ldi-webtoon-ultimo', id) }, [id])
    40
    41    useEffect(() => {
    42      if (id) registrarEvento('webtoon_lido', `Leu o episódio ${id}`, Number(id))
    43    }, [id])
    44
    45    useEffect(() => {
    46      const saved = localStorage.getItem(`ldi-webtoon-scroll-${id}`)
    47      if (saved) window.scrollTo(0, parseInt(saved))
    48    }, [id])
    49
    50    useEffect(() => {
    51      if (!ultimaPaginaRef.current) return
    52      const observer = new IntersectionObserver(([entry]) => {
    53        if (entry.isIntersecting) {
    54          if (id === '00') desbloquearOuConvidarRef.current('episodio_zero')
    55        }
    56      }, { threshold: 0.1 })
    57      observer.observe(ultimaPaginaRef.current)
    58      return () => observer.disconnect()
    59    }, [id])
    60
    61    const ep = episodios.find(e => e.id === id)
    62    const idx = episodios.findIndex(e => e.id === id)
    63    const prev = idx > 0 ? episodios[idx - 1] : null
    64    const next = idx < episodios.length - 1 ? episodios[idx + 1] : null
    65
    66    const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'
    67
    68    if (!ep || (id !== '00' && !estaDisponivel(ep, isAdmin) && !TRIAL_ACTIVE)) {
    69      return (
    70        <section className="webtoon-ep-page">
    71          <div className="container">
    72            <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
    73              {t('pages.webtoon.voltar')}
    74            </button>
    75            <p className="webtoon-ep-blocked">
    76              {ep?.data_publicacao
    77                ? `${t('pages.webtoon.em_breve')} ${formatarData(ep.data_publicacao)}`
    78                : t('pages.webtoon.nao_encontrado')}
    79            </p>
    80          </div>
    81        </section>
    82      )
    83    }
    84
    85    const pages = Array.from({ length: ep.paginas }, (_, i) => i + 1)
    86
    87    return (
    88      <>
    89        <Helmet><title>{`${ep[tituloKey]} — ${t('site.nome_curto')}`}</title></Helmet>
    90
    91        <header className="webtoon-ep-header">
    92          <div className="container">
    93            <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
    94              {t('pages.webtoon.voltar')}
    95            </button>
    96            <h1 className="webtoon-ep-header__title">
    97              EP. {String(ep.numero).padStart(2, '0')} — {ep[tituloKey]}
    98            </h1>
    99          </div>
   100        </header>
   101
   102        <section className="webtoon-ep-reader">
   103          {pages.map(num => (
   104            <img
   105              key={num}
   106              ref={num === ep.paginas ? ultimaPaginaRef : null}
   107              src={`/webtoon/${ep.id}/pt/${String(num).padStart(2, '0')}.png`}
   108              width="100%"
   109              className="webtoon-ep-reader__img"
   110              loading="lazy"
   111              alt={`${t('pages.webtoon.pagina')} ${num}`}
   112            />
   113          ))}
   114        </section>
   115
   116        <nav className="webtoon-ep-nav">
   117          <div className="container">
   118            {prev && prev.publicado ? (
   119              <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${prev.id}`)}>
   120                {t('pages.webtoon.anterior')}
   121              </button>
   122            ) : (
   123              <span />
   124            )}
   125            {next && next.publicado ? (
   126              <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${next.id}`)}>
   127                {t('pages.webtoon.proximo')}
   128              </button>
   129            ) : (
   130              <span />
   131            )}
   132          </div>
   133        </nav>
   134
   135      </>
   136    )
   137  }
   138
===== DEPOIS: src/pages/content/WebtoonEpisodio.jsx @ working tree v10.192.23 =====
     1  import { useEffect, useRef } from 'react'
     2  import { Helmet } from 'react-helmet-async'
     3  import { useParams, useNavigate } from 'react-router-dom'
     4  import { useLanguage } from '../../context/LanguageContext'
     5  import { useReader } from '../../context/ReaderContext'
     6  import { useAuth } from '../../context/AuthContext'
     7  import { TRIAL_ACTIVE } from '../../config/trial'
     8  import { estaDisponivel } from '../../config/site'
     9  import { useAchievements } from '../../context/AchievementsContext'
    10  import { useEventos } from '../../context/EventosContext'
    11  import episodios from '../../data/episodios.json'
    12  import './WebtoonEpisodio.css'
    13
    14  function formatarData(dataStr) {
    15    if (!dataStr) return ''
    16    const [a, m, d] = dataStr.split('-')
    17    return `${d}/${m}/${a}`
    18  }
    19
    20  export default function WebtoonEpisodio() {
    21    const { setReaderMode } = useReader()
    22    const { id } = useParams()
    23    const navigate = useNavigate()
    24    const { locale, t } = useLanguage()
    25    const { user, perfil, carregando } = useAuth()
    26    const { desbloquearOuConvidar } = useAchievements()
    27    const { registrarEvento } = useEventos()
    28    const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
    29    const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
    30    const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
    31    useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
    32    const ultimaPaginaRef = useRef(null)
    33
    34    useEffect(() => {
    35      const epAtual = episodios.find(e => e.id === id)
    36      console.log('[WEBTOON:INIT]', {
    37        timestamp: new Date().toISOString(), pathname: window.location.pathname,
    38        episodeId: id, totalPages: epAtual?.paginas ?? 0, origin: 'mount',
    39        scrollY: window.scrollY, innerHeight: window.innerHeight,
    40        scrollHeight: document.documentElement.scrollHeight, completionGuard: 'none',
    41        mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
    42      })
    43    }, [id])
    44
    45    useEffect(() => {
    46      setReaderMode(true)
    47      return () => setReaderMode(false)
    48    }, [])
    49
    50    useEffect(() => { localStorage.setItem('ldi-webtoon-ultimo', id) }, [id])
    51
    52    useEffect(() => {
    53      if (id) registrarEvento('webtoon_lido', `Leu o episÃ³dio ${id}`, Number(id))
    54    }, [id])
    55
    56    useEffect(() => {
    57      const saved = localStorage.getItem(`ldi-webtoon-scroll-${id}`)
    58      if (saved) window.scrollTo(0, parseInt(saved))
    59    }, [id])
    60
    61    useEffect(() => {
    62      if (!ultimaPaginaRef.current) return
    63      const observer = new IntersectionObserver(([entry]) => {
    64        const scrollHeight = document.documentElement.scrollHeight
    65        console.log('[WEBTOON:COMPLETE_CHECK]', {
    66          timestamp: new Date().toISOString(), pathname: window.location.pathname,
    67          episodeId: id, totalPages: episodios.find(e => e.id === id)?.paginas ?? 0,
    68          origin: 'observer', scrollY: window.scrollY, innerHeight: window.innerHeight,
    69          scrollHeight, distanceToEnd: scrollHeight - (window.scrollY + window.innerHeight),
    70          isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio,
    71          completionResult: entry.isIntersecting, completionGuard: 'none',
    72          mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
    73        })
    74        if (entry.isIntersecting) {
    75          if (id === '00') {
    76            console.trace('[WEBTOON:COMPLETE_TRIGGER]', {
    77              timestamp: new Date().toISOString(), pathname: window.location.pathname,
    78              episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
    79              mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
    80            })
    81            desbloquearOuConvidarRef.current('episodio_zero')
    82          }
    83        }
    84      }, { threshold: 0.1 })
    85      observer.observe(ultimaPaginaRef.current)
    86      return () => observer.disconnect()
    87    }, [id])
    88
    89    const ep = episodios.find(e => e.id === id)
    90    const idx = episodios.findIndex(e => e.id === id)
    91    const prev = idx > 0 ? episodios[idx - 1] : null
    92    const next = idx < episodios.length - 1 ? episodios[idx + 1] : null
    93
    94    const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'
    95
    96    if (!ep || (id !== '00' && !estaDisponivel(ep, isAdmin) && !TRIAL_ACTIVE)) {
    97      return (
    98        <section className="webtoon-ep-page">
    99          <div className="container">
   100            <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
   101              {t('pages.webtoon.voltar')}
   102            </button>
   103            <p className="webtoon-ep-blocked">
   104              {ep?.data_publicacao
   105                ? `${t('pages.webtoon.em_breve')} ${formatarData(ep.data_publicacao)}`
   106                : t('pages.webtoon.nao_encontrado')}
   107            </p>
   108          </div>
   109        </section>
   110      )
   111    }
   112
   113    const pages = Array.from({ length: ep.paginas }, (_, i) => i + 1)
   114
   115    return (
   116      <>
   117        <Helmet><title>{`${ep[tituloKey]} â€” ${t('site.nome_curto')}`}</title></Helmet>
   118
   119        <header className="webtoon-ep-header">
   120          <div className="container">
   121            <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
   122              {t('pages.webtoon.voltar')}
   123            </button>
   124            <h1 className="webtoon-ep-header__title">
   125              EP. {String(ep.numero).padStart(2, '0')} â€” {ep[tituloKey]}
   126            </h1>
   127          </div>
   128        </header>
   129
   130        <section className="webtoon-ep-reader">
   131          {pages.map(num => (
   132            <img
   133              key={num}
   134              ref={num === ep.paginas ? ultimaPaginaRef : null}
   135              src={`/webtoon/${ep.id}/pt/${String(num).padStart(2, '0')}.png`}
   136              width="100%"
   137              className="webtoon-ep-reader__img"
   138              loading="lazy"
   139              alt={`${t('pages.webtoon.pagina')} ${num}`}
   140            />
   141          ))}
   142        </section>
   143
   144        <nav className="webtoon-ep-nav">
   145          <div className="container">
   146            {prev && prev.publicado ? (
   147              <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${prev.id}`)}>
   148                {t('pages.webtoon.anterior')}
   149              </button>
   150            ) : (
   151              <span />
   152            )}
   153            {next && next.publicado ? (
   154              <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${next.id}`)}>
   155                {t('pages.webtoon.proximo')}
   156              </button>
   157            ) : (
   158              <span />
   159            )}
   160          </div>
   161        </nav>
   162
   163      </>
   164    )
   165  }
   166
===== ANTES: src/context/AchievementsContext.jsx @ f6877866 =====
     1  import { createContext, useContext, useState, useEffect, useCallback } from 'react'
     2  import { supabase } from '../lib/supabase'
     3  import { useAuth } from './AuthContext'
     4  import { useEventos } from './EventosContext'
     5  import { notificationManager } from '../lib/notificationManager'
     6  import todosAchievements from '../data/achievements-pt.json'
     7
     8  const STORAGE_KEY = 'ldi-achievements'
     9  const AchievementsContext = createContext(null)
    10
    11  export function AchievementsProvider({ children }) {
    12    const { user } = useAuth()
    13    const [desbloqueados, setDesbloqueados] = useState([])
    14    const [toastPendente, setToastPendente] = useState(null)
    15
    16    useEffect(() => {
    17      if (user) {
    18        if (!user.id) {
    19          setDesbloqueados([])
    20          return
    21        }
    22        migrarLocalParaSupabase(user.id).then(() => carregarDoSupabase())
    23      } else {
    24        // Sem conta = sem achievements. Limpa fila p/ evitar que notificações
    25        // de achievements de sessão anterior apareçam para guest (issue #guest-popup)
    26        setDesbloqueados([])
    27        notificationManager.clearByType('achievement')
    28      }
    29    }, [user])
    30
    31    function carregarDoLocal() {
    32      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    33      setDesbloqueados(salvos)
    34    }
    35
    36    async function carregarDoSupabase() {
    37      const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    38      if (error) { console.error('Erro ao carregar achievements:', error); return }
    39      if (data && data.length > 0) setDesbloqueados(data.map(d => d.achievement_id))
    40    }
    41
    42    async function migrarLocalParaSupabase(userId) {
    43      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    44      if (salvos.length === 0) return
    45      const inserts = salvos.map(id => ({ user_id: userId, achievement_id: id }))
    46      await supabase.from('user_achievements').upsert(inserts, { onConflict: 'user_id,achievement_id' })
    47      localStorage.removeItem(STORAGE_KEY)
    48    }
    49
    50    const desbloquear = useCallback(async (achievementId) => {
    51      console.log('desbloquear:', achievementId, 'user:', user?.id ?? 'NULO')
    52      // Sem conta logada = não desbloqueia achievement
    53      if (!user) return
    54      if (desbloqueados.includes(achievementId)) return
    55      const achievement = todosAchievements.find(a => a.id === achievementId)
    56      if (!achievement) return
    57      const { error } = await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
    58      if (error) {
    59        if (error.code === '23505') {
    60          setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    61          return
    62        }
    63        console.error('ERRO AO SALVAR ACHIEVEMENT:', error)
    64        return
    65      }
    66      setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    67      notificationManager.push('achievement', {
    68        nome: achievement.nome,
    69        descricao: achievement.descricao,
    70        icone: achievement.icone,
    71      })
    72      // Registrar evento de conquista (usa supabase diretamente p/ evitar dependência cíclica)
    73      try {
    74        const { data: existente } = await supabase.from('perfil_eventos')
    75          .select('id').eq('user_id', user.id).eq('tipo', 'conquista').eq('descricao', `Desbloqueou: ${achievement.nome}`).limit(1)
    76        if (!existente || existente.length === 0) {
    77          await supabase.from('perfil_eventos').insert({
    78            user_id: user.id, tipo: 'conquista', descricao: `Desbloqueou: ${achievement.nome}`, valor: achievement.tier || 1,
    79          })
    80        }
    81      } catch (e) { console.error('[Eventos] erro ao registrar conquista:', e) }
    82    }, [desbloqueados, user])
    83
    84    function registrarGangue() {
    85      desbloquear('conhece_a_gangue')
    86    }
    87
    88    const desbloquearOuConvidar = useCallback((achievementId) => {
    89      if (!user) {
    90        notificationManager.push('cta_conta', { achievementId })
    91        return
    92      }
    93      desbloquear(achievementId)
    94    }, [desbloquear, user])
    95
    96    function fecharToast() {
    97      setToastPendente(null)
    98    }
    99
   100    const refresh = useCallback(async () => {
   101      if (!user) { setDesbloqueados([]); return }
   102      const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
   103      if (error) { console.error('Erro ao recarregar achievements:', error); return }
   104      setDesbloqueados(data ? data.map(d => d.achievement_id) : [])
   105    }, [user])
   106
   107    return (
   108      <AchievementsContext.Provider value={{ desbloqueados, desbloquear, desbloquearOuConvidar, toastPendente, fecharToast, refresh, migrarLocalParaSupabase, registrarGangue }}>
   109        {children}
   110      </AchievementsContext.Provider>
   111    )
   112  }
   113
   114  export const useAchievements = () => useContext(AchievementsContext)
   115
===== DEPOIS: src/context/AchievementsContext.jsx @ working tree v10.192.23 =====
     1  import { createContext, useContext, useState, useEffect, useCallback } from 'react'
     2  import { supabase } from '../lib/supabase'
     3  import { useAuth } from './AuthContext'
     4  import { useEventos } from './EventosContext'
     5  import { notificationManager } from '../lib/notificationManager'
     6  import todosAchievements from '../data/achievements-pt.json'
     7
     8  const STORAGE_KEY = 'ldi-achievements'
     9  const AchievementsContext = createContext(null)
    10
    11  export function AchievementsProvider({ children }) {
    12    const { user } = useAuth()
    13    const [desbloqueados, setDesbloqueados] = useState([])
    14    const [toastPendente, setToastPendente] = useState(null)
    15
    16    useEffect(() => {
    17      if (user) {
    18        if (!user.id) {
    19          setDesbloqueados([])
    20          return
    21        }
    22        migrarLocalParaSupabase(user.id).then(() => carregarDoSupabase())
    23      } else {
    24        // Sem conta = sem achievements. Limpa fila p/ evitar que notificaÃ§Ãµes
    25        // de achievements de sessÃ£o anterior apareÃ§am para guest (issue #guest-popup)
    26        setDesbloqueados([])
    27        notificationManager.clearByType('achievement')
    28      }
    29    }, [user])
    30
    31    function carregarDoLocal() {
    32      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    33      setDesbloqueados(salvos)
    34    }
    35
    36    async function carregarDoSupabase() {
    37      const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    38      if (error) { console.error('Erro ao carregar achievements:', error); return }
    39      console.log('[ACH:EXISTING_CHECK]', {
    40        timestamp: new Date().toISOString(), source: 'supabase-load', mode: 'authenticated',
    41        existingCount: data?.length ?? 0, requestedPersistence: false, requestedToast: false,
    42        reason: 'existing-achievements-loaded-without-toast',
    43      })
    44      if (data && data.length > 0) setDesbloqueados(data.map(d => d.achievement_id))
    45    }
    46
    47    async function migrarLocalParaSupabase(userId) {
    48      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    49      if (salvos.length === 0) return
    50      const inserts = salvos.map(id => ({ user_id: userId, achievement_id: id }))
    51      await supabase.from('user_achievements').upsert(inserts, { onConflict: 'user_id,achievement_id' })
    52      localStorage.removeItem(STORAGE_KEY)
    53    }
    54
    55    const desbloquear = useCallback(async (achievementId) => {
    56      console.trace('[ACH:REQUEST]', {
    57        timestamp: new Date().toISOString(), achievementId,
    58        mode: user ? 'authenticated' : 'guest', alreadyExisting: desbloqueados.includes(achievementId),
    59      })
    60      // Sem conta logada = nÃ£o desbloqueia achievement
    61      if (!user) {
    62        console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: false, reason: 'no-authenticated-user' })
    63        return
    64      }
    65      if (desbloqueados.includes(achievementId)) {
    66        console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: false, requestedToast: false, reason: 'already-unlocked-in-state' })
    67        return
    68      }
    69      const achievement = todosAchievements.find(a => a.id === achievementId)
    70      if (!achievement) {
    71        console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: false, requestedToast: false, reason: 'achievement-definition-not-found' })
    72        return
    73      }
    74      console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: false, requestedPersistence: true, requestedToast: true, reason: 'new-unlock-request' })
    75      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'persisting-new-achievement' })
    76      const { error } = await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
    77      if (error) {
    78        if (error.code === '23505') {
    79          console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: true, requestedToast: false, reason: 'database-duplicate' })
    80          setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    81          return
    82        }
    83        console.error('ERRO AO SALVAR ACHIEVEMENT:', error)
    84        return
    85      }
    86      setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    87      notificationManager.push('achievement', {
    88        nome: achievement.nome,
    89        descricao: achievement.descricao,
    90        icone: achievement.icone,
    91      })
    92      // Registrar evento de conquista (usa supabase diretamente p/ evitar dependÃªncia cÃ­clica)
    93      try {
    94        const { data: existente } = await supabase.from('perfil_eventos')
    95          .select('id').eq('user_id', user.id).eq('tipo', 'conquista').eq('descricao', `Desbloqueou: ${achievement.nome}`).limit(1)
    96        if (!existente || existente.length === 0) {
    97          await supabase.from('perfil_eventos').insert({
    98            user_id: user.id, tipo: 'conquista', descricao: `Desbloqueou: ${achievement.nome}`, valor: achievement.tier || 1,
    99          })
   100        }
   101      } catch (e) { console.error('[Eventos] erro ao registrar conquista:', e) }
   102    }, [desbloqueados, user])
   103
   104    function registrarGangue() {
   105      desbloquear('conhece_a_gangue')
   106    }
   107
   108    const desbloquearOuConvidar = useCallback((achievementId) => {
   109      console.trace('[ACH:REQUEST]', {
   110        timestamp: new Date().toISOString(), achievementId,
   111        mode: user ? 'authenticated' : 'guest', entrypoint: 'desbloquearOuConvidar',
   112      })
   113      if (!user) {
   114        console.log('[ACH:GUEST_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: true, reason: 'guest-cta-enqueue' })
   115        notificationManager.push('cta_conta', { achievementId })
   116        return
   117      }
   118      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'delegating-to-unlock' })
   119      desbloquear(achievementId)
   120    }, [desbloquear, user])
   121
   122    function fecharToast() {
   123      setToastPendente(null)
   124    }
   125
   126    const refresh = useCallback(async () => {
   127      if (!user) { setDesbloqueados([]); return }
   128      const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
   129      if (error) { console.error('Erro ao recarregar achievements:', error); return }
   130      setDesbloqueados(data ? data.map(d => d.achievement_id) : [])
   131    }, [user])
   132
   133    return (
   134      <AchievementsContext.Provider value={{ desbloqueados, desbloquear, desbloquearOuConvidar, toastPendente, fecharToast, refresh, migrarLocalParaSupabase, registrarGangue }}>
   135        {children}
   136      </AchievementsContext.Provider>
   137    )
   138  }
   139
   140  export const useAchievements = () => useContext(AchievementsContext)
   141
===== ANTES: src/lib/notificationManager.js @ f6877866 =====
     1  /**
     2   * NotificationManager — Fila Centralizada de Notificações
     3   *
     4   * Regra de negócio: no máximo 1 notificação a cada 15 minutos.
     5   * Fila persiste em localStorage. Única exceção: Nina Music (1x/sessão).
     6   *
     7   * Uso:
     8   *   import { notificationManager } from '../../lib/notificationManager'
     9   *   notificationManager.push('ldi_tip', { mensagem, cta, url, personagem })
    10   *   notificationManager.push('achievement', { nome, descricao, icone })
    11   *   notificationManager.push('cta_conta', { achievementId })
    12   *   notificationManager.push('nina_music', { greetingKey })
    13   */
    14
    15  const STORAGE_LAST = 'ldi-notif-last-time'
    16  const STORAGE_QUEUE = 'ldi-notif-queue'
    17  const COOLDOWN_MS = 15 * 60 * 1000 // 15 minutos
    18  const NOTIF_TTL_MS = 5 * 60 * 1000 // 5 minutos — itens mais velhos são descartados silenciosamente
    19
    20  export const NotificationType = {
    21    ACHIEVEMENT: 'achievement',
    22    CTA_CONTA: 'cta_conta',
    23    LDI_TIP: 'ldi_tip',
    24    NINA_MUSIC: 'nina_music',
    25  }
    26
    27  export const notificationManager = {
    28    /**
    29     * Adiciona uma notificação à fila.
    30     * @param {'achievement'|'cta_conta'|'ldi_tip'|'nina_music'} type
    31     * @param {object} data - dados específicos do tipo
    32     */
    33    push(type, data) {
    34      const queue = this._getQueue()
    35      // Evita duplicatas do mesmo tipo consecutivas
    36      if (queue.length > 0 && queue[queue.length - 1].type === type) {
    37        return
    38      }
    39      queue.push({
    40        type,
    41        data,
    42        id: Date.now() + Math.random(),
    43        createdAt: Date.now(),
    44      })
    45      this._saveQueue(queue)
    46      this._notifyListeners()
    47    },
    48
    49    /**
    50     * Tenta obter a próxima notificação da fila.
    51     * Respeita o cooldown de 15 min, a menos que bypassCooldown=true.
    52     * Se aprovada, remove da fila e registra o timestamp.
    53     * @param {boolean} [bypassCooldown=false] - se true, ignora o cooldown de 15 min
    54     * @returns {{type, data, id}|null}
    55     */
    56    pull(bypassCooldown = false) {
    57      const queue = this._getQueue()
    58      if (queue.length === 0) return null
    59
    60      const now = Date.now()
    61
    62      // Remove todos os itens expirados, independente de tipo ou posição
    63      const changed = this._purgeExpired(queue, now)
    64      if (queue.length === 0) {
    65        if (changed) this._saveQueue(queue)
    66        return null
    67      }
    68
    69      const item = queue[0]
    70      const lastTime = this._getLastTime()
    71      if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
    72        queue.shift()
    73        this._saveQueue(queue)
    74        this._setLastTime(now)
    75        return item
    76      }
    77
    78      if (changed) this._saveQueue(queue)
    79      return null // cooldown ativo
    80    },
    81
    82    /** Espia a primeira da fila sem remover */
    83    peek() {
    84      const queue = this._getQueue()
    85      return queue.length > 0 ? queue[0] : null
    86    },
    87
    88    /** Quantidade de notificações na fila */
    89    queueLength() {
    90      return this._getQueue().length
    91    },
    92
    93    /** Se pode mostrar notificação agora (cooldown passou) */
    94    canShow() {
    95      return Date.now() - this._getLastTime() >= COOLDOWN_MS
    96    },
    97
    98    /** Ms restantes até liberar próxima notificação */
    99    timeUntilNext() {
   100      const remaining = COOLDOWN_MS - (Date.now() - this._getLastTime())
   101      return Math.max(0, remaining)
   102    },
   103
   104    /** Busca e remove o primeiro item de um tipo específico, com bypass opcional de cooldown */
   105    findAndPull(type, bypassCooldown = false) {
   106      const queue = this._getQueue()
   107      const now = Date.now()
   108
   109      // Remove todos os itens expirados, independente de tipo
   110      const changed = this._purgeExpired(queue, now)
   111
   112      // Percorre na ordem FIFO (início → fim), retorna o primeiro item válido do tipo
   113      for (let i = 0; i < queue.length; i++) {
   114        if (queue[i].type !== type) continue
   115        // Primeiro item válido do tipo encontrado — aplica cooldown check
   116        const lastTime = this._getLastTime()
   117        if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
   118          const valid = queue[i]
   119          queue.splice(i, 1)
   120          this._saveQueue(queue)
   121          this._setLastTime(now)
   122          return valid
   123        }
   124        // Cooldown ativo — não retorna, mas não remove da fila
   125        if (changed) this._saveQueue(queue)
   126        return null
   127      }
   128
   129      // Nenhum item do tipo encontrado — salva remoções de expirados se houve
   130      if (changed) this._saveQueue(queue)
   131      return null
   132    },
   133
   134    /** Remove da fila todos os itens de um tipo específico */
   135    clearByType(type) {
   136      const queue = this._getQueue().filter(item => item.type !== type)
   137      this._saveQueue(queue)
   138      this._notifyListeners()
   139    },
   140
   141    /** Limpa a fila inteira */
   142    clear() {
   143      localStorage.removeItem(STORAGE_QUEUE)
   144      this._notifyListeners()
   145    },
   146
   147    // ── Internals ──
   148
   149    _getQueue() {
   150      try {
   151        return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || '[]')
   152      } catch {
   153        return []
   154      }
   155    },
   156
   157    _saveQueue(q) {
   158      localStorage.setItem(STORAGE_QUEUE, JSON.stringify(q))
   159    },
   160
   161    _purgeExpired(queue, now) {
   162      let changed = false
   163      for (let i = queue.length - 1; i >= 0; i--) {
   164        if (now - queue[i].createdAt > NOTIF_TTL_MS) {
   165          queue.splice(i, 1)
   166          changed = true
   167        }
   168      }
   169      return changed
   170    },
   171
   172    _getLastTime() {
   173      return parseInt(localStorage.getItem(STORAGE_LAST) || '0', 10)
   174    },
   175
   176    _setLastTime(t) {
   177      localStorage.setItem(STORAGE_LAST, String(t))
   178    },
   179
   180    _listeners: new Set(),
   181
   182    /** Inscreve callback para mudanças na fila. Retorna unsubscribe. */
   183    subscribe(fn) {
   184      this._listeners.add(fn)
   185      return () => this._listeners.delete(fn)
   186    },
   187
   188    _notifyListeners() {
   189      this._listeners.forEach(fn => {
   190        try { fn() } catch (e) { /* silencioso */ }
   191      })
   192    },
   193  }
   194
===== DEPOIS: src/lib/notificationManager.js @ working tree v10.192.23 =====
     1  /**
     2   * NotificationManager â€” Fila Centralizada de NotificaÃ§Ãµes
     3   *
     4   * Regra de negÃ³cio: no mÃ¡ximo 1 notificaÃ§Ã£o a cada 15 minutos.
     5   * Fila persiste em localStorage. Ãšnica exceÃ§Ã£o: Nina Music (1x/sessÃ£o).
     6   *
     7   * Uso:
     8   *   import { notificationManager } from '../../lib/notificationManager'
     9   *   notificationManager.push('ldi_tip', { mensagem, cta, url, personagem })
    10   *   notificationManager.push('achievement', { nome, descricao, icone })
    11   *   notificationManager.push('cta_conta', { achievementId })
    12   *   notificationManager.push('nina_music', { greetingKey })
    13   */
    14
    15  const STORAGE_LAST = 'ldi-notif-last-time'
    16  const STORAGE_QUEUE = 'ldi-notif-queue'
    17  const COOLDOWN_MS = 15 * 60 * 1000 // 15 minutos
    18  const NOTIF_TTL_MS = 5 * 60 * 1000 // 5 minutos â€” itens mais velhos sÃ£o descartados silenciosamente
    19
    20  export const NotificationType = {
    21    ACHIEVEMENT: 'achievement',
    22    CTA_CONTA: 'cta_conta',
    23    LDI_TIP: 'ldi_tip',
    24    NINA_MUSIC: 'nina_music',
    25  }
    26
    27  export const notificationManager = {
    28    /**
    29     * Adiciona uma notificaÃ§Ã£o Ã  fila.
    30     * @param {'achievement'|'cta_conta'|'ldi_tip'|'nina_music'} type
    31     * @param {object} data - dados especÃ­ficos do tipo
    32     */
    33    push(type, data) {
    34      const queue = this._getQueue()
    35      const beforeLength = queue.length
    36      // Evita duplicatas do mesmo tipo consecutivas
    37      if (queue.length > 0 && queue[queue.length - 1].type === type) {
    38        console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', queueBefore: beforeLength, queueAfter: queue.length, createdAt: null, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'rejected-consecutive-duplicate' })
    39        return
    40      }
    41      const item = {
    42        type,
    43        data,
    44        id: Date.now() + Math.random(),
    45        createdAt: Date.now(),
    46      }
    47      queue.push(item)
    48      this._saveQueue(queue)
    49      console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', notificationId: item.id, queueBefore: beforeLength, queueAfter: queue.length, createdAt: item.createdAt, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'enqueued' })
    50      this._notifyListeners()
    51    },
    52
    53    /**
    54     * Tenta obter a prÃ³xima notificaÃ§Ã£o da fila.
    55     * Respeita o cooldown de 15 min, a menos que bypassCooldown=true.
    56     * Se aprovada, remove da fila e registra o timestamp.
    57     * @param {boolean} [bypassCooldown=false] - se true, ignora o cooldown de 15 min
    58     * @returns {{type, data, id}|null}
    59     */
    60    pull(bypassCooldown = false) {
    61      const queue = this._getQueue()
    62      console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'pull', requestedType: null, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })
    63      if (queue.length === 0) {
    64        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'empty-queue', queueAfter: 0 })
    65        return null
    66      }
    67
    68      const now = Date.now()
    69
    70      // Remove todos os itens expirados, independente de tipo ou posiÃ§Ã£o
    71      const changed = this._purgeExpired(queue, now)
    72      if (queue.length === 0) {
    73        if (changed) this._saveQueue(queue)
    74        return null
    75      }
    76
    77      const item = queue[0]
    78      const lastTime = this._getLastTime()
    79      if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
    80        queue.shift()
    81        this._saveQueue(queue)
    82        this._setLastTime(now)
    83        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'selected', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
    84        return item
    85      }
    86
    87      if (changed) this._saveQueue(queue)
    88      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'cooldown-active', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
    89      return null // cooldown ativo
    90    },
    91
    92    /** Espia a primeira da fila sem remover */
    93    peek() {
    94      const queue = this._getQueue()
    95      return queue.length > 0 ? queue[0] : null
    96    },
    97
    98    /** Quantidade de notificaÃ§Ãµes na fila */
    99    queueLength() {
   100      return this._getQueue().length
   101    },
   102
   103    /** Se pode mostrar notificaÃ§Ã£o agora (cooldown passou) */
   104    canShow() {
   105      return Date.now() - this._getLastTime() >= COOLDOWN_MS
   106    },
   107
   108    /** Ms restantes atÃ© liberar prÃ³xima notificaÃ§Ã£o */
   109    timeUntilNext() {
   110      const remaining = COOLDOWN_MS - (Date.now() - this._getLastTime())
   111      return Math.max(0, remaining)
   112    },
   113
   114    /** Busca e remove o primeiro item de um tipo especÃ­fico, com bypass opcional de cooldown */
   115    findAndPull(type, bypassCooldown = false) {
   116      const queue = this._getQueue()
   117      const now = Date.now()
   118      console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'findAndPull', requestedType: type, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })
   119
   120      // Remove todos os itens expirados, independente de tipo
   121      const changed = this._purgeExpired(queue, now)
   122
   123      // Percorre na ordem FIFO (inÃ­cio â†’ fim), retorna o primeiro item vÃ¡lido do tipo
   124      for (let i = 0; i < queue.length; i++) {
   125        if (queue[i].type !== type) continue
   126        // Primeiro item vÃ¡lido do tipo encontrado â€” aplica cooldown check
   127        const lastTime = this._getLastTime()
   128        if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
   129          const valid = queue[i]
   130          queue.splice(i, 1)
   131          this._saveQueue(queue)
   132          this._setLastTime(now)
   133          console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'selected', requestedType: type, type: valid.type, key: valid.data?.achievementId ?? valid.data?.nome ?? null, notificationId: valid.id, createdAt: valid.createdAt, ageMs: now - valid.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
   134          return valid
   135        }
   136        // Cooldown ativo â€” nÃ£o retorna, mas nÃ£o remove da fila
   137        if (changed) this._saveQueue(queue)
   138        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'cooldown-active', requestedType: type, type: queue[i].type, key: queue[i].data?.achievementId ?? queue[i].data?.nome ?? null, notificationId: queue[i].id, createdAt: queue[i].createdAt, ageMs: now - queue[i].createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
   139        return null
   140      }
   141
   142      // Nenhum item do tipo encontrado â€” salva remoÃ§Ãµes de expirados se houve
   143      if (changed) this._saveQueue(queue)
   144      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: changed ? 'expired-items-purged-no-match' : 'no-matching-type', requestedType: type, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
   145      return null
   146    },
   147
   148    /** Remove da fila todos os itens de um tipo especÃ­fico */
   149    clearByType(type) {
   150      const queue = this._getQueue().filter(item => item.type !== type)
   151      this._saveQueue(queue)
   152      this._notifyListeners()
   153    },
   154
   155    /** Limpa a fila inteira */
   156    clear() {
   157      localStorage.removeItem(STORAGE_QUEUE)
   158      this._notifyListeners()
   159    },
   160
   161    // â”€â”€ Internals â”€â”€
   162
   163    _getQueue() {
   164      try {
   165        return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || '[]')
   166      } catch {
   167        return []
   168      }
   169    },
   170
   171    _saveQueue(q) {
   172      localStorage.setItem(STORAGE_QUEUE, JSON.stringify(q))
   173    },
   174
   175    _purgeExpired(queue, now) {
   176      let changed = false
   177      for (let i = queue.length - 1; i >= 0; i--) {
   178        if (now - queue[i].createdAt > NOTIF_TTL_MS) {
   179          queue.splice(i, 1)
   180          changed = true
   181        }
   182      }
   183      return changed
   184    },
   185
   186    _getLastTime() {
   187      return parseInt(localStorage.getItem(STORAGE_LAST) || '0', 10)
   188    },
   189
   190    _setLastTime(t) {
   191      localStorage.setItem(STORAGE_LAST, String(t))
   192    },
   193
   194    _listeners: new Set(),
   195
   196    /** Inscreve callback para mudanÃ§as na fila. Retorna unsubscribe. */
   197    subscribe(fn) {
   198      this._listeners.add(fn)
   199      return () => this._listeners.delete(fn)
   200    },
   201
   202    _notifyListeners() {
   203      this._listeners.forEach(fn => {
   204        try { fn() } catch (e) { /* silencioso */ }
   205      })
   206    },
   207  }
   208
===== ANTES: src/components/UnifiedNotification/UnifiedNotification.jsx @ f6877866 =====
     1  import { useState, useEffect, useRef, useCallback } from 'react'
     2  import { Link, useNavigate } from 'react-router-dom'
     3  import { notificationManager, NotificationType } from '../../lib/notificationManager'
     4  import { useLanguage } from '../../context/LanguageContext'
     5  import { useAuth } from '../../context/AuthContext'
     6  import jackImg from '../../assets/images/characters/jack-balloon.png'
     7  import ninaImg from '../../assets/images/characters/nina-balloon.png'
     8  import tamaImg from '../../assets/images/tamagoshi/01/kroniki-presentation.png'
     9  import thumbEp00 from '../../assets/images/episodes/thumb-ep00.png'
    10  import achievPt from '../../data/achievements-pt.json'
    11  import achievEn from '../../data/achievements-en.json'
    12  import achievEs from '../../data/achievements-es.json'
    13  import stringsPt from '../../data/achievements-strings-pt.json'
    14  import stringsEn from '../../data/achievements-strings-en.json'
    15  import stringsEs from '../../data/achievements-strings-es.json'
    16  // Reusa os CSS existentes — nenhum estilo novo
    17  import '../LDINotification/LDINotification.css'
    18  import '../AchievementToast/AchievementToast.css'
    19  import '../NinaMusicPlayer/NinaMusicPlayer.css'
    20
    21  export default function UnifiedNotification() {
    22    const [current, setCurrent] = useState(null)
    23    const [isClosing, setIsClosing] = useState(false)
    24    const [typedText, setTypedText] = useState('')
    25    const [typingDone, setTypingDone] = useState(false)
    26    const { t, locale } = useLanguage()
    27    const { user } = useAuth()
    28    const navigate = useNavigate()
    29    const autoTimerRef = useRef(null)
    30    const checkIntervalRef = useRef(null)
    31    const ninaCbRef = useRef(null)
    32
    33    // Tenta puxar da fila — mas primeiro verifica notificação pendente da Nina
    34    const tryPull = useCallback(() => {
    35      if (current) return
    36
    37      // Defesa: guest não pode ver achievement de jeito nenhum
    38      if (!user) {
    39        notificationManager.clearByType('achievement')
    40      }
    41
    42      // PRIORIDADE MÁXIMA: Nina notification (não passa pelo notificationManager)
    43      const ninaPending = window.__ninaPendingNotification
    44      if (ninaPending && ninaPending.mensagem) {
    45        setCurrent({
    46          type: 'nina_music',
    47          data: { mensagem: ninaPending.mensagem, greetingKey: ninaPending.greetingKey },
    48          id: Date.now(),
    49        })
    50        setIsClosing(false)
    51        setTypedText('')
    52        setTypingDone(false)
    53        window.__ninaPendingNotification = null
    54        return
    55      }
    56
    57      // Fallback: fila normal do notificationManager
    58      // Achievement (logado) ou CTA (guest) tem prioridade — busca na fila inteira com bypass de cooldown
    59      const item = user
    60        ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
    61        : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
    62      if (item) {
    63        setCurrent(item)
    64        setIsClosing(false)
    65        setTypedText('')
    66        setTypingDone(false)
    67      }
    68    }, [current, user])
    69
    70    // Polling + subscribe
    71    useEffect(() => {
    72      tryPull()
    73      checkIntervalRef.current = setInterval(tryPull, 15000)
    74      const unsub = notificationManager.subscribe(tryPull)
    75      return () => {
    76        clearInterval(checkIntervalRef.current)
    77        unsub()
    78      }
    79    }, [tryPull])
    80
    81    // Typewriter para nina_music
    82    useEffect(() => {
    83      if (!current || current.type !== NotificationType.NINA_MUSIC) return
    84      const fullText = current.data.mensagem || ''
    85      if (!fullText) { setTypingDone(true); return }
    86      let i = 0
    87      setTypedText('')
    88      const interval = setInterval(() => {
    89        i++
    90        setTypedText(fullText.slice(0, i))
    91        if (i >= fullText.length) {
    92          clearInterval(interval)
    93          setTypingDone(true)
    94        }
    95      }, 25)
    96      return () => clearInterval(interval)
    97    }, [current])
    98
    99    // Auto-fechar
   100    useEffect(() => {
   101      if (!current) return
   102      const duration =
   103        current.type === NotificationType.ACHIEVEMENT || current.type === NotificationType.CTA_CONTA ? 6000 :
   104        current.type === NotificationType.NINA_MUSIC ? 0 : // nina fecha manualmente
   105        10000
   106      if (duration === 0) return
   107      autoTimerRef.current = setTimeout(handleClose, duration)
   108      return () => clearTimeout(autoTimerRef.current)
   109    }, [current])
   110
   111    const handleClose = useCallback(() => {
   112      setIsClosing(true)
   113      setTimeout(() => {
   114        setCurrent(null)
   115        setIsClosing(false)
   116      }, 300)
   117    }, [])
   118
   119    // Callback do Sim/Não da Nina
   120    const handleNinaSim = useCallback(() => {
   121      if (ninaCbRef.current) ninaCbRef.current(true)
   122      handleClose()
   123    }, [handleClose])
   124
   125    const handleNinaNao = useCallback(() => {
   126      if (ninaCbRef.current) ninaCbRef.current(false)
   127      handleClose()
   128    }, [handleClose])
   129
   130    // Expõe callback para NinaMusicPlayer se registrar
   131    useEffect(() => {
   132      window.__ninaNotificationCb = (fn) => { ninaCbRef.current = fn }
   133      return () => { window.__ninaNotificationCb = undefined }
   134    }, [])
   135
   136    // ── Locale-aware data ──
   137    const achievList = locale === 'en' ? achievEn : locale === 'es' ? achievEs : achievPt
   138    const ctaStrings = locale === 'en' ? stringsEn : locale === 'es' ? stringsEs : stringsPt
   139
   140    if (!current) return null
   141
   142    // ═══════════════════════════════════════
   143    // ACHIEVEMENT — reusa classes de AchievementToast.css
   144    // ═══════════════════════════════════════
   145    if (current.type === NotificationType.ACHIEVEMENT) {
   146      const ach = current.data
   147      return (
   148        <div className="achievement-overlay" onClick={handleClose}>
   149          <div className="achievement-card" onClick={e => e.stopPropagation()}>
   150            <div className="achievement-particles">
   151              {[...Array(12)].map((_, i) => (
   152                <span key={i} className={`particle p-${i}`} />
   153              ))}
   154            </div>
   155            <img src={thumbEp00} className="achievement-jack" alt="Jack" />
   156            <div className="achievement-label">{t('achievement.titulo')}</div>
   157            <div className="achievement-icone">{ach.icone}</div>
   158            <div className="achievement-nome">{ach.nome}</div>
   159            <div className="achievement-descricao">{ach.descricao}</div>
   160            <button className="achievement-btn" onClick={handleClose}>
   161              {t('achievement.continuar')}
   162            </button>
   163          </div>
   164        </div>
   165      )
   166    }
   167
   168    // ═══════════════════════════════════════
   169    // CTA_CONTA — guest CTA, mesma UI do achievement
   170    // ═══════════════════════════════════════
   171    if (current.type === NotificationType.CTA_CONTA) {
   172      const ach = achievList.find(a => a.id === current.data.achievementId)
   173      return (
   174        <div className="achievement-overlay" onClick={handleClose}>
   175          <div className="achievement-card" onClick={e => e.stopPropagation()}>
   176            <div className="achievement-particles">
   177              {[...Array(12)].map((_, i) => (
   178                <span key={i} className={`particle p-${i}`} />
   179              ))}
   180            </div>
   181            <img src={thumbEp00} className="achievement-jack" alt="Jack" />
   182            <div className="achievement-label">{ctaStrings.cta_conta.titulo}</div>
   183            {ach && <div className="achievement-icone">{ach.icone}</div>}
   184            {ach && <div className="achievement-nome">{ach.nome}</div>}
   185            <div className="achievement-descricao">{ctaStrings.cta_conta.mensagem}</div>
   186            <button className="achievement-btn" onClick={() => { handleClose(); navigate('/cadastro') }}>
   187              {ctaStrings.cta_conta.botao}
   188            </button>
   189          </div>
   190        </div>
   191      )
   192    }
   193
   194    // ═══════════════════════════════════════
   195    // LDI_TIP — reusa classes de LDINotification.css
   196    // ═══════════════════════════════════════
   197    if (current.type === NotificationType.LDI_TIP) {
   198      const d = current.data
   199      const isNina = d.personagem === 'nina'
   200      const isTama = d.personagem === 'tama'
   201      const avatar = isTama ? tamaImg : isNina ? ninaImg : jackImg
   202      const nomePersonagem = d.nome_personagem || (isTama ? 'Kroniki' : isNina ? 'Nina' : 'Jack')
   203      const isExternal = d.url && d.url.startsWith('http')
   204
   205      return (
   206        <div className={`notif-balloon ${isNina ? 'notif-nina' : ''} ${isTama ? 'notif-tama' : ''}`}>
   207          <button className="notif-close" onClick={handleClose}>×</button>
   208          <div className="notif-header">
   209            <img src={avatar} alt={nomePersonagem} className="notif-avatar" />
   210            <span className="notif-name">{nomePersonagem}</span>
   211          </div>
   212          <p className="notif-message">{d.mensagem}</p>
   213          {d.cta && d.url && (
   214            isExternal ? (
   215              <a href={d.url} className="notif-cta" target="_blank" rel="noreferrer" onClick={handleClose}>
   216                {d.cta} →
   217              </a>
   218            ) : (
   219              <Link to={d.url} className="notif-cta" onClick={handleClose}>
   220                {d.cta} →
   221              </Link>
   222            )
   223          )}
   224        </div>
   225      )
   226    }
   227
   228    // ═══════════════════════════════════════
   229    // NINA_MUSIC — reusa classes de NinaMusicPlayer.css
   230    // ═══════════════════════════════════════
   231    if (current.type === NotificationType.NINA_MUSIC) {
   232      const d = current.data
   233      return (
   234        <div className="nina-balloon">
   235          <img src={ninaImg} alt="Nina" className="nina-balloon-avatar" />
   236          <div className="nina-balloon-content">
   237            <p className="nina-balloon-msg">
   238              {typedText}<span className="nina-cursor">|</span>
   239            </p>
   240            {typingDone && (
   241              <>
   242                <span className="nina-tail" />
   243                <div className="nina-balloon-actions">
   244                  <button className="nina-btn nina-btn-yes" onClick={handleNinaSim}>
   245                    {t('nina.yes')}
   246                  </button>
   247                  <button className="nina-btn nina-btn-no" onClick={handleNinaNao}>
   248                    {t('nina.no')}
   249                  </button>
   250                </div>
   251              </>
   252            )}
   253          </div>
   254        </div>
   255      )
   256    }
   257
   258    return null
   259  }
   260
===== DEPOIS: src/components/UnifiedNotification/UnifiedNotification.jsx @ working tree v10.192.23 =====
     1  import { useState, useEffect, useRef, useCallback } from 'react'
     2  import { Link, useNavigate } from 'react-router-dom'
     3  import { notificationManager, NotificationType } from '../../lib/notificationManager'
     4  import { useLanguage } from '../../context/LanguageContext'
     5  import { useAuth } from '../../context/AuthContext'
     6  import jackImg from '../../assets/images/characters/jack-balloon.png'
     7  import ninaImg from '../../assets/images/characters/nina-balloon.png'
     8  import tamaImg from '../../assets/images/tamagoshi/01/kroniki-presentation.png'
     9  import thumbEp00 from '../../assets/images/episodes/thumb-ep00.png'
    10  import achievPt from '../../data/achievements-pt.json'
    11  import achievEn from '../../data/achievements-en.json'
    12  import achievEs from '../../data/achievements-es.json'
    13  import stringsPt from '../../data/achievements-strings-pt.json'
    14  import stringsEn from '../../data/achievements-strings-en.json'
    15  import stringsEs from '../../data/achievements-strings-es.json'
    16  // Reusa os CSS existentes â€” nenhum estilo novo
    17  import '../LDINotification/LDINotification.css'
    18  import '../AchievementToast/AchievementToast.css'
    19  import '../NinaMusicPlayer/NinaMusicPlayer.css'
    20
    21  export default function UnifiedNotification() {
    22    const [current, setCurrent] = useState(null)
    23    const [isClosing, setIsClosing] = useState(false)
    24    const [typedText, setTypedText] = useState('')
    25    const [typingDone, setTypingDone] = useState(false)
    26    const { t, locale } = useLanguage()
    27    const { user } = useAuth()
    28    const navigate = useNavigate()
    29    const autoTimerRef = useRef(null)
    30    const checkIntervalRef = useRef(null)
    31    const ninaCbRef = useRef(null)
    32    const currentRef = useRef(current)
    33    currentRef.current = current
    34
    35    // Tenta puxar da fila â€” mas primeiro verifica notificaÃ§Ã£o pendente da Nina
    36    const tryPull = useCallback(() => {
    37      console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', mode: user ? 'authenticated' : 'guest', currentType: current?.type ?? null, queueLength: notificationManager.queueLength() })
    38      if (current) {
    39        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', result: 'active-notification-blocks-pull', currentType: current.type, queueLength: notificationManager.queueLength() })
    40        return
    41      }
    42
    43      // Defesa: guest nÃ£o pode ver achievement de jeito nenhum
    44      if (!user) {
    45        notificationManager.clearByType('achievement')
    46      }
    47
    48      // PRIORIDADE MÃXIMA: Nina notification (nÃ£o passa pelo notificationManager)
    49      const ninaPending = window.__ninaPendingNotification
    50      if (ninaPending && ninaPending.mensagem) {
    51        setCurrent({
    52          type: 'nina_music',
    53          data: { mensagem: ninaPending.mensagem, greetingKey: ninaPending.greetingKey },
    54          id: Date.now(),
    55        })
    56        setIsClosing(false)
    57        setTypedText('')
    58        setTypingDone(false)
    59        window.__ninaPendingNotification = null
    60        return
    61      }
    62
    63      // Fallback: fila normal do notificationManager
    64      // Achievement (logado) ou CTA (guest) tem prioridade â€” busca na fila inteira com bypass de cooldown
    65      const item = user
    66        ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
    67        : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
    68      if (item) {
    69        console.log('[ACH:TOAST_SHOW]', { timestamp: new Date().toISOString(), type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: Date.now() - item.createdAt, mode: user ? 'authenticated' : 'guest', reason: 'queue-item-selected' })
    70        setCurrent(item)
    71        setIsClosing(false)
    72        setTypedText('')
    73        setTypingDone(false)
    74      }
    75    }, [current, user])
    76
    77    // Polling + subscribe
    78    useEffect(() => {
    79      tryPull()
    80      checkIntervalRef.current = setInterval(tryPull, 15000)
    81      const unsub = notificationManager.subscribe(tryPull)
    82      return () => {
    83        clearInterval(checkIntervalRef.current)
    84        unsub()
    85      }
    86    }, [tryPull])
    87
    88    // Typewriter para nina_music
    89    useEffect(() => {
    90      if (!current || current.type !== NotificationType.NINA_MUSIC) return
    91      const fullText = current.data.mensagem || ''
    92      if (!fullText) { setTypingDone(true); return }
    93      let i = 0
    94      setTypedText('')
    95      const interval = setInterval(() => {
    96        i++
    97        setTypedText(fullText.slice(0, i))
    98        if (i >= fullText.length) {
    99          clearInterval(interval)
   100          setTypingDone(true)
   101        }
   102      }, 25)
   103      return () => clearInterval(interval)
   104    }, [current])
   105
   106    // Auto-fechar
   107    useEffect(() => {
   108      if (!current) return
   109      const duration =
   110        current.type === NotificationType.ACHIEVEMENT || current.type === NotificationType.CTA_CONTA ? 6000 :
   111        current.type === NotificationType.NINA_MUSIC ? 0 : // nina fecha manualmente
   112        10000
   113      if (duration === 0) return
   114      autoTimerRef.current = setTimeout(handleClose, duration)
   115      return () => clearTimeout(autoTimerRef.current)
   116    }, [current])
   117
   118    const handleClose = useCallback(() => {
   119      const activeNotification = currentRef.current
   120      console.log('[ACH:TOAST_CLOSE]', { timestamp: new Date().toISOString(), type: activeNotification?.type ?? null, key: activeNotification?.data?.achievementId ?? activeNotification?.data?.nome ?? null, notificationId: activeNotification?.id ?? null, reason: 'close-requested' })
   121      setIsClosing(true)
   122      setTimeout(() => {
   123        setCurrent(null)
   124        setIsClosing(false)
   125      }, 300)
   126    }, [])
   127
   128    // Callback do Sim/NÃ£o da Nina
   129    const handleNinaSim = useCallback(() => {
   130      if (ninaCbRef.current) ninaCbRef.current(true)
   131      handleClose()
   132    }, [handleClose])
   133
   134    const handleNinaNao = useCallback(() => {
   135      if (ninaCbRef.current) ninaCbRef.current(false)
   136      handleClose()
   137    }, [handleClose])
   138
   139    // ExpÃµe callback para NinaMusicPlayer se registrar
   140    useEffect(() => {
   141      window.__ninaNotificationCb = (fn) => { ninaCbRef.current = fn }
   142      return () => { window.__ninaNotificationCb = undefined }
   143    }, [])
   144
   145    // â”€â”€ Locale-aware data â”€â”€
   146    const achievList = locale === 'en' ? achievEn : locale === 'es' ? achievEs : achievPt
   147    const ctaStrings = locale === 'en' ? stringsEn : locale === 'es' ? stringsEs : stringsPt
   148
   149    if (!current) return null
   150
   151    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   152    // ACHIEVEMENT â€” reusa classes de AchievementToast.css
   153    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   154    if (current.type === NotificationType.ACHIEVEMENT) {
   155      const ach = current.data
   156      return (
   157        <div className="achievement-overlay" onClick={handleClose}>
   158          <div className="achievement-card" onClick={e => e.stopPropagation()}>
   159            <div className="achievement-particles">
   160              {[...Array(12)].map((_, i) => (
   161                <span key={i} className={`particle p-${i}`} />
   162              ))}
   163            </div>
   164            <img src={thumbEp00} className="achievement-jack" alt="Jack" />
   165            <div className="achievement-label">{t('achievement.titulo')}</div>
   166            <div className="achievement-icone">{ach.icone}</div>
   167            <div className="achievement-nome">{ach.nome}</div>
   168            <div className="achievement-descricao">{ach.descricao}</div>
   169            <button className="achievement-btn" onClick={handleClose}>
   170              {t('achievement.continuar')}
   171            </button>
   172          </div>
   173        </div>
   174      )
   175    }
   176
   177    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   178    // CTA_CONTA â€” guest CTA, mesma UI do achievement
   179    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   180    if (current.type === NotificationType.CTA_CONTA) {
   181      const ach = achievList.find(a => a.id === current.data.achievementId)
   182      return (
   183        <div className="achievement-overlay" onClick={handleClose}>
   184          <div className="achievement-card" onClick={e => e.stopPropagation()}>
   185            <div className="achievement-particles">
   186              {[...Array(12)].map((_, i) => (
   187                <span key={i} className={`particle p-${i}`} />
   188              ))}
   189            </div>
   190            <img src={thumbEp00} className="achievement-jack" alt="Jack" />
   191            <div className="achievement-label">{ctaStrings.cta_conta.titulo}</div>
   192            {ach && <div className="achievement-icone">{ach.icone}</div>}
   193            {ach && <div className="achievement-nome">{ach.nome}</div>}
   194            <div className="achievement-descricao">{ctaStrings.cta_conta.mensagem}</div>
   195            <button className="achievement-btn" onClick={() => { handleClose(); navigate('/cadastro') }}>
   196              {ctaStrings.cta_conta.botao}
   197            </button>
   198          </div>
   199        </div>
   200      )
   201    }
   202
   203    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   204    // LDI_TIP â€” reusa classes de LDINotification.css
   205    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   206    if (current.type === NotificationType.LDI_TIP) {
   207      const d = current.data
   208      const isNina = d.personagem === 'nina'
   209      const isTama = d.personagem === 'tama'
   210      const avatar = isTama ? tamaImg : isNina ? ninaImg : jackImg
   211      const nomePersonagem = d.nome_personagem || (isTama ? 'Kroniki' : isNina ? 'Nina' : 'Jack')
   212      const isExternal = d.url && d.url.startsWith('http')
   213
   214      return (
   215        <div className={`notif-balloon ${isNina ? 'notif-nina' : ''} ${isTama ? 'notif-tama' : ''}`}>
   216          <button className="notif-close" onClick={handleClose}>Ã—</button>
   217          <div className="notif-header">
   218            <img src={avatar} alt={nomePersonagem} className="notif-avatar" />
   219            <span className="notif-name">{nomePersonagem}</span>
   220          </div>
   221          <p className="notif-message">{d.mensagem}</p>
   222          {d.cta && d.url && (
   223            isExternal ? (
   224              <a href={d.url} className="notif-cta" target="_blank" rel="noreferrer" onClick={handleClose}>
   225                {d.cta} â†’
   226              </a>
   227            ) : (
   228              <Link to={d.url} className="notif-cta" onClick={handleClose}>
   229                {d.cta} â†’
   230              </Link>
   231            )
   232          )}
   233        </div>
   234      )
   235    }
   236
   237    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   238    // NINA_MUSIC â€” reusa classes de NinaMusicPlayer.css
   239    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   240    if (current.type === NotificationType.NINA_MUSIC) {
   241      const d = current.data
   242      return (
   243        <div className="nina-balloon">
   244          <img src={ninaImg} alt="Nina" className="nina-balloon-avatar" />
   245          <div className="nina-balloon-content">
   246            <p className="nina-balloon-msg">
   247              {typedText}<span className="nina-cursor">|</span>
   248            </p>
   249            {typingDone && (
   250              <>
   251                <span className="nina-tail" />
   252                <div className="nina-balloon-actions">
   253                  <button className="nina-btn nina-btn-yes" onClick={handleNinaSim}>
   254                    {t('nina.yes')}
   255                  </button>
   256                  <button className="nina-btn nina-btn-no" onClick={handleNinaNao}>
   257                    {t('nina.no')}
   258                  </button>
   259                </div>
   260              </>
   261            )}
   262          </div>
   263        </div>
   264      )
   265    }
   266
   267    return null
   268  }
   269
```

## Apêndice D — git diff integral dos arquivos autorais da entrega

```text
diff --git a/SITE_MAP.md b/SITE_MAP.md
index ee9637d1..7cc5e579 100644
--- a/SITE_MAP.md
+++ b/SITE_MAP.md
@@ -1,6 +1,6 @@
 # ILLUSIONFIGHT.COM — SITE MAP

-> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.** Última atualização: 2026-07-13 (fix: mojibake residual DeckBuilder + Prototype + WebtoonEpisodio + v10.192.20) → v10.192.21 (Graphify: grafo de conhecimento + skill OpenCode)
+> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.** Última atualização: 2026-07-18 — v10.192.23 (complemento documental da instrumentação do timing do troféu; callback sem alteração de identidade)
 > **🔒 Lista de arquivos proibidos:** ver `AGENTS.md` → "Arquivos proibidos — nunca tocar"

 ---
@@ -566,7 +566,7 @@

 | Constante | Versão | Descrição |
 |---|---|---|
-| `SITE_VERSION` | **10.192.17** | fix: purge completo de expirados em qualquer leitura da fila (preparação alta frequência) |
+| `SITE_VERSION` | **10.192.23** | diagnóstico: entrega documental completa e callback instrumentado sem alterar identidade |
 | `PP_VERSION` | **2.3.1** | Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json |
 | `LDI_VERSION` | **2.0.1** | Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro) |
 | `JACK_VERSION` | **5.3.1** | Jack Dream Beer — guest aviso visual fix (centralizado, card, botão) |
diff --git a/src/components/UnifiedNotification/UnifiedNotification.jsx b/src/components/UnifiedNotification/UnifiedNotification.jsx
index 26dfa4e9..bc78fbf3 100644
--- a/src/components/UnifiedNotification/UnifiedNotification.jsx
+++ b/src/components/UnifiedNotification/UnifiedNotification.jsx
@@ -29,10 +29,16 @@ export default function UnifiedNotification() {
   const autoTimerRef = useRef(null)
   const checkIntervalRef = useRef(null)
   const ninaCbRef = useRef(null)
+  const currentRef = useRef(current)
+  currentRef.current = current

   // Tenta puxar da fila — mas primeiro verifica notificação pendente da Nina
   const tryPull = useCallback(() => {
-    if (current) return
+    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', mode: user ? 'authenticated' : 'guest', currentType: current?.type ?? null, queueLength: notificationManager.queueLength() })
+    if (current) {
+      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', result: 'active-notification-blocks-pull', currentType: current.type, queueLength: notificationManager.queueLength() })
+      return
+    }

     // Defesa: guest não pode ver achievement de jeito nenhum
     if (!user) {
@@ -60,6 +66,7 @@ export default function UnifiedNotification() {
       ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
       : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
     if (item) {
+      console.log('[ACH:TOAST_SHOW]', { timestamp: new Date().toISOString(), type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: Date.now() - item.createdAt, mode: user ? 'authenticated' : 'guest', reason: 'queue-item-selected' })
       setCurrent(item)
       setIsClosing(false)
       setTypedText('')
@@ -109,6 +116,8 @@ export default function UnifiedNotification() {
   }, [current])

   const handleClose = useCallback(() => {
+    const activeNotification = currentRef.current
+    console.log('[ACH:TOAST_CLOSE]', { timestamp: new Date().toISOString(), type: activeNotification?.type ?? null, key: activeNotification?.data?.achievementId ?? activeNotification?.data?.nome ?? null, notificationId: activeNotification?.id ?? null, reason: 'close-requested' })
     setIsClosing(true)
     setTimeout(() => {
       setCurrent(null)
diff --git a/src/config/version.js b/src/config/version.js
index 43413561..92a2a2ba 100644
--- a/src/config/version.js
+++ b/src/config/version.js
@@ -8,7 +8,7 @@
  */

 // ── Site ──────────────────────────────────────────
-export const SITE_VERSION = '10.192.21'
+export const SITE_VERSION = '10.192.23'

 // ── Games ─────────────────────────────────────────
 export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
@@ -51,4 +51,4 @@ console.log(`[GLITCH] versão carregada: ${GLITCH_VERSION}`)
 console.log(`[BULLETHELL] versão carregada: ${BULLETHELL_VERSION}`)
 console.log(`[STABILIZER] versão carregada: ${STABILIZER_VERSION}`)
 console.log(`[TS] versão carregada: ${TS_VERSION}`)
-console.log(`[TM] versão carregada: ${TM_VERSION}`)
\ No newline at end of file
+console.log(`[TM] versão carregada: ${TM_VERSION}`)
diff --git a/src/context/AchievementsContext.jsx b/src/context/AchievementsContext.jsx
index 4aee6869..aea70f52 100644
--- a/src/context/AchievementsContext.jsx
+++ b/src/context/AchievementsContext.jsx
@@ -36,6 +36,11 @@ export function AchievementsProvider({ children }) {
   async function carregarDoSupabase() {
     const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
     if (error) { console.error('Erro ao carregar achievements:', error); return }
+    console.log('[ACH:EXISTING_CHECK]', {
+      timestamp: new Date().toISOString(), source: 'supabase-load', mode: 'authenticated',
+      existingCount: data?.length ?? 0, requestedPersistence: false, requestedToast: false,
+      reason: 'existing-achievements-loaded-without-toast',
+    })
     if (data && data.length > 0) setDesbloqueados(data.map(d => d.achievement_id))
   }

@@ -48,15 +53,30 @@ export function AchievementsProvider({ children }) {
   }

   const desbloquear = useCallback(async (achievementId) => {
-    console.log('desbloquear:', achievementId, 'user:', user?.id ?? 'NULO')
+    console.trace('[ACH:REQUEST]', {
+      timestamp: new Date().toISOString(), achievementId,
+      mode: user ? 'authenticated' : 'guest', alreadyExisting: desbloqueados.includes(achievementId),
+    })
     // Sem conta logada = não desbloqueia achievement
-    if (!user) return
-    if (desbloqueados.includes(achievementId)) return
+    if (!user) {
+      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: false, reason: 'no-authenticated-user' })
+      return
+    }
+    if (desbloqueados.includes(achievementId)) {
+      console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: false, requestedToast: false, reason: 'already-unlocked-in-state' })
+      return
+    }
     const achievement = todosAchievements.find(a => a.id === achievementId)
-    if (!achievement) return
+    if (!achievement) {
+      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: false, requestedToast: false, reason: 'achievement-definition-not-found' })
+      return
+    }
+    console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: false, requestedPersistence: true, requestedToast: true, reason: 'new-unlock-request' })
+    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'persisting-new-achievement' })
     const { error } = await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
     if (error) {
       if (error.code === '23505') {
+        console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: true, requestedToast: false, reason: 'database-duplicate' })
         setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
         return
       }
@@ -86,10 +106,16 @@ export function AchievementsProvider({ children }) {
   }

   const desbloquearOuConvidar = useCallback((achievementId) => {
+    console.trace('[ACH:REQUEST]', {
+      timestamp: new Date().toISOString(), achievementId,
+      mode: user ? 'authenticated' : 'guest', entrypoint: 'desbloquearOuConvidar',
+    })
     if (!user) {
+      console.log('[ACH:GUEST_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: true, reason: 'guest-cta-enqueue' })
       notificationManager.push('cta_conta', { achievementId })
       return
     }
+    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'delegating-to-unlock' })
     desbloquear(achievementId)
   }, [desbloquear, user])

diff --git a/src/lib/notificationManager.js b/src/lib/notificationManager.js
index 2ef9f430..3f3aed90 100644
--- a/src/lib/notificationManager.js
+++ b/src/lib/notificationManager.js
@@ -32,17 +32,21 @@ export const notificationManager = {
    */
   push(type, data) {
     const queue = this._getQueue()
+    const beforeLength = queue.length
     // Evita duplicatas do mesmo tipo consecutivas
     if (queue.length > 0 && queue[queue.length - 1].type === type) {
+      console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', queueBefore: beforeLength, queueAfter: queue.length, createdAt: null, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'rejected-consecutive-duplicate' })
       return
     }
-    queue.push({
+    const item = {
       type,
       data,
       id: Date.now() + Math.random(),
       createdAt: Date.now(),
-    })
+    }
+    queue.push(item)
     this._saveQueue(queue)
+    console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', notificationId: item.id, queueBefore: beforeLength, queueAfter: queue.length, createdAt: item.createdAt, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'enqueued' })
     this._notifyListeners()
   },

@@ -55,7 +59,11 @@ export const notificationManager = {
    */
   pull(bypassCooldown = false) {
     const queue = this._getQueue()
-    if (queue.length === 0) return null
+    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'pull', requestedType: null, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })
+    if (queue.length === 0) {
+      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'empty-queue', queueAfter: 0 })
+      return null
+    }

     const now = Date.now()

@@ -72,10 +80,12 @@ export const notificationManager = {
       queue.shift()
       this._saveQueue(queue)
       this._setLastTime(now)
+      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'selected', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
       return item
     }

     if (changed) this._saveQueue(queue)
+    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'cooldown-active', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
     return null // cooldown ativo
   },

@@ -105,6 +115,7 @@ export const notificationManager = {
   findAndPull(type, bypassCooldown = false) {
     const queue = this._getQueue()
     const now = Date.now()
+    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'findAndPull', requestedType: type, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })

     // Remove todos os itens expirados, independente de tipo
     const changed = this._purgeExpired(queue, now)
@@ -119,15 +130,18 @@ export const notificationManager = {
         queue.splice(i, 1)
         this._saveQueue(queue)
         this._setLastTime(now)
+        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'selected', requestedType: type, type: valid.type, key: valid.data?.achievementId ?? valid.data?.nome ?? null, notificationId: valid.id, createdAt: valid.createdAt, ageMs: now - valid.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
         return valid
       }
       // Cooldown ativo — não retorna, mas não remove da fila
       if (changed) this._saveQueue(queue)
+      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'cooldown-active', requestedType: type, type: queue[i].type, key: queue[i].data?.achievementId ?? queue[i].data?.nome ?? null, notificationId: queue[i].id, createdAt: queue[i].createdAt, ageMs: now - queue[i].createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
       return null
     }

     // Nenhum item do tipo encontrado — salva remoções de expirados se houve
     if (changed) this._saveQueue(queue)
+    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: changed ? 'expired-items-purged-no-match' : 'no-matching-type', requestedType: type, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
     return null
   },

diff --git a/src/pages/content/WebtoonEpisodio.jsx b/src/pages/content/WebtoonEpisodio.jsx
index ae0e52ef..8b5f503d 100644
--- a/src/pages/content/WebtoonEpisodio.jsx
+++ b/src/pages/content/WebtoonEpisodio.jsx
@@ -22,7 +22,7 @@ export default function WebtoonEpisodio() {
   const { id } = useParams()
   const navigate = useNavigate()
   const { locale, t } = useLanguage()
-  const { user, perfil } = useAuth()
+  const { user, perfil, carregando } = useAuth()
   const { desbloquearOuConvidar } = useAchievements()
   const { registrarEvento } = useEventos()
   const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
@@ -31,6 +31,17 @@ export default function WebtoonEpisodio() {
   useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
   const ultimaPaginaRef = useRef(null)

+  useEffect(() => {
+    const epAtual = episodios.find(e => e.id === id)
+    console.log('[WEBTOON:INIT]', {
+      timestamp: new Date().toISOString(), pathname: window.location.pathname,
+      episodeId: id, totalPages: epAtual?.paginas ?? 0, origin: 'mount',
+      scrollY: window.scrollY, innerHeight: window.innerHeight,
+      scrollHeight: document.documentElement.scrollHeight, completionGuard: 'none',
+      mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
+    })
+  }, [id])
+
   useEffect(() => {
     setReaderMode(true)
     return () => setReaderMode(false)
@@ -50,8 +61,25 @@ export default function WebtoonEpisodio() {
   useEffect(() => {
     if (!ultimaPaginaRef.current) return
     const observer = new IntersectionObserver(([entry]) => {
+      const scrollHeight = document.documentElement.scrollHeight
+      console.log('[WEBTOON:COMPLETE_CHECK]', {
+        timestamp: new Date().toISOString(), pathname: window.location.pathname,
+        episodeId: id, totalPages: episodios.find(e => e.id === id)?.paginas ?? 0,
+        origin: 'observer', scrollY: window.scrollY, innerHeight: window.innerHeight,
+        scrollHeight, distanceToEnd: scrollHeight - (window.scrollY + window.innerHeight),
+        isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio,
+        completionResult: entry.isIntersecting, completionGuard: 'none',
+        mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
+      })
       if (entry.isIntersecting) {
-        if (id === '00') desbloquearOuConvidarRef.current('episodio_zero')
+        if (id === '00') {
+          console.trace('[WEBTOON:COMPLETE_TRIGGER]', {
+            timestamp: new Date().toISOString(), pathname: window.location.pathname,
+            episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
+            mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
+          })
+          desbloquearOuConvidarRef.current('episodio_zero')
+        }
       }
     }, { threshold: 0.1 })
     observer.observe(ultimaPaginaRef.current)
```

## Apêndice E — Output bruto completo de npm run build

```text

> illusion-fight@1.0.0 build
> vite build && node scripts/prerender-routes.js

[36mvite v8.0.16 [32mbuilding client environment for production...[36m[39m
[2K
transforming...✓ 1341 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                           5.00 kB │ gzip:   1.85 kB
dist/assets/jack-balloon-DdljwY2J.png                   114.92 kB
dist/assets/capitulo-03-D7o_hVwL.png                    115.02 kB
dist/assets/capitulo-02-BTqvWGoQ.png                    116.92 kB
dist/assets/capitulo-01-Bk9siYTB.png                    118.32 kB
dist/assets/kroum-abandoned-Cu0kYSYQ.png                129.22 kB
dist/assets/ninka-abandoned-C5PViYJ8.png                138.97 kB
dist/assets/yawaru-abandoned-CycPBYcK.png               141.49 kB
dist/assets/11-giICQLFZ.png                             150.24 kB
dist/assets/indye-enjoy-Bnzm_sI6.png                    151.98 kB
dist/assets/lenna-sleepy-fk62qfu4.png                   156.35 kB
dist/assets/13-Dm9VLAXY.png                             156.63 kB
dist/assets/nina-balloon-C8FTxLIx.png                   158.03 kB
dist/assets/09-B_Px4sfP.png                             160.53 kB
dist/assets/popystar-sleepy-DA8wgAqz.png                170.02 kB
dist/assets/12-DmXEBNTl.png                             170.08 kB
dist/assets/03-DMzYOI2l.png                             172.44 kB
dist/assets/kaiser-sleepy-Dv0v5cgY.png                  172.66 kB
dist/assets/TemplateBaseReutilizavel-02-Dlk0LVDD.png    174.92 kB
dist/assets/01--vo5oxgm.png                             175.65 kB
dist/assets/ninka-enjoy-Dk-H94Oy.png                    175.78 kB
dist/assets/10-Dd-mf8pS.png                             177.06 kB
dist/assets/alion-sick-B-8c20S-.png                     177.25 kB
dist/assets/lenna-hungry-CqFbvrM5.png                   177.55 kB
dist/assets/lenna-anger-B8QmD9pQ.png                    183.68 kB
dist/assets/kroum-anger-Bo3pEbvq.png                    184.07 kB
dist/assets/lenna-abandoned-CdvtAHCJ.png                186.15 kB
dist/assets/kroum-sick-B7TwKwzN.png                     187.63 kB
dist/assets/16-D5cFl8Wk.png                             188.19 kB
dist/assets/lenna-happy-11ewZwpo.png                    190.51 kB
dist/assets/kroniki-sleepy-De3MDUyh.png                 190.77 kB
dist/assets/kroum-idle-DU2CKlPp.png                     193.97 kB
dist/assets/05-Cy4uxI_4.png                             194.15 kB
dist/assets/06-BrDGb6kN.png                             195.04 kB
dist/assets/draken-idle-BI-MuiN8.png                    195.19 kB
dist/assets/04-CfDnlv9H.png                             196.73 kB
dist/assets/draken-enjoy-Dp7azmod.png                   196.87 kB
dist/assets/14-DTxweA7l.png                             197.31 kB
dist/assets/draken-hungry-D6FFEgvj.png                  197.57 kB
dist/assets/07-zYX29F_m.png                             199.10 kB
dist/assets/02-n9zEMPlP.png                             199.38 kB
dist/assets/kaiser-dirty-fBMVhub6.png                   200.39 kB
dist/assets/lenna-idle-BRGb1_6C.png                     200.79 kB
dist/assets/alion-abandoned-CbAKdkCz.png                201.68 kB
dist/assets/kroum-hungry-CIxAYiRO.png                   201.84 kB
dist/assets/kaiser-abandoned-DncKzJzv.png               203.22 kB
dist/assets/08-VcwMqPvb.png                             203.83 kB
dist/assets/ninka-sick-DnfQoxSL.png                     204.30 kB
dist/assets/card-04-CToPBtFj.png                        204.66 kB
dist/assets/card-02-DhceELv5.png                        205.89 kB
dist/assets/draken-abandoned-D3G_AJjH.png               206.97 kB
dist/assets/popystar-idle-B709-F-7.png                  208.14 kB
dist/assets/indye-sick-95Uy7E8f.png                     209.08 kB
dist/assets/lenna-presentation-C2qJ-jp7.png             210.63 kB
dist/assets/draken-presentation-CWXXc3zt.png            211.64 kB
dist/assets/yawaru-enjoy-D2p3Yv28.png                   211.68 kB
dist/assets/indye-sleepy-BdGtzNme.png                   211.85 kB
dist/assets/yawaru-sick-BtdGxfLu.png                    214.34 kB
dist/assets/popystar-sick-D2TEJ_Sb.png                  215.31 kB
dist/assets/draken-dirty-y0gW_QYz.png                   217.43 kB
dist/assets/popystar-dirty-t0DSAbCq.png                 219.66 kB
dist/assets/lenna-sick-CoeO_zdi.png                     219.69 kB
dist/assets/ninka-hungry-l-5rueko.png                   221.76 kB
dist/assets/card-01-VY-znXh4.png                        222.08 kB
dist/assets/draken-happy-5GWZRR56.png                   222.67 kB
dist/assets/draken-sick-B1eM0Ghh.png                    223.78 kB
dist/assets/ninka-angry-Kjpbn0iZ.png                    223.81 kB
dist/assets/lenna-dirty-DUXT8cXH.png                    224.03 kB
dist/assets/kroum-presentation-CqeKqPAH.png             226.36 kB
dist/assets/popystar-presentation-Bt3EIwfU.png          227.92 kB
dist/assets/indye-dirty-DlS4bXFe.png                    230.13 kB
dist/assets/lenna-enjoy-BDtIqLX0.png                    233.41 kB
dist/assets/kaiser-idle-BiBJ1H9v.png                    234.36 kB
dist/assets/kroum-enjoy-CKLfaxBW.png                    235.95 kB
dist/assets/card-07-B2CS5hNl.png                        236.10 kB
dist/assets/popystar-abandoned-B4uUS0dq.png             237.14 kB
dist/assets/card-03-DK01e2aM.png                        240.22 kB
dist/assets/15-DtHQj9ak.png                             240.89 kB
dist/assets/popystar-happy-DSjZVd8v.png                 240.99 kB
dist/assets/ninka-idle-C-bumfNZ.png                     241.68 kB
dist/assets/kroum-happy-hMPbIRit.png                    242.07 kB
dist/assets/alion-sleepy-DYltcNPH.png                   242.16 kB
dist/assets/kroniki-enjoy-Bwb7JZcT.png                  242.91 kB
dist/assets/ninka-happy-C0WrN5fL.png                    244.24 kB
dist/assets/kaiser-anger-BQ_IL0XG.png                   244.40 kB
dist/assets/kroniki-abandoned-C-joR7E-.png              246.80 kB
dist/assets/popystar-anger-m6N76Evu.png                 251.71 kB
dist/assets/draken-anger-BIylJrxb.png                   253.09 kB
dist/assets/card-11-77uXgF35.png                        255.69 kB
dist/assets/kaiser-sick-tne7DuJ1.png                    256.57 kB
dist/assets/kaiser-happy-Cos18ZNI.png                   256.61 kB
dist/assets/card-13-oNzoa_Hz.png                        257.59 kB
dist/assets/ninka-sleepy-CY51t_ar.png                   258.12 kB
dist/assets/kaiser-hungry-CN4zaHeu.png                  263.84 kB
dist/assets/indye-abandoned-Et3nbsB3.png                265.24 kB
dist/assets/thumb-ep01-DXSWBiFE.png                     265.52 kB
dist/assets/ninka-presentation-CtfBqpz3.png             266.06 kB
dist/assets/kroniki-hungry-DhXyhsxG.png                 266.70 kB
dist/assets/card-23-BEGIIHbo.png                        267.30 kB
dist/assets/kaiser-presentation-TBLcUXKs.png            267.85 kB
dist/assets/card-12-Dh3zyKy0.png                        268.57 kB
dist/assets/popystar-hungry-DjarACux.png                268.83 kB
dist/assets/card-09-BJgA4uCO.png                        268.89 kB
dist/assets/popystar-enjoy-VhZMnlYP.png                 269.25 kB
dist/assets/card-15-CYQe1cgY.png                        269.48 kB
dist/assets/alion-enjoy-QDPIU843.png                    270.62 kB
dist/assets/kaiser-enjoy-B6xVYlst.png                   272.43 kB
dist/assets/card-05-BzIcxOne.png                        274.41 kB
dist/assets/indye-happy-CN3Z8yP0.png                    274.65 kB
dist/assets/yawaru-idle-DOmz3ouV.png                    275.05 kB
dist/assets/yawaru-presentation-C-PRTYvu.png            280.13 kB
dist/assets/kroniki-idle-D6YJC9f6.png                   280.41 kB
dist/assets/card-08-8l5tA-dv.png                        283.29 kB
dist/assets/CardInterrogation-DvI_m6h_.png              284.99 kB
dist/assets/yawaru-dirty--eqUu8SG.png                   285.13 kB
dist/assets/draken-sleepy-9kXKhpzq.png                  288.66 kB
dist/assets/yawaru-happy-2ank_psw.png                   289.75 kB
dist/assets/kroum-dirty-DzLW9uaB.png                    289.83 kB
dist/assets/kroniki-happy-CX5TwBKy.png                  293.25 kB
dist/assets/alion-hungry-CiLjTZUv.png                   294.30 kB
dist/assets/thumb-ep00-JbNodZ72.png                     295.09 kB
dist/assets/alion-idle-H2uGSb-w.png                     295.33 kB
dist/assets/card-21-B9bgRSKu.png                        297.13 kB
dist/assets/kroniki-anger-Ce0fRXxb.png                  297.98 kB
dist/assets/alion-dirty-BLfxcPQ4.png                    298.11 kB
dist/assets/ninka-dirty-QKvSCElb.png                    303.02 kB
dist/assets/card-14-UcGuBKjH.png                        304.34 kB
dist/assets/kroum-sleepy-G9UkEYzJ.png                   306.39 kB
dist/assets/alion-anger-B1BQtK68.png                    307.28 kB
dist/assets/kroniki-presentation-BH8n_pVb.png           308.17 kB
dist/assets/indye-idle-CVdVTyFA.png                     310.68 kB
dist/assets/TemplateBaseReutilizavel-03-D_qQngLO.png    314.60 kB
dist/assets/kroniki-sick-B1IP_-mv.png                   315.89 kB
dist/assets/yawaru-anger-De4s09EU.png                   320.53 kB
dist/assets/alion-presentation-C16PWFCM.png             322.87 kB
dist/assets/indye-hungry-n6ZDobjJ.png                   323.08 kB
dist/assets/kroniki-dirty-QIIM_l8O.png                  326.89 kB
dist/assets/yawaru-hungry-DchhORHb.png                  329.52 kB
dist/assets/indye-anger-DDEZIFmA.png                    331.76 kB
dist/assets/alion-happy-D6eZwgwY.png                    334.46 kB
dist/assets/indye-presentation-DKzPzsUi.png             336.61 kB
dist/assets/card-10-B9dDKsvw.png                        344.21 kB
dist/assets/yawaru-sleepy-Cjuo1ZKg.png                  347.63 kB
dist/assets/card-fallback-DvyD1qFW.png                  350.12 kB
dist/assets/TemplateBaseReutilizavel-04-CwNg56Ya.png    352.24 kB
dist/assets/TemplateBaseReutilizavel-05-CP58jBHL.png    361.63 kB
dist/assets/TemplateBaseReutilizavel-C2HNTv3P.png       363.41 kB
dist/assets/TemplateBaseReutilizavel-01-C7dkTu74.png    363.52 kB
dist/assets/card-06-Coym9AWC.png                        374.75 kB
dist/assets/banner-05-CCLwWla-.png                    1,680.13 kB
dist/assets/banner-02-DJ6EZWtK.png                    1,728.37 kB
dist/assets/banner-01-D-vcnxgn.png                    1,865.74 kB
dist/assets/banner-03-BS9ebQac.png                    1,869.93 kB
dist/assets/banner-04-DZHGTVAK.png                    1,991.70 kB
dist/assets/ComingSoon-DLWdVy-s.png                   2,299.33 kB
node.exe : [33m[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-pt.json is dynamically imported by
src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js,
src/pages/games/TopTrumps/TopTrumpsLobby.jsx, dynamic import will not move module into another chunk.
No C:\nvm4w\nodejs\npm.ps1:29 caractere:3
+   & $NODE_EXE $NPM_CLI_JS $args
+   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ([33m[33m[INEF... another chunk.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError

[39m
[33m[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking:
https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[33m[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-en.json is dynamically imported by
src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js, dynamic import will not move module
into another chunk.
[39m
[33m[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-es.json is dynamically imported by
src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js, dynamic import will not move module
into another chunk.
[39m
dist/assets/index-DvSQ7-OD.css                          636.06 kB │ gzip: 102.74 kB
dist/assets/rafael_en-C3lrkU59.js                         2.58 kB │ gzip:   1.30 kB │ map:     3.52 kB
dist/assets/rafael_es-Bn4I9e3_.js                         2.74 kB │ gzip:   1.38 kB │ map:     3.68 kB
dist/assets/rafael_pt-dothxrCS.js                         3.01 kB │ gzip:   1.52 kB │ map:     4.03 kB
dist/assets/capitulo-08-Cc_m2CFL.js                       5.11 kB │ gzip:   2.43 kB │ map:     0.08 kB
dist/assets/capitulo-02-CZxVVwqX.js                       5.94 kB │ gzip:   2.75 kB │ map:     0.08 kB
dist/assets/capitulo-02-DnECldOi.js                       5.94 kB │ gzip:   2.73 kB │ map:     0.08 kB
dist/assets/capitulo-02-BfWZU1R5.js                       5.98 kB │ gzip:   2.75 kB │ map:     0.08 kB
dist/assets/act2-CmBheBlC.js                              6.70 kB │ gzip:   2.50 kB │ map:    11.38 kB
dist/assets/capitulo-12-MuCu_I8X.js                       6.73 kB │ gzip:   2.76 kB │ map:     0.08 kB
dist/assets/act4-C0aCy384.js                              6.76 kB │ gzip:   2.59 kB │ map:    11.00 kB
dist/assets/act2-BWeZYRqB.js                              6.79 kB │ gzip:   2.55 kB │ map:    11.47 kB
dist/assets/capitulo-15-Cv3g4lAe.js                       6.86 kB │ gzip:   3.00 kB │ map:     0.08 kB
dist/assets/act4-B-MWPDRX.js                              6.93 kB │ gzip:   2.60 kB │ map:    11.17 kB
dist/assets/capitulo-11-DYTXeWLe.js                       7.04 kB │ gzip:   2.98 kB │ map:     0.08 kB
dist/assets/capitulo-07-BAFhnEDU.js                       7.11 kB │ gzip:   3.17 kB │ map:     0.08 kB
dist/assets/capitulo-04-BdjknAIc.js                       9.05 kB │ gzip:   4.21 kB │ map:     0.08 kB
dist/assets/capitulo-01-DMK3dABD.js                       9.11 kB │ gzip:   4.00 kB │ map:     0.08 kB
dist/assets/capitulo-01-B0qoPPty.js                       9.14 kB │ gzip:   3.92 kB │ map:     0.08 kB
dist/assets/capitulo-01-D1uDsOKz.js                       9.47 kB │ gzip:   4.11 kB │ map:     0.08 kB
dist/assets/capitulo-04-JF6kZtvA.js                       9.59 kB │ gzip:   4.40 kB │ map:     0.08 kB
dist/assets/capitulo-04-DjMM5y_r.js                       9.65 kB │ gzip:   4.50 kB │ map:     0.08 kB
dist/assets/capitulo-05-iTlLIhSh.js                      12.03 kB │ gzip:   5.19 kB │ map:     0.08 kB
dist/assets/act3-CUVmMsh-.js                             12.17 kB │ gzip:   3.88 kB │ map:    19.05 kB
dist/assets/capitulo-09-v6PG6lag.js                      12.28 kB │ gzip:   5.24 kB │ map:     0.08 kB
dist/assets/capitulo-16-BM8YUBnU.js                      12.44 kB │ gzip:   5.03 kB │ map:     0.08 kB
dist/assets/capitulo-06-BZpn8v6O.js                      12.44 kB │ gzip:   5.17 kB │ map:     0.08 kB
dist/assets/capitulo-05-Bf13x_ve.js                      12.65 kB │ gzip:   5.48 kB │ map:     0.08 kB
dist/assets/capitulo-05-x0TKji8J.js                      12.65 kB │ gzip:   5.40 kB │ map:     0.08 kB
dist/assets/capitulo-06-CAsyQEuk.js                      12.76 kB │ gzip:   5.28 kB │ map:     0.08 kB
dist/assets/capitulo-14-dq1fe74y.js                      13.02 kB │ gzip:   5.25 kB │ map:     0.08 kB
dist/assets/capitulo-10-CyoUds5L.js                      13.08 kB │ gzip:   5.19 kB │ map:     0.08 kB
dist/assets/capitulo-06-ir-MOGBB.js                      13.19 kB │ gzip:   5.46 kB │ map:     0.08 kB
dist/assets/act3-Dwjqq__X.js                             13.60 kB │ gzip:   4.28 kB │ map:    21.12 kB
dist/assets/capitulo-13-Dzk_0_B0.js                      13.89 kB │ gzip:   5.45 kB │ map:     0.08 kB
dist/assets/en-DRwXIVtS.js                               14.57 kB │ gzip:   5.92 kB │ map:    18.46 kB
dist/assets/es-TRqg9LgO.js                               15.24 kB │ gzip:   6.09 kB │ map:    19.14 kB
dist/assets/pt-D8u3qlYl.js                               15.59 kB │ gzip:   6.21 kB │ map:    19.48 kB
dist/assets/act1-DqwazvLB.js                             16.30 kB │ gzip:   4.94 kB │ map:    26.69 kB
dist/assets/act1-6z7BavtX.js                             16.66 kB │ gzip:   5.15 kB │ map:    27.06 kB
dist/assets/act1-AXekDtd0.js                             16.72 kB │ gzip:   5.22 kB │ map:    27.12 kB
dist/assets/capitulo-03-zqZKAoHX.js                      18.74 kB │ gzip:   7.84 kB │ map:     0.08 kB
dist/assets/capitulo-03-2HBG5sda.js                      19.71 kB │ gzip:   8.15 kB │ map:     0.08 kB
dist/assets/capitulo-03-CRfPQEq1.js                      19.90 kB │ gzip:   8.32 kB │ map:     0.08 kB
dist/assets/index-F9mZkYeP.js                         2,913.33 kB │ gzip: 850.15 kB │ map: 8,028.39 kB

[32m✓ built in 2.06s[39m
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

## Apêndice F — Evidência bruta das versões

```text
===== ANTES DO PRIMEIRO BUMP =====

export const SITE_VERSION = '10.192.21'
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
===== DEPOIS DO PRIMEIRO BUMP / COMMIT PUBLICADO =====
export const SITE_VERSION = '10.192.22'
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
===== DEPOIS DO BUMP DE COMPLEMENTACAO =====
src\config\version.js:11:export const SITE_VERSION = '10.192.23'
src\config\version.js:35:console.log(`[SITE] versão carregada: ${SITE_VERSION}`)


```

## Apêndice G — Output bruto completo do build após auditoria de encoding

Exit code: 0.

```text

> illusion-fight@1.0.0 build
> vite build && node scripts/prerender-routes.js

[36mvite v8.0.16 [32mbuilding client environment for production...[36m[39m
[2K
transforming...✓ 1341 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                           5.00 kB │ gzip:   1.85 kB
dist/assets/jack-balloon-DdljwY2J.png                   114.92 kB
dist/assets/capitulo-03-D7o_hVwL.png                    115.02 kB
dist/assets/capitulo-02-BTqvWGoQ.png                    116.92 kB
dist/assets/capitulo-01-Bk9siYTB.png                    118.32 kB
dist/assets/kroum-abandoned-Cu0kYSYQ.png                129.22 kB
dist/assets/ninka-abandoned-C5PViYJ8.png                138.97 kB
dist/assets/yawaru-abandoned-CycPBYcK.png               141.49 kB
dist/assets/11-giICQLFZ.png                             150.24 kB
dist/assets/indye-enjoy-Bnzm_sI6.png                    151.98 kB
dist/assets/lenna-sleepy-fk62qfu4.png                   156.35 kB
dist/assets/13-Dm9VLAXY.png                             156.63 kB
dist/assets/nina-balloon-C8FTxLIx.png                   158.03 kB
dist/assets/09-B_Px4sfP.png                             160.53 kB
dist/assets/popystar-sleepy-DA8wgAqz.png                170.02 kB
dist/assets/12-DmXEBNTl.png                             170.08 kB
dist/assets/03-DMzYOI2l.png                             172.44 kB
dist/assets/kaiser-sleepy-Dv0v5cgY.png                  172.66 kB
dist/assets/TemplateBaseReutilizavel-02-Dlk0LVDD.png    174.92 kB
dist/assets/01--vo5oxgm.png                             175.65 kB
dist/assets/ninka-enjoy-Dk-H94Oy.png                    175.78 kB
dist/assets/10-Dd-mf8pS.png                             177.06 kB
dist/assets/alion-sick-B-8c20S-.png                     177.25 kB
dist/assets/lenna-hungry-CqFbvrM5.png                   177.55 kB
dist/assets/lenna-anger-B8QmD9pQ.png                    183.68 kB
dist/assets/kroum-anger-Bo3pEbvq.png                    184.07 kB
dist/assets/lenna-abandoned-CdvtAHCJ.png                186.15 kB
dist/assets/kroum-sick-B7TwKwzN.png                     187.63 kB
dist/assets/16-D5cFl8Wk.png                             188.19 kB
dist/assets/lenna-happy-11ewZwpo.png                    190.51 kB
dist/assets/kroniki-sleepy-De3MDUyh.png                 190.77 kB
dist/assets/kroum-idle-DU2CKlPp.png                     193.97 kB
dist/assets/05-Cy4uxI_4.png                             194.15 kB
dist/assets/06-BrDGb6kN.png                             195.04 kB
dist/assets/draken-idle-BI-MuiN8.png                    195.19 kB
dist/assets/04-CfDnlv9H.png                             196.73 kB
dist/assets/draken-enjoy-Dp7azmod.png                   196.87 kB
dist/assets/14-DTxweA7l.png                             197.31 kB
dist/assets/draken-hungry-D6FFEgvj.png                  197.57 kB
dist/assets/07-zYX29F_m.png                             199.10 kB
dist/assets/02-n9zEMPlP.png                             199.38 kB
dist/assets/kaiser-dirty-fBMVhub6.png                   200.39 kB
dist/assets/lenna-idle-BRGb1_6C.png                     200.79 kB
dist/assets/alion-abandoned-CbAKdkCz.png                201.68 kB
dist/assets/kroum-hungry-CIxAYiRO.png                   201.84 kB
dist/assets/kaiser-abandoned-DncKzJzv.png               203.22 kB
dist/assets/08-VcwMqPvb.png                             203.83 kB
dist/assets/ninka-sick-DnfQoxSL.png                     204.30 kB
dist/assets/card-04-CToPBtFj.png                        204.66 kB
dist/assets/card-02-DhceELv5.png                        205.89 kB
dist/assets/draken-abandoned-D3G_AJjH.png               206.97 kB
dist/assets/popystar-idle-B709-F-7.png                  208.14 kB
dist/assets/indye-sick-95Uy7E8f.png                     209.08 kB
dist/assets/lenna-presentation-C2qJ-jp7.png             210.63 kB
dist/assets/draken-presentation-CWXXc3zt.png            211.64 kB
dist/assets/yawaru-enjoy-D2p3Yv28.png                   211.68 kB
dist/assets/indye-sleepy-BdGtzNme.png                   211.85 kB
dist/assets/yawaru-sick-BtdGxfLu.png                    214.34 kB
dist/assets/popystar-sick-D2TEJ_Sb.png                  215.31 kB
dist/assets/draken-dirty-y0gW_QYz.png                   217.43 kB
dist/assets/popystar-dirty-t0DSAbCq.png                 219.66 kB
dist/assets/lenna-sick-CoeO_zdi.png                     219.69 kB
dist/assets/ninka-hungry-l-5rueko.png                   221.76 kB
dist/assets/card-01-VY-znXh4.png                        222.08 kB
dist/assets/draken-happy-5GWZRR56.png                   222.67 kB
dist/assets/draken-sick-B1eM0Ghh.png                    223.78 kB
dist/assets/ninka-angry-Kjpbn0iZ.png                    223.81 kB
dist/assets/lenna-dirty-DUXT8cXH.png                    224.03 kB
dist/assets/kroum-presentation-CqeKqPAH.png             226.36 kB
dist/assets/popystar-presentation-Bt3EIwfU.png          227.92 kB
dist/assets/indye-dirty-DlS4bXFe.png                    230.13 kB
dist/assets/lenna-enjoy-BDtIqLX0.png                    233.41 kB
dist/assets/kaiser-idle-BiBJ1H9v.png                    234.36 kB
dist/assets/kroum-enjoy-CKLfaxBW.png                    235.95 kB
dist/assets/card-07-B2CS5hNl.png                        236.10 kB
dist/assets/popystar-abandoned-B4uUS0dq.png             237.14 kB
dist/assets/card-03-DK01e2aM.png                        240.22 kB
dist/assets/15-DtHQj9ak.png                             240.89 kB
dist/assets/popystar-happy-DSjZVd8v.png                 240.99 kB
dist/assets/ninka-idle-C-bumfNZ.png                     241.68 kB
dist/assets/kroum-happy-hMPbIRit.png                    242.07 kB
dist/assets/alion-sleepy-DYltcNPH.png                   242.16 kB
dist/assets/kroniki-enjoy-Bwb7JZcT.png                  242.91 kB
dist/assets/ninka-happy-C0WrN5fL.png                    244.24 kB
dist/assets/kaiser-anger-BQ_IL0XG.png                   244.40 kB
dist/assets/kroniki-abandoned-C-joR7E-.png              246.80 kB
dist/assets/popystar-anger-m6N76Evu.png                 251.71 kB
dist/assets/draken-anger-BIylJrxb.png                   253.09 kB
dist/assets/card-11-77uXgF35.png                        255.69 kB
dist/assets/kaiser-sick-tne7DuJ1.png                    256.57 kB
dist/assets/kaiser-happy-Cos18ZNI.png                   256.61 kB
dist/assets/card-13-oNzoa_Hz.png                        257.59 kB
dist/assets/ninka-sleepy-CY51t_ar.png                   258.12 kB
dist/assets/kaiser-hungry-CN4zaHeu.png                  263.84 kB
dist/assets/indye-abandoned-Et3nbsB3.png                265.24 kB
dist/assets/thumb-ep01-DXSWBiFE.png                     265.52 kB
dist/assets/ninka-presentation-CtfBqpz3.png             266.06 kB
dist/assets/kroniki-hungry-DhXyhsxG.png                 266.70 kB
dist/assets/card-23-BEGIIHbo.png                        267.30 kB
dist/assets/kaiser-presentation-TBLcUXKs.png            267.85 kB
dist/assets/card-12-Dh3zyKy0.png                        268.57 kB
dist/assets/popystar-hungry-DjarACux.png                268.83 kB
dist/assets/card-09-BJgA4uCO.png                        268.89 kB
dist/assets/popystar-enjoy-VhZMnlYP.png                 269.25 kB
dist/assets/card-15-CYQe1cgY.png                        269.48 kB
dist/assets/alion-enjoy-QDPIU843.png                    270.62 kB
dist/assets/kaiser-enjoy-B6xVYlst.png                   272.43 kB
dist/assets/card-05-BzIcxOne.png                        274.41 kB
dist/assets/indye-happy-CN3Z8yP0.png                    274.65 kB
dist/assets/yawaru-idle-DOmz3ouV.png                    275.05 kB
dist/assets/yawaru-presentation-C-PRTYvu.png            280.13 kB
dist/assets/kroniki-idle-D6YJC9f6.png                   280.41 kB
dist/assets/card-08-8l5tA-dv.png                        283.29 kB
dist/assets/CardInterrogation-DvI_m6h_.png              284.99 kB
dist/assets/yawaru-dirty--eqUu8SG.png                   285.13 kB
dist/assets/draken-sleepy-9kXKhpzq.png                  288.66 kB
dist/assets/yawaru-happy-2ank_psw.png                   289.75 kB
dist/assets/kroum-dirty-DzLW9uaB.png                    289.83 kB
dist/assets/kroniki-happy-CX5TwBKy.png                  293.25 kB
dist/assets/alion-hungry-CiLjTZUv.png                   294.30 kB
dist/assets/thumb-ep00-JbNodZ72.png                     295.09 kB
dist/assets/alion-idle-H2uGSb-w.png                     295.33 kB
dist/assets/card-21-B9bgRSKu.png                        297.13 kB
dist/assets/kroniki-anger-Ce0fRXxb.png                  297.98 kB
dist/assets/alion-dirty-BLfxcPQ4.png                    298.11 kB
dist/assets/ninka-dirty-QKvSCElb.png                    303.02 kB
dist/assets/card-14-UcGuBKjH.png                        304.34 kB
dist/assets/kroum-sleepy-G9UkEYzJ.png                   306.39 kB
dist/assets/alion-anger-B1BQtK68.png                    307.28 kB
dist/assets/kroniki-presentation-BH8n_pVb.png           308.17 kB
dist/assets/indye-idle-CVdVTyFA.png                     310.68 kB
dist/assets/TemplateBaseReutilizavel-03-D_qQngLO.png    314.60 kB
dist/assets/kroniki-sick-B1IP_-mv.png                   315.89 kB
dist/assets/yawaru-anger-De4s09EU.png                   320.53 kB
dist/assets/alion-presentation-C16PWFCM.png             322.87 kB
dist/assets/indye-hungry-n6ZDobjJ.png                   323.08 kB
dist/assets/kroniki-dirty-QIIM_l8O.png                  326.89 kB
dist/assets/yawaru-hungry-DchhORHb.png                  329.52 kB
dist/assets/indye-anger-DDEZIFmA.png                    331.76 kB
dist/assets/alion-happy-D6eZwgwY.png                    334.46 kB
dist/assets/indye-presentation-DKzPzsUi.png             336.61 kB
dist/assets/card-10-B9dDKsvw.png                        344.21 kB
dist/assets/yawaru-sleepy-Cjuo1ZKg.png                  347.63 kB
dist/assets/card-fallback-DvyD1qFW.png                  350.12 kB
dist/assets/TemplateBaseReutilizavel-04-CwNg56Ya.png    352.24 kB
dist/assets/TemplateBaseReutilizavel-05-CP58jBHL.png    361.63 kB
dist/assets/TemplateBaseReutilizavel-C2HNTv3P.png       363.41 kB
dist/assets/TemplateBaseReutilizavel-01-C7dkTu74.png    363.52 kB
dist/assets/card-06-Coym9AWC.png                        374.75 kB
dist/assets/banner-05-CCLwWla-.png                    1,680.13 kB
dist/assets/banner-02-DJ6EZWtK.png                    1,728.37 kB
dist/assets/banner-01-D-vcnxgn.png                    1,865.74 kB
dist/assets/banner-03-BS9ebQac.png                    1,869.93 kB
dist/assets/banner-04-DZHGTVAK.png                    1,991.70 kB
dist/assets/ComingSoon-DLWdVy-s.png                   2,299.33 kB
dist/assets/index-DvSQ7-OD.css                          636.06 kB │ gzip: 102.74 kB
dist/assets/rafael_en-C3lrkU59.js                         2.58 kB │ gzip:   1.30 kB │ map:     3.52 kB
dist/assets/rafael_es-Bn4I9e3_.js                         2.74 kB │ gzip:   1.38 kB │ map:     3.68 kB
dist/assets/rafael_pt-dothxrCS.js                         3.01 kB │ gzip:   1.52 kB │ map:     4.03 kB
dist/assets/capitulo-08-Cc_m2CFL.js                       5.11 kB │ gzip:   2.43 kB │ map:     0.08 kB
dist/assets/capitulo-02-CZxVVwqX.js                       5.94 kB │ gzip:   2.75 kB │ map:     0.08 kB
dist/assets/capitulo-02-DnECldOi.js                       5.94 kB │ gzip:   2.73 kB │ map:     0.08 kB
node.exe : [33m[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-pt.json is dynamically imported by
src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js,
src/pages/games/TopTrumps/TopTrumpsLobby.jsx, dynamic import will not move module into another chunk.
No C:\nvm4w\nodejs\npm.ps1:29 caractere:3
+   & $NODE_EXE $NPM_CLI_JS $args
+   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ([33m[33m[INEF... another chunk.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError

[39m
[33m[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking:
https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[33m[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-en.json is dynamically imported by
src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js, dynamic import will not move module
into another chunk.
[39m
[33m[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-es.json is dynamically imported by
src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js, dynamic import will not move module
into another chunk.
[39m
dist/assets/capitulo-02-BfWZU1R5.js                       5.98 kB │ gzip:   2.75 kB │ map:     0.08 kB
dist/assets/act2-CmBheBlC.js                              6.70 kB │ gzip:   2.50 kB │ map:    11.38 kB
dist/assets/capitulo-12-MuCu_I8X.js                       6.73 kB │ gzip:   2.76 kB │ map:     0.08 kB
dist/assets/act4-C0aCy384.js                              6.76 kB │ gzip:   2.59 kB │ map:    11.00 kB
dist/assets/act2-BWeZYRqB.js                              6.79 kB │ gzip:   2.55 kB │ map:    11.47 kB
dist/assets/capitulo-15-Cv3g4lAe.js                       6.86 kB │ gzip:   3.00 kB │ map:     0.08 kB
dist/assets/act4-B-MWPDRX.js                              6.93 kB │ gzip:   2.60 kB │ map:    11.17 kB
dist/assets/capitulo-11-DYTXeWLe.js                       7.04 kB │ gzip:   2.98 kB │ map:     0.08 kB
dist/assets/capitulo-07-BAFhnEDU.js                       7.11 kB │ gzip:   3.17 kB │ map:     0.08 kB
dist/assets/capitulo-04-BdjknAIc.js                       9.05 kB │ gzip:   4.21 kB │ map:     0.08 kB
dist/assets/capitulo-01-DMK3dABD.js                       9.11 kB │ gzip:   4.00 kB │ map:     0.08 kB
dist/assets/capitulo-01-B0qoPPty.js                       9.14 kB │ gzip:   3.92 kB │ map:     0.08 kB
dist/assets/capitulo-01-D1uDsOKz.js                       9.47 kB │ gzip:   4.11 kB │ map:     0.08 kB
dist/assets/capitulo-04-JF6kZtvA.js                       9.59 kB │ gzip:   4.40 kB │ map:     0.08 kB
dist/assets/capitulo-04-DjMM5y_r.js                       9.65 kB │ gzip:   4.50 kB │ map:     0.08 kB
dist/assets/capitulo-05-iTlLIhSh.js                      12.03 kB │ gzip:   5.19 kB │ map:     0.08 kB
dist/assets/act3-CUVmMsh-.js                             12.17 kB │ gzip:   3.88 kB │ map:    19.05 kB
dist/assets/capitulo-09-v6PG6lag.js                      12.28 kB │ gzip:   5.24 kB │ map:     0.08 kB
dist/assets/capitulo-16-BM8YUBnU.js                      12.44 kB │ gzip:   5.03 kB │ map:     0.08 kB
dist/assets/capitulo-06-BZpn8v6O.js                      12.44 kB │ gzip:   5.17 kB │ map:     0.08 kB
dist/assets/capitulo-05-Bf13x_ve.js                      12.65 kB │ gzip:   5.48 kB │ map:     0.08 kB
dist/assets/capitulo-05-x0TKji8J.js                      12.65 kB │ gzip:   5.40 kB │ map:     0.08 kB
dist/assets/capitulo-06-CAsyQEuk.js                      12.76 kB │ gzip:   5.28 kB │ map:     0.08 kB
dist/assets/capitulo-14-dq1fe74y.js                      13.02 kB │ gzip:   5.25 kB │ map:     0.08 kB
dist/assets/capitulo-10-CyoUds5L.js                      13.08 kB │ gzip:   5.19 kB │ map:     0.08 kB
dist/assets/capitulo-06-ir-MOGBB.js                      13.19 kB │ gzip:   5.46 kB │ map:     0.08 kB
dist/assets/act3-Dwjqq__X.js                             13.60 kB │ gzip:   4.28 kB │ map:    21.12 kB
dist/assets/capitulo-13-Dzk_0_B0.js                      13.89 kB │ gzip:   5.45 kB │ map:     0.08 kB
dist/assets/en-DRwXIVtS.js                               14.57 kB │ gzip:   5.92 kB │ map:    18.46 kB
dist/assets/es-TRqg9LgO.js                               15.24 kB │ gzip:   6.09 kB │ map:    19.14 kB
dist/assets/pt-D8u3qlYl.js                               15.59 kB │ gzip:   6.21 kB │ map:    19.48 kB
dist/assets/act1-DqwazvLB.js                             16.30 kB │ gzip:   4.94 kB │ map:    26.69 kB
dist/assets/act1-6z7BavtX.js                             16.66 kB │ gzip:   5.15 kB │ map:    27.06 kB
dist/assets/act1-AXekDtd0.js                             16.72 kB │ gzip:   5.22 kB │ map:    27.12 kB
dist/assets/capitulo-03-zqZKAoHX.js                      18.74 kB │ gzip:   7.84 kB │ map:     0.08 kB
dist/assets/capitulo-03-2HBG5sda.js                      19.71 kB │ gzip:   8.15 kB │ map:     0.08 kB
dist/assets/capitulo-03-CRfPQEq1.js                      19.90 kB │ gzip:   8.32 kB │ map:     0.08 kB
dist/assets/index-F9mZkYeP.js                         2,913.33 kB │ gzip: 850.15 kB │ map: 8,028.39 kB

[32m✓ built in 2.12s[39m
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```
