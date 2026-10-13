import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import urlRobo from './modelos/RobotExpressive.glb?url'
import urlLuva from './modelos/luva.glb?url'
import urlTenis from './modelos/tenis.glb?url'
import urlBracoRobo from './modelos/bracorobo.glb?url'
import urlBota from './modelos/bota.glb?url'

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
//   Boots — Isa Lousberg (CC0). Todos via poly.pizza / three.js examples.

// Seu golpe = anel AZUL e partes humanas; golpe dele = anel VERMELHO e partes de robô.
const AZUL = 0x18dafb, VERMELHO = 0xff3b4e, OURO = 0xffd166
const DELE = { bloqueio: true, esquiva: true }
const RAIO = 0.55
const FUNDO_Z = -11

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
const MODELO = { soco: punhoHumano, chute: peHumano, cabecada: cabecaHumana, bloqueio: maoRobo, esquiva: peRobo, super: raio }
// Modelo pronto de cada golpe (quando carregou); `metal` pinta de metal de robô.
const ARQUIVO = { soco: { url: urlLuva }, chute: { url: urlTenis }, cabecada: { url: urlLuva }, bloqueio: { url: urlBracoRobo }, esquiva: { url: urlBota, metal: true } }

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

export default function Arena3D({ estadoRef, voo, corInimigo = 0x7a3b3b, onFalha }) {
  const caixa = useRef(null)

  useEffect(() => {
    const el = caixa.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch { onFalha?.(); return }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    el.appendChild(renderer.domElement)
    const cena = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    cam.position.set(0, 1.6, 10); cam.lookAt(0, -0.4, 0)
    cena.fog = new THREE.Fog(0x07090b, 14, 30)
    cena.add(new THREE.AmbientLight(0xffffff, 0.55))
    const luz = new THREE.DirectionalLight(0xffffff, 1.4); luz.position.set(3, 6, 8); cena.add(luz)
    const contra = new THREE.DirectionalLight(0xffae32, 1.2); contra.position.set(-4, 3, -10); cena.add(contra)

    // Lutador: começa com o boneco simples e troca pelo robô animado quando o modelo chega.
    let lutador = montarLutador(corInimigo)
    lutador.position.set(0, -1.4, FUNDO_Z)
    cena.add(lutador)
    let mixer = null, acoes = {}, acaoAtual = null, robo = false
    const tocarAcao = (nome, umaVez) => {
      const nova = acoes[nome]; if (!nova || nova === acaoAtual && !umaVez) return
      nova.reset(); nova.setLoop(umaVez ? THREE.LoopOnce : THREE.LoopRepeat); nova.clampWhenFinished = true
      if (acaoAtual && acaoAtual !== nova) acaoAtual.crossFadeTo(nova, 0.12, false)
      nova.play(); acaoAtual = nova
    }
    const modelos = {}
    const loader = new GLTFLoader()
    let vivo = true
    loader.load(urlRobo, g => {
      if (!vivo) return
      const r = g.scene
      r.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(0); } })
      r.scale.setScalar(0.85); r.position.set(0, -1.4, FUNDO_Z)
      cena.remove(lutador); lutador.traverse(o => { o.geometry?.dispose() }); lutador.userData.mats.forEach(m => m.dispose())
      lutador = r; lutador.userData = { mats: [] }
      r.traverse(o => { if (o.isMesh) lutador.userData.mats.push(o.material) })
      cena.add(r); robo = true
      mixer = new THREE.AnimationMixer(r)
      for (const clip of g.animations) acoes[clip.name] = mixer.clipAction(clip)
      tocarAcao('Idle')
      mixer.addEventListener('finished', () => tocarAcao('Idle'))
    })
    for (const [tipo, def] of Object.entries(ARQUIVO)) {
      loader.load(def.url, g => {
        if (!vivo) return
        const o = g.scene
        if (def.metal) o.traverse(m => { if (m.isMesh) m.material = new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: 0.85, roughness: 0.3 }) })
        modelos[tipo] = normalizar(o)
      })
    }
    const relogio = new THREE.Clock()
    // chão em perspectiva (grade sumindo no fundo) e um anel âmbar debaixo dele
    const grade = new THREE.GridHelper(40, 40, 0xffae32, 0x3a2a14)
    grade.position.set(0, -1.4, -6); grade.material.transparent = true; grade.material.opacity = 0.45; cena.add(grade)
    const chao = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.7, 48), new THREE.MeshBasicMaterial({ color: 0xffae32, transparent: true, opacity: 0.6, side: THREE.DoubleSide }))
    chao.rotation.x = -Math.PI / 2; chao.position.set(0, -1.38, FUNDO_Z); cena.add(chao)
    lutador.scale.setScalar(1.25)

    const geoAnel = new THREE.TorusGeometry(RAIO, 0.06, 10, 40)
    const bolas = new Map()
    const peito = new THREE.Vector3()

    const ajustar = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix()
    }
    ajustar()
    const ro = new ResizeObserver(ajustar); ro.observe(el)

    // ponto da tela (em % da arena) -> ponto no plano z=0, onde a nota é tocada
    const noPlano = (xp, yp) => {
      const v = new THREE.Vector3((xp / 100) * 2 - 1, -((yp / 100) * 2 - 1), 0.5).unproject(cam)
      const dir = v.sub(cam.position).normalize()
      return cam.position.clone().add(dir.multiplyScalar(-cam.position.z / dir.z))
    }
    const naTela = v3 => { const p = v3.clone().project(cam); return { x: (p.x + 1) * 50, y: (1 - p.y) * 50 } }

    // libera geometria e material de um golpe que saiu de cena (o anel é compartilhado)
    // (o modelo pronto é um clone que divide geometria e material com o original: esse fica)
    const liberar = b => { b.mat.dispose(); if (!b.glb) b.modelo.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose() } }) }
    let raf, ultimoGolpe = 0, ultimoAtaque = 0
    const quadro = () => {
      const s = estadoRef.current
      const agora = performance.now()
      if (s) {
        const t = agora / 1000
        if (mixer) mixer.update(relogio.getDelta())
        // respira e balança em guarda (o robô já tem a animação de guarda dele)
        lutador.position.y = -1.4 + (robo ? 0 : Math.sin(t * 3.2) * 0.06)
        lutador.rotation.y = Math.sin(t * 1.3) * 0.15
        // tomou golpe: recua e pisca vermelho
        const dg = agora - (s.golpeEm || 0)
        if (s.golpeEm !== ultimoGolpe) { ultimoGolpe = s.golpeEm; if (robo && s.inimigo <= 0) tocarAcao('Death', true) }
        const reac = dg < 260 ? Math.sin((dg / 260) * Math.PI) : 0
        lutador.rotation.x = -reac * 0.45
        lutador.position.z = FUNDO_Z - reac * 1.2
        for (const m of lutador.userData.mats) m.emissive?.setRGB(reac * 0.9, 0, 0)
        // acertou você: avança com os braços
        const da = agora - (s.apanhouEm || 0)
        if (s.apanhouEm !== ultimoAtaque) { ultimoAtaque = s.apanhouEm; if (robo) tocarAcao('Punch', true) }
        const ataque = da < 300 ? Math.sin((da / 300) * Math.PI) : 0
        lutador.position.z += ataque * 3
        if (lutador.userData.bracoD) lutador.userData.bracoD.rotation.x = -1.1 - ataque * 0.6

        peito.set(lutador.position.x, lutador.position.y + 2.1, lutador.position.z + 0.6)
        const vivas = new Set()
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
            bolas.set(n.id, b); cena.add(bola)
          }
          const p = Math.min(1.08, Math.max(0, 1 - (n.hora - agora) / voo))
          const pos = peito.clone().lerp(b.alvo, Math.min(1, p))
          if (n.estado === 'acertou') { const k = (agora - n.fimEm) / 380; b.bola.scale.setScalar(1 + k * 1.2); b.mat.opacity = 1 - k; b.bola.visible = k < 1 }
          else if (n.estado === 'errou') { const k = (agora - n.fimEm) / 380; pos.y -= k * 2; b.mat.opacity = 1 - k; b.bola.visible = k < 1 }
          else { b.bola.scale.setScalar(1); b.mat.opacity = Math.min(1, 0.3 + p); b.mat.emissiveIntensity = Math.abs(n.hora - agora) < 150 ? 1.6 : 0.7 }
          b.bola.position.copy(pos)
          b.modelo.rotation.y = Math.sin(t * 2 + n.id) * 0.6
          b.modelo.rotation.x = Math.sin(t * 1.5 + n.id) * 0.25
          // onde a bola está na tela e de que tamanho, pro botão de toque acompanhar
          const c = naTela(pos), borda = naTela(pos.clone().add(new THREE.Vector3(RAIO, 0, 0)))
          n.tela = { x: c.x, y: c.y, rpx: Math.abs(borda.x - c.x) / 100 * el.clientWidth }
        }
        for (const [k, b] of bolas) if (!vivas.has(k)) { cena.remove(b.bola); liberar(b); bolas.delete(k) }
      }
      renderer.render(cena, cam)
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)

    return () => {
      vivo = false; cancelAnimationFrame(raf); ro.disconnect(); mixer?.stopAllAction()
      for (const b of bolas.values()) liberar(b)
      geoAnel.dispose()
      lutador.traverse(o => { o.geometry?.dispose() })
      lutador.userData.mats.forEach(m => m.dispose())
      Object.values(modelos).forEach(m => m.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose() } }))
      renderer.dispose(); el.removeChild(renderer.domElement)
    }
  }, [estadoRef, voo, corInimigo, onFalha])

  return <div ref={caixa} className="rt-3d" aria-hidden="true" />
}
