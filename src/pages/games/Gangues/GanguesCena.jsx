import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import enemiesData from './data/gangues-enemies.json'
import GangDialog from './components/GangDialog'
import GanguesPapo from './components/cena/GanguesPapo'
import GanguesParada from './components/cena/GanguesParada'
import GanguesDescanso from './components/cena/GanguesDescanso'
import { CENAS_POR_ID, portaoAberto, contarCena } from './data/cenas/pista.js'
import { GANGUES_TERRITORIO_POR_ID } from './data/ganguesTerritorios.js'
import './GanguesCena.css'

const WORLD={w:760,h:1840}, SPAWN={x:380,y:1720}, TILE=40, STEP_MS=160, PLAYER_RADIUS=18
const seenSceneIntros = new Set()
const POS={sinal:{x:210,y:1570},ferro:{x:150,y:1325},molecada_1:{x:445,y:1190},birosca:{x:170,y:1460},corre:{x:610,y:1010},molecada_2:{x:445,y:505},descanso:{x:205,y:1440},boss:{x:570,y:175}}
const COLLIDERS=[
  {x:0,y:350,w:287,h:326},{x:473,y:350,w:287,h:326},
  {x:0,y:802,w:287,h:370},{x:473,y:802,w:287,h:370},
  {x:0,y:1302,w:287,h:190},{x:473,y:1302,w:287,h:190},
  {x:0,y:1622,w:287,h:218},{x:473,y:1622,w:287,h:218},
]
const ENTRY_ZONES={
  sinal:{x:243,y:1532,w:70,h:76},ferro:{x:270,y:1288,w:35,h:76},molecada_1:{x:355,y:1155,w:76,h:70},
  birosca:{x:270,y:1418,w:35,h:82},corre:{x:455,y:970,w:35,h:82},molecada_2:{x:350,y:465,w:76,h:82},
  descanso:{x:270,y:1375,w:35,h:72},boss:{x:530,y:300,w:80,h:45},
}
const PLACES=[
  ['entrada',380,1745,'⇧','Entrada da Pista'],['banca',95,1600,'▤','Banca fechada'],['bar',155,1450,'♬','Bar do Zé'],['residencial',560,1440,'⌂','Rua residencial'],['cruzamento',380,1270,'╳','Cruzamento'],['mercado',592,1120,'▦','Mercadinho da Cida'],['fliperama',610,990,'▣','Fliperama do Kiko'],['quadra',130,900,'◎','Quadra da Pista'],['praca',370,900,'♣','Praça da Pista'],['ponto',625,770,'▥','Ponto de ônibus'],['oficina',205,650,'⚙','Oficina do Nando'],['escadaria',245,390,'▰','Escadaria / mirante'],['loja',390,285,'◇','Loja abandonada'],['portao',570,285,'▥','Portão da gangue rival','gate']
]

export default function GanguesCena({onNavigate}){
  const {t}=useLanguage(), store=useGanguesStore(), territorioId=store.storyTarget?.territorioId
  const cena=CENAS_POR_ID[territorioId]||null, terr=GANGUES_TERRITORIO_POR_ID[territorioId]||null
  const prog=store.cenaProgresso[cena?.id]||{resolvidos:{},revelados:{},boss:false,folego:100}
  const [intro,setIntro]=useState(()=>Boolean(cena&&!seenSceneIntros.has(cena.id))),[player,setPlayer]=useState(()=>validPosition(prog.posicao)?prog.posicao:SPAWN),[facing,setFacing]=useState('up'),[encontro,setEncontro]=useState(null),[toast,setToast]=useState(null),[hint,setHint]=useState('Use o analógico para andar')
  const viewportRef=useRef(null),inputRef=useRef({x:0,y:0}),keysRef=useRef(new Set())
  const bossAberto=cena?portaoAberto(cena,prog.resolvidos):false, folego=prog.folego??100
  const pinos=useMemo(()=>{if(!cena)return[];const a=cena.pois.filter(p=>p.visivel||prog.revelados[p.id]).map(p=>({...p,world:POS[p.id],estado:estadoPoi(p,prog)}));a.push({...cena.chefe,world:POS.boss,estado:prog.boss?'resolvido':bossAberto?'disponivel':'trancado',ehChefe:true});return a.filter(p=>p.world)},[cena,prog,bossAberto])
  const perto=useMemo(()=>pinos.find(p=>(p.estado==='disponivel'||p.repetivel)&&insideZone(player,ENTRY_ZONES[p.id]))||null,[pinos,player])
  const {feitos,total}=cena?contarCena(cena,prog.resolvidos,prog.boss):{feitos:0,total:0}

  useEffect(()=>{const down=e=>{if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(e.key.toLowerCase())){e.preventDefault();keysRef.current.add(e.key.toLowerCase())}},up=e=>keysRef.current.delete(e.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[])
  // Movimento em grade, tipo Pokémon clássico: um passo de TILE por vez, sem
  // diagonal (o eixo com maior intensidade no analógico/teclado vence),
  // travado por STEP_MS entre passos. Isso também deixa a colisão óbvia —
  // ou o passo acontece, ou não acontece, sem deslize parcial que escondia
  // quando o choque era detectado.
  useEffect(()=>{
    if(intro||encontro) return
    let cancelado=false, timer
    const passo=()=>{
      if(cancelado) return
      const k=keysRef.current
      const ix=inputRef.current.x+(k.has('arrowright')||k.has('d')?1:0)-(k.has('arrowleft')||k.has('a')?1:0)
      const iy=inputRef.current.y+(k.has('arrowdown')||k.has('s')?1:0)-(k.has('arrowup')||k.has('w')?1:0)
      if(Math.hypot(ix,iy)>.35){
        const dx=Math.abs(ix)>=Math.abs(iy)?(ix>0?1:-1):0
        const dy=dx===0?(iy>0?1:-1):0
        setFacing(dx>0?'right':dx<0?'left':dy>0?'down':'up')
        setHint(null)
        setPlayer(p=>stepPlayer(p,dx,dy,bossAberto))
      }
      timer=setTimeout(passo,STEP_MS)
    }
    timer=setTimeout(passo,0)
    return()=>{cancelado=true;clearTimeout(timer)}
  },[intro,encontro,bossAberto])
  if(!cena||!terr)return <main className="gang-lobby"><button className="gang-new-sheet" onClick={()=>onNavigate('story')}>← MAPA</button></main>
  const fecharIntro=()=>{seenSceneIntros.add(cena.id);setIntro(false)}
  const guardarPosicao=()=>store.salvarPosicaoCena(cena.id,player)
  const abrir=poi=>{if(!poi||poi.estado==='trancado')return;guardarPosicao();sfx.select();setEncontro({poi,vs:poi.tipo==='treta'})}
  const iniciarTreta=(poi,{viraTreta,revela}={})=>{const chefe=Boolean(poi.ehChefe);guardarPosicao();sfx.vs?.();store.setStoryTarget({territorioId:terr.id,cenaId:cena.id,cenaPoiId:poi.id,cenaRevela:viraTreta?(revela||[]):(poi.revela||[]),cenaRecompensa:viraTreta?null:poi.recompensa||null,pontoIds:terr.pontos.map(p=>p.id),noId:chefe?cena.chefe.poiNo:null,enemyId:viraTreta?viraTreta.enemy:poi.enemy,fixo:Boolean(viraTreta),dificuldade:poi.dificuldade,isChefe:chefe,repDelta:viraTreta?.rep||0});onNavigate('story-combat')}
  const resolver=res=>{const poi=encontro.poi;setEncontro(null);if(res?.viraTreta){iniciarTreta(poi,{viraTreta:res.viraTreta,revela:res.revela});return}if(res?.custoGrana)store.gastarGrana(res.custoGrana);if(typeof res?.folego==='number')store.ajustarFolego(cena.id,res.folego);const r=res?.recompensa||{};if(r.grana)store.ganharGrana(r.grana);if(r.rep)store.ganharRep(r.rep);if(r.grana||r.rep||r.xp||r.item){setToast(r);setTimeout(()=>setToast(null),2600)}if(!poi.repetivel)store.marcarPoiResolvido(cena.id,poi.id,res?.revela||poi.revela||[]);else if(res?.revela)store.revelarPoi(cena.id,res.revela)}
  if(prog.boss)return <main className="gang-lobby gang-story gang-cena"><div className="gang-cena-tomado"><span className="if-eyebrow">A PISTA // TERRITÓRIO</span><h1>PISTA DOMINADA</h1><p>As ruas agora carregam o nome da sua gangue.</p><button className="gang-cena-btn gang-cena-btn--go" onClick={()=>onNavigate('story')}>VOLTAR A MARÉLIA</button></div></main>
  const vw=viewportRef.current?.clientWidth||390,vh=viewportRef.current?.clientHeight||620,lookX=facing==='right'?52:facing==='left'?-52:0,lookY=facing==='down'?60:facing==='up'?-60:0,camX=Math.max(0,Math.min(WORLD.w-vw,player.x-vw/2+lookX)),camY=Math.max(0,Math.min(WORLD.h-vh,player.y-vh/2+lookY))
  return <main className="gang-cena-worldpage" style={{'--terr-cor':cena.cor}}>
    <AnimatePresence>{intro&&<GangDialog lines={t(cena.chegada)} speaker={t(cena.falante)} sub={t(cena.falanteSub)} onFinish={fecharIntro} onSkip={fecharIntro}/>}</AnimatePresence>
    <header className="gang-cena-worldhud"><button onClick={()=>{guardarPosicao();onNavigate('story')}}>← MAPA</button><strong>A PISTA <i>{feitos}/{total}</i></strong><span>💵 {store.grana}　⚑ {store.rep}</span></header>
    <div className="gang-cena-viewport" ref={viewportRef}><div className="gang-cena-world" style={{width:WORLD.w,height:WORLD.h,transform:`translate3d(${-camX}px,${-camY}px,0)`}}><WorldScenery bossAberto={bossAberto}/>{pinos.map(p=><EntryZone key={`zone-${p.id}`} poi={p} active={perto?.id===p.id}/>)}{PLACES.map(p=><div key={p[0]} className={`gang-world-place ${p[5]?'is-gate':''} ${p[5]&&bossAberto?'is-open':''}`} style={{left:p[1],top:p[2]}}><b>{p[3]}</b><span>{p[4]}</span>{p[5]&&<em>{bossAberto?'ABERTO':'FECHADO'}</em>}</div>)}{pinos.map(p=><div key={p.id} className={`gang-world-npc is-${p.estado} ${p.ehChefe?'is-boss':''}`} style={{left:p.world.x,top:p.world.y}}><span>{p.ehChefe?'★':ICONE[p.tipo]||'•'}</span>{p.estado!=='trancado'&&<small>{p.ehChefe?'FUMAÇA':t(`${p.i18n}.nome`)}</small>}</div>)}<GangMarker player={player} facing={facing} gangName={store.gangName}/></div><div className="gang-cena-vignette"/><div className="gang-cena-status"><span>FÔLEGO</span><i><b style={{width:`${folego}%`}}/></i></div>{hint&&<div className="gang-cena-tutorial">{hint}</div>}{!bossAberto&&player.y<420&&<div className="gang-cena-gatelock">🔒 O portão só abre quando todo o trabalho na Pista estiver feito.</div>}</div>
    <WorldControls onInput={v=>{inputRef.current=v}} onInteract={()=>abrir(perto)} action={perto?interactionLabel(perto):null}/>
    <AnimatePresence>{toast&&<motion.div className="gang-cena-toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}><b>RECOMPENSA</b>{toast.grana?<span>💵 +{toast.grana}</span>:null}{toast.rep?<span>⚑ +{toast.rep}</span>:null}{toast.xp?<span>⚡ +{toast.xp} XP</span>:null}</motion.div>}</AnimatePresence>
    <AnimatePresence>{encontro&&<motion.div className="gang-cena-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="gang-cena-modal-bg" onClick={()=>setEncontro(null)}/><motion.div className="gang-cena-modal-card" initial={{y:25}} animate={{y:0}}>{encontro.vs?<TretaVS poi={encontro.poi} folegoBaixo={folego<=30} onSim={()=>iniciarTreta(encontro.poi)} onNao={()=>setEncontro(null)} t={t}/>:encontro.poi.tipo==='papo'?<GanguesPapo poi={encontro.poi} cena={cena} onResolve={resolver} onClose={()=>setEncontro(null)}/>:encontro.poi.tipo==='descanso'?<GanguesDescanso poi={encontro.poi} cena={cena} onClose={()=>setEncontro(null)}/>:<GanguesParada poi={encontro.poi} cena={cena} onResolve={resolver} onClose={()=>setEncontro(null)}/>}</motion.div></motion.div>}</AnimatePresence>
  </main>
}

function WorldScenery({bossAberto}){return <><div className="gang-road road-main"/><div className="gang-road road-cross r1"/><div className="gang-road road-cross r2"/><div className="gang-road road-cross r3"/><div className="gang-road road-branch left"/><div className="gang-road road-branch right"/><div className="gang-world-zone z-praca">PRAÇA DA PISTA</div><div className="gang-world-zone z-quadra"/><div className={`gang-world-gate ${bossAberto?'is-open':''}`}/><div className="gang-world-graffiti">A RUA<br/>LEMBRA</div>{[120,300,510,680,850,1040,1240,1430,1610].map((y,i)=><span key={y} className="gang-world-lamp" style={{left:i%2?690:45,top:y}}/>)}</>}
function GangMarker({player,facing,gangName}){return <motion.div className={`gang-world-player is-gang facing-${facing}`} animate={{left:player.x,top:player.y}} transition={{duration:.16,ease:'easeOut'}}><span><i/><i/><i/></span><small>{gangName||'GANGUE'}</small></motion.div>}
function EntryZone({poi,active}){const z=ENTRY_ZONES[poi.id];if(!z||poi.estado==='trancado'||poi.estado==='resolvido')return null;return <div className={`gang-world-entry${active?' is-active':''}`} style={{left:z.x,top:z.y,width:z.w,height:z.h}}/>}
function validPosition(p){return Number.isFinite(p?.x)&&Number.isFinite(p?.y)&&p.x>=35&&p.x<=WORLD.w-35&&p.y>=70&&p.y<=WORLD.h-40}
function insideZone(p,z){return Boolean(z&&p.x>=z.x&&p.x<=z.x+z.w&&p.y>=z.y&&p.y<=z.y+z.h)}
function hitsSolid(x,y,bossAberto){const hit=COLLIDERS.some(r=>x+PLAYER_RADIUS>r.x&&x-PLAYER_RADIUS<r.x+r.w&&y+PLAYER_RADIUS>r.y&&y-PLAYER_RADIUS<r.y+r.h);if(hit)return true;if(y-PLAYER_RADIUS<350&&y+PLAYER_RADIUS>330){const inOpening=x-PLAYER_RADIUS>=470&&x+PLAYER_RADIUS<=675;return !bossAberto||!inOpening}return false}
function stepPlayer(p,dx,dy,bossAberto){const x=Math.max(35,Math.min(WORLD.w-35,p.x+dx*TILE)),y=Math.max(70,Math.min(WORLD.h-40,p.y+dy*TILE));return hitsSolid(x,y,bossAberto)?p:{x,y}}
function WorldControls({onInput,onInteract,action}){const base=useRef(null),active=useRef(null);const update=useCallback((x,y)=>{const r=base.current?.getBoundingClientRect();if(!r)return;let dx=x-(r.left+r.width/2),dy=y-(r.top+r.height/2);const d=Math.hypot(dx,dy),max=42;if(d>max){dx=dx/d*max;dy=dy/d*max}base.current.style.setProperty('--jx',`${dx}px`);base.current.style.setProperty('--jy',`${dy}px`);onInput({x:dx/max,y:dy/max})},[onInput]);const stop=useCallback(()=>{active.current=null;if(base.current){base.current.style.setProperty('--jx','0px');base.current.style.setProperty('--jy','0px')}onInput({x:0,y:0})},[onInput]);return <div className="gang-world-controls"><div ref={base} className="gang-world-stick" onPointerDown={e=>{active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);update(e.clientX,e.clientY)}} onPointerMove={e=>{if(active.current===e.pointerId)update(e.clientX,e.clientY)}} onPointerUp={stop} onPointerCancel={stop}><i/></div><button disabled={!action} onClick={onInteract}><b>{action||'...'}</b><span>INTERAGIR</span></button></div>}
function interactionLabel(p){if(p.ehChefe)return'DESAFIAR';return({papo:'FALAR',treta:'ENCARAR',parada:'INVESTIGAR',corre:'SEGUIR',descanso:'ENTRAR'})[p.tipo]||'INTERAGIR'}
const ICONE={treta:'✊',parada:'🔧',papo:'●',corre:'!',achado:'◆',descanso:'☕'}
function estadoPoi(p,prog){if(!p.visivel&&!prog.revelados[p.id])return'escondido';if(prog.resolvidos[p.id]&&!p.repetivel)return'resolvido';return'disponivel'}
function TretaVS({poi,folegoBaixo,onSim,onNao,t}){const enemy=enemiesData.find(e=>e.id===poi.enemy),nome=poi.ehChefe?t(`games.gangues.story.bosses.${poi.boss}.nome`):t(`${poi.i18n}.nome`),fala=poi.ehChefe?t(`games.gangues.story.bosses.${poi.boss}.fala`,{suaGangue:t('games.gangues.report.your_gang')}):t(`${poi.i18n}.fala`);return <div className="gang-cena-enc gang-cena-enc--vs"><span className="gang-cena-enc-selo">{(nome||'?')[0]}</span><span className="gang-cena-eyebrow">{poi.ehChefe?'CHEFÃO':'TRETA'}</span><h3 className="gang-cena-enc-titulo">{nome}</h3><p className="gang-cena-papo-fala">{fala}</p>{enemy&&<span className="gang-cena-vs-stats">{['A','H','R','D'].map(a=><span key={a}><i>{a}</i>{enemy.stats?.[a]??'—'}</span>)}</span>}{folegoBaixo&&<p className="gang-cena-vs-aviso">Sua gangue está sem fôlego.</p>}<div className="gang-cena-enc-acoes"><button className="gang-cena-btn" onClick={onNao}>AGORA NÃO</button><button className="gang-cena-btn gang-cena-btn--go" onClick={onSim}>PARTIR PRA CIMA</button></div></div>}
