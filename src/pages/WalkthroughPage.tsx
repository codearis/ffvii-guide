import { ReactNode, useState } from 'react'
import walkthroughRaw from '../data/walkthrough.json'
import enemiesRaw from '../data/enemies.json'
import itemsRaw from '../data/items.json'
import materiaRaw from '../data/materia.json'
import weaponsRaw from '../data/weapons.json'
import { Enemy, Item, MATERIA_TYPES, Materia, Weapon, asset, fmtNum, slugify, splitSlots } from '../lib'
import Slots from '../Slots'
import Icon from '../Icon'

interface Chapter {
  id: string
  title: string
  location: string
  disc: number
  photo?: string | null
  steps: string[]
  items: string[]
  boss: string | null
  missables?: string[]
}

const chapters = walkthroughRaw as Chapter[]
const enemies = enemiesRaw as Enemy[]
const items = itemsRaw as Item[]
const materia = materiaRaw as Materia[]
const weapons = weaponsRaw as Weapon[]

// registro de nomes clicáveis; prioridade: inimigo > materia > arma > item.
// nomes de 1-2 letras (ex. inimigo "MP") ficam de fora para não linkar "HP/MP" do texto.
type RefKind = 'enemy' | 'materia' | 'weapon' | 'item'
const registry = new Map<string, RefKind>()
const register = (names: string[], kind: RefKind) =>
  names.forEach(n => {
    if (n.length > 2 && !registry.has(n)) registry.set(n, kind)
  })
register(enemies.map(e => e.name), 'enemy')
register(materia.map(m => m.name), 'materia')
register(weapons.map(w => w.name), 'weapon')
register(items.map(i => i.name), 'item')

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const linkRe = new RegExp(
  `(?<![A-Za-z0-9])(?:${[...registry.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join('|')})(?![A-Za-z0-9])`,
  'g'
)

// o regex tem ~600 alternativas; o resultado é cacheado por texto para não repetir a cada render
const parseCache = new Map<string, { t: string; ref: boolean }[]>()

const parseRefs = (text: string) => {
  const hit = parseCache.get(text)
  if (hit) return hit
  const parts: { t: string; ref: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(linkRe)) {
    const i = m.index!
    if (i > last) parts.push({ t: text.slice(last, i), ref: false })
    parts.push({ t: m[0], ref: true })
    last = i + m[0].length
  }
  if (last < text.length) parts.push({ t: text.slice(last), ref: false })
  parseCache.set(text, parts)
  return parts
}

function Linkify({ text, onOpen }: { text: string; onOpen: (name: string) => void }) {
  const parts: ReactNode[] = parseRefs(text).map((p, i) =>
    p.ref ? (
      <button key={i} className="ref-link" onClick={() => onOpen(p.t)}>
        {p.t}
      </button>
    ) : (
      p.t
    )
  )
  return <>{parts}</>
}

function Line({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <p className="modal-line">
      <span className="wt-label">{label}:</span>{' '}
      {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
    </p>
  )
}

function DetailModal({ name, onClose }: { name: string; onClose: () => void }) {
  const kind = registry.get(name)
  let content = null
  if (kind === 'enemy') {
    const e = enemies.find(x => x.name === name)!
    content = (
      <>
        <img
          className="enemy-sprite-lg"
          src={asset(`img/enemies/${slugify(e.name)}.png`)}
          alt=""
          onError={ev => (ev.currentTarget.style.display = 'none')}
        />
        <h2>
          {e.name} {e.type === 'Boss' && <span className="badge">BOSS</span>}
        </h2>
        <Line label="LV / HP / MP" value={`${fmtNum(e.level)} / ${fmtNum(e.hp)} / ${fmtNum(e.mp)}`} />
        <Line label="Fraquezas" value={e.weaknesses.join(', ')} />
        <Line label="Resiste" value={e.resistances.join(', ')} />
        <Line label="Absorve" value={e.absorbs.join(', ')} />
        <Line label="Skills" value={e.attacks.join(', ')} />
        <Line label="Local" value={e.location} />
        <Line label="EXP / AP / Gil" value={`${fmtNum(e.exp)} / ${fmtNum(e.ap)} / ${fmtNum(e.gil)}`} />
        <Line label="Roubo" value={e.steal.join(', ')} />
        <Line label="Drop" value={e.drops.join(', ')} />
      </>
    )
  } else if (kind === 'materia') {
    const m = materia.find(x => x.name === name)!
    content = (
      <>
        <h2>
          <span className="orb" style={{ ['--c' as string]: MATERIA_TYPES[m.type]?.color ?? '#aaa' }} />
          {m.name}
        </h2>
        <Line label="Tipo" value={MATERIA_TYPES[m.type]?.label ?? m.type} />
        <p className="dim">{m.description}</p>
        <Line label="Habilidades" value={m.abilities.join(', ')} />
        <Line label="AP por nível" value={m.ap.map(n => n.toLocaleString('pt-BR')).join(' / ')} />
        <Line label="Gil" value={m.gil} />
        <Line label="Onde obter" value={m.location} />
      </>
    )
  } else if (kind === 'weapon') {
    const w = weapons.find(x => x.name === name)!
    content = (
      <>
        <h2>
          <Icon section="Arma" character={w.character} />
          {w.name}
        </h2>
        <Line label="Personagem" value={w.character} />
        <Line label="ATK / Acerto%" value={`${w.attack} / ${fmtNum(w.attackPct)}`} />
        <p className="modal-line">
          <span className="wt-label">Slots:</span> <Slots str={w.slots} />
        </p>
        <Line label="Growth" value={w.growth} />
        <Line label="Gil" value={w.gil} />
        <Line label="Como obter" value={w.obtain} />
      </>
    )
  } else {
    const i = items.find(x => x.name === name)!
    const { slots, rest } = splitSlots(i.description)
    content = (
      <>
        <h2>
          <Icon section={i.section} />
          {i.name}
        </h2>
        <Line label="Seção" value={i.section} />
        <Line label="Gil" value={i.gil} />
        {slots != null && (
          <p className="modal-line">
            <span className="wt-label">Slots:</span> <Slots str={slots} />
          </p>
        )}
        <p className="dim">{rest}</p>
      </>
    )
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="window modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {content}
      </div>
    </div>
  )
}

function Photo({ id, title }: { id: string; title: string }) {
  const [err, setErr] = useState(false)
  if (err) return null
  return (
    <img
      className="wt-img"
      src={asset(`img/walkthrough/${id}.png`)}
      alt={title}
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}

export default function WalkthroughPage() {
  const [ref, setRef] = useState<string | null>(null)
  const [disc, setDisc] = useState(0) // 0 = todos
  if (!chapters.length)
    return (
      <div className="window">
        <p className="dim">Detonado ainda não carregado.</p>
      </div>
    )
  const shown = disc ? chapters.filter(c => c.disc === disc) : chapters
  return (
    <>
      <div className="window">
        <div className="filters">
          {[0, 1, 2, 3].map(d => (
            <button
              key={d}
              className={`chip ${disc === d ? 'active' : ''}`}
              onClick={() => setDisc(d)}
            >
              {d === 0 ? 'Tudo' : `Disco ${d}`}
            </button>
          ))}
        </div>
        <div className="wt-index">
          {shown.map((c, k) => (
            <a key={c.id} className="chip" href={`#${c.id}`}>
              {k + 1}. {c.title}
            </a>
          ))}
        </div>
      </div>
      {shown.map((c, k) => (
        <div key={c.id} id={c.id} className="window wt-chapter">
          <div className="wt-head">
            <div>
              <h2>
                {k + 1}. {c.title}
              </h2>
              <p className="subtitle">
                {c.location} · Disco {c.disc}
              </p>
            </div>
            <Photo id={c.photo ?? c.id} title={c.title} />
          </div>
          <ol className="wt-steps">
            {c.steps.map((s, i) => (
              <li key={i}>
                <Linkify text={s} onOpen={setRef} />
              </li>
            ))}
          </ol>
          {c.items.length > 0 && (
            <p className="dim">
              <strong className="wt-label">Itens:</strong>{' '}
              {c.items.map((it, i) => (
                <span key={i}>
                  {i > 0 && ' · '}
                  <Linkify text={it} onOpen={setRef} />
                </span>
              ))}
            </p>
          )}
          {c.boss && (
            <p>
              <strong className="wt-label">Boss:</strong> <Linkify text={c.boss} onOpen={setRef} />
            </p>
          )}
          {c.missables && c.missables.length > 0 && (
            <div className="missables">
              <strong className="wt-label">Não perca:</strong>
              <ul className="fx-list">
                {c.missables.map((m, i) => (
                  <li key={i} className="dim">
                    <Linkify text={m} onOpen={setRef} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      {ref && <DetailModal name={ref} onClose={() => setRef(null)} />}
    </>
  )
}
