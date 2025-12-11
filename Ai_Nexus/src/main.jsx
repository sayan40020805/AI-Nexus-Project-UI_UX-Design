import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './components/theme-provider'
import App from './App.jsx'
import { FeedProvider } from './context/FeedContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <FeedProvider>
        <App />
      </FeedProvider>
    </ThemeProvider>
  </StrictMode>,
)
