import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { somPasso } from './som'
import { criarParticulas } from './particulas'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import urlRobo from './modelos/RobotExpressive.glb?url'
import urlLuva from './modelos/luva.glb?url'
import urlTenis from './modelos/tenis.glb?url'
import urlBracoRobo from './modelos/bracorobo.glb?url'
import urlBota from './modelos/bota.glb?url'
import urlAventureiro from './modelos/aventureiro.glb?url'
import { montarArena } from './arenaLDI'

// Arena em 3D da luta rítmica. Lá no fundo, no centro, o lutador inimigo (modelo
// pronto, animado); toda nota NASCE DELE e voa até o ponto dela, perto da tela. Acertou
// golpe seu: ele toma (recua, pisca vermelho). Golpe dele que passou: ele avança.
// O 3D é só desenho; quem decide toque, tempo e dano continua sendo a luta
// (LutaRitmo). A cada quadro este componente grava em cada nota onde ela está na
// tela (`n.tela`), pro botão de toque ficar exatamente em cima da bola 3D.
// Cores em hex de propósito: WebGL não lê variável de CSS.
// Modelos 3D (licenças livres, créditos também na tela do laboratório):
//   RobotExpressive — Tomás Laulhé (CC0) · Boxing Glove — J-Toastie (CC-BY 3.0)
//   Sneakers — Poly by Google (CC-BY 3.0) · Robot Arm — Yali Izzo (CC-BY 3.0)
//   Boots — Isa Lousberg (CC0) · Adventurer — Quaternius (CC0). Todos via poly.pizza / three.js examples.

// Seu golpe = anel AZUL e partes humanas; golpe dele = anel VERMELHO e partes de robô.
const AZUL = 0x18dafb, VERMELHO = 0xff3b4e, OURO = 0xffd166
const DELE = { bloqueio: true, esquiva: true, superDele: true }
const RAIO = 0.55
const FUNDO_Z = -9
const CHAO_Y = -1.4

// Modelos de cada golpe, todos em 3D e montados de peças simples (cabem num raio ~0.45).
const PELE = () => new THREE.MeshStandardMaterial({ color: 0xc68a5e, roughness: 0.6 })
const METAL = () => new THREE.MeshStandardMaterial({ color: 0x9aa4ad, roughness: 0.3, metalness: 0.85 })
const JUNTA = () => new THREE.MeshStandardMaterial({ color: 0x2b2f35, roughness: 0.5, metalness: 0.6 })
function add(g, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); return m }

function punhoHumano() { // soco
  const g = new THREE.Group(), p = PELE()
  add(g, new THREE.BoxGeometry(0.5, 0.42, 0.34), p, 0, -0.04, 0)
  for (let i = 0; i < 4; i++) add(g, new THREE.CapsuleGeometry(0.075, 0.12, 4, 8), p, -0.18 + i * 0.12, 0.2, 0.08, 0, 0, Math.PI / 2)
  add(g, new THREE.CapsuleGeometry(0.07, 0.18, 4, 8), p, -0.3, -0.02, 0.1, 0, 0, 0.5)
  return g
}
function peHumano() { // chute
  const g = new THREE.Group(), tenis = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 })
  add(g, new THREE.CapsuleGeometry(0.16, 0.5, 4, 10), tenis, 0, -0.08, 0.05, Math.PI / 2, 0, 0)
  add(g, new THREE.BoxGeometry(0.36, 0.06, 0.82), new THREE.MeshStandardMaterial({ color: AZUL }), 0, -0.24, 0.05)
  add(g, new THREE.CapsuleGeometry(0.13, 0.32, 4, 8), PELE(), 0, 0.22, -0.2)
  return g
}
function cabecaHumana() { // cabeçada
  const g = new THREE.Group()
  add(g, new THREE.SphereGeometry(0.34, 18, 14), PELE(), 0, 0, 0)
  add(g, new THREE.SphereGeometry(0.355, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color: 0x1b1410, roughness: 0.9 }), 0, 0.03, -0.02, -0.3, 0, 0)
  return g
}
function maoRobo() { // bloqueio: a mão de robô vindo aberta
  const g = new THREE.Group(), m = METAL(), jt = JUNTA()
  add(g, new THREE.BoxGeometry(0.46, 0.4, 0.14), m, 0, -0.08, 0)
  for (let i = 0; i < 4; i++) {
    const x = -0.17 + i * 0.115
    add(g, new THREE.BoxGeometry(0.08, 0.15, 0.1), m, x, 0.2, 0)
    add(g, new THREE.SphereGeometry(0.045, 8, 6), jt, x, 0.29, 0)
    add(g, new THREE.BoxGeometry(0.07, 0.12, 0.09), m, x, 0.37, 0)
  }
  add(g, new THREE.BoxGeometry(0.08, 0.2, 0.1), m, -0.3, -0.02, 0.03, 0, 0, 0.6)
  add(g, new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), jt, 0, -0.1, 0.075, Math.PI / 2, 0, 0)
  return g
}
function peRobo() { // esquiva: o chute de robô vindo no centro
  const g = new THREE.Group(), m = METAL(), jt = JUNTA()
  add(g, new THREE.BoxGeometry(0.38, 0.16, 0.7), m, 0, -0.18, 0.06)
  add(g, new THREE.BoxGeometry(0.4, 0.05, 0.74), jt, 0, -0.28, 0.06)
  add(g, new THREE.CylinderGeometry(0.13, 0.15, 0.4, 10), m, 0, 0.1, -0.15)
  add(g, new THREE.SphereGeometry(0.1, 10, 8), jt, 0, 0.3, -0.15)
  return g
}
function raio() { // super
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: OURO, emissive: OURO, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.3 })
  const f = new THREE.Shape(); f.moveTo(0.05, 0.45); f.lineTo(-0.22, 0.02); f.lineTo(-0.02, 0.02); f.lineTo(-0.1, -0.45); f.lineTo(0.22, 0.05); f.lineTo(0.02, 0.05); f.lineTo(0.05, 0.45)
  add(g, new THREE.ExtrudeGeometry(f, { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), mat, 0, 0, -0.06)
  return g
}
const MODELO = { soco: punhoHumano, chute: peHumano, cabecada: cabecaHumana, bloqueio: maoRobo, esquiva: peRobo, super: raio, superDele: raio }

// Lutadores prontos e o nome das animações de cada um (o modelo traz as dele).
const LUTADORES = {
  robo: { url: urlRobo, altura: 3.1, parado: 'Idle', anda: 'Walking', viraAoAndar: true, pulo: 'Jump', ataque: ['Punch', 'Punch', 'ThumbsUp', 'Yes'], apanha: ['No', 'Jump'], morte: 'Death' },
  aventureiro: { url: urlAventureiro, altura: 3.1, parado: 'CharacterArmature|Idle', andaDir: 'CharacterArmature|Run_Right', andaEsq: 'CharacterArmature|Run_Left', pulo: 'CharacterArmature|Roll', ataque: ['CharacterArmature|Punch_Right', 'CharacterArmature|Kick_Left', 'CharacterArmature|Punch_Left', 'CharacterArmature|Kick_Right'], apanha: ['CharacterArmature|HitRecieve', 'CharacterArmature|HitRecieve_2'], morte: 'CharacterArmature|Death' },
}
// Modelo pronto de cada golpe (quando carregou); `metal` pinta de metal de robô.
// `vira` deita o modelo pra ponta do golpe apontar pra você (luva e mão: o punho; tênis e bota: a sola).
const ARQUIVO = { soco: { url: urlLuva, vira: Math.PI / 2 }, chute: { url: urlTenis, vira: -Math.PI / 2 }, bloqueio: { url: urlBracoRobo, vira: Math.PI / 2 }, esquiva: { url: urlBota, metal: true, vira: -Math.PI / 2 } }

// Deixa o modelo do tamanho da nota (cabe num raio ~0.45) e centrado.
function normalizar(obj, tamanho = 0.9) {
  const caixa = new THREE.Box3().setFromObject(obj)
  const s = caixa.getSize(new THREE.Vector3()), c = caixa.getCenter(new THREE.Vector3())
  const k = tamanho / Math.max(s.x, s.y, s.z)
  const g = new THREE.Group(); obj.position.sub(c); g.add(obj); g.scale.setScalar(k)
  return g
}

// Lutador low-poly em guarda: tronco, cabeça, braços dobrados na frente do rosto, pernas abertas.
function montarLutador(cor) {
  const corpo = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.55, metalness: 0.1, emissive: 0x000000 })
  const pele = new THREE.MeshStandardMaterial({ color: 0x8a5a3c, roughness: 0.7, emissive: 0x000000 })
  const g = new THREE.Group()
  const peca = (geo, mat, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m }
  peca(new THREE.CapsuleGeometry(0.55, 0.9, 6, 12), corpo, 0, 1.6, 0)
  peca(new THREE.SphereGeometry(0.42, 16, 12), pele, 0, 2.75, 0.05)
  const bracoE = peca(new THREE.CapsuleGeometry(0.17, 0.75, 4, 8), pele, -0.55, 2.0, 0.45, -1.1, 0.35)
  const bracoD = peca(new THREE.CapsuleGeometry(0.17, 0.75, 4, 8), pele, 0.55, 2.0, 0.45, -1.1, -0.35)
  peca(new THREE.SphereGeometry(0.24, 12, 10), corpo, -0.32, 2.45, 0.85)
  peca(new THREE.SphereGeometry(0.24, 12, 10), corpo, 0.32, 2.45, 0.85)
  peca(new THREE.CapsuleGeometry(0.22, 0.95, 4, 8), corpo, -0.32, 0.45, 0, 0, 0.12)
  peca(new THREE.CapsuleGeometry(0.22, 0.95, 4, 8), corpo, 0.32, 0.45, 0, 0, -0.12)
  g.userData = { mats: [corpo, pele], bracoE, bracoD }
  return g
}

export default function Arena3D({ estadoRef, voo, janela = 150, lutador: qual = 'robo', corInimigo = 0x7a3b3b, onFalha, onPronto }) {
  const caixa = useRef(null)
  const avisaPronto = useRef(onPronto)
  avisaPronto.current = onPronto

  useEffect(() => {
    const el = caixa.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch { onFalha?.(); avisaPronto.current?.(); return }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    el.appendChild(renderer.domElement)
    const cena = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    // câmera mirando o meio do lutador, que fica no centro da tela, lá no fundo da arena
    const CAM_BASE = new THREE.Vector3(0, 1.8, 10), OLHAR_BASE = new THREE.Vector3(0, CHAO_Y + 1.6, FUNDO_Z)
    cam.position.copy(CAM_BASE); cam.lookAt(OLHAR_BASE)
    // a câmera parada de sempre: é por ela que o ponto de toque de cada nota é calculado,
    // mesmo quando a câmera de verdade está dando zoom na apresentação do super
    const camFixa = cam.clone()
    const olhar = OLHAR_BASE.clone()
    cena.add(new THREE.AmbientLight(0xffffff, 0.55))
    const luz = new THREE.DirectionalLight(0xffffff, 1.4); luz.position.set(3, 6, 8); cena.add(luz)
    // As notas vivem num palco à parte, filmado pela câmera fixa: o passeio da câmera da
    // arena (ângulos, zoom, tranco) nunca muda onde a nota chega nem de que tamanho.
    const cenaNotas = new THREE.Scene()
    cenaNotas.add(new THREE.AmbientLight(0xffffff, 0.75))
    const luzNotas = new THREE.DirectionalLight(0xffffff, 1.4); luzNotas.position.set(3, 6, 8); cenaNotas.add(luzNotas)
    renderer.autoClear = false
    const contra = new THREE.DirectionalLight(0xffae32, 1.2); contra.position.set(-4, 3, -10); cena.add(contra)

    // Lutador: começa com o boneco simples e troca pelo robô animado quando o modelo chega.
    let lutador = montarLutador(corInimigo)
    lutador.position.set(0, -1.4, FUNDO_Z)
    cena.add(lutador)
    const def = LUTADORES[qual] || LUTADORES.robo
    // cada reação sorteia uma das animações do modelo, pra não repetir sempre igual
    const sorteia = lista => lista[Math.floor(Math.random() * lista.length)]
    let mixer = null, acoes = {}, acaoAtual = null, robo = false
    // `base` é a animação contínua do momento (guarda ou andando); golpe, reação
    // e pulo tocam uma vez por cima e, quando acabam, voltam pra base.
    let base = def.parado, umaVezAtiva = false
    const tocarAcao = (nome, umaVez) => {
      const nova = acoes[nome]; if (!nova || nova === acaoAtual && !umaVez) return
      nova.reset(); nova.setLoop(umaVez ? THREE.LoopOnce : THREE.LoopRepeat); nova.clampWhenFinished = true
      if (acaoAtual && acaoAtual !== nova) acaoAtual.crossFadeTo(nova, 0.15, false)
      nova.play(); acaoAtual = nova; umaVezAtiva = Boolean(umaVez)
    }
    const trocarBase = nome => { if (!nome || nome === base) return; base = nome; if (!umaVezAtiva) tocarAcao(nome) }
    // O passeio no fundo da arena: escolhe um ponto, anda (ou pula/rola) até ele, para em guarda.
    const passeio = { x: 0, alvo: 0, ate: 1.5, modo: 'parado', proxPasso: 0 }
    const modelos = {}
    // Tudo que a luta precisa carregar passa por aqui; quando acaba, avisa (tela de carregamento).
    let vivo = true
    const gerente = new THREE.LoadingManager(() => { if (vivo) avisaPronto.current?.() }, undefined, () => {})
    const loader = new GLTFLoader(gerente)
    const particulas = criarParticulas(cena, gerente)
    loader.load(def.url, g => {
      if (!vivo) return
      const r = g.scene
      r.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(0) } })
      const alto = new THREE.Box3().setFromObject(r).getSize(new THREE.Vector3()).y
      r.scale.setScalar(def.altura / alto); r.position.set(0, CHAO_Y, FUNDO_Z)
      cena.remove(lutador); lutador.traverse(o => { o.geometry?.dispose() }); lutador.userData.mats.forEach(m => m.dispose())
      lutador = r; lutador.userData = { mats: [] }
      r.traverse(o => { if (o.isMesh) lutador.userData.mats.push(o.material) })
      cena.add(r); robo = true
      mixer = new THREE.AnimationMixer(r)
      for (const clip of g.animations) acoes[clip.name] = mixer.clipAction(clip)
      tocarAcao(def.parado)
      mixer.addEventListener('finished', () => { umaVezAtiva = false; if (acaoAtual !== acoes[def.morte]) tocarAcao(base) })
    })
    for (const [tipo, def] of Object.entries(ARQUIVO)) {
      loader.load(def.url, g => {
        if (!vivo) return
        const o = g.scene
        if (def.metal) o.traverse(m => { if (m.isMesh) m.material = new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: 0.85, roughness: 0.3 }) })
        const deitado = normalizar(o); deitado.rotation.x = def.vira || 0
        modelos[tipo] = new THREE.Group().add(deitado)
      })
    }
    const relogio = new THREE.Clock()
    // O ambiente: a Arena do Lutas de Ilusão (arenaLDI.js), com o lutador no fundo do chão azul.
    const extras = []
    const arena = montarArena(cena, { chaoY: CHAO_Y, cz: -3, raio: 14 })
    for (const x of [-5, 5]) {
      const foco = new THREE.SpotLight(0xffe2b0, 18, 30, 0.45, 0.7, 1.4)
      foco.position.set(x, 9, FUNDO_Z + 3); foco.target.position.set(0, CHAO_Y, FUNDO_Z); cena.add(foco, foco.target)
    }
    lutador.scale.setScalar(0.9)

    const geoAnel = new THREE.TorusGeometry(RAIO, 0.06, 10, 40)
    const bolas = new Map()
    const peito = new THREE.Vector3()

    const ajustar = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false); cam.aspect = camFixa.aspect = w / h; cam.updateProjectionMatrix(); camFixa.updateProjectionMatrix()
    }
    ajustar()
    const ro = new ResizeObserver(ajustar); ro.observe(el)

    // ponto da tela (em % da arena) -> ponto no plano z=0, onde a nota é tocada
    const noPlano = (xp, yp) => {
      const v = new THREE.Vector3((xp / 100) * 2 - 1, -((yp / 100) * 2 - 1), 0.5).unproject(camFixa)
      const dir = v.sub(camFixa.position).normalize()
      return camFixa.position.clone().add(dir.multiplyScalar(-camFixa.position.z / dir.z))
    }
    const naTela = v3 => { const p = v3.clone().project(camFixa); return { x: (p.x + 1) * 50, y: (1 - p.y) * 50 } }

    // libera geometria e material de um golpe que saiu de cena (o anel é compartilhado)
    // (o modelo pronto é um clone que divide geometria e material com o original: esse fica)
    const liberar = b => { b.mat.dispose(); if (!b.glb) b.modelo.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose() } }) }
    // `chute`: o empurrão de câmera a cada golpe seu que acerta (um pra cada lado)
    let raf, ultimoGolpe = 0, ultimoAtaque = 0, show = null, tremeAte = 0, chute = { em: 0, lado: 1 }
    const projetil = new THREE.Vector3(), alvoCam = new THREE.Vector3(), alvoOlhar = new THREE.Vector3()
    const quadro = () => {
      const s = estadoRef.current
      const agora = performance.now()
      if (s) {
        const t = agora / 1000
        const dt = Math.min(0.1, relogio.getDelta())
        if (mixer) mixer.update(dt)
        particulas.atualizar(dt)
        // respira e balança em guarda (o robô já tem a animação de guarda dele)
        lutador.position.y = CHAO_Y + (robo ? 0 : Math.sin(t * 3.2) * 0.06)
        // anda de um lado pro outro no fundo da arena (as notas continuam saindo do centro)
        const pz = passeio
        if (s.inimigo > 0) {
          if (pz.modo === 'parado' && t > pz.ate) {
            do pz.alvo = (Math.random() * 2 - 1) * 2.2; while (Math.abs(pz.alvo - pz.x) < 1.2)
            pz.modo = Math.random() < 0.2 && def.pulo ? 'pulo' : 'anda'
            if (pz.modo === 'pulo' && robo) tocarAcao(def.pulo, true)
          }
          if (pz.modo !== 'parado') {
            const dir = Math.sign(pz.alvo - pz.x), passo = (pz.modo === 'pulo' ? 2.6 : 1.5) * dt
            if (pz.modo === 'anda') trocarBase(def.anda || (dir > 0 ? def.andaEsq : def.andaDir)) // de frente pra você, a direita dele é a sua esquerda
            if (pz.modo === 'anda' && t > pz.proxPasso) { somPasso(); pz.proxPasso = t + 0.36 }
            if (Math.abs(pz.alvo - pz.x) <= passo) { pz.x = pz.alvo; pz.modo = 'parado'; pz.ate = t + 0.8 + Math.random() * 1.8; trocarBase(def.parado) }
            else pz.x += dir * passo
          }
        }
        lutador.position.x = pz.x
        // o robô anda virando o corpo pro lado que vai; parado, olha pra você
        const viraPara = pz.modo === 'anda' && def.viraAoAndar ? Math.sign(pz.alvo - pz.x) * 1.1 : 0
        lutador.rotation.y += (viraPara + Math.sin(t * 1.3) * 0.08 - lutador.rotation.y) * Math.min(1, dt * 8)
        // tomou golpe: recua e pisca vermelho
        const dg = agora - (s.golpeEm || 0)
        const peitoDele = new THREE.Vector3(lutador.position.x, CHAO_Y + 1.8, FUNDO_Z + 0.5)
        if (s.golpeEm !== ultimoGolpe) { ultimoGolpe = s.golpeEm; if (!show) chute = { em: agora, lado: (chute.lado || 1) * -1, giro: 1 + Math.random() * 2.6, alto: Math.random() * 3 - 1.2, perto: 1.5 + Math.random() * 2.5 }; if (robo) tocarAcao(s.inimigo <= 0 ? def.morte : sorteia(def.apanha), true); particulas.explodir(peitoDele, 'acerto') }
        const reac = dg < 260 ? Math.sin((dg / 260) * Math.PI) : 0
        lutador.rotation.x = -reac * 0.45
        lutador.position.z = FUNDO_Z - reac * 0.8
        for (const m of lutador.userData.mats) m.emissive?.setRGB(reac * 0.9, 0, 0)
        // acertou você: avança com os braços
        const da = agora - (s.apanhouEm || 0)
        if (s.apanhouEm !== ultimoAtaque) { ultimoAtaque = s.apanhouEm; if (!s.apresenta) tremeAte = agora + 260; if (robo) tocarAcao(sorteia(def.ataque), true); if (!s.apresenta) particulas.explodir(new THREE.Vector3(0, 0.6, 5), 'apanhou') }
        const ataque = da < 300 ? Math.sin((da / 300) * Math.PI) : 0
        lutador.position.z += ataque * 2
        if (lutador.userData.bracoD) lutador.userData.bracoD.rotation.x = -1.1 - ataque * 0.6

        peito.set(0, lutador.position.y + 2.1, FUNDO_Z + 0.6)

        // APRESENTAÇÃO DO SUPER: o golpe sai como projétil de partículas, a câmera vai
        // atrás dele, mostra o impacto de perto (explosão, ele apanhando) e volta.
        if (s.apresenta && (!show || show.ate !== s.apresenta.ate)) {
          const ap = s.apresenta
          show = { ...ap, t0: agora, estilo: ap.dele ? 'dele' : ap.id, impactou: false, voa: ap.frac > 0 && (ap.dele || ap.id !== 'folego') }
          // cura: vento verde em volta de você (na frente da câmera), não vai no robô
          if (!ap.dele && ap.id === 'folego' && ap.frac > 0) for (const x of [-1.4, 0, 1.4]) particulas.explodir(new THREE.Vector3(x, 0.4, 6.8), 'folego')
        }
        alvoCam.copy(CAM_BASE); alvoOlhar.copy(OLHAR_BASE)
        if (show) {
          const dur = show.ate - show.t0, u = (agora - show.t0) / dur
          const de = show.dele ? peitoDele.clone() : new THREE.Vector3(0, -0.6, 6)
          const ate = show.dele ? new THREE.Vector3(0, 0.8, 6.5) : peitoDele
          if (show.voa && u < 0.5) {
            const k = Math.max(0, (u - 0.06) / 0.44), suave = k * k * (3 - 2 * k)
            projetil.copy(de).lerp(ate, suave)
            projetil.y += Math.sin(suave * Math.PI) * 0.8
            particulas.rastro(projetil, show.estilo)
            if (!show.dele) { alvoCam.set(projetil.x * 0.4, 1.3, Math.max(FUNDO_Z + 5, projetil.z + 6)); alvoOlhar.copy(projetil) }
            else alvoOlhar.lerpVectors(OLHAR_BASE, projetil, 0.6)
          } else if (show.voa && !show.impactou) {
            show.impactou = true
            particulas.explodir(ate, show.estilo)
            tremeAte = agora + 380
            if (!show.dele && robo) tocarAcao(s.inimigo <= 0 ? def.morte : sorteia(def.apanha), true)
          }
          if (show.voa && !show.dele && u >= 0.5 && u < 0.85) { alvoCam.set(lutador.position.x * 0.6, 1.2, FUNDO_Z + 5.4); alvoOlhar.copy(peitoDele) }
          if (u >= 1) show = null
        }
        // golpe seu acertou: a câmera dá um tranco num ângulo sorteado (lado, de cima, de
        // baixo, girando em volta dele) e volta. Só a arena se mexe: as notas não.
        const dc = (agora - chute.em) / 520
        if (!show && dc < 1) {
          const f = Math.sin(dc * Math.PI)
          alvoCam.x += chute.lado * chute.giro * f; alvoCam.y += chute.alto * f; alvoCam.z -= chute.perto * f
          alvoOlhar.x += lutador.position.x * 0.6 * f
        }
        const suaviza = 1 - Math.exp(-dt * (dc < 1 ? 14 : 7))
        cam.position.lerp(alvoCam, suaviza); olhar.lerp(alvoOlhar, suaviza)
        if (agora < tremeAte) { const f = (tremeAte - agora) / 380 * 0.25; cam.position.x += (Math.random() - 0.5) * f; cam.position.y += (Math.random() - 0.5) * f }
        cam.lookAt(olhar)
        const vivas = new Set()
        // no super (seu ou dele), só a PRÓXIMA nota acende; as outras ficam apagadas
        let proxima = null
        for (const n of s.notas) if ((n.tipo === 'super' || n.tipo === 'superDele') && n.estado === 'vindo' && (!proxima || n.hora < proxima.hora)) proxima = n
        for (const n of s.notas) {
          vivas.add(n.id)
          let b = bolas.get(n.id)
          if (!b) {
            // a nota: o modelo 3D do golpe dentro de um anel (azul = seu, vermelho = dele)
            const cor = n.tipo === 'super' ? OURO : DELE[n.tipo] ? VERMELHO : AZUL
            const anelMat = new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.7, roughness: 0.3, transparent: true })
            const bola = new THREE.Group()
            bola.add(new THREE.Mesh(geoAnel, anelMat))
            const modelo = modelos[n.tipo] ? modelos[n.tipo].clone(true) : MODELO[n.tipo](); if (!modelos[n.tipo]) modelo.scale.setScalar(0.95); bola.add(modelo)
            b = { bola, mat: anelMat, modelo, glb: Boolean(modelos[n.tipo]), alvo: noPlano(n.alvo.x, n.alvo.y) }
            // a nota é desenhada sempre por cima da arena (o chão passa por baixo da câmera)
            bola.traverse(m => { if (m.isMesh) { m.renderOrder = 10; m.material.depthTest = false } })
            bolas.set(n.id, b); cenaNotas.add(bola)
          }
          const p = Math.min(1.08, Math.max(0, 1 - (n.hora - agora) / voo))
          const pos = peito.clone().lerp(b.alvo, Math.min(1, p))
          if (n.estado === 'acertou' && !b.estourou) { b.estourou = true; if (!DELE[n.tipo]) particulas.explodir(pos, 'nota') }
          if (n.estado === 'acertou') { const k = (agora - n.fimEm) / 380; b.bola.scale.setScalar(1 + k * 1.2); b.mat.opacity = 1 - k; b.bola.visible = k < 1 }
          else if (n.estado === 'errou') { const k = (agora - n.fimEm) / 380; pos.y -= k * 2; b.mat.opacity = 1 - k; b.bola.visible = k < 1 }
          else {
            const falta = Math.abs(n.hora - agora)
            const ehSuper = n.tipo === 'super' || n.tipo === 'superDele'
            // Super: a nota da vez cresce e estoura de luz bem na hora do toque.
            const pico = ehSuper && n === proxima && falta < janela ? 1 - falta / janela : 0
            b.bola.scale.setScalar(1 + pico * 0.6)
            b.mat.opacity = ehSuper && proxima && n !== proxima ? 0.25 : Math.min(1, 0.3 + p)
            b.mat.emissiveIntensity = ehSuper ? 0.7 + pico * 4 : falta < janela ? 1.6 : 0.7
          }
          b.bola.position.copy(pos)
          // o golpe vem DEITADO, com a ponta (punho, bico do pé) apontada pra você
          // a ponta do golpe mira sempre a câmera (você), de onde quer que a nota venha
          b.modelo.lookAt(camFixa.position)
          b.modelo.rotateZ(Math.sin(t * 2 + n.id) * 0.15)
          // onde a bola está na tela e de que tamanho, pro botão de toque acompanhar
          const c = naTela(pos), borda = naTela(pos.clone().add(new THREE.Vector3(RAIO, 0, 0)))
          n.tela = { x: c.x, y: c.y, rpx: Math.abs(borda.x - c.x) / 100 * el.clientWidth }
        }
        for (const [k, b] of bolas) if (!vivas.has(k)) { cenaNotas.remove(b.bola); liberar(b); bolas.delete(k) }
      }
      renderer.clear()
      renderer.render(cena, cam)
      renderer.clearDepth()
      renderer.render(cenaNotas, camFixa)
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)

    return () => {
      vivo = false; cancelAnimationFrame(raf); ro.disconnect(); mixer?.stopAllAction()
      for (const b of bolas.values()) liberar(b)
      geoAnel.dispose()
      particulas.liberar()
      lutador.traverse(o => { o.geometry?.dispose() })
      lutador.userData.mats.forEach(m => m.dispose())
      Object.values(modelos).concat(extras).forEach(m => m.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose() } }))
      arena.descartar()
      renderer.dispose(); el.removeChild(renderer.domElement)
    }
  }, [estadoRef, voo, janela, qual, corInimigo, onFalha])

  return <div ref={caixa} className="rt-3d" aria-hidden="true" />
}
