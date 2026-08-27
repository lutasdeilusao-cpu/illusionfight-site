import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { useReader } from './context/ReaderContext'
import { useAchievements } from './context/AchievementsContext'
import TrialBanner from './components/TrialBanner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopOnNav from './components/ScrollToTopOnNav'
import CookieBanner from './components/CookieBanner'
import AnalyticsTracker from './components/AnalyticsTracker'
import LoginGate from './components/LoginGate/LoginGate'
import FichaGateRoute from './components/FichaGateRoute/FichaGateRoute'
const Home = lazy(() => import('./pages/site/Home'))
const Musicas = lazy(() => import('./pages/content/Musicas'))
const Personagens = lazy(() => import('./pages/content/Personagens'))
const PersonagemDetalhe = lazy(() => import('./pages/content/PersonagemDetalhe'))
const Livro = lazy(() => import('./pages/content/Livro'))
const LivroCapitulo = lazy(() => import('./pages/content/LivroCapitulo'))
const Assinar = lazy(() => import('./pages/platform/Assinar'))
const Autor = lazy(() => import('./pages/site/Autor'))
const Webtoon = lazy(() => import('./pages/content/Webtoon'))
const WebtoonEpisodio = lazy(() => import('./pages/content/WebtoonEpisodio'))
const Mundo = lazy(() => import('./pages/content/Mundo'))
const Quiz = lazy(() => import('./pages/site/Quiz'))
const Games = lazy(() => import('./pages/games/Games'))
const MiniGames = lazy(() => import('./pages/games/MiniGames/MiniGames'))
const TopTrumpsSP = lazy(() => import('./pages/games/TopTrumps/TopTrumpsSP'))
const TopTrumpsMP = lazy(() => import('./pages/games/TopTrumps/TopTrumpsMP'))
const MultiplayerLobby = lazy(() => import('./pages/games/MultiplayerLobby/MultiplayerLobby'))
const Leaderboard = lazy(() => import('./pages/platform/Leaderboard'))
const Login = lazy(() => import('./pages/platform/Login'))
const Cadastro = lazy(() => import('./pages/platform/Cadastro'))
const Perfil = lazy(() => import('./pages/platform/Perfil/Perfil'))
const Admin = lazy(() => import('./pages/platform/Admin'))
const Prototype = lazy(() => import('./pages/lab/Prototype/Prototype'))
const SRGRM = lazy(() => import('./pages/lab/Prototype/SRGRM/SRGRM'))
const ArenaTestbed = lazy(() => import('./pages/lab/Prototype/ArenaTestbed/ArenaTestbed'))
const LDILobby = lazy(() => import('./pages/games/LDI/Lobby'))
const LDICreate = lazy(() => import('./pages/games/LDI/Create'))
const LDIGame = lazy(() => import('./pages/games/LDI/Game'))
const LDICombat = lazy(() => import('./pages/games/LDI/Combat'))
const LDISheet = lazy(() => import('./pages/games/LDI/Sheet'))
const LDIClues = lazy(() => import('./pages/games/LDI/Clues'))
const LDIEnd = lazy(() => import('./pages/games/LDI/End'))
const LDIPuzzle = lazy(() => import('./pages/games/LDI/PuzzlePage'))
const JackCandy = lazy(() => import('./pages/games/JackCandy/JackCandy'))
const GanguesRoute = lazy(() => import('./pages/games/Gangues/GanguesRoute'))
const ArenaTaticsRoute = lazy(() => import('./pages/games/ArenaTatics/ArenaTaticsRoute'))
const PP = lazy(() => import('./pages/games/PesadeloParticular/PP'))
const DueloRoute = lazy(() => import('./pages/games/Duelo/DueloRoute'))
const Tamagoshi = lazy(() => import('./pages/games/Tamagoshi/Tamagoshi'))
const KernelPanic = lazy(() => import('./pages/games/KernelGames/KernelPanic/KernelPanic'))
const SlidingRafael = lazy(() => import('./pages/games/KernelGames/SlidingRafael/SlidingRafael'))
const CodigoPerdido = lazy(() => import('./pages/games/KernelGames/CodigoPerdido/CodigoPerdido'))
const MazeRafael = lazy(() => import('./pages/games/KernelGames/MazeRafael/MazeRafael'))
const GlitchRafael = lazy(() => import('./pages/games/KernelGames/GlitchRafael/GlitchRafael'))
const BulletHellRafael = lazy(() => import('./pages/games/KernelGames/BulletHellRafael/BulletHellRafael'))
const StabilizerRafael = lazy(() => import('./pages/games/KernelGames/StabilizerRafael/StabilizerRafael'))
const Loja = lazy(() => import('./pages/site/Loja/Loja'))
const Custos = lazy(() => import('./pages/site/Custos'))
const NotFound = lazy(() => import('./pages/site/NotFound/NotFound'))
const SearchModal = lazy(() => import('./components/SearchModal/SearchModal'))
const LDINotification = lazy(() => import('./components/LDINotification/LDINotification'))
const NinaMusicPlayer = lazy(() => import('./components/NinaMusicPlayer/NinaMusicPlayer'))
const UnifiedNotification = lazy(() => import('./components/UnifiedNotification/UnifiedNotification'))
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
  const [deferredUiReady, setDeferredUiReady] = useState(false)
  const { desbloquear } = useAchievements()
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])

  useEffect(() => {
    let fallbackTimer

    const activateDeferredUi = () => {
      setDeferredUiReady(true)
      window.removeEventListener('pointerdown', activateDeferredUi)
      window.removeEventListener('keydown', activateDeferredUi)
      window.removeEventListener('scroll', activateDeferredUi)
      window.removeEventListener('touchstart', activateDeferredUi)
      window.clearTimeout(fallbackTimer)
    }

    window.addEventListener('pointerdown', activateDeferredUi, { passive: true })
    window.addEventListener('keydown', activateDeferredUi)
    window.addEventListener('scroll', activateDeferredUi, { passive: true })
    window.addEventListener('touchstart', activateDeferredUi, { passive: true })
    fallbackTimer = window.setTimeout(activateDeferredUi, 15000)

    return () => {
      window.removeEventListener('pointerdown', activateDeferredUi)
      window.removeEventListener('keydown', activateDeferredUi)
      window.removeEventListener('scroll', activateDeferredUi)
      window.removeEventListener('touchstart', activateDeferredUi)
      window.clearTimeout(fallbackTimer)
    }
  }, [])

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
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
      <Suspense fallback={<div className="route-loading" aria-hidden="true" />}>
      <div role="main" id="main-content">
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
      </div>
      <Footer hidden={readerMode} />
      <TrialBanner hidden={readerMode} />
      </Suspense>
      <ScrollToTop />
      {deferredUiReady && (
        <Suspense fallback={null}>
          <LDINotification />
          <NinaMusicPlayer />
          <UnifiedNotification />
        </Suspense>
      )}
      <CookieBanner />
    </>
  )
}
