import { useEffect, useRef, useState } from 'react'
import { asset, slugify } from './lib'
import enemiesRaw from './data/enemies.json'
import walkthroughRaw from './data/walkthrough.json'
import charactersRaw from './data/characters.json'
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
      <div className="header-row">
        <header className="window title-window">
          {logoOk && (
            <img className="logo" src={asset('img/logo.png')} alt="" onError={() => setLogoOk(false)} />
          )}
          <div>
            <h1>FINAL FANTASY VII</h1>
            <span className="subtitle">Guia Completo — PSX / PC</span>
          </div>
        </header>
        <div className="window side-box">
          <MusicButton />
          <OfflineButton />
        </div>
      </div>
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
        className={`side-btn ${on ? '' : 'off'}`}
        onClick={() => setOn(!on)}
        title="Música de fundo (Prelude)"
      >
        {on ? '♪ ON' : '♪ OFF'}
      </button>
    </>
  )
}

// baixa todas as imagens/áudios para o cache do service worker, deixando o guia 100% offline
function OfflineButton() {
  const [pct, setPct] = useState<number | null>(null)
  const urls = () => {
    const chars = (charactersRaw as { id: string }[]).map(c => `img/characters/${c.id}.png`)
    const icons = [
      'armor',
      'accessory',
      'item',
      ...(charactersRaw as { shortName: string }[]).map(c => `weapon-${slugify(c.shortName)}`),
    ].map(n => `img/icons/${n}.png`)
    return [
      ...(enemiesRaw as { name: string }[]).map(e => `img/enemies/${slugify(e.name)}.png`),
      ...(walkthroughRaw as { id: string }[]).map(c => `img/walkthrough/${c.id}.png`),
      ...chars,
      ...icons,
      'img/logo.png',
      'img/cursor.png',
      'audio/prelude.m4a',
      'audio/cursor.m4a',
      'icon-192.png',
      'icon-512.png',
    ].map(asset)
  }
  const download = async () => {
    const list = urls()
    let done = 0
    setPct(0)
    for (let i = 0; i < list.length; i += 8) {
      await Promise.all(
        list.slice(i, i + 8).map(u =>
          fetch(u).catch(() => {}).finally(() => {
            done++
          })
        )
      )
      setPct(Math.round((done * 100) / list.length))
    }
    setPct(100)
  }
  return (
    <button className="side-btn" onClick={download} title="Baixar tudo para uso offline">
      {pct == null ? '⬇ Offline' : pct === 100 ? '✓ Offline' : `⬇ ${pct}%`}
    </button>
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
