import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useReader } from './context/ReaderContext'
import { useAchievements } from './context/AchievementsContext'
import TrialBanner from './components/TrialBanner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopOnNav from './components/ScrollToTopOnNav'
import NotificationBalloon from './components/NotificationBalloon'
import CookieBanner from './components/CookieBanner'
import SearchModal from './components/SearchModal/SearchModal'
import AchievementToast from './components/AchievementToast/AchievementToast'
import LoginGate from './components/LoginGate/LoginGate'
import Home from './pages/Home'
import Musicas from './pages/Musicas'
import Personagens from './pages/Personagens'
import PersonagemDetalhe from './pages/PersonagemDetalhe'
import Livro from './pages/Livro'
import LivroCapitulo from './pages/LivroCapitulo'
import Assinar from './pages/Assinar'
import Autor from './pages/Autor'
import Webtoon from './pages/Webtoon'
import WebtoonEpisodio from './pages/WebtoonEpisodio'
import Mundo from './pages/Mundo'
import Curiosidades from './pages/Curiosidades'
import Quiz from './pages/Quiz'
import Extras from './pages/Extras'
import MiniGames from './pages/MiniGames/MiniGames'
import TopTrumps from './pages/TopTrumps'
import TopTrumpsLobby from './pages/TopTrumpsLobby'
import TopTrumpsMP from './pages/TopTrumpsMP'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Perfil from './pages/Perfil/Perfil'
import Admin from './pages/Admin'
import LDILobby from './pages/LDI/Lobby'
import LDICreate from './pages/LDI/Create'
import LDIGame from './pages/LDI/Game'
import LDICombat from './pages/LDI/Combat'
import LDISheet from './pages/LDI/Sheet'
import LDIClues from './pages/LDI/Clues'
import LDIEnd from './pages/LDI/End'
import LDIPuzzle from './pages/LDI/PuzzlePage'
import Diagnostico from './pages/LDI/Diagnostico'
import JackCandy from './pages/JackCandy/JackCandy'

export default function App() {
  const { readerMode } = useReader()
  const [searchOpen, setSearchOpen] = useState(false)
  const { desbloquear, toastPendente, fecharToast } = useAchievements()
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

  useEffect(() => {
    const t1 = setTimeout(() => desbloquearRef.current('primeiro_acesso'), 60000)
    const t2 = setTimeout(() => desbloquearRef.current('sangue_primordial'), 600000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      <ScrollToTopOnNav />
      <Navbar hidden={readerMode} onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <TrialBanner hidden={readerMode} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personagens" element={<Personagens />} />
        <Route path="/personagens/:id" element={<PersonagemDetalhe />} />
        <Route path="/livro" element={<Livro />} />
        <Route path="/livro/:id" element={<LivroCapitulo />} />
        <Route path="/assinar" element={<Assinar />} />
        <Route path="/autor" element={<Autor />} />
        <Route path="/musicas" element={<Musicas />} />
        <Route path="/mundo" element={<Mundo />} />
        <Route path="/curiosidades" element={<Curiosidades />} />
        <Route path="/webtoon" element={<Webtoon />} />
        <Route path="/webtoon/:id" element={<WebtoonEpisodio />} />
        <Route path="/extras/toptrumps" element={<TopTrumps />} />
        <Route path="/extras/toptrumps/lobby" element={<LoginGate feature="o Top Trumps Multiplayer"><TopTrumpsLobby /></LoginGate>} />
        <Route path="/extras/toptrumps/multiplayer" element={<LoginGate feature="a partida multiplayer"><TopTrumpsMP /></LoginGate>} />
        <Route path="/extras/ldi" element={<LDILobby />} />
        <Route path="/extras/ldi/create" element={<LDICreate />} />
        <Route path="/extras/ldi/game" element={<LDIGame />} />
        <Route path="/extras/ldi/combat" element={<LDICombat />} />
        <Route path="/extras/ldi/sheet" element={<LDISheet />} />
        <Route path="/extras/ldi/clues" element={<LDIClues />} />
        <Route path="/extras/ldi/end" element={<LDIEnd />} />
        <Route path="/extras/ldi/diagnostico" element={<Diagnostico />} />
        <Route path="/extras/ldi/puzzle" element={<LDIPuzzle />} />
        <Route path="/extras/jackcandy" element={<JackCandy />} />
        <Route path="/extras/minigames" element={<MiniGames />} />
        <Route path="/extras" element={<Extras />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer hidden={readerMode} />
      <ScrollToTop />
      <NotificationBalloon />
      <CookieBanner />
      {toastPendente && <AchievementToast achievement={toastPendente} fecharToast={fecharToast} />}
    </>
  )
}
