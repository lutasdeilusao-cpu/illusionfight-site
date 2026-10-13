import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Arena em 3D da luta rítmica. Lá no fundo, no centro, o lutador inimigo em
// guarda; toda nota NASCE DELE e voa até o ponto dela, perto da tela. Acertou
// golpe seu: ele toma (recua, pisca vermelho). Golpe dele que passou: ele avança.
// O 3D é só desenho; quem decide toque, tempo e dano continua sendo a luta
// (LutaRitmo). A cada quadro este componente grava em cada nota onde ela está na
// tela (`n.tela`), pro botão de toque ficar exatamente em cima da bola 3D.
// Cores em hex de propósito: WebGL não lê variável de CSS.

const COR = { soco: 0xffae32, chute: 0xff5ca8, cabecada: 0xa855f7, bloqueio: 0x18dafb, esquiva: 0x2dd4bf, super: 0xffe08a }
const ICONE = { soco: '👊', chute: '🦶', cabecada: '💥', bloqueio: '✋', esquiva: '💨', super: '⚡' }
const RAIO = 0.55
const FUNDO_Z = -11

function texturaIcone(ic) {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')
  g.font = '84px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, 64, 70)
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace
  return tx
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

    const lutador = montarLutador(corInimigo)
    lutador.position.set(0, -1.4, FUNDO_Z)
    cena.add(lutador)
    // chão em perspectiva (grade sumindo no fundo) e um anel âmbar debaixo dele
    const grade = new THREE.GridHelper(40, 40, 0xffae32, 0x3a2a14)
    grade.position.set(0, -1.4, -6); grade.material.transparent = true; grade.material.opacity = 0.45; cena.add(grade)
    const chao = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.7, 48), new THREE.MeshBasicMaterial({ color: 0xffae32, transparent: true, opacity: 0.6, side: THREE.DoubleSide }))
    chao.rotation.x = -Math.PI / 2; chao.position.set(0, -1.38, FUNDO_Z); cena.add(chao)
    lutador.scale.setScalar(1.25)

    const geoBola = new THREE.SphereGeometry(RAIO, 24, 18)
    const texturas = {}
    const tex = tipo => (texturas[tipo] ||= texturaIcone(ICONE[tipo]))
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

    let raf, ultimoGolpe = 0, ultimoAtaque = 0
    const quadro = () => {
      const s = estadoRef.current
      const agora = performance.now()
      if (s) {
        const t = agora / 1000
        // respira e balança em guarda
        lutador.position.y = -1.4 + Math.sin(t * 3.2) * 0.06
        lutador.rotation.y = Math.sin(t * 1.3) * 0.15
        // tomou golpe: recua e pisca vermelho
        const dg = agora - (s.golpeEm || 0)
        if (s.golpeEm !== ultimoGolpe) ultimoGolpe = s.golpeEm
        const reac = dg < 260 ? Math.sin((dg / 260) * Math.PI) : 0
        lutador.rotation.x = -reac * 0.45
        lutador.position.z = FUNDO_Z - reac * 1.2
        for (const m of lutador.userData.mats) m.emissive.setRGB(reac * 0.9, 0, 0)
        // acertou você: avança com os braços
        const da = agora - (s.apanhouEm || 0)
        if (s.apanhouEm !== ultimoAtaque) ultimoAtaque = s.apanhouEm
        const ataque = da < 300 ? Math.sin((da / 300) * Math.PI) : 0
        lutador.position.z += ataque * 3
        lutador.userData.bracoD.rotation.x = -1.1 - ataque * 0.6

        peito.set(lutador.position.x, lutador.position.y + 2.1, lutador.position.z + 0.6)
        const vivas = new Set()
        for (const n of s.notas) {
          vivas.add(n.id)
          let b = bolas.get(n.id)
          if (!b) {
            const mat = new THREE.MeshStandardMaterial({ color: COR[n.tipo], emissive: COR[n.tipo], emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.2, transparent: true })
            const bola = new THREE.Mesh(geoBola, mat)
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(n.tipo), transparent: true, depthTest: false }))
            sp.scale.set(RAIO * 1.5, RAIO * 1.5, 1); sp.position.z = RAIO * 0.6
            bola.add(sp)
            b = { bola, mat, alvo: noPlano(n.alvo.x, n.alvo.y) }
            bolas.set(n.id, b); cena.add(bola)
          }
          const p = Math.min(1.08, Math.max(0, 1 - (n.hora - agora) / voo))
          const pos = peito.clone().lerp(b.alvo, Math.min(1, p))
          if (n.estado === 'acertou') { const k = (agora - n.fimEm) / 380; b.bola.scale.setScalar(1 + k * 1.2); b.mat.opacity = 1 - k }
          else if (n.estado === 'errou') { const k = (agora - n.fimEm) / 380; pos.y -= k * 2; b.mat.opacity = 1 - k }
          else { b.bola.scale.setScalar(1); b.mat.opacity = Math.min(1, 0.3 + p); b.mat.emissiveIntensity = Math.abs(n.hora - agora) < 150 ? 0.9 : 0.35 }
          b.bola.position.copy(pos)
          b.bola.rotation.y = t * 2
          // onde a bola está na tela e de que tamanho, pro botão de toque acompanhar
          const c = naTela(pos), borda = naTela(pos.clone().add(new THREE.Vector3(RAIO, 0, 0)))
          n.tela = { x: c.x, y: c.y, rpx: Math.abs(borda.x - c.x) / 100 * el.clientWidth }
        }
        for (const [k, b] of bolas) if (!vivas.has(k)) { cena.remove(b.bola); b.mat.dispose(); b.bola.children[0].material.dispose(); bolas.delete(k) }
      }
      renderer.render(cena, cam)
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      for (const b of bolas.values()) { b.mat.dispose(); b.bola.children[0].material.dispose() }
      Object.values(texturas).forEach(x => x.dispose()); geoBola.dispose()
      lutador.traverse(o => { o.geometry?.dispose() })
      lutador.userData.mats.forEach(m => m.dispose())
      renderer.dispose(); el.removeChild(renderer.domElement)
    }
  }, [estadoRef, voo, corInimigo, onFalha])

  return <div ref={caixa} className="rt-3d" aria-hidden="true" />
}
