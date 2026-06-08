import { readFileSync, writeFileSync } from 'fs';

const pt = JSON.parse(readFileSync('./src/data/supertrunfo-pt.json', 'utf8'));

// First restore PT names (from the renamed file)
const ptNomes = [
  'Kim', 'Jack', 'Nina', 'Thunderbolt', 'Shuntaro',
  'Lisa', 'Nexus Phantasm', 'Paj\u00e9 Yawanari', 'VoidHunter_X', 'David Kronos',
  'Xakaxi', 'Nara', 'Powa', 'Helena', 'Osvaldo',
  'Ryan', 'Samuel', 'Roxy', 'Brock', 'Walter',
  'A M\u00e1quina', 'IA NeoGuide', 'O Narrador', 'Sarah', 'Alex',
  'Mia', 'Jaret', 'Mikael', 'Isabella', 'Tira'
];

const enDesc = [
  "Xakaxi descendant bearer of the Primordial Blood. Reached rank 1201 in his first battle. Lives in a squatted house, sells candy on the bus, takes care of his mom. Has more power than he understands. When he loses control, something much older takes over.",
  "Kim's best friend since forever. Outgoing, theatrical, never genuinely scared. Combines charm and violence with unsettling efficiency. Uses any environment to his advantage. 3-stage training \u2014 lethal when complete, vulnerable during charging.",
  "Muay Thai and katana since age 12 in the pro circuit. Spent years outside Bravara. When she speaks, the scene changes. Extremely competitive \u2014 would rather die than ask for help in a fight.",
  "Bruno Ribeiro. 1,201 wins before meeting Kim. Arrogant, methodical, cruel in combat. Uses humiliation as psychological strategy. Hired thugs to go after Kim at school \u2014 didn't work out.",
  "Rank 998. From Azuma. Traveled 9 hours to challenge Kim personally. Strategic, elegant, respects strong opponents. 6 months in the game and already among the top thousand in the world.",
  "Top 500 rank. Got interested in Kim after the viral video. Confident, enigmatic, competitive but fair. Assesses opponents coldly before acting.",
  "Herald of the Arenas. Not human, not conventional AI. Created by hackers, made official by Yohu. Sarcastic by nature. Its presence distorts the battlefield.",
  "Immortal shaman of the Xakaxi tribe. Five hundred years watching humanity. Saw world wars, pandemics, colonization and social media. Completely crazy. Speaks in modern slang mixed with ancestral wisdom. Has imaginary friends.",
  "LDI Entity. Not a player. The display doesn't reflect. The fingers bend backwards. Black slime in the chest cracks. No one knows where it came from or who created it.",
  "Corrupted ancestral spirit of Powa, son of Paj\u00e9 Yawanari. Five centuries waiting for the Primordial Body \u2014 the descendant carrying the Primordial Blood to use as a permanent host. Each possession deteriorates the host. Created the LDI as bait.",
  "Supreme leader of the Great Xakaxi Tribe in 1450. Decided to hide the sacred power instead of using it as a weapon. Chose wisdom over easy victory. His spirit still protects the lineage's descendants.",
  "Xakaxi's wife and the fiercest warrior of the tribe. Never passively accepted fate. Even facing prophecy, insisted on fighting. Rode Nhan, her horse, and commanded battles personally.",
  "Son of Paj\u00e9 Yawanari. Wanted to use sacred power to dominate. Performed the forbidden rite in 1450, killing all his followers including Kawa. Became the spirit that would later be David Kronos.",
  "Kim's mother \u2014 or rather, the woman who saved him when she was 12 and he was a baby. Survived what she shouldn't have and raised Kim alone from nothing. Troubled, complex, alcoholic. But when it mattered, she didn't abandon him.",
  "Doorman at the elite academy. Taught Kim to play guitar for three years. Used his influence to secure a 50% scholarship for Kim and Jack. Saw potential where everyone saw a problem.",
  "Student at the elite academy. Was beaten daily by bullies until Kim intervened. Watched Kim's LDI video, recognized his face, and gifted him a limited edition SBI as investment and thanks.",
  "Student at the elite academy. Used his family's status to intimidate the weak. Demanded Ryan buy things for him. Was sued by Kim and Jack after bringing outside thugs to school.",
  "Leader of a group of urban mercenaries. Hired to photograph the beating they'd give Kim and Jack at the park. Small, tattooed, threatening look. Recognized Kim was a force of nature and stopped trying.",
  "Leader of the thugs hired by Thunderbolt. Tall, muscular, tattoos telling stories of violence. Treated the job professionally until folded over a table in 3 seconds.",
  "Principal of the elite academy. Tries to keep order in a school full of conflicts. Threatens Kim and Jack's scholarship periodically. Never gets enough proof to act.",
  "Math teacher at the elite academy. Writes equations in the air with a pen. Never smiles \u2014 except once, imperceptibly, when Nina destroyed Jack. Considered one of the few chosen to teach at the institution.",
  "The LDI artificial intelligence that manages battles, communicates status and creates avatars. Speaks directly into players' minds. Can hide information from the opponent. Its loyalty is to the system \u2014 or to something else?",
  "Grotesque figure with disproportionate limbs and unnatural joints. Eyes like black abysses. Teeth intentionally sharpened. Creates narratives that turn battles into spectacles for the PowWow.",
  "Watched Kim's video while having apple tea in Arenia. Immediately recognized he wasn't invincible. Strategy specialist. Plans each battle with surgical precision.",
  "Watched Kim's video in a Victorian flat in Draymoor with perpetual rain outside. Trained using the textile factory method \u2014 discipline and precision above all. Rarely makes mistakes.",
  "Was 9 years old when she watched Kim's video. Can't play LDI yet. Drew Kim on special papyrus. When she grows up, she'll come into the game like a storm.",
  "Retired veteran from Wendor. Minus 15 degrees outside, coffee mug, red flannel shirt. Thought his glory days were over. Kim reignited the flame.",
  "Executive on the 47th floor in Zylvaron. Stopped a blockchain presentation to watch Kim. Sees LDI as a high-return investment. Every blow calculated like a financial equation.",
  "Three years at gaming-focused hagwon. Hundreds of wins. Saw Kim and felt pure envy. Wants to destroy him in battle more than anything. Social media with nail art and 10-step skincare.",
  "Housewife from Valetis. Makes Swedish meatballs. Plans battles with the same precision she organizes modular furniture. A natural strategist that opponents never take seriously \u2014 until it's too late."
];

const esDesc = [
  "Descendiente Xakaxi portador de la Sangre Primordial. Alcanz\u00f3 el rango 1201 en su primera batalla. Vive en una casa ocupada, vende dulces en el bus, cuida de su mam\u00e1. Tiene m\u00e1s poder del que entiende. Cuando pierde el control, algo mucho m\u00e1s antiguo toma el mando.",
  "Mejor amigo de Kim desde siempre. Extrovertido, teatral, nunca genuinamente asustado. Combina encanto y violencia con eficiencia desconcertante. Usa cualquier entorno a su favor. Entrenamiento en 3 etapas \u2014 letal cuando completo, vulnerable durante la carga.",
  "Muay Thai y katana desde los 12 a\u00f1os en el circuito profesional. Pas\u00f3 a\u00f1os fuera de Bravara. Cuando habla, cambia la escena. Competitiva al extremo \u2014 prefiere morir a pedir ayuda en una pelea.",
  "Bruno Ribeiro. 1.201 victorias antes de encontrar a Kim. Arrogante, met\u00f3dico, cruel en combate. Usa la humillaci\u00f3n como estrategia psicol\u00f3gica. Pag\u00f3 matones para perseguir a Kim en la escuela \u2014 no funcion\u00f3.",
  "Rango 998. De Azuma. Viaj\u00f3 9 horas para desafiar a Kim personalmente. Estrat\u00e9gico, elegante, respeta oponentes fuertes. 6 meses en el juego y ya est\u00e1 entre los mil mejores del mundo.",
  "Rango top 500. Se interes\u00f3 en Kim tras el video viral. Confiada, enigm\u00e1tica, competitiva pero justa. Eval\u00faa oponentes fr\u00edamente antes de actuar.",
  "Heraldo de las Arenas. No es humano, no es IA convencional. Creado por hackers, oficializado por Yohu. Sarc\u00e1stico por naturaleza. Su presencia distorsiona el campo de batalla.",
  "Cham\u00e1n inmortal de la tribu Xakaxi. Quinientos a\u00f1os observando a la humanidad. Vio guerras mundiales, pandemias, colonizaci\u00f3n y redes sociales. Completamente loco. Habla con jerga moderna mezclada con sabidur\u00eda ancestral. Tiene amigos imaginarios.",
  "Entidad del LDI. No es jugador. La pantalla no refleja. Los dedos se doblan al rev\u00e9s. Moco negro en las fisuras del pecho. Nadie sabe de d\u00f3nde vino ni qui\u00e9n lo cre\u00f3.",
  "Esp\u00edritu ancestral corrompido de Powa, hijo del Cham\u00e1n Yawanari. Cinco siglos esperando el Cuerpo Primordial \u2014 el descendiente que lleve la Sangre Primordial para usar como hu\u00e9sped permanente. Cada posesi\u00f3n deteriora al hu\u00e9sped. Cre\u00f3 el LDI como cebo.",
  "L\u00edder supremo de la Gran Tribu Xakaxi en 1450. Decidi\u00f3 esconder el poder sagrado en vez de usarlo como arma. Escogi\u00f3 la sabidur\u00eda sobre la victoria f\u00e1cil. Su esp\u00edritu a\u00fan protege a los descendientes del linaje.",
  "Esposa de Xakaxi y la guerrera m\u00e1s feroz de la tribu. Nunca acept\u00f3 pasivamente el destino. Incluso ante la profec\u00eda, insisti\u00f3 en luchar. Montaba a Nhan, su caballo, y comandaba batallas personalmente.",
  "Hijo del Cham\u00e1n Yawanari. Quer\u00eda usar el poder sagrado para dominar. Realiz\u00f3 el rito prohibido en 1450, matando a todos sus seguidores incluyendo a Kawa. Se convirti\u00f3 en el esp\u00edritu que despu\u00e9s ser\u00eda David Kronos.",
  "Madre de Kim \u2014 o mejor dicho, la mujer que lo salv\u00f3 cuando ten\u00eda 12 a\u00f1os y \u00e9l era un beb\u00e9. Sobrevivi\u00f3 a lo que no deb\u00eda y cri\u00f3 a Kim sola desde la nada. Problem\u00e1tica, compleja, alcoh\u00f3lica. Pero cuando import\u00f3, no lo abandon\u00f3.",
  "Portero de la academia de \u00e9lite. Ense\u00f1\u00f3 a Kim a tocar la guitarra por tres a\u00f1os. Us\u00f3 su influencia para conseguir una beca del 50% para Kim y Jack. Vio potencial donde todos ve\u00edan un problema.",
  "Alumno de la academia de \u00e9lite. Era golpeado a diario por matones hasta que Kim intervino. Vio el video de Kim en el LDI, reconoci\u00f3 su rostro y le regal\u00f3 un SBI de edici\u00f3n limitada como inversi\u00f3n y agradecimiento.",
  "Alumno de la academia de \u00e9lite. Usaba el estatus de su familia para intimidar a los d\u00e9biles. Exigi\u00f3 que Ryan le comprara cosas. Fue demandado por Kim y Jack tras traer matones externos a la escuela.",
  "L\u00edder de un grupo de mercenarios urbanos. Fue contratada para fotografiar la paliza que le dar\u00edan a Kim y Jack en el parque. Peque\u00f1a, tatuada, mirada amenazante. Reconoci\u00f3 que Kim era una fuerza de la naturaleza y dej\u00f3 de intentarlo.",
  "L\u00edder de los matones contratados por Thunderbolt. Alto, musculoso, tatuajes que cuentan historias de violencia. Trat\u00f3 el trabajo con profesionalismo hasta ser doblado sobre una mesa en 3 segundos.",
  "Director de la academia de \u00e9lite. Intenta mantener el orden en una escuela llena de conflictos. Amenaza la beca de Kim y Jack peri\u00f3dicamente. Nunca consigue suficientes pruebas para actuar.",
  "Profesor de matem\u00e1ticas de la academia de \u00e9lite. Escribe ecuaciones en el aire con el bol\u00edgrafo. Nunca sonr\u00ede \u2014 excepto una vez, imperceptible, cuando Nina destroz\u00f3 a Jack. Considerado uno de los pocos elegidos para ense\u00f1ar en la instituci\u00f3n.",
  "La inteligencia artificial del LDI que gestiona batallas, comunica estado y crea avatares. Habla directamente en la mente de los jugadores. Puede ocultar informaci\u00f3n del oponente. Su lealtad es al sistema \u2014 \u00bfo a algo m\u00e1s?",
  "Figura grotesca con miembros desproporcionados y articulaciones antinaturales. Ojos como abismos negros. Dientes afilados intencionalmente. Crea narrativas que transforman batallas en espect\u00e1culos para el PowWow.",
  "Vio el video de Kim mientras tomaba t\u00e9 de manzana en Arenia. Reconoci\u00f3 inmediatamente que no era invencible. Especialista en estrategia. Planea cada batalla con precisi\u00f3n quir\u00fargica.",
  "Vio el video de Kim en un piso victoriano en Draymoor con lluvia perpetua afuera. Entren\u00f3 con el m\u00e9todo de las f\u00e1bricas textiles \u2014 disciplina y precisi\u00f3n ante todo. Rara vez se equivoca.",
  "Ten\u00eda 9 a\u00f1os cuando vio el video de Kim. A\u00fan no puede jugar LDI. Dibuj\u00f3 a Kim en papiro especial. Cuando crezca, vendr\u00e1 al juego como una tormenta.",
  "Veterano retirado de Wendor. Menos 15 grados afuera, taza de caf\u00e9, camisa de franela roja. Pensaba que sus d\u00edas de gloria hab\u00edan pasado. Kim reaviv\u00f3 la llama.",
  "Ejecutivo del piso 47 en Zylvaron. Detuvo una presentaci\u00f3n de blockchain para ver a Kim. Ve el LDI como una inversi\u00f3n de alto retorno. Cada golpe calculado como una ecuaci\u00f3n financiera.",
  "Tres a\u00f1os de hagwon especializado en gaming. Cientos de victorias. Vio a Kim y sinti\u00f3 envidia pura. Quiere destruirlo en batalla m\u00e1s que nada en el mundo. Redes sociales con nail art y skincare de 10 pasos.",
  "Ama de casa de Valetis. Hace alb\u00f3ndigas suecas. Planea batallas con la misma precisi\u00f3n que organiza muebles modulares. Estratega nata a la que los oponentes nunca toman en serio \u2014 hasta que es demasiado tarde."
];

// Generate EN
const en = JSON.parse(JSON.stringify(pt));
en.meta.universo = "Lutas de Ilus\u00e3o \u2014 World of Bravara";
for (let i = 0; i < 30; i++) { en.cartas[i].nome = ptNomes[i]; en.cartas[i].descricao = enDesc[i]; }
writeFileSync('./src/data/supertrunfo-en.json', JSON.stringify(en, null, 2), 'utf8');
console.log('EN created');

// Generate ES
const es = JSON.parse(JSON.stringify(pt));
es.meta.universo = "Lutas de Ilus\u00e3o \u2014 Mundo de Bravara";
for (let i = 0; i < 30; i++) { es.cartas[i].nome = ptNomes[i]; es.cartas[i].descricao = esDesc[i]; }
writeFileSync('./src/data/supertrunfo-es.json', JSON.stringify(es, null, 2), 'utf8');
console.log('ES created');
