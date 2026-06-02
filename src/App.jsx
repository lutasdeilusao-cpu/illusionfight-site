import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useReader } from './context/ReaderContext'
import TrialBanner from './components/TrialBanner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopOnNav from './components/ScrollToTopOnNav'
import NotificationBalloon from './components/NotificationBalloon'
import CookieBanner from './components/CookieBanner'
import SearchModal from './components/SearchModal/SearchModal'
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

export default function App() {
  const { readerMode } = useReader()
  const [searchOpen, setSearchOpen] = useState(false)

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
        <Route path="/extras" element={<Extras />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
      <Footer />
      <ScrollToTop />
      <NotificationBalloon />
      <CookieBanner />
    </>
  )
}
