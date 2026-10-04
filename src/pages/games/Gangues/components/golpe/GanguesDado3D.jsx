import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/* Dois dados 3D (three.js): ataque (vermelho) e defesa (azul). É um d3 de
   verdade — cubo com as faces 1-1-2-2-3-3. Giram e quicam enquanto `rolando`
   e pousam com o resultado na face de CIMA, como dado de verdade, vistos de
   cima e de lado. Sem WebGL, mostra só os números. */
const CORES = { ataque: '#c0392b', defesa: '#1f6fb2' }
// Valor de cada face na ordem do material do cubo (+x, -x, +y, -y, +z, -z).
const VALORES = [1, 1, 2, 2, 3, 3]
// Rotação que vira a face do valor pra cima (+y).
const VIRADA = { 2: new THREE.Euler(0, 0, 0), 3: new THREE.Euler(-Math.PI / 2, 0, 0), 1: new THREE.Euler(0, 0, Math.PI / 2) }

function texturaFace(valor, cor) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 128
  const g = cv.getContext('2d')
  g.fillStyle = cor
  g.fillRect(0, 0, 128, 128)
  g.fillStyle = '#fff'
  g.font = 'bold 80px Rajdhani, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(String(valor), 64, 70)
  const tx = new THREE.CanvasTexture(cv)
  tx.colorSpace = THREE.SRGBColorSpace
  return tx
}

function criarDado(cor) {
  const materiais = VALORES.map(v => new THREE.MeshStandardMaterial({ map: texturaFace(v, cor), roughness: 0.35, metalness: 0.15 }))
  return new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 4, 0.14), materiais)
}

// Pouso: a face sorteada pra cima, girado em volta do eixo vertical pra
// mostrar duas laterais (cada dado pra um lado).
function alvoDe(valor, lado) {
  const face = new THREE.Quaternion().setFromEuler(VIRADA[valor] || VIRADA[2])
  const giro = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), lado * 0.55 + (Math.floor(Math.random() * 4) * Math.PI) / 2)
  return giro.multiply(face)
}

export default function GanguesDado3D({ ataque, defesa, rolando, critico }) {
  const caixa = useRef(null)
  const estado = useRef({ rolando })
  estado.current.rolando = rolando

  useEffect(() => {
    const el = caixa.current
    if (!el) return
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) } catch { el.dataset.semWebgl = '1'; return }
    const w = el.clientWidth, h = el.clientHeight
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    renderer.setSize(w, h)
    el.appendChild(renderer.domElement)

    const cena = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 50)
    camera.position.set(0, 2.6, 3.6)
    camera.lookAt(0, 0, 0)
    cena.add(new THREE.AmbientLight(0xffffff, 1.1))
    const luz = new THREE.DirectionalLight(0xffffff, 2.6)
    luz.position.set(2.5, 4, 3)
    cena.add(luz)

    const dados = [criarDado(CORES.ataque), criarDado(CORES.defesa)]
    dados[0].position.x = -0.9
    dados[1].position.x = 0.9
    cena.add(...dados)
    const giros = [new THREE.Vector3(9, 7, 4), new THREE.Vector3(-7, 9, -5)]
    const alvos = [alvoDe(ataque, 1), alvoDe(defesa, -1)]
    let t0 = performance.now(), ultimo = t0, quadro

    const passo = agora => {
      const dt = Math.min(0.05, (agora - ultimo) / 1000)
      ultimo = agora
      const tempo = (agora - t0) / 1000
      dados.forEach((d, i) => {
        if (estado.current.rolando) {
          d.rotation.x += giros[i].x * dt
          d.rotation.y += giros[i].y * dt
          d.rotation.z += giros[i].z * dt
          d.position.y = Math.abs(Math.sin(tempo * 7 + i)) * 0.45
        } else {
          d.quaternion.slerp(alvos[i], Math.min(1, dt * 9))
          d.position.y += (0 - d.position.y) * Math.min(1, dt * 12)
        }
      })
      renderer.render(cena, camera)
      quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)

    return () => {
      cancelAnimationFrame(quadro)
      dados.forEach(d => { d.geometry.dispose(); d.material.forEach(m => { m.map.dispose(); m.dispose() }) })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [ataque, defesa])

  return (
    <div ref={caixa} className={`golpe-dado3d${critico && !rolando ? ' is-critico' : ''}`}>
      <span className="golpe-dado3d__semwebgl" aria-hidden="true">{rolando ? '🎲🎲' : `${ataque} · ${defesa}`}</span>
    </div>
  )
}
