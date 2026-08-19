import { useMemo, useState } from 'react'
import materiaRaw from '../data/materia.json'
import itemsRaw from '../data/items.json'
import { Item, MATERIA_TYPES, Materia } from '../lib'
import {
  ACC_RESIST,
  Equip,
  PAIRS,
  Slot,
  byName,
  crossEffects,
  equipEffects,
  maxLevel,
  resistances,
} from '../simRules'

const materia = materiaRaw as Materia[]
const accessories = (itemsRaw as Item[]).filter(i => i.section === 'Acessórios')

function Orb({ type }: { type: string }) {
  return <span className="orb" style={{ ['--c' as string]: MATERIA_TYPES[type]?.color ?? '#aaa' }} />
}

function SlotCell({
  slot,
  active,
  onOpen,
  onLevel,
}: {
  slot: Slot | null
  active: boolean
  onOpen: () => void
  onLevel: (level: number) => void
}) {
  const m = slot ? byName(slot.name) : null
  const max = m ? maxLevel(m) : 1
  return (
    <span className={`sim-slot ${active ? 'picking' : ''}`}>
      <button
        className="hole"
        title={m ? m.name : 'slot vazio'}
        style={m ? { ['--c' as string]: MATERIA_TYPES[m.type]?.color ?? '#aaa' } : undefined}
        onClick={onOpen}
      />
      <span className="slot-name">{m ? m.name : '—'}</span>
      {m && max > 1 && slot && (
        <select className="slot-level" value={slot.level} onChange={e => onLevel(Number(e.target.value))}>
          {Array.from({ length: max }, (_, k) => k + 1).map(l => (
            <option key={l} value={l}>
              {l === max ? '★ Master' : `Lv ${l}`}
            </option>
          ))}
        </select>
      )}
    </span>
  )
}

export default function SimulatorPage() {
  const [weapon, setWeapon] = useState<(Slot | null)[]>(Array(8).fill(null))
  const [armor, setArmor] = useState<(Slot | null)[]>(Array(8).fill(null))
  const [acc, setAcc] = useState<string | null>(null)
  const [picking, setPicking] = useState<{ equip: Equip; i: number } | null>(null)
  const [q, setQ] = useState('')

  const setterOf = (equip: Equip) => (equip === 'weapon' ? setWeapon : setArmor)

  const place = (name: string | null) => {
    if (!picking) return
    const m = byName(name)
    // materia entra já no nível máximo, seguindo o padrão "máximo por default" do simulador
    const slot: Slot | null = name && m ? { name, level: maxLevel(m) } : null
    setterOf(picking.equip)(prev => prev.map((v, k) => (k === picking.i ? slot : v)))
    setPicking(null)
    setQ('')
  }

  const setLevel = (equip: Equip, i: number, level: number) =>
    setterOf(equip)(prev => prev.map((v, k) => (k === i && v ? { ...v, level } : v)))

  const options = useMemo(() => {
    const query = q.toLowerCase()
    return materia.filter(m => m.name.toLowerCase().includes(query))
  }, [q])

  const weaponFx = equipEffects(weapon, 'weapon')
  const armorFx = equipEffects(armor, 'armor')
  const globalFx = crossEffects(weapon, armor)
  const resist = resistances(armor, acc)
  const accItem = accessories.find(a => a.name === acc)

  const renderSlots = (equip: Equip, slots: (Slot | null)[]) => (
    <div className="sim-slots">
      {PAIRS.map(([a, b]) => (
        <span key={a} className="sim-pair">
          <SlotCell
            slot={slots[a]}
            active={picking?.equip === equip && picking.i === a}
            onOpen={() => setPicking({ equip, i: a })}
            onLevel={l => setLevel(equip, a, l)}
          />
          <span className="sim-link" />
          <SlotCell
            slot={slots[b]}
            active={picking?.equip === equip && picking.i === b}
            onOpen={() => setPicking({ equip, i: b })}
            onLevel={l => setLevel(equip, b, l)}
          />
        </span>
      ))}
    </div>
  )

  return (
    <>
      <div className="sim-grid">
        <div className="window">
          <h3>Arma (4 pares linkados)</h3>
          {renderSlots('weapon', weapon)}
        </div>
        <div className="window">
          <h3>Armadura (4 pares linkados)</h3>
          {renderSlots('armor', armor)}
        </div>
      </div>

      {picking && (
        <div className="window">
          <div className="filters">
            <span className="dim">
              Escolher materia — {picking.equip === 'weapon' ? 'arma' : 'armadura'}, slot{' '}
              {picking.i + 1}
            </span>
            <input
              className="search-input"
              autoFocus
              placeholder="Filtrar materias..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="picker">
            <button onClick={() => place(null)}>— Esvaziar slot —</button>
            {options.map(m => (
              <button key={m.name} onClick={() => place(m.name)}>
                <Orb type={m.type} />
                {m.name} <span className="dim">· {MATERIA_TYPES[m.type]?.label ?? m.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="window">
        <h3>Acessório</h3>
        <select value={acc ?? ''} onChange={e => setAcc(e.target.value || null)}>
          <option value="">— nenhum —</option>
          {accessories.map(a => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
        {accItem && <p className="dim">{accItem.description}</p>}
      </div>

      <div className="window">
        <h3>Efeitos da combinação</h3>
        {weaponFx.length + armorFx.length + resist.length === 0 && !acc ? (
          <p className="dim">Clique nos slots para equipar materias e ver o que a combinação faz.</p>
        ) : (
          <>
            {weaponFx.length > 0 && (
              <>
                <h4>Arma</h4>
                <ul className="fx-list">
                  {weaponFx.map((l, k) => (
                    <li key={k}>{l}</li>
                  ))}
                </ul>
              </>
            )}
            {armorFx.length > 0 && (
              <>
                <h4>Armadura</h4>
                <ul className="fx-list">
                  {armorFx.map((l, k) => (
                    <li key={k}>{l}</li>
                  ))}
                </ul>
              </>
            )}
            {globalFx.length > 0 && (
              <>
                <h4>Geral</h4>
                <ul className="fx-list">
                  {globalFx.map((l, k) => (
                    <li key={k}>{l}</li>
                  ))}
                </ul>
              </>
            )}
            {(resist.length > 0 || acc) && (
              <>
                <h4>Resistências</h4>
                <ul className="fx-list">
                  {resist.map((l, k) => (
                    <li key={k}>{l}</li>
                  ))}
                  {acc && !ACC_RESIST[acc] && accItem && (
                    <li className="dim">
                      {acc}: {accItem.description}
                    </li>
                  )}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
