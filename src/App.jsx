import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useReader } from './context/ReaderContext'
import { useAchievements } from './context/AchievementsContext'
import TrialBanner from './components/TrialBanner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopOnNav from './components/ScrollToTopOnNav'
import LDINotification from './components/LDINotification/LDINotification'
import NinaMusicPlayer from './components/NinaMusicPlayer/NinaMusicPlayer'
import CookieBanner from './components/CookieBanner'
import SearchModal from './components/SearchModal/SearchModal'
import UnifiedNotification from './components/UnifiedNotification/UnifiedNotification'
import LoginGate from './components/LoginGate/LoginGate'
import FichaGateRoute from './components/FichaGateRoute/FichaGateRoute'
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
import Prototype from './pages/Prototype/Prototype'
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
import Loja from './pages/Loja/Loja'
import Custos from './pages/Custos'
import './pages/Duelo/version' // side-effect: console.log version

export default function App() {
  const { readerMode } = useReader()
  const [searchOpen, setSearchOpen] = useState(false)
  const { desbloquear } = useAchievements()
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
        <Route path="/games/toptrumps" element={<FichaGateRoute gameId="top_trumps" feature="o Top Trumps LDI" nomeExibicao="Top Trumps LDI"><TopTrumps /></FichaGateRoute>} />
        <Route path="/games/toptrumps/lobby" element={<FichaGateRoute gameId="top_trumps" feature="o Top Trumps Multiplayer" nomeExibicao="Top Trumps LDI"><TopTrumpsLobby /></FichaGateRoute>} />
        <Route path="/games/toptrumps/multiplayer" element={<FichaGateRoute gameId="top_trumps" feature="a partida multiplayer" nomeExibicao="Top Trumps LDI"><TopTrumpsMP /></FichaGateRoute>} />
        <Route path="/games/ldi" element={<FichaGateRoute gameId="lendas_ldi" feature="o Lendas do LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDILobby /></FichaGateRoute>} />
        <Route path="/games/ldi/create" element={<FichaGateRoute gameId="lendas_ldi" feature="a criação de personagem LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDICreate /></FichaGateRoute>} />
        <Route path="/games/ldi/game" element={<FichaGateRoute gameId="lendas_ldi" feature="o Lendas do LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDIGame /></FichaGateRoute>} />
        <Route path="/games/ldi/combat" element={<FichaGateRoute gameId="lendas_ldi" feature="o combate LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDICombat /></FichaGateRoute>} />
        <Route path="/games/ldi/sheet" element={<FichaGateRoute gameId="lendas_ldi" feature="a ficha de personagem LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDISheet /></FichaGateRoute>} />
        <Route path="/games/ldi/clues" element={<FichaGateRoute gameId="lendas_ldi" feature="as pistas LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDIClues /></FichaGateRoute>} />
        <Route path="/games/ldi/end" element={<FichaGateRoute gameId="lendas_ldi" feature="o resultado LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDIEnd /></FichaGateRoute>} />
        <Route path="/games/ldi/puzzle" element={<FichaGateRoute gameId="lendas_ldi" feature="o puzzle LDI" nomeExibicao="Lendas do LDI" isFree={true}><LDIPuzzle /></FichaGateRoute>} />
        <Route path="/games/jackcandy" element={<FichaGateRoute gameId="jack_dream_beer" feature="o Jack Dream Beer" nomeExibicao="Jack Dream Beer"><JackCandy /></FichaGateRoute>} />
        <Route path="/games/minigames" element={<FichaGateRoute gameId="minigames" feature="os MiniGames" nomeExibicao="MiniGames" isFree={true}><MiniGames /></FichaGateRoute>} />
        <Route path="/games/ldi-arena" element={<FichaGateRoute gameId="arena" feature="a Arena LDI" nomeExibicao="Arena LDI"><ArenaRoute /></FichaGateRoute>} />
        <Route path="/games/ldi-tatics" element={<FichaGateRoute gameId="tatics" feature="o LDI Tactics" nomeExibicao="LDI Tactics"><ArenaTaticsRoute /></FichaGateRoute>} />
        <Route path="/games/pesadelo" element={<FichaGateRoute gameId="pesadelo" feature="o Pesadelo Particular" nomeExibicao="Pesadelo Particular"><PP /></FichaGateRoute>} />
        <Route path="/games/duelo" element={<FichaGateRoute gameId="duelo" feature="o Duelo LDI" nomeExibicao="Duelo LDI"><DueloRoute /></FichaGateRoute>} />
        <Route path="/games/tamagoshi" element={<FichaGateRoute isFree={true} gameId="tamagoshi" feature="o Tamagoshi LDI" nomeExibicao="Tamagoshi LDI"><Tamagoshi /></FichaGateRoute>} />
        <Route path="/loja" element={<Loja />} />
        <Route path="/games" element={<Games />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/prototype" element={<Prototype />} />
        <Route path="/custos" element={<Custos />} />
      </Routes>
      <Footer hidden={readerMode} />
      <ScrollToTop />
      <LDINotification />
      <NinaMusicPlayer />
      <UnifiedNotification />
      <CookieBanner />
    </>
  )
}
