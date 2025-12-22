import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// StrictMode removido temporariamente para evitar dupla execução de useEffect
// que causa 429 (rate limit) na API ao fazer requisições duplicadas
// TODO: Reativar quando a proteção contra chamadas duplicadas estiver completa
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

