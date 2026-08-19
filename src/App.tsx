import { useState } from 'react'
import { asset } from './lib'
import ItemsPage from './pages/ItemsPage'
import MateriaPage from './pages/MateriaPage'
import CharactersPage from './pages/CharactersPage'
import EnemiesPage from './pages/EnemiesPage'

const TABS = [
  { id: 'items', label: 'Itens' },
  { id: 'materia', label: 'Materias' },
  { id: 'characters', label: 'Personagens' },
  { id: 'enemies', label: 'Inimigos' },
]

export default function App() {
  const [tab, setTab] = useState('items')
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
      {tab === 'items' && <ItemsPage />}
      {tab === 'materia' && <MateriaPage />}
      {tab === 'characters' && <CharactersPage />}
      {tab === 'enemies' && <EnemiesPage />}
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
