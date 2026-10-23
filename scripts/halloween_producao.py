"""Halloween loop 1: prepare English prompts and reuse the existing serial Codex engine.
Usage: python scripts/halloween_producao.py preparar|rodar|status
One image at a time; 300 seconds between pages; materials have no interval.
"""
import importlib.util
import hashlib
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
ROOT = REPO.parent / 'QUADRINHOS' / 'ESPECIAIS' / 'presos'
PROMPTS = ROOT / 'prompts' / 'loop1'
PAGES = ROOT / 'WEBSHARD' / 'PT' / 'loop1'
STATE = ROOT / 'producao' / 'loop1'
DOC = REPO / 'docs/WEBSHARD/Especiais/HALLOWEEN_ROTEIRO_OFICIAL.md'
ENGINE = REPO.parent / 'QUADRINHOS/MUNDO DAS SOMBRAS/WEBSHARD/scripts/fila_v2.py'
# Columns: page, source, attached identity/environment aliases, continuity pages, staging.
PLAN = '''
02|C|Kim Jack Nina devices hall|01|Two sequential fixed CCTV feeds. CAM 01 ENTRADA: Kim, Jack and Nina enter the Roman costume party; Nina visibly carries and operates the analog camcorder. CAM 02 CORREDOR OESTE: later, Kim moves his red drape aside at the hall doorway, Jack immediately behind him, Nina following. Invent entrance and west corridor in the same mansion architecture; these are not the technical corridor. No named person duplicated in two locations at the same instant. Narration is a compact caption, not a broad panel separator. No visibly speaking mouths here.
03|A|Kim Jack hall|02|Nina films from behind Kim shoulder as he finishes moving cloth aside. P1 Kim says they will eat and leave; Jack counters that he is off duty. P2 Kim points to buffet and walks away, Nina turns wrist to reveal hall, Jack follows. Her complaint is about filming Kims obstructing back, not surprise at luxury. Small cloth/bronze glass shard bridges central seam. Nina off-camera.
04|D|Freddy gang lounge||D is supported, stationary, aimed at Fred in the east lounge. Two moments on the same axis: blond Fred with existing left-eye bruise performs for recording while looking at Anderson45degrees to SIDE of lens and counts; redhead Michael intrudes from the side before he finishes. Opening behind them connects acoustically with hall, but trio stays in the hall, not lounge. This is simultaneous with page03. Compact narration caption. No shard.
05|D|Freddy Brock gang lounge|04|Same supported D axis. Fred tries his pose again; stocky afro-haired Andre crosses behind with Brock and checks two blank cinema tickets. Small cracked-glass shard of those tickets already visible beside his real costume, no printed movie names. Fred is irritated, Andre has an ordinary appointment, Brock promises they will leave in time. Keep the tickets' shape for page46.
06|D|gang lounge masks|05|ONLY Anderson and a masked server are visible. Fred operates D off-camera; other lounge companions may remain outside selected frame. Kim, Jack and Nina remain in the MAIN HALL: ABSENT from lounge, reflections and background. Anderson is third man in Capangas sheet, black fringe over ONE eye, exact sheet face and costume; NEVER Kim red cloak/bronze armor. P1 Fred picks D up from sideboard, fingers briefly at edge, lens rises and turns right; Anderson steps out of service doorway as server arrives carrying tray. P2 chest-high three-quarter door view: server activates RIGHT-jamb sensor with FOREARM while both hands carry tray; door opens. After opening Fred falsely presents it as VIP access for his video; Anderson points out it is simply the SERVICE DOOR, looking at server/tray. Nobody leaves lounge. No shard.
07|A|Kim buffet|03|Nina films Kim eating beside a living unnamed adult at the side buffet. Two panels: stranger offers grapes; he briefly coughs on one and Kim slides water toward him, he recovers and signals he is fine. Fix grape bowl and his place at counter edge. Small cracked-glass hand-and-bowl shard. No collapse, death or supernatural clue.
08|C|Kronos Kim Jack Nina Freddy Brock gang hall lounge devices|01 04|Explicit party ellipse from previous buffet beat to announcement time. P1 fixed CAM03 SALAO human Kronos arrives as staff clear space. P2 fixed CAM05 LOUNGE Fred turns D toward acoustic opening. These two feeds share the CURRENT timestamp, NOT the old page04 timestamp. Separate groups/rooms, no audible speech. Do not repeat choking or imply it lasted through ellipse.
09|A|Kronos Jack hall|03|Nina films human Kronos requesting attention in the hall. Two handheld frames on one axis; second includes Jack's reaction at edge without an external camera angle. Kronos calmly announces 100 guests and nine participants. No shard, no laboratory yet.
10|D|Brock gang lounge|06|Fred's handheld D records Jason's response to prize announcement heard through lounge opening; Brock glances at Andre. Second panel small physical reframing by Fred, who remains off-camera. Kronos' voice is offscreen from hall, not a second visible body. No shard, no invented money amount.
11|A|Kim Jack buffet|07|Kim stops chewing at the word prize; Jack notices and teases, then Kim answers. Two close action moments. The same unnamed man from page07 is alive in partial background at the same buffet position. No new crowd identity in his place.
12|A|Kronos hall|09|One useful medium panel of human Kronos pointing toward technical access, not opening laboratory yet. He explains the other91 watch through their SBIs. Do not cram91 countable people into the image; focus face and pointing hand.
13|A|Jack hall devices|11|Nina hands A to Jack without changing source. Upper frame records Jack reaching toward lens; lower frame tilts downward as he receives it, wrist strap slides onto his wrist. No external image of Nina before handoff. Keep camera object form consistent. No shard.
14|C|Kim Jack Nina Freddy Brock gang hall corridor devices|08|One fixed CAM03 SALAO frame: both established groups converge toward technical corridor, Jack carries A with wrist strap, Fred carries D, masked attendant indicates route. Stranger remains at buffet outside selected nine. Do not line up nine portrait faces; geography and camera custody are the point. No visibly speaking mouths.
15|A|Nina corridor|13|Jack operates A while walking along technical corridor. Ordinary costume banter, no clothing adjustment or physical contact. P1 chest-height oblique view of Nina face and shoulders; she glances SIDEWAYS toward Jacks shoulder clasp, well outside lens axis. P2 Nina turns toward laboratory and points down the corridor, then resumes walking into depth. Jack remains unseen behind A; his complaint concerns an inconvenient costume. Both remain fully clothed. No shard.
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
35|D|gang cables arena|34|After mock fall Andre plants hand to rise. Cable emerges from floor joint and traps his FOREARM, NOT leg. Two action states: planting hand then trying unsuccessfully to lift trapped arm. Same arm/side maintained into36-39 and physical connector38. No full execution yet.
36|D|Jack gang cables arena|35|Two panels of same positions: further cables hold Andre; expression changes from confusion to genuine pain. Jack freezes nearby, hand half raised. Focus tension, grip, face and reactions, not wounds. Andre's escalating lines stay separate clear balloons.
37|D|Kim gang cables arena|36|Kim advances from Jacks side, grabs cable at Andres trapped forearm and calls UP toward Kronos balcony to stop it. Fred pivots D physically to follow. Brief BLUR-M then regain same cable and arm; no invented attacker as addressee.
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
49|C+A|masks lab hall devices|23 21|THREE rapid panels. P1 fixed CAM06 physical lab: after ellipse Andres chair already rolled out, exact other8 occupants remain, DELETE closes this feed. P2 A from established table, workers hand picks it up, lens tilts/rises. P3 A during elliptical carry sees hall Roman clock VIII/XII as world resets20:00; analog own31/10 23:42:52 BAT75 continues. P1 monochrome silent with CCTV time; P2 A31/10 23:42:50 BAT75 and P3 A31/10 23:42:52 BAT75 in strong aged COLOR VHS. No dialogue. Different HUD/filter per source. A does not film itself or arena.
50|A|Kim Jack buffet hall devices|07|ACTUAL LOOP2 START inside release1. A31/10 23:43:00 BAT75, NOT a digital reset. Worker hand finishes handing A back to Nina at lower frame edge; she turns along SAME buffet counter. Two panels: handoff/tilt then Kim addresses Jack choosing food. The unnamed adult from07 is ABSENT, his counter place empty; do not replace him with Andre. Andre was a DIFFERENT man in lounge and is also dead. Only reader recognizes change. Nina behind camera. No prior-loop memories.
51|D|Freddy Brock gang lounge|04|Loop2, D reset clean FHD and SUPPORTED on same lounge sideboard as04. Two moments: Fred directs redhead Michael sideways to leave central background clear, Michael moves; Fred begins count again. Empty position where Andre stood in05 remains EMPTY. Andre absent, never resurrect him from shared sheet. Fred/Brock/Jason/Michael/Anderson only if within established framing; trio absent from lounge. Nobody remembers or asks about Andre. Cliffhanger shows altered repetition, not a supernatural memory. Fred visible because supportedD. No shard.
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
# Every panel gets a motivated camera position and a distinct visible action beat.
CAMERA_PLAN = '''
01|Approved composition remains. Fixed elevated oblique hall camera and a DIFFERENT fixed elevated pool camera, simultaneous separate casts. Hand/drink shard is an editorial close insert. Do not regenerate approved01 during this review.
02|P1 CAM01: high oblique three-quarter entrance angle from ABOVE and SIDE, not eye-level portrait; trio crosses threshold on diagonal into depth, Nina walks at rear-right filming into hall, camcorder raised, Jack mid-stride behind Kim. P2 CAM02: DIFFERENT fixed high reverse angle beyond corridor bend, looking back toward arrivals; Kim in near-left foreground clears drape at jamb, Jack partly occluded behind him, Nina now deeper BACKGROUND-LEFT in side/back view, one foot forward and camcorder LOWERED toward chest as she turns her torso into doorway. Nina MUST change screen position, scale, orientation, arm position and walking phase. Do not copy either trio pose from P1.30seconds elapsed, not2. Show only necessary torsos/hands, architecture establishes actual camera heights. No frozen mannequin procession.
03|P1 Nina's handheld lens behind Kim's shoulder, low oblique close-medium, his cloth-clearing arm crosses near foreground and Jack responds in depth. P2 motivated wrist turn RIGHT after Kim points: buffet decoration enters near edge, Jack shifts toward the other edge and follows Kim, visible torso turn. Do not reuse same face placement; shard isolates cloth tension from an editorial side angle. Nina never visible externally.
04|D supported at sideboard height, slightly LOW upward three-quarter view toward Fred, constant physical axis. P1 Fred leans toward lens with counting fingers near foreground. P2 he recoils a half-step as Michael leans in from opposite edge and blocks part of his shoulder; Fred's hand drops and gaze switches to Michael. Same camera, visibly changed bodies, no duplicate selfie poses. Keep this supported axis for05.
05|Same supported LOW D axis as04. P1 Fred steps sideways to restore view while Andre enters across rear depth with Brock following. P2 Andre stops nearer lens, turns toward Brock and opens ticket hand; Brock angles down toward tickets. Fred now cropped at opposite edge, not same central pose. Editorial shard is an oblique fingers/tickets close insert near CENTRAL diagonal seam, on Andre line of sight; connects his ticket glance to the promise rather than decorating a corner.
06|P1 D being picked up: low tilted frame, partial fingers at top edge, sideboard recedes downward; Anderson is partly occluded in middle distance. P2 lens now chest-high and aimed three-quarter toward service jamb: attendant's FOREARM crosses to sensor and door opens into depth, Anderson turns toward doorway. This is an actual pickup/turn, not two stationary views of attendant posing.
07|P1 Nina films obliquely ALONG buffet counter: grape hand large near foreground, Kim in middle depth, stranger farther along counter. P2 small motivated downward tilt follows water glass sliding into stranger's reaching hand; stranger bends coughing/recovering, Kim extends arm across image. Different hands, posture and visual center. Bowl/hand shard is editorial overhead detail across MIDDLE seam linking grape to water response along Kim glance, not a third full scene or compulsory corner ornament.
08|P1 elevated fixed CAM03 oblique across announcement approach: human Kronos steps THROUGH a gap staff open, Nina at buffet edge turning her camera. P2 fixed CAM05 from opposite lounge upper corner, sofa crops foreground; Fred physically pivots D toward acoustic opening and companions turn their shoulders. Distinct rooms/casts at same instant. Do not pose every person facing surveillance lens.
09|P1 Nina's handheld low three-quarter medium angle, Kronos' attention-requesting hand enters foreground. P2 he lowers that hand and indicates selected guests with other arm; Jack leans into frame edge as Nina makes a SMALL justified lateral wrist correction. Kronos shifts from addressing wide group to selection gesture, no repeated podium portrait.
10|P1 handheld D oblique at Jason's shoulder level, his head turns sharply toward hall voice, Brock and Andre staggered in depth. P2 Fred takes a half-step sideways following Jason's leaning response; Jason's hand rises, Brock turns from hall toward Andre. Different blocking, no cut to offscreen Kronos or Fred selfie.
11|P1 low handheld A close-medium over counter edge, Kim pauses food halfway to mouth while Jack notices from side. P2 Nina tilts slightly up as Kim lowers hand and turns eyes toward announcement; Jack leans toward him smiling. Stranger remains alive at his fixed place in depth, no repeated identical mouths/arms.
12|Single handheld A low three-quarter medium frame: Kronos near side, technical doorway in depth along pointing arm. One decisive pointing gesture directs reading toward next route, not panoramic architectural exhibition or full-body portrait.
13|P1 handheld A slightly upward close view of Jack reaching toward lens, fingers near foreground. P2 lens rolls and dips during REAL transfer, showing Jack's wrist rotating INTO strap and floor/cloth replacing upper background. Neither face nor hand may hold the identical pose. Nina's body stays behind lens until transfer permits otherwise.
14|One fixed elevated CAM03 diagonal view into technical-corridor mouth. Foreground servant gestures toward opening; groups enter at staggered depths, Jack A and Fred D visibly carried, Nina already walking ahead of Jack. Action crosses image, not nine people standing shoulder-to-shoulder. Everyone's position differs from08.
15|P1 handheld A at chest height, level optical axis, three-quarter head-and-shoulders Nina, corridor jamb partly occludes foreground. P2 motivated turn follows her pointing hand and forward step toward laboratory, face changes position and scale. No low upward body framing, no near-edge clothing tug, no hand reaching toward operator body.
16|P1 Fred's D over near edge of Brock's shoulder, Anderson ahead turns BACK while still walking. P2 Fred advances one step, Jason's prize-directed gesture drops under Brock's sideways look; Anderson turns forward and recedes. Corridor vanishing lines and occlusions change with actual walking, no mirrored duplicate procession.
17|P1 handheld D downward oblique: Michael's shoe catches low cable at RIGHT jamb; camera handback Jack-to-Nina occurs recognizably in depth. P2 Fred's startled upward correction catches Michael pitched forward and Jason's gripping arm pulling costume taut. Their weight/feet change, no second posed standing frame. Editorial shoe/cable shard sits near CENTRAL seam: same contact that causes the rescue below, not another trip. Link cause to consequence and keep handback in depth unobscured.
18|One handheld A shoulder-height oblique from laboratory door with near jamb and side table framing exact nine-chair5+4 geometry. Functional establishing view, camera NOT overhead/floating. Jack near edge moving inward, no centered lineup. Locate Andre chair and camera table for later fixed recording.
19|P1 D chest-height oblique down toward link station, Brock partially seen beyond it. P2 Fred physically dips lens toward his confirming finger and status display; wrist/contact action changes from hovering to pressed and REGISTRO VINCULADO appears once. No external shot of Fred holding D; no second identical interface frame.
20|Single fixed elevated CAM06 diagonally across SAME lab, docking support in near side and9chairs beyond. Fred bends to insert physical D, Nina crosses toward side table with A, attendants direct people along clear paths. Dynamic separate actions, not9faces posing at camera. Establish this exact C axis for23/49/50.
21|P1 A tilts down and rolls as Nina sets it on side table; tabletop edge enters lower foreground. P2 lens has physically settled at LOW table-height oblique axis aimed toward Andre chair and hand/pocket, Nina moves away ACROSS edge of her own now-stationary image toward seat. Distinct shaky-placement versus stable-supported states. This P2 axis MUST remain identical in22/38/42/46; don't use cinematic angle changes for fixed A.
22|SAME locked table-height A axis in BOTH panels, no pan/zoom/crop change. P1 Andre sits forward testing strap with lifted wrist, Brock partly at side. P2 attendant's arm crosses to close connector, Andre wrist settles against restraint, Brock turns toward him. Change action, overlapping arms and posture; not two copies of seated Andre. Andre hand and costume pocket remain in field.
23|Single fixed CAM06 identical to20: all9 seated, attendant leans to final helmet while another closes technical door in depth. A on table and D docked remain in recorded locations. Staff positions and participants' posture have advanced since20; no standalone empty-room beauty shot.
24|P1 virtual D at LOW hand-height rising from seated position, gateB ironwork cuts foreground and Brock/Jason shift weight beside it. P2 Fred stands/raises lens naturally to chest height as gate opens, daylight slices across turning faces and threshold. Not two static portraits or a third-person view of Fred lifting camera.
25|P1 D at B threshold, near jamb partly blocks image during Fred's motivated turn. P2 turn completes toward gateA, Kim comes out first into near-left, Jack and Nina follow staggered with different strides and glances. No unseen interior ofA, no repeated trio pose from02, no full-body lineup.
26|P1 D diagonally across gateC from outside: Andre rounds jamb while Anderson/Michael still partly occluded. P2 Fred's small pivot brings Brock's raised beckoning hand into near foreground, Andre turns and walks toward it; companions clear gate. Editorial hand shard near MIDDLE-LEFT joins Andre eyeline to Brock beckon and bridges the two moments. Keep people advancing, not identical formation in both frames.
27|Single handheld D upward-oblique functional wide from arena margin, near shoulder/gate edge anchors operator, bright stands above floor. Nina's turned profile near edge points attention toward undead crowd. No aerial/master drone shot. Preserve gates' geography without tiny panoramic cast portraits.
28|Single D steep LOW upward angle from Fred on arena floor toward raised imperial balcony, parapet frames zombie Caesar from below, laurel/silhouette striking against daylight. A genuine camera tilt, no cut to balcony-level external camera. Clock20:00 small secondary detail, face/command is focal point.
29|P1 D turns down to medium low three-quarter Andre raising hand, Brock behind his opposite shoulder. P2 Fred eases closer half-step as Andre SHRUGS and turns toward center; Brock reaches briefly toward his upper arm, hand raised then held back. Gestures and eyelines change, no duplicated volunteer portrait.
30|P1 D over Andre's near shoulder toward Jack stepping into space. P2 Fred physically retreats half-step to include Jack turning sideways into play stance and Kim shifting aside at edge. Andre is opposite Jack, not another new opponent. Changes are motivated physical movement, not impossible reverse coverage.
31|One handheld D sideline oblique frame, Nina's hesitant raised fingers near foreground, Jack moving away into center in depth, still within same lens field. Her look follows him rather than camera. Depth shows hesitation failing to stop movement; no frontal posed two-shot.
32|P1 D medium close as redhead Michael enters near lens and blocks part of arena; Anderson visible at his far shoulder. P2 Anderson pulls him SIDEWAYS out of optical axis, revealing Jack/Andre deeper in frame. Fred stays at same sideline. Difference is obstruction then clearing, not same pair standing with changed mouths.
33|P1 D slight low oblique waist-up of contenders separated by visible arm's length, Andre opens guard and Jack brings fist to ready position. P2 Fred leans slightly to keep gap visible while Andre shifts weight forward and Jack extends shoulder toward upcoming tap. Body mechanics progress; contact has NOT occurred yet.
34|P1 D torso/hand action medium: ONE gentle tap reaches Andre, neither explosive impact nor heavy strike. P2 Fred tilts lens down following Andre's theatrical laughing descent toward same floor patch, Jack's hand recoils and stays at upper edge. Distinct contact then falling state. Glass contact shard crosses CENTRAL seam and isolates the SAME gentle contact, bridging contact to fall, never extra punch.
35|P1 D downward oblique medium: Andre planted palm on grit, pushes torso up from playful fall. P2 small Fred tilt follows SAME arm arrested by cable; Andre's elbow bends back and hips halt halfway up, smile falters. Do not magically return him to flat starting pose. Cable direction established toward ground attachment.
36|P1 same D downward side axis: another cable draws taut, Andre's free hand reaches to it, Jack takes one involuntary step nearer. P2 Fred physically lowers his stance slightly with fear, Andre turns face toward Jack and shoulders tense; Jack's raised hand freezes. Pain escalates in different body state, not same cable/face arrangement twice.
37|P1 D whipped sideways by Fred tracking Kim's close pass, red cloak streaks across one near edge with motivated motion blur. P2 lens recovers LOW oblique angle toward SAME trapped arm, Kim now crouches on established side, reaches hand to cable; Andre's hand in opposite depth. Read arrival then intervention, not two blurry duplicates or moved victim.
38|SAME locked low A table axis from21 in both panels. P1 masked worker leans into field, connector approaches corresponding Andre arm. P2 connector is seated, worker's fingers release it and Andre's real hand contracts against strap. Clear before/after contact. No zoom, no flattering new closeup, no virtual-body replacement.
39|P1 D low side angle from Fred's established margin, Kim stays on near-left side of Andre, Brock/Jason enter opposite side and take hold of bundle. P2 Fred leans into closer oblique field without crossing rescue axis: their elbows draw back, cables taut, Andre's torso shifts slightly but remains trapped. Different effort phase, no extra hands or duplicated rescuers.
40|P1 D pivots physically to established sidelines: Michael's laughing mouth and Anderson's half-smile in unequal depth. P2 SAME angle while laugh STOPS: Michael's hand drops, Anderson leans forward, both eyes shift toward offscreen Andre. Expressive reaction change is the action, not another smiling portrait or blur hiding emotion.
41|P1 D chest-height oblique side view: Jack stares at near raised fist while Nina approaches behind his shoulder. P2 Nina's hand lands on his shoulder and turns him toward her, Jack lowers fist and meets her eyes; frame shifts a little as Fred adjusts grip. Changed contact, head angle and hand position. No duplicated still Nina from earlier pages.
42|SAME locked A table axis from38. P1 Andre's torso lifts in a convulsion, strap tight, worker's hand reaches for station rail. P2 torso falls back against chair, worker now bracing rail, loose cloth settles. Two phases of SAME event, room/camera/chair do not move. No identical seated-body poses.
43|Single subjective LOW upward Andre eyeline from restrained ground position: Kim/Brock hands enter opposite sides above him, their bodies foreshortened beyond hands, vision edges organic. Faces never form a centered portrait lineup. No own-face view, no aerial view, no REC. Cold thought against dark peripheral quiet area.
44|P1 D lens physically tips DOWN toward grit as Fred's hands weaken, lower torsos cut top edge and existing Kim arm remains anchor. P2 Fred raises lens enough to catch Kim lifting his face from rescue toward operator, still gripping cable. Distinct downward loss versus recovered witness, not same closeup copied. Lens never touches floor.
45|P1 Andre subjective low side view, Brock leans INTO reach and begins reply, nearer hand partially occludes face. P2 Andre's tiny head sag shifts eyeline downward, Brock leans closer and extends hand, peripheral focus falls off. Motivated bodily POV shift, no external portrait or magically teleported ticket prop.
46|Single locked low A table frame from38/42: Andre's hand now UNCLENCHES and tickets fall from costume edge onto same visible lap/seat area. Nothing relocates camera for a macro shot. Optional small editorial shard near CENTER of still supports the release-to-ticket glance, echoing05 without a flashback; no printed ticket text and no mandatory corner placement. This new released-hand state differs from42's contracted hand.
47|P1 Andre subjective low field, Kim still pulls and leans nearer from SAME rescue side, foreground cable gives scale. P2 head/vision sinks as eye aperture contracts almost closed, Kim's gesture becomes partial silhouette, not a repeated sharp face with black border pasted on. Thought appears once. No running motion blur or technical overlay.
48|Single D slightly lowered oblique medium frame from Fred: Andre now motionless, Brock remains bent toward his hand, Kim loosens pulling effort and turns face to check him, Nina/Jack remain on established side in depth. Changed aftermath posture, no frozen tableau copied from39 and no new pulling cycle.
49|Both panels EXACT same high oblique CAM06 axis as23. P1 workers roll Andre's chair/body along established service path, empty base emerging behind it. P2 chair/body fully EXIT field, workers farther down route, eight remaining chairs/bodies unchanged. Removal then absence is unmistakable. No second identical chair-in-transit frame.
50|Single same fixed CAM06 field as49 showing empty base as technical shutdown obstructs recording. DELETE is interface only. No new angle, no new people posing, no floating insert of control room never established.
51|P1 A low table axis breaks ONLY because worker picks it up: hand near upper edge, tabletop horizon rolls and lab passes obliquely. P2 after real carrying ellipse, handheld A points upward through hall opening to Roman clock, tall masonry foreshortened, clock hands finish returning toVIII/XII. Clearly changed location and camera height with custody cause. TC keeps advancing, operator never visible externally.
'''
CAMERA_PLAN = {int(row.split('|', 1)[0]): row.split('|', 1)[1]
               for row in CAMERA_PLAN.strip().splitlines()}
GAZE_PLAN = '''
01|Hall guests look at one another or drinks; pool guests at their DIFFERENT companions and server tray. Nobody notices CCTV.
02|P1 Kim looks toward entrance route, Jack toward Kim's shoulder, Nina at camcorder controls/route off-axis. P2 Kim at jamb/drape, Jack at passage, Nina down toward her lowered camcorder then doorway. No upward glance at either CCTV lens.
03|Kim looks at drape then buffet; Jack at Kim's face then the direction Kim points. Nina is offscreen.
04|Fred looks at Anderson standing at least45degrees OFF the camera axis while counting; when Michael interrupts Fred turns to Michael. Michael looks at Fred, never into recording lens, even when asking if he is in frame.
05|Fred glances toward Andre crossing behind; Andre down at tickets then Brock's face; Brock at tickets then Andre. No selfie eye contact.
06|Anderson at service doorway, attendant at sensor then tray. Fred offscreen.
07|Kim at food then stranger's water hand; stranger at grape then glass, not toward filming Nina.
08|Kronos at waiting guests; Nina at buffet/route, Fred at doorway and D controls, attendants at people they guide. Nobody looks toward CCTV.
09|Kronos addresses guests45degrees away from Nina's lens; Jack watches Kronos's pointing hand.
10|Jason toward announcement opening then Brock; Brock at Andre; Andre toward announcement. No eyes toward Fred/lens.
11|Jack looks at Kim's food hand then Kim; Kim looks at food then prize announcement direction. Stranger at his glass.
12|Kronos looks along his pointing hand toward technical access, never along lens axis.
13|Jack looks DOWN at receiving hand and wrist strap, not into A as he reaches toward it.
14|Everyone watches route, attendant's hand or companion ahead. Nobody acknowledges high CCTV.
15|Nina first glances SIDEWAYS toward Jacks shoulder clasp outside the lens axis, then looks at laboratory doorway while pointing ahead. Never look down toward the operator body or into the lens.
16|Anderson turns back to Brock's shoulder beside operator, not Fred/lens; Jason at announcement direction then Brock; Brock at Jason.
17|Michael looks down at caught shoe, Jason at Michael's grabbing point, Jack/Nina at handoff and strap.
18|Jack looks toward assigned chair; staff at stations. Nina offscreen.
19|Visible Brock at link display and Fred's confirming hand, not lens. Other guests at chairs.
20|Fred looks at docking support, Nina at table, attendants at seats. Nobody toward CCTV.
21|Nina at tabletop while supporting A then at chair as she exits field. Andre at his strap/seat. No glance back into supported lens.
22|Andre down at wrist restraint then worker's connector; Brock at Andre's strap; worker at connector.
23|Workers at helmets and door hardware, participants down/eyes enclosed. Nobody toward CCTV.
24|Jason at gate latch then toward Brock; Brock toward opening daylight. Neither looks into virtual D.
25|Kim scans arena/prize direction; Jack looks toward Kim; Nina toward emerging route and parapet. No trio staring at Fred.
26|Andre looks toward Brock's raised hand, Brock at Andre, Michael/Anderson toward arena route.
27|Nina looks UP at crowd tiers; spectators at arena floor contestants away from camera optical axis.
28|Zombie Caesar looks DOWN toward contenders standing offset from Fred, at least30degrees away from D axis. No straight-to-reader horror stare.
29|Andre at Brock then arena center, Brock at Andre's raised arm. Not Fred.
30|Jack at Andre's face, Kim at contenders, Andre at Jack's hands. Nobody looks at filming Fred.
31|Nina at departing Jack's shoulder, Jack at central opponent position.
32|Michael looks at Anderson/Fred's shoulder SIDE of lens when asking for reaction shot; Anderson at Michael's obstructing arm. Never look into D.
33|Jack at Andre's raised guard, Andre at Jack's fist. Mutual combat eyelines off lens.
34|Jack at contact point, Andre at Jack then ground as he falls. No eye contact with lens.
35|Andre looks DOWN at his trapped FOREARM, then along the cable toward the floor joint; Jack watches Andres hand. Both look away from D, never at reader/lens.
36|Andre looks toward Jack's hand, Jack at cable/Andre arm. Pain must not become a stare at reader.
37|Kim at Andre's trapped arm and cable grip; Andre at Kim's approaching hand.
38|Worker at connector; Andre eyes closed/helmet down. No physical-lab glance at supported A.
39|Kim at cable join, Brock/Jason at their gripping hands, Andre at helpers' arms. No rescue lineup staring toward D.
40|Michael/Anderson look toward offscreen Andre, reactions shift to same arena action, never lens.
41|Jack at his own fist then Nina's face; Nina at Jack's eyes, their mutual eyeline is SIDEWAYS to D.
42|Worker watches bracing rail/connector; Andre eyes closed or obscured by helmet. No stare into A.
43|In Andre subjective view, Kim and Brock look at restrained ARMS and cable connections, never into Andre/viewer eyes.
44|Kim turns toward Fred's FREE hand/shoulder clearly to SIDE of lens, eyes visibly off-axis, while demanding recording. Never look straight into lens. Brock at Andre hand.
45|Brock looks DOWN at Andre's reaching hand or restraint, not into subjective viewer's eyes, even while promising help.
46|Eyes absent or obscured; worker if visible looks at station. Focus released hand and tickets.
47|Kim looks down at grip/Andre trapped arm, not into subjective viewer's eyes.
48|Kim at Andre's lowered face, Brock at limp hand; Nina at Jack, Jack at Andre. No eyes toward Fred/lens.
49|Workers watch chair route and clamps; remaining participants enclosed helmets. Nobody looks at CCTV.
50|No face looking into lens; technical shutdown is interface, not villain address.
51|Operator face unseen; clock/hand shots have no face toward reader. Any distant attendant watches work/route.
'''
GAZE_PLAN = {int(row.split('|', 1)[0]): row.split('|', 1)[1]
             for row in GAZE_PLAN.strip().splitlines()}
CAMERA_PLAN.update({
    3: 'P1 low oblique behind Kim shoulder, cloth hand near lens; Jack at side. P2 Kim walks toward buffet, Nina rotates wrist to clear his back; Jack follows across depth. New silhouettes and hand positions; no duplicate tableau.',
    6: 'P1 low tilted pickup, sideboard recedes, Anderson steps out of doorway as tray approaches. P2 actual raised chest-height turn RIGHT, close oblique of forearm hitting sensor and leaf opening into depth; Anderson responds from same room. Fred NEVER appears externally.',
    49: 'P1 fixed elevated CAM06 and new empty chair base; P2 low A table axis interrupted by pickup hand; P3 carried A at hall clock after ellipse. Three panels justified by rapid technical closure. Do not combine two source filters in one panel.',
    50: 'P1 low handoff to Nina, workers hand leaves lens edge; P2 handheld oblique along same buffet toward Kim and Jack. Former stranger place clearly empty, same bowl. No empty phantom silhouette.',
    51: 'Same supported low sideboard D axis as04. P1 Fred gestures Michael sideways; P2 Michael moves away, clearing rear space where Andre used to be. Fred counting hand changes. No camera pan or repeated identical pose.'
})
GAZE_PLAN.update({
    6: 'Anderson looks at sensor and tray; attendant looks down at forearm/sensor and tray. Fred invisible behind D. No direct gaze. Kim/Jack/Nina absent.',
    49: 'Workers watch chair clamps and route; operator face invisible in A. Clock and hand have no eyes toward reader.',
    50: 'Kim looks at Jacks plate; Jack at food choices; no one knowingly searches for erased stranger. Nina unseen.',
    51: 'Fred looks at Michael45degrees OFF lens. Michael watches Freds directing hand. No lens gaze or search for erased Andre.'
})
CONTINUITY = json.loads((REPO / 'docs/WEBSHARD/Especiais/HALLOWEEN_CONTINUIDADE.json').read_text(encoding='utf-8'))
COMMON = '''Create one finished photographic WEB SHARD narrative page, 960 x 1637 px, full bleed, extreme natural photographic realism, NOT illustration, anime or game rendering. Usually TWO large action panels; one only where staging explicitly says one. Never more than three. ALL panel cuts diagonal, slopes MAY differ. Dividers are a VERY THIN 1-3px dark optical-fiber contour with restrained glint, NOT a wide band, black gutter, smoke, static strip or bulky cable border. Page01's wide narrated seam is a one-page exception, do not copy it. Captions occupy compact quiet image area without widening separators. Small shards when specified are jagged cracked GLASS overlays of ONE detail, about15-25% width, not additional full scenes. SHARDS ARE NOT RESTRICTED TO CORNERS: use middle of page, central overlap, across a panel seam or along an established eyeline when it clarifies action. A shard can bridge successive action states, reveal what a visible character is looking at, link cause to consequence or lead reader attention to an object. Place it by narrative function, not decoration, without covering faces, balloons, HUD or indispensable gestures. Do not force a shard onto pages where none is staged; editorial close angles beyond recorded lens angle ARE allowed inside shards. Main panels respect physical source. Focus faces, hands and action, medium/close rather than full bodies or repeated panoramas. Essential lettering/faces inside x100-860 y80-1557, no blank margins. White speech balloons, large condensed bold uppercase type, short lines, target40-48px, comfortable at phone width. No speaker-name labels printed. Exact Brazilian Portuguese text below, accents intact, only once, no added narration. Put tails on correct speaker; offscreen voices point toward actual operator/source. Thoughts distinct and tailless. If text is dense, allow more balloon space instead of shrinking type. Natural anatomy, no extra hands, no duplicated faces. ABSOLUTE EYELINE RULE: NO character EVER looks at the reader or directly into the recording lens. NO exceptions for selfie/vlog, dialogue addressed to operator, subjective victim POV, villains or reaction shots. Every visible pair of eyes has a specific OFF-LENS target from the eyeline plan. A front-facing face in an identity sheet does NOT authorize front-facing eye contact in narrative. Keep gaze visibly off-axis, preferably profile/three-quarter, at another character, a hand, object, route or ongoing action. Head facing camera does not excuse eyes facing viewer. CINEMATIC BLOCKING is mandatory, not cosmetic Dutch tilt. Each panel has a specified physical lens position, direction, framing, foreground/depth and a NEW action state. Never duplicate pose, silhouette, hand position, gaze and screen placement from preceding panel. Do not copy a reference-sheet standing pose. One frozen tableau with different dialogue is not progression. Fixed cameras keep physical angle but subjects change action/occlusion/position; handheld changes must come from the operator moving, turning or handling the device. Maintain action axis and rescue sides, no arbitrary reverse coverage. Prior pages are identity/continuity references, never a template to clone composition or poses.
COSTUME AND ACTION FRAMING: Keep opaque Roman costumes securely worn. Use ordinary upright postures and focus on faces, hands, movement and story action. No intimate framing or clothing displacement. Horror is conveyed through restraints, expressions and consequences, without exposed anatomy.
ATTACHED REFERENCES: identify by exact FILENAME listed below, NEVER by upload order. Character sheets govern identity/costume, environment sheets govern floor plan on LEFT and two photographic perspectives on RIGHT; do NOT reproduce board collage in narrative. Previous pages govern props, position, handedness and marks, not source effects when source changes. Do not copy their words. Living extras have varied skin tones, ethnicities, hair including Black/white/blond/redhead, ages and body types. Different simultaneous rooms have DIFFERENT extras, no cloned person at same time. Main cast never replaced by extras. Only characters explicitly authorized in this page staging may appear. An identity sheet or earlier page never authorizes extra cast. Match each authorized face and costume precisely to its named file. Shared Capangas sheet contains Jason (large bald Black man), Michael (redhead scar), Anderson (black fringe covering one eye), Andre (stocky afro); use only named members. Brock has his own sheet and is NOT one of these four. Do not merge Anderson and Kim: different face, hair, costume and location. Keep all Roman costumes exactly; human Kronos only in mansion, zombie Caesar ONLY in virtual arena. Device sheet: analog on LEFT has eyepiece NO flip LCD; digital center has flip LCD, clock on right.
EVERY balloon has PURE SOLID WHITE #FFFFFF fill and BOTH TEXT AND ENTIRE OUTLINE in its speaker color; NEVER default black lettering or black outlines in a color feed. Voice text/outline colors only in COLOR feeds: Kim#1E6FE0, Jack#22C55E, Nina#B82E69, Fred YELLOW#C9A227, Brock#8B1E1E, Andre#9A4A16, Jason#6D28A6, Michael#155E63, Anderson#4B5563, Kronos METALLIC GRAY#4B5058, stranger#6B543A. One bold font, colored letterforms and colored border, white balloons. Never attach an operator voice to a visible character. CAMERA OPERATOR SPEECH: balloon starts at BOTTOM CENTER of the panel and its tail exits the LOWER CENTRAL image edge, from the person holding the camera behind the lens. Nina is OFF-CAMERA when holding A; her pink balloon MUST NOT point right/left or to Kim/Jack. Jack holding A speaks green from bottom center; Fred holding D speaks gold from bottom center. If the camera is supported and speaker is visible, tail points to actual visible speaker. CCTV always monochrome including lettering. All digital devices and recordings reset at each loop, including phones, clocks, batteries and files. World clocks restart20:00. Only analog A preserves footage, own running clock and depleted battery. No conscious memories survive; only Nina has vague sensations, no full recollection. Other characters actions must have visible present causes, not foreknowledge.
'''
SOURCES = {
    'C+A': 'Three rapid operation panels with strict per-panel source separation. P1 fixed CAM06 CCTV BLACK AND WHITE, silent, DELETE; P2/P3 analog COLOR with STRONG full-frame aged VHS, exact analog clock/battery. Physical pickup connects them; no floating camera. Never transfer CCTV silence/filter to analog panels.',
    'C': 'Fixed physical CCTV, entirely BLACK AND WHITE including HUD, no redREC, tint or colored accents. No microphone, no audible dialogue/SFX. EVERY visibly speaking person must have their own white balloon containing ONLY NO SOUND with tail pointing to that speaker. Keep non-speaking background mouths neutral; do not invent conversations. No handheld shake, pan or autonomous zoom. HUD REC, CAM identifier and location specified in staging,digital-world date/time from continuity below, RESET to20:00 every loop, distinct from preserved analog clock; no year.',
    'A': 'Nina OLD ANALOG camcorder footage in COLOR, unmistakably AGED VHS IN EVERY PANEL AND SHARD, not a clean modern photo with a faint edge filter. STRONG full-frame luminance/chroma grain, visible scanlines, coarse moving video noise, tracking instability, small horizontal dropouts, ghosting, softened old-video detail, faded low-saturation warm/greenish color and chromatic bleed. Grain and scanlines must remain obvious at phone width. Occasional tracking tears cross interior of image without hiding action; do not confine noise to borders. Keep editorial balloons crisp with pure white fill and colored text/borders, not noise-distorted. Voices recorded. Never inside virtual arena. Operator remains behind lens except after camera visibly handed over or supported; fixed table A cannot pan, zoom or relocate by itself. HUD in EVERY recorded panel: REC, the EXACT own date/time and BAT percentage given in the continuity contract. No elapsed00:00:00 replacing clock19:57. All analog HUD persists when camera is supported or carried. Do not reset its clock or charge; obey midnight rollover. No invented year. When D films this camera, ONLY analog video inside ocular is aged; external D stays clean.',
    'D': 'Fred digital camera in clean COLOR FullHD, natural exposure/focus/motion blur; NEVER VHS or scanlines. HUD exactly REC and FHD, no battery/date/timecode. Fred behind lens except supported recording in lounge; even there he looks at an OFF-AXIS companion, never lens. In arena this is virtual linked D; physical D remains docked in real laboratory. Arena bright DAYLIGHT, solid pale stone floor with shallow grit, not sand dunes. No supernatural image filter.',
    'S': 'Andre subjective perceived vision, organic eye-shaped field, COLOR and natural failing peripheral focus as specified, absolutely NO REC, HUD, camcorder border or tape noise. Never shows his own face or physical laboratory. His hands may enter lower view. Heard speech differs from thought, no omniscient camera.'
}


def valid(path):
    if not path.exists():
        return False
    try:
        with Image.open(path) as im:
            im.verify()
        return True
    except (OSError, ValueError):
        return False


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
        if n < 3:
            continue  # Approved opening01/02 is preserved.
        text = re.search(r'\*\*Texto:\*\* (.*)', blocks[number]).group(1)
        continuity = CONTINUITY['pages'][f'L1-{n:02d}']
        # One literal source: the reviewed continuity contract mirrors the screenplay.
        lettering = []
        for item in continuity['lettering']:
            name = item.get('speaker')
            if name:
                route = ('NO TAIL: thought' if item['origin'] == 'thought' else
                         'BOTTOM CENTER balloon; tail exits LOWER CENTRAL edge from unseen operator'
                         if item['origin'] == 'bottom_center' else
                         'tail to named visible speaker, or actual offscreen physical side')
                lettering.append(f"{name}: {item['text']!r} | WHITE #FFFFFF FILL; TEXT AND OUTLINE {item['color']}; {route}")
            else:
                lettering.append(f"{item['role']}: {item['text']!r} | INTERFACE/CAPTION/SFX ONLY as staged; NOT speech")
        text = '\n'.join(lettering) if lettering else 'No additional printed text.'
        refs = [REFS[a] for a in aliases.split()]
        refs += [f'WEBSHARD/PT/loop1/{int(p):02d}.png' for p in previous.split()]
        timing = 'CONTINUITY: ' + json.dumps(continuity, ensure_ascii=False)
        if source == 'A':
            timing += '\nEach panel HUD uses analog_clock and matching battery from CONTINUITY, NEVER digital_world_clock. Do not print JSON keys or operator names.'
        elif source == 'C':
            timing += '\nEach panel HUD uses digital_world_clock, NEVER analog_clock. No analog battery in CCTV.'
        else:
            timing += '\nContinuity timestamps are production metadata, NOT additional D/S overlay text.'
        out = f'WEBSHARD/PT/loop1/{n:02d}.png'
        body = COMMON + '\nSOURCE: ' + SOURCES[source] + '\n' + timing
        body += '\nPAGE STAGING: ' + staging
        body += '\nMANDATORY CINEMATOGRAPHY AND ACTION CHANGES: ' + CAMERA_PLAN[n]
        body += '\nMANDATORY EYELINE TARGETS: ' + GAZE_PLAN[n]
        body += '\nEXACT TEXT AND MANDATORY PER-BALLOON BINDING (only the quoted words are printed; speaker, color and routing labels are NOT printed):\n' + text
        body += '\nActual attached filenames and roles: ' + '; '.join(Path(r).name + (' = previous-page continuity' if r.startswith('WEBSHARD/') else ' = identity/environment/object reference') for r in refs)
        body += '\nTOOL INPUT: all references are local. Use referenced_image_paths with these absolute paths, NOT num_last_images_to_include: ' + json.dumps([str(ROOT / r) for r in refs], ensure_ascii=False)
        body += '\nGenerate ONCE using image generation and SAVE finished PNG to ' + out + '. Wait for the image tool to finish, then COPY the generated file from its returned path to this OUT path. Copying to OUT is required and allowed. Do not finish while a tool is still running. Reply only ok after the file is saved.'
        write(PROMPTS / f'{n:03d}_pagina{n:02d}.txt', 'OUT: ' + out + '\nREFS: ' + ' '.join(refs) + '\n' + body)
    for alias, (inputs, staging) in MATERIALS.items():
        refs = [REFS[k] for k in inputs.split()]
        out = REFS[alias]
        body = 'Generate ONE photographic architectural continuity sheet,2048 x 1152 px. On LEFT one accurate top-down floor plan; on RIGHT two matching eye-level perspectives. Natural extreme photographic realism matching attached mansion architecture, black stone and bronze. All three views must agree on openings, fixtures and furniture. No people, no words, no labels, no watermark. This is reference material, not a comic page. ' + staging
        body += '\nReferences by exact filename: ' + ', '.join(Path(r).name for r in refs)
        body += '\nSAVE the generated PNG to ' + out + '. Reply only ok.'
        write(PROMPTS / f'material_{alias}.txt', 'OUT: ' + out + '\nREFS: ' + ' '.join(refs) + '\n' + body)
    print('49 reviewed English prompts03-51 prepared; approved01/02 preserved; no generation started.', flush=True)


def pending():
    path = STATE / 'pendencias.json'
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}


def state(status, **extra):
    payload = dict(status=status, generated=sum(valid(PAGES / f'{n:02d}.png') for n in range(1, 52)),
                   total=51, updated=time.time(), pending=list(pending()), **extra)
    write(STATE / 'status.json', json.dumps(payload, ensure_ascii=False, indent=2))
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def mark_pending(prompt, n, reason):
    items = pending()
    items[prompt.name] = dict(page=n, reason=reason, updated=time.time(),
                             prompt_sha256=hashlib.sha256(prompt.read_bytes()).hexdigest() if prompt.exists() else None)
    write(STATE / 'pendencias.json', json.dumps(items, ensure_ascii=False, indent=2))
    state('pagina_pendente_fila_continua', page=n, reason=reason)


def pause(seconds):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if (STATE / 'PARADA.txt').exists():
            state('pausada_pelo_usuario')
            return False
        time.sleep(min(5, max(0, deadline - time.monotonic())))
    return not (STATE / 'PARADA.txt').exists()


def run():
    STATE.mkdir(parents=True, exist_ok=True)
    with open(STATE / 'fila.lock', 'a+b') as lock:
        lock.seek(0); lock.write(b'0'); lock.flush(); lock.seek(0)
        try:
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            print('Queue already running', flush=True)
            return
        if (STATE / 'PARADA.txt').exists():
            state('pausada_pelo_usuario')
            return
        saved_argv = sys.argv
        sys.argv = [str(ENGINE)]
        spec = importlib.util.spec_from_file_location('halloween_existing_engine', ENGINE)
        engine = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(engine)
        sys.argv = saved_argv
        engine.W, engine.P = str(ROOT), str(PROMPTS)
        engine.ECONOMIA += ' References are local files: use referenced_image_paths. Wait for image generation to COMPLETE and COPY its returned PNG to OUT before replying ok. Saving is required and allowed.\n'
        os.chdir(ROOT)
        for n in range(2, 52):
            if (STATE / 'PARADA.txt').exists():
                state('pausada_pelo_usuario'); return
            if valid(PAGES / f'{n:02d}.png'):
                continue
            prompt = PROMPTS / f'{n:03d}_pagina{n:02d}.txt'
            try:
                old = pending().get(prompt.name)
                if old and old['prompt_sha256'] == hashlib.sha256(prompt.read_bytes()).hexdigest():
                    continue  # Do not automatically repeat the same rejected request.
                _, refs, _ = engine.ler(prompt)
                for alias in MATERIALS:
                    if REFS[alias] in refs and not valid(ROOT / REFS[alias]):
                        if generate(engine, PROMPTS / f'material_{alias}.txt', n, material=True) != 'ok':
                            break
                else:
                    latest = max((p.stat().st_mtime for p in PAGES.glob('[0-9][0-9].png')), default=0)
                    delay = max(0, 300 - (time.time() - latest))
                    if delay:
                        state('intervalo', next_page=n, seconds=round(delay))
                        if not pause(delay): return
                    generate(engine, prompt, n)
                    continue
                if (STATE / 'PARADA.txt').exists(): return
                mark_pending(prompt, n, 'referencia_material_indisponivel')
            except Exception as exc:
                mark_pending(prompt, n, f'{type(exc).__name__}: {exc}')
        state('lote_finalizado_com_pendencias' if pending() else 'completo_aguarda_revisao_visual')
        subprocess.run(['schtasks', '/Change', '/TN', 'Halloween_Loop1_Codex', '/Disable'], capture_output=True)


def generate(engine, prompt, n, material=False):
    out, refs, body = engine.ler(prompt)
    old = pending().get(prompt.name)
    if material and old and old['prompt_sha256'] == hashlib.sha256(prompt.read_bytes()).hexdigest():
        return 'material_pendente'
    missing = [r for r in refs if not valid(ROOT / r)]
    essential = [r for r in missing if not r.startswith('WEBSHARD/PT/loop1/')]
    if essential:
        mark_pending(prompt, n, 'referencia_ausente: ' + ', '.join(essential))
        return 'referencia_ausente'
    if missing:
        refs = [r for r in refs if r not in missing]
        body = re.sub(r'^Actual attached filenames and roles: .*$',
                      'Actual attached filenames and roles: ' + '; '.join(Path(r).name for r in refs), body, flags=re.M)
        body = re.sub(r'^TOOL INPUT: .*$', lambda m: 'TOOL INPUT: use referenced_image_paths with these existing files: ' + json.dumps([str(ROOT / r) for r in refs], ensure_ascii=False), body, flags=re.M)
        body += '\nCONTINUITY NOTE: earlier page artwork is pending: ' + ', '.join(missing) + '. It is NOT attached. The scripted events still occur; follow the explicit source, operator, staging, HUD and existing identity/environment sheets. Do not invent a replacement prior image or change rooms/cast.'
    while True:
        if (STATE / 'PARADA.txt').exists(): return 'pausada'
        state('gerando_material' if material else 'gerando_pagina', page=n, output=out)
        result = engine.gerar(prompt.name, out, refs, body)
        if result == 'ok' and valid(ROOT / out):
            if not material:
                with Image.open(ROOT / out) as im:
                    if im.size != (960, 1637): raise RuntimeError('Incorrect page dimensions')
            items = pending(); items.pop(prompt.name, None)
            write(STATE / 'pendencias.json', json.dumps(items, ensure_ascii=False, indent=2))
            state('material_gerado' if material else 'pagina_gerada_aguarda_revisao', page=n)
            return 'ok'
        if result != 'cota':
            mark_pending(prompt, n, result if result != 'ok' else 'arquivo_nao_salvo_ou_invalido')
            return result if result != 'ok' else 'falhou'
        # Account-wide quota affects every page: wait rather than exhaust the queue.
        state('cota_aguarda_proxima_rodada', page=n, retry_in_seconds=300)
        if not pause(300): return 'pausada'


if __name__ == '__main__':
    action = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if action == 'preparar':
        prepare()
    elif action == 'rodar':
        try:
            run()
        except Exception as exc:
            write(STATE / 'PARADA.txt', str(exc))
            state('parada_erro_de_inicializacao', error=str(exc))
            raise
    elif action == 'status':
        print((STATE / 'status.json').read_text(encoding='utf-8') if (STATE / 'status.json').exists() else 'Queue not started')
    else:
        raise SystemExit('Use preparar, rodar or status')
