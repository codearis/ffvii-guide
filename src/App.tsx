import { useEffect, useRef, useState } from 'react'
import { asset } from './lib'
import SearchPage from './pages/SearchPage'
import ItemsPage from './pages/ItemsPage'
import MateriaPage from './pages/MateriaPage'
import CharactersPage from './pages/CharactersPage'
import EnemiesPage from './pages/EnemiesPage'
import StatsPage from './pages/StatsPage'
import SimulatorPage from './pages/SimulatorPage'
import WalkthroughPage from './pages/WalkthroughPage'

const TABS = [
  { id: 'search', label: 'Buscar' },
  { id: 'items', label: 'Itens' },
  { id: 'materia', label: 'Materias' },
  { id: 'characters', label: 'Personagens' },
  { id: 'enemies', label: 'Inimigos' },
  { id: 'stats', label: 'Stats' },
  { id: 'sim', label: 'Simulador' },
  { id: 'walkthrough', label: 'Detonado' },
]

export default function App() {
  const [tab, setTab] = useState('search')
  const [logoOk, setLogoOk] = useState(true)
  const beep = useCursorSfx()
  return (
    <div className="app">
      <MusicButton />
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
            onClick={() => {
              beep()
              setTab(t.id)
            }}
          >
            <Cursor visible={tab === t.id} />
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
      {tab === 'sim' && <SimulatorPage />}
      {tab === 'walkthrough' && <WalkthroughPage />}
    </div>
  )
}

// som de cursor do menu; sem o arquivo, sintetiza um beep equivalente na Web Audio
function useCursorSfx() {
  const ref = useRef<HTMLAudioElement | null>(null)
  return () => {
    if (!ref.current) ref.current = new Audio(asset('audio/cursor.m4a'))
    const el = ref.current
    el.volume = 0.1
    el.currentTime = 0
    el.play().catch(() => {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 1200
      gain.gain.setValueAtTime(0.02, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    })
  }
}

function MusicButton() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [on, setOn] = useState(true)
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = 0.04
    if (!on) {
      el.pause()
      return
    }
    // autoplay com som é bloqueado até a primeira interação; tenta de novo no primeiro toque
    el.play().catch(() => {})
    const tryPlay = () => {
      el.play().catch(() => {})
    }
    document.addEventListener('pointerdown', tryPlay, { once: true })
    return () => document.removeEventListener('pointerdown', tryPlay)
  }, [on])
  return (
    <>
      <audio ref={audioRef} src={asset('audio/prelude.m4a')} loop preload="auto" />
      <button
        className={`window music-btn ${on ? '' : 'off'}`}
        onClick={() => setOn(!on)}
        title="Música de fundo (Prelude)"
      >
        {on ? '♪ ON' : '♪ OFF'}
      </button>
    </>
  )
}

// cursor de mão clássico do menu; ocupa espaço mesmo oculto, para o texto da aba não deslocar
function Cursor({ visible }: { visible: boolean }) {
  const [ok, setOk] = useState(true)
  const cls = `cursor-img ${visible ? '' : 'hidden'}`
  return ok ? (
    <img className={cls} src={asset('img/cursor.png')} alt="" onError={() => setOk(false)} />
  ) : (
    <span className={cls}>▶</span>
  )
}
