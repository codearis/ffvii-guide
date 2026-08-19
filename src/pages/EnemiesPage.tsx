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

// expoentes medidos na tabela do Mystery Ninja — o único inimigo que o próprio FF7 escala
// por nível (6 tiers, Lv 17→42). HP cresce ~lv^1.57, AP ~lv^1.95, e assim por diante.
const K: Record<string, number> = { hp: 1.57, mp: 1.14, exp: 1.73, ap: 1.95, gil: 1.7 }

const scale = (v: number | null, from: number | null, to: number, stat: string) =>
  v == null || !from ? v : Math.round(v * Math.pow(to / from, K[stat]))

function EnemyDetail({ e }: { e: Enemy }) {
  const base = e.level
  const [lv, setLv] = useState(base ?? 1)
  const hp = scale(e.hp, base, lv, 'hp')
  const mp = scale(e.mp, base, lv, 'mp')
  const exp = scale(e.exp, base, lv, 'exp')
  const ap = scale(e.ap, base, lv, 'ap')
  const gil = scale(e.gil, base, lv, 'gil')
  const changed = base != null && lv !== base
  return (
    <div className="detail-body">
      <div>
        {base != null && (
          <label className="lv-slider detail-lv">
            Level {lv}
            <input
              type="range"
              min={1}
              max={99}
              value={lv}
              onChange={ev => setLv(Number(ev.target.value))}
            />
            <span className="dim">
              {changed ? `base ${base} · curva do jogo (Mystery Ninja)` : 'level base'}
            </span>
          </label>
        )}
        <p className="modal-line">
          HP <strong>{fmtNum(hp)}</strong> · MP <strong>{fmtNum(mp)}</strong> · EXP {fmtNum(exp)} ·
          AP {fmtNum(ap)} · Gil {fmtNum(gil)}
        </p>
        <p className="modal-line dim">
          {e.absorbs.length > 0 && <>Absorve: {e.absorbs.join(', ')} · </>}
          {e.resistances.length > 0 && <>Resiste: {e.resistances.join(', ')} · </>}
          {e.steal.length > 0 && <>Roubo: {e.steal.join(', ')} · </>}
          {e.drops.length > 0 && <>Drop: {e.drops.join(', ')}</>}
        </p>
      </div>
    </div>
  )
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
        <table className="enemy-table">
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
                  <tr
                    className={`row-btn ${open === key ? 'open' : ''}`}
                    onClick={() => setOpen(open === key ? null : key)}
                  >
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
                        <EnemyDetail e={e} />
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
