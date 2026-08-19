import { useMemo, useState } from 'react'
import materiaRaw from '../data/materia.json'
import { MATERIA_TYPES as TYPES, Materia, fmtNum } from '../lib'

const materia = materiaRaw as Materia[]

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
                <td data-label="Tipo">{TYPES[m.type]?.label ?? m.type}</td>
                <td className="dim" data-label="AP">
                  {m.ap.length ? m.ap.map(n => n.toLocaleString('pt-BR')).join(' / ') : '—'}
                </td>
                <td className="dim" data-label="Habilidades">{m.abilities.join(', ') || '—'}</td>
                <td className="num" data-label="Gil">{fmtNum(m.gil)}</td>
                <td className="dim" data-label="Onde obter">{m.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="count">{rows.length} materias</div>
    </div>
  )
}
