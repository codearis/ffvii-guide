export interface Item {
  name: string
  section: string
  gil: number | null
  description: string
}

export interface Weapon {
  name: string
  character: string
  attack: number
  attackPct: number | null
  magic: number | null
  slots: string
  growth: string
  gil: number | null
  obtain: string
}

export interface Materia {
  name: string
  type: string
  description: string
  ap: number[]
  abilities: string[]
  gil: number | null
  location: string
}

export interface LimitBreak {
  level: number
  name: string
  description: string
  obtain: string
}

export interface Character {
  id: string
  name: string
  shortName: string
  role: string
  description: string
  limits: LimitBreak[]
}

export interface Enemy {
  name: string
  level: number | null
  hp: number | null
  mp: number | null
  type: string
  weaknesses: string[]
  resistances: string[]
  absorbs: string[]
  attacks: string[]
  location: string | null
  exp: number | null
  ap: number | null
  gil: number | null
  steal: string[]
  drops: string[]
}

export const fmtNum = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('pt-BR')

// prefixa o base do Vite (raiz no dev, /ffvii-guide/ no GitHub Pages)
export const asset = (p: string) => import.meta.env.BASE_URL + p

// extrai o padrão "Slots O=O O" de uma descrição (armaduras) para renderizar com ícones
export const splitSlots = (desc: string): { slots: string | null; rest: string } => {
  const m = desc.match(/(\s*·\s*)?Slots\s+(None|(?:O=O|O)(?:\s+(?:O=O|O))*)/)
  if (!m) return { slots: null, rest: desc }
  return { slots: m[2] === 'None' ? '' : m[2], rest: desc.replace(m[0], '') }
}
