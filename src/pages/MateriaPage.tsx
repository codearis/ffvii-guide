import { useMemo, useState } from 'react'
import materiaRaw from '../data/materia.json'
import { Materia, fmtNum } from '../lib'

const materia = materiaRaw as Materia[]

const TYPES: Record<string, { label: string; color: string }> = {
  Magic: { label: 'Magia', color: '#3ad43a' },
  Command: { label: 'Comando', color: '#e8d84a' },
  Support: { label: 'Suporte', color: '#4ab0e8' },
  Independent: { label: 'Independente', color: '#c05ae0' },
  Summon: { label: 'Invocação', color: '#e0483f' },
}

function Orb({ type }: { type: string }) {
  const color = TYPES[type]?.color ?? '#aaa'
  return <span className="orb" style={{ ['--c' as string]: color }} />
}

export default function MateriaPage() {
  const [q, setQ] = useState('')
  const [type, setType] = useState('Todas')
  const rows = useMemo(() => {
    const query = q.toLowerCase()
    return materia.filter(
      m =>
        (type === 'Todas' || m.type === type) &&
        (m.name.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.abilities.some(a => a.toLowerCase().includes(query)))
    )
  }, [q, type])

  return (
    <div className="window">
      <div className="filters">
        <button className={`chip ${type === 'Todas' ? 'active' : ''}`} onClick={() => setType('Todas')}>
          Todas
        </button>
        {Object.entries(TYPES).map(([t, info]) => (
          <button key={t} className={`chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
            <Orb type={t} />
            {info.label}
          </button>
        ))}
        <input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Materia</th>
              <th>Tipo</th>
              <th>AP por nível</th>
              <th>Habilidades</th>
              <th className="num">Gil</th>
              <th>Onde obter</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.name}>
                <td className="hl">
                  <Orb type={m.type} />
                  {m.name}
                  <div className="dim sub">{m.description}</div>
                </td>
                <td>{TYPES[m.type]?.label ?? m.type}</td>
                <td className="dim">
                  {m.ap.length ? m.ap.map(n => n.toLocaleString('pt-BR')).join(' / ') : '—'}
                </td>
                <td className="dim">{m.abilities.join(', ') || '—'}</td>
                <td className="num">{fmtNum(m.gil)}</td>
                <td className="dim">{m.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="count">{rows.length} materias</div>
    </div>
  )
}
