import { useMemo, useState } from 'react'
import itemsRaw from '../data/items.json'
import weaponsRaw from '../data/weapons.json'
import { Item, Weapon, fmtNum } from '../lib'

const items = itemsRaw as Item[]
const weapons = weaponsRaw as Weapon[]

const all: Item[] = [
  ...items,
  ...weapons.map(w => ({
    name: w.name,
    section: 'Armas',
    gil: w.gil,
    description: `${w.character} · ATK ${w.attack} · Slots ${w.slots} · Growth ${w.growth}`,
  })),
]

const SECTIONS = ['Todas', 'Itens', 'Armas', 'Armaduras', 'Acessórios', 'Itens-Chave']

export default function ItemsPage() {
  const [q, setQ] = useState('')
  const [sec, setSec] = useState('Todas')
  const rows = useMemo(() => {
    const query = q.toLowerCase()
    return all.filter(
      i =>
        (sec === 'Todas' || i.section === sec) &&
        (i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query))
    )
  }, [q, sec])

  return (
    <div className="window">
      <div className="filters">
        {SECTIONS.map(s => (
          <button key={s} className={`chip ${sec === s ? 'active' : ''}`} onClick={() => setSec(s)}>
            {s}
          </button>
        ))}
        <input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Seção</th>
              <th className="num">Gil</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i, k) => (
              <tr key={`${i.section}-${i.name}-${k}`}>
                <td className="hl">{i.name}</td>
                <td>{i.section}</td>
                <td className="num">{fmtNum(i.gil)}</td>
                <td className="dim">{i.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="count">{rows.length} registros</div>
    </div>
  )
}
