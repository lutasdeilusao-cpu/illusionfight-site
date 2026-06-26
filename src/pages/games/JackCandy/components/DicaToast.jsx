import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'

const DICAS = {
  sem_bengala: '👓 "adquira a bengala steampunk com o pajé. sem ela você está vulnerável." — Prof. Máquina',
  tem_bengala_sem_dungeon: '👓 "o anexo nos fundos da escola. todo bom plano começa com um tutorial." — Prof. Máquina',
  onibus_disponivel: '👓 "o ônibus abandonado contém as notas que você precisa. vá equipado." — Prof. Máquina',
  kim_bloqueado: '👓 "complete o ônibus. kim está esperando no boteco do jazz." — Prof. Máquina',
  rua_disponivel: '👓 "a rua de marelia não termina. nina está na delegacia depois dela." — Prof. Máquina',
  nina_disponivel: '👓 "nina está na delegacia. ela sabe mais do que conta." — Prof. Máquina',
  notas_sem_gasto: '👓 "você tem notas acumuladas. gaste com itens melhores." — Prof. Máquina',
  hp_baixo: '👓 "sua moral está baixa. compre um energético ou descanse." — Prof. Máquina',
  dungeon_livre: '👓 "você tem dungeons disponíveis. complete uma para progredir." — Prof. Máquina',
  sem_upgrade: '👓 "kim vende upgrades de bengala no boteco. cada um aumenta seu dano." — Prof. Máquina',
  auranis_dica: '👓 "auranis só abre quando você estiver pronto. visite o terminal três vezes." — Prof. Máquina',
  geral: '👓 "no sonho, cada escolha é um cálculo. verifique seus recursos antes de agir." — Prof. Máquina',
}

function getDica(store) {
  const f = store.flags || {}
  const dc = store.dungeonsCompletas || []

  if (!f.TEM_BENGALA) return DICAS.sem_bengala
  if (f.TEM_BENGALA && dc.length === 0) return DICAS.tem_bengala_sem_dungeon
  if (dc.includes('onibus') && !dc.includes('rua')) return DICAS.rua_disponivel
  if (dc.includes('onibus') && !f.KIM_LIBERADO) return DICAS.kim_bloqueado
  if (dc.includes('rua') && !dc.includes('risca_faca_interior')) return DICAS.nina_disponivel
  if (store.notas > 100 && store.cervejas > 200) return DICAS.notas_sem_gasto
  if (store.hpAtual < store.hpMax * 0.3) return DICAS.hp_baixo
  if (dc.length >= 1 && store.cervejasPorSegundo < 3) return DICAS.sem_upgrade
  if (!f.AURANIS_LIBERADO && dc.length >= 2) return DICAS.auranis_dica
  if (dc.length >= 1) return DICAS.dungeon_livre
  return DICAS.geral
}

export default function DicaToast() {
  const store = useJackStore()
  const [visivel, setVisivel] = useState(false)
  const [dica, setDica] = useState('')
  const [idleTimer, setIdleTimer] = useState(0)
  const [mostrouRecentemente, setMostrouRecentemente] = useState(false)

  useEffect(() => {
    if (store.fase !== 'vila') {
      setIdleTimer(0)
      setVisivel(false)
      return
    }

    const interval = setInterval(() => {
      setIdleTimer(t => {
        const novo = t + 1
        if (novo >= 20 && !visivel && !mostrouRecentemente) {
          setDica(getDica(useJackStore.getState()))
          setVisivel(true)
          setMostrouRecentemente(true)
          setTimeout(() => setMostrouRecentemente(false), 120000) // 2min cooldown
        }
        return novo
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [store.fase, visivel, mostrouRecentemente])

  // Reset idle on interaction
  useEffect(() => {
    const reset = () => { setIdleTimer(0); setVisivel(false) }
    window.addEventListener('click', reset)
    window.addEventListener('keydown', reset)
    return () => {
      window.removeEventListener('click', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [])

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          className="jdc-dica-toast"
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          onClick={() => setVisivel(false)}
          className="jdc-dica-toast jdc-dica-toast--visible"
        >
          {dica}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
