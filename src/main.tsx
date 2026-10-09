import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import 'leaflet/dist/leaflet.css' // Removed - causing issues

// Clear any saved dark mode preference to force light mode permanently
localStorage.removeItem('theme');

createRoot(document.getElementById('root')!).render(
  <App />
)
