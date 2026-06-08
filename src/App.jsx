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

import Quiz from './pages/Quiz'
import Games from './pages/Games/Games'
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
import JackCandy from './pages/JackCandy/JackCandy'
import ArenaRoute from './pages/Arena/ArenaRoute'
import ArenaTaticsRoute from './pages/ArenaTatics/ArenaTaticsRoute'
import PP from './pages/PesadeloParticular/PP'
import DueloRoute from './pages/Duelo/DueloRoute'
import Tamagoshi from './pages/Tamagoshi/Tamagoshi'
import './pages/Duelo/version' // side-effect: console.log version

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
        <Route path="/webtoon" element={<Webtoon />} />
        <Route path="/webtoon/:id" element={<WebtoonEpisodio />} />
        <Route path="/games/toptrumps" element={<LoginGate feature="o Top Trumps LDI"><TopTrumps /></LoginGate>} />
        <Route path="/games/toptrumps/lobby" element={<LoginGate feature="o Top Trumps Multiplayer"><TopTrumpsLobby /></LoginGate>} />
        <Route path="/games/toptrumps/multiplayer" element={<LoginGate feature="a partida multiplayer"><TopTrumpsMP /></LoginGate>} />
        <Route path="/games/ldi" element={<LoginGate feature="o Lendas do LDI"><LDILobby /></LoginGate>} />
        <Route path="/games/ldi/create" element={<LoginGate feature="a criação de personagem LDI"><LDICreate /></LoginGate>} />
        <Route path="/games/ldi/game" element={<LoginGate feature="o Lendas do LDI"><LDIGame /></LoginGate>} />
        <Route path="/games/ldi/combat" element={<LoginGate feature="o combate LDI"><LDICombat /></LoginGate>} />
        <Route path="/games/ldi/sheet" element={<LoginGate feature="a ficha de personagem LDI"><LDISheet /></LoginGate>} />
        <Route path="/games/ldi/clues" element={<LoginGate feature="as pistas LDI"><LDIClues /></LoginGate>} />
        <Route path="/games/ldi/end" element={<LoginGate feature="o resultado LDI"><LDIEnd /></LoginGate>} />
        <Route path="/games/ldi/puzzle" element={<LoginGate feature="o puzzle LDI"><LDIPuzzle /></LoginGate>} />
        <Route path="/games/jackcandy" element={<LoginGate feature="o Jack Dream Beer"><JackCandy /></LoginGate>} />
        <Route path="/games/minigames" element={<LoginGate feature="os MiniGames"><MiniGames /></LoginGate>} />
        <Route path="/games/ldi-arena" element={<LoginGate feature="a Arena LDI"><ArenaRoute /></LoginGate>} />
        <Route path="/games/ldi-tatics" element={<LoginGate feature="o LDI Tactics"><ArenaTaticsRoute /></LoginGate>} />
        <Route path="/games/pesadelo" element={<LoginGate feature="o Pesadelo Particular"><PP /></LoginGate>} />
        <Route path="/games/duelo" element={<LoginGate feature="o Duelo LDI"><DueloRoute /></LoginGate>} />
        <Route path="/games/tamagoshi" element={<LoginGate feature="o Tamagoshi LDI"><Tamagoshi /></LoginGate>} />
        <Route path="/games" element={<Games />} />
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
