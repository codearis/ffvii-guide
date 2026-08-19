import { Fragment, useMemo, useState } from 'react'
import enemiesRaw from '../data/enemies.json'
import { Enemy, asset, fmtNum, slugify as slug } from '../lib'

const enemies = enemiesRaw as Enemy[]

// campos numéricos ordenam desc (maior primeiro); level asc; nulos sempre no fim
const SORTS: Record<string, { label: string; cmp: (a: Enemy, b: Enemy) => number }> = {
  level: { label: 'Level ↑', cmp: (a, b) => (a.level ?? Infinity) - (b.level ?? Infinity) },
  name: { label: 'Nome A–Z', cmp: (a, b) => a.name.localeCompare(b.name) },
  hp: { label: 'HP ↓', cmp: (a, b) => (b.hp ?? -1) - (a.hp ?? -1) },
  exp: { label: 'EXP ↓', cmp: (a, b) => (b.exp ?? -1) - (a.exp ?? -1) },
  ap: { label: 'AP ↓', cmp: (a, b) => (b.ap ?? -1) - (a.ap ?? -1) },
  gil: { label: 'Gil ↓', cmp: (a, b) => (b.gil ?? -1) - (a.gil ?? -1) },
}

function Sprite({ name, large = false }: { name: string; large?: boolean }) {
  const [err, setErr] = useState(false)
  if (err) return null
  return (
    <img
      className={large ? 'enemy-sprite-lg' : 'enemy-sprite'}
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
  const [sort, setSort] = useState('level')
  const [open, setOpen] = useState<string | null>(null)

  const rows = useMemo(() => {
    const query = q.toLowerCase()
    const cmp = SORTS[sort].cmp
    return enemies
      .filter(
        e =>
          (type === 'Todos' || e.type === type) &&
          (e.name.toLowerCase().includes(query) ||
            (e.location ?? '').toLowerCase().includes(query))
      )
      .sort((a, b) => cmp(a, b) || a.name.localeCompare(b.name))
  }, [q, type, sort])

  return (
    <div className="window">
      <div className="filters">
        {['Todos', 'Normal', 'Boss'].map(t => (
          <button key={t} className={`chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, s]) => (
            <option key={k} value={k}>
              Ordenar: {s.label}
            </option>
          ))}
        </select>
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
                        <Sprite name={e.name} large />
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
