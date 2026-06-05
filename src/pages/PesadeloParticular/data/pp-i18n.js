/**
 * Pesadelo Particular — Dicionário de i18n
 *
 * CONTÉM TODAS as strings do jogo que estavam hardcoded nos componentes.
 * Deve ser usado como base para migrar para os arquivos principais em src/i18n/.
 *
 * Uso: import { PP } from './pp-i18n' → PP[locale].chave
 *
 * Última atualização: 2026-06-05
 * Versão: 1.5.18
 */

const PP = {
  pt: {
    // ── Intro ──
    "intro.texto": "Marelia, 1954. A chuva não para há três dias.\n\nVocê não é detetive.\n\nMas o sonho não liga pra isso.",
    "intro.titulo": "PESADELO PARTICULAR",
    "intro.pular": "toque para pular",

    // ── Menu Inicial ──
    "menu.marelia": "Marelia, 1954",
    "menu.titulo_linha1": "PESADELO",
    "menu.titulo_linha2": "PARTICULAR",
    "menu.continuar": "● CONTINUAR",
    "menu.nivel_casos": "nível {nivel}, {casos} casos resolvidos",
    "menu.novo_jogo": "○ NOVO JOGO",
    "menu.voltar_site": "← voltar ao site",
    "menu.confirmar": "tem certeza?\nisso apaga tudo.",
    "menu.nao": "NÃO",
    "menu.sim": "SIM",

    // ── Tela Final / Créditos ──
    "final.msg_jack": "foi um prazer trabalhar contigo.\nmarelia vai continuar precisando de alguém como você.",
    "final.jack_label": "Jack Cachorrão",
    "final.creditos_titulo": "PESADELO PARTICULAR",
    "final.creditos_temporada": "Temporada 1",
    "final.creditos_historia": "uma história de",
    "final.creditos_marelia": "MARELIA, 1954",
    "final.creditos_escrito": "escrito e dirigido por",
    "final.creditos_autor": "ISAIAS LEAL",
    "final.creditos_obrigado": "obrigado por jogar",
    "final.creditos_prox_temp": "nos vemos na próxima temporada.",
    "final.nivel_casos_label": "nível {nivel} · {casos} casos resolvidos",
    "final.compartilhar": "compartilhar com amigos",
    "final.voltar_inicio": "voltar ao início",
    "final.link_copiado": "link copiado!",

    // ── ConvoView (WhatsApp) ──
    "convo.caso_aberto": "Caso aberto.",
    "convo.caso_encerrado": "Caso encerrado.",
    "convo.jack_nome": "Jack Cachorrão",
    "convo.online": "● online",

    // ── Batalha ──
    "batalha.titulo": "CONFRONTO · NÍVEL {nivel}",
    "batalha.comeca": "O confronto começa.",
    "batalha.atacar": "⚔️ ATACAR",
    "batalha.inimigo_agindo": "⏳ Inimigo agindo...",
    "batalha.vitoria": "✓ Vitória!",
    "batalha.derrota": "✗ Derrota",
    "batalha.jack_ataca": "Jack ataca: {dano} de dano",
    "batalha.inimigo_ataca": "{nome} ataca: {dano} de dano",
    "batalha.inimigo_derrotado": "Inimigo derrotado!",
    "batalha.jack_derrotado": "Jack foi derrotado...",
    "batalha.critico": "⚡ CRÍTICO!",
    "batalha.resultado": "resultado: {valor}",
    "batalha.vitoria_msg": "⚔️ VITÓRIA!",
    "batalha.derrota_msg": "💀 Você foi derrotado!",
    "batalha.voce_ataca": "Você ataca e causa {dano} de dano.",
    "batalha.inimigo_ataca_log": "{nome} ataca e causa {dano} de dano.",

    // ── Investigação / Locais ──
    "local.confronto": "Confronto Necessário",
    "local.puzzle": "Resolver Puzzle para Investigar",
    "local.investigar": "Investigar Local",
    "local.voltar_dossier": "← Voltar ao Dossier",
    "local.evidencia_encontrada": "EVIDÊNCIA ENCONTRADA",
    "local.todos_investigados": "Todos os locais investigados",
    "local.voltar_dossier_btn": "VOLTAR AO DOSSIER",
    "local.restantes": "Local ({n} restantes)",
    "local.investigar_btn": "INVESTIGAR",
    "local.investigar_puzzle_btn": "INVESTIGAR (puzzle)",
    "local.hp_label": "HP",
    "local.dossier_voltar": "← dossier",
    "local.mapa_voltar": "← mapa",
    "local.puzzle_instrucao": "Resolva o puzzle para investigar este local.",
    "local.puzzle_nenhum": "Nenhum puzzle necessário.",

    // ── Dossier ──
    "dossier.caso_encerrado": "CASO ENCERRADO",
    "dossier.reputacao": "+{valor} reputação",
    "dossier.voltar_mapa": "VOLTAR AO MAPA",
    "dossier.inocente": "Inocente! Perdeu reputação.",
    "dossier.suspeitos": "SUSPEITOS",
    "dossier.locais": "LOCAIS",
    "dossier.briefing": "Briefing do Caso",
    "dossier.ver_abertura": "Ver conversa de abertura",
    "dossier.pistas_label": "PISTAS COLETADAS",
    "dossier.evidencias": "EVIDÊNCIAS",
    "dossier.resolvido_badge": "RESOLVIDO ✓",
    "dossier.sem_requisito": "sem requisito",
    "dossier.novo_fio": "NOVO FIO",

    // ── Acusação ──
    "acusar.errada": "pista errada. tente novamente.",
    "acusar.bloqueada": "caso fracassado. reinicie para tentar novamente.",
    "acusar.incompleta": "complete todas as pistas antes de acusar.",
    "acusar.colete_mais": "Colete mais {n} pista{plural}",
    "acusar.btn": "ACUSAR {nome}",

    // ── Phone Call ──
    "phone.chamada": "CHAMADA RECEBIDA",
    "phone.atender": "📞 ATENDER",
    "phone.recusar": "✕ RECUSAR",
    "phone.suspeito_label": "Suspeito",

    // ── Story Viewer ──
    "story.fio_label": "⚡ FIO DA CONSPIRAÇÃO",

    // ── Caderno de Suspeitas ──
    "caderno.titulo": "Caderno de Suspeitas",
    "caderno.desc": "Pistas do tipo Fio coletadas formam um padrão. Alguém está conectando todos os casos.",
    "caderno.progresso": "Progresso da conspiração: {pct}%",
    "caderno.vazio": "Nenhuma pista Fio coletada ainda. Resolva casos para encontrar conexões.",
    "caderno.conspiracao_5": "Um nome começa a surgir repetidamente. Kim. O dono do bar. Sempre presente, nunca suspeito.",
    "caderno.conspiracao_10": "As peças começam a se encaixar. Alguém está orquestrando o crime em Marelia. Alguém que conhece todos os envolvidos.",
    "caderno.conspiracao_15": "O padrão é claro. Kim está no centro de tudo. Cada caso, cada morte, cada pista leva ao bar da esquina.",

    // ── Dormindo ──
    "dormindo.titulo": "INCONSCIENTE",
    "dormindo.texto": "Você foi derrotado. O sonho escurece. Jack está caído no beco, a chuva lavando o sangue do asfalto.\n\nEm alguns minutos, alguém vai encontrá-lo. Ou talvez ninguém encontre. Isso é Marelia.",
    "dormindo.acordar": "ACORDAR",

    // ── Final Screen ──
    "fimscreen.titulo": "FIM DO PESADELO",
    "fimscreen.completo": "Você coletou pistas suficientes. Kim foi confrontado com todas as evidências. O sonho termina com clareza — mas as memórias permanecem.",
    "fimscreen.fragmentado": "Você não conseguiu todas as pistas. Kim admite parte dos crimes, mas escapa parcialmente. O sonho termina com dúvidas — talvez haja mais para descobrir.",
    "fimscreen.reputacao_label": "reputação total",
    "fimscreen.casos_label": "casos resolvidos",
    "fimscreen.fios_label": "Pistas Fio coletadas",
    "fimscreen.voltar_mapa": "VOLTAR AO MAPA",

    // ── Resolução ──
    "resolucao.caso_encerrado": "CASO ENCERRADO",
    "resolucao.novo_fio": "NOVO FIO",
    "resolucao.voltar_mapa": "VOLTAR AO MAPA",
    "resolucao.ver_caderno": "VER CADERNO",

    // ── Mapa ──
    "mapa.subtitulo": "Marelia, 1954. O sonho escolheu você.",
    "mapa.sem_requisito": "sem requisito",

    // ── CasoAbertura ──
    "abertura.investigar": "INVESTIGAR",

    // ── Geral ──
    "geral.reputacao": "★ {valor}",
    "geral.casos_resolvidos": "{n}/{total}",
    "geral.hp": "HP: {hp}/30",

    // ── Feed ──
    "feed.revisitar": "REVISITAR",
    "feed.investigar": "INVESTIGAR",
    "feed.mensagens": "MENSAGENS",
    "feed.stories_vazio": "Nenhuma pista coletada ainda.\n\nInvestigue os locais dos casos para revelar evidências.",
    "feed.status_reputacao": "REPUTAÇÃO",
    "feed.status_casos": "CASOS RESOLVIDOS",
    "feed.status_nivel": "NÍVEL",
    "feed.status_fios": "FIOS DA CONSPIRAÇÃO",
    "feed.topbar_nome": "Pesadelo Particular",
    "feed.topbar_sub": "Marelia, 1954 · Nível {nivel}",
    "feed.loading": "CARREGANDO...",
    "feed.caderno_vazio": "\"ainda não sei quem é.\nmas cada pista liga um ponto a outro.\"",
  },

  en: {
    "intro.texto": "Marelia, 1954. It hasn't stopped raining for three days.\n\nYou're not a detective.\n\nBut the dream doesn't care.",
    "intro.titulo": "PRIVATE NIGHTMARE",
    "intro.pular": "tap to skip",

    "menu.marelia": "Marelia, 1954",
    "menu.titulo_linha1": "PRIVATE",
    "menu.titulo_linha2": "NIGHTMARE",
    "menu.continuar": "● CONTINUE",
    "menu.nivel_casos": "level {nivel}, {casos} cases solved",
    "menu.novo_jogo": "○ NEW GAME",
    "menu.voltar_site": "← back to site",
    "menu.confirmar": "are you sure?\nthis deletes everything.",
    "menu.nao": "NO",
    "menu.sim": "YES",

    "final.msg_jack": "it was a pleasure working with you.\nmarelia will keep needing someone like you.",
    "final.jack_label": "Jack Cachorrão",
    "final.creditos_titulo": "PRIVATE NIGHTMARE",
    "final.creditos_temporada": "Season 1",
    "final.creditos_historia": "a story by",
    "final.creditos_marelia": "MARELIA, 1954",
    "final.creditos_escrito": "written and directed by",
    "final.creditos_autor": "ISAIAS LEAL",
    "final.creditos_obrigado": "thank you for playing",
    "final.creditos_prox_temp": "see you next season.",
    "final.nivel_casos_label": "level {nivel} · {casos} cases solved",
    "final.compartilhar": "share with friends",
    "final.voltar_inicio": "back to start",
    "final.link_copiado": "link copied!",

    "convo.caso_aberto": "Case opened.",
    "convo.caso_encerrado": "Case closed.",
    "convo.jack_nome": "Jack Cachorrão",
    "convo.online": "● online",

    "batalha.titulo": "CONFRONT · LEVEL {nivel}",
    "batalha.comeca": "The confrontation begins.",
    "batalha.atacar": "⚔️ ATTACK",
    "batalha.inimigo_agindo": "⏳ Enemy acting...",
    "batalha.vitoria": "✓ Victory!",
    "batalha.derrota": "✗ Defeat",
    "batalha.jack_ataca": "Jack attacks: {dano} damage",
    "batalha.inimigo_ataca": "{nome} attacks: {dano} damage",
    "batalha.inimigo_derrotado": "Enemy defeated!",
    "batalha.jack_derrotado": "Jack was defeated...",
    "batalha.critico": "⚡ CRITICAL!",
    "batalha.resultado": "result: {valor}",
    "batalha.vitoria_msg": "⚔️ VICTORY!",
    "batalha.derrota_msg": "💀 You were defeated!",
    "batalha.voce_ataca": "You attack and deal {dano} damage.",
    "batalha.inimigo_ataca_log": "{nome} attacks and deals {dano} damage.",

    "local.confronto": "Confrontation Required",
    "local.puzzle": "Solve Puzzle to Investigate",
    "local.investigar": "Investigate Location",
    "local.voltar_dossier": "← Back to Dossier",
    "local.evidencia_encontrada": "EVIDENCE FOUND",
    "local.todos_investigados": "All locations investigated",
    "local.voltar_dossier_btn": "BACK TO DOSSIER",
    "local.restantes": "Location ({n} remaining)",
    "local.investigar_btn": "INVESTIGATE",
    "local.investigar_puzzle_btn": "INVESTIGATE (puzzle)",
    "local.hp_label": "HP",
    "local.dossier_voltar": "← dossier",
    "local.mapa_voltar": "← map",
    "local.puzzle_instrucao": "Solve the puzzle to investigate this location.",
    "local.puzzle_nenhum": "No puzzle needed.",

    "dossier.caso_encerrado": "CASE CLOSED",
    "dossier.reputacao": "+{valor} reputation",
    "dossier.voltar_mapa": "BACK TO MAP",
    "dossier.inocente": "Innocent! Lost reputation.",
    "dossier.suspeitos": "SUSPECTS",
    "dossier.locais": "LOCATIONS",
    "dossier.briefing": "Case Briefing",
    "dossier.ver_abertura": "View opening conversation",
    "dossier.pistas_label": "CLUES COLLECTED",
    "dossier.evidencias": "EVIDENCE",
    "dossier.resolvido_badge": "SOLVED ✓",
    "dossier.sem_requisito": "no requirement",
    "dossier.novo_fio": "NEW THREAD",

    "acusar.errada": "wrong lead. try again.",
    "acusar.bloqueada": "case failed. restart to try again.",
    "acusar.incompleta": "collect all clues before accusing.",
    "acusar.colete_mais": "Collect {n} more clue{plural}",
    "acusar.btn": "ACCUSE {nome}",

    "phone.chamada": "INCOMING CALL",
    "phone.atender": "📞 ANSWER",
    "phone.recusar": "✕ DECLINE",
    "phone.suspeito_label": "Suspect",

    "story.fio_label": "⚡ CONSPIRACY THREAD",

    "caderno.titulo": "Suspect Notebook",
    "caderno.desc": "Thread clues collected form a pattern. Someone is connecting all the cases.",
    "caderno.progresso": "Conspiracy progress: {pct}%",
    "caderno.vazio": "No Thread clues collected yet. Solve cases to find connections.",
    "caderno.conspiracao_5": "A name keeps coming up. Kim. The bar owner. Always present, never suspected.",
    "caderno.conspiracao_10": "The pieces are falling into place. Someone is orchestrating crime in Marelia. Someone who knows everyone involved.",
    "caderno.conspiracao_15": "The pattern is clear. Kim is at the center of everything. Every case, every death, every clue leads to the corner bar.",

    "dormindo.titulo": "UNCONSCIOUS",
    "dormindo.texto": "You were defeated. The dream goes dark. Jack lies in the alley, rain washing blood off the asphalt.\n\nIn a few minutes, someone will find him. Or maybe no one will. This is Marelia.",
    "dormindo.acordar": "WAKE UP",

    "fimscreen.titulo": "END OF NIGHTMARE",
    "fimscreen.completo": "You collected enough clues. Kim was confronted with all the evidence. The dream ends with clarity — but the memories remain.",
    "fimscreen.fragmentado": "You didn't get all the clues. Kim admits to some crimes, but partially escapes. The dream ends with doubt — maybe there's more to uncover.",
    "fimscreen.reputacao_label": "total reputation",
    "fimscreen.casos_label": "cases solved",
    "fimscreen.fios_label": "Thread clues collected",
    "fimscreen.voltar_mapa": "BACK TO MAP",

    "resolucao.caso_encerrado": "CASE CLOSED",
    "resolucao.novo_fio": "NEW THREAD",
    "resolucao.voltar_mapa": "BACK TO MAP",
    "resolucao.ver_caderno": "VIEW NOTEBOOK",

    "mapa.subtitulo": "Marelia, 1954. The dream chose you.",
    "mapa.sem_requisito": "no requirement",

    "abertura.investigar": "INVESTIGATE",

    "geral.reputacao": "★ {valor}",
    "geral.casos_resolvidos": "{n}/{total}",
    "geral.hp": "HP: {hp}/30",

    // ── Feed ──
    "feed.revisitar": "REVISIT",
    "feed.investigar": "INVESTIGATE",
    "feed.mensagens": "MESSAGES",
    "feed.stories_vazio": "No clues collected yet.\n\nInvestigate the case locations to reveal evidence.",
    "feed.status_reputacao": "REPUTATION",
    "feed.status_casos": "CASES SOLVED",
    "feed.status_nivel": "LEVEL",
    "feed.status_fios": "CONSPIRACY THREADS",
    "feed.topbar_nome": "Private Nightmare",
    "feed.topbar_sub": "Marelia, 1954 · Level {nivel}",
    "feed.loading": "LOADING...",
    "feed.caderno_vazio": "\"I still don't know who it is.\nbut every clue connects one point to another.\"",
  },

  es: {
    "intro.texto": "Marelia, 1954. No para de llover hace tres días.\n\nNo eres detective.\n\nPero al sueño no le importa.",
    "intro.titulo": "PESADILLA PRIVADA",
    "intro.pular": "toca para saltar",

    "menu.marelia": "Marelia, 1954",
    "menu.titulo_linha1": "PESADILLA",
    "menu.titulo_linha2": "PRIVADA",
    "menu.continuar": "● CONTINUAR",
    "menu.nivel_casos": "nivel {nivel}, {casos} casos resueltos",
    "menu.novo_jogo": "○ NUEVO JUEGO",
    "menu.voltar_site": "← volver al sitio",
    "menu.confirmar": "¿estás seguro?\nesto borra todo.",
    "menu.nao": "NO",
    "menu.sim": "SÍ",

    "final.msg_jack": "fue un placer trabajar contigo.\nmarelia seguirá necesitando a alguien como tú.",
    "final.jack_label": "Jack Cachorrão",
    "final.creditos_titulo": "PESADILLA PRIVADA",
    "final.creditos_temporada": "Temporada 1",
    "final.creditos_historia": "una historia de",
    "final.creditos_marelia": "MARELIA, 1954",
    "final.creditos_escrito": "escrito y dirigido por",
    "final.creditos_autor": "ISAIAS LEAL",
    "final.creditos_obrigado": "gracias por jugar",
    "final.creditos_prox_temp": "nos vemos la próxima temporada.",
    "final.nivel_casos_label": "nivel {nivel} · {casos} casos resueltos",
    "final.compartilhar": "compartir con amigos",
    "final.voltar_inicio": "volver al inicio",
    "final.link_copiado": "¡enlace copiado!",

    "convo.caso_aberto": "Caso abierto.",
    "convo.caso_encerrado": "Caso cerrado.",
    "convo.jack_nome": "Jack Cachorrão",
    "convo.online": "● en línea",

    "batalha.titulo": "CONFRONTACIÓN · NIVEL {nivel}",
    "batalha.comeca": "Comienza la confrontación.",
    "batalha.atacar": "⚔️ ATACAR",
    "batalha.inimigo_agindo": "⏳ Enemigo actuando...",
    "batalha.vitoria": "✓ ¡Victoria!",
    "batalha.derrota": "✗ Derrota",
    "batalha.jack_ataca": "Jack ataca: {dano} de daño",
    "batalha.inimigo_ataca": "{nome} ataca: {dano} de daño",
    "batalha.inimigo_derrotado": "¡Enemigo derrotado!",
    "batalha.jack_derrotado": "Jack fue derrotado...",
    "batalha.critico": "⚡ ¡CRÍTICO!",
    "batalha.resultado": "resultado: {valor}",
    "batalha.vitoria_msg": "⚔️ ¡VICTORIA!",
    "batalha.derrota_msg": "💀 ¡Fuiste derrotado!",
    "batalha.voce_ataca": "Atacas y causas {dano} de daño.",
    "batalha.inimigo_ataca_log": "{nome} ataca y causa {dano} de daño.",

    "local.confronto": "Confrontación Necesaria",
    "local.puzzle": "Resolver Puzzle para Investigar",
    "local.investigar": "Investigar Local",
    "local.voltar_dossier": "← Volver al Dossier",
    "local.evidencia_encontrada": "EVIDENCIA ENCONTRADA",
    "local.todos_investigados": "Todos los locales investigados",
    "local.voltar_dossier_btn": "VOLVER AL DOSSIER",
    "local.restantes": "Local ({n} restantes)",
    "local.investigar_btn": "INVESTIGAR",
    "local.investigar_puzzle_btn": "INVESTIGAR (puzzle)",
    "local.hp_label": "HP",
    "local.dossier_voltar": "← dossier",
    "local.mapa_voltar": "← mapa",
    "local.puzzle_instrucao": "Resuelve el puzzle para investigar este local.",
    "local.puzzle_nenhum": "No se necesita puzzle.",

    "dossier.caso_encerrado": "CASO CERRADO",
    "dossier.reputacao": "+{valor} reputación",
    "dossier.voltar_mapa": "VOLVER AL MAPA",
    "dossier.inocente": "¡Inocente! Perdiste reputación.",
    "dossier.suspeitos": "SOSPECHOSOS",
    "dossier.locais": "LUGARES",
    "dossier.briefing": "Briefing del Caso",
    "dossier.ver_abertura": "Ver conversación inicial",
    "dossier.pistas_label": "PISTAS RECOLECTADAS",
    "dossier.evidencias": "EVIDENCIAS",
    "dossier.resolvido_badge": "RESUELTO ✓",
    "dossier.sem_requisito": "sin requisito",
    "dossier.novo_fio": "NUEVO HILO",

    "acusar.errada": "pista equivocada. inténtalo de nuevo.",
    "acusar.bloqueada": "caso fallido. reinicia para intentar de nuevo.",
    "acusar.incompleta": "completa todas las pistas antes de acusar.",
    "acusar.colete_mais": "Recoge {n} pista{plural} más",
    "acusar.btn": "ACUSAR A {nome}",

    "phone.chamada": "LLAMADA ENTRANTE",
    "phone.atender": "📞 RESPONDER",
    "phone.recusar": "✕ RECHAZAR",
    "phone.suspeito_label": "Sospechoso",

    "story.fio_label": "⚡ HILO DE CONSPIRACIÓN",

    "caderno.titulo": "Cuaderno de Sospechas",
    "caderno.desc": "Las pistas de tipo Hilo recolectadas forman un patrón. Alguien está conectando todos los casos.",
    "caderno.progresso": "Progreso de la conspiración: {pct}%",
    "caderno.vazio": "Ninguna pista Hilo recolectada aún. Resuelve casos para encontrar conexiones.",
    "caderno.conspiracao_5": "Un nombre sigue apareciendo. Kim. El dueño del bar. Siempre presente, nunca sospechoso.",
    "caderno.conspiracao_10": "Las piezas empiezan a encajar. Alguien está orquestando el crimen en Marelia. Alguien que conoce a todos los involucrados.",
    "caderno.conspiracao_15": "El patrón es claro. Kim está en el centro de todo. Cada caso, cada muerte, cada pista lleva al bar de la esquina.",

    "dormindo.titulo": "INCONSCIENTE",
    "dormindo.texto": "Fuiste derrotado. El sueño se oscurece. Jack está tirado en el callejón, la lluvia lavando la sangre del asfalto.\n\nEn unos minutos, alguien lo encontrará. O tal vez nadie lo haga. Esto es Marelia.",
    "dormindo.acordar": "DESPERTAR",

    "fimscreen.titulo": "FIN DE LA PESADILLA",
    "fimscreen.completo": "Recolectaste suficientes pistas. Kim fue confrontado con todas las evidencias. El sueño termina con claridad — pero los recuerdos permanecen.",
    "fimscreen.fragmentado": "No conseguiste todas las pistas. Kim admite parte de los crímenes, pero escapa parcialmente. El sueño termina con dudas — tal vez haya más por descubrir.",
    "fimscreen.reputacao_label": "reputación total",
    "fimscreen.casos_label": "casos resueltos",
    "fimscreen.fios_label": "Pistas Hilo recolectadas",
    "fimscreen.voltar_mapa": "VOLVER AL MAPA",

    "resolucao.caso_encerrado": "CASO CERRADO",
    "resolucao.novo_fio": "NUEVO HILO",
    "resolucao.voltar_mapa": "VOLVER AL MAPA",
    "resolucao.ver_caderno": "VER CUADERNO",

    "mapa.subtitulo": "Marelia, 1954. El sueño te eligió.",
    "mapa.sem_requisito": "sin requisito",

    "abertura.investigar": "INVESTIGAR",

    "geral.reputacao": "★ {valor}",
    "geral.casos_resolvidos": "{n}/{total}",
    "geral.hp": "HP: {hp}/30",

    // ── Feed ──
    "feed.revisitar": "REVISITAR",
    "feed.investigar": "INVESTIGAR",
    "feed.mensagens": "MENSAJES",
    "feed.stories_vazio": "Aún no se han recolectado pistas.\n\nInvestiga los lugares de los casos para revelar evidencias.",
    "feed.status_reputacao": "REPUTACIÓN",
    "feed.status_casos": "CASOS RESUELTOS",
    "feed.status_nivel": "NIVEL",
    "feed.status_fios": "HILOS DE CONSPIRACIÓN",
    "feed.topbar_nome": "Pesadilla Privada",
    "feed.topbar_sub": "Marelia, 1954 · Nivel {nivel}",
    "feed.loading": "CARGANDO...",
    "feed.caderno_vazio": "\"aún no sé quién es.\npero cada pista conecta un punto con otro.\"",
  }
}

/**
 * Helper: retorna o dicionário para o locale atual.
 * Uso: import { t } from './pp-i18n'; t('pt', 'menu.continuar')
 */
export function t(locale, key, replacements = {}) {
  const dict = PP[locale] || PP.pt
  let text = dict[key]
  if (text === undefined) {
    console.warn(`[PP-i18n] chave não encontrada: "${key}" para locale "${locale}"`)
    return key
  }
  Object.entries(replacements).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v)
  })
  return text
}

export default PP
