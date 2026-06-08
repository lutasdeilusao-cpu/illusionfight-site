$pt = Get-Content src\data\supertrunfo-pt.json -Raw -Encoding UTF8 | ConvertFrom-Json

# ── Traduções EN ──
$enDesc = @(
  "Xakaxi descendant bearer of the Primordial Blood. Reached rank 1201 in his first battle. Lives in a squatted house, sells candy on the bus, takes care of his mom. Has more power than he understands. When he loses control, something much older takes over.",
  "Kim's best friend since forever. Outgoing, theatrical, never genuinely scared. Combines charm and violence with unsettling efficiency. Uses any environment to his advantage. 3-stage training — lethal when complete, vulnerable during charging.",
  "Muay Thai and katana since age 12 in the pro circuit. Spent years outside Bravara. When she speaks, the scene changes. Extremely competitive — would rather die than ask for help in a fight.",
  "Bruno Ribeiro. 1,201 wins before meeting Kim. Arrogant, methodical, cruel in combat. Uses humiliation as psychological strategy. Hired thugs to go after Kim at school — didn't work out.",
  "Rank 998. From Azuma. Traveled 9 hours to challenge Kim personally. Strategic, elegant, respects strong opponents. 6 months in the game and already among the top thousand in the world.",
  "Top 500 rank. Got interested in Kim after the viral video. Confident, enigmatic, competitive but fair. Assesses opponents coldly before acting.",
  "Herald of the Arenas. Not human, not conventional AI. Created by hackers, made official by Yohu. Sarcastic by nature. Its presence distorts the battlefield.",
  "Immortal shaman of the Xakaxi tribe. Five hundred years watching humanity. Saw world wars, pandemics, colonization and social media. Completely crazy. Speaks in modern slang mixed with ancestral wisdom. Has imaginary friends.",
  "LDI Entity. Not a player. The display doesn't reflect. The fingers bend backwards. Black slime in the chest cracks. No one knows where it came from or who created it.",
  "Corrupted ancestral spirit of Powa, son of Pajé Yawanari. Five centuries waiting for the Primordial Body — the descendant carrying the Primordial Blood to use as a permanent host. Each possession deteriorates the host. Created the LDI as bait.",
  "Supreme leader of the Great Xakaxi Tribe in 1450. Decided to hide the sacred power instead of using it as a weapon. Chose wisdom over easy victory. His spirit still protects the lineage's descendants.",
  "Xakaxi's wife and the fiercest warrior of the tribe. Never passively accepted fate. Even facing prophecy, insisted on fighting. Rode Nhan, her horse, and commanded battles personally.",
  "Son of Pajé Yawanari. Wanted to use sacred power to dominate. Performed the forbidden rite in 1450, killing all his followers including Kawa. Became the spirit that would later be David Kronos.",
  "Kim's mother — or rather, the woman who saved him when she was 12 and he was a baby. Survived what she shouldn't have and raised Kim alone from nothing. Troubled, complex, alcoholic. But when it mattered, she didn't abandon him.",
  "Doorman at the elite academy. Taught Kim to play guitar for three years. Used his influence to secure a 50% scholarship for Kim and Jack. Saw potential where everyone saw a problem.",
  "Student at the elite academy. Was beaten daily by bullies until Kim intervened. Watched Kim's LDI video, recognized his face, and gifted him a limited edition SBI as investment and thanks.",
  "Student at the elite academy. Used his family's status to intimidate the weak. Demanded Ryan buy things for him. Was sued by Kim and Jack after bringing outside thugs to school.",
  "Leader of a group of urban mercenaries. Hired to photograph the beating they'd give Kim and Jack at the park. Small, tattooed, threatening look. Recognized Kim was a force of nature and stopped trying.",
  "Leader of the thugs hired by Thunderbolt. Tall, muscular, tattoos telling stories of violence. Treated the job professionally until folded over a table in 3 seconds.",
  "Principal of the elite academy. Tries to keep order in a school full of conflicts. Threatens Kim and Jack's scholarship periodically. Never gets enough proof to act.",
  "Math teacher at the elite academy. Writes equations in the air with a pen. Never smiles — except once, imperceptibly, when Nina destroyed Jack. Considered one of the few chosen to teach at the institution.",
  "The LDI artificial intelligence that manages battles, communicates status and creates avatars. Speaks directly into players' minds. Can hide information from the opponent. Its loyalty is to the system — or to something else?",
  "Grotesque figure with disproportionate limbs and unnatural joints. Eyes like black abysses. Teeth intentionally sharpened. Creates narratives that turn battles into spectacles for the PowWow.",
  "Watched Kim's video while having apple tea in Arenia. Immediately recognized he wasn't invincible. Strategy specialist. Plans each battle with surgical precision.",
  "Watched Kim's video in a Victorian flat in Draymoor with perpetual rain outside. Trained using the textile factory method — discipline and precision above all. Rarely makes mistakes.",
  "Was 9 years old when she watched Kim's video. Can't play LDI yet. Drew Kim on special papyrus. When she grows up, she'll come into the game like a storm.",
  "Retired veteran from Wendor. Minus 15 degrees outside, coffee mug, red flannel shirt. Thought his glory days were over. Kim reignited the flame.",
  "Executive on the 47th floor in Zylvaron. Stopped a blockchain presentation to watch Kim. Sees LDI as a high-return investment. Every blow calculated like a financial equation.",
  "Three years at gaming-focused hagwon. Hundreds of wins. Saw Kim and felt pure envy. Wants to destroy him in battle more than anything. Social media with nail art and 10-step skincare.",
  "Housewife from Valetis. Makes Swedish meatballs. Plans battles with the same precision she organizes modular furniture. A natural strategist that opponents never take seriously — until it's too late."
)

$pt.meta.universo = "Lutas de Ilusão — World of Bravara"
for ($i = 0; $i -lt 30; $i++) { $pt.cartas[$i].descricao = $enDesc[$i] }
$pt | ConvertTo-Json -Depth 10 | Set-Content src\data\supertrunfo-en.json -Encoding UTF8
Write-Host '✅ EN created'

# ── Traduções ES ──
$pt.meta.universo = "Lutas de Ilusão — Mundo de Bravara"
$esDesc = @(
  "Descendiente Xakaxi portador de la Sangre Primordial. Alcanzó el rango 1201 en su primera batalla. Vive en una casa ocupada, vende dulces en el bus, cuida de su mamá. Tiene más poder del que entiende. Cuando pierde el control, algo mucho más antiguo toma el mando.",
  "Mejor amigo de Kim desde siempre. Extrovertido, teatral, nunca genuinamente asustado. Combina encanto y violencia con eficiencia desconcertante. Usa cualquier entorno a su favor. Entrenamiento en 3 etapas — letal cuando completo, vulnerable durante la carga.",
  "Muay Thai y katana desde los 12 años en el circuito profesional. Pasó años fuera de Bravara. Cuando habla, cambia la escena. Competitiva al extremo — prefiere morir a pedir ayuda en una pelea.",
  "Bruno Ribeiro. 1.201 victorias antes de encontrar a Kim. Arrogante, metódico, cruel en combate. Usa la humillación como estrategia psicológica. Pagó matones para perseguir a Kim en la escuela — no funcionó.",
  "Rango 998. De Azuma. Viajó 9 horas para desafiar a Kim personalmente. Estratégico, elegante, respeta oponentes fuertes. 6 meses en el juego y ya está entre los mil mejores del mundo.",
  "Rango top 500. Se interesó en Kim tras el video viral. Confiada, enigmática, competitiva pero justa. Evalúa oponentes fríamente antes de actuar.",
  "Heraldo de las Arenas. No es humano, no es IA convencional. Creado por hackers, oficializado por Yohu. Sarcástico por naturaleza. Su presencia distorsiona el campo de batalla.",
  "Chamán inmortal de la tribu Xakaxi. Quinientos años observando a la humanidad. Vio guerras mundiales, pandemias, colonización y redes sociales. Completamente loco. Habla con jerga moderna mezclada con sabiduría ancestral. Tiene amigos imaginarios.",
  "Entidad del LDI. No es jugador. La pantalla no refleja. Los dedos se doblan al revés. Moco negro en las fisuras del pecho. Nadie sabe de dónde vino ni quién lo creó.",
  "Espíritu ancestral corrompido de Powa, hijo del Chamán Yawanari. Cinco siglos esperando el Cuerpo Primordial — el descendiente que lleve la Sangre Primordial para usar como huésped permanente. Cada posesión deteriora al huésped. Creó el LDI como cebo.",
  "Líder supremo de la Gran Tribu Xakaxi en 1450. Decidió esconder el poder sagrado en vez de usarlo como arma. Escogió la sabiduría sobre la victoria fácil. Su espíritu aún protege a los descendientes del linaje.",
  "Esposa de Xakaxi y la guerrera más feroz de la tribu. Nunca aceptó pasivamente el destino. Incluso ante la profecía, insistió en luchar. Montaba a Nhan, su caballo, y comandaba batallas personalmente.",
  "Hijo del Chamán Yawanari. Quería usar el poder sagrado para dominar. Realizó el rito prohibido en 1450, matando a todos sus seguidores incluyendo a Kawa. Se convirtió en el espíritu que después sería David Kronos.",
  "Madre de Kim — o mejor dicho, la mujer que lo salvó cuando tenía 12 años y él era un bebé. Sobrevivió a lo que no debía y crió a Kim sola desde la nada. Problemática, compleja, alcohólica. Pero cuando importó, no lo abandonó.",
  "Portero de la academia de élite. Enseñó a Kim a tocar la guitarra por tres años. Usó su influencia para conseguir una beca del 50% para Kim y Jack. Vio potencial donde todos veían un problema.",
  "Alumno de la academia de élite. Era golpeado a diario por matones hasta que Kim intervino. Vio el video de Kim en el LDI, reconoció su rostro y le regaló un SBI de edición limitada como inversión y agradecimiento.",
  "Alumno de la academia de élite. Usaba el estatus de su familia para intimidar a los débiles. Exigió que Ryan le comprara cosas. Fue demandado por Kim y Jack tras traer matones externos a la escuela.",
  "Líder de un grupo de mercenarios urbanos. Fue contratada para fotografiar la paliza que le darían a Kim y Jack en el parque. Pequeña, tatuada, mirada amenazante. Reconoció que Kim era una fuerza de la naturaleza y dejó de intentarlo.",
  "Líder de los matones contratados por Thunderbolt. Alto, musculoso, tatuajes que cuentan historias de violencia. Trató el trabajo con profesionalismo hasta ser doblado sobre una mesa en 3 segundos.",
  "Director de la academia de élite. Intenta mantener el orden en una escuela llena de conflictos. Amenaza la beca de Kim y Jack periódicamente. Nunca consigue suficientes pruebas para actuar.",
  "Profesor de matemáticas de la academia de élite. Escribe ecuaciones en el aire con el bolígrafo. Nunca sonríe — excepto una vez, imperceptible, cuando Nina destrozó a Jack. Considerado uno de los pocos elegidos para enseñar en la institución.",
  "La inteligencia artificial del LDI que gestiona batallas, comunica estado y crea avatares. Habla directamente en la mente de los jugadores. Puede ocultar información del oponente. Su lealtad es al sistema — ¿o a algo más?",
  "Figura grotesca con miembros desproporcionados y articulaciones antinaturales. Ojos como abismos negros. Dientes afilados intencionalmente. Crea narrativas que transforman batallas en espectáculos para el PowWow.",
  "Vio el video de Kim mientras tomaba té de manzana en Arenia. Reconoció inmediatamente que no era invencible. Especialista en estrategia. Planea cada batalla con precisión quirúrgica.",
  "Vio el video de Kim en un piso victoriano en Draymoor con lluvia perpetua afuera. Entrenó con el método de las fábricas textiles — disciplina y precisión ante todo. Rara vez se equivoca.",
  "Tenía 9 años cuando vio el video de Kim. Aún no puede jugar LDI. Dibujó a Kim en papiro especial. Cuando crezca, vendrá al juego como una tormenta.",
  "Veterano retirado de Wendor. Menos 15 grados afuera, taza de café, camisa de franela roja. Pensaba que sus días de gloria habían pasado. Kim reavivó la llama.",
  "Ejecutivo del piso 47 en Zylvaron. Detuvo una presentación de blockchain para ver a Kim. Ve el LDI como una inversión de alto retorno. Cada golpe calculado como una ecuación financiera.",
  "Tres años de hagwon especializado en gaming. Cientos de victorias. Vio a Kim y sintió envidia pura. Quiere destruirlo en batalla más que nada en el mundo. Redes sociales con nail art y skincare de 10 pasos.",
  "Ama de casa de Valetis. Hace albóndigas suecas. Planea batallas con la misma precisión que organiza muebles modulares. Estratega nata a la que los oponentes nunca toman en serio — hasta que es demasiado tarde."
)

for ($i = 0; $i -lt 30; $i++) { $pt.cartas[$i].descricao = $esDesc[$i] }
$pt | ConvertTo-Json -Depth 10 | Set-Content src\data\supertrunfo-es.json -Encoding UTF8
Write-Host '✅ ES created'
