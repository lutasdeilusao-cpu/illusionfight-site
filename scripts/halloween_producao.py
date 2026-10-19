"""Halloween loop 1: prepare English prompts and reuse the existing serial Codex engine.
Usage: python scripts/halloween_producao.py preparar|rodar|status
One image at a time; 300 seconds between pages; materials have no interval.
"""
import importlib.util
import json
import msvcrt
import os
from pathlib import Path
import re
import subprocess
import sys
import time
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
ROOT = REPO.parent / 'ESPECIAIS' / 'presos'
PROMPTS = ROOT / 'prompts' / 'loop1'
PAGES = ROOT / 'paginas' / 'loop1'
STATE = ROOT / 'producao' / 'loop1'
DOC = REPO / 'docs/WEBSHARD/Especiais/HALLOWEEN_ROTEIRO_OFICIAL.md'
ENGINE = REPO.parent / 'MUNDO DAS SOMBRAS/WEBSHARD/scripts/fila_v2.py'
# Columns: page, source, attached identity/environment aliases, continuity pages, staging.
PLAN = '''
02|C|Kim Jack Nina devices hall|01|Two sequential fixed CCTV feeds. CAM 01 ENTRADA: Kim, Jack and Nina enter the Roman costume party; Nina visibly carries and operates the analog camcorder. CAM 02 CORREDOR OESTE: later, Kim moves his red drape aside at the hall doorway, Jack immediately behind him, Nina following. Invent entrance and west corridor in the same mansion architecture; these are not the technical corridor. No named person duplicated in two locations at the same instant. Narration is a compact caption, not a broad panel separator. No visibly speaking mouths here.
03|A|Kim Jack hall|02|Nina operates A behind Kim at the hall threshold. Upper panel finishes Kim's drape-clearing gesture from the reverse recorded angle, Jack replies beside him. Lower panel Nina turns slightly to decorations with Jack still at the edge. Small jagged cracked-glass shard of cloth and bronze, editorial close detail. Nina's voice is off-camera; do not show her externally. Kim points toward the buffet.
04|D|Freddy gang lounge||D is supported, stationary, aimed at Fred in the east lounge. Two moments on the same axis: blond Fred with existing left-eye bruise poses to his own lens and counts; redhead Michael intrudes from the side before he finishes. Opening behind them connects acoustically with hall, but trio stays in the hall, not lounge. This is simultaneous with page03. Compact narration caption. No shard.
05|D|Freddy Brock gang lounge|04|Same supported D axis. Fred tries his pose again; stocky afro-haired Andre crosses behind with Brock and checks two blank cinema tickets. Small cracked-glass shard of those tickets already visible beside his real costume, no printed movie names. Fred is irritated, Andre has an ordinary appointment, Brock promises they will leave in time. Keep the tickets' shape for page46.
06|D|gang lounge masks|05|Fred picks D up: fingers at image edge and lens rises, do not depict him externally holding his own camera. Two panels: pickup then bronze-masked server arrives through service passage with tray and activates door sensor with forearm. Door opens; Anderson speaks from within lounge. Group remains there. Fix sensor side and service-return passage for later loops. No shard.
07|A|Kim buffet|03|Nina films Kim eating beside a living unnamed adult at the side buffet. Two panels: stranger offers grapes; he briefly coughs on one and Kim slides water toward him, he recovers and signals he is fine. Fix grape bowl and his place at counter edge. Small cracked-glass hand-and-bowl shard. No collapse, death or supernatural clue.
08|C|Kronos Kim Jack Nina Freddy Brock gang hall lounge devices|01 04|Two fixed CCTV feeds at identical timestamp: CAM 03 SALAO shows human Kronos arriving at announcement area as staff clear space, Nina finishing her turn away from buffet; CAM 05 LOUNGE shows Fred turning D toward the connecting opening. Same established rooms and separate groups. No audible dialogue, no mouths visibly speaking in this establishing moment. No shards.
09|A|Kronos Jack hall|03|Nina films human Kronos requesting attention in the hall. Two handheld frames on one axis; second includes Jack's reaction at edge without an external camera angle. Kronos calmly announces 100 guests and nine participants. No shard, no laboratory yet.
10|D|Brock gang lounge|06|Fred's handheld D records Jason's response to prize announcement heard through lounge opening; Brock glances at Andre. Second panel small physical reframing by Fred, who remains off-camera. Kronos' voice is offscreen from hall, not a second visible body. No shard, no invented money amount.
11|A|Kim Jack buffet|07|Kim stops chewing at the word prize; Jack notices and teases, then Kim answers. Two close action moments. The same unnamed man from page07 is alive in partial background at the same buffet position. No new crowd identity in his place.
12|A|Kronos hall|09|One useful medium panel of human Kronos pointing toward technical access, not opening laboratory yet. He explains the other91 watch through their SBIs. Do not cram91 countable people into the image; focus face and pointing hand.
13|A|Jack hall devices|11|Nina hands A to Jack without changing source. Upper frame records Jack reaching toward lens; lower frame tilts downward as he receives it, wrist strap slides onto his wrist. No external image of Nina before handoff. Keep camera object form consistent. No shard.
14|C|Kim Jack Nina Freddy Brock gang hall corridor devices|08|One fixed CAM03 SALAO frame: both established groups converge toward technical corridor, Jack carries A with wrist strap, Fred carries D, masked attendant indicates route. Stranger remains at buffet outside selected nine. Do not line up nine portrait faces; geography and camera custody are the point. No visibly speaking mouths.
15|A|Nina corridor|13|Jack now operates A while walking along technical corridor. Two nearby moments: Nina notices Jack's uncomfortable Roman drape without staring at lens, then adjusts a fabric fold entering edge of his recording. Jack speaks from behind camera. Nina is visible because operator changed; do not depict Jack holding A externally.
16|D|Brock gang corridor|10|Fred films ahead in technical access. Two panels: emo-fringe Anderson asks him to move; Jason glances toward prize announcement direction, stops joking when Brock looks at him. Keep motion into same corridor. No camera handback shown here; next D page records it clearly.
17|D|Jack Nina gang corridor devices|16|Two quick action panels. Behind the foreground action Jack visibly returns analog A to Nina. Redhead Michael catches foot on a low cable beside fixed door jamb, almost falls; bald Black Jason catches his costume and continues. Small cracked-glass shard of shoe/cable on same floor. Fix obstacle on the same side of jamb for future loops. Do not stretch gag beyond this page.
18|A|Jack lab devices|15|Nina again operates A entering laboratory. One functional establishing panel shows exactly nine SBI chairs, layout5+4 from reference, service route and side table in foreground. Approach the table. Jack visible at edge answers Nina off-camera. No tenth chair or fantasy teleport door.
19|D|Brock lab devices|16|Fred holds D near laboratory device-link station. Two panels lens lowers to link point and his hand confirms connection. Everyone awake. One small readable interface label REGISTRO VINCULADO. Fred speaks off-camera; Brock answers from nearby. Establish virtual capture permission, not physical camera teleportation.
20|C|Kim Jack Nina Freddy Brock gang masks lab devices|14|One fixed CAM06 LABORATORIO frame: Fred docks physical D in established support after linking; Nina still carries A, staff indicate chairs. Exactly nine participants and nine stations in same5+4 room. No parade of full-body portraits. No visibly speaking mouths.
21|A|Nina gang lab devices|18|Nina physically places A on side table. First panel tilts during placement; second is stationary and includes Andre's fixed chair, his hand and costume pocket within recorded field. Nina then enters side of her own supported image and goes to chair. Jack voice offscreen. Lock this low table axis for all subsequent A laboratory pages. No autonomous closeup or zoom later.
22|A|Brock gang masks lab|21|Same stationary table field in two instants: Andre tests a strap; Brock reassures him within microphone range, partially offscreen if necessary. Masked attendant closes connector. CLAC is captured sound, not narration. No advanced pain or displaced chair.
23|C|Kim Jack Nina Freddy Brock gang masks lab devices|20|One fixed CAM06 frame: last helmets connected, exactly9 participants remain, A visible on table, D remains docked. Technical door closes. This precedes a deliberate loading ellipse. No visibly speaking mouths, no virtual arena in physical laboratory.
24|D|Brock gang cells devices||Virtual D resumes in Fred's same grip inside cell B. Two moments: camera representation raised, Brock and Jason wait beside gateB; gate opens admitting hot daylight. Device is virtual capture, real D remains in lab. No view inside cellsA/C. Fred speaks off-camera. No VHS.
25|D|Kim Jack Nina arena|24|Fred exits gateB, its jamb still at edge while he turns. Second panel gateA opens and Kim Jack Nina emerge, seen from outside only after Fred can see it. Same arena daylight and floor levels. No overhead omniscient shot.
26|D|Brock gang arena|25|GateC opens; stocky Andre, emo Anderson and redhead Michael emerge. Brock raises his hand toward Andre who approaches. Two panels and a small subordinate cracked-glass shard of Brock's beckoning hand. Exactly three cells, three groups of three.
27|D|Nina zombies arena|26|One functional wider frame establishes arena floor, gates and upper audience tiers in harsh daylight; crowd has undead faces from collective zombie sheet, not living party guests.91 spectators as narrative count, use natural distinct clusters without cloning faces. Nina at near edge reacts; Fred's off-camera voice seeks views. Do not repeat panorama afterward.
28|D|deadking arena zombies|27|One upward recorded view toward raised imperial balcony. Kronos is unmistakably the decayed zombie Caesar, striking undead king from his dedicated sheet, never human mansion Kronos here. Upper-tier authority, no throne on floor. Small ceremonial20:00 on sundial display only. He invites challengers. Daylight, photographically real, no video-game render.
29|D|Brock gang arena|26|Fred turns down to group: Andre volunteers with raised hand, Brock hesitates, Andre smiles and shrugs about cinema. Two panels at body/face action scale; no flashback to sister and no tickets transferred from real clothes into virtual arena.
30|D|Jack Kim gang arena|29|Jack steps forward as Andre's opponent; Kim watches unconcerned. Fred physically steps back enough to frame both contenders. Two medium action frames, no new panorama; friendly apparent game. Jack promises gentle contact.
31|D|Nina Jack arena|30|One panel: Nina near Fred's edge almost raises her hand toward Jack; he already heads into center. Her hesitation is small, not supernatural foreknowledge. Keep actual shared space, no privileged external closeup.
32|D|gang arena|30|Two panels from Fred at sidelines: Michael offers his reaction to camera, Anderson pulls him aside so the fight remains visible deeper in field. Fix their side of arena for later laughter/reaction. No huge shot or physical source switch.
33|D|Jack gang arena|30|Two waist-up action panels of Jack and Andre adjusting distance, Andre playfully drops guard. Hands and expressions drive action, do not add another blow or crowd panorama. Contenders same costumes and relative positions.
34|D|Jack gang arena|33|Two moments of ONE light playful tap: contact then Andre's exaggerated laughing fall. Tiny subordinate cracked-glass shard shows same fist touching, not an additional strike. TOC is soft. Do not make blow forceful enough to explain later danger. Floor is solid pale arena stone with superficial grit, no sand dune.
35|D|Jack gang cables arena|34|Two panels: Andre puts hand onto gritty stone to get up; one organic technological cable catches his arm and blocks that action. Fred is surprised, not perfectly positioned for preplanned closeup. Jack remains a few steps away. Cable anatomy follows reference; no exposed injury.
36|D|Jack gang cables arena|35|Two panels of same positions: further cables hold Andre; expression changes from confusion to genuine pain. Jack freezes nearby, hand half raised. Focus tension, grip, face and reactions, not wounds. Andre's escalating lines stay separate clear balloons.
37|D|Kim gang cables arena|36|Two panels: Kim crosses close to lens as Fred abruptly turns, his red cloak streaks in brief motivated motion blur; lower panel recovers Andre's SAME arm and Kim crouching on same side. Blur may briefly obscure detail but cannot conceal Kim's entrance or move anyone. Kim shouts to release him.
38|A|gang masks lab cables|21|Parallel real-world cause of page37. Exactly same fixed A table field from page21: masked worker connects cable at corresponding region of Andre's real arm, his hand contracts. Two instants, no self-reframing/zoom. Only CLIC physical sound; no arena shouts leak into room. Keep9 physical bodies in original places, mostly outside focus.
39|D|Kim Brock gang arena|37|Two panels: Brock and Jason reach side OPPOSITE Kim and pull same cable bundle; Andre strains with them. Preserve hands and rescuers' sides. No extra helpers. Brock initially reassures that it is a game, Kim demands shutdown. Cable form preserved by previous page reference.
40|D|gang arena|39|Fred briefly turns to Michael and Anderson at established sidelines. Two expression moments: they start laughing, then laughter stops at Andre's offscreen denial. No blur over the change. Only Michael's and offscreen Andre's listed lines, no extra joke.
41|D|Jack Nina arena|40|Two panels: Jack stares at his own hand in guilt; Nina reaches him and pulls his shoulder to act. Kim Brock Jason continue rescue at same side offscreen. No change of operator or impossible additional camera. Nina counters guilt without explaining technology.
42|A|gang masks lab cables|38|Same stationary A axis from page38: Andre convulses in his exact chair; worker steadies station methodically rather than comforting him. Two moments of one corresponding procedure. No arena voices, no printed new SFX, no self-moving camera. Keep chair bases/table geometry fixed.
43|S|Kim Brock arena cables|39|Andre's first subjective POV, one organic eye-aperture panel, no HUD, no image of his own face. Low sightline with Kim and Brock's hands entering to free him from same bundle. His cold thought is distinct from Brock's heard speech. No childhood flashback or knowledge of physical lab.
44|D|Kim Brock gang arena|41|Two panels: frightened Fred begins to lower D toward gritty stone; Kim remains in recorded field and lifts face toward Fred to demand continued recording. Fred recovers lens height. Camera does not hit ground, no miraculous lens cleanup. Andre and rescuers maintain prior positions.
45|S|Brock arena cables|43|Two subjective instants from Andre: Brock close and imperfectly composed; peripheral focus begins failing as Andre tries to mention sister. No image of his own face, no REC or technical UI. Tickets remain in real costume in lab, never in virtual world.
46|A|gang masks lab|38 05|One fixed A laboratory frame: Andre's real hand relaxes, the SAME cinema tickets from page05 slip visibly beside his costume within table camera field established in21/38. No virtual arena view. Tiny glass shard only enlarges tickets actually visible in parent field, no invented printing. No dialogue, no new panorama or camera motion.
47|S|Kim Brock arena|45|Two subjective moments: Kim still tries to free Andre; organic field closes until nearly nothing remains. His final thought appears once, not duplicated by physical cameras. No movement blur, running, HUD or objective image of his own body.
48|D|Kim Brock gang Nina Jack arena|44|One recorded medium action frame: Andre motionless; Kim still holds cable bundle, Brock cannot release friend's hand. Fred keeps D slightly lowered. Nina and Jack stay on established side. Kim asks Andre's name once. Outcome visible without gore or another repeated pulling attempt.
49|C|masks lab devices|23|Two fixed CAM06 moments: staff unlock and roll Andre's chair with motionless body away through service route, leaving its empty base. Other8 stations and physical occupants remain in exact places. A on table, D docked. No speaking mouths or audible lines. Do not depict Andre alive again or compact lab.
50|C|lab|49|One same CAM06 frame: technical image shutdown partially obstructs feed, removed-chair area still recognizable before closure. Only literal DELETE interface plus existing fixed CCTV HUD. No dialogue, NO SOUND balloon not needed because nobody speaks. Erasure is this feed only; A continues recording.
51|A|hall devices lab|21|Two recorded frames: masked worker's hand enters edge as A is physically collected from table and tilted, then elliptical cut during carry to hall clock completing reset to20h, hands at RomanVIII/XII. Operator remains behind lens, never external floating camera. Analog timecode advances to01:12:00, does NOT reset. Clock face uses Roman numerals, no extra numeric20:00 caption. No dialogue. This ends launch1, not page52.
'''
REFS = {p.stem: 'Personagens/' + p.name for p in (ROOT / 'Personagens').glob('*') if p.is_file()}
REFS.update(hall=REFS['SalaoFesta'], lab=REFS['SalaCadeirasNove'],
            arena=REFS['ArenaColiseu'], cells=REFS['CelasColiseu'],
            masks=REFS['Mascarados'], cables=REFS['CabosVIdeosTentaculos'],
            zombies=REFS['PlateiaZumbi'], deadking=REFS['KronosCesarDecaido'])
REFS['gang'] = next(v for k, v in REFS.items() if k.startswith('Capangas-'))
REFS['devices'] = next(v for k, v in REFS.items() if k.startswith('Relogio-Camera'))
for k, filename in [('lounge', 'LoungeLeste'), ('buffet', 'Buffet'), ('corridor', 'CorredorTecnico')]:
    REFS[k] = 'Personagens/' + filename + '.png'
MATERIALS = {
    'lounge': ('hall', 'East lounge adjoining the main hall through one wide acoustic opening. Match its mansion materials and architecture. Small Roman-costume party conversation room, low sofas, a sideboard at chest height suitable for supported camera aiming toward sofa and entering guests. Separate sensor-operated service door on right wall leads to service passage returning to west corridor; fixed sensor on right jamb. Do not place main hall furniture or main staircase inside lounge.'),
    'buffet': ('hall', 'Side buffet COUNTER within the SAME main hall, not another dining room. Keep bar, stairs and balcony in correct hall directions. Grapes in shallow bronze bowl on right end of buffet, water jug and clear goblets immediately left. Reserve left counter edge for living unnamed adult guest. Food scale plausible. No characters yet.'),
    'corridor': ('hall lab', 'Technical corridor connecting SAME mansion hall to SAME nine-chair SBI laboratory. One straight route and a visible circulation/stair fork, laboratory door at far end. Low dark cable crosses near RIGHT laboratory jamb at ankle height, fixed to that wall. Clearly different from entrance west corridor. Match black stone, bronze fittings, Roman details and technical equipment of both references. No added secret passage. No characters.')
}
TIMES = {2: -30, 3: 0, 4: 5, 5: 15, 6: 25, 7: 40, 8: 775,
         9: 780, 10: 788, 11: 792, 12: 796, 13: 805, 14: 810,
         15: 820, 16: 830, 17: 840, 18: 870, 19: 885, 20: 900,
         21: 910, 22: 920, 23: 930, 24: 2160, 25: 2165, 26: 2170,
         27: 2180, 28: 2190, 29: 2195, 30: 2200, 31: 2203,
         32: 2205, 33: 2208, 34: 2211, 35: 2214, 36: 2217,
         37: 2220, 38: 2220, 39: 2224, 40: 2228, 41: 2232,
         42: 2232, 43: 2236, 44: 2240, 45: 2244, 46: 2244,
         47: 2248, 48: 2250, 49: 2340, 50: 2355, 51: 4320}
COMMON = '''Create one finished photographic WEB SHARD narrative page, 960 x 1637 px, full bleed, extreme natural photographic realism, NOT illustration, anime or game rendering. Usually TWO large action panels; one only where staging explicitly says one. Never more than three. ALL panel cuts diagonal, slopes MAY differ. Dividers are a VERY THIN 1-3px dark optical-fiber contour with restrained glint, NOT a wide band, black gutter, smoke, static strip or bulky cable border. Page01's wide narrated seam is a one-page exception, do not copy it. Captions occupy compact quiet image area without widening separators. Small shards when specified are jagged cracked GLASS overlays of ONE detail, about15-25% width, not additional full scenes; editorial close angles beyond recorded lens angle ARE allowed inside shards. Main panels respect physical source. Focus faces, hands and action, medium/close rather than full bodies or repeated panoramas. Essential lettering/faces inside x100-860 y80-1557, no blank margins. White speech balloons, large condensed bold uppercase type, short lines, target40-48px, comfortable at phone width. No speaker-name labels printed. Exact Brazilian Portuguese text below, accents intact, only once, no added narration. Put tails on correct speaker; offscreen voices point toward actual operator/source. Thoughts distinct and tailless. If text is dense, allow more balloon space instead of shrinking type. Natural anatomy, no extra hands, no duplicated faces.
ATTACHED REFERENCES: identify by exact FILENAME listed below, NEVER by upload order. Character sheets govern identity/costume, environment sheets govern floor plan on LEFT and two photographic perspectives on RIGHT; do NOT reproduce board collage in narrative. Previous pages govern props, position, handedness and marks, not source effects when source changes. Do not copy their words. Living extras have varied skin tones, ethnicities, hair including Black/white/blond/redhead, ages and body types. Different simultaneous rooms have DIFFERENT extras, no cloned person at same time. Main cast never replaced by extras. Kim black messy hair brown/indigenous face red cloak bronze armor; Jack darker skin GREEN dreads light tunic burgundy drape; Nina pink ponytail cream/pink Roman dress; Fred blond LEFT-eye bruise white/gold; Brock bald Black imposing burgundy drape. Shared Capangas sheet left-to-right: Jason large bald Black man, Michael redhead scar, Anderson black emo fringe, Andre stocky afro. Brock is NOT on that sheet. Keep all Roman costumes exactly; human Kronos only in mansion, zombie Caesar ONLY in virtual arena. Device sheet: analog on LEFT has eyepiece NO flip LCD; digital center has flip LCD, clock on right.
Voice text/outline colors only in COLOR feeds: Kim#1E6FE0, Jack#22C55E, Nina#B82E69, Fred#C9A227, Brock#8B1E1E, Andre#9A4A16, Jason#6D28A6, Michael#155E63, Anderson#4B5563, Kronos#4B5058, stranger#6B543A. Dark stroke where needed, one font, white balloons. CCTV always monochrome including lettering.
'''
SOURCES = {
    'C': 'Fixed physical CCTV, entirely BLACK AND WHITE including HUD, no redREC, tint or colored accents. No microphone, no audible dialogue/SFX. EVERY visibly speaking person must have their own white balloon containing ONLY NO SOUND with tail pointing to that speaker. Keep non-speaking background mouths neutral; do not invent conversations. No handheld shake, pan or autonomous zoom. HUD REC, CAM identifier and location specified in staging,31/10 and actual recording time below, no year.',
    'A': 'Nina analog camcorder real-world footage in COLOR: modest VHS chroma bleed/tracking, grain and plausible imperfect focus; voices recorded. Never inside virtual arena. Operator remains behind lens except after camera visibly handed over or supported; fixed table A cannot pan, zoom or relocate by itself. HUD only REC and TC tape timecode below. No year, battery numbers or invented date.',
    'D': 'Fred digital camera in clean COLOR FullHD, natural exposure/focus/motion blur; NEVER VHS or scanlines. HUD exactly REC and FHD, no battery/date/timecode. Fred behind lens except explicit supported selfie in lounge. In arena this is virtual linked D; physical D remains docked in real laboratory. Arena bright DAYLIGHT, solid pale stone floor with shallow grit, not sand dunes. No supernatural image filter.',
    'S': 'Andre subjective perceived vision, organic eye-shaped field, COLOR and natural failing peripheral focus as specified, absolutely NO REC, HUD, camcorder border or tape noise. Never shows his own face or physical laboratory. His hands may enter lower view. Heard speech differs from thought, no omniscient camera.'
}


def valid(path):
    if not path.exists():
        return False
    with Image.open(path) as im:
        im.verify()
    return True


def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')


def prepare():
    doc = DOC.read_text(encoding='utf-8')
    blocks = dict(re.findall(r'### L1-(\d{2})[^\n]*\n(.*?)(?=\n### |\n## |\Z)', doc, re.S))
    assert len(blocks) == 51, 'Expected51 narrative blocks'
    for line in PLAN.strip().splitlines():
        number, source, aliases, previous, staging = line.split('|', 4)
        n = int(number)
        text = re.search(r'\*\*Texto:\*\* (.*)', blocks[number]).group(1)
        # Only quoted artwork strings enter lettering; editorial prose is never printed.
        lettering = []
        previous_end, speaker = 0, 'caption'
        for match in re.finditer(r'“([^”]+)”', text):
            context = text[previous_end:match.start()]
            if ':' in context:
                speaker = context.rsplit(':', 1)[0].split('. ')[-1].strip()
            if match.group(1) != 'NO SOUND':
                lettering.append(speaker + ': "' + match.group(1) + '"')
            previous_end = match.end()
        text = '\n'.join(lettering) if lettering else 'No additional printed text.'
        refs = [REFS[a] for a in aliases.split()]
        refs += [f'paginas/loop1/{int(p):02d}.png' for p in previous.split()]
        timing = ''
        if source == 'C':
            seconds = 19 * 3600 + 47 * 60 + TIMES[n]
            h, rem = divmod(seconds, 3600)
            mm, ss = divmod(rem, 60)
            timing = f'CCTV panel1 actual recording time {h:02d}:{mm:02d}:{ss:02d}; panel2 two seconds later unless simultaneous feeds. Page02 specifically19:46:30 then19:47:00. Page08 simultaneous20:00:55 in both rooms.'
        if source == 'A':
            seconds = TIMES[n]
            h, rem = divmod(seconds, 3600)
            mm, ss = divmod(rem, 60)
            timing = f'Tape TC {h:02d}:{mm:02d}:{ss:02d}; second panel advances two seconds, never resets.'
        out = f'paginas/loop1/{n:02d}.png'
        body = COMMON + '\nSOURCE: ' + SOURCES[source] + '\n' + timing
        body += '\nPAGE STAGING: ' + staging
        body += '\nEXACT TEXT IN PORTUGUESE (speaker names/instructions NOT printed):\n' + text
        body += '\nActual attached filenames and roles: ' + '; '.join(Path(r).name + (' = previous-page continuity' if r.startswith('paginas') else ' = identity/environment/object reference') for r in refs)
        body += '\nGenerate ONCE using image generation and SAVE finished PNG to ' + out + '. Reply only ok.'
        write(PROMPTS / f'{n:03d}_pagina{n:02d}.txt', 'OUT: ' + out + '\nREFS: ' + ' '.join(refs) + '\n' + body)
    for alias, (inputs, staging) in MATERIALS.items():
        refs = [REFS[k] for k in inputs.split()]
        out = REFS[alias]
        body = 'Generate ONE photographic architectural continuity sheet,2048 x 1152 px. On LEFT one accurate top-down floor plan; on RIGHT two matching eye-level perspectives. Natural extreme photographic realism matching attached mansion architecture, black stone and bronze. All three views must agree on openings, fixtures and furniture. No people, no words, no labels, no watermark. This is reference material, not a comic page. ' + staging
        body += '\nReferences by exact filename: ' + ', '.join(Path(r).name for r in refs)
        body += '\nSAVE the generated PNG to ' + out + '. Reply only ok.'
        write(PROMPTS / f'material_{alias}.txt', 'OUT: ' + out + '\nREFS: ' + ' '.join(refs) + '\n' + body)
    print('50 English page prompts prepared; page01 preserved;3 supporting environment sheets queued.', flush=True)


def state(status, **extra):
    payload = dict(status=status, generated=sum(valid(PAGES / f'{n:02d}.png') for n in range(1, 52)), total=51, updated=time.time(), **extra)
    write(STATE / 'status.json', json.dumps(payload, indent=2))
    print(json.dumps(payload), flush=True)


def run():
    STATE.mkdir(parents=True, exist_ok=True)
    with open(STATE / 'fila.lock', 'a+b') as lock:
        lock.seek(0)
        lock.write(b'0')
        lock.flush()
        lock.seek(0)
        try:
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            print('Queue already running', flush=True)
            return
        if (STATE / 'PARADA.txt').exists():
            print('Stopped: review PARADA.txt before resuming', flush=True)
            return
        # Existing engine reads argv at import; do not feed our command as pause.
        saved_argv = sys.argv
        sys.argv = [str(ENGINE)]
        spec = importlib.util.spec_from_file_location('halloween_existing_engine', ENGINE)
        engine = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(engine)
        sys.argv = saved_argv
        engine.W, engine.P = str(ROOT), str(PROMPTS)
        os.chdir(ROOT)
        for n in range(2, 52):
            out = PAGES / f'{n:02d}.png'
            if valid(out):
                continue
            if not valid(PAGES / f'{n-1:02d}.png'):
                raise RuntimeError(f'Previous page{n-1} missing')
            page_prompt = PROMPTS / f'{n:03d}_pagina{n:02d}.txt'
            _, refs, _ = engine.ler(page_prompt)
            for alias in MATERIALS:
                if REFS[alias] in refs and not valid(ROOT / REFS[alias]):
                    result = generate(engine, PROMPTS / f'material_{alias}.txt', n, material=True)
                    if result != 'ok':
                        return
            latest = max(p.stat().st_mtime for p in PAGES.glob('[0-9][0-9].png'))
            delay = max(0, 300 - (time.time() - latest))
            if delay:
                state('intervalo', next_page=n, seconds=round(delay))
                time.sleep(delay)
            if generate(engine, page_prompt, n) != 'ok':
                return
        state('completo_aguarda_revisao_visual')
        subprocess.run(['schtasks', '/Change', '/TN', 'Halloween_Loop1_Codex', '/Disable'], capture_output=True)


def generate(engine, prompt, n, material=False):
    out, refs, body = engine.ler(prompt)
    missing = [r for r in refs if not valid(ROOT / r)]
    if missing:
        raise RuntimeError('Missing references: ' + ', '.join(missing))
    state('gerando_material' if material else 'gerando_pagina', page=n, output=out)
    result = engine.gerar(prompt.name, out, refs, body)
    if result == 'ok' and valid(ROOT / out):
        if not material:
            with Image.open(ROOT / out) as im:
                if im.size != (960, 1637):
                    raise RuntimeError('Incorrect page dimensions')
        state('material_gerado' if material else 'pagina_gerada_aguarda_revisao', page=n)
        return 'ok'
    if result == 'cota':
        state('cota_aguarda_proxima_rodada', page=n)
        return result
    write(STATE / 'PARADA.txt', f'{prompt.name}: {result}. Inspect log and references before manually resuming.\n')
    state('parada_requer_revisao', page=n, result=result)
    return result


if __name__ == '__main__':
    action = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if action == 'preparar':
        prepare()
    elif action == 'rodar':
        try:
            run()
        except Exception as exc:
            write(STATE / 'PARADA.txt', str(exc))
            state('parada_requer_revisao', error=str(exc))
            raise
    elif action == 'status':
        print((STATE / 'status.json').read_text(encoding='utf-8') if (STATE / 'status.json').exists() else 'Queue not started')
    else:
        raise SystemExit('Use preparar, rodar or status')