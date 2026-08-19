import { Fragment, useMemo, useState } from 'react'
import enemiesRaw from '../data/enemies.json'
import { Enemy, asset, fmtNum } from '../lib'

const enemies = enemiesRaw as Enemy[]

// mesmo slug usado ao baixar os sprites em public/img/enemies
const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function Sprite({ name }: { name: string }) {
  const [err, setErr] = useState(false)
  if (err) return null
  return (
    <img
      className="enemy-sprite"
      src={asset(`img/enemies/${slug(name)}.png`)}
      alt=""
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}

export default function EnemiesPage() {
  const [q, setQ] = useState('')
  const [type, setType] = useState('Todos')
  const [open, setOpen] = useState<string | null>(null)

  const rows = useMemo(() => {
    const query = q.toLowerCase()
    return enemies.filter(
      e =>
        (type === 'Todos' || e.type === type) &&
        (e.name.toLowerCase().includes(query) ||
          (e.location ?? '').toLowerCase().includes(query))
    )
  }, [q, type])

  return (
    <div className="window">
      <div className="filters">
        {['Todos', 'Normal', 'Boss'].map(t => (
          <button key={t} className={`chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
        <input placeholder="Buscar nome ou local..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th className="num">LV</th>
              <th className="num">HP</th>
              <th className="num">MP</th>
              <th>Fraquezas</th>
              <th>Skills</th>
              <th>Local</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e, k) => {
              const key = `${e.name}-${k}`
              return (
                <Fragment key={key}>
                  <tr className="row-btn" onClick={() => setOpen(open === key ? null : key)}>
                    <td className="hl">
                      <Sprite name={e.name} />
                      {e.name}
                      {e.type === 'Boss' && <span className="badge">BOSS</span>}
                    </td>
                    <td className="num" data-label="LV">{fmtNum(e.level)}</td>
                    <td className="num" data-label="HP">{fmtNum(e.hp)}</td>
                    <td className="num" data-label="MP">{fmtNum(e.mp)}</td>
                    <td data-label="Fraquezas">{e.weaknesses.join(', ') || '—'}</td>
                    <td className="dim" data-label="Skills">{e.attacks.join(', ') || '—'}</td>
                    <td className="dim" data-label="Local">{e.location ?? '—'}</td>
                  </tr>
                  {open === key && (
                    <tr className="detail">
                      <td colSpan={7}>
                        EXP {fmtNum(e.exp)} · AP {fmtNum(e.ap)} · Gil {fmtNum(e.gil)}
                        {e.absorbs.length > 0 && <> · Absorve: {e.absorbs.join(', ')}</>}
                        {e.resistances.length > 0 && <> · Resiste: {e.resistances.join(', ')}</>}
                        {e.steal.length > 0 && <> · Roubo: {e.steal.join(', ')}</>}
                        {e.drops.length > 0 && <> · Drop: {e.drops.join(', ')}</>}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="count">{rows.length} inimigos</div>
    </div>
  )
}
