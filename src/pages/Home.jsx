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
  return (
    <>
      <TrialBanner />
      <Navbar />
      <HeroSlideshow />
      <LatestEpisodes />
      <CharactersRow />
      <BookChaptersRow />
      <MusicSection />
      <StoryProgress />
      <Footer />
    </>
  )
}
