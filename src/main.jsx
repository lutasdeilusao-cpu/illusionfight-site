import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from './context/LanguageContext'
import { ReaderProvider } from './context/ReaderContext'
import { AuthProvider } from './context/AuthContext'
import { AchievementsProvider } from './context/AchievementsContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReaderProvider>
      <HelmetProvider>
        <BrowserRouter basename="/illusionfight-site">
          <AuthProvider>
            <AchievementsProvider>
              <LanguageProvider>
                <App />
              </LanguageProvider>
            </AchievementsProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ReaderProvider>
  </React.StrictMode>
)
