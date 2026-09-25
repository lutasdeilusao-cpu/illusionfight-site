import { Suspense, useState, useEffect, useRef } from 'react'
import { Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom'
import lazyWithReload from './lib/lazyWithReload'
import { useReader } from './context/ReaderContext'
import { useAchievements } from './context/AchievementsContext'
import TrialBanner from './components/TrialBanner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopOnNav from './components/ScrollToTopOnNav'
import CookieBanner from './components/CookieBanner'
import DesktopShellBar from './components/DesktopShellBar/DesktopShellBar'
import AnalyticsTracker from './components/AnalyticsTracker'
import LoginGate from './components/LoginGate/LoginGate'
import FichaGateRoute from './components/FichaGateRoute/FichaGateRoute'
import GameSessionRoute from './components/GameSessionRoute/GameSessionRoute'
const Home = lazyWithReload(() => import('./pages/site/Home/Home'))
const Musicas = lazyWithReload(() => import('./pages/content/Musicas'))
const Personagens = lazyWithReload(() => import('./pages/content/Personagens'))
const PersonagemDetalhe = lazyWithReload(() => import('./pages/content/PersonagemDetalhe'))
const HistoriasHub = lazyWithReload(() => import('./pages/content/historias/HistoriasHub'))
const HistoriaTitulo = lazyWithReload(() => import('./pages/content/historias/HistoriaTitulo'))
const LivroCapitulo = lazyWithReload(() => import('./pages/content/LivroCapitulo'))
const ContoCapitulo = lazyWithReload(() => import('./pages/content/ContoCapitulo'))
const ObraCapitulo = lazyWithReload(() => import('./pages/content/ObraCapitulo'))
const Assinar = lazyWithReload(() => import('./pages/platform/Assinar'))
const Autor = lazyWithReload(() => import('./pages/site/Autor'))
const WebshardHub = lazyWithReload(() => import('./pages/content/webshard/WebshardHub'))
// Rota PRIVADA de revisão (set/2026) — sem link em navbar/footer/sitemap/
// prerender-routes.js. Só acessível por quem tem a URL direta. Apagar
// este import + a <Route> abaixo quando a comparação acabar.
const WebtoonCompare = lazyWithReload(() => import('./pages/preview/WebtoonCompare'))
const WebshardRota = lazyWithReload(() => import('./pages/content/webshard/WebshardRota'))
const Mundo = lazyWithReload(() => import('./pages/content/Mundo'))
const UniversosHub = lazyWithReload(() => import('./pages/content/UniversosHub/UniversosHub'))
const Universo = lazyWithReload(() => import('./pages/content/Universo'))
const Quiz = lazyWithReload(() => import('./pages/site/Quiz'))
const Games = lazyWithReload(() => import('./pages/games/Games'))
const MiniGames = lazyWithReload(() => import('./pages/games/MiniGames/MiniGames'))
const TopTrumpsSP = lazyWithReload(() => import('./pages/games/TopTrumps/TopTrumpsSP'))
const TopTrumpsMP = lazyWithReload(() => import('./pages/games/TopTrumps/TopTrumpsMP'))
const MultiplayerLobby = lazyWithReload(() => import('./pages/games/MultiplayerLobby/MultiplayerLobby'))
const Leaderboard = lazyWithReload(() => import('./pages/platform/Leaderboard'))
const Login = lazyWithReload(() => import('./pages/platform/Login'))
const Cadastro = lazyWithReload(() => import('./pages/platform/Cadastro'))
const Perfil = lazyWithReload(() => import('./pages/platform/Perfil/Perfil'))
const Admin = lazyWithReload(() => import('./pages/platform/Admin'))
const Prototype = lazyWithReload(() => import('./pages/lab/Prototype/Prototype'))
const SRGRM = lazyWithReload(() => import('./pages/lab/Prototype/SRGRM/SRGRM'))
const ArenaTestbed = lazyWithReload(() => import('./pages/lab/Prototype/ArenaTestbed/ArenaTestbed'))
const LDILobby = lazyWithReload(() => import('./pages/games/LDI/Lobby'))
const LDICreate = lazyWithReload(() => import('./pages/games/LDI/Create'))
const LDIGame = lazyWithReload(() => import('./pages/games/LDI/Game'))
const LDICombat = lazyWithReload(() => import('./pages/games/LDI/Combat'))
const LDISheet = lazyWithReload(() => import('./pages/games/LDI/Sheet'))
const LDIClues = lazyWithReload(() => import('./pages/games/LDI/Clues'))
const LDIEnd = lazyWithReload(() => import('./pages/games/LDI/End'))
const LDIPuzzle = lazyWithReload(() => import('./pages/games/LDI/PuzzlePage'))
const JackCandy = lazyWithReload(() => import('./pages/games/JackCandy/JackCandy'))
const GanguesRoute = lazyWithReload(() => import('./pages/games/Gangues/GanguesRoute'))
const ArenaTaticsRoute = lazyWithReload(() => import('./pages/games/ArenaTatics/ArenaTaticsRoute'))
const PP = lazyWithReload(() => import('./pages/games/PesadeloParticular/PP'))
const DueloRoute = lazyWithReload(() => import('./pages/games/Duelo/DueloRoute'))
const Tamagoshi = lazyWithReload(() => import('./pages/games/Tamagoshi/Tamagoshi'))
const KernelPanic = lazyWithReload(() => import('./pages/games/KernelGames/KernelPanic/KernelPanic'))
const SlidingRafael = lazyWithReload(() => import('./pages/games/KernelGames/SlidingRafael/SlidingRafael'))
const CodigoPerdido = lazyWithReload(() => import('./pages/games/KernelGames/CodigoPerdido/CodigoPerdido'))
const MazeRafael = lazyWithReload(() => import('./pages/games/KernelGames/MazeRafael/MazeRafael'))
const GlitchRafael = lazyWithReload(() => import('./pages/games/KernelGames/GlitchRafael/GlitchRafael'))
const BulletHellRafael = lazyWithReload(() => import('./pages/games/KernelGames/BulletHellRafael/BulletHellRafael'))
const StabilizerRafael = lazyWithReload(() => import('./pages/games/KernelGames/StabilizerRafael/StabilizerRafael'))
const Loja = lazyWithReload(() => import('./pages/site/Loja/Loja'))
const Custos = lazyWithReload(() => import('./pages/site/Custos'))
const WebShard = lazyWithReload(() => import('./pages/site/WebShard'))
const Calendario = lazyWithReload(() => import('./pages/site/Calendario/Calendario'))
const NotFound = lazyWithReload(() => import('./pages/site/NotFound/NotFound'))
const SearchModal = lazyWithReload(() => import('./components/SearchModal/SearchModal'))
const LDINotification = lazyWithReload(() => import('./components/LDINotification/LDINotification'))
const RadioNina = lazyWithReload(() => import('./components/RadioNina/RadioNina'))
const UnifiedNotification = lazyWithReload(() => import('./components/UnifiedNotification/UnifiedNotification'))
import { trackPageView } from './lib/analytics'
import './pages/games/Duelo/version' // side-effect: console.log version

function LegacyLivroRedirect({ to }) {
  const params = useParams()
  const target = to.replace(/:(\w+)/g, (_, k) => params[k] ?? '')
  return <Navigate to={target} replace />
}

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
    // Tira a UI secundária (player, notificações) do caminho crítico do
    // primeiro paint, mas garante que ela monte logo em seguida.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => setDeferredUiReady(true), { timeout: 3000 })
      : window.setTimeout(() => setDeferredUiReady(true), 1500)
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [])

  useEffect(() => {
    // Avisa a vinheta de abertura (index.html) que o app montou — ela encerra
    // respeitando o mínimo visual; nunca antes.
    window.dispatchEvent(new Event('ldi:ready'))
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
      <DesktopShellBar />
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
        <Route path="/historias" element={<HistoriasHub />} />
        <Route path="/historias/lutas-de-ilusao" element={<HistoriaTitulo tipo="livro" />} />
        <Route path="/historias/lutas-de-ilusao/:id" element={<LivroCapitulo />} />
        <Route path="/historias/contos" element={<HistoriasHub tipo="conto" />} />
        <Route path="/historias/contos/:historia" element={<HistoriaTitulo tipo="conto" />} />
        <Route path="/historias/contos/:historia/:cap" element={<ContoCapitulo />} />
        <Route path="/historias/:slug" element={<HistoriaTitulo tipo="obra" />} />
        <Route path="/historias/:slug/:cap" element={<ObraCapitulo />} />
        {/* Redirects legados — /livro migrou para /historias (v10.199.0) */}
        <Route path="/livro" element={<Navigate to="/historias" replace />} />
        <Route path="/livro/contos" element={<Navigate to="/historias/contos" replace />} />
        <Route path="/livro/contos/:historia" element={<LegacyLivroRedirect to="/historias/contos/:historia" />} />
        <Route path="/livro/contos/:historia/:cap" element={<LegacyLivroRedirect to="/historias/contos/:historia/:cap" />} />
        <Route path="/livro/:id" element={<LegacyLivroRedirect to="/historias/lutas-de-ilusao/:id" />} />
        <Route path="/assinar" element={<Assinar />} />
        <Route path="/autor" element={<Autor />} />
        <Route path="/musicas" element={<Musicas />} />
        <Route path="/universos" element={<UniversosHub />} />
        <Route path="/universos/lutas-de-ilusao" element={<Mundo />} />
        <Route path="/universos/:universo" element={<Universo />} />
        {/* Mundo → Universos (migração v10.205.0): a rota antiga não morre. */}
        <Route path="/mundo" element={<LegacyLivroRedirect to="/universos" />} />
        <Route path="/mundo/:universo" element={<LegacyLivroRedirect to="/universos/:universo" />} />
        <Route path="/webtoon" element={<WebshardHub />} />
        <Route path="/webtoon/:param" element={<WebshardRota />} />
        <Route path="/webtoon/:slug/:cap" element={<WebshardRota />} />
        {/* privada, sem link em lugar nenhum — ver comentário no import acima */}
        <Route path="/preview-privado/webtoon-00-comparar" element={<WebtoonCompare />} />
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
        <Route path="/games/ldi-arena" element={<Navigate to="/games/ldi-gangues" replace />} />
        <Route path="/games/ldi-tatics" element={<FichaGateRoute gameId="tatics" feature="o LDI Tactics" nomeExibicao="LDI Tactics"><ArenaTaticsRoute /></FichaGateRoute>} />
        <Route path="/games/pesadelo" element={<FichaGateRoute gameId="pesadelo" feature="o Pesadelo Particular" nomeExibicao="Pesadelo Particular"><PP /></FichaGateRoute>} />
        <Route path="/games/duelo" element={<FichaGateRoute gameId="duelo" feature="o Duelo LDI" nomeExibicao="Duelo LDI"><DueloRoute /></FichaGateRoute>} />
        <Route path="/games/tamagoshi" element={<FichaGateRoute isFree={true} gameId="tamagoshi" feature="o Tamagoshi LDI" nomeExibicao="Tamagoshi LDI"><Tamagoshi /></FichaGateRoute>} />
        <Route path="/games/kernel-panic" element={<GameSessionRoute gameId="kernelpanic" gameName="Kernel Panic"><KernelPanic /></GameSessionRoute>} />
        <Route path="/games/sliding-rafael" element={<GameSessionRoute gameId="sliding_rafael" gameName="Sliding Rafael"><SlidingRafael /></GameSessionRoute>} />
        <Route path="/games/codigo-perdido" element={<GameSessionRoute gameId="codigo_perdido" gameName="Código Perdido"><CodigoPerdido /></GameSessionRoute>} />
        <Route path="/games/maze-rafael" element={<GameSessionRoute gameId="maze_rafael" gameName="Maze Rafael"><MazeRafael /></GameSessionRoute>} />
        <Route path="/games/glitch-rafael" element={<GameSessionRoute gameId="glitch_rafael" gameName="Glitch Rafael"><GlitchRafael /></GameSessionRoute>} />
        <Route path="/games/bullet-hell-rafael" element={<GameSessionRoute gameId="bullet_hell_rafael" gameName="Bullet Hell Rafael"><BulletHellRafael /></GameSessionRoute>} />
        <Route path="/games/stabilizer-rafael" element={<GameSessionRoute gameId="stabilizer_rafael" gameName="Stabilizer Rafael"><StabilizerRafael /></GameSessionRoute>} />
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
        <Route path="/web-shard" element={<WebShard />} />
        <Route path="/calendario" element={<Calendario />} />
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
          <RadioNina />
          <UnifiedNotification />
        </Suspense>
      )}
      <CookieBanner />
    </>
  )
}
