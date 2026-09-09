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
import GanguesLoja from './components/cena/GanguesLoja'
import CenaCenario from './components/cena/CenaCenario'
import CenaInterior from './components/cena/CenaInterior'
import { CENAS_POR_ID, portaoAberto, contarCena } from './data/cenas/pista.js'
import { GANGUES_TERRITORIO_POR_ID } from './data/ganguesTerritorios.js'
import { calcularPontosTime } from './data/ganguesEncontros.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX, getGanguesResources, getGanguesProgression, ganguesXpMaxForSheet } from './data/ganguesLoadout.js'
import { getGanguesCharacter, getGanguesLevelFromXp, getGanguesUnlockedSpecials } from './data/ganguesCharacters.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources, getGanguesEquip } from './data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA } from './data/ganguesItens.js'
import GanguesFichaCard from './components/GanguesFichaCard'
import GanguesEquipPanel from './components/GanguesEquipPanel'
import GanguesSkillGrid from './components/GanguesSkillGrid'
import './GanguesCena.css'

const WORLD={w:760,h:1840}, SPAWN={x:380,y:1720}, TILE=20, STEP_MS=110, PLAYER_RADIUS=18
// Igual aos outros tutoriais do NeoGuide (paths/atributos): guarda no
// localStorage, não só em memória. Um Set em memória esquecia tudo a cada
// recarregada de página — o jogador via a intro de novo toda vez que
// voltava a entrar na Pista, mesmo já tendo visto antes.
const SCENE_INTRO_KEY='ldi-gangues-cena-intro-vista'
function cenaIntroJaVista(id){try{return JSON.parse(localStorage.getItem(SCENE_INTRO_KEY)||'[]').includes(id)}catch{return false}}
function marcarCenaIntroVista(id){try{const atual=JSON.parse(localStorage.getItem(SCENE_INTRO_KEY)||'[]');if(!atual.includes(id))localStorage.setItem(SCENE_INTRO_KEY,JSON.stringify([...atual,id]))}catch{}}
const POS={sinal:{x:210,y:1570},ferro:{x:150,y:1325},achado:{x:110,y:1245},beco:{x:445,y:1190},birosca:{x:170,y:1460},corre:{x:610,y:1010},beco_2:{x:445,y:505},beco_3:{x:315,y:600},sinaleiro:{x:435,y:640},rasteira_velha:{x:380,y:460},oficina:{x:250,y:705},descanso:{x:205,y:1440},informante:{x:150,y:740},rinha:{x:610,y:740},loja:{x:210,y:250},boss:{x:570,y:175}}
// Um obstáculo `solido` vira um retângulo de colisão PEQUENO em volta do ponto
// (o jogador tem raio 18; corredor da pista ~186px — colisor grande trancava).
function obstRect(o){return {x:o.x-15,y:o.y-11,w:30,h:22}}
function collidersDaCena(cena,bossAberto){
  if(!cena) return []
  const q=cena.quarteiroes||[]
  const s=(cena.obstaculos||[]).filter(o=>o.solido).map(obstRect)
  // prédios `solo` (fora dos quarteirões): a fachada é sólida; a porta é uma
  // zona à parte no chão (porta.zx/zy), então não precisa de "vão".
  const p=(cena.predios||[]).filter(pr=>pr.solo&&(!pr.pos_portao||bossAberto)).map(pr=>({x:pr.x,y:pr.y,w:pr.w,h:pr.h}))
  return [...q,...s,...p]
}
const ENTRY_ZONES={
  sinal:{x:243,y:1532,w:70,h:76},ferro:{x:270,y:1288,w:35,h:76},achado:{x:75,y:1212,w:72,h:72},beco:{x:355,y:1155,w:76,h:70},
  birosca:{x:270,y:1418,w:35,h:82},corre:{x:455,y:970,w:35,h:82},beco_2:{x:350,y:465,w:76,h:82},
  // rasteira_velha: no corredor central logo abaixo do portão — o último
  // desafio antes do muro. loja: já do OUTRO lado do portão (y<350).
  rasteira_velha:{x:345,y:425,w:70,h:80},loja:{x:175,y:216,w:72,h:72},
  // beco_3 + sinaleiro no corredor central (x287-473) entre o portão e os
  // prédios; oficina no vão aberto logo abaixo (y>676, x<287).
  beco_3:{x:290,y:572,w:64,h:64},sinaleiro:{x:406,y:612,w:60,h:60},oficina:{x:220,y:678,w:64,h:62},
  // informante/rinha ficam num trecho SEM colisor nenhum (y:705-781 não tem
  // nenhum COLLIDERS cobrindo essa faixa) — diferente de ferro/corre/etc,
  // que hospedam perto de prédio de verdade e por isso a zona anda longe do
  // pino (encosta na borda do prédio, não no ícone). Aqui não existe prédio,
  // então a zona fica centralizada NO PRÓPRIO ícone — senão o jogador anda
  // até o que vê na tela e nada acontece, porque a zona de verdade tava
  // longe dali.
  descanso:{x:270,y:1375,w:35,h:72},informante:{x:120,y:710,w:60,h:60},rinha:{x:580,y:710,w:60,h:60},
  boss:{x:530,y:300,w:80,h:45},
}

// ── Ambiente ativo (rua OU cômodo de interior) ────────────────
// Um "ambiente" abstrai o que o motor precisa: mundo, colisão e a lista de
// ALVOS (pinos de POI + porta + saída + passagem). Rua e interior usam o
// mesmo código de navegação e o mesmo botão de ação contextual.
function resolverRefPoi(cena,refId){
  if(refId==='__chefe') return {...cena.chefe,id:'boss',ehChefe:true}
  return cena.pois.find(p=>p.id===refId)||null
}
function estadoInternoPoi(def,prog){
  if(def.ehChefe) return prog.boss?'resolvido':'disponivel'
  if(prog.resolvidos[def.id]&&!def.repetivel) return 'resolvido'
  return 'disponivel'
}
// ids de POI que "moram dentro" de um interior — somem do mapa da rua.
function refsInternos(cena){
  const s=new Set()
  for(const inter of Object.values(cena.interiores||{}))
    for(const com of inter.comodos||[])
      for(const pd of com.pois||[]) if(pd.ref&&pd.ref!=='__chefe') s.add(pd.ref)
  return s
}
function montarAmbiente(cena,local,prog,baseFeita,muroAberto){
  if(!cena) return null
  const laDeCima=baseFeita||muroAberto // pode chegar do outro lado do muro (tunelando ou pelo muro aberto)
  if(!local){
    const dentro=refsInternos(cena)
    const pois=cena.pois
      .filter(p=>!dentro.has(p.id)&&(p.visivel||prog.revelados[p.id]||(p.pos_portao&&laDeCima)))
      .map(p=>({...p,world:POS[p.id],zona:ENTRY_ZONES[p.id],
        estado:(p.pos_portao&&laDeCima)?estadoPoi({...p,visivel:true},prog):estadoPoi(p,prog),
        farmCompleto:Boolean(p.repetivel&&prog.resolvidos[p.id])}))
      .filter(p=>p.world)
    // portas dos prédios que abrem interior (porta.zx/zy = zona no chão)
    const portas=(cena.predios||[]).filter(pr=>pr.porta?.para&&(!pr.pos_portao||laDeCima)).map(pr=>{
      const inter=cena.interiores?.[pr.porta.para]
      const gatePorPoi=inter?.abreCom
      const liberada=inter?.gate==='portao'
        ? baseFeita
        : (!gatePorPoi||prog.revelados[gatePorPoi]||prog.resolvidos[gatePorPoi]||prog.boss)
      const zx=pr.porta.zx??(pr.x+pr.w/2), zy=pr.porta.zy??(pr.y+pr.h+16)
      return {id:`porta_${pr.id}`,ehPorta:true,interId:pr.porta.para,predioId:pr.id,
        comodo:pr.porta.comodo||0,spawn:pr.porta.spawn,
        world:{x:zx,y:zy},zona:{x:zx-34,y:zy-30,w:68,h:60},
        estado:inter?(liberada?'disponivel':'trancado'):'trancado'}
    })
    // se existe galpão-interior, o pino de chefe da RUA some (a luta é dentro)
    const temGalpaoInterno=Boolean(cena.interiores?.galpao)
    const alvos=[...pois,...portas]
    if(!temGalpaoInterno){
      alvos.push({...cena.chefe,world:POS.boss,zona:ENTRY_ZONES.boss,ehChefe:true,
        estado:prog.boss?'resolvido':laDeCima?'disponivel':'trancado'})
    }
    return {interior:false,world:cena.mundo||WORLD,colliders:collidersDaCena(cena,laDeCima),
      gateAtivo:muroAberto?null:'fechado', // o muro só abre depois do Carvão
      alvos:alvos.filter(a=>a.world),nomeLugar:null}
  }
  // interior
  const inter=cena.interiores?.[local.id]
  const com=inter?.comodos?.[local.comodo]||inter?.comodos?.[0]
  if(!com) return null
  const pois=(com.pois||[]).map(pd=>{
    if(pd.precisa&&!prog.resolvidos[pd.precisa]) return null
    const def=pd.ref?resolverRefPoi(cena,pd.ref):pd.poi
    if(!def) return null
    return {...def,world:pd.pos,zona:{x:pd.pos.x-34,y:pd.pos.y-34,w:68,h:68},
      estado:estadoInternoPoi(def,prog),farmCompleto:Boolean(def.repetivel&&prog.resolvidos[def.id])}
  }).filter(Boolean)
  const alvos=[...pois]
  if(com.saida) alvos.push({id:'__saida',ehSaida:true,paraPredio:com.saida.paraPredio,world:{x:com.saida.x+com.saida.w/2,y:com.saida.y+com.saida.h/2},zona:com.saida,estado:'disponivel'})
  if(com.voltaPara!=null){const zw=com.world.w;alvos.push({id:'__volta',ehVolta:true,para:com.voltaPara,world:{x:zw/2,y:com.world.h-16},zona:{x:0,y:com.world.h-22,w:zw,h:22},estado:'disponivel'})}
  if(com.passagem){const pg=com.passagem;const trancada=pg.precisa&&!prog.resolvidos[pg.precisa]
    alvos.push({id:'__passagem',ehPassagem:true,para:pg.para,label:pg.label,precisa:pg.precisa,
      world:{x:pg.x+pg.w/2,y:pg.y+pg.h/2},zona:pg,estado:trancada?'trancado':'disponivel'})}
  return {interior:true,world:com.world,colliders:com.colliders||[],gateAtivo:false,
    alvos,nomeLugar:inter.nome,comodoIdx:local.comodo,comodoTotal:inter.comodos.length,cenario:com.cenario||[]}
}

export default function GanguesCena({onNavigate}){
  const {t}=useLanguage(), store=useGanguesStore(), territorioId=store.storyTarget?.territorioId
  const cena=CENAS_POR_ID[territorioId]||null, terr=GANGUES_TERRITORIO_POR_ID[territorioId]||null
  const prog=store.cenaProgresso[cena?.id]||{resolvidos:{},revelados:{},boss:false,folego:100}
  // `local` = null (rua) OU { id: <interiorId>, comodo: <n> }. Restaurado do
  // save junto da posição, pra reentrar na cena onde parou (até dentro do galpão).
  const [local,setLocal]=useState(()=>prog.posicao?.local||null)
  const posInicial=()=>{
    const p=prog.posicao
    if(p?.local){const c=cena?.interiores?.[p.local.id]?.comodos?.[p.local.comodo]
      return c?(validPos(p,c.world)?{x:p.x,y:p.y}:c.spawn):SPAWN}
    return validPosition(p)?{x:p.x,y:p.y}:(cena?.mundo?.spawn||SPAWN)
  }
  const [intro,setIntro]=useState(()=>Boolean(cena&&!cenaIntroJaVista(cena.id))),[player,setPlayer]=useState(posInicial),[facing,setFacing]=useState('up'),[encontro,setEncontro]=useState(null),[toast,setToast]=useState(null),[hint,setHint]=useState(()=>t('games.gangues.cena.hint_andar')),[andou,setAndou]=useState(false),[fade,setFade]=useState(false)
  const [fichaIndex,setFichaIndex]=useState(null)
  const [bagAberta,setBagAberta]=useState(false)
  const viewportRef=useRef(null),inputRef=useRef({x:0,y:0}),keysRef=useRef(new Set())
  // baseFeita = fechou os ponto (portao.precisa) → destranca o TÚNEL e libera o
  // lado de lá. muroAberto = bateu o Carvão → aí sim o muro abre de vez (pra
  // facilitar o vai-e-vem). O muro NUNCA abre só por fechar os ponto.
  const baseFeita=cena?portaoAberto(cena,prog.resolvidos):false
  const muroAberto=Boolean(prog.boss)
  const folego=prog.folego??100
  const amb=useMemo(()=>montarAmbiente(cena,local,prog,baseFeita,muroAberto),[cena,local,prog,baseFeita,muroAberto])
  const collidersRef=useRef(null); collidersRef.current=amb?.colliders||[]
  const worldRef=useRef(null); worldRef.current=amb?.world||WORLD
  const gateRef=useRef(null); gateRef.current=amb?.gateAtivo||null
  const perto=useMemo(()=>(amb?.alvos||[]).find(a=>(a.estado==='disponivel'||a.repetivel)&&insideZone(player,a.zona))||null,[amb,player])
  const {feitos,total}=cena?contarCena(cena,prog.resolvidos,prog.boss):{feitos:0,total:0}
  // local aponta pra um interior/cômodo que não existe (save antigo, cena
  // diferente) → volta pra rua.
  useEffect(()=>{if(cena&&local&&!amb){setLocal(null);setPlayer(cena.mundo?.spawn||SPAWN)}},[cena,local,amb])

  useEffect(()=>{const down=e=>{if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(e.key.toLowerCase())){e.preventDefault();keysRef.current.add(e.key.toLowerCase())}},up=e=>keysRef.current.delete(e.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[])
  useEffect(()=>{
    if(intro||encontro||fade) return
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
        setAndou(true)
        setPlayer(p=>stepPlayer(p,dx,dy,gateRef.current,collidersRef.current,worldRef.current))
      }
      timer=setTimeout(passo,STEP_MS)
    }
    timer=setTimeout(passo,0)
    return()=>{cancelado=true;clearTimeout(timer)}
  },[intro,encontro,fade])
  useEffect(()=>{
    if(intro||encontro)return
    if(!andou){setHint(t('games.gangues.cena.hint_andar'));return}
    if(local){setHint(null);return}
    if(perto&&Object.keys(prog.resolvidos).length===0){setHint(t('games.gangues.cena.hint_interagir'));return}
    if(prog.resolvidos.ferro&&!prog.resolvidos.oficina){setHint(t('games.gangues.cena.hint_sucata'));return}
    setHint(null)
  },[intro,encontro,andou,perto,prog.resolvidos,local,t])
  if(!cena||!terr)return <main className="gang-lobby"><button className="gang-new-sheet" onClick={()=>onNavigate('story')}>← MAPA</button></main>
  // `local` aponta pra um interior inválido — o efeito acima já vai zerar; só
  // não renderiza esse frame pra não quebrar em amb null.
  if(local&&!amb)return <main className="gang-cena-worldpage" style={{'--terr-cor':cena.cor}}><div className="gang-cena-viewport"/></main>
  const fecharIntro=()=>{marcarCenaIntroVista(cena.id);setIntro(false)}
  const guardarPosicao=(over)=>store.salvarPosicaoCena(cena.id,{...(over||player),local:over?.local!==undefined?over.local:local})
  // troca de ambiente com fade curto (rua↔interior, cômodo↔cômodo)
  const trocarPara=(novoLocal,spawn)=>{
    sfx.select?.();setFade(true)
    setTimeout(()=>{
      setLocal(novoLocal); if(spawn)setPlayer(spawn)
      guardarPosicao({...(spawn||player),local:novoLocal})
      setFade(false)
    },170)
  }
  const entrar=(interId,comodo=0,spawnOver)=>{
    const inter=cena.interiores?.[interId]; if(!inter?.comodos?.length) return
    const idx=inter.comodos[comodo]?comodo:0
    trocarPara({id:interId,comodo:idx},spawnOver||inter.comodos[idx].spawn)
  }
  // `paraPredio` = túnel que emerge no OUTRO lado do muro; senão volta pela
  // porta pela qual entrou (prédio pequeno: entrada = saída). `+8` no y pra
  // não re-acionar o ENTRAR no ato.
  const sair=(paraPredio)=>{
    const inter=cena.interiores?.[local.id]
    const predId=paraPredio||inter?.porta?.predio
    const pr=(cena.predios||[]).find(p=>p.id===predId)
    const zx=pr?.porta?.zx??(pr?(pr.x+pr.w/2):player.x)
    const zy=(pr?.porta?.zy??(pr?pr.y+pr.h+16:player.y))+8
    trocarPara(null,{x:zx,y:zy})
  }
  const irComodo=(n)=>{
    const inter=cena.interiores?.[local.id]; const com=inter?.comodos?.[n]; if(!com) return
    trocarPara({id:local.id,comodo:n},com.spawn)
  }
  const abrir=poi=>{
    if(!poi||poi.estado==='trancado')return
    if(poi.ehPorta){entrar(poi.interId,poi.comodo||0,poi.spawn);return}
    if(poi.ehSaida){sair(poi.paraPredio);return}
    if(poi.ehVolta){irComodo(poi.para);return}
    if(poi.ehPassagem){irComodo(poi.para);return}
    guardarPosicao()
    if(poi.tipo==='achado'){
      sfx.reward?.()
      const r=poi.recompensa||{}
      if(r.grana)store.ganharGrana(r.grana)
      if(r.rep)store.ganharRep(r.rep)
      if(r.item)store.darItem(r.item,r.qtd||1)
      if(r.grana||r.rep||r.item){setToast(r);setTimeout(()=>setToast(null),2600)}
      store.marcarPoiResolvido(cena.id,poi.id,poi.revela||[])
      return
    }
    sfx.select();setEncontro({poi,vs:poi.tipo==='treta'})
  }
  const iniciarTreta=(poi,{viraTreta,revela}={})=>{
    const chefe=Boolean(poi.ehChefe)
    guardarPosicao();sfx.vs?.()
    // Treta repetível ("farma"): trava o retrato de pontos na primeira vez —
    // as próximas entradas usam sempre esse mesmo número, então o bando não
    // cresce junto com a gangue (ver travarPontosFarm no store).
    let pontosFixos=null
    if(poi.repetivel && !viraTreta && !chefe){
      const party=store.roster.slice(0,GANGUES_STORY_BATTLE_PARTY_MAX)
      pontosFixos=store.travarPontosFarm(cena.id,poi.id,calcularPontosTime(party))
    }
    store.setStoryTarget({territorioId:terr.id,cenaId:cena.id,cenaPoiId:poi.id,cenaRevela:viraTreta?(revela||[]):(poi.revela||[]),cenaRecompensa:viraTreta?(viraTreta.recompensa||null):poi.recompensa||null,pontoIds:terr.pontos.map(p=>p.id),noId:chefe?cena.chefe.poiNo:null,enemyId:viraTreta?viraTreta.enemy:poi.enemy,fixo:Boolean(viraTreta),liderFixo:viraTreta?null:poi.liderFixo,dificuldade:poi.dificuldade,isChefe:chefe,repDelta:viraTreta?.rep||0,pontosFixos})
    onNavigate('story-combat')
  }
  const resolver=res=>{
    const poi=encontro.poi;setEncontro(null)
    if(res?.viraTreta){iniciarTreta(poi,{viraTreta:res.viraTreta,revela:res.revela});return}
    // Escolha com requisito de item (fetch quest do Nando): consome os itens —
    // aborta sem marcar nada se faltar (o botão já vem travado, isso é rede).
    if(res?.precisaItens&&!store.gastarItens(res.precisaItens))return
    if(res?.custoGrana)store.gastarGrana(res.custoGrana)
    if(typeof res?.folego==='number')store.ajustarFolego(cena.id,res.folego)
    if(res?.informante)store.marcarInformante(res.informante)
    ;(res?.daEquip||[]).forEach(id=>store.comprarEquip(id,0))
    const r=res?.recompensa||{}
    if(r.grana)store.ganharGrana(r.grana)
    if(r.rep)store.ganharRep(r.rep)
    if(r.item)store.darItem(r.item,r.qtd||1)
    if(r.grana||r.rep||r.xp||r.item||res?.daEquip?.length){setToast(r);setTimeout(()=>setToast(null),2600)}
    if(!poi.repetivel)store.marcarPoiResolvido(cena.id,poi.id,res?.revela||poi.revela||[])
    else if(res?.revela)store.revelarPoi(cena.id,res.revela)
  }
  // Território dominado NÃO fecha a cena — as tretas repetíveis (rinha) e o
  // informante moram aqui e têm que continuar alcançáveis pra sempre. Antes
  // isso trocava a cena inteira por uma tela de "dominado" sem saída, o que
  // trancava o jogador pra fora do próprio conteúdo de farm que ele tinha
  // que revisitar. Agora só mostra um selo no cabeçalho.
  const W=amb?.world||WORLD
  const vw=viewportRef.current?.clientWidth||390,vh=viewportRef.current?.clientHeight||620,lookX=facing==='right'?52:facing==='left'?-52:0,lookY=facing==='down'?60:facing==='up'?-60:0
  const camX=W.w<=vw?(W.w-vw)/2:Math.max(0,Math.min(W.w-vw,player.x-vw/2+lookX))
  const camY=W.h<=vh?(W.h-vh)/2:Math.max(0,Math.min(W.h-vh,player.y-vh/2+lookY))
  const breadcrumb=local
    ? `${t(amb.nomeLugar)}${amb.comodoTotal>1?` · ${t('games.gangues.cena.comodo',{n:amb.comodoIdx+1,de:amb.comodoTotal})}`:''}`
    : `A PISTA `
  return <main className={`gang-cena-worldpage${local?' is-interior':''}`} style={{'--terr-cor':cena.cor}}>
    <AnimatePresence>{intro&&<GangDialog lines={t(cena.chegada)} speaker={t(cena.falante)} sub={t(cena.falanteSub)} onFinish={fecharIntro} onSkip={fecharIntro}/>}</AnimatePresence>
    <header className="gang-cena-worldhud"><button onClick={()=>{local?sair():(guardarPosicao(),onNavigate('story'))}}>← {local?t('games.gangues.cena.acao.sair'):'MAPA'}</button><strong>{breadcrumb}{!local&&(prog.boss?<i className="gang-cena-dominado-selo">⚑ DOMINADA</i>:<i>{feitos}/{total}</i>)}</strong><span>💵 {store.grana}　⚑ {store.rep}</span><button className="gang-cena-ficha-btn" onClick={()=>setBagAberta(true)} aria-label={t('games.gangues.bag.titulo')}>🎒</button>{store.activeParty.length>0&&<button className="gang-cena-ficha-btn" onClick={()=>setFichaIndex(0)}>👤</button>}<button className="gang-cena-ficha-btn" onClick={()=>{guardarPosicao();onNavigate('album')}} aria-label={t('games.gangues.album.titulo')}>📕</button></header>
    <div className="gang-cena-viewport" ref={viewportRef}><div className="gang-cena-world" style={{width:W.w,height:W.h,transform:`translate3d(${-camX}px,${-camY}px,0)`}}>
      {local?<CenaInterior amb={amb}/>:<CenaCenario cena={cena} bossAberto={baseFeita||muroAberto} muroAberto={muroAberto}/>}
      {(amb?.alvos||[]).map(p=><EntryZone key={`zone-${p.id}`} poi={p} active={perto?.id===p.id}/>)}
      {(amb?.alvos||[]).map(p=><PinoAlvo key={p.id} p={p} t={t}/>)}
      <GangMarker player={player} facing={facing} gangName={store.gangName}/>
    </div><div className="gang-cena-vignette"/><div className="gang-cena-status"><span>FÔLEGO</span><i><b style={{width:`${folego}%`}}/></i></div>{hint&&<div className="gang-cena-tutorial">{hint}</div>}{!local&&!muroAberto&&player.y<430&&<div className="gang-cena-gatelock">🔒 {t(baseFeita?'games.gangues.cena.muro_tunel':'games.gangues.cena.boss_trancado')}</div>}<AnimatePresence>{fade&&<motion.div className="gang-cena-fade" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.16}}/>}</AnimatePresence></div>
    <WorldControls onInput={v=>{inputRef.current=v}} onInteract={()=>abrir(perto)} action={perto?interactionLabel(perto,t):null}/>
    <AnimatePresence>{toast&&<motion.div className="gang-cena-toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}><b>RECOMPENSA</b>{toast.grana?<span>💵 +{toast.grana}</span>:null}{toast.rep?<span>⚑ +{toast.rep}</span>:null}{toast.xp?<span>⚡ +{toast.xp} XP</span>:null}</motion.div>}</AnimatePresence>
    <AnimatePresence>{encontro&&<motion.div className="gang-cena-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="gang-cena-modal-bg" onClick={()=>setEncontro(null)}/><motion.div className="gang-cena-modal-card" initial={{y:25}} animate={{y:0}}>{encontro.vs?<TretaVS poi={encontro.poi} folegoBaixo={folego<=30} onSim={()=>iniciarTreta(encontro.poi)} onNao={()=>setEncontro(null)} t={t}/>:encontro.poi.tipo==='papo'?<GanguesPapo poi={encontro.poi} cena={cena} onResolve={resolver} onClose={()=>setEncontro(null)}/>:encontro.poi.tipo==='descanso'?<GanguesDescanso poi={encontro.poi} cena={cena} onClose={()=>setEncontro(null)}/>:encontro.poi.tipo==='loja'?<GanguesLoja poi={encontro.poi} onClose={()=>setEncontro(null)}/>:<GanguesParada poi={encontro.poi} cena={cena} onResolve={resolver} onClose={()=>setEncontro(null)}/>}</motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{fichaIndex!==null&&store.activeParty[fichaIndex]&&<motion.div className="gang-cena-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="gang-cena-modal-bg" onClick={()=>setFichaIndex(null)}/><motion.div className="gang-cena-modal-card gang-cena-ficha-scroll" initial={{y:25}} animate={{y:0}}><div className="gang-cena-enc-acoes gang-cena-ficha-nav">{store.activeParty.length>1&&<button className="gang-cena-btn" onClick={()=>setFichaIndex(i=>(i+store.activeParty.length-1)%store.activeParty.length)}>◀ ANTERIOR</button>}<button className="gang-cena-btn gang-cena-btn--go" onClick={()=>setFichaIndex(null)}>FECHAR</button>{store.activeParty.length>1&&<button className="gang-cena-btn" onClick={()=>setFichaIndex(i=>(i+1)%store.activeParty.length)}>PRÓXIMO ▶</button>}</div><FichaCenaCard member={store.activeParty[fichaIndex]} t={t}/></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{bagAberta&&<motion.div className="gang-cena-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="gang-cena-modal-bg" onClick={()=>setBagAberta(false)}/><motion.div className="gang-cena-modal-card gang-cena-ficha-scroll" initial={{y:25}} animate={{y:0}}><BagSheet store={store} t={t} onClose={()=>setBagAberta(false)}/></motion.div></motion.div>}</AnimatePresence>
  </main>
}

// Bolsa da gangue — o que o bando tem de item (consumível + equipamento
// guardado). É a MESMA fonte que a loja abastece e que o combate lê pra usar
// poção (store.inventario / store.equipamentos) — um sistema só.
function BagSheet({store,t,onClose}){
  const consumiveis=GANGUES_ITENS_LISTA.map(it=>({...it,qtd:store.inventario[it.id]||0})).filter(it=>it.qtd>0)
  const pecas=Object.values(store.equipamentos.reduce((acc,eq)=>{
    const def=getGanguesEquip(eq.itemId); if(!def)return acc
    acc[eq.itemId]=acc[eq.itemId]||{def,qtd:0}; acc[eq.itemId].qtd++; return acc
  },{}))
  const vazio=consumiveis.length===0&&pecas.length===0
  return <div className="gang-cena-enc gang-cena-enc--bag">
    <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
    <span className="gang-cena-eyebrow">{t('games.gangues.bag.eyebrow')}</span>
    <h3 className="gang-cena-enc-titulo">{t('games.gangues.bag.titulo')}</h3>
    <p className="gang-cena-enc-sub"><b>💵 {store.grana}　⚑ {store.rep}</b></p>
    {vazio&&<p className="gang-cena-enc-sub">{t('games.gangues.bag.vazio')}</p>}
    {consumiveis.length>0&&<>
      <small className="gang-bag-sec">{t('games.gangues.bag.consumiveis')}</small>
      <div className="gang-bag-lista">{consumiveis.map(it=><div key={it.id} className="gang-bag-row"><span>{it.icone}</span><strong>{t(it.nome)}</strong><b>×{it.qtd}</b></div>)}</div>
      <p className="gang-bag-nota">{t('games.gangues.bag.nota_combate')}</p>
    </>}
    {pecas.length>0&&<>
      <small className="gang-bag-sec">{t('games.gangues.bag.equip_bolso')}</small>
      <div className="gang-bag-lista">{pecas.map(({def,qtd})=><div key={def.id} className="gang-bag-row"><span>{def.icone}</span><strong>{t(def.nome)}</strong><small>{t(`games.gangues.equip.slots.${def.slot}`)}</small><b>×{qtd}</b></div>)}</div>
      <p className="gang-bag-nota">{t('games.gangues.bag.nota_equip')}</p>
    </>}
    <div className="gang-cena-enc-acoes"><button className="gang-cena-btn gang-cena-btn--go" onClick={onClose}>{t('games.gangues.cena.fechar')}</button></div>
  </div>
}

function GangMarker({player,facing,gangName}){return <motion.div className={`gang-world-player is-gang facing-${facing}`} animate={{left:player.x,top:player.y}} transition={{duration:STEP_MS/1000,ease:'easeOut'}}><span><i/><i/><i/></span><small>{gangName||'GANGUE'}</small></motion.div>}
function EntryZone({poi,active}){const z=poi.zona;if(!z||poi.estado==='trancado'||poi.estado==='resolvido')return null;return <div className={`gang-world-entry${active?' is-active':''}${poi.farmCompleto?' is-farm-completo':''}${poi.ehPorta||poi.ehSaida||poi.ehVolta||poi.ehPassagem?' is-porta':''}`} style={{left:z.x,top:z.y,width:z.w,height:z.h}}/>}
// Pino do alvo (POI, porta, saída, passagem). `ehChefe`/`ehPorta`/... decidem o ícone e o rótulo.
function PinoAlvo({p,t}){
  if(p.estado==='trancado'&&!(p.ehPassagem||p.ehChefe))return null
  const icone=p.ehChefe?'★':p.ehPorta?'🚪':p.ehSaida?'↩':p.ehVolta?'↩':p.ehPassagem?(p.label==='subir'?'▲':'▶'):(ICONE[p.tipo]||'•')
  const nome=p.ehChefe?t(`games.gangues.story.bosses.${p.boss}.nome`)
    :p.ehPorta?t('games.gangues.cena.acao.entrar')
    :p.ehSaida?t('games.gangues.cena.acao.sair')
    :p.ehVolta?t('games.gangues.cena.acao.voltar')
    :p.ehPassagem?(p.estado==='trancado'?t('games.gangues.cena.acao.trancado'):t(`games.gangues.cena.acao.${p.label||'avancar'}`))
    :(p.i18n?t(`${p.i18n}.nome`):'')
  return <div className={`gang-world-npc is-${p.estado} ${p.ehChefe?'is-boss':''} ${p.farmCompleto?'is-farm':''} ${p.ehPorta||p.ehSaida||p.ehVolta||p.ehPassagem?'is-nav':''}`} style={{left:p.world.x,top:p.world.y}}>
    <span>{icone}</span>
    {p.estado!=='trancado'||p.ehPassagem||p.ehChefe?<small>{nome}</small>:null}
    {p.farmCompleto&&<i className="gang-world-npc-farm-tag" aria-hidden="true">↻</i>}
  </div>
}
function validPosition(p){return Number.isFinite(p?.x)&&Number.isFinite(p?.y)&&p.x>=35&&p.x<=WORLD.w-35&&p.y>=70&&p.y<=WORLD.h-40}
function validPos(p,w){return Number.isFinite(p?.x)&&Number.isFinite(p?.y)&&p.x>=20&&p.x<=(w?.w||WORLD.w)-20&&p.y>=20&&p.y<=(w?.h||WORLD.h)-20}
// Overlap do "corpo" do jogador (mesmo raio da colisão) com a zona, não um
// ponto exato — com movimento em grade, o centro do jogador raramente cai
// pixel-perfeito dentro de corredores estreitos de 35-80px; exigir isso
// deixaria zonas inalcançáveis dependendo de por onde a grade passa perto
// delas. "Chegou perto o suficiente" é o comportamento certo pra interação.
function insideZone(p,z){return Boolean(z&&p.x+PLAYER_RADIUS>z.x&&p.x-PLAYER_RADIUS<z.x+z.w&&p.y+PLAYER_RADIUS>z.y&&p.y-PLAYER_RADIUS<z.y+z.h)}
function hitsSolid(x,y,gate,colliders=[]){const hit=colliders.some(r=>x+PLAYER_RADIUS>r.x&&x-PLAYER_RADIUS<r.x+r.w&&y+PLAYER_RADIUS>r.y&&y-PLAYER_RADIUS<r.y+r.h);if(hit)return true;
  // portão da gangue rival — enquanto FECHADO barra a faixa y330-350; depois
  // de aberto (chefe/galpão liberados) a faixa fica livre.
  if(gate==='fechado'&&y-PLAYER_RADIUS<350&&y+PLAYER_RADIUS>330)return true
  return false}
function stepPlayer(p,dx,dy,gate,colliders,world){const W=world||WORLD;const x=Math.max(20,Math.min(W.w-20,p.x+dx*TILE)),y=Math.max(20,Math.min(W.h-24,p.y+dy*TILE));return hitsSolid(x,y,gate,colliders)?p:{x,y}}
function WorldControls({onInput,onInteract,action}){const base=useRef(null),active=useRef(null);const update=useCallback((x,y)=>{const r=base.current?.getBoundingClientRect();if(!r)return;let dx=x-(r.left+r.width/2),dy=y-(r.top+r.height/2);const d=Math.hypot(dx,dy),max=42;if(d>max){dx=dx/d*max;dy=dy/d*max}base.current.style.setProperty('--jx',`${dx}px`);base.current.style.setProperty('--jy',`${dy}px`);onInput({x:dx/max,y:dy/max})},[onInput]);const stop=useCallback(()=>{active.current=null;if(base.current){base.current.style.setProperty('--jx','0px');base.current.style.setProperty('--jy','0px')}onInput({x:0,y:0})},[onInput]);return <div className="gang-world-controls"><div ref={base} className="gang-world-stick" onPointerDown={e=>{active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);update(e.clientX,e.clientY)}} onPointerMove={e=>{if(active.current===e.pointerId)update(e.clientX,e.clientY)}} onPointerUp={stop} onPointerCancel={stop}><i/></div><button disabled={!action} onClick={onInteract}><b>{action||'...'}</b><span>INTERAGIR</span></button></div>}
const LABEL_TIPO={papo:'FALAR',treta:'ENCARAR',parada:'INVESTIGAR',corre:'SEGUIR',descanso:'DESCANSAR',loja:'COMPRAR',achado:'PEGAR'}
function interactionLabel(p,t){
  if(p.ehChefe)return t('games.gangues.cena.acao.desafiar')
  if(p.ehPorta)return t('games.gangues.cena.acao.entrar')
  if(p.ehSaida)return t('games.gangues.cena.acao.sair')
  if(p.ehVolta)return t('games.gangues.cena.acao.voltar')
  if(p.ehPassagem)return t(`games.gangues.cena.acao.${p.label||'avancar'}`)
  return LABEL_TIPO[p.tipo]||'INTERAGIR'
}
const ICONE={treta:'✊',parada:'🔧',papo:'●',corre:'!',achado:'◆',descanso:'☕',loja:'🏪'}
function estadoPoi(p,prog){if(!p.visivel&&!prog.revelados[p.id])return'escondido';if(prog.resolvidos[p.id]&&!p.repetivel)return'resolvido';return'disponivel'}
// Mesma leitura de dados que GanguesProgression.jsx usa pra montar a ficha —
// aqui é só o card, sem a grade de poderes (é um "conferir rápido", não a
// tela cheia de progressão).
function FichaCenaCard({member,t}){
  if(member.character_type!=='template')return null
  const character=getGanguesCharacter(member.character_template_id)
  const level=getGanguesLevelFromXp(member.xp_total)
  const progression=getGanguesProgression(member)
  const effAttrs=getGanguesAttributesWithEquip(member.attributes)
  const resources=applyGanguesEquipResources(getGanguesResources(character.combat_path,effAttrs.R),member.attributes?.equipment)
  return <>
    <GanguesFichaCard
      nome={character.name}
      caminho={character.combat_path}
      subcaminho={`${t(`games.gangues.loadout.paths.${character.combat_path}.name`)} · ${t(`games.gangues.progression.paths.${character.special_path}`)}`}
      nivel={level}
      atributos={effAttrs}
      pv={{atual:Math.min(resources.pvMax,member.attributes?.pv_atual??resources.pvMax),max:resources.pvMax}}
      pm={{atual:Math.min(resources.pmMax,member.attributes?.pm_atual??resources.pmMax),max:resources.pmMax}}
      xp={{atual:progression.ap,max:ganguesXpMaxForSheet(member),disponivel:progression.xp_unspent}}
    />
    <GanguesSkillGrid character={character} unlockedIds={getGanguesUnlockedSpecials(character.id,member.xp_total).map(s=>s.id)} levelsById={progression.special_levels}/>
    <GanguesEquipPanel member={member}/>
  </>
}
function TretaVS({poi,folegoBaixo,onSim,onNao,t}){const enemy=enemiesData.find(e=>e.id===poi.enemy),nome=poi.ehChefe?t(`games.gangues.story.bosses.${poi.boss}.nome`):t(`${poi.i18n}.nome`),fala=poi.ehChefe?t(`games.gangues.story.bosses.${poi.boss}.fala`,{suaGangue:t('games.gangues.report.your_gang')}):t(`${poi.i18n}.fala`);return <div className="gang-cena-enc gang-cena-enc--vs"><span className="gang-cena-enc-selo">{(nome||'?')[0]}</span><span className="gang-cena-eyebrow">{poi.ehChefe?t('games.gangues.story.boss_tag'):t('games.gangues.cena.tipo.treta')}</span><h3 className="gang-cena-enc-titulo">{nome}{poi.ehChefe&&enemy?.nivel?<em className="gang-cena-vs-nivel"> · {t('games.gangues.cena.nivel',{n:enemy.nivel})}</em>:null}</h3><p className="gang-cena-papo-fala">{fala}</p>{enemy&&<span className="gang-cena-vs-stats">{['A','H','R','D'].map(a=><span key={a}><i>{a}</i>{enemy.stats?.[a]??'—'}</span>)}</span>}{folegoBaixo&&<p className="gang-cena-vs-aviso">{t('games.gangues.cena.folego_baixo')}</p>}<div className="gang-cena-enc-acoes"><button className="gang-cena-btn" onClick={onNao}>{t('games.gangues.cena.treta_nao')}</button><button className="gang-cena-btn gang-cena-btn--go" onClick={onSim}>{t('games.gangues.cena.treta_sim')}</button></div></div>}
