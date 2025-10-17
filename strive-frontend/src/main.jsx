// main.jsx
// File to control main functionality

// Imports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './app/store.js';
import { Provider } from 'react-redux';
import './index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
})

// Root
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
