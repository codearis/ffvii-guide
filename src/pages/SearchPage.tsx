import { useMemo, useState } from 'react'
import itemsRaw from '../data/items.json'
import weaponsRaw from '../data/weapons.json'
import materiaRaw from '../data/materia.json'
import charactersRaw from '../data/characters.json'
import enemiesRaw from '../data/enemies.json'
import { Character, Enemy, Item, Materia, Weapon, fmtNum, splitSlots } from '../lib'
import Slots from '../Slots'
import Icon from '../Icon'

interface Hit {
  cat: string
  name: string
  detail: string
  gil: number | null
  slots?: string | null
  character?: string
}

const items = itemsRaw as Item[]
const weapons = weaponsRaw as Weapon[]
const materia = materiaRaw as Materia[]
const characters = charactersRaw as Character[]
const enemies = enemiesRaw as Enemy[]

// índice reverso: nome do item (minúsculo) -> inimigos que dropam / deixam roubar
const dropIndex = new Map<string, string[]>()
const stealIndex = new Map<string, string[]>()
enemies.forEach(e => {
  e.drops.forEach(d => {
    const k = d.toLowerCase()
    dropIndex.set(k, [...(dropIndex.get(k) ?? []), e.name])
  })
  e.steal.forEach(s => {
    const k = s.toLowerCase()
    stealIndex.set(k, [...(stealIndex.get(k) ?? []), e.name])
  })
})

const listNames = (names: string[]) =>
  names.length > 8 ? `${names.slice(0, 8).join(', ')} +${names.length - 8} outros` : names.join(', ')

const dropInfo = (name: string) => {
  const d = dropIndex.get(name.toLowerCase()) ?? []
  const s = stealIndex.get(name.toLowerCase()) ?? []
  if (!d.length && !s.length) return ' · Não dropável'
  return (
    (d.length ? ` · Drop de: ${listNames(d)}` : '') +
    (s.length ? ` · Roubo de: ${listNames(s)}` : '')
  )
}

const hits: Hit[] = [
  ...items.map(i => {
    const { slots, rest } = splitSlots(i.description)
    return {
      cat: i.section,
      name: i.name,
      detail: rest + dropInfo(i.name),
      gil: i.gil,
      slots,
    }
  }),
  ...weapons.map(w => ({
    cat: 'Arma',
    name: w.name,
    detail:
      `${w.character} · ATK ${w.attack} · Growth ${w.growth} — ${w.obtain}` + dropInfo(w.name),
    gil: w.gil,
    slots: w.slots,
    character: w.character,
  })),
  ...materia.map(m => ({
    cat: `Materia ${m.type}`,
    name: m.name,
    detail:
      `${m.description}${m.abilities.length ? ' — ' + m.abilities.join(', ') : ''} — ${m.location}` +
      dropInfo(m.name),
    gil: m.gil,
  })),
  ...characters.flatMap(c => [
    { cat: 'Personagem', name: c.name, detail: c.role, gil: null },
    ...c.limits.map(l => ({
      cat: 'Limit',
      name: l.name,
      detail: `${c.shortName} · Nível ${l.level} · ${l.description} — ${l.obtain}`,
      gil: null,
    })),
  ]),
  ...enemies.map(e => ({
    cat: e.type === 'Boss' ? 'Boss' : 'Inimigo',
    name: e.name,
    detail:
      `LV ${fmtNum(e.level)} · HP ${fmtNum(e.hp)} · Fraquezas: ${e.weaknesses.join(', ') || '—'}` +
      (e.location ? ` · ${e.location}` : '') +
      (e.drops.length ? ` · Drop: ${e.drops.join(', ')}` : '') +
      (e.steal.length ? ` · Roubo: ${e.steal.join(', ')}` : ''),
    gil: e.gil,
  })),
]

export default function SearchPage() {
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return []
    return hits.filter(
      h =>
        h.name.toLowerCase().includes(query) ||
        h.detail.toLowerCase().includes(query) ||
        h.cat.toLowerCase().includes(query)
    )
  }, [q])

  return (
    <div className="window">
      <div className="filters">
        <input
          className="search-input"
          autoFocus
          placeholder="Buscar item, materia, arma, personagem, inimigo, drop..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      {q.trim() ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th className="num">Gil</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h, k) => (
                  <tr key={k}>
                    <td className="hl">
                      <Icon section={h.cat} character={h.character} />
                      {h.name}
                    </td>
                    <td data-label="Categoria">{h.cat}</td>
                    <td className="num" data-label="Gil">{fmtNum(h.gil)}</td>
                    <td className="dim">
                      {h.slots != null && (
                        <>
                          <Slots str={h.slots} />{' '}
                        </>
                      )}
                      {h.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="count">{rows.length} resultados</div>
        </>
      ) : (
        <p className="dim">
          Digite para buscar em {hits.length} registros — itens, armas, armaduras, acessórios,
          materias, personagens, limits, inimigos e drops. Itens mostram de quais inimigos dropam
          (ou "Não dropável"); buscar "Drop de:" lista tudo que é dropável.
        </p>
      )}
    </div>
  )
}
