# FIX — troféu somente após leitura real no Webtoon e no Livro

**Data:** 2026-07-18
**Versão real do repositório:** 10.192.24 → **10.192.25**
**Relatório-base:** `docs/ReportAI/2026-07-18_INV_WEBTOON_TROPHY_TIMING_v10.192.23.md`
**Status:** **CORRIGIDO — PENDENTE TESTE MANUAL**

> O pedido original indicava 10.192.23 → 10.192.24, mas o repositório já estava em 10.192.24 antes desta task. Para cumprir a regra escrita de bump, esta entrega usa 10.192.25.

## Problema e regra funcional

O observer local de cada leitor considerava conclusão apenas por `entry.isIntersecting`. A regra implementada exige, na visita atual, observar o sentinel fora do viewport, registrar movimento descendente real depois disso e somente então aceitar a reentrada do sentinel. O disparo é único por `contentKey` e por mount.

## Etapa 1 — outputs brutos antes da primeira edição

Os executáveis GNU `grep.exe` e `wc.exe` distribuídos com Git for Windows foram chamados diretamente, com os mesmos padrões e argumentos, porque o `bash.exe` do WSL não existe e o adaptador de argumentos do Git Bash truncou a string multilinha.

```text
===== COMANDO 1 =====
src/pages/content/WebtoonEpisodio.jsx:26:  const { desbloquearOuConvidar } = useAchievements()
src/pages/content/WebtoonEpisodio.jsx:30:  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
src/pages/content/WebtoonEpisodio.jsx:31:  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
src/pages/content/WebtoonEpisodio.jsx:32:  const ultimaPaginaRef = useRef(null)
src/pages/content/WebtoonEpisodio.jsx:62:    if (!ultimaPaginaRef.current) return
src/pages/content/WebtoonEpisodio.jsx:63:    const observer = new IntersectionObserver(([entry]) => {
src/pages/content/WebtoonEpisodio.jsx:70:        isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio,
src/pages/content/WebtoonEpisodio.jsx:71:        completionResult: entry.isIntersecting, completionGuard: 'none',
src/pages/content/WebtoonEpisodio.jsx:74:      if (entry.isIntersecting) {
src/pages/content/WebtoonEpisodio.jsx:78:            episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
src/pages/content/WebtoonEpisodio.jsx:81:          desbloquearOuConvidarRef.current('episodio_zero')
src/pages/content/WebtoonEpisodio.jsx:84:    }, { threshold: 0.1 })
src/pages/content/WebtoonEpisodio.jsx:85:    observer.observe(ultimaPaginaRef.current)
src/pages/content/WebtoonEpisodio.jsx:134:            ref={num === ep.paginas ? ultimaPaginaRef : null}
src/pages/content/LivroCapitulo.jsx:23:  const { desbloquearOuConvidar } = useAchievements()
src/pages/content/LivroCapitulo.jsx:27:  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
src/pages/content/LivroCapitulo.jsx:28:  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
src/pages/content/LivroCapitulo.jsx:71:  const sentinelRef = useRef(null)
src/pages/content/LivroCapitulo.jsx:111:    if (id !== 'capitulo-01' || !sentinelRef.current) return
src/pages/content/LivroCapitulo.jsx:112:    const obs = new IntersectionObserver(([entry]) => {
src/pages/content/LivroCapitulo.jsx:113:      if (entry.isIntersecting) desbloquearOuConvidarRef.current('leitor_marelia')
src/pages/content/LivroCapitulo.jsx:114:    }, { threshold: 0.1 })
src/pages/content/LivroCapitulo.jsx:115:    obs.observe(sentinelRef.current)
src/pages/content/LivroCapitulo.jsx:234:          <div ref={sentinelRef} style={{ height: 1 }} />
===== COMANDO 2 =====
src/pages/content/WebtoonEpisodio.jsx:39:      scrollY: window.scrollY, innerHeight: window.innerHeight,
src/pages/content/WebtoonEpisodio.jsx:50:  useEffect(() => { localStorage.setItem('ldi-webtoon-ultimo', id) }, [id])
src/pages/content/WebtoonEpisodio.jsx:57:    const saved = localStorage.getItem(`ldi-webtoon-scroll-${id}`)
src/pages/content/WebtoonEpisodio.jsx:58:    if (saved) window.scrollTo(0, parseInt(saved))
src/pages/content/WebtoonEpisodio.jsx:68:        origin: 'observer', scrollY: window.scrollY, innerHeight: window.innerHeight,
src/pages/content/WebtoonEpisodio.jsx:69:        scrollHeight, distanceToEnd: scrollHeight - (window.scrollY + window.innerHeight),
src/pages/content/LivroCapitulo.jsx:35:  useEffect(() => { localStorage.setItem('ldi-livro-ultimo', id) }, [id])
src/pages/content/LivroCapitulo.jsx:42:    const saveScroll = () => localStorage.setItem(`ldi-livro-scroll-${id}`, window.scrollY)
src/pages/content/LivroCapitulo.jsx:43:    window.addEventListener('beforeunload', saveScroll)
src/pages/content/LivroCapitulo.jsx:44:    return () => { saveScroll(); window.removeEventListener('beforeunload', saveScroll) }
src/pages/content/LivroCapitulo.jsx:48:    const saved = localStorage.getItem(`ldi-livro-scroll-${id}`)
src/pages/content/LivroCapitulo.jsx:49:    if (saved) window.scrollTo(0, parseInt(saved))
src/pages/content/LivroCapitulo.jsx:68:  const [fontSize, setFontSize]             = useState(() => Number(localStorage.getItem('ldi-reader-fontsize')   || 18))
src/pages/content/LivroCapitulo.jsx:69:  const [fontFamily, setFontFamily]         = useState(() => localStorage.getItem('ldi-reader-fontfamily')        || 'var(--font-body)')
src/pages/content/LivroCapitulo.jsx:70:  const [contentWidth, setContentWidth]     = useState(() => localStorage.getItem('ldi-reader-width')             || '680px')
src/pages/content/LivroCapitulo.jsx:73:  useEffect(() => { localStorage.setItem('ldi-reader-fontsize',   fontSize)     }, [fontSize])
src/pages/content/LivroCapitulo.jsx:74:  useEffect(() => { localStorage.setItem('ldi-reader-fontfamily', fontFamily)   }, [fontFamily])
src/pages/content/LivroCapitulo.jsx:75:  useEffect(() => { localStorage.setItem('ldi-reader-width',      contentWidth) }, [contentWidth])
===== COMANDO 3 =====
src/hooks/useScrollPosition.js:7:    const onScroll = () => setScrolled(window.scrollY > threshold)
src/hooks/useScrollReveal.js:10:    const observer = new IntersectionObserver(([entry]) => {
===== COMANDO 4 =====
src/context/AchievementsContext.jsx:6:import todosAchievements from '../data/achievements-pt.json'
src/context/AchievementsContext.jsx:8:const STORAGE_KEY = 'ldi-achievements'
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
src/context/AchievementsContext.jsx:95:        .select('id').eq('user_id', user.id).eq('tipo', 'conquista').eq('descricao', `Desbloqueou: ${achievement.nome}`).limit(1)
src/context/AchievementsContext.jsx:98:          user_id: user.id, tipo: 'conquista', descricao: `Desbloqueou: ${achievement.nome}`, valor: achievement.tier || 1,
src/context/AchievementsContext.jsx:108:  const desbloquearOuConvidar = useCallback((achievementId) => {
src/context/AchievementsContext.jsx:110:      timestamp: new Date().toISOString(), achievementId,
src/context/AchievementsContext.jsx:111:      mode: user ? 'authenticated' : 'guest', entrypoint: 'desbloquearOuConvidar',
src/context/AchievementsContext.jsx:114:      console.log('[ACH:GUEST_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: true, reason: 'guest-cta-enqueue' })
src/context/AchievementsContext.jsx:115:      notificationManager.push('cta_conta', { achievementId })
src/context/AchievementsContext.jsx:118:    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'delegating-to-unlock' })
src/context/AchievementsContext.jsx:119:    desbloquear(achievementId)
src/context/AchievementsContext.jsx:128:    const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
src/context/AchievementsContext.jsx:129:    if (error) { console.error('Erro ao recarregar achievements:', error); return }
src/context/AchievementsContext.jsx:130:    setDesbloqueados(data ? data.map(d => d.achievement_id) : [])
src/context/AchievementsContext.jsx:134:    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, desbloquearOuConvidar, toastPendente, fecharToast, refresh, migrarLocalParaSupabase, registrarGangue }}>
src/components/UnifiedNotification/UnifiedNotification.jsx:10:import achievPt from '../../data/achievements-pt.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:11:import achievEn from '../../data/achievements-en.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:12:import achievEs from '../../data/achievements-es.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:13:import stringsPt from '../../data/achievements-strings-pt.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:14:import stringsEn from '../../data/achievements-strings-en.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:15:import stringsEs from '../../data/achievements-strings-es.json'
src/components/UnifiedNotification/UnifiedNotification.jsx:22:  const [current, setCurrent] = useState(null)
src/components/UnifiedNotification/UnifiedNotification.jsx:43:    // Defesa: guest não pode ver achievement de jeito nenhum
src/components/UnifiedNotification/UnifiedNotification.jsx:45:      notificationManager.clearByType('achievement')
src/components/UnifiedNotification/UnifiedNotification.jsx:51:      setCurrent({
src/components/UnifiedNotification/UnifiedNotification.jsx:66:      ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
src/components/UnifiedNotification/UnifiedNotification.jsx:67:      : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
src/components/UnifiedNotification/UnifiedNotification.jsx:69:      console.log('[ACH:TOAST_SHOW]', { timestamp: new Date().toISOString(), type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: Date.now() - item.createdAt, mode: user ? 'authenticated' : 'guest', reason: 'queue-item-selected' })
src/components/UnifiedNotification/UnifiedNotification.jsx:70:      setCurrent(item)
src/components/UnifiedNotification/UnifiedNotification.jsx:120:    console.log('[ACH:TOAST_CLOSE]', { timestamp: new Date().toISOString(), type: activeNotification?.type ?? null, key: activeNotification?.data?.achievementId ?? activeNotification?.data?.nome ?? null, notificationId: activeNotification?.id ?? null, reason: 'close-requested' })
src/components/UnifiedNotification/UnifiedNotification.jsx:123:      setCurrent(null)
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
src/lib/notificationManager.js:9: *   notificationManager.push('ldi_tip', { mensagem, cta, url, personagem })
src/lib/notificationManager.js:10: *   notificationManager.push('achievement', { nome, descricao, icone })
src/lib/notificationManager.js:11: *   notificationManager.push('cta_conta', { achievementId })
src/lib/notificationManager.js:12: *   notificationManager.push('nina_music', { greetingKey })
src/lib/notificationManager.js:21:  ACHIEVEMENT: 'achievement',
src/lib/notificationManager.js:22:  CTA_CONTA: 'cta_conta',
src/lib/notificationManager.js:30:   * @param {'achievement'|'cta_conta'|'ldi_tip'|'nina_music'} type
src/lib/notificationManager.js:38:      console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', queueBefore: beforeLength, queueAfter: queue.length, createdAt: null, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'rejected-consecutive-duplicate' })
src/lib/notificationManager.js:49:    console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', notificationId: item.id, queueBefore: beforeLength, queueAfter: queue.length, createdAt: item.createdAt, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'enqueued' })
src/lib/notificationManager.js:83:      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'selected', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:88:    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'cooldown-active', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:115:  findAndPull(type, bypassCooldown = false) {
src/lib/notificationManager.js:118:    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'findAndPull', requestedType: type, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })
src/lib/notificationManager.js:133:        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'selected', requestedType: type, type: valid.type, key: valid.data?.achievementId ?? valid.data?.nome ?? null, notificationId: valid.id, createdAt: valid.createdAt, ageMs: now - valid.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:138:      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'cooldown-active', requestedType: type, type: queue[i].type, key: queue[i].data?.achievementId ?? queue[i].data?.nome ?? null, notificationId: queue[i].id, createdAt: queue[i].createdAt, ageMs: now - queue[i].createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
src/lib/notificationManager.js:144:    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: changed ? 'expired-items-purged-no-match' : 'no-matching-type', requestedType: type, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
===== COMANDO 5 =====
11:export const SITE_VERSION = '10.192.24'
35:console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
===== COMANDO 6 =====
  165 src/pages/content/WebtoonEpisodio.jsx
  276 src/pages/content/LivroCapitulo.jsx
  140 src/context/AchievementsContext.jsx
  268 src/components/UnifiedNotification/UnifiedNotification.jsx
  207 src/lib/notificationManager.js
 1056 total
===== COMANDO 7A =====
?? docs/Marketing/limpeza/Int/bloco07_ao_bloco10-SoftBounce.csv
?? docs/Marketing/listas_email_int/bloco11_ao_bloco18-SoftBounce.csv
?? docs/Marketing/listas_email_int/bloco11_ao_bloco18.csv
===== COMANDO 7B =====
3f5d7a51 docs: adicionar bloco 07 ao 10 de marketing + v10.192.24
ef34a9e4 chore: consolidar evidencias e corrigir encoding + v10.192.24
c98d4165 docs: finalizar relatorio webtoon v10.192.23
430f0d82 docs: completar evidencias da investigacao webtoon + v10.192.23
1427c48b debug: instrumentar timing do trofeu webtoon + v10.192.22

```

## Implementação

### Gate compartilhado

`useReadingCompletionGate` não conhece conquistas. Ele recebe `sentinelRef`, `contentKey`, `enabled` e `onComplete` e mantém em refs:

- `stateRef`: `NOT_ARMED`, `ARMED` ou `COMPLETED` sem renderização;
- `hasDownwardMovementRef`: registra aumento real de `window.scrollY` somente depois de armado;
- `hasTriggeredRef`: bloqueia qualquer segundo disparo no mount;
- `lastScrollYRef`: compara posições reais de scroll, independentemente de mouse, touch, teclado ou barra;
- `onCompleteRef`: mantém o callback atual sem recriar observer/listener.

Ao mudar `contentKey`, todas as refs de estado são resetadas. O observer arma somente após observar o sentinel fora do viewport. Interseção inicial, layout colapsado e restauração no final não concluem. A conclusão exige `ARMED`, movimento descendente posterior e nova interseção. Listener e observer possuem cleanup; no disparo, ambos são desligados imediatamente.

### Integrações

- Webtoon: `contentKey: webtoon:${id}`, habilitado somente para `id === '00'`, chama `episodio_zero`.
- Livro: `contentKey: livro:${id}`, habilitado somente para `capitulo-01` com markdown carregado, chama `leitor_marelia`.
- Os observers locais foram removidos; existe apenas o observer central do hook.
- O sentinel do Livro deixou o `style={{ height: 1 }}` e recebeu classe CSS, sem mudança visual.

### Notificação antiga

A fila persiste em `localStorage` e `UnifiedNotification` tenta consumir `cta_conta`/`achievement` ao montar. Logo, um item antigo desses IDs poderia aparecer ao entrar mesmo com o novo gate. Foi criada `removeByAchievementId`, que filtra exclusivamente `item.data.achievementId`. Cada leitor a chama em `useLayoutEffect` para o seu ID antes dos efeitos passivos globais. O payload autenticado passou a incluir `achievementId`; nenhuma notificação alheia, TTL, cooldown, FIFO ou prioridade foi alterada.

### Instrumentação temporária

Todos os logs `[WEBTOON:*]`, `[ACH:*]` e `[NOTIF:*]` da investigação foram removidos. `console.error` de falhas reais permanece. O grep bruto final está abaixo e retorna vazio (exit 1 do grep = nenhuma ocorrência).

## Trechos ANTES e DEPOIS com números de linha

```text
===== ANTES WEBTOON =====
    25	  const { user, perfil, carregando } = useAuth()
    26	  const { desbloquearOuConvidar } = useAchievements()
    27	  const { registrarEvento } = useEventos()
    28	  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
    29	  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
    30	  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
    31	  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
    32	  const ultimaPaginaRef = useRef(null)
    33
    34	  useEffect(() => {
    35	    const epAtual = episodios.find(e => e.id === id)
    36	    console.log('[WEBTOON:INIT]', {
    37	      timestamp: new Date().toISOString(), pathname: window.location.pathname,
    38	      episodeId: id, totalPages: epAtual?.paginas ?? 0, origin: 'mount',
    39	      scrollY: window.scrollY, innerHeight: window.innerHeight,
    40	      scrollHeight: document.documentElement.scrollHeight, completionGuard: 'none',
    41	      mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
    42	    })
    43	  }, [id])
    44
    45	  useEffect(() => {
    46	    setReaderMode(true)
    47	    return () => setReaderMode(false)
    48	  }, [])
    49
    50	  useEffect(() => { localStorage.setItem('ldi-webtoon-ultimo', id) }, [id])
    51
    52	  useEffect(() => {
    53	    if (id) registrarEvento('webtoon_lido', `Leu o epis?dio ${id}`, Number(id))
    54	  }, [id])
    55
    56	  useEffect(() => {
    57	    const saved = localStorage.getItem(`ldi-webtoon-scroll-${id}`)
    58	    if (saved) window.scrollTo(0, parseInt(saved))
    59	  }, [id])
    60
    61	  useEffect(() => {
    62	    if (!ultimaPaginaRef.current) return
    63	    const observer = new IntersectionObserver(([entry]) => {
    64	      const scrollHeight = document.documentElement.scrollHeight
    65	      console.log('[WEBTOON:COMPLETE_CHECK]', {
    66	        timestamp: new Date().toISOString(), pathname: window.location.pathname,
    67	        episodeId: id, totalPages: episodios.find(e => e.id === id)?.paginas ?? 0,
    68	        origin: 'observer', scrollY: window.scrollY, innerHeight: window.innerHeight,
    69	        scrollHeight, distanceToEnd: scrollHeight - (window.scrollY + window.innerHeight),
    70	        isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio,
    71	        completionResult: entry.isIntersecting, completionGuard: 'none',
    72	        mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
    73	      })
    74	      if (entry.isIntersecting) {
    75	        if (id === '00') {
    76	          console.trace('[WEBTOON:COMPLETE_TRIGGER]', {
    77	            timestamp: new Date().toISOString(), pathname: window.location.pathname,
    78	            episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
    79	            mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
    80	          })
    81	          desbloquearOuConvidarRef.current('episodio_zero')
    82	        }
    83	      }
    84	    }, { threshold: 0.1 })
    85	    observer.observe(ultimaPaginaRef.current)
    86	    return () => observer.disconnect()
    87	  }, [id])
    88
    89	  const ep = episodios.find(e => e.id === id)
    90	  const idx = episodios.findIndex(e => e.id === id)
===== DEPOIS WEBTOON =====
    25	  const navigate = useNavigate()
    26	  const { locale, t } = useLanguage()
    27	  const { user, perfil } = useAuth()
    28	  const { desbloquearOuConvidar } = useAchievements()
    29	  const { registrarEvento } = useEventos()
    30	  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
    31	  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
    32	  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
    33	  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
    34	  const ultimaPaginaRef = useRef(null)
    35
    36	  useEffect(() => {
    37	    setReaderMode(true)
    38	    return () => setReaderMode(false)
    39	  }, [])
    40
    41	  useEffect(() => { localStorage.setItem('ldi-webtoon-ultimo', id) }, [id])
    42
    43	  useEffect(() => {
    44	    if (id) registrarEvento('webtoon_lido', `Leu o epis?dio ${id}`, Number(id))
    45	  }, [id])
    46
    47	  useEffect(() => {
    48	    const saved = localStorage.getItem(`ldi-webtoon-scroll-${id}`)
    49	    if (saved) window.scrollTo(0, parseInt(saved))
    50	  }, [id])
    51
    52	  useLayoutEffect(() => {
    53	    if (id === '00') notificationManager.removeByAchievementId('episodio_zero')
    54	  }, [id])
    55
    56	  useReadingCompletionGate({
    57	    sentinelRef: ultimaPaginaRef,
    58	    contentKey: `webtoon:${id}`,
    59	    enabled: id === '00',
    60	    onComplete: () => desbloquearOuConvidarRef.current('episodio_zero'),
    61	  })
    62
    63	  const ep = episodios.find(e => e.id === id)
    64	  const idx = episodios.findIndex(e => e.id === id)
    65	  const prev = idx > 0 ? episodios[idx - 1] : null
    66	  const next = idx < episodios.length - 1 ? episodios[idx + 1] : null
    67
    68	  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'
    69
    70	  if (!ep || (id !== '00' && !estaDisponivel(ep, isAdmin) && !TRIAL_ACTIVE)) {
    71	    return (
    72	      <section className="webtoon-ep-page">
    73	        <div className="container">
    74	          <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
    75	            {t('pages.webtoon.voltar')}
    76	          </button>
    77	          <p className="webtoon-ep-blocked">
    78	            {ep?.data_publicacao
    79	              ? `${t('pages.webtoon.em_breve')} ${formatarData(ep.data_publicacao)}`
    80	              : t('pages.webtoon.nao_encontrado')}
===== ANTES LIVRO =====
    65	  const [md, setMd] = useState('')
    66	  const [notFound, setNotFound] = useState(false)
    67	  const [showSettings, setShowSettings]     = useState(false)
    68	  const [fontSize, setFontSize]             = useState(() => Number(localStorage.getItem('ldi-reader-fontsize')   || 18))
    69	  const [fontFamily, setFontFamily]         = useState(() => localStorage.getItem('ldi-reader-fontfamily')        || 'var(--font-body)')
    70	  const [contentWidth, setContentWidth]     = useState(() => localStorage.getItem('ldi-reader-width')             || '680px')
    71	  const sentinelRef = useRef(null)
    72
    73	  useEffect(() => { localStorage.setItem('ldi-reader-fontsize',   fontSize)     }, [fontSize])
    74	  useEffect(() => { localStorage.setItem('ldi-reader-fontfamily', fontFamily)   }, [fontFamily])
    75	  useEffect(() => { localStorage.setItem('ldi-reader-width',      contentWidth) }, [contentWidth])
    76
    77	  const chapter = index.find(ch => ch.id === id)
    78	  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
    79
    80	  useEffect(() => {
    81	    setNotFound(false)
    82
    83	    if (!chapter || (id !== 'capitulo-01' && !estaDisponivel(chapter, isAdmin) && !TRIAL_ACTIVE)) {
    84	      setNotFound(true)
    85	      return
    86	    }
    87
    88	    const loadChapter = async () => {
    89	      const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt'
    90	      const path = `../../data/livro/${lang}/${id}.md`
    91	      let loader = chapterLoaders[path]
    92	      if (!loader) {
    93	        const fallbackPath = `../../data/livro/pt/${id}.md`
    94	        loader = chapterLoaders[fallbackPath]
    95	      }
    96	      if (loader) {
    97	        try {
    98	          const content = await loader()
    99	          setMd(content)
   100	          return
   101	        } catch {}
   102	      }
   103	      setNotFound(true)
   104	    }
   105
   106	    loadChapter()
   107	  }, [id, chapter, isAdmin, locale])
   108
   109	  // Sentinel: dispara achievement (logado) ou CTA (guest) ao final do cap?tulo 1
   110	  useEffect(() => {
   111	    if (id !== 'capitulo-01' || !sentinelRef.current) return
   112	    const obs = new IntersectionObserver(([entry]) => {
   113	      if (entry.isIntersecting) desbloquearOuConvidarRef.current('leitor_marelia')
   114	    }, { threshold: 0.1 })
   115	    obs.observe(sentinelRef.current)
   116	    return () => obs.disconnect()
   117	  }, [id, md])
   118
   119	  if (notFound) {
   120	    return (
   225	        <div
   226	          className="livro-capitulo__content"
   227	          style={{
   228	            '--reader-font-size': `${fontSize}px`,
   229	            '--reader-font-family': fontFamily,
   230	            '--reader-max-width': contentWidth,
   231	          }}
   232	        >
   233	          <ReactMarkdown>{md}</ReactMarkdown>
   234	          <div ref={sentinelRef} style={{ height: 1 }} />
   235	        </div>
   236
   237	        <div className="livro-nav-flutuante">
   238	          {anterior && (
===== DEPOIS LIVRO =====
    65	  ]
    66
    67	  const [md, setMd] = useState('')
    68	  const [notFound, setNotFound] = useState(false)
    69	  const [showSettings, setShowSettings]     = useState(false)
    70	  const [fontSize, setFontSize]             = useState(() => Number(localStorage.getItem('ldi-reader-fontsize')   || 18))
    71	  const [fontFamily, setFontFamily]         = useState(() => localStorage.getItem('ldi-reader-fontfamily')        || 'var(--font-body)')
    72	  const [contentWidth, setContentWidth]     = useState(() => localStorage.getItem('ldi-reader-width')             || '680px')
    73	  const sentinelRef = useRef(null)
    74
    75	  useEffect(() => { localStorage.setItem('ldi-reader-fontsize',   fontSize)     }, [fontSize])
    76	  useEffect(() => { localStorage.setItem('ldi-reader-fontfamily', fontFamily)   }, [fontFamily])
    77	  useEffect(() => { localStorage.setItem('ldi-reader-width',      contentWidth) }, [contentWidth])
    78
    79	  const chapter = index.find(ch => ch.id === id)
    80	  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
    81
    82	  useEffect(() => {
    83	    setNotFound(false)
    84
    85	    if (!chapter || (id !== 'capitulo-01' && !estaDisponivel(chapter, isAdmin) && !TRIAL_ACTIVE)) {
    86	      setNotFound(true)
    87	      return
    88	    }
    89
    90	    const loadChapter = async () => {
    91	      const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt'
    92	      const path = `../../data/livro/${lang}/${id}.md`
    93	      let loader = chapterLoaders[path]
    94	      if (!loader) {
    95	        const fallbackPath = `../../data/livro/pt/${id}.md`
    96	        loader = chapterLoaders[fallbackPath]
    97	      }
    98	      if (loader) {
    99	        try {
   100	          const content = await loader()
   101	          setMd(content)
   102	          return
   103	        } catch {}
   104	      }
   105	      setNotFound(true)
   106	    }
   107
   108	    loadChapter()
   109	  }, [id, chapter, isAdmin, locale])
   110
   111	  useLayoutEffect(() => {
   112	    if (id === 'capitulo-01') notificationManager.removeByAchievementId('leitor_marelia')
   113	  }, [id])
   114
   115	  useReadingCompletionGate({
   116	    sentinelRef,
   117	    contentKey: `livro:${id}`,
   118	    enabled: id === 'capitulo-01' && Boolean(md),
   119	    onComplete: () => desbloquearOuConvidarRef.current('leitor_marelia'),
   120	  })
   121
   122	  if (notFound) {
   123	    return (
   124	      <section className="livro-capitulo">
   125	        <Helmet>
   220
   221	        <div className="livro-capitulo__header">
   222	          <div className="livro-capitulo__header-numero">
   223	            {chapter ? `${t('pages.livro.capitulo')} ${String(chapter.numero).padStart(2, '0')}` : ''}
   224	          </div>
   225	          {chapter && <h1 className="livro-capitulo__header-titulo">{chapter[tituloKey]}</h1>}
   226	        </div>
   227
   228	        <div
   229	          className="livro-capitulo__content"
   230	          style={{
   231	            '--reader-font-size': `${fontSize}px`,
   232	            '--reader-font-family': fontFamily,
   233	            '--reader-max-width': contentWidth,
   234	          }}
   235	        >
   236	          <ReactMarkdown>{md}</ReactMarkdown>
   237	          <div ref={sentinelRef} className="livro-capitulo__sentinel" />
   238	        </div>
     1	.livro-capitulo {
     2	  padding: 8rem 0 4rem;
     3	  min-height: 100vh;
     4	  background: var(--bg-secondary);
     5	}
     6
     7	.livro-capitulo__back {
     8	  display: inline-flex;
     9	  align-items: center;
    10	  gap: 0.35rem;
    11	  margin-bottom: 2rem;
    12	  font-family: var(--font-display);
    13	  font-weight: 700;
    14	  font-size: 0.8rem;
    15	  letter-spacing: 0.06em;
===== ANTES HOOK =====
ARQUIVO INEXISTENTE
===== DEPOIS HOOK COMPLETO =====
     1	import { useEffect, useRef } from 'react'
     2
     3	const NOT_ARMED = 'NOT_ARMED'
     4	const ARMED = 'ARMED'
     5	const COMPLETED = 'COMPLETED'
     6
     7	export function useReadingCompletionGate({ sentinelRef, contentKey, enabled, onComplete }) {
     8	  const stateRef = useRef(NOT_ARMED)
     9	  const hasDownwardMovementRef = useRef(false)
    10	  const hasTriggeredRef = useRef(false)
    11	  const lastScrollYRef = useRef(0)
    12	  const onCompleteRef = useRef(onComplete)
    13
    14	  useEffect(() => {
    15	    onCompleteRef.current = onComplete
    16	  }, [onComplete])
    17
    18	  useEffect(() => {
    19	    stateRef.current = NOT_ARMED
    20	    hasDownwardMovementRef.current = false
    21	    hasTriggeredRef.current = false
    22	    lastScrollYRef.current = window.scrollY
    23
    24	    const sentinel = sentinelRef.current
    25	    if (!enabled || !sentinel) return
    26
    27	    const onScroll = () => {
    28	      const currentScrollY = window.scrollY
    29	      if (stateRef.current === ARMED && currentScrollY > lastScrollYRef.current) {
    30	        hasDownwardMovementRef.current = true
    31	      }
    32	      lastScrollYRef.current = currentScrollY
    33	    }
    34
    35	    const observer = new IntersectionObserver(([entry]) => {
    36	      if (hasTriggeredRef.current) return
    37
    38	      if (!entry.isIntersecting) {
    39	        if (stateRef.current === NOT_ARMED) stateRef.current = ARMED
    40	        return
    41	      }
    42
    43	      if (stateRef.current !== ARMED || !hasDownwardMovementRef.current) return
    44
    45	      stateRef.current = COMPLETED
    46	      hasTriggeredRef.current = true
    47	      observer.disconnect()
    48	      window.removeEventListener('scroll', onScroll)
    49	      onCompleteRef.current()
    50	    }, { threshold: 0.1 })
    51
    52	    window.addEventListener('scroll', onScroll, { passive: true })
    53	    observer.observe(sentinel)
    54
    55	    return () => {
    56	      window.removeEventListener('scroll', onScroll)
    57	      observer.disconnect()
    58	    }
    59	  }, [contentKey, enabled, sentinelRef])
    60	}
===== ANTES FILA =====
    80	        setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    81	        return
    82	      }
    83	      console.error('ERRO AO SALVAR ACHIEVEMENT:', error)
    84	      return
    85	    }
    86	    setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    87	    notificationManager.push('achievement', {
    88	      nome: achievement.nome,
    89	      descricao: achievement.descricao,
    90	      icone: achievement.icone,
    91	    })
    92	    // Registrar evento de conquista (usa supabase diretamente p/ evitar depend?ncia c?clica)
    93	    try {
    94	      const { data: existente } = await supabase.from('perfil_eventos')
    95	        .select('id').eq('user_id', user.id).eq('tipo', 'conquista').eq('descricao', `Desbloqueou: ${achievement.nome}`).limit(1)
   145	    return null
   146	  },
   147
   148	  /** Remove da fila todos os itens de um tipo espec?fico */
   149	  clearByType(type) {
   150	    const queue = this._getQueue().filter(item => item.type !== type)
   151	    this._saveQueue(queue)
   152	    this._notifyListeners()
   153	  },
   154
   155	  /** Limpa a fila inteira */
   156	  clear() {
   157	    localStorage.removeItem(STORAGE_QUEUE)
   158	    this._notifyListeners()
   159	  },
   160
   161	  // ?? Internals ??
   162
   163	  _getQueue() {
   164	    try {
   165	      return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || '[]')
===== DEPOIS FILA =====
    65	    setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    66	    notificationManager.push('achievement', {
    67	      achievementId,
    68	      nome: achievement.nome,
    69	      descricao: achievement.descricao,
    70	      icone: achievement.icone,
    71	    })
    72	    // Registrar evento de conquista (usa supabase diretamente p/ evitar depend?ncia c?clica)
    73	    try {
    74	      const { data: existente } = await supabase.from('perfil_eventos')
    75	        .select('id').eq('user_id', user.id).eq('tipo', 'conquista').eq('descricao', `Desbloqueou: ${achievement.nome}`).limit(1)
    76	      if (!existente || existente.length === 0) {
    77	        await supabase.from('perfil_eventos').insert({
    78	          user_id: user.id, tipo: 'conquista', descricao: `Desbloqueou: ${achievement.nome}`, valor: achievement.tier || 1,
    79	        })
    80	      }
    81	    } catch (e) { console.error('[Eventos] erro ao registrar conquista:', e) }
    82	  }, [desbloqueados, user])
    83
    84	  function registrarGangue() {
    85	    desbloquear('conhece_a_gangue')
    86	  }
    87
    88	  const desbloquearOuConvidar = useCallback((achievementId) => {
    89	    if (!user) {
    90	      notificationManager.push('cta_conta', { achievementId })
   125	      // Cooldown ativo ? n?o retorna, mas n?o remove da fila
   126	      if (changed) this._saveQueue(queue)
   127	      return null
   128	    }
   129
   130	    // Nenhum item do tipo encontrado ? salva remo??es de expirados se houve
   131	    if (changed) this._saveQueue(queue)
   132	    return null
   133	  },
   134
   135	  /** Remove da fila todos os itens de um tipo espec?fico */
   136	  clearByType(type) {
   137	    const queue = this._getQueue().filter(item => item.type !== type)
   138	    this._saveQueue(queue)
   139	    this._notifyListeners()
   140	  },
   141
   142	  /** Remove somente itens ligados a uma conquista espec?fica. */
   143	  removeByAchievementId(achievementId) {
   144	    const queue = this._getQueue()
   145	    const filtered = queue.filter(item => item.data?.achievementId !== achievementId)
   146	    if (filtered.length === queue.length) return
   147	    this._saveQueue(filtered)
   148	    this._notifyListeners()
   149	  },
   150
   151	  /** Limpa a fila inteira */
   152	  clear() {
   153	    localStorage.removeItem(STORAGE_QUEUE)
   154	    this._notifyListeners()
   155	  },
   156
   157	  // ?? Internals ??
   158
   159	  _getQueue() {
   160	    try {
   161	      return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || '[]')
   162	    } catch {
   163	      return []
   164	    }
   165	  },
===== ANTES UNIFIED =====
    28	  const navigate = useNavigate()
    29	  const autoTimerRef = useRef(null)
    30	  const checkIntervalRef = useRef(null)
    31	  const ninaCbRef = useRef(null)
    32	  const currentRef = useRef(current)
    33	  currentRef.current = current
    34
    35	  // Tenta puxar da fila ? mas primeiro verifica notifica??o pendente da Nina
    36	  const tryPull = useCallback(() => {
    37	    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', mode: user ? 'authenticated' : 'guest', currentType: current?.type ?? null, queueLength: notificationManager.queueLength() })
    38	    if (current) {
    39	      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', result: 'active-notification-blocks-pull', currentType: current.type, queueLength: notificationManager.queueLength() })
    40	      return
    41	    }
    42
    43	    // Defesa: guest n?o pode ver achievement de jeito nenhum
    44	    if (!user) {
    45	      notificationManager.clearByType('achievement')
    46	    }
    47
    48	    // PRIORIDADE M?XIMA: Nina notification (n?o passa pelo notificationManager)
    49	    const ninaPending = window.__ninaPendingNotification
    50	    if (ninaPending && ninaPending.mensagem) {
    51	      setCurrent({
    52	        type: 'nina_music',
    53	        data: { mensagem: ninaPending.mensagem, greetingKey: ninaPending.greetingKey },
    54	        id: Date.now(),
    55	      })
    56	      setIsClosing(false)
    57	      setTypedText('')
    58	      setTypingDone(false)
    59	      window.__ninaPendingNotification = null
    60	      return
    61	    }
    62
    63	    // Fallback: fila normal do notificationManager
    64	    // Achievement (logado) ou CTA (guest) tem prioridade ? busca na fila inteira com bypass de cooldown
    65	    const item = user
    66	      ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
    67	      : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
    68	    if (item) {
    69	      console.log('[ACH:TOAST_SHOW]', { timestamp: new Date().toISOString(), type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: Date.now() - item.createdAt, mode: user ? 'authenticated' : 'guest', reason: 'queue-item-selected' })
    70	      setCurrent(item)
    71	      setIsClosing(false)
    72	      setTypedText('')
    73	      setTypingDone(false)
    74	    }
    75	  }, [current, user])
   112	      10000
   113	    if (duration === 0) return
   114	    autoTimerRef.current = setTimeout(handleClose, duration)
   115	    return () => clearTimeout(autoTimerRef.current)
   116	  }, [current])
   117
   118	  const handleClose = useCallback(() => {
   119	    const activeNotification = currentRef.current
   120	    console.log('[ACH:TOAST_CLOSE]', { timestamp: new Date().toISOString(), type: activeNotification?.type ?? null, key: activeNotification?.data?.achievementId ?? activeNotification?.data?.nome ?? null, notificationId: activeNotification?.id ?? null, reason: 'close-requested' })
   121	    setIsClosing(true)
   122	    setTimeout(() => {
   123	      setCurrent(null)
   124	      setIsClosing(false)
   125	    }, 300)
   126	  }, [])
   127
   128	  // Callback do Sim/N?o da Nina
===== DEPOIS UNIFIED =====
    28	  const navigate = useNavigate()
    29	  const autoTimerRef = useRef(null)
    30	  const checkIntervalRef = useRef(null)
    31	  const ninaCbRef = useRef(null)
    32
    33	  // Tenta puxar da fila ? mas primeiro verifica notifica??o pendente da Nina
    34	  const tryPull = useCallback(() => {
    35	    if (current) return
    36
    37	    // Defesa: guest n?o pode ver achievement de jeito nenhum
    38	    if (!user) {
    39	      notificationManager.clearByType('achievement')
    40	    }
    41
    42	    // PRIORIDADE M?XIMA: Nina notification (n?o passa pelo notificationManager)
    43	    const ninaPending = window.__ninaPendingNotification
    44	    if (ninaPending && ninaPending.mensagem) {
    45	      setCurrent({
    46	        type: 'nina_music',
    47	        data: { mensagem: ninaPending.mensagem, greetingKey: ninaPending.greetingKey },
    48	        id: Date.now(),
    49	      })
    50	      setIsClosing(false)
    51	      setTypedText('')
    52	      setTypingDone(false)
    53	      window.__ninaPendingNotification = null
    54	      return
    55	    }
    56
    57	    // Fallback: fila normal do notificationManager
    58	    // Achievement (logado) ou CTA (guest) tem prioridade ? busca na fila inteira com bypass de cooldown
    59	    const item = user
    60	      ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
    61	      : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
    62	    if (item) {
    63	      setCurrent(item)
    64	      setIsClosing(false)
    65	      setTypedText('')
    66	      setTypingDone(false)
    67	    }
    68	  }, [current, user])
    69
    70	  // Polling + subscribe
   103	      current.type === NotificationType.ACHIEVEMENT || current.type === NotificationType.CTA_CONTA ? 6000 :
   104	      current.type === NotificationType.NINA_MUSIC ? 0 : // nina fecha manualmente
   105	      10000
   106	    if (duration === 0) return
   107	    autoTimerRef.current = setTimeout(handleClose, duration)
   108	    return () => clearTimeout(autoTimerRef.current)
   109	  }, [current])
   110
   111	  const handleClose = useCallback(() => {
   112	    setIsClosing(true)
   113	    setTimeout(() => {
   114	      setCurrent(null)
   115	      setIsClosing(false)
   116	    }, 300)
   117	  }, [])
   118
   119	  // Callback do Sim/N?o da Nina
   120	  const handleNinaSim = useCallback(() => {
```

## Teste lógico dos 14 fluxos

| Fluxo | armed | hasDownwardMovement | isIntersecting | hasTriggered | Resultado |
|---|---:|---:|---:|---:|---|
| 1. Webtoon guest no topo | true após sentinel fora | false | false | false | sem CTA/modal |
| 2. Webtoon auth no topo | true após sentinel fora | false | false | false | sem persistência/push |
| 3. Última imagem temporariamente visível | false na primeira entrada; true ao sair | false | true → false | false | primeira entrada ignorada; sem conclusão |
| 4. Webtoon guest lê até o fim | true | true | true | false → true | `episodio_zero` → `cta_conta` → modal |
| 5. Webtoon auth sem conquista | true | true | true | false → true | persistência → achievement → modal |
| 6. Webtoon auth com conquista | true | true | true | false → true | contexto detecta existente; sem persistência/modal novo |
| 7. Reload restaurado no final | false | false | true | false | interseção inicial ignorada; sem modal |
| 8. Restaurado, sobe e volta | false → true ao sair | true na descida | true | false → true | modal uma vez na nova chegada |
| 9. Livro 01 guest | true | true | true | false → true | `leitor_marelia` → CTA/modal |
| 10. Livro 01 auth | true | true | true | false → true | persistência/modal somente no final |
| 11. Livro diferente de 01 | false (`enabled=false`) | false | irrelevante | false | `onComplete` nunca chamado |
| 12. Sentinel entra duas vezes | true | true | true nas duas | true após primeira | segunda bloqueada e observer desconectado |
| 13. Troca de conteúdo | reset para false | reset para false | novo observer se enabled | reset para false | leitura independente por `contentKey` |
| 14. Item antigo na fila | irrelevante no mount | false | irrelevante | false | somente ID do leitor removido em layout effect; não aparece ao entrar |

Esses valores percorrem a máquina implementada, mas não substituem os testes manuais no navegador real.

## Greps de confirmação e linhas finais

```text
===== LOGS TEMPORARIOS =====
grep exit: 1 (1 = nenhuma ocorrencia)
===== HOOK COMPARTILHADO =====
src/hooks/useReadingCompletionGate.js:3:const NOT_ARMED = 'NOT_ARMED'
src/hooks/useReadingCompletionGate.js:4:const ARMED = 'ARMED'
src/hooks/useReadingCompletionGate.js:7:export function useReadingCompletionGate({ sentinelRef, contentKey, enabled, onComplete }) {
src/hooks/useReadingCompletionGate.js:8:  const stateRef = useRef(NOT_ARMED)
src/hooks/useReadingCompletionGate.js:9:  const hasDownwardMovementRef = useRef(false)
src/hooks/useReadingCompletionGate.js:10:  const hasTriggeredRef = useRef(false)
src/hooks/useReadingCompletionGate.js:19:    stateRef.current = NOT_ARMED
src/hooks/useReadingCompletionGate.js:20:    hasDownwardMovementRef.current = false
src/hooks/useReadingCompletionGate.js:21:    hasTriggeredRef.current = false
src/hooks/useReadingCompletionGate.js:29:      if (stateRef.current === ARMED && currentScrollY > lastScrollYRef.current) {
src/hooks/useReadingCompletionGate.js:30:        hasDownwardMovementRef.current = true
src/hooks/useReadingCompletionGate.js:35:    const observer = new IntersectionObserver(([entry]) => {
src/hooks/useReadingCompletionGate.js:36:      if (hasTriggeredRef.current) return
src/hooks/useReadingCompletionGate.js:39:        if (stateRef.current === NOT_ARMED) stateRef.current = ARMED
src/hooks/useReadingCompletionGate.js:43:      if (stateRef.current !== ARMED || !hasDownwardMovementRef.current) return
src/hooks/useReadingCompletionGate.js:46:      hasTriggeredRef.current = true
src/hooks/useReadingCompletionGate.js:47:      observer.disconnect()
src/hooks/useReadingCompletionGate.js:57:      observer.disconnect()
src/hooks/useScrollReveal.js:10:    const observer = new IntersectionObserver(([entry]) => {
src/hooks/useScrollReveal.js:13:        observer.disconnect()
src/hooks/useScrollReveal.js:18:    return () => observer.disconnect()
src/pages/content/WebtoonEpisodio.jsx:11:import { useReadingCompletionGate } from '../../hooks/useReadingCompletionGate'
src/pages/content/WebtoonEpisodio.jsx:56:  useReadingCompletionGate({
src/pages/content/LivroCapitulo.jsx:12:import { useReadingCompletionGate } from '../../hooks/useReadingCompletionGate'
src/pages/content/LivroCapitulo.jsx:115:  useReadingCompletionGate({
===== CONQUISTAS PRESERVADAS =====
src/pages/content/WebtoonEpisodio.jsx:28:  const { desbloquearOuConvidar } = useAchievements()
src/pages/content/WebtoonEpisodio.jsx:32:  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
src/pages/content/WebtoonEpisodio.jsx:33:  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
src/pages/content/WebtoonEpisodio.jsx:53:    if (id === '00') notificationManager.removeByAchievementId('episodio_zero')
src/pages/content/WebtoonEpisodio.jsx:60:    onComplete: () => desbloquearOuConvidarRef.current('episodio_zero'),
src/pages/content/LivroCapitulo.jsx:25:  const { desbloquearOuConvidar } = useAchievements()
src/pages/content/LivroCapitulo.jsx:29:  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
src/pages/content/LivroCapitulo.jsx:30:  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
src/pages/content/LivroCapitulo.jsx:112:    if (id === 'capitulo-01') notificationManager.removeByAchievementId('leitor_marelia')
src/pages/content/LivroCapitulo.jsx:119:    onComplete: () => desbloquearOuConvidarRef.current('leitor_marelia'),
===== OBSERVERS LOCAIS =====
grep exit: 1 (1 = nenhum observer local)
===== LINHAS DEPOIS =====
   60 src/hooks/useReadingCompletionGate.js
  139 src/pages/content/WebtoonEpisodio.jsx
  279 src/pages/content/LivroCapitulo.jsx
  114 src/context/AchievementsContext.jsx
  259 src/components/UnifiedNotification/UnifiedNotification.jsx
  203 src/lib/notificationManager.js
 1054 total
===== GIT DIFF CHECK =====
git diff --check exit: 0
===== GIT STATUS =====
 M SITE_MAP.md
 M src/components/UnifiedNotification/UnifiedNotification.jsx
 M src/config/version.js
 M src/context/AchievementsContext.jsx
 M src/lib/notificationManager.js
 M src/pages/content/LivroCapitulo.css
 M src/pages/content/LivroCapitulo.jsx
 M src/pages/content/WebtoonEpisodio.jsx
?? docs/Marketing/limpeza/Int/bloco07_ao_bloco10-SoftBounce.csv
?? docs/Marketing/listas_email_int/bloco11_ao_bloco18-SoftBounce.csv
?? docs/Marketing/listas_email_int/bloco11_ao_bloco18.csv
?? src/hooks/useReadingCompletionGate.js
```

## Diff integral

```diff
diff --git a/SITE_MAP.md b/SITE_MAP.md
index f0cd2264..15ba450e 100644
--- a/SITE_MAP.md
+++ b/SITE_MAP.md
@@ -1,6 +1,6 @@
 # ILLUSIONFIGHT.COM — SITE MAP

-> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.** Última atualização: 2026-07-18 — v10.192.24 (correção de encoding em comentários e chevrons; relatório Playwright v10.192.23)
+> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.** Última atualização: 2026-07-18 — v10.192.25 (gate compartilhado exige leitura real antes das conquistas do Webtoon e Livro)
 > **🔒 Lista de arquivos proibidos:** ver `AGENTS.md` → "Arquivos proibidos — nunca tocar"

 ---
@@ -566,7 +566,7 @@

 | Constante | Versão | Descrição |
 |---|---|---|
-| `SITE_VERSION` | **10.192.24** | encoding corrigido em arquivos de jogos e evidência Playwright v10.192.23 registrada |
+| `SITE_VERSION` | **10.192.25** | gate compartilhado de conclusão de leitura para Webtoon e Livro |
 | `PP_VERSION` | **2.3.1** | Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json |
 | `LDI_VERSION` | **2.0.1** | Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro) |
 | `JACK_VERSION` | **5.3.2** | Jack Dream Beer — correção de encoding em comentário |
diff --git a/src/components/UnifiedNotification/UnifiedNotification.jsx b/src/components/UnifiedNotification/UnifiedNotification.jsx
index bc78fbf3..26dfa4e9 100644
--- a/src/components/UnifiedNotification/UnifiedNotification.jsx
+++ b/src/components/UnifiedNotification/UnifiedNotification.jsx
@@ -29,16 +29,10 @@ export default function UnifiedNotification() {
   const autoTimerRef = useRef(null)
   const checkIntervalRef = useRef(null)
   const ninaCbRef = useRef(null)
-  const currentRef = useRef(current)
-  currentRef.current = current

   // Tenta puxar da fila — mas primeiro verifica notificação pendente da Nina
   const tryPull = useCallback(() => {
-    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', mode: user ? 'authenticated' : 'guest', currentType: current?.type ?? null, queueLength: notificationManager.queueLength() })
-    if (current) {
-      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'UnifiedNotification.tryPull', result: 'active-notification-blocks-pull', currentType: current.type, queueLength: notificationManager.queueLength() })
-      return
-    }
+    if (current) return

     // Defesa: guest não pode ver achievement de jeito nenhum
     if (!user) {
@@ -66,7 +60,6 @@ export default function UnifiedNotification() {
       ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
       : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
     if (item) {
-      console.log('[ACH:TOAST_SHOW]', { timestamp: new Date().toISOString(), type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: Date.now() - item.createdAt, mode: user ? 'authenticated' : 'guest', reason: 'queue-item-selected' })
       setCurrent(item)
       setIsClosing(false)
       setTypedText('')
@@ -116,8 +109,6 @@ export default function UnifiedNotification() {
   }, [current])

   const handleClose = useCallback(() => {
-    const activeNotification = currentRef.current
-    console.log('[ACH:TOAST_CLOSE]', { timestamp: new Date().toISOString(), type: activeNotification?.type ?? null, key: activeNotification?.data?.achievementId ?? activeNotification?.data?.nome ?? null, notificationId: activeNotification?.id ?? null, reason: 'close-requested' })
     setIsClosing(true)
     setTimeout(() => {
       setCurrent(null)
diff --git a/src/config/version.js b/src/config/version.js
index e8272384..675206af 100644
--- a/src/config/version.js
+++ b/src/config/version.js
@@ -8,7 +8,7 @@
  */

 // ── Site ──────────────────────────────────────────
-export const SITE_VERSION = '10.192.24'
+export const SITE_VERSION = '10.192.25'

 // ── Games ─────────────────────────────────────────
 export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
diff --git a/src/context/AchievementsContext.jsx b/src/context/AchievementsContext.jsx
index aea70f52..870f5b05 100644
--- a/src/context/AchievementsContext.jsx
+++ b/src/context/AchievementsContext.jsx
@@ -36,11 +36,6 @@ export function AchievementsProvider({ children }) {
   async function carregarDoSupabase() {
     const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
     if (error) { console.error('Erro ao carregar achievements:', error); return }
-    console.log('[ACH:EXISTING_CHECK]', {
-      timestamp: new Date().toISOString(), source: 'supabase-load', mode: 'authenticated',
-      existingCount: data?.length ?? 0, requestedPersistence: false, requestedToast: false,
-      reason: 'existing-achievements-loaded-without-toast',
-    })
     if (data && data.length > 0) setDesbloqueados(data.map(d => d.achievement_id))
   }

@@ -53,30 +48,14 @@ export function AchievementsProvider({ children }) {
   }

   const desbloquear = useCallback(async (achievementId) => {
-    console.trace('[ACH:REQUEST]', {
-      timestamp: new Date().toISOString(), achievementId,
-      mode: user ? 'authenticated' : 'guest', alreadyExisting: desbloqueados.includes(achievementId),
-    })
     // Sem conta logada = não desbloqueia achievement
-    if (!user) {
-      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: false, reason: 'no-authenticated-user' })
-      return
-    }
-    if (desbloqueados.includes(achievementId)) {
-      console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: false, requestedToast: false, reason: 'already-unlocked-in-state' })
-      return
-    }
+    if (!user) return
+    if (desbloqueados.includes(achievementId)) return
     const achievement = todosAchievements.find(a => a.id === achievementId)
-    if (!achievement) {
-      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: false, requestedToast: false, reason: 'achievement-definition-not-found' })
-      return
-    }
-    console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: false, requestedPersistence: true, requestedToast: true, reason: 'new-unlock-request' })
-    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'persisting-new-achievement' })
+    if (!achievement) return
     const { error } = await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
     if (error) {
       if (error.code === '23505') {
-        console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: true, requestedToast: false, reason: 'database-duplicate' })
         setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
         return
       }
@@ -85,6 +64,7 @@ export function AchievementsProvider({ children }) {
     }
     setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
     notificationManager.push('achievement', {
+      achievementId,
       nome: achievement.nome,
       descricao: achievement.descricao,
       icone: achievement.icone,
@@ -106,16 +86,10 @@ export function AchievementsProvider({ children }) {
   }

   const desbloquearOuConvidar = useCallback((achievementId) => {
-    console.trace('[ACH:REQUEST]', {
-      timestamp: new Date().toISOString(), achievementId,
-      mode: user ? 'authenticated' : 'guest', entrypoint: 'desbloquearOuConvidar',
-    })
     if (!user) {
-      console.log('[ACH:GUEST_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: true, reason: 'guest-cta-enqueue' })
       notificationManager.push('cta_conta', { achievementId })
       return
     }
-    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'delegating-to-unlock' })
     desbloquear(achievementId)
   }, [desbloquear, user])

diff --git a/src/lib/notificationManager.js b/src/lib/notificationManager.js
index 3f3aed90..62405f53 100644
--- a/src/lib/notificationManager.js
+++ b/src/lib/notificationManager.js
@@ -32,10 +32,8 @@ export const notificationManager = {
    */
   push(type, data) {
     const queue = this._getQueue()
-    const beforeLength = queue.length
     // Evita duplicatas do mesmo tipo consecutivas
     if (queue.length > 0 && queue[queue.length - 1].type === type) {
-      console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', queueBefore: beforeLength, queueAfter: queue.length, createdAt: null, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'rejected-consecutive-duplicate' })
       return
     }
     const item = {
@@ -46,7 +44,6 @@ export const notificationManager = {
     }
     queue.push(item)
     this._saveQueue(queue)
-    console.log('[NOTIF:ENQUEUE]', { timestamp: new Date().toISOString(), type, key: data?.achievementId ?? data?.nome ?? null, origin: 'push', notificationId: item.id, queueBefore: beforeLength, queueAfter: queue.length, createdAt: item.createdAt, ageMs: 0, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown: false, result: 'enqueued' })
     this._notifyListeners()
   },

@@ -59,11 +56,7 @@ export const notificationManager = {
    */
   pull(bypassCooldown = false) {
     const queue = this._getQueue()
-    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'pull', requestedType: null, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })
-    if (queue.length === 0) {
-      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'empty-queue', queueAfter: 0 })
-      return null
-    }
+    if (queue.length === 0) return null

     const now = Date.now()

@@ -80,12 +73,10 @@ export const notificationManager = {
       queue.shift()
       this._saveQueue(queue)
       this._setLastTime(now)
-      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'selected', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
       return item
     }

     if (changed) this._saveQueue(queue)
-    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'pull', result: 'cooldown-active', type: item.type, key: item.data?.achievementId ?? item.data?.nome ?? null, notificationId: item.id, createdAt: item.createdAt, ageMs: now - item.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
     return null // cooldown ativo
   },

@@ -115,7 +106,6 @@ export const notificationManager = {
   findAndPull(type, bypassCooldown = false) {
     const queue = this._getQueue()
     const now = Date.now()
-    console.log('[NOTIF:PULL_CHECK]', { timestamp: new Date().toISOString(), operation: 'findAndPull', requestedType: type, queueBefore: queue.length, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown })

     // Remove todos os itens expirados, independente de tipo
     const changed = this._purgeExpired(queue, now)
@@ -130,18 +120,15 @@ export const notificationManager = {
         queue.splice(i, 1)
         this._saveQueue(queue)
         this._setLastTime(now)
-        console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'selected', requestedType: type, type: valid.type, key: valid.data?.achievementId ?? valid.data?.nome ?? null, notificationId: valid.id, createdAt: valid.createdAt, ageMs: now - valid.createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: 0, bypassCooldown, queueAfter: queue.length })
         return valid
       }
       // Cooldown ativo — não retorna, mas não remove da fila
       if (changed) this._saveQueue(queue)
-      console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: 'cooldown-active', requestedType: type, type: queue[i].type, key: queue[i].data?.achievementId ?? queue[i].data?.nome ?? null, notificationId: queue[i].id, createdAt: queue[i].createdAt, ageMs: now - queue[i].createdAt, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
       return null
     }

     // Nenhum item do tipo encontrado — salva remoções de expirados se houve
     if (changed) this._saveQueue(queue)
-    console.log('[NOTIF:PULL_RESULT]', { timestamp: new Date().toISOString(), operation: 'findAndPull', result: changed ? 'expired-items-purged-no-match' : 'no-matching-type', requestedType: type, ttlMs: NOTIF_TTL_MS, cooldownRemainingMs: this.timeUntilNext(), bypassCooldown, queueAfter: queue.length })
     return null
   },

@@ -152,6 +139,15 @@ export const notificationManager = {
     this._notifyListeners()
   },

+  /** Remove somente itens ligados a uma conquista específica. */
+  removeByAchievementId(achievementId) {
+    const queue = this._getQueue()
+    const filtered = queue.filter(item => item.data?.achievementId !== achievementId)
+    if (filtered.length === queue.length) return
+    this._saveQueue(filtered)
+    this._notifyListeners()
+  },
+
   /** Limpa a fila inteira */
   clear() {
     localStorage.removeItem(STORAGE_QUEUE)
diff --git a/src/pages/content/LivroCapitulo.css b/src/pages/content/LivroCapitulo.css
index 25cebe7d..07e171a5 100644
--- a/src/pages/content/LivroCapitulo.css
+++ b/src/pages/content/LivroCapitulo.css
@@ -238,3 +238,6 @@
     right: 1rem;
   }
 }
+.livro-capitulo__sentinel {
+  height: 1px;
+}
diff --git a/src/pages/content/LivroCapitulo.jsx b/src/pages/content/LivroCapitulo.jsx
index eabd0726..33608208 100644
--- a/src/pages/content/LivroCapitulo.jsx
+++ b/src/pages/content/LivroCapitulo.jsx
@@ -1,4 +1,4 @@
-import { useState, useEffect, useRef } from 'react'
+import { useState, useEffect, useLayoutEffect, useRef } from 'react'
 import { Helmet } from 'react-helmet-async'
 import { useParams, useNavigate, Link } from 'react-router-dom'
 import ReactMarkdown from 'react-markdown'
@@ -9,6 +9,8 @@ import { TRIAL_ACTIVE } from '../../config/trial'
 import { estaDisponivel } from '../../config/site'
 import { useAchievements } from '../../context/AchievementsContext'
 import { useEventos } from '../../context/EventosContext'
+import { useReadingCompletionGate } from '../../hooks/useReadingCompletionGate'
+import { notificationManager } from '../../lib/notificationManager'
 import index from '../../data/livro-index.json'
 import './LivroCapitulo.css'

@@ -106,15 +108,16 @@ export default function LivroCapitulo() {
     loadChapter()
   }, [id, chapter, isAdmin, locale])

-  // Sentinel: dispara achievement (logado) ou CTA (guest) ao final do capítulo 1
-  useEffect(() => {
-    if (id !== 'capitulo-01' || !sentinelRef.current) return
-    const obs = new IntersectionObserver(([entry]) => {
-      if (entry.isIntersecting) desbloquearOuConvidarRef.current('leitor_marelia')
-    }, { threshold: 0.1 })
-    obs.observe(sentinelRef.current)
-    return () => obs.disconnect()
-  }, [id, md])
+  useLayoutEffect(() => {
+    if (id === 'capitulo-01') notificationManager.removeByAchievementId('leitor_marelia')
+  }, [id])
+
+  useReadingCompletionGate({
+    sentinelRef,
+    contentKey: `livro:${id}`,
+    enabled: id === 'capitulo-01' && Boolean(md),
+    onComplete: () => desbloquearOuConvidarRef.current('leitor_marelia'),
+  })

   if (notFound) {
     return (
@@ -231,7 +234,7 @@ export default function LivroCapitulo() {
           }}
         >
           <ReactMarkdown>{md}</ReactMarkdown>
-          <div ref={sentinelRef} style={{ height: 1 }} />
+          <div ref={sentinelRef} className="livro-capitulo__sentinel" />
         </div>

         <div className="livro-nav-flutuante">
diff --git a/src/pages/content/WebtoonEpisodio.jsx b/src/pages/content/WebtoonEpisodio.jsx
index 8b5f503d..513f26b7 100644
--- a/src/pages/content/WebtoonEpisodio.jsx
+++ b/src/pages/content/WebtoonEpisodio.jsx
@@ -1,4 +1,4 @@
-import { useEffect, useRef } from 'react'
+import { useEffect, useLayoutEffect, useRef } from 'react'
 import { Helmet } from 'react-helmet-async'
 import { useParams, useNavigate } from 'react-router-dom'
 import { useLanguage } from '../../context/LanguageContext'
@@ -8,6 +8,8 @@ import { TRIAL_ACTIVE } from '../../config/trial'
 import { estaDisponivel } from '../../config/site'
 import { useAchievements } from '../../context/AchievementsContext'
 import { useEventos } from '../../context/EventosContext'
+import { useReadingCompletionGate } from '../../hooks/useReadingCompletionGate'
+import { notificationManager } from '../../lib/notificationManager'
 import episodios from '../../data/episodios.json'
 import './WebtoonEpisodio.css'

@@ -22,7 +24,7 @@ export default function WebtoonEpisodio() {
   const { id } = useParams()
   const navigate = useNavigate()
   const { locale, t } = useLanguage()
-  const { user, perfil, carregando } = useAuth()
+  const { user, perfil } = useAuth()
   const { desbloquearOuConvidar } = useAchievements()
   const { registrarEvento } = useEventos()
   const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
@@ -31,17 +33,6 @@ export default function WebtoonEpisodio() {
   useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
   const ultimaPaginaRef = useRef(null)

-  useEffect(() => {
-    const epAtual = episodios.find(e => e.id === id)
-    console.log('[WEBTOON:INIT]', {
-      timestamp: new Date().toISOString(), pathname: window.location.pathname,
-      episodeId: id, totalPages: epAtual?.paginas ?? 0, origin: 'mount',
-      scrollY: window.scrollY, innerHeight: window.innerHeight,
-      scrollHeight: document.documentElement.scrollHeight, completionGuard: 'none',
-      mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
-    })
-  }, [id])
-
   useEffect(() => {
     setReaderMode(true)
     return () => setReaderMode(false)
@@ -58,34 +49,17 @@ export default function WebtoonEpisodio() {
     if (saved) window.scrollTo(0, parseInt(saved))
   }, [id])

-  useEffect(() => {
-    if (!ultimaPaginaRef.current) return
-    const observer = new IntersectionObserver(([entry]) => {
-      const scrollHeight = document.documentElement.scrollHeight
-      console.log('[WEBTOON:COMPLETE_CHECK]', {
-        timestamp: new Date().toISOString(), pathname: window.location.pathname,
-        episodeId: id, totalPages: episodios.find(e => e.id === id)?.paginas ?? 0,
-        origin: 'observer', scrollY: window.scrollY, innerHeight: window.innerHeight,
-        scrollHeight, distanceToEnd: scrollHeight - (window.scrollY + window.innerHeight),
-        isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio,
-        completionResult: entry.isIntersecting, completionGuard: 'none',
-        mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
-      })
-      if (entry.isIntersecting) {
-        if (id === '00') {
-          console.trace('[WEBTOON:COMPLETE_TRIGGER]', {
-            timestamp: new Date().toISOString(), pathname: window.location.pathname,
-            episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
-            mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
-          })
-          desbloquearOuConvidarRef.current('episodio_zero')
-        }
-      }
-    }, { threshold: 0.1 })
-    observer.observe(ultimaPaginaRef.current)
-    return () => observer.disconnect()
+  useLayoutEffect(() => {
+    if (id === '00') notificationManager.removeByAchievementId('episodio_zero')
   }, [id])

+  useReadingCompletionGate({
+    sentinelRef: ultimaPaginaRef,
+    contentKey: `webtoon:${id}`,
+    enabled: id === '00',
+    onComplete: () => desbloquearOuConvidarRef.current('episodio_zero'),
+  })
+
   const ep = episodios.find(e => e.id === id)
   const idx = episodios.findIndex(e => e.id === id)
   const prev = idx > 0 ? episodios[idx - 1] : null
diff --git a/src/hooks/useReadingCompletionGate.js b/src/hooks/useReadingCompletionGate.js
new file mode 100644
index 00000000..1f1a2211
--- /dev/null
+++ b/src/hooks/useReadingCompletionGate.js
@@ -0,0 +1,60 @@
+import { useEffect, useRef } from 'react'
+
+const NOT_ARMED = 'NOT_ARMED'
+const ARMED = 'ARMED'
+const COMPLETED = 'COMPLETED'
+
+export function useReadingCompletionGate({ sentinelRef, contentKey, enabled, onComplete }) {
+  const stateRef = useRef(NOT_ARMED)
+  const hasDownwardMovementRef = useRef(false)
+  const hasTriggeredRef = useRef(false)
+  const lastScrollYRef = useRef(0)
+  const onCompleteRef = useRef(onComplete)
+
+  useEffect(() => {
+    onCompleteRef.current = onComplete
+  }, [onComplete])
+
+  useEffect(() => {
+    stateRef.current = NOT_ARMED
+    hasDownwardMovementRef.current = false
+    hasTriggeredRef.current = false
+    lastScrollYRef.current = window.scrollY
+
+    const sentinel = sentinelRef.current
+    if (!enabled || !sentinel) return
+
+    const onScroll = () => {
+      const currentScrollY = window.scrollY
+      if (stateRef.current === ARMED && currentScrollY > lastScrollYRef.current) {
+        hasDownwardMovementRef.current = true
+      }
+      lastScrollYRef.current = currentScrollY
+    }
+
+    const observer = new IntersectionObserver(([entry]) => {
+      if (hasTriggeredRef.current) return
+
+      if (!entry.isIntersecting) {
+        if (stateRef.current === NOT_ARMED) stateRef.current = ARMED
+        return
+      }
+
+      if (stateRef.current !== ARMED || !hasDownwardMovementRef.current) return
+
+      stateRef.current = COMPLETED
+      hasTriggeredRef.current = true
+      observer.disconnect()
+      window.removeEventListener('scroll', onScroll)
+      onCompleteRef.current()
+    }, { threshold: 0.1 })
+
+    window.addEventListener('scroll', onScroll, { passive: true })
+    observer.observe(sentinel)
+
+    return () => {
+      window.removeEventListener('scroll', onScroll)
+      observer.disconnect()
+    }
+  }, [contentKey, enabled, sentinelRef])
+}
```

## Graphify

O comando obrigatório foi executado com sucesso. Ele gerou aproximadamente 6,5 MB de diff mecânico nos artefatos rastreados; como esses arquivos são regeneráveis e o pedido anterior determinou ignorar caches/saídas incrementais, eles foram restaurados ao HEAD e não contaminam o diff autoral desta correção.

```text
Re-extracting code files in . (no LLM needed)...
  AST extraction: 100/548 uncached files (18%) [24 workers]
  AST extraction: 200/548 uncached files (36%) [24 workers]
  AST extraction: 300/548 uncached files (54%) [24 workers]
  AST extraction: 400/548 uncached files (72%) [24 workers]
  AST extraction: 500/548 uncached files (91%) [24 workers]
  AST extraction: 548/548 uncached files (100%) [24 workers]
[graphify watch] Rebuilt: 3007 nodes, 6283 edges, 264 communities
[graphify watch] graph.json, graph.html and GRAPH_REPORT.md updated in graphify-out
Code graph updated. For doc/paper/image changes run /graphify --update in your AI assistant.
Tip: set GEMINI_API_KEY or GOOGLE_API_KEY to use Gemini for semantic extraction.
  warning: 61 source file(s) produced zero nodes and are absent from the graph: opencode.json, tasks.json, sample-map.json, soundon-clean.json, soundon-output.json (+56 more). A re-run will retry them (empties are no longer cached); if it persists, please report the file(s) (#1666).
  warning: 25 .sql file(s) contributed nothing to the graph because a dependency is missing: tree_sitter_sql not installed. Install it with: pip install "graphifyy[sql]" (#1745).
Exit code: 0
```

## Build integral

```text

> illusion-fight@1.0.0 build
> vite build && node scripts/prerender-routes.js

vite v8.0.16 building client environment for production...
[2Ktransforming...✓ 1342 modules transformed.
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
dist/assets/index-Bpm6D36i.css                          636.10 kB │ gzip: 102.75 kB
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
dist/assets/index-BbaIhjTC.js                         2,907.59 kB │ gzip: 849.05 kB │ map: 8,018.37 kB

[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-pt.json is dynamically imported by src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js, src/pages/games/TopTrumps/TopTrumpsLobby.jsx, dynamic import will not move module into another chunk.

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-en.json is dynamically imported by src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js, dynamic import will not move module into another chunk.

[33m[INEFFECTIVE_DYNAMIC_IMPORT] [0msrc/data/supertrunfo-es.json is dynamically imported by src/context/AuthContext.jsx but also statically imported by src/lib/getDeck.js, dynamic import will not move module into another chunk.

✓ built in 2.07s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
BUILD_EXIT=0
```

## Workflow final

### Proposta para `AGENTS.md`

Adicionar em decisões documentadas: leitores com conquista devem usar `useReadingCompletionGate`; interseção isolada do sentinel não comprova leitura. A proposta não foi aplicada automaticamente para manter o escopo desta correção.

| Item | Resultado |
|---|---|
| `SITE_VERSION` | 10.192.24 → **10.192.25** |
| Commit funcional | `c8dc51f77ab273d1045e731a658e1c18c887505b` — `fix: exigir leitura real antes do trofeu + v10.192.25` |
| Push | `3f5d7a51..c8dc51f7 main -> main`; remoto confirmado em `c8dc51f77ab273d1045e731a658e1c18c887505b` |
| Deploy | `gh-pages -d dist` → `Published` (exit 0); remoto `gh-pages` em `d193b53d38d85da47d64f86c3b78c34a2a43726c` |

## Testes manuais — Isaias

1. Webtoon guest no topo: janela anônima em `/webtoon/00`, aguardar 15s sem rolar; nenhum modal e nenhum salto.
2. Webtoon guest no final: rolar normalmente; CTA Episode Zero aparece uma vez.
3. Reload no final: nenhum modal imediato; subir antes do final e voltar descendo; modal somente na nova chegada.
4. Livro guest: `/livro/01` no topo sem modal; ao final, CTA `leitor_marelia`.
5. Outro capítulo publicado: nenhuma conquista `leitor_marelia`.
6. Autenticado sem as conquistas: topo sem persistência/modal; final com persistência/modal; segundo acesso sem novo modal.

**Status final: CORRIGIDO — PENDENTE TESTE MANUAL**
