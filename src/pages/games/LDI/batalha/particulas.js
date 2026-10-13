import * as THREE from 'three'

// Partículas da arena 3D (texturas do Particle Pack do Kenney, CC0, em ./particulas).
// Cada partícula é um sprite que nasce num ponto, voa, cresce, gira e some.
// Cores em hex de propósito: WebGL não lê variável de CSS.
const URLS = import.meta.glob('./particulas/*.png', { eager: true, query: '?url', import: 'default' })

// Como cada golpe e cada super aparece: o rastro do projétil e a explosão no alvo.
export const ESTILOS = {
  rajada: {
    rastro: [{ tex: 'spark_05', cor: 0xffd166, tam: 0.7, vida: 0.35 }, { tex: 'light_01', cor: 0x8a6a20, tam: 0.5, vida: 0.15 }],
    impacto: [{ tex: 'star_04', cor: 0xffd166, n: 14, vel: 5, tam: 1.2, vida: 0.7 }, { tex: 'flame_03', cor: 0xff9a3c, n: 10, vel: 3, tam: 1.6, vida: 0.6 }, { tex: 'spark_04', cor: 0xffffff, n: 18, vel: 7, tam: 0.6, vida: 0.5 }],
  },
  geloNegro: {
    rastro: [{ tex: 'magic_04', cor: 0x8fe3ff, tam: 0.9, vida: 0.45 }, { tex: 'star_04', cor: 0xdff7ff, tam: 0.5, vida: 0.3 }],
    impacto: [{ tex: 'circle_05', cor: 0x8fe3ff, n: 6, vel: 1, tam: 2.4, cresce: 2.5, vida: 0.8 }, { tex: 'magic_02', cor: 0xbff0ff, n: 16, vel: 4, tam: 1, vida: 0.9 }, { tex: 'smoke_02', cor: 0xe6f7ff, n: 8, vel: 1.5, tam: 2, vida: 1.1 }],
  },
  choque: {
    rastro: [{ tex: 'spark_04', cor: 0x18dafb, tam: 0.9, vida: 0.25 }, { tex: 'trace_01', cor: 0xb8f6ff, tam: 1.2, vida: 0.15 }],
    impacto: [{ tex: 'muzzle_02', cor: 0x0e7f93, n: 3, vel: 0.5, tam: 2.2, cresce: 1.2, vida: 0.3 }, { tex: 'spark_05', cor: 0xb8f6ff, n: 26, vel: 8, tam: 0.7, vida: 0.5 }, { tex: 'star_04', cor: 0xffffff, n: 8, vel: 4, tam: 1, vida: 0.6 }],
  },
  furia: {
    rastro: [{ tex: 'flame_03', cor: 0xff6a1f, tam: 1.3, vida: 0.4 }, { tex: 'fire_01', cor: 0xffb03c, tam: 1, vida: 0.3 }],
    impacto: [{ tex: 'fire_01', cor: 0xff6a1f, n: 18, vel: 5, tam: 2.4, cresce: 1.5, vida: 0.9 }, { tex: 'smoke_02', cor: 0x553322, n: 12, vel: 2, tam: 3, vida: 1.4, normal: true }, { tex: 'spark_05', cor: 0xffd166, n: 24, vel: 9, tam: 0.6, vida: 0.6 }],
  },
  // super DELE: vem do robô na sua direção
  dele: {
    rastro: [{ tex: 'flame_03', cor: 0xff3b4e, tam: 1.2, vida: 0.35 }, { tex: 'spark_05', cor: 0xff9aa5, tam: 0.6, vida: 0.25 }],
    impacto: [{ tex: 'muzzle_02', cor: 0xff3b4e, n: 4, vel: 0.5, tam: 4, cresce: 1.2, vida: 0.35 }, { tex: 'spark_05', cor: 0xff9aa5, n: 22, vel: 7, tam: 0.7, vida: 0.5 }],
  },
  // cura: brilho verde subindo em volta de você (não é projétil)
  folego: {
    impacto: [{ tex: 'magic_02', cor: 0x6be07a, n: 18, vel: 1.2, tam: 0.7, vida: 1.4, sobe: 1.6 }, { tex: 'twirl_02', cor: 0x3f9e4a, n: 3, vel: 0.4, tam: 1.6, cresce: 1.2, vida: 1.3, sobe: 0.6 }],
  },
  // golpe comum seu acertando ele, e golpe dele acertando você
  acerto: { impacto: [{ tex: 'star_04', cor: 0xb8f6ff, n: 6, vel: 3, tam: 0.7, vida: 0.4 }, { tex: 'spark_04', cor: 0xffffff, n: 8, vel: 5, tam: 0.45, vida: 0.3 }] },
  apanhou: { impacto: [{ tex: 'spark_05', cor: 0xff3b4e, n: 12, vel: 5, tam: 0.6, vida: 0.4 }] },
  // nota sua acertada: estalinho no lugar dela
  nota: { impacto: [{ tex: 'star_04', cor: 0x18dafb, n: 5, vel: 2.5, tam: 0.5, vida: 0.35 }] },
}

export function criarParticulas(cena, gerente) {
  const loader = new THREE.TextureLoader(gerente)
  const tex = {}
  for (const [caminho, url] of Object.entries(URLS)) tex[caminho.match(/([a-z0-9_]+)\.png$/)[1]] = loader.load(url)
  const vivas = []

  // solta `n` partículas de um tipo num ponto, voando em todas as direções
  const soltar = (pos, { tex: nome, cor = 0xffffff, n = 1, vel = 0, tam = 1, cresce = 0.6, vida = 0.5, sobe = 0, normal = false }) => {
    const mapa = tex[nome]
    if (!mapa) return
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({ map: mapa, color: cor, transparent: true, depthWrite: false, depthTest: false,
        blending: normal ? THREE.NormalBlending : THREE.AdditiveBlending, rotation: Math.random() * Math.PI * 2 })
      const sp = new THREE.Sprite(mat)
      sp.position.copy(pos)
      sp.renderOrder = 30
      const v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(vel * (0.4 + Math.random() * 0.6))
      v.y += sobe
      cena.add(sp)
      vivas.push({ sp, v, idade: 0, vida: vida * (0.7 + Math.random() * 0.6), tam: tam * (0.7 + Math.random() * 0.6), cresce, giro: (Math.random() - 0.5) * 4 })
    }
  }
  const explodir = (pos, estilo) => { for (const camada of (ESTILOS[estilo]?.impacto || [])) soltar(pos, camada) }
  // o rastro é aditivo: soma luz; por isso cada camada nasce mais fraca que a explosão
const rastro = (pos, estilo) => { for (const camada of (ESTILOS[estilo]?.rastro || [])) soltar(pos, { ...camada, n: 1, vel: 0.4, tam: camada.tam * 0.7 }) }

  const atualizar = dt => {
    for (let i = vivas.length - 1; i >= 0; i--) {
      const p = vivas[i]
      p.idade += dt
      const k = p.idade / p.vida
      if (k >= 1) { cena.remove(p.sp); p.sp.material.dispose(); vivas.splice(i, 1); continue }
      p.sp.position.addScaledVector(p.v, dt)
      p.v.multiplyScalar(1 - dt * 2.2)
      p.sp.scale.setScalar(p.tam * (1 + p.cresce * k))
      p.sp.material.opacity = 1 - k * k
      p.sp.material.rotation += p.giro * dt
    }
  }
  const liberar = () => {
    for (const p of vivas) { cena.remove(p.sp); p.sp.material.dispose() }
    vivas.length = 0
    Object.values(tex).forEach(t => t.dispose())
  }
  return { explodir, rastro, atualizar, liberar }
}
