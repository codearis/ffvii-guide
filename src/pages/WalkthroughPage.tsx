import { useState } from 'react'
import walkthroughRaw from '../data/walkthrough.json'
import { asset } from '../lib'

interface Chapter {
  id: string
  title: string
  location: string
  disc: number
  steps: string[]
  items: string[]
  boss: string | null
}

const chapters = walkthroughRaw as Chapter[]

function Photo({ id, title }: { id: string; title: string }) {
  const [err, setErr] = useState(false)
  if (err) return null
  return (
    <img
      className="wt-img"
      src={asset(`img/walkthrough/${id}.png`)}
      alt={title}
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}

export default function WalkthroughPage() {
  if (!chapters.length)
    return (
      <div className="window">
        <p className="dim">Detonado ainda não carregado.</p>
      </div>
    )
  return (
    <>
      <div className="window">
        <h3>Detonado — índice</h3>
        <div className="wt-index">
          {chapters.map((c, k) => (
            <a key={c.id} className="chip" href={`#${c.id}`}>
              {k + 1}. {c.title}
            </a>
          ))}
        </div>
      </div>
      {chapters.map((c, k) => (
        <div key={c.id} id={c.id} className="window wt-chapter">
          <div className="wt-head">
            <div>
              <h2>
                {k + 1}. {c.title}
              </h2>
              <p className="subtitle">
                {c.location} · Disco {c.disc}
              </p>
            </div>
            <Photo id={c.id} title={c.title} />
          </div>
          <ol className="wt-steps">
            {c.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {c.items.length > 0 && (
            <p className="dim">
              <strong className="wt-label">Itens:</strong> {c.items.join(' · ')}
            </p>
          )}
          {c.boss && (
            <p>
              <strong className="wt-label">Boss:</strong> {c.boss}
            </p>
          )}
        </div>
      ))}
    </>
  )
}
