import * as THREE from 'three'

// A Arena do Lutas de Ilusão (referência: Personagens/WEBTOON/ArenaLDI.png e ArenaLDI2.png):
// um coliseu romano de alta tecnologia. Chão redondo de placas azuis com o círculo
// central, muro de pedra clara com faixas de luz ciano, arquibancadas em degraus com
// arcos e torcida, pilares com luz, estandartes brancos de borda dourada, torres pontudas,
// telões de holograma e céu azul. Tudo desenhado aqui (texturas em canvas), sem arquivo.
// Cores em hex de propósito: WebGL não lê variável de CSS.

const CIANO = 0x37d6ff, OURO = 0xd9b45a, PEDRA = 0xe9e2d3

function textura(w, h, desenha, repete) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  desenha(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repete) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repete) }
  return t
}

// Chão: placas azuis irregulares (como vidro rachado em hexágonos), linhas de luz e o
// círculo do centro, igual à arte.
const texChao = () => textura(1024, 1024, (g, w, h) => {
  const cx = w / 2, cy = h / 2
  const grad = g.createRadialGradient(cx, cy, 40, cx, cy, w / 2)
  grad.addColorStop(0, '#5fc3ff'); grad.addColorStop(0.6, '#1f7fe0'); grad.addColorStop(1, '#0d4fb0')
  g.fillStyle = grad; g.fillRect(0, 0, w, h)
  // placas hexagonais
  g.strokeStyle = 'rgba(190,235,255,0.55)'; g.lineWidth = 3
  const r = 46
  for (let y = 0, lin = 0; y < h + r; y += r * 1.5, lin++) {
    for (let x = (lin % 2) * r * 0.87; x < w + r; x += r * 1.74) {
      g.beginPath()
      for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) }
      g.closePath(); g.stroke()
      if (Math.random() < 0.25) { g.fillStyle = 'rgba(255,255,255,0.08)'; g.fill() }
    }
  }
  // raios e anéis de luz
  g.strokeStyle = 'rgba(220,250,255,0.9)'; g.lineWidth = 5
  for (let k = 0; k < 8; k++) { const a = Math.PI / 4 * k; g.beginPath(); g.moveTo(cx + Math.cos(a) * 110, cy + Math.sin(a) * 110); g.lineTo(cx + Math.cos(a) * w * 0.49, cy + Math.sin(a) * w * 0.49); g.stroke() }
  for (const rr of [108, 116, w * 0.47]) { g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke() }
  g.fillStyle = 'rgba(160,230,255,0.35)'; g.beginPath(); g.arc(cx, cy, 104, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#e9fbff'; g.beginPath(); g.arc(cx, cy, 10, 0, Math.PI * 2); g.fill()
})

// Muro da arena: blocos de pedra clara + faixa de luz embaixo e em cima.
const texMuro = () => textura(1024, 256, (g, w, h) => {
  g.fillStyle = '#e6dfcf'; g.fillRect(0, 0, w, h)
  g.strokeStyle = 'rgba(120,110,90,0.35)'; g.lineWidth = 2
  for (let y = 30, lin = 0; y < h - 30; y += 38, lin++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke()
    for (let x = (lin % 2) * 45; x < w; x += 90) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 38); g.stroke() }
  }
  g.fillStyle = '#2c3a48'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26)
  g.fillStyle = '#5fe6ff'
  for (let x = 20; x < w; x += 120) { g.fillRect(x, 9, 60, 8); g.fillRect(x + 40, h - 17, 60, 8) }
}, [6, 1])

// Arquibancada: arcos de pedra embaixo, torcida em cima (pontinhos coloridos), friso ciano.
const texArquibancada = () => textura(1024, 512, (g, w, h) => {
  g.fillStyle = '#d9d1bf'; g.fillRect(0, 0, w, h)
  // torcida
  const cores = ['#3b4a63', '#8a5a44', '#c9a26a', '#5e7a9e', '#a43d4f', '#e8e0d0', '#2d2f36', '#6f8f5a']
  for (let i = 0; i < 9000; i++) { g.fillStyle = cores[i % cores.length]; g.fillRect(Math.random() * w, Math.random() * h * 0.55, 5, 6) }
  g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 20; y < h * 0.55; y += 22) g.fillRect(0, y, w, 3)
  // friso
  g.fillStyle = '#34414f'; g.fillRect(0, h * 0.56, w, 18)
  g.fillStyle = '#5fe6ff'; for (let x = 10; x < w; x += 70) g.fillRect(x, h * 0.56 + 6, 34, 6)
  // arcos
  for (let x = 0; x < w; x += 85) {
    g.fillStyle = '#c8bfab'; g.fillRect(x, h * 0.6, 85, h * 0.4)
    g.fillStyle = '#4a3a2c'; g.beginPath(); g.moveTo(x + 18, h); g.lineTo(x + 18, h * 0.74); g.arc(x + 42, h * 0.74, 24, Math.PI, 0); g.lineTo(x + 66, h); g.fill()
    g.fillStyle = '#ffcf7a'; g.globalAlpha = 0.35; g.fillRect(x + 22, h * 0.8, 40, h * 0.2); g.globalAlpha = 1
  }
}, [8, 1])

const texCeu = () => textura(16, 512, (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#2f7fe0'); grad.addColorStop(0.55, '#8cc8ff'); grad.addColorStop(1, '#e9f4ff')
  g.fillStyle = grad; g.fillRect(0, 0, w, h)
})

const texEstandarte = () => textura(128, 384, (g, w, h) => {
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * 0.85); g.lineTo(w / 2, h); g.lineTo(0, h * 0.85); g.closePath(); g.fill()
  g.strokeStyle = '#d9b45a'; g.lineWidth = 8; g.stroke()
})

/** Monta a arena em volta de (0, chaoY, cz). `raio` é o raio do chão de luta. Devolve o grupo. */
export function montarArena(cena, { chaoY, cz, raio = 15 }) {
  const g = new THREE.Group()
  const mats = []
  const mat = m => (mats.push(m), m)
  const geos = []
  const geo = x => (geos.push(x), x)

  cena.background = texCeu()
  cena.fog = new THREE.Fog(0xcfe6ff, 40, 110)
  g.add(new THREE.HemisphereLight(0xdff2ff, 0x1d4f8f, 0.9))

  // chão de luta + borda escura entre o chão e o muro
  const chao = new THREE.Mesh(geo(new THREE.CircleGeometry(raio, 96)), mat(new THREE.MeshStandardMaterial({ map: texChao(), emissive: 0x0b4fa8, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.2 })))
  chao.rotation.x = -Math.PI / 2; chao.position.set(0, chaoY, cz); g.add(chao)
  const borda = new THREE.Mesh(geo(new THREE.RingGeometry(raio, raio + 0.8, 96)), mat(new THREE.MeshStandardMaterial({ color: 0x2c3a48, roughness: 0.6 })))
  borda.rotation.x = -Math.PI / 2; borda.position.set(0, chaoY + 0.01, cz); g.add(borda)
  const anel = new THREE.Mesh(geo(new THREE.TorusGeometry(raio + 0.05, 0.06, 8, 160)), mat(new THREE.MeshStandardMaterial({ color: CIANO, emissive: CIANO, emissiveIntensity: 1.2 })))
  anel.rotation.x = Math.PI / 2; anel.position.set(0, chaoY + 0.05, cz); g.add(anel)

  // muro de pedra (visto por dentro)
  const rMuro = raio + 0.8, hMuro = 3.2
  const muro = new THREE.Mesh(geo(new THREE.CylinderGeometry(rMuro, rMuro, hMuro, 96, 1, true)), mat(new THREE.MeshStandardMaterial({ map: texMuro(), side: THREE.BackSide, roughness: 0.85 })))
  muro.position.set(0, chaoY + hMuro / 2, cz); g.add(muro)

  // arquibancadas em degraus, cada uma mais longe e mais alta
  const texArq = texArquibancada()
  for (let i = 0; i < 3; i++) {
    const r = rMuro + 2.5 + i * 4, h = 5.5, y = chaoY + hMuro + i * 5 + h / 2 - 0.5
    const arq = new THREE.Mesh(geo(new THREE.CylinderGeometry(r, r, h, 96, 1, true)), mat(new THREE.MeshStandardMaterial({ map: texArq, side: THREE.BackSide, roughness: 0.9 })))
    arq.position.set(0, y, cz); g.add(arq)
    // piso do degrau
    const piso = new THREE.Mesh(geo(new THREE.RingGeometry(r - (i === 0 ? 2.5 : 4), r, 96)), mat(new THREE.MeshStandardMaterial({ color: PEDRA, roughness: 0.9, side: THREE.DoubleSide })))
    piso.rotation.x = -Math.PI / 2; piso.position.set(0, y - h / 2, cz); g.add(piso)
  }

  // pilares com luz, estandartes e torres em volta
  const texBand = texEstandarte()
  const matPilar = mat(new THREE.MeshStandardMaterial({ color: 0xd8d0be, roughness: 0.8 }))
  const matLuz = mat(new THREE.MeshStandardMaterial({ color: CIANO, emissive: CIANO, emissiveIntensity: 1.4 }))
  const matTorre = mat(new THREE.MeshStandardMaterial({ color: 0x2b3442, roughness: 0.5, metalness: 0.4 }))
  const matBand = mat(new THREE.MeshStandardMaterial({ map: texBand, transparent: true, side: THREE.DoubleSide, roughness: 0.9 }))
  const matOuro = mat(new THREE.MeshStandardMaterial({ color: OURO, metalness: 0.7, roughness: 0.3 }))
  const gPilar = geo(new THREE.BoxGeometry(0.9, hMuro + 0.6, 0.9)), gLuz = geo(new THREE.BoxGeometry(0.16, hMuro * 0.7, 0.16))
  const gTorre = geo(new THREE.ConeGeometry(0.9, 7, 6)), gBase = geo(new THREE.BoxGeometry(1.6, 6, 1.6))
  const gBand = geo(new THREE.PlaneGeometry(1.4, 4.2)), gHaste = geo(new THREE.CylinderGeometry(0.06, 0.06, 6, 6))
  const N = 16
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2, sx = Math.sin(a), sz = Math.cos(a)
    const p = new THREE.Mesh(gPilar, matPilar); p.position.set(sx * (rMuro - 0.3), chaoY + (hMuro + 0.6) / 2, cz + sz * (rMuro - 0.3)); p.lookAt(0, p.position.y, cz); g.add(p)
    const l = new THREE.Mesh(gLuz, matLuz); l.position.copy(p.position).add(new THREE.Vector3(-sx * 0.47, 0, -sz * 0.47)); g.add(l)
    const rFora = rMuro + 15
    if (k % 2 === 0) {
      // torre pontuda no alto da arquibancada
      const base = new THREE.Mesh(gBase, matTorre); base.position.set(sx * rFora, chaoY + 18, cz + sz * rFora); g.add(base)
      const ponta = new THREE.Mesh(gTorre, matTorre); ponta.position.set(base.position.x, chaoY + 24.5, base.position.z); g.add(ponta)
      const luzT = new THREE.Mesh(geo(new THREE.BoxGeometry(0.2, 4.5, 0.2)), matLuz); luzT.position.set(sx * (rFora - 0.85), chaoY + 18, cz + sz * (rFora - 0.85)); g.add(luzT)
    } else {
      // estandarte branco de borda dourada pendurado numa haste
      const haste = new THREE.Mesh(gHaste, matOuro); haste.position.set(sx * (rFora - 1), chaoY + 20, cz + sz * (rFora - 1)); g.add(haste)
      const band = new THREE.Mesh(gBand, matBand); band.position.set(sx * (rFora - 1.4), chaoY + 18.5, cz + sz * (rFora - 1.4)); band.lookAt(0, band.position.y, cz); g.add(band)
    }
  }

  // telões de holograma flutuando sobre a arquibancada
  const matTela = mat(new THREE.MeshStandardMaterial({ color: 0x8fe9ff, emissive: 0x2bb8ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.45, side: THREE.DoubleSide }))
  const gTela = geo(new THREE.PlaneGeometry(5, 3))
  for (const a of [-0.55, 0, 0.55, Math.PI - 0.6, Math.PI + 0.6]) {
    const t = new THREE.Mesh(gTela, matTela); t.position.set(Math.sin(a) * (rMuro + 9), chaoY + 23, cz - Math.cos(a) * (rMuro + 9)); t.lookAt(0, t.position.y - 4, cz); g.add(t)
  }

  cena.add(g)
  return {
    grupo: g,
    descartar() {
      cena.remove(g); geos.forEach(x => x.dispose())
      mats.forEach(m => { m.map?.dispose(); m.dispose() })
      cena.background?.dispose?.()
    },
  }
}
