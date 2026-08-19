import { useState } from 'react'
import { asset } from './lib'
import SearchPage from './pages/SearchPage'
import ItemsPage from './pages/ItemsPage'
import MateriaPage from './pages/MateriaPage'
import CharactersPage from './pages/CharactersPage'
import EnemiesPage from './pages/EnemiesPage'
import StatsPage from './pages/StatsPage'

const TABS = [
  { id: 'search', label: 'Buscar' },
  { id: 'items', label: 'Itens' },
  { id: 'materia', label: 'Materias' },
  { id: 'characters', label: 'Personagens' },
  { id: 'enemies', label: 'Inimigos' },
  { id: 'stats', label: 'Stats' },
]

export default function App() {
  const [tab, setTab] = useState('search')
  const [logoOk, setLogoOk] = useState(true)
  return (
    <div className="app">
      <header className="window title-window">
        {logoOk && (
          <img className="logo" src={asset('img/logo.png')} alt="" onError={() => setLogoOk(false)} />
        )}
        <div>
          <h1>FINAL FANTASY VII</h1>
          <span className="subtitle">Guia Completo — PSX</span>
        </div>
      </header>
      <nav className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {tab === t.id && <Cursor />}
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'search' && <SearchPage />}
      {tab === 'items' && <ItemsPage />}
      {tab === 'materia' && <MateriaPage />}
      {tab === 'characters' && <CharactersPage />}
      {tab === 'enemies' && <EnemiesPage />}
      {tab === 'stats' && <StatsPage />}
    </div>
  )
}

function Cursor() {
  const [ok, setOk] = useState(true)
  // cursor de mão clássico do menu; cai para uma seta se o asset não baixou
  return ok ? (
    <img className="cursor-img" src={asset('img/cursor.png')} alt="" onError={() => setOk(false)} />
  ) : (
    <span className="cursor-img">▶</span>
  )
}
