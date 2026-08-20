import { useMemo, useState } from 'react'
import itemsRaw from '../data/items.json'
import weaponsRaw from '../data/weapons.json'
import { Item, Weapon, fmtNum, splitSlots } from '../lib'
import Slots from '../Slots'
import Icon from '../Icon'
import { searchAliases, useName, useText } from '../version'

const items = itemsRaw as Item[]
const weapons = weaponsRaw as Weapon[]

type Row = Item & { slots?: string | null; character?: string }

const all: Row[] = [
  ...items.map(i => {
    const { slots, rest } = splitSlots(i.description)
    return { ...i, slots, description: rest }
  }),
  ...weapons.map(w => ({
    name: w.name,
    section: 'Armas',
    gil: w.gil,
    slots: w.slots,
    character: w.character,
    description: `${w.character} · ATK ${w.attack} · Growth ${w.growth}`,
  })),
]

const SECTIONS = ['Todas', 'Itens', 'Armas', 'Armaduras', 'Acessórios', 'Itens-Chave']

export default function ItemsPage() {
  const name = useName()
  const text = useText()
  const [q, setQ] = useState('')
  const [sec, setSec] = useState('Todas')
  const rows = useMemo(() => {
    const query = q.toLowerCase()
    return all.filter(
      i =>
        (sec === 'Todas' || i.section === sec) &&
        (searchAliases(i.name).toLowerCase().includes(query) || i.description.toLowerCase().includes(query))
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
                <td className="hl">
                  <Icon section={i.section} character={i.character} />
                  {name(i.name)}
                  {name(i.name) !== i.name && <span className="dim sub"> ({i.name})</span>}
                </td>
                <td data-label="Seção">{i.section}</td>
                <td className="num" data-label="Gil">{fmtNum(i.gil)}</td>
                <td className="dim">
                  {i.slots != null && (
                    <>
                      <Slots str={i.slots} />{' '}
                    </>
                  )}
                  {text(i.description)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="count">{rows.length} registros</div>
    </div>
  )
}
