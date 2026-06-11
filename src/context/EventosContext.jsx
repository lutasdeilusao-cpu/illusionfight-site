import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export const METAS_PROGRESSO = [
  { id: 'webtoon_1',      label: 'Leu o Ep. 00 do Webtoon',           tipo: 'webtoon_lido',       valor_min: 0 },
  { id: 'capitulo_1',     label: 'Leu o Cap. 1 do Livro',             tipo: 'capitulo_lido',      valor_min: 1 },
  { id: 'sessao_longa',   label: 'Ficou 10+ minutos no site',         tipo: 'sessao_longa',       valor_min: 1 },
  { id: 'jogo_pesadelo',  label: 'Jogou Pesadelo Particular',         tipo: 'jogo_jogado',        descricao_contains: 'Pesadelo' },
  { id: 'caso_pesadelo',  label: 'Resolveu um caso no Pesadelo',      tipo: 'caso_resolvido',     valor_min: 1 },
  { id: 'jogo_arena',     label: 'Jogou a Arena LDI',                 tipo: 'jogo_jogado',        descricao_contains: 'Arena' },
  { id: 'arena_vitoria',  label: 'Venceu uma batalha na Arena',       tipo: 'arena_vitoria',      valor_min: 1 },
  { id: 'arena_level5',   label: 'Chegou ao nível 5 na Arena',        tipo: 'arena_levelup',      valor_min: 5 },
  { id: 'tama_criado',    label: 'Criou um Tamagoshi',                tipo: 'tama_criado',        valor_min: 1 },
  { id: 'tama_jovem',     label: 'Tamagoshi virou Jovem',             tipo: 'tama_fase',          descricao_contains: 'Jovem' },
  { id: 'lendas_criou',   label: 'Criou personagem em Lendas',        tipo: 'lendas_personagem',  valor_min: 1 },
  { id: 'lendas_act1',    label: 'Completou o Act 1 em Lendas',       tipo: 'lendas_act',         valor_min: 1 },
  { id: 'trumps_jogou',   label: 'Jogou Top Trumps',                  tipo: 'jogo_jogado',        descricao_contains: 'Trumps' },
  { id: 'trumps_vitoria', label: 'Venceu uma partida no Top Trumps',  tipo: 'trumps_vitoria',     valor_min: 1 },
  { id: 'jack_jogou',     label: 'Jogou Jack Dream Beer',             tipo: 'jogo_jogado',        descricao_contains: 'Jack' },
  { id: 'jack_caso',      label: 'Resolveu um caso no Jack',          tipo: 'jack_caso',          valor_min: 1 },
  { id: 'minigame',       label: 'Completou um MiniGame',             tipo: 'minigame_completo',  valor_min: 1 },
  { id: 'conquista_1',    label: 'Desbloqueou uma conquista',         tipo: 'conquista',          valor_min: 1 },
  { id: 'capitulo_5',     label: 'Leu até o Cap. 5 do Livro',        tipo: 'capitulo_lido',      valor_min: 5 },
  { id: 'webtoon_2',      label: 'Leu o Ep. 01 do Webtoon',          tipo: 'webtoon_lido',       valor_min: 1 },
]

const EventosContext = createContext(null)

export function EventosProvider({ children }) {
  const { user } = useAuth()
  const [eventos, setEventos] = useState([])
  const [todosEventos, setTodosEventos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const carregarEventos = useCallback(async () => {
    if (!user) {
      setEventos([])
      setTodosEventos([])
      setCarregando(false)
      return
    }
    setCarregando(true)
    // Últimos 5 eventos
    const { data: recentes } = await supabase
      .from('perfil_eventos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setEventos(recentes || [])

    // Todos os eventos para cálculo de metas
    const { data: todos } = await supabase
      .from('perfil_eventos')
      .select('*')
      .eq('user_id', user.id)
    setTodosEventos(todos || [])
    setCarregando(false)
  }, [user])

  useEffect(() => {
    carregarEventos()
  }, [carregarEventos])

  const registrarEvento = useCallback(async (tipo, descricao, valor = 0) => {
    if (!user) return

    // Verificar duplicata: mesmo tipo + mesma descrição
    const { data: existentes } = await supabase
      .from('perfil_eventos')
      .select('id')
      .eq('user_id', user.id)
      .eq('tipo', tipo)
      .eq('descricao', descricao)
      .limit(1)

    if (existentes && existentes.length > 0) {
      console.log(`[Eventos] duplicata ignorada: ${tipo} — ${descricao}`)
      return
    }

    const { data, error } = await supabase
      .from('perfil_eventos')
      .insert({ user_id: user.id, tipo, descricao, valor })
      .select()
      .single()

    if (error) {
      console.error('[Eventos] erro ao registrar:', error)
      return
    }

    console.log(`[Eventos] registrado: ${tipo} — ${descricao} (${valor})`)
    setEventos(prev => [data, ...prev].slice(0, 5))
    setTodosEventos(prev => [...prev, data])
  }, [user])

  // Cálculo de progresso
  const metasAtingidas = METAS_PROGRESSO.filter(meta => {
    const eventosDoTipo = todosEventos.filter(e => e.tipo === meta.tipo)
    if (eventosDoTipo.length === 0) return false
    if (meta.descricao_contains) {
      return eventosDoTipo.some(e => e.descricao.includes(meta.descricao_contains))
    }
    return eventosDoTipo.some(e => e.valor >= meta.valor_min)
  })

  const progresso = Math.round((metasAtingidas.length / METAS_PROGRESSO.length) * 100)

  return (
    <EventosContext.Provider value={{
      eventos,
      todosEventos,
      progresso,
      metasAtingidas: metasAtingidas.map(m => m.id),
      carregandoEventos: carregando,
      registrarEvento,
      carregarEventos,
      METAS_PROGRESSO,
    }}>
      {children}
    </EventosContext.Provider>
  )
}

export const useEventos = () => useContext(EventosContext)
