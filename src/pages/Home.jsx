import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import TrialBanner from '../components/TrialBanner'
import Navbar from '../components/Navbar'
import HeroSlideshow from '../components/HeroSlideshow'
import LatestEpisodes from '../components/LatestEpisodes'
import CharactersRow from '../components/CharactersRow'
import BookChaptersRow from '../components/BookChaptersRow'
import MusicSection from '../components/MusicSection'
import StoryProgress from '../components/StoryProgress'
import Footer from '../components/Footer'

export default function Home() {
  const { t } = useLanguage()

  return (
    <>
      <Helmet>
        <title>Lutas de Ilusão — A dor é 100% real</title>
      </Helmet>
      <TrialBanner />
      <Navbar />
      <HeroSlideshow />
      <LatestEpisodes />
      <CharactersRow />
      <BookChaptersRow />
      <MusicSection />
      <section className="home-support">
        <div className="container">
          <div className="home-support__inner">
            <div className="home-support__content">
              <h2 className="home-support__title">{t('homeSupport.title')}</h2>
              <p className="home-support__text">{t('homeSupport.text')}</p>
            </div>
            <Link to="/assinar" className="home-support__cta">{t('homeSupport.cta')}</Link>
          </div>
        </div>
      </section>
      <StoryProgress />
      <Footer />
    </>
  )
}
