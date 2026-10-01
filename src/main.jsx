import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './config/version'
import './lib/runtimePlatform'
import './lib/colunaApp'
import { iniciarPainelColeta } from './lib/painelColeta'
import { LanguageProvider } from './context/LanguageProvider'
import { ReaderProvider } from './context/ReaderContext'
import { AuthProvider } from './context/AuthContext'
import { FichasProvider } from './context/FichasContext'
import { DixProvider } from './context/DixContext'
import { AchievementsProvider } from './context/AchievementsContext'
import { TutorialProgressProvider } from './context/TutorialProgressContext'
import { EventosProvider } from './context/EventosContext'
import { RadioNinaProvider } from './components/RadioNina/RadioNinaContext'
import App from './App'
import './index.css'

iniciarPainelColeta()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReaderProvider>
      <HelmetProvider>
        <BrowserRouter basename="/">
          <AuthProvider>
            <FichasProvider>
              <DixProvider>
                <AchievementsProvider>
                  <TutorialProgressProvider>
                    <EventosProvider>
                      <LanguageProvider>
                        <RadioNinaProvider>
                          <App />
                        </RadioNinaProvider>
                      </LanguageProvider>
                    </EventosProvider>
                  </TutorialProgressProvider>
                </AchievementsProvider>
              </DixProvider>
            </FichasProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ReaderProvider>
  </React.StrictMode>,
)
