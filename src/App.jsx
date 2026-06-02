import { Routes, Route } from 'react-router-dom'
import { useReader } from './context/ReaderContext'
import TrialBanner from './components/TrialBanner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import NotificationBalloon from './components/NotificationBalloon'
import CookieBanner from './components/CookieBanner'
import Home from './pages/Home'
import Personagens from './pages/Personagens'
import PersonagemDetalhe from './pages/PersonagemDetalhe'
import Livro from './pages/Livro'
import LivroCapitulo from './pages/LivroCapitulo'
import Assinar from './pages/Assinar'
import Autor from './pages/Autor'
import Webtoon from './pages/Webtoon'
import WebtoonEpisodio from './pages/WebtoonEpisodio'

export default function App() {
  const { readerMode } = useReader()

  return (
    <>
      <Navbar hidden={readerMode} />
      <TrialBanner hidden={readerMode} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personagens" element={<Personagens />} />
        <Route path="/personagens/:id" element={<PersonagemDetalhe />} />
        <Route path="/livro" element={<Livro />} />
        <Route path="/livro/:id" element={<LivroCapitulo />} />
        <Route path="/assinar" element={<Assinar />} />
        <Route path="/autor" element={<Autor />} />
        <Route path="/webtoon" element={<Webtoon />} />
        <Route path="/webtoon/:id" element={<WebtoonEpisodio />} />
      </Routes>
      <Footer />
      <ScrollToTop />
      <NotificationBalloon />
      <CookieBanner />
    </>
  )
}
