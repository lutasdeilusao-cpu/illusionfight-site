import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './config/version'
import { LanguageProvider } from './context/LanguageContext'
import { ReaderProvider } from './context/ReaderContext'
import { AuthProvider } from './context/AuthContext'
import { FichasProvider } from './context/FichasContext'
import { DixProvider } from './context/DixContext'
import { AchievementsProvider } from './context/AchievementsContext'
import App from './App'
import './index.css'

// Solicitar permissão de notificação ao carregar
if ('Notification' in window && 'serviceWorker' in navigator) {
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReaderProvider>
      <HelmetProvider>
        <BrowserRouter basename="/">
          <AuthProvider>
          <FichasProvider>
            <DixProvider>
            <AchievementsProvider>
              <LanguageProvider>
                <App />
              </LanguageProvider>
            </AchievementsProvider>
            </DixProvider>
          </FichasProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ReaderProvider>
  </React.StrictMode>
)
