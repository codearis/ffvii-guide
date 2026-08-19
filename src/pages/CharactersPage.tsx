import { useState } from 'react'
import charactersRaw from '../data/characters.json'
import weaponsRaw from '../data/weapons.json'
import { Character, Weapon, asset, fmtNum } from '../lib'
import Slots from '../Slots'
import Icon from '../Icon'

const characters = charactersRaw as Character[]
const weapons = weaponsRaw as Weapon[]

function Portrait({ id, name }: { id: string; name: string }) {
  const [err, setErr] = useState(false)
  return err ? (
    <div className="portrait portrait-fallback">{name[0]}</div>
  ) : (
    <img
      className="portrait"
      src={asset(`img/characters/${id}.png`)}
      alt={name}
      onError={() => setErr(true)}
    />
  )
}

export default function CharactersPage() {
  const [selId, setSelId] = useState(characters[0]?.id ?? null)
  const sel = characters.find(c => c.id === selId)
  const charWeapons = sel ? weapons.filter(w => w.character === sel.shortName) : []

  return (
    <>
      <div className="char-grid">
        {characters.map(c => (
          <button
            key={c.id}
            className={`window char-card ${selId === c.id ? 'active' : ''}`}
            onClick={() => setSelId(c.id)}
          >
            <Portrait id={c.id} name={c.name} />
            <span>{c.shortName}</span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="window">
          <h2>{sel.name}</h2>
          <p className="subtitle">{sel.role}</p>
          <p className="dim">{sel.description}</p>

          <h3>Limit Breaks</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="num">Nível</th>
                  <th>Nome</th>
                  <th>Efeito</th>
                  <th>Como aprender</th>
                </tr>
              </thead>
              <tbody>
                {sel.limits.map(l => (
                  <tr key={l.name}>
                    <td className="num" data-label="Nível">{l.level}</td>
                    <td className="hl">{l.name}</td>
                    <td className="dim">{l.description}</td>
                    <td className="dim" data-label="Como aprender">{l.obtain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Armas</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="num">ATK</th>
                  <th className="num">Acerto%</th>
                  <th>Slots</th>
                  <th>Growth</th>
                  <th className="num">Gil</th>
                  <th>Como obter</th>
                </tr>
              </thead>
              <tbody>
                {charWeapons.map(w => (
                  <tr key={w.name}>
                    <td className="hl">
                      <Icon section="Arma" character={w.character} />
                      {w.name}
                    </td>
                    <td className="num" data-label="ATK">{w.attack}</td>
                    <td className="num" data-label="Acerto%">{fmtNum(w.attackPct)}</td>
                    <td data-label="Slots">
                      <Slots str={w.slots} />
                    </td>
                    <td data-label="Growth">{w.growth}</td>
                    <td className="num" data-label="Gil">{fmtNum(w.gil)}</td>
                    <td className="dim" data-label="Obter">{w.obtain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
