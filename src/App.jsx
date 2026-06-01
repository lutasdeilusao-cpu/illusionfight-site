import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Personagens from './pages/Personagens'
import PersonagemDetalhe from './pages/PersonagemDetalhe'
import Livro from './pages/Livro'
import LivroCapitulo from './pages/LivroCapitulo'
import Assinar from './pages/Assinar'
import Autor from './pages/Autor'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/personagens" element={<Personagens />} />
      <Route path="/personagens/:id" element={<PersonagemDetalhe />} />
      <Route path="/livro" element={<Livro />} />
      <Route path="/livro/:id" element={<LivroCapitulo />} />
      <Route path="/assinar" element={<Assinar />} />
      <Route path="/autor" element={<Autor />} />
    </Routes>
  )
}
