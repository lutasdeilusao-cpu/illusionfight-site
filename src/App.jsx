import { useState, useEffect, useRef } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
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
import AnalyticsTracker from './components/AnalyticsTracker'
import LoginGate from './components/LoginGate/LoginGate'
import FichaGateRoute from './components/FichaGateRoute/FichaGateRoute'
import Home from './pages/site/Home'
import Musicas from './pages/content/Musicas'
import Personagens from './pages/content/Personagens'
import PersonagemDetalhe from './pages/content/PersonagemDetalhe'
import Livro from './pages/content/Livro'
import LivroCapitulo from './pages/content/LivroCapitulo'
import Assinar from './pages/platform/Assinar'
import Autor from './pages/site/Autor'
import Webtoon from './pages/content/Webtoon'
import WebtoonEpisodio from './pages/content/WebtoonEpisodio'
import Mundo from './pages/content/Mundo'

import Quiz from './pages/site/Quiz'
import Games from './pages/games/Games'
import MiniGames from './pages/games/MiniGames/MiniGames'
import TopTrumpsSP from './pages/games/TopTrumps/TopTrumpsSP'
import TopTrumpsMP from './pages/games/TopTrumps/TopTrumpsMP'
import MultiplayerLobby from './pages/games/MultiplayerLobby/MultiplayerLobby'
import Leaderboard from './pages/platform/Leaderboard'
import Login from './pages/platform/Login'
import Cadastro from './pages/platform/Cadastro'
import Perfil from './pages/platform/Perfil/Perfil'
import Admin from './pages/platform/Admin'
import Prototype from './pages/lab/Prototype/Prototype'
import SRGRM from './pages/lab/Prototype/SRGRM/SRGRM'
import ArenaTestbed from './pages/lab/Prototype/ArenaTestbed/ArenaTestbed'
import LDILobby from './pages/games/LDI/Lobby'
import LDICreate from './pages/games/LDI/Create'
import LDIGame from './pages/games/LDI/Game'
import LDICombat from './pages/games/LDI/Combat'
import LDISheet from './pages/games/LDI/Sheet'
import LDIClues from './pages/games/LDI/Clues'
import LDIEnd from './pages/games/LDI/End'
import LDIPuzzle from './pages/games/LDI/PuzzlePage'
import JackCandy from './pages/games/JackCandy/JackCandy'
import GanguesRoute from './pages/games/Gangues/GanguesRoute'
import ArenaTaticsRoute from './pages/games/ArenaTatics/ArenaTaticsRoute'
import PP from './pages/games/PesadeloParticular/PP'
import DueloRoute from './pages/games/Duelo/DueloRoute'
import Tamagoshi from './pages/games/Tamagoshi/Tamagoshi'
import KernelPanic from './pages/games/KernelGames/KernelPanic/KernelPanic'
import SlidingRafael from './pages/games/KernelGames/SlidingRafael/SlidingRafael'
import CodigoPerdido from './pages/games/KernelGames/CodigoPerdido/CodigoPerdido'
import MazeRafael from './pages/games/KernelGames/MazeRafael/MazeRafael'
import GlitchRafael from './pages/games/KernelGames/GlitchRafael/GlitchRafael'
import BulletHellRafael from './pages/games/KernelGames/BulletHellRafael/BulletHellRafael'
import StabilizerRafael from './pages/games/KernelGames/StabilizerRafael/StabilizerRafael'
import Loja from './pages/site/Loja/Loja'
import Custos from './pages/site/Custos'
import NotFound from './pages/site/NotFound/NotFound'
import { trackPageView } from './lib/analytics'
import './pages/games/Duelo/version' // side-effect: console.log version

function AnalyticsPageView() {
  const location = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => trackPageView(`${location.pathname}${location.search}`), 0)
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  return null
}

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
      <AnalyticsPageView />
      <AnalyticsTracker />
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
        <Route path="/games/toptrumps/v2" element={<TopTrumpsSP />} />
        <Route path="/games/toptrumps" element={<TopTrumpsSP />} />
        <Route path="/games/toptrumps/lobby" element={<Navigate to="/games/multiplayer/lobby?game=toptrumps&mode=free" replace />} />
        <Route path="/games/toptrumps/multiplayer" element={<FichaGateRoute gameId="top_trumps" feature="a partida multiplayer" nomeExibicao="Top Trumps LDI"><TopTrumpsMP /></FichaGateRoute>} />
        <Route path="/games/multiplayer/lobby" element={<FichaGateRoute gameId="top_trumps" feature="o lobby multiplayer" nomeExibicao="Top Trumps LDI"><MultiplayerLobby /></FichaGateRoute>} />
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
        <Route path="/games/ldi-gangues" element={<FichaGateRoute gameId="gangues" feature="o LDI Gangues" nomeExibicao="LDI Gangues"><GanguesRoute /></FichaGateRoute>} />
        <Route path="/games/ldi-gangues/treinamento" element={<GanguesRoute publicTraining />} />
        <Route path="/games/ldi-arena" element={<Navigate to="/games/ldi-gangues" replace />} />
        <Route path="/games/ldi-tatics" element={<FichaGateRoute gameId="tatics" feature="o LDI Tactics" nomeExibicao="LDI Tactics"><ArenaTaticsRoute /></FichaGateRoute>} />
        <Route path="/games/pesadelo" element={<FichaGateRoute gameId="pesadelo" feature="o Pesadelo Particular" nomeExibicao="Pesadelo Particular"><PP /></FichaGateRoute>} />
        <Route path="/games/duelo" element={<FichaGateRoute gameId="duelo" feature="o Duelo LDI" nomeExibicao="Duelo LDI"><DueloRoute /></FichaGateRoute>} />
        <Route path="/games/tamagoshi" element={<FichaGateRoute isFree={true} gameId="tamagoshi" feature="o Tamagoshi LDI" nomeExibicao="Tamagoshi LDI"><Tamagoshi /></FichaGateRoute>} />
        <Route path="/games/kernel-panic" element={<KernelPanic />} />
        <Route path="/games/sliding-rafael" element={<SlidingRafael />} />
        <Route path="/games/codigo-perdido" element={<CodigoPerdido />} />
        <Route path="/games/maze-rafael" element={<MazeRafael />} />
        <Route path="/games/glitch-rafael" element={<GlitchRafael />} />
        <Route path="/games/bullet-hell-rafael" element={<BulletHellRafael />} />
        <Route path="/games/stabilizer-rafael" element={<StabilizerRafael />} />
        <Route path="/loja" element={<Loja />} />
        <Route path="/games" element={<Games />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/prototype" element={<Prototype />} />
        <Route path="/prototype/srgrm" element={<SRGRM />} />
        <Route path="/prototype/arenatestbed" element={<ArenaTestbed />} />
        <Route path="/custos" element={<Custos />} />
        <Route path="*" element={<NotFound />} />
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
