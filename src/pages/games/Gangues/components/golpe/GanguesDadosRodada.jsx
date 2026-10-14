import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as THREE from 'three'
import { CORES, criarDado, alvoDe, pegarRenderer } from './GanguesDado3D'
import { fighterName } from '../../engine/ganguesCombatPresentation.js'
import './GanguesDadosRodada.css'

/* A rodada da Briga em Multidão de uma vez: TODOS os dados da rodada (ataque
   vermelho e defesa azul de cada golpe) caem juntos numa mesa vista de cima,
   em câmera isométrica, pequenos. Pousaram: aparece o resultado de cada golpe
   e a rodada fecha (sozinha no automático, ou tocando). */
const ROLA_MS = 1100
const AUTO_FECHA_MS = 1700

export default function GanguesDadosRodada({ t, eventos, combatants, velocidade = 1, auto = false, onComplete }) {
  const caixa = useRef(null)
  const [pousou, setPousou] = useState(false)
  const ataques = eventos.filter(e => e.type === 'attack' && e.result)
  const fechou = useRef(false)
  const fechar = () => { if (!fechou.current) { fechou.current = true; onComplete() } }

  useEffect(() => {
    const tm = setTimeout(() => setPousou(true), ROLA_MS / velocidade)
    return () => clearTimeout(tm)
  }, [velocidade])
  useEffect(() => {
    if (!pousou || !auto) return
    const tm = setTimeout(fechar, AUTO_FECHA_MS / velocidade)
    return () => clearTimeout(tm)
  }, [pousou, auto, velocidade]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = caixa.current
    if (!el || !ataques.length) return
    const renderer = pegarRenderer()
    if (!renderer) { el.dataset.semWebgl = '1'; return }
    const w = el.clientWidth, h = el.clientHeight
    renderer.setSize(w, h)
    el.appendChild(renderer.domElement)
    const cena = new THREE.Scene()
    // câmera isométrica: ortográfica, olhando de cima e de lado
    const colunas = Math.min(4, Math.ceil(Math.sqrt(ataques.length)))
    const linhas = Math.ceil(ataques.length / colunas)
    const larg = colunas * 2.6, prof = linhas * 1.6
    const meia = Math.max(larg / 2, (prof / 2) * (w / h)) + 0.8
    const camera = new THREE.OrthographicCamera(-meia, meia, meia * (h / w), -meia * (h / w), 0.1, 60)
    camera.position.set(8, 9, 8)
    camera.lookAt(0, 0, 0)
    cena.add(new THREE.AmbientLight(0xffffff, 1.1))
    const luz = new THREE.DirectionalLight(0xffffff, 2.4)
    luz.position.set(3, 6, 2)
    cena.add(luz)

    const dados = []
    ataques.forEach((ev, i) => {
      const cx = (i % colunas) * 2.6 - (larg - 2.6) / 2
      const cz = Math.floor(i / colunas) * 1.6 - (prof - 1.6) / 2
      ;[[CORES.ataque, ev.result.rolls?.fa || 1, -0.55, 1], [CORES.defesa, ev.result.rolls?.fd || 1, 0.55, -1]].forEach(([cor, valor, dx, lado]) => {
        const d = criarDado(cor)
        d.scale.setScalar(0.85)
        d.position.set(cx + dx, 0, cz)
        cena.add(d)
        dados.push({ d, alvo: alvoDe(valor, lado), giro: new THREE.Vector3(6 + Math.random() * 6, 6 + Math.random() * 6, 3 + Math.random() * 4), fase: Math.random() * 3 })
      })
    })
    const t0 = performance.now()
    let ultimo = t0, quadro
    const passo = agora => {
      const dt = Math.min(0.05, (agora - ultimo) / 1000)
      ultimo = agora
      const rolando = agora - t0 < ROLA_MS / velocidade
      const tempo = (agora - t0) / 1000
      for (const x of dados) {
        if (rolando) {
          x.d.rotation.x += x.giro.x * dt; x.d.rotation.y += x.giro.y * dt; x.d.rotation.z += x.giro.z * dt
          x.d.position.y = Math.abs(Math.sin(tempo * 8 + x.fase)) * 0.9 * (1 - (agora - t0) / (ROLA_MS / velocidade))
        } else {
          x.d.quaternion.slerp(x.alvo, Math.min(1, dt * 10))
          x.d.position.y += (0 - x.d.position.y) * Math.min(1, dt * 14)
        }
      }
      renderer.render(cena, camera)
      quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => {
      cancelAnimationFrame(quadro)
      dados.forEach(({ d }) => { d.geometry.dispose(); d.material.forEach(m => { m.map.dispose(); m.dispose() }) })
      renderer.domElement.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const nome = key => fighterName(t, combatants.find(c => c.key === key)) || '?'
  return createPortal((
    <div className="gang-dados-rodada" onClick={() => pousou && fechar()}>
      <div className="gang-dados-rodada__card">
        <p className="gang-dados-rodada__titulo">{t('games.gangues.multidao.rodada_titulo', { n: ataques.length })}</p>
        <div ref={caixa} className="gang-dados-rodada__mesa">
          <span className="gang-dados-rodada__semwebgl" aria-hidden="true">🎲 × {ataques.length * 2}</span>
        </div>
        {pousou && (
          <ul className="gang-dados-rodada__lista">
            {ataques.map(ev => (
              <li key={ev.id} className={`${ev.side === 'enemy' ? 'is-dele' : 'is-meu'}${ev.result.critical ? ' is-critico' : ''}`}>
                <span>{nome(ev.actorKey)} → {nome(ev.targetKey)}</span>
                <b>{ev.result.damage > 0 ? `−${ev.result.damage}` : t('games.gangues.multidao.rodada_errou')}</b>
              </li>
            ))}
          </ul>
        )}
        {pousou && !auto && <button type="button" className="gang-dados-rodada__ok" onClick={fechar}>{t('games.gangues.multidao.rodada_continuar')}</button>}
      </div>
    </div>
  ), document.body)
}
